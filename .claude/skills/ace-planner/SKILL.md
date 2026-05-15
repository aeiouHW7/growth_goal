---
name: ace-planner
description: "规划阶段：从模糊需求到可执行提案。合并探索、PRD、提案三个阶段。"
---

# ace-planner

三阶段规划 agent，将模糊需求转化为可执行提案：

1. **探索 (Explore)** — 理清方向，自由探索问题空间
2. **规划 (Plan/PRD)** — Matt Pocock Grill 拷问细节，输出 O.A.I.S PRD + 原型
3. **提案 (Proposal)** — 生成 OpenSpec 变更 artifacts (proposal/specs/design/tasks)

## 触发场景

当用户说以下内容时，启动 ace-planner：
- "我想做个 XX 功能，帮我规划一下"
- "这个需求帮我分析分析"
- "我们想做一个 XX 系统，出个方案"
- "帮我设计 XX 功能"
- 任何需要从模糊想法到可执行方案的需求讨论

## 使用方式

AI 自动读取 `agents/ace-planner.md` 获取完整流程。
