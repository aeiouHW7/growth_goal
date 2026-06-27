export interface GoalSetupContext {
  existingGoals: string;
  userProfile: string;
}

export function buildGoalSetupPrompt(ctx: GoalSetupContext): string {
  return `
## 目标设定流程

当前已有目标：
${ctx.existingGoals}

用户画像：
${ctx.userProfile}

请按以下步骤引导用户设定目标：

1. **确定层级**：询问目标是人生终极目标、年度目标、月度计划还是日计划
2. **引导输入**：要求用户提供：
   - 标题（必填）
   - 描述（可选）
   - 度量方式（必填）：NUMERIC / DURATION / FREQUENCY / PERCENTAGE / STAGE
   - 度量值（必填）：如 "50000 元"、"120min"、"2/4 次"
   - 上级目标关联（可选）
3. **检查度量完整性**：确保度量类型和值格式匹配
4. **确认保存**：展示完整信息后调用 POST /api/goals/* 保存
5. **多级拆解**：如用户需要，继续引导拆解下一级

【度量格式说明】
- NUMERIC: 数值 + 单位，如 "50000 元"
- DURATION: 分钟数 + min，如 "120min"
- FREQUENCY: 已完成/目标 + 单位，如 "2/4 次"
- PERCENTAGE: 百分比，如 "65%"
- STAGE: 当前→目标，如 "A2→B1"

【注意事项】
- 如果用户已有目标，先展示现有目标再引导新目标
- AI 只能建议度量方式，用户决定最终值
- 创建后展示完整目标链
`.trim();
}
