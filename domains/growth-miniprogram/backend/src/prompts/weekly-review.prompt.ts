export interface CycleReviewContext {
  cycleType: "WEEKLY" | "MONTHLY";
  periodDescription: string;
  dailyReviews: string;
  missingDays: string;
  userProfile: string;
  goalProgress: string;
}

export function buildCycleReviewPrompt(ctx: CycleReviewContext): string {
  const isWeekly = ctx.cycleType === "WEEKLY";
  const checkEndpoint = isWeekly
    ? "GET /api/reviews/weekly/check?year=&week="
    : "GET /api/reviews/monthly/check?year=&month=";
  const createEndpoint = isWeekly
    ? "POST /api/reviews/weekly"
    : "POST /api/reviews/monthly";

  return `
## ${isWeekly ? "周" : "月"}复盘流程

周期：${ctx.periodDescription}

### 阶段一：检测触发
1. 调用 ${checkEndpoint} 检测是否需要触发
2. 如需触发，读取周期内所有复盘数据

### 阶段二：检查缺失
每日复盘数据：
${ctx.dailyReviews}

缺失天数：
${ctx.missingDays}

- 如有缺失天数 → 询问用户原因并记录到 missingDays

### 阶段三：聚合分析
目标进度：
${ctx.goalProgress}

用户画像：
${ctx.userProfile}

生成完整分析：
1. **周期总结**：整体完成情况
2. **趋势分析**：与上一周期对比
3. **模式识别**：重复出现的问题或亮点
4. **外部视角**：搜索当前时事趋势，结合目标方向审视
   - 如外部搜索失败 → 标注 [外部信息获取失败]，不阻塞分析

### 阶段四：用户补充
1. 展示聚合报告
2. 用户可补充个人感受/细节
3. 调用 ${createEndpoint} 保存

### 阶段五：评分反馈
- 用户打分 (0-100)
- < 60 记录反思，≥ 80 记录优秀案例
`.trim();
}
