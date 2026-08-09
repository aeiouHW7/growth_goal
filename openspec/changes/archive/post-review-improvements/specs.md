# Post-Review Improvements — 验收规格

> 每个 Capability 至少包含一个 Edge Case（边缘案例）场景。

---

## Capability 1：Claude 输出 schema 校验

### Requirement: 分析报告入库前校验

AnalysisRunner 生成的 `structuredReport` 在写库前经过运行时校验，畸形报告不落库。

#### Scenario: 合法报告正常入库
- **GIVEN** Claude 返回符合 12 维度 schema 的 JSON
- **WHEN** AnalysisRunner 解析并校验
- **THEN** 校验通过，报告写入 `AIAnalysis.structuredReport`，流程正常

#### Scenario: Edge Case — 畸形报告拒绝入库
- **GIVEN** Claude 返回缺少 `completionSummary` 或 `capabilityDeltas` 类型错误的 JSON
- **WHEN** AnalysisRunner 校验
- **THEN** 抛校验错误，不写库；run 捕获并回退复盘状态为 INPUTTING

#### Scenario: Edge Case — JSON 不可解析
- **GIVEN** Claude 返回非 JSON 文本或截断 JSON
- **WHEN** `JSON.parse` 失败
- **THEN** 抛错回退状态（既有行为保留），不产生半成品记录

---

## Capability 2：前端 CI 门禁

### Requirement: GitHub Actions 自动验证

push/PR 到 main 时自动跑前端类型/构建 + 后端测试，失败即阻断合并。

#### Scenario: 提交触发 CI
- **GIVEN** 开发者 push 代码到 main（或开 PR）
- **WHEN** CI workflow 运行
- **THEN** 依次执行前端 `tsc -b`、`eslint`、`npm run build`、后端 `npm test`；任一步失败则 job 失败并标注

#### Scenario: Edge Case — 前端 build 失败
- **GIVEN** 提交包含 TS 类型错误
- **WHEN** CI 跑 `tsc -b`
- **THEN** job 失败，阻止合并（技术债不再静默累积）

#### Scenario: Edge Case — 环境依赖
- **GIVEN** 后端测试依赖 SQLite 本地文件（无需外部服务）
- **WHEN** CI 在干净环境跑 `npm test`
- **THEN** 测试正常通过（无数据库外部依赖）

---

## Capability 3：日计划状态机放宽

### Requirement: PENDING 可直通 COMPLETED

后端允许 `PENDING → COMPLETED` 一步到位；前端勾选完成单次请求。

#### Scenario: PENDING 任务勾选完成
- **GIVEN** 日计划任务处于 PENDING
- **WHEN** 前端点击完成
- **THEN** 单次调用 `PATCH /plans/daily/:id/status` 置 COMPLETED；后端 `validatePlanTransition` 允许该流转

#### Scenario: IN_PROGRESS 任务勾选完成
- **GIVEN** 任务处于 IN_PROGRESS
- **WHEN** 前端点击完成
- **THEN** 单次调用置 COMPLETED（原行为保留）

#### Scenario: Edge Case — 非法流转仍被拒绝
- **GIVEN** 任务处于 COMPLETED（终态）
- **WHEN** 尝试变回 PENDING
- **THEN** 后端抛 `STATUS_TRANSITION_INVALID`（终态不可逆，不受放宽影响）

#### Scenario: Edge Case — 前端兼容旧状态
- **GIVEN** 数据库存在 IN_PROGRESS 状态的历史任务
- **WHEN** 前端渲染/操作
- **THEN** 正常显示"进行中"并允许完成（兼容，不迁移历史数据）
