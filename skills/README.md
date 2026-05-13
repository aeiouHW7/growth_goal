# ACE Engine Skills

ACE Engine 的技能库，包含系统级、工作流和编码技能。

## Skill 分类

### Coding Skills (`coding/`)

编码相关的技能，帮助提升开发质量和决策能力。

#### dialectical-thinking

**路径**: `skills/coding/dialectical-thinking/`

**描述**: 系统化的辩证思考工具，提供结构化的四阶段工作流（Question → Explore → Compare → Decide），帮助在复杂决策中避免单一路径依赖，通过多方案探索和理性权衡实现更好的技术决策。

**适用场景**:
- 架构设计（系统架构、模块结构、数据模型）
- 技术选型（框架、库、工具、语言选择）
- 方案决策（面对多种实现路径需要选择）
- API 设计（RESTful vs GraphQL、同步 vs 异步等）
- 性能优化策略
- 迁移计划设计

**核心能力**:
- **Question**: 质疑问题本身，识别隐含假设，重新定义问题
- **Explore**: 探索 2-3 种不同方向的方案，暂不评判优劣
- **Compare**: 多维度对比分析，识别关键权衡点
- **Decide**: 明确推荐方案，提供理由和注意事项

**参考资料** (渐进式披露):
- `references/principles.md`: 辩证思考核心原则（第一性原理、逆向思维等）
- `references/patterns.md`: 思考模式库（SWOT、五个为什么、决策矩阵等）
- `references/examples.md`: 真实案例（ACE Engine 设计决策实例）

**使用方式**:
- 自动触发：AI 检测到复杂决策场景时会主动提供工作流
- 手动触发：说"使用辩证思考"或"辩证分析一下"
- 灵活导航：可以接受完整流程，也可以跳过阶段或中途退出

---

## Skill 开发指南

### 创建新 Skill

1. 确定分类（system / workflow / coding）
2. 创建目录：`skills/<category>/<skill-name>/`
3. 创建 `SKILL.md` 文件，包含：
   - YAML frontmatter (name, description)
   - 使用场景说明
   - 核心工作流或指引
   - 示例

### Skill 标准

- **单一职责**: 每个 Skill 应该专注于一个明确的能力
- **终端无关**: 不依赖特定 IDE 或工具
- **渐进式披露**: 核心内容在 SKILL.md，详细参考作为独立文件按需加载
- **可测试**: 明确的触发条件和预期输出

### 参考

- Anthropic Skills 标准: https://github.com/anthropics/skills
- 本项目的 Skill 模板: `templates/skill/`

---

**更新时间**: 2025-05-11  
**维护者**: ACE Engine Team
