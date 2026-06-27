# 周考/月考答案接收逻辑

## 主session收到消息时的判断

当主session收到用户消息时，按以下顺序判断：

### 第1步：检查是否有活跃的周考在等答案

```
IF memories/.active_exam.json 存在：
    读取 expiry_timestamp
    IF 当前时间 < expiry_timestamp：
        进入"周考答案接收模式"
    ELSE：
        删除 memories/.active_exam.json
        清除超时惩罚标记
        正常处理消息
ELSE：
    正常处理消息
```

---

## 周考答案接收模式

当检测到活跃周考时：

### 步骤1：记录答案

将用户回答追加到 `memories/weekly_summaries/YYYY-WW.md`：

```markdown
## Q1 回答
题目：...
用户回答：...
AI观察：...
评估：[正常/过短/深度不足/进步]

## Q2 回答
...

## 综合题回答
...
```

### 步骤2：答案质量评估

| 情况 | 标注 | 处理 |
|------|------|------|
| 字数 < 30字 | `[回答过短]` | 标记，不影响评分 |
| 只重复题目无展开 | `[深度不足]` | 标记，不影响评分 |
| 回答比上周深刻 | `[进步]` | 记录为进步证据 |
| 回答揭示新模式 | `[新模式信号]` | 更新 retrieval_index.json |

### 步骤3：清理活跃状态

```
删除 memories/.active_exam.json
```

---

## 周考Cron创建文件时

Cron job（isolated session）在发送周考消息时，同时：

1. 创建 `memories/.active_exam.json`：
```json
{
  "type": "weekly_exam",
  "week": "2026-W17",
  "sent_at": "2026-04-26T21:00:00+08:00",
  "expiry_timestamp": 1735200600,
  "file": "memories/weekly_summaries/2026-W17.md",
  "timeout_applied": false
}
```

2. `expiry_timestamp` = 发送时间 + 24小时

---

## 超时处理

当主session检测到 expiry 已过且仍有活跃周考：

```
IF memories/.active_exam.json 存在 AND 当前时间 > expiry_timestamp：
    读取文件 memories/weekly_summaries/YYYY-WW.md
    追加：
    ```markdown
    ## 答题状态
    [超时未答]
    ```
    执行力维度 -0.5（标注 [超时惩罚]）
    写入 config/capability_baseline.json 的 history
    删除 memories/.active_exam.json
```

---

## 月考答案接收

月考没有24小时窗口，用户可以在任意时间回复。处理方式：

1. Cron发送月报时**不设置** `.active_exam.json`（月考不需要等答案）
2. 月考答案视为普通碎碎念处理
3. 月考评分在cron里一次性完成，不需要后续答案追踪

---

## 连续3天无碎碎念

在每日提醒cron中检查：

```
IF 连续3天无碎碎念（memories/daily_raw/ 无文件）：
    在 retrieval_index.json 的 pending_tracking 追加：
    {
      "type": "静默触发",
      "since": "YYYY-MM-DD",
      "first_reminder": "YYYY-MM-DD"
    }
    在下次主session对话时，若检测到此标记：
        发送："最近没怎么说话，是什么事吗？"
```
