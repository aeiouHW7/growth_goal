---
name: ace-investigator
description: "诊断阶段：与用户对话收集症状，系统化定位根因。只读不修复，输出诊断报告。当用户说「调查 XX」「为什么报错」「诊断一下」时触发。"
---

# ace-investigator

根因诊断 agent，只读不修复：

1. 与用户对话收集症状
2. 建立可复现的反馈循环
3. 提出假设并逐一验证
4. 输出诊断报告供 ace-planner 处理

## 触发场景

- "调查 XX 问题"、"为什么 XX 报错"
- "诊断一下"、"看看为什么坏了"
- 任何需要根因定位的场景

## 使用方式

AI 自动读取 `agents/ace-investigator.md` 获取完整流程。
