# 提案：引入 Adapter Pattern 与全局文档结构净化

## 变更分类
**复杂度**: 复杂（涉及全局目录重构及核心工作流机制变更）
**流程要求**: propose → apply → review → verify → archive

## ACE 上下文
- 领域: `ace-core`
- 相关文档: `docs/`, `10_DOCS/`, `domains/ace-core/10_DOCS/`
- 架构原则: 知识冷热分离，白盒核心工作流与黑盒第三方能力（Adapter Pattern）

## 1. 提案背景 (O)
当前系统存在两个核心痛点：
1. **资产闭环困境**：ACE 只能使用本地明文 skills，无法低成本地插入和复用开源社区（如 Matt Pocock）的先进 prompt（如单步拷问 Grill），这违背了产品经理“拿来主义”的效率原则。
2. **结构混乱**：项目在演进中留下了历史技术债，根目录同时存在 `docs/`、`10_DOCS/` 和 `domains/ace-core/10_DOCS/`，使得知识检索与沉淀路径变得模糊。同时，用户对底层隐藏文件夹（如 `.claude/`）的边界缺乏认知，导致认知负担。

## 2. 方案对比 (A)
针对**第三方技能集成**：
* **方案 A：全盘拷贝**。手动将外部 skill 翻译进 ACE，维护成本高。
* **方案 B：Adapter Pattern（插拔式能力）**。通过 `npx` 等包管理工具将第三方 skill 下沉到环境底层（如 `.agents/skills/`），然后在 ACE 本地白盒 `skills/workflow/plan/SKILL.md` 中以 Prompt 的形式“声明式调用”，并用强规则重构其副作用（禁止其乱写文件，强制输出到 ACE 的 `10_DOCS`）。这实现了逻辑复用与副作用隔离。

针对**文档结构混乱**：
* **单一知识库原则**：必须废除根目录的 `docs/` 和孤立的 `10_DOCS/`，所有领域知识必须收敛至 `domains/ace-core/10_DOCS/`。历史文件通过评估后迁移或归档。

## 3. 实施路径 (I)
**Phase 1: Adapter Pattern 实现**
1. 运行 `npx skills@latest add mattpocock/skills`。
2. 更新 `skills/workflow/plan/SKILL.md`，添加 Adapter Block，强制引导 AI 阅读 `.agents/skills/grill-with-docs/SKILL.md` 的理念，但要求输出物严格进入 ACE 的 `90_PLANNING` 和 `10_DOCS/wiki`。

**Phase 2: Docs Cleanup**
1. 将 `docs/INTERACTION_MODEL.md` 和 `docs/TECH_STACK.md` 迁移至 `domains/ace-core/10_DOCS/architecture/`。
2. 将 `10_DOCS/technical/` 内容迁移至 `domains/ace-core/10_DOCS/technical/`。
3. 彻底删除原根目录的 `docs/` 和 `10_DOCS/` 目录。
4. 在 README.md 中明确说明 `.claude/` 和 `.agents/` 等隐藏目录的作用（底层工作区与黑盒依赖区），指导用户在 IDE 中排除它们。

## 4. 异常场景与回滚 (S)
* **文件迁移丢失**：迁移前必须使用 git 提交，可通过 `git reset` 随时找回。
* **外部 Skill 失控**：若大模型无法遵循 Adapter 规则，仍乱写文件，我们可在 `apply` 阶段的测试中发现，并通过修改 Prompt 压制，或直接回滚 Adapter 逻辑。