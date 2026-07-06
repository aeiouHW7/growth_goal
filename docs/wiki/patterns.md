# 技术模式与最佳实践

## 数据库模式

### 唯一约束 vs 应用层检查

不能依赖应用层预检来防止重复数据。数据库唯一约束是唯一的可靠防御：

```
应用层 findFirst 检查 → 快速失败优化（返回友好 409）
数据库层 @@unique    → 数据完整性保障（P2002 兜底）
```

两者并存：预检是 UX 优化，约束是安全网。

### Prisma Transaction 最佳实践

**读写竞态修复模式**：当读 + 改 + 写需要原子性时，使用 `prisma.$transaction`：

```typescript
// ✅ 正确：read + modify + write 在事务内
return prisma.$transaction(async (tx) => {
  const archive = await tx.lifeArchive.findUnique({ where: { userId } });
  const merged = merge(archive?.data, incoming);
  return tx.lifeArchive.upsert({ where: { userId }, create: { ...merged }, update: { ...merged } });
});
```

**事务范围原则**：事务只包裹需要原子性的核心写入。辅助/尽力而为的写入放在事务外：

```typescript
// ✅ 正确：主数据在事务内，辅助写入在事务外
const analysis = await prisma.$transaction(async (tx) => {
  return tx.aIAnalysis.create({ data: { ... } });
});
// 辅助写入——失败不影响主数据
Promise.allSettled([
  trackPatterns(userId, report),
  logBiases(userId, report),
]);
```

**`tx || prisma` 模式**：子服务接受可选 `tx` 参数保持向后兼容：

```typescript
import { type Prisma } from "@prisma/client";

async logFromAnalysis(userId: string, ..., tx?: Prisma.TransactionClient) {
  const db = tx || prisma;
  await db.capabilityScore.create({ data: { ... } });
}
```

### 查询优化

- 避免全表扫描：`findMany({ where: { userId } })` 无时间限制会加载全部历史数据
- 添加 `createdAt: { gte: since }` 和 `take` 约束查询范围
- 客户端循环内用 `Map` 预建 O(1) 查找，替代数组 `.filter()` / `.find()`
- Prisma update/create 返回值已包含完整字段，不需要再 `findUnique` 读一次

## 复盘分析引擎

### 用户画像动态加载

AI 分析的用户背景信息必须从数据库动态加载，不能硬编码：

```typescript
// 从 User 表 + LifeArchive.summary 构建
const userProfileText = buildProfile(user, archive);
```

### Claude CLI 调用安全

- `spawn('claude', ['-p', '-'])` 不加 `shell: true` —— 确保 `proc.kill()` 能正确终止子进程
- JSON 解析优先用标记 `__JSON_START__ / __JSON_END__`，fallback 到最外层大括号提取
- 失败后回滚复盘状态（ANALYZING → INPUTTING），避免记录永久卡死
