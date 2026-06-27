skill_name: 健康管理
dimension: health_management
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: "凭感觉管理健康，不记录数据，不遵循科学方法"
    threshold: 0.6
  - type: keyword
    value: "健康"
    threshold: 0.5

diagnosis_flow:
  - step: 1
    method: behavioral
    question: "你有记录你的睡眠时长、运动量、饮食的习惯吗？"
    output: "健康数据追踪覆盖度"
  - step: 2
    method: iceberg
    question: "你感觉身体状态好的时候和差的时候，数据有什么变化？能否关联起来？"
    output: "健康表现关联分析"

intervention:
  type: micro_action
  prompt: |
    你有记录你的睡眠和运动数据吗？它们跟你的表现有关系吗？
    从今天开始，用手机记录三天的睡眠和运动情况，看看是否和你的精力相关。
  action: "连续记录三天睡眠和运动数据，寻找与精力表现的相关性"

success_metrics:
  - "建立持续健康数据追踪习惯"
  - "能够基于数据而非感觉做出健康决策"

escalation:
  if: "用户抗拒数据记录，或数据追踪中断超过两周"
  then: "简化追踪维度，从单一指标（如睡眠）开始，建立最小可行习惯"