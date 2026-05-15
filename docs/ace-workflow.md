# ACE Workflow 架构

## 三层架构

ACE Engine 的工作流采用三层架构，参考 [everything-claude-code](https://github.com/affaan-m/everything-claude-code) 的设计理念，并融入了 Matt Pocock 的 Skills 哲学。

```
┌──────────────────────────────────────────────────────┐
│ Orchestrator（编排层）                                 │
│                                                        │
│ 主 AI 理解用户意图，根据 AGENTS.md 路由到正确 Agent     │
│ 维持会话上下文，管理状态总线                             │
│ 直接处理：归档（archive）、复盘（retro）                 │
│                                                        │
│ 入口: AGENTS.md                                        │
├──────────────────────────────────────────────────────┤
│ Agents（执行层）                                        │
│                                                        │
│ 4 个自包含 Agent，每个含完整 SOP + Gate + 技能引用：    │
│                                                        │
│   agents/ace-planner.md                                 │
│     Grill → PRD → Proposal（三阶段顺序执行）            │
│     工具: Read, Write, Edit, Grep, Glob, Bash           │
│                                                        │
│   agents/ace-applier.md                                 │
│     逐 task 实现，即时验证                              │
│     工具: Read, Write, Edit, Grep, Glob, Bash           │
│                                                        │
│   agents/ace-reviewer.md                                │
│     多维度审查 + 自动修复 + 测试验证                   │
│     工具: Read, Grep, Glob, Bash（只读）               │
│                                                        │
│   agents/ace-investigator.md                            │
│     假设驱动诊断，根因定位                              │
│     工具: Read, Grep, Glob, Bash（只读）               │
│                                                        │
│ 每个 Agent 包含：                                       │
│   - Gate: 进入前验证的事实（不依赖自我报告）              │
│   - Process: 自包含 SOP（非 thin wrapper）               │
│   - 技能引用: Skill Stack 声明依赖的能力                 │
│   - Handoff: 完成后通知编排器                            │
├──────────────────────────────────────────────────────┤
│ Skills（知识层）                                        │
│                                                        │
│ 纯知识文档，被 Agent 的「技能引用」节引用：              │
│   skills/workflow/ace-plan/SKILL.md                     │
│   skills/workflow/ace-apply/SKILL.md                    │
│   ...                                                   │
│                                                        │
│ 每个 SKILL.md 包含：                                    │
│   - 方法论 / SOP                                        │
│   - 检查清单                                            │
│   - Skill Stack（声明依赖的 capability skills）          │
└──────────────────────────────────────────────────────┘
```

## 设计继承

| 来源 | 融入理念 |
|------|---------|
| **ECC** | Self-contained agent、Skill Stack 插拔机制、置信度审查、事件总线 |
| **Matt Pocock** | Grill 先行对齐（先拷问再行动）、即时反馈循环（类型/测试/浏览器）、架构侵蚀检查、小步原子提交 |
| **ACE** | O.A.I.S 方法论、Gate 读 artifact 验证、复杂度感知（简/中/繁）、沉淀优先 |

## Workflow 流程

```
主链：
  ace-planner → ace-applier → ace-reviewer → 主 AI 归档/复盘
      ↓            ↓             ↓
   Grill+PRD    逐任务实现    审查+验证

旁路（任意时刻）：
  ace-investigator → ace-planner（修复提案）
```

### 完整流程详解

```
ace-planner
  ├── 第一阶段：探索（Explore）— 做什么（OpenSpec 姿态）
  │     自由探索，无固定步骤
  ├── 第二阶段：规划（Plan/PRD）— 详细需求（Grill + O.A.I.S）
  │     定级 → Grill 拷问 → PRD + 原型图（辩证对）→ 用户确认
  └── 第三阶段：提案（Proposal）— 技术方案
        复杂度评估 → 创建 artifacts → 提案评审

ace-applier
  └── 逐 task 循环：读需求 → 代码侦察 → 实现 → 即时验证 → 标记 → 提交

ace-reviewer
  ├── 多维度审查（正确性/安全性/可维护性/规范/架构）
  ├── 自动修复（Bash CLI）
  └── 复杂度感知验证（简单=语法/中等=单测/复杂=全量）

ace-investigator
  └── 假设驱动循环：提假设 → 验证 → 缩小范围 → 直到根因
```

## 复杂度感知

ace-planner 自动评估复杂度，决定流程深度：

| 复杂度 | 条件 | 流程 | reviewer | 验证深度 |
|--------|------|------|----------|---------|
| **简单** | 文档、typo、CSS、单字段 | planner → applier → 归档 | 跳过 | - |
| **中等** | 单文件功能、UI 组件 | planner → applier → reviewer → 归档 | 必需 | 相关单测 |
| **复杂** | 多文件、新实体、架构变更 | planner → applier → reviewer → 归档 | 必需 | 全量测试 |

## Gate 链

| Agent | Gate 验证 | 验证方法 |
|-------|----------|---------|
| ace-planner | 无硬性条件 | 自查 10_DOCS/、90_PLANNING/ |
| ace-applier | tasks.md 就绪 | 读 openspec/changes/{name}/tasks.md |
| ace-reviewer | 有实际代码变更 | git diff --name-only HEAD |
| ace-investigator | 无 | 任意时刻可用 |

Gate 不是问 AI "你完成了吗"，而是要求 AI **读文件、查 git diff、检查 artifact 是否存在**。用户可强制跳过（"强制运行"），但记录警告。

## 状态总线

每个 Agent 执行完成后 emit 事件：

```json
{"ts":"2026-05-14T10:00:00Z","stage":"ace-planner","event":"completed","change":"xxx","complexity":"复杂"}
```

事件统一写入 `.claude/state/events.jsonl`，会话结束时 flush。

## Skill Stack

每个 workflow SKILL.md 末尾的 Skill Stack 节声明依赖的 capability skills：

```markdown
## Skill Stack
| Skill | Condition | Purpose |
|-------|-----------|---------|
| dialectical-thinking | 方案对比时 | 辩证思考能力 |
```

Agent 通过「技能引用」节引用 Skill。新增 capability 只需在对应 SKILL.md 加一行，不动 agent。

## 与旧架构对比

| 维度 | 旧架构（9-Agent） | 新架构（4-Agent） |
|------|------------------|------------------|
| Agent 数量 | 9 个 thin wrapper | 4 个自包含 thick agent |
| Agent 内容 | 英文，引用 skill | 中文，完整 SOP inline |
| Skill 角色 | 被 Agent 引用的方法论 | 知识层 + Skill Stack 声明 |
| 主 AI 角色 | 纯路由 | 路由 + 直接处理 archive/retro |
| 设计影响 | 纯 ACE | ACE + ECC + Matt Pocock |
