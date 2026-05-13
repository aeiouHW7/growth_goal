## Why

测试 ACE Engine 工作流守卫机制的完整流程。添加一个简单的健康检查 API 端点，验证 propose → apply → review → verify → archive 工作流是否正常运行，以及复杂度评估、前置检查、状态日志等功能是否生效。

## What Changes

- 在 backend 添加 `/health` GET 端点
- 返回系统状态信息（数据库连接、服务运行时间）
- 添加对应的单元测试

## Capabilities

### New Capabilities
- `health-check`: 提供系统健康检查接口，返回服务状态和数据库连接状态

### Modified Capabilities
<!-- 无现有能力变更 -->

## Impact

- 新增文件：`backend/src/routes/health.ts`
- 新增文件：`backend/src/routes/health.test.ts`
- 修改文件：`backend/src/index.ts`（注册路由）
- 无破坏性变更
- 无外部依赖变更

## 变更分类
**复杂度**: 简单
**流程要求**: propose → apply → archive（可跳过 review/verify，但建议运行以验证流程）

## ACE 上下文
- 技术栈: Node.js + TypeScript + Prisma + PostgreSQL
- 相关文档: 无
- 编码规范: 
  - 使用 TypeScript strict 模式
  - 所有 API 必须有错误处理 (try-catch)
  - 统一响应格式: { success: boolean, data?: any, error?: string }
