skill_name: 目标驱动
dimension: goal_drive
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: "目标模糊不可衡量，复盘流于形式，不做真调优"
    threshold: 0.6
  - type: keyword
    value: "目标"
    threshold: 0.5

diagnosis_flow:
  - step: 1
    method: fogg_model
    question: "你这周的目标，具体是什么？可衡量的指标是什么？"
    output: "目标SMART评分"
  - step: 2
    method: behavioral
    question: "上次复盘你发现了什么？你做了哪些调整来改进？"
    output: "复盘有效性评分"

intervention:
  type: micro_action
  prompt: |
    你这周的目标，具体是什么？可衡量的指标是什么？
    试着把一个大目标拆解为三个本周可执行的小行动。
  action: "每周设定一个SMART目标，并记录周末复盘结果"

success_metrics:
  - "目标颗粒度细化到周/日级别，可衡量指标明确"
  - "复盘能产生真实可执行的改进行动"

escalation:
  if: "用户持续设定模糊目标或不复盘"
  then: "强制使用标准化模板，从'目标-指标-复盘'三段式开始建立习惯"