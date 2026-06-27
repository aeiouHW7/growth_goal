---
version: "0.1.0"
change: "core-goal-review-system"
task_version: "1.0"
---

# Tasks: core-goal-review-system

## 垂直切片任务

所有任务按依赖关系排序，每个任务独立可交付。

---

### T1: 项目初始化 + Prisma Schema

**Description**: 搭建 backend 项目骨架，配置 Prisma 并初始化数据库

**AC**:
- [x] `npm init` 完成，TypeScript 编译通过
- [x] Prisma schema 包含全部 12 个 model
- [x] `prisma generate` + `prisma db push` 成功
- [x] Docker PostgreSQL 可连接

**Effort**: S

**Depends On**: —

---

### T2: 基础中间件 + Express 骨架

**Description**: Express app 启动、错误处理、路由注册框架

**AC**:
- [x] Express 监听 PORT（.env 配置）
- [x] 统一错误处理中间件工作
- [x] 所有路由文件注册到 app（handler 可先返回 501）
- [x] 健康检查 GET /api/health → 200

**Effort**: S

**Depends On**: T1

---

### T3: User CRUD

**Description**: 用户创建、读取、更新

**AC**:
- [x] POST /api/user — 创建用户（age/occupation/industry/可支配时间必填）
- [x] GET /api/user — 获取用户
- [x] PUT /api/user — 更新用户
- [x] 验证逻辑：age 必填、weekdayAvailableHours/ weekendAvailableHours 必填

**Effort**: S

**Depends On**: T2

---

### T4: LifeGoal + YearlyGoal CRUD + 状态机

**Description**: 目标创建、查看、更新、状态变更

**AC**:
- [x] POST /api/goals/life — 创建人生目标
- [x] GET /api/goals/life — 列表（支持 sortOrder 排序）
- [x] PUT /api/goals/life/:id — 更新
- [x] PATCH /api/goals/life/:id/status — 状态转移校验（ACTIVE→COMPLETED/ABANDONED 等）
- [x] YearlyGoal 相同 CRUD + ?lifeGoalId=&year= 过滤
- [x] 度量类型校验（metricType + targetValue 格式检查）

**Effort**: M

**Depends On**: T3

---

### T5: MonthlyPlan + DailyPlan CRUD + 状态机

**Description**: 月度/日计划创建、查看、更新、状态变更

**AC**:
- [x] MonthlyPlan 完整 CRUD + ?year=&month= 过滤
- [x] DailyPlan 完整 CRUD + ?date= 过滤
- [x] PlanStatus 状态转移：PENDING→IN_PROGRESS→COMPLETED/PARTIAL/FAILED
- [x] DailyPlan 日期不能在未来但状态为 COMPLETED 的校验

**Effort**: M

**Depends On**: T4

---

### T6: DailyReview CRUD + AI 追问逻辑

**Description**: 每日复盘的创建、追问、更新、列表

**AC**:
- [x] POST /api/reviews/daily — 创建复盘（rawInput 必填）
- [x] GET /api/reviews/daily/:date — 获取某天复盘
- [x] GET /api/reviews/daily?from=&to= — 时间段列表
- [x] PUT /api/reviews/daily/:id — 更新复盘
- [x] POST /api/reviews/daily/:id/followup — 提交追问回答
- [x] ReviewStatus 状态转移：INPUTTING→ANALYZING→COMPLETED
- [x] followUpLog 最大 2 条限制

**Effort**: M

**Depends On**: T5

---

### T7: WeeklyReview + MonthlyReview CRUD

**Description**: 周/月复盘的 AI 创建、用户补充、缺失天数记录

**AC**:
- [x] POST /api/reviews/weekly — AI 创建周复盘（自动聚合周数据）
- [x] GET /api/reviews/weekly/:year/:week — 获取周复盘
- [x] GET /api/reviews/weekly/check — 检测是否需要触发周复盘
- [x] MonthlyReview 相同结构
- [x] missingDays 字段记录缺失日期及原因

**Effort**: M

**Depends On**: T6

---

### T8: AIAnalysis + Feedback + Reflection + SuccessCase

**Description**: AI 分析报告生成、评分反馈、反思与优秀案例

**AC**:
- [x] POST /api/analysis/generate — 生成四层分析报告（structuredReport JSON）
- [x] GET /api/analysis/:id — 获取分析报告
- [x] POST /api/analysis/:id/feedback — 评分（0-100）+ 原因
- [x] score < 60 → 自动创建 AIReflection
- [x] score ≥ 80 → 自动创建 AISuccessCase
- [x] 校验：userScore 0-100、isPass/isExcellent 自动计算

**Effort**: M

**Depends On**: T7

---

### T9: Progress API（仪表盘数据源）

**Description**: 进度概览、目标拆解链、日历数据

**AC**:
- [x] GET /api/progress/overview — 所有目标进度 + 完成率
- [x] GET /api/progress/goal/:goalId — 目标完整拆解链（含子级）
- [x] GET /api/progress/calendar?year=&month= — 日历完成数据（日期+评分）

**Effort**: M

**Depends On**: T8

---

### T10: Prompt 工程 — 系统提示词

**Description**: 编写 Claude 系统 prompt

**AC**:
- [x] 完整的 system.prompt.ts — 角色定义、核心规则、API 调用说明
- [x] API 调用示例包含在 prompt 中
- [x] 规则覆盖：追问限制、AI 不改计划、评分闭环

**Effort**: S

**Depends On**: T9

---

### T11: Prompt 工程 — 目标设定流程

**Description**: 目标管理的交互 prompt

**AC**:
- [x] goal-setup.prompt.ts — 引导用户按层级+度量创建目标
- [x] 覆盖：多级创建、度量格式检查、查看现有目标

**Effort**: S

**Depends On**: T10

---

### T12: Prompt 工程 — 每日复盘流程

**Description**: 每日复盘的完整交互 prompt

**AC**:
- [x] daily-review.prompt.ts — 碎碎念接收→结构化→追问→四层分析→评分
- [x] 追问限制逻辑（最多 2 次）
- [x] 外部视角分析说明

**Effort**: M

**Depends On**: T11

---

### T13: Prompt 工程 — 周/月复盘流程

**Description**: 周/月复盘自动触发+聚合分析 prompt

**AC**:
- [x] weekly-review.prompt.ts — AI 自动聚合 + 缺失追问 + 时事搜索
- [x] monthly-review.prompt.ts — 同上，月粒度
- [x] 外部信息获取失败时标注降级

**Effort**: S

**Depends On**: T12

---

### T14: Seed Data + Dev Test

**Description**: 开发用种子数据和基本集成测试

**AC**:
- [x] prisma/seed.ts — 包含一个完整用户 + 目标链 + 复盘样本
- [x] 3 个基础 jest 测试（健康检查、用户 CRUD、目标 CRUD）
- [x] `npm test` 绿色通过
- [x] `npm run dev` 启动后 API 可访问

**Effort**: S

**Depends On**: T13

---

## 依赖图

```
T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9
                                              ↓
T10 → T11 → T12 → T13 → T14
  
(← 同为后端构建，→ 为依赖方向)
```

## 工作量估算

| Task | Effort | 估计人时 |
|------|--------|---------|
| T1 | S | 1h |
| T2 | S | 0.5h |
| T3 | S | 1h |
| T4 | M | 2h |
| T5 | M | 2h |
| T6 | M | 2h |
| T7 | M | 2h |
| T8 | M | 2.5h |
| T9 | M | 2h |
| T10 | S | 1h |
| T11 | S | 1h |
| T12 | M | 2h |
| T13 | S | 1h |
| T14 | S | 1h |
| **合计** | | **21h** |
