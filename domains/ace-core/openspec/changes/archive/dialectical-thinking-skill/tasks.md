# Implementation Tasks - Dialectical Thinking Skill

## 1. 核心 Skill 文件创建

- [ ] 1.1 创建 skills/coding/dialectical-thinking/ 目录结构
- [ ] 1.2 创建 SKILL.md 文件骨架（frontmatter + 核心 sections）
- [ ] 1.3 编写 frontmatter（name, description with aggressive keywords）
- [ ] 1.4 编写 Skill 简介和触发场景说明
- [ ] 1.5 编写 Workflow Offer 模板（提供工作流或直接讨论的选择）

## 2. Question 阶段实现

- [ ] 2.1 编写 Question 阶段的指引说明
- [ ] 2.2 定义 Question 阶段的输出格式模板
- [ ] 2.3 提供质疑需求的示例提示词
- [ ] 2.4 提供识别隐含假设的指引
- [ ] 2.5 提供重新定义问题的方法

## 3. Explore 阶段实现

- [ ] 3.1 编写 Explore 阶段的指引说明
- [ ] 3.2 定义 Explore 阶段的输出格式模板（方案 A/B/C）
- [ ] 3.3 提供生成多样化方案的提示
- [ ] 3.4 强调中立呈现（不预设优劣）的指引
- [ ] 3.5 定义每个方案必须包含的要素（核心思路、关键技术）

## 4. Compare 阶段实现

- [ ] 4.1 编写 Compare 阶段的指引说明
- [ ] 4.2 定义 Compare 阶段的对比表格模板
- [ ] 4.3 列出常用对比维度（复杂度、性能、可维护性、学习成本等）
- [ ] 4.4 提供识别关键权衡点的方法
- [ ] 4.5 提供对比评分/描述的示例

## 5. Decide 阶段实现

- [ ] 5.1 编写 Decide 阶段的指引说明
- [ ] 5.2 定义 Decide 阶段的输出格式模板
- [ ] 5.3 强调必须明确推荐一个方案（不能模棱两可）
- [ ] 5.4 提供推荐理由的结构指引（至少 2 条具体原因）
- [ ] 5.5 要求列出注意事项和风险
- [ ] 5.6 要求解释不推荐其他方案的原因

## 6. 工作流导航和灵活性

- [ ] 6.1 编写阶段转换的指引（顺序进行 vs 跳过阶段）
- [ ] 6.2 实现"询问是否继续下一阶段"的提示模板
- [ ] 6.3 支持用户跳过阶段的逻辑说明
- [ ] 6.4 支持用户返回上一阶段的逻辑说明
- [ ] 6.5 支持用户中途退出的优雅处理（提供总结）

## 7. 触发条件实现

- [ ] 7.1 在 description 中添加决策相关关键词（complex decisions, architecture choices, technical tradeoffs）
- [ ] 7.2 在 description 中添加设计相关关键词（feature design, API design, database schema design）
- [ ] 7.3 在 description 中添加选型相关关键词（multi-option selection, framework selection）
- [ ] 7.4 在 description 中添加分析相关关键词（requirement analysis, tradeoff analysis）
- [ ] 7.5 在 SKILL.md 中明确触发场景（When to Use This Skill）
- [ ] 7.6 在 SKILL.md 中明确不触发场景（When NOT to Use）

## 8. 参考资料文件创建

- [ ] 8.1 创建 references/ 子目录
- [ ] 8.2 创建 principles.md 文件骨架
- [ ] 8.3 编写 5-7 条辩证原则（第一性原理、逆向思维、魔鬼代言人、质疑假设等）
- [ ] 8.4 为每条原则提供 50 字说明和简短示例
- [ ] 8.5 创建 patterns.md 文件骨架
- [ ] 8.6 编写 3-5 种思考模式（SWOT、五个为什么、决策矩阵等）
- [ ] 8.7 为每种模式提供模板和使用场景
- [ ] 8.8 创建 examples.md 文件骨架
- [ ] 8.9 编写 2-3 个真实案例（基于 ACE Engine 的设计决策，脱敏处理）
- [ ] 8.10 确保每个案例展示完整的四阶段流程

## 9. 渐进式披露实现

- [ ] 9.1 在 SKILL.md 中添加"需要更多指引？"提示模板
- [ ] 9.2 Question 阶段结束时提示 principles.md
- [ ] 9.3 Explore 阶段结束时提示 patterns.md
- [ ] 9.4 Compare 阶段结束时提示 examples.md
- [ ] 9.5 确保参考文件路径正确且可访问

## 10. OpenSpec 集成

- [ ] 10.1 在 SKILL.md 中说明与 OpenSpec Explore 阶段的关系
- [ ] 10.2 在 SKILL.md 中说明与 OpenSpec Plan 阶段的关系
- [ ] 10.3 说明 Apply 阶段不应主动触发的逻辑

## 11. 文档和索引更新

- [ ] 11.1 在根目录 skills/README.md 中添加辩证思考 Skill 的索引
- [ ] 11.2 添加 Skill 的简短描述和使用场景说明
- [ ] 11.3 更新 .claude/memory/decisions.md 记录设计决策
- [ ] 11.4 （可选）在 domains/ace-core/10_DOCS/technical/ 中添加设计文档链接

## 12. 测试和验证

- [ ] 12.1 手动触发测试：明确说"使用辩证思考"，验证是否进入工作流
- [ ] 12.2 自动触发测试：提出架构设计问题，验证是否主动 offer 工作流
- [ ] 12.3 拒绝工作流测试：在 offer 时选择"直接讨论"，验证是否正常跳过
- [ ] 12.4 阶段跳过测试：请求"跳过 Question，直接 Explore"，验证是否支持
- [ ] 12.5 中途退出测试：在 Compare 阶段请求"直接给结论"，验证是否优雅退出
- [ ] 12.6 参考资料加载测试：请求查看 principles.md，验证文件可读且内容正确
- [ ] 12.7 输出格式验证：检查每个阶段的输出是否符合定义的 markdown 格式
- [ ] 12.8 关键词触发测试：使用不同关键词（"选择框架"、"API 设计"等）验证触发准确性

## 13. 优化和完善

- [ ] 13.1 根据测试结果调整 description 中的关键词覆盖
- [ ] 13.2 优化 Workflow Offer 的措辞（简洁、友好、不强迫）
- [ ] 13.3 检查所有模板的中英文一致性
- [ ] 13.4 确保参考文件之间的交叉引用正确
- [ ] 13.5 添加快速模式的设计预留（可选功能，暂不实现）
