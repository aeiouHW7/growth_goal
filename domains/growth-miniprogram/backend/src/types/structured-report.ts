export interface StructuredReport {
  /** 完成总结 */
  completionSummary?: {
    completed: string[];
    notCompleted: string[];
    completionRate: string;
  };
  /** 偏差分析 */
  deviationAnalysis?: {
    onTrack: string[];
    behind: string[];
    riskLevel: string;
  };
  /** 执行诊断 */
  executionDiagnosis?: {
    issues: string[];
    rootCause: string;
    pattern?: string;
    fogModel?: {
      prompt?: string;
      ability?: string;
      motivation?: string;
    };
  };
  /** 调整建议 */
  adjustmentSuggestions?: {
    planChanges: string[];
    executionOptimization: string[];
  };
  /** 外部视角 */
  externalPerspective?: {
    trendInsights: string[];
    directionCheck: string;
    newOpportunities: string[];
    risks: string[];
  };
  /** 累积改进建议 */
  suggestions?: Array<{
    type: "critical" | "warning" | "positive";
    message: string;
  }>;

  // ===== 每日必填指标 =====

  /** 充沛率 (1-100) */
  energyRate?: number;
  /** 体态训练 */
  postureTraining?: {
    completed: boolean;
    note?: string;
  };

  // ===== self-growth-analyst 引擎输出 =====

  /** 信号厚度评分 (0-10) */
  signalScore?: number;
  /** 信号缺口类型 */
  signalGap?: "behavior_missing" | "attribution_missing" | "emotion_vague" | "time_missing" | "latent_missing" | "dimension_missing";

  /** 检测到的行为模式 */
  detectedPatterns?: Array<{
    pattern: string;
    dimension?: string;
    frequency: number;
    firstDetected?: string;
  }>;

  /** 检测到的认知偏误 */
  detectedBiases?: Array<{
    type: string;
    triggerPhrase: string;
    evidence: string;
  }>;

  /** Fogg 行为模型诊断 */
  foggDiagnosis?: {
    missing: "M" | "A" | "P";
    detail: string;
  };

  /** 三段式洞察 */
  insight?: {
    unaware: string;    // 他没意识到的
    pattern: string;    // 什么模式
    missing: string;    // 什么缺失
  };

  /** 能力评分变化（Claude 输出绝对值 score，后端自动算 delta） */
  capabilityDeltas?: Array<{
    dimension: string;
    score: number;
    evidence: string;
  }>;
}
