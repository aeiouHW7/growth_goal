## Context

全面审查发现当前 ACE Engine 的 Skills 文档中存在以下硬编码问题：

**P0 - 阻塞通用性（5个 Skills）**：
1. **db-schema-manager**: L76-84 硬编码 WMS 业务分组规则（warehouse/inventory/receipt_order 等）
2. **codebase-recon**: L29, 40, 73 硬编码示例路径 `backend/prisma/schema.prisma`、`backend/src/`
3. **investigate**: L94-98 硬编码 Prisma 命令（`npx prisma db pull/migrate status/studio`），L175 硬编码 `utils/prisma.ts`，L258 依赖 `90_PLANNING/investigations/`
4. **retro**: L105, 162 硬编码示例路径 `utils/prisma.ts`, `utils/redis.ts`
5. **plan**: L25-26 依赖 `90_PLANNING/` 和 `10_DOCS/business/`，L60-61 读取 `10_DOCS/business/glossary.md`，L69 包含 WMS 术语（"单据中心、库存中心、作业中心"）

**P1 - 影响体验（4个 Skills）**：
6. **verify**: L97-109 示例硬编码 `npm test`，与 L67 "从 domain.yaml 读取配置"的说明矛盾
7. **cross-review**: 降级逻辑（MCP → Subagent → self-review）存在但缺少用户可见提示
8. **ace-propose**: L53, 108-113 依赖 `10_DOCS/`，新项目无此目录时可能报错
9. **ace-archive**: L78 依赖 `10_DOCS/api/`，需要容错处理

这些问题导致 Skills 仅能在 Node.js + Prisma 技术栈下良好工作，且依赖特定目录结构（10_DOCS/、90_PLANNING/），限制了 ACE 作为通用引擎的适用范围。

## Goals / Non-Goals

**Goals:**
- 修复 9 个 Skills 的硬编码问题（5个 P0 + 4个 P1）
- 文档示例展示多技术栈支持（Node.js/Go/Python/Java）
- 统一配置驱动的命令执行模式
- 降级逻辑透明化
- 处理可选目录（10_DOCS/、90_PLANNING/）不存在的情况

**Non-Goals:**
- 不修改 Skills 的核心逻辑（仅文档层修复）
- 不引入新的配置文件格式
- 不重构现有 domain.yaml 结构
- 不修改其他未受影响的 Skills

## Decisions

### 决策 1: 路径示例使用占位符 + 多技术栈示例

**选择**：在文档中使用 `{project-db-schema-file}` 占位符，并列举多种技术栈的典型路径。

**理由**：
- ✅ 不改变 skill 逻辑，仅优化文档表达
- ✅ 用户一眼看出是示例而非硬性要求
- ✅ 覆盖主流技术栈（Node.js/Go/Python/Java）

**替代方案**：
- ❌ 方案 B: 只用占位符不列举示例 → 用户不知道具体文件名模式
- ❌ 方案 C: 每个技术栈单独文档 → 维护成本高

### 决策 2: 移除业务特定分组规则，提供配置扩展点

**选择**：db-schema-manager 移除 WMS 分组规则（L74-88），改为通用规则（表名前缀 + COMMENT 关键词），并说明可通过配置文件扩展。

**理由**：
- ✅ 通用规则适用于所有项目
- ✅ 保留扩展能力（未来可支持 `.db-schema-config.yaml`）
- ✅ 符合 "终端无关" 核心理念

**替代方案**：
- ❌ 方案 B: 保留 WMS 规则并加注释 → 用户仍需手动删除
- ❌ 方案 C: 完全移除分组功能 → 功能退化

### 决策 3: verify skill 示例改为配置驱动模式

**选择**：L97-109 的硬编码命令示例改为：
```bash
# 从 domain.yaml 读取测试命令
TEST_CMD=$(cat domain.yaml | yq '.testing.test_commands.unit')
eval "$TEST_CMD"
```

**理由**：
- ✅ 与 L67 的文档说明一致
- ✅ 展示配置驱动的实际用法
- ✅ 仍保留多技术栈示例作为注释

**替代方案**：
- ❌ 方案 B: 删除所有示例 → 用户不知道如何使用
- ❌ 方案 C: 分技术栈分段示例 → 文档冗长

### 决策 5: 新增 - investigate/retro 命令多技术栈化

**选择**：investigate 和 retro 的 Prisma 特定示例改为多技术栈示例。

**理由**：
- ✅ investigate L94-98 的 `npx prisma` 命令改为列举多种 ORM 工具
- ✅ retro L105, 162 的 `utils/prisma.ts` 改为多语言模板示例
- ✅ 保持 skill 功能完整，仅示例通用化

**替代方案**：
- ❌ 方案 B: 删除所有技术栈特定示例 → 失去参考价值
- ❌ 方案 C: 每种技术栈单独章节 → 文档过长

### 决策 6: 新增 - 可选目录容错处理

**选择**：plan/ace-propose/ace-archive 等依赖 `10_DOCS/` 和 `90_PLANNING/` 的 skills，在目录不存在时提供清晰提示和回退方案。

**理由**：
- ✅ plan skill 在读取 `10_DOCS/business/glossary.md` 前检查目录是否存在
- ✅ 提示："10_DOCS/business/ 目录不存在，这是新项目吗？可以跳过领域对齐步骤"
- ✅ investigate 输出回退到 `openspec/changes/{change-name}/investigations/`
- ✅ 符合 ACE "渐进式启用" 理念

**替代方案**：
- ❌ 方案 B: 强制要求目录存在 → 新项目无法使用
- ❌ 方案 C: 自动创建空目录 → 混淆用户预期

### 决策 7: 新增 - 移除 plan skill 的 WMS 术语

**选择**：plan skill L69 的 WMS 特定术语（"单据中心、库存中心、作业中心"）改为通用示例。

**理由**：
- ✅ 使用通用业务模块示例："订单模块、用户模块、支付模块"
- ✅ 避免误导用户认为 ACE 仅适用于 WMS 场景
- ✅ 保持 O.A.I.S 方法论的通用性

**替代方案**：
- ❌ 方案 B: 保留 WMS 术语并加注释 → 仍有误导性
- ❌ 方案 C: 完全删除示例 → 用户不知道如何应用

**选择**：在 cross-review skill 执行时，输出当前使用的审查模式：
```
🔍 代码审查（使用 self-review 模式，MCP 工具不可用）
```

**理由**：
- ✅ 用户清楚知道当前审查质量
- ✅ 不改变降级逻辑，仅增加提示
- ✅ 透明化 MCP/Subagent 的降级过程

**替代方案**：
- ❌ 方案 B: 仅文档说明不加运行时提示 → 用户仍不知道实际使用哪种模式
- ❌ 方案 C: 强制要求 MCP → 降低可用性

## Risks / Trade-offs

### 风险 1: 文档示例过多导致维护负担

**Risk**: 多技术栈示例需要持续维护（如 Go 1.21 → 1.22 路径变化）

**Mitigation**:
- 仅列举主流稳定技术栈（Node.js/Go/Python）
- 示例使用通用路径模式（如 `src/`），不绑定具体版本
- 在文档中注明"示例仅供参考，实际路径以项目结构为准"

### 风险 2: 占位符可能被误解为变量

**Risk**: 用户可能认为 `{project-db-schema-file}` 是需要替换的环境变量

**Mitigation**:
- 在首次使用占位符时加说明："示例路径（根据实际项目替换）"
- 同时提供具体示例避免歧义

### 风险 3: cross-review 提示可能干扰 AI 输出

**Risk**: 降级提示可能被用户误认为是功能降级的"警告"

**Mitigation**:
- 使用中性语气："使用 self-review 模式"而非"降级到 self-review"
- 仅在首次降级时提示，避免重复显示

## Implementation Strategy

### 修改顺序（按影响面从小到大）

**P0 - 阻塞通用性（5个 Skills）**：
1. **db-schema-manager** - 移除 WMS 硬编码分组规则（L76-84）
2. **codebase-recon** - 路径示例改为占位符 + 多技术栈（L29, 40, 73）
3. **investigate** - Prisma 命令改为多 ORM 示例（L94-98, 175, 258）
4. **retro** - 路径示例改为多语言模板（L105, 162）
5. **plan** - 处理 10_DOCS/ 和 90_PLANNING/ 容错，移除 WMS 术语（L25-26, 60-61, 69）

**P1 - 影响体验（4个 Skills）**：
6. **verify** - 示例改为配置驱动（L97-109）
7. **cross-review** - 增加降级提示
8. **ace-propose** - 10_DOCS/ 容错处理（L53, 108-113）
9. **ace-archive** - 10_DOCS/ 容错处理（L78）

### 验证方法

**文档验证**：
- 搜索所有 `backend/prisma/schema.prisma` 硬编码路径
- 搜索所有 `npm test`、`npx prisma` 硬编码命令
- 检查所有 WMS 特定术语（warehouse/inventory/shipment/单据中心/库存中心）
- 搜索所有 `utils/prisma.ts`、`utils/redis.ts` 硬编码路径
- 检查所有 `10_DOCS/` 和 `90_PLANNING/` 依赖是否有容错

**回归测试**：
- todo-app 项目运行完整流程：explore → propose → apply → verify → archive
- 验证 verify skill 仍能从 domain.yaml 读取测试命令

## Open Questions

无 - 所有修改点已明确，无需额外决策。
