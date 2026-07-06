# fix-dailyreview-unique-constraint — 任务列表

估算: 0.5 小时
依赖链: T1
并行: 无

---

### T1: Prisma schema 加 @@unique + 服务层异常处理

**文件:**
- `backend/prisma/schema.prisma`
- `backend/src/services/review.service.ts`

- [x] DailyReview 模型末尾添加 `@@unique([userId, date])`
- [x] `createDaily()` 添加 try-catch 处理 P2002 异常
- [x] 运行 `npx prisma db push` 应用 schema 变更
- [x] 类型检查通过（review.service.ts 无新增错误）
