## ADDED Requirements

### Requirement: Orchestrator Prompt 定义调度决策逻辑
`core/orchestrator_prompt.md` SHALL 用自然语言描述 Orchestrator 的角色定义、调度决策流程、状态管理规则，作为主Agent的系统级注入。

#### Scenario: 角色定义注入
- **WHEN** 主Agent启动
- **THEN** 系统加载 `core/orchestrator_prompt.md` 并将其注入到当前 session 的 context 中

### Requirement: 调度流程定义
Orchestrator Prompt SHALL 明确定义：观察者→分析师→调度决策→干预行动→追踪验证的完整流程，以及每步的输入输出。

#### Scenario: 调度流程
- **WHEN** 用户发送碎碎念
- **THEN** Orchestrator 按以下顺序执行：
  1. Observer提取结构化行为数据
  2. Archivist更新当日记忆文件
  3. Analyst扫描模式、检查基线
  4. Orchestrator判断是否触发干预
  5. Coach生成干预内容（如果触发）
  6. Archivist更新追踪状态

### Requirement: 状态机定义
Orchestrator Prompt SHALL 定义调度状态机的所有状态（如 `idle`、`observing`、`analyzing`、`intervening`、`waiting_response`）以及状态转换条件。

#### Scenario: 状态转换
- **WHEN** Orchestrator 完成模式分析
- **THEN** 根据分析结果转换状态：无异常→`idle`，触发干预→`intervening`，需要等待用户回答→`waiting_response`

### Requirement: 触发条件优先级定义
Orchestrator Prompt SHALL 定义多维度同时触发时的优先级规则，避免决策冲突。

#### Scenario: 优先级判断
- **WHEN** 用户输入同时触发"执行"和"心理"两个维度的干预条件
- **THEN** Orchestrator 优先处理严重程度更高者（心理风险>执行效率>沟通质量）

### Requirement: 人类可校验
Orchestrator Prompt SHALL 作为人类可读的调度逻辑文档，不需要代码解析器，评审时可直接人工审查决策是否合理。

#### Scenario: 人工审查
- **WHEN** 用户问"你怎么决定要不要干预"
- **THEN** AI 读取 `orchestrator_prompt.md` 的触发条件章节，给出人类可理解的解释