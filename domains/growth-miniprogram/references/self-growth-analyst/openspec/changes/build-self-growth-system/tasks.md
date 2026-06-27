## 1. core/ 目录文件填充

- [ ] 1.1 创建 `core/system_prompt.md` — 身份定义 + 回复规则 + 禁止列表
- [ ] 1.2 创建 `core/memory_retrieval.md` — 三层加载机制 + token限制 + 加载顺序
- [ ] 1.3 创建 `core/scoring_engine.md` — 评分算法 + 证据格式 + 变化规则

## 2. memories/ 目录文件填充

- [ ] 2.1 创建 `memories/daily_raw/2026-04-25.md` — 示例碎碎念文件
- [ ] 2.2 创建 `memories/weekly_summaries/template.md` — 周考格式模板
- [ ] 2.3 创建 `memories/monthly_reports/template.md` — 月报格式模板
- [ ] 2.4 创建 `memories/long_term/pattern_template.md` — 模式档案格式
- [ ] 2.5 创建 `memories/retrieval_index.json` — 轻量索引结构

## 3. rules/ 目录文件填充

- [ ] 3.1 创建 `rules/pattern_triggers.md` — 三类触发器硬条件
- [ ] 3.2 创建 `rules/intervention_rules.md` — 打断/记录/保护模式条件
- [ ] 3.3 创建 `rules/exam_scheduler.md` — 周考/月考触发时间 + 超时惩罚

## 4. skills_library/ 目录文件填充（20个维度）

- [ ] 4.1 创建 `skills_library/cognitive_probes.md` — 认知维度，3-5个问题
- [ ] 4.2 创建 `skills_library/learning_probes.md` — 学习力维度
- [ ] 4.3 创建 `skills_library/self_awareness_probes.md` — 自我认知维度
- [ ] 4.4 创建 `skills_library/psychological_probes.md` — 心理维度
- [ ] 4.5 创建 `skills_library/execution_probes.md` — 执行维度
- [ ] 4.6 创建 `skills_library/decision_probes.md` — 决策维度
- [ ] 4.7 创建 `skills_library/risk_management_probes.md` — 风险管理维度
- [ ] 4.8 创建 `skills_library/time_management_probes.md` — 时间管理维度
- [ ] 4.9 创建 `skills_library/emotional_quota_probes.md` — 情商维度
- [ ] 4.10 创建 `skills_library/social_probes.md` — 社交维度
- [ ] 4.11 创建 `skills_library/influence_probes.md` — 影响力维度
- [ ] 4.12 创建 `skills_library/negotiation_probes.md` — 谈判维度
- [ ] 4.13 创建 `skills_library/leadership_probes.md` — 领导力维度
- [ ] 4.14 创建 `skills_library/political_wisdom_probes.md` — 政治智慧维度
- [ ] 4.15 创建 `skills_library/business_acumen_probes.md` — 商业嗅觉维度
- [ ] 4.16 创建 `skills_library/strategic_thinking_probes.md` — 战略思维维度
- [ ] 4.17 创建 `skills_library/resource_integration_probes.md` — 资源整合维度
- [ ] 4.18 创建 `skills_library/communication_probes.md` — 沟通表达维度
- [ ] 4.19 创建 `skills_library/creativity_probes.md` — 创造力维度

## 5. config/ 目录文件填充

- [ ] 5.1 创建 `config/user_profile.json` — 用户固定画像
- [ ] 5.2 创建 `config/capability_baseline.json` — 初始评分 + 历史变化结构

## 6. 深度自我检查

- [ ] 6.1 检查所有文件是否有凑数的废话？删掉
- [ ] 6.2 检查PM语境是否具体？还是泛泛的理论？
- [ ] 6.3 检查每个文件是否完整到"新人看一遍就能填"？
- [ ] 6.4 检查是否覆盖了用户给的规范中的所有要求？

## 7. OpenSpec 归档

- [ ] 7.1 运行 `openspec archive build-self-growth-system`
- [ ] 7.2 修复任何 validation 错误
- [ ] 7.3 确认归档成功

## 8. 测试验证

- [ ] 8.1 手动模拟一次对话，确认记忆加载正确
- [ ] 8.2 确认触发器逻辑正确
- [ ] 8.3 确认评分格式正确
- [ ] 8.4 汇报完成状态