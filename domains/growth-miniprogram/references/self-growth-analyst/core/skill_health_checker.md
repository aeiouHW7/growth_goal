# Skill 健康检查规则

## 触发时机

1. 用户说"检查一下你" / "skill健康吗" / "系统状态"
2. 每次 cron 执行前（自动检查）

---

## 检查项目

### 1. 文件完整性检查

| 文件 | 检查方法 | 失败操作 |
|------|---------|---------|
| SKILL.md | 存在 + 可读 | 通知用户 |
| 19个 probe 文件 | 存在 + 题数=5 | 重建该文件 |
| rules/ 目录3个规则 | 存在 | 重建 |
| core/ 目录4个核心文件 | 存在 | 重建 |
| config/ 目录2个配置 | JSON 可解析 | 重建空结构 |

### 2. JSON 文件损坏检查

| 文件 | 失败操作 |
|------|---------|
| capability_baseline.json | 从备份恢复或重建 |
| retrieval_index.json | 重建（丢失 patterns） |
| user_profile.json | 重建（丢失 profiling） |

### 3. Cron Job 状态检查

| Job | 期望状态 |
|-----|---------|
| 周考 | enabled + 下次执行时间正确 |
| 月考 | enabled + 下次执行时间正确 |
| 每日提醒 | enabled + 下次执行时间正确 |

**检查逻辑：**
1. 检查3个cron job是否都是 `enabled`
2. 检查下次执行时间是否合理（未来7天内，不超过30天）
3. 检查连续失败计数：若 ≥3次 → 标记警告
4. 若有 disabled job → 标记失败并说明原因

**失败判定：**
- job 被 disabled → ❌
- 连续失败 ≥3次 → ⚠️ 警告
- 下次执行时间已过期 → ❌
- 下次执行时间 >30天 → ⚠️ 警告（可能配置错误）

### 4. 目录可写性检查

| 目录 | 失败操作 |
|------|---------|
| memories/ | 通知用户 |
| skills_library/archive/ | 创建 |

---

## 健康报告格式

当用户要求检查时，生成以下报告：

```
## Self-Growth-Analyst 健康报告

### 文件完整性
[✅] SKILL.md
[✅/❌] 19个 probe 文件（X/19存在且格式正确）
[✅/❌] rules/ 规则文件
[✅/❌] core/ 核心文件
[✅/❌] config/ 配置文件

### Cron 状态
[✅/❌] 周考 cron（每周日21:00，下次执行：YYYY-MM-DD HH:mm）
[✅/❌] 月考 cron（每月最后一天20:00，下次执行：YYYY-MM-DD HH:mm）
[✅/❌] 每日提醒（每天21:30，下次执行：YYYY-MM-DD HH:mm）

**连续失败警告：** [若有则列出]
- ⚠️ [cron名称] 连续X次失败（最后错误：...）

### 最新运行记录
- 上次周考：YYYY-MM-DD [成功/失败/超时]
- 上次月考：YYYY-MM [成功/失败]
- 最后碎碎念：YYYY-MM-DD

### 能力评分（最低3项）
1. political_wisdom: X分
2. self_awareness: X分
3. psychological: X分

### 近期模式
- [列表]

### 待处理问题
- [若无则写"无"]
```

---

## 连续失败追踪

- 每次 cron 失败 → 在 HEARTBEAT.md 记录
- 连续3次 → 通知用户
- 通知内容：`⚠️ Self-growth-analyst [cron类型] 连续3次执行失败，请检查系统状态。`

---

## JSON 损坏恢复

```python
# 伪代码逻辑
try:
    json.load(open("config/capability_baseline.json"))
except:
    # 尝试从 memory/ 找备份
    backup = find_latest_backup("memory/*/capability_baseline.json")
    if backup:
        restore(backup)
    else:
        # 创建最小有效结构
        create_minimal_baseline()
        notify("部分历史评分数据已丢失")
```
