## ADDED Requirements

### Requirement: Archivist Agent 维护长短记忆
Archivist Agent SHALL 管理 `memories/` 目录，将用户数据分为短期记忆（daily_raw）和长期记忆（long_term/）。

#### Scenario: 短期转长期
- **WHEN** 某条碎碎念中的洞察被标记为"重要模式"
- **THEN** Archivist 将该洞察提取到 `memories/long_term/patterns_<dimension>.md`

### Requirement: Archivist Agent 维护行为基线
Archivist Agent SHALL 管理 `memories/dynamic_baseline.json`，每次 Analyst 计算后更新行为概率数据。

#### Scenario: 基线更新
- **WHEN** Analyst 完成月度评分
- **THEN** Archivist 将新分数写入 `dynamic_baseline.json` 的 `history` 数组，计算新的行为概率

### Requirement: Archivist Agent 维护认知偏见日志
Archivist Agent SHALL 管理 `memories/cognitive_bias_log.md`，每次 Analyst 识别到新偏误时追加条目。

#### Scenario: 偏误日志追加
- **WHEN** Analyst 识别到用户第N次出现某偏误
- **THEN** Archivist 在 `cognitive_bias_log.md` 追加新条目，包含日期、偏误类型、证据、严重程度

### Requirement: Archivist Agent 管理 Orchestrator 状态
Archivist Agent SHALL 维护 `memories/.orchestrator_state.json`，记录调度器当前状态和待处理事项。

#### Scenario: 状态持久化
- **WHEN** Orchestrator 完成一个完整周期
- **THEN** Archivist 更新 `.orchestrator_state.json`：last_cycle、pending_tracking、next_check_time