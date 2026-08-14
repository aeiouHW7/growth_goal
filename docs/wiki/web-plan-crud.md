# Web 计划增删改（web-plan-crud）

**变更**: web-plan-crud | **日期**: 2026-08-15 | **复杂度**: 复杂

## 概述
Web 端对目标体系（人生目标/年度目标/月度计划/日计划）全量增删改，手动保存落库（各端同步），硬删除（级联）。

## 能力
- **后端 DELETE**：`/goals/life/:id`、`/goals/yearly/:id`（级联删 Monthly→Daily）、`/plans/monthly/:id`（级联 Daily）、`/plans/daily/:id`，事务原子
- **目标链页**：Life/Yearly/Monthly 就地编辑（标题/目标值/状态）+ 新增 + 删除（confirm），层级/时间双视图均支持增删改
- **计划页**：月度计划编辑/新增/删除；日计划补编辑
- `api.ts`：全实体 create/update/delete 写方法

## 关键注意（坑）
- **PM2 后端是 tsx 非 watch**：改后端代码必须 `pm2 restart growth-backend` 才生效（前端 Vite 热更新不需要）
- GoalTree 月度节点 `editable` 需含 monthly，否则编辑/删除按钮不显示
- 级联删除用**按父 id 过滤**的 deleteMany（非清表，符合 CLAUDE.md）

## 使用
- 前端改完不用重启；后端改完 `pm2 restart growth-backend`
