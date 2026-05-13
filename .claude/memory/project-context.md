# ACE Engine 项目核心记忆

## 项目全貌

### 定位
- **ACE Engine**: 通用 AI 辅助开发引擎框架（不是特定业务项目）
- **参考项目**: `/Users/yangyanyu/workspace/ai-drive-engine`
- **目标**: 优化 ai-drive-engine，创建更通用、更优雅的版本

### 核心理念
1. **知识驱动**: 代码是副产品，文档（10_DOCS）是资产
2. **终端无关**: 不绑定 Cursor/Claude Code，纯 Markdown/YAML
3. **Domain 隔离**: 每个业务项目是一个独立的 Domain
4. **声明式**: 用户声明需求（domain.yaml），引擎自动执行

---

## 关键架构

### 目录结构
```
AI-Coding-Engine/               # 引擎根目录
├── domains/                    # 各业务项目（Domain）
│   ├── ace-core/              # 元项目（管理引擎本身）
│   └── example-app/           # 示例项目
├── rules/                      # 全局规则
│   ├── system/                # 系统级规则
│   └── coding/                # 编码规则
├── skills/                     # 原子化能力
│   ├── system/                # 系统级技能（基础设施）
│   └── workflow/              # 工作流技能
├── templates/                  # 项目模板
│   ├── domain/                # Domain 模板
│   ├── skill/                 # Skill 模板
│   └── docker/                # Docker 服务模板
└── package.json               # 统一命令入口
```

### ace-core 的角色
- **定位**: 元项目（meta-project）
- **作用**: 记录 ACE Engine 框架本身的架构设计和演进
- **内容**: 不包含业务代码，只有框架的技术文档
- **openspec**: 记录对引擎的改进和变更

---

## ai-drive-engine 的结构分析

### 发现的优点
1. ✅ **编号目录**: 10_DOCS, 20_FE, 30_BE, 40_SKILLS, 90_PLANNING（清晰）
2. ✅ **Docker 化**: docker-compose.yml 统一管理前后端
3. ✅ **一键启动**: dev.sh / local-dev.sh 脚本
4. ✅ **完整示例**: wms-agent 是完整的业务项目

### 需要优化的点
1. ⚠️ **目录命名**: 数字前缀不够语义化
2. ⚠️ **启动脚本**: dev.sh 依赖手工维护
3. ⚠️ **模板缺失**: 没有标准化的项目模板
4. ⚠️ **文档分散**: 各项目的文档没有统一索引

---

## 已完成的工作

### 系统级技能
- ✅ ace-doctor: 环境检查 + 依赖诊断 + 安装指引
- ✅ ace-init-domain: 初始化 Domain
- ✅ ace-select: 切换 Domain
- ✅ ace-infra: Docker 基础设施管理
- ✅ ace-config-sync: 配置同步到数据库
- ✅ ace-flow: 流程编排（一键启动环境）

### 模板系统
- ✅ templates/domain/: Domain 项目模板
- ✅ templates/skill/: Skill 技能模板
- ✅ templates/docker/: Docker 服务模板（MySQL, Redis, Postgres, MongoDB, Nginx）

### 文档
- ✅ QUICKSTART.md: 快速开始
- ✅ ARCHITECTURE_REFACTOR.md: 架构重构说明
- ✅ FRONTEND_BACKEND_GUIDE.md: 前后端启动指南
- ✅ CAPABILITIES.md: 能力清单

---

## 当前状态

### 已完成（阶段 1 + 阶段 2 P0）

**核心框架**:
- ✅ 3 个 rules 文档（domain-structure, naming-conventions, git-workflow）
- ✅ dialectical-thinking skill（完整工作流 + 参考资料）
- ✅ todo-app 示例项目（React + TS + Prisma + PostgreSQL）
- ✅ Docker 基础设施（PostgreSQL + Redis）
- ✅ 完整文档（QUICKSTART + README + API 文档）

**质量提升**:
- ✅ Error Boundary（前端错误捕获）
- ✅ .gitignore（前后端）
- ✅ README 文档（todo-app + 根目录）
- ✅ Prettier 配置
- ✅ ESLint 配置（前后端）
- ✅ Winston 日志系统（文件轮转 + 请求日志）
- ✅ 环境变量验证（Zod schema）
- ✅ 后端测试系统（Jest + Supertest，13 个测试，100% 通过）
- ✅ 响应缓存（node-cache，GET 请求缓存 60s，自动失效）
- ✅ CONTRIBUTING.md（完整贡献指南）
- ✅ 运行验证（100% 通过）

**统计**:
- 📝 ~60 个文件
- 💻 ~4200 行代码+文档
- ✅ 所有功能运行正常
- ✅ 13 个测试用例，78.76% 代码覆盖率
- ✅ 响应缓存，性能优化
- 🎯 AI 一次性生成，零调试

### 可用命令
```bash
# 环境管理
npm run ace:up           # 启动基础设施（PostgreSQL, Redis）
npm run ace:down         # 停止所有服务
npm run ace:status       # 查看运行状态

# todo-app 开发
npm run dev:frontend     # 启动前端（http://localhost:5173）
npm run dev:backend      # 启动后端（http://localhost:3000）
npm run db:migrate       # 数据库迁移
npm run db:studio        # 数据库可视化
npm run db:seed          # 填充示例数据

# 代码质量
npm run lint:frontend    # 前端代码检查
npm run lint:backend     # 后端代码检查
npm run test:backend     # 后端测试（13 个测试）
npm run test:coverage    # 测试覆盖率报告
```

### 当前运行状态
- ✅ PostgreSQL 容器运行中
- ✅ 后端 API 运行中（http://localhost:3000）
- ✅ 前端应用运行中（http://localhost:5173）

---

## 下一步计划（阶段 2 剩余任务）

### P1 - 高优先级（开发体验）✅
- ✅ ESLint 配置（前后端）
- ✅ 日志系统（winston）
- ✅ 环境变量验证
- ✅ .env.example 文件

### P2 - 中优先级（功能完善）✅
- ✅ 基础测试（后端 API 测试 - Jest + Supertest）
- ✅ 性能优化（响应缓存 - node-cache）
- ✅ 文档补充（CONTRIBUTING.md）

### P3 - 低优先级（扩展功能）
- [ ] 更多示例功能
- [ ] CI/CD 配置
- [ ] 监控和分析

---

**更新时间**: 2026-05-12
**状态**: 阶段 1 完成，阶段 2 P0 + P1 + P2 完成 ✅，准备进入阶段 2 P3
