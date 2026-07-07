# 部署指南 — 本地 SQLite 实例

> 目标：在新电脑上从零安装运行，让你或男友使用自己的复盘系统。
> 换电脑时直接把 `backend/dev.db` 文件拷过去即可。

## 前置条件

| 软件 | 用途 |
|------|------|
| Node.js 18+ | 后端 + Bridge |
| Git | 获取代码 |
| Claude Code CLI | AI 分析引擎（如使用 AI 功能） |
| lark-cli | 飞书机器人（可选） |

## 部署步骤

### 1. 安装基础软件

```bash
# macOS
brew install node

# Windows
# winget install OpenJS.NodeJS.LTS
```

安装完成后**重启终端**确保 `node` 和 `npm` 可用。

#### Claude Code CLI（可选，如需 AI 分析功能）

```bash
npm install -g @anthropic-ai/cli-code
claude login
```

#### lark-cli（可选，如需飞书机器人）

```bash
npm install -g @larksuite/cli
lark-cli auth login
```

### 2. 获取代码并安装依赖

```bash
git clone <仓库地址>
cd domains/growth-miniprogram

# 后端
cd backend
cp .env.example .env
npm install
npx prisma db push
# ✅ 这会创建 backend/dev.db（SQLite 数据库文件）

# 前端（可选，Web 界面需要）
cd ../frontend
npm install
```

### 3. 启动服务

```bash
# 方式一：一键启动
bash scripts/startup.sh

# 方式二：分别启动
cd backend && npm run dev    # API 服务 → 端口 3001
cd frontend && npm run dev   # Web 端   → 端口 3002（可选）
```

### 4. 验证

```bash
curl http://localhost:3001/api/health
# → {"status":"ok"}
```

访问 `http://localhost:3002` 进入 Web 仪表盘。

---

## 换电脑迁移

把 `backend/dev.db` 文件拷到新电脑的 `backend/` 目录下，重启服务即可：

```bash
# 旧电脑
cp backend/dev.db backup/            # 备份

# 新电脑 — 同上部署步骤，最后
cp backup/dev.db backend/dev.db       # 把旧数据放回去
npx prisma db push                    # 确保表结构匹配
npm run dev                            # 启动
```

全量备份也可通过 JSON 格式导出：

```bash
cd backend
npx tsx scripts/backup.ts             # 导出 backups/*-backup.json
npx tsx scripts/restore.ts            # 恢复到新的数据库
```

---

## 常见问题

**Q: `npx prisma db push` 报错**

A: 确认 `backend/.env` 中 `DATABASE_URL="file:./dev.db"`，且 `backend/` 目录有写入权限。

**Q: 如何重置数据库？**

A: 删除 `backend/dev.db` 然后重新 `npx prisma db push && npx tsx prisma/seed.ts --force`。

**Q: 开机自启**

参考 PM2 配置 `scripts/pm2-ecosystem.config.cjs`。后端通过 PM2 注册为系统服务即可。

---

## 备份数据库

```bash
# 方式一：文件拷贝（随时可用）
bash scripts/db-backup.sh             # 备份到 backend/backups/
bash scripts/db-restore.sh <文件名>   # 恢复

# 方式二：Prisma JSON 导出（跨数据库迁移用）
cd backend
npx tsx scripts/backup.ts
npx tsx scripts/restore.ts
```

每次 `prisma db push` 或 seed 前，`backend/backups/` 目录会自动备份。
