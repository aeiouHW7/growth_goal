## ADDED Requirements

### Requirement: Skills MUST NOT hardcode technology stack paths

Skill 文档中的路径示例 MUST 使用占位符或通用说明，而非硬编码特定技术栈路径（如 `backend/prisma/schema.prisma`）。

#### Scenario: Database schema path is tech-agnostic
- **WHEN** skill 文档需要示例数据库 schema 路径
- **THEN** MUST 使用占位符如 `{project-db-schema-file}` 或列举多种技术栈示例

#### Scenario: Source code path is flexible
- **WHEN** skill 文档需要示例源码路径
- **THEN** MUST 使用 `{source-dir}` 或列举多种语言的典型路径（如 `src/`, `internal/`, `app/`）

#### Scenario: Utils path is polyglot
- **WHEN** skill 示例需要工具类路径（如 utils/prisma.ts）
- **THEN** MUST 列举多种语言示例：
  - Node.js: `utils/db.ts` 或 `lib/database.js`
  - Go: `internal/db/conn.go` 或 `pkg/database/pool.go`
  - Python: `utils/db.py` 或 `lib/database.py`
  - Java: `utils/DatabaseUtil.java` 或 `common/DbHelper.java`

### Requirement: Skills MUST NOT hardcode technology stack commands

Skill 文档中的命令示例 MUST 避免硬编码特定技术栈命令（如 `npx prisma`），改为通用描述或多技术栈示例。

#### Scenario: Database migration commands are polyglot
- **WHEN** investigate skill 需要示例数据库诊断命令
- **THEN** MUST 列举多种技术栈：
  - Prisma: `npx prisma migrate status`
  - TypeORM: `npm run typeorm migration:show`
  - Go Migrate: `migrate -path migrations -database postgres://... version`
  - Alembic: `alembic current`

#### Scenario: Generic description for tech-specific actions
- **WHEN** skill 需要描述技术栈特定操作
- **THEN** MUST 使用通用描述："检查数据库迁移状态"而非 "运行 npx prisma migrate status"

### Requirement: Skills MUST use configuration-driven commands

当 skill 需要执行技术栈特定命令（如测试、构建）时，MUST 从 `domain.yaml` 读取配置，而非硬编码命令。

#### Scenario: Test command reads from domain.yaml
- **WHEN** verify skill 需要运行测试
- **THEN** MUST 从 `domain.yaml` 的 `testing.test_commands` 读取命令
- **AND** 文档示例 MUST 展示如何读取配置，而非硬编码 `npm test`

#### Scenario: Build command reads from domain.yaml
- **WHEN** skill 需要运行构建
- **THEN** MUST 从 `domain.yaml` 的 `build.commands` 读取命令（如果存在）
- **OR** 使用技术栈检测逻辑自动选择（检查 package.json/go.mod/requirements.txt）

### Requirement: Skills MUST handle missing directories gracefully

当 skill 依赖可选目录（如 `10_DOCS/`, `90_PLANNING/`）时，MUST 在目录不存在时提供清晰的提示和初始化建议。

#### Scenario: plan skill handles missing 10_DOCS
- **WHEN** plan skill 需要读取 `10_DOCS/business/glossary.md`
- **AND** 目录不存在
- **THEN** MUST 提示用户："10_DOCS/business/ 目录不存在，这是新项目吗？可以跳过领域对齐步骤，或先运行 docs-extractor 生成知识库"

#### Scenario: investigate outputs to alternative path
- **WHEN** investigate skill 需要输出到 `90_PLANNING/investigations/`
- **AND** 目录不存在
- **THEN** MUST 回退到 `openspec/changes/{change-name}/investigations/` 或询问用户输出位置

#### Scenario: ace-propose handles missing 10_DOCS
- **WHEN** ace-propose 需要引用 `10_DOCS/` 文档
- **AND** 目录不存在或为空
- **THEN** MUST 跳过文档引用，提示"项目暂无知识库，建议后续运行 docs-extractor"

### Requirement: Skills MUST provide fallback logic documentation

当 skill 依赖外部工具或服务（如 MCP、Subagent）时，MUST 在文档中明确说明降级逻辑和用户提示。

#### Scenario: cross-review shows active fallback tier
- **WHEN** cross-review skill 降级到 Subagent 或 self-review
- **THEN** MUST 向用户显示当前使用的审查模式
- **AND** 说明降级原因（如 "MCP 工具不可用，使用 self-review 模式"）

#### Scenario: Fallback tiers are documented
- **WHEN** 用户阅读 cross-review skill 文档
- **THEN** MUST 看到完整的降级链（MCP → Subagent → self-review）
- **AND** 每一层的质量差异说明

### Requirement: Skills MUST avoid business-specific logic

Skill 文档中不得包含特定业务领域的硬编码逻辑（如 WMS 表分组规则、特定业务术语）。

#### Scenario: db-schema-manager has generic grouping
- **WHEN** db-schema-manager 需要按模块分组表
- **THEN** MUST 使用通用规则（如表名前缀、COMMENT 关键词）
- **AND** 提供示例配置而非硬编码分组

#### Scenario: Business logic can be overridden
- **WHEN** 项目需要特定业务分组规则
- **THEN** MUST 支持通过配置文件（如 `domain.yaml` 或 `.db-schema-config.yaml`）覆盖默认规则

#### Scenario: plan skill avoids domain-specific terms
- **WHEN** plan skill 文档提到业务模块示例
- **THEN** MUST 避免特定领域术语（如 "单据中心、库存中心"）
- **AND** 使用通用示例（如 "订单模块、用户模块"）

### Requirement: Documentation examples MUST show multiple tech stacks

当 skill 文档提供示例代码或路径时，MUST 展示至少 2 种不同技术栈的示例。

#### Scenario: codebase-recon shows polyglot examples
- **WHEN** 用户阅读 codebase-recon 的"查找数据库 schema"部分
- **THEN** MUST 看到多种示例：
  - Node.js: `backend/prisma/schema.prisma` 或 `src/models/*.ts`
  - Go: `internal/db/schema.sql` 或 `migrations/*.sql`
  - Python: `models.py` 或 `alembic/versions/*.py`

#### Scenario: verify shows test framework examples
- **WHEN** 用户阅读 verify skill 的测试执行示例
- **THEN** MUST 看到多种框架示例：
  - `npm test` (Jest/Vitest)
  - `go test ./...`
  - `pytest`
  - 配置驱动方式：`domain.yaml.testing.test_commands.unit`

#### Scenario: investigate shows polyglot diagnostic tools
- **WHEN** 用户阅读 investigate skill 的数据库诊断部分
- **THEN** MUST 看到多种 ORM 工具示例（Prisma/TypeORM/GORM/SQLAlchemy）
