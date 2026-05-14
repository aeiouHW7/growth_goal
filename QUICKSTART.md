
# ACE Engine 快速开始

从零到运行 TODO App 示例项目的完整指南。

---

## 🎯 三种启动方式

### 方式 1: 一键启动 (推荐) ⭐

**适合**: 快速体验，立即看到效果

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd AI-Coding-Engine

# 2. 进入示例项目
cd domains/todo-app

# 3. 一键启动（自动完成所有步骤）
./start.sh
```

**start.sh 会自动**：
- ✅ 启动 Docker（PostgreSQL）
- ✅ 安装依赖（如果缺失）
- ✅ 运行数据库迁移
- ✅ 填充示例数据（**仅首次**，已有数据时跳过）
- ✅ **自动启动后端服务**（http://localhost:3000）
- ✅ **自动启动前端服务**（http://localhost:5173）

**无需手动启动！** start.sh 会在后台启动所有服务。

**预期输出**：
```
🚀 TODO App 启动...

1️⃣ 启动数据库...
✅ PostgreSQL 已启动

2️⃣ 准备后端...
   运行数据库迁移...
   数据库已有 5 条数据，跳过填充  # 首次会显示 "填充示例数据..."
✅ 后端就绪

3️⃣ 准备前端...
✅ 前端就绪

4️⃣ 检测服务...

5️⃣ 启动服务...
   启动后端...
   后端 PID: 12345
   启动前端...
   前端 PID: 12346

⏳ 等待服务启动...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 应用启动成功！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 访问地址:
   前端: http://localhost:5173
   后端: http://localhost:3000

💡 日志查看:
   后端: tail -f /tmp/todo-backend.log
   前端: tail -f /tmp/todo-frontend.log

📌 停止服务: pkill -f 'vite|tsx.*todo-app'
```

**访问应用**: http://localhost:5173

**查看服务状态**:
```bash
./status.sh  # 查看 Docker、后端、前端的运行状态
```

**停止服务**:
```bash
# 方法 1: 停止前后端（推荐）
pkill -f 'vite|tsx.*todo-app'

# 方法 2: 停止所有（Docker + 前后端）
cd domains/todo-app
docker-compose down
pkill -f 'vite|tsx.*todo-app'
```

---

### 方式 2: AI 辅助创建新项目 ⭐⭐⭐

**适合**: 学习 AI-First 工作流，体验 ACE Engine 核心能力

**步骤 1: 部署环境**

对 AI（Claude Code 或 Cursor）说：

```
"初始化环境"
```

AI 会自动：
- ✅ 检测操作系统（macOS/Ubuntu/CentOS）
- ✅ 检查 Node.js、Docker、Git
- ✅ 自动安装缺失的工具
- ✅ 输出环境报告

**预期输出**：
```
🔍 检查开发环境...
   系统: macOS (brew)

【必备工具】
✅ Node.js: v20.11.0
✅ Docker: 24.0.0 (运行中)
✅ Git: 2.50.1

✅ 环境就绪！可以开始创建项目。
```

**步骤 2: 创建新项目**

对 AI 说：

```
"创建一个新项目叫 my-blog"
```

AI 会自动：
- ✅ 生成 `domains/my-blog/` 完整结构
- ✅ 配置独立 Docker（端口自动分配为 5433）
- ✅ 生成 start.sh、domain.yaml、.env
- ✅ 创建 README.md

**预期输出**：
```
🚀 创建项目: my-blog

   项目名: my-blog
   标题: My Blog
   数据库端口: 5433

✅ 项目创建成功！

📂 位置: domains/my-blog
📝 数据库端口: 5433

📌 下一步:
  1. cd domains/my-blog
  2. 添加前后端代码（或从模板复制）
  3. ./start.sh
```

**步骤 3: 启动项目**

```bash
cd domains/my-blog
./start.sh  # 自动启动所有服务（Docker + 后端 + 前端）

# 查看服务状态
./status.sh
```

---

### 方式 3: 手动安装（学习架构）

**适合**: 深入了解 ACE Engine 内部机制

<details>
<summary>点击展开详细步骤</summary>

#### 前置要求

- **Node.js** 18+ ([下载](https://nodejs.org/))
- **Docker** ([下载](https://www.docker.com/products/docker-desktop/))
- **Git** 2.0+

**验证安装**：
```bash
node --version  # >= v18.0.0
docker --version  # >= 20.0.0
git --version  # >= 2.0.0
```

#### 步骤

**1. 克隆项目**
```bash
git clone <your-repo-url>
cd AI-Coding-Engine
```

**2. 进入示例项目**
```bash
cd domains/todo-app
```

**3. 启动 Docker（PostgreSQL）**
```bash
docker-compose up -d
```

验证：`docker ps` 应该看到 `todo-app-db` 容器运行中

**4. 安装后端依赖**
```bash
cd backend
npm install
```

**5. 运行数据库迁移**
```bash
npx prisma migrate deploy
# 或首次运行：npx prisma migrate dev --name init
```

**预期输出**：
```
✅ Your database is now in sync with your schema.
```

**6. (可选) 填充示例数据**
```bash
npx prisma db seed
```

**预期输出**：
```
✅ Seeded 3 todos
```

**7. 安装前端依赖**
```bash
cd ../frontend
npm install
```

**8. 启动后端（新终端）**
```bash
cd backend
npm run dev
```

**预期输出**：
```
🚀 Server is running on http://localhost:3000
📝 API docs: http://localhost:3000/health
```

**9. 启动前端（新终端）**
```bash
cd frontend
npm run dev
```

**预期输出**：
```
VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**10. 访问应用**

打开浏览器：http://localhost:5173

**停止服务**：

按 `Ctrl+C` 停止前后端（在各自终端），然后：
```bash
docker-compose down
```

</details>

---

## 🛑 停止项目

根据你的需求选择不同层次的停止方式：

### 层次 1: 快速停止（保留 Docker，下次启动快）⚡

**适合**：今天晚点还要继续开发

```bash
# 仅停止前后端服务，保留数据库
pkill -f 'vite|tsx.*todo-app'
```

**优点**：下次 `./start.sh` 跳过 Docker 启动，立即可用  
**占用**：数据库容器继续运行（约 100MB 内存）

---

### 层次 2: 完全停止（释放所有资源）🛑

**适合**：今天不开发了，释放系统资源

```bash
# 停止前后端
pkill -f 'vite|tsx.*todo-app'

# 停止 Docker（保留数据）
cd domains/todo-app
docker-compose down
```

**优点**：完全释放端口和内存  
**保留**：数据库数据仍在 Docker 卷中

---

### 层次 3: 深度清理（删除所有数据）💣

**适合**：想重新开始，清空测试数据

```bash
# 停止前后端
pkill -f 'vite|tsx.*todo-app'

# 停止并删除 Docker 数据卷（⚠️ 数据会丢失）
cd domains/todo-app
docker-compose down -v
```

**警告**：`-v` 参数会删除数据库中的所有数据，无法恢复！

### 验证已停止

```bash
# 检查端口是否释放
lsof -i :3000 -i :5173
# 应该没有输出

# 检查 Docker
docker ps | grep todo-app
# 应该没有输出
```

### 查看日志（如果服务有问题）

```bash
# 后端日志
tail -f /tmp/todo-backend.log

# 前端日志
tail -f /tmp/todo-frontend.log
```

---

## 📝 常用命令参考

### 项目管理（根目录）

```bash
# 对 AI 说（无需记忆命令）
"初始化环境"           # 部署环境（检查/安装工具）
"创建项目 my-app"      # 生成新项目
"检查系统健康"         # 诊断问题
```

### 子项目操作（终端）

```bash
# 一键启动（自动启动所有服务）
cd domains/{project}
./start.sh

# 查看服务状态
./status.sh                    # 查看 Docker、后端、前端运行状态

# 停止服务
pkill -f 'vite|tsx.*{project}'

# 查看日志
tail -f /tmp/{project}-backend.log
tail -f /tmp/{project}-frontend.log

# 数据库管理
cd backend
npx prisma migrate dev     # 创建新迁移
npx prisma migrate deploy  # 应用迁移
npx prisma studio          # 可视化工具
npx prisma db seed         # 填充数据

# Docker 管理
cd domains/{project}
docker-compose up -d       # 启动
docker-compose down        # 停止
docker-compose ps          # 查看状态
docker-compose logs -f     # 查看日志

# 测试
cd backend
npm test                   # 运行测试
npm run test:coverage      # 测试覆盖率

# 代码质量
npm run lint              # ESLint 检查
npm run lint:fix          # 自动修复
```

---

## 🐛 常见问题

### Q: 端口被占用怎么办？

**症状**: `Error: listen EADDRINUSE: address already in use :::5432`

**解决**:
1. 检查是否有其他项目使用 5432 端口
2. 修改 `.env` 文件：
   ```bash
   DB_PORT=5433  # 改为其他端口
   ```
3. 重启 Docker：
   ```bash
   docker-compose down
   docker-compose up -d
   ```

---

### Q: Docker 未运行

**症状**: `Cannot connect to the Docker daemon`

**解决**:
- **macOS**: 启动 Docker Desktop 应用
- **Linux**: `sudo systemctl start docker`
- **验证**: `docker ps` 应该有输出

---

### Q: 数据库连接失败

**症状**: `Error: P1001: Can't reach database server`

**解决**:
1. 检查 Docker 是否运行：`docker ps | grep postgres`
2. 检查 `.env` 中的 `DATABASE_URL` 是否正确
3. 等待数据库启动（首次启动需要 10 秒）：
   ```bash
   docker-compose logs -f postgres
   # 看到 "database system is ready to accept connections" 后继续
   ```

---

### Q: start.sh 启动后看不到服务

**症状**: 执行 `./start.sh` 后显示成功，但访问 http://localhost:5173 无响应

**解决**:
1. 先检查服务状态：
   ```bash
   ./status.sh  # 查看哪些服务未运行
   ```
2. 查看日志检查错误：
   ```bash
   tail -f /tmp/todo-backend.log
   tail -f /tmp/todo-frontend.log
   ```
3. 检查进程是否运行：
   ```bash
   ps aux | grep -E '(vite|tsx)' | grep todo-app
   ```
3. 如果进程已退出，手动启动查看错误：
   ```bash
   cd backend && npm run dev  # 查看错误信息
   ```

---

### Q: 如何完全清理项目（删除数据）？

**症状**: 想重新开始，清空所有数据

**解决**:
```bash
cd domains/todo-app

# 停止服务
pkill -f 'vite|tsx.*todo-app'

# 停止并删除 Docker 数据卷（⚠️ 数据会丢失）
docker-compose down -v

# 删除 node_modules（可选）
rm -rf backend/node_modules frontend/node_modules

# 重新启动
./start.sh
```

---

### Q: npm install 失败

**症状**: `ERESOLVE unable to resolve dependency tree`

**解决**:
1. 清理缓存：
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   ```
2. 使用正确的 Node.js 版本（>= 18.0.0）：
   ```bash
   node --version
   ```
3. 重新安装：
   ```bash
   npm install
   ```

---

## 🔧 Skills 使用示例

进入项目后，通过自然语言与 AI 协作开发：

### 核心工作流示例

```
cd domains/todo-app

# 1. 探索需求
用户: "探索添加用户登录功能"
AI:   → ace-explore（苏格拉底式提问）

# 2. 创建提案
用户: "创建用户登录提案"
AI:   → ace-propose（评估：复杂，生成 4 个 artifacts）

# 3. 实现变更
用户: "实现登录功能"
AI:   → ace-apply（15/15 任务完成，建议 review）

# 4. 代码审查
用户: "review"
AI:   → review（自动修复 3 个问题，建议 verify）

# 5. 验证功能
用户: "verify"
AI:   → verify（测试通过，覆盖率 85%，建议 archive）

# 6. 归档变更
用户: "归档"
AI:   → ace-archive（沉淀到 10_DOCS/api/auth.md）
```

### 增强 Skills 示例

#### 场景 1: 复杂需求规划

```
用户: "规划用户积分系统"
AI:   → plan
      定级: 复杂（3 个模块）
      拆分: 3 个 propose（基础 2天 + 抵扣 1.5天 + 过期 1天）
      沉淀: 90_PLANNING/v1.0-user-points/
```

#### 场景 2: 故障排查

```
用户: "API 返回 500，调查原因"
AI:   → investigate
      定性: 功能故障
      根因: 缺少 Prisma 单例（L1/L2/L3 分析）
      修复: 创建 utils/prisma.ts
```

#### 场景 3: 变更复盘

```
用户: "复盘 add-user-auth"
AI:   → retro
      耗时: 5天（预估 4-6，准确）
      经验: JWT 模式沉淀到 10_DOCS/patterns/
      改进: 更新 domain.yaml 密码规范
```

### 前置检查失败示例

```
# 场景: 跳过 apply 直接 review
用户: "review"
AI:   ❌ apply 功能任务未完成（剩余 8 个）
      💡 请先运行 ace-apply

# 场景: 简单变更跳过 verify
用户: "归档"（简单变更）
AI:   ⚠️ 建议运行 review 保证质量，继续吗？

# 场景: 复杂变更强制跳过
用户: "跳过 verify 直接归档"（复杂变更）
AI:   ❌ 复杂变更必须完整流程
      如需强制，明确说"强制归档"
```

### 状态日志查询

```bash
# 查看所有变更历史
jq -r 'select(.event=="completed") | .change' .claude/state/*.jsonl | sort -u

# 查看特定变更的完整流程
jq 'select(.change=="user-login")' .claude/state/*.jsonl
```

---

## 🚀 下一步

- **学习 AI-First 工作流**: 阅读 [docs/INTERACTION_MODEL.md](docs/INTERACTION_MODEL.md)
- **了解核心理念**: 阅读 [ETHOS.md](ETHOS.md)
- **开始开发**: 查看 [CONTRIBUTING.md](CONTRIBUTING.md)
- **查看 TODO App 源码**: 探索 `domains/todo-app/`

---

## 📚 相关文档

- [AGENTS.md](AGENTS.md) - AI 协作指令（AI 入口）
- [README.md](README.md) - 项目总览
- [ETHOS.md](ETHOS.md) - 核心哲学
- [docs/INTERACTION_MODEL.md](docs/INTERACTION_MODEL.md) - 交互模型详解

---

**遇到问题？** 对 AI 说："检查系统健康" 🩺
