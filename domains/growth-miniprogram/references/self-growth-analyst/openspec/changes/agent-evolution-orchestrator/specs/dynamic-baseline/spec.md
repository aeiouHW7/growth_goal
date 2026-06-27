## ADDED Requirements

### Requirement: Dynamic Baseline 记录可计算的行为概率
`memories/dynamic_baseline.json` SHALL 存储用户的行为概率分布，包括：维度评分历史、行为频率统计、模式触发次数、基线对比数据。

#### Scenario: 评分历史追加
- **WHEN** 每次维度评分完成
- **THEN** Archivist 将新分数追加到 `history` 数组，保持最近12个月数据

### Requirement: Dynamic Baseline 驱动概率预测
Analyst Agent SHALL 在模式检测时查询 `dynamic_baseline.json` 中的历史数据，计算行为概率。

#### Scenario: 概率预测
- **WHEN** 用户第4次在压力下决策失误
- **THEN** Analyst 查询 baseline 中"压力下决策"的历史数据，输出"当前失误概率70%，较上月提升10%"

### Requirement: Dynamic Baseline 结构定义
`dynamic_baseline.json` SHALL 包含：dimensions（维度评分数组）、behavior_frequencies（行为频率统计）、pattern_triggers（模式触发记录）、metadata（更新时间和备注）。

#### Scenario: 初始结构
- **WHEN** 用户首次使用系统（前4周）
- **THEN** dynamic_baseline.json 初始化为：dimensions为空数组（只记录不计算），behavior_frequencies初始化为`{}`，metadata记录初始化时间

### Requirement: Dynamic Baseline 前4周只记录不计算
系统 SHALL 在前4周（数据积累期）只记录行为数据，不进行概率推断计算，避免数据稀疏导致错误结论。

#### Scenario: 数据积累期
- **WHEN** 系统运行未满4周
- **THEN** Analyst 在模式分析时不输出概率数字，只标记"数据积累中，当前记录数N"