## ADDED Requirements

### Requirement: 三级引擎加载策略
orchestrator_prompt.md 必须包含三级引擎加载定义。

#### L1 常驻引擎（每次碎碎念必加载）
- linguistic_analyzer.md
- auto_insight_generator.md

#### L2 触发引擎（关键词/条件命中才加载）
- habit_behavior_engine.md — "知道但不做"关键词命中
- psychodynamic_engine.md — 冰山洞穴词（老板/否定/害怕/不配）命中
- veracity_checker.md — 重大成败自述
- strategic_alignment_engine.md — 周考模式或"目标/战略/方向"关键词

#### L3 周期引擎（cron触发，不随碎碎念加载）
- scoring_engine.md — 周/月考时
- opportunity_cost_engine.md — 周日审计时
- wealth_engine.md — 月度加载
- big_five_ocean.md — 90天积累后每季度

### Requirement: 加载判断逻辑
Step 5 分析引擎调用前，先判断引擎级别和触发条件。

```
FOR each engine in 候选引擎列表:
  IF engine.tier == "L1":
    load(engine)
  ELSE IF engine.tier == "L2" AND keyword_triggered(engine):
    load(engine)
  ELSE IF engine.tier == "L3" AND (cron_triggered OR exam_mode):
    load(engine)
```

### Requirement: 上下文空间保护
L3引擎不占用日常碎碎念的上下文配额。