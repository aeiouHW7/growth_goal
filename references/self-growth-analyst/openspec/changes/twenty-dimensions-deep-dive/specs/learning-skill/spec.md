skill_name: 学习力
dimension: learning
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: 收藏/囤积 vs 48小时内应用
    threshold: 0.6

diagnosis_flow:
  - step: 1
    method: fogg_model
    question: "你收藏这个东西的目的是什么？"
    output: motivation
  - step: 2
    method: fogg_model
    question: "你现在有能力应用它吗？还缺什么？"
    output: ability
  - step: 3
    method: fogg_model
    question: "什么时候、什么场景会触发你用它？"
    output: prompt

intervention:
  type: micro_action
  prompt: |
    检查用户的学习行为是否存在动机/能力/提示的缺口。
    "你收藏的东西，48小时内打开过吗？"
    引导：没有应用的知识不是知识，是焦虑来源。
  action: "新知识48小时内必须实践一次"

success_metrics:
  - "48小时内打开并应用收藏内容"
  - "收藏夹积压超过20条"

escalation:
  if: "收藏夹积压超过50条且无任何应用"
  then: "建议进行数字极简训练"
