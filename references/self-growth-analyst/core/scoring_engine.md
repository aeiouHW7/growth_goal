# 评分流程（只在周考、月考、半年总结时执行）

---

## 基本原则

**没有证据的评分是幻觉。**

- 每次评分必须有2条以上行为证据（日期+内容）
- 每次评分必须有对比（和上次比是进步、退步还是原地）
- 无证据的评分必须标注 `[待验证]`

---

## 证据格式（每次评分必须包含）

```markdown
### [维度名称]：原分 → 新分 (变化方向)

**证据1（来源：YYYY-MM-DD）**
> [具体引用内容]
> 分析：这句话/行为为什么说明了这个能力的变化

**证据2（来源：YYYY-MM-DD）**
> [具体引用内容]
> 分析：同上

**AI观察**
> 我看到了什么变化（或没有变化）
```

---

## 评分变化规则

| 变化幅度 | 条件 |
|---------|------|
| 提升 +0.5 | 1条进步证据 + 无倒退证据 |
| 提升 +1 | 2条不同场景的进步证据 |
| 下降 -0.5 | 1条倒退证据或2次同样错误 |
| 不变 | 证据不足或正负抵消 |

**禁止行为：**
- 无证据调分
- 单次对话后临时改分
- 超出上述幅度的单次调整

---

## 评分时机

| 时机 | 触发时间 | 内容 |
|------|---------|------|
| 周考微调 | 每周日 21:00 | 只调整本周有明确变化的维度 |
| 月度评分 | 每月最后一天 20:00 | 完整20维评分 + 证据 |
| 半年总结 | 每6个月 | 趋势分析 + 模式变化 + 震撼结论 |

---

## 月度评分流程

1. **汇总**：读取本月所有碎碎念 + 周考记录
2. **分析**：对每个维度检查相关碎碎念次数、行为变化、证据
3. **打分**：按变化规则计算，输出证据格式
4. **对比上月**：输出每个维度的变化
5. **识别重点**：最低3维度 + 最易突破1维度 + 最应投入时间维度
6. **用户确认**：先说结论，问"你同意吗"

---

## 文件更新

月度评分后，更新 `config/capability_baseline.json`：
- 更新每个维度的 score
- 更新 lowest_three_dimensions
- 在 history 中追加新记录（不覆盖历史）

---

## 备选证据来源优先级

> ⚠️ **铁律豁免声明**：以下备选证据规则仅在baseline首次激活（所有维度current_score==0）时生效，是"2条证据"铁律的一次性豁免。一旦baseline脱离全0状态，立即回到主证据规则。

当主来源不可用时，按以下优先级使用证据：

### 证据优先级
1. **daily_raw/** 碎碎念（主来源，质量最高）
   - 包含具体日期+行为描述+情绪词
   - 可直接用于评分计算

2. **working_context.md** 中的维度评分变化记录（备选来源）
   - 标注[待行为证据验证]
   - 用于系统首次激活时 seeding

3. **retrieval_index.json** 中的维度触发频率（辅助参考）
   - 仅用于判断"该维度有模式"而非评分

### Scenario: 主来源不可用
- **WHEN** daily_raw/ 无数据但 working_context 有评分
- **THEN** 使用 working_context 作为评分依据

## Baseline Seeding 逻辑

当系统首次激活时（data_accumulation_start 为 null），执行 seeding：

### Seeding 规则
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

### [待验证]标注说明
- 被seeding的评分在后续碎碎念出现时自动更新
- 标注格式：历史记录中标注 `source: "working_context_seeding"`

---

## 双轨计分说明

本引擎输出两个分数：
- **progress_score**：和自己比（本周-上周）
- **wealth_score**：和财富目标比（current × leverage_weight）

```
total_dimension_score = progress_score + wealth_score
```

### 财富距离计算

每个维度计算：
```
wealth_distance = wealth_anchor - current_score
```
- 距离越大，说明离百富榜级别越远，越需要优先投入

### 维度优先级排序

```
优先投入维度 = wealth_distance × leverage_weight
```
排序后输出TOP3需要优先投入的维度

### 周报双轨格式

```markdown
## 本周双轨报告

### 进步分TOP3
1. execution: +0.5
2. communication: +0.3
3. strategic_thinking: +0.2

### 财富距离TOP3（需要优先投入）
1. business_acumen: 距离4分 × 杠杆3.0 = 优先级12.0
2. leverage_awareness: 距离8分 × 杠杆3.0 = 优先级24.0
3. strategic_thinking: 距离3分 × 杠杆2.5 = 优先级7.5
```

### 自检清单

每次评分后自检：

- [ ] 每个维度有2条以上证据？
- [ ] 变化理由充分？
- [ ] 如果用户反对，我能拿出证据？
- [ ] 最需要突破的维度明确？

没通过任何一项，重新检查。