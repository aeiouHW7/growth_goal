# ACE Engine Skills

**10 个 Skills** 覆盖项目全生命周期。

## 分类

| 分类 | 数量 | Skills |
|------|------|--------|
| **system/** | 3 | 环境、项目管理 |
| **capabilities/** | 9 | 能力 skills，被 agents 按需引用 |

---

## system/（系统管理）

- **ace-init-env** - 检查/安装 Node.js、Docker、Git
- **ace-create-project** - 生成完整项目结构
- **ace-doctor** - 环境诊断

---

## capabilities/（能力 Skills）

被 Agent 通过「技能引用」节按需加载。每个 Skill 自包含方法论，通过 Skill Stack 声明能力依赖。

| Skill | 引用方 | 用途 |
|-------|--------|------|
| **ui-prototyping** | ace-planner | 原型生成胶水层：定设计方向 → 出原型 → 质检验证 |
| **oais-prd** | ace-planner | O.A.I.S 四层 PRD 方法论（P.A.M/状态机/SECURE/自检矩阵） |
| **dialectical-thinking** | ace-planner | 辩证思考，方案对比 |
| **codebase-recon** | ace-planner, ace-applier, ace-investigator | 代码库侦察，先查再写 |
| **cross-review** | ace-reviewer, ui-prototyping | 审核引擎，自审+交叉审核 |
| **ace-archive** | 主 AI | 归档方法论 |
| **ace-retro** | 主 AI | 复盘方法论 |
| **db-schema-manager** | 按需 | 数据库 schema 基线 + 版本 SQL |
| **docs-extractor** | 按需 | 从代码生成 10_DOCS/ |

---

## 使用方式

**自然语言触发**（无需记忆命令）：

```
用户: "初始化环境"
AI:   → ace-init-env

用户: "有没有类似的实现？"
AI:   → codebase-recon

用户: "审查代码"
AI:   → ace-reviewer（agent 自动引用 cross-review skill）
```

---

## 详细文档

- [AGENTS.md](../AGENTS.md) - AI 协作指令
- [SKILLS_REFERENCE.md](../SKILLS_REFERENCE.md) - Skills 速查表
- [QUICKSTART.md](../QUICKSTART.md) - 使用示例
