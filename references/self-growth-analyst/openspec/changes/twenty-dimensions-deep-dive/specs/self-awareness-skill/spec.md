skill_name: 自我认知
dimension: self-awareness
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: 归因方式（外部 vs 内部）
    threshold: 0.6

diagnosis_flow:
  - step: 1
    method: pattern
    question: "这件事成功/失败，你认为主要原因是什么？"
    output: attribution
  - step: 2
    method: pattern
    question: "其中有多少是你自己可以控制的？"
    output: control_ratio
  - step: 3
    method: pattern
    question: "有多少是平台、运气、环境带来的？"
    output: external_factors

intervention:
  type: micro_action
  prompt: |
    帮助用户区分个人能力与平台红利。
    "你这次成功，有多少是你自己的能力，有多少是平台红利？"
    继续追问："如果换一个平台，你还能做到同样结果吗？"
  action: "每次成功后写下个人贡献占比"

success_metrics:
  - "能清晰区分个人能力与外部红利"
  - "将成功全部归因于自己或全部归因于运气"

escalation:
  if: "持续将失败归因于外部，成功归因于运气"
  then: "转介进行归因风格矫正"
