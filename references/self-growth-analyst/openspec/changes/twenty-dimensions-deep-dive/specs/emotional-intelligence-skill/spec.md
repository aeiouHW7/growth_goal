skill_name: 情绪智力
dimension: emotional-intelligence
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: 高压/冲突/被挑战时的回应是理性/情绪/沉默
    threshold: 0.6

diagnosis_flow:
  - step: 1
    method: iceberg
    question: "你现在感受到什么情绪？"
    output: emotion_label
  - step: 2
    method: iceberg
    question: "这个情绪背后有什么需求没被满足？"
    output: underlying_need
  - step: 3
    method: iceberg
    question: "这种反应模式在过去出现过吗？"
    output: pattern_recognition

intervention:
  type: micro_action
  prompt: |
    使用冰山模型帮助用户觉察情绪来源。
    "你现在的情绪是什么？愤怒？沮丧？还是别的？"
    引导："愤怒通常是因为什么没被满足？"
  action: "冲突时刻先命名情绪，再回应"

success_metrics:
  - "能准确命名并承认自己的情绪"
  - "在冲突中直接爆发或完全沉默"

escalation:
  if: "情绪爆发频率超过每周3次"
  then: "建议进行情绪管理专项训练"
