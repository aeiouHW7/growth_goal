## Why

ACE Engine 目前只有 4 个 Skills（ace-init-env、ace-create-project、ace-doctor、dialectical-thinking），缺少完整的开发工作流 Skills。ai-drive-engine 项目已经沉淀了 12 个成熟的 workflow Skills，但它们是为单 agent 架构设计的（`{agent}/` 路径模式），需要适配到 ACE Engine 的多 domain 架构（`domains/{project}/` 模式）。

**核心问题**：
1. 路径不匹配：ai-drive-engine 使用 `{agent}/10_DOCS/`，ACE Engine 使用相对路径 `10_DOCS/`
2. 配置文件不同：ai-drive-engine 使用 `openspec/config.yaml`，ACE Engine 使用 `domain.yaml`
3. 测试目录不同：ai-drive-engine 使用 `{agent}/e2e-tests/`，ACE Engine 使用 `backend/tests/`
4. 功能冗余：部分功能（GitLab 集成、agent 切换）ACE Engine 不需要

**为什么现在做**：
- 文档已清理完成，架构已稳定
- start.sh 已优化，具备完整的启动/停止流程
- 需要完整的工作流支持才能真正体现 AI-First 理念

## What Changes

### 1. 创建 ACE Engine 专属 workflow Skills

适配并创建以下 12 个 Skills 到 `skills/workflow/`：

**第一优先级（核心工作流）**：
- `ace-explore/` - 需求探索（官方 openspec-explore + ACE 增强）✅ 已创建
- `ace-propose/` - 生成提案（官方 openspec-propose + ACE 增强）
- `ace-apply/` - 实现变更（官方 openspec-apply + ACE 增强）
- `review/` - 代码审查（适配 ai-drive-engine 版本）
- `verify/` - 构建验证 + E2E 测试（适配 ai-drive-engine 版本）
- `ace-archive/` - 归档变更（官方 openspec-archive + ACE 增强）

**第二优先级（增强能力）**：
- `plan/` - 实现规划（适配 ai-drive-engine 版本）
- `investigate/` - 问题调查（适配 ai-drive-engine 版本）
- `retro/` - 复盘总结（适配 ai-drive-engine 版本）

**第三优先级（可选功能）**：
- `release/` - 发布管理（适配 ai-drive-engine 版本）
- `distill/` - 知识提炼（适配 ai-drive-engine 版本）
- `autopilot/` - 自动驾驶（适配 ai-drive-engine 版本）

### 2. 扩展 domain.yaml 配置结构

新增字段支持 review 和 verify：

```yaml
# 新增：编码规范（供 review 使用）
coding_standards:
  backend:
    - 使用 TypeScript strict 模式
    - 所有 API 必须有错误处理
  frontend:
    - 函数式组件 + Hooks
  api:
    - 统一响应格式: { success, data, error }

# 新增：测试要求（供 verify 使用）
testing:
  unit_test_coverage: 80
  e2e_test_required: true
  test_framework: vitest
```

### 3. 创建统一的状态记录目录

```
.claude/state/
├── review-log.jsonl
├── verify-log.jsonl
├── apply-log.jsonl
└── explore-log.jsonl
```

### 4. 更新 AGENTS.md 和 README.md

- AGENTS.md: 添加完整的 workflow Skills 列表和说明
- README.md: 更新核心能力章节，展示完整工作流

## Capabilities

### New Capabilities

- `workflow-guard`: 流程守卫 - 强制执行 workflow 前置步骤检查 ⭐ **新增**
- `ace-propose-skill`: ACE Engine 增强版 propose Skill（官方 + ACE 特性）
- `ace-apply-skill`: ACE Engine 增强版 apply Skill（官方 + 自动 review/verify）
- `ace-archive-skill`: ACE Engine 增强版 archive Skill（官方 + 10_DOCS 沉淀）
- `review-skill`: 代码审查 Skill（适配 ACE Engine 路径）
- `verify-skill`: 构建验证 + E2E 测试 Skill（适配 ACE Engine 路径）
- `plan-skill`: 实现规划 Skill（适配 ACE Engine 路径）
- `investigate-skill`: 问题调查 Skill（适配 ACE Engine 路径）
- `retro-skill`: 复盘总结 Skill（适配 ACE Engine 路径）
- `release-skill`: 发布管理 Skill（适配 ACE Engine 路径）
- `distill-skill`: 知识提炼 Skill（适配 ACE Engine 路径）
- `autopilot-skill`: 自动驾驶 Skill（适配 ACE Engine 路径）
- `domain-yaml-extension`: domain.yaml 配置扩展方案

### Modified Capabilities

无

## Impact

**新增文件**：
- `skills/workflow/ace-propose/SKILL.md`
- `skills/workflow/ace-apply/SKILL.md`
- `skills/workflow/ace-archive/SKILL.md`
- `skills/workflow/review/SKILL.md`
- `skills/workflow/verify/SKILL.md`
- `skills/workflow/plan/SKILL.md`
- `skills/workflow/investigate/SKILL.md`
- `skills/workflow/retro/SKILL.md`
- `skills/workflow/release/SKILL.md`
- `skills/workflow/distill/SKILL.md`
- `skills/workflow/autopilot/SKILL.md`
- `.claude/state/` 目录及日志文件
- `templates/domain.yaml.template` - 包含扩展字段的模板

**修改文件**：
- `AGENTS.md` - 添加 workflow Skills 说明
- `README.md` - 更新核心能力章节
- `domains/todo-app/domain.yaml` - 添加示例配置

**影响**：
- AI 获得完整的开发工作流支持（explore → propose → apply → review → verify → archive）
- 用户可以通过自然语言触发完整的开发流程
- 所有 Skills 遵循 ACE Engine 的目录结构和规范
- 继承 ai-drive-engine 的最佳实践，同时适配 ACE 架构

## 方案对比

### 方案 A：薄封装（官方 Skills）+ 完全适配（独有 Skills）⭐ 推荐

**策略**：
- 官方已有的（explore、propose、apply、archive）→ 薄封装增强
- ai-drive-engine 独有的（review、verify、plan 等）→ 完全适配路径

**优点**：
- ✅ 享受官方更新（openspec-explore 升级自动受益）
- ✅ 保留定制能力（10_DOCS、dialectical-thinking）
- ✅ 降低维护成本（只维护增强逻辑）
- ✅ 继承 ai-drive-engine 的成熟实践

**缺点**：
- ⚠️ 需要理解官方 Skills 的工作机制
- ⚠️ 适配工作量中等（12 个 Skills）

### 方案 B：完全重写所有 Skills

**策略**：
- 所有 Skills 从零实现，不依赖官方版本

**优点**：
- ✅ 完全控制，无依赖
- ✅ 可以深度定制

**缺点**：
- ❌ 维护成本极高（重复实现官方功能）
- ❌ 容易与官方版本分叉
- ❌ 失去官方更新的好处
- ❌ 开发周期长

### 方案 C：直接使用官方 Skills，不做 ACE 定制

**策略**：
- 完全依赖官方 openspec-* Skills

**优点**：
- ✅ 无开发成本
- ✅ 自动享受官方更新

**缺点**：
- ❌ 无法利用 ACE Engine 特性（10_DOCS、dialectical-thinking）
- ❌ 缺少 review、verify 等独有 Skills
- ❌ 不符合 ACE Engine 的 AI-First 理念

**选择方案 A 的理由**：
1. 平衡了官方能力和 ACE 定制需求
2. 维护成本可控，同时保持灵活性
3. 可以复用 ai-drive-engine 的成熟实践
4. 符合 ETHOS 中的"工具中立"原则

## 风险评估

**技术风险**：
- ⚠️ 路径适配可能遗漏边界场景（如嵌套子目录）
- ⚠️ domain.yaml 扩展可能与未来官方 schema 冲突
- 缓解：充分测试，保持向后兼容

**兼容性风险**：
- ⚠️ 官方 openspec CLI 更新可能导致薄封装失效
- 缓解：版本锁定 + 定期验证

**学习曲线风险**：
- ⚠️ 用户需要理解 12 个 Skills 的触发时机
- 缓解：更新 AGENTS.md，提供清晰的决策树

## 资产审计

**新增 10_DOCS 文件**：
- `docs/SKILLS_ADAPTATION.md` ✅ 已创建 - 适配策略文档

**更新 10_DOCS 文件**：
- `AGENTS.md` - 添加 workflow Skills 章节
- `README.md` - 更新核心能力说明

**新增模板文件**：
- `templates/domain.yaml.template` - 包含 coding_standards 和 testing 字段

## 回滚计划

如果 apply 失败或产生预期外影响：

**立即回滚**：
```bash
# 删除新创建的 Skills
rm -rf skills/workflow/ace-propose
rm -rf skills/workflow/ace-apply
rm -rf skills/workflow/ace-archive
rm -rf skills/workflow/review
rm -rf skills/workflow/verify
# ... 其他 Skills

# 恢复 AGENTS.md 和 README.md
git checkout AGENTS.md README.md
```

**逐步回滚**：
- 如果某个 Skill 有问题，可以单独删除，不影响其他 Skills
- 所有 Skills 相互独立，无强依赖

**验证回滚成功**：
```bash
# 检查目录
ls skills/workflow/  # 应该只剩 ace-explore（已创建）

# 检查文档
git diff AGENTS.md README.md  # 应该无差异
```
