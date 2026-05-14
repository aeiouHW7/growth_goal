## 1. db-schema-manager 修复（P0）

- [x] 1.1 定位 `skills/knowledge/db-schema-manager/SKILL.md` L74-88 的分组规则表
- [x] 1.2 移除硬编码的 WMS 分组规则（warehouse/inventory/receipt_order 等）
- [x] 1.3 改为通用规则说明："根据表名前缀和 COMMENT 推断模块分组"
- [x] 1.4 添加配置扩展说明："可通过 domain.yaml 的 database.schema_groups 自定义分组规则"
- [x] 1.5 添加通用分组示例：`user_*` → 用户管理, `order_*` → 订单管理

## 2. codebase-recon 路径示例修复（P0）

- [x] 2.1 定位 `skills/knowledge/codebase-recon/SKILL.md` L29 的数据库路径示例
- [x] 2.2 改为占位符 + 多技术栈示例：
  - Node.js: `backend/prisma/schema.prisma` 或 `src/models/*.ts`
  - Go: `internal/db/schema.sql` 或 `migrations/*.sql`
  - Python: `models.py` 或 `alembic/versions/*.py`
  - Java: `src/main/resources/schema.sql` 或 JPA entities
- [x] 2.3 定位 L40 的目录结构示例
- [x] 2.4 改为多语言示例：
  - Node.js: `backend/src/`, `frontend/src/`
  - Go: `internal/`, `pkg/`, `cmd/`
  - Python: `app/`, `src/`
  - Java: `src/main/java/`
- [x] 2.5 定位 L73 的数据模型检查示例，应用相同的多技术栈修复

## 3. investigate skill 修复（P0）

- [x] 3.1 定位 `skills/workflow/investigate/SKILL.md` L94-98 的 Prisma 命令示例
- [x] 3.2 将 `npx prisma db pull/migrate status/studio` 改为多 ORM 示例：
  - Prisma: `npx prisma migrate status`
  - TypeORM: `npm run typeorm migration:show`
  - Go Migrate: `migrate -path migrations -database postgres://... version`
  - Alembic: `alembic current`
- [x] 3.3 定位 L175 的 `utils/prisma.ts` 示例
- [x] 3.4 改为多语言模板：
  - Node.js: `utils/db.ts` 或 `lib/database.js`
  - Go: `internal/db/conn.go`
  - Python: `utils/db.py`
  - Java: `utils/DatabaseUtil.java`
- [x] 3.5 定位 L258 的 `90_PLANNING/investigations/` 路径
- [x] 3.6 添加容错说明："如果 90_PLANNING/ 不存在，回退到 openspec/changes/{change-name}/investigations/"

## 4. retro skill 修复（P0）

- [x] 4.1 定位 `skills/workflow/retro/SKILL.md` L105 的 `utils/prisma.ts` 示例
- [x] 4.2 改为多语言示例（同 investigate 3.4）
- [x] 4.3 定位 L162 的 `utils/prisma.ts, utils/redis.ts` 模板
- [x] 4.4 改为通用工具类模板说明："单例工具类（数据库连接池、缓存客户端等）"

## 5. plan skill 修复（P0）

- [x] 5.1 定位 `skills/workflow/plan/SKILL.md` L25-26 的目录依赖说明
- [x] 5.2 添加容错说明："90_PLANNING/ 和 10_DOCS/business/ 可选，新项目可跳过"
- [x] 5.3 定位 L60-61 读取 `10_DOCS/business/glossary.md` 的逻辑
- [x] 5.4 添加目录检查和提示：
```markdown
1. 检查 `10_DOCS/business/` 是否存在
2. 如果不存在，提示："10_DOCS/business/ 目录不存在，这是新项目吗？可以跳过领域对齐步骤"
3. 如果存在，读取 glossary.md 和业务矩阵
```
- [x] 5.5 定位 L69 的 WMS 术语示例（"单据中心、库存中心、作业中心"）
- [x] 5.6 改为通用业务模块示例："订单模块、用户模块、支付模块"
- [x] 5.7 搜索并替换所有其他 WMS 特定术语

## 6. verify skill 示例统一（P1）

## 6. verify skill 示例统一（P1）

- [x] 6.1 定位 `skills/workflow/verify/SKILL.md` L97-109 的测试命令示例
- [x] 6.2 验证 L67 是否正确说明"从 domain.yaml 读取配置"
- [x] 6.3 将硬编码命令改为配置驱动示例：
```bash
# 从 domain.yaml 读取测试命令
TEST_CMD=$(cat domain.yaml | yq '.testing.test_commands.unit')
eval "$TEST_CMD"
```
- [x] 6.4 在注释中保留多技术栈参考（npm test / go test / pytest）
- [x] 6.5 验证 L103（集成测试）和 L109（E2E 测试）应用相同修复

## 7. cross-review 降级提示增强（P1）

- [x] 7.1 读取 `skills/knowledge/cross-review/SKILL.md` 的降级逻辑部分
- [x] 7.2 在"执行流程"章节增加降级提示说明
- [x] 7.3 添加示例输出格式：
```
🔍 代码审查（使用 self-review 模式，MCP 工具不可用）
```
- [x] 7.4 在文档中明确三级降级的质量差异：
  - MCP 工具：最高质量，使用外部审查工具
  - Subagent：中等质量，独立 AI 审查
  - self-review：基础质量，自我审查
- [x] 7.5 添加"如何启用 MCP 工具"的参考链接或说明

## 8. ace-propose 容错处理（P1）

- [x] 8.1 定位 `skills/workflow/ace-propose/SKILL.md` L53 的 `find 10_DOCS` 命令
- [x] 8.2 添加目录存在检查：`[ -d "10_DOCS" ] && find 10_DOCS ...`
- [x] 8.3 定位 L108-113 引用 10_DOCS/ 的逻辑
- [x] 8.4 添加容错：目录不存在时跳过，提示"项目暂无知识库，建议后续运行 docs-extractor"

## 9. ace-archive 容错处理（P1）

- [x] 9.1 定位 `skills/workflow/ace-archive/SKILL.md` L78 的 10_DOCS/api/ 依赖
- [x] 9.2 添加目录存在检查和自动创建逻辑
- [x] 9.3 如果 10_DOCS/ 不存在，提示并询问是否创建

## 10. 全局验证（必需）

- [x] 10.1 搜索所有 SKILL.md 中的 `backend/prisma/schema.prisma` 硬编码路径
- [x] 10.2 搜索所有 SKILL.md 中的 `npm test`、`npx prisma` 硬编码命令
- [x] 10.3 搜索所有 WMS 特定术语（warehouse/inventory/shipment/单据中心/库存中心/作业中心）
- [x] 10.4 搜索所有 `utils/prisma.ts`、`utils/redis.ts` 硬编码路径
- [x] 10.5 检查所有 `10_DOCS/` 和 `90_PLANNING/` 依赖是否有容错
- [x] 10.6 验证 `todo-app/domain.yaml` 的 testing 配置是否完整
- [x] 10.7 确认所有修改符合 spec 中的要求（占位符/配置驱动/降级提示/容错处理）

## 11. 文档归档（知识资产）

- [x] 11.1 创建 `10_DOCS/technical/skills-design-principles.md`
- [x] 11.2 记录 Skill 通用性设计原则：
  - 路径使用占位符 + 多技术栈示例
  - 命令配置驱动（domain.yaml）
  - 降级逻辑透明化
  - 避免业务特定逻辑
  - 可选目录容错处理
- [x] 11.3 添加本次修复的经验总结
- [x] 11.4 更新 `10_DOCS/technical/README.md` 索引
