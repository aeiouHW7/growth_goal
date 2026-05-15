---
name: ace-archive
description: ACE Engine 增强版 archive - 归档变更，自动沉淀知识到 10_DOCS/。Use when user wants to archive or finalize a change.
license: MIT
compatibility: Requires openspec CLI, ACE Engine project structure
metadata:
  author: ACE Engine
  version: "1.0"
  extends: openspec-archive
---

# ace-archive - 归档变更

归档已完成的变更，自动将知识沉淀到 10_DOCS/。

**ACE 增强**：
- ✅ 前置检查：verify 是否通过（复杂度感知）
- ✅ 自动沉淀知识到 10_DOCS/
- ✅ 生成变更摘要

---

## 前置检查 ⭐

**复杂度感知检查**：

```bash
# 读取复杂度
grep "**复杂度**:" openspec/changes/*/proposal.md | tail -1
```

**复杂变更**：必须 verify 通过
```bash
tail -1 .claude/state/verify-log.jsonl | jq -e '.event == "tests_pass"'
```

如果 verify 未通过：
```
❌ 前置步骤未完成
复杂变更必须先通过 verify

💡 请先运行 verify 执行测试
```

**中等变更**：verify 或 review 至少一个通过
```bash
# 检查两个日志
tail -1 .claude/state/review-log.jsonl | jq -e '.event == "completed"'
tail -1 .claude/state/verify-log.jsonl | jq -e '.event == "tests_pass"'
```

**简单变更**：apply 完成即可
```bash
openspec status --change "<name>" --json | jq '.artifacts[] | select(.id=="tasks") | .status'
```

**用户跳过机制**：
- **简单变更**：允许直接 archive（无需 review/verify）
  
- **中等变更**：
  - 如果用户明确说"跳过 verify 直接归档"
  - 检查是否至少运行过 review
  - 如果都没运行，警告：`⚠️ 建议至少运行 review 或 verify`
  - 询问确认后允许继续
  
- **复杂变更**：
  - 如果用户说"跳过 verify"
  - 阻止：`❌ 复杂变更必须完成完整流程（review + verify）`
  - 如果用户说"强制归档"：
    - 严重警告：`⚠️⚠️ 强制归档未测试的复杂变更，风险极高`
    - 记录到 archive-log.jsonl：`{"forced":true,"skip_verify":true,"warning":"complex_change_untested"}`
    - 允许继续（用户承担风险）

---

## 执行流程

### 1. 前置：知识沉淀到 10_DOCS/ ⭐

在归档前，自动提取知识并沉淀到项目文档。

**目录检查**：
- 如果 `10_DOCS/` 不存在，询问用户："10_DOCS/ 目录不存在，是否创建并开始沉淀知识？(y/n)"
- 用户确认后创建目录，否则跳过知识沉淀步骤

**识别沉淀类型**（从 proposal.md 和 design.md 关键词）：
- 提到 "API" → 10_DOCS/api/
- 提到 "业务规则" → 10_DOCS/business/
- 提到 "架构" → 10_DOCS/architecture/
- 提到 "数据库" → 10_DOCS/database/
- 其他 → 10_DOCS/features/

**沉淀内容**（从 artifacts 提取）：
```markdown
# <功能名称>

**变更**: <change-name>
**日期**: <date>

## 概述
[从 proposal.md 提取]

## 实现要点
[从 design.md 提取]

## API/业务规则/架构决策
[从 specs/*.md 提取]

## 注意事项
[从 review-log/verify-log 提取问题和修复]
```

### 2. 委托官方 openspec-archive 归档变更

触发官方 archive Skill 将变更移动到 archive/。

AI 会自动识别这是 archive 请求，调用 `/opsx:archive <name>` 或等效命令。

**官方 Skill 会处理**：
- 将 openspec/changes/<name>/ 移动到 openspec/archive/
- 更新索引
- 清理临时文件

### 3. 后置：生成变更摘要

```markdown
## 变更摘要: <change-name>

**复杂度**: 复杂
**完成日期**: 2026-05-12

### 实现统计
- 修改文件: 5 个
- 新增代码: 320 行
- 测试覆盖率: 82%

### 质量检查
✅ review: 3 个问题已修复
✅ verify: 15/15 测试通过

### 知识沉淀
📖 10_DOCS/api/user-auth.md
📖 10_DOCS/architecture/jwt-design.md
```

### 4. 后置：清理建议

```json
{"ts":"...","skill":"ace-archive","event":"completed","change":"add-auth","docs_created":2}
```

写入 `.claude/state/archive-log.jsonl`。

### 4. 后置：清理建议

```json
{"ts":"...","skill":"ace-archive","event":"completed","change":"add-auth","docs_created":2}
```

写入 `.claude/state/archive-log.jsonl`。

建议可选清理：

```
✅ 变更已归档

💡 可选清理:
1. 删除功能分支: git branch -d add-user-auth
2. 更新依赖: npm outdated
```

---

## 输出示例

### 归档成功
```
## Archiving: add-user-auth

📖 知识沉淀中...
✅ 创建 10_DOCS/api/user-auth.md
✅ 创建 10_DOCS/architecture/jwt-design.md

📦 归档变更...
✅ 移动到 openspec/archive/add-user-auth/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 变更已归档
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 变更摘要
- 修改文件: 5 个
- 新增代码: 320 行
- 测试覆盖率: 82%
- 知识沉淀: 2 个文档

💡 可选: 删除功能分支 git branch -d add-user-auth
```

### 跳过 verify（简单变更）
```
## Archiving: fix-typo

💡 简单变更，已跳过 verify

📦 归档变更...
✅ 移动到 openspec/archive/fix-typo/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 变更已归档
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 知识沉淀规则

### 自动识别类型

| 变更特征 | 沉淀目录 | 文件名 |
|---------|---------|--------|
| proposal.md 提到 "API" | 10_DOCS/api/ | <feature>.md |
| design.md 提到 "业务规则" | 10_DOCS/business/ | <feature>.md |
| design.md 提到 "架构" | 10_DOCS/architecture/ | <decision>.md |
| tasks.md 包含 "数据库" | 10_DOCS/database/ | <table>.md |
| 其他 | 10_DOCS/features/ | <feature>.md |

### 内容提取优先级

1. **从 specs/ 提取**（最详细）
2. **从 design.md 提取**（实现细节）
3. **从 proposal.md 提取**（概述）
4. **从 review-log.jsonl 提取**（注意事项）

---

## 与官方 openspec-archive 关系

**继承**：委托官方 openspec-archive 归档变更目录  
**增强**：前置（知识沉淀到 10_DOCS/）+ 后置（变更摘要 + 清理建议）

调用链：
```
用户: "归档"
  ↓
ace-archive 前置检查（复杂度感知）
  ↓
ace-archive 知识沉淀（提取 artifacts → 10_DOCS/）
  ↓
委托官方 openspec-archive（AI 自动调用）
  ↓
官方 Skill 归档变更目录
  ↓
ace-archive 后置（摘要 + 清理建议）
```

---

## 护栏

- **不重复官方逻辑**：变更目录归档由 openspec-archive 处理
- **仅做增强**：知识沉淀 + 流程完整性检查

- 复杂度感知：简单变更可跳过 verify，复杂变更必须完整流程
- 知识沉淀：自动识别类型，不强制（如果无法识别则跳过）
- 不删除代码：只归档 openspec/ 目录，不删除业务代码
- 不强制清理：给出建议，由用户决定
- 记录所有操作到 archive-log.jsonl

---

## 暂停场景

```
## Archive Paused

### Issue
检测到未提交的代码变更

### Options
1. 提交变更后归档
2. 忽略未提交变更，仅归档 openspec/
3. 取消归档

What would you like to do?
```

## Skill Stack

(No specific capability skills required — archive handles knowledge distillation directly.)
