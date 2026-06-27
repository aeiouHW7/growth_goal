## ADDED Requirements

### Requirement: 状态同步步骤
bootstrap的Step 3最后必须同步.orchestrator_state.json。

#### Step 3.7: 同步orchestrator_state
1. 从retrieval_index最早日期推算data_accumulation_weeks
2. 设置last_cycle为今天
3. 设置current_state为"idle"
4. 从pending_actions.json同步pending_actions到state

```markdown
## Step 3.7: 同步orchestrator_state.json

- data_accumulation_weeks: (今天 - retrieval_index最早日期) / 7
- last_cycle: <today>
- current_state: "idle"
- pending_actions: 从pending_actions.json同步
```

#### Scenario: 精确计算
- **WHEN** retrieval_index最早日期为2026-04-12，今天为2026-04-25
- **THEN** data_accumulation_weeks = 13/7 ≈ 1.86 → 约为2周

### Requirement: 状态字段完整性
.orchestrator_state.json必须包含以下字段：
- data_accumulation_start: 最早模式日期
- data_accumulation_weeks: 计算得出的周数
- last_cycle: 最后一次完整运行日期
- current_state: idle/running/analysis/intervention
- pending_actions: 从pending_actions.json同步的列表

#### Scenario: 状态检查
- **WHEN** 系统需要判断是否运行过
- **THEN** 检查last_cycle是否为null
  - 如果null → 系统从未运行，执行bootstrap
  - 如果非null → 系统已运行，跳过bootstrap（除非用户手动触发）