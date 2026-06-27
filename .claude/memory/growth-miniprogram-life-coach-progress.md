---
name: growth-miniprogram-life-coach-progress
description: "growth-miniprogram 向 AI 人生教练演进的进度追踪 — 每次会话先读此文件"
metadata:
  type: project
---

growth-miniprogram 项目当前处于从"目标拆解与复盘系统"向"三层 AI 人生教练"演进的阶段。

**核心文档：** `domains/growth-miniprogram/docs/wiki/progress.md`
- 包含完整愿景、当前状态评估、差距分析、优化路线图（P0/P1/P2）、每日进度日志
- **每次工作开始时必须先读此文件**
- 每次工作结束时更新"每日进度日志"部分

**当前阶段：** P0（基础设施）
- P0-1：人生档案表 + API（待开始）
- P0-2：结构化复盘模板（待开始）

**关键决策记录：**
- 2026-06-13：确定了从现有系统到人生教练的三层架构规划，创建了进度文档
- CLAUDE.md 指定常驻加载 `docs/wiki/index.md`，progress.md 已加入 index 导航

**Why:** 用户不是一次性完成所有优化，需要分日推进，每次会话从进度文档恢复上下文。
**How to apply:** 每次会话开始先 Read `docs/wiki/progress.md`，结束时更新日志；实现变更走 ACE 工作流。
