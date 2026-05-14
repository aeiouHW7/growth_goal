# ACE Engine

**AI Coding Engine** - 企业级 AI 辅助开发引擎

一个通用的、可复用的 AI 辅助开发框架，通过知识驱动和辩证思考，让 AI 成为真正高效的开发伙伴。

![](https://img.shields.io/badge/Status-MVP-green)
![](https://img.shields.io/badge/Version-0.1.0-blue)
![](https://img.shields.io/badge/License-MIT-yellow)

---

## 🎯 核心理念（ETHOS）

1. **终端无关**: 知识资产（Markdown/YAML）是核心，工具是消耗品
2. **知识驱动**: 代码是副产品，文档（10_DOCS）是资产
3. **辩证思考**: 禁止直接编码，必须进行方案对比和自我质疑

---

## ✨ 为什么选择 ACE Engine？

### 传统开发的痛点

- ❌ AI 直接编码，缺少思考过程
- ❌ 文档滞后，知识散落
- ❌ 技术选型凭感觉，缺少理性分析
- ❌ 每个项目从零开始，无法复用

### ACE Engine 的解决方案

- ✅ **辩证思考 Skill**: 强制 AI 质疑需求、探索多方案、理性对比
- ✅ **文档优先**: 10_DOCS 在代码之前，知识驱动开发
- ✅ **Domain 隔离**: 每个项目独立，结构统一，易于管理
- ✅ **AI 最优技术栈**: 基于 AI 训练数据量选择技术，而非主观偏好

---

## 🚀 快速开始

### 💬 对 AI 说话创建项目（推荐）⭐

**第一步：部署环境**

用户: "初始化环境"
- AI 自动检查 Node.js、Docker、Git
- 自动安装缺失的工具

**第二步：创建项目**

用户: "创建一个新项目叫 blog-app"
- AI 自动生成完整项目结构
- 自动分配独立端口（避免冲突）
- 生成 Docker 配置、启动脚本

**然后在终端**：
```bash
cd domains/blog-app
./start.sh  # 自动启动所有服务（Docker + 后端 + 前端）
```

访问 http://localhost:5173 即可看到应用！

**查看服务状态**：
```bash
./status.sh  # 查看各服务运行状态
```

**详见**: [交互模型文档](./docs/INTERACTION_MODEL.md)

---

### 方式 1: 一键启动示例项目 todo-app

```bash
cd domains/todo-app
./start.sh  # 自动启动所有服务（Docker + 后端 + 前端）
```

访问 http://localhost:5173 即可看到应用！

**查看服务状态**：
```bash
./status.sh  # 查看 Docker、后端、前端的运行状态
```

---

### 方式 2: 手动克隆并启动

<details>
<parameter name="summary">点击展开详细步骤

**详细指南**: 查看 [QUICKSTART.md](./QUICKSTART.md)

---

## 📁 项目结构

```
AI-Coding-Engine/
├── domains/                    # 业务项目（Domain）
│   ├── ace-core/              # 元项目（管理引擎本身）
│   └── todo-app/              # 示例项目 ⭐
│       ├── 10_DOCS/           # 文档优先
│       ├── frontend/          # React + TypeScript
│       ├── backend/           # Node + Express + Prisma
│       └── domain.yaml        # Domain 配置
│
├── rules/                      # 全局规则
│   ├── system/                # 系统级规则
│   │   └── domain-structure.md
│   └── coding/                # 编码规则
│       ├── naming-conventions.md
│       └── git-workflow.md
│
├── skills/                     # AI 可调用能力
│   ├── system/                # 环境、项目管理（3 个）
│   ├── workflow/              # 开发工作流（9 个）⭐
│   │   ├── ace-explore/       # 探索需求
│   │   ├── ace-propose/       # 创建提案
│   │   ├── ace-apply/         # 实现变更
│   │   ├── review/            # 代码审查
│   │   ├── verify/            # 运行测试
│   │   ├── ace-archive/       # 归档变更
│   │   ├── plan/              # 需求规划
│   │   ├── investigate/       # 故障诊断
│   │   └── retro/             # 变更复盘
│   └── coding/                # 编码辅助
│       └── dialectical-thinking/  # 辩证思考 ⭐
│
├── templates/                  # 项目模板
│   ├── domain/                # Domain 模板
│   └── docker/                # Docker 服务模板
│
├── docker-compose.yml          # 基础设施
├── package.json                # 统一命令入口
└── README.md                   # 本文件
```

---

## 🎓 核心概念

### Domain（业务项目）

每个 Domain 是一个独立的业务项目，核心是 **domain.yaml** 配置文件：

```yaml
# domains/my-project/domain.yaml
name: my-project
tech_stack:
  frontend: react-ts
  backend: node-ts-prisma
  database: postgresql

services:
  database:
    type: postgresql
    port: 5432
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
```

**目录结构**：
```
my-domain/
├── domain.yaml     # 配置（定义技术栈、服务、脚本）
├── 10_DOCS/        # 文档优先（业务 + 技术 + API）
├── frontend/       # 前端代码
├── backend/        # 后端代码
├── 90_PLANNING/    # 规划文档
└── start.sh        # 一键启动脚本
```

**工作流**：
1. 编写 `domain.yaml` 声明需求
2. 系统根据配置生成基础设施
3. 运行 `start.sh` 准备环境
4. 开始开发

---

## 🔄 交互模型：AI-First

### 核心理念

ACE Engine 采用 **AI-First** 设计：
- ✅ **根目录操作** = 对 AI 说话（初始化、创建项目、健康检查）
- ✅ **子项目操作** = 终端命令（启动服务、开发调试）
- ✅ 无需记忆命令，自然语言即可

### 工作流程示例

```
用户对 AI 说："创建项目 blog-app"
      ↓
AI 调用 ace-create-project Skill
      ↓
自动生成 domains/blog-app/
├── docker-compose.yml  (独立 PostgreSQL，端口 5433)
├── start.sh            (一键启动)
├── domain.yaml
├── frontend/
└── backend/
      ↓
用户在终端：
cd domains/blog-app
./start.sh
npm run dev
```

**详细说明**: [交互模型文档](./docs/INTERACTION_MODEL.md)

---

## 🔧 完整开发工作流

**9 个 Workflow Skills** 覆盖从规划到复盘的完整生命周期。

### 核心流程（6 个必需）

```
explore → propose → apply → review → verify → archive
```

| Skill | 作用 |
|-------|------|
| **explore** | 探索需求，苏格拉底式对话 |
| **propose** | 创建提案，生成 artifacts + 复杂度评估 |
| **apply** | 实现变更，执行 tasks |
| **review** | 代码审查，自动修复 |
| **verify** | 运行测试，复杂度感知 |
| **archive** | 归档变更，沉淀到 10_DOCS/ |

### 增强 Skills（3 个可选）

| Skill | 使用场景 |
|-------|---------|
| **plan** | 复杂需求拆分、工作量评估（在 propose 前） |
| **investigate** | 故障排查、性能分析、根因定位 |
| **retro** | 变更复盘、提取经验、沉淀最佳实践 |

### 流程守卫机制 ⭐

**复杂度分类**（propose 阶段自动评估）：
- **简单**（文档、typo）：propose → apply → archive
- **中等**（单文件功能）：propose → apply → review → archive  
- **复杂**（多文件、架构）：完整流程不可跳过

**前置检查**：每个 Skill 自动验证前置步骤
**状态日志**：`.claude/state/*.jsonl` 跨会话持久化

### 使用示例

**核心流程**：
```
用户: "规划健康检查功能"
AI:   → ace-planner（Grill → PRD → 提案，评估：简单）

用户: "实现"
AI:   → ace-applier（逐任务实现，即时验证）

用户: "审查代码"
AI:   → ace-reviewer（多维度审查，自动修复，测试验证）

用户: "归档"
AI:   主 AI（读 ace-archive skill，沉淀到 10_DOCS/api/）
```

**增强场景**：
```
用户: "API 返回 500，调查原因"
AI:   → ace-investigator（定位根因）
      → ace-planner（创建修复提案）
      → ace-applier（实现修复）
      → ace-reviewer（验证修复）

用户: "复盘 add-user-auth"
AI:   → retro（W.W.L.D 分析，沉淀 JWT 最佳实践）
```

---

### Skills（技能）

**12 个 Skills** 覆盖项目全生命周期。

#### 项目管理（3 个，根目录使用）

| Skill | 触发 | 作用 |
|-------|------|------|
| ace-init-env | "初始化环境" | 检查/安装 Node.js、Docker、Git |
| ace-create-project | "创建项目 my-app" | 生成完整项目结构 |
| ace-doctor | "检查系统健康" | 环境诊断 |

#### 开发工作流（9 个，子项目使用）

**核心（6 个）**：explore → propose → apply → review → verify → archive

**增强（3 个）**：
- **plan** - 复杂需求拆分
- **investigate** - 故障排查
- **retro** - 变更复盘

详见 [完整开发工作流](#完整开发工作流)

---

### Rules（规则）

开发规范和约定：

- **系统规则**: Domain 结构、配置规范
- **编码规则**: 命名规范、Git 工作流

---

## 💡 示例项目：TODO App

一个完整的待办事项应用，展示 ACE Engine 的所有核心能力。

**技术栈**: React + TypeScript + Prisma + PostgreSQL

**特点**:
- ✅ 全栈类型安全（Prisma 自动生成类型）
- ✅ 完整的 CRUD 功能
- ✅ 10_DOCS 文档完整（业务 + 技术 + API）
- ✅ AI 一次性生成，无需调试

**查看详情**: [domains/todo-app/README.md](./domains/todo-app/README.md)

---

## 🛠 技术栈选择

### 为什么是 React + TypeScript + Prisma？

基于 **AI 效率优先** 的辩证思考：

| 技术 | AI 训练数据 | 类型安全 | 生态成熟度 | 选择理由 |
|------|------------|---------|-----------|---------|
| React + TS | ★★★ 最多 | ★★★ 全栈 | ★★★ 最成熟 | AI 生成代码质量最高 |
| Prisma ORM | ★★★ 常见 | ★★★ 自动生成 | ★★★ 文档完善 | AI 不会写错数据库操作 |
| PostgreSQL | ★★★ 极多 | ★★★ 严格 | ★★★ 最稳定 | 错误信息清晰，AI 易定位 |

**结果**: todo-app 的所有代码都是 AI 生成，一次运行成功，零调试。

**详细分析**: 查看 [dialectical-thinking 案例](./skills/capabilities/dialectical-thinking/references/examples.md)

---

## 📚 核心能力

### 开发工作流（9 个 Skills）

完整的端到端开发流程，详见 [完整开发工作流](#完整开发工作流)。

### dialectical-thinking（辩证思考）

系统化的辩证思考工具，避免 AI 的"执行者模式"。

**四阶段工作流**:
1. **Question** - 质疑问题本身
2. **Explore** - 探索 2-3 种方案
3. **Compare** - 对比权衡
4. **Decide** - 给出推荐

**使用场景**:
- 架构设计
- 技术选型
- 方案决策
- API 设计

**查看详情**: [skills/capabilities/dialectical-thinking/SKILL.md](./skills/capabilities/dialectical-thinking/SKILL.md)

---

## 📖 文档索引

### 快速开始
- [QUICKSTART.md](./QUICKSTART.md) - 10 分钟快速上手
- **[SKILLS_REFERENCE.md](./SKILLS_REFERENCE.md) - Skills 速查表** ⭐
- [TODO App README](./domains/todo-app/README.md) - 示例项目详解
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 贡献指南

### 规则和规范
- [Domain 结构规范](./rules/system/domain-structure.md)
- [命名规范](./rules/coding/naming-conventions.md)
- [Git 工作流](./rules/coding/git-workflow.md)

### 示例和验证
- [验证报告](./domains/todo-app/90_PLANNING/verification-report.md) - 运行测试结果

---

## 🔧 常用命令

### 环境管理

```bash
npm run ace:up       # 启动基础设施（PostgreSQL, Redis）
npm run ace:down     # 停止所有服务
npm run ace:status   # 查看运行状态
```

### TODO App

```bash
npm run dev:frontend   # 启动前端
npm run dev:backend    # 启动后端
npm run db:migrate     # 数据库迁移
npm run db:studio      # 数据库可视化
npm run db:seed        # 填充示例数据
npm run test:backend   # 运行后端测试
npm run lint:frontend  # 前端代码检查
npm run lint:backend   # 后端代码检查
```

---

## 🎯 路线图

### ✅ 阶段 1 (MVP) - 已完成

- [x] 核心 rules 文档（3 个）
- [x] dialectical-thinking skill
- [x] todo-app 示例项目
- [x] Docker 基础设施
- [x] 完整文档
- [x] 运行验证（100% 通过）

### 🚧 阶段 2 (进行中)

- [x] Error Boundary 错误处理
- [x] .gitignore 文件
- [x] README 文档（项目 + 根目录）
- [x] ESLint + Prettier 配置
- [x] 日志系统（Winston）
- [x] 基础测试（Jest + Supertest）
- [x] 环境变量验证（Zod）
- [x] 性能优化（响应缓存）
- [x] CONTRIBUTING.md 贡献指南

### 📅 阶段 3 (计划中)

- [ ] 用户认证示例
- [ ] 更多 Domain 模板（Vue, Next.js）
- [ ] CI/CD 配置
- [ ] 性能优化

---

## 🤝 贡献

欢迎贡献！请先阅读 [贡献指南](./CONTRIBUTING.md)。

**贡献方式**:
1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交变更 (`git commit -m 'feat(domain): add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

**提交规范**: 遵循 [Conventional Commits](https://www.conventionalcommits.org/)

**详细指南**: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📄 许可证

MIT License

---

## 🙏 致谢

### 灵感来源

- [ai-drive-engine](https://github.com/yangyanyu/workspace/ai-drive-engine) - 本项目的原型
- [Anthropic Skills](https://github.com/anthropics/skills) - Skills 设计参考
- OpenSpec - 工作流设计参考

### 技术栈

感谢以下开源项目：
- React, TypeScript, Vite
- Node.js, Express, Prisma
- PostgreSQL, Docker

---

**Built with ❤️ using ACE Engine**

*让 AI 成为真正高效的开发伙伴*
