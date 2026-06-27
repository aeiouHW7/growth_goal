skill_name: 商业嗅觉
dimension: business-acumen
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: 能否说清核心收入来源和商业版图位置
    threshold: 0.6

diagnosis_flow:
  - step: 1
    method: pattern
    question: "你负责的产品/业务，公司的钱从哪来？"
    output: revenue_stream
  - step: 2
    method: pattern
    question: "在这个商业版图里，你的位置在哪？"
    output: position
  - step: 3
    method: pattern
    question: "如果你消失，这个商业价值会损失多少？"
    output: personal_value

intervention:
  type: micro_action
  prompt: |
    帮助用户建立商业视角。
    "你负责的产品，公司的钱从哪来？你的价值在哪里？"
    引导："不是问你的KPI是什么，是问你创造了什么商业价值。"
  action: "每季度搞清楚自己工作的商业闭环"

success_metrics:
  - "能清晰描述商业闭环和个人贡献点"
  - "只知道执行，不知道钱从哪来"

escalation:
  if: "工作2年以上仍无法说清商业闭环"
  then: "建议轮岗或转岗到核心业务"
