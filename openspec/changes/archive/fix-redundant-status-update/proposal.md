# fix-redundant-status-update

## 问题陈述

`review.service.ts:49` 在 `createDaily()` 中已经设置 `status: ReviewStatus.ANALYZING`。但在 `analysis-runner.service.ts:140-143` 又执行一次：

```typescript
await prisma.dailyReview.update({
  where: { id: review.id },
  data: { status: "ANALYZING" },
});
```

这是冗余数据库写入，每次 AI 分析都多一次不必要的 UPDATE。虽然开销小，但反映流程设计上的冗余——状态应在创建时就已正确设置。

## 方案对比

| 方案 | 做法 | 优点 |
|------|------|------|
| A（推荐） | 删除 analysis-runner 中的冗余状态更新 | 零开销，简洁 |
| B | 保留不做 | 无改动但容忍性能浪费 |

## 设计决策

方案 A：直接删除 analysis-runner 中对 `DailyReview` 状态重复设置 `ANALYZING` 的代码。

## 影响范围

| 文件 | 改动 |
|------|------|
| `backend/src/services/analysis-runner.service.ts` | 删除第 140-143 行的 `prisma.dailyReview.update` |

## 验收

- analysis-runner 仍按预期运行
- DailyReview 的 status 始终由 `createDaily()` 在创建时设为 `ANALYZING`
