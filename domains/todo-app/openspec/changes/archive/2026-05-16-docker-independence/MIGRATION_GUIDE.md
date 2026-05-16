# Docker Independence Migration Guide

本指南帮助将现有项目迁移到独立 Docker 架构。

---

## 背景

**旧架构**：
- 所有子项目共享根目录的 `docker-compose.yml`
- 通过 `npm run ace:up` 启动 PostgreSQL
- 端口固定为 5432，多项目无法并行

**新架构**：
- 每个子项目有自己的 `docker-compose.yml`
- 通过 `./start.sh` 自动启动项目的 Docker
- 端口自动分配（5432, 5433, 5434...），支持多项目并行

---

## 迁移步骤

### 1. 为现有项目添加 Docker 配置

假设你有一个现有项目 `domains/my-app`：

```bash
cd domains/my-app
```

#### 1.1 创建 `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: my-app-db
    environment:
      POSTGRES_USER: myapp_user
      POSTGRES_PASSWORD: myapp_pass
      POSTGRES_DB: myapp_db
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - my_app_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U myapp_user"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  my_app_postgres_data:
```

**关键点**：
- `container_name`: 使用项目名（避免与其他项目冲突）
- `ports`: 使用 `${DB_PORT:-5432}` 支持环境变量覆盖
- `volumes`: 使用项目特定的卷名

---

#### 1.2 创建 `.env` 文件

```bash
# domains/my-app/.env
DB_PORT=5432

# 如果已有其他项目占用 5432，改为 5433 或其他端口
# DB_PORT=5433

DATABASE_URL="postgresql://myapp_user:myapp_pass@localhost:${DB_PORT}/myapp_db"
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

---

#### 1.3 更新 `start.sh`

在现有 `start.sh` 的开头添加 Docker 启动逻辑：

```bash
#!/bin/bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🚀 My App 启动..."
echo ""

# ========== 新增部分 ==========
# 0. 检查 Docker 是否运行
if ! docker ps > /dev/null 2>&1; then
  echo "❌ Docker 未运行，请先启动 Docker Desktop"
  exit 1
fi

# 1. 启动项目的 Docker 服务
echo "1️⃣ 启动数据库..."
cd "$SCRIPT_DIR"
docker-compose up -d > /dev/null 2>&1
echo "✅ PostgreSQL 已启动"

# 等待数据库就绪
sleep 3
# ========== 新增部分结束 ==========

# 2. 后端准备
echo ""
echo "2️⃣ 准备后端..."
cd "$SCRIPT_DIR/backend"
# ... 后续步骤保持不变
```

---

### 2. 更新数据库连接字符串

如果你的项目修改了端口（如改为 5433），需要更新：

#### 2.1 后端 `.env`

```bash
DATABASE_URL="postgresql://myapp_user:myapp_pass@localhost:5433/myapp_db"
```

#### 2.2 Prisma Schema（如果硬编码了 URL）

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // 确保使用环境变量
}
```

---

### 3. 测试迁移

#### 3.1 停止旧的共享 Docker

```bash
# 在根目录
docker-compose down
```

#### 3.2 启动项目的独立 Docker

```bash
cd domains/my-app
./start.sh
```

#### 3.3 验证数据库连接

```bash
# 查看容器是否启动
docker ps | grep my-app-db

# 连接数据库测试
docker exec -it my-app-db psql -U myapp_user -d myapp_db

# 运行迁移
cd backend
npx prisma migrate deploy
```

---

### 4. 多项目并行运行

如果你有多个项目需要同时运行：

#### 项目 1: my-app (端口 5432)

```bash
# domains/my-app/.env
DB_PORT=5432
```

#### 项目 2: blog-app (端口 5433)

```bash
# domains/blog-app/.env
DB_PORT=5433
```

#### 启动两个项目

```bash
# 终端 1
cd domains/my-app && ./start.sh

# 终端 2
cd domains/blog-app && ./start.sh
```

**验证无冲突**：

```bash
docker ps
# 应该看到：
# my-app-db    (0.0.0.0:5432->5432/tcp)
# blog-app-db  (0.0.0.0:5433->5432/tcp)
```

---

## 常见问题

### Q1: 迁移后原有数据会丢失吗？

**A**: 不会。迁移步骤：

1. 备份旧数据：
   ```bash
   docker exec -it ace-postgres pg_dump -U todouser todoapp > backup.sql
   ```

2. 启动新容器后恢复：
   ```bash
   docker exec -i my-app-db psql -U myapp_user -d myapp_db < backup.sql
   ```

---

### Q2: 旧的 `npm run ace:up` 还能用吗？

**A**: 不能。根目录的 `docker-compose.yml` 已删除。现在每个项目通过 `./start.sh` 管理自己的 Docker。

---

### Q3: 如何停止项目的 Docker？

```bash
cd domains/my-app
docker-compose down

# 或者停止并删除数据卷（危险！）
docker-compose down -v
```

---

### Q4: 端口冲突怎么办？

**方案 1**：修改 `.env` 中的 `DB_PORT`

```bash
# domains/my-app/.env
DB_PORT=5434  # 改为未占用的端口
```

**方案 2**：检查并停止占用端口的容器

```bash
# 查看 5432 端口占用
lsof -i :5432

# 停止冲突的容器
docker ps | grep 5432
docker stop <container_id>
```

---

## 回滚方案

如果迁移遇到问题，可以临时恢复旧架构：

```bash
# 1. 恢复根目录 docker-compose.yml
cd /Users/yangyanyu/AI-Coding-Engine
cp docker-compose.yml.backup docker-compose.yml

# 2. 恢复 package.json 中的 ace:up
# 手动添加：
# "ace:up": "docker-compose up -d"

# 3. 启动共享 Docker
npm run ace:up
```

但**建议尽快完成迁移**，旧架构不再维护。

---

## 迁移检查清单

- [ ] 项目目录下创建了 `docker-compose.yml`
- [ ] 创建了 `.env` 文件并设置 `DB_PORT`
- [ ] 更新了 `start.sh` 添加 Docker 启动逻辑
- [ ] 更新了后端 `DATABASE_URL` 环境变量
- [ ] 测试 `./start.sh` 可成功启动
- [ ] 验证数据库连接正常（`npx prisma studio`）
- [ ] 多项目情况下验证无端口冲突

---

## 相关文档

- [交互模型文档](../docs/INTERACTION_MODEL.md) - 了解 AI-first 工作流
- [todo-app README](../domains/todo-app/README.md) - 参考完整迁移示例
- [模板文档](../templates/domain-react-ts/) - 新项目的标准结构
