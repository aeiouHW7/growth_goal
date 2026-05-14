# ACE Workflow 全面审计 —— 2026-05-14

## 现状：9 个 Workflow Skill

```
plan (可选) → ace-explore → ace-propose → ace-apply → review → verify → ace-archive → retro (可选)
                                                         ↑          ↑
                                                    investigate (任意时刻)
```

## 六大数据问题

### 1. Adapter Pattern 只有意图，没有机制
- 所有 `ace-*` skill 声称"委托官方 openspec-xxx"，但实际只是一句描述性文字
- 没有 concrete 的适配器实现（无函数、无调用链、无错误处理）
- 如果官方 skill 不存在或改名，ACE 不会感知到

### 2. 流程守卫分散且脆弱
- 每个 skill 各自检查前置条件（读 `.claude/state/*.jsonl`），逻辑重复
- AGENTS.md 提到"状态总线"（`.archive/ai-events.jsonl`）但实际 skill 没有使用
- 复杂度感知逻辑散落在 propose/apply/review/verify/archive 中，不一致

### 3. 命名不一致
- 目录名仍然是 `ace-explore/`、`ace-propose/`、`ace-apply/`、`ace-archive/`
- frontmatter `name` 字段也使用 `ace-` 前缀
- 与 `plan`、`review`、`verify`、`investigate`、`retro`（无前缀）形成风格分裂

### 4. TDD 完全缺失
- `ace-apply` 无任何 TDD 约束
- 记忆标记为"待实施"，尚未写入代码

### 5. 角色重叠
- `plan`（需求规划，O.A.I.S 方法论）和 `ace-explore`（需求探索）在"澄清需求"上职责重叠
- 边界模糊：什么时候用 plan，什么时候用 explore？

### 6. 代码质量问题
- `ace-archive/SKILL.md` 有两个重复的 "### 4. 后置" 步骤
- `plan/SKILL.md.backup` 残留文件未清理

## 优化策略（用户确认）

优先级顺序：
1. **先优化完整 workflow** — 定义每个节点的输入/输出/职责边界
2. **再优化工程结构** — 目录结构、状态管理、配置等自然浮现
3. **最后优化环境配置** — `ace-init-env`、`ace-create-project` 等

第一步聚焦：把 workflow 的"设计意图"和"实际实现"对齐。
