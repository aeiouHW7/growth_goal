---
name: ace-propose
description: ACE Engine 增强版 propose - 创建变更提案，自动评估复杂度，加载项目上下文。Use when user wants to create a proposal or start a new change.
license: MIT
compatibility: Requires openspec CLI, ACE Engine project structure
metadata:
  author: ACE Engine
  version: "1.0"
  extends: openspec-propose
---

# ace-propose - 创建变更提案

创建提案并生成 artifacts（proposal、design、specs、tasks）。

**ACE 增强**：
- ✅ 自动评估变更复杂度（简单/中等/复杂）
- ✅ 加载项目上下文（domain.yaml、10_DOCS、../../rules/）
- ✅ 添加测试准备任务
- ✅ 建议使用 dialectical-thinking

---

## 前置检查

可选：询问用户是否已完成 explore。

如用户明确说"跳过 explore"或"直接 propose"：
```
⚠️ 跳过 explore 可能导致需求理解不充分

建议：至少浏览相关代码和文档
继续 propose 吗？(y/n)
```

如果用户确认，记录到 propose-log.jsonl：`{"skip_explore":true}`，继续执行。

**强制运行**：用户说"强制 propose"时，直接跳过 explore 检查。

---

## 执行流程

### 1. 加载 ACE 上下文

读取并显示项目信息：

```bash
# 读取配置
cat domain.yaml | grep "name:\|type:"

# 列出文档（如果存在）
DOCS_COUNT=0
if [ -d "10_DOCS" ]; then
  DOCS_COUNT=$(find 10_DOCS -type f -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
fi
if [ "$DOCS_COUNT" -eq 0 ]; then
  echo "0 (项目暂无知识库，建议后续运行 docs-extractor)"
else
  echo "$DOCS_COUNT"
fi

# 检查规则
ls ../../rules/
```

显示：
```
📚 项目: todo-app, 技术栈: PostgreSQL
📖 业务文档: 5 个
📐 规范: ../../rules/code-quality.md
```

### 2. 评估复杂度 ⭐

根据用户描述自动评估：

**简单**：文档、typo、配置、CSS  
**中等**：单文件功能、UI 组件  
**复杂**：多文件、架构、数据库、认证

询问确认：
```
🤔 评估为 "中等" 复杂度
判断：单文件功能，无架构变更
准确吗？(y/简单/复杂)
```

在 proposal.md 添加：
```markdown
## 变更分类
**复杂度**: 中等
**流程要求**: propose → apply → review → archive
```

### 3. 委托官方 openspec-propose 创建 artifacts

触发官方 propose Skill 创建 proposal、design、specs、tasks。

AI 会自动识别这是 propose 请求，调用 `/opsx:propose <name>` 或等效 Skill。

**等待官方 Skill 完成**，然后继续后置增强。

### 4. 后置增强：注入 ACE 上下文

在官方生成的 artifacts 基础上追加：

**proposal.md**：
```markdown
## 变更分类
**复杂度**: <简单/中等/复杂>
**流程要求**: <根据复杂度决定>

## ACE 上下文
- 技术栈: <从 domain.yaml 读取>
- 相关文档: <从 10_DOCS/ 列出>
- 编码规范: <从 ../../rules/ 列出>
```

**design.md**：
- 在 Context 部分引用 10_DOCS/ 相关文档
- 在 Constraints 部分引用 ../../rules/ 规范

**tasks.md**：
- 在末尾追加测试准备任务（根据复杂度）

### 5. 辩证思考集成

检测技术选型时建议：
```
💡 检测到选型: [Redis vs 内存缓存]
要用 dialectical-thinking 对比吗？(y/n)
```

如用户同意，调用 dialectical-thinking 并将结果写入 design.md。

### 7. 记录状态

```json
{"ts":"...","skill":"ace-propose","event":"completed","change":"add-auth","complexity":"复杂","artifacts":4}
```

写入 `.claude/state/propose-log.jsonl`。

---

## 输出示例

```
📚 加载上下文: todo-app (PostgreSQL), 文档 5 个
🤔 复杂度: 复杂（数据库+多文件）
✅ 创建提案: add-user-auth

💡 检测到技术选型，已调用 dialectical-thinking
📝 artifacts: proposal ✓ design ✓ specs ✓ tasks ✓
✅ 自动添加测试任务

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 提案完成
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📂 openspec/changes/add-user-auth/
📊 复杂度: 复杂（必须完整流程）
📌 下一步: ace-apply
```

---

## 与官方 openspec-propose 关系

**继承**：委托官方 openspec-propose 创建所有 artifacts  
**增强**：前置（上下文+复杂度评估）+ 后置（ACE 特定内容注入）

调用链：
```
用户: "创建提案..."
  ↓
ace-propose 前置（上下文+复杂度）
  ↓
委托官方 openspec-propose（AI 自动调用 /opsx:propose）
  ↓
等待官方 Skill 完成
  ↓
ace-propose 后置（注入复杂度、测试任务、ACE 上下文）
```

---

## 护栏

- **不重复官方逻辑**：artifact 创建完全由 openspec-propose 处理
- **仅做增强**：在官方生成的文件基础上追加 ACE 特定内容
- 复杂度不确定时，询问用户
- 不强制 explore（可跳过但提示）
- 规范检查失败时建议，不自动修改
- 记录所有操作到状态日志

---

## 场景示例

**简单**：修复 typo → propose → apply → archive  
**中等**：添加组件 → propose → apply → review → archive  
**复杂**：添加认证 → propose → apply → review → verify → archive（不可跳过）
