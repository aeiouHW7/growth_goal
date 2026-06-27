skill_name: 信息整合
dimension: information_integration
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: "知识库混乱、更新频率低，依赖记忆而非系统"
    threshold: 0.6
  - type: keyword
    value: "知识管理"
    threshold: 0.5

diagnosis_flow:
  - step: 1
    method: behavioral
    question: "你昨天学的东西，今天能调用吗？用的时候能找到吗？"
    output: "知识可调用率"
  - step: 2
    method: pattern
    question: "你的知识库最近一次更新是什么时候？是以什么结构组织的？"
    output: "知识库组织评分"

intervention:
  type: micro_action
  prompt: |
    你昨天学的东西，今天能调用吗？用的时候能找到吗？
    试着在今天学到一个新东西后，用自己的话写三句话存进你的知识库。
  action: "建立'每日一条知识记录'习惯，用自己的语言记录所学"

success_metrics:
  - "知识库更新频率提升，结构清晰"
  - "需要时能在5分钟内找到相关知识而非依赖记忆"

escalation:
  if: "用户完全没有知识管理习惯"
  then: "从最简工具开始（如手机备忘录），建立捕获习惯，再谈结构化"