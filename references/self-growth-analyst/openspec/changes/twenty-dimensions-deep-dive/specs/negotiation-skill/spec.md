skill_name: 谈判
dimension: negotiation
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: "谈判中坚守立场而非挖掘利益，不寻找第三方案"
    threshold: 0.6
  - type: keyword
    value: "谈判"
    threshold: 0.5

diagnosis_flow:
  - step: 1
    method: iceberg
    question: "对方表面要的是什么？他真正的利益是什么？你能区分立场和利益吗？"
    output: "立场vs利益区分度"
  - step: 2
    method: pattern
    question: "上次谈判结束后，你是否找到了让双方都超越原有立场的第三方案？"
    output: "第三方案探索能力"

intervention:
  type: micro_action
  prompt: |
    对方表面要的是什么？他真正的利益是什么？
    在下次重要对话前，先写下对方的表面立场和你推测的深层利益。
  action: "每次重要谈判前，准备'利益分析清单'——表面立场vs深层利益"

success_metrics:
  - "能够区分立场和利益，谈判中不再执着于表面诉求"
  - "逐步具备提出第三方案的能力，扩大共同利益空间"

escalation:
  if: "用户始终无法区分立场和利益，谈判僵局频繁"
  then: "通过角色扮演练习，从具体案例中训练利益挖掘能力"