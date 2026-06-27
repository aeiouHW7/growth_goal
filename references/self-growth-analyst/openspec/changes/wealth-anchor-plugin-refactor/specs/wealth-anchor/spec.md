## ADDED Requirements

### Requirement: 双轨计分系统
每个维度必须同时追踪"进步分"（和自己比）和"财富距离分"（和锚定比）。

#### Scenario: 执行力维度计分
- **WHEN** 用户本周执行力比上周提高
- **THEN** progress_score += 0.3，同时 wealth_distance = wealth_anchor - current_score

#### Scenario: 商业嗅觉维度计分
- **WHEN** 用户商业嗅觉从5升到6，但锚定是9
- **THEN** progress_score += 0.3（进步），wealth_distance = 3（还差3分才达标）

### Requirement: 维度财富杠杆权重
20个维度必须有 leverage_weight 字段，范围 0.5-3.0。

#### Scenario: 高杠杆维度
- **WHEN** 计算战略思维维度的财富贡献
- **THEN** 财富贡献 = current_score × leverage_weight（战略思维 leverage_weight = 2.5）

#### Scenario: 低杠杆维度
- **WHEN** 计算沟通表达维度的财富贡献
- **THEN** 财富贡献 = current_score × leverage_weight（沟通表达 leverage_weight = 0.8）

### Requirement: 财富锚定值
每个维度必须有 wealth_anchor 字段，定义"百富榜级别"达标线。

#### Scenario: 锚定值设定
- **WHEN** 初始化 capability_baseline
- **THEN** 商业嗅觉锚定=9，战略思维锚定=9，沟通表达锚定=7，情绪管理锚定=7