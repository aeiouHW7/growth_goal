## ADDED Requirements

### Requirement: 铁律豁免声明
scoring_engine.md 备选证据章节开头必须有豁免声明。

####豁免声明格式
```
> ⚠️ **铁律豁免声明**：以下备选证据规则仅在baseline首次激活（所有维度current_score==0）时生效，是"2条证据"铁律的一次性豁免。一旦baseline脱离全0状态，立即回到主证据规则。
```

#### Scenario: 豁免触发条件
- **WHEN** scoring_engine 执行且 baseline 所有维度 current_score == 0
- **THEN** 备选证据规则生效，seeding 可以执行

#### Scenario: 豁免失效
- **WHEN** baseline 至少有一个维度 current_score > 0
- **THEN** 立即回到主证据规则（daily_raw），备选证据规则不适用

### Requirement: seeding历史标注
被seeding的评分必须标注来源。

#### Scenario: history记录
- **WHEN** seeding执行
- **THEN** history中记录 `source: "working_context_seeding"`
- **AND** 标注 `note: "铁律豁免首次激活"`