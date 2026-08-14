# Web 计划增删改 — 技术设计

## 1. 后端 DELETE（级联，事务）

`goal.service` / `plan.service` 新增，均在 `$transaction` 内级联删：

```ts
async deleteYearlyGoal(id: string) {
  return prisma.$transaction(async tx => {
    const plans = await tx.monthlyPlan.findMany({ where: { yearlyGoalId: id }, select: { id: true } });
    await tx.dailyPlan.deleteMany({ where: { monthlyPlanId: { in: plans.map(p => p.id) } } });
    await tx.monthlyPlan.deleteMany({ where: { yearlyGoalId: id } });
    return tx.yearlyGoal.delete({ where: { id } });
  });
}
async deleteMonthlyPlan(id: string) {
  return prisma.$transaction(async tx => {
    await tx.dailyPlan.deleteMany({ where: { monthlyPlanId: id } });
    return tx.monthlyPlan.delete({ where: { id } });
  });
}
// deleteLifeGoal / deleteDailyPlan 直接 delete（findUniqueOrThrow → 404）
```

Controller 捕 `P2025`（not found）→ 404。

## 2. 前端就地编辑

通用模式（GoalsPage/PlansPage/DayTimeline）：
- 行内「编辑」→ 标题/目标值变 `input`（受控 state）→「保存」调 PUT/PATCH → 刷新列表
- 「新增」→ 空表单 → POST → 刷新
- 「删除」→ `window.confirm`（或自定义确认）→ DELETE → 刷新

`api.ts` 新增：
```ts
createLifeGoal / updateLifeGoal(id) / deleteLifeGoal(id)
createYearlyGoal / updateYearlyGoal(id) / deleteYearlyGoal(id)
createMonthlyPlan / updateMonthlyPlan(id) / deleteMonthlyPlan(id)
updateDailyPlan(id) / deleteDailyPlan(id)
```

## 3. 状态

实体无新状态（复用现有 status）。删除即物理删除。

## 测试

- 后端：级联删除单测（删 Yearly → Monthly/Daily 一并删；404；事务回滚）
- 前端：tsc/lint/build + 手动验证就地编辑/新增/删除/确认
