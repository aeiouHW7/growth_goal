# Cron Scheduler

## ADDED Requirements

### Requirement: 周考 Cron 配置
系统 SHALL 在每周日 21:00 (Asia/Shanghai) 自动触发周考流程。

#### Scenario: 周考正常触发
- **WHEN** 时间到达每周日 21:00 (Asia/Shanghai)
- **THEN** 触发 isolated session，加载本周所有碎碎念 + 上次周考评分
- **AND** 生成周考题（3个维度各1题 + 1道综合题）
- **AND** 通过 message tool 发送考题到用户 Feishu
- **AND** 创建/更新 memories/weekly_summaries/YYYY-WW.md
- **AND** 设置24小时超时追踪

#### Scenario: 用户在24小时内未回答
- **WHEN** 周考发出后24小时内用户未回答
- **THEN** 在周考记录里标注 `[超时未答]`
- **AND** 执行力维度 -0.5 分（标注 `[超时惩罚]`）
- **AND** 不再催促

#### Scenario: cron 触发失败
- **WHEN** cron 触发失败（连续3次）
- **THEN** 发送通知到用户告知 skill 需要检查
- **AND** 在 cron job state 里记录 error

---

### Requirement: 月考 Cron 配置
系统 SHALL 在每月最后一天 20:00 (Asia/Shanghai) 自动触发月考流程。

#### Scenario: 月考正常触发
- **WHEN** 时间到达每月最后一天 20:00 (Asia/Shanghai)
- **THEN** 触发 isolated session，汇总本月所有数据
- **AND** 调用评分引擎生成完整20维评分
- **AND** 生成月报（包含评分变化 + 证据 + 下月重点）
- **AND** 通过 message tool 发送月报到用户 Feishu
- **AND** 更新 config/capability_baseline.json（追加history）
- **AND** 更新 memories/monthly_reports/YYYY-MM.md

#### Scenario: 月考证据不足
- **WHEN** 某些维度证据不足（<2条）
- **THEN** 评分标注 `[待验证]`
- **AND** 月报里说明"建议在下月补充碎碎念来验证"

---

### Requirement: 每日提醒 Cron 配置
系统 SHALL 在每天 21:30 (Asia/Shanghai) 检查用户是否已分享碎碎念，若无则发送一条提醒。

#### Scenario: 用户当日已分享
- **WHEN** 21:30 检查时发现当日已有碎碎念记录
- **THEN** 不发送任何消息，cron 结束

#### Scenario: 用户当日未分享
- **WHEN** 21:30 检查时发现当日没有任何碎碎念
- **THEN** 通过 message tool 发送一条简短提醒（不超过20字）
- **AND** 内容示例："今天有什么想说的吗？"（不提"考"字，不给压力）

#### Scenario: 22:10后不再提醒
- **WHEN** 已发送过提醒且时间超过 22:10
- **THEN** 即使用户未回复也不再次发送

#### Scenario: 连续3天无碎碎念
- **WHEN** 连续3天检查均无碎碎念
- **THEN** 触发 intervention_rules.md 中的"静默触发"逻辑
- **AND** 在下次对话中主动询问"最近没怎么说话，是什么事吗"

---

### Requirement: Cron 到 Skill 的桥接协议
每个 cron job SHALL 使用 agentTurn payload + isolated sessionTarget，不干扰主session。

#### Scenario: Cron payload 结构
- **WHEN** cron 触发时
- **THEN** payload = { kind: "agentTurn", message: "<触发类型的指令>" }
- **AND** sessionTarget = "isolated"
- **AND** delivery.mode = "none"（不自动 announce，手动 message tool 发送）

#### Scenario: Isolated session 启动时加载必要上下文
- **WHEN** isolated session 启动时
- **THEN** 必须加载：SKILL.md + 近7天碎碎念 + capability_baseline.json
- **AND** 其他文件按需加载（不得遗漏第四层长期模式）
