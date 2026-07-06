# fix-analysis-runner-transaction — 任务列表

估算: 1.5 小时
依赖链: T1 → T2 → T3 → T4
并行: 无

---

### T1: PatternService — 添加 `tx` 参数 ✅

**文件:** `backend/src/services/pattern.service.ts`

- [x] `trackIssuesFromAnalysis` 方法签名添加 `tx?: Prisma.TransactionClient`
- [x] `decayOldPatterns` 也添加 `tx` 参数并透传
- [x] 方法内用 `db = tx || prisma` 模式
- [x] `getRecurringIssues` 和 `getActivePatterns` 保持直接使用 `prisma`（不参与事务）

---

### T2: BiasDetectionService — 添加 `tx` 参数 ✅

**文件:** `backend/src/services/bias-detection.service.ts`

- [x] `logFromAnalysis` 和 `logBiases` 方法签名添加 `tx?: Prisma.TransactionClient`
- [x] 方法内用 `db = tx || prisma` 模式

---

### T3: CapabilityService — 添加 `tx` 参数 ✅

**文件:** `backend/src/services/capability.service.ts`

- [x] `logFromAnalysis` 方法签名添加 `tx?: Prisma.TransactionClient`
- [x] 写入操作改 `db = tx || prisma`

---

### T4: AnalysisRunner — 事务包裹 ✅

**文件:** `backend/src/services/analysis-runner.service.ts`

- [x] 移除 `import("./pattern.service")` 动态 import，改为顶部静态 import
- [x] `runInternal` 中用 `prisma.$transaction(async (tx) => { ... })` 包裹全部写入操作
- [x] 传递 `tx` 给三个子服务
- [x] 移除冗余的 `dailyReview.update({ status: "ANALYZING" })`（已在 create 时设置）
- [x] 类型检查通过（无新增错误）
