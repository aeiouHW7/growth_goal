skill_name: 认知
dimension: cognition
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: 描述事件本身 vs 拆解背后利益关系/系统原因
    threshold: 0.6

diagnosis_flow:
  - step: 1
    method: iceberg
    question: "这件事表面发生了什么？"
    output: surface_event
  - step: 2
    method: iceberg
    question: "谁在这件事中获益？"
    output: beneficiary
  - step: 3
    method: iceberg
    question: "背后有什么系统结构或利益关系？"
    output: structure

intervention:
  type: micro_action
  prompt: |
    当用户描述一个事件时，引导其从现象层向结构层深入。
    "你说的是现象。能说出这件事背后谁获益了吗？"
    继续追问："这种获益是短期的还是结构性的？"
  action: "遇到问题时，多问一层'为什么'"

success_metrics:
  - "能说出利益相关方和系统原因"
  - "只停留在事件描述层面"

escalation:
  if: "连续3次只描述现象无法深入"
  then: "转介人工教练进行认知训练"
