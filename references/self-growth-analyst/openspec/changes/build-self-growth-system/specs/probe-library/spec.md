# probe-library

## ADDED Requirements

### Requirement: 20维度各3-5个probe问题

系统 SHALL 在 `skills_library/` 目录下为每个维度创建一个 probe 文件，包含3-5个可复用的反问句。

文件命名：`skills_library/<dimension>_probes.md`

问题类型：
- 基础认知问题：测试对这个维度的基本理解
- 深度思考问题：让人必须深度思考才能回答，不能一句话打发
- 场景应用问题：给一个具体情境，问他会怎么做
- 矛盾探测问题：如果在这个维度有矛盾，可以直接问穿

#### Scenario: probe文件使用
- **WHEN** 周考触发
- **THEN** 系统从 `skills_library/` 随机抽取3个维度的 probe 问题
- **AND** 结合本周碎碎念生成1道综合题
- **AND** 组合成周考题目

### Requirement: probe问题质量标准

每个 probe 问题必须满足：
- 犀利，有挑战性
- 让用户必须动脑子才能回答
- 不能只回答"是/否"或一句话
- 符合用户"犀利直接"的沟通风格

#### Scenario: probe质量检查
- **WHEN** 编写新的 probe 问题
- **THEN** 自检：这个问题够不够犀利？用户能不能一句话回答？
- **IF** 能一句话回答，THEN 修改问题使其需要深度思考

### Requirement: 维度列表

必须为以下20个维度创建 probe 文件：

**底层能力：**
- cognitive_probes.md（认知）
- learning_probes.md（学习力）
- self_awareness_probes.md（自我认知）
- psychological_probes.md（心理）

**执行层：**
- execution_probes.md（执行）
- decision_probes.md（决策）
- risk_management_probes.md（风险管理）
- time_management_probes.md（时间管理）

**社交层：**
- emotional_quota_probes.md（情商）
- social_probes.md（社交）
- influence_probes.md（影响力）
- negotiation_probes.md（谈判）
- leadership_probes.md（领导力）
- political_wisdom_probes.md（政治智慧）

**商业层：**
- business_acumen_probes.md（商业嗅觉）
- strategic_thinking_probes.md（战略思维）
- resource_integration_probes.md（资源整合）

**表达层：**
- communication_probes.md（沟通表达）
- creativity_probes.md（创造力）

#### Scenario: 缺失probe文件检查
- **WHEN** 周考触发
- **THEN** 检查 `skills_library/` 是否有足够的 probe 文件
- **IF** 某个维度缺失，THEN 系统应能生成临时问题（不应该因为缺失而无法考核）