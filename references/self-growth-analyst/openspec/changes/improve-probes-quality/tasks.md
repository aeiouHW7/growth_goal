## 1. Grading - 对3个 eval run 进行评分

- [ ] 1.1 读取 eval-0 with_skill 输出，grading.json 写入评估结果
- [ ] 1.2 读取 eval-0 without_skill 输出，grading.json 写入评估结果
- [ ] 1.3 读取 eval-1 with_skill 输出，grading.json 写入评估结果（含证据格式检查）
- [ ] 1.4 读取 eval-1 without_skill 输出，grading.json 写入评估结果
- [ ] 1.5 读取 eval-2 with_skill 输出，grading.json 写入评估结果（保护模式）
- [ ] 1.6 读取 eval-2 without_skill 输出，grading.json 写入评估结果（含安慰检测）

## 2. Aggregate - 生成 benchmark.json

- [ ] 2.1 运行 aggregate_benchmark 生成正式 benchmark.json
- [ ] 2.2 验证 benchmark 数据正确（with_skill vs without_skill 对比）
- [ ] 2.3 确认 eval-2 安慰问题被标记为 failure

## 3. Probe 重写 - 按新标准重写19个 probe 文件

优先级顺序（用户最可能遇到的维度先改）：

### 高优先级（核心能力）
- [ ] 3.1 cognitive_probes.md — 认知（最基础）
- [ ] 3.2 decision_probes.md — 决策（用户说自己最想提升认知）
- [ ] 3.3 execution_probes.md — 执行
- [ ] 3.4 emotional_quota_probes.md — 情商
- [ ] 3.5 psychological_probes.md — 心理（年龄焦虑核心）

### 中优先级（社交相关）
- [ ] 3.6 political_wisdom_probes.md — 政治智慧（初始评分4分，最危险区）
- [ ] 3.7 influence_probes.md — 影响力
- [ ] 3.8 negotiation_probes.md — 谈判
- [ ] 3.9 leadership_probes.md — 领导力
- [ ] 3.10 social_probes.md — 社交

### 低优先级（其他）
- [ ] 3.11 learning_probes.md — 学习力
- [ ] 3.12 self_awareness_probes.md — 自我认知
- [ ] 3.13 risk_management_probes.md — 风险管理
- [ ] 3.14 time_management_probes.md — 时间管理
- [ ] 3.15 business_acumen_probes.md — 商业嗅觉
- [ ] 3.16 strategic_thinking_probes.md — 战略思维
- [ ] 3.17 resource_integration_probes.md — 资源整合
- [ ] 3.18 communication_probes.md — 沟通表达
- [ ] 3.19 creativity_probes.md — 创造力

## 4. 检查标准（每个文件必须满足）

- [ ] 4.1 每个问题能让人深度思考（不能一句话回答）
- [ ] 4.2 有具体的PM场景（不是泛泛理论）
- [ ] 4.3 犀利（戳到痛点）
- [ ] 4.4 4类问题都有（基础认知、深度思考、场景应用、矛盾探测）
- [ ] 4.5 每类问题有明确价值（不是凑数）
- [ ] 4.6 文件有3-5个问题（不凑数）

## 5. 最终验证

- [ ] 5.1 19个文件全部重写完毕
- [ ] 5.2 benchmark.json 确认 skill 价值（防止安慰是关键差异）
- [ ] 5.3 汇报完成状态