## ADDED Requirements

### Requirement: 日期→维度聚合算法
bootstrap Step 3.1 必须包含具体的聚合算法。

#### 算法伪代码
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
    filename = f"daily_raw/2026-{date}.md"
    生成骨架文件，内容包含维度列表
```

#### 具体示例
- execution: ["04-12","04-14","04-15"]
- communication: ["04-19","04-24"]

生成结果：
- daily_raw/2026-04-12.md → 维度: [execution]
- daily_raw/2026-04-14.md → 维度: [execution]
- daily_raw/2026-04-15.md → 维度: [execution]
- daily_raw/2026-04-19.md → 维度: [communication]
- daily_raw/2026-04-24.md → 维度: [communication]

### Requirement: 聚合结果验证
生成骨架文件后，验证文件数量与date_map日期数量一致。