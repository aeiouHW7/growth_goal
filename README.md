# ACE Engine

知识驱动的 AI 辅助开发引擎。

## 它解决什么问题？

AI 编程有几个典型失败模式：

1. **猜测式编码** — AI 不看现有代码就写新代码，产出与项目风格不一致
2. **知识蒸发** — 每次对话从零开始，上次的决策、教训全部丢失
3. **流程失控** — 没有审查、没有归档，bug 修完就忘，同样的坑反复踩
4. **配置漂移** — AI 随手改 eslint/tsconfig，破坏团队约定

ACE 的解法：用结构化的工作流 + 知识沉淀 + 自动化护栏，让 AI 像一个遵守纪律的工程师一样工作。

## 30 秒上手

```bash
# 1. 在任意项目目录下
/ace-init

# 2. 告诉 AI 你想做什么
"规划一个用户积分系统"

# 3. AI 自动走完整流程
#    planner（规划）→ applier（实现）→ reviewer（审查）→ archiver（归档）→ retro（复盘）
```

## 工作流

```
主链：
  ace-planner → ace-applier → ace-reviewer → ace-archiver → ace-retro
      │            │             │              │            │
   Grill+PRD    逐任务实现    审查+验证      归档+沉淀    W.W.L.D复盘

旁路（任意时刻）：
  ace-investigator → 诊断根因 → 回到主链
```

每个阶段有 Gate（前置条件验证），复杂度决定必须走哪些阶段：
- **简单**（文档/typo/配置）— planner → applier → 归档
- **中等**（单文件功能/UI 组件）— 加 reviewer
- **复杂**（多文件/新实体/架构变更）— 全链路 + 交叉审查

## 项目结构

```
AI-Coding-Engine/
├── .claude/                       # 注册表（告诉 Claude Code 什么能力可用）
│   ├── skills/                    # 8 个 skill stub（用户说关键词触发）
│   ├── commands/                  # 4 个 slash command（/ace-init 等）
│   ├── settings.json              # hooks 注册 + 项目配置
│   └── memory/                    # auto-memory（跨会话记忆）
│
├── agents/                        # 执行层（被 skill stub 引用的完整实现）
│   ├── ace-{planner,applier,      # 6 个核心 workflow agent
│   │   reviewer,archiver,
│   │   retro,investigator}.md
│   └── {code-explorer,architect,  # 8 个子 agent（由父 agent spawn）
│       code-reviewer,...}.md
│
├── skills/capabilities/           # 知识层（方法论、检查清单，被 agent 按需读取）
│   ├── codebase-recon/            # 代码库侦察
│   ├── dialectical-thinking/      # 辩证思考
│   ├── oais-prd/                  # O.A.I.S PRD 方法论
│   └── ...
│
├── scripts/hooks/                 # 8 个自动化护栏
│   ├── config-protection.cjs      # 阻止修改 eslint/tsconfig 等配置
│   ├── foreground-server-block.cjs # dev server 必须在 tmux 中运行
│   ├── no-skip-hooks.cjs          # 阻止 --no-verify
│   ├── post-edit-typecheck.cjs    # 编辑 .ts 后自动类型检查
│   ├── post-edit-format.cjs       # 编辑后自动格式化
│   ├── pre-commit-quality.cjs     # commit 前检查 console.log/debugger/secrets
│   ├── read-before-write.cjs      # 提醒先读后写
│   └── workflow-guard.cjs         # 新建业务文件时提醒先走 planner
│
├── rules/                         # 编码和系统规则
├── docs/                          # 经验文档和参考
├── domains/                       # 业务项目（每个项目独立管理）
│   └── todo-app/                  # 示例项目（引擎的练兵场）
│
├── AGENTS.md                      # AI 操作手册（Claude Code 启动时加载）
├── ETHOS.md                       # 核心哲学
└── README.md                      # 本文件
```

## `.claude/` 注册模型

什么时候需要放到 `.claude/` 里？

| 类型 | 路径 | 用途 | 内容 |
|------|------|------|------|
| Skill | `.claude/skills/{name}/SKILL.md` | 用户说关键词触发 | 短 stub，指向 `agents/*.md` |
| Command | `.claude/commands/{name}.md` | 用户输入 `/{name}` 触发 | 自包含的完整指令 |
| Settings | `.claude/settings.json` | hooks + 项目配置 | JSON 配置 |

什么不需要放？

- `agents/*.md` — 被 skill stub 引用的完整实现，不需要额外注册
- `skills/capabilities/` — 纯知识文档，被 agent 按需 `Read`
- `scripts/hooks/*.cjs` — 被 settings.json 引用即可

**一句话总结**：`.claude/` = 注册表（Claude Code 能发现什么），其余目录 = 实现（被注册表引用的内容）。

## 设计原则

1. **拿来主义** — 优先从 ECC、Matt Pocock 等成熟实践中忠实移植，不自创
2. **以终为始** — 从用户旅程（"我想做 XX"）反推需要什么能力
3. **Adapter Pattern** — 声明引用外部 skill，不复制内容到本地
4. **知识复利** — 代码是副产品，结构化的知识文档和方法论才是核心资产

详见 [ETHOS.md](ETHOS.md)

## 速查索引

### Commands

| 命令 | 功能 |
|------|------|
| `/ace-init` | 初始化新项目（环境检测 + 目录结构 + domain.yaml） |
| `/ace-status` | 查看服务状态面板（端口检测 + 进程状态） |
| `/ace-handoff` | 生成交接文档（当前阶段、进度、未完成决策） |
| `/ace-generate` | 从 domain.yaml 生成项目配置 |

### Hooks（自动触发）

| Hook | 时机 | 行为 |
|------|------|------|
| config-protection | Edit/Write 配置文件 | 阻止修改 |
| foreground-server-block | Bash 运行 dev server | 要求使用 tmux |
| no-skip-hooks | Bash 含 --no-verify | 阻止 |
| post-edit-typecheck | Edit/Write .ts/.tsx | 自动 tsc --noEmit |
| post-edit-format | Edit/Write 代码文件 | 自动 prettier/biome |
| pre-commit-quality | Bash git commit | 检查代码质量 |
| read-before-write | Write 已有文件 | 提醒先读 |
| workflow-guard | Write 新业务文件 | 提醒先走 planner |

## 许可证

MIT
