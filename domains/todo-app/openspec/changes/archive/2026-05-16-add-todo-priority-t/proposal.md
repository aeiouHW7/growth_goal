## Why

Todo 项缺少优先级字段，用户无法区分任务紧急程度。需要在 Todo 模型上增加 priority 字段。

## What Changes

- Todo Prisma schema 增加 priority 枚举字段（LOW, MEDIUM, HIGH, CRITICAL）
- TodoController 创建和更新接口支持 priority 参数
- Todo 列表接口返回 priority 字段

## Capabilities

### New Capabilities
- `todo-priority`: Todo 项优先级管理

### Modified Capabilities
- (none)

## Impact

- `prisma/schema.prisma` — Todo 模型新增字段
- `src/controllers/todoController.ts` — 增改接口支持 priority
- `src/routes/todos.ts` — 路由验证 priority 参数
