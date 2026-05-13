## 1. 创建健康检查路由

- [x] 1.1 创建 `backend/src/routes/health.ts` 文件
- [x] 1.2 实现 GET /health 端点处理函数
- [x] 1.3 添加数据库连接检查逻辑（使用 prisma.$queryRaw）
- [x] 1.4 添加服务运行时间计算逻辑
- [x] 1.5 实现错误处理（try-catch）

## 2. 注册路由

- [x] 2.1 在 `backend/src/index.ts` 中导入 health 路由
- [x] 2.2 注册 /health 路由到 Express app

## 3. 添加单元测试

- [x] 3.1 创建 `backend/src/routes/health.test.ts` 文件
- [x] 3.2 添加成功场景测试（200 响应）
- [x] 3.3 添加数据库断开场景测试（503 响应）
- [x] 3.4 添加响应格式验证测试

## 4. 测试准备（ACE 工作流验证）

- [x] 4.1 代码审查：运行 review
- [x] 4.2 构建验证：运行 verify
- [x] 4.3 验证状态日志：检查 `.claude/state/*.jsonl`
