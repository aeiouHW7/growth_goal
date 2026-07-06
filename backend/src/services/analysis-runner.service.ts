/**
 * AI 分析运行器 — 调用 Claude CLI 完成完整分析流程
 *
 * 流程（同 Bridge auto-processor.cjs）：
 * 1. 获取复盘 → 2. 获取上下文(pattern/bias/capability) → 3. 构建 prompt
 * 4. 调 claude CLI → 5. 解析 JSON → 6. 保存 → 7. 追踪 pattern/bias/capability
 */
import { spawn } from "child_process";
import { prisma } from "../prisma";
import { PatternService } from "./pattern.service";
import { BiasDetectionService } from "./bias-detection.service";
import { CapabilityService } from "./capability.service";

const ANALYSIS_REQUIREMENTS = `
1. **偏误分析** — 回顾用户输入中的表达方式，判断是否存在以下偏误：计划谬误（过度乐观）、自我美化（模糊表述）、基本归因错误（外归因）、确认偏误（只找支持自己的论据）、损失厌恶（怕损失>想获得）、事后合理化（为过去找理由）、现状偏差（懒得改）、聚类错觉（以偏概全）。每条偏误必须引用用户原文作为 triggerPhrase，输出到 detectedBiases

2. **执行诊断（Fogg 模型）** — 对于"知道该做但没做"的问题，判断是动机(M)不足、能力(A)不足还是提示(P)不足，输出到 executionDiagnosis.issues 和 foggDiagnosis。写 issues 时注意每条表述要具体一致（如"运动计划未执行（连续第3天）"），方便后续识别为同一问题的重复出现

3. **模式对照** — 对照「行为模式」列表中已知的反复障碍。如果本次的某条 issue 和列表中的模式相似，在 detectedPatterns 中记录，frequency 直接使用列表中的已有次数+1

4. **能力评分** — 对照「能力评分」基线，对本次复盘涉及到的维度打 0-10 分，在 evidence 中注明进步/退步/维持及行为证据。输出到 capabilityDeltas（注意：必须使用数组格式 [{dimension, score, evidence}]）

5. **洞察（三段式）** — unaware：他没意识到的言外之意（不推测情绪，只说"你说了A，可能在想B"）；pattern：模式判断（反复障碍/新话题）；missing：与目标相关的行动是否缺失

6. **充沛率评估** — 根据用户输入的睡眠质量、日间精力、情绪状态、产出效率综合推断今日充沛率（1-100），不允许留空。输出到 energyRate
`;

const JSON_SCHEMA = `{
  "completionSummary": { "completed": [], "notCompleted": [], "completionRate": "0%" },
  "deviationAnalysis": { "onTrack": [], "behind": [], "riskLevel": "低|中|高" },
  "executionDiagnosis": { "issues": [], "rootCause": "", "pattern": "" },
  "foggDiagnosis": { "missing": "M|A|P", "detail": "" },
  "externalPerspective": { "trendInsights": [], "directionCheck": "", "newOpportunities": [], "risks": [] },
  "detectedBiases": [{ "type": "", "triggerPhrase": "", "evidence": "" }],
  "detectedPatterns": [{ "pattern": "", "dimension": "", "frequency": 0 }],
  "capabilityDeltas": [{ "dimension": "", "score": 0, "evidence": "" }],
  "postureTraining": { "completed": false, "note": "" },
  "energyRate": 0,
  "signalScore": 0,
  "insight": { "unaware": "", "pattern": "", "missing": "" },
  "suggestions": [{ "type": "positive|warning|critical", "message": "" }]
}`;

export class AnalysisRunner {
  /**
   * 对指定复盘运行完整 AI 分析
   * 异步执行，不阻塞调用方
   */
  async run(reviewId: string): Promise<void> {
    try {
      await this.runInternal(reviewId);
    } catch (err) {
      console.error(`[AnalysisRunner] Failed for review ${reviewId}:`, err);
    }
  }

  private async runInternal(reviewId: string): Promise<void> {
    // 1. 获取复盘
    const review = await prisma.dailyReview.findUnique({ where: { id: reviewId } });
    if (!review) throw new Error(`Review ${reviewId} not found`);
    const userId = review.userId;

    // 2. 获取上下文（用户画像 + 复盘上下文）
    const todayStr = review.date.toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

    // 动态加载用户画像（替代硬编码 USER_PROFILE）
    const [user, archive] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.lifeArchive.findUnique({ where: { userId } }),
    ]);
    const profileParts: string[] = [];
    if (user) {
      const fields = [
        user.occupation && `主业：${user.occupation}`,
        user.industry && `行业：${user.industry}`,
        user.weekdayAvailableHours != null && `工作日可用：约${user.weekdayAvailableHours}h`,
        user.weekendAvailableHours != null && `周末可用：约${user.weekendAvailableHours}h`,
      ].filter(Boolean);
      if (fields.length) profileParts.push(fields.join('、'));
      if (user.goalDomains) {
        try {
          const domains = JSON.parse(user.goalDomains);
          if (Array.isArray(domains) && domains.length) {
            profileParts.push(`关注领域：${domains.join('、')}`);
          }
        } catch { /* 忽略解析失败 */ }
      }
    }
    if (archive?.summary) {
      profileParts.push(`\nAI 摘要：${archive.summary}`);
    }
    const userProfileText = profileParts.length > 0
      ? profileParts.join('\n')
      : '暂无用户画像数据';

    const [plansRes, patternsRes, biasesRes, capsRes] = await Promise.all([
      prisma.dailyPlan.findMany({ where: { userId, date: review.date } }).catch(() => []),
      prisma.behaviorPattern.findMany({ where: { userId, active: true } }).catch(() => []),
      prisma.cognitiveBiasLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 }).catch(() => []),
      prisma.capabilityScore.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }).catch(() => []),
    ]);

    const recentReviews = await prisma.dailyReview.findMany({
      where: { userId, date: { gte: new Date(weekAgo) } },
      orderBy: { date: "desc" },
      take: 5,
    }).catch(() => []);

    const plansText = plansRes.map(p => `• ${p.title} (${p.status})`).join('\n') || '暂无';
    const patternsText = patternsRes.map(p => `• ${p.pattern} (${p.frequency}次)`).join('\n') || '暂无';
    const biasesText = biasesRes.map(b => `• ${b.biasType}: ${b.triggerPhrase}`).join('\n') || '暂无';
    const capsText = capsRes.map(c => `• ${c.dimension}: ${c.score}`).join('\n') || '暂无';
    const recentText = recentReviews.slice(0, 5).map(r =>
      `${r.date.toISOString().slice(5, 10)}: ${(r.rawInput || '').slice(0, 60)}`
    ).join('\n') || '暂无';

    // 3. 构建 prompt
    const userPrompt = `你是一个复盘分析师。根据用户的今日复盘输入，生成结构化分析报告。

用户输入: ${review.rawInput}

上下文:
- 今日计划:
${plansText}
- 最近复盘:
${recentText}
- 行为模式:
${patternsText}
- 认知偏误:
${biasesText}
- 能力评分:
${capsText}
- 用户画像: ${userProfileText}

要求输出JSON，schema如下:

${ANALYSIS_REQUIREMENTS.trim()}

${JSON_SCHEMA}

只输出JSON，不要其他内容。`;

    // 4. 调 claude CLI
    const analysisText = await this.callClaude(userPrompt);

    // 5. 解析 JSON
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in Claude response");
    const report = JSON.parse(jsonMatch[0]);

    // 6. 保存分析 + 追踪 pattern/bias/capability（事务包裹，保证原子性）
    const patternService = new PatternService();
    const biasDetection = new BiasDetectionService();
    const capabilityService = new CapabilityService();

    await prisma.$transaction(async (tx) => {
      const analysis = await tx.aIAnalysis.create({
        data: {
          dailyReviewId: review.id,
          analysisType: "DAILY",
          structuredReport: report,
          narrativeReport: null,
        },
      });

      await Promise.allSettled([
        patternService.trackIssuesFromAnalysis(userId, report, tx).catch(() => {}),
        biasDetection.logFromAnalysis(userId, review.id, report, tx).catch(() => {}),
        capabilityService.logFromAnalysis(userId, report.capabilityDeltas || [], tx).catch(() => {}),
      ]);
    });
  }

  private callClaude(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn('claude', ['-p', '-'], {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      let out = '', errOut = '';
      const timer = setTimeout(() => {
        proc.kill();
        reject(new Error('Claude CLI timeout after 120s'));
      }, 120000);

      proc.stdout.on('data', d => out += d);
      proc.stderr.on('data', d => errOut += d);
      proc.on('error', e => { clearTimeout(timer); reject(e); });
      proc.on('close', code => {
        clearTimeout(timer);
        if (code !== 0) reject(new Error(`Claude CLI exit ${code}: ${errOut.slice(0, 200)}`));
        else resolve(out);
      });
      proc.stdin.write(prompt);
      proc.stdin.end();
    });
  }
}
