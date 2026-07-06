# fix-lifearchive-race-condition

## 问题陈述

`life-archive.service.ts` 中 `updateEnergy()`（第 67-94 行）、`updateHealth()`（第 97-124 行）、`updateBehavior()`（第 127-159 行）都采用 **read → modify → upsert** 模式：

1. `findUnique` 读当前 archive
2. JS 层修改 JSON 对象（追加字段、保留历史）
3. `upsert` 写回

这存在**读写竞态**：两个并发请求读到同一个旧版本 `layerResources`，后写入的会覆盖先写入的增量改动。

## 方案对比

| 方案 | 做法 | 优点 | 缺点 |
|------|------|------|------|
| A（推荐） | Prisma `$transaction` 包裹 read + write，用 Serialized 隔离级别 | 数据一致 | 略微降低并发 |
| B | 改用 UPDATE 表达式在 SQL 层 merge | 无竞态 | JSON field 不易做 merge |
| C | 乐观锁（版本号） | 简单 | 需新增 version 字段 |

## 设计决策

选择方案 A：用 Prisma interactive transaction 包裹 read + upsert，确保原子性。JS 层的 merge 逻辑保留不变，但整个操作变为原子。

## 影响范围

| 文件 | 改动 |
|------|------|
| `backend/src/services/life-archive.service.ts` | `updateEnergy`、`updateHealth`、`updateBehavior` 三个方法用 `prisma.$transaction` 包裹 |
