# ACE Engine — AI 协作指令

> ACE Engine 的**唯一执行入口**。所有 AI 助手（Claude Code、Cursor 等）启动时必须加载本文件。
> 
> **核心哲学**: [ETHOS.md](ETHOS.md) | **快速开始**: [QUICKSTART.md](QUICKSTART.md) | **交互模型**: [docs/INTERACTION_MODEL.md](docs/INTERACTION_MODEL.md)

---

## 🚀 启动流程 (强制执行)

**无论用户第一条消息是什么，AI 必须先完成初始化，禁止在加载完成前回复。**

### 1. 加载全局规则

批量读取 `rules/*.md` 所有文件（辩证思考、代码质量、变更隔离等）。

### 2. 检测工作目录

```bash
# 执行一次，判断当前位置
pwd | grep -q "domains/" && echo "子项目" || echo "根目录"
```

- **根目录** (`/AI-Coding-Engine/`): 项目管理模式（创建项目、环境初始化）
- **子项目** (`/AI-Coding-Engine/domains/{project}/`): 开发模式（OpenSpec 工作流）

### 3. 加载项目配置 (如在子项目)

读取以下文件：
- `domain.yaml` - 项目配置
- `10_DOCS/` - 业务和技术文档
- `openspec/` - 变更提案和规格

---

## 🎯 核心理念 (ETHOS)

1. **辩证思考**: 先思后行，拒绝反射式编码
2. **知识驱动**: 代码是副产品，文档和 Skills 是资产
3. **工具中立**: 不绑定特定 IDE，纯 Markdown/YAML 存储
4. **AI-First**: 用户对 AI 说话 → AI 调用 Skills → 自动化执行

详见 [ETHOS.md](ETHOS.md)

---

## 🛠 可用 Skills

### 项目管理 Skills (根目录)

用户通过**自然语言**触发，无需记忆命令。

| 用户说 | AI 调用 | 功能 |
|--------|---------|------|
| "初始化开发环境" | `ace-init-env` | 检查并**自动安装** Node.js、Docker、Git（跨平台） |
| "创建项目 blog-app" | `ace-create-project` | 生成完整项目结构（Docker、start.sh、domain.yaml） |
| "检查系统健康" | `ace-doctor` | 诊断环境和配置问题 |

**示例对话**:
```
用户: "初始化环境"
AI: 调用 ace-init-env
    → 检测系统（macOS/Ubuntu/CentOS）
    → 检查 Node.js ✅ / Docker ❌ / Git ✅
    → 自动安装 Docker
    → 输出：✅ 环境就绪！

用户: "创建项目 my-blog"
AI: 调用 ace-create-project
    → 生成 domains/my-blog/
    → 分配端口 5433（避免冲突）
    → 输出：📂 位置: domains/my-blog
```

---

### 开发 Skills (子项目)

当在 `domains/{project}/` 目录时可用。

#### 核心工作流 Skills

| 用户说 | Skill | 说明 |
|--------|-------|------|
| "探索需求" | `ace-explore` | 苏格拉底式对话，澄清需求，探索问题空间 |
| "创建提案" | `ace-propose` | 生成 proposal/design/specs/tasks + **复杂度评估** |
| "实现变更" | `ace-apply` | 执行 tasks.md 中的任务 + **自动建议 review/verify** |
| "代码审查" | `review` | 检查代码质量和规范 + **自动修复简单问题** |
| "验证功能" | `verify` | 运行测试，验证功能正确性 + **复杂度感知** |
| "归档变更" | `ace-archive` | 归档变更 + **沉淀知识到 10_DOCS/** |

**工作流（带流程守卫）**:
```
explore → propose → apply → review → verify → archive
          ↓         ↓        ↓        ↓        ↓
       评估复杂度  前置检查  前置检查  前置检查  前置检查
```

**流程守卫机制** ⭐：
- **复杂度感知**：变更自动分类为简单/中等/复杂，不同流程要求
- **前置检查**：每个 Skill 自动验证前置步骤是否完成
- **状态日志**：所有操作记录到 `.claude/state/*.jsonl`，跨会话持久化
- **灵活跳过**：简单变更允许跳过 review/verify，复杂变更强制完整流程

#### 流程守卫决策树

```
用户说 "创建提案"
  ↓
ace-propose 评估复杂度
  ├─ 简单（文档、typo、CSS）
  │   → 流程: propose → apply → archive
  │   → 可跳过: review、verify
  │
  ├─ 中等（单文件功能、UI 组件）
  │   → 流程: propose → apply → review → archive
  │   → 可跳过: verify（建议运行）
  │
  └─ 复杂（多文件、架构、数据库）
      → 流程: propose → apply → review → verify → archive
      → 不可跳过任何步骤

用户说 "运行 review"
  ↓
review 前置检查
  ├─ apply 功能任务未完成？
  │   → ❌ 阻止："请先运行 ace-apply 完成功能实现"
  │
  └─ apply 功能任务已完成？
      → ✅ 继续执行 review

用户说 "跳过 review 直接 verify"
  ↓
verify 复杂度检查
  ├─ 简单/中等变更？
  │   → ⚠️ 警告："建议运行 review 以保证质量"
  │   → 询问确认 → 允许继续
  │
  └─ 复杂变更？
      → ❌ 阻止："复杂变更必须完整流程"
      → 建议："如需强制，明确说'强制运行'"
```

#### ACE 增强对比官方 Skills

| Skill | 官方版本 | ACE 增强版 | 增强内容 |
|-------|---------|-----------|---------|
| propose | openspec-propose | **ace-propose** | + 复杂度评估<br>+ 加载 domain.yaml/10_DOCS/rules<br>+ 自动添加测试任务<br>+ 建议 dialectical-thinking |
| apply | openspec-apply | **ace-apply** | + 前置检查（tasks 是否 ready）<br>+ ACE 特定任务处理（10_DOCS/、domain.yaml）<br>+ 自动建议 review/verify |
| review | ❌ 无 | **review** | + 读取 domain.yaml 编码规范<br>+ 自动修复简单问题<br>+ 检查 10_DOCS/ 一致性<br>+ 前置检查（apply 功能任务） |
| verify | ❌ 无 | **verify** | + 读取 domain.yaml 测试要求<br>+ 复杂度感知前置检查<br>+ 集成 start.sh 测试环境 |
| archive | openspec-archive | **ace-archive** | + 知识沉淀到 10_DOCS/<br>+ 生成变更摘要<br>+ 复杂度感知前置检查 |

**薄封装设计**：ACE Skills 委托官方 Skills 完成核心逻辑，仅做前置增强和后置处理，享受官方更新。

---

## 📐 交互模型 (AI-First)

### AI 的领域 (根目录)

用户对 AI 说话 → AI 调用 Skills → 自动化执行

```
用户: "初始化环境"
  ↓
AI 调用 ace-init-env
  ↓
自动检测系统 + 安装缺失工具
  ↓
输出环境报告
```

### 用户的领域 (子项目终端)

直接在终端执行命令：

```bash
cd domains/my-app
./start.sh           # 一键启动（Docker + 依赖 + 迁移）
npm run dev          # 启动服务
pkill -f 'vite|tsx'  # 停止服务
```

**详细说明**: [docs/INTERACTION_MODEL.md](docs/INTERACTION_MODEL.md)

---

## 📁 项目结构

```
AI-Coding-Engine/
├── domains/                  # 业务项目（完全独立）
│   ├── todo-app/             # 示例项目 ⭐
│   │   ├── docker-compose.yml   # 独立 Docker（端口 5432）
│   │   ├── start.sh             # 一键启动脚本
│   │   ├── domain.yaml          # 项目配置
│   │   ├── 10_DOCS/             # 知识文档
│   │   ├── frontend/            # React 前端
│   │   ├── backend/             # Node.js 后端
│   │   └── openspec/            # 变更提案和规格
│   └── my-blog/              # 新项目（自动生成）
│       ├── docker-compose.yml   # 独立 Docker（端口 5433）
│       └── ...
│
├── skills/                   # AI 可调用能力
│   ├── system/               # 系统级（环境、项目管理）
│   └── workflow/             # 工作流（OpenSpec）
│
├── templates/                # 项目模板
│   └── domain-react-ts/      # React + Node.js 模板
│
├── rules/                    # 全局规则
├── docs/                     # 引擎文档
├── AGENTS.md                 # 本文件（AI 入口）⭐
├── ETHOS.md                  # 核心哲学
└── README.md                 # 用户入口
```

---

## 🔧 决策原则

执行任何任务前，遵循以下原则：

1. **沉淀优先**: 能沉淀为 10_DOCS 或 Skills 的方案优先
2. **规范驱动**: 有规范遵循规范，无规范先建规范
3. **知识检索**: 做事前先查 `skills/` 和 `10_DOCS/`
4. **最小惊讶**: 遵循项目已有的编码模式
5. **全员可读**: 注释、提交信息、文档用业务语言
6. **验证闭环**: 任何代码变更必须有可执行的验证

---

## 📚 相关文档

- [ETHOS.md](ETHOS.md) - 核心哲学：辩证思考、知识驱动
- [QUICKSTART.md](QUICKSTART.md) - 10 分钟快速上手
- [README.md](README.md) - 项目总览和特性
- [docs/INTERACTION_MODEL.md](docs/INTERACTION_MODEL.md) - AI-First 交互模型详解
- [CONTRIBUTING.md](CONTRIBUTING.md) - 贡献指南

---

## 🆘 故障排除

| 问题 | 解决方案 |
|------|---------|
| 环境检查失败 | 对 AI 说："初始化环境"（自动安装缺失工具） |
| 项目启动失败 | 检查 Docker 是否运行：`docker ps` |
| 端口冲突 | 修改 `.env` 中的 `DB_PORT` |
| Skills 未生效 | 检查是否在正确目录（根目录 vs 子项目） |

**完整故障排除**: 对 AI 说 "检查系统健康"

---

**🎯 核心思想**：
- 用户不需要记命令
- AI 理解意图，自动调用 Skills
- 终端只用于子项目运行

**开始使用**: 对 AI（Claude Code/Cursor）说："初始化环境" 🚀
