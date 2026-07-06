# fix-lifearchive-race-condition — 任务列表

估算: 1 小时
依赖链: T1
并行: 无

---

### T1: 三个分层更新方法添加事务保护

**文件:** `backend/src/services/life-archive.service.ts`

- `updateEnergy()` — 用 `prisma.$transaction(async (tx) => { ... })` 包裹
- `updateHealth()` — 同上
- `updateBehavior()` — 同上
- 验证: `updateEnergy` 单次调用返回正确，`layerResources.energy` 结构完整
