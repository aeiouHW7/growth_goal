# AI 分析增强 — 技术设计

## 1. 架构概览

```
                    ┌──────────────────────────────────────────────┐
                    │                Express API (:3001)            │
  前端 Web(:3002)   │                                              │
  ┌──────────────┐  │  ┌─────────────┐   ┌──────────────────────┐  │
  │ 建议确认弹窗   │──│→│ ai-suggest/ │   │ AnalysisRunner        │  │
  │ 反馈评分区    │  │  │ yearly/month│   │  (扩展: DAILY+WEEKLY+ │  │
  │ 日计划输入    │  │  │ +summary    │   │   MONTHLY, 反思注入)  │  │
  │ 摘要卡片     │  │  └─────────────┘   └──────────┬───────────┘  │
  └──────────────┘  │                               │              │
                    │                    ┌──────────▼──────────┐   │
                    │                    │ weekly-review.prompt │   │
                    │                    │ (死代码转活)         │   │
                    │                    └─────────────────────┘   │
                    │                SQLite (Prisma, 17 表)        │
                    └──────────────────────────────────────────────┘
```

## 2. 后端改动

### 2.1 摘要注入（模块 A2）— 年/月建议

| 文件 | 位置 | 改动 |
|------|------|------|
| `goal.service.ts` | `aiSuggestYearly` (L82-153)，context 组装 L106-125 | `archive` 已读取，补 `ctx.summary = archive?.summary` 传入 |
| `plan.service.ts` | `aiSuggestMonthly` (L106-143)，L109-110 | 已读 archive，补 `ctx.summary`；`MonthlyDecomposeContext` 增加 `summary?` |
| `goal-decompose.prompt.ts` | `GoalDecomposeContext` (L6-35) / `MonthlyDecomposeContext` (L99-109) | 加 `summary?: string` |
| `goal-decompose.prompt.ts` | `buildGoalDecomposePrompt` (L37-93) / `buildMonthlyDecomposePrompt` (L111-143) | 注入段：`## 人生档案摘要\n${ctx.summary || '（无摘要）'}` |

**规则**：`summary` 为空时注入占位文案，不报错。

### 2.2 周/月复盘分析生成（模块 B1）

**入口**：`POST /api/analysis/run/:reviewId`（现有）需扩展支持 weeklyReviewId / monthlyReviewId；或新增独立端点。

**`analysis-runner.service.ts` 扩展**：
- `run(reviewId)` 入口按 reviewId 关联的复盘类型分流：`dailyReviewId` → DAILY；`weeklyReviewId` → WEEKLY；`monthlyReviewId` → MONTHLY
- `runInternal` 增加分支：
  - **WEEKLY**：聚合该周 `DailyReview`（按 weekStart~weekEnd）+ 周期内 DailyPlan 进度 + LifeArchive.summary + 最近 5 条 AIReflection
  - **MONTHLY**：聚合该月 `DailyReview` + 月度计划进度 + summary + 反思
- 复用 `weekly-review.prompt.ts` 的 `buildWeeklyReviewPrompt(cycleType: 'WEEKLY'|'MONTHLY')`（当前死代码，无引用 → 转活）
- 输出写 `AIAnalysis(analysisType, weeklyReviewId/monthlyReviewId)`，复用现有 JSON schema（12 维度）

**Guard**：周期内 `DailyReview` 数 ≥1，否则返回明确错误（不生成）。

### 2.3 反思注入（模块 B3）

| 文件 | 位置 | 改动 |
|------|------|------|
| `analysis-runner.service.ts` | `runInternal` 上下文组装（L105-124 的 `Promise.all` 之后） | 新增 `prisma.aIReflection.findMany({ orderBy:{createdAt:'desc'}, take:5 })` |
| 同上 | Prompt 组装（L127-151） | 追加 `用户近期反馈：\n- {issueDescription}...`（空集不注入） |

**范围**：仅复盘分析（DAILY/WEEKLY/MONTHLY），拆解建议（模块 A）不注入。

### 2.4 反馈闭环

后端 `POST /analysis/:id/feedback` 已实现（`analysis.service.submitFeedback`），**本期不改后端**：0-100 校验、低分建 AIReflection、高分建 AISuccessCase 均已就绪。

---

## 3. 前端改动

### 3.1 AI 建议确认弹窗（模块 A1）

**新组件** `frontend/src/components/AISuggestModal.tsx`（总览/计划页共用）：
- Props：`mode: 'yearly' | 'monthly'`、`onClose`
- 交互：建议列表（接受→绿/修改→内联编辑+已修改角标/拒绝→置灰）、全部接受、加载态、超时错误态+重试、档案为空 CTA
- API：`api.ts` 新增 `suggestYearly()` / `confirmYearly()` / `suggestMonthly()` / `confirmMonthly()`

**入口**：`OverviewPage`（AI 建议年度目标按钮）、`PlansPage`（AI 建议月度计划按钮）。

### 3.2 反馈评分区（模块 B2）

**新组件** `frontend/src/components/FeedbackPanel.tsx`，挂载到 `StructuredReportPanel` 底部：
- 0-100 滑条+数字、亮点/不足文本框、提交后「已评分」禁用态、分数语义提示
- `api.ts` 新增 `submitFeedback(analysisId, {userScore, excellentReason, failReason})`

### 3.3 日计划输入（模块 C）

改造 `frontend/src/components/DayTimeline.tsx`：
- 顶部输入区（标题 + 度量类型 select + 目标值 + 添加）
- 任务行：勾选完成（PENDING↔COMPLETED）、删除（软删 CANCELLED，完成态无删除按钮）
- `api.ts` 新增 `createDailyPlan()` / `updateDailyPlanStatus()`

### 3.4 摘要卡片（模块 D）

`OverviewPage` 顶部新增 `SummaryCard` 区块：
- 三态：有 summary 展示 / 档案空 CTA（跳档案 Tab）/ summary 缺失显示生成中+刷新
- 复用 `ARCHIVE_API.getSummary()` / `refreshSummary()`（已存在）

---

## 4. API 契约汇总

| 端点 | 方法 | 状态 | 本期动作 |
|------|------|------|---------|
| `/api/goals/ai-suggest/yearly` | POST | 已有 | 加 summary 注入 |
| `/api/goals/ai-suggest/yearly/confirm` | POST | 已有 | 不改（写 ACTIVE）|
| `/api/plans/ai-suggest/monthly` | POST | 已有 | 加 summary 注入 |
| `/api/plans/ai-suggest/monthly/confirm` | POST | 已有 | 不改 |
| `/api/analysis/run/:reviewId` | POST | 已有 | 扩展支持 WEEKLY/MONTHLY |
| `/api/analysis/:id/feedback` | POST | 已有 | 不改 |
| `/api/plans/daily` | POST | 已有 | 不改（前端接入）|
| `/api/plans/daily/:id/status` | PATCH | 已有 | 不改（前端接入）|
| `/api/life-archive/summary` | GET | 已有 | 不改（前端接入）|
| `/api/life-archive/summary/refresh` | POST | 已有 | 不改（前端接入）|

> **结论：无新增后端端点**，全部复用 + 扩展注入逻辑。

---

## 5. 状态迁移

| 实体 | 状态机变化 |
|------|-----------|
| WeeklyReview / MonthlyReview | 无新状态字段；分析生成后通过 `aiAnalyses[]` 关联（从"无分析"→"有分析"）|
| DailyPlan | 前端操作：PENDING → IN_PROGRESS/COMPLETED；软删 → CANCELLED（COMPLETED 不可删）|
| AIAnalysis | analysisType 增加 WEEKLY/MONTHLY 生成路径 |
| AIReflection | 新增"被注入分析 Prompt"的消费行为（无状态字段变更）|

---

## 6. 测试策略

- **后端单测**（jest，目标 ≥80%）：
  - summary 注入：yearly/monthly suggest 的 context 含/不含 summary 两态
  - 周/月分析生成：正常聚合、无日复盘拒绝、JSON 结构 12 维度
  - 反思注入：有/无反思两态
  - feedback：0-100 校验、重复提交拒绝（已有）
- **前端**：组件交互（建议弹窗四操作、反馈提交、日计划增删勾选）—— 视觉回归截图为主（web testing 规范）
- **E2E**：无（项目无 E2E）
