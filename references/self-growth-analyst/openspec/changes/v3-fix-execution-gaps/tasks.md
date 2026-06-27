## Task 1: P0 - 更新 bootstrap_system.md（逆向重建+状态同步）

**文件**: `scripts/bootstrap_system.md`

**修改**:
1. Step 3 增加 3.1 逆向重建检查：
   - 检查 daily_raw/ 是否有文件
   - 如果无但 retrieval_index 有 patterns → 进入逆向重建
   - 从 patterns.dimensions 提取每个日期的维度触发记录
   - 生成骨架文件，标注[重建]

2. Step 3 最后增加 3.7 状态同步步骤：
   - 同步 .orchestrator_state.json
   - data_accumulation_weeks 从最早日期推算
   - last_cycle = 今天
   - current_state = "idle"
   - pending_actions 从 pending_actions.json 同步

**验证**: 
- 包含"逆向重建"
- 包含"Step 3.7"
- 包含 data_accumulation_weeks 推算

---

## Task 2: P1 - 更新 scoring_engine.md（备选证据+seeding）

**文件**: `core/scoring_engine.md`

**修改**:
1. 增加"备选证据来源优先级"章节
2. 增加 baseline seeding 逻辑（当current_score==0且working_context有评分时）
3. 增加[待验证]标注说明

**验证**:
- 包含"备选证据来源"
- 包含"seeding"
- 包含"[待验证]"或"待行为证据验证"

---

## Task 3: P3 - 更新 big_five_ocean.md（映射表）

**文件**: `core/big_five_ocean.md`

**修改**:
末尾追加"人格→能力映射表"章节，包含5个OCEAN维度的正向影响和负向风险映射。

**验证**:
- 包含"人格→能力映射表"
- 包含 O(开放性)/C(尽责性)/E(外向性)/A(宜人性)/N(神经质)
- 包含正向影响和负向风险两列

---

## Task 4: E2E 测试

**内容**:
1. 检查 bootstrap_system.md 包含逆向重建和状态同步
2. 检查 scoring_engine.md 包含备选证据和 seeding
3. 检查 big_five_ocean.md 包含映射表
4. 模拟 bootstrap 执行，检查输出状态

**验证**: 4/4 通过

---

## 执行顺序
Task 1 → Task 2 → Task 3 → Task 4