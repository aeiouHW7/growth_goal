# growth-miniprogram 文件结构

> 完整项目文件树 + 每个文件用途说明。
> 最后更新: 2026-06-13

```
domains/growth-miniprogram/
│
├── README.md                        — 项目总览：功能特性、系统架构、快速开始
├── CLAUDE.md                        — AI 协作指令（ACE 工作流、命令、编码规范）
├── domain.yaml                      — 领域定义（技术栈: Taro+Express+Prisma+PG）
├── docker-compose.yml               — PostgreSQL 15 容器定义（端口 5434）
│
├── planning/                        ── 规划设计
│   └── v0.1/
│       ├── PRD.md                   — 人生教练产品需求文档（含 Coach 对话流程）
│       ├── growth-miniprogram_prd.md — O.A.I.S 标准 PRD（目标/架构/交互/场景）
│       └── growth-miniprogram_prototype.html  — Web 仪表盘完整原型（703 行）
│
├── openspec/                        ── 变更提案（open spec 格式）
│   ├── config.yaml                  — OpenSpec 配置
│   └── changes/
│       ├── web-dashboard/           — 【当前】前端仪表盘重做
│       │   ├── proposal.md          — 提案：三标签导航 + 周期切换 + 三面板
│       │   ├── design.md            — 设计：组件树、API 接口、交互流程
│       │   ├── specs.md             — 规格：7 项功能规格 + 验收标准
│       │   └── tasks.md             — 任务：T1-T7，估算 14 小时
│       └── archive/
│           └── core-goal-review-system/  — 【已完成】核心目标复盘系统
│               ├── proposal.md
│               ├── design.md
│               ├── specs.md
│               └── tasks.md
│
├── backend/                         ── Express + Prisma + PostgreSQL API 服务
│   ├── package.json                 — 依赖：express, prisma, cors, tsx, jest
│   ├── tsconfig.json                — TypeScript 编译配置
│   ├── .env / .env.example          — DATABASE_URL=postgresql://...
│   │
│   ├── prisma/
│   │   ├── schema.prisma            — 16 个数据模型 + 4 枚举（337 行）
│   │   └── seed.ts                  — 数据种子（创建用户 + 演示目标链）
│   │
│   ├── src/
│   │   ├── index.ts                 — 入口：启动 Express（端口 3001）
│   │   ├── app.ts                   — Express 实例：中间件 + 7 个路由注册
│   │   ├── prisma.ts                — PrismaClient 单例
│   │   │
│   │   ├── config/index.ts          — 环境变量加载（dotenv）
│   │   ├── middleware/error-handler.ts — 统一错误处理（code + status + message）
│   │   │
│   │   ├── routes/                  ── 路由层（薄，只做 URL → Controller 映射）
│   │   │   ├── user.ts              — GET/PUT /api/user
│   │   │   ├── goals.ts             — CRUD /api/goals/life + /api/goals/yearly
│   │   │   ├── plans.ts             — CRUD /api/plans/daily + /api/plans/monthly
│   │   │   ├── reviews.ts           — CRUD /api/reviews/daily/weekly/monthly
│   │   │   ├── analysis.ts          — 13 条路由：分析生成/建议/模式/偏误/能力/反馈
│   │   │   ├── progress.ts          — GET /api/progress/overview + /calendar
│   │   │   └── prompt.ts            — GET /api/prompt/daily-review（只读，给 Bridge 用）
│   │   │
│   │   ├── controllers/             ── 控制器层（请求解析 + 参数校验 + 调用 service）
│   │   │   ├── user.controller.ts   — 获取/更新用户画像（40 行）
│   │   │   ├── goal.controller.ts   — LifeGoal + YearlyGoal CRUD + 状态变更 + 进度更新
│   │   │   ├── plan.controller.ts   — MonthlyPlan + DailyPlan CRUD + 状态变更
│   │   │   ├── review.controller.ts — 3 种复盘 CRUD + 追问 + 周/月 check 检测
│   │   │   ├── analysis.controller.ts — AI 分析生成/建议/模式/偏误/能力/反馈（最重）
│   │   │   └── progress.controller.ts — 聚合总览 + 日历数据
│   │   │
│   │   ├── services/                ── 业务逻辑层
│   │   │   ├── user.service.ts      — 用户 CRUD
│   │   │   ├── goal.service.ts      — 目标 CRUD + 状态机（ACTIVE/COMPLETED/ABANDONED...）
│   │   │   ├── plan.service.ts      — 计划 CRUD + 状态机
│   │   │   ├── review.service.ts    — 复盘 CRUD + 周/月 check 状态机
│   │   │   ├── analysis.service.ts  — AI 分析：生成报告 + 计算完成率 + 类型分发（183 行）
│   │   │   ├── bias-detection.service.ts — 7 类认知偏误检测：词典 + 正则触发 + 持久化
│   │   │   ├── capability.service.ts — 20 维能力评分 + delta 自动计算 + 批量写入
│   │   │   ├── pattern.service.ts   — 行为模式识别：bigram Jaccard 去重 + 频率 + 14天自动衰减
│   │   │   ├── signal-depth.service.ts — 8 维信号评分 + 防御扣分 + 缺口定位 + 追问方向
│   │   │   └── progress.service.ts  — 聚合 totalLifeGoals/activeYearlyGoals/calendar 等
│   │   │
│   │   ├── prompts/                 ── AI Prompt 模板（给 AI 队友用）
│   │   │   ├── system.prompt.ts     — 系统提示词：角色定义 + 核心能力 + 交互规则
│   │   │   ├── daily-review.prompt.ts — 日复盘分析指令：四层分析 + 偏误 + Fogg + 能力评分
│   │   │   ├── weekly-review.prompt.ts — 周/月复盘分析指令：聚合 + 趋势 + 外部视角
│   │   │   └── goal-setup.prompt.ts — 目标设定引导：GOAL_DECOMPOSE_TEMPLATE
│   │   │
│   │   ├── types/
│   │   │   └── structured-report.ts — StructuredReport 接口定义（94 行，完整分析报告 schema）
│   │   │
│   │   └── utils/
│   │       ├── date-validator.ts    — 日期字符串校验
│   │       ├── metric-validator.ts  — 度量类型格式校验（NUMERIC/DURATION/...）
│   │       └── string-sim.ts        — bigram Jaccard 中文文本相似度算法
│   │
│   ├── scripts/                     ── 后端工具脚本
│   │   ├── backup.ts                — 全量数据备份（所有 16 张表导出 JSON）
│   │   ├── restore.ts               — 从备份恢复数据
│   │   └── redo-analysis.ts         — 重新运行 AI 分析（指定日期范围或全部）
│   │
│   └── __tests__/
│       └── health.test.ts           — 健康检查测试（supertest）
│
├── frontend/                        ── React + Vite + TypeScript Web 仪表盘
│   ├── package.json                 — 依赖：react 19, vite 8, typescript 6
│   ├── vite.config.ts               — Vite 配置（端口 3002，API 代理到 3001）
│   ├── index.html                   — 入口 HTML
│   ├── tsconfig*.json               — TypeScript 编译配置
│   ├── eslint.config.js             — ESLint 配置
│   │
│   └── src/
│       ├── main.tsx                 — React 入口
│       ├── App.tsx                  — 根组件：三标签导航（总览|目标链|计划）
│       ├── index.css                — 全局样式
│       ├── api.ts                   — API 客户端：类型定义（User/Goal/Plan/Review 等）+ 20+ 方法
│       │
│       ├── pages/                   ── 页面组件
│       │   ├── OverviewPage.tsx     — 【总览】用户信息/人生目标/年度目标/AI建议/本周/月进度
│       │   ├── GoalsPage.tsx        — 【目标链】三级树 LifeGoal→YearlyGoal→MonthlyPlan + 筛选
│       │   └── PlansPage.tsx        — 【计划】年/月/周/日维度切换 + 日历/时间线 + 三面板
│       │
│       ├── components/              ── UI 组件
│       │   ├── Card.tsx             — 通用卡片容器
│       │   ├── ProgressBar.tsx      — 进度条（current/target）
│       │   ├── StatusBadge.tsx      — 状态标签（ACTIVE/COMPLETED/...）
│       │   ├── EmptyState.tsx       — 空状态/加载状态/错误状态 + 重试按钮
│       │   ├── UserPopover.tsx      — 右上角用户信息 hover 弹出
│       │   ├── GoalTree.tsx         — 可折叠递归目标树组件（312 行，最重）
│       │   ├── PeriodSelector.tsx   — 年/月选择器 + 维度切换（年|月|周|日）
│       │   ├── CalendarGrid.tsx     — 月视图日历网格（7 列 + 颜色编码圆点）
│       │   ├── WeekTimeline.tsx     — 周视图时间线（7 天汇总）
│       │   ├── DayTimeline.tsx      — 日视图时间线（当日计划 + 复盘）
│       │   ├── YearGrid.tsx         — 年视图 12 月网格
│       │   ├── PlanPanel.tsx        — 三面板之"计划"
│       │   ├── EvalPanel.tsx        — 三面板之"评估"（评级/完成率/AI评分）
│       │   ├── ReportPanel.tsx      — 三面板之"报告"（完成/偏差/诊断/视角）
│       │   └── StructuredReportPanel.tsx — AI 结构化分析报告渲染（290 行，最复杂组件）
│       │
│       └── styles/                  ── CSS 样式（浅色主题）
│           ├── theme.css            — CSS 变量：色板 + 字体 + 间距
│           ├── app.css              — 布局：navbar + main-content + 响应式
│           ├── overview.css         — 总览页样式（人生目标卡/进度条/AI 消息）
│           ├── goal-tree.css        — 目标树样式（筛选栏/递归节点/折叠）
│           ├── calendar.css         — 周期选择器 + 日历网格 + 视图样式
│           └── panels.css           — 三面板样式（TabBar/计划/评估/报告）
│
├── cli/                             ── CLI 终端交互工具
│   ├── growth-cli.ts                — 完整交互式 CLI：彩色菜单 + CRUD + 复盘分析（684 行）
│   ├── growth.sh                    — 启动脚本
│   └── package.json                 — 依赖：仅 tsx
│
├── bridge/                          ── 飞书机器人集成
│   ├── .env.example                 — 配置：飞书 APP_ID/APP_SECRET、用户 ID
│   ├── .gitignore                   — 忽略 sessions/ events/ *.log
│   └── auto-processor.cjs           — 飞书消息后台进程：轮询 + 去重 + 追问 + 分析（977 行）
│
├── scripts/                         ── 运维脚本
│   ├── startup.sh                   — 启动所有服务（数据库 + 后端 + Bridge + CLI 菜单）
│   ├── shutdown.sh                  — 停止所有服务
│   ├── db-backup.sh                 — 数据库备份（带时间戳）
│   ├── db-restore.sh                — 数据库恢复（选择备份文件）
│   └── pm2-ecosystem.config.cjs     — PM2 进程管理配置
│
└── docs/wiki/                       ── 项目知识库
    ├── index.md                     — 知识库导航入口（常驻加载）
    ├── api-design.md                — REST API 设计规范 + 注意事项
    ├── deployment.md                — 从零部署指南（新主机 + 新用户 + 飞书集成）
    ├── prompt-system.md             — Prompt 架构 + 分析框架 + 偏误检测说明
    ├── progress.md                  — ✅ 人生教练演进进度（每日更新）
    ├── file-structure.md            — ✅ 本文件
    └── retros/
        ├── core-goal-review-system.md       — 首版实现复盘（14 tasks）
        └── growth-miniprogram-v0.1-phase1.md — Phase 1 完整复盘（8 天）
```

## 数据流图

```
                   ┌──────────────┐
                   │   PostgreSQL  │
                   │   (端口 5434) │
                   └──────┬───────┘
                          │ Prisma
              ┌───────────┴───────────┐
              │   Express API (3001)   │
              │  7 routes → 6 service │
              └───────────┬───────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────┴────┐     ┌─────┴─────┐     ┌─────┴─────┐
   │  CLI    │     │ Web 前端  │     │ 飞书 Bridge│
   │(终端)   │     │(:3002)    │     │(后台进程)  │
   └─────────┘     └───────────┘     └───────────┘
```

## 统计数据

| 维度 | 数值 |
|------|------|
| 总文件数（不含 node_modules） | ~65 个 |
| 后端代码量 | ~2,500 行（含 schema, seed, 脚本） |
| 前端代码量 | ~2,800 行（含组件, 页面, 样式） |
| CLI 代码量 | ~680 行 |
| Bridge 代码量 | ~980 行 |
| 数据模型 | 16 张表 |
| API 路由 | 30+ 条 |
