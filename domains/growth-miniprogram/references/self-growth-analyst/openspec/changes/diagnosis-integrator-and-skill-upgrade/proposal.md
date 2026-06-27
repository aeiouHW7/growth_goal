## Why

SKILL.md 调度器已完整，但存在两个关键缺陷：

1. **诊断碎片化**：各引擎独立输出，没有统一的"融合"步骤来决定最终给用户的核心诊断是什么。当 habit_behavior_engine 说"缺触发"和 psychodynamic_engine 说"深层恐惧"同时存在时，系统不知道该信哪个。

2. **Skills 库不完整**：只有 execution 是诊断脚本，communication 是诊断脚本（刚升级），其他17个维度还是 probes.md。当 Step 6 决策器触发非 execution/communication 维度时，无法执行 diagnosis_flow。

## What Changes

- **新增 Step 5.5 Diagnostician 融合**：在所有引擎输出和 Step 6 决策之间，增加融合逻辑，找到最深的根因和最表面的卡点，打包成统一核心诊断传递给决策器。
- **升级 communication 为诊断脚本**：从 probes 升级为含 trigger_conditions/diagnosis_flow/intervention_options/verification_method 的完整脚本。
- **新增 intervention_effectiveness_log.md**：记录每次干预效果，供系统学习什么方式对用户更有效。
- **补充 intervention_triggers.md 双重判断逻辑**：明确"频率+信号"触发深度干预的条件。

## Capabilities

### New Capabilities
- `diagnosis-integrator`: 诊断融合逻辑，嵌入 SKILL.md Step 5.5，作为调度器的一部分

### Modified Capabilities
- `communication-skill`: 从 probes.md v1.x 升级为 skill_definition.md v2.0（诊断脚本）
- `intervention-triggers`: 补充"频率+信号"深度干预触发条件

### Modified Capabilities (already done in parallel)
- `skill-md`: SKILL.md 新增 Step 5.5（已在上一轮实施）

## Impact

- SKILL.md：Step 5.5 融合逻辑增加约30行
- rules/intervention_triggers.md：补充深度干预区块
- skills_library/communication/skill_definition.md：新建诊断脚本
- memories/long_term/intervention_effectiveness_log.md：新建效果日志
- 仓库路线图：最终目标是全部20个维度都升级为诊断脚本，communication 是第2个