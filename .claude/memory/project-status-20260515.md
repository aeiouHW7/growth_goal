---
name: project-status-20260515
description: ACE Engine 项目状态快照 — 三层架构、domain.yaml 驱动、ace-user-journey 完成
metadata:
  type: project
---

ACE Engine 三层架构已完整落地：Orchestrator → Agents → Skills。

**Why:** 引擎从概念阶段进入可用阶段，需要记录当前状态避免未来会话误判项目成熟度。

**How to apply:** 新会话应基于此状态继续，不要重新设计已落地的架构。

当前状态（2026-05-15）：
- 6 个核心 workflow agent + 8 个子 agent
- 8 个自动化 hooks（config-protection, foreground-server-block 等）
- 4 个 slash commands（ace-init/status/handoff/generate）
- domain.yaml 驱动完整闭环
- todo-app 作为引擎的练兵场
- 文档治理完成：README/AGENTS.md 重写，过时引用清理
