## Task 1: P0 - 创建 bootstrap_system.md

**文件**: `scripts/bootstrap_system.md`

**内容**:
1. 检查 .orchestrator_state.json 中是否有 data_accumulation_start
2. 检查 daily_raw/ 是否有过去7天的碎碎念
3. 如果有 → 执行一次完整7步循环，产出第一份评分
4. 如果没有 → 输出待数据积累状态，设置 data_accumulation_start
5. 输出系统状态信号

**验证**: 文件存在且包含 data_accumulation_start / 系统就绪 / 待数据积累 关键词

---

## Task 2: P1 - 更新 orchestrator_prompt.md（分级加载 + 互指注释）

**文件**: `core/orchestrator_prompt.md`

**修改**:
1. 开头加注释：<!-- 高位描述见 SKILL.md，本文件为精确执行规格 -->
2. 新增章节"三级引擎加载策略"（L1常驻/L2触发/L3周期）
3. 在Step 5中加入加载判断逻辑
4. 添加 Step 5.5 Diagnostician 融合（与SKILL.md一致）
5. 统一引擎列表（不能提到不存在的引擎）

**验证**: 
- 包含"三级引擎"或"L1/L2/L3"
- 包含"高位描述见SKILL.md"
- 包含Step 5.5 Diagnostician

---

## Task 3: P1 - 更新 SKILL.md（互指注释）

**文件**: `SKILL.md`

**修改**:
1. 开头加注释：<!-- 执行规格见 core/orchestrator_prompt.md，本文件为高位描述 -->

**验证**: 开头包含上述注释

---

## Task 4: P2 - 创建 financial_metrics.json

**文件**: `config/financial_metrics.json`

**内容**: 包含 net_worth/income_sources/passive_income_ratio/monthly_savings_rate/investment_portfolio 结构，initial值全部为null

**验证**: 包含所有6个字段，current值全部为null

---

## Task 5: P2 - 创建 wealth_engine.md

**文件**: `core/wealth_engine.md`

**内容**: L3周期引擎，月度生成财富健康度报告

**验证**: 包含"财富健康度报告"格式，包含"月度"关键词

---

## Task 6: E2E 测试

**内容**:
1. 模拟 bootstrap_sequence 执行（检查 daily_raw/ 状态）
2. 检查 orchestrator_prompt.md 是否包含三级加载
3. 检查 SKILL.md 是否包含互指注释
4. 检查 financial_metrics.json 结构完整性
5. 检查 wealth_engine.md 存在且格式正确

**验证**: 6/6 通过

---

## 执行顺序
Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6