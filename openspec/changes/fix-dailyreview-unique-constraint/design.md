# fix-dailyreview-unique-constraint — 设计

## Prisma Schema 变更

```diff
model DailyReview {
  id           String       @id @default(uuid())
  userId       String
  date         DateTime
  rawInput     String
  // ... 其他字段 ...

+ @@unique([userId, date])
}
```

## 服务层调整

`review.service.ts` 的 `createDaily()`：

```typescript
async createDaily(userId: string, date: string, rawInput: string) {
  // 应用层预检（快速失败优化）
  const existing = await prisma.dailyReview.findFirst({
    where: { userId, date: validateDateString(date) },
  });
  if (existing) {
    throw Object.assign(new Error("该日期已有复盘记录"), { status: 409, code: "REVIEW_ALREADY_EXISTS" });
  }

  try {
    return await prisma.dailyReview.create({
      data: { userId, date: validateDateString(date), rawInput, status: ReviewStatus.ANALYZING },
    });
  } catch (err) {
    // 唯一约束违反（并发插入的情况）
    if ((err as any)?.code === 'P2002') {
      throw Object.assign(new Error("该日期已有复盘记录"), { status: 409, code: "REVIEW_ALREADY_EXISTS" });
    }
    throw err;
  }
}
```

## 回滚方案

```bash
# 回滚 migration
npx prisma migrate down --create-db 2>/dev/null || npx prisma db push --force-reset
```
