## Task 1: P0 - 更新 linguistic_analyzer.md（增强版）

**文件**: `core/linguistic_analyzer.md`

**操作**:
1. 在现有输出结构中新增"语言风格分析"区块
2. 新增字段：tone_markers, defense_mechanisms, emotional_temperature, implicit_intent, action_verbs_count, state_verbs_count
3. 添加防御机制检测规则（rationalization/minimization/blame_shift/deflection）
4. 添加隐层意图推断逻辑

**验证**:
- 包含"tone_markers"
- 包含"defense_mechanisms"
- 包含"emotional_temperature"
- 包含"implicit_intent"

---

## Task 2: P0 - 创建 time_pattern_analyzer.md

**文件**: `core/time_pattern_analyzer.md`

**内容**:
- L2引擎规格（按需触发）
- 时间→状态推断表（00:00-06:00=凌晨/亢奋/失眠）
- 星期→行为模式表（周六放纵系数1.5）
- 输出格式：timestamp, time_bucket, time_inferred_state, energy_level, day_pattern, 放纵系数, boundary_violation, risk_indicators

**验证**:
- 包含"凌晨"状态推断
- 包含"周六"放纵系数
- 包含"boundary_violation"

---

## Task 3: P1 - 更新 signal_depth_gate.md（v2评分）

**文件**: `core/signal_depth_gate.md`

**操作**:
1. 评分维度从5个扩展到8个
2. 新增：隐层意图(2分)、防御机制扣分(-0.5/种)、语言温度(1分)
3. 更新判定规则：增加"极厚信号"(≥8)和"极薄信号"(<3)

**验证**:
- 包含8个评分维度
- 包含"隐层意图"
- 包含"防御机制"扣分
- 包含"极厚信号"和"极薄信号"判定

---

## Task 4: P1 - 更新 SKILL.md（7步流程强制执行）

**文件**: `SKILL.md`

**操作**:
1. Step 1 (Observer) 末尾增加：必须输出语言风格分析
2. Step 3.5 (信号闸门) 标注为强制门禁，不是可选项
3. 新增Step 3.6：time_pattern_analyzer（当L2触发条件满足时）

**验证**:
- Step 1包含语言风格分析要求
- Step 3.5标注为"强制"
- 包含Step 3.6或time_pattern_analyzer引用

---

## Task 5: P2 - 更新 orchestrator_prompt.md

**文件**: `core/orchestrator_prompt.md`

**操作**:
1. L1引擎列表新增 linguistic_analyzer（已存在，确认增强后仍L1）
2. L2引擎列表新增 time_pattern_analyzer
3. 更新7步流程说明，强调不可跳过

**验证**:
- L2列表包含 time_pattern_analyzer
- 包含"7步流程不可跳过"

---

## Task 6: E2E 测试

**测试用例**:

1. **语言风格分析测试**:
   - 输入："因为周六可以放纵，所以凌晨4:30睡"
   - 预期：tone_markers=["justification"], defense_mechanisms=["rationalization"], emotional_temperature=cool

2. **时间模式分析测试**:
   - 消息时间00:30 + 周六
   - 预期：time_inferred_state="凌晨状态：亢奋/失眠/逃避", day_pattern="周末放纵模式"

3. **增强信号闸门测试**:
   - 输入："就是烦"
   - 预期：final_score < 3，触发极薄信号流程

4. **7步流程测试**:
   - 验证每个Step都有输出，不能跳过

**验证**: 4/4 通过

---

## 执行顺序
Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6