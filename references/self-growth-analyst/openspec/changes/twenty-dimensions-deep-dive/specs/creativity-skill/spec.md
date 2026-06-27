skill_name: 创造力
dimension: creativity
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: 面对老问题是沿用旧方法还是提出新解法
    threshold: 0.6

diagnosis_flow:
  - step: 1
    method: pattern
    question: "这个问题你之前是怎么解决的？"
    output: existing_solution
  - step: 2
    method: pattern
    question: "有没有试过完全不同的方式？为什么没试？"
    output: alternative_considered
  - step: 3
    method: pattern
    question: "如果资源无限，你会怎么解决？"
    output: ideal_solution

intervention:
  type: micro_action
  prompt: |
    激发用户的创造性思维。
    "这个问题，你试过用完全不同的方式解决吗？"
    引导："不是问有没有新想法，是问为什么没试。"
  action: "每周尝试一个用新方法解决老问题"

success_metrics:
  - "能提出并执行非直觉的解决方案"
  - "面对问题直接套用上次经验"

escalation:
  if: "3个月内没有任何创新尝试"
  then: "转介进行创造力激发训练"
