# Web 计划增删改（web-plan-crud）— 提案

## Why（问题陈述）

Web 端目前是**只读看板**（除日计划输入），目标/计划只能 CLI/飞书写入。用户希望 Web 端直接管理全部目标/计划：**人生目标 / 年度目标 / 月度计划 / 日计划**的增删改，手动保存落库（各端同步），支持硬删除。

## PRD / 原型

**跳过**：改动是已有页面的就地编辑增强（目标链页/计划页），无新页面/新布局，复用现有数据展示。直接给技术方案。

---

## Design Overview

### 后端（新增 DELETE 端点 + 级联）

| 端点 | 方法 | 级联 |
|------|------|------|
| `/api/goals/life/:id` | DELETE | 无子级，直接删 |
| `/api/goals/yearly/:id` | DELETE | 级联删其 MonthlyPlan → DailyPlan |
| `/api/plans/monthly/:id` | DELETE | 级联删其 DailyPlan |
| `/api/plans/daily/:id` | DELETE | 直接删 |

- service 加 `deleteLifeGoal/deleteYearlyGoal/deleteMonthlyPlan/deleteDailyPlan`（事务内级联删）
- 违反项目"无 DELETE"旧设计 —— 用户确认硬删 + 级联

### 前端（就地编辑 + 增删 + 手动保存）

- **目标链页**：LifeGoal/YearlyGoal 行内「编辑」→ 就地变输入框（标题/目标值/状态）→「保存」；「新增」；「删除」（二次确认）
- **计划页**：MonthlyPlan 同款就地编辑/新增/删除；DailyPlan 补编辑（已有增/勾选/软删）
- `api.ts` 加写方法：`createLifeGoal/updateLifeGoal/deleteLifeGoal`、`createYearlyGoal/updateYearlyGoal/deleteYearlyGoal`、`updateMonthlyPlan/deleteMonthlyPlan`、`updateDailyPlan`
- 保存后刷新对应数据（各端同步）

### 架构决策（来自用户确认）

| 决策 | 结论 |
|------|------|
| 编辑范围 | Life/Yearly/Monthly/Daily 全部 |
| 保存 | 手动保存按钮（就地编辑后保存）|
| 删除 | 硬删除（级联删下级）|
| 编辑交互 | 就地编辑（行内变输入框）|

<!--
## Dialectical Analysis（辩证分析）

- 删除：软删（保留历史，符合旧设计）vs 硬删（用户选，数据干净）→ 用户确认硬删，需级联保数据一致。
- 保存：即时自动（无保存按钮）vs 手动保存（用户选）→ 手动更可控，减少误操作。
- 编辑：就地 vs 弹窗 → 就地编辑（用户选）减少跳转。
-->

## Scoping and Materialization（范围界定）

**做**：4 实体后端 DELETE（级联）+ 前端就地编辑/新增/删除 + api.ts 写方法 + 保存后刷新
**不做**：不改 AI 建议/复盘流程；不做批量编辑；不做撤销
**文件**：后端 `goal.service/controller/routes`、`plan.service/controller/routes`；前端 `GoalsPage/PlansPage/DayTimeline`、`api.ts`
