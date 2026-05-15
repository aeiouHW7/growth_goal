## ADDED Requirements

### Requirement: Skills 索引必须分类展示

Skills 索引 SHALL 按照功能分类组织所有 Skills，每个分类包含该类别下的所有 Skills 及其简短描述。

#### Scenario: 用户浏览索引文件

- **WHEN** 用户打开 `skills/SKILLS_INDEX.md`
- **THEN** 文件按照以下分类展示 Skills：
  - Workflow Skills（工作流）
  - Knowledge Skills（知识增强）
  - System Skills（系统工具）
  - Coding Skills（编码辅助）

#### Scenario: 每个 Skill 有简短描述

- **WHEN** 用户查看某个分类下的 Skills 列表
- **THEN** 每个 Skill 包含：
  - Skill 名称（链接到完整 SKILL.md）
  - 1-2 行简短描述
  - 触发关键词（可选）

### Requirement: 索引文件必须控制篇幅

索引文件 SHALL 保持在 300 行以内，确保快速加载和浏览。

#### Scenario: 文件长度验证

- **WHEN** 索引文件创建或更新后
- **THEN** 文件总行数不超过 300 行

#### Scenario: 单个 Skill 描述长度限制

- **WHEN** 在索引中添加或更新 Skill 条目
- **THEN** 单个 Skill 的描述不超过 3 行

### Requirement: 索引必须支持快速查找

索引 SHALL 提供快速查找机制，帮助用户根据关键词找到相关 Skills。

#### Scenario: 关键词标注

- **WHEN** 用户查看 Knowledge/Coding 分类下的 Skills
- **THEN** 每个 Skill 标注触发关键词，如：
  - `db-schema-manager` - 触发词：数据库、DDL、表结构
  - `codebase-recon` - 触发词：类似实现、现有代码、参考

#### Scenario: 分类标题说明使用场景

- **WHEN** 用户查看分类标题
- **THEN** 标题包含该分类的典型使用场景说明

### Requirement: 索引必须包含导航指引

索引 SHALL 在文件开头提供导航说明，指导用户如何使用索引和加载 Skills。

#### Scenario: 使用说明

- **WHEN** 用户首次打开索引文件
- **THEN** 文件开头包含：
  - 索引的作用说明
  - 如何根据需求选择 Skill
  - 如何加载完整 SKILL.md 文档

#### Scenario: 加载策略说明

- **WHEN** 用户查看导航部分
- **THEN** 说明包含：
  - 哪些 Skills 会自动加载（Workflow）
  - 哪些 Skills 按需加载（Knowledge/Coding）
  - 哪些 Skills 需要手动调用（System）
