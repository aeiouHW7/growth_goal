## Why

当前agent的分析深度不够，主要问题：

1. **语言分析缺失**：只看内容，不看说话方式。"放纵"和"失控"表达同样的行为，但含义不同。
2. **隐层意图未识别**：用户说"周六可以放纵"是在合理化，不是真正的理由。
3. **时间维度未用**：用户10点发消息 → 说明刚睡醒/精力状态可推断。
4. **防御机制未识别**：借口式归因、合理化、转移话题等模式未被捕捉。
5. **7步流程未强制**：实际执行中跳步骤，导致分析质量不稳定。

## What Changes

### 1. 增强 linguistic_analyzer

**新增分析维度：**
- 语气分析（justification/deflection/rationalization）
- 词汇选择（行动词 vs 状态词）
- 句式结构（问句 vs 陈述句）
- 防御机制标记（"算了"/"反正"/"就这样"）

**新增输出字段：**
```json
{
  "surface_content": "...",
  "tone_markers": ["justification", "deflection"],
  "defense_mechanisms": ["rationalization"],
  "emotional_temperature": "cool/warm/hot",
  "action_verbs_count": 3,
  "state_verbs_count": 1,
  "implicit_intent": "合理化凌晨4:30睡觉的行为"
}
```

### 2. 新增 time_pattern_analyzer

**分析维度：**
- 消息时间 → 精力状态推断（凌晨=透支/亢奋）
- 消息间隔 → 参与度（等待回复=思考/整理）
- 星期几 → 模式（周末更放纵）

**新增输出字段：**
```json
{
  "timestamp": "10:00",
  "time_inferred_state": "刚睡醒/精力尚可",
  "day_pattern": "周末模式（更放纵）",
  "message_interval_minutes": null
}
```

### 3. 增强 signal_depth_gate

**评分维度从5个→8个：**
| 维度 | 权重 | 说明 |
|------|:--:|------|
| 具体行为 | 3 | 同原标准 |
| 归因指向 | 2 | 同原标准 |
| 情绪具体 | 2 | 同原标准 |
| 时间锚定 | 2 | 同原标准 |
| 涉及维度 | 1 | 同原标准 |
| 隐层意图 | 2 | 能推断出没说出来的意图 |
| 防御机制 | -1 | 有借口/合理化→扣分 |
| 语言温度 | 1 | 冷淡=低参与，热情=高参与 |

### 4. 7步流程强制执行

**SKILL.md新增约束：**
- Step 1-7 顺序不可跳过
- 每步必须有输出（哪怕是空值）
- Step 3.5（信号闸门）是强制门禁，不是可选项

## Capabilities

### Modified Capabilities

- `linguistic_analyzer`: 增加语气/防御机制/隐层意图分析
- `signal_depth_gate`: 评分维度扩展到8个
- `time_pattern_analyzer`: 新增引擎，基于消息时间推断状态

### New Capabilities

- `defense_mechanism_detector`: 识别借口/合理化/转移话题

## Impact

- 新增 `core/time_pattern_analyzer.md`（L2触发引擎）
- 新增 `core/defense_mechanism_detector.md`（L2触发引擎）
- 修改 `core/linguistic_analyzer.md`（增强分析维度）
- 修改 `core/signal_depth_gate.md`（评分维度扩展）
- 修改 `SKILL.md`（7步流程强制执行）
- Token负担：+150 tokens/次（中等）