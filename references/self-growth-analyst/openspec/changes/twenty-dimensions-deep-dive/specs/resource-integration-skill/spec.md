skill_name: 资源整合
dimension: resource_integration
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: "倾向于自己完成，忽视外部资源；不考虑资源获取成本"
    threshold: 0.6
  - type: keyword
    value: "资源整合"
    threshold: 0.5

diagnosis_flow:
  - step: 1
    method: behavioral
    question: "你最近用的最有效的外部资源是什么？你为它付出了什么？"
    output: "资源杠杆意识评分"
  - step: 2
    method: fogg_model
    question: "当你面对一个挑战时，第一反应是自己搞定还是寻找外部资源？"
    output: "借力习惯评估"

intervention:
  type: micro_action
  prompt: |
    你最近用的最有效的外部资源是什么？你为它付出了什么？
    识别一个你正在独自处理的问题，看看能否找到已经解决过类似问题的人。
  action: "每周至少向外部资源（人/工具/信息）借力一次，并记录效果"

success_metrics:
  - "能清晰评估资源获取的成本收益比"
  - "逐步建立外部资源库，形成资源杠杆效应"

escalation:
  if: "用户完全抗拒借助外部资源，事事亲力亲为"
  then: "从低风险领域开始（如信息搜索），逐步建立借力信心"