# ACE Engine Skills 架构

**变更**: ace-engine-skills-adaptation  
**日期**: 2026-05-12 | **更新**: 2026-05-14（适配 4-Agent 架构）

## 架构概览

Skills 是 ACE Engine 的**知识层**，被 Agents（执行层）引用。每个 Agent 自包含完整 SOP，通过「技能引用」节声明需要哪些 Skill。

```
Orchestrator（主 AI）
  │
  ├── ace-planner agent    → 引用: ace-explore, ace-plan, ace-propose
  ├── ace-applier agent    → 引用: ace-apply
  ├── ace-reviewer agent   → 引用: ace-review, ace-verify
  └── ace-investigator agent → 引用: ace-investigate

  主 AI 直接引用: ace-archive, ace-retro
```

## Skills 能力网（Skill Stack）

每个 SKILL.md 末尾的 **Skill Stack** 节声明它依赖哪些能力技能：

| 源 Skill | 依赖 Skill | 条件 |
|----------|-----------|------|
| ace-plan | dialectical-thinking, codebase-recon | 方案对比/分析代码时 |
| ace-propose | dialectical-thinking | 技术选型时 |
| ace-apply | codebase-recon | 处理陌生代码时 |
| ace-review | cross-review | 需要第二意见时 |
| ace-investigate | codebase-recon | 排查问题时 |

新增能力只需在对应 SKILL.md 加一行，不动 agent。

## 流程守卫

### 复杂度分类

**简单**（文档、typo、配置）:
```
ace-planner → ace-applier → 主 AI 归档
```

**中等**（单文件功能、UI 组件）:
```
ace-planner → ace-applier → ace-reviewer → 主 AI 归档
```

**复杂**（多文件、架构、数据库）:
```
ace-planner → ace-applier → ace-reviewer（含全量测试）→ 主 AI 归档
```

### Gate 机制

| Agent | Gate | 验证方式 |
|-------|------|---------|
| ace-planner | 无硬性条件 | 自查 10_DOCS/、90_PLANNING/ |
| ace-applier | tasks.md 就绪 | 读 openspec/changes/{name}/tasks.md |
| ace-reviewer | 有实际变更 | git diff --name-only HEAD |
| ace-investigator | 无（随时可用） | - |

Gate 不依赖 AI 自我报告，要求读 artifact 验证。

## 状态日志

执行完成后记录事件到 `.claude/state/events.jsonl`：

```json
{"ts":"...","stage":"ace-planner","event":"completed","change":"add-auth","complexity":"复杂"}
```

## 更新记录

| 日期 | 变更 |
|------|------|
| 2026-05-12 | 初始版本（9-Skill 模型） |
| 2026-05-14 | 适配 4-Agent 架构，Skill 作为知识层独立存在 |
