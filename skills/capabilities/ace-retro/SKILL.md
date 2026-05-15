---
name: ace-retro
description: 复盘方法论参考 — W.W.L.D 框架、复盘模板。被 ace-retro agent 引用。
---

# ace-retro 方法论

变更复盘时的方法论参考。完整流程见 `agents/ace-retro.md`。

## W.W.L.D 框架

| 维度 | 核心问题 | 按阶段组织 |
|------|---------|-----------|
| **What Went Well** | 哪些做得好？为什么？ | 规划/实现/工具 |
| **What Went Wrong** | 哪里卡住了？返工了？ | 规划/实现/工具 |
| **Lessons Learned** | 学到什么？可复用模式？ | 技术/流程/模式 |
| **Decisions to Make** | 流程/规范/工具怎么改？ | 具体可执行项 |

## 数据收集来源

1. openspec/archive/ artifacts（proposal/design/tasks）
2. .claude/state/*.jsonl 状态日志
3. git log 提交历史
4. 度量：代码行数、文件数、覆盖率、耗时

## 沉淀目标

| 类型 | 位置 | 内容 |
|------|------|------|
| 技术模式 | docs/patterns/ | 设计模式、最佳实践 |
| 复盘报告 | docs/retrospectives/ | W.W.L.D 完整记录 |
| 规范更新 | rules/ | 编码规范、测试标准 |

## 复盘频率

- 复杂变更：每次必复盘
- 中等变更：可选
- 简单变更：跳过
- 版本发布：里程碑复盘

## 原则

- 基于数据，不主观臆断
- 区分"问题"和"改进机会"
- 不在复盘阶段实现改进（记录后走 ace-planner）
