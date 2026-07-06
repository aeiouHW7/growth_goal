# fix-analysis-runner-transaction — 设计

## Prisma TransactionClient 在子服务中的模式

每个子服务的方法接受一个可选 `tx` 参数：

```typescript
// pattern.service.ts
async trackIssuesFromAnalysis(
  userId: string,
  structuredReport: Record<string, any>,
  tx?: Prisma.TransactionClient,
): Promise<DetectedPattern[]> {
  const db = tx || prisma;
  // ... 原有逻辑，所有 db.xxx 调用替换为 db
}
```

```typescript
// bias-detection.service.ts
async logFromAnalysis(
  userId: string,
  dailyReviewId: string | null,
  report: Record<string, any>,
  tx?: Prisma.TransactionClient,
) {
  const db = tx || prisma;
  // ... 原有逻辑
}
```

```typescript
// capability.service.ts
async logFromAnalysis(
  userId: string,
  deltas: Array<{ dimension: string; score: number; evidence: string }>,
  tx?: Prisma.TransactionClient,
) {
  const db = tx || prisma;
  // ... 原有逻辑
}
```

## AnalysisRunner.runInternal 改造

```typescript
private async runInternal(reviewId: string): Promise<void> {
  const review = await prisma.dailyReview.findUnique({ where: { id: reviewId } });
  if (!review) throw new Error(`Review ${reviewId} not found`);
  const userId = review.userId;

  // ... (上下文收集不变) ...

  const analysisText = await this.callClaude(userPrompt);
  // ... (JSON 解析不变) ...

  // 事务包裹全部写入操作
  await prisma.$transaction(async (tx) => {
    const analysis = await tx.aIAnalysis.create({
      data: {
        dailyReviewId: review.id,
        analysisType: "DAILY",
        structuredReport: report,
        narrativeReport: null,
      },
    });

    await tx.dailyReview.update({
      where: { id: review.id },
      data: { status: "ANALYZING" },
    });

    const patternService = new PatternService();
    const biasDetection = new BiasDetectionService();
    const capabilityService = new CapabilityService();

    await Promise.all([
      patternService.trackIssuesFromAnalysis(userId, report, tx).catch(() => {}),
      biasDetection.logFromAnalysis(userId, review.id, report, tx).catch(() => {}),
      capabilityService.logFromAnalysis(userId, report.capabilityDeltas || [], tx).catch(() => {}),
    ]);
  });
}
```

> 注意：子服务的 `.catch(() => {})` 保留在事务内，因为偏误/模式/评分追踪属于"尽力而为"的辅助写。事务确保主数据（analysis + review status）不因辅助写失败而回滚。
