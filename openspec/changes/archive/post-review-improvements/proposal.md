# Post-Review Improvements — 提案

## Why（问题陈述）

来自 `ai-analysis-enhancement` 复盘的 3 个 Decisions（技术加固，无新业务功能）：

1. **Claude 输出无 schema 校验**：`analysis-runner.service.ts:288` 的 `JSON.parse` 结果直接入库为 `structuredReport`。Claude 返回畸形 JSON（缺字段/类型错）时会污染数据，前端渲染时崩溃（如 `parseFloat(completionRate)` 对非字符串）。
2. **前端无 CI 门禁**：曾有 19 个 TS 错误长期累积，靠 `tsc --noEmit` 手工发现。无 CI/pre-commit 跑 build 防回归。
3. **日计划状态机无 PENDING→COMPLETED**：`PLAN_STATUS_TRANSITIONS` 只允许 PENDING→IN_PROGRESS→COMPLETED，前端勾选完成对 PENDING 任务需两次 API 调用，中间态无意义。

## PRD / 原型

**跳过**：三项均为技术加固（后端健壮性、工程化、状态规则变更），**不涉及新页面/新布局/新交互模式**，无需 PRD 与原型。直接给出技术方案。

---

## Design Overview

### VS1 — Claude 输出 schema 校验

`analysis-runner.service.ts` 在 `JSON.parse(jsonStr)` 后加轻量运行时校验（不引入 Zod，保持零新依赖）：
- 校验 `structuredReport` 顶层结构：`completionSummary`（含 `completionRate` string）、`capabilityDeltas` 数组、`suggestions` 数组等关键字段存在且类型正确
- 校验失败 → 抛错（run 捕获并回退复盘状态），不写入数据库
- 校验函数：`validateStructuredReport(report): string[]` 返回错误列表，空=通过

### VS2 — 前端 CI 门禁

新增 GitHub Actions workflow（`.github/workflows/ci.yml`）：
- 触发：push / PR 到 main
- 步骤：`npm ci` → `tsc -b`（前端类型）→ `eslint` → `npm run build`（前端）→ `cd backend && npm test`
- 防技术债再累积（此前 tsc 22 错误 + build 失败曾长期存在）

### VS3 — 状态机放宽

`plan.service.ts` 的 `PLAN_STATUS_TRANSITIONS` 加 `PENDING → COMPLETED`（保留 IN_PROGRESS 中间态）：
```
PENDING: [IN_PROGRESS, COMPLETED, CANCELLED]
```
前端 `DayTimeline.toggleTask` 简化为单次调用：PENDING/IN_PROGRESS → COMPLETED。

### 架构决策（来自用户确认）

| 决策 | 结论 |
|------|------|
| 状态机 | 允许 PENDING→COMPLETED 直通，保留 IN_PROGRESS（可标记进行中）|
| schema 校验 | 轻量手写校验，零新依赖（不引 Zod）|

<!--
## Dialectical Analysis（辩证分析）

**多路径对比**
- schema 校验：A 手写轻量校验（零依赖）vs B 引 Zod（类型推导强但新增依赖）→ 选 A，报告结构固定、手写校验足够。
- CI：A GitHub Actions（免费、标准）vs B 其他 CI → 选 A。
- 状态机：A 允许 PENDING 直通 + 保留 IN_PROGRESS vs B 完全移除 IN_PROGRESS → 选 A，保留进行中语义。

**风险对冲**
- 校验过严导致合法报告被拒 → 校验只查关键字段，宽松失败降级（记录 warning 而非必抛）待定。
- CI 首次运行可能暴露未覆盖的环境问题 → 本地先跑通再推 workflow。
-->

## Scoping and Materialization（范围界定）

**做**：
- AnalysisRunner 报告 schema 校验（防畸形入库）
- GitHub Actions CI（tsc/lint/build/test）
- 状态机 PENDING→COMPLETED + 前端单次调用

**不做**：
- 不引 Zod/新校验库
- 不改周/月分析的输出结构（只加校验）
- 不调整 COMPLETED/PARTIAL/FAILED 等终态流转

**修改文件**：`analysis-runner.service.ts`、`plan.service.ts`、`DayTimeline.tsx`、新增 `.github/workflows/ci.yml`
