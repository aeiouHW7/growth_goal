# ACE Engine — AI 协作指令

> ACE Engine 的**唯一执行入口**。所有 AI 助手（Claude Code、Cursor 等）启动时必须加载本文件。
> 
> **核心哲学**: [ETHOS.md](ETHOS.md) | **快速开始**: [QUICKSTART.md](QUICKSTART.md) | **Skills 速查**: [SKILLS_REFERENCE.md](SKILLS_REFERENCE.md) ⭐

---

## 架构概览

ACE Engine 采用三层架构：

```
Orchestrator（主 AI）
  │  理解用户意图，路由到正确 agent，维持 session 上下文
  │  直接处理：归档（archive）、复盘（retro）
  │
  ├──→ ace-planner agent      规划阶段（Grill + PRD + Proposal）
  ├──→ ace-applier agent      实现阶段（逐任务执行）
  ├──→ ace-reviewer agent     审查阶段（代码审查 + 测试验证）
  └──→ ace-investigator agent 诊断阶段（根因定位）
         │
         ▼
Skills（知识层 — skills/capabilities/）
    每个 SKILL.md 包含：方法论、检查清单、Skill Stack（声明依赖的能力）
    被 agent 的「技能引用」节引用，供深度参考和扩展
```

**三层职责**：
- **Orchestrator**（主 AI）— 理解意图、路由 agent、直接处理 archive/retro、维持上下文
- **Agent**（执行层）— 自包含的 workflow 阶段，含完整 SOP、Gate、技能引用
- **Skill**（知识层）— 纯知识文档，定义方法论、模式、检查清单，不直接执行

**设计继承**：
| 来源 | 融入理念 |
|------|---------|
| **ECC** | Self-contained agent、Skill Stack 插拔、置信度审查、事件总线 |
| **Matt Pocock** | Grill 先行对齐、反馈循环验证、架构侵蚀检查、小步提交 |
| **ACE** | O.A.I.S 方法论、Gate 验证、复杂度感知、沉淀优先 |

---

## 🚀 AI 启动流程（自动执行）

**每次会话开始，AI 自动完成初始化**（用户无需触发）：

### 1. 加载全局规则

批量读取 `rules/*.md` 所有文件（辩证思考、代码质量、变更隔离等）。

### 2. 检测工作目录

```bash
pwd | grep -q "domains/" && echo "子项目" || echo "根目录"
```

- **根目录** (`/AI-Coding-Engine/`): 项目管理模式
- **子项目** (`/domains/{project}/`): 开发模式

### 3. 加载项目配置（如在子项目）

读取以下文件：
- `domain.yaml` - 项目配置
- `10_DOCS/` - 业务和技术文档
- `openspec/` - 变更提案和规格

**完成后即可响应用户消息。**

---

## 🎯 核心理念 (ETHOS)

1. **辩证思考**: 先思后行，拒绝反射式编码
2. **知识驱动**: 代码是副产品，文档和 Skills 是资产
3. **工具中立**: 不绑定特定 IDE，纯 Markdown/YAML 存储
4. **AI-First**: 用户对 AI 说话 → AI 调用 Agents → 自动化执行

详见 [ETHOS.md](ETHOS.md)

---

## 🛠 可用 Agents

### 项目管理 Agents（根目录）

用户通过**自然语言**触发，无需记忆命令。

| 用户说 | AI 调用 | 功能 |
|--------|---------|------|
| "初始化环境" | `ace-init-env` | 检查并自动安装 Node.js、Docker、Git |
| "创建项目 blog-app" | `ace-create-project` | 生成完整项目结构 |
| "检查系统健康" | `ace-doctor` | 诊断环境和配置问题 |

---

### 开发工作流 Agents（子项目）

当在 `domains/{project}/` 目录时可用。

#### 核心 Agent

| Agent | 用户说 | Gate | 输出 |
|-------|--------|------|------|
| **ace-planner** | "规划 XX" / "创建提案" | 无（可用信息自查） | PRD + 提案 artifacts |
| **ace-applier** | "实现变更" | 读 tasks.md 确认就绪 | 实现代码 |
| **ace-reviewer** | "审查代码" / "验证功能" | git diff 确认有变更 | 审查报告 + 测试结果 |
| **ace-investigator** | "调查 XX 问题" | 无（随时可用） | 诊断报告 |

#### 专业子 Agent（可 spawn）

对话型 agent 遇到以下场景时 spawn 子 agent 处理，结果返回后继续对话：

| Agent | 触发条件 | 工具 | 模型 |
|-------|---------|------|------|
| **code-explorer** | 需要深入理解现有代码实现（Phase 1 定向侦察） | Read/Grep/Glob | sonnet |
| **architect** | 架构方案对比、技术选型分析 | Read/Grep/Glob | opus |
| **code-reviewer** | 代码审查（置信度过滤，>80% 才报告） | Read/Grep/Glob/Bash | sonnet |
| **security-reviewer** | 涉及用户输入/认证/API 端点/敏感数据 | Read/Write/Edit/Bash/Grep/Glob | sonnet |
| **database-reviewer** | 编写 SQL/迁移/Schema 设计/性能优化 | Read/Write/Edit/Bash/Grep/Glob | sonnet |
| **tdd-guide** | 新功能/修 bug/重构，需要 TDD 工作流 | Read/Write/Edit/Bash/Grep | sonnet |
| **build-error-resolver** | 构建/类型检查失败 | Read/Write/Edit/Bash/Grep/Glob | sonnet |
| **refactor-cleaner** | 重构后需要清理技术债 | Read/Write/Edit/Bash/Grep/Glob | sonnet |

子 agent 委托原则详见 `10_DOCS/technical/sub-agent-delegation-philosophy.md`。

#### 复杂度感知流程

| 复杂度 | 判断条件 | Gate 要求 | 流程 |
|--------|---------|-----------|------|
| **简单** | 文档、typo、CSS、单字段、配置变更 | 无审查要求 | planner → applier → 主 AI 归档 |
| **中等** | 单文件功能、UI 组件、增量 API | applier 完成后必 reviewer | planner → applier → reviewer → 归档 |
| **复杂** | 多文件（5+）、新实体、架构变更、核心路径、数据迁移 | reviewer + 验证 + 交叉审查 | planner → applier → reviewer（含验证）→ 归档 |

**复杂度判定决策树**：
```
变更涉及什么？
├── 纯文档 / typo / 配置 → 简单
├── CSS / 样式调整 → 简单
├── 单个字段增删 → 简单
└── 代码逻辑变更 →
    ├── 单文件 & 无新依赖 → 中等
    └── 多文件 / 新实体 / 新依赖 →
        ├── 影响核心路径（认证/支付/数据）→ 复杂
        └── 不影响核心路径 →
            ├── 5 文件以内 → 中等
            └── 5 文件以上 → 复杂
```

**归档/复盘阶段**（主 AI 直接处理）：
- **归档（archive）** — 读 `skills/capabilities/ace-archive/SKILL.md` 获取方法论，归档变更到 `openspec/archive/`，沉淀知识到 `10_DOCS/`
- **复盘（retro）** — 读 `skills/capabilities/ace-retro/SKILL.md` 获取方法论，产出 W.W.L.D 复盘总结
- **归档条件**：reviewer 通过（或用户确认 Warning 归档），代码已合并到目标分支
- **复盘条件**：归档完成后自动触发；或用户显式要求

#### Agent Gate 说明

Gate 不是问 AI "你完成了吗"，而是 AI 必须**读 artifact 验证**：
- ace-planner: 自查 `10_DOCS/`、`90_PLANNING/` 判断信息充分度
- ace-applier: 读 `openspec/changes/{name}/tasks.md` 确认提案就绪
- ace-reviewer: `git diff --name-only HEAD` 确认有变更
- ace-investigator: 无 gate（任意时刻可用）

用户可强制跳过任何 gate（"强制运行"），但会记录警告。

---

### 工作流流程

```
主链：
  ace-planner → ace-applier → ace-reviewer → 主 AI 归档/复盘
      ↓            ↓             ↓
   Grill+PRD    逐任务实现    审查+验证

旁路（任意时刻）：
  ace-investigator → ace-planner（修复提案）→ ace-applier → ace-reviewer
```

**主链异常恢复**：

| 异常场景 | 处理方式 |
|---------|---------|
| applier 实现受阻（提案缺陷） | 挂起当前 task → 通知主 AI → 主 AI 评估：修改提案 / 调 investigator 分析 |
| reviewer 发现 Block 项 | 通知 applier 修复 → 修复后 reviewer 复查 |
| review 循环超过 3 轮 | 主 AI 介入决策：接受风险 / 回退 / 变更方案 |
| 用户中途变更需求 | 暂停当前流程 → 调 planner 重新评估 → 更新提案 |
| investigator 定位到非代码问题 | 输出运维/配置修复建议，不进入 applier |
| applier 单个 task 修复超 3 轮 | 标记为阻塞 → 主 AI 决策：回退该 task / 调 investigator / 修改提案 |

**完整示例（复杂变更）**：
```
用户: "规划用户积分系统"
  → ace-planner（Grill → PRD → 提案） → 用户确认

用户: "实现吧"
  → ace-applier（逐任务实现）

用户: "审查代码"
  → ace-reviewer（审查 + 测试） → 通过

主 AI:
  → 归档（openspec/archive/ + 10_DOCS/）
  → 复盘（W.W.L.D 总结）
```

---

## 📐 交互模型 (AI-First)

### AI 的领域（根目录）

用户对 AI 说话 → AI 调用 Agents → 自动化执行

### 用户的领域（子项目终端）

直接在终端执行命令：
```bash
cd domains/my-app
./start.sh           # 一键启动（自动启动 Docker + 后端 + 前端）
./status.sh          # 查看服务运行状态
pkill -f 'vite|tsx'  # 停止服务
```

---

## 📁 项目结构

```
AI-Coding-Engine/
├── agents/                    # Workflow agents（执行层）
│   │                          # ── ACE 原生（编排对话型）──
│   ├── ace-planner.md         # 规划：需求 → PRD → 提案
│   ├── ace-applier.md         # 实现：逐任务编码
│   ├── ace-reviewer.md        # 审查：代码审查 + 测试
│   └── ace-investigator.md    # 诊断：根因定位
│   │                          # ── ECC 派生（子 agent 型）──
│   ├── code-explorer.md       # 定向代码侦察（只读）
│   ├── architect.md           # 架构方案分析（只读，opus）
│   ├── code-reviewer.md       # 通用代码审查（置信度过滤）
│   ├── security-reviewer.md   # 安全漏洞扫描
│   ├── database-reviewer.md   # 数据库 Schema/查询优化
│   ├── tdd-guide.md           # TDD 工作流
│   ├── build-error-resolver.md # 构建错误修复
│   └── refactor-cleaner.md    # 重构清理
├── domains/                   # 业务项目（完全独立）
├── skills/                    # 知识层
│   ├── system/                # 系统级（环境、项目管理）
│   └── capabilities/          # 能力 skills（被 agents 按需引用）
├── rules/                     # 全局规则
├── templates/                 # 项目模板
├── docs/                      # 引擎文档
├── AGENTS.md                  # 本文件（AI 入口）⭐
├── ETHOS.md                   # 核心哲学
└── README.md                  # 用户入口
```

---

## 🔧 决策原则

1. **状态总线**: 每个 agent 执行完成后，记录事件到 `.claude/state/events.jsonl`，会话结束时 flush
2. **冷热分离**: `10_DOCS/raw` 仅供读取参考，`10_DOCS/wiki` 才是知识的最终归宿
3. **Gate 优先**: 进入每个 stage 前，必须按 Gate 要求验证事实，不依赖自我报告
4. **沉淀优先**: 能沉淀为 10_DOCS 或 Skills 的方案优先
5. **规范驱动**: 有规范遵循规范，无规范先建规范
6. **Knowledge first**: 做事前先查 `skills/` 和 `10_DOCS/`
7. **最小惊讶**: 遵循项目已有的编码模式
8. **验证闭环**: 任何代码变更必须有可执行的验证

---

## 🆘 故障排除

| 问题 | 解决方案 |
|------|---------|
| 环境检查失败 | 对 AI 说："初始化环境"（自动安装缺失工具） |
| 项目启动失败 | 检查 Docker 是否运行：`docker ps` |
| 服务状态不明 | 运行 `./status.sh` 查看所有服务状态 |
| 端口冲突 | 修改 `.env` 中的 `DB_PORT` |


**开始使用**: 对 AI（Claude Code/Cursor）说："初始化环境"
