## Phase 1 Tasks（本轮实施）

### Task 1: 改造 capability_baseline.json
**文件**: `config/capability_baseline.json`
**操作**:
- 每个维度增加 `wealth_anchor` 字段（百富榜达标线）
- 每个维度增加 `leverage_weight` 字段（0.5-3.0）
- 设定初值（商业嗅觉/战略思维=9，沟通表达/情商=7，执行力=7等）
- 新增3个财富维度：investment_judgment / leverage_awareness / asset_diversity

**验证**: `python3 -c "import json; d=json.load(open('config/capability_baseline.json')); print(len(d['dimensions']), all('wealth_anchor' in v for v in d['dimensions'].values()), all('leverage_weight' in v for v in d['dimensions'].values()))"`

### Task 2: 改造 scoring_engine.md
**文件**: `core/scoring_engine.md`
**操作**:
- 增加双轨计分说明（progress_score + wealth_score）
- 增加公式：wealth_score = current × leverage_weight
- 增加财富距离计算：distance = anchor - current
- 增加周期性汇总格式

**验证**: 确认包含"双轨计分"、"wealth_score"、"wealth_distance"关键词

### Task 3: 新建 opportunity_cost_engine.md
**文件**: `core/opportunity_cost_engine.md`
**操作**:
- 定义高杠杆活动（学习/创作/建立人脉/投资/健身）
- 定义低杠杆活动（通勤/刷手机/无效社交/纯消费）
- 实现时间审计功能（从 daily_raw 提取时间数据）
- 实现 ROI 对比建议输出

**验证**: 文件存在且包含"高杠杆"、"低杠杆"、"机会成本"关键词

### Task 4: 补充 intervention_effectiveness_log.md
**文件**: `memories/long_term/intervention_effectiveness_log.md`
**操作**:
- 增加 `action_assigned`、`user_mentioned`、`action_taken`、`action_result`、`strategy_switch` 字段
- 增加3次无效切换策略的说明
- 更新记录格式

**验证**: 包含全部9个字段（date/dimension/intervention_type/action_assigned/user_mentioned/action_taken/action_result/behavior_change/effectiveness_score/strategy_switch/notes）

### Task 5: E2E 测试
**内容**: 用真实场景测试完整链路
- 用户说"今天工作太累，回家刷抖音到凌晨1点" → 系统应该追踪并在下周提示机会成本
- 用户收到干预后说"做了" → 系统记录 action_taken=true

**验证**: 5个测试用例全部通过