# Knowledge Skills

知识管理相关 Skills，帮助 AI 更好地理解和管理项目知识。

## Skills 列表

| Skill | 作用 | 使用场景 |
|-------|------|---------|
| **codebase-recon** | 代码库侦察 | propose/apply 前查现有实现，避免重复造轮子 |
| **cross-review** | 审核引擎 | 自审+交叉审核，3轮上限+收敛检测 |
| **docs-extractor** | 文档提取 | 从代码自动生成 10_DOCS/（4个维度：api/business/components/technical） |
| **db-schema-manager** | 数据库管理 | 从 SQL 生成文档，执行 DDL，管理 schema 基线 |

---

## codebase-recon（代码库侦察）

**触发**：用户说"有没有类似的实现"、"现有代码怎么做的"、"参考现有的"

**核心**：
- 在 propose/apply/verify 前自动触发
- 分层侦察：通用侦察 → 各阶段专项侦察
- 代码定位策略：grep → 读文档 → 读历史 → 读目录 → 顺链路读

**输出**：
- 现有链路是什么
- 能复用什么
- 需要新建什么
- 风险点

---

## cross-review（审核引擎）

**触发**：用户说"审核提案"、"review 代码"、"检查文档质量"

**核心**：
- 两个入口：`self_review`（3轮上限）、`cross_review`（收敛检测）
- 自动路由：proposal/code/test/general 自动选择检查清单
- 三级降级：MCP 工具 → Subagent → 自审

**输出**：
- 审核报告（按严重程度分级：P0/P1/P2）
- 自动修复（P0 问题）

---

## docs-extractor（文档提取）

**触发**：用户说"从代码提取文档"、"生成知识库"、"更新文档"

**核心**：
- 四个维度：api（接口）、business（业务）、components（组件）、technical（架构）
- 增量更新：保留人工编辑内容
- 敏感信息脱敏

**输出**：
- 10_DOCS/api/*.md
- 10_DOCS/business/*.md
- 10_DOCS/components/*.md
- 10_DOCS/technical/*.md

---

## db-schema-manager（数据库管理）

**触发**：用户说"初始化数据库文档"、"生成表结构基线"、"收集版本 SQL"

**核心**：
- 从 init SQL 生成表结构基线文档
- 按业务模块分组（根据表名前缀和 COMMENT）
- apply 阶段执行 DDL/DML 到本地数据库
- 支持 MySQL/PostgreSQL

**输出**：
- 10_DOCS/technical/database-schema.md
- local-dev/versions/X.X.X/DDL.sql
- local-dev/versions/X.X.X/DML.sql

---

## 使用示例

### codebase-recon

```
用户: "有没有类似的用户登录实现？"
AI:   → codebase-recon
      grep "login" "auth" "user" ...
      找到 backend/src/routes/auth.ts
      读完整实现：JWT + bcrypt + refresh token
      
      输出：
      - 现有链路：POST /auth/login → AuthService.login() → JWT 签名
      - 能复用：AuthService、JWTMiddleware、UserRepository
      - 需要新建：OAuth 第三方登录
```

### cross-review

```
用户: "review 这个 proposal"
AI:   → cross-review
      self_review（第 1/3 轮）
        ✅ 业务目标清晰
        ❌ 缺少错误处理设计（P0）
        ❌ 性能考虑不足（P1）
      
      self_review（第 2/3 轮）
        ✅ 所有 P0 问题已修复
        ✅ 通过审核
```

### docs-extractor

```
用户: "从代码生成知识库"
AI:   → docs-extractor
      读取 backend/src/routes/*.ts
      提取接口定义 → 10_DOCS/api/user-api.md
      
      读取 backend/src/services/*.ts
      提取业务逻辑 → 10_DOCS/business/user-management.md
```

### db-schema-manager

```
用户: "初始化数据库文档"
AI:   → db-schema-manager
      读取 backend/prisma/schema.prisma
      解析表结构
      生成 10_DOCS/technical/database-schema.md
      
      按模块分组：
      - 用户管理：users, user_roles, user_sessions
      - 订单管理：orders, order_items
```

---

## 集成到现有 Workflow

### ace-propose 前置

```
ace-propose 触发 → codebase-recon（调研现有实现）→ 生成 proposal
```

### ace-apply 后置

```
ace-apply 完成 → cross-review（自审代码）→ 输出审核报告
```

### ace-archive 后置

```
ace-archive 完成 → docs-extractor（提炼文档）→ 更新 10_DOCS/
```

---

## 技术细节

**来源**：Adapted from ai-drive-engine

**适配**：
- 移除 WMS 特定逻辑（laputa-mw-data-query、飞书文档等）
- 路径适配：`{agent}/10_DOCS/` → `10_DOCS/`
- 支持多技术栈（Java/TypeScript/Python/Go）

**依赖**：
- grep / find / search_symbols（代码搜索）
- Prisma Schema / SQL 文件（数据库）
- openspec artifacts（proposal/design/specs）

---

**完整文档**：查看各 Skill 的 SKILL.md 文件
