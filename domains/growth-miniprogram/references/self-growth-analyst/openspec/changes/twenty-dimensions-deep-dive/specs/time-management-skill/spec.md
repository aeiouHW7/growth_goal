skill_name: 时间管理
dimension: time-management
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: 心流时间占比；碎片化时间是主动利用还是被动消耗
    threshold: 0.6

diagnosis_flow:
  - step: 1
    method: pattern
    question: "你昨天专注工作了多长时间？（没有刷手机、没有被打断）"
    output: deep_work_hours
  - step: 2
    method: pattern
    question: "你刷手机的时间和主动利用碎片时间，比例是多少？"
    output: passive_vs_active
  - step: 3
    method: pattern
    question: "你的时间规划是按天还是按小时？"
    output: time_granularity

intervention:
  type: micro_action
  prompt: |
    帮助用户审视时间质量。
    "你昨天的时间，专注的有多长时间？刷手机占多少？"
    引导："不是问多忙，是问多专注。忙碌不等于高效。"
  action: "每天记录3小时心流时间"

success_metrics:
  - "每天心流时间超过3小时"
  - "时间颗粒度按天计算，无法说出小时级计划"

escalation:
  if: "心流时间连续一周少于1小时/天"
  then: "进行深度工作专项训练"
