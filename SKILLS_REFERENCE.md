# Skills 速查表

**Skills 是 ACE Engine 的知识层（Knowledge Layer）**。Workflow 的执行通过 `agents/` 中的 Agent 完成，每个 Agent 自包含完整 SOP，通过「技能引用」节声明对能力 skills 的需求。

> 参见 [AGENTS.md](AGENTS.md) 了解 Agent 路由和 Gate 机制。

---

## 项目管理 Skills（根目录使用）

| Skill | 触发 | 作用 | 输出 |
|-------|------|------|------|
| **ace-init-env** | "初始化环境" | 检查/安装 Node/Docker/Git | 环境报告 |
| **ace-create-project** | "创建项目 X" | 生成完整项目结构 | domains/X/ |
| **ace-doctor** | "检查系统健康" | 环境诊断 | 问题报告 |

---

## 能力 Skills（子项目使用，`skills/capabilities/`）

### Agent → Skill 映射

| Agent | Skill 引用 | Skill 用途 |
|-------|-----------|-----------|
| ace-planner → | ui-prototyping | 原型生成 + 设计质检 |
| ace-planner → | oais-prd | O.A.I.S 四层 PRD 方法论 |
| ace-planner → | dialectical-thinking | 方案对比、辩证分析 |
| ace-planner → | codebase-recon | 代码库侦察 |
| ace-applier → | codebase-recon | 编码前代码侦察 |
| ace-reviewer → | cross-review | 交叉审查能力 |
| ace-investigator → | codebase-recon | 问题排查侦察 |
| 主 AI → | ace-archive | 归档方法论 |
| 主 AI → | ace-retro | 复盘方法论 |

### Skill Stack（能力引用网）

| 源 Skill | 依赖 Skill | 条件 |
|----------|-----------|------|
| ui-prototyping | dialectical-thinking, codebase-recon, cross-review | 风格选型/查已有规范/原型审查时 |
| oais-prd | — | 自包含（含自检矩阵） |
| codebase-recon | — | 自包含 |
| cross-review | — | 自包含 |
| dialectical-thinking | — | 自包含 |

### 其他能力 Skills

| Skill | 作用 | 使用场景 |
|-------|------|---------|
| **db-schema-manager** | 数据库 schema 管理 | 初始化数据库文档、版本 SQL 管理 |
| **docs-extractor** | 文档提取 | 从代码自动生成 10_DOCS/ |

---

## 复杂度分类（ace-planner 自动评估）

| 复杂度 | 判断条件 | 必需流程 | 可跳过 |
|--------|---------|---------|--------|
| **简单** | 文档、typo、CSS、单字段 | planner → applier → 归档 | reviewer |
| **中等** | 单文件功能、UI 组件 | planner → applier → reviewer | 无 |
| **复杂** | 多文件、新实体、架构变更 | planner → applier → reviewer（含验证） | 无 |

---

## 快速决策树

```
需求不清晰？ → ace-planner（Explore → Grill → PRD → 提案）
需求清晰？   → ace-planner（直接提案或"跳过规划直接实现"）
功能实现？   → ace-applier
审查代码？   → ace-reviewer
功能异常？   → ace-investigator（诊断）→ ace-planner（修复提案）
归档变更？   → 主 AI 直接处理（读 ace-archive skill）
复盘总结？   → 主 AI 直接处理（读 ace-retro skill）
```

---

## 状态日志

每个 Agent 执行完成后记录事件到 `.claude/state/events.jsonl`，会话结束时 flush。

```json
{"ts":"...","stage":"ace-planner","event":"completed","change":"add-auth","complexity":"复杂"}
```

---

## 示例

### 标准流程（中等复杂度）

```
用户: "规划健康检查功能"
  → ace-planner（Grill → PRD + 原型 → 提案，评估：中等）
用户: "实现"
  → ace-applier（逐任务实现）
用户: "审查代码"
  → ace-reviewer（审查 + 测试）
主 AI:
  → 归档（openspec/archive/ + 10_DOCS/）
```

### 复杂需求

```
用户: "规划用户积分系统"
  → ace-planner（Grill → L3 PRD + 原型 → 提案）
用户: "实现"
  → ace-applier
用户: "审查"
  → ace-reviewer（审查 + 全量测试）
主 AI:
  → 归档
  → 复盘（W.W.L.D）
```

### 故障排查

```
用户: "调查 API 500 错误"
  → ace-investigator（定位根因）
  → ace-planner（创建修复提案）
  → ace-applier（实现修复）
  → ace-reviewer（验证修复）
```

### 快速变更（用户跳过审查）

```
用户: "把按钮颜色改成蓝色，直接改不用审查"
  → ace-planner（L1 提案）
  → ace-applier（实现）
主 AI:
  → 归档
```

---

**快速参考**：打开此文件即可查看所有 Skills 的触发方式和使用场景。

**详细文档**：
- [AGENTS.md](AGENTS.md) — Agent 路由和 Gate 机制
- [QUICKSTART.md](QUICKSTART.md) - 详细示例
