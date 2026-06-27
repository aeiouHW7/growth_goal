## ADDED Requirements

### Requirement: SKILL.md 互指注释
SKILL.md 开头增加：<!-- 执行规格见 core/orchestrator_prompt.md，本文件为高位描述 -->

### Requirement: orchestrator_prompt.md 互指注释
orchestrator_prompt.md 开头增加：<!-- 高位描述见 SKILL.md，本文件为精确执行规格 -->

### Requirement: 引擎列表统一
orchestrator_prompt.md 必须列出所有当前存在的引擎（不能提到不存在的东西）。

当前实际存在的引擎列表（以core/目录为准）：
- linguistic_analyzer.md, psychodynamic_engine.md, habit_behavior_engine.md
- strategic_alignment_engine.md, veracity_checker.md, auto_insight_generator.md
- scoring_engine.md, opportunity_cost_engine.md, wealth_engine.md
- exam_answer_handler.md, weekly_strategic_audit.md
- memory_retrieval.md, skill_health_checker.md

### Requirement: Step 5.5 同步
orchestrator_prompt.md 必须包含 Step 5.5 Diagnostician 融合逻辑（与SKILL.md一致）。