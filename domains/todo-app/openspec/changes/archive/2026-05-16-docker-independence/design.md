## Context

当前 ACE Engine 架构下，所有子项目（如 `todo-app`）共享根目录的 `docker-compose.yml`，通过 `npm run ace:up` 启动 PostgreSQL。这导致：
1. **端口冲突**：多个项目同时运行时，都绑定到 `localhost:5432`
2. **数据污染**：所有项目共用一个 PostgreSQL 实例，数据库名隔离不足
3. **依赖耦合**：子项目无法独立分发，必须依赖根目录环境
4. **用户困惑**：需要记忆 `npm run ace:up` 等命令，与 AI-first 理念不符

同时，现有 Skills（`ace-init-env`, `ace-create-project`）只有 `SKILL.md` 文档，缺少 `executor.mjs` 实现，AI 无法真正调用。

**约束**：
- 保持现有项目（`todo-app`）可继续运行
- 模板系统需支持快速扩展（未来可能有 Python/Go 模板）
- Docker 配置需参数化，避免硬编码端口

**利益相关方**：
- 用户：希望通过对 AI 说话完成所有根目录操作，终端仅用于子项目
- 开发者：希望子项目真正独立，可以打包分享给他人

---

## Goals / Non-Goals

**Goals:**
- 每个子项目拥有独立的 `docker-compose.yml`，支持并行运行
- 用户通过自然语言触发 Skills（如 "初始化环境"），无需记忆命令
- 实现 `ace-create-project` 自动化：一句话生成完整项目
- 清理过时架构（删除根目录 `docker-compose.yml` 和无用 Skills）

**Non-Goals:**
- 不改变前后端技术栈（React + Node.js + PostgreSQL 保持不变）
- 不迁移现有项目数据（`todo-app` 保持当前数据库状态）
- 不实现 Kubernetes/Swarm 等编排（仅用 Docker Compose）

---

## Decisions

### 决策 1: Docker 配置位置 - 子项目独立 vs 根目录共享

**选择**：每个子项目拥有自己的 `docker-compose.yml`

**理由**：
- **避免端口冲突**：`todo-app` 用 5432，`my-app` 用 5433，互不干扰
- **真正的 Domain 独立性**：可以将 `domains/todo-app/` 打包给别人，对方运行 `./start.sh` 即可启动
- **数据隔离**：每个项目有自己的 PostgreSQL 容器和数据卷

**备选方案（已拒绝）**：
- 根目录共享 Docker：节省资源，但端口冲突和数据隔离问题无法解决

**实现**：
```yaml
# templates/domain-react-ts/docker-compose.yml.template
services:
  postgres:
    container_name: {{PROJECT_NAME}}-db
    ports:
      - "${DB_PORT:-5432}:5432"
    environment:
      POSTGRES_DB: {{PROJECT_NAME}}_db
      POSTGRES_USER: {{PROJECT_NAME}}_user
```

---

### 决策 2: Skills 触发方式 - AI 调用 vs 用户命令

**选择**：用户对 AI 说话 → AI 调用 Skill → Skill 执行 `executor.mjs`

**理由**：
- 符合用户心智模型："我只在终端操作子项目，其他都对 AI 说"
- 降低学习成本：无需记忆 `npm run ace:init-env` 等命令
- AI-first 理念：充分利用 Claude Code/Cursor 的自然语言能力

**备选方案（已拒绝）**：
- 提供 CLI 命令：用户需要记忆，违背 AI-first 原则

**实现**：
- `SKILL.md` 增加 "触发场景" 章节，列举用户可能说的话
- `executor.mjs` 实现核心逻辑（检查环境、生成项目）
- README 明确说明：根目录操作 = 对 AI 说话，子项目操作 = 终端命令

---

### 决策 3: 项目自动生成策略 - 模板复制 vs 代码生成

**选择**：基于模板复制 + 变量替换

**理由**：
- **简单可靠**：模板是实际可运行的项目，生成结果可预测
- **易于维护**：更新模板即可，无需修改生成逻辑
- **支持扩展**：未来可添加 `domain-python-fastapi` 模板

**备选方案（已拒绝）**：
- Yeoman/Plop 等代码生成器：过重，增加依赖
- 纯代码拼接：难以维护，模板变化需改代码

**实现流程**：
```javascript
// executor.mjs 伪代码
1. 验证项目名（小写字母、数字、连字符）
2. 复制 templates/domain-react-ts/ → domains/{projectName}/
3. 读取 domain.yaml.template，替换 {{PROJECT_NAME}}
4. 读取 docker-compose.yml.template，替换变量并分配端口
5. 生成 start.sh（从模板替换）
6. 输出成功信息 + 下一步指引
```

---

### 决策 4: 端口分配策略 - 自动检测 vs 手动配置

**选择**：自动递增分配 + 环境变量覆盖

**理由**：
- **用户友好**：首次创建无需关心端口，自动分配 5433, 5434...
- **灵活性**：可通过 `.env` 手动指定 `DB_PORT=5555`
- **避免冲突**：Executor 检查现有项目端口，自动跳过已占用

**实现**：
```javascript
// ace-create-project/executor.mjs
const existingPorts = scanExistingProjects(); // [5432, 5433]
const nextPort = Math.max(...existingPorts) + 1; // 5434
generateEnvFile({ DB_PORT: nextPort });
```

---

### 决策 5: 现有项目迁移 - 自动迁移 vs 手动指引

**选择**：提供手动迁移指引，不自动修改

**理由**：
- **安全性**：自动修改可能破坏用户当前环境
- **透明性**：用户清楚知道发生了什么变化
- **一次性工作**：只有 `todo-app` 需要迁移，未来项目自动正确

**迁移步骤**（在 tasks.md 中体现）：
1. 将根目录 `docker-compose.yml` 复制到 `domains/todo-app/`
2. 更新 `todo-app/start.sh`，添加 Docker 启动逻辑
3. 删除根目录 `docker-compose.yml` 和 `npm run ace:up`

---

## Risks / Trade-offs

### 风险 1: 资源消耗增加

**风险**：每个项目独立 PostgreSQL 容器，内存占用翻倍（N 个项目 = N × 200MB）

**缓解**：
- Docker Compose 默认停止未使用的容器
- 用户通常只运行 1-2 个项目，内存影响可接受
- 可在文档中说明：长期不用的项目可 `docker-compose down`

---

### 风险 2: 模板同步问题

**风险**：模板更新后，已生成的项目不会自动同步

**缓解**：
- 模板保持向后兼容，避免破坏性变更
- 重大更新时，提供迁移指南（如添加新的环境变量）
- 项目生成时记录模板版本号（未来可实现升级检测）

---

### 风险 3: 端口自动分配冲突

**风险**：自动分配的端口可能被其他非 ACE 项目占用

**缓解**：
- Executor 启动时检测端口可用性（`net.isPortFree()`）
- 冲突时自动跳到下一个端口
- 用户可通过 `.env` 手动指定端口覆盖

---

### Trade-off: 独立性 vs 复用性

**选择**：优先独立性

- ✅ 好处：子项目可独立分发，易于理解
- ❌ 代价：无法复用根目录的共享服务（如统一的 Redis）

**判断**：ACE Engine 定位是 "Domain 隔离"，独立性更重要

---

## Migration Plan

### 阶段 1: 模板准备
1. 创建 `docker-compose.yml.template` 和 `start.sh.template`
2. 测试模板生成的项目可独立运行

### 阶段 2: Executor 实现
3. 实现 `ace-init-env/executor.mjs`（检查 Node/Docker/Git）
4. 实现 `ace-create-project/executor.mjs`（复制模板 + 替换变量）

### 阶段 3: 文档更新
5. 更新根 `README.md`：删除 `npm run ace:up`，添加 "对 AI 说话" 使用方式
6. 更新 Skills 的 `SKILL.md`：添加触发场景

### 阶段 4: 清理过时代码
7. 删除根目录 `docker-compose.yml`
8. 删除 `package.json` 中的 `ace:up/down/restart`
9. 删除过时 Skills（`ace-flow`, `ace-select`, `ace-sync`, `ace-infra`）

### 阶段 5: 迁移现有项目
10. 手动迁移 `todo-app`：复制 Docker 配置到项目目录

**回滚策略**：
- 保留根目录 `docker-compose.yml.backup`
- 如果新架构有问题，可快速恢复 `npm run ace:up` 方式

---

## Open Questions

### Q1: 是否需要跨项目数据共享？

**场景**：未来可能有 "用户服务" 项目和 "订单服务" 项目，需要共享用户表

**当前决策**：暂不支持，每个项目完全独立

**后续考虑**：如果需要，可通过 API 调用而非数据库共享

---

### Q2: 是否需要 Skill 的 GUI 管理界面？

**场景**：用户希望可视化查看和编辑 Skills

**当前决策**：暂不实现，优先保证命令行流畅

**后续考虑**：可基于 Claude Desktop 插件实现

---

### Q3: Python/Go 项目模板优先级？

**当前决策**：先完善 React + Node.js 模板，验证架构可行性

**后续考虑**：根据用户反馈决定是否扩展
