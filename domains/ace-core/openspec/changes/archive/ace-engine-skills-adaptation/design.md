## Context

**当前状态**：
- ACE Engine 只有 4 个 system Skills（ace-init-env、ace-create-project、ace-doctor、dialectical-thinking）
- 缺少完整的开发工作流 Skills（explore、propose、apply、review、verify、archive 等）
- `.claude/skills/` 中有官方 openspec Skills（explore、propose、apply、archive），但它们是通用的，不感知 ACE Engine 的特性

**背景**：
- ai-drive-engine 项目已沉淀 12 个成熟的 workflow Skills
- 这些 Skills 使用 `{agent}/` 占位符模式（单 agent 架构）
- ACE Engine 使用 `domains/{project}/` 多项目架构

**约束**：
- 必须兼容官方 openspec CLI
- 必须保持与官方 Skills 的协同（不能完全替代）
- 必须遵循 ETHOS 中的"工具中立"原则

**涉众**：
- AI：需要清晰的 Skill 调用接口
- 用户：需要通过自然语言触发工作流
- 开发者：需要可维护、可扩展的 Skills 架构

## Goals / Non-Goals

### Goals

1. **完整工作流**：提供 explore → propose → apply → review → verify → archive 完整流程
2. **ACE 感知**：Skills 自动读取 10_DOCS、domain.yaml、rules/，利用 ACE Engine 特性
3. **路径适配**：将 ai-drive-engine 的 `{agent}/` 模式适配为 ACE Engine 的相对路径
4. **薄封装优先**：官方已有的 Skills（explore、propose、apply、archive）采用薄封装增强，享受官方更新
5. **知识沉淀**：所有 Skills 的执行结果自动沉淀到 10_DOCS 或 .claude/state/

### Non-Goals

1. **不替代官方 Skills**：不重新实现官方 openspec-* 的核心逻辑
2. **不绑定特定 IDE**：Skills 应该在任何支持 Claude Code 的环境中可用
3. **不引入新依赖**：仅依赖 openspec CLI 和 Node.js 标准库
4. **不支持 GitLab 集成**：ai-drive-engine 的 IssueManager 功能在 ACE Engine 中不需要

## Decisions

### Decision 1: 三层 Skills 架构

**选择**：
```
层次 1: 官方 Skills (.claude/skills/)
  ↓
层次 2: ACE 增强层 (skills/workflow/)
  ├─ 薄封装官方 Skills（ace-propose、ace-apply、ace-archive）
  └─ 适配独有 Skills（review、verify、plan、investigate、retro 等）
  ↓
层次 3: 项目级 Skills (domains/{project}/skills/) [未来扩展]
```

**理由**：
- ✅ 官方 Skills 提供基础能力，自动享受更新
- ✅ ACE 增强层注入项目特定逻辑（10_DOCS、domain.yaml、dialectical-thinking）
- ✅ 清晰的职责分层，易于维护

**替代方案**：完全重写所有 Skills
- ❌ 维护成本极高
- ❌ 与官方版本分叉

### Decision 2: 路径适配策略

**选择**：使用相对路径，移除 `{agent}` 占位符

**适配映射**：
| ai-drive-engine | ACE Engine | 实现 |
|----------------|------------|------|
| `{agent}/10_DOCS/` | `10_DOCS/` | 直接使用相对路径 |
| `openspec/config.yaml` | `domain.yaml` | 读取 domain.yaml 的 coding_standards 字段 |
| `{agent}/e2e-tests/` | `backend/tests/` | 修改硬编码路径 |
| `{agent}/.ai-state/` | `.claude/state/` | 使用全局状态目录 |
| `.engine/active-agent` | ❌ 删除 | 不需要 agent 切换逻辑 |

**理由**：
- ✅ Skills 在 `domains/{project}/` 内执行，相对路径自然正确
- ✅ 无需动态替换占位符，降低复杂度
- ✅ 符合 ACE Engine 的多项目架构

**替代方案**：保留 `{agent}` 占位符，运行时替换
- ❌ 增加复杂度
- ❌ 与 ACE 架构不匹配

### Decision 3: domain.yaml 扩展方案

**选择**：添加可选字段 `coding_standards` 和 `testing`

**示例**：
```yaml
project:
  name: todo-app
  title: TODO App

database:
  type: postgres
  port: 5432

# 新增（可选）
coding_standards:
  backend:
    - "使用 TypeScript strict 模式"
    - "所有 API 必须有错误处理"
  frontend:
    - "函数式组件 + Hooks"
  api:
    - "统一响应格式: { success, data, error }"

# 新增（可选）
testing:
  unit_test_coverage: 80
  e2e_test_required: true
  test_framework: vitest
```

**理由**：
- ✅ review Skill 需要知道编码规范
- ✅ verify Skill 需要知道测试要求
- ✅ 向后兼容：字段可选，已有项目无需修改

**替代方案**：创建独立的 `coding-standards.yaml`
- ❌ 配置文件碎片化
- ❌ 与 domain.yaml 的"单一配置源"理念冲突

### Decision 4: 状态记录统一

**选择**：所有 Skills 的日志记录到 `.claude/state/`

**目录结构**：
```
.claude/state/
├── review-log.jsonl
├── verify-log.jsonl
├── apply-log.jsonl
└── explore-log.jsonl
```

**格式**：
```json
{"ts":"2026-05-12T12:00:00Z","skill":"review","event":"completed","change":"add-auth","auto_fixed":3}
```

**理由**：
- ✅ 集中管理，便于查询
- ✅ JSONL 格式支持增量写入
- ✅ 可用于后续的数据分析和优化

**替代方案**：每个项目独立记录（`domains/{project}/.ai-state/`）
- ❌ 日志分散，难以全局分析
- ❌ 跨项目对比困难

### Decision 5: Skills 文件结构

**选择**：每个 Skill 只需要 `SKILL.md`，不需要 `executor.mjs`

**理由**：
- ✅ Claude Code 的 Skill 系统只需要 SKILL.md（Markdown 作为 prompt）
- ✅ 官方 openspec Skills 也只有 SKILL.md
- ✅ 降低维护成本，无需编写 JavaScript

**例外**：system Skills（ace-init-env、ace-create-project、ace-doctor）需要 executor.mjs，因为它们执行系统级操作（安装工具、创建项目）

**替代方案**：所有 Skills 都提供 executor.mjs
- ❌ workflow Skills 不需要编程逻辑，只需要 prompt 引导
- ❌ 增加维护负担

### Decision 6: Complexity-Based Workflow Flexibility

**选择**：基于变更复杂度的智能流程守卫

**复杂度分类**：
| 复杂度 | 定义 | 流程要求 |
|--------|------|---------|
| 简单 | 文档、typo、配置、CSS | propose → apply → archive（可跳过 review/verify）|
| 中等 | 单文件功能、UI 组件 | propose → apply → review → archive（可跳过 verify）|
| 复杂 | 多文件、架构、数据库 | 完整流程（不可跳过任何步骤）|

**判断机制**：
- ace-propose 自动评估复杂度，写入 proposal.md
- workflow-guard 读取复杂度，调整前置检查严格程度
- 用户可以明确说"跳过"，但复杂变更会阻止

**理由**：
- ✅ 平衡质量和效率
- ✅ 新手有引导，专家有自由
- ✅ 符合 OpenSpec 的 "Fluid Workflow" 理念（apply/SKILL.md 明确提到）
- ✅ 避免过度约束（改typo不需要propose→apply→review→verify）

**替代方案**：完全严格或完全灵活
- ❌ 完全严格：低效，用户体验差
- ❌ 完全灵活：易出错，质量无保障

**参考**：
- ai-drive-engine 的 apply/SKILL.md 提到 "Fluid Workflow Integration"
- OpenSpec 设计理念是 "actions on a change"，允许非线性流程

---

## Risks / Trade-offs

### Risk 1: 官方 Skills 更新导致薄封装失效

**风险**：官方 openspec-explore 或 openspec-propose 更新后，ACE 的薄封装可能不兼容

**缓解**：
- 版本锁定：package.json 中固定 openspec CLI 版本
- 定期验证：每次 openspec 更新后，运行测试验证 ACE Skills
- 文档化依赖：在 SKILL.md 中明确声明依赖的官方版本

### Risk 2: 路径适配遗漏边界场景

**风险**：可能存在嵌套子目录、符号链接等边界场景，相对路径不适用

**缓解**：
- 充分测试：在 domains/todo-app 中测试所有 Skills
- 错误处理：Skills 中添加路径检测逻辑，文件不存在时给出清晰提示
- 文档说明：在 SKILL.md 中明确 Skills 的执行目录要求（必须在 `domains/{project}/` 内）

### Risk 3: domain.yaml 扩展与未来官方 schema 冲突

**风险**：如果 openspec 官方未来也引入 `coding_standards` 字段，可能与我们的定义冲突

**缓解**：
- 使用命名空间：考虑使用 `ace_coding_standards` 而非 `coding_standards`
- 向后兼容：保持字段可选，不强制要求
- 监控官方动向：关注 openspec 的 schema 演进

### Risk 4: Skills 数量多导致用户学习曲线陡峭

**风险**：12 个 Skills，用户可能不知道何时使用哪个

**缓解**：
- 清晰的决策树：在 AGENTS.md 中提供流程图和场景示例
- 自然语言映射：用户说"检查代码"自动映射到 review，说"运行测试"映射到 verify
- 分层文档：核心工作流（6 个）突出展示，可选 Skills 放在"高级用法"章节

## Trade-offs

| 维度 | 薄封装方案 | 完全重写方案 |
|------|-----------|-------------|
| **开发成本** | 中（适配 12 个 Skills）| 高（重写所有逻辑）|
| **维护成本** | 低（只维护增强逻辑）| 高（维护完整实现）|
| **官方更新** | ✅ 自动受益 | ❌ 手动同步 |
| **定制能力** | ✅ 保留（增强层）| ✅ 完全控制 |
| **风险** | ⚠️ 依赖官方稳定性 | ⚠️ 与官方分叉 |

**选择薄封装的原因**：开发和维护成本更低，同时保持了定制能力。

## Migration Plan

### 阶段 1：创建核心 workflow Skills（优先级 1）

**步骤**：
1. 创建 `skills/workflow/ace-propose/SKILL.md`
2. 创建 `skills/workflow/ace-apply/SKILL.md`
3. 创建 `skills/workflow/review/SKILL.md`
4. 创建 `skills/workflow/verify/SKILL.md`
5. 创建 `skills/workflow/ace-archive/SKILL.md`

**验证**：
- 在 domains/todo-app 中测试完整流程：explore → propose → apply → review → verify → archive
- 检查日志记录到 `.claude/state/` 正常

**回滚**：
- 删除 `skills/workflow/ace-propose/` 等目录
- 恢复 AGENTS.md 和 README.md

### 阶段 2：扩展 domain.yaml 并更新文档

**步骤**：
1. 更新 `domains/todo-app/domain.yaml` 添加示例配置
2. 创建 `templates/domain.yaml.template` 包含扩展字段
3. 更新 AGENTS.md 添加 workflow Skills 说明
4. 更新 README.md 核心能力章节

**验证**：
- review Skill 能正确读取 coding_standards
- verify Skill 能正确读取 testing 配置

### 阶段 3：创建增强 Skills（优先级 2 和 3）

**步骤**：
1. 创建 `skills/workflow/plan/SKILL.md`
2. 创建 `skills/workflow/investigate/SKILL.md`
3. 创建 `skills/workflow/retro/SKILL.md`
4. （可选）创建 release、distill、autopilot

**验证**：
- 每个 Skill 独立测试
- 检查适配后的路径是否正确

### 回滚策略

**单个 Skill 回滚**：
```bash
rm -rf skills/workflow/{skill-name}/
git checkout AGENTS.md  # 如果已更新
```

**完全回滚**：
```bash
# 删除所有新创建的 Skills
rm -rf skills/workflow/ace-propose
rm -rf skills/workflow/ace-apply
rm -rf skills/workflow/ace-archive
rm -rf skills/workflow/review
rm -rf skills/workflow/verify
rm -rf skills/workflow/plan
rm -rf skills/workflow/investigate
rm -rf skills/workflow/retro
rm -rf skills/workflow/release
rm -rf skills/workflow/distill
rm -rf skills/workflow/autopilot

# 恢复文档
git checkout AGENTS.md README.md domains/todo-app/domain.yaml
```

**验证回滚**：
```bash
ls skills/workflow/  # 应该只剩 ace-explore/
git status  # 应该无未提交变更
```

## Open Questions

1. **executor.mjs 是否需要**：
   - 目前设计：workflow Skills 只需要 SKILL.md（Markdown prompt）
   - 待验证：Claude Code 是否能正确解析和执行纯 Markdown 的 Skills
   - 如果需要 executor.mjs：可以提供最小化实现（只是调用官方 Skill）

2. **.claude/state/ 目录的持久化策略**：
   - 是否应该 gitignore？（日志文件可能包含敏感信息）
   - 还是提交到仓库？（便于团队共享和分析）
   - 建议：gitignore，个人开发使用

3. **domain.yaml 扩展字段的命名**：
   - 使用 `coding_standards` 还是 `ace_coding_standards`？
   - 使用 `testing` 还是 `ace_testing`？
   - 建议：先用简短名称，如果与官方冲突再加前缀

4. **Skills 的自动触发机制**：
   - 目前设计：用户通过自然语言触发
   - 是否需要：ace-apply 完成后自动调用 review？
   - 建议：在 ace-apply 的 SKILL.md 中明确说明"完成后建议运行 review"

5. **跨项目 Skills 调用**：
   - 如果用户在根目录执行 review，应该如何处理？
   - 是否需要提示用户"请先 cd 到 domains/{project}/"？
   - 建议：在 SKILL.md 中检测当前目录，不在项目内时给出错误提示
