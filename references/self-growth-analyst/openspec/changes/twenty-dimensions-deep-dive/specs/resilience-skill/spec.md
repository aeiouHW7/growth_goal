skill_name: 抗压与韧性
dimension: resilience
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: 重大失败后恢复到基线的时间
    threshold: 0.6

diagnosis_flow:
  - step: 1
    method: fogg_model
    question: "这个挫折让你想要放弃，还是不知道怎么办？"
    output: motivation_or_ability
  - step: 2
    method: fogg_model
    question: "你觉得自己能扛过去吗？还是觉得毫无意义？"
    output: self_efficacy
  - step: 3
    method: pattern
    question: "这个挫折，1周后你怎么看它？1个月后呢？"
    output: temporal_perspective

intervention:
  type: micro_action
  prompt: |
    帮助用户在逆境中建立时间视角。
    "这个挫折，1周后你怎么看它？1个月后呢？"
    引导："时间是最好的解药，但前提是你还在场上。"
  action: "每次挫折后写下3个可能的好处"

success_metrics:
  - "1周内恢复到正常情绪水平"
  - "挫折后长时间消沉或直接放弃"

escalation:
  if: "重大挫折后恢复期超过1个月"
  then: "转介进行韧性专项辅导"
