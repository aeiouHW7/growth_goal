# Post-Review Improvements — 技术设计

## 1. VS1 — Claude 输出 schema 校验

**文件**：`backend/src/services/analysis-runner.service.ts`

**实现**：
- 新增 `validateStructuredReport(report: unknown): string[]`（返回错误列表，空=通过）
- 校验关键字段：
  - `report` 为对象
  - `completionSummary` 存在且含 `completionRate`（string）
  - `capabilityDeltas` 为数组（每项含 `score: number`）
  - `suggestions` 为数组（每项含 `type`/`message`）
- 在 `JSON.parse` 后调用：
  ```ts
  const report = JSON.parse(jsonStr);
  const errors = validateStructuredReport(report);
  if (errors.length > 0) throw new Error(`分析报告校验失败: ${errors.join('; ')}`);
  ```
- run() 捕获错误 → 回退复盘状态为 INPUTTING（既有机制）

**不引入 Zod**，保持零新依赖。

## 2. VS2 — 前端 CI 门禁

**新增**：`.github/workflows/ci.yml`

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: domains/growth-miniprogram } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd frontend && npm ci
      - run: cd frontend && npx tsc -b
      - run: cd frontend && npx eslint src
      - run: cd frontend && npm run build
      - run: cd backend && npm ci
      - run: cd backend && npx prisma generate
      - run: cd backend && npm test
```

> 注意：growth-miniprogram 是主仓库的 submodule。CI 需在 `domains/growth-miniprogram/` 下运行（working-directory 配置）。若主仓库已有 CI，可将步骤并入。

## 3. VS3 — 状态机放宽

**文件**：`backend/src/services/plan.service.ts`、`frontend/src/components/DayTimeline.tsx`

**后端**（`PLAN_STATUS_TRANSITIONS`）：
```ts
const PLAN_STATUS_TRANSITIONS: Record<PlanStatus, PlanStatus[]> = {
  PENDING: [PlanStatus.IN_PROGRESS, PlanStatus.COMPLETED, PlanStatus.CANCELLED],  // +COMPLETED
  IN_PROGRESS: [PlanStatus.COMPLETED, PlanStatus.PARTIAL, PlanStatus.FAILED],
  COMPLETED: [],
  PARTIAL: [],
  FAILED: [],
  CANCELLED: [],
};
```

**前端**（`DayTimeline.toggleTask`）：移除 `if (PENDING) await IN_PROGRESS` 分支，单次调用：
```ts
async function toggleTask(plan: DailyPlan) {
  await api.updateDailyPlanStatus(plan.id, 'COMPLETED');
  // 刷新
}
```

**兼容性**：历史 IN_PROGRESS 数据无需迁移（仍可正常流转到 COMPLETED）。

---

## API 契约

| 端点 | 方法 | 变化 |
|------|------|------|
| `PATCH /plans/daily/:id/status` | PATCH | 无变化（仅状态表放宽，请求格式不变）|

无新增端点。

## 状态迁移

| 实体 | 变化 |
|------|------|
| DailyPlan | 状态表加 PENDING→COMPLETED（其余不变）|

## 测试策略

- **VS1**：单测 `validateStructuredReport`（合法/缺字段/类型错三态）+ AnalysisRunner 集成（畸形报告不落库）
- **VS3**：单测 `validatePlanTransition`（PENDING→COMPLETED 允许、COMPLETED→PENDING 拒绝）
- **VS2**：CI workflow 本身（本地先跑通各步骤）
