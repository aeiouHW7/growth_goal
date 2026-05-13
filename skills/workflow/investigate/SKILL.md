---
name: investigate
description: 问题调查和诊断 - 系统化排查故障、性能问题、异常行为。Use when debugging issues, investigating failures, or diagnosing system problems.
license: MIT
compatibility: Requires ACE Engine project structure
metadata:
  author: ACE Engine
  version: "1.0"
---

# investigate - 问题调查和诊断

系统化排查故障、性能问题、异常行为，定位根因并生成诊断报告。

## 触发条件

- 用户说"调查 XX 问题"、"为什么 XX 失败"
- 系统出现异常行为
- 测试失败需要诊断
- 性能下降需要分析

## 前置检查

无前置要求（可随时使用）

---

## 执行流程

### 1. 问题定性

快速判断问题类型，决定调查方向：

| 类型 | 症状 | 优先检查 | 典型工具 |
|------|------|---------|---------|
| **功能故障** | 功能不工作、API 报错 | 日志、错误信息 | 日志文件、控制台 |
| **性能问题** | 响应慢、超时 | 资源使用、瓶颈 | top、profiler |
| **数据问题** | 数据不一致、丢失 | 数据库状态、迁移 | SQL 查询、备份 |
| **环境问题** | 本地可用、部署失败 | 配置差异、依赖 | .env、Docker |

**输出示例**：
```
🔍 问题定性：功能故障
- 症状：健康检查 API 返回 500
- 优先检查：后端日志、错误堆栈
- 影响范围：单个端点
```

### 2. 信息收集

**基础信息**（自动收集）：
```bash
# 1. 环境信息
node --version
docker ps
git status

# 2. 进程状态
ps aux | grep -E '(vite|tsx|node)' | grep $(basename $PWD)

# 3. 端口占用
lsof -i :3000 -i :5173

# 4. 最近变更
git log --oneline -5
```

**问题特定信息**（根据类型）：

**功能故障**：
```bash
# 后端日志
tail -100 /tmp/*-backend.log

# 前端日志
tail -100 /tmp/*-frontend.log

# Docker 日志
docker-compose logs --tail=50
```

**性能问题**：
```bash
# 系统资源
top -l 1 | head -20

# 数据库慢查询
docker exec -it <db-container> psql -U <user> -d <db> -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

**数据问题**：
```bash
# 数据库状态
npx prisma db pull
npx prisma migrate status

# 数据快照
npx prisma studio  # 手动检查
```

### 3. 复现路径

尝试稳定复现问题：

**步骤**：
1. 确定最小复现步骤
2. 记录环境差异（本地 vs 部署）
3. 检查时间相关性（首次启动 vs 长期运行）

**输出示例**：
```
📋 复现路径（100% 可复现）：
1. ./start.sh 启动后端
2. curl http://localhost:3000/health
3. ❌ 返回 500，错误信息：PrismaClient is not defined

环境差异：
- 本地：可复现
- Docker：可复现
- 清理后：可复现
```

### 4. 根因定位

**逐层排查**（由表及里）：

**Level 1: 表面错误**
- 错误信息字面含义
- 堆栈跟踪
- 日志中的异常

**Level 2: 直接原因**
- 引发错误的代码
- 缺失的依赖
- 错误的配置

**Level 3: 根本原因**
- 设计缺陷
- 架构问题
- 未处理的边界情况

**输出示例**：
```
🎯 根因定位

Level 1 (表面错误):
  Error: PrismaClient is not defined
  at health.ts:10:25

Level 2 (直接原因):
  health.ts 中每次请求都实例化 new PrismaClient()
  未导入 Prisma 客户端

Level 3 (根本原因):
  缺乏 Prisma 单例模式
  未遵循官方最佳实践（singleton pattern）
```

### 5. 验证假设

在修复前验证根因分析：

**方法**：
- 临时修复测试（proof of concept）
- 对比正常 vs 异常状态
- 查阅文档验证理解

**输出示例**：
```
✅ 假设验证

假设：缺少 Prisma 单例导致问题

验证方法：
1. 创建 utils/prisma.ts 单例
2. 修改 health.ts 导入单例
3. 重启后端测试

结果：✅ 问题消失，API 返回 200
```

### 6. 生成诊断报告

创建结构化诊断报告（可选，复杂问题建议）：

**路径**：`90_PLANNING/investigations/`

```bash
mkdir -p 90_PLANNING/investigations
cat > 90_PLANNING/investigations/$(date +%Y%m%d)-<问题名>.md <<EOF
# 问题调查：<问题标题>

**日期**：$(date +%Y-%m-%d)
**调查人**：AI + 用户

## 问题描述

[症状、影响范围]

## 环境信息

- Node.js: $(node --version)
- Docker: 运行中/已停止
- 最近变更：[git log]

## 复现路径

1. [步骤 1]
2. [步骤 2]
3. ❌ 错误

## 根因分析

**表面错误**：...
**直接原因**：...
**根本原因**：...

## 解决方案

**短期修复**（临时方案）：
- [快速修复]

**长期优化**（彻底解决）：
- [架构改进]

## 验证

- ✅ 短期修复已验证
- ⏳ 长期优化待规划

## 后续行动

- [ ] 创建提案：<propose-name>
- [ ] 更新文档：10_DOCS/<file>
- [ ] 添加测试：防止回归
EOF
```

### 7. 建议下一步

根据问题类型和根因，建议后续行动：

**简单问题**（已修复）：
```
✅ 问题已解决

修复内容：创建 Prisma 单例

💡 建议：
1. 更新 10_DOCS/architecture/database.md（记录单例模式）
2. 添加单元测试防止回归
```

**复杂问题**（需规划）：
```
✅ 根因已定位

诊断报告：90_PLANNING/investigations/20260512-prisma-performance.md

💡 建议：
1. 创建提案解决根本问题：
   "创建提案 optimize-database-pooling"
2. 短期修复已应用，长期优化见报告
```

**环境问题**（需配置）：
```
✅ 环境问题定位

根因：.env 中缺少 DATABASE_URL

💡 建议：
1. 更新 .env.example（添加缺失字段）
2. 更新 QUICKSTART.md（添加环境配置说明）
```

---

## 调查工具箱

### 日志和输出

```bash
# 后端日志
tail -f /tmp/*-backend.log

# 前端日志
tail -f /tmp/*-frontend.log

# Docker 日志
docker-compose logs -f <service>

# 实时跟踪
tail -f <log-file> | grep -i error
```

### 进程和端口

```bash
# 检查进程
ps aux | grep -E '(vite|tsx|node)'

# 检查端口
lsof -i :<port>
netstat -an | grep <port>

# 杀死进程
pkill -f 'vite|tsx.*<project>'
```

### 数据库

```bash
# Prisma 状态
npx prisma migrate status

# 数据库连接
npx prisma studio

# 执行查询
npx prisma db execute --stdin < query.sql
```

### 网络

```bash
# 测试 API
curl -v http://localhost:3000/api/endpoint

# 检查响应时间
time curl http://localhost:3000/health

# 查看 HTTP 头
curl -I http://localhost:3000/health
```

### Git 变更

```bash
# 最近提交
git log --oneline -10

# 变更文件
git diff HEAD~1

# 特定文件历史
git log --oneline -- <file>
```

---

## 输出示例

### 功能故障调查

```
## Investigation: 健康检查 API 返回 500

🔍 问题定性：功能故障
   症状：/health 端点返回 500
   影响：单个 API 端点

📋 复现路径（100% 可复现）：
   1. ./start.sh
   2. curl http://localhost:3000/health
   3. ❌ 500 Internal Server Error

🎯 根因定位：
   Level 1: PrismaClient is not defined
   Level 2: health.ts 每次请求实例化 Prisma
   Level 3: 缺乏单例模式

✅ 验证：创建 utils/prisma.ts 单例 → 问题消失

💡 建议：
   1. 已修复：创建 Prisma 单例
   2. 更新文档：10_DOCS/architecture/database.md
   3. 添加测试：防止回归
```

### 性能问题调查

```
## Investigation: API 响应慢

🔍 问题定性：性能问题
   症状：/api/todos 响应时间 > 2s
   影响：所有 API 端点

📊 性能数据：
   - 首次请求：2.3s
   - 后续请求：180ms
   - 数据库查询：150ms
   - 冷启动问题

🎯 根因定位：
   Level 1: 首次请求慢
   Level 2: Prisma 连接池未预热
   Level 3: 缺少健康检查预热机制

✅ 验证：添加启动预热 → 首次请求降至 200ms

💡 建议：
   创建提案：add-startup-warmup
   - 启动时预热数据库连接
   - 添加健康检查到 start.sh
```

---

## 护栏

- 先收集信息，再下结论
- 验证假设，不猜测
- 从简单到复杂逐层排查
- 记录调查过程（复杂问题）
- 不在调查阶段实现长期修复（临时验证 OK，完整实现需 propose）

---

## 与其他 Skills 的关系

```
investigate（问题调查）
  ├─ 简单问题 → 直接修复 → 更新文档
  ├─ 复杂问题 → 生成报告 → propose（创建提案）
  └─ 环境问题 → 更新配置 → QUICKSTART.md
```

**何时使用 investigate**：
- 功能异常、测试失败
- 性能下降、超时
- 数据不一致
- 环境问题

**何时跳过 investigate**：
- 需求很清晰（直接 propose）
- 已知问题（直接修复）
- 文档更新（直接编辑）
