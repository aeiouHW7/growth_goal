## 1. 基础设施创建

- [ ] 1.1 创建 `skills/SKILLS_INDEX.md` 框架（包含导航说明、分类结构）
- [ ] 1.2 为 SKILLS_INDEX.md 添加 Workflow Skills 分类和条目（9 个 Skills）
- [ ] 1.3 为 SKILLS_INDEX.md 添加 Knowledge Skills 分类和条目（4 个 Skills）
- [ ] 1.4 为 SKILLS_INDEX.md 添加 System/Coding Skills 分类和条目（3 个 Skills）
- [ ] 1.5 验证 SKILLS_INDEX.md 总行数 ≤ 300 行
- [ ] 1.6 为每个 Skill 条目添加触发关键词（Auto-Trigger 层）

## 2. SKILL.md 模板和规范

- [ ] 2.1 创建 `10_DOCS/technical/skills-template-standard.md`（模板结构说明）
- [ ] 2.2 在模板文档中定义 frontmatter 必需字段（name、description、triggers）
- [ ] 2.3 在模板文档中定义核心章节结构（When to Use、Workflow、Guardrails、References）
- [ ] 2.4 在模板文档中说明各章节长度限制（When to Use ≤ 10 行、Workflow ≤ 50 行等）
- [ ] 2.5 在模板文档中提供示例迁移指南（如何拆分核心 vs 详细）

## 3. 加载策略文档

- [ ] 3.1 创建 `10_DOCS/technical/skills-loading-strategy.md`（加载策略说明）
- [ ] 3.2 在策略文档中说明三层加载策略（Always/Auto-Trigger/Manual）
- [ ] 3.3 在策略文档中列出 Always Load 层的 Skills（所有 workflow/*）
- [ ] 3.4 在策略文档中建立 Auto-Trigger 触发词映射表（关键词 → Skill）
- [ ] 3.5 在策略文档中列出 Manual Only 层的 Skills（system/*）
- [ ] 3.6 在策略文档中说明如何手动加载 Skill（调用方式）

## 4. 试点迁移（ace-propose）

- [ ] 4.1 选择 `skills/workflow/ace-propose/SKILL.md` 作为试点
- [ ] 4.2 创建 `skills/workflow/ace-propose/references/` 目录
- [ ] 4.3 将 ace-propose 的详细示例提取到 `references/examples.md`
- [ ] 4.4 精简 ace-propose 的 SKILL.md（保留核心流程，删除冗余示例）
- [ ] 4.5 在 ace-propose frontmatter 添加 `triggers` 字段
- [ ] 4.6 在 ace-propose 底部添加 References 章节（链接到 references/）
- [ ] 4.7 验证 ace-propose SKILL.md 长度 ≤ 200 行
- [ ] 4.8 验证 ace-propose 功能无影响（运行一次 propose 流程）

## 5. 批量迁移 - P0 Workflow Skills

- [ ] 5.1 迁移 `skills/workflow/ace-explore/SKILL.md`（创建 references/、精简文档、添加 triggers）
- [ ] 5.2 迁移 `skills/workflow/ace-apply/SKILL.md`
- [ ] 5.3 迁移 `skills/workflow/review/SKILL.md`
- [ ] 5.4 迁移 `skills/workflow/verify/SKILL.md`
- [ ] 5.5 迁移 `skills/workflow/retro/SKILL.md`
- [ ] 5.6 迁移 `skills/workflow/ace-archive/SKILL.md`
- [ ] 5.7 迁移 `skills/workflow/plan/SKILL.md`
- [ ] 5.8 迁移 `skills/workflow/investigate/SKILL.md`
- [ ] 5.9 验证所有 Workflow Skills 长度均 ≤ 200 行

## 6. 批量迁移 - P1 Knowledge Skills

- [ ] 6.1 迁移 `skills/knowledge/codebase-recon/SKILL.md`（创建 references/、精简文档、添加 triggers）
- [ ] 6.2 迁移 `skills/knowledge/db-schema-manager/SKILL.md`
- [ ] 6.3 迁移 `skills/knowledge/docs-extractor/SKILL.md`
- [ ] 6.4 迁移 `skills/knowledge/cross-review/SKILL.md`
- [ ] 6.5 验证所有 Knowledge Skills 长度均 ≤ 200 行

## 7. 批量迁移 - P2 System/Coding Skills

- [ ] 7.1 迁移 `skills/system/ace-create-project/SKILL.md`（创建 references/、精简文档、添加 triggers）
- [ ] 7.2 迁移 `skills/system/ace-init-env/SKILL.md`
- [ ] 7.3 迁移 `skills/system/ace-doctor/SKILL.md`
- [ ] 7.4 迁移 `skills/coding/dialectical-thinking/SKILL.md`
- [ ] 7.5 验证所有 System/Coding Skills 长度均 ≤ 200 行

## 8. 整体验证

- [ ] 8.1 统计所有 SKILL.md 总行数（目标：≤ 2500 行，从 4619 行减少 45%）
- [ ] 8.2 验证 SKILLS_INDEX.md 包含所有 16 个 Skills
- [ ] 8.3 验证所有 references/ 链接可访问
- [ ] 8.4 运行完整工作流验证（explore → propose → apply → review → verify → archive）
- [ ] 8.5 测量上下文减少量（索引 + 核心文档 vs 原始全量文档）

## 9. 知识沉淀

- [ ] 9.1 更新 `10_DOCS/technical/skills-design-principles.md`（补充文档精简原则）
- [ ] 9.2 在 skills-design-principles.md 添加 references/ 目录使用规范
- [ ] 9.3 在 skills-design-principles.md 添加本次优化的经验总结
- [ ] 9.4 更新 `10_DOCS/technical/README.md` 索引（添加新文档链接）

## 10. 最终检查和提交

- [ ] 10.1 检查所有 SKILL.md frontmatter 包含 triggers 字段
- [ ] 10.2 检查所有 SKILL.md 底部包含 References 章节
- [ ] 10.3 检查 Git 状态（确保所有新文件已添加）
- [ ] 10.4 创建 Git 提交（标题：optimize: 优化 Skills 加载策略，减少 45% 上下文成本）
- [ ] 10.5 验证提交包含所有必要文件（SKILLS_INDEX.md + 16 个 SKILL.md + references/ + 10_DOCS/）
