## ADDED Requirements

### Requirement: 每次干预后自动写入效果记录
Archivist 在每次干预发送后，必须向 intervention_effectiveness_log.md 追加一条结构化记录。

#### Scenario: 自动记录
- **WHEN** Step 6 执行了干预（发送了消息）
- **THEN** Archivist 追加记录到 memories/long_term/intervention_effectiveness_log.md

### Requirement: 记录字段完整性
每条记录必须包含：date/dimension/intervention_type/what_i_said/user_response/behavior_change/effectiveness_score/notes。

#### Scenario: 记录验证
- **WHEN** 记录被写入
- **THEN** 检查全部7个字段存在，effectiveness_score 在1-5范围内

### Requirement: 分析启动条件
当记录数≥20条时，Diagnostician 在周报时分析 effectiveness_log，生成干预策略建议。

#### Scenario: 效果分析
- **WHEN** intervention_effectiveness_log.md 积累≥20条记录
- **THEN** 在 weekly_strategic_audit 中新增"干预效果分析"章节