# 部署指南 — 独立实例

> 目标：在新主机上从零安装运行，让新用户通过飞书 bot 使用复盘功能。

## 前置条件

| 软件 | 最低版本 | 用途 |
|------|---------|------|
| Docker Desktop | 4.x | PostgreSQL 容器 |
| Node.js | 18+ | 后端 + bridge |
| Git for Windows（Git Bash） | 最新 | `npm run dev` 需要 bash |
| lark-cli | 最新 | 飞书 bot 消息监听 |
| Claude Code CLI | 最新 | AI 分析引擎 |

## 部署步骤

### 1. 安装基础软件

#### Docker Desktop

官网下载安装，安装后打开 Settings → General → 勾选 **Start Docker Desktop when you sign in**。

#### Node.js + Git

```bash
# 用 winget（或官网手动下载）
winget install OpenJS.NodeJS.LTS
winget install Git.Git
```

安装完成后**重启终端**确保 `node` 和 `npm` 可用。

#### lark-cli

```bash
npm install -g @larksuite/cli
```

#### Claude Code CLI

```bash
npm install -g @anthropic-ai/cli-code
```

### 2. 创建飞书 bot 应用

> 每个用户需要**独立的飞书 bot 应用**，不能与其他实例共用同一个 bot（一个 bot 只能连一个 consumer）。

1. 打开 [飞书开放平台](https://open.feishu.cn) → 创建**企业自建应用**
2. 应用名称示例：`XXX 复盘助手`
3. 左侧 **权限管理** → 搜索并添加以下权限：
   - `im:message`（收发消息相关，勾选所有子项）
   - `contact:user.base:readonly`（读取用户基础信息）
   - `contact:user:search`（搜索用户）
4. 左侧 **事件与回调** → 添加事件：
   - `im.message.receive_v1`（接收消息）
5. 左侧 **安全设置** → 添加服务器 IP（主机的公网 IP）+ `127.0.0.1`
6. 右上角 **发布** → **审核并发布** 新版
7. 左侧 **凭证与基础信息** → 记下 **App ID** 和 **App Secret**

### 3. 获取代码并安装依赖

```bash
git clone <仓库地址>
cd domains/growth-miniprogram

# 后端
cd backend
cp .env.example .env
npm install

# bridge（不需要额外 npm install，无依赖）
cd ../bridge
cp .env.example .env
```

编辑 `bridge/.env`：

```ini
BACKEND_URL=http://localhost:3001
LARK_CLI_PATH=lark-cli
CLAUDECLI_PATH=claude
SESSION_DIR=./sessions
USER_FEISHU_ID=ou_xxxxxxxxxxxxxxxxxxxxxx   ← 第4步获取后再填
```

### 4. 登录 lark-cli 和 Claude CLI

```bash
# lark-cli 登录（设备流授权）
lark-cli auth login
# 终端会显示一个二维码/链接，用飞书扫码授权
# 确认登录成功：lark-cli auth status → tokenStatus 为 "active"

# Claude CLI 登录
claude login
# 浏览器打开链接，登录 Anthropic 账号
```

> lark-cli 的 token 有效期约 30 天，到期后需要重新 `lark-cli auth login`。

### 5. 获取新用户的 open_id

```bash
# 启动 lark-cli 消息监听
lark-cli event consume im.message.receive_v1 --as bot --max-events 5
# 然后在飞书中向你刚创建的 bot 发任意消息
# 终端会输出事件 JSON，找到其中的 "sender_id" 字段
```

把得到的 open_id 填入 `bridge/.env` 的 `USER_FEISHU_ID`。

### 6. 启动全套服务

```bash
# （确保 Docker Desktop 在运行中）

# 1) 启动 PostgreSQL
cd domains/growth-miniprogram
docker compose up -d

# 2) 等待数据库就绪
docker exec growth-miniprogram-db pg_isready -U growthuser -d growth-miniprogram
# 直到输出 "accepting connections"

# 3) 初始化数据库表
cd backend
npx prisma db push

# 4) 启动后端
npm run dev &

# 5) 确认后端正常
curl http://localhost:3001/api/health
# → {"status":"ok"}

# 6) 启动 Bridge（飞书消息监听）
cd ../bridge
node auto-processor.cjs < <(tail -f /dev/null) &
```

### 7. 验证

在飞书里向 bot 发消息：

- `/services` — 查看所有服务状态
- 直接发送一段今日复盘内容 — 走完完整分析流程

## 常见问题

**Q: `lark-cli event consume` 显示 "stdin closed — shutting down"**

A: 这是正常的。lark-cli 检测到 stdin 关闭就自动退出。bridge 会自动处理这个问题（内置 stdin keepalive）。直接通过 bridge 启动即可。

**Q: `npm run dev` 报错 "bash: command not found"**

A: Windows 需要 Git Bash。确认 Git 已安装，且 `bash` 在 PATH 中。

**Q: `docker compose up -d` 报错**

A: 可能是 Docker Desktop 尚未就绪。等 Docker 图标静止后重试，或重启 Docker Desktop。

**Q: lark-cli 提示 "token expired"**

A: 重新运行 `lark-cli auth login`。

## 开机自启

如果希望主机重启后服务自动运行，将 bridge 和后端注册为 Windows 计划任务：

```powershell
# PowerShell（管理员）— Bridge
$action = New-ScheduledTaskAction -Execute "node.exe" `
  -Argument "auto-processor.cjs < <(tail -f /dev/null)" `
  -WorkingDirectory "C:\full\path\to\growth-miniprogram\bridge"
$trigger = New-ScheduledTaskTrigger -AtLogOn
Register-ScheduledTask -TaskName "GrowthBridge" -Action $action -Trigger $trigger -RunLevel Highest

# 后端
$action = New-ScheduledTaskAction -Execute "npm" `
  -Argument "run dev" `
  -WorkingDirectory "C:\full\path\to\growth-miniprogram\backend"
$trigger = New-ScheduledTaskTrigger -AtLogOn
Register-ScheduledTask -TaskName "GrowthBackend" -Action $action -Trigger $trigger -RunLevel Highest
```

Docker Desktop 设置中勾选开机自启即可。

## 同一台机器的多实例

每套实例需要独立的飞书 bot 应用。端口分配：

| 服务 | 实例1（默认） | 实例2 |
|------|-------------|-------|
| PostgreSQL | 5434 | 5435 |
| Backend | 3001 | 3003 |

修改位置：
- `docker-compose.yml`：`5434:5432` → `5435:5432`
- `backend/.env`：`DATABASE_URL` 中的端口
- `bridge/.env`：`BACKEND_URL=http://localhost:3003`

## 备份

```bash
# 导出
docker exec growth-miniprogram-db pg_dump -U growthuser -d growth-miniprogram > backup.sql

# 恢复
cat backup.sql | docker exec -i growth-miniprogram-db psql -U growthuser -d growth-miniprogram
```

每次 `prisma db push` 或 seed 前，`backend/backups/` 目录会自动备份。
