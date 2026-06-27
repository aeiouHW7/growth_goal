## 1. Orchestrator Core

- [ ] 1.1 新建 `core/orchestrator_prompt.md` — 完整调度角色定义，包含4个子Agent角色描述、状态机定义、调度决策流程
- [ ] 1.2 新建 `memories/.orchestrator_state.json` — 初始化状态结构，包含 last_cycle、pending_tracking、pending_actions、next_check_time
- [ ] 1.3 更新 `core/system_prompt.md` — 在开头注入 Orchestrator 角色定义，链接到 orchestrator_prompt.md
- [ ] 1.4 E2E测试：输入测试碎碎念，验证 Orchestrator 完整链路走通（观察→分析→决策→干预→追踪）

## 2. Dynamic Baseline & Cognitive Bias Log

- [ ] 2.1 新建 `memories/dynamic_baseline.json` — 初始化结构（dimensions空数组、behavior_frequencies空对象、pattern_triggers空数组）
- [ ] 2.2 新建 `memories/cognitive_bias_log.md` — 初始化格式，包含偏误分类标准（计划谬误、损失厌恶、基本归因错误、事后合理化等）
- [ ] 2.3 验证 Archivist Agent 的状态更新逻辑：每次 Orchestrator 完成后更新 `.orchestrator_state.json`

## 3. Skills Library 改造（选3个维度做样板）

- [ ] 3.1 选3个维度：决策、执行、沟通表达
- [ ] 3.2 新建 `skills_library/decision/skill.yaml` — 完整动态脚本，包含 trigger_conditions、diagnosis_flow、intervention
- [ ] 3.3 新建 `skills_library/execution/skill.yaml` — 完整动态脚本
- [ ] 3.4 新建 `skills_library/communication/skill.yaml` — 完整动态脚本
- [ ] 3.5 验证 Coach Agent 的 Skill 触发和干预生成逻辑

## 4. E2E 穿线测试

- [ ] 4.1 准备测试数据：从13天碎碎念中选3条典型输入（普通碎碎念、模式触发、紧急信号）
- [ ] 4.2 执行完整 E2E 测试：输入→Observer提取→Archivist写入→Analyst模式检测→Orchestrator决策→Coach干预（如果触发）
- [ ] 4.3 验证所有输出文件更新：daily_raw更新、dynamic_baseline更新、orchestrator_state更新
- [ ] 4.4 输出 E2E 测试报告：哪些穿通了，哪些断了

## 5. Git Push

- [ ] 5.1 清理私有数据（memories/daily_raw/、config/）
- [ ] 5.2 git add + commit + push 到 GitHub 仓库