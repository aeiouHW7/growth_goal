# Post-Review Improvements — 实现任务（Vertical Slicing）

> 每个切片端到端可验证。估算：1-2 天。依赖：VS1/VS3 独立；VS2 可并行。

---

## VS1: 分析报告 schema 校验（防畸形入库）

**目标**：Claude 输出经校验后才写库，畸形报告拒绝并回退状态。

**后端**：
- [x] `analysis-runner.service.ts`：新增 `validateStructuredReport(report): string[]`（校验 completionSummary/capabilityDeltas/suggestions 等关键字段）
- [x] `JSON.parse` 后调用校验，失败 throw（run 捕获回退 INPUTTING）
- [x] 单测：合法通过 / 缺字段拒绝 / 类型错拒绝（3 用例）

**验证**：跑后端测试；手动 mock 畸形 JSON → 不落库 + 复盘状态回退。

---

## VS2: 前端 CI 门禁（GitHub Actions）

**目标**：push/PR 自动跑前端 tsc/lint/build + 后端测试。

**新增**：
- [x] `.github/workflows/ci.yml`：checkout → node20 → 前端 npm ci/tsc/eslint/build → 后端 npm ci/prisma generate/npm test
- [x] 本地验证：按 workflow 步骤顺序手工跑通（确认无环境问题）

**验证**：workflow 语法校验（`actionlint` 或手动检查）；本地逐步跑通。

---

## VS3: 日计划状态机放宽（PENDING→COMPLETED）

**目标**：勾选完成单次调用。

**后端**：
- [ ] `plan.service.ts`：`PLAN_STATUS_TRANSITIONS.PENDING` 加 `COMPLETED`
- [ ] 单测：PENDING→COMPLETED 允许；COMPLETED→PENDING 仍拒绝

**前端**：
- [ ] `DayTimeline.toggleTask`：移除 IN_PROGRESS 预置分支，单次调 `updateDailyPlanStatus(id, 'COMPLETED')`

**验证**：日视图对 PENDING 任务点完成 → 单次请求即变 COMPLETED；历史 IN_PROGRESS 任务仍可完成。

---

## 验证汇总

- [ ] `cd backend && npm test`（新增单测通过）
- [ ] 前端 `tsc -b` + `lint` + `build` 通过
- [ ] CI workflow 可运行
- [ ] reviewer 审查无 Block
