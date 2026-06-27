skill_name: 影响力
dimension: influence
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: 说服是"信了你的话"还是"成了你的盟友"
    threshold: 0.6

diagnosis_flow:
  - step: 1
    method: pattern
    question: "你最近说服了谁做某件事？"
    output: target_person
  - step: 2
    method: pattern
    question: "他是因为什么信你？是你的职位、关系还是逻辑？"
    output: influence_basis
  - step: 3
    method: pattern
    question: "他后来有没有主动帮你传播或深化这件事？"
    output: alliance_formed

intervention:
  type: micro_action
  prompt: |
    区分影响力和权威压迫。
    "你最近说服了谁？他是因为什么信你？"
    追问："如果你们不是上下级关系，他还会听吗？"
  action: "每周找一个人，在不用职位影响的情况下说服他"

success_metrics:
  - "能让无利益关系的人主动认同并行动"
  - "说服依赖职位或关系压力"

escalation:
  if: "6个月内没有非职权影响力案例"
  then: "转介进行影响力专项训练"
