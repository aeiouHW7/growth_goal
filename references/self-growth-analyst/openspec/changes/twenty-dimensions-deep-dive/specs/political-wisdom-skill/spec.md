skill_name: 政治智慧
dimension: political_wisdom
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: "不了解组织内决定晋升的实际权力结构，只看官方汇报线"
    threshold: 0.6
  - type: keyword
    value: "办公室政治"
    threshold: 0.5

diagnosis_flow:
  - step: 1
    method: iceberg
    question: "你公司里，谁实际上决定你的晋升？他想要什么？你能列举出非正式权力网络中的关键人物吗？"
    output: "权力地图清晰度"
  - step: 2
    method: behavioral
    question: "当你面对两个老板的冲突指令时，你通常怎么应对？"
    output: "冲突指令应对模式"

intervention:
  type: micro_action
  prompt: |
    你公司里，谁实际上决定你的晋升？他想要什么？
    列出你公司内三个非正式权力人物，以及他们最关心的东西。
  action: "绘制自己的'权力地图'——三个关键人物及他们的核心诉求"

success_metrics:
  - "能够清晰识别组织内实质决策者"
  - "在冲突指令中能做出战略性选择而非被动应对"

escalation:
  if: "用户完全无法识别任何非正式权力结构"
  then: "引导观察哪些人在关键时刻被咨询、哪些决定被私下认可，建立权力感知"