# Domain 目录结构规范

## 核心原则

每个 Domain 是一个独立的业务项目，必须遵循统一的目录结构，确保 AI 和人类都能快速理解项目组织。

---

## 标准目录结构

```
domain-name/
├── 10_DOCS/              # 文档（数字强调优先级）
│   ├── business/         # 业务文档
│   ├── technical/        # 技术文档
│   └── api/              # API 文档
├── frontend/             # 前端代码（语义化）
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/              # 后端代码（语义化）
│   ├── src/
│   ├── prisma/           # 数据库 schema（如果使用 Prisma）
│   └── package.json
├── openspec/             # OpenSpec 工作流
│   ├── changes/          # 变更记录
│   └── specs/            # 规约（已归档）
├── 90_PLANNING/          # 规划文档（数字强调优先级）
│   ├── roadmap.md
│   └── decisions.md
└── domain.yaml           # Domain 配置元数据
```

---

## 目录职责

### 10_DOCS/ - 文档优先

**为什么有数字前缀？**
- 体现 ACE ETHOS 的"知识驱动"核心理念
- 强制文档在文件树中排在最前面
- 提醒开发者：文档是资产，代码是副产品

**必需子目录**:
- `business/`: 业务规则、术语表、流程图
- `technical/`: 技术架构、选型理由、环境搭建
- `api/`: 接口定义、协议说明、示例请求

**示例文件**:
```
10_DOCS/
├── business/
│   ├── glossary.md          # 术语表
│   ├── business-rules.md    # 业务规则
│   └── user-stories.md      # 用户故事
├── technical/
│   ├── architecture.md      # 架构设计
│   ├── tech-stack.md        # 技术栈选型
│   └── setup.md             # 环境搭建
└── api/
    ├── rest-api.md          # REST API 文档
    └── examples/            # 请求示例
```

---

### frontend/ - 前端代码

**为什么语义化（无数字）？**
- 开发目录无需强制排序
- 符合业界最佳实践（Next.js、Nuxt 等都用语义化命名）
- 更专业、更清晰

**默认技术栈**: React + TypeScript + Vite

**标准结构**:
```
frontend/
├── src/
│   ├── App.tsx              # 主应用
│   ├── main.tsx             # 入口
│   ├── components/          # UI 组件
│   ├── services/            # API 调用
│   ├── types/               # TypeScript 类型
│   └── assets/              # 静态资源
├── public/                  # 公共资源
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

### backend/ - 后端代码

**默认技术栈**: Node.js + TypeScript + Express + Prisma

**标准结构**:
```
backend/
├── src/
│   ├── app.ts               # Express 应用
│   ├── server.ts            # 服务器启动
│   ├── routes/              # 路由定义
│   ├── controllers/         # 业务逻辑
│   ├── middleware/          # 中间件
│   └── utils/               # 工具函数
├── prisma/
│   ├── schema.prisma        # 数据库 schema
│   └── migrations/          # 迁移历史
├── package.json
└── tsconfig.json
```

---

### openspec/ - OpenSpec 工作流

**用途**: 记录所有变更的完整生命周期

**结构**:
```
openspec/
├── changes/                 # 进行中的变更
│   └── feature-name/
│       ├── proposal.md
│       ├── design.md
│       ├── specs/
│       └── tasks.md
└── specs/                   # 已归档的规约
    └── capability-name/
        └── spec.md
```

**工作流**: explore → plan → propose → apply → review → verify → archive

---

### 90_PLANNING/ - 规划文档

**为什么有数字前缀？**
- 强调规划的重要性
- 提醒开发者：先规划，再编码

**推荐文件**:
```
90_PLANNING/
├── roadmap.md               # 产品路线图
├── decisions.md             # 技术决策记录
└── retrospectives/          # 复盘记录
    └── 2024-Q1.md
```

---

## domain.yaml - Domain 配置

**用途**: Domain 的元数据，供 ACE Engine 工具读取

**示例**:
```yaml
name: todo-app
description: A simple TODO application demonstrating ACE Engine
version: 0.1.0

tech_stack:
  frontend: react-ts
  backend: node-ts-prisma
  database: postgresql

services:
  database:
    type: postgresql
    port: 5432
  
  backend:
    port: 3000
    dependencies:
      - database
  
  frontend:
    port: 5173
    dependencies:
      - backend

scripts:
  dev:frontend: "cd frontend && npm run dev"
  dev:backend: "cd backend && npm run dev"
  db:migrate: "cd backend && npx prisma migrate dev"
```

---

## 创建新 Domain

使用 ace-init-domain 命令：

```bash
# 使用默认模板（React + TS + Prisma）
npm run ace:init -- my-project

# 使用指定模板
npm run ace:init -- my-project --template react-ts

# 最小化（只创建目录）
npm run ace:init -- my-project --template minimal
```

---

## 违规示例（不要这样做）

❌ **错误 1**: 前后端目录有数字前缀
```
domain-name/
├── 10_DOCS/
├── 20_FRONTEND/    # ❌ 不要加数字
├── 30_BACKEND/     # ❌ 不要加数字
```

❌ **错误 2**: 没有 10_DOCS
```
domain-name/
├── frontend/
├── backend/
└── README.md       # ❌ 文档散落，没有统一的 DOCS 目录
```

❌ **错误 3**: 平铺所有文件
```
domain-name/
├── component1.tsx  # ❌ 代码平铺，没有 frontend/ backend/ 隔离
├── api.ts
└── server.ts
```

---

## 常见问题

**Q: 为什么 10_DOCS 有数字，frontend 没有？**

A: 混合模式平衡了优先级提示和专业形象。10_DOCS 和 90_PLANNING 是"强调重要性"的目录，开发目录（frontend/backend）是"日常工作"的目录，无需数字。

**Q: 可以不用 React，用 Vue 吗？**

A: 可以。使用 `--template vue-ts` 或手动修改前端技术栈。但默认是 React + TS，因为 AI 训练数据最多，生成代码质量最高。

**Q: 必须用 Prisma 吗？**

A: 不必须。但强烈推荐，因为 Prisma 的类型安全能让 AI 生成的代码更不容易出错。如果不用，可以手动修改 backend/ 的结构。

**Q: openspec/ 是必需的吗？**

A: 推荐但不强制。如果你使用 OpenSpec 工作流，会自动创建。如果不使用，可以删除。

---

**更新时间**: 2026-05-11  
**维护者**: ACE Engine Team
