## Context

辩证思考 Skill 是为了解决 AI 在开发任务中容易陷入"执行者模式"的问题——直接执行用户指令而缺少质疑、探索多方案的能力。这导致单一路径依赖、忽略风险、过度服从。

**当前状态**: 
- ACE 引擎已有系统级 Skills（ace-doctor, ace-init-domain 等）
- 缺少结构化的思考工作流工具
- ETHOS 核心原则中已明确"辩证思考"，但尚未工具化

**约束条件**:
- 必须符合 Anthropic Skills 标准（SKILL.md + YAML frontmatter）
- 需要灵活（不能强制用户接受流程）
- 渐进式披露（按需加载参考资料）
- 可被其他 Skills 或工作流复用

**参考模式**: 
- Anthropic 官方的 `doc-coauthoring` Skill（提供工作流但允许拒绝）
- `skill-creator` 的 progressive disclosure 模式

---

## Goals / Non-Goals

**Goals:**
- 提供四阶段辩证工作流：Question → Explore → Compare → Decide
- 自动触发条件清晰（复杂决策、架构设计、多方案选型）
- 允许用户选择接受或拒绝工作流
- 包含可选参考资料（原则库、模式库、案例库）
- 可在 OpenSpec 的 Explore 和 Plan 阶段主动触发

**Non-Goals:**
- 不是每个任务都强制使用的流程（避免机械化）
- 不涵盖代码实现细节（专注于方案决策层）
- 不替代用户最终决策（AI 只提供推荐）

---

## Decisions

### 决策 1: 工作流模式 - 工具箱模式（Toolbox Mode）

**选择**: 参考 `doc-coauthoring`，提供结构化工作流但允许用户拒绝。

**替代方案**:
- ❌ 强制流程：每次大任务前自动执行固定步骤
- ✅ 工具箱模式：提供清晰的工作流，用户可选择接受或跳过

**理由**:
- 符合 Anthropic Skills 的灵活性哲学
- 避免机械化和过度打断
- 在需要时提供结构，不需要时退出

**实现方式**:
SKILL.md 中使用提问方式开场：
```markdown
## Workflow Offer

我注意到这是一个 [复杂决策/架构设计/多方案选型] 任务。

我可以引导你通过辩证思考工作流：
1. **Question**: 质疑问题本身
2. **Explore**: 探索 2-3 种方案
3. **Compare**: 对比权衡
4. **Decide**: 给出推荐并说明理由

或者你希望直接讨论方案？
```

---

### 决策 2: 触发条件 - 激进描述（Aggressive Description）

**问题**: Skill 的 undertrigger 风险（AI 不触发）

**选择**: 在 frontmatter 的 `description` 中使用关键词密集型描述

**示例**:
```yaml
description: >
  Use when facing: complex decisions, architecture choices, technical tradeoffs, 
  feature design, multi-option selection, requirement analysis, API design, 
  database schema design, framework selection. Provides structured dialectical 
  workflow: Question assumptions, Explore alternatives, Compare tradeoffs, 
  Decide with reasoning.
```

**理由**:
- Skill 的触发完全依赖 description 的语义匹配
- 参考 `skill-creator` 的建议："write aggressively in description"
- 关键词覆盖常见场景（architecture, design, tradeoff, selection）

---

### 决策 3: 参考资料结构 - 渐进式披露（Progressive Disclosure）

**选择**: 参考资料作为独立文件，按需加载

**目录结构**:
```
skills/coding/dialectical-thinking/
├── SKILL.md                     # 核心工作流（约 200 行）
└── references/
    ├── principles.md            # 辩证原则库（约 100 行）
    ├── patterns.md              # 思考模式库（约 150 行）
    └── examples.md              # 实战案例（约 200 行）
```

**加载策略**:
- **默认**: 只加载 SKILL.md（核心工作流）
- **按需**: 在特定阶段提示用户"需要更多指引吗？"
  - Question 阶段 → 可加载 `principles.md`
  - Explore 阶段 → 可加载 `patterns.md`
  - Compare 阶段 → 可加载 `examples.md`

**实现方式**:
```markdown
## Need More Guidance?

如果你需要更深入的指引：
- 查看辩证原则：`skills/coding/dialectical-thinking/references/principles.md`
- 参考思考模式：`skills/coding/dialectical-thinking/references/patterns.md`
- 学习实战案例：`skills/coding/dialectical-thinking/references/examples.md`
```

**理由**:
- 避免一次性加载过多内容（减少 token 消耗）
- 符合 Anthropic Skills 的渐进式披露模式
- 灵活性：新手可深入学习，老手可快速跳过

---

### 决策 4: 四阶段工作流设计

**核心流程**:

```
┌─────────────────────────────────────────────────────────────┐
│                   辩证思考工作流                              │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
   ┌───────────────┐
   │  1. Question  │  质疑问题本身
   │               │  - 需求是否合理？
   │               │  - 有没有隐含假设？
   │               │  - 问题定义是否清晰？
   └───────┬───────┘
           │
           ▼
   ┌───────────────┐
   │  2. Explore   │  探索多种方案
   │               │  - 生成 2-3 种不同方向的方案
   │               │  - 每种方案的核心思路
   │               │  - 不预设优劣
   └───────┬───────┘
           │
           ▼
   ┌───────────────┐
   │  3. Compare   │  对比分析
   │               │  - 列出每种方案的优缺点
   │               │  - 识别关键权衡点
   │               │  - 绘制对比表格
   └───────┬───────┘
           │
           ▼
   ┌───────────────┐
   │  4. Decide    │  推荐决策
   │               │  - 明确推荐哪个方案
   │               │  - 说明推荐理由
   │               │  - 列出注意事项
   └───────────────┘
```

**每阶段输出格式**:

**Question 阶段**:
```markdown
## 质疑问题 (Question)

### 需求本身是否合理？
[分析...]

### 有哪些隐含假设？
- 假设 1: ...
- 假设 2: ...

### 问题定义是否清晰？
[重新定义问题]
```

**Explore 阶段**:
```markdown
## 探索方案 (Explore)

### 方案 A: [简短标题]
**核心思路**: ...
**关键技术**: ...

### 方案 B: [简短标题]
**核心思路**: ...
**关键技术**: ...

### 方案 C: [简短标题] (可选)
**核心思路**: ...
**关键技术**: ...
```

**Compare 阶段**:
```markdown
## 对比分析 (Compare)

| 维度           | 方案 A | 方案 B | 方案 C |
|---------------|--------|--------|--------|
| 实现复杂度     | ★★☆    | ★☆☆    | ★★★    |
| 性能          | 高     | 中     | 极高    |
| 可维护性       | 中     | 高     | 低     |
| 学习成本       | 低     | 中     | 高     |

### 关键权衡点
- 权衡 1: 复杂度 vs 性能
- 权衡 2: 灵活性 vs 维护成本
```

**Decide 阶段**:
```markdown
## 决策推荐 (Decide)

### 推荐方案: [方案 X]

**推荐理由**:
1. ...
2. ...

**注意事项**:
- 注意 1: ...
- 注意 2: ...

**不推荐的原因** (其他方案):
- 方案 Y: ...
- 方案 Z: ...
```

---

## Risks / Trade-offs

### 风险 1: Undertrigger（AI 不触发 Skill）
**影响**: 用户期望辩证思考，但 AI 没有自动触发
**缓解措施**:
- 在 description 中使用激进的关键词覆盖
- 在 ETHOS 原则中强调"优先触发辩证思考"
- 提供明确的手动触发方式（用户可以直接说"使用辩证思考"）

---

### 风险 2: 过度触发（简单问题也走辩证流程）
**影响**: 用户觉得 AI 太啰嗦，简单问题也要走完整流程
**缓解措施**:
- 在 Workflow Offer 中明确"或者你希望直接讨论方案？"
- 允许用户随时退出流程
- 触发条件中排除明确的简单任务（如修复 typo、格式化代码）

---

### 风险 3: 用户体验问题（流程冗长）
**影响**: 用户可能觉得四阶段流程太长
**缓解措施**:
- 允许跳过阶段（如用户已经明确问题，直接进入 Explore）
- 提供"快速模式"：合并 Question 和 Explore
- 每阶段结束时询问"继续下一步还是直接给结论？"

---

### Trade-off 1: 灵活性 vs 一致性
**选择**: 灵活性优先（工具箱模式）
**代价**: 可能导致不同任务使用不同流程，输出格式不统一
**接受理由**: ACE 引擎强调"终端无关"和"灵活适配"，一致性通过文档模板保障

---

### Trade-off 2: 深度 vs 速度
**选择**: 提供渐进式披露（深度可选）
**代价**: 用户可能不知道有更深的参考资料
**缓解**: 在每阶段结束时提示"需要更多指引？"

---

## Migration Plan

不涉及数据迁移或服务部署。

**部署步骤**:
1. 创建 Skill 文件结构
2. 在 `skills/README.md` 中添加索引
3. 在 `.claude/memory/decisions.md` 中记录设计决策
4. 测试触发条件（手动触发 + 自动触发）

**验证方式**:
- 测试自动触发：给 AI 一个架构设计任务，观察是否触发
- 测试手动触发：明确说"使用辩证思考"，观察是否进入工作流
- 测试拒绝流程：在 Workflow Offer 时选择"直接讨论方案"

**回滚策略**:
- 如果 Skill 表现不佳，直接删除或禁用（纯增量，无破坏性修改）
- 从 `skills/README.md` 移除索引

---

## Open Questions

### Q1: 是否需要与 OpenSpec 的 Explore 阶段深度集成？
**背景**: OpenSpec 已有 explore 阶段，辩证思考 Skill 可能在该阶段被触发
**待决策**: 是否需要在 OpenSpec Explore 的 instructions 中明确提示使用辩证思考？
**倾向**: 不强制集成，让 AI 自然触发（通过 description 匹配）

---

### Q2: 参考资料的内容深度？
**背景**: 
- `principles.md` 应该包含哪些辩证原则？（第一性原理、逆向思维等）
- `patterns.md` 应该包含哪些思考模式？（SWOT、五个为什么等）
- `examples.md` 应该包含哪些实战案例？（真实项目 or 虚构示例？）

**倾向**: 
- principles.md: 5-7 条核心原则，每条 50 字说明 + 简短示例
- patterns.md: 3-5 种思考模式，每种包含模板和使用场景
- examples.md: 2-3 个真实案例（脱敏后的 ACE 引擎设计决策）

---

### Q3: 是否需要支持"快速模式"？
**背景**: 用户可能需要快速决策，不想走完整四阶段
**待决策**: 是否提供"合并模式"（Question + Explore 合并，Compare + Decide 合并）？
**倾向**: 先实现完整流程，根据用户反馈再优化
