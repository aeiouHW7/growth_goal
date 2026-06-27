## ADDED Requirements

### Requirement: Cognitive Bias Log 追踪思维偏误
`memories/cognitive_bias_log.md` SHALL 长期追踪用户反复出现的思维偏误，作为比维度评分更底层的根因分析数据。

#### Scenario: 偏误识别和记录
- **WHEN** Analyst Agent 识别到用户出现偏误（如"计划谬误"、"损失厌恶"、"基本归因错误"）
- **THEN** Archivist 在 `cognitive_bias_log.md` 追加新条目，包含日期、偏误类型、具体证据、严重程度

### Requirement: 偏误条目结构
每个偏误条目 SHALL 包含：识别日期、偏误类型（使用标准认知心理学分类）、原文证据（引用）、触发次数、严重程度（low/medium/high）。

#### Scenario: 偏误条目格式
- **WHEN** Archivist 记录偏误
- **THEN** 条目格式：
```markdown
### [YYYY-MM-DD] 偏误类型
- **证据**: "用户原文"
- **触发次数**: N
- **严重程度**: medium
- **分析**: 为什么这是该偏误
```

### Requirement: 偏误驱动干预
Coach Agent SHALL 在生成干预时查询 `cognitive_bias_log.md`，当某偏误触发次数≥3时，在干预中直接点出该偏误名称。

#### Scenario: 偏误干预
- **WHEN** 用户第3次出现"事后合理化"偏误
- **THEN** Coach 在干预时说："你又在用'当时只能那样做'来回避复盘。这是事后合理化偏误，你今天能做的是什么？"

### Requirement: 偏误进化追踪
偏误记录 SHALL 包含"最后发生日期"和"本周是否出现"，用于判断偏误是在改善还是固化。

#### Scenario: 偏误改善追踪
- **WHEN** 某偏误30天未触发
- **THEN** 在该偏误条目中标记 `[改善中]`；当偏误频率上升时标记 `[恶化]`