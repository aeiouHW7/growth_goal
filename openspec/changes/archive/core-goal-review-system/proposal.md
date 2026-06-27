---
version: "0.1.0"
change: "core-goal-review-system"
status: draft
created: "2026-05-16"
updated: "2026-05-16"
author: "ACE Planner"
---

# Proposal: core-goal-review-system

## Summary

构建 growth-miniprogram 核心系统：一个以 Claude 终端为主要交互入口的个人目标管理与复盘系统。Phase 1 交付完整的后端 API + Prisma 数据层 + 数据库，Claude 终端通过 REST API 进行目标管理和每日/周/月复盘。Phase 2 扩展 Web 看板（只读）。

## Motivation

用户需要一个可度量的目标拆解和定期复盘系统，核心痛点是：
- 目标设定后缺乏结构化拆解（年→月→日）
- 缺少定期复盘机制来诊断执行偏差
- 缺少外部视角（时事趋势）帮助审视目标方向
- 缺少 AI 自我优化机制（用户评分反馈闭环）

## Architecture Decisions

### AD-01: Backend-first delivery
- **状态**: ✅ Accepted
- **Context**: Phase 1 不需要前端 UI，Claude 终端就是界面
- **Decision**: 先构建完整 backend（REST API + Prisma + PostgreSQL），Claude 通过 HTTP 工具调用 API
- **Consequence**: Phase 1 可独立交付和验证，Phase 2 前端只做只读消费

### AD-02: Single-user mode (Phase 1)
- **状态**: ✅ Accepted
- **Context**: 初始阶段用户只有自己使用
- **Decision**: Phase 1 不做用户认证/鉴权，单用户直连 API
- **Consequence**: 简化开发，快速验证核心流程。Phase 2 多人协作时再引入 auth

### AD-03: Flexible goal hierarchy (not rigid 4-level)
- **状态**: ✅ Accepted
- **Context**: 用户需要灵活定义目标层级，不强制 LifeGoal→Yearly→Month→Day
- **Decision**: Prisma schema 支持 parentId 自引用 + level 字段，任何层级都可以灵活关联
- **Consequence**: 模型更复杂但更灵活，查询时需要递归 CTE 或多表联合

### AD-04: AI analysis as structured JSON + free-text report
- **状态**: ✅ Accepted
- **Context**: AI 分析需要结构化数据（完成率/偏差等）和自然语言报告
- **Decision**: AIAnalysis 模型存储 structuredReport (JSON) + narrativeReport (Text) 双字段
- **Consequence**: 结构化和非结构化数据分离，Web 看板直接消费 JSON

### AD-05: Claude prompt as code
- **状态**: ✅ Accepted
- **Context**: Claude 终端的交互质量由 prompts 定义
- **Decision**: 所有 prompts 放在 `backend/src/prompts/` 目录，版本化管理
- **Consequence**: Prompt 可测试、可 review、可迭代

### AD-06: No Taro frontend in Phase 1
- **状态**: ✅ Accepted
- **Context**: 优先验证 AI+目标管理的核心闭环
- **Decision**: Phase 1 只做 backend + Claude prompts，frontend/ 目录留空待 Phase 2
- **Consequence**: 更快的 MVP 交付，但 Web 端用户要等 Phase 2

## Scope

### Phase 1 (当前)
- [x] PostgreSQL 数据库 + Prisma schema（12 实体）
- [x] REST API（目标 CRUD + 复盘 CRUD + AI 分析读写）
- [x] Claude prompt system（设定目标/复盘/分析/打分）
- [x] AI 分析 4 层模型（完成总结/偏差/诊断/外部视角）
- [x] 用户评分闭环（<60 反思 / ≥80 优秀案例）
- [x] 周/月复盘自动触发机制

### Phase 2 (后续)
- [ ] Taro Web 看板（只读）
- [ ] 用户认证（多人模式）
- [ ] 数据趋势可视化

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Claude 终端交互流程复杂，用户学习成本高 | Medium | High | 提供初始化引导提示词 |
| AI 分析质量不稳定 | Medium | High | 评分闭环持续优化，反思+优秀案例积累 |
| 外部信息搜索质量不可控 | Low | Medium | 标注来源，用户可补充 |
