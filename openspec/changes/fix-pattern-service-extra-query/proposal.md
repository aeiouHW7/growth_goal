# fix-pattern-service-extra-query

## 问题陈述

`pattern.service.ts:95` 在 `trackIssuesFromAnalysis()` 中 create/update `BehaviorPattern` 后，立即执行一次 `prisma.behaviorPattern.findUnique()` 获取最新频率：

```typescript
const updated = await prisma.behaviorPattern.findUnique({ where: { id: matched.id } });
```

但实际上 `update` 和 `create` 的返回值已包含完整的 `frequency` 字段，二次查询是多余的。每篇复盘分析多一次 DB round-trip。

## 方案对比

| 方案 | 做法 | 优点 |
|------|------|------|
| A（推荐） | 直接使用 create/update 的返回值 | 消除额外查询 |
| B | 保留不做 | 容忍浪费 |

## 设计决策

方案 A：`create` 和 `update` 的 Prisma 返回值已包含 `frequency`，直接使用即可。

## 影响范围

| 文件 | 改动 |
|------|------|
| `backend/src/services/pattern.service.ts` | 删除多余 `findUnique`，使用已有返回值 |

## 验收

- `trackIssuesFromAnalysis` 返回的 `DetectedPattern[]` 中 `frequency` 值正确
- 每次分析不再有对 `behaviorPattern.findUnique` 的调用
