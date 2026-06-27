## Why

系统当前缺少输入质量判断——用户说"今天有点烦"，7步流水线全跑，Observer输出稀薄（无具体行为、无归因指向），导致后续分析空转、干预无效。且用户自身往往意识不到自己没说清楚（盲点导致薄输入）。

## What Changes

**新增 Step 3.5 深度闸门**
在 SKILL.md Step 3 (Observer) 之后、Step 4 (Archivist) 之前，插入深度闸门判定：
- 调用 `core/signal_depth_gate.md`（L1常驻引擎）
- 信号厚度评分（0-10，5维度×权重）
- ≥5分 → 继续Step 4
- <5分 → 进入缺口探测（追问≤2次）
- 2次追问后仍<5 → 归档[极薄输入]，不触发Step 5-6，输出NO_REPLY

**追问锚定历史模式**
追问必须引用retrieval_index高频模式（≥2）或active_conflicts或pending_actions，禁止空泛追问。

**L1引擎扩展**
signal_depth_gate作为L1常驻引擎，~200 tokens，确保每次碎碎念都做厚度判定。

## Capabilities

### New Capabilities

- `signal-depth-gate`: 信号厚度判定引擎（L1常驻），判断输入是否足够分析

### Modified Capabilities

- `skill-md`: 新增Step 3.5深度闸门 + 引擎索引更新
- `orchestrator-prompt`: L1列表更新（2→3个引擎）+ Step 1.5判定逻辑

## Impact

- 新增 `core/signal_depth_gate.md`（L1常驻，~200 tokens）
- 修改 `SKILL.md`（Step 3.5插入 + 引擎索引）
- 修改 `core/orchestrator_prompt.md`（L1列表 + Step 1.5）
- 核心原则变化："信号不够不分析"替代"有信号就分析到底"