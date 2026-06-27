## Why

v3.0 架构审查发现了5个新问题，其中3个是P0/P1优先级：

1. **P0 系统零数据**：capability_baseline 23个维度全为0，架构完整但从未被实际触发。再好的架构不跑=不存在。

2. **P1 分级加载缺失**：17个core + 19个probe + 7个rules，SKILL.md Step 5 一口气调5个引擎。随引擎增长，模型上下文会溢出。

3. **P1 SKILL.md与orchestrator_prompt.md不一致**：SKILL.md有Step 5.5 Diagnostician，orchestrator_prompt.md没有。两文件引擎数量（7 vs 4）、步骤数（7 vs 6）都不一致。

次优先级问题：
- P2 财务硬指标追踪：财富目标量化基础
- P3 OCEAN映射：需要90天数据积累

## What Changes

**P0: bootstrap_system.md 一次性启动序列**
- 检查 daily_raw/ 是否有过去7天碎碎念
- 有数据 → 执行一次完整7步循环，产出第一份评分
- 无数据 → 生成待数据积累状态，启动每日cron提醒
- 在 .orchestrator_state.json 写入 data_accumulation_start

**P1: 分级加载策略（orchestrator_prompt.md 新增章节）**
- L1常驻引擎：每次碎碎念必加载（linguistic_analyzer + auto_insight_generator）
- L2触发引擎：关键词命中才加载（habit_behavior / psychodynamic / veracity_checker）
- L3周期引擎：cron触发不随碎碎念加载（strategic_alignment / opportunity_cost / scoring / wealth_engine）

**P1: 两文件一致性修复**
- SKILL.md 开头加注释：执行规格见 orchestrator_prompt.md
- orchestrator_prompt.md 开头加注释：高位描述见 SKILL.md
- 统一引擎列表（删除不存在的，提到的都要在）

**P2: financial_metrics.json 数据结构**
- net_worth / income_sources / passive_income_ratio / monthly_savings_rate / investment_portfolio
- 新建 core/wealth_engine.md 月度读取 → 输出财富健康度报告

**P3: big_five_ocean.md 人格→能力映射表**
- 5个OCEAN维度 × 能力维度的正向影响和负向风险映射
- OCEAN评估完成后，能力维度的 system_calculated_score 基于人格基线做偏移

## Capabilities

### New Capabilities
- `bootstrap-sequence`: 一次性启动序列，让系统从零数据状态激活
- `tiered-engine-loading`: 三级引擎加载策略（L1常驻/L2触发/L3周期）
- `financial-metrics-tracker`: 财务硬指标追踪（实际数字，非自我评估）
- `ocean-to-capability-mapping`: 大五人格→能力维度映射表

### Modified Capabilities
- `orchestrator-prompt`: 增加分级加载章节，统一与SKILL.md的差异
- `skill-md`: 增加执行规格引用注释
- `big-five-ocean`: 追加人格→能力映射表章节

## Impact

- 新增：`scripts/bootstrap_system.md`
- 新增：`config/financial_metrics.json`
- 新增：`core/wealth_engine.md`
- 修改：`core/orchestrator_prompt.md`（分级加载章节 + 引用注释）
- 修改：`SKILL.md`（引用注释）
- 修改：`core/big_five_ocean.md`（映射表章节）