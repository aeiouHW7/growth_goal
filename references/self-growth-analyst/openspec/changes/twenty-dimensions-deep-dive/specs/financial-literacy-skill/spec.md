skill_name: 理财力
dimension: financial_literacy
version: 1.0
created_at: 2026-04-25

trigger_on:
  - type: pattern
    value: "关注省钱和节省开支，忽视资产结构和回报率"
    threshold: 0.6
  - type: keyword
    value: "理财"
    threshold: 0.5

diagnosis_flow:
  - step: 1
    method: ocean
    question: "你平时关注的是现金流中哪类消费？是否清楚自己的资产结构（流动/投资/保值）？"
    output: "财务可见度评分"
  - step: 2
    method: pattern
    question: "你现在花的每一块钱，有多少是在投资你的未来？有多少是即时消费？"
    output: "消费结构比例"

intervention:
  type: micro_action
  prompt: |
    你现在花的每一块钱，有多少是在投资你的未来？
    试着从本月开始记录一笔"自我投资"支出，无论是课程、工具还是人脉。
  action: "每月至少一笔明确标注为'自我投资'的支出，并追踪回报"

success_metrics:
  - "资产结构逐渐优化，被动收入增加"
  - "消费决策从感性省钱转向理性投入产出比分析"

escalation:
  if: "用户财务状况混乱，无法区分资产和负债"
  then: "引入简单的财务记账工具，帮助建立资产概念"