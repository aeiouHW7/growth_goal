## ADDED Requirements

### Requirement: Orchestrator 是系统中心调度层
Orchestrator SHALL 作为中心调度引擎，串联 Observer/Analyst/Coach/Archivist 四个逻辑模块，处理所有用户输入并决定系统响应。

#### Scenario: 碎碎念输入完整闭环
- **WHEN** 用户发送碎碎念
- **THEN** Orchestrator 按顺序执行：感知分类→记忆更新→模式分析→诊断决策→干预行动→闭环追踪

#### Scenario: 紧急触发判断
- **WHEN** 用户输入包含极端情绪或自我伤害信号
- **THEN** Orchestrator 立即触发保护模式，跳过常规调度，直接输出保护性回复

#### Scenario: 非紧急情况只记录
- **WHEN** 用户输入为普通碎碎念，无紧急触发条件
- **THEN** Orchestrator 仅执行观察者写入和微反馈，不触发深度干预

### Requirement: Orchestrator 维护调度状态
Orchestrator SHALL 在每次处理后更新 `memories/.orchestrator_state.json`，记录当前周期状态、下次待检事项、待追踪项。

#### Scenario: 状态持久化
- **WHEN** Orchestrator 完成一次完整处理
- **THEN** 更新 `.orchestrator_state.json` 中的 `last_cycle`、`pending_tracking`、`next_check` 字段

### Requirement: Orchestrator 决定是否需要回复
Orchestrator SHALL 根据 `rules/intervention_rules.md` 的条件判断是否需要向用户发送主动回复，还是仅静默记录。

#### Scenario: 触发打断条件
- **WHEN** 用户输入触发打断条件（如频率触发、模式触发）
- **THEN** Orchestrator 调用 Coach Agent 生成干预内容，通过 message tool 发送

#### Scenario: 无触发条件
- **WHEN** 用户输入不触发任何打断条件
- **THEN** Orchestrator 仅写入记忆，不发送任何消息给用户

### Requirement: Orchestrator 驱动 Probe 进化
Orchestrator SHALL 在每次用户回答（周考/月考/主动分享）时检查是否满足进化条件，若满足则调用 `rules/evolution_triggers.md` 执行 Probe 进化流程。

#### Scenario: 连续回避触发进化
- **WHEN** 用户在同一维度连续2次回答回避（<15字/转移话题/明显逃避）
- **THEN** Orchestrator 记录 `[回避信号]`，备份原 probe，执行进化，输出进化报告

#### Scenario: 用户主动反馈触发进化
- **WHEN** 用户明确反馈问题质量（"没意思"/"不准"/"不好回答"）
- **THEN** Orchestrator 记录 `[质量反馈]`，触发该维度 probe 重写