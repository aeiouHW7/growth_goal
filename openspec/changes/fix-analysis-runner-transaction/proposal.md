# fix-analysis-runner-transaction

## 问题陈述

`analysis-runner.service.ts` 的 `runInternal()` 在 AI 分析完成后，对数据库做以下写入操作：

1. `prisma.aIAnalysis.create()` — 保存分析报告
2. `prisma.dailyReview.update()` — 更新复盘状态
3. `patternService.trackIssuesFromAnalysis()` — 写入行为模式
4. `biasDetection.logFromAnalysis()` — 写入认知偏误日志
5. `capabilityService.logFromAnalysis()` — 写入能力评分

这些操作 **没有包裹在事务中**。如果步骤 3/4/5 之一失败，就会出现一条 orphan `AIAnalysis` 记录，且复盘状态停留在 `ANALYZING` 而不回退。

## 方案对比

| 方案 | 做法 | 优点 | 缺点 |
|------|------|------|------|
| A（推荐） | Prisma interactive `$transaction` + 子服务接受可选 `tx` 参数 | 原子性保证，完整 ACID | 需改 3 个子服务方法签名 |
| B | 只包裹核心写入（AIAnalysis + DailyReview），子服务独立 | 改动小 | 子服务可能不一致 |
| C | 用 `createMany` 等批量写入挤到一个事务里 | 原子性高 | 子服务逻辑耦合，不可行 |

## 设计决策

**选择方案 A**：将 `AIAnalysis.create` + `DailyReview.update` + 三个子服务的写入全部放入同一个 Prisma interactive transaction。

子服务的方法是纯写入（无读后写竞态），只需在方法签名中添加可选 `tx?: Prisma.TransactionClient` 参数，有则使用 `tx`，无则用 `prisma`（向后兼容）。

## 影响范围

| 文件 | 改动 |
|------|------|
| `backend/src/services/pattern.service.ts` | `trackIssuesFromAnalysis` 添加可选 `tx` 参数 |
| `backend/src/services/bias-detection.service.ts` | `logFromAnalysis` 添加可选 `tx` 参数 |
| `backend/src/services/capability.service.ts` | `logFromAnalysis` 添加可选 `tx` 参数 |
| `backend/src/services/analysis-runner.service.ts` | `runInternal` 用 `prisma.$transaction` 包裹全部写入 |
