# 目标父子关系（goal-hierarchy）— 提案

## Why

用户的目标拆解是**总目标 → 子目标**的自定义层级（如"年收入78w"拆出"粉丝500/产品A"等子目标）。当前系统目标平行（Life→Yearly→Monthly→Daily 固定四层，无父子），无法表达拆解关系。

## 方案

**后端**：目标实体加 `parentId` 自关联（父子树，任意深度）。
- `YearlyGoal.parentId?`（指向父 YearlyGoal）；`MonthlyPlan.parentId?` 同理（可选扩展）
- service/controller：目标查询支持按 parentId 取子目标；创建时带 parentId
- Prisma migration：加字段（SQLite 已有数据兼容）

**前端**：
- 层级视图改为**父子树渲染**（递归，任意深度，按 parentId 组织）
- 每个目标「拆子目标」→ 新增子目标（带 parentId）
- 现有目标编辑/删除保留；删除父目标提示级联（子目标一起删或警告）

**现有数据**：78w 与 500粉丝 当前平行，需用户**手动关联**（在 UI 里把 500粉丝 拖/设为 78w 的子目标）或提供迁移入口。

## 决策（用户确认）

| 决策 | 结论 |
|------|------|
| 父子关系 | 目标加 parentId（父子树，任意层级）|
| 拆解入口 | 目标行「拆子目标」新增 |
| 现有数据 | 手动关联（UI 支持设父目标）|

## 边界

**做**：parentId 模型 + 层级视图父子树 + 拆子目标 + 手动关联
**不做**：不改时间视图；不改 AI 拆解（后续可让 AI 生成子目标）
**文件**：`schema.prisma`、`goal.service/controller/routes`、`GoalTree.tsx`、`api.ts`
