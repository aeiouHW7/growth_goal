skill_name: 社交智慧
dimension: social_wisdom
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: "习惯熟识小圈子，回避跨领域社交"
    threshold: 0.6
  - type: keyword
    value: "社交圈"
    threshold: 0.5

diagnosis_flow:
  - step: 1
    method: iceberg
    question: "你最近联系的五个人，是跟你背景相似还是不同？"
    output: "关系多样性评分"
  - step: 2
    method: pattern
    question: "你和其他人建立联系时，通常是谁主动？关系中'经营' vs '索取'比例是多少？"
    output: "关系经营指数"

intervention:
  type: micro_action
  prompt: |
    你最近联系的人，是跟你很像的还是不同的？
    试着在本周主动联系一个不同领域的朋友——不是寻求帮助，只是交流。
  action: "每周与一个不同背景的人进行一次有质量的对话"

success_metrics:
  - "社交网络多样性提升，跨领域连接增加"
  - "关系从单向索取走向双向价值交换"

escalation:
  if: "用户社交圈高度同质化且抗拒拓展"
  then: "引导探索线下社群或兴趣小组，降低门槛接触不同人群"