# 贡献指南

感谢您对 AI Coding Engine 的关注！本文档将帮助您了解如何为项目做出贡献。

## 开始之前

### 环境要求

- **Node.js**: >= 18.0.0
- **Docker**: >= 20.10.0
- **Git**: >= 2.30.0

### 必读文档

- [README.md](README.md) - 项目概述
- [QUICKSTART.md](QUICKSTART.md) - 快速开始指南
- [rules/system/domain-structure.md](rules/system/domain-structure.md) - 目录结构规范
- [rules/coding/naming-conventions.md](rules/coding/naming-conventions.md) - 命名规范
- [rules/coding/git-workflow.md](rules/coding/git-workflow.md) - Git 工作流

## 开发流程

### 1. Fork 和克隆

```bash
# Fork 仓库到你的 GitHub 账号
# 然后克隆到本地
git clone https://github.com/YOUR_USERNAME/AI-Coding-Engine.git
cd AI-Coding-Engine
```

### 2. 安装依赖

```bash
# 安装根目录依赖（如果有）
npm install

# 进入具体的 Domain 安装依赖
cd domains/todo-app/backend
npm install

cd ../frontend
npm install
```

### 3. 启动开发环境

```bash
# 返回项目根目录
cd ../../..

# 启动基础设施（PostgreSQL, Redis）
npm run ace:up

# 启动后端开发服务器
npm run dev:backend

# 启动前端开发服务器（新终端）
npm run dev:frontend
```

### 4. 创建分支

```bash
# 基于 main 创建功能分支
git checkout -b feature/your-feature-name

# 或者 bug 修复分支
git checkout -b fix/your-bug-fix
```

### 5. 编写代码

#### 代码规范

- **TypeScript**: 使用严格模式
- **命名规范**: 遵循 [naming-conventions.md](rules/coding/naming-conventions.md)
- **代码风格**: 使用 Prettier 格式化
- **Linting**: 使用 ESLint 检查

```bash
# 运行 ESLint 检查
npm run lint:frontend
npm run lint:backend

# 自动修复问题
npm run lint:fix:frontend
npm run lint:fix:backend
```

#### 测试

在提交代码前，确保所有测试通过：

```bash
# 运行后端测试
npm run test:backend

# 查看测试覆盖率
npm run test:coverage
```

新功能必须包含测试用例：

- 单元测试：测试独立的函数和类
- 集成测试：测试 API 端点
- 覆盖率目标：> 70%

### 6. 提交代码

#### Commit 消息格式

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具链相关

**示例**:

```bash
# 新功能
git commit -m "feat(todo): add filter by status feature"

# Bug 修复
git commit -m "fix(api): handle null value in todo update"

# 文档更新
git commit -m "docs(readme): update installation steps"
```

### 7. 推送和创建 PR

```bash
# 推送到你的 Fork
git push origin feature/your-feature-name

# 在 GitHub 上创建 Pull Request
# 填写 PR 模板中的所有必需信息
```

## Pull Request 指南

### PR 标题

格式与 Commit 消息相同：

```
feat(todo): add filter by status feature
```

### PR 描述模板

```markdown
## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化

## 变更说明
简要描述这个 PR 做了什么。

## 相关 Issue
Fixes #123

## 测试
- [ ] 添加了新的测试用例
- [ ] 所有现有测试通过
- [ ] 手动测试通过

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 已运行 ESLint 且无错误
- [ ] 已运行 Prettier 格式化
- [ ] 添加了必要的文档
- [ ] 更新了相关的 CHANGELOG
```

### Code Review 流程

1. **自我审查**: 提交前先自己检查一遍
2. **CI 检查**: 确保所有自动化检查通过
3. **评审反馈**: 及时响应评审者的意见
4. **修改完善**: 根据反馈修改代码
5. **最终批准**: 至少需要 1 位维护者批准

## 项目结构指南

### Domain 结构

每个 Domain（业务项目）遵循标准结构：

```
domains/your-domain/
├── 10_DOCS/              # 文档（带编号）
│   ├── README.md
│   └── API.md
├── 90_PLANNING/          # 规划（带编号）
│   └── openspec/
├── frontend/             # 前端（语义化）
│   ├── src/
│   └── package.json
├── backend/              # 后端（语义化）
│   ├── src/
│   └── package.json
└── docker-compose.yml
```

详见 [domain-structure.md](rules/system/domain-structure.md)

### 文件命名

- **组件**: PascalCase - `TodoItem.tsx`
- **工具函数**: camelCase - `formatDate.ts`
- **路由文件**: kebab-case - `todo-routes.ts`
- **配置文件**: kebab-case - `eslint.config.js`

详见 [naming-conventions.md](rules/coding/naming-conventions.md)

## 常见任务

### 添加新的 Domain

```bash
# 使用 ace-init-domain skill
# 或手动创建并遵循标准结构
```

### 添加新的数据库迁移

```bash
cd domains/your-domain/backend
npx prisma migrate dev --name your_migration_name
```

### 更新依赖

```bash
# 检查过期的依赖
npm outdated

# 更新依赖
npm update

# 或者手动更新 package.json 后
npm install
```

## 技术栈

### 后端
- **框架**: Express.js
- **语言**: TypeScript
- **ORM**: Prisma
- **数据库**: PostgreSQL
- **缓存**: node-cache
- **日志**: Winston
- **测试**: Jest + Supertest

### 前端
- **框架**: React 18
- **语言**: TypeScript
- **构建工具**: Vite
- **样式**: CSS Modules
- **HTTP 客户端**: fetch API

### DevOps
- **容器**: Docker + Docker Compose
- **代码质量**: ESLint + Prettier
- **Git**: Conventional Commits

## 调试技巧

### 后端调试

```bash
# 查看日志
tail -f domains/todo-app/backend/logs/combined.log

# 查看错误日志
tail -f domains/todo-app/backend/logs/error.log

# 设置日志级别为 debug
LOG_LEVEL=debug npm run dev:backend
```

### 数据库调试

```bash
# 打开 Prisma Studio
npm run db:studio

# 查看数据库连接
docker exec -it ace-postgres psql -U todouser -d todoapp
```

### 缓存调试

缓存调试信息会在日志级别为 `debug` 时输出：

```bash
LOG_LEVEL=debug npm run dev:backend
```

## 获取帮助

### 资源

- **文档**: 查看 `10_DOCS/` 目录
- **示例**: 参考 `domains/todo-app/`
- **Rules**: 阅读 `rules/` 目录下的规范

### 提问

- **GitHub Issues**: 报告 bug 或提出功能请求
- **GitHub Discussions**: 一般性讨论和问题

## 行为准则

### 基本原则

- **尊重他人**: 对所有贡献者保持友好和尊重
- **建设性反馈**: 提供具体、可操作的建议
- **开放心态**: 接受不同的观点和解决方案
- **协作精神**: 我们共同努力构建更好的项目

### 不可接受的行为

- 骚扰、歧视或攻击性言论
- 发布他人隐私信息
- 故意破坏项目或恶意提交
- 其他不专业或不道德的行为

## 许可证

贡献代码即表示您同意在 MIT 许可证下分发您的贡献。

---

**感谢您的贡献！** 🎉

如有任何问题，请随时在 Issues 中提出。
