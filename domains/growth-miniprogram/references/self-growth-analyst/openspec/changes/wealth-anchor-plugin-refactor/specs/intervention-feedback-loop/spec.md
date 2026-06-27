## ADDED Requirements

### Requirement: 干预闭环追踪
每次干预后必须追踪行动执行情况和效果。

每次发送干预后，Archivist 记录：
```yaml
intervention_id: "INT-YYYYMMDD-001"
dimension: execution
action_assigned: "今天做公众号第3篇"
deadline: "24小时内"
```

用户下次碎碎念时，调度器检查：
1. 用户是否提到了那个行动的执行情况
2. 如果提到了，记录执行结果到 effectiveness_log

#### Scenario: 用户主动报告
- **WHEN** 用户说"昨天的行动我做了，发布了第3篇"
- **THEN** 记录 action_taken=true, action_result="已发布"

#### Scenario: 用户没报告
- **WHEN** 用户碎碎念但没提上次行动
- **THEN** 调度器主动问："上周给你的那个行动，执行了吗？"

### Requirement: 3次无效自动切换策略
当同一卡点的干预连续3次无行动改变时，触发策略切换。

```yaml
card_point: "知道但不做-execution"
intervention_count: 3
effectiveness_avg: 1.5  # 3次平均分1.5
status: "策略切换触发"
new_strategy: "从'给行动'改为'追问深层恐惧'"
```

#### Scenario: 策略切换
- **WHEN** 执行力卡点连续3次干预无效（平均分<2）
- **THEN** 输出："你对自己的执行力问题说了很多次，但我没见过你真正改变。为什么？"
- 同时记录 escalation 标记

### Requirement: effectiveness_log 增加字段
```yaml
- date: YYYY-MM-DD
  dimension: execution
  intervention_type: "深度干预"
  action_assigned: "今天做公众号第3篇"
  user_mentioned: true  # 用户是否主动提到
  action_taken: true    # 是否执行
  action_result: "已发布，效果好/一般/差"
  behavior_change: "none/small/significant"
  effectiveness_score: 1-5
  strategy_switch: false  # 是否触发了策略切换
  notes: "学到了什么"
```

### Requirement: 闭环触发时机
干预闭环在以下时机运行：
1. 用户下次碎碎念时（调度器检查）
2. 每周日周报时（系统性检查所有 pending_actions）
3. 每次干预发送后（记录干预点和截止时间）