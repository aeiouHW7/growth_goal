# API Design

**变更**: core-goal-review-system
**日期**: 2026-05-17

## 概述

RESTful API，Node.js + Express 5，通过 Prisma 操作 PostgreSQL。所有 API 通过 Claude 终端 + HTTP 工具调用，前端 Phase 2 再接入。

## 实现要点

- 6 组路由：user, goals, plans, reviews, analysis, progress
- 基于数字签名（当前取第一个用户，Phase 1 单用户模式）
- 30+ 个端点覆盖完整的目标 → 计划 → 复盘 → 分析 → 评分链条

## 关键决策

- **无鉴权**：Phase 1 单用户模式，所有 controller 通过 `getUserId()` 取第一个用户
- **统一错误格式**：`{ error: { code, message, details? } }`
- **3-layer 架构**：controller → service → Prisma，app.ts/prisma.ts/index.ts 分离保证测试可测试性

## 注意事项

- `checkWeekly`/`checkMonthly` 必须传 `userId` 过滤，否则跨用户数据污染
- 用户输入的日期必须先通过 `validateDateString()` 再传 Prisma
- 分数反馈闭环：`<60` 自动创建 `AIReflection`，`≥80` 自动创建 `AISuccessCase`
- 追问最多 2 次，第 3 次标注 `[部分信息缺失]`
