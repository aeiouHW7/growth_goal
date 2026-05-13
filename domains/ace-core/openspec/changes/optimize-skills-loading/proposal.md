## Why

当前 ACE Engine 拥有 16 个 Skills（4619 行文档），随着项目发展预计增长到 50+ 个。所有 Skills 全量加载到 Agent 上下文导致：
1. **Token 成本高**：每次对话携带完整 Skills 文档（预计增长到 15K+ 行）
2. **响应速度慢**：大量上下文处理时间
3. **可发现性下降**：关键 Skills 淹没在大量 Skills 列表中

需要建立分层加载机制，在保持可发现性的同时控制上下文成本。

## What Changes

1. 创建轻量级 Skills 索引（`skills/SKILLS_INDEX.md`），分类展示所有 Skills
2. 精简现有 SKILL.md 文档，移除冗余示例到 `references/` 目录
3. 建立 Skills 加载策略规范（文档化哪些必须加载、哪些按需加载）
4. 优化 SKILL.md 模板标准，减少文档冗余

## Capabilities

### New Capabilities
- `skills-index`: 创建轻量级 Skills 索引系统，支持分类浏览和快速查找
- `skills-loading-strategy`: 定义 Skills 分层加载策略（Always/Auto-Trigger/Manual）

### Modified Capabilities
<!-- 无现有能力变更 -->

## Impact

**文件变更**：
- 新增：`skills/SKILLS_INDEX.md`（300 行以内）
- 新增：`10_DOCS/technical/skills-loading-strategy.md`（加载策略文档）
- 修改：16 个现有 `skills/*/SKILL.md`（精简示例，平均减少 40-50%）
- 新增：各 Skill 的 `references/examples.md`（迁移示例）

**上下文成本**：
- 当前：~4.6K 行 Skills 文档
- 优化后：~300 行索引 + ~2.5K 行核心文档 = ~2.8K 行（减少 39%）
- 未来扩展到 50 个 Skills 时：~300 行索引 + ~3.5K 行核心文档 = ~3.8K 行（vs 全量 15K+ 行）

**向后兼容**：
- ✅ 不影响现有 Skills 功能
- ✅ 不依赖 Claude Code 核心修改
- ✅ 渐进式迁移，可逐个 Skill 优化

## 方案对比

### 方案 A：继续全量加载 + 压缩文档（本方案）
**优点**：
- 零配置，AI 仍能看到所有 Skills
- 立即见效，减少 40% 上下文
- 向后兼容，渐进式优化

**缺点**：
- 50+ Skills 时仍有压力（但可接受）

### 方案 B：按需加载 + Skill Registry
**优点**：
- 可扩展到 100+ Skills
- 最小上下文成本

**缺点**：
- 需要修改 Claude Code 核心
- AI 看不见未加载的 Skills，可发现性差
- 实现复杂度高

**选择理由**：方案 A 在当前阶段（16→50 Skills）性价比更高，可作为方案 B 的前置优化。

## 风险评估

**技术债**：
- 文档分离（SKILL.md vs references/）增加维护成本
- **缓解**：制定 SKILL.md 模板标准，自动化检查文档结构

**迁移成本**：
- 16 个 Skills 需要逐个精简和测试
- **缓解**：设定优先级（workflow > knowledge > system），分批迁移

**可发现性下降**：
- 示例移到 references/ 后不在主文档中
- **缓解**：SKILLS_INDEX.md 提供快速导航，SKILL.md 保留核心场景说明

## 资产审计

**新增知识资产**：
- `10_DOCS/technical/skills-loading-strategy.md` - Skills 加载策略和最佳实践
- `10_DOCS/technical/skills-template-standard.md` - SKILL.md 模板标准

**更新知识资产**：
- `10_DOCS/technical/skills-design-principles.md` - 补充文档精简原则

## 回滚计划

1. **保留原始文档**：精简前通过 Git 保留完整历史
2. **分批迁移**：先优化 1-2 个 Skill 验证效果，再批量应用
3. **监控指标**：记录优化前后的 Token 使用量和响应时间
4. **快速恢复**：如果发现可发现性问题，可通过 Git revert 恢复原文档结构
