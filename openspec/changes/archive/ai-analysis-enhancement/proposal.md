# AI 分析增强 — 提案

## Why（问题陈述）

当前系统的 AI 能力存在 4 处断点，导致"越用越准"的闭环未形成：

1. **周/月复盘没有 AI 分析**：`AnalysisRunner` 只支持 DAILY，周/月复盘创建后是死数据，前端报告面板只能靠日复盘降级。
2. **AI 拆解建议不带画像**：`aiSuggestYearly` 已读 LifeArchive 结构化数据但缺 summary，`aiSuggestMonthly` 只读 layerResources；建议质量不贴合用户。
3. **反馈闭环断在"记录"**：前端无评分 UI，低分反思（AIReflection）只创建、从不注入下次分析——用户评价无法反哺 AI。
4. **日计划无法在 Web 编辑**：DayTimeline 只读，任务只能走 CLI/飞书。

可量化现状：周/月复盘 0% 有 AI 分析；AI 建议 0% 注入摘要；反馈 UI 缺失；AIReflection 0% 被消费。

## PRD

- **版本**：0.2.0
- **路径**：`planning/ai-analysis-enhancement_prd.md`
- 完整 O.A.I.S 四层（P.A.M / 实体状态机 / Mermaid 时序图 / 4 页面结构 / SECURE 场景 / 自检矩阵）

## 原型

- **路径**：`planning/frontend-prototype.html`
- 重点区块：计划页「导航器 + 详情联动」模型、AI 建议确认弹窗、反馈评分区、日计划输入、总览摘要卡片（全部可交互）

---

## Design Overview

### 模块 A — AI 拆解建议链路（年/月）

- **后端**：`goal.service.aiSuggestYearly` 与 `plan.service.aiSuggestMonthly` 组装 context 时，读取 `LifeArchive.summary` 注入 `GoalDecomposeContext`/`MonthlyDecomposeContext`；`goal-decompose.prompt.ts` 两个 prompt 模板加「人生档案摘要」段。
- **前端**：总览页「AI 建议年度目标」、计划页「AI 建议月度计划」入口 → 复用弹窗组件（接受/修改/拒绝/全部接受 → confirm 批量创建 `ACTIVE`）。新增超时错误态 + 重试、档案为空引导。

### 模块 B — 复盘链路补全 + 个性化 + 反馈闭环

- **B1 周/月分析生成**：扩展 `AnalysisRunner` 支持 `WEEKLY`/`MONTHLY`（或并行 runner），聚合周期内日复盘 + 计划进度 → 复用 `weekly-review.prompt.ts`（死代码转活）生成结构化报告 → 写 `AIAnalysis(analysisType=WEEKLY/MONTHLY)` 关联复盘。
- **B2 反馈评分 UI**：`StructuredReportPanel` 底部新增评分区（0-100 滑条+数字、亮点/不足、提交后已评分禁用态）；前端 `api.ts` 新增 `submitFeedback`；复用已有 `POST /analysis/:id/feedback`。
- **B3 反思注入**：`analysis-runner` 上下文组装处加载最近 5 条 `AIReflection` 注入复盘分析 Prompt（日/周/月）。

### 模块 C — 日计划 Web 输入

- 计划页日视图新增输入区（标题 + 度量类型 + 目标值 + 添加）、勾选完成、软删（CANCELLED）；前端 `api.ts` 新增 `createDailyPlan` / `updateDailyPlanStatus`；复用已有 `POST /api/plans/daily` + `PATCH /api/plans/daily/:id/status`。

### 模块 D — 总览摘要卡片

- OverviewPage 顶部新增 LifeArchive 摘要卡片（三态：已生成/档案为空 CTA/生成中刷新）；复用已有 `GET /api/life-archive/summary` + `POST /api/life-archive/summary/refresh`。

### 关键架构决策（来自 Grill）

| 决策 | 结论 |
|------|------|
| 摘要注入范围 | 年/月建议注入、日建议取消（不 AI 拆解）、复盘（日/周/月）注入 |
| 注入形态 | `LifeArchive.summary` 字段 |
| 建议写入策略 | 弹窗即确认，直接写 `ACTIVE`（不二次确认） |
| 周/月分析 | 本期补齐生成链路（只新生成，历史不补） |
| 反思注入 | 仅复盘分析，最近 5 条，不注入拆解建议 |
| 反馈指标 | 已展示分析反馈参与率 ≥30% |

<!--
## Dialectical Analysis（辩证分析）

**多路径对比**
- 方案 A（只补剩余需求，保持 Web 只读）：改动最小，但日计划仍无法 Web 编辑、周/月报告仍降级。vs 方案 B（本期补齐周/月分析 + 日计划输入）：兑现完整闭环，代价是范围增大。→ 用户选择 B 的核心项。
- 摘要注入形态：A 注入 summary（一次调用、浓缩）vs B 注入结构化分层（信息全但 token 重）→ 选 A，且 yearly 已注入结构化画像，summary 是补充而非唯一来源。

**取长补短（参考 upstream/reference）**
- 复用已存在的 `weekly-review.prompt.ts`（死代码）而非新写 prompt，减少重复。
- 复用已有 `POST /analysis/:id/feedback`、`POST /api/plans/daily`、`GET /api/life-archive/summary` 等后端能力，前端只补 UI 层，避免前后端重复实现。

**风险对冲**
- 最可能失败点：周/月分析生成的数据聚合逻辑（周边界、跨月、缺数据）复杂度高。预备方案：非周期月份/无日复盘时返回明确空态（「该月暂无数据」），不崩不阻塞。
- 风险：反思注入可能引入陈旧/不相关反馈，干扰分析。对冲：仅取最近 5 条 + 明确标注「用户近期反馈」，限制影响。
- 风险：confirm 批量创建无幂等。对冲：弹窗是明确用户操作，接受重复创建的权衡（用户确认）。
-->

## Scoping and Materialization（范围界定）

**本期做**：
- 年/月 AI 建议确认 UI + 生成时注入 summary
- 周/月复盘 AI 分析生成（含 summary 注入）
- 低分反思注入复盘分析
- 前端反馈评分 UI
- 日计划 Web 输入（创建/勾选/软删）
- 总览摘要卡片

**不做**：
- 日计划 AI 拆解（取消，由人输入）
- 目标/复盘文本的 Web 创建编辑（仍 CLI/飞书）
- 拆解建议注入反思、进化复盘/统计监控（延后）
- Calendar 同步（延后）
- 历史周/月复盘补生成、confirm 幂等去重、深色模式

**新增文件**：`frontend/src/components/AISuggestModal.tsx`、`FeedbackPanel.tsx`、`DailyPlanInput.tsx`、`SummaryCard.tsx`（或并入现有组件）。
**修改文件**：`goal.service.ts`、`plan.service.ts`、`goal-decompose.prompt.ts`、`weekly-review.prompt.ts`（转活）、`analysis-runner.service.ts`、`analysis.service.ts`、`api.ts`、`OverviewPage.tsx`、`PlansPage.tsx`、`StructuredReportPanel.tsx`、`DayTimeline.tsx`、`App.tsx`（如入口）。
