---
name: project-status-20260515
description: ACE Engine 项目状态快照 — 三层架构、domain.yaml 驱动、ace-user-journey 完成、E2E 全流程验证通过
metadata:
  type: project
---

ACE Engine 三层架构已完整落地，E2E 全流程验证通过。

**Why:** 引擎从概念阶段进入可用阶段，需要记录当前状态避免未来会话误判项目成熟度。

**How to apply:** 新会话应基于此状态继续，不要重新设计已落地的架构。

当前状态（2026-05-16）：
- 6 个核心 workflow agent + 8 个子 agent
- 8 个自动化 hooks（config-protection, foreground-server-block 等）
- 4 个 slash commands（ace-init/status/handoff/generate）
- domain.yaml 驱动完整闭环
- 文档治理完成：README/AGENTS.md 重写，过时引用清理
- E2E 全流程验证通过：flight-board 项目走完 init → planner → applier → reviewer → archiver → retro
- flight-board 保留为第二个示例项目（航班数据展示 + 筛选）

已有示例项目：
- todo-app — 引擎优化载体（Phase A/B/C 验证场）
- flight-board — E2E 全流程验证项目（航班数据面板）
