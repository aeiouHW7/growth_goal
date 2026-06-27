# Skill Health Check

## ADDED Requirements

### Requirement: Skill 调用链完整性检查
系统 SHALL 在每次关键操作前验证调用链是否完整。

#### Scenario: 主session启动时的自检
- **WHEN** 主session开始处理用户消息时
- **THEN** 按以下顺序检查：
  1. SKILL.md 是否存在且可读
  2. 4层memory文件是否可读（近7天/待追踪/能力短板/长期模式）
  3. retrieval_index.json 是否存在
  4. capability_baseline.json 是否存在
- **AND** 若任一文件缺失，记录错误并尝试从备份恢复
- **AND** 若无法恢复，通知用户"Skill状态异常，请检查"

#### Scenario: Cron job 执行前的检查
- **WHEN** 任何 cron job 准备执行时
- **THEN** 在 isolated session 启动前检查：
  1. SKILL.md 存在
  2. 相关 probe 文件存在
  3. memories/ 目录可写
  4. message tool 可用
- **AND** 若检查失败，cron job 跳过本次执行并记录错误

---

### Requirement: Skill 健康状态监控
系统 SHALL 持续监控 skill 的运行状态。

#### Scenario: 连续失败检测
- **WHEN** 以下任一情况连续发生3次：
  - cron 触发但 session 启动失败
  - 消息发送失败
  - 文件写入失败
- **THEN** 触发告警：
  1. 在 HEARTBEAT.md 中写入错误摘要
  2. 在下次对话中告知用户"Self-growth-analyst 最近运行异常，请检查"
  3. 在 cron job state 中记录 consecutiveErrors

#### Scenario: 文件损坏检测
- **WHEN** 以下任一文件损坏（JSON解析失败）：
  - capability_baseline.json
  - retrieval_index.json
  - user_profile.json
- **THEN** 执行：
  1. 从最近的备份恢复（如果有）
  2. 若无备份，创建新的空结构（会丢失历史数据）
  3. 通知用户"部分历史数据已丢失，建议手动检查"
  4. 在 memory/ 目录记录 `[数据恢复事件] 日期:xxx`

---

### Requirement: Skill 自检报告
系统 SHALL 支持生成 skill 运行状态报告。

#### Scenario: 生成自检报告
- **WHEN** 用户要求"检查一下你"或"skill健康吗"
- **THEN** 系统生成如下格式的报告：

```
## Self-Growth-Analyst 健康报告

### 文件完整性
- [✅/❌] SKILL.md
- [✅/❌] 19个 probe 文件
- [✅/❌] 核心规则文件
- [✅/❌] 配置文件

### Cron 状态
- [✅/❌] 周考 cron (每周日21:00)
- [✅/❌] 月考 cron (每月最后一天20:00)
- [✅/❌] 每日提醒 (每天21:30)

### 最新运行记录
- 上次周考：YYYY-MM-DD [成功/失败/超时未答]
- 上次月考：YYYY-MM [成功/失败]
- 最后碎碎念：YYYY-MM-DD

### 能力评分（最低3项）
1. political_wisdom: 4分
2. self_awareness: 5分
3. psychological: 5分

### 待处理问题
- [列表]
```

#### Scenario: 每日碎碎念数量健康检查
- **WHEN** 每日提醒 cron 执行时
- **THEN** 同时检查近7天碎碎念数量：
  - 若 <3条：标注 `[碎碎念偏少]`，提醒用户多分享
  - 若 3-7条：正常
  - 若 >7条：正常（用户很活跃）
- **AND** 统计结果写入月报的行为分析部分

---

### Requirement: Skill 调用链的断点识别
系统 SHALL 能识别并报告调用链中的具体断点。

#### Scenario: 识别断点
- **WHEN** 某次 cron 执行失败时
- **THEN** 报告应精确到：
  - cron 触发 ✅ → session 启动 ❌（如果失败在这里）
  - session 启动 ✅ → 文件加载 ❌（如果失败在这里）
  - 文件加载 ✅ → 消息发送 ❌（如果失败在这里）
  - 消息发送 ✅ → 记忆更新 ❌（如果失败在这里）

#### Scenario: 修复建议
- **WHEN** 报告断点后
- **THEN** 同时给出最可能的修复建议：
  - "session 启动失败 → 检查 OpenClaw 运行状态"
  - "文件加载失败 → 检查 memory/ 目录权限"
  - "消息发送失败 → 检查 Feishu channel 配置"
```
