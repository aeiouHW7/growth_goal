## Context

当前 ACE Engine 有 16 个 Skills，总计 4619 行文档。所有 Skills 在每次对话时全量加载到上下文，随着 Skills 数量增长（预计 50+），将导致：
- Token 成本线性增长
- 响应速度下降
- 关键 Skills 淹没在大量列表中

现有架构：
- Skills 按功能分类（workflow/knowledge/system/coding）
- 每个 Skill 独立的 SKILL.md 文档
- 无索引机制，AI 需扫描所有 SKILL.md frontmatter
- 文档包含大量示例和解释（平均 290 行/Skill）

约束：
- 不修改 Claude Code 核心加载机制（保持向后兼容）
- 不影响现有 Skills 功能
- 支持渐进式迁移（不强制一次性全改）

## Goals / Non-Goals

**Goals:**
1. 创建轻量级 Skills 索引系统（`skills/SKILLS_INDEX.md`）
2. 精简 SKILL.md 文档至 150-200 行（当前 290 行）
3. 建立分层加载策略文档（Always/Auto-Trigger/Manual）
4. 减少 40% 上下文成本（4.6K → 2.8K 行）
5. 支持未来扩展到 50 个 Skills（上下文 <4K 行）

**Non-Goals:**
- 不修改 Claude Code Skills 加载机制（属基础设施层）
- 不实现自动按需加载（需要 Claude Code 支持，属 Phase 2）
- 不改变 Skills 功能和调用方式
- 不强制一次性迁移所有 Skills

## Decisions

### 决策 1：创建 SKILLS_INDEX.md 而非 JSON 配置

**选择**：使用 Markdown 索引文件而非 JSON/YAML 配置

**理由**：
- ✅ Markdown 对 AI 更友好（自然语言理解）
- ✅ 人类可读性强，易于手动维护
- ✅ 符合 ACE "终端无关，Markdown 为核心" 原则
- ✅ 无需解析库，直接纳入上下文

**替代方案**：JSON/YAML 配置文件
- ❌ 需要解析逻辑
- ❌ 对 AI 不直观（需要先理解结构）
- ❌ 不符合知识资产设计理念

### 决策 2：文档精简策略 - 核心 + References 分离

**选择**：SKILL.md 只保留核心流程，详细示例移到 `references/examples.md`

**结构**：
```
skills/workflow/ace-propose/
  ├── SKILL.md (核心，150-200 行)
  └── references/
      ├── examples.md (详细示例)
      └── advanced.md (高级用法，可选)
```

**理由**：
- ✅ 核心文档快速加载，覆盖 80% 场景
- ✅ 详细示例按需查阅（AI 可在需要时读取 references/）
- ✅ 减少噪音，提高可读性

**替代方案**：压缩单个文件内容
- ❌ 示例难以完全删除（影响可理解性）
- ❌ 无法灵活扩展（新示例无处安放）

### 决策 3：三层加载策略分类

**选择**：Always Load（Workflow） + Auto-Trigger（Knowledge/Coding） + Manual（System）

**分层依据**：
| 层级 | 分类 | 使用频率 | 触发方式 |
|------|------|----------|----------|
| Always | workflow/* | 每个变更都用 | 自动加载 |
| Auto-Trigger | knowledge/* coding/* | 特定场景 | 关键词触发（文档化） |
| Manual | system/* | 一次性工具 | 用户显式调用 |

**理由**：
- ✅ 保证核心流程 Skills 始终可见（可发现性）
- ✅ 按需加载降低常规对话成本
- ✅ 清晰的使用指引（何时加载何种 Skill）

**触发关键词映射**（文档化，非代码实现）：
```markdown
## Auto-Trigger 映射表
- "数据库" / "DDL" / "表结构" → db-schema-manager
- "类似实现" / "现有代码" → codebase-recon
- "技术选型" / "架构决策" → dialectical-thinking
```

**替代方案**：全部按需加载
- ❌ Workflow Skills 是核心，不应按需（降低可发现性）

### 决策 4：SKILL.md 模板标准化

**模板结构**：
```markdown
---
name: skill-name
description: 简短描述（1-2 行）
triggers: [关键词1, 关键词2]  # 新增字段
---

## When to Use (3-5 行)
关键场景说明

## Workflow (核心步骤)
1. 步骤 1
2. 步骤 2

## Guardrails
- 约束 1
- 约束 2

## References
- [详细示例](./references/examples.md)
- [高级用法](./references/advanced.md)
```

**理由**：
- ✅ 统一结构，易于维护和 AI 理解
- ✅ `triggers` 字段支持未来按需加载（预留扩展）
- ✅ References 明确指向详细文档

### 决策 5：渐进式迁移优先级

**迁移顺序**：
1. **P0 - Workflow Skills（9 个）**：使用频率最高，优先精简
2. **P1 - Knowledge Skills（4 个）**：上下文成本大，次优先
3. **P2 - System/Coding Skills（3 个）**：使用频率低，最后处理

**验证方法**：
- 迁移 1-2 个 Skill 后测量上下文减少量
- 确认功能无影响后批量应用

**理由**：
- ✅ 降低风险（逐步验证）
- ✅ 优先优化高频场景（ROI 最大）

## Risks / Trade-offs

### 风险 1：文档分离增加维护成本

**风险**：SKILL.md 和 references/ 分离后，更新时需同步维护

**缓解**：
- 建立模板标准（明确哪些内容属于核心 vs 详细）
- 在 SKILL.md 底部添加 References 章节，强制链接到详细文档
- 未来可考虑自动检查（CI 验证 references/ 链接有效性）

### 风险 2：可发现性下降

**风险**：示例移到 references/ 后，用户/AI 可能不知道有详细文档

**缓解**：
- SKILL.md 必须包含 References 章节
- SKILLS_INDEX.md 在每个 Skill 后标注"详细示例"链接
- 在 10_DOCS 中明确说明 references/ 的使用方法

### 风险 3：Auto-Trigger 依赖文档而非代码

**风险**：关键词触发映射仅在文档中说明，AI 可能忽略

**缓解**：
- 在 SKILLS_INDEX.md 醒目位置列出触发映射表
- 在每个 Skill 的 frontmatter 添加 `triggers` 字段
- Phase 2 可考虑实现自动加载（需 Claude Code 支持）

### Trade-off：全量索引 vs 分类索引

**选择**：分类索引（按 workflow/knowledge/system/coding 分类）

**权衡**：
- ✅ 分类清晰，符合使用场景
- ❌ 跨分类查找稍慢（但 Skills 数量有限，影响小）

## Migration Plan

### Phase 1：创建基础设施（1-2 天）

1. 创建 `skills/SKILLS_INDEX.md` 模板
2. 创建 SKILL.md 精简模板
3. 创建 `10_DOCS/technical/skills-loading-strategy.md`
4. 创建 `10_DOCS/technical/skills-template-standard.md`

### Phase 2：试点迁移（1-2 天）

1. 选择 1 个 Workflow Skill（如 ace-propose）精简
2. 验证：
   - 功能无影响
   - 文档可读性
   - 上下文减少量
3. 根据反馈调整模板

### Phase 3：批量迁移（3-5 天）

1. P0：迁移所有 Workflow Skills（9 个）
2. P1：迁移 Knowledge Skills（4 个）
3. P2：迁移 System/Coding Skills（3 个）
4. 每批次迁移后测量上下文成本

### Phase 4：验证和文档化（1 天）

1. 验证所有 Skills 功能正常
2. 测量最终上下文减少量
3. 更新 `10_DOCS/technical/skills-design-principles.md`

### Rollback 策略

- Git 保留完整历史，可随时 revert
- 分批迁移，单个 Skill 出问题不影响整体
- 优先迁移低风险 Skills（System），验证后再迁移核心 Skills（Workflow）

## Open Questions

1. **是否需要自动化检查工具？**
   - 检查 SKILL.md 长度
   - 检查 references/ 链接有效性
   - 检查 triggers 字段存在
   - **决策延后**：先手动迁移，看是否有自动化需求

2. **references/ 目录结构是否需要标准化？**
   - 当前方案：`references/examples.md`（单文件）
   - 替代方案：`references/examples/scenario-1.md`（多文件）
   - **决策延后**：先使用单文件，复杂 Skill 再考虑多文件

3. **是否为 Phase 2 预留扩展点？**
   - frontmatter 添加 `triggers` 字段
   - 添加 `auto_load` 布尔字段？
   - **决策**：添加 `triggers` 字段，为未来自动加载做准备

## DRY 原则审计

**复用现有资产**：
- ✅ 复用 `10_DOCS/technical/skills-design-principles.md` 文档结构
- ✅ 参考 fix-skills-portability 变更的精简经验

**避免重复**：
- ✅ SKILLS_INDEX.md 不重复 SKILL.md 内容（只保留摘要）
- ✅ references/ 避免与 10_DOCS/ 重复（references 是 Skill 特定，10_DOCS 是项目级）
