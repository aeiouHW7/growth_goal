# Skills 通用性设计原则

**变更**: fix-skills-portability
**日期**: 2026-05-13

## 概述

本文档记录 ACE Engine Skills 的通用性设计原则，确保 Skills 能够跨技术栈、跨项目使用，避免硬编码和特定项目假设。

## 核心原则

### 1. 路径使用占位符 + 多技术栈示例

**原则**：文档中的路径示例不得硬编码特定技术栈路径，应使用占位符或列举多种技术栈示例。

**错误示例**：
```markdown
- 查数据库：检查 `backend/prisma/schema.prisma`
```

**正确示例**：
```markdown
- 查数据库schema文件（根据项目技术栈）：
  - Node.js: `backend/prisma/schema.prisma` 或 `src/models/*.ts` (TypeORM)
  - Go: `internal/db/schema.sql` 或 `migrations/*.sql`
  - Python: `models.py` 或 `alembic/versions/*.py`
  - Java: `src/main/resources/schema.sql` 或 JPA entities
```

**适用范围**：
- 数据库 schema 文件
- 源码目录结构
- 工具类路径
- 配置文件路径

### 2. 命令配置驱动（domain.yaml）

**原则**：技术栈特定命令（测试、构建、迁移等）应从 `domain.yaml` 读取配置，而非硬编码。

**错误示例**：
```bash
npm test -- --coverage
```

**正确示例**：
```bash
# 从 domain.yaml 读取测试命令
TEST_CMD=$(cat domain.yaml | yq '.testing.test_commands.unit')
eval "$TEST_CMD"

# 或根据项目技术栈手动执行：
# Node.js: npm test -- --coverage
# Go: go test ./... -cover
# Python: pytest --cov
```

**适用命令**：
- 测试命令（unit/integration/e2e）
- 构建命令
- 数据库迁移命令
- 代码生成命令

### 3. 降级逻辑透明化

**原则**：当 skill 依赖外部工具或服务时，必须明确说明降级逻辑和用户可见提示。

**示例**：cross-review skill 的三级降级

```
Level 1: MCP 工具（最高质量）
  ↓ 不可用时降级
Level 2: Subagent（中等质量）
  ↓ 不可用时降级
Level 3: self-review（基础质量）
```

**用户提示格式**：
```
🔍 代码审查（使用 self-review 模式，MCP 和 Subagent 不可用）
⚠️ 交叉审核降级为自审（缺少独立视角，建议人工重点复核）
```

**文档要求**：
- 明确每一层的质量差异
- 提供启用更高层级的方法
- 降级时显示当前使用的模式

### 4. 避免业务特定逻辑

**原则**：Skills 不得包含特定业务领域的硬编码逻辑（如 WMS 表分组规则、特定业务术语）。

**错误示例**：
```markdown
| 表名前缀 | 模块 |
| warehouse_* | 仓储管理 |
| inventory_* | 库存管理 |
| shipment_order* | 出库管理 |
```

**正确示例**：
```markdown
根据表名前缀和 COMMENT 关键词自动推断模块分组。

通用示例：
| 表名前缀 | 模块 |
| user_* | 用户管理 |
| order_* | 订单管理 |
| product_* | 商品管理 |

可通过 domain.yaml 的 database.schema_groups 自定义分组规则。
```

**适用场景**：
- 数据库表分组
- 业务模块示例
- 实体命名示例
- 流程示例

### 5. 可选目录容错处理

**原则**：Skills 依赖可选目录（如 `10_DOCS/`, `90_PLANNING/`）时，必须在目录不存在时提供清晰提示和回退方案。

**示例**：plan skill 的容错处理

```markdown
1. **检查** `10_DOCS/business/` **是否存在**
   - 如果不存在，提示用户："10_DOCS/business/ 目录不存在，这是新项目吗？可以跳过领域对齐步骤，或先运行 docs-extractor 生成知识库"
   - 用户确认跳过后，直接进入下一步

2. **如果目录存在**，读取相关文档
```

**回退策略**：
- plan skill: 跳过领域对齐，直接进入需求探索
- investigate skill: 90_PLANNING/ 不存在时，回退到 openspec/changes/{change-name}/investigations/
- ace-archive skill: 10_DOCS/ 不存在时，询问是否创建

## 本次修复经验总结

### 修复范围

- **9 个 Skills** 受影响（5个 P0 + 4个 P1）
- **61 个子任务** 完成
- **3 个核心问题类型**：路径硬编码、命令硬编码、目录依赖

### 发现的典型问题

1. **db-schema-manager**: 硬编码 WMS 业务分组规则（warehouse/inventory 等）
2. **codebase-recon**: 硬编码 Node.js + Prisma 路径示例
3. **investigate/retro**: 硬编码 Prisma 命令和 utils/ 路径
4. **plan**: 依赖 10_DOCS/ 和 90_PLANNING/，包含 WMS 术语
5. **verify**: 示例硬编码 npm test，与文档说明"从 domain.yaml 读取"矛盾
6. **ace-propose/ace-archive**: 未处理 10_DOCS/ 不存在的情况

### 修复方法

| 问题类型 | 修复方法 | 示例 |
|---------|---------|------|
| 路径硬编码 | 列举多技术栈示例 | backend/prisma → Node.js/Go/Python/Java 示例 |
| 命令硬编码 | 配置驱动 + 多技术栈注释 | npm test → 从 domain.yaml 读取 + 注释列举 |
| 业务逻辑硬编码 | 通用规则 + 配置扩展 | WMS 分组规则 → 通用前缀规则 + domain.yaml 扩展 |
| 目录依赖 | 存在性检查 + 提示 + 回退 | 10_DOCS/ 不存在 → 提示 + 跳过或创建 |
| 降级逻辑 | 用户可见提示 + 质量说明 | cross-review → 显示当前使用模式 |

### 受益技术栈

修复后，ACE Engine Skills 支持以下技术栈：

- **Node.js**: Prisma, TypeORM, Sequelize
- **Go**: GORM, Go Migrate, 原生 SQL
- **Python**: SQLAlchemy, Alembic, Django ORM
- **Java**: JPA, MyBatis, Hibernate

### 验证方法

**文档层验证**：
```bash
# 搜索硬编码路径
grep -r "backend/prisma/schema.prisma" skills --include="*.md"

# 搜索硬编码命令
grep -r "npm test\|npx prisma" skills --include="*.md"

# 搜索业务特定术语
grep -r "warehouse\|inventory\|shipment\|单据中心\|库存中心" skills --include="*.md"
```

**功能层验证**：
- todo-app 项目运行完整流程：explore → propose → apply → verify → archive
- verify skill 从 domain.yaml 读取测试命令
- plan skill 在新项目中正确处理 10_DOCS/ 不存在的情况

## 最佳实践建议

### 编写新 Skill 时

1. **路径示例**：始终列举至少 2 种技术栈示例
2. **命令示例**：优先从 domain.yaml 读取，注释中列举多技术栈参考
3. **业务示例**：使用通用业务场景（用户/订单/商品），避免特定领域术语
4. **目录依赖**：明确标注是必需还是可选，可选目录必须有容错处理
5. **降级逻辑**：如果依赖外部工具，必须文档化降级链并在运行时提示

### 审查 Skill 时

检查清单：
- [ ] 路径示例是否包含多技术栈？
- [ ] 命令是否配置驱动或有多技术栈注释？
- [ ] 是否包含特定业务术语？
- [ ] 可选目录是否有容错处理？
- [ ] 降级逻辑是否透明？

## 参考

- [fix-skills-portability proposal](../../openspec/changes/fix-skills-portability/proposal.md)
- [fix-skills-portability design](../../openspec/changes/fix-skills-portability/design.md)
- [fix-skills-portability spec](../../openspec/changes/fix-skills-portability/specs/skill-portability/spec.md)
