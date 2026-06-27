## ADDED Requirements

### Requirement: communication skill_definition 完整结构
skills_library/communication/skill_definition.md 必须包含 trigger_conditions/diagnosis_flow/intervention/verification_method/escalation 五个章节。

#### Scenario: 触发条件匹配
- **WHEN** 用户输入匹配 pattern("表达不清晰自知"≥2) OR keyword(["没说清楚","没抓住重点"]≥1)
- **THEN** Step 6 加载 communication/skill_definition.md，执行 diagnosis_flow

#### Scenario: 双层诊断流程
- **WHEN** diagnosis_flow Step 1（iceberg）完成
- **THEN** 判断输出为"思维问题"或"表达技巧问题"，决定 Step 2 是否需要 fogg_model 补充

### Requirement: 升级路径
当连续3次触发但无行为改变时，escalation 触发升级问题。

#### Scenario: escalation 触发
- **WHEN** 用户第3次触发 communication 但无任何行动改变
- **THEN** Coach 输出升级问题："你到底是想改变，还是只想'知道自己有问题'就够了？"

## MODIFIED Requirements

### Requirement: 从 probes.md 升级到 skill_definition
原 skills_library/communication/communication_probes.md 升级为 skill_definition.md，trigger_conditions 必须包含 pattern+keyword 双条件。