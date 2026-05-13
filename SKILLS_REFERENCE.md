# Skills 速查表

**12 个 Skills** | 3 个项目管理 + 9 个开发工作流

---

## 项目管理 Skills（根目录使用）

| Skill | 触发 | 作用 | 输出 |
|-------|------|------|------|
| **ace-init-env** | "初始化环境" | 部署环境：检查/安装 Node/Docker/Git | 环境报告 |
| **ace-create-project** | "创建项目 X" | 生成完整项目结构 | domains/X/ |
| **ace-doctor** | "检查系统健康" | 环境诊断 | 问题报告 |

**说明**：
- **"初始化环境"** = 部署环境（用户主动触发）
- **AI 启动** = 自动加载规则和配置（每次会话开始）

---

## 开发工作流 Skills（子项目使用）

### 核心流程（6 个必需）

| # | Skill | 触发 | 作用 | 输出 | 前置 |
|---|-------|------|------|------|------|
| 1 | **explore** | "探索需求" | 苏格拉底式对话，澄清需求 | 需求理解 | - |
| 2 | **propose** | "创建提案" | 生成 artifacts + 复杂度评估 | proposal/design/specs/tasks | explore ✓ |
| 3 | **apply** | "实现变更" | 执行 tasks，更新代码 | 功能代码 | tasks ready |
| 4 | **review** | "review" | 检查规范 + 自动修复 | 修复报告 | apply 完成 |
| 5 | **verify** | "verify" | 运行测试 | 测试报告 | review ✓ (复杂度) |
| 6 | **archive** | "归档" | 归档 + 沉淀到 10_DOCS/ | 知识文档 | verify ✓ (复杂度) |

**流程**：explore → propose → apply → review → verify → archive

---

### 增强 Skills（3 个可选）

| Skill | 触发 | 使用场景 | 输出 | 何时用 |
|-------|------|---------|------|--------|
| **plan** | "规划 XX" | 复杂需求拆分、工作量评估 | 90_PLANNING/ | propose 前，需求复杂 |
| **investigate** | "调查 XX" | 故障排查、性能分析 | 诊断报告 | 任意时刻，功能异常 |
| **retro** | "复盘 XX" | 提取经验、沉淀最佳实践 | 10_DOCS/patterns/ | archive 后，复杂变更 |

---

## 复杂度分类（propose 自动评估）

| 复杂度 | 判断条件 | 必需流程 | 可跳过 |
|--------|---------|---------|--------|
| **简单** | 文档、typo、CSS | propose → apply → archive | review, verify |
| **中等** | 单文件功能、UI 组件 | propose → apply → review → archive | verify |
| **复杂** | 多文件、架构、数据库 | 完整流程（6 步） | 不可跳过 |

---

## 快速决策树

```
需求不清晰？ → plan（拆分）或 explore（澄清）
需求清晰？   → propose（创建提案）
功能完成？   → apply → review → verify → archive
功能异常？   → investigate（诊断）→ propose（修复）
变更完成？   → retro（复盘，可选）
```

---

## 状态日志

所有操作记录到：`.claude/state/*.jsonl`

```bash
# 查看变更历史
jq -r 'select(.event=="completed") | .change' .claude/state/*.jsonl | sort -u

# 查看特定变更流程
jq 'select(.change=="user-login")' .claude/state/*.jsonl
```

---

## 前置检查

每个 Skill 自动验证前置步骤：

- **apply**：检查 tasks artifact 是否 ready
- **review**：检查 apply 功能任务是否完成
- **verify**：检查 review 是否通过（复杂度感知）
- **archive**：检查 verify 是否通过（复杂度感知）

**跳过机制**：
- 简单/中等变更：允许跳过（有警告）
- 复杂变更：阻止跳过（除非"强制运行"）

---

## 示例

### 标准流程（中等复杂度）

```
1. "探索健康检查功能" → explore
2. "创建提案"          → propose（评估：简单）
3. "实现功能"          → apply（11 个任务完成）
4. "review"            → review（自动修复单例）
5. "归档"              → archive（沉淀到 10_DOCS/）
```

### 复杂需求（含规划）

```
1. "规划用户积分系统" → plan（拆分为 3 个 propose）
2. "创建提案 add-points-core" → propose
3. "实现功能"         → apply
4. "review"           → review
5. "verify"           → verify（必需，复杂变更）
6. "归档"             → archive
7. "复盘"             → retro（沉淀最佳实践）
```

### 故障排查

```
1. "API 返回 500，调查" → investigate（定位根因）
2. "创建修复提案"      → propose（修复方案）
3. "实现修复"          → apply
4. "verify"            → verify（确保修复）
5. "归档"              → archive
```

---

**快速参考**：打开此文件即可查看所有 Skills 的触发方式和使用场景。

**详细文档**：
- [README.md](README.md) - 完整开发工作流
- [AGENTS.md](AGENTS.md) - 流程守卫详解
- [QUICKSTART.md](QUICKSTART.md) - 详细示例
