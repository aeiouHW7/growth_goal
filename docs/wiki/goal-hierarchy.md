# 目标父子关系（goal-hierarchy）

**变更**: goal-hierarchy | **日期**: 2026-08-15 | **复杂度**: 复杂

## 概述
目标支持父子拆解（总目标→子目标，任意深度），层级视图展示父子拆解树（如"年收入78w"拆出"粉丝500"）。原有 Life→Yearly→Monthly→Daily 固定层级保留（时间维度），父子树是新增的目标组织维度。

## 实现
- **Schema**：`YearlyGoal.parentId` 自关联（命名关系 `YearlyGoalHierarchy`），任意深度；`prisma db push` 迁移（迁移前备份）
- **后端**：`listYearlyGoals` 支持 parentId 过滤（顶层/子目标/全部）；create/update 校验（环检测 PARENT_CYCLE、跨用户、父存在）；删除父级联删任意深度子目标 + 月度/日
- **前端**：GoalTree 层级视图按 parentId 递归渲染父子树；「拆子目标」新建（继承父 lifeGoalId/年份）；「设父级」手动关联（排除自身+后代防环）；子目标徽标
- **API**：`GET /api/goals/yearly/:id/children`

## 注意
- 旧数据（78w/粉丝500 等）为平行 YearlyGoal，父子关系未存 —— 需 UI「设父级」手动关联或「拆子目标」重建
- 删除父目标级联删全部子目标（confirm 提示）
- 前端改动 Vite 热更新；后端/schema 改动需 `pm2 restart growth-backend`

## 使用
- 层级视图：展开目标 → 「拆子目标」新建子目标 / 「设父级」关联现有
- 时间视图：按年月分组（时间维度，不变）
