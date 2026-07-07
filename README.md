# growth-miniprogram — 目标拆解与复盘系统

> 将人生目标拆解为年度、月度、每日计划，通过每日复盘 + AI 分析驱动持续成长。

## 目录

- [概述](#概述)
- [功能特性](#功能特性)
- [系统架构](#系统架构)
- [技术栈](#技术栈)
- [快速开始（3 分钟上手）](#快速开始3-分钟上手)
- [日常使用流程](#日常使用流程)
- [使用方式](#使用方式)
- [项目结构](#项目结构)
- [配置说明](#配置说明)
- [API 概览](#api-概览)
- [数据迁移与备份](#数据迁移与备份)
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
   │     │    SQLite     │  │  Claude CLI │  │                      │
   │     │  (dev.db)     │  │  (AI 分析)  │  │                      │
   │     └───────────────┘  └─────────────┘  │                      │
   │                                          │                      │
   │  ┌─────────────────┐  ┌──────────────┐   │                      │
   │  │  React Web 端   │  │  终端 CLI    │   │                      │
   │  │  (Vite 默认端口) │  │  (tsx)       │   │                      │
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
| **数据库** | SQLite | - |
| **AI 引擎** | Claude CLI (Anthropic) | latest |
| **IM 机器人** | 飞书 / lark-cli | latest |
| **进程管理** | PM2 | latest |
| **测试** | Jest + Supertest | 29.x |

---

## 快速开始（3 分钟上手）

### 前置条件

- **Node.js 18+**（推荐 20+）
- **npm**（随 Node.js 安装）
- **Git**

> Claude CLI 和 lark-cli 是可选依赖，AI 分析和飞书机器人功能需要它们，但 Web 端和 CLI 的基本功能不需要。

### 第 1 步：克隆并安装依赖

```bash
# 克隆项目（如果是从 monorepo 根目录克隆，需要 init submodule）
git clone <your-repo-url>
cd <project>/domains/growth-miniprogram

# 安装后端依赖
cd backend && npm install

# 安装前端依赖
cd ../frontend && npm install
```

### 第 2 步：初始化数据库

```bash
cd backend
npx prisma db push
# 成功后会创建 backend/prisma/dev.db（SQLite 数据库文件）
# 输出类似：Your database is now in sync with your schema.
```

> **数据库文件位置**：`backend/prisma/dev.db`（和 `package.json` 在同一层目录下）
> `.env` 中的 `DATABASE_URL="file:./dev.db"` 是相对于 `prisma/schema.prisma` 的路径，所以实际文件在 `prisma/dev.db`。

### 第 3 步：启动服务

**启动后端 API（必需）**：

```bash
cd backend
npm run dev
# 输出：Server running on port 3001
# ✅ API 服务就绪
```

**启动前端 Web 端（可选）**：

```bash
# 新开一个终端窗口
cd frontend
npm run dev
# 输出：VITE ready → http://localhost:3002/
# ✅ Web 仪表盘就绪
```

### 第 4 步：验证

```bash
# 检查后端是否正常运行
curl http://localhost:3001/api/health
# → {"status":"ok"}
```

### 第 5 步：打开浏览器

访问 **http://localhost:3002/**（或 Vite 分配给你的端口），即可看到 Web 仪表盘。

---

### 如果遇到问题

**端口被占用？**
```bash
# 查看端口占用
lsof -i :3001
lsof -i :3002

# 释放端口
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

**"MissingPrismaDependency" 错误？**
```bash
cd backend
npm install
npx prisma generate
```

**数据库报错？** 先检查文件是否存在：
```bash
ls -l backend/prisma/dev.db   # 应该存在
# 如果不存在：cd backend && npx prisma db push
```

---

## 日常使用流程

### 首次使用

```
1. 启动后端 → cd backend && npm run dev
2. 打开 Web 端 → http://localhost:3002
3. 创建个人目标（人生目标 → 年度目标 → 月度计划）
4. 开始每日复盘
```

### 每日工作流

```
早晨：查看今日计划 → 确认今日待办
晚上：提交每日复盘 → 查看 AI 分析报告 → 评分反馈
每周日：创建周复盘
每月初：创建月复盘
```

### 使用终端 CLI

```bash
cd cli
npx tsx growth-cli.ts
```

交互菜单支持：用户管理、目标管理、计划管理、提交复盘、查看进度。

---

## 使用方式

### 🌐 Web 仪表盘

访问 `http://localhost:3002`（或 Vite 分配的端口），提供三个核心页面：

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
│   │   ├── dev.db              # SQLite 数据库文件（.gitignore 忽略）
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
├── docker-compose.yml          # PostgreSQL 容器（已弃用，改用 SQLite）
├── CLAUDE.md                   # AI 协作开发规范
├── domain.yaml                  # 项目元数据
└── README.md                   # 本文件
```

---

## 配置说明

| 文件 | 用途 | 关键项 |
|------|------|--------|
| `backend/.env` | 后端环境变量 | `DATABASE_URL`, `PORT`（默认 3001） |
| `bridge/.env` | 飞书机器人配置 | `BACKEND_URL`, `LARK_CLI_PATH`, `CLAUDECLI_PATH` |
| `scripts/pm2-ecosystem.config.cjs` | 生产进程管理 | 服务路径、环境变量 |

数据库文件：`backend/prisma/dev.db`（SQLite 单文件）

> **前置配置**：`backend/.env` 默认无需修改即可使用 SQLite。如果你有 `.env.example`，第一次安装时复制即可：
> ```bash
> cp backend/.env.example backend/.env
> ```

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

## 数据迁移与备份

### 换电脑 / 分享给他人

本系统使用 SQLite 数据库（`backend/prisma/dev.db`），换电脑时只需拷贝这个文件：

```bash
# 旧电脑：备份数据库文件
cp backend/prisma/dev.db ~/Desktop/growth-backup.db

# 新电脑 — 首次安装后，用旧数据覆盖
cd backend
npx prisma db push                # 先创建空的 dev.db（建表）
cp ~/Desktop/growth-backup.db backend/prisma/dev.db   # 用旧数据覆盖
npm run dev                        # 启动，数据全在
```

> **原理**：SQLite 是单文件数据库，所有用户数据（目标、复盘、分析报告）都存在 `dev.db` 里。拷贝它 = 全量数据迁移。不需要任何数据库工具。

### 日常备份

```bash
cd backend
bash ../scripts/db-backup.sh "备份备注"
# 备份文件保存在 backend/backups/，保留最近 30 个
```

### 恢复备份

```bash
# 查看可用备份
ls backend/backups/

# 恢复（替换当前数据库）
cp backend/backups/growth-2026-01-01.db backend/prisma/dev.db
```

### 停止服务

```bash
bash scripts/shutdown.sh
# 会先备份数据库，再停止所有服务进程
```

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
