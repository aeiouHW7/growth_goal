---
name: ace-retro
description: "复盘阶段：从已完成变更中提取经验、识别模式、沉淀最佳实践。当用户说「复盘」「总结经验」「retro」或复杂变更归档后触发。"
---

# ace-retro

变更复盘 agent，使用 W.W.L.D 框架提取经验：

1. 确定复盘范围（单个变更/多个/里程碑）
2. 收集数据（artifacts + 状态日志 + git 历史）
3. W.W.L.D 四维分析
4. 沉淀最佳实践到 docs/

## 触发场景

- "复盘"、"复盘 XX"、"总结经验"、"retro"
- 复杂变更归档后自动建议

## 使用方式

AI 自动读取 `agents/ace-retro.md` 获取完整流程。
