# growth-miniprogram — 目标拆解与复盘系统

> 将人生目标拆解为年度、月度、每日计划，通过每日复盘 + AI 分析驱动持续成长。

## 目录

- [概述](#概述)
- [功能特性](#功能特性)
- [系统架构](#系统架构)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [使用方式](#使用方式)
- [项目结构](#项目结构)
- [配置说明](#配置说明)
- [API 概览](#api-概览)
- [文档](#文档)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 概述

growth-miniprogram 是一个**个人目标管理与自我分析系统**。它帮助你：

1. **拆解目标** — 将人生愿景分解为年度量化指标 → 月度计划 → 每日待办
2. **每日复盘** — 用自然语言记录一天的完成情况和感悟
3. **AI 分析** — 对每次复盘进行结构化分析，包括完成率、偏差检测、行为模式识别、能力评分等
4. **持续改进** — 通过反馈循环让 AI 分析质量不断提升

系统提供三种交互方式：**Web 仪表盘**（React）、**终端 CLI**、**飞书机器人**（IM 消息）。

---

## 功能特性

### 目标管理

| 层级 | 说明 | 示例 |
|------|------|------|
| 🎯 人生目标 | 10-20 年远景，定性描述 | "成为 AI 领域的技术 leader" |
| 📊 年度目标 | 可量化指标，支持数值/时长/频率/百分比/阶段 | "完成 3 个开源项目" |
| 📅 月度计划 | 从年度目标拆解的本月重点 | "完成项目 A 的 MVP" |
| ✅ 每日计划 | 具体可执行的今日任务 | "编写 API 文档" |

### 复盘系统

- **每日复盘** — 自由文本记录，系统通过追问补充缺失信息（行为、归因、情绪、时间锚定等）
- **周复盘** — 聚合本周每日数据，生成周维度总结
- **月复盘** — 聚合本月数据，生成月维度总结
- **状态机** — 严格的状态流转：`INPUTTING → ANALYZING → COMPLETED`

### AI 分析引擎

每次复盘提交后，AI 生成结构化分析报告，包含：

- **完成总结** — 完成/未完成事项及完成率
- **偏差分析** — 与目标的差距及风险等级
- **执行诊断** — 基于 Fogg 行为模型（动机 × 能力 × 提示）
- **认知偏差检测** — 8 种类型（规划谬误、自我美化、基本归因错误、确认偏差、损失厌恶、现状偏差、聚类错觉、事后合理化）
- **行为模式识别** — 跨时间重复出现的问题，超过 3 次标记为模式
- **能力评分** — 10 个维度（认知、执行、自我认知、情商、时间管理等）
- **能量率** — 1-100 量表（基于睡眠、精力、情绪推断）
- **时间审计** — 增长型 / 维护型 / 消耗型分类
- **累积改进建议**

### 反馈闭环

- 用户对每次 AI 分析评分（0-100）
- 高分 → 记录为成功案例
- 低分 → 触发反思记录，驱动提示词改进
- 模式会衰减（14 天无更新自动非活跃）

### 交互方式

| 方式 | 技术 | 能力 |
|------|------|------|
| 🌐 Web 仪表盘 | React + Vite | 总览、目标链、计划管理 |
| 💻 终端 CLI | tsx 交互菜单 | 全功能操作 |
| 🤖 飞书机器人 | lark-cli + Bridge | 消息式复盘与分析推送 |

---

## 系统架构

```
                    ┌──────────────────────────────────────┐
                    │          飞书 IM (消息入口)            │
                    └──────────────┬───────────────────────┘
                                   │
                    ┌──────────────▼───────────────────────┐
                    │       Bridge (auto-processor.cjs)     │
                    │    飞书消息监听 → API 调用 → Claude   │
                    └──────────────┬───────────────────────┘
                                   │
   ┌───────────────────────────────┼───────────────────────────────┐
   │                    ┌──────────▼──────────┐                    │
   │                    │   Express API 服务   │                    │
   │                    │   (端口 3001)       │                    │
   │                    │   TypeScript + Prisma│                   │
   │                    └──────┬──────────────┘                    │
   │                           │                                   │
   │              ┌────────────┼────────────┐                      │
   │     ┌────────▼──────┐  ┌──▼─────────┐  │                      │
   │     │  PostgreSQL   │  │  Claude CLI │  │                      │
   │     │  (端口 5434)  │  │  (AI 分析)  │  │                      │
   │     └───────────────┘  └─────────────┘  │                      │
   │                                          │                      │
   │  ┌─────────────────┐  ┌──────────────┐   │                      │
   │  │  React Web 端   │  │  终端 CLI    │   │                      │
   │  │  (端口 3002)    │  │  (tsx)       │   │                      │
   │  └─────────────────┘  └──────────────┘   │                      │
   └──────────────────────────────────────────────┘
```

**核心流程：**

```
每日复盘 → 信号深度评分 → 追问补充(不足时) → AI分析 → 存储报告 → 反馈评分
```

---

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| **前端** | React + TypeScript + Vite | 19 / 6.0 / 8.0 |
| **后端** | Node.js + Express + TypeScript | 5.x |
| **ORM** | Prisma | 6.5 |
| **数据库** | PostgreSQL 15 (Docker) | 15-alpine |
| **AI 引擎** | Claude CLI (Anthropic) | latest |
| **IM 机器人** | 飞书 / lark-cli | latest |
| **进程管理** | PM2 | latest |
| **容器化** | Docker Compose | - |
| **测试** | Jest + Supertest | 29.x |
| **代码检查** | ESLint | 10.x |

---

## 快速开始

### 前置条件

- Docker Desktop 4.x+
- Node.js 18+
- Git Bash (Windows) 或 bash (Linux/Mac)
- Claude Code CLI（AI 分析功能需要）
- lark-cli（飞书机器人功能需要，可选）

### 1. 启动数据库

```bash
# 在项目根目录执行
docker compose up -d
# 启动 PostgreSQL 15，端口 5434
```

### 2. 初始化数据库

```bash
cd backend
npm install
npx prisma db push
```

### 3. 配置环境变量

```bash
# 后端配置
cp backend/.env.example backend/.env
# 编辑 backend/.env，确认 DATABASE_URL

# 飞书 Bridge 配置（可选）
cp bridge/.env.example bridge/.env
# 编辑 bridge/.env，配置 lark-cli 和 Claude CLI 路径
```

### 4. 启动服务

```bash
# 方式一：一键启动
bash scripts/startup.sh

# 方式二：分别启动
cd backend && npm run dev    # API 服务 → 端口 3001
cd frontend && npm run dev   # Web 端   → 端口 3002（可选）
```

### 5. 验证

```bash
curl http://localhost:3001/api/health
# 返回 {"status":"ok"}
```

### 更多部署细节

参见 [deployment.md](docs/wiki/deployment.md) — 包含多实例部署、生产环境配置、PM2 管理等。

---

## 使用方式

### 🌐 Web 仪表盘

访问 `http://localhost:3002`，提供三个核心页面：

- **总览** — 进度概览、最新复盘摘要、活跃模式
- **目标链** — 人生→年度→月度→每日的目标分解树
- **计划** — 日/周/月维度的计划查看与管理

### 💻 终端 CLI

```bash
cd cli
npx tsx growth-cli.ts
```

交互式菜单，支持：用户管理、目标管理、计划管理、提交复盘、查看进度。

### 🤖 飞书机器人

启动 Bridge：

```bash
cd bridge
node auto-processor.cjs
```

通过飞书私聊发送复盘消息，机器人自动完成：信号评分 → 追问 → AI 分析 → 卡片推送结果。

---

## 项目结构

```
domains/growth-miniprogram/
├── backend/                     # Express API 服务
│   ├── prisma/
│   │   ├── schema.prisma       # 数据库模型（13 个表）
│   │   └── seed.ts             # 种子数据
│   ├── src/
│   │   ├── index.ts            # 服务入口
│   │   ├── app.ts              # Express 应用 + 路由
│   │   ├── config/             # 环境配置
│   │   ├── middleware/          # 错误处理中间件
│   │   ├── routes/             # 路由定义（7 个模块）
│   │   ├── controllers/        # 控制器层（6 个模块）
│   │   ├── services/           # 业务逻辑层（9 个模块）
│   │   ├── prompts/            # AI 提示词模板
│   │   ├── types/              # TypeScript 类型定义
│   │   └── utils/              # 工具函数
│   ├── scripts/                # 备份/恢复/重分析
│   └── backups/                # 数据库备份文件
├── frontend/                    # React Web 仪表盘
│   └── src/
│       ├── pages/              # 页面（总览、目标链、计划）
│       ├── components/         # UI 组件（14 个）
│       └── styles/             # CSS 模块
├── bridge/                      # 飞书机器人
│   ├── auto-processor.cjs      # 主处理器（~965 行）
│   └── sessions/               # 用户会话状态
├── cli/                         # 终端 CLI
│   ├── growth-cli.ts           # 交互式菜单（~685 行）
│   └── growth.sh               # Shell 封装
├── scripts/                     # 运维脚本
│   ├── startup.sh              # 一键启动
│   ├── shutdown.sh             # 安全停止
│   ├── pm2-ecosystem.config.cjs # PM2 配置
│   └── db-backup.sh / db-restore.sh
├── docs/wiki/                   # 文档
│   ├── index.md                # 知识库导航
│   ├── api-design.md           # API 设计说明
│   ├── prompt-system.md        # 提示词系统架构
│   └── deployment.md           # 部署指南
├── docker-compose.yml          # PostgreSQL 容器
└── domain.yaml                  # 项目元数据
```

---

## 配置说明

| 文件 | 用途 | 关键项 |
|------|------|--------|
| `backend/.env` | 后端环境变量 | `DATABASE_URL`, `PORT` |
| `bridge/.env` | 飞书机器人配置 | `BACKEND_URL`, `LARK_CLI_PATH`, `CLAUDECLI_PATH` |
| `docker-compose.yml` | 数据库容器 | 端口 5434, 用户 `growthuser` |
| `scripts/pm2-ecosystem.config.cjs` | 生产进程管理 | 服务路径、环境变量 |

数据库默认连接：`postgresql://growthuser:growthpass@localhost:5434/growth-miniprogram`

---

## API 概览

所有接口以 `/api` 为前缀，返回统一格式 `{ data: ... }` 或 `{ error: { code, message } }`。

### 用户
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/user` | 获取当前用户 |
| POST | `/api/user` | 创建用户 |

### 目标
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/goals/life` | 人生目标列表 |
| GET | `/api/goals/yearly` | 年度目标列表 |
| PUT | `/api/goals/life/:id` | 更新人生目标 |

### 复盘
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/reviews/daily` | 每日复盘列表 |
| POST | `/api/reviews/daily` | 提交每日复盘 |
| POST | `/api/reviews/daily/:id/followup` | 追加追问 |
| POST | `/api/reviews/weekly` | 创建周复盘 |
| POST | `/api/reviews/monthly` | 创建月复盘 |

### 分析
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/analysis/generate` | 生成 AI 分析 |
| GET | `/api/analysis/patterns` | 活跃行为模式 |
| GET | `/api/analysis/patterns/recurring` | 反复出现的问题 |
| POST | `/api/analysis/:id/feedback` | 提交分析反馈评分 |

### 进度
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/progress/overview` | 聚合进度数据 |
| GET | `/api/progress/calendar` | 月度日历数据 |

完整 API 文档参见 [docs/wiki/api-design.md](docs/wiki/api-design.md)。

---

## 文档

| 文档 | 说明 |
|------|------|
| [API Design](docs/wiki/api-design.md) | 接口设计规范、错误码、注意事项 |
| [Prompt System](docs/wiki/prompt-system.md) | AI 提示词架构、分析框架、偏差检测 |
| [Deployment](docs/wiki/deployment.md) | 部署指南、多实例支持 |
| [CLAUDE.md](CLAUDE.md) | AI 协作开发规范 |

---

## 贡献指南

1. 遵循 ACE 工作流：`planner → applier → reviewer → archiver → retro`
2. 提交前运行测试：`cd backend && npm test`
3. 代码风格遵循项目已有规范
4. 涉及知识变更时更新 `docs/wiki/`

---

## 许可证

MIT

---

> 构建自愈型自我分析系统 — 让每次复盘都比上一次更有价值。
