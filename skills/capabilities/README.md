# Capability Skills

被 Agent 通过「技能引用」节按需加载的能力 skills。每个 Skill 自包含方法论，通过 Skill Stack 声明能力依赖。

## Skills 列表

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
| **docs-extractor** | 按需 | 从代码自动生成 10_DOCS/ |
