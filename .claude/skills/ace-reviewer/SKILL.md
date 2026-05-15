---
name: ace-reviewer
description: "审查阶段：对代码变更做多维度审查，输出审批报告。只读不写，发现缺陷上报不修复。当用户说「审查代码」「review」「验证」时触发。"
---

# ace-reviewer

多维度代码审查 agent，只读不写：

1. 确认有代码变更（git diff）
2. 多维度审查（正确性/安全性/可维护性/规范/架构）
3. 置信度过滤（>80% 才标记 Block）
4. 输出审查报告

## 触发场景

- "审查代码"、"审查变更"、"review"
- "验证功能"
- applier 完成后

## 使用方式

AI 自动读取 `agents/ace-reviewer.md` 获取完整流程。
