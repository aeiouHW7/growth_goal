## Why

用户（31岁大厂PM，财富目标是前100富人）做了深度架构审查，发现当前系统存在6个关键错位：

1. **打分无外部锚点**：scoring_engine 只和自己过去比，不和财富目标比
2. **维度等权重**：20个维度结构一样，没有财富杠杆系数
3. **系统被动**：只有"你说话→它分析"，没有主动追踪财富杠杆
4. **缺少财富专用维度**：资产配置/杠杆识别/个人IP等完全缺失
5. **引擎强耦合**：7步串行，新数据源要改核心逻辑
6. **无干预闭环**：输出行动但不追踪执行率和效果

这些问题让系统停留在"成长记录器"，无法成为"财富驱动引擎"。

## What Changes

本次变更是一次架构层面的系统重构，从"被动分析器"升级为"主动财富导航系统"：

### 核心改造

- **新增 wealth_anchor 层**：在 capability_baseline 之上增加"百富榜级别"达标线
- **引入维度杠杆权重**：给20个维度赋值财富乘数系数
- **新增机会成本分析引擎**：分析"你没做什么"而非只分析"你做了什么"
- **引擎插件化重构**：从7步串行改为事件总线+插件架构
- **干预闭环**：追踪行动执行率，3次无效自动切换策略
- **补充3个财富专用维度**：投资判断力、杠杆识别、资产配置感知

### 非改造范围

- 不改变 linguistic_analyzer / psychodynamic_engine 等现有引擎的内部逻辑
- 不改变 SKILL.md 的调度流程（但引擎接入方式改变）
- 不接入 AI-atom（CORE/DOMAIN双层架构作为远期目标，本次不涉及）

## Capabilities

### New Capabilities

- `wealth-anchor-layer`: 对每个维度定义"百富榜级别"达标线，不只是"和自己比"
- `dimension-leverage-weights`: 20个维度的财富杠杆权重（商业嗅觉权重 > 沟通表达权重）
- `opportunity-cost-engine`: 机会成本分析（你本周花3小时在X，但同等时间做Y的ROI更高？）
- `intervention-feedback-loop`: 干预效果闭环（追踪执行率，3次无效切换策略）
- `wealth-dimensions`: 3个财富专用维度（投资判断/杠杆识别/资产配置）

### Modified Capabilities

- `scoring-engine`: 改造为双轨计分（进步分 + 财富距离分）
- `engine-architecture`: 从串行7步改为插件化事件总线架构

## Impact

- `config/capability_baseline.json` — 增加 wealth_anchor 和 leverage_weights 字段
- `core/` — 新增 opportunity_cost_engine.md、插件适配器层
- `core/scoring_engine.md` — 改造为双轨计分
- `rules/intervention_triggers.md` — 增加干预闭环逻辑
- `memories/long_term/intervention_effectiveness_log.md` — 增加执行率追踪
- 架构变化：SKILL.md 的 Step 5 分析引擎调用方式不变，但底层接入事件总线