## ADDED Requirements

### Requirement: 定义三层加载策略

系统 SHALL 定义三层 Skills 加载策略：Always Load、Auto-Trigger、Manual Only。

#### Scenario: Always Load 层定义

- **WHEN** 系统启动或开始新对话
- **THEN** 自动加载所有 Workflow Skills，包括：
  - ace-explore、ace-propose、ace-apply
  - review、verify、retro、archive
  - plan、investigate

#### Scenario: Auto-Trigger 层定义

- **WHEN** 用户对话中提到特定关键词
- **THEN** 系统自动加载相关 Skills：
  - 提到"数据库/DDL/表结构" → 加载 db-schema-manager
  - 提到"类似实现/现有代码/参考" → 加载 codebase-recon
  - 提到"提炼文档/生成文档" → 加载 docs-extractor
  - 提到"技术选型/架构决策/对比" → 加载 dialectical-thinking

#### Scenario: Manual Only 层定义

- **WHEN** 用户需要使用特定系统工具
- **THEN** 用户必须显式调用，包括：
  - ace-create-project（项目初始化）
  - ace-init-env（环境初始化）
  - ace-doctor（系统诊断）

### Requirement: SKILL.md 必须精简到核心内容

所有 SKILL.md 文档 SHALL 只保留核心内容，详细示例移到 references/ 目录。

#### Scenario: SKILL.md 核心结构

- **WHEN** 编写或更新 SKILL.md
- **THEN** 文档只包含以下核心部分：
  - Frontmatter（name、description、triggers）
  - When to Use（3-5 行关键场景）
  - Workflow（核心步骤，无详细示例）
  - Guardrails（约束和护栏）

#### Scenario: 详细示例迁移

- **WHEN** SKILL.md 包含详细示例或长篇解释
- **THEN** 这些内容移到 `skills/<category>/<name>/references/examples.md`

#### Scenario: 文档长度目标

- **WHEN** 完成 SKILL.md 精简
- **THEN** 单个 SKILL.md 长度控制在 150-200 行以内（当前平均 290 行）

### Requirement: 建立 SKILL.md 模板标准

系统 SHALL 提供标准化的 SKILL.md 模板，确保所有 Skills 文档结构一致。

#### Scenario: 模板包含必需章节

- **WHEN** 使用模板创建新 SKILL.md
- **THEN** 模板包含以下必需章节：
  - Frontmatter（YAML 格式）
  - When to Use（简短场景说明）
  - Workflow / Execution Steps（核心流程）
  - Guardrails（约束条件）
  - References（指向详细文档）

#### Scenario: 模板禁止冗余内容

- **WHEN** 使用模板编写 SKILL.md
- **THEN** 模板明确标注以下内容应移到 references/：
  - 详细代码示例
  - 长篇技术解释
  - 多个完整用例演示

### Requirement: 文档化加载策略和最佳实践

系统 SHALL 在 10_DOCS 中文档化 Skills 加载策略和使用最佳实践。

#### Scenario: 创建加载策略文档

- **WHEN** 完成加载策略设计
- **THEN** 创建 `10_DOCS/technical/skills-loading-strategy.md` 包含：
  - 三层加载策略说明
  - 每层的 Skills 列表
  - 触发关键词映射表
  - 如何手动加载 Skill

#### Scenario: 创建模板标准文档

- **WHEN** 完成 SKILL.md 模板设计
- **THEN** 创建 `10_DOCS/technical/skills-template-standard.md` 包含：
  - 模板结构说明
  - 各章节长度限制
  - 示例迁移指南
  - 最佳实践建议

#### Scenario: 更新设计原则文档

- **WHEN** 完成文档精简工作
- **THEN** 更新 `10_DOCS/technical/skills-design-principles.md` 补充：
  - 文档精简原则（核心 vs 详细）
  - references/ 目录使用规范

### Requirement: 支持渐进式迁移

系统 SHALL 支持逐个 Skill 的渐进式迁移，不强制一次性全部修改。

#### Scenario: 分批迁移优先级

- **WHEN** 开始执行迁移工作
- **THEN** 按照以下优先级顺序迁移：
  1. Workflow Skills（使用频率最高）
  2. Knowledge Skills（上下文成本大）
  3. System/Coding Skills（使用频率低）

#### Scenario: 新旧并存期间

- **WHEN** 部分 Skills 已精简，部分未精简
- **THEN** 系统正常运行，无功能影响

#### Scenario: 迁移验证

- **WHEN** 完成单个 Skill 精简
- **THEN** 验证：
  - 核心功能未受影响
  - 文档可读性未降低
  - references/ 链接可访问
