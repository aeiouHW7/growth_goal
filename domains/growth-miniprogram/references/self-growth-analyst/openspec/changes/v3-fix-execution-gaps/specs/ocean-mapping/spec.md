## ADDED Requirements

### Requirement: OCEAN人格→能力维度映射表
big_five_ocean.md必须包含人格→能力维度映射章节。

#### 映射表

| OCEAN维度 | 正向影响能力维度 | 负向风险 |
|-----------|-----------------|---------|
| O(开放性)高 | creativity, learning, strategic_thinking | execution(想太多做太少) |
| C(尽责性)低 | execution, time_management, goal_drive | — |
| E(外向性)高 | influence, social_wisdom, leadership | self_awareness(外部验证依赖) |
| A(宜人性)高 | communication, emotional_intelligence | decision, negotiation(该强硬时软弱) |
| N(神经质)高 | — (全是负面影响) | resilience, decision, emotional_intelligence |

#### Scenario: 映射应用
- **WHEN** OCEAN评估完成（90天后）
- **THEN** 每个能力维度的system_calculated_score基于人格基线做偏移

#### 计算公式
```
system_calculated_score = 
  (capability_baseline_score × 0.7) + 
  (ocean_influence_factor × 0.3)

其中ocean_influence_factor = 
  正向维度贡献 - 负向风险惩罚
```

### Requirement: 映射表规格说明
映射表写入big_five_ocean.md但计算逻辑暂不启用。

#### Scenario: 规格说明
- **WHEN** 写入映射表
- **THEN** 注释说明：此映射表在90天数据积累后启用，当前仅作规格参考