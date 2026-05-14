# TODO App

一个简单优雅的待办事项应用，展示 ACE Engine 的完整能力。

![](https://img.shields.io/badge/React-18.2-blue)
![](https://img.shields.io/badge/TypeScript-5.3-blue)
![](https://img.shields.io/badge/Prisma-5.7-green)
![](https://img.shields.io/badge/PostgreSQL-15-blue)

---

## ✨ 特性

- ✅ **完整的 CRUD 功能**: 创建、读取、更新、删除待办事项
- ✅ **类型安全**: 全栈 TypeScript + Prisma ORM
- ✅ **现代化 UI**: React + Vite，渐变背景 + 卡片设计
- ✅ **数据持久化**: PostgreSQL 数据库
- ✅ **热重载**: 前后端都支持实时更新
- ✅ **错误处理**: Error Boundary + 统一错误格式
- ✅ **完整测试**: Jest + Supertest，13 个测试用例，78.76% 覆盖率
- ✅ **性能优化**: 响应缓存（node-cache），GET 请求缓存 60s
- ✅ **日志系统**: Winston 日志，文件轮转 + 请求日志
- ✅ **环境验证**: Zod schema 验证环境变量
- ✅ **代码质量**: ESLint + Prettier 自动化检查

---

## 🚀 快速开始

### 一键启动（推荐）⭐

```bash
# 在 todo-app 目录下运行
./start.sh  # 自动启动所有服务（Docker + 后端 + 前端）
```

**脚本会自动**：
- ✅ 启动 PostgreSQL 数据库
- ✅ 安装前后端依赖
- ✅ 运行数据库迁移
- ✅ 填充示例数据
- ✅ **自动启动后端和前端服务**

访问 http://localhost:5173 查看应用！

**查看服务状态**：
```bash
./status.sh  # 查看 Docker、后端、前端的运行状态
```

---

### 手动安装（可选）

<details>
<summary>点击展开手动步骤</summary>

### 前置要求

- Node.js 18+
- Docker（用于 PostgreSQL）

### 1. 启动数据库

```bash
# 在项目根目录
npm run ace:up
```

### 2. 安装依赖

```bash
# 前端
cd frontend
npm install

# 后端
cd ../backend
npm install
```

### 3. 初始化数据库

```bash
# 运行迁移
npm run db:migrate

# (可选) 填充示例数据
npm run db:seed
```

### 4. 启动应用

```bash
# 终端 1: 后端
cd backend && npm run dev

# 终端 2: 前端（新终端）
cd frontend && npm run dev
```

### 5. 访问应用

- **前端**: http://localhost:5173
- **后端 API**: http://localhost:3000
- **数据库管理**: `npm run db:studio`

</details>

---

## 📁 项目结构

```
todo-app/
├── 10_DOCS/                  # 文档（知识资产）
│   ├── business/             # 业务文档
│   │   └── glossary.md       # 术语表
│   ├── technical/            # 技术文档
│   │   └── architecture.md   # 架构设计
│   └── api/                  # API 文档
│       └── rest-api.md       # REST API 规范
│
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── App.tsx           # 主应用组件
│   │   ├── components/       # React 组件
│   │   ├── services/         # API 调用
│   │   └── types/            # TypeScript 类型
│   └── package.json
│
├── backend/                  # 后端 API
│   ├── src/
│   │   ├── app.ts            # Express 应用
│   │   ├── routes/           # 路由定义
│   │   ├── controllers/      # 业务逻辑
│   │   └── middleware/       # 中间件
│   ├── prisma/
│   │   └── schema.prisma     # 数据库 schema
│   └── package.json
│
├── 90_PLANNING/              # 规划文档
│   └── verification-report.md
│
└── domain.yaml               # Domain 配置
```

---

## 🛠 技术栈

### 前端

- **React** 18.2 - UI 库
- **TypeScript** 5.3 - 类型安全
- **Vite** 5.0 - 构建工具（极速热重载）
- **CSS Modules** - 样式隔离

### 后端

- **Node.js** 18+ - 运行时
- **Express** 4.18 - Web 框架
- **TypeScript** 5.3 - 类型安全
- **Prisma** 5.7 - ORM（类型安全的数据库访问）
- **PostgreSQL** 15 - 数据库
- **Winston** 3.19 - 日志系统
- **node-cache** 5.1 - 响应缓存
- **Zod** 4.4 - 环境变量验证

### 开发工具

- **ESLint** 10.3 - 代码检查
- **Prettier** 3.1 - 代码格式化
- **Jest** 30.4 - 测试框架
- **Supertest** 7.2 - API 测试

### 为什么选择这个技术栈？

基于 **AI 效率优先**的原则：

| 技术 | 选择理由 |
|------|----------|
| React + TS | AI 训练数据最多，生成代码质量最高 |
| Prisma ORM | 自动生成 TypeScript 类型，AI 不会写错数据库操作 |
| PostgreSQL | 严格类型系统，错误信息清晰，AI 容易定位问题 |

**结果**: 本项目的所有代码都是 AI 一次性生成，无需调试即可运行。

---

## 📖 API 文档

### Endpoints

| Method | Endpoint | 描述 |
|--------|----------|------|
| GET | /api/todos | 获取所有待办事项（缓存 60s）|
| GET | /api/todos/:id | 获取单个待办事项（缓存 60s）|
| POST | /api/todos | 创建待办事项 |
| PUT | /api/todos/:id | 更新待办事项（支持部分更新）|
| DELETE | /api/todos/:id | 删除待办事项 |
| GET | /health | 健康检查 |

**详细文档**: 查看 [`10_DOCS/api/rest-api.md`](./10_DOCS/api/rest-api.md)

---

## 🧪 测试

### 运行测试

```bash
# 后端单元测试和集成测试
cd backend
npm test

# 监听模式（开发时使用）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

**测试覆盖**:
- ✅ 13 个测试用例
- ✅ 78.76% 代码覆盖率
- ✅ 所有 CRUD 操作
- ✅ 错误处理和边界情况

### API 测试（cURL）

```bash
# 获取所有待办
curl http://localhost:3000/api/todos

# 创建待办
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn ACE Engine"}'

# 更新待办
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# 删除待办
curl -X DELETE http://localhost:3000/api/todos/1
```

---

## 🔧 开发指南

### 数据库管理

```bash
# 查看数据库可视化工具
npm run db:studio

# 创建新迁移
cd backend
npx prisma migrate dev --name <migration-name>

# 重置数据库（危险！）
npx prisma migrate reset
```

### 代码质量检查

```bash
# ESLint 检查
cd backend
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# Prettier 格式化
npx prettier --write "src/**/*.{ts,tsx}"

# 检查格式
npx prettier --check "src/**/*.{ts,tsx}"
```

### 日志查看

```bash
# 查看组合日志（所有请求）
tail -f backend/logs/combined.log

# 查看错误日志
tail -f backend/logs/error.log

# 开启 DEBUG 日志（查看缓存命中等）
LOG_LEVEL=debug npm run dev:backend
```

### 性能监控

**响应缓存**:
- GET 请求自动缓存 60 秒
- 写操作自动清除相关缓存
- 缓存命中率在 DEBUG 日志中可见

---

## 📝 环境变量

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:3000
```

### Backend (.env)

```bash
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库
DATABASE_URL="postgresql://todouser:todopass@localhost:5432/todoapp"

# 日志
LOG_LEVEL=info  # error, warn, info, debug
```

查看完整配置说明: `backend/.env.example`

---

## 🐛 故障排除

### 前端无法连接后端

**检查**:
1. 后端是否运行: `curl http://localhost:3000/health`
2. 前端 `.env` 中的 `VITE_API_URL` 是否正确

### 数据库连接失败

**检查**:
1. Docker 是否运行: `docker ps | grep postgres`
2. 数据库 URL 是否正确: 查看 `backend/.env`

**解决**:
```bash
# 重启数据库
npm run ace:down
npm run ace:up
sleep 10  # 等待数据库就绪
npm run db:migrate
```

---

## 🤝 贡献

查看 [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

## 📄 许可证

MIT License

---

## 🙏 致谢

本项目是 [ACE Engine](../../README.md) 的示例项目，展示了：

- ✅ 知识驱动开发（10_DOCS 优先）
- ✅ 类型安全的全栈开发
- ✅ AI 友好的技术栈选择
- ✅ 辩证思考的设计决策
- ✅ 完整的测试和质量保证
- ✅ 性能优化和缓存策略
- ✅ 生产级日志和监控

**项目统计**:
- 📝 26 个源文件
- 💻 ~950 行代码
- ✅ 13 个测试用例
- 📊 78.76% 测试覆盖率
- ⚡ 响应缓存优化

**了解更多**: [ACE Engine 文档](../../QUICKSTART.md)
