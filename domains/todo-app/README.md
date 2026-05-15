# TODO App

ACE Engine 的示例项目 — 一个全栈待办事项应用，用于验证和演示引擎的完整工作流。

## 快速开始

```bash
# 一键启动（Docker + 后端 + 前端）
./start.sh

# 查看服务状态
./status.sh
```

访问 http://localhost:5173

### 手动启动

```bash
npm run ace:up                       # 启动 PostgreSQL
cd backend && npm install && npm run db:migrate && npm run dev
cd frontend && npm install && npm run dev
```

## 技术栈

| 层 | 技术 | 选型理由 |
|----|------|----------|
| 前端 | React 18 + TypeScript + Vite | AI 训练数据最多，生成质量最高 |
| 后端 | Express + TypeScript + Prisma | 自动生成类型，AI 不会写错数据库操作 |
| 数据库 | PostgreSQL 15 | 严格类型系统，错误信息清晰 |
| 测试 | Vitest + Supertest | 快速反馈循环 |

## 项目结构

```
todo-app/
├── frontend/              # React 前端
│   └── src/
├── backend/               # Express API
│   ├── src/
│   └── prisma/            # 数据库 schema + 迁移
├── docs/wiki/             # 项目知识库
│   └── glossary.md        # 术语表
├── openspec/              # 变更提案和历史
│   └── changes/           # 每次变更的 proposal/design/tasks
├── domain.yaml            # 项目配置（技术栈、脚本、服务）
└── CLAUDE.md              # AI 协作指令
```

## API

| Method | Endpoint | 描述 |
|--------|----------|------|
| GET | /api/todos | 获取所有待办（缓存 60s）|
| POST | /api/todos | 创建待办 |
| PUT | /api/todos/:id | 更新待办 |
| DELETE | /api/todos/:id | 删除待办 |
| GET | /health | 健康检查 |

## 开发

```bash
cd backend && npm test           # 后端测试
cd backend && npx prisma studio  # 数据库可视化
```

## 与 ACE Engine 的关系

这个项目是 ACE Engine 的"练兵场" — 引擎的新能力（agent 增强、hooks、commands）都在这里实战验证。它不是独立产品，而是驱动引擎进化的载体。

详见：[ACE Engine](../../README.md)
