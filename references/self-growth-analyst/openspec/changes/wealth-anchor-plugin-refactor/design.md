## Context

用户指出了6个错位，本设计针对每个错位给出解决方案。

## Goals / Non-Goals

**Goals:**
- scoring_engine 引入外部锚点（百富榜级别达标线）
- 20个维度获得财富杠杆权重
- 系统具备主动追踪能力（不只是被动分析）
- 新增3个财富专用维度
- 引擎架构支持插件化（未来可接入硬件）
- 干预闭环追踪执行率和效果

**Non-Goals:**
- 不重写 SKILL.md 的调度流程
- 不改变已有引擎的内部逻辑
- 不接入 AI-atom（CORE/DOMAIN是远期目标）
- 不做全部20个维度的重新设计（聚焦在财富相关改造）

## Decisions

### D1: 财富锚定层设计

在 `config/capability_baseline.json` 中，每个维度增加：
```json
{
  "dimension_name": {
    "current_score": 5,
    "wealth_anchor": 8,      // 百富榜级别达标线
    "leverage_weight": 2.5,   // 财富杠杆系数（相对沟通表达的倍数）
    "progress_score": 0.3     // 和自己过去比的变化
  }
}
```

**锚定值来源**：基于用户目标（前100富人）推算各维度需要的水平。商业嗅觉/战略思维/资源整合的锚定值比沟通表达/情商高得多。

### D2: 引擎插件化架构

```
数据输入 → 输入适配器层 → 事件总线 → 插件引擎（可插拔）
                                    ↓
                              SKILL.md 调度器（订阅事件）
```

- 事件总线：各引擎发布分析结果，调度器订阅
- 适配器层：新数据源（如心率）只需写适配器，不改引擎
- 调度器订阅：SKILL.md 仍然是入口，但调用引擎的方式从"直接调用"改为"订阅事件"

**实现考虑**：当前是纯文本prompt系统，事件总线用文件模拟（事件写入临时文件，各引擎读写）。这不是真正的代码级事件总线，但是符合当前系统约束的轻量实现。

### D3: 干预闭环设计

在 `memories/long_term/intervention_effectiveness_log.md` 中增加字段：
- `action_taken`: 用户是否执行了那个行动
- `action_result`: 执行后有什么结果
- `switch_trigger`: 连续3次无效则标记"策略切换"

调度器在每次碎碎念时检查：如果用户提到了上次干预的行动结果，记录到 log。

### D4: 财富专用维度

新增3个维度（不改变总数20，保持可扩展）：
- `investment_judgment`: 投资判断力（股票/基金/资产配置）
- `leverage_awareness`: 杠杆识别能力（资本/劳动力/代码/媒体）
- `asset_diversity`: 收入来源多元化程度

这些维度的 baseline 从0开始追踪。

### D5: 机会成本分析引擎

新建 `core/opportunity_cost_engine.md`：
- 输入：用户本周时间使用数据（从 daily_raw 提取）
- 输出：本该做但没做的事，以及可能的财富损失

这不是给用户压力，是让他意识到机会成本。

## Risks / Trade-offs

[风险] 财富锚定值是主观设定的，没有客观标准 → 缓解：先设定合理初值，用 effectiveness_log 反馈调整

[风险] 插件化架构在纯文本系统里很别扭 → 缓解：用文件模拟事件总线，符合当前约束

[风险] 干预闭环依赖用户主动反馈 → 缓解：调度器在每次碎碎念时主动问"上次那个行动做了吗"

## Migration Plan

**Phase 1（本轮）：**
- 改造 capability_baseline.json（增加锚定和权重字段）
- 新增3个财富专用维度
- 新建 opportunity_cost_engine.md
- 改造 scoring_engine.md（双轨计分）
- 补充 intervention_effectiveness_log.md（增加闭环字段）

**Phase 2（下一轮）：**
- 插件化架构落地（事件总线+适配器层）
- 补充财富维度到20个

**Phase 3（远期）：**
- AI-atom DOMAIN 接入