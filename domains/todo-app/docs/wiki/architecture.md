# TODO App - 技术架构

## 技术栈概览

### 前端

- **框架**: React 18.2
- **语言**: TypeScript 5.3
- **构建工具**: Vite 5.0
- **HTTP 客户端**: Axios 1.6
- **样式**: CSS Modules（内置）

### 后端

- **运行时**: Node.js 18+
- **框架**: Express 4.18
- **语言**: TypeScript 5.3
- **ORM**: Prisma 5.7
- **数据库**: PostgreSQL 15

### 基础设施

- **开发环境**: Docker Compose（PostgreSQL）
- **包管理器**: npm

---

## 为什么选择这个技术栈？

### React + TypeScript

**理由**:
1. **AI 友好**: React 是 GitHub 上代码量最多的前端框架，AI 训练数据最丰富
2. **类型安全**: TypeScript 提供编译时类型检查，AI 生成的代码更不容易出错
3. **生态成熟**: 任何问题都能在 Stack Overflow 找到答案

**对比 Vue**:
- Vue 训练数据约为 React 的 1/3
- 单文件组件(.vue)在 AI 训练中占比较低

### Prisma ORM

**理由**:
1. **类型安全**: 自动生成 TypeScript 类型，AI 不会写错数据库操作
2. **迁移管理**: Prisma Migrate 自动管理 schema 变更
3. **AI 熟悉**: Prisma 在 AI 训练数据中极为常见

**对比手写 SQL**:
- 手写 SQL 容易拼写错误、注入风险
- Prisma 查询是类型安全的，编译时就能发现错误

### PostgreSQL

**理由**:
1. **严格类型**: 不像 MongoDB 的松散 schema
2. **AI 熟悉**: SQL 查询在 AI 训练数据中占比高
3. **错误信息清晰**: 错误提示详细，AI 容易定位问题

---

## 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                      用户浏览器                          │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ HTTP (port 5173)
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React)                       │
│  - React Components                                      │
│  - Axios HTTP Client                                     │
│  - TypeScript                                            │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ REST API (port 3000)
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   Backend (Express)                      │
│  - Express Routes                                        │
│  - Controllers                                           │
│  - Prisma Client                                         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ Prisma ORM
                      ▼
┌─────────────────────────────────────────────────────────┐
│                PostgreSQL Database                       │
│  - todos table                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 目录结构

### Frontend

```
frontend/
├── src/
│   ├── App.tsx                 # 主应用组件
│   ├── main.tsx                # 入口文件
│   ├── components/             # UI 组件
│   │   ├── TodoList.tsx        # 待办列表
│   │   ├── TodoItem.tsx        # 单个待办项
│   │   └── TodoForm.tsx        # 创建表单
│   ├── services/               # API 调用
│   │   └── api.ts              # HTTP 客户端
│   ├── types/                  # TypeScript 类型
│   │   └── todo.ts             # Todo 类型定义
│   └── App.css                 # 样式
├── public/                     # 静态资源
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Backend

```
backend/
├── src/
│   ├── app.ts                  # Express 应用配置
│   ├── server.ts               # 服务器启动
│   ├── routes/                 # 路由定义
│   │   └── todos.ts            # Todo 路由
│   ├── controllers/            # 业务逻辑
│   │   └── todoController.ts   # Todo 控制器
│   └── middleware/             # 中间件
│       └── errorHandler.ts     # 错误处理
├── prisma/
│   ├── schema.prisma           # 数据库 schema
│   ├── migrations/             # 迁移历史
│   └── seed.ts                 # 初始数据
├── package.json
└── tsconfig.json
```

---

## 数据模型

### Prisma Schema

```prisma
model Todo {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

**字段说明**:
- `id`: 自增主键
- `title`: 待办事项标题（必需）
- `completed`: 完成状态（默认 false）
- `createdAt`: 创建时间戳（自动）

### 数据库表

Prisma 生成的 SQL：

```sql
CREATE TABLE "Todo" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## API 设计

### RESTful Endpoints

| Method | Endpoint      | 描述           | 请求体               | 响应           |
|--------|---------------|----------------|----------------------|----------------|
| GET    | /api/todos    | 获取所有待办   | -                    | `Todo[]`       |
| POST   | /api/todos    | 创建待办       | `{ title: string }`  | `Todo`         |
| PUT    | /api/todos/:id| 更新待办       | `{ completed: bool }`| `Todo`         |
| DELETE | /api/todos/:id| 删除待办       | -                    | `{ message }` |

### 请求示例

**创建待办**:
```bash
POST /api/todos
Content-Type: application/json

{
  "title": "Learn ACE Engine"
}
```

**响应**:
```json
{
  "id": 1,
  "title": "Learn ACE Engine",
  "completed": false,
  "createdAt": "2026-05-11T10:00:00.000Z"
}
```

**更新待办**:
```bash
PUT /api/todos/1
Content-Type: application/json

{
  "completed": true
}
```

**响应**:
```json
{
  "id": 1,
  "title": "Learn ACE Engine",
  "completed": true,
  "createdAt": "2026-05-11T10:00:00.000Z"
}
```

---

## 开发环境设置

### 前置要求

- Node.js 18+
- npm 9+
- Docker（用于 PostgreSQL）

### 启动步骤

```bash
# 1. 启动数据库
npm run ace:up

# 2. 安装前后端依赖
cd domains/todo-app/frontend && npm install
cd ../backend && npm install

# 3. 运行数据库迁移
cd domains/todo-app/backend
npx prisma migrate dev

# 4. 启动后端（新终端）
npm run dev:backend

# 5. 启动前端（新终端）
npm run dev:frontend

# 6. 访问应用
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
```

---

## 环境变量

### Backend (.env)

```bash
DATABASE_URL="postgresql://todouser:todopass@localhost:5432/todoapp"
PORT=3000
NODE_ENV=development
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:3000
```

---

## 构建和部署

### 构建生产版本

```bash
# 前端
cd domains/todo-app/frontend
npm run build
# 输出: dist/

# 后端
cd domains/todo-app/backend
npm run build
# 输出: dist/
```

### 生产环境（未来）

使用 Docker Compose：

```bash
npm run prod:up
```

---

## 性能考虑

### MVP 阶段

- 无需优化，专注功能实现
- 数据量小（<100 条），性能不是瓶颈

### 未来优化

- 分页（数据量 >1000 时）
- 索引（title 字段）
- 缓存（Redis）
- CDN（静态资源）

---

## 安全考虑

### MVP 阶段

- 基本输入验证（标题长度）
- CORS 配置（仅允许 localhost）

### 生产环境需要

- [ ] SQL 注入防护（Prisma 已内置）
- [ ] XSS 防护（React 已内置）
- [ ] CSRF 防护
- [ ] 用户认证（JWT）
- [ ] HTTPS
- [ ] 速率限制

---

## 测试策略

### MVP 阶段

- 手动测试为主
- 基本的单元测试（可选）

### 未来测试

- 前端：React Testing Library
- 后端：Jest + Supertest
- E2E：Playwright
- 覆盖率目标：>80%

---

## 技术债记录

### 已知限制（MVP）

1. **无用户认证**: 单用户模式，数据共享
2. **无错误日志**: 使用 console.log
3. **无监控**: 无性能监控和错误追踪
4. **硬编码配置**: 部分配置未环境变量化

### 优化计划

- 阶段 2: 添加用户认证
- 阶段 3: 添加日志和监控
- 阶段 4: 性能优化和缓存

---

**更新时间**: 2026-05-11  
**版本**: 0.1.0  
**维护者**: ACE Engine Team
