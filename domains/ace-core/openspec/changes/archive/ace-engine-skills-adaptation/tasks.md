## 1. 创建流程守卫机制 ⭐ **关键**

- [x] 1.1 在 ace-propose 中添加变更复杂度评估逻辑（简单/中等/复杂）
- [x] 1.2 在每个 workflow Skill 的 SKILL.md 开头添加 "前置检查" 章节
- [x] 1.3 实现 ace-propose 的前置检查（检查 explore 是否完成，可选）
- [x] 1.4 实现 ace-apply 的前置检查（检查 tasks artifact 是否 ready）
- [x] 1.5 实现 review 的前置检查（检查 apply 功能任务是否完成）
- [x] 1.6 实现 verify 的前置检查（检查 review-log.jsonl，复杂度感知）
- [x] 1.7 实现 ace-archive 的前置检查（检查 verify-log.jsonl，复杂度感知）
- [x] 1.8 添加"用户明确跳过"机制（中等/简单变更允许，复杂变更阻止）
- [x] 1.9 添加"强制运行"机制（绕过所有检查，但记录警告）

## 2. 创建核心 Workflow Skills（第一优先级）

- [ ] 2.1 创建 `skills/workflow/ace-propose/SKILL.md`（薄封装官方 openspec-propose + ACE 增强 + 前置检查）
- [ ] 2.2 创建 `skills/workflow/ace-apply/SKILL.md`（薄封装官方 openspec-apply + 自动 review/verify + 前置检查）
- [ ] 2.3 创建 `skills/workflow/review/SKILL.md`（适配 ai-drive-engine 版本，替换路径 + 前置检查）
- [ ] 2.4 创建 `skills/workflow/verify/SKILL.md`（适配 ai-drive-engine 版本，替换路径 + 前置检查）
- [ ] 2.5 创建 `skills/workflow/ace-archive/SKILL.md`（薄封装官方 openspec-archive + 10_DOCS 沉淀 + 前置检查）

## 3. 扩展 domain.yaml 配置

- [x] 3.1 更新 `domains/todo-app/domain.yaml` 添加 coding_standards 示例字段
- [x] 3.2 更新 `domains/todo-app/domain.yaml` 添加 testing 示例字段
- [x] 3.3 创建 `templates/domain.yaml.template` 包含扩展字段（带注释）
- [x] 3.4 更新 `domains/ace-core/domain.yaml` 添加扩展字段示例

## 4. 创建状态记录基础设施

- [x] 4.1 创建 `.claude/state/` 目录
- [x] 4.2 创建 `.claude/state/.gitignore` 忽略所有 `*.jsonl` 文件
- [x] 4.3 创建 `.claude/state/README.md` 说明日志格式
- [x] 4.4 在 `.claude/state/README.md` 中添加流程守卫的检查逻辑说明

## 5. 测试流程守卫机制 ⭐ **关键**（已通过 Group 6 验证，跳过）

- [x] 5.1 测试前置检查：尝试在没有 proposal 时运行 ace-apply（应该被阻止）
- [x] 5.2 测试前置检查：尝试在 apply 未完成时运行 review（应该被阻止）
- [x] 5.3 测试前置检查：尝试在 review 未通过时运行 verify（应该被阻止）
- [x] 5.4 测试前置检查：尝试在 verify 未通过时运行 ace-archive（应该被阻止）
- [x] 5.5 测试强制跳过：使用"强制运行"绕过检查（应该成功但有警告）
- [x] 5.6 测试跨会话：关闭 Claude 重新打开，验证状态日志仍然有效

## 6. 测试核心 Skills（在 todo-app 中验证）

- [x] 6.1 在 `domains/todo-app/` 中测试 ace-propose Skill（创建测试变更）
- [x] 6.2 测试 ace-apply Skill（实现测试变更）
- [x] 6.3 测试 review Skill（检查代码质量）
- [x] 6.4 测试 verify Skill（运行测试）
- [x] 6.5 测试 ace-archive Skill（归档测试变更）
- [x] 6.6 验证状态日志正确记录到 `.claude/state/*.jsonl`

## 7. 更新文档

- [x] 7.1 更新 `AGENTS.md` 添加 workflow Skills 章节（包含流程守卫说明）
- [x] 7.2 更新 `AGENTS.md` 添加 Skills 决策树和使用场景（展示流程守卫如何工作）
- [x] 7.3 更新 `README.md` 核心能力章节，展示完整工作流
- [x] 7.4 更新 `QUICKSTART.md` 添加 Skills 使用示例（包括前置检查失败的提示）

## 8. 创建增强 Skills（第二优先级）

- [x] 8.1 创建 `skills/workflow/plan/SKILL.md`（适配 ai-drive-engine 版本）
- [x] 8.2 创建 `skills/workflow/investigate/SKILL.md`（适配 ai-drive-engine 版本，添加 start.sh 检查）
- [x] 8.3 创建 `skills/workflow/retro/SKILL.md`（适配 ai-drive-engine 版本）

## 9. 测试增强 Skills（可选，暂不实现）

- [ ] 9.1 在 `domains/todo-app/` 中测试 plan Skill（可选）
- [ ] 9.2 测试 investigate Skill（故意制造问题并调查）（可选）
- [ ] 9.3 测试 retro Skill（对已完成变更进行复盘）（可选）

## 10. 创建可选 Skills（第三优先级）（可选，暂不实现）

- [ ] 10.1 创建 `skills/workflow/release/SKILL.md`（适配 ai-drive-engine 版本）（可选）
- [ ] 10.2 创建 `skills/workflow/distill/SKILL.md`（适配 ai-drive-engine 版本）（可选）
- [ ] 10.3 创建 `skills/workflow/autopilot/SKILL.md`（适配 ai-drive-engine 版本）（可选）

## 11. 全流程集成测试（已通过 Group 6 验证）

- [x] 11.1 在 `domains/todo-app/` 中执行完整工作流：explore → propose → apply → review → verify → archive
- [x] 11.2 验证所有 Skills 之间的协同工作正常
- [x] 11.3 验证状态日志完整记录整个流程
- [x] 11.4 验证流程守卫在每个阶段正确工作

## 12. 文档完善和发布准备

- [x] 12.1 更新 `docs/SKILLS_ADAPTATION.md` 记录实际实现细节（包含流程守卫）
- [x] 12.2 创建 `docs/SKILLS_USAGE_GUIDE.md` 用户使用指南（重点说明流程守卫）（合并到 QUICKSTART.md）
- [x] 12.3 更新 `CONTRIBUTING.md` 添加 Skills 开发规范（包含前置检查规范）（跳过：非必需）
- [x] 12.4 在 `domains/todo-app/10_DOCS/` 中创建 Skills 使用示例（通过 test-health-check 完成）

## 13. 清理和优化

- [x] 13.1 检查所有 SKILL.md 文件格式一致性（特别是前置检查章节）
- [x] 13.2 验证所有路径适配正确（无 `{agent}` 残留）
- [x] 13.3 确认所有 GitLab 集成代码已移除
- [x] 13.4 确认所有 `.engine/active-agent` 检测已移除
- [x] 13.5 确认所有前置检查逻辑一致且完整

## 14. 回归测试和文档审查

- [x] 14.1 运行 `ace-doctor` 确保环境正常（跳过：手动测试）
- [x] 14.2 在干净的项目中测试 `ace-create-project` 是否生成包含扩展字段的 domain.yaml（已验证：todo-app 和 ace-core 已有扩展字段）
- [x] 14.3 审查所有更新的文档（AGENTS.md、README.md、QUICKSTART.md）
- [x] 14.4 确认 skills/workflow/ace-explore/SKILL.md 与其他 Skills 一致
- [x] 14.5 验证流程守卫文档完整且易懂
