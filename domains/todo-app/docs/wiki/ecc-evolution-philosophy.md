# ECC 进化哲学参考

> 来源：`.tmp/references/everything-claude-code/`，2026-05-16 提炼

## 核心进化模式

### 1. Instinct Evolution Pipeline (continuous-learning-v2)

最显式的进化机制：

```
Observations (raw session data)
  → Instincts (atomic learned behaviors, confidence 0.3~0.9)
    → Evolution (/evolve command)
      → Skills (auto-triggered)
      → Commands (user-invoked)
      → Agents (complex multi-step)
```

**置信度级别：**
- 0.3 = Tentative（建议但不强制）
- 0.5 = Moderate（相关时应用）
- 0.7 = Strong（自动批准）
- 0.9 = Near-certain（核心行为）

置信度通过重复观察 + 无用户纠正递增，用户纠正或矛盾证据时递减。

### 2. Skill Maturity Tiers (SKILL-PLACEMENT-POLICY.md)

四层成熟度：
1. **Evolved** — 从聚类本能自动生成
2. **Learned** — 自动生成，仅本地
3. **Imported** — 外部引入，仅本地
4. **Curated** — 发布、验证、规范化

### 3. Knowledge Compounding (ETHOS.md / longform-guide)

> "Early on, I spent time building reusable workflows/patterns. Tedious to build, but this had a wild compounding effect." — @omarsar0

结构化知识是增值资产，代码是短暂副产品。

### 4. Evolutionary Architecture

> "The lowest-risk migration path is evolutionary, not a rewrite."

架构通过增量进化成熟，不重写。

## ACE 如何应用

| ECC 概念 | ACE 对应 | 状态 |
|----------|---------|------|
| Instinct Evolution | retro → wiki 沉淀 | 手动版，无自动置信度 |
| Skill Maturity | skills/system vs skills/capabilities | 隐式分层 |
| Knowledge Compounding | docs/wiki/ + openspec/ | 已落地 |
| Evolutionary Architecture | domain.yaml 驱动增量演进 | 进行中 |
| /evolve | 无对应 | 可作为未来 ace-evolve 的灵感 |

## 对启停脚本的启示

1. **先观察再抽象** — 不急于做"通用脚本引擎"，先让 todo-app 的三件套跑通
2. **置信度递增** — 第一个项目的脚本是 Tentative，多项目验证后再提升为模板
3. **进化路径** — 硬编码脚本 → 配置驱动脚本 → domain.yaml lifecycle 字段 → ace-generate 自动生成
