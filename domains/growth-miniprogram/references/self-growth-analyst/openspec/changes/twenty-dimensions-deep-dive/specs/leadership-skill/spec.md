skill_name: 领导力
dimension: leadership
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: "事必躬亲，不信任团队独立完成任务"
    threshold: 0.6
  - type: keyword
    value: "领导力"
    threshold: 0.5

diagnosis_flow:
  - step: 1
    method: iceberg
    question: "当你把任务交给别人时，内心最大的担忧是什么？是怕出错、怕被超越，还是觉得自己做更快？"
    output: "控制欲根源分析"
  - step: 2
    method: behavioral
    question: "你团队里的人，有多少是你放手让他们成长、独立决策的？"
    output: "授权指数"

intervention:
  type: micro_action
  prompt: |
    你团队里的人，有多少是你放手让他们成长的？
    选一个你最近想自己做的任务，尝试把它分解并交给团队成员，忍住不插手。
  action: "每周授权至少一项任务给他人，并忍住不干预过程"

success_metrics:
  - "团队成员自主性和成长速度提升"
  - "你自己从执行者转向战略决策者"

escalation:
  if: "用户控制欲极强，难以在任何任务上放手"
  then: "从极小任务开始，逐步建立信任，设计检查节点而非全程监控"