## ADDED Requirements

### Requirement: applier TDD 模式
ace-applier SHALL 在遇到复杂 task（新实体、核心逻辑、数据模型变更）时切换到 TDD 模式，遵循 Matt Pocock 的垂直切片方法论：一个测试 → 一个实现 → 循环。

#### Scenario: 复杂 task 触发 TDD
- **WHEN** applier 处理一个涉及新 Prisma model 或核心业务逻辑的 task
- **THEN** 先写一个描述行为的失败测试，再写最小实现使测试通过，再重构

#### Scenario: 简单 task 保持现有模式
- **WHEN** applier 处理一个简单修改（如添加字段、调整样式）
- **THEN** 保持现有模式：写代码 → tsc/lint/test 验证

### Requirement: 术语一致性检查
ace-reviewer SHALL 新增检查维度：变更中的命名（变量名、函数名、路由路径）MUST 与 `docs/wiki/glossary.md` 中的术语保持一致。

#### Scenario: 命名与术语表不一致
- **WHEN** reviewer 发现代码中使用 "task" 但术语表定义为 "todo"
- **THEN** 在审查报告中标记为术语一致性问题

#### Scenario: 新术语未在术语表中
- **WHEN** reviewer 发现代码引入了术语表中不存在的领域概念
- **THEN** 在审查报告中建议将新术语添加到 glossary.md
