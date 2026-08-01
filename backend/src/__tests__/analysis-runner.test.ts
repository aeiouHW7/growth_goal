import { AnalysisRunner } from "../services/analysis-runner.service";
import { prisma } from "../prisma";

const MOCK_JSON = `__JSON_START__{"completionSummary":{"completed":[],"notCompleted":[],"completionRate":"50%"},"deviationAnalysis":{"onTrack":[],"behind":[],"riskLevel":"中"},"executionDiagnosis":{"issues":[]},"foggDiagnosis":{"missing":"M"},"externalPerspective":{},"detectedBiases":[],"detectedPatterns":[],"capabilityDeltas":[{"dimension":"执行","score":6,"evidence":"维持"}],"postureTraining":{},"energyRate":70,"signalScore":8,"insight":{},"suggestions":[]}__JSON_END__`;

jest.mock("child_process", () => ({
  spawn: jest.fn(() => {
    const proc: any = {
      stdout: { on: (ev: string, cb: (d: any) => void) => { if (ev === "data") setImmediate(() => cb(Buffer.from(MOCK_JSON))); } },
      stderr: { on: jest.fn() },
      on: (ev: string, cb: (c: number) => void) => { if (ev === "close") setImmediate(() => cb(0)); },
      stdin: { write: jest.fn(), end: jest.fn() },
      kill: jest.fn(),
    };
    return proc;
  }),
}));

jest.mock("../prisma", () => ({
  prisma: {
    dailyReview: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    weeklyReview: { findUnique: jest.fn(), update: jest.fn() },
    monthlyReview: { findUnique: jest.fn(), update: jest.fn() },
    user: { findUnique: jest.fn() },
    lifeArchive: { findUnique: jest.fn() },
    behaviorPattern: { findMany: jest.fn() },
    cognitiveBiasLog: { findMany: jest.fn() },
    capabilityScore: { findMany: jest.fn() },
    dailyPlan: { findMany: jest.fn() },
    monthlyPlan: { findMany: jest.fn() },
    aIAnalysis: { create: jest.fn() },
    $transaction: jest.fn(),
  },
}));

jest.mock("../services/pattern.service", () => ({
  PatternService: jest.fn(() => ({ trackIssuesFromAnalysis: jest.fn(() => Promise.resolve()) })),
}));
jest.mock("../services/bias-detection.service", () => ({
  BiasDetectionService: jest.fn(() => ({ logFromAnalysis: jest.fn(() => Promise.resolve()) })),
}));
jest.mock("../services/capability.service", () => ({
  CapabilityService: jest.fn(() => ({ logFromAnalysis: jest.fn(() => Promise.resolve()) })),
}));

const tx = { aIAnalysis: { create: jest.fn() } };
let createCalls: any[] = [];

beforeEach(() => {
  jest.clearAllMocks();
  createCalls = [];
  (prisma.$transaction as jest.Mock).mockImplementation(async (fn: (t: typeof tx) => any) => {
    tx.aIAnalysis.create.mockImplementation((args: any) => {
      createCalls.push(args);
      return Promise.resolve({ id: "a1" });
    });
    return fn(tx);
  });

  (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "u1", occupation: "PM", industry: "AI", weekdayAvailableHours: 4, weekendAvailableHours: 8, goalDomains: null });
  (prisma.lifeArchive.findUnique as jest.Mock).mockResolvedValue({ userId: "u1", summary: "INTJ · 技能 AI 产品经理" });
  (prisma.behaviorPattern.findMany as jest.Mock).mockResolvedValue([]);
  (prisma.cognitiveBiasLog.findMany as jest.Mock).mockResolvedValue([]);
  (prisma.capabilityScore.findMany as jest.Mock).mockResolvedValue([]);
});

describe("AnalysisRunner — 周复盘分析", () => {
  beforeEach(() => {
    (prisma.dailyReview.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.monthlyReview.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.weeklyReview.findUnique as jest.Mock).mockResolvedValue({
      id: "w1", userId: "u1",
      weekStart: new Date("2026-06-22"), weekEnd: new Date("2026-06-28"),
      year: 2026, week: 27, status: "ANALYZING", rawInput: null, summary: null,
    });
  });

  it("周期内有日复盘时生成 WEEKLY 分析（关联 weeklyReviewId + 12 维度 report）", async () => {
    (prisma.dailyReview.findMany as jest.Mock).mockResolvedValue([
      { id: "d1", userId: "u1", date: new Date("2026-06-22"), rawInput: "完成项目提案" },
      { id: "d2", userId: "u1", date: new Date("2026-06-23"), rawInput: "会议偏多" },
    ]);
    (prisma.dailyPlan.findMany as jest.Mock).mockResolvedValue([{ title: "写提案", status: "COMPLETED" }]);

    const runner = new AnalysisRunner();
    await runner.run("w1");

    expect(createCalls).toHaveLength(1);
    const data = createCalls[0].data;
    expect(data.analysisType).toBe("WEEKLY");
    expect(data.weeklyReviewId).toBe("w1");
    // 12 维度结构：核心字段存在
    expect(data.structuredReport.completionSummary).toBeDefined();
    expect(data.structuredReport.detectedBiases).toBeDefined();
    expect(data.structuredReport.capabilityDeltas).toBeDefined();
    expect(data.structuredReport.suggestions).toBeDefined();
  });

  it("周期内无日复盘时拒绝生成，回退状态为 INPUTTING", async () => {
    (prisma.dailyReview.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.weeklyReview.update as jest.Mock).mockResolvedValue({});

    const runner = new AnalysisRunner();
    await runner.run("w1");

    expect(createCalls).toHaveLength(0);
    expect(prisma.weeklyReview.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "w1" }, data: { status: "INPUTTING" } }),
    );
  });
});

describe("AnalysisRunner — 月复盘分析", () => {
  beforeEach(() => {
    (prisma.dailyReview.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.weeklyReview.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.monthlyReview.findUnique as jest.Mock).mockResolvedValue({
      id: "m1", userId: "u1", month: 6, year: 2026, status: "ANALYZING", rawInput: null, summary: null,
    });
    (prisma.dailyReview.findMany as jest.Mock).mockResolvedValue([
      { id: "d1", userId: "u1", date: new Date("2026-06-01"), rawInput: "月初复盘" },
      { id: "d2", userId: "u1", date: new Date("2026-06-15"), rawInput: "月中复盘" },
    ]);
    (prisma.monthlyPlan.findMany as jest.Mock).mockResolvedValue([{ title: "月目标", status: "ACTIVE" }]);
  });

  it("生成 MONTHLY 分析（关联 monthlyReviewId）", async () => {
    const runner = new AnalysisRunner();
    await runner.run("m1");

    expect(createCalls).toHaveLength(1);
    const data = createCalls[0].data;
    expect(data.analysisType).toBe("MONTHLY");
    expect(data.monthlyReviewId).toBe("m1");
  });
});
