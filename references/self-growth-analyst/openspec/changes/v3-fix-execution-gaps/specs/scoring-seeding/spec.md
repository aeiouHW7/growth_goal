## ADDED Requirements

### Requirement: 备选证据来源优先级
scoring_engine必须支持多级证据来源，按优先级使用。

#### 证据优先级
1. `daily_raw/` 碎碎念（主来源，质量最高）
2. `working_context.md` 中的维度评分变化记录（备选来源，标注[待行为证据验证]）
3. `retrieval_index.json` 中的维度触发频率（辅助参考）

#### Scenario: 主来源不可用
- **WHEN** daily_raw/无数据但working_context有评分
- **THEN** 使用working_context作为评分依据

### Requirement: baseline seeding逻辑
当baseline.current_score==0且working_context有评分时，执行seeding。

```python
for dimension in baseline.dimensions:
    if dimension.current_score == 0 and dimension in working_context:
        dimension.current_score = working_context[dimension].score
        dimension.history.append({
            "source": "working_context_seeding",
            "date": <today>,
            "note": "从working_context迁移，需要后续行为证据验证"
        })
```

#### Scenario: seeding触发时机
- **WHEN** bootstrap执行时（data_accumulation_start为null或系统首次激活）
- **THEN** 执行seeding流程

### Requirement: [待验证]标注更新规则
被seeding的评分在后续真实碎碎念出现时自动更新。

#### Scenario: 验证更新
- **WHEN** 后续碎碎念中真实出现了行为证据
- **THEN** 将[待验证]标注的评分更新为真实数据，移除标注

### Requirement: 评分计算公式
当前评分 = 上次评分 + (本次证据平均分 - 基准线) × 权重

- 每次新碎碎念带来的证据评分：1-5分
- 基准线：上次评分的70%作为"维持"阈值
- 权重：维度相关的leverage_weight