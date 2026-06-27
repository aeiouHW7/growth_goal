## ADDED Requirements

### Requirement: Observer 从用户输入中抽取结构化行为数据
Observer Agent SHALL 从用户碎碎念中提取结构化事实，包括：行为类型、情绪标签、归因方式、时间线、涉及维度。

#### Scenario: 碎碎念结构化提取
- **WHEN** 用户发送碎碎念"今天加班到8点，然后回家玩游戏"
- **THEN** Observer 输出结构化数据：{behavior: "工作延迟+娱乐选择", emotion: "疲惫/逃避", attribution: "外部归因(加班)", time: "evening", dimensions: ["execution", "time_management"]}

### Requirement: Observer 分类输入类型
Observer SHALL 将用户输入分为：碎碎念、考题回答、主动提问、紧急信号、简单指令。

#### Scenario: 识别考题回答
- **WHEN** 用户输入存在 `.active_exam.json` 且未过期
- **THEN** Observer 将输入标记为 `exam_answer`，触发 exam_answer_handler 流程

#### Scenario: 识别紧急信号
- **WHEN** 用户输入包含自我伤害、极端情绪、严重失控的信号词
- **THEN** Observer 标记为 `urgent`，触发保护模式，跳过常规流程

### Requirement: Observer 写入行为事件
Observer SHALL 将每次提取的行为数据写入 `memories/daily_raw/YYYY-MM-DD.md` 的结构化区域，不污染原始内容区域。

#### Scenario: 行为事件追加
- **WHEN** Observer 完成行为提取
- **THEN** 在当日文件的 `## 行为事件` 区域追加结构化数据（如果区域不存在则创建）