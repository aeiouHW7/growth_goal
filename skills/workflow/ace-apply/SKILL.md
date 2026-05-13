---
name: ace-apply
description: ACE Engine 增强版 apply - 实现 tasks.md 中的任务，自动触发 review/verify。Use when user wants to implement, apply, or execute tasks.
license: MIT
compatibility: Requires openspec CLI, ACE Engine project structure
metadata:
  author: ACE Engine
  version: "1.0"
  extends: openspec-apply-change
---

# ace-apply - 实现变更任务

执行 tasks.md 中的任务，完成后自动建议 review 和 verify。

**ACE 增强**：
- ✅ 前置检查：proposal 是否完成
- ✅ ACE 特定任务识别（10_DOCS/、domain.yaml、../../rules/）
- ✅ 自动建议 review（功能完成后）
- ✅ 自动建议 verify（review 通过后）

---

## 前置检查 ⭐

**必需**：proposal artifacts 必须完成

```bash
openspec status --change "<name>" --json | jq '.artifacts[] | select(.id=="tasks") | .status'
```

如果不是 "done"：
```
❌ 前置步骤未完成
proposal、design、specs、tasks 必须先创建

💡 运行: ace-propose
```

**用户跳过机制**：
- 如果用户明确说"跳过 propose 直接实现"或"强制运行 apply"
- 警告：`⚠️ 跳过 propose 可能导致需求不明确、实现方向错误`
- 严重警告：`建议至少有 tasks.md 描述要做什么`
- 询问：`确定要跳过 propose 吗？这会增加返工风险 (y/n)`
- 如果用户确认：
  - 记录到 apply-log.jsonl：`{"skip_propose":true,"reason":"user_forced","warning":"no_artifacts"}`
  - 要求用户提供任务列表（口头描述或临时文件）
  - 继续执行

检查通过后继续。

---

## 执行流程

### 1. 前置：读取 ACE 上下文

读取复杂度和项目规范：
```bash
# 读取复杂度
grep "**复杂度**:" openspec/changes/*/proposal.md

# 读取编码规范
cat domain.yaml | yq '.coding_standards'

# 检查 rules
ls ../../rules/*.md
```

### 2. 委托官方 openspec-apply-change 实现任务

触发官方 apply Skill 执行 tasks.md 中的任务。

AI 会自动识别这是 apply 请求，调用 `/opsx:apply <name>` 或等效 Skill。

**官方 Skill 会处理**：
- 选择变更
- 读取 contextFiles（proposal、design、specs、tasks）
- 循环实现每个任务
- 更新 tasks.md checkbox

### 3. 监控任务执行：ACE 特定处理

在官方 Skill 执行过程中，识别 ACE 特定任务并额外处理：

**10_DOCS/ 任务**：
```bash
# 检测到任务涉及 10_DOCS/
mkdir -p 10_DOCS/api
# 创建/更新文档
```

**domain.yaml 任务**：
```bash
# 修改后验证语法
cat domain.yaml | yq '.' > /dev/null
```

**../../rules/ 任务**：
```bash
# 读取规范并确保符合
cat ../../rules/api-design.md
```

### 4. 后置：功能完成检查

检查是否所有功能任务（非测试任务）已完成：

```bash
# 排除测试相关任务
grep "^- \[ \]" tasks.md | grep -v "测试\|review\|verify"
```

如果功能任务全部完成：
```
✅ 功能任务已完成（7/10 总任务）

💡 下一步: 运行 review 检查代码质量
   说 "review" 或 "代码审查"
```

### 5. 后置：review 通过后建议 verify

如果 review 已运行且通过（检查 `.claude/state/review-log.jsonl`）：
```
✅ review 已通过

💡 下一步: 运行 verify 执行测试
   说 "verify" 或 "运行测试"
```

### 6. 记录状态

```json
{"ts":"...","skill":"ace-apply","event":"task_completed","change":"add-auth","task_id":"3.1"}
{"ts":"...","skill":"ace-apply","event":"all_functional_done","change":"add-auth","total":10,"functional_done":7}
```

写入 `.claude/state/apply-log.jsonl`。

---

## 输出示例

### 实现中

```
## Implementing: add-user-auth (spec-driven)
Progress: 3/10 tasks complete

Working on task 4/10: 实现用户注册 API
✓ Task complete

Working on task 5/10: 添加密码加密
✓ Task complete
```

### 功能完成

```
## Implementation Progress
Progress: 7/10 tasks complete

✅ 功能任务已完成
⏳ 测试任务待运行

💡 下一步: review
```

### 全部完成

```
## Implementation Complete
Progress: 10/10 tasks complete ✓

✅ 所有任务完成（包括测试）
📌 下一步: ace-archive
```

---

## ACE 特定任务处理

### 10_DOCS 任务

```
任务: "更新 10_DOCS/api/auth.md"
  ↓
检测到 10_DOCS/ 路径
  ↓
自动: mkdir -p 10_DOCS/api
  ↓
创建/更新 auth.md
```

### domain.yaml 任务

```
任务: "添加 auth 配置到 domain.yaml"
  ↓
修改 domain.yaml
  ↓
验证: cat domain.yaml | yq '.' > /dev/null
  ↓
语法正确 → 继续
```

### rules 相关任务

```
任务: "遵循 ../../rules/api-design.md 创建 API"
  ↓
读取 rules/api-design.md
  ↓
按规范实现
  ↓
review 阶段会验证合规性
```

---

## 与官方 openspec-apply 关系

**继承**：委托官方 openspec-apply-change 执行所有任务实现  
**增强**：前置（检查 proposal）+ 监控（ACE 特定任务）+ 后置（自动建议 review/verify）

调用链：
```
用户: "实现"
  ↓
ace-apply 前置检查（tasks artifact 是否 ready）
  ↓
委托官方 openspec-apply-change（AI 自动调用 /opsx:apply）
  ↓
官方 Skill 循环实现任务（更新 checkbox）
  ↓
ace-apply 监控（识别 ACE 特定任务）
  ↓
ace-apply 后置（建议 review/verify）
```

---

## 护栏

- **不重复官方逻辑**：任务实现、checkbox 更新由 openspec-apply 处理
- **仅做增强**：ACE 特定任务额外处理 + 流程建议

- 保持增量：一次一个任务
- 任务不明确时暂停询问
- 发现设计问题时建议更新 artifacts（不强制）
- 不猜测：遇到错误立即报告
- 及时更新 tasks.md 的 checkbox

---

## 暂停场景

```
## Implementation Paused
Progress: 4/10 tasks complete

### Issue
Task 5 requires database migration script
Current design doesn't specify migration strategy

### Options
1. Update design.md with migration plan
2. Skip task 5 for now
3. Other approach

What would you like to do?
```
