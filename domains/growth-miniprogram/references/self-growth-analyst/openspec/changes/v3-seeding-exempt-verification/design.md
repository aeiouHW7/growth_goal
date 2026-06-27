## Context

3个残留问题都是"规范有但执行不完整"的情况。需要让规范更明确，减少歧义。

## Decisions

### D1: seeding豁免声明的位置

**决策**: 豁免声明放在"备选证据来源优先级"章节的最开头，用引用框标注。

**原因**:
- 这是规则的前置条件，必须在看规则之前就知道
- 引用框形式更醒目，执行agent不会忽略

**实现**:
```markdown
> ⚠️ **铁律豁免声明**：以下备选证据规则仅在baseline首次激活（所有维度current_score==0）时生效，是"2条证据"铁律的一次性豁免。一旦baseline脱离全0状态，立即回到主证据规则。
```

### D2: [ARCHIVIST_FAIL]作为可见信号

**决策**: 写入失败时输出[ARCHIVIST_FAIL]，让用户知道数据没落盘。

**原因**:
- 用户之前发现daily_raw是空的，但系统没有任何提示
- 静默失败是最糟糕的故障模式
- [ARCHIVIST_FAIL]是一个可搜索、可追溯的信号

**实现**:
```markdown
### 4.3 写入验证
写入完成后，立即检查 daily_raw/YYYY-MM-DD.md 是否存在且包含新内容。
- 如果存在且有新内容 → 继续后续步骤
- 如果不存在或为空 → 重试写入一次
- 如果重试仍失败 → 输出 [ARCHIVIST_FAIL] 信号到当前对话，不静默跳过
```

### D3: 聚合算法用"伪代码+示例"更清晰

**决策**: 在bootstrap Step 3.1中用伪代码+具体日期示例。

**原因**:
- 上次写的描述太抽象，执行agent不知道具体怎么做
- 伪代码+日期示例让逻辑无可争议

**实现**:
```markdown
#### 聚合算法（伪代码）
```
date_map = {}  # 空map: date -> [维度列表]

# 遍历 dimensions
for dimension, date_list in retrieval_index.dimensions.items():
    for date in date_list:
        if date not in date_map:
            date_map[date] = []
        date_map[date].append(dimension)

# 生成骨架文件
for date, dims in date_map.items():
    filename = f"daily_raw/2026-{date}.md"  # 例如 2026-04-12
    生成骨架文件，内容包含 dims
```

**示例**:
- retrieval_index.dimensions.execution = ["04-12","04-14","04-15"]
- retrieval_index.dimensions.communication = ["04-19","04-24"]
- 生成:
  - daily_raw/2026-04-12.md → 维度: [execution]
  - daily_raw/2026-04-14.md → 维度: [execution]
  - daily_raw/2026-04-15.md → 维度: [execution]
  - daily_raw/2026-04-19.md → 维度: [communication]
  - daily_raw/2026-04-24.md → 维度: [communication]
```