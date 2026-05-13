---
name: verify
description: 构建验证 - 运行测试、检查构建、验证功能。Use when user wants to run tests or verify changes.
license: MIT
compatibility: Requires ACE Engine project structure
metadata:
  author: ACE Engine
  version: "1.0"
---

# verify - 构建和测试验证

运行测试、检查构建、验证功能是否正常。

---

## 前置检查 ⭐

**复杂度感知检查**：

```bash
# 读取复杂度
grep "**复杂度**:" openspec/changes/*/proposal.md | tail -1
```

**复杂变更**：必须 review 通过
```bash
# 检查 review-log.jsonl
tail -1 .claude/state/review-log.jsonl | jq -e '.event == "completed"'
```

如果 review 未通过：
```
❌ 前置步骤未完成
复杂变更必须先通过 review

💡 请先运行 review 检查代码质量
```

**简单/中等变更**：review 可选，但建议运行
```
💡 未运行 review，建议先运行以保证代码质量
继续 verify 吗？(y/n)
```

**用户跳过机制**：
- **简单/中等变更**：如果用户明确说"跳过 review"或"强制运行 verify"
  - 警告：`⚠️ 跳过 review 可能遗漏代码问题`
  - 记录到 verify-log.jsonl：`{"skip_review":true,"reason":"user_confirmed"}`
  - 允许继续
  
- **复杂变更**：如果用户说"跳过 review"
  - 阻止：`❌ 复杂变更不允许跳过 review，必须完整流程`
  - 建议：`如需强制运行，明确说 "强制运行 verify"`
  - 如果用户说"强制运行"：
    - 严重警告：`⚠️⚠️ 强制跳过检查，可能导致严重问题`
    - 记录到 verify-log.jsonl：`{"forced":true,"skip_review":true,"warning":"complex_change_bypassed"}`
    - 允许继续（用户承担风险）

---

## 执行流程

### 1. 读取测试配置

```bash
# 从 domain.yaml 读取测试要求
cat domain.yaml | yq '.testing'
```

显示：
```
🧪 测试要求:
- 单元测试覆盖率: 80%
- E2E 测试: 必需
- 测试框架: vitest
```

### 2. 运行构建检查

```bash
# Node.js 项目
npm run build

# Go 项目
go build ./...

# Python 项目
python -m build
```

### 3. 运行测试（分层）

**层次 1: 单元测试**
```bash
# 从 domain.yaml 读取测试命令（如果配置存在）
if [ -f "domain.yaml" ]; then
  TEST_CMD=$(cat domain.yaml | yq '.testing.test_commands.unit' 2>/dev/null)
  if [ -n "$TEST_CMD" ] && [ "$TEST_CMD" != "null" ]; then
    eval "$TEST_CMD"
  else
    echo "⚠️ domain.yaml 未配置单元测试命令，请根据技术栈手动执行"
  fi
else
  echo "⚠️ domain.yaml 不存在，请根据技术栈手动执行单元测试"
fi

# 或根据项目技术栈手动执行：
# Node.js: npm test -- --coverage
# Go: go test ./... -cover
# Python: pytest --cov
```

**层次 2: 集成测试**
```bash
# 从 domain.yaml 读取
if [ -f "domain.yaml" ]; then
  INTEGRATION_CMD=$(cat domain.yaml | yq '.testing.test_commands.integration' 2>/dev/null)
  if [ -n "$INTEGRATION_CMD" ] && [ "$INTEGRATION_CMD" != "null" ]; then
    eval "$INTEGRATION_CMD"
  fi
fi

# 或手动：npm run test:integration / go test -tags=integration
```

**层次 3: E2E 测试**
```bash
# 从 domain.yaml 读取
if [ -f "domain.yaml" ]; then
  E2E_CMD=$(cat domain.yaml | yq '.testing.test_commands.e2e' 2>/dev/null)
  if [ -n "$E2E_CMD" ] && [ "$E2E_CMD" != "null" ]; then
    eval "$E2E_CMD"
  fi
fi

# 或手动：npm run test:e2e / pytest tests/e2e
```

### 4. 检查测试覆盖率

```bash
# 读取覆盖率报告
cat coverage/coverage-summary.json | jq '.total.lines.pct'
```

与 domain.yaml 的要求对比：
```
📊 测试覆盖率: 82% (要求 ≥ 80%) ✅
```

### 5. ACE 特定验证

**start.sh 集成测试**：
```bash
# 检查 start.sh 是否存在
if [ -f "start.sh" ]; then
  echo "   运行集成测试（start.sh 环境）..."
  ./start.sh --test-mode
  npm run test:integration
  # 清理
  pkill -f 'vite|tsx'
fi
```

**10_DOCS/ 示例验证**：
- 如果 10_DOCS/ 包含代码示例，验证它们是否可执行
- 如果包含 API 示例，验证响应格式是否正确

### 6. 失败处理

如果测试失败：
```
❌ 测试失败

### 失败详情
- src/api.test.ts:42 - Assertion failed
  Expected: 200
  Actual: 500

### 失败日志
[完整错误堆栈]

请修复后重新运行 verify
```

### 7. 生成验证报告

```markdown
## Verify Report

**变更**: <change-name>
**构建**: ✅ 通过
**测试**: ✅ 15/15 通过
**覆盖率**: 82% (要求 80%)

### 测试详情
✅ 单元测试: 12/12 通过
✅ 集成测试: 2/2 通过
✅ E2E 测试: 1/1 通过

### 性能
- 单元测试: 1.2s
- 集成测试: 3.5s
- E2E 测试: 8.7s
```

### 8. 记录状态

```json
{"ts":"...","skill":"verify","event":"tests_pass","change":"add-auth","total":15,"passed":15,"coverage":82}
```

写入 `.claude/state/verify-log.jsonl`。

### 9. 建议下一步

如果 verify 通过：
```
✅ verify 通过（构建 + 测试）

💡 下一步: 运行 ace-archive 归档变更
   说 "archive" 或 "归档"
```

如果失败：
```
❌ verify 失败

请修复测试后重新运行 verify
```

---

## 输出示例

### 验证通过
```
## Verify: add-user-auth

🧪 测试配置: vitest, 覆盖率 ≥ 80%

✅ 构建通过
✅ 单元测试: 12/12 (1.2s)
✅ 集成测试: 2/2 (3.5s)
✅ E2E 测试: 1/1 (8.7s)
✅ 覆盖率: 82% ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ verify 通过
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 下一步: ace-archive
```

### 验证失败
```
## Verify: add-user-auth

✅ 构建通过
❌ 测试失败: 14/15

### 失败测试
❌ src/auth.test.ts:42
   Expected status 200, got 500
   
   错误: Database connection refused
   
   可能原因:
   1. 数据库未启动（运行 ./start.sh）
   2. 环境变量未设置
   3. 迁移未运行

请修复后重新运行 verify
```

---

## 复杂度感知示例

### 简单变更（文档）
```
💡 简单变更，可跳过 verify

该变更仅修改文档，无需测试
直接运行 ace-archive 吗？(y/n)
```

### 中等变更（单文件功能）
```
💡 未运行 review，建议先运行

继续 verify 吗？(y/n)
```

### 复杂变更（多文件 + 数据库）
```
✅ review 已通过，开始 verify

[运行完整测试套件]
```

---

## 护栏

- 分层运行测试（快速失败）
- 失败时显示详细日志
- 检查 domain.yaml 的测试要求
- 检查 start.sh 是否存在并集成测试
- 记录所有操作到 verify-log.jsonl
- 复杂度感知：简单变更可跳过，复杂变更必须完整测试
- 提供清晰的失败原因和修复建议

---

## 暂停场景

```
## Verify Paused

### Issue
E2E 测试需要外部服务（Stripe API）
测试环境未配置

### Options
1. 跳过 E2E 测试（仅运行单元测试）
2. 配置测试环境后重新运行
3. 使用 mock 替代外部服务

What would you like to do?
```
