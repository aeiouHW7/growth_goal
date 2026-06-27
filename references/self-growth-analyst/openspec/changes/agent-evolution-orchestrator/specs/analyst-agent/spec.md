## ADDED Requirements

### Requirement: Analyst Agent 运行行为模型检测模式
Analyst Agent SHALL 在每次记忆更新后，扫描 `retrieval_index.json` 中的 patterns，检查是否有重复出现的话题/关键词/行为模式。

#### Scenario: 模式重复检测
- **WHEN** 用户在近7天碎碎念中第3次提到"补偿机制没执行"
- **THEN** Analyst 更新 `retrieval_index.json` 中该模式的 frequency 字段，并在洞察中标记 `[模式信号]`

### Requirement: Analyst Agent 评估维度 KPI
Analyst Agent SHALL 在周考/月考时，基于用户回答和碎碎念数据，计算每个维度的真实KPI分数，生成维度评分报告。

#### Scenario: 月度维度评分
- **WHEN** 每月最后一天触发月考
- **THEN** Analyst 加载当月所有碎碎念+周考回答，计算19个维度的真实KPI，与 baseline 对比输出变化报告

### Requirement: Analyst Agent 检测认知偏误
Analyst Agent SHALL 在模式分析中识别用户的思维偏误（如"事后合理化"、"损失厌恶"、"计划谬误"），写入 `cognitive_bias_log.md`。

#### Scenario: 偏误识别
- **WHEN** 用户连续3次在碎碎念中用"运气不好"解释失败结果
- **THEN** Analyst 在 cognitive_bias_log 中新增条目：{date, bias_type: "归因偏误", evidence: ["引用原文"], severity: "medium"}

### Requirement: Analyst Agent 驱动福格行为模型分析
Analyst Agent SHALL 在分析用户行为时，使用福格模型（动机/能力/提示）判断行为缺失的原因，为 Coach Agent 的干预提供依据。

#### Scenario: 福格分析
- **WHEN** 用户说"知道应该做但没做"
- **THEN** Analyst 判断：动机是否足够？能力是否足够？提示是否足够？输出福格诊断结论供 Coach 使用