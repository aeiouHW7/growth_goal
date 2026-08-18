# growth-miniprogram — 目标拆解与复盘系统

> 将人生目标拆解为年度、月度、每日计划，通过每日复盘 + AI 分析驱动持续成长。

## 目录

- [概述](#概述)
- [功能特性](#功能特性)
- [系统架构](#系统架构)
- [技术栈](#技术栈)
- [快速开始（新用户完整配置流程）](#快速开始新用户完整配置流程)
- [日常使用流程](#日常使用流程)
- [配置项说明](#配置项说明)
- [常见问题（FAQ）](#常见问题faq)
- [项目结构](#项目结构)
- [API 概览](#api-概览)
- [数据迁移与备份](#数据迁移与备份)
- [文档](#文档)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 概述

growth-miniprogram 是一个**个人目标管理与自我分析系统**。它帮助你：

1. **拆解目标** — 将人生愿景分解为年度量化指标 → 月度计划 → 每日待办，支持父子拆解树
2. **每日复盘** — 用自然语言记录一天的完成情况和感悟（碎碎念）
3. **AI 分析** — 对每次复盘进行结构化分析，包括洞察、完成率、偏差检测（Fogg 模型）、认知偏误、能力评分、改进建议
4. **持续改进** — 通过反馈闭环（成功案例 / 反思注入）让 AI 分析质量不断提升

系统提供**三个入口**：**📱 飞书机器人**（手机端，主入口）、**🖥️ Web 仪表盘**、**💻 终端 CLI**。三端共用同一套后端 API 与 SQLite 数据库。

---

## 功能特性

### 三端入口

| 入口 | 载体 | 定位 | 能力 |
|------|------|------|------|
| 📱 **飞书机器人** | 手机 IM | **主入口** | 发碎碎念/复盘 → 6 张分析卡片；「进度」查目标进度；「详情」重看分析；周日/月末 21:00 提醒周期总结；复盘同步 Obsidian；读取复盘日苹果日历事件作上下文 |
| 🖥️ **Web 端** | React + Vite | 全量管理 | 总览 / 目标链（层级视图 + 时间视图）/ 计划 / 档案；目标体系全量增删改（就地编辑、硬删除级联、拆子目标/设父级） |
| 💻 **CLI** | tsx 交互菜单 | 全功能 | 用户管理、目标管理、计划管理、每日复盘、进度总览、周/月复盘检查、同步今日计划 → Mac 日历 |

### 📱 飞书机器人（手机端）

飞书是日常使用的**主入口**，私聊机器人即可完成整个闭环：

- **发碎碎念即复盘** — 直接发送当天的完成情况和感悟，系统自动完成：信号深度评分 → 追问补充（不足时）→ AI 分析 → 推送 6 张分析卡片：

  | # | 卡片 | 内容 |
  |---|------|------|
  | 1 | 💡 **洞察** | 未意识到 / 模式 / 缺失（三段式） |
  | 2 | ✅ **完成** | 完成 / 未完成事项 + 完成率 |
  | 3 | 📊 **偏差 + Fogg** | 目标偏差、执行诊断（动机 M / 能力 A / 提示 P 不足） |
  | 4 | 🧠 **认知偏误** | 8 类偏误，逐条引用原文 triggerPhrase |
  | 5 | 📈 **能力评分** | 10 维度 0-10 分 + 行为证据（进步/退步/维持） |
  | 6 | 💪 **建议** | 分类型改进建议（最后一张带反馈评分） |

- **指令**：

  | 指令 | 作用 |
  |------|------|
  | `进度` | 查看年度目标进度 |
  | `详情` | 重看最近一次分析卡片 |
  | `开始` | 启动周 / 月总结分析（收到周期提醒后使用） |
  | `状态` | 查看当前复盘会话状态 |
  | `取消` | 中止当前复盘 |
  | `帮助` | 查看使用指南 |
  | `/services` `/start` `/stop` `/restart` | 查看 / 启动 / 停止 / 重启服务 |

- **周期总结提醒** — 每周日 21:00、每月最后一天 21:00 自动提醒；收到提醒后回复「开始」即生成周 / 月分析并推送卡片
- **Obsidian 同步** — 每次复盘内容同步写入 Obsidian 碎碎念目录（`OBSIDIAN_NOTES_DIR`）
- **上下文增强** — 复盘时自动读取复盘日期当天的苹果日历事件作为上下文；分析时注入历史低分反思（反思注入），持续提升分析质量

### 🖥️ Web 端

浏览器访问 `http://localhost:3002`，四个页面：

- **总览** — AI 建议摘要、人生档案摘要卡片、目标完成进度、本月进度条
- **目标链** — 目标体系核心页面，两种视图：
  - **层级视图** — 人生 → 年度 → 月度 → 日计划的父子拆解树（默认展开全部层级）
  - **时间视图** — 按年月组织，支持全量增删改
  - 目标/计划节点**就地编辑**、**硬删除级联**（删父目标 → 子目标及下级计划一并删除，删除前二次确认）、**拆子目标**（为任意节点添加下级）、**设父级**（重设 parentId，自动排除自身与后代避免成环）
- **计划** — 日 / 周 / 月 / 年维度计划查看与管理，点击日期下钻到当天日计划，支持 AI 建议月度计划
- **档案** — 人生档案（Life Archive），三层子标签：🧬 核心特质（MBTI / 盖洛普 / 大五）、📦 资源能力、🎯 未来蓝图；含能量 / 健康 / 行为记录与 AI 摘要

目标体系层级：

| 层级 | 说明 | 示例 |
|------|------|------|
| 🎯 人生目标 | 10-20 年远景，定性描述 | "成为 AI 领域的技术 leader" |
| 📊 年度目标 | 可量化指标 | "完成 3 个开源项目" |
| 📅 月度计划 | 从年度目标拆解的本月重点 | "完成项目 A 的 MVP" |
| ✅ 每日计划 | 具体可执行的今日任务 | "编写 API 文档" |

### 💻 终端 CLI

```bash
cd cli
npx tsx growth-cli.ts
```

交互菜单支持：用户信息、目标管理、计划管理、写每日复盘、进度总览、周/月复盘检查、**同步今日计划 → Mac 日历**。

### 反馈闭环

- 用户对每次 AI 分析评分（0-100）
- 高分 → 记录为成功案例
- 低分 → 触发反思记录，注入后续分析提示词，驱动改进
- 行为模式会衰减（14 天无更新自动非活跃）

---

## 系统架构

```
                    ┌──────────────────────────────────────┐
                    │          飞书 IM (消息入口)            │
                    └──────────────┬───────────────────────┘
                                   │ im.message.receive_v1
                    ┌──────────────▼───────────────────────┐
                    │       Bridge (auto-processor.cjs)     │
                    │  飞书事件消费 → API 调用 → Claude CLI  │
                    │  ├─ 发卡片 / 文本 (lark-cli)           │
                    │  ├─ 读苹果日历事件 (osascript)         │
                    │  └─ 碎碎念同步写 Obsidian              │
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
   │     │ (prisma/dev.db)│  │  (AI 分析)  │  │                     │
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
每日复盘 → 信号深度评分 → 追问补充(不足时) → AI分析 → 6 张卡片推送 → 反馈评分(成功/反思注入)
```

---

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| **前端** | React + TypeScript + Vite | 19 / 6.0 / 8.0 |
| **后端** | Node.js + Express + TypeScript | 5.x |
| **ORM** | Prisma | 6.5 |
| **数据库** | SQLite（单文件 `backend/prisma/dev.db`） | - |
| **AI 引擎** | Claude CLI (Anthropic) | latest |
| **IM 机器人** | 飞书 / @larksuite/cli（lark-cli） | latest |
| **进程管理** | PM2 | latest |
| **测试** | Jest + Supertest | 29.x |

---

## 快速开始（新用户完整配置流程）

> 照着做即可把整套系统跑起来。按需选择：**Web + CLI** 只需第 1、2 步；**飞书手机端**需完成全部步骤。

### 前置条件

- **Node.js 18+**（推荐 20+）、**npm**（随 Node.js 安装）、**Git**
- **macOS** — 飞书 Bridge（苹果日历）功能依赖 mac；如只跑 Web/CLI，Linux/Windows 亦可

### 第 1 步：数据库 / 后端（必需）

```bash
cd backend
npm install
npx prisma db push          # 初始化 SQLite 数据库（backend/prisma/dev.db）
npm run dev                 # 启动后端 → http://localhost:3001
```

> **数据库文件位置**：`backend/prisma/dev.db`（`.env` 中 `DATABASE_URL="file:./dev.db"` 以 `prisma/schema.prisma` 为基准，故实际文件在 `prisma/dev.db`）。
> **重要数据操作前先备份**：`bash scripts/db-backup.sh "备注"`（备份保存在 `backend/backups/`，保留最近 30 个）。

### 第 2 步：前端 Web 端（可选）

```bash
cd frontend
npm install
npm run dev                 # 启动前端 → http://localhost:3002
```

### 第 3 步：飞书机器人（手机端必需，较复杂）

飞书 Bridge 让你在手机上通过私聊完成复盘闭环。搭建分四部分：

**3.1 安装 lark-cli**

```bash
npm install -g @larksuite/cli
```

**3.2 创建飞书自建应用**

1. 打开[飞书开放平台](https://open.feishu.cn/)，创建**企业自建应用**
2. 拿到 `App ID` 和 `App Secret`（应用凭证 → 凭证与基础信息）
3. 在**权限管理**中开通 `im:message`（获取与发送单聊消息）等所需权限

**3.3 配置并登录 lark-cli**

```bash
lark-cli config init --new     # 会打开浏览器，粘贴 appId/secret
                               # ⚠️ 交互式命令需在前台终端运行
lark-cli auth login --recommend   # 授权用户（含 im:message 权限）
```

**3.4 飞书开放平台配置事件订阅**

1. 开放平台 → 你的应用 → 事件与回调
2. 添加事件：**`im.message.receive_v1`**（接收消息）
3. 选择**长连接**方式
4. ⚠️ 平台验证长连接时，**本地必须先跑着消费服务**（即第 3.6 步的 Bridge，或 PM2），验证才能通过

**3.5 配置 `bridge/.env`**

```bash
cd bridge
cp .env.example .env
# 编辑 .env，至少填写：
#   LARK_CLI_PATH=lark-cli
#   LARK_CLI_RUN_JS=$(npm prefix -g)/node_modules/@larksuite/cli/scripts/run.js   # 必须是绝对路径
#   USER_FEISHU_ID=ou_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx                              # 你的飞书 open_id
#   OBSIDIAN_NOTES_DIR=/绝对路径/你的Obsidian仓库/碎碎念                          # 复盘同步写入的目录
# 可选：
#   BACKEND_URL=http://localhost:3001
#   CLAUDECLI_PATH=claude
#   SESSION_DIR=./sessions
```

> 获取你的 open_id：`lark-cli auth login` 完成后输出里可查看，或在开放平台/应用调试工具中查看。

**3.6 启动 Bridge**

```bash
# lark-cli 的 bin 目录在 $(npm prefix -g)/bin，需要加入 PATH
PATH="$PATH:$(npm prefix -g)/bin" node bridge/auto-processor.cjs
```

启动成功后，在手机飞书里向你的应用（机器人）发一条复盘消息即可收到分析卡片。**推荐用 PM2 保活（见第 5 步）。**

### 第 4 步：苹果日历权限（复盘上下文）

飞书复盘时 Bridge 会读取**复盘日期**当天的苹果日历事件作为上下文。需授权：

- **macOS**：系统设置 → 隐私与安全性 → 日历 → 允许（授权给运行 Bridge 的终端 / Node）

无权限时 Bridge 自动忽略日历读取，不影响复盘主流程。

### 第 5 步：PM2 保活（可选但推荐）

后端 + Bridge 长期运行建议用 PM2 托管（根目录 `ecosystem.config.js` 已含 `growth-backend` 和 `growth-bridge`）：

```bash
pm2 start ecosystem.config.js    # 同时启动 growth-backend + growth-bridge
pm2 save                          # 保存进程列表
pm2 startup launchd               # 开机自启（按提示执行，需 sudo）
pm2 status                        # 查看状态
pm2 logs growth-bridge            # 查看日志
```

> ⚠️ **改后端代码后必须重启**：PM2 下后端以 `npx tsx` 运行（**非 watch**），代码变更不会自动重载：
> ```bash
> pm2 restart growth-backend
> ```

### 第 6 步：验证

```bash
curl http://localhost:3001/api/health
# → {"status":"ok"}
```

- Web 端：浏览器访问 **http://localhost:3002/**
- CLI：`cd cli && npx tsx growth-cli.ts`

---

## 日常使用流程

### 首次使用

```
1. 启动后端 → cd backend && npm run dev
2. 打开 Web 端 → http://localhost:3002
3. 创建目标体系：人生目标 → 年度目标 → 月度计划 → 日计划
4. 开始每日复盘（飞书发碎碎念 / Web 提交 / CLI 提交）
```

### 📱 飞书（主入口）每日工作流

```
白天：想到什么直接发给机器人（碎碎念）
晚上：发今日复盘 → 收到 6 张分析卡片 → 给最后一张卡片反馈评分
周日 21:00 / 月末 21:00：收到周期总结提醒 → 回复「开始」→ 收到周/月分析卡片
随时：「进度」查目标进度，「详情」重看分析
```

### 🖥️ Web 端

- 目标链层级视图：拆子目标 / 设父级 / 就地编辑 / 硬删除
- 目标链时间视图：按年月增删改目标与计划
- 档案：维护 MBTI / 盖洛普 / 大五等人生画像，触发 AI 摘要

### 💻 终端 CLI

```bash
cd cli
npx tsx growth-cli.ts
```

菜单：`1` 用户信息 · `2` 管理目标 · `3` 管理计划 · `4` 写每日复盘 · `5` 进度总览 · `6` 周/月复盘检查 · `7` 同步今日计划 → Mac 日历

---

## 配置项说明

| 文件 | 用途 | 关键项 |
|------|------|--------|
| `backend/.env` | 后端环境变量 | `DATABASE_URL="file:./dev.db"`, `PORT=3001`, `NODE_ENV` |
| `bridge/.env` | 飞书 Bridge 配置 | `BACKEND_URL`, `LARK_CLI_PATH`, `LARK_CLI_RUN_JS`, `USER_FEISHU_ID`, `OBSIDIAN_NOTES_DIR`, `CLAUDECLI_PATH`, `SESSION_DIR` |
| `ecosystem.config.js` | PM2 保活（根目录） | `growth-backend` + `growth-bridge` 两个 app |
| `scripts/pm2-ecosystem.config.cjs` | PM2 配置（仅 Bridge 的备选方案） | 日志路径、重启策略 |

**`bridge/.env` 关键项说明：**

| 变量 | 说明 |
|------|------|
| `LARK_CLI_PATH` | lark-cli 命令名，默认 `lark-cli` |
| `LARK_CLI_RUN_JS` | **必须填绝对路径**：`$(npm prefix -g)/node_modules/@larksuite/cli/scripts/run.js`。macOS 没有 `APPDATA` 环境变量，代码默认拼接路径会失效，故必须显式覆盖 |
| `USER_FEISHU_ID` | 接收卡片消息的飞书用户 `open_id` |
| `OBSIDIAN_NOTES_DIR` | 复盘碎碎念同步写入的 Obsidian 目录（绝对路径） |
| `BACKEND_URL` | 后端地址，默认 `http://localhost:3001` |
| `CLAUDECLI_PATH` | Claude CLI 命令名，默认 `claude` |
| `SESSION_DIR` | 会话状态目录，默认 `./sessions` |

数据库文件：`backend/prisma/dev.db`（SQLite 单文件，`.gitignore` 忽略，不随 git 同步）。

---

## 常见问题（FAQ）

**Q1：后端改了代码不生效？**
PM2 下后端以 `npx tsx` 运行（非 watch），改完必须 `pm2 restart growth-backend`。直接 `npm run dev` 是 `tsx watch` 会自动重载。

**Q2：Bridge 报错找不到 run.js / 发消息失败？**
macOS 没有 `APPDATA`，`LARK_CLI_RUN_JS` 默认路径失效。在 `bridge/.env` 里显式配置绝对路径：`LARK_CLI_RUN_JS=$(npm prefix -g)/node_modules/@larksuite/cli/scripts/run.js`。

**Q3：飞书事件订阅验证不通过？**
`im.message.receive_v1` 采用长连接方式，平台验证时需要本地消费服务正在运行（`node bridge/auto-processor.cjs` 或 PM2 里的 `growth-bridge`）。先启动 Bridge，再去开放平台点击验证。

**Q4：lark-cli 事件消费报错？**
`lark-cli event consume` 只支持 `--as bot`（机器人身份），不支持用户身份。确保启动参数为 `--as bot`。

**Q5：删除父目标会发生什么？**
**级联删除**：删除父目标会连同其下子目标及月度/日计划一并删除。Web 端删除前会二次确认并提示影响范围，请谨慎操作（重要数据前先备份）。

**Q6：复盘分析没读到苹果日历事件？**
需要在系统设置 → 隐私与安全性 → 日历 授权给运行 Bridge 的终端/Node。无权限时 Bridge 自动忽略，不影响复盘。

**Q7：端口被占用？**
```bash
lsof -ti:3001 | xargs kill -9   # 后端
lsof -ti:3002 | xargs kill -9   # 前端
```

**Q8：`MissingPrismaDependency` 错误？**
```bash
cd backend && npm install && npx prisma generate
```

---

## 项目结构

```
domains/growth-miniprogram/
├── backend/                     # Express API 服务 (3001)
│   ├── prisma/
│   │   ├── schema.prisma       # 数据库模型（13+ 表）
│   │   ├── dev.db              # SQLite 数据库文件（.gitignore 忽略）
│   │   └── seed.ts             # 种子数据
│   ├── src/
│   │   ├── index.ts            # 服务入口
│   │   ├── app.ts              # Express 应用 + 路由
│   │   ├── config/             # 环境配置
│   │   ├── middleware/          # 错误处理中间件
│   │   ├── routes/             # 路由定义（goals/plans/reviews/analysis/progress/life-archive/user/prompt）
│   │   ├── controllers/        # 控制器层
│   │   ├── services/           # 业务逻辑层（含 analysis-runner、bias-detection、capability、pattern、signal-depth 等）
│   │   ├── prompts/            # AI 提示词模板（daily/weekly/goal-decompose/goal-setup/system）
│   │   ├── types/              # TypeScript 类型定义
│   │   ├── utils/              # 工具函数（claude 调用、指标校验等）
│   │   └── __tests__/          # Jest 单元测试
│   ├── scripts/                # 备份/恢复/重分析
│   └── backups/                # 数据库备份文件（保留最近 30 个）
├── frontend/                    # React Web 仪表盘 (3002)
│   └── src/
│       ├── pages/              # 页面（总览/目标链/计划/档案）
│       ├── components/         # UI 组件（GoalTree/AISuggestModal/StructuredReportPanel 等 19+ 个）
│       └── styles/             # CSS 模块
├── bridge/                      # 飞书机器人 Bridge
│   ├── auto-processor.cjs      # 主处理器：事件消费 → 信号评分 → 追问 → AI 分析 → 6 卡片
│   ├── .env / .env.example     # Bridge 配置（含 LARK_CLI_RUN_JS / USER_FEISHU_ID / OBSIDIAN_NOTES_DIR）
│   └── sessions/               # 用户会话状态（.gitignore 忽略）
├── cli/                         # 终端 CLI
│   ├── growth-cli.ts           # 交互式菜单（用户/目标/计划/复盘/进度/周月检查/Mac 日历同步）
│   └── growth.sh               # Shell 封装
├── scripts/                     # 运维脚本
│   ├── startup.sh              # 一键启动（后端+前端）
│   ├── shutdown.sh             # 安全停止（自动备份）
│   ├── pm2-ecosystem.config.cjs # PM2 配置（备选）
│   └── db-backup.sh / db-restore.sh
├── ecosystem.config.js          # PM2 保活配置（growth-backend + growth-bridge，推荐用这个）
├── docs/wiki/                   # 文档
│   ├── index.md                # 知识库导航
│   ├── api-design.md           # API 设计说明
│   ├── prompt-system.md        # 提示词系统架构
│   ├── deployment.md           # 部署指南
│   └── ...                     # 更多专题（飞书手机报告、目标父子关系、Web 计划 CRUD 等）
├── planning/                    # 规划文档
├── openspec/                    # OpenSpec 变更记录（决策历史）
├── CLAUDE.md                   # AI 协作开发规范
├── domain.yaml                  # 项目元数据
└── README.md                   # 本文件
```

---

## API 概览

所有接口以 `/api` 为前缀，返回统一格式 `{ data: ... }` 或 `{ error: { code, message } }`。

### 用户
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/user` | 获取当前用户 |
| POST | `/api/user` | 创建用户 |

### 目标（含父子层级）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/goals/life` | 人生目标列表 |
| POST | `/api/goals/life` | 创建人生目标 |
| PUT / DELETE | `/api/goals/life/:id` | 更新 / 删除人生目标（级联） |
| GET / POST | `/api/goals/yearly` | 年度目标列表 / 创建（支持 `parentId`） |
| GET | `/api/goals/yearly/:id/children` | 某年度目标的子目标 |
| PUT / DELETE | `/api/goals/yearly/:id` | 更新（含重设 `parentId`）/ 删除（级联） |
| PATCH | `/api/goals/yearly/:id/progress` | 更新年度目标进度 |
| POST | `/api/goals/ai-suggest/yearly` | AI 建议年度目标 |
| POST | `/api/goals/ai-suggest/yearly/confirm` | 确认 AI 建议 |

### 计划
| 方法 | 路径 | 说明 |
|------|------|------|
| GET / POST | `/api/plans/monthly` | 月度计划列表 / 创建 |
| PUT / DELETE | `/api/plans/monthly/:id` | 更新 / 删除月度计划 |
| GET / POST | `/api/plans/daily` | 日计划列表 / 创建 |
| PUT / DELETE | `/api/plans/daily/:id` | 更新 / 删除日计划 |
| POST | `/api/plans/ai-suggest/monthly` | AI 建议月度计划 |

### 复盘
| 方法 | 路径 | 说明 |
|------|------|------|
| GET / POST | `/api/reviews/daily` | 每日复盘列表 / 提交 |
| POST | `/api/reviews/daily/:id/followup` | 追加追问 |
| GET | `/api/reviews/daily/:date` | 按日期获取 |
| POST | `/api/reviews/weekly` | 创建周复盘 |
| GET | `/api/reviews/weekly/check` | 检查周复盘是否已创建 |
| POST | `/api/reviews/monthly` | 创建月复盘 |

### 分析
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/analysis/generate` | 生成 AI 分析 |
| POST | `/api/analysis/run/:reviewId` | 运行分析（异步） |
| POST | `/api/analysis/signal-score` | 信号深度评分 |
| GET | `/api/analysis/reflections` | 低分反思列表（供注入） |
| GET | `/api/analysis/patterns` | 活跃行为模式 |
| GET | `/api/analysis/patterns/recurring` | 反复出现的问题 |
| GET | `/api/analysis/biases` | 已检测偏误 |
| GET | `/api/analysis/capabilities` | 能力评分基线 |
| POST | `/api/analysis/:id/feedback` | 提交分析反馈评分 |

### 进度 / 档案
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/progress/overview` | 聚合进度数据 |
| GET | `/api/progress/calendar` | 月度日历数据 |
| GET / PUT | `/api/life-archive` | 人生档案读取 / 整体更新 |
| POST | `/api/life-archive/energy` `/health` `/behavior` | 记录能量 / 健康 / 行为 |
| GET | `/api/life-archive/summary` | 人生档案 AI 摘要 |

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

> **原理**：SQLite 是单文件数据库，所有用户数据（目标、复盘、分析报告、人生档案）都存在 `dev.db` 里。拷贝它 = 全量数据迁移。不需要任何数据库工具。

### 日常备份

```bash
cd backend
bash ../scripts/db-backup.sh "备份备注"
# 备份文件保存在 backend/backups/，保留最近 30 个
```

### 恢复备份

```bash
ls backend/backups/                                   # 查看可用备份
cp backend/backups/growth-2026-01-01.db backend/prisma/dev.db   # 恢复（替换当前数据库）
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

更多专题文档见 [docs/wiki/index.md](docs/wiki/index.md)（飞书手机报告、目标父子关系、Web 计划 CRUD、数据库安全等）。

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
