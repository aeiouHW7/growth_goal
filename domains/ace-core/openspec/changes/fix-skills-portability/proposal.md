## Why

当前 ACE Engine 的部分 Skills 存在硬编码路径和特定项目假设，导致只能在 Node.js + Prisma 技术栈下使用。这限制了 ACE 作为通用开发引擎的适用范围，影响 Java/Go/Python 等其他技术栈项目的使用体验。

## What Changes

**P0 - 阻塞通用性（5个 Skills）**：
- 移除 `db-schema-manager` 中硬编码的 WMS 业务分组规则（L76-84）
- 修复 `codebase-recon` 路径示例（L29, 40, 73）- backend/prisma/schema.prisma 改为多技术栈示例
- 修复 `investigate` 的 Prisma 硬编码（L94-98, 175, 258）- npx prisma 命令改为通用示例
- 修复 `retro` 的路径示例（L105, 162）- utils/prisma.ts 改为多技术栈模板
- 修复 `plan` 的目录依赖（L25-26, 60-61, 69）- 处理 10_DOCS/ 和 90_PLANNING/ 不存在的情况，移除 WMS 术语

**P1 - 影响体验（4个 Skills）**：
- 统一 `verify` skill 文档示例（L97-109）- 与 domain.yaml 驱动逻辑保持一致
- 增强 `cross-review` skill 的降级提示透明度
- 修复 `ace-propose` 的 10_DOCS/ 依赖（L53, 108-113）- 容错处理
- 修复 `ace-archive` 的 10_DOCS/ 依赖（L78）- 容错处理

## Capabilities

### New Capabilities
- `skill-portability`: Skills 跨技术栈通用性支持 - 文档示例、配置驱动、降级提示

### Modified Capabilities
<!-- 无需修改现有 capability 的规格，仅修复文档和提示 -->

## Impact

**受影响文件**：
- `skills/knowledge/db-schema-manager/SKILL.md` (P0)
- `skills/knowledge/codebase-recon/SKILL.md` (P0)
- `skills/workflow/investigate/SKILL.md` (P0)
- `skills/workflow/retro/SKILL.md` (P0)
- `skills/workflow/plan/SKILL.md` (P0)
- `skills/workflow/verify/SKILL.md` (P1)
- `skills/knowledge/cross-review/SKILL.md` (P1)
- `skills/workflow/ace-propose/SKILL.md` (P1)
- `skills/workflow/ace-archive/SKILL.md` (P1)

**受益场景**：
- Java + MyBatis 项目
- Go + GORM 项目
- Python + SQLAlchemy 项目
- 非 Prisma 的 Node.js 项目（TypeORM/Sequelize）

**风险**：
- 极低 - 仅修改文档和提示，不改变 skill 核心逻辑

## 方案对比

**方案 A - 精准修复**（✅ 选择）
- 修复 9 个具体问题（5个 P0 + 4个 P1）
- 保持现有结构和逻辑
- 风险低，影响范围明确
- 快速见效

**方案 B - 全面重构**
- 所有 skills 统一适配多技术栈
- domain.yaml 驱动所有配置
- 工作量大，风险高
- 可能引入新问题

选择方案 A 的原因：当前问题是文档层面的硬编码示例，不是架构问题。通过精准修复可以快速提升通用性，无需大规模重构。

## 风险评估

**技术风险**：
- ✅ 低 - 仅文档修改，不涉及代码逻辑
- ✅ 回归测试：现有 todo-app 示例项目应保持可用

**兼容性风险**：
- ✅ 无破坏性变更 - 文档优化不影响已有用户

**知识资产影响**：
- 需要更新的文档：9 个 SKILL.md 文件（5个 P0 + 4个 P1）
- 新增文档：无
- 归档到 10_DOCS：本次变更经验归档到 `10_DOCS/technical/skills-design-principles.md`

## 回滚计划

如果修复后发现问题：
1. Git revert 对应的 commit
2. 恢复原始 SKILL.md 内容
3. 影响范围小，回滚成本低
