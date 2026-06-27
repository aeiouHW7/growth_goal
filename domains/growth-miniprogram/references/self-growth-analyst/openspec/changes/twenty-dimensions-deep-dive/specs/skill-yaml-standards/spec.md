# Skill.yaml Standards — OpenSpec Change

## ADDED Requirements

### Requirement: skill.yaml 统一格式
每个 skill.yaml 必须包含以下字段：
- skill_name: string
- dimension: string (对应20维度之一)
- version: string (语义化版本)
- created_at: date
- trigger_on: array of trigger conditions
- diagnosis_flow: array of diagnosis steps
- intervention: object {type, prompt, action}
- success_metrics: array of strings
- escalation: object {if, then}

#### Scenario: 最小可用 Skill
- **WHEN** 用户输入触发某维度的 trigger_on
- **THEN** 系统加载对应 skill.yaml，执行 diagnosis_flow，输出 intervention

### Requirement: trigger_on 多条件组合
trigger_on 支持3种类型：pattern / score / keyword
多条件时满足任一即触发（OR逻辑）

#### Scenario: 多条件触发
- **WHEN** (pattern: "决策" frequency_gte: 3) OR (score: decision_below: 6) OR (keyword: ["后悔","当初该选"])
- **THEN** 触发决策力诊断流程

### Requirement: diagnosis_flow 步骤规范
每个 diagnosis_flow step 必须包含：
- step: number
- method: fogg_model / iceberg / ocean / pattern / behavioral
- question: string
- output: string (该步骤产出什么)
