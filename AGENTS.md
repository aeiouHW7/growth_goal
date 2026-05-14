# ACE Engine — AI 协作指令

> ACE Engine 的**唯一执行入口**。所有 AI 助手（Claude Code、Cursor 等）启动时必须加载本文件。
> 
> **核心哲学**: [ETHOS.md](ETHOS.md) | **快速开始**: [QUICKSTART.md](QUICKSTART.md) | **Skills 速查**: [SKILLS_REFERENCE.md](SKILLS_REFERENCE.md) ⭐

---

## 🚀 AI 启动流程（自动执行）

**每次会话开始，AI 自动完成初始化**（用户无需触发）：

### 1. 加载全局规则

批量读取 `rules/*.md` 所有文件（辩证思考、代码质量、变更隔离等）。

### 2. 检测工作目录

```bash
pwd | grep -q "domains/" && echo "子项目" || echo "根目录"
```

- **根目录** (`/AI-Coding-Engine/`): 项目管理模式
- **子项目** (`/domains/{project}/`): 开发模式

### 3. 加载项目配置（如在子项目）

读取以下文件：
- `domain.yaml` - 项目配置
- `10_DOCS/` - 业务和技术文档
- `openspec/` - 变更提案和规格

**完成后即可响应用户消息。**

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
| "初始化环境" | `ace-init-env` | 检查并**自动安装** Node.js、Docker、Git（跨平台） |
| "创建项目 blog-app" | `ace-create-project` | 生成完整项目结构（Docker、start.sh、domain.yaml） |
| "检查系统健康" | `ace-doctor` | 诊断环境和配置问题 |

**说明**：
- **"初始化环境"** = 部署环境准备（安装工具）
- **AI 启动初始化** = 自动加载规则和配置（无需用户触发）

**示例对话**:
```
用户: "初始化环境"（部署环境）
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

#### 核心工作流（6 个必需）

| 用户说 | Skill | 说明 |
|--------|-------|------|
| "探索需求" | ace-explore | 苏格拉底式对话，澄清需求 |
| "创建提案" | ace-propose | 生成 artifacts + 复杂度评估 |
| "实现变更" | ace-apply | 执行 tasks + 自动建议 review/verify |
| "代码审查" | review | 检查规范 + 自动修复 |
| "验证功能" | verify | 运行测试 + 复杂度感知 |
| "归档变更" | ace-archive | 归档 + 沉淀到 10_DOCS/ |

#### 增强 Skills（3 个可选）

| 用户说 | Skill | 使用场景 |
|--------|-------|---------|
| "规划 XX 功能" | plan | 复杂需求拆分、工作量评估（propose 前） |
| "调查 XX 问题" | investigate | 故障排查、性能分析、根因定位 |
| "复盘 XX 变更" | retro | 提取经验、沉淀最佳实践（archive 后） |

**工作流（带流程守卫）**:
```
plan (可选) → explore → propose → apply → review → verify → archive → retro (可选)
              ↓         ↓         ↓        ↓        ↓        ↓
           澄清需求  评估复杂度  前置检查  前置检查  前置检查  前置检查
           
investigate (可选，任意时刻用于故障排查)
```

**流程守卫机制** ⭐：
- **复杂度感知**：变更自动分类为简单/中等/复杂，不同流程要求
- **前置检查**：每个 Skill 自动验证前置步骤是否完成
- **状态日志**：所有操作记录到 `.claude/state/*.jsonl`，跨会话持久化
- **灵活跳过**：简单变更允许跳过 review/verify，复杂变更强制完整流程

#### 流程守卫决策树

```
【规划阶段】
需求复杂/边界不清？
  → plan（拆分、评估工作量）→ 生成多个 propose

需求清晰？
  → explore（澄清细节）→ propose

【开发阶段】
propose → apply → review → verify → archive
  ↓       ↓       ↓        ↓        ↓
评估复杂度 检查tasks 检查apply 检查review 检查verify
  
【故障阶段】
功能异常/性能问题？
  → investigate（根因定位）→ propose（修复方案）

【复盘阶段】
复杂变更完成后？
  → retro（W.W.L.D 分析）→ 沉淀到 10_DOCS/patterns/
```

**复杂度感知**：
- 简单：propose → apply → archive
- 中等：propose → apply → review → archive
- 复杂：完整流程（不可跳过）

#### ACE 增强对比官方 Skills

| Skill | 官方 | ACE 版本 | 增强内容 |
|-------|------|---------|---------|
| propose | openspec-propose | ace-propose | 复杂度评估、加载 domain.yaml/10_DOCS/rules |
| apply | openspec-apply | ace-apply | 前置检查、ACE 任务处理、自动建议 review/verify |
| review | ❌ | **review** | 读取 domain.yaml 规范、自动修复、前置检查 |
| verify | ❌ | **verify** | 读取 domain.yaml 测试要求、复杂度感知 |
| archive | openspec-archive | ace-archive | 知识沉淀到 10_DOCS/、复杂度感知 |
| plan | ❌ | **plan** | 需求定级、任务拆分、沉淀到 90_PLANNING/ |
| investigate | ❌ | **investigate** | 问题定性、根因定位、生成诊断报告 |
| retro | ❌ | **retro** | W.W.L.D 分析、沉淀最佳实践 |

**设计**：薄封装官方 Skills，享受官方更新

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

1. **状态总线**: 任何核心任务结束后，必须在 `.archive/ai-events.jsonl` 中记录状态。
2. **冷热分离**: `10_DOCS/raw` 仅供读取参考，`10_DOCS/wiki` 才是知识的最终归宿。
3. **防跳步机制**: 必须按顺序勾选文档中的 Checkbox，未勾选前置条件严禁执行下一步（如：未对比方案严禁编码）。
4. **沉淀优先**: 能沉淀为 10_DOCS 或 Skills 的方案优先
5. **规范驱动**: 有规范遵循规范，无规范先建规范
6. **知识检索**: 做事前先查 `skills/` 和 `10_DOCS/`
7. **最小惊讶**: 遵循项目已有的编码模式
8. **验证闭环**: 任何代码变更必须有可执行的验证

---

## 📚 相关文档

- [ETHOS.md](ETHOS.md) - 核心哲学：辩证思考、知识驱动
- [QUICKSTART.md](QUICKSTART.md) - 10 分钟快速上手
- **[SKILLS_REFERENCE.md](SKILLS_REFERENCE.md) - Skills 速查表** ⭐
- [README.md](README.md) - 项目总览和特性
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
