# ACE Engine Skills 架构

**变更**: ace-engine-skills-adaptation  
**日期**: 2026-05-12

## 概述

ACE Engine 的 workflow Skills 系统，提供端到端的 AI 辅助开发流程，从需求探索到变更归档。

## 核心 Skills（6个）

### 1. ace-explore（官方）
- **功能**: 苏格拉底式需求探索
- **触发**: "探索需求"、"澄清问题"
- **特点**: 开放式对话，无固定流程

### 2. ace-propose（ACE 增强）
- **功能**: 创建变更提案
- **输出**: proposal、design、specs、tasks
- **ACE 增强**:
  - 自动评估复杂度（简单/中等/复杂）
  - 加载项目上下文（domain.yaml、10_DOCS、rules）
  - 添加测试准备任务
  - 建议使用 dialectical-thinking

### 3. ace-apply（ACE 增强）
- **功能**: 实现 tasks.md 中的任务
- **前置检查**: tasks artifact 必须 ready
- **ACE 增强**:
  - 识别 ACE 特定任务（10_DOCS/、domain.yaml）
  - 自动建议 review（功能完成后）
  - 自动建议 verify（review 通过后）

### 4. review（ACE 独有）
- **功能**: 代码质量审查
- **前置检查**: apply 功能任务必须完成
- **特点**:
  - 读取 domain.yaml 的 coding_standards
  - 自动修复简单问题
  - 检查 10_DOCS/ 一致性

### 5. verify（ACE 独有）
- **功能**: 构建和测试验证
- **前置检查**: review 通过（复杂度感知）
- **特点**:
  - 读取 domain.yaml 的 testing 配置
  - 复杂变更必须测试，简单变更可跳过
  - 集成 start.sh 测试环境

### 6. ace-archive（ACE 增强）
- **功能**: 归档变更
- **前置检查**: verify 通过（复杂度感知）
- **ACE 增强**:
  - 自动沉淀知识到 10_DOCS/
  - 生成变更摘要
  - 清理建议

## 流程守卫机制

### 复杂度分类

**简单**（文档、typo、配置）:
```
propose → apply → archive
```

**中等**（单文件功能、UI 组件）:
```
propose → apply → review → archive
```

**复杂**（多文件、架构、数据库）:
```
propose → apply → review → verify → archive（不可跳过）
```

### 前置检查

每个 Skill 在执行前验证前置步骤：

| Skill | 前置要求 | 复杂度感知 |
|-------|---------|-----------|
| ace-propose | explore 完成（可选） | ❌ |
| ace-apply | tasks artifact ready | ❌ |
| review | apply 功能任务完成 | ❌ |
| verify | review 通过 | ✅ 简单/中等可跳过 |
| ace-archive | verify 通过 | ✅ 简单可跳过 review+verify |

### 用户跳过机制

**简单/中等变更**:
- 允许跳过可选步骤
- 显示警告
- 询问确认

**复杂变更**:
- 阻止跳过必需步骤
- 显示错误提示
- 允许"强制运行"（严重警告）

## 薄封装设计

### 架构模式

```
ACE Skill 前置增强
  ├─ 读取 domain.yaml
  ├─ 读取 10_DOCS/
  ├─ 读取 ../../rules/
  └─ 评估复杂度（仅 propose）
      ↓
委托官方 Skill（核心逻辑）
  └─ AI 自动调用 /opsx:xxx
      ↓
ACE Skill 后置增强
  ├─ 注入 ACE 上下文
  ├─ 自动建议下一步
  └─ 记录状态日志
```

### 与官方 Skills 关系

| 官方 Skill | ACE Skill | 关系 |
|-----------|----------|------|
| openspec-explore | ace-explore | 直接使用 |
| openspec-propose | ace-propose | 薄封装 |
| openspec-apply-change | ace-apply | 薄封装 |
| ❌ 无 | review | 独立创建 |
| ❌ 无 | verify | 独立创建 |
| openspec-archive-change | ace-archive | 薄封装 |

**优势**:
- 自动享受官方更新
- 维护成本低（~200 行 vs ~1000 行）
- 保持定制能力

## 状态日志系统

### 目录结构

```
.claude/state/
├── propose-log.jsonl
├── apply-log.jsonl
├── review-log.jsonl
├── verify-log.jsonl
└── archive-log.jsonl
```

### 日志格式（JSONL）

```json
{"ts":"2026-05-12T09:00:00Z","skill":"review","event":"completed","change":"test","files":2,"auto_fixed":1}
```

### 用途

- **前置检查**: 验证前置步骤是否完成
- **跨会话**: 支持断点续传（24小时有效期）
- **审计追踪**: 记录所有操作
- **数据分析**: 优化流程

## domain.yaml 扩展

### 新增字段

```yaml
coding_standards:
  backend:
    - "使用 TypeScript strict 模式"
    - "所有 API 必须有错误处理"
  frontend:
    - "函数式组件 + Hooks"
  api:
    - "统一响应格式: { success, data, error }"

testing:
  unit_test_coverage: 80
  e2e_test_required: false
  test_framework: vitest
  test_commands:
    unit: "npm run test"
```

### 使用方式

**review Skill**:
```bash
cat domain.yaml | yq '.coding_standards'
```

**verify Skill**:
```bash
cat domain.yaml | yq '.testing'
npm run $(yq '.testing.test_commands.unit' domain.yaml)
```

## 实际使用示例

见 [QUICKSTART.md](../../../QUICKSTART.md#-skills-使用示例)

## 技术细节

### 路径适配

| ai-drive-engine | ACE Engine |
|----------------|------------|
| `{agent}/10_DOCS/` | `10_DOCS/` |
| `openspec/config.yaml` | `domain.yaml` |
| `{agent}/.ai-state/` | `.claude/state/` |

### 文件行数

| Skill | 行数 |
|-------|-----|
| ace-propose | 183 |
| ace-apply | 263 |
| review | 246 |
| verify | 289 |
| ace-archive | 266 |

## 维护建议

1. 监控官方 openspec 更新
2. 收集用户反馈优化流程守卫
3. 扩展 domain.yaml 支持更多配置
4. 定期清理 .claude/state/ 日志（>7天）

## 参考文档

- [AGENTS.md](../../../AGENTS.md) - Skills 完整列表
- [README.md](../../../README.md) - 工作流总览
- [docs/SKILLS_ADAPTATION.md](../../../docs/SKILLS_ADAPTATION.md) - 实施记录
