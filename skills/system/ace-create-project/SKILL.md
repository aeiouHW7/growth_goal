# ace-create-project

## 描述

创建新的 Domain 项目，自动生成完整的项目结构。

## 触发场景

**重要**: 这是 AI 调用的 Skill，不是用户在终端输入的命令。

用户对 AI（Claude Code/Cursor）说：
- "创建一个新项目叫 my-app"
- "帮我初始化一个电商项目"
- "新建一个 Domain 叫 user-service"
- "Create a new project called blog-app"
- "Initialize a new full-stack project"

AI 会自动调用此 Skill，用户无需手动输入任何命令。

## 执行流程

1. 获取项目名称
2. 复制模板到 domains/{项目名}
3. 替换项目名称和配置
4. 生成独立的 docker-compose.yml
5. 生成 start.sh 启动脚本
6. 初始化 git（可选）

## 参数

- `name`: 项目名称（必需）
- `template`: 模板类型，默认 react-ts

## 使用方式

**AI 自动调用**（用户不需要手动执行）:
```bash
node skills/system/ace-create-project/executor.mjs my-app
```

当用户对 AI 说 "创建项目 my-app" 时，AI 会自动执行上述命令。

或通过 npm（仅供开发测试）：
```bash
npm run ace:create-project my-app
```

## 示例输出

```
🚀 创建项目: my-app

   项目名: my-app
   标题: My App
   数据库端口: 5433

1️⃣ 复制模板...
   ✅ 目录结构创建完成

2️⃣ 配置 domain.yaml...
   ✅ domain.yaml 配置完成

3️⃣ 生成 docker-compose.yml...
   ✅ docker-compose.yml 生成完成

4️⃣ 生成 start.sh...
   ✅ start.sh 生成完成

5️⃣ 生成 .env...
   ✅ backend/.env 生成完成

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 项目创建成功！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 位置: domains/my-app
📝 数据库端口: 5433

📌 下一步:
  1. cd domains/my-app
  2. 添加前后端代码（或从模板复制）
  3. ./start.sh

💡 提示: 你现在需要手动添加 frontend 和 backend 的代码
   可以参考 domains/todo-app 的结构
```

## 生成的项目结构

```
domains/my-app/
├── domain.yaml              # 项目配置
├── docker-compose.yml       # 独立的 Docker 服务
├── start.sh                 # 一键启动脚本
├── 10_DOCS/                # 文档
├── frontend/               # React 前端
├── backend/                # Node.js 后端
└── 90_PLANNING/            # 规划文档
```
