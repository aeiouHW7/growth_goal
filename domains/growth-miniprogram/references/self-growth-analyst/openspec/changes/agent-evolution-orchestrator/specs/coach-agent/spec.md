## ADDED Requirements

### Requirement: Coach Agent 管理动态 Skills Library
Coach Agent SHALL 管理升级后的 Skills Library，每个 Skill 是"触发→诊断→干预→追踪"的闭环脚本，不只是问题列表。

#### Scenario: Skill 触发判断
- **WHEN** 用户输入触发某维度的 `trigger_conditions`
- **THEN** Coach 加载对应的 `skills_library/<dimension>/skill.yaml`，执行 `diagnosis_flow`

### Requirement: Coach Agent 生成可执行干预
Coach Agent SHALL 在每次干预时生成具体可执行的"微小行动"（micro-action），不是泛泛的建议。

#### Scenario: 决策力干预
- **WHEN** 诊断结果为"决策冲动"
- **THEN** Coach 输出："本周遇到抉择时，先找一个人问'反对意见'，花5分钟听完再决定"

### Requirement: Coach Agent 追踪干预效果
Coach Agent SHALL 在生成干预后，更新 `memories/.orchestrator_state.json` 中的 `pending_actions`，在下一次观察时检查该行动是否被执行。

#### Scenario: 行动追踪
- **WHEN** Coach 生成了干预行动"今天做10个俯卧撑"
- **THEN** 在 `.orchestrator_state.json` 的 `pending_actions` 中记录，并在下次碎碎念时检查执行情况

### Requirement: Coach Agent 管理保护模式
Coach Agent SHALL 在保护模式激活期间，只输出保护性内容，不执行常规诊断流程，不触发深度追问。

#### Scenario: 保护模式
- **WHEN** Observer 标记输入为 `urgent`
- **THEN** Coach 加载 `rules/intervention_rules.md` 中的保护模式回复模板，输出保护性内容后退出