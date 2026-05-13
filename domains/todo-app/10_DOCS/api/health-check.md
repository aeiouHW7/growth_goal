# 健康检查 API

**变更**: test-health-check  
**日期**: 2026-05-12

## 概述

提供系统健康检查接口，返回服务状态和数据库连接状态。用于验证 ACE Engine 工作流守卫机制。

## API 接口

### GET /api/health

返回系统健康状态。

**请求**：
```
GET /api/health
```

**响应（成功）**：
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "uptime": 1234
  }
}
```

**响应（数据库不可用）**：
```json
{
  "success": false,
  "error": "Database unavailable"
}
```

## 实现要点

- 使用 Prisma `$queryRaw` 检查数据库连接
- 记录服务启动时间并计算 uptime
- 使用 Prisma 单例模式（`utils/prisma.ts`）
- 完整的错误处理（外层 + 数据库层）

## 测试覆盖

- ✅ 成功场景（200 响应）
- ✅ 数据库断开场景（503 响应）
- ✅ 响应格式验证
- ✅ Uptime 字段验证

## 注意事项

- 该端点为公开接口，无需认证
- 数据库检查使用轻量级查询（`SELECT 1`）
- 错误时记录详细日志到 console
- 符合统一响应格式规范
