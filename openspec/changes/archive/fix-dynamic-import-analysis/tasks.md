# fix-dynamic-import-analysis — 任务列表

估算: 0.1 小时
依赖链: T1

---

### T1: 替换动态 import 为静态 import

**文件:** `backend/src/services/analysis-runner.service.ts`

- [x] 顶部添加静态 import（已在 fix-analysis-runner-transaction 中完成）
- [x] 删除 3 处 `new (await import(...))`
- [x] 验证: `tsc --noEmit` 通过，AI 分析功能正常
