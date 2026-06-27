# ACE Engine — AI 协作指令

> 所有 AI 助手启动时加载本文件。核心哲学见 [ETHOS.md](ETHOS.md)。

## 核心原则

1. **先读后写** — 修改代码前先读完整文件，查知识库
2. **Gate 优先** — 进入每个阶段前读 artifact 验证前置条件，不依赖自我报告
3. **知识复利** — 做完就沉淀，同样的问题不推导两次
4. **最小惊讶** — 遵循项目已有的编码模式
5. **验证闭环** — 任何代码变更必须有可执行的验证

## 工作流

```
主链：
  ace-planner → ace-applier → ace-reviewer → ace-archiver → ace-retro

旁路：
  ace-investigator → 诊断根因 → 回到主链
```

复杂度决定必须走哪些阶段：

| 复杂度 | 判断条件 | 必经阶段 |
|--------|---------|----------|
| 简单 | 文档/typo/配置/CSS/单字段 | planner → applier → 归档 |
| 中等 | 单文件功能/UI 组件/增量 API | + reviewer |
| 复杂 | 多文件(5+)/新实体/架构变更/核心路径 | + 验证 + 交叉审查 |

## Agent 路由

用户说什么 → 触发哪个 agent：

| 用户意图 | Agent | Gate |
|---------|-------|------|
| "规划 XX" / "创建提案" | ace-planner | 无 |
| "实现变更" / "做吧" | ace-applier | 读 tasks.md 确认就绪 |
| "审查代码" / "review" | ace-reviewer | git diff 确认有变更 |
| "归档" | ace-archiver | reviewer 通过 |
| "复盘" / "retro" | ace-retro | 建议已归档 |
| "调查 XX 问题" | ace-investigator | 无（随时可用） |
| "复盘" / "帮我分析" / "我今天..." | coach | 日常复盘分析 |
| "教练" / "我有个想法" / "我想..." | coach | 目标拆解、教练对话 |
| "我的目标" / "进度" / "帮我看看" | coach | 进度查询和指导 |

Gate 不是问 AI "你完成了吗"，而是**读 artifact 验证事实**。用户可强制跳过（"强制运行"）。

## 子 Agent 委托

核心 agent 遇到以下场景时 spawn 子 agent，结果返回后继续：

| 子 Agent | 触发条件 | 模型 |
|----------|---------|------|
| code-explorer | 需要深入理解现有代码 | sonnet |
| architect | 架构方案对比/技术选型 | opus |
| code-reviewer | 代码审查（置信度>80%才报告） | sonnet |
| security-reviewer | 用户输入/认证/API/敏感数据 | sonnet |
| database-reviewer | SQL/迁移/Schema/性能 | sonnet |
| tdd-guide | 新功能/修 bug 需要 TDD | sonnet |
| build-error-resolver | 构建/类型检查失败 | sonnet |
| refactor-cleaner | 重构后清理技术债 | sonnet |

## Commands

| 命令 | 功能 |
|------|------|
| `/ace-init` | 初始化新项目 |
| `/ace-status` | 服务状态面板 |
| `/ace-handoff` | 生成交接文档 |
| `/ace-generate` | 从 domain.yaml 生成配置 |

## Hooks（自动触发）

8 个护栏注册在 `.claude/settings.json`：

- **PreToolUse**: config-protection, read-before-write, workflow-guard, no-skip-hooks, foreground-server-block, pre-commit-quality
- **PostToolUse**: post-edit-typecheck, post-edit-format

## `.claude/` 注册模型

```
.claude/skills/{name}/SKILL.md  → 用户说关键词触发（短 stub → agents/*.md）
.claude/commands/{name}.md      → 用户输入 /{name} 触发（自包含指令）
.claude/settings.json           → hooks + 项目配置

agents/*.md                     → 完整实现（被 skill stub 引用）
skills/capabilities/            → 知识文档（被 agent 按需 Read）
scripts/hooks/*.cjs             → 被 settings.json 引用
```

## 项目结构

```
AI-Coding-Engine/
├── .claude/
│   ├── skills/            # 8 个 skill stub
│   ├── commands/           # 4 个 slash command
│   ├── settings.json       # hooks 注册
│   └── memory/             # auto-memory
├── agents/                 # 6 核心 + 8 子 agent
├── skills/capabilities/    # 6 个知识 skill
├── scripts/hooks/          # 8 个自动化护栏
├── rules/                  # 编码和系统规则
├── docs/                   # 经验文档
├── domains/                # 业务项目
│   └── todo-app/           # 示例项目
├── AGENTS.md               # 本文件
└── ETHOS.md                # 核心哲学
```

## 异常恢复

| 异常 | 处理 |
|------|------|
| applier 受阻 | 挂起 task → 评估：修改提案 / 调 investigator |
| reviewer 发现 Block | applier 修复 → reviewer 复查 |
| review 循环 >3 轮 | 介入决策：接受风险 / 回退 / 变更方案 |
| 单 task 修复 >3 轮 | 标记阻塞 → 回退 / 调 investigator / 修改提案 |

## 双角色说明

本项目同时支持两个角色：

1. **ACE 开发引擎**（默认）— 帮你开发/维护项目代码，走 planner→applier→reviewer 工作流
2. **人生教练**（`agents/coach.md`）— 帮你管理人生目标、复盘分析、教练指导

当用户聊个人生活、目标、复盘、想法时 → 走 coach 角色
当用户聊代码、开发、实现时 → 走 ACE 角色
