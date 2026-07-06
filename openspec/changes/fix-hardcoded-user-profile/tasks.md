# fix-hardcoded-user-profile — 任务列表

估算: 0.5 小时
依赖链: T1
并行: 无

---

### T1: 替换 hardcoded USER_PROFILE 为动态加载

**文件:** `backend/src/services/analysis-runner.service.ts`

- 删除常量 `USER_PROFILE`（第 11-18 行）
- `runInternal` 中添加 `prisma.user.findUnique` + `prisma.lifeArchive.findUnique` 并行查询
- 构建动态 userProfileText
- 替换 prompt 中的 `${USER_PROFILE.trim()}` 为 `${userProfileText}`
- 验证: 服务启动无报错，用户提交复盘后 AI 分析正常完成
