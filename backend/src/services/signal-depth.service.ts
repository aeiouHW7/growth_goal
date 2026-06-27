import type { StructuredReport } from "../types/structured-report";

export interface SignalScoreResult {
  score: number;
  baseScore: number;
  defensePenalty: number;
  gap?: "behavior_missing" | "attribution_missing" | "emotion_vague" | "time_missing" | "latent_missing" | "dimension_missing";
  followUpSuggestion?: string;
}

const DEFENSE_KEYWORDS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /没办法|控制不了|只能这样/i, label: "learned_helplessness" },
  { pattern: /都怪|要不是|因为.*才/i, label: "external_blame" },
  { pattern: /反正|就这样吧|算了/i, label: "resignation" },
  { pattern: /我知道但是|道理都懂/i, label: "rationalization" },
];

export class SignalDepthService {
  /**
   * 8 维信号厚度评分
   * 参考 self-growth-analyst 的 signal_depth_gate.md v2
   */
  score(input: string): SignalScoreResult {
    if (!input || input.trim().length === 0) {
      return { score: 0, baseScore: 0, defensePenalty: 0, gap: "behavior_missing", followUpSuggestion: "你今天做了什么？" };
    }

    // 1. 具体行为 (0-3)
    const hasConcreteAction = /做了|完成了|写了|去了|跑了|练了|搞了|开发|剪辑|处理/i.test(input);
    const hasPassive = /被|有人|他们|公司/i.test(input) && !hasConcreteAction;
    const behaviorScore = hasConcreteAction ? 3 : hasPassive ? 1 : 0;

    // 2. 归因指向 (0-2)
    const hasCause = /因为|所以|原因|导致|在于/i.test(input);
    const causeScore = hasCause ? 2 : 0;

    // 3. 情绪具体 (0-2)
    const emotionMap: Array<{ pattern: RegExp; score: number }> = [
      { pattern: /焦虑|担心|恐惧|害怕|愤怒|委屈|失落|失望|愧疚|羞耻/i, score: 2 },
      { pattern: /开心|高兴|爽|累|烦|没劲/i, score: 1.5 },
      { pattern: /还行|还好|可以|一般/i, score: 0.5 },
    ];
    let emotionScore = 0;
    for (const e of emotionMap) {
      if (e.pattern.test(input)) { emotionScore = e.score; break; }
    }

    // 4. 时间锚定 (0-2)
    const timePatterns = /今天|昨天|明天|早上|下午|晚上|凌晨|今晚|昨晚|今晚|周[一二三四五六日]|周[1-7]/i;
    const timeScore = timePatterns.test(input) ? 2 : 0;

    // 5. 涉及维度 (0-1)
    const dimensionKeywords = /工作|健身|运动|学习|视频|项目|目标|计划|复盘|产品/i;
    const dimensionScore = dimensionKeywords.test(input) ? 1 : 0;

    // 6. 隐层意图 (0-2)
    const latentClues = /但是|不过|其实|本应该|早知道|还是|应该/i;
    const latentScore = latentClues.test(input) ? 2 : 0;

    // 7. 语言温度 (0-1)
    const hotWords = /太[好棒爽开心]/i;
    const warmWords = /还行|不错|可以|挺好/i;
    const tempScore = hotWords.test(input) ? 1 : warmWords.test(input) ? 0.5 : 0;

    const baseScore = behaviorScore + causeScore + emotionScore + timeScore + dimensionScore + latentScore + tempScore;

    // 8. 防御机制扣分
    let defensePenalty = 0;
    for (const d of DEFENSE_KEYWORDS) {
      if (d.pattern.test(input)) defensePenalty += 0.5;
    }
    defensePenalty = Math.min(defensePenalty, 2);

    const finalScore = Math.max(0, Math.min(10, baseScore - defensePenalty));

    // 缺口判定 — 用各维度得分定位最需要追问的缺口
    const gap = this.determineGap({
      behavior: behaviorScore,
      cause: causeScore,
      emotion: emotionScore,
      time: timeScore,
      dimension: dimensionScore,
      latent: latentScore,
    });

    return { score: finalScore, baseScore, defensePenalty, gap };
  }

  private determineGap(scores: {
    behavior: number;
    cause: number;
    emotion: number;
    time: number;
    dimension: number;
    latent: number;
  }): SignalScoreResult["gap"] {
    // 按优先级返回第一个缺失的维度（行为 > 归因 > 情绪 > 时间 > 隐层 > 维度）
    if (scores.behavior === 0) return "behavior_missing";
    if (scores.cause === 0) return "attribution_missing";
    if (scores.emotion === 0) return "emotion_vague";
    if (scores.time === 0) return "time_missing";
    if (scores.latent === 0) return "latent_missing";
    if (scores.dimension === 0) return "dimension_missing";
    return undefined;
  }
}
