## 1. 核心分析引擎

- [ ] 1.1 新建 `core/fogg_behavior_model.md` — 福格B=MAP模型完整逻辑，含动机/能力/提示诊断流程和Coach联动规则
- [ ] 1.2 新建 `core/iceberg_engine.md` — 冰山模型7层追问逻辑，含失败/沮丧关键词触发规则
- [ ] 1.3 新建 `core/big_five_ocean.md` — OCEAN五维度分析逻辑，含数据积累期规则和干预策略适配
- [ ] 1.4 新建 `core/pattern_miner.md` — 跨维度关联规则挖掘逻辑，含手工记录格式和3次触发规则创建

## 2. Skills Library 全面升级（20个维度）

- [ ] 2.1 新建 `skills_library/cognition/skill.yaml` — 认知维度动态脚本
- [ ] 2.2 新建 `skills_library/learning/skill.yaml` — 学习力维度动态脚本
- [ ] 2.3 新建 `skills_library/self_awareness/skill.yaml` — 自我认知维度动态脚本
- [ ] 2.4 新建 `skills_library/emotional_intelligence/skill.yaml` — 情绪智力维度动态脚本
- [ ] 2.5 新建 `skills_library/influence/skill.yaml` — 影响力维度动态脚本
- [ ] 2.6 新建 `skills_library/business_acumen/skill.yaml` — 商业嗅觉维度动态脚本
- [ ] 2.7 新建 `skills_library/strategic_thinking/skill.yaml` — 战略思维维度动态脚本
- [ ] 2.8 新建 `skills_library/creativity/skill.yaml` — 创造力维度动态脚本
- [ ] 2.9 新建 `skills_library/resilience/skill.yaml` — 抗压与韧性维度动态脚本
- [ ] 2.10 新建 `skills_library/time_management/skill.yaml` — 时间管理维度动态脚本
- [ ] 2.11 新建 `skills_library/social_wisdom/skill.yaml` — 社交智慧维度动态脚本
- [ ] 2.12 新建 `skills_library/leadership/skill.yaml` — 领导力维度动态脚本
- [ ] 2.13 新建 `skills_library/financial_literacy/skill.yaml` — 理财力维度动态脚本
- [ ] 2.14 新建 `skills_library/health_management/skill.yaml` — 健康管理维度动态脚本
- [ ] 2.15 新建 `skills_library/political_wisdom/skill.yaml` — 政治智慧维度动态脚本
- [ ] 2.16 新建 `skills_library/information_integration/skill.yaml` — 信息整合维度动态脚本
- [ ] 2.17 新建 `skills_library/goal_drive/skill.yaml` — 目标驱动维度动态脚本
- [ ] 2.18 新建 `skills_library/negotiation/skill.yaml` — 谈判维度动态脚本
- [ ] 2.19 新建 `skills_library/resource_integration/skill.yaml` — 资源整合维度动态脚本
- [ ] 2.20 新建 `skills_library/risk_management/skill.yaml` — 风险管理维度动态脚本
- [ ] 2.21 更新 `skills_library/decision/skill.yaml` — 按新格式重构
- [ ] 2.22 更新 `skills_library/execution/skill.yaml` — 按新格式重构
- [ ] 2.23 更新 `skills_library/communication/skill.yaml` — 按新格式重构

## 3. 记忆系统升级

- [ ] 3.1 改造 `config/capability_baseline.json` — 增加关键行为证据字段，分数+证据+趋势
- [ ] 3.2 新建 `memories/long_term/personal_bias_tracker.md` — 固有认知偏误追踪（5次升级规则）
- [ ] 3.3 新建 `memories/long_term/cross_dimension_rules.md` — 跨维度关联规则库（规则+证据强度+失效条件）

## 4. 知识图谱

- [ ] 4.1 新建 `references/psychology_knowledge.md` — 心理学知识库（ABA/CBT/动机心理学/认知偏误百科）
- [ ] 4.2 新建 `references/management_knowledge.md` — 管理学知识库（GTD/PDCA/OKR/商业模式画布）

## 5. KPI 仪表盘

- [ ] 5.1 改造 `memories/weekly_summaries/template.md` — 增加20维度趋势表格生成逻辑
- [ ] 5.2 验证趋势数据写入和读取正确

## 6. Orchestrator 升级

- [ ] 6.1 更新 `core/orchestrator_prompt.md` — 集成3个分析引擎调用逻辑
- [ ] 6.2 更新 `core/system_prompt.md` — 注入新的分析引擎角色定义

## 7. E2E 穿线测试

- [ ] 7.1 准备测试数据：从用户13天碎碎念选3条典型（普通/模式触发/深度追问）
- [ ] 7.2 执行完整链路：输入→Observer→Analyst(福格/冰山)→Orchestrator→Coach→Archivist
- [ ] 7.3 验证20维度 skill.yaml 全部能被正确加载和调用
- [ ] 7.4 输出 E2E 测试报告

## 8. Git Push

- [ ] 8.1 清理私有数据（memories/daily_raw/）
- [ ] 8.2 git add + commit + push