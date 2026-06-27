# 执行计划：system-repair-and-self-evolution

## 阶段一：Skill 文件基础补齐

### Group A: 新建规范文件

- [ ] **A.1** 创建 `rules/evolution_triggers.md` — 定义 probe 进化的触发条件、进化方向、不触发情况
- [ ] **A.2** 创建 `core/auto_insight_generator.md` — 定义3段式洞察的生成规则和质量自检
- [ ] **A.3** 创建 `core/skill_health_checker.md` — 定义调用链自检步骤和健康报告格式
- [ ] **A.4** 创建 `rules/weekly_exam_logic.md` — 定义周考生成规则（3维度选法+综合题模板）
- [ ] **A.5** 创建 `rules/monthly_exam_logic.md` — 定义月考评分流程和月报格式

### Group B: 新建辅助目录

- [ ] **B.1** 创建 `skills_library/archive/` 目录 — 用于存放每次 probe 进化前的原始版本
- [ ] **B.2** 验证 `memories/weekly_summaries/` 目录存在且有 template.md
- [ ] **B.3** 验证 `memories/monthly_reports/` 目录存在且有 template.md
- [ ] **B.4** 验证 `memory/daily_records/` 目录存在且有 template.md

### Group C: SKILL.md 更新

- [ ] **C.1** 在 SKILL.md 的"碎碎念处理流程"中补入"自动洞察生成"步骤（调用 auto_insight_generator）
- [ ] **C.2** 在 SKILL.md 中补入"周考月考触发"时的处理流程（新增 section）
- [ ] **C.3** 在 SKILL.md 中补入"cron 到 skill 桥接"时的上下文加载要求

---

## 阶段二：Cron 配置（系统真正跑起来的关键）

### Group D: Cron Job 配置

- [ ] **D.1** 创建 cron job：周考 — 每周日 21:00 Asia/Shanghai，payload=agentTurn，sessionTarget=isolated
- [ ] **D.2** 创建 cron job：月考 — 每月最后一天 20:00 Asia/Shanghai，payload=agentTurn，sessionTarget=isolated
- [ ] **D.3** 创建 cron job：每日提醒 — 每天 21:30 Asia/Shanghai，payload=agentTurn，sessionTarget=isolated

### Group E: Cron → Skill 桥接逻辑

- [ ] **E.1** 在 `core/` 下创建 `cron_bridge.md` — 定义3种 cron 类型的 message 模板（周考内容/月报/提醒）
- [ ] **E.2** 定义 isolated session 启动时的强制加载列表（SKILL.md + 近7天 + baseline + retrieval_index）
- [ ] **E.3** 实现每日提醒 cron 的判断逻辑（检查今日是否有碎碎念，无则发提醒）

### Group F: Cron 执行后的文件写入

- [ ] **F.1** 实现周考答案接收和记录逻辑（24小时超时追踪，写入 weekly_summaries/）
- [ ] **F.2** 实现超时惩罚逻辑（超时未答 → 执行力 -0.5，标注 `[超时惩罚]`）
- [ ] **F.3** 实现月考汇总逻辑（汇总当月所有数据 → 生成月报 → 更新 baseline.json）
- [ ] **F.4** 实现连续3天无碎碎念 → 触发静默提醒的逻辑

---

## 阶段三：Probe 进化机制

### Group G: Evolution 逻辑落地

- [ ] **G.1** 在碎碎念处理流程中嵌入"回避信号检测"（用户回答<15字/转移话题时标记）
- [ ] **G.2** 实现 retrieval_index.json 的 pattern 自动追加逻辑（每次碎碎念后检查是否需要更新）
- [ ] **G.3** 实现 probe 进化执行流程（备份 → 修改 → 验证 → 写注释）
- [ ] **G.4** 创建 `skills_library/archive/` 备份机制（每次进化前自动备份原文件）

### Group H: Evolution 验证

- [ ] **H.1** 验证：连续2次回避某维度 → 触发进化标记（模拟测试）
- [ ] **H.2** 验证：危险区维度连续2次无进步 → 触发审查标记
- [ ] **H.3** 验证：进化后 probe 文件仍保持5题+4分类结构
- [ ] **H.4** 验证：保护模式期间不触发进化

---

## 阶段四：自动洞察生成

### Group I: Insight 逻辑落地

- [ ] **I.1** 在碎碎念记录模板中验证 `## 立即洞察` 字段存在（已有）
- [ ] **I.2** 实现3段式洞察生成规则（言外之意/模式信号/目标缺失）
- [ ] **I.3** 实现洞察与待追踪的联动（发现模式 → 写 pending_tracking）
- [ ] **I.4** 实现洞察质量自检（3个检查项全通过才算合格）

### Group J: Insight 特殊场景

- [ ] **J.1** 实现保护模式期间的洞察处理（只记录不外化）
- [ ] **J.2** 实现多维度碎碎念的洞察拆分（每个维度独立一段）
- [ ] **J.3** 验证：7天内同一话题重复出现 → 在第二段标记 `[模式信号]`

---

## 阶段五：Skill 健康检查

### Group K: 自检机制落地

- [ ] **K.1** 实现文件完整性检查（SKILL.md + 19 probe + 规则文件 + 配置文件）
- [ ] **K.2** 实现 cron job 状态检查（3个 job 是否都是 enabled）
- [ ] **K.3** 实现 JSON 文件损坏检测（capability_baseline / retrieval_index / user_profile）
- [ ] **K.4** 实现连续失败告警逻辑（3次连续失败 → 通知用户）

### Group L: 自检报告

- [ ] **L.1** 实现"skill健康检查"报告生成（用户说"检查一下你"时触发）
- [ ] **L.2** 报告格式包含：文件完整性 / Cron状态 / 运行记录 / 能力短板 / 待处理问题
- [ ] **L.3** 在 cron 失败时自动生成错误摘要写入 HEARTBEAT.md

---

## 阶段六：完整链路测试

### Group M: 端到端测试

- [ ] **M.1** 测试场景：用户发一条碎碎念 → 验证是否自动生成洞察写入当日文件
- [ ] **M.2** 测试场景：周日21:00 cron触发 → 验证是否收到周考消息
- [ ] **M.3** 测试场景：用户回复周考 → 验证是否生成周考记录
- [ ] **M.4** 测试场景：月末最后一天20:00 cron触发 → 验证是否收到月报
- [ ] **M.5** 测试场景：21:30提醒 → 验证若当日无碎碎念是否发送提醒
- [ ] **M.6** 测试场景：说"检查一下你" → 验证是否生成健康报告

### Group N: 修复循环

- [ ] **N.1** 根据测试结果修复发现的所有断点
- [ ] **N.2** 补充遗漏的规范文件（如果测试中发现新的缺失）
- [ ] **N.3** 最终验证：所有文件齐全 + 所有 cron 配置完毕 + 所有链路可走通

---

## 执行优先级

```
P0（系统跑起来的最少必要条件）：
D.1, D.2, D.3, A.1, A.2, C.1, C.2, M.1

P1（完整运行）：
D.1, D.2, D.3, A.1~A.5, B.1~B.4, C.1~C.3, E.1~E.3, F.1~F.4, M.1~M.6

P2（进化+健康检查）：
G.1~G.4, H.1~H.4, I.1~I.3, J.1~J.3, K.1~K.3, L.1~L.3, N.1~N.3
```
