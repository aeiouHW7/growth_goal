## Why

AI 容易陷入"执行者模式"，对用户指令直接执行而缺少质疑和多方案探索。这导致单一路径依赖、忽略风险、过度服从。我们需要一个系统化的辩证思考工具，让 AI 在面对复杂决策时能够：质疑需求本身、探索多种方案、识别权衡点、给出有论证的推荐。现在创建是因为 ACE 引擎正在完善核心能力，辩证思考是 ETHOS 的核心原则之一，应该工具化、可复用。

## What Changes

- 创建 `skills/coding/dialectical-thinking/` Skill，提供结构化的辩证思考工作流
- 参考 Anthropic 官方 Skills 的设计模式（progressive disclosure、灵活工作流）
- 提供四阶段工作流：质疑问题 → 探索方案 → 对比分析 → 决策推荐
- 包含可选的参考资料：原则库、思考模式库、实战案例
- 在 SKILL.md 中定义清晰的触发条件（自动触发 + 用户调用）
- 允许用户选择接受或拒绝工作流（灵活性）

## Capabilities

### New Capabilities
- `dialectical-workflow`: 四阶段辩证思考工作流（Question → Explore → Compare → Decide）
- `trigger-conditions`: AI 自主判断何时需要辩证思考的条件
- `reference-materials`: 按需加载的原则库和模式库（渐进式披露）

### Modified Capabilities
<!-- 无现有能力需要修改 -->

## Impact

**新增文件**:
- `skills/coding/dialectical-thinking/SKILL.md` - 核心工作流和触发逻辑
- `skills/coding/dialectical-thinking/references/principles.md` - 辩证原则库
- `skills/coding/dialectical-thinking/references/patterns.md` - 思考模式库
- `skills/coding/dialectical-thinking/references/examples.md` - 实战案例

**文档更新**:
- `skills/README.md` - 添加辩证思考 Skill 的索引
- `.claude/memory/decisions.md` - 记录 Skill 设计决策

**影响范围**:
- 所有需要复杂决策的场景（架构设计、技术选型、需求分析）
- OpenSpec 的 Explore 和 Plan 阶段可能会主动触发此 Skill
- 不影响现有代码，纯增量

---

## 方案对比

### 方案 A：强制流程（❌ 未采用）
- 每次大任务前自动执行固定的辩证步骤
- 优点：确保每次都进行思考
- 缺点：机械化、缺乏灵活性、可能过度

### 方案 B：工具箱模式（✅ 已采用）
- 提供结构化工作流，但允许用户选择接受或拒绝
- 参考 Anthropic `doc-coauthoring` 的模式
- 优点：灵活、实用、符合 Anthropic 最佳实践
- 缺点：依赖 AI 的触发判断

**选择理由**: 方案 B 平衡了系统性和灵活性，符合 Anthropic 官方 Skills 的设计哲学。

---

## 风险评估

1. **Undertrigger 风险**: AI 可能不触发 Skill
   - 缓解：在 description 中写得"aggressive"，明确列出触发关键词

2. **过度触发**: 简单问题也走辩证流程
   - 缓解：明确触发条件，只在复杂决策时触发

3. **用户体验**: 用户可能觉得 AI 太啰嗦
   - 缓解：允许用户拒绝工作流，快速给出方案

---

## 资产审计

**新增 10_DOCS**:
- `domains/ace-core/10_DOCS/technical/dialectical-thinking-design.md` - Skill 设计决策
- 更新 `domains/ace-core/10_DOCS/business/core-concepts.md` - 添加辩证思考概念

---

## 回滚计划

如果 Skill 表现不佳：
1. 禁用 Skill（删除或注释 SKILL.md 的 frontmatter）
2. 从 skills/README.md 移除索引
3. 无需回滚代码（纯增量，无破坏性修改）
