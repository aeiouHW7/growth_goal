# Cron → Skill 桥接协议

## 概述

Cron 触发 isolated session，session 加载必要上下文，执行对应任务，发送消息，更新记忆。

---

## 3种 Cron 类型

### 类型1：周考（每周日 21:00）

**isolated session 启动时强制加载：**
1. `SKILL.md`
2. `rules/weekly_exam_logic.md`
3. `rules/evolution_triggers.md`
4. 近4周碎碎念（`memories/daily_raw/`）
5. `memories/weekly_summaries/` 上次周考记录
6. `config/capability_baseline.json`
7. `memories/retrieval_index.json`

**执行步骤：**
1. 汇总本周碎碎念话题
2. 按 weekly_exam_logic.md 生成周考题
3. 通过 message tool 发送（格式见 weekly_exam_logic.md）
4. 在 `memories/weekly_summaries/YYYY-WW.md` 创建记录框架
5. 等待用户回答（24小时超时追踪）

**delivery 设置：** `mode=none`（手动 message tool 发送，不用 announce）

---

### 类型2：月考（每月最后一天 20:00）

**isolated session 启动时强制加载：**
1. `SKILL.md`
2. `rules/monthly_exam_logic.md`
3. `rules/evolution_triggers.md`
4. 当月所有碎碎念
5. 当月所有周考记录
6. `config/capability_baseline.json`
7. `memories/retrieval_index.json`

**执行步骤：**
1. 汇总当月所有数据
2. 按 monthly_exam_logic.md 生成月报
3. 通过 message tool 发送月报
4. 更新 `config/capability_baseline.json`（history追加）
5. 写入 `memories/monthly_reports/YYYY-MM.md`

---

### 类型3：每日提醒（每天 21:30）

**isolated session 启动时强制加载：**
1. `SKILL.md`
2. 当日碎碎念检查（`memories/daily_raw/YYYY-MM-DD.md`）

**执行逻辑：**
```
IF 当日已有碎碎念记录:
    结束（不发消息）
ELSE:
    通过 message tool 发送一条简短提醒
    内容："今天有什么想说的吗？"（20字以内，不给压力）
```

**限制：**
- 22:10 后不再发（即使没回复）
- 每天只发一次

---

## 错误处理

### Session 启动失败
- 重试1次
- 若仍失败：跳过本次执行，记录 error 到 cron job state
- 连续3次失败 → 触发 skill 健康告警

### 消息发送失败
- 重试1次
- 若仍失败：记录到 HEARTBEAT.md
- 不阻塞记忆更新

### 文件写入失败
- 检查 `memories/` 目录权限
- 若不可写：记录错误，cron 跳过本次执行

---

## 连续失败告警

连续3次同类型 cron 失败 → 发送通知到用户：
```
⚠️ Self-growth-analyst 周考 cron 连续3次执行失败，请检查系统状态。
```
