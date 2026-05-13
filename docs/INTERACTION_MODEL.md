# ACE Engine 交互模型

本文档说明用户与 ACE Engine 的交互边界和工作流程。

---

## 核心理念：AI-First

ACE Engine 采用 **AI-First** 设计理念：
- 用户通过**对 AI 说话**完成根目录的所有操作
- 终端**仅用于子项目**的运行和调试
- 无需记忆复杂的命令行指令

---

## 交互边界

### AI 的领域（根目录操作）

用户对 AI（Claude Code/Cursor）说话，AI 自动调用 Skills：

| 用户说 | AI 调用 | 作用 |
|--------|---------|------|
| "初始化开发环境" | `ace-init-env` | 检查 Node.js、Docker、Git |
| "创建项目 my-app" | `ace-create-project` | 生成完整项目结构 |
| "检查系统健康" | `ace-doctor` | 诊断环境和配置问题 |

**特点**：
- ✅ 自然语言触发，支持中英文
- ✅ 自动执行，无需用户记忆命令
- ✅ 输出清晰反馈和下一步指引

---

### 用户的领域（子项目操作）

在终端直接执行命令，控制特定子项目：

```bash
# 进入子项目
cd domains/todo-app

# 一键启动项目（Docker + 依赖 + 迁移）
./start.sh

# 启动后端（新终端）
cd backend && npm run dev

# 启动前端（新终端）
cd frontend && npm run dev

# 停止服务
pkill -f 'vite|tsx.*todo-app'
```

**特点**：
- ✅ 直接控制，实时反馈
- ✅ 传统终端操作，符合开发者习惯
- ✅ 独立于根目录，不依赖全局配置

---

## 工作流程示例

### 场景 1: 新用户第一次使用

**步骤**：

1. **用户对 AI 说**："初始化开发环境"
   - AI 调用 `ace-init-env`
   - 检查 Node.js、Docker、Git
   - 输出环境报告

2. **用户对 AI 说**："创建一个新项目叫 blog-app"
   - AI 调用 `ace-create-project`
   - 自动生成 `domains/blog-app/` 完整结构
   - 分配独立端口（如 5433）

3. **用户在终端操作**：
   ```bash
   cd domains/blog-app
   ./start.sh
   ```

4. **用户在新终端启动服务**：
   ```bash
   cd domains/blog-app/backend && npm run dev
   cd domains/blog-app/frontend && npm run dev
   ```

---

### 场景 2: 多项目并行开发

**步骤**：

1. **用户对 AI 说**："创建项目 user-service"
   - AI 自动分配端口 5434（避免与 5433 冲突）

2. **用户在终端同时运行两个项目**：
   ```bash
   # 终端 1: blog-app
   cd domains/blog-app/backend && npm run dev

   # 终端 2: user-service
   cd domains/user-service/backend && npm run dev
   ```

3. **结果**：
   - blog-app 使用端口 5433
   - user-service 使用端口 5434
   - 无端口冲突，数据完全隔离

---

## 设计原则

### 1. 关注点分离

| 层级 | 关注点 | 交互方式 |
|------|--------|----------|
| 根目录 | 项目管理、环境配置 | 对 AI 说话 |
| 子项目 | 代码开发、服务运行 | 终端命令 |

### 2. 降低认知负担

- **无需记忆命令**：`npm run ace:up`、`npm run ace:create-project` 等对用户隐藏
- **自然语言优先**："创建项目" 比 "执行 ace:create-project" 更直观
- **AI 是助手**：用户描述需求，AI 负责执行

### 3. 保持灵活性

- **AI 可选**：高级用户仍可直接运行 `node skills/system/ace-init-env/executor.mjs`
- **终端优先**：开发时的核心工作（启动服务、调试）仍在终端完成
- **渐进增强**：新手用 AI，老手用终端，互不冲突

---

## 常见问题

### Q: 为什么不把 `./start.sh` 也改成 AI 调用？

**A**: 因为 `start.sh` 是开发时的**高频操作**，终端直接执行更高效。AI 适合**低频的初始化操作**。

### Q: package.json 里的 `ace:*` 命令是干什么的？

**A**: 它们是 **AI 的元数据**，用于 Skills 调用。用户不需要手动执行。

### Q: 我可以不用 AI，直接运行命令吗？

**A**: 可以！高级用户可以直接运行：
```bash
node skills/system/ace-init-env/executor.mjs
node skills/system/ace-create-project/executor.mjs my-app
```

但普通用户通过 AI 更简单。

---

## 总结

```
┌─────────────────────────────────────────────────────┐
│              ACE Engine 交互模型                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│   【AI 的领域】                                     │
│   ┌───────────────────────────────────┐            │
│   │ "初始化环境"                       │            │
│   │ "创建项目"                         │            │
│   │ "检查健康"                         │            │
│   └─────────────┬─────────────────────┘            │
│                 │ AI 自动调用                       │
│                 ▼                                   │
│         ┌───────────────┐                          │
│         │ Skills        │                          │
│         │ (executor.mjs)│                          │
│         └───────┬───────┘                          │
│                 │ 生成                              │
│                 ▼                                   │
│   ┌─────────────────────────────────┐              │
│   │  domains/my-app/                │              │
│   │  ├── docker-compose.yml         │              │
│   │  ├── start.sh                   │              │
│   │  ├── frontend/                  │              │
│   │  └── backend/                   │              │
│   └─────────────┬───────────────────┘              │
│                 │                                   │
│                 ▼                                   │
│   【用户的领域】                                    │
│   ┌───────────────────────────────────┐            │
│   │ cd domains/my-app                 │            │
│   │ ./start.sh                        │            │
│   │ npm run dev                       │            │
│   └───────────────────────────────────┘            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**核心思想**：
- AI 负责创建和配置（低频、复杂）
- 用户负责开发和运行（高频、直接）
- 各司其职，体验最优
