## Context

这是一个测试变更，用于验证 ACE Engine 工作流守卫机制。当前 todo-app backend 缺少健康检查端点，添加该端点可以：
1. 验证完整的 propose → apply → review → verify → archive 工作流
2. 测试复杂度评估（简单变更）的流程守卫行为
3. 验证状态日志记录功能

**当前状态**：backend 使用 Express + TypeScript + Prisma
**约束**：必须符合 domain.yaml 中定义的编码规范
**涉众**：ACE Engine 开发者（测试工作流）

## Goals / Non-Goals

**Goals:**
- 添加 `/health` 端点返回系统状态
- 检查数据库连接状态
- 提供服务运行时间信息
- 验证 ACE 工作流守卫机制

**Non-Goals:**
- 不实现详细的系统监控（CPU、内存等）
- 不添加认证（公开端点）
- 不持久化健康检查历史

## Decisions

### Decision 1: 独立路由文件

**选择**：创建 `routes/health.ts` 独立文件

**理由**：
- ✅ 与现有路由结构一致（todos.ts）
- ✅ 易于测试
- ✅ 未来可扩展（添加更多健康检查项）

**替代方案**：直接在 index.ts 中定义
- ❌ 混合路由和服务器配置逻辑

### Decision 2: 数据库检查方式

**选择**：使用 `prisma.$queryRaw('SELECT 1')` 测试连接

**理由**：
- ✅ 轻量级，无副作用
- ✅ Prisma 官方推荐方式
- ✅ 快速响应（~10ms）

**替代方案**：查询实际表（SELECT COUNT(*) FROM Todo）
- ❌ 依赖业务表结构
- ❌ 性能影响更大

### Decision 3: 响应格式

**选择**：遵循 domain.yaml 统一格式 `{ success, data, error }`

**理由**：
- ✅ 与所有 API 响应一致
- ✅ 符合编码规范
- ✅ 易于客户端解析

## Risks / Trade-offs

### Risk 1: 数据库查询失败导致端点不可用

**缓解**：
- 使用 try-catch 捕获所有错误
- 即使数据库断开，仍返回 503（而非 500）
- 记录详细错误日志

### Trade-off: 简单 vs 完整

**当前**：仅检查数据库连接  
**未来**：可扩展添加 Redis、外部 API 检查

选择简单实现以快速验证工作流，扩展性已预留。

## Migration Plan

**部署步骤**：
1. 部署新代码（添加路由）
2. 验证 `/health` 端点可访问
3. 无需数据库迁移

**回滚策略**：
- 删除 `routes/health.ts`
- 从 `index.ts` 移除路由注册
- 零风险（无破坏性变更）

## Open Questions

无待解决问题。
