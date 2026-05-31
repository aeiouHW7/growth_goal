import { prisma } from "../src/prisma";
import { PatternService } from "../src/services/pattern.service";
import { BiasDetectionService } from "../src/services/bias-detection.service";
import { SignalDepthService } from "../src/services/signal-depth.service";

const REVIEW_ID = "d0a7b1e8-a12d-48ea-ad49-7354da6fcf03";
const OLD_ANALYSIS_ID = "6f543b38-7725-4439-b64c-4c7309cea423";
const USER_ID = "1e285969-0593-48fe-a438-dd213f99e7e0";

const RAW_INPUT =
  "今天6:30起来的；今天出的视频不顺利，计划6月底能完成视频第一期的视频剪辑；白天工作主要是处理知识库这个需求的一些产品方案；晚上回家做了运动；然后和男友看了会视频，现在继续把这个复盘小工具搞完，今天要是周六可以晚点睡觉。情绪挺开心的，今天周五还终于不下雨了，天气很晴朗";

async function main() {
  // 1. Signal scoring
  const signalService = new SignalDepthService();
  const signalResult = signalService.score(RAW_INPUT);
  console.log("=== Signal Score ===");
  console.log(JSON.stringify(signalResult, null, 2));

  // 2. Pattern detection
  const patternService = new PatternService();
  const patterns = await patternService.detect(USER_ID, RAW_INPUT);
  console.log("\n=== Detected Patterns ===");
  console.log(JSON.stringify(patterns, null, 2));

  // 3. Bias detection
  const biasService = new BiasDetectionService();
  const biases = biasService.detect(RAW_INPUT);
  console.log("\n=== Detected Biases ===");
  console.log(JSON.stringify(biases, null, 2));

  // 4. Delete old analysis + feedbacks
  console.log("\n=== Deleting Old Analysis ===");
  await prisma.aIReflection.deleteMany({
    where: { feedback: { aiAnalysisId: OLD_ANALYSIS_ID } },
  });
  await prisma.aISuccessCase.deleteMany({
    where: { feedback: { aiAnalysisId: OLD_ANALYSIS_ID } },
  });
  await prisma.aIAnalysisFeedback.deleteMany({
    where: { aiAnalysisId: OLD_ANALYSIS_ID },
  });
  await prisma.aIAnalysis.delete({ where: { id: OLD_ANALYSIS_ID } });
  console.log("Old analysis deleted.");

  // 5. Create new analysis with full engine outputs
  const signalPatterns = patterns
    .filter((p) => p.frequency >= 3)
    .map((p) => ({
      pattern: p.pattern,
      frequency: p.frequency,
    }));

  const videoPattern = patterns.find((p) => p.pattern === "视频制作");

  const newAnalysis = await prisma.aIAnalysis.create({
    data: {
      dailyReviewId: REVIEW_ID,
      analysisType: "DAILY",
      structuredReport: {
        signalScore: signalResult.score,
        signalGap: signalResult.gap,
        baseScore: signalResult.baseScore,
        defensePenalty: signalResult.defensePenalty,
        defenseDetails: signalResult.defenseDetails,
        dimensionScores: signalResult.dimensions,

        detectedPatterns: patterns.map((p) => ({
          pattern: p.pattern,
          frequency: p.frequency,
          dimension: p.dimension,
        })),
        signalPatterns:
          signalPatterns.length > 0 ? signalPatterns : undefined,

        detectedBiases: biases.map((b) => ({
          type: b.type,
          triggerPhrase: b.triggerPhrase,
          evidence: b.evidence,
        })),

        foggDiagnosis: {
          missing: "A",
          detail:
            "视频制作跳过流程 -> 能力(A)不足：缺少标准操作流程(SOP)作为执行指引。上次反馈说'下次一定按流程走'但缺少具体步骤清单，属于能力维度不足而非动机不足。",
        },
        insight: {
          unaware:
            "你说视频剪辑不顺利，但核心问题不是技术难度，而是缺少可复用的标准流程(checklist)。每次从头想流程比执行本身更耗能。",
          pattern:
            videoPattern && videoPattern.frequency >= 3
              ? "[模式信号] 视频制作已出现 " +
                videoPattern.frequency +
                " 次，持续出现流程跳过问题"
              : "[新话题] 视频制作首次出现或频率较低",
          missing:
            "目标行动方面：提到了6月底完成视频第一期剪辑的年度目标关联行动，但缺少具体的拆解步骤和里程碑。",
        },
        completionSummary: {
          completed: ["6:30起床", "处理知识库产品方案", "运动", "和男友看视频"],
          notCompleted: ["视频第一期剪辑"],
          completionRate: "70%",
        },
        deviationAnalysis: {
          behind: ["视频剪辑进度 — 跳过流程导致返工风险"],
          onTrack: ["作息规律(6:30起床)", "运动习惯保持", "工作推进"],
          riskLevel: "中",
        },
        executionDiagnosis: {
          issues: [
            "视频制作未按流程走导致生成困难 — 属于Fogg模型能力(A)不足",
            "补偿机制检查：上次说'明天按流程来'，今日未执行 -> 补偿失败",
          ],
          pattern: "创作类任务容易跳过流程直接做，缺少checklist约束",
          rootCause:
            "流程执行力不足 — 缺少最小可行流程(SOP)和前置checklist",
          foggAnalysis: {
            motivation: "足够（想做视频）",
            ability: "不足（缺少标准化流程指引）",
            prompt: "不足（没有在开始前触发流程检查的机制）",
            recommendation:
              "1. 建立视频制作checklist（打印/贴墙）；2. 每次开始前先逐项确认；3. 和男友约定互相检查机制",
          },
        },
        externalPerspective: {
          risks: ["跳过流程 -> 返工 -> 时间成本翻倍 -> 影响6月底目标"],
          trendInsights: [
            "AI视频工具迭代快，流程化是保证交付质量的关键能力",
          ],
          directionCheck: "方向正确，需加强流程管理和执行SOP建设",
          newOpportunities: [],
          timeAllocation: {
            maintenance: "工作处理知识库方案",
            growth: "视频制作、复盘工具开发",
            waste: "跳过流程导致的返工时间",
            suggestion:
              "减少消耗型时间（返工），用checklist把growth型任务标准化",
          },
        },
        energyRate: 55,
        energyNote: "睡了7h13min，醒来仍困，眼睛干",
        postureTraining: { completed: true, note: "做了训练" },
        suggestions: [
          {
            type: "critical",
            message:
              "视频制作前必须拉checklist，逐项确认后再开始",
          },
          {
            type: "critical",
            message:
              "与男友约定互相检查机制，确保流程不被跳过",
          },
          {
            type: "warning",
            message:
              "补偿机制失败：上次说'下次按流程'但未执行，需更强约束",
          },
          {
            type: "warning",
            message:
              "6月底目标缺少中间里程碑，建议拆解到每周",
          },
          {
            type: "positive",
            message: "早起+运动习惯稳定，继续保持",
          },
          {
            type: "positive",
            message: "情绪积极，天气转好有助状态提升",
          },
        ],
      },
    },
  });

  console.log("\n=== New Analysis Created ===");
  console.log("ID:", newAnalysis.id);

  // 6. Log biases to DB
  await biasService.logBiases(USER_ID, REVIEW_ID, biases);
  console.log("\nBiases logged to DB.");

  // 7. Update review status
  await prisma.dailyReview.update({
    where: { id: REVIEW_ID },
    data: { status: "ANALYZING" },
  });
  console.log("Review status updated.");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
