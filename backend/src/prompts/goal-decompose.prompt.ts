/**
 * AI 目标拆解 Prompt
 * 用于将 LifeArchive 第四层愿景拆解为年度目标
 */

export interface GoalDecomposeContext {
  vision: {
    years10: string;
    years3: string;
    year1: string;
  } | null;
  goalSource: {
    motivation: string;
    whyNow: string;
  } | null;
  outcomeRange: {
    minimum: string;
    ideal: string;
    description?: string;
  } | null;
  roleModels: {
    positive: string;
    negative: string;
  } | null;
  skills: Array<{ skillName: string; level: string }> | null;
  timeResources: {
    weekdayHours: number | null;
    weekendHours: number | null;
    fixedExpenditure: string | null;
  };
  energy: { energyDescription: string } | null;
  behaviorPatterns: {
    failurePatterns?: Array<{ goalDescription: string; frequency: number }>;
  } | null;
}

export function buildGoalDecomposePrompt(ctx: GoalDecomposeContext): string {
  return `你是一个目标拆解教练。根据用户的人生档案，将愿景转化为可执行的年度目标。

## 用户愿景
${ctx.vision ? `
10年愿景: ${ctx.vision.years10}
3年目标: ${ctx.vision.years3}
1年目标: ${ctx.vision.year1}` : "（未填写）"}

## 目标动机
${ctx.goalSource ? `
动机来源: ${ctx.goalSource.motivation}
为什么是现在: ${ctx.goalSource.whyNow}` : "（未填写）"}

## 可接受结果范围
${ctx.outcomeRange ? `
描述: ${ctx.outcomeRange.description || "（未填写）"}
最低可接受: ${ctx.outcomeRange.minimum}
理想结果: ${ctx.outcomeRange.ideal}` : "（未填写）"}

## 榜样与反例
${ctx.roleModels ? `
欣赏的人: ${ctx.roleModels.positive}
避免成为: ${ctx.roleModels.negative}` : "（未填写）"}

## 能力与时间资源
${ctx.skills?.length ? `核心技能: ${ctx.skills.map(s => `${s.skillName}(${s.level})`).join("、")}` : "（未填写）"}
时间资源: 工作日约${ctx.timeResources.weekdayHours ?? "?"}h/天，周末约${ctx.timeResources.weekendHours ?? "?"}h/天
${ctx.timeResources.fixedExpenditure ? `固定支出: ${ctx.timeResources.fixedExpenditure}` : ""}

## 精力模式
${ctx.energy?.energyDescription || "（未记录）"}

## 历史失败模式（避免重蹈覆辙）
${ctx.behaviorPatterns?.failurePatterns?.length ? ctx.behaviorPatterns.failurePatterns.map(f => `• ${f.goalDescription} (出现${f.frequency}次)`).join("\n") : "（暂无记录）"}

---

请根据以上信息，建议 1-3 个年度目标。要求：
1. 每个目标必须与用户的 10 年愿景和 1 年目标一致
2. 考虑用户的时间资源和精力模式，目标量要现实
3. 参考历史失败模式，避免重蹈覆辙
4. 每个目标要有明确的度量方式和目标值

输出 JSON 格式（只输出 JSON，不要其他内容）：
{
  "goals": [
    {
      "title": "目标标题",
      "description": "目标描述（为什么是这个目标，和愿景的关系）",
      "metricType": "NUMERIC|DURATION|FREQUENCY|PERCENTAGE|STAGE",
      "targetValue": "目标值（含单位，如 500000 元）",
      "startValue": "起始值（如 0）"
    }
  ],
  "reasoning": "简要说明为什么建议这些目标"
}`;
}

/**
 * 月度计划拆解 Prompt
 */
export interface MonthlyDecomposeContext {
  yearlyGoalTitle: string;
  yearlyGoalTarget: string;
  yearlyGoalMetric: string;
  yearlyGoalDescription?: string;
  timeResources: {
    weekdayHours: number | null;
    weekendHours: number | null;
  };
  energy: { energyDescription: string } | null;
}

export function buildMonthlyDecomposePrompt(ctx: MonthlyDecomposeContext): string {
  return `你是一个计划拆解教练。将年度目标拆解为月度计划。

## 年度目标
标题: ${ctx.yearlyGoalTitle}
目标值: ${ctx.yearlyGoalTarget} (${ctx.yearlyGoalMetric})
${ctx.yearlyGoalDescription ? `描述: ${ctx.yearlyGoalDescription}` : ""}

## 时间资源
工作日可用: ${ctx.timeResources.weekdayHours ?? "?"}h/天
周末可用: ${ctx.timeResources.weekendHours ?? "?"}h/天

## 精力模式
${ctx.energy?.energyDescription || "（未记录）"}

---

请将年度目标拆解为若干个月的月度计划。要求：
1. 不需要填满 12 个月，根据目标体量确定需要的月数
2. 考虑用户的时间资源，每月任务量要现实
3. 按时间顺序排列（从当前月份开始）

输出 JSON 格式：
{
  "plans": [
    {
      "month": 7,
      "title": "月度计划标题",
      "description": "具体要做的事",
      "targetValue": "月度目标值"
    }
  ]
}`;
}
