---
name: review
description: 代码审查 - 检查代码质量、编码规范、潜在问题。Use when user wants to review code quality.
license: MIT
compatibility: Requires ACE Engine project structure
metadata:
  author: ACE Engine
  version: "1.0"
---

# review - 代码质量审查

检查代码质量、编码规范、潜在问题，自动修复简单问题。

---

## 前置检查 ⭐

**必需**：apply 功能任务必须完成

```bash
# 读取 tasks.md
grep "^- \[ \]" tasks.md | grep -v "测试\|review\|verify"
```

如果有未完成的功能任务：
```
❌ 前置步骤未完成
apply 功能任务尚未完成，剩余 X 个任务

💡 请先运行 ace-apply 完成功能实现
```

**用户跳过机制**：
- 如果用户明确说"跳过检查"或"强制运行 review"
- 警告：`⚠️ 跳过前置检查可能导致审查不完整`
- 记录到 review-log.jsonl：`{"skip_check":true,"reason":"user_forced"}`
- 继续执行

检查通过后继续。

---

## 执行流程

### 1. 加载项目规范

读取编码规范：

```bash
# 优先读取 domain.yaml 中的 coding_standards
cat domain.yaml | yq '.coding_standards'

# 备用：读取 ../../rules/ 目录下的规范文件
ls ../../rules/*.md 2>/dev/null
```

显示：
```
📐 编码规范:
- backend: TypeScript strict 模式
- frontend: 函数式组件 + Hooks
- api: 统一响应格式
```

### 2. 识别变更文件

```bash
# 从 tasks.md 中提取文件路径
grep -E "- \[x\]" tasks.md | grep -oE "[a-zA-Z0-9/_.-]+\.(ts|tsx|js|jsx|py|go)" | sort -u

# 或从 git diff 获取
git diff --name-only $(git merge-base HEAD main)
```

### 3. 分层审查

**层次 1: 语法和类型检查**
```bash
# TypeScript
npx tsc --noEmit

# Python
python -m py_compile *.py

# Go
go vet ./...
```

**层次 2: 编码规范**
- 检查命名（驼峰、常量大写）
- 检查注释（函数、复杂逻辑）
- 检查错误处理（try-catch、空值检查）

**层次 3: 代码质量**
- 检查重复代码
- 检查复杂度（函数长度、嵌套层级）
- 检查潜在 bug（未使用变量、条件恒为真）

### 4. 自动修复 ⭐

简单问题自动修复：
- 格式化（prettier、black、gofmt）
- 导入排序
- 未使用变量删除
- 简单命名修正

复杂问题标记：
```
⚠️ 需要手动修复
- src/api.ts:42 - 缺少错误处理
- src/utils.ts:15 - 函数复杂度过高（圈复杂度 12）
```

### 5. ACE 特定检查

**10_DOCS/ 一致性**：
- 如果代码修改了 API，检查 10_DOCS/api/ 是否更新
- 如果新增业务规则，检查 10_DOCS/business/ 是否记录

**domain.yaml 同步**：
- 如果新增环境变量，检查 domain.yaml 是否添加
- 如果修改数据库配置，检查 domain.yaml 是否同步

**../../rules/ 合规性**：
- 遍历 rules/*.md，检查代码是否符合每条规则
- 违规时给出规则引用和建议

### 6. 生成审查报告

```markdown
## Code Review Report

**变更**: <change-name>
**文件数**: 5
**问题数**: 3 个（2 个已修复，1 个需手动处理）

### 自动修复
✅ 格式化 3 个文件
✅ 删除 2 个未使用变量
✅ 修正 1 个命名（user_id → userId）

### 需要手动修复
⚠️ src/api.ts:42 - 缺少错误处理
   建议: 使用 try-catch 包裹数据库查询

### 合规性检查
✅ 符合 ../../rules/api-design.md
✅ 符合 ../../rules/code-quality.md

### 文档一致性
⚠️ API 变更未更新文档
   建议: 更新 10_DOCS/api/auth.md
```

### 7. 记录状态

```json
{"ts":"...","skill":"review","event":"completed","change":"add-auth","files":5,"auto_fixed":3,"manual_required":1}
```

写入 `.claude/state/review-log.jsonl`。

### 8. 建议下一步

如果 review 通过（无需手动修复或仅有 warning）：
```
✅ review 通过

💡 下一步: 运行 verify 执行测试
   说 "verify" 或 "运行测试"
```

如果有必须修复的问题：
```
⚠️ review 发现 X 个问题需要手动修复

请修复后重新运行 review
```

---

## 输出示例

### 审查通过
```
## Code Review: add-user-auth

📐 编码规范: 3 条（从 domain.yaml）
📂 变更文件: 5 个

✅ 语法检查通过
✅ 自动修复: 格式化 3 个文件
✅ 编码规范通过
✅ 文档一致性通过

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ review 通过
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 下一步: verify
```

### 发现问题
```
## Code Review: add-user-auth

📐 编码规范: 3 条
📂 变更文件: 5 个

✅ 自动修复: 3 个问题
⚠️ 需要手动修复: 2 个问题

### 问题详情
1. src/api.ts:42 - 缺少错误处理
   违反: ../../rules/api-design.md#错误处理
   建议: 使用 try-catch 包裹查询

2. 10_DOCS/api/auth.md - 文档未更新
   建议: 添加新增的 POST /auth/refresh 接口

请修复后重新运行 review
```

---

## 护栏

- 优先自动修复（格式、命名）
- 复杂问题不猜测，标记为手动修复
- 检查 domain.yaml 规范（如果存在）
- 检查 ../../rules/ 合规性（如果存在）
- 检查 10_DOCS/ 一致性（如果存在）
- 记录所有操作到 review-log.jsonl
- 不阻塞用户：有 warning 也算通过，只有 error 才阻止

---

## 暂停场景

```
## Review Paused

### Issue
发现潜在架构问题：当前实现使用同步 I/O

### Options
1. 继续 review（忽略此问题）
2. 更新 design.md 重新设计
3. 其他方法

What would you like to do?
```
