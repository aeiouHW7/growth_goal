import {
  buildGoalDecomposePrompt,
  buildMonthlyDecomposePrompt,
  GoalDecomposeContext,
  MonthlyDecomposeContext,
} from "../prompts/goal-decompose.prompt";

describe("buildGoalDecomposePrompt — LifeArchive summary 注入", () => {
  const baseCtx: GoalDecomposeContext = {
    vision: { years10: "成为 AI leader", years3: "年入 80 万", year1: "年入 50 万" },
    goalSource: { motivation: "自由", whyNow: "行业爆发" },
    outcomeRange: { minimum: "稳定 30 万", ideal: "财务独立" },
    roleModels: { positive: "AI 独立开发者", negative: "技能单一者" },
    skills: [{ skillName: "AI 产品", level: "高级" }],
    timeResources: { weekdayHours: 4, weekendHours: 8, fixedExpenditure: null },
    energy: { energyDescription: "晨型人" },
    behaviorPatterns: { failurePatterns: [] },
  };

  it("无 summary 时注入占位（不报错）", () => {
    const prompt = buildGoalDecomposePrompt({ ...baseCtx, summary: undefined });
    expect(prompt).toContain("## 人生档案摘要");
    expect(prompt).toContain("（无摘要）");
  });

  it("有 summary 时注入摘要内容", () => {
    const prompt = buildGoalDecomposePrompt({
      ...baseCtx,
      summary: "INTJ · 开放 78 · 技能 AI 产品经理 · 愿景技术 leader",
    });
    expect(prompt).toContain("## 人生档案摘要");
    expect(prompt).toContain("INTJ · 开放 78 · 技能 AI 产品经理 · 愿景技术 leader");
    expect(prompt).not.toContain("（无摘要）");
  });
});

describe("buildMonthlyDecomposePrompt — LifeArchive summary 注入", () => {
  const baseCtx: MonthlyDecomposeContext = {
    yearlyGoalTitle: "年收入 50 万",
    yearlyGoalTarget: "500000",
    yearlyGoalMetric: "NUMERIC",
    timeResources: { weekdayHours: 4, weekendHours: 8 },
    energy: { energyDescription: "晨型人" },
  };

  it("无 summary 时注入占位（不报错）", () => {
    const prompt = buildMonthlyDecomposePrompt({ ...baseCtx, summary: undefined });
    expect(prompt).toContain("## 人生档案摘要");
    expect(prompt).toContain("（无摘要）");
  });

  it("有 summary 时注入摘要内容", () => {
    const prompt = buildMonthlyDecomposePrompt({
      ...baseCtx,
      summary: "晨型人 · 工作日 4h 可用 · 开源进度偏慢",
    });
    expect(prompt).toContain("## 人生档案摘要");
    expect(prompt).toContain("晨型人 · 工作日 4h 可用 · 开源进度偏慢");
    expect(prompt).not.toContain("（无摘要）");
  });
});
