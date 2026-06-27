## Why

v3.1 执行断层修复方案完整，但这3个是小缺口需要补上：

1. **P1 seeding铁律冲突**：scoring_engine说"2条证据"，但seeding规则说"直接写入"。执行agent会困惑。
2. **P1 无写后验证**：Archivist之前没执行不是因为缺少规范，而是规范没被遵循。声明"不能跳过"不会改变行为。
3. **P2 聚合逻辑未明确定义**：bootstrap提到了但没给具体步骤。

## What Changes

**P1: scoring_engine 增加豁免声明**
在备选证据章节开头加一句：
"以下备选证据规则仅在baseline首次激活（所有维度current_score==0）时生效，是'2条证据'铁律的一次性豁免。一旦baseline脱离全0状态，立即回到主证据规则。"

**P1: SKILL.md Step 4 增加写后验证**
在Step 4末尾增加：
- 4.3 写入验证：写入完成后检查daily_raw是否存在且包含新内容
- 如果失败→重试一次→仍失败→输出[ARCHIVIST_FAIL]信号，不静默跳过

**P2: bootstrap Step 3.1 增加伪代码**
在逆向重建流程中增加具体的日期→维度聚合算法：
```python
date_map = {}
for dimension, dates in retrieval_index.dimensions:
    for date in dates:
        date_map[date].append(dimension)
for date, dimensions in date_map:
    生成daily_raw/骨架文件
```

## Capabilities

### Modified Capabilities

- `scoring-engine`: 增加seeding豁免声明
- `skill-md`: 增加Step 4.3写后验证
- `bootstrap-sequence`: 增加聚合算法伪代码

## Impact

- `core/scoring_engine.md` — 备选证据章节豁免声明
- `SKILL.md` — Step 4.3写入验证
- `scripts/bootstrap_system.md` — 逆向重建聚合算法