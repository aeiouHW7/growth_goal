## ADDED Requirements

### Requirement: 工作记忆初始化
系统维护memories/short_term/目录，包含3个核心文件：working_context.md（近7天摘要）、pending_actions.json（待办）、active_conflicts.md（活跃矛盾）。

#### Scenario: 首次初始化
- **WHEN** memories/short_term/目录不存在或为空
- **THEN** 创建3个文件，初始化为空结构，记录初始时间戳

#### Scenario: 常规加载
- **WHEN** SKILL.md主流程启动
- **THEN** 读取working_context.md和pending_actions.json，为引擎提供上下文

### Requirement: 工作上下文更新
每次对话后，系统更新working_context.md，记录新出现的模式、情绪变化、关键决策。

#### Scenario: 对话后更新
- **WHEN** 完整对话轮次结束（用户消息+系统响应）
- **THEN** 提取新信息，追加到working_context.md，保持文件不超过200行

#### Scenario: 模式变化检测
- **WHEN** 用户行为模式与历史摘要差异显著（如突然频繁谈论某话题）
- **THEN** 标记"模式变化"，供下次调度参考

### Requirement: 待办追踪
维护pending_actions.json，记录用户承诺的行为及其验证关键词。

#### Scenario: 新承诺录入
- **WHEN** 用户承诺做某事（如"下周开始每天跑步"）
- **THEN** 提取承诺内容，生成验证关键词，追加到pending_actions.json

#### Scenario: 验证检查
- **WHEN** 承诺时间到达或用户提及相关内容
- **THEN** 查询pending_actions.json，返回承诺内容和验证关键词

### Requirement: 活跃矛盾记录
维护active_conflicts.md，记录用户当前存在的内心矛盾或冲突。

#### Scenario: 矛盾识别
- **WHEN** 用户表达两个相互冲突的愿望（如"想赚钱"+"不想工作"）
- **THEN** 记录到active_conflicts.md，包含矛盾描述和首次出现时间

#### Scenario: 矛盾解决确认
- **WHEN** 用户明确表示解决了某个矛盾
- **THEN** 从active_conflicts.md标记为"已解决"，保留30天后删除