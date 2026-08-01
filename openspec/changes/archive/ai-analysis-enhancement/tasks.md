# AI 分析增强 — 实现任务（Vertical Slicing）

> 每个切片是端到端用户可见功能（后端 + 前端），完成后可独立验证。**禁止水平分层**（如"先建表→再 API→再 UI"）。

估算：约 3-4 天（含测试）
依赖链：VS1 → VS2 → VS3；VS4、VS5 可与 VS1 并行。

---

## VS1: AI 目标/计划建议确认（用户能在总览/计划页生成建议并确认写入）

**目标**：总览页「AI 建议年度目标」、计划页「AI 建议月度计划」→ 弹窗（接受/修改/拒绝/全部接受）→ confirm 写 ACTIVE；生成时注入 LifeArchive summary。

**后端**：
- [x] `goal-decompose.prompt.ts`：`GoalDecomposeContext`/`MonthlyDecomposeContext` 加 `summary?`；两个 build 函数加「人生档案摘要」段
- [x] `goal.service.ts` `aiSuggestYearly`：`archive.summary` 传入 context
- [x] `plan.service.ts` `aiSuggestMonthly`：读取 `archive.summary` 传入 context
- [x] 单测：yearly/monthly suggest 的 context 含/不含 summary；无 summary 用占位不报错

**前端**：
- [x] `api.ts`：新增 `suggestYearly/confirmYearly/suggestMonthly/confirmMonthly`
- [x] `components/AISuggestModal.tsx`：建议列表四操作 + 加载态 + 超时错误重试 + 档案为空 CTA
- [x] `OverviewPage` / `PlansPage` 挂入口
- [ ] 视觉回归截图：弹窗各状态

**验证**：浏览器总览页点 AI 建议 → 生成（带摘要）→ 接受/修改/拒绝 → 全部接受 → 目标链页可见新目标（ACTIVE）。

---

## VS2: 周/月复盘 AI 分析生成（用户能在周/月视图看到周期分析）

**目标**：周/月复盘可生成 AI 分析（聚合周期日复盘 + 计划进度 + summary），前端报告面板不再降级。

**后端**：
- [x] `analysis-runner.service.ts`：`run(reviewId)` 按复盘类型分流 DAILY/WEEKLY/MONTHLY
- [x] 新增 WEEKLY/MONTHLY 聚合逻辑：周期内 `DailyReview` + `DailyPlan` 进度 + `LifeArchive.summary`
- [x] `weekly-review.prompt.ts` 转活：接 `buildWeeklyReviewPrompt(cycleType)` 到 runner
- [x] Guard：周期内日复盘 <1 返回明确错误
- [x] 单测：正常聚合 / 无日复盘拒绝 / 输出 12 维度结构

**前端**：
- [x] `PlansPage` 周/月视图报告面板读取 `aiAnalyses[0].structuredReport`（已有读取逻辑，验证不再降级）
- [x] 无分析时显示"暂无可分析数据"空态（替换硬降级）

**验证**：创建周复盘 → 触发分析 → 周视图报告面板显示聚合分析；空周期显示空态。

---

## VS3: 反馈评分 + 反思注入闭环（用户评分，低分反哺下次分析）

**目标**：报告面板底部评分 UI + 低分反思注入复盘分析。

**后端**：
- [x] `analysis-runner.service.ts`：上下文组装处加载最近 5 条 `AIReflection`（仅复盘分析）
- [x] Prompt 追加「用户近期反馈」段（空集不注入）
- [x] 单测：有/无反思两态

**前端**：
- [x] `api.ts`：`submitFeedback(analysisId, ...)`
- [x] `components/FeedbackPanel.tsx`：滑条+数字、亮点/不足、提交后已评分禁用态、分数语义
- [x] 挂到 `StructuredReportPanel` 底部
- [ ] 视觉回归：提交前/已评分两态

**验证**：看分析报告 → 评分 + 填不足 → 提交 → 按钮禁用；下次日复盘分析触发，Prompt 含反思（后端日志）。

---

## VS4: 日计划 Web 输入（用户能在日视图创建/勾选/软删任务）

**目标**：日视图输入区 + 任务管理。

**前端**（后端 `POST/PATCH /api/plans/daily` 已就绪）：
- [x] `api.ts`：`createDailyPlan()` / `updateDailyPlanStatus()`
- [x] `DayTimeline.tsx`：输入区（标题+度量类型+目标值+添加）、任务行勾选/软删、进度条、空态
- [x] 校验：标题非空、目标值>0、COMPLETED 不可删
- [ ] 视觉回归：有任务/空态两态

**验证**：日视图添加任务 → 列表出现 → 勾选完成进度更新 → 软删置灰；空态引导正确。

---

## VS5: 总览 LifeArchive 摘要卡片（用户打开总览页即见 AI 对"我"的了解）

**目标**：总览页顶部摘要卡片三态。

**前端**（后端 `GET/POST /life-archive/summary*` 已就绪）：
- [x] `OverviewPage` 顶部 `SummaryCard`：有摘要展示 +「编辑档案 →」
- [x] 档案空 CTA 跳档案 Tab
- [x] summary 缺失：骨架 + 刷新按钮（调 refreshSummary）
- [ ] 视觉回归：三态

**验证**：总览页显示摘要卡片；档案空显示 CTA；摘要缺失显示生成中+可刷新。

---

## 验证汇总

- [ ] `cd backend && npm test`（新增单测通过，覆盖率 ≥80%）
- [ ] `cd frontend && npm run build:h5` 构建通过
- [ ] 原型交互逐条对照 specs.md 场景
- [ ] reviewer 审查无 Block 级别问题
