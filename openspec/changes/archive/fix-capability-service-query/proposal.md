# fix-capability-service-query

## 问题陈述

`capability.service.ts:42-53` 的 `getLatestScores()` 方法：

```typescript
const scores = await prisma.capabilityScore.findMany({
  where: { userId },
  orderBy: { createdAt: "desc" },
});
```

这加载了用户的**所有**能力评分记录到内存（无 `take`、无时间限制），然后在 JS 层遍历去重（dimension 维度取最新一条）。用户累计几百条能力评分后，每次调用都在浪费 I/O 和内存。

## 方案对比

| 方案 | 做法 | 优点 | 缺点 |
|------|------|------|------|
| A（推荐） | Prisma 原生 `groupBy` + 子查询取每个维度最新 | 数据库层完成，高效 | Prisma groupBy 在 SQLite 上支持有限 |
| B | 限制查询范围（如最近 90 天），JS 层 dedup | 简单，大幅减少数据量 | 超 90 天的评分可能丢失（但能力评分会不断更新） |
| C | 加 `take: 200` 限制扫描行数 | 防无限增长 | 不彻底 |

## 设计决策

选择方案 B：按最近 90 天筛选（查询范围限制）+ JS 层 dedup。因为：

- CapabilityScore 由 AI 分析持续写入，90 天外的评分对"最新"已无参考价值
- 改动最小，不依赖 Prisma groupBy 的 SQLite 支持程度
- 配合 `take: 100` 防止极端情况

## 影响范围

| 文件 | 改动 |
|------|------|
| `backend/src/services/capability.service.ts` | `getLatestScores` 添加时间范围 + `take` 约束 |

## 验收

- `getLatestScores()` 返回每个维度最新一条评分
- 查询量从全表扫描降为最近 90 天
