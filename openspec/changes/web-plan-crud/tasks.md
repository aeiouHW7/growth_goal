# Web 计划增删改 — 实现任务（Vertical Slicing）

> 每切片端到端可验证。估算：2-3 天。依赖：VS1 → VS2 → VS3。

---

## VS1: 后端 DELETE 端点（级联）

- [x] `goal.service`：`deleteLifeGoal/deleteYearlyGoal`（级联删 Monthly→Daily，事务）
- [x] `plan.service`：`deleteMonthlyPlan`（级联 Daily）/`deleteDailyPlan`
- [x] `routes/controllers`：4 个 DELETE 端点
- [x] 单测：级联删除/404/事务回滚

**验证**：curl DELETE 各端点，确认级联；测 404。

---

## VS2: 目标链页就地编辑（Life/Yearly）

- [x] `api.ts`：create/update/delete LifeGoal + YearlyGoal
- [x] `GoalsPage`：行内「编辑」→ 就地输入框 → 保存/取消；「新增」；「删除」（确认弹窗）
- [x] 保存后刷新目标链

**验证**：就地改标题/目标值 → 保存 → 列表刷新 + 落库。

---

## VS3: 计划页月度/日计划编辑

- [x] `api.ts`：create/update/delete MonthlyPlan + update DailyPlan
- [x] `PlansPage`：MonthlyPlan 就地编辑/新增/删除（级联提示）
- [x] `DayTimeline`：日计划补「编辑」（就地改标题/目标值）

**验证**：月度计划编辑/新增/删除；日计划编辑。

---

## 验证汇总

- [ ] 后端测试全过（含新 DELETE 单测）
- [ ] 前端 tsc/lint/build 通过
- [ ] 就地编辑/新增/删除/确认 交互真实可用
- [ ] reviewer 审查无 Block
