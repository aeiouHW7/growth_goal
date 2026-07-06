# fix-analysis-runner-transaction — 验收规格

## Requirement R-1：分析写入原子性

- **前置**：用户提交一次每日复盘
- **操作**：后端运行 AI 分析
- **预期**：以下 5 项要么全部写入，要么全部不写
  - AIAnalysis 记录
  - DailyReview 状态更新
  - BehaviorPattern 更新
  - CognitiveBiasLog 记录
  - CapabilityScore 记录
- **证据**：在 `runInternal` 中注入模拟失败，验证复盘状态没有停留在 `ANALYZING`

## Requirement R-2：子服务向后兼容

- **前置**：子服务在其他地方被调用（如 CLI/CRON）
- **操作**：不传 `tx` 参数调用
- **预期**：正常工作，使用 `prisma` 实例直接操作
- **证据**：测试无改动调用路径

## Edge Case

- **辅助写失败**：`trackIssuesFromAnalysis` 抛出异常但其 `.catch()` 捕获，事务不因此回滚，主数据（AIAnalysis + DailyReview 状态）正常提交
