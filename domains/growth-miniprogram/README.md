# growth-miniprogram

**个人成长目标管理与 AI 复盘分析系统** —— 将年度目标拆解为可执行的月/日计划，通过 AI 驱动的高频复盘与深度分析，帮助个体识别行为模式、认知偏误和能力短板，持续迭代成长。

系统代号 **self-growth-analyst**，支持飞书 Bot 交互、终端 CLI 和 Web 仪表盘三种使用方式。

---

## 核心能力

### 1. 目标-计划-复盘 闭环
- **生命周期目标** → **年度目标** → **月度计划** → **日计划** 四层逐级拆解
- 每个层级独立状态机流转（规划中 → 进行中 → 已完成/已取消）
- 优先级标注（P0–P3）与进度追踪

### 2. AI 驱动的每日复盘分析
复盘提交后自动触发 Claude CLI 分析引擎，生成结构化报告：
- **核心洞察** — 当日关键发现总结
- **目标完成度评估** — 计划 vs 实际偏差量化
- **Fogg 行为诊断（B=MAP）** — 判断执行问题是动机/能力/提示哪个维度不足
- **偏误检测** — 8 类认知偏误自动识别（规划谬误、自利归因、确认偏误等）
- **行为模式跟踪** — 基于 Bigram Jaccard 相似度的模糊匹配，自动发现重复模式
- **能力评分** — 20 维能力框架评估（认知力、执行力、自我觉察、情商、时间管理、心理韧性等）
- **信号深度评分** — 8 维输入质量评估（行为、归因、情绪、时间、维度、潜在意图、语言温度、防御机制）
- **外部视角建议** — 跳出自我框架的第三方视角

### 3. 持续学习反馈闭环
- 用户对 AI 分析打分（0–100）
- 低分（<60）自动创建反思记录（Reflection）
- 高分（≥80）自动创建成功案例（SuccessCase）
- 行为模式 14 天无活跃自动衰减

### 4. 四种交互方式

| 方式 | 说明 |
|------|------|
| **飞书 Bot** | 飞书私聊完成复盘、查看报告、管理服务，交互式消息卡片展示 |
| **Web 仪表盘** | React 单页应用，目标树、日历热力图、月度/周/日多维度视图 |
| **终端 CLI** | 无需浏览器，命令行完成全流程操作 |
| **Claude Code 对话** | 在 Claude Code 中直接对话，由 AI 代为生成完整分析报告并写入系统 |

### 5. 多实例部署
支持同一台机器部署多个独立实例（不同飞书 Bot、不同端口映射）。

---

## 架构概览

```
┌─────────────────────────────────────────────────┐
│                  飞书 (Lark) Bot                  │
│              @你的成长助手 发送复盘                │
└──────────────────┬──────────────────────────────┘
                   │
           ┌───────▼────────┐
           │   Bridge 模块    │  消息路由、会话管理、服务启停
           │ auto-processor   │  (Node.js, 零依赖)
           └───────┬────────┘
                   │ HTTP API
           ┌───────▼────────┐
           │   Backend 模块    │  Express + Prisma + PostgreSQL
           │   :3001           │  7 路由组、30+ API 端点
           └───────┬────────┘
                   │
        ┌──────────┼──────────┬──────────────────┐
        │          │          │                  │
  ┌─────▼──┐ ┌─────▼──┐ ┌───▼────┐   ┌─────────▼─────────┐
  │Postgres│ │ Claude │ │Web     │   │  Claude Code       │
  │:5434   │ │ CLI    │ │Frontend│   │  (对话式完整分析)    │
  │  Docker│ │(AI引擎) │ │:3002   │   │  直接调用 Backend   │
  └────────┘ └────────┘ └────────┘   └───────────────────┘

  ┌──────────┐
  │Terminal  │
  │ CLI      │  独立运行，直接调用 Backend API
  └──────────┘
```

---

## 技术栈

| 模块 | 技术 |
|------|------|
| 后端 | Node.js + TypeScript + Express 5 + Prisma 6 |
| 前端 | React 19 + TypeScript + Vite 8 + 纯 CSS |
| 数据库 | PostgreSQL 15（Docker） |
| 飞书 Bot | Bridge 模块（Node.js，零 npm 依赖） |
| AI 引擎 | Claude CLI（`claude -p -` 标准输入管道） |
| CLI | TypeScript + tsx，零外部依赖 |
| 测试 | Jest + ts-jest + supertest |

---

## 模块说明

### backend — 后端 API 服务
- **端口**: 3001
- **分层**: Controller → Service → Prisma
- **关键服务**:
  - `signal-depth.service` — 信号深度评分
  - `bias-detection.service` — 认知偏误检测
  - `pattern.service` — 行为模式匹配与衰减
  - `capability.service` — 20 维能力评估
- **提示词系统**: 4 套 prompt 模板（系统角色、日复盘、周复盘、目标设定）

### frontend — Web 仪表盘
- **端口**: 3002（开发服务器，代理到 3001）
- **页面**: 总览仪表盘、目标树、多维度计划视图
- **组件**: 日历热力图、进度条、结构化报告渲染、状态徽章等 14 个组件

### bridge — 飞书消息处理器
- 单文件 `auto-processor.cjs`（~965 行），零依赖
- 订阅 `im.message.receive_v1` 事件，过滤 P2P 消息
- 会话管理、消息去重、指令解析
- 分析流水线编排：获取上下文 → 组装 prompt → 调 Claude CLI → 解析 → 持久化 → 发送卡片
- 服务守护：自动重启（指数退避）、stdin keepalive

### cli — 终端交互工具
- 彩色 ANSI 输出、输入验证、下拉菜单
- 支持目标/计划/复盘/进度查看完整 CRUD
- 可直接生成 AI 分析并评分

---

## 快速开始

### 前置条件
- Node.js 18+
- Docker Desktop 4.x
- Git Bash
- `@anthropic-ai/cli-code` 全局安装（AI 分析引擎）
- `@larksuite/cli` 全局安装（飞书 Bot，可选）

### 启动

```bash
# 1. 启动 PostgreSQL
docker compose up -d

# 2. 初始化数据库
cd backend
npx prisma db push
npx prisma db seed   # 可选：导入初始用户

# 3. 启动后端
npm run dev

# 4. 启动前端（新终端）
cd frontend
npm run dev

# 5. 启动飞书 Bridge（可选，新终端）
cd bridge
node auto-processor.cjs

# 6. 使用 CLI（可选）
cd cli
tsx growth-cli.ts
```

### 环境变量
| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接串 | `postgresql://growthuser:growthpass@localhost:5434/growth-miniprogram` |
| `PORT` | 后端端口 | `3001` |
| `USER_FEISHU_ID` | 飞书用户 ID（Bridge） | — |
| `CLAUDE_CLI_PATH` | Claude CLI 路径（Bridge） | — |

---

## 日常使用流程

### 每日操作步骤

```
写日计划（记录今天要做的事） → 提交每日复盘 → AI 分析 → 查看报告 → 评分反馈
```

### 三种操作路径对比

#### 路径 A：终端 CLI（独立运行，无需飞书）

```bash
cd cli && tsx growth-cli.ts
```

1. **菜单 3 → 日计划** — 录入今天的任务
2. **菜单 4（写每日复盘）** — 输入复盘内容（完成了什么、没完成什么、障碍、情绪等）
3. 可选补充结构化字段和追问
4. 选择"生成 AI 分析" — 提交到后端保存
5. 给分析评分（0-100）
6. **菜单 5（查看进度总览）** — 查看统计数据

> CLI 的 AI 分析为简化版，直接组装结构化数据提交，不调用 Claude CLI。

#### 路径 B：飞书 Bot（完整 AI 分析，推荐）

向飞书 Bot 发送今日复盘消息，Bot 自动完成：
1. **信号评分** — 评估输入质量（0-10），不足则追问
2. **精力诊断** — 3 问评估（睡眠、日间状态、整体感受）
3. **体态检查** — 确认是否完成体态训练
4. **调 Claude CLI** — 获取上下文（今日计划、行为模式、偏误历史、能力基线）→ 组装 prompt → 生成完整 JSON 报告
5. **写入后端** — 保存分析结果、跟踪模式、记录偏误和能力评分
6. **返回飞书交互卡片** — 包含洞察、偏差、Fogg、偏误、模式、能力、建议等完整内容
7. **评分反馈** — 回复 0-100 进行反馈

#### 路径 C：Claude Code 对话（完整 AI 分析，无需飞书）

在项目目录下启动 Claude Code 后，直接对话完成复盘：

```
你：我今天完成了XX，但没完成XX，因为遇到了XX...
Claude Code：好的，我先调后端创建复盘记录，拉取你的上下文信息...
（Claude Code 拉取今日计划、行为模式、偏误历史、能力基线）
Claude Code：根据上下文，生成完整分析报告
（Claude Code 直接生成结构化报告并写入后端 API）
```

**Claude Code 模式的优势：**
- 无需飞书 Bot 和 Bridge 模块
- 对话交互比 CLI 更自然
- AI 分析质量与飞书 Bot 一致（完整报告，含洞察、偏误、Fogg、能力评分等）
- 分析结果持久化到数据库，Web 仪表盘可查看

> 前提条件：后端服务须已启动（`docker compose up -d && cd backend && npm run dev`），确保 `localhost:3001` 可访问。

## 部署

详细部署指南见 [docs/wiki/deployment.md](docs/wiki/deployment.md)。

多实例部署：修改 `.env` 中的端口映射（PG: 5434→5435, Backend: 3001→3003），配置不同的飞书 Bot 和数据库。

---

## 知识管理

- [知识库首页](docs/wiki/index.md) — API 设计、Prompt 架构、部署指南
- [CLAUDE.md](CLAUDE.md) — ACE 工作流与开发规范
- `openspec/` — OpenSpec 变更提案
- `docs/wiki/retros/` — 阶段复盘记录

---

## 开发模式

本项目遵循 **ACE 工作流**：

```
Planner → Applier → Reviewer → Archiver → Retro
```

由 CLAUDE.md 通过 ace-* skill 自动编排，确保每次变更经过规划、实现、审查、归档、复盘完整周期。
