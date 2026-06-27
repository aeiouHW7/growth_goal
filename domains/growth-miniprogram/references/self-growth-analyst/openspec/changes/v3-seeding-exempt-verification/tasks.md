## Task 1: P1 - 更新 scoring_engine.md（豁免声明）

**文件**: `core/scoring_engine.md`

**操作**: 在"备选证据来源优先级"章节最开头加豁免声明：

```markdown
> ⚠️ **铁律豁免声明**：以下备选证据规则仅在baseline首次激活（所有维度current_score==0）时生效，是"2条证据"铁律的一次性豁免。一旦baseline脱离全0状态，立即回到主证据规则。
```

**验证**: 包含"铁律豁免声明"，在备选证据章节第一行

---

## Task 2: P1 - 更新 SKILL.md（写入验证）

**文件**: `SKILL.md`

**操作**: 在Step 4末尾（4.2之后）增加：

```markdown
### 4.3 写入验证

写入完成后，立即检查 daily_raw/YYYY-MM-DD.md 是否存在且包含新内容。

- 如果存在且有新内容 → 继续后续步骤
- 如果不存在或为空 → 重试写入一次
- 如果重试仍失败 → 输出 [ARCHIVIST_FAIL] 信号到当前对话，不静默跳过
```

**验证**: 包含"4.3 写入验证"和"[ARCHIVIST_FAIL]"

---

## Task 3: P2 - 更新 bootstrap_system.md（聚合算法）

**文件**: `scripts/bootstrap_system.md`

**操作**: 在Step 3.1逆向重建流程中增加伪代码和示例：

```markdown
#### 聚合算法（伪代码）
```
date_map = {}
for dimension, date_list in retrieval_index.dimensions.items():
    for date in date_list:
        if date not in date_map:
            date_map[date] = []
        date_map[date].append(dimension)
for date, dims in date_map.items():
    filename = f"daily_raw/2026-{date}.md"
    生成骨架文件
```

**示例**:
- execution: ["04-12","04-14","04-15"]
- communication: ["04-19","04-24"]
→ 生成5个骨架文件
```

**验证**: 包含"聚合算法"、"伪代码"、date_map示例

---

## Task 4: E2E 测试

检查3个文件修改是否正确落地。

**验证**: 3/3 通过

---

## 执行顺序
Task 1 → Task 2 → Task 3 → Task 4