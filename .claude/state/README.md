# Workflow State Logs

ACE Engine 工作流状态日志目录。

## 目录结构

```
.claude/state/
├── propose-log.jsonl      # ace-propose 执行日志
├── apply-log.jsonl        # ace-apply 执行日志
├── review-log.jsonl       # review 执行日志
├── verify-log.jsonl       # verify 执行日志
├── archive-log.jsonl      # ace-archive 执行日志
└── README.md              # 本文件
```

## 日志格式

所有日志使用 JSONL 格式（每行一个 JSON 对象）：

```json
{"ts":"2026-05-12T12:00:00Z","skill":"review","event":"completed","change":"add-auth","auto_fixed":3}
```

### 通用字段

- `ts`: ISO 8601 时间戳
- `skill`: Skill 名称（propose、apply、review、verify、archive）
- `event`: 事件类型（completed、started、failed 等）
- `change`: 变更名称

### 特定字段

**propose-log.jsonl**:
```json
{"ts":"...","skill":"ace-propose","event":"completed","change":"add-auth","complexity":"复杂","artifacts":4,"skip_explore":false}
```

**apply-log.jsonl**:
```json
{"ts":"...","skill":"ace-apply","event":"task_completed","change":"add-auth","task_id":"3.1"}
{"ts":"...","skill":"ace-apply","event":"all_functional_done","change":"add-auth","total":10,"functional_done":7}
```

**review-log.jsonl**:
```json
{"ts":"...","skill":"review","event":"completed","change":"add-auth","files":5,"auto_fixed":3,"manual_required":1,"skip_check":false}
```

**verify-log.jsonl**:
```json
{"ts":"...","skill":"verify","event":"tests_pass","change":"add-auth","total":15,"passed":15,"coverage":82,"skip_review":false}
{"ts":"...","skill":"verify","event":"tests_fail","change":"add-auth","total":15,"passed":14,"failed":1}
```

**archive-log.jsonl**:
```json
{"ts":"...","skill":"ace-archive","event":"completed","change":"add-auth","docs_created":2,"forced":false}
```

---

## 流程守卫检查逻辑

工作流 Skills 使用这些日志实现前置检查。

### 检查链

```
ace-propose (可选检查 explore)
    ↓
ace-apply (检查 tasks artifact 是否 ready)
    ↓
review (检查 apply 功能任务是否完成)
    ↓
verify (检查 review 是否通过，复杂度感知)
    ↓
ace-archive (检查 verify 是否通过，复杂度感知)
```

### 复杂度感知

从 `proposal.md` 读取复杂度标记：

```markdown
## 变更分类
**复杂度**: 复杂
```

**检查规则**：

| 复杂度 | ace-apply | review | verify | archive |
|--------|-----------|--------|--------|---------|
| 简单   | 需要 propose | 可选 | 可选 | 需要 apply |
| 中等   | 需要 propose | 需要 apply | 需要 apply | 需要 review 或 verify |
| 复杂   | 需要 propose | 需要 apply | 需要 review | 需要 verify |

### 检查实现

**示例：verify 检查 review 是否通过**

```bash
# 读取复杂度
COMPLEXITY=$(grep "**复杂度**:" openspec/changes/*/proposal.md | tail -1 | grep -oE "(简单|中等|复杂)")

if [ "$COMPLEXITY" = "复杂" ]; then
  # 检查 review-log.jsonl
  REVIEW_DONE=$(tail -1 .claude/state/review-log.jsonl | jq -e '.event == "completed"' 2>/dev/null)
  
  if [ "$?" -ne 0 ]; then
    echo "❌ 前置步骤未完成：复杂变更必须先通过 review"
    exit 1
  fi
fi
```

---

## 用户跳过机制

用户可以明确跳过某些步骤（根据复杂度）。

### 允许跳过的场景

**简单变更**：
- ✅ 可以跳过 review 直接 archive
- ✅ 可以跳过 verify 直接 archive

**中等变更**：
- ✅ 可以跳过 verify（但建议运行 review）
- ⚠️ 跳过 review 需要用户确认

**复杂变更**：
- ❌ 不允许跳过 review
- ❌ 不允许跳过 verify
- ⚠️ 可以"强制运行"绕过检查（有严重警告）

### 跳过语法

用户说：
- "跳过 review 直接 verify" → 中等/简单变更允许
- "跳过 verify 直接归档" → 简单变更允许，中等变更需确认
- "强制运行 verify" → 绕过所有检查，记录警告

### 日志记录

跳过或强制运行时，记录到日志：

```json
{"ts":"...","skill":"verify","event":"tests_pass","skip_review":true,"reason":"user_confirmed","complexity":"中等"}
{"ts":"...","skill":"verify","event":"tests_pass","forced":true,"warning":"complex_change_bypassed"}
```

---

## 跨会话支持

日志文件持久化，支持跨 Claude 会话检查。

**有效期**：
- 检查最近 24 小时的日志
- 超过 24 小时的日志视为过期，需要重新运行

**示例**：
```bash
# 检查 review 是否在 24 小时内完成
RECENT_REVIEW=$(jq -r 'select(.event=="completed" and .change=="add-auth") | .ts' .claude/state/review-log.jsonl | tail -1)

if [ -n "$RECENT_REVIEW" ]; then
  NOW=$(date -u +%s)
  REVIEW_TIME=$(date -d "$RECENT_REVIEW" +%s)
  DIFF=$((NOW - REVIEW_TIME))
  
  if [ $DIFF -lt 86400 ]; then
    echo "✅ review 已通过（$((DIFF/3600)) 小时前）"
  else
    echo "⚠️ review 已过期（24 小时前），建议重新运行"
  fi
fi
```

---

## Git 忽略

所有 `*.jsonl` 文件已添加到 `.gitignore`：

```
# .claude/state/.gitignore
*.jsonl
```

日志仅用于本地会话，不提交到版本控制。

---

## 维护

**清理旧日志**：
```bash
# 删除 7 天前的日志
find .claude/state -name "*.jsonl" -mtime +7 -delete
```

**查询示例**：
```bash
# 查看所有已完成的变更
jq -r 'select(.event=="completed") | .change' .claude/state/*.jsonl | sort -u

# 查看特定变更的完整流程
jq 'select(.change=="add-auth")' .claude/state/*.jsonl
```
