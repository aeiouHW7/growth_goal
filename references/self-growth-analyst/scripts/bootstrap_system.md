# Bootstrap System — 一次性启动序列

## 目的
让系统从零数据状态激活。检查历史数据，决定是否执行首轮分析。

## 执行流程

### Step 1: 检查当前状态
读取 `.orchestrator_state.json`，检查是否有 `data_accumulation_start` 字段。
- 如果有 → 系统已经初始化，直接输出状态，终止
- 如果没有 → 继续 Step 2

### Step 2: 检查历史碎碎念
扫描 `memories/daily_raw/` 目录，检查过去7天内是否有碎碎念文件。
- 如果有（至少1条）→ 跳到 Step 3
- 如果没有 → 跳到 Step 4

### Step 3: 执行首轮分析

#### Step 3.1: 逆向重建检查

检查 daily_raw/ 是否有文件：
- 如果有 → 直接执行首轮分析，跳过逆向重建
- 如果无但 retrieval_index.json 有 patterns → 进入逆向重建流程

##### 逆向重建流程
1. 从 retrieval_index.json 的 patterns.dimensions 提取每个日期的维度触发记录

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
    filename = f"daily_raw/2026-{date}.md"
    生成骨架文件，内容包含 dims
```

**示例**:
- execution: ["04-12","04-14","04-15"]
- communication: ["04-19","04-24"]
→ 生成:
  - daily_raw/2026-04-12.md → 维度: [execution]
  - daily_raw/2026-04-14.md → 维度: [execution]
  - daily_raw/2026-04-15.md → 维度: [execution]
  - daily_raw/2026-04-19.md → 维度: [communication]
  - daily_raw/2026-04-24.md → 维度: [communication]

2. 从 dimensions 字段获取每个维度的触发日期列表
3. 为每个有触发记录的日期生成骨架文件

##### 骨架文件格式
```markdown
## [日期] 碎碎念 [重建]

来源: retrieval_index逆向重建
数据可信度: 骨架-待验证

### 维度触发记录
- execution: 触发于"知道但不做"模式
- communication: 触发于"表达不清晰自知"模式
```

标注要求：文件头部必须标注[重建]，来源追溯到 retrieval_index

执行完整7步工作流（模拟一次碎碎念）：
1. 加载记忆（读取 short_term/ 文件）
2. 调用 linguistic_analyzer
3. 写入 daily_raw（标记为 BOOTSTRAP 分析）
4. 调用 auto_insight_generator
5. 更新 capability_baseline（如果有数据）
6. 输出第一份评分报告
7. 更新 .orchestrator_state.json（设置 data_accumulation_start: <today>）

#### Step 3.7: 同步 orchestrator_state.json

读取 `.orchestrator_state.json`，执行以下同步：

1. data_accumulation_weeks = (今天 - retrieval_index最早日期) / 7
2. last_cycle = <today>
3. current_state = "idle"
4. pending_actions = 从 pending_actions.json 同步

示例：
```markdown
## orchestrator_state 同步结果
- data_accumulation_weeks: 约2周
- last_cycle: 2026-04-25
- current_state: idle
- pending_actions: [已从pending_actions.json同步]
```

输出格式：
```markdown
## 系统就绪

- data_accumulation_start: <today>
- first_analysis_completed: true
- daily_raw_count: <过去7天的碎碎念条数>
- status: 系统就绪

### 首轮分析结果
[评分报告]
```

### Step 4: 进入待数据积累状态
如果过去7天没有任何碎碎念：
1. 在 .orchestrator_state.json 设置 data_accumulation_start: <today>
2. 输出"待数据积累状态"，提醒用户开始碎碎念

输出格式：
```markdown
## 待数据积累

- data_accumulation_start: <today>
- status: 待数据积累
- message: 系统已就位，等待你的第一句碎碎念

### 建议的下一步
- 每天有任何想法都可以发给我
- 一周后系统会生成第一份周报
```

### Step 5: 手动触发支持
如果用户说"跑系统健康检查"或"bootstrap"，执行上述完整流程。

#### 自检触发条件
当用户提到"知道但不做"模式时，系统检查自身执行链路：
- daily_raw 有没有写入？（若无→触发自愈）
- baseline 有没有同步？（若全0→触发seeding）
- pending_actions 有没有追踪？

## 关键文件路径
- `.orchestrator_state.json`: memories/.orchestrator_state.json
- `daily_raw/`: memories/daily_raw/
- `short_term/`: memories/short_term/
- `capability_baseline.json`: config/capability_baseline.json
```

## 验证
完成后检查文件存在且包含：
- "data_accumulation_start"
- "系统就绪" 或 "待数据积累"
- "首轮分析" 或 "first_analysis"