# 子 Agent 委托哲学

## 背景

ACE 引擎从 ECC 复制了一批 agent 到 `agents/` 目录。本文档记录当时的决策逻辑，防止后续设计漂移。

## 核心原则

### 主 Agent vs 子 Agent 的选择标准

不是 "用子 agent 更好" 或 "用主 agent 更好"，而是**交互模式决定**：

| 特征 | 适合主 Agent | 适合子 Agent |
|------|-------------|-------------|
| 需要多轮用户对话 | ✅ | ❌ 子 agent 不能对话 |
| 需要用户中途确认/调整方向 | ✅ | ❌ |
| 决策权在用户 | ✅ | ❌ |
| 纯读代码、给结论 | ❌ (塞满上下文) | ✅ |
| 并行搜索多个方向 | ❌ (串行) | ✅ |
| 确定性任务、不需要中途干预 | ❌ | ✅ |

### 三条铁律

1. **有对话在主 agent，纯调研上子 agent** — 需要用户确认的步骤不能放进子 agent
2. **先定方向，再派侦察** — Phase 1 必须先和用户对话理清方向，再派 code-explorer 做定向侦察。禁止上来就全盘撒网
3. **子 agent 只读不写** — 分析型 agent 限制为 Read/Grep/Glob 工具，防止副作用

## ACE 的 12 个 Agents

来源：ACE 原生 4 个 + ECC 复制 8 个 + 将来可能自建

### ACE 原生（编排对话型）

| Agent | 角色 | 交互模式 |
|-------|------|---------|
| **ace-planner** | 需求 → PRD → 提案 | 主 agent 对话（3 阶段，用户确认点） |
| **ace-applier** | 逐任务实现 | 主 agent 执行（或子 agent 批量） |
| **ace-reviewer** | 代码审查 | 主 agent 执行（或子 agent 批量） |
| **ace-investigator** | 根因诊断 | 主 agent 对话 |

### ECC 复制（子 agent 型）

| Agent | 用途 | spawn 时机 | 工具 | 模型 |
|-------|------|-----------|------|------|
| **code-explorer** | 定向代码侦察 | Phase 1 方向明确后 | Read/Grep/Glob | sonnet |
| **architect** | 架构方案分析 | Phase 3 技术选型前 | Read/Grep/Glob | opus |
| **code-reviewer** | 通用代码审查 | applier 完成后 | Read/Grep/Glob/Bash | sonnet |
| **security-reviewer** | 安全漏洞扫描 | 涉及用户输入/认证/API | Read/Write/Edit/Bash/Grep/Glob | sonnet |
| **database-reviewer** | 数据库 Schema/查询优化 | 涉及迁移/SQL/RLS | Read/Write/Edit/Bash/Grep/Glob | sonnet |
| **tdd-guide** | TDD 工作流 | 新功能/修 bug/重构 | Read/Write/Edit/Bash/Grep | sonnet |
| **build-error-resolver** | 构建错误修复 | 构建/类型检查失败 | Read/Write/Edit/Bash/Grep/Glob | sonnet |
| **refactor-cleaner** | 重构清理 | 重构后清理技术债 | Read/Write/Edit/Bash/Grep/Glob | sonnet |

### 使用流程

```
Phase 1 探索:
  用户 ↔ 主 agent (对话理方向)
     → 方向明确 → spawn code-explorer (定向侦察)
     → 结果返回 → 用户 ↔ 主 agent (继续)

Phase 2 规划:
  用户 ↔ 主 agent (Grill 逐问确认)
     → 无子 agent 介入

Phase 3 提案:
  用户 ↔ 主 agent (PRD 确认)
     → 需要技术调研 → spawn architect (或并行搜集信息)
     → 主 agent 出提案 artifacts
```

## 为什么 ECC 能批量用子 agent

ECC 的 60 个 agent 全部是 spawnable sub-agent，因为它们的交互模式是 **one-shot 领域任务**：

- `code-reviewer`: 输入 git diff → 输出审查报告 → 结束
- `architect`: 输入需求 → 输出架构方案 → 结束
- `build-error-resolver`: 输入错误 → 输出修复 → 结束

没有对话、没有用户中途确认、一次调用完。ace-planner 之所以不能完全拆成子 agent，是因为它的三阶段都需要**密集对话 + 用户检查点**。

## 参考

- ECC agent 设计模式：`agents/` 目录下的每个 `.md` 文件
- 置信度过滤机制（来自 code-reviewer）：>80% 确信才报告，附报告前门检查
- AGENTS.md line 82-108：ACE 原生 agent 列表
