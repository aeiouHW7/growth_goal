## ADDED Requirements

### Requirement: 双轨计分公式
scoring_engine 必须输出两个分数：progress_score 和 wealth_score。

```python
progress_score = 本周维度值 - 上周维度值
wealth_score = 维度当前值 × leverage_weight
total_dimension_score = progress_score + wealth_score
```

#### Scenario: 高杠杆维度进步
- **WHEN** 战略思维（leverage_weight=2.5）从7升到8
- **THEN** progress_score = +1, wealth_score = 8 × 2.5 = 20

### Requirement: 财富距离计算
每次计分时计算每个维度的财富距离。

```python
wealth_distance = wealth_anchor - current_score
```

#### Scenario: 财富距离大但进步快
- **WHEN** 某维度 current=6, anchor=9, leverage=2.0, 比上周+1
- **THEN** progress_score = +0.3, wealth_distance = 3, wealth_score = 12

### Requirement: 周期性汇总
每周/每月生成双轨报告：
- 进步分汇总（和自己比）
- 财富距离汇总（和目标比）
- 高杠杆维度优先级提示

#### Scenario: 周报生成
- **WHEN** 每周日生成周报
- **THEN** 输出包含：本周进步TOP3维度 + 下周财富距离最近的TOP3维度