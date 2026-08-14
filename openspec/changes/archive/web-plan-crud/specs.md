# Web 计划增删改 — 验收规格

> 每个 Capability 至少包含一个 Edge Case。

## Capability 1：后端 DELETE 端点（级联）

### Requirement: 4 实体硬删除 + 级联

`DELETE /api/goals/life/:id`、`/api/goals/yearly/:id`、`/api/plans/monthly/:id`、`/api/plans/daily/:id`。删年度级联月度/日计划，删月度级联日计划。

#### Scenario: 删年度目标级联
- **GIVEN** YearlyGoal 存在且有关联 MonthlyPlan + DailyPlan
- **WHEN** DELETE /api/goals/yearly/:id
- **THEN** 该目标 + 其 MonthlyPlan + DailyPlan 全部删除（事务），返回删除数

#### Scenario: Edge Case — 删不存在记录
- **GIVEN** id 不存在
- **WHEN** DELETE
- **THEN** 404 NOT_FOUND

#### Scenario: Edge Case — 事务原子性
- **GIVEN** 级联删除中某步失败
- **WHEN** DELETE
- **THEN** 事务回滚，无部分删除

## Capability 2：目标链页就地编辑

### Requirement: LifeGoal/YearlyGoal 就地编辑/新增/删除

目标链页行内编辑（标题/目标值/状态）+ 新增 + 删除。

#### Scenario: 就地编辑保存
- **GIVEN** 年度目标行点「编辑」
- **WHEN** 修改标题/目标值后点「保存」
- **THEN** 调 PUT/PATCH 落库，行恢复展示并刷新

#### Scenario: Edge Case — 空值保存
- **GIVEN** 保存时标题为空
- **WHEN** 点保存
- **THEN** 阻止并提示"标题不能为空"，不落库

## Capability 3：计划页月度/日计划编辑

### Requirement: MonthlyPlan 编辑/新增/删除 + DailyPlan 补编辑

计划页月/日计划就地编辑，新增/删除。

#### Scenario: 新增月度计划
- **GIVEN** 计划页月视图
- **WHEN** 点「新增」填标题/目标值/月份
- **THEN** POST 落库，列表刷新

#### Scenario: Edge Case — 删除二次确认
- **GIVEN** 点删除
- **WHEN** 确认弹窗
- **THEN** 确认后 DELETE（级联），取消则不删
