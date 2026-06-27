## ADDED Requirements

### Requirement: bootstrap_system.md 一次性启动序列
scripts/bootstrap_system.md 必须包含完整的启动检查流程。

#### Scenario: 系统首次激活
- **WHEN** .orchestrator_state.json 中无 data_accumulation_start 字段
- **THEN** 执行 bootstrap_sequence：检查 daily_raw/ 是否有过去7天碎碎念

#### Scenario: 有历史数据
- **WHEN** daily_raw/ 中存在过去7天的碎碎念文件（至少1条）
- **THEN** 执行一次完整7步循环（Step1-7），产出第一份评分，更新.orchestrator_state.json

#### Scenario: 无历史数据
- **WHEN** daily_raw/ 中过去7天无碎碎念
- **THEN** 输出"待数据积累状态"，设置 data_accumulation_start: <today>，启动每日cron提醒

### Requirement: 系统就绪信号
bootstrap 完成后必须输出状态信号。

```markdown
## 系统状态
- data_accumulation_start: <today or null>
- daily_raw_count: <过去7天的碎碎念条数>
- engine_status: [系统就绪 / 待数据积累]
- next_action: [执行首轮分析 / 等待数据]
```

### Requirement: 手动触发支持
用户说"跑系统健康检查"时，执行 bootstrap_sequence。