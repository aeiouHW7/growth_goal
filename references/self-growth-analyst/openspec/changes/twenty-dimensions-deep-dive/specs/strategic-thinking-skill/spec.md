skill_name: 战略思维
dimension: strategic-thinking
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: 看一步走一步 vs 有3-6个月路线图
    threshold: 0.6

diagnosis_flow:
  - step: 1
    method: pattern
    question: "你现在主要在处理眼前的事还是未来的事？"
    output: time_horizon
  - step: 2
    method: pattern
    question: "你有3-6个月的计划吗？这个计划会往哪走？"
    output: roadmap_exists
  - step: 3
    method: pattern
    question: "你现在做的事，和3个月后的目标对齐吗？"
    output: alignment

intervention:
  type: micro_action
  prompt: |
    帮助用户建立时间维度意识。
    "你现在做的事，3个月后会有什么结果？"
    引导："如果3个月后没有好结果，现在应该做什么不同的事？"
  action: "每周花30分钟思考3个月后的目标"

success_metrics:
  - "有3-6个月清晰路线图且能描述"
  - "只看眼前，每天被动响应"

escalation:
  if: "连续1个月没有任何未来视角的规划"
  then: "进行战略思维专项辅导"
