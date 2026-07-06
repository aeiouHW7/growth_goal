# fix-dailyreview-unique-constraint

## 问题陈述

`DailyReview` 表在 `createDaily()`（`review.service.ts:42-47`）中通过 `findFirst` 检查日期是否已有复盘记录。但 `(userId, date)` **没有数据库层唯一约束**，高并发下两条请求可同时越过应用层检查，创建两条相同日期的复盘记录，导致数据不一致。

## 方案对比

| 方案 | 做法 | 优点 | 缺点 |
|------|------|------|------|
| A（推荐） | Prisma schema 加 `@@unique([userId, date])` | 数据库层保证，零 runtime 开销 | 需跑 migration |
| B | 应用层加分布式锁 | 无需改 schema | 锁复杂度高，本场景杀鸡用牛刀 |
| C | `createMany` + 忽略冲突 | 无需事务 | SQLite 不支持 `skipDuplicates` |

## 设计决策

- **选择方案 A**：数据库唯一约束是最可靠的防重复手段
- `findFirst` 检查保留作为"快速失败"优化（在触库前先返回 409），不承担数据完整职责
- 同时更新 `createDaily()` 和 `updateDailyStatus()` 中可能因重复记录导致的查询歧义

## 影响范围

| 文件 | 改动 |
|------|------|
| `backend/prisma/schema.prisma` | DailyReview 模型加 `@@unique([userId, date])` |
| `backend/` | 生成 migration |
| `backend/src/services/review.service.ts` | createDaily 添加 try-catch 处理 Prisma 唯一约束异常，返回友好 409 |
