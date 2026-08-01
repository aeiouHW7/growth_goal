# AI 分析增强（ai-analysis-enhancement）

**变更**: ai-analysis-enhancement
**日期**: 2026-08-01
**复杂度**: 复杂

## 概述

补齐 AI 分析/建议链路的 4 处断点：周/月复盘无 AI 分析、AI 拆解建议不带档案画像、反馈闭环断在"记录"、日计划无法 Web 编辑。前端按原型 `frontend-prototype.html` 全面对齐（indigo 主题、pin 联动日历）。

## 实现要点

### 后端
- **AI 拆解建议注入 summary**：`aiSuggestYearly/Monthly` 组装 context 时读 `LifeArchive.summary`，`goal-decompose.prompt.ts` 加「人生档案摘要」段
- **周/月复盘分析生成**：`AnalysisRunner` 扩展支持 DAILY/WEEKLY/MONTHLY 分流，聚合周期内日复盘 + 计划进度 + summary，转活 `weekly-review.prompt.ts` 的 `buildCycleReviewPrompt`；Guard：周期内无日复盘拒绝生成
- **反思注入**：复盘分析加载最近 5 条 `AIReflection`（**必须按 userId 过滤**，通过 `feedback.aiAnalysis.OR(daily/weekly/monthly.userId)` 关联），注入 Prompt 的「用户近期反馈」段
- **技术债修复**：`life-archive.service` 的 `Prisma.InputJsonValue`、`goal.service` failurePatterns 断言、`pattern.service` BehaviorPattern 类型（tsc 10→0）

### 前端
- **AI 建议确认 UI**：总览页（年度）/ 计划页（月度）入口 → 弹窗（接受/修改/拒绝/全部接受 → confirm 写 ACTIVE）
- **反馈评分**：`FeedbackPanel` 渐变滑条 + 亮点/不足 + 已评分禁用态；`api.submitFeedback`
- **日计划 Web 输入**：`DayTimeline` 创建/勾选/软删（适配后端单向状态机 PENDING→IN_PROGRESS→COMPLETED）
- **摘要卡片**：总览页三态（已生成/档案空 CTA/生成中刷新）
- **计划页 pin 联动**：月/周视图点某天下钻（左侧保持），「已定位 X · 查看月/周汇总→」取消；四视图视觉对齐原型

## 关键决策

| 决策 | 结论 |
|------|------|
| 摘要注入范围 | 年/月建议注入、日建议取消（人工输入）、复盘全注入 |
| 写入策略 | 弹窗即确认，直接写 ACTIVE（不二次确认）|
| 周/月分析 | 本期补齐生成链路（只新生成，历史不补）|
| 反思注入 | 仅复盘分析，最近 5 条 |
| 反馈指标 | 已展示分析反馈参与率 ≥30% |

## 注意事项

- **AIReflection 查询必须带 userId 过滤**（跨用户泄露风险，审查 CRITICAL 已修复）
- 日计划删除/完成受后端 `validatePlanTransition` 单向状态机约束（PENDING→IN_PROGRESS→COMPLETED，完成不可逆）
- 前端 build 曾因历史类型错误失败（19 个），已系统性修复
- 周/月复盘分析为异步触发（`POST /api/analysis/run/:reviewId` fire-and-forget），前端读 `aiAnalyses[0]` 展示
