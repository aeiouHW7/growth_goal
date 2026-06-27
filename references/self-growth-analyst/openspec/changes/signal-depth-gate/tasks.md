## Task 1: P0 - 创建 signal_depth_gate.md

**文件**: `core/signal_depth_gate.md`

**内容**:
1. 信号厚度评分表（5维度 × 权重，0-10总分）
2. 缺口类型定义（行为缺失/归因缺失/情绪模糊/时间缺失）
3. 追问上限规则（≤2次）
4. 锚定追问生成规则（必须引用 retrieval_index/active_conflicts/pending_actions 至少一项）
5. [极薄输入] 归档格式
6. 引擎元数据：L1常驻，~200 tokens，输入=linguistic_analyzer输出+原始消息

**验证**: 
- 包含"信号厚度评分"
- 包含权重表（5维度）
- 包含"追问≤2次"
- 包含"锚定"或"retrieval_index引用"

---

## Task 2: P1 - 更新 SKILL.md（Step 3.5 插入）

**文件**: `SKILL.md`

**操作**: 在 Step 3 (Observer) 和 Step 4 (Archivist) 之间插入 Step 3.5

```markdown
## Step 3.5: 深度闸门 — 信号厚度判定

调用 `core/signal_depth_gate.md`（L1常驻引擎）。

### 判定流程
1. 对 Step 3 的 Observer 输出做信号厚度评分（0-10）
   - ≥ 5分 → 继续 Step 4
   - < 5分 → 进入缺口探测

2. 缺口探测
   - 确定缺口类型（行为缺失/归因缺失/情绪模糊/时间缺失）
   - 生成锚定追问（引用 retrieval_index 高频模式 或 active_conflicts 或 pending_actions）
   - 追问 ≤ 2次

3. 2次追问后仍 < 5分
   - 归档 [极薄输入]，不触发 Step 5-6
   - 输出 NO_REPLY
```

**验证**:
- Step 3 和 Step 4 之间有"Step 3.5"或"深度闸门"
- 包含"信号厚度评分"
- 包含"追问 ≤ 2次"

---

## Task 3: P1 - 更新 orchestrator_prompt.md（L1列表 + 执行逻辑）

**文件**: `core/orchestrator_prompt.md`

**操作**:
1. L1常驻引擎列表新增 signal_depth_gate.md：
   ```
   ### L1 常驻引擎（每次碎碎念必加载）
   - linguistic_analyzer.md — 归因/情绪/防卫分析
   - signal_depth_gate.md — 信号厚度判定+缺口探测
   - auto_insight_generator.md — 三段式自动洞察
   ```

2. 在 Step 5 分析引擎调用前增加深度判定逻辑

**验证**:
- L1列表包含 signal_depth_gate
- 包含深度判定逻辑（信号厚度评分 + 缺口探测）
- 包含"≤2次"追问限制

---

## Task 4: P2 - 更新引擎索引

**文件**: `SKILL.md` 第3章引擎索引

**操作**: 引擎索引表新增一行：
| signal_depth_gate | `core/signal_depth_gate.md` | 每次碎碎念（L1常驻）|

**验证**: 引擎索引表包含 signal_depth_gate

---

## Task 5: E2E 测试

**测试用例**:
1. 正常用例（信号充足）：
   - 输入：「今天下午开完需求评审，我觉得自己表达得不够清楚，leader又补充了一遍」
   - 预期：评分 ≥ 5，直接继续流程

2. 缺口用例（信号不足）：
   - 输入：「有点烦，不想干活」
   - 预期：评分 < 5，触发缺口探测，追问锚定retrieval_index模式

3. 极薄输入用例（2次追问后仍不足）：
   - 输入：「就是烦」
   - 预期：归档[极薄输入]，NO_REPLY，不触发干预

4. 文件落地检查：
   - signal_depth_gate.md 存在
   - SKILL.md 包含 Step 3.5
   - orchestrator_prompt.md L1列表包含 signal_depth_gate

**验证**: 4/4 通过

---

## 执行顺序
Task 1 → Task 2 → Task 3 → Task 4 → Task 5