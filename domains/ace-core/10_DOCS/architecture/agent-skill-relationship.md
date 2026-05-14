# Agent-Skill 关系

## 设计原则

**Agent 是执行者，Skill 是知识库。** 

- **Agent**（自包含）：完整 SOP inline，含 Gate、Process、技能引用、Handoff
- **Skill**（知识层）：纯知识文档，定义方法论、检查清单、Skill Stack
- Agent 不再 thin wrapper 引用 skill，而是自包含完整流程，Skill 作为深度参考和扩展能力网

参考 [everything-claude-code](https://github.com/affaan-m/everything-claude-code) 的模式：
> "When spawning subagents, always pass conventions from the respective skill into the agent's prompt."

## Agent 结构

每个 Agent 是一个自包含的 Markdown 文件：

```markdown
---
name: ace-planner
description: "规划阶段：Grill + PRD + 提案"
tools: ["Read", "Write", "Edit", "Grep", "Glob", "Bash"]
---

# ace-planner agent

角色描述（一句话）

## Gate

进入前验证的事实（读 artifact，不自我报告）

## Process

自包含 SOP：
1. **第一阶段：Explore** — 产品 + 技术探索（OpenSpec 哲学）
   - 背景对齐 → 产品探索 → 技术可行性 → 调研笔记 → 方向确认
2. **第二阶段：Plan/PRD** — 详细需求（O.A.I.S 方法论）
   - 定级 → 详细探索 → PRD 生成 → 用户确认
3. **第三阶段：Proposal** — 创建提案 artifacts
   - 复杂度评估 → openspec CLI → 辩证选型 → 评审

## 技能引用

| Skill | Condition | Purpose |
|-------|-----------|---------|
| dialectical-thinking | 方案对比时 | 辩证思考能力 |

## 输出

产出 artifact 列表

## Handoff

完成后通知编排器
```

## Agent 的作用

1. **调度** — 定义何时执行、前置条件（Gate）
2. **自包含** — 完整 SOP，不依赖外部知识文档
3. **约束工具** — 只读 Agent 没有 Write/Edit 权限
4. **扩展点** — 通过「技能引用」节加载额外能力
5. **Handoff** — 完成后编排下一步

## Skill 的作用

1. **知识** — 方法论、检查清单、模式
2. **可扩展** — 通过 Skill Stack 声明依赖
3. **可复用** — 同一 Skill 可被多个 Agent 引用
4. **轻量** — 无需修改 Agent，新增能力只需在 SKILL.md 加一行

## Skill Stack 模式

ECC 的 "Skill Stack" 模式：Skill 自身声明依赖哪些其他能力。

```
skills/workflow/ace-plan/SKILL.md
  └── Skill Stack
       ├── dialectical-thinking  (方案对比时)
       └── codebase-recon        (分析代码时)
```

**新增能力流程**：
1. 创建新的 capability skill（如 `skills/knowledge/performance-audit/SKILL.md`）
2. 在需要它的 workflow skill 的 Skill Stack 加一行
3. Agent 下次执行时通过「技能引用」自动感知

无需修改 Agent，无需修改编排器。

## Handoff 协议

每个 Agent 完成后，通知编排器进入下一阶段：

```
planner → applier → reviewer → 主 AI（archive/retro）
  ↑                              ↑
  └── 用户可选择跳过 ─────────────┘

investigator 是独立流程，不参与主链（可随时调用）
```

Handoff 消息格式：

```
"所有任务实现完成。 → 调用 ace-reviewer agent 进行代码审查"
Emit event: `{"stage": "ace-applier", "event": "completed", "change": "{name}"}`
```

## Agent 工具策略

| Agent | Tools | 理由 |
|-------|-------|------|
| ace-planner | Read, Write, Edit, Grep, Glob, Bash | 需写 PRD + 提案 artifacts |
| ace-applier | Read, Write, Edit, Grep, Glob, Bash | 需写代码 |
| ace-reviewer | Read, Grep, Glob, Bash | 只读审查，自动修复通过 Bash CLI |
| ace-investigator | Read, Grep, Glob, Bash | 只读诊断 |

## 三方哲学融合

| 维度 | ACE | ECC | Matt Pocock |
|------|-----|-----|-------------|
| Agent 形态 | 自包含 + Gate | Self-contained thick agent | Small composable skills |
| 需求阶段 | 苏格拉底对话 | - | Grill 拷问 |
| 规划方法 | O.A.I.S | - | to-prd |
| 审查 | - | 置信度过滤 | 架构侵蚀检查 |
| 诊断 | - | - | 假设驱动 diagnose loop |
| 扩展性 | Skill Stack | Skill Stack | - |
| 反馈 | - | 事件总线 | 即时验证循环 |
