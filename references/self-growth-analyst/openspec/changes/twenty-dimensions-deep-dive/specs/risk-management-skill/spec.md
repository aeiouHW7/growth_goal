skill_name: 风险管理
dimension: risk_management
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: "做决定时从不考虑最坏情况和退路，盲目乐观"
    threshold: 0.6
  - type: keyword
    value: "风险管理"
    threshold: 0.5

diagnosis_flow:
  - step: 1
    method: iceberg
    question: "你做这件事，最坏的情况是什么？你有应对方案吗？"
    output: "最坏情况预案完整度"
  - step: 2
    method: behavioral
    question: "上次一个重要决定失败后，你有事先准备的退路吗？还是措手不及？"
    output: "风险预案习惯评估"

intervention:
  type: micro_action
  prompt: |
    你做这件事，最坏的情况是什么？你有应对方案吗？
    在做下一个重要决定前，先写下最坏情况和你能承受的底线。
  action: "每个重要决定前，准备'最坏情景预案'——最坏情况+止损线+备选路径"

success_metrics:
  - "重要决策前必有最坏情况和退路预案"
  - "能够承受适度风险，同时避免毁灭性失败"

escalation:
  if: "用户完全回避考虑风险，认为考虑最坏情况是负能量"
  then: "引导区分'悲观预设'和'理性预案'，建立可承受底线思维"