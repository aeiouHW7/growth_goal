# fix-dailyreview-unique-constraint — 验收规格

## Requirement R-1：数据库唯一约束

- **前置**：已有 userId=X 的每天复盘记录
- **操作**：对同 userId、同 date 并发执行 2 次 `createDaily`
- **预期**：且只有 1 条记录写入，第 2 次抛出 status 409
- **证据**：Prisma migration 成功运行；`prisma migrate dev` 无错误；直接对 `DailyReview` 表执行插入相同 (userId, date) 会触发 `P2002` 错误

## Requirement R-2：应用层预检保留

- **前置**：已有 2026-07-06 的复盘
- **操作**：用户再创建同日期复盘
- **预期**：返回 409，错误消息 `"该日期已有复盘记录"`
- **证据**：E2E 或 curl 测试 `POST /api/reviews/daily/2026-07-06` 返回 `{"error":{"code":"REVIEW_ALREADY_EXISTS"}}`

## Edge Case

- **并发竞态**：应用层预检成功 → 写入时 Prisma 抛出 P2002 → 异常被 catch 并转为友好 409
