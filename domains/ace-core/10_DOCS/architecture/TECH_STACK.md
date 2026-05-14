# ACE Engine 前后端启动指南

## 📊 当前架构

### 基础设施层（已 Docker 化）✅

通过 `npm run ace:up` 自动启动：

```
┌─────────────────────────────────────┐
│  基础设施容器（Docker Compose）     │
├─────────────────────────────────────┤
│  • MySQL (3306)                     │
│  • Redis (6379)                     │
└─────────────────────────────────────┘
```

### 应用层（需手动启动）⚠️

**当前状态**: 前后端应用**未** Docker 化

**原因**: 开发阶段需要热重载、快速调试，直接运行更方便

---

## 🚀 启动流程

### 方式一：开发模式（推荐）

#### 1. 启动基础设施

```bash
# 一键启动 MySQL + Redis
npm run ace:up
```

#### 2. 启动后端

```bash
# 进入后端目录
cd domains/your-app/backend

# 安装依赖
npm install

# 启动开发服务器（带热重载）
npm run dev
```

默认地址: `http://localhost:8080`

#### 3. 启动前端

```bash
# 新开终端，进入前端目录
cd domains/your-app/frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

默认地址: `http://localhost:3000`

---

### 方式二：生产模式（完全 Docker 化）

#### 前置条件

在你的 Domain 目录下创建 `docker-compose.app.yml`：

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: ${DOMAIN_NAME}-backend
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=ace-mysql-${DOMAIN_NAME}
      - REDIS_HOST=ace-redis-${DOMAIN_NAME}
    networks:
      - ace-network
    depends_on:
      - mysql
      - redis

  frontend:
    build: ./frontend
    container_name: ${DOMAIN_NAME}-frontend
    ports:
      - "3000:80"
    environment:
      - API_URL=http://backend:8080
    networks:
      - ace-network
    depends_on:
      - backend

networks:
  ace-network:
    external: true
```

#### 启动命令

```bash
# 先启动基础设施
npm run ace:up

# 再启动前后端
cd domains/your-app
docker compose -f docker-compose.app.yml up -d
```

---

## 🎯 推荐方案

### 开发阶段 👨‍💻

**使用方式一**（直接运行前后端）：

✅ **优点**:
- 热重载，修改代码立即生效
- 方便调试（可直接 attach debugger）
- 启动快速
- 日志清晰

❌ **缺点**:
- 需要手动启动多个终端
- 环境配置需要手动维护

### 生产/测试阶段 🚀

**使用方式二**（完全 Docker 化）：

✅ **优点**:
- 一键启动所有服务
- 环境一致性好
- 方便部署

❌ **缺点**:
- 构建镜像需要时间
- 修改代码需要重新构建
- 调试相对麻烦

---

## 📋 项目结构示例

```
domains/your-app/
├── domain.yaml                  # Domain 配置
├── docker-compose.generated.yml # 基础设施（自动生成）
├── docker-compose.app.yml       # 前后端应用（手动创建）
├── backend/
│   ├── Dockerfile              # 后端镜像
│   ├── package.json
│   └── src/
└── frontend/
    ├── Dockerfile              # 前端镜像
    ├── package.json
    └── src/
```

---

## 🔧 快速创建前后端项目

### 后端 (Node.js + Express 示例)

```bash
# 1. 创建后端目录
mkdir -p domains/your-app/backend
cd domains/your-app/backend

# 2. 初始化项目
npm init -y

# 3. 安装依赖
npm install express mysql2 redis cors

# 4. 创建 Dockerfile
cat > Dockerfile <<'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8080
CMD ["node", "index.js"]
EOF

# 5. 创建入口文件
cat > index.js <<'EOF'
const express = require('express');
const app = express();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(8080, () => {
  console.log('Backend running on http://localhost:8080');
});
EOF

# 6. 启动开发服务器
npm install -g nodemon
npm run dev
```

### 前端 (Vite + React 示例)

```bash
# 1. 创建前端项目
cd domains/your-app
npm create vite@latest frontend -- --template react

# 2. 进入目录
cd frontend

# 3. 创建 Dockerfile
cat > Dockerfile <<'EOF'
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# 4. 启动开发服务器
npm run dev
```

---

## 🎛️ 环境变量管理

### 后端 .env

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root123
DB_NAME=ace_db

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379

# 应用配置
PORT=8080
NODE_ENV=development
```

### 前端 .env

```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_TITLE=ACE Application
```

---

## ❓ 常见问题

### Q1: 为什么不一开始就全部 Docker 化？

**A**: 开发阶段，直接运行前后端可以：
- 利用热重载，提升开发效率
- 方便调试和日志查看
- 减少构建镜像的时间

基础设施（MySQL、Redis）Docker 化是因为：
- 配置复杂，Docker 统一管理更方便
- 不需要频繁修改
- 隔离性更好

### Q2: 我可以全部 Docker 化吗？

**A**: 当然可以！修改 `ace-flow` 的逻辑，让它同时启动基础设施和应用容器即可。

### Q3: 如何在 ace-flow 中集成前后端启动？

**A**: 两种方式：

#### 方式 1: 扩展 docker-compose（推荐生产环境）

修改 `domain.yaml`：

```yaml
infrastructure:
  db: mysql
  cache: redis
  backend: true   # 新增
  frontend: true  # 新增
```

修改 `ace-infra/executor.mjs`，识别 backend/frontend，自动合并到 docker-compose。

#### 方式 2: 在 ace-flow 中添加启动脚本（推荐开发环境）

修改 `ace-flow/executor.mjs`，在 `flowUp()` 中：

```javascript
// Step 6: 启动后端
step('6/7 启动后端服务');
execSync('cd domains/your-app/backend && npm run dev &');

// Step 7: 启动前端
step('7/7 启动前端服务');
execSync('cd domains/your-app/frontend && npm run dev &');
```

---

## 🎯 总结

| 场景 | 基础设施 | 前端 | 后端 | 命令 |
|------|----------|------|------|------|
| **开发** | Docker ✅ | 直接运行 | 直接运行 | `ace:up` + 手动启动前后端 |
| **测试** | Docker ✅ | Docker ✅ | Docker ✅ | `docker compose -f docker-compose.app.yml up` |
| **生产** | Docker ✅ | Docker ✅ | Docker ✅ | 同上 |

**当前 ACE Engine 默认方案**: 开发模式

**如需完全 Docker 化**: 参考"方式二"创建 `docker-compose.app.yml`

---

**下一步**: 需要我帮你创建完整的前后端 Docker 化配置吗？
