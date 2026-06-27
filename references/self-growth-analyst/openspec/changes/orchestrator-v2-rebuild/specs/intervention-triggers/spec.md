## ADDED Requirements

### Requirement: 干预触发条件定义
rules/intervention_triggers.md 定义系统何时主动出手干预。

#### Scenario: 卡点重复触发
- **WHEN** 近7天同一卡点出现≥2次 AND (阻抗信号 OR 进步信号 OR 强烈自我批判)
- **THEN** 触发干预：系统提出诊断性问题或调整策略

#### Scenario: 承诺未兑现预警
- **WHEN** pending_actions.json中的承诺超时未完成
- **THEN** 触发干预：温和询问障碍，协商新计划

#### Scenario: 情绪负向预警
- **WHEN** linguistic_analyzer报告负面情绪词频>正面词频3倍
- **THEN** 触发干预：启动支持性对话，不做深度分析

### Requirement: 干预类型选择
根据触发类型，选择合适的干预策略。

#### Scenario: 能力障碍干预
- **WHEN** 触发条件为执行能力问题
- **THEN** 采用Fogg模型干预：缩小目标、寻找提示、降低门槛

#### Scenario: 动机障碍干预
- **WHEN** 触发条件为动机不足
- **THEN** 采用动机性访谈技巧：探索矛盾、强化渴望、确认承诺

### Requirement: 干预时机判断
确定干预是立即执行还是延迟到下一轮。

#### Scenario: 紧急干预
- **WHEN** 用户表达自伤念头或严重情绪危机
- **THEN** 立即干预，中断正常调度流程

#### Scenario: 常规干预
- **WHEN** 触发条件满足但不紧急
- **THEN** 在当前响应末尾加入干预内容，不打断流畅对话