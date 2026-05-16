export interface DailyReviewContext {
  todayPlans: string;
  userProfile: string;
  recentReviews: string;
}

export function buildDailyReviewPrompt(ctx: DailyReviewContext): string {
  return `
## 每日复盘流程

今日计划：
${ctx.todayPlans}

用户画像（精力分配/时间段）：
${ctx.userProfile}

近期复盘：
${ctx.recentReviews}

请按以下步骤执行每日复盘：

### 阶段一：接收用户输入
1. 用户发送自由碎碎念或 "今天复盘"
2. 读取今日日计划（GET /api/plans/daily?date=today）
3. 读取用户画像

### 阶段二：结构化提取
从用户碎碎念中提取以下信息：
- 完成了什么（completed）
- 没完成什么（notCompleted）
- 遇到了什么阻碍（obstacles）
- 情绪状态（emotionState）
- 心态信号（mindsetNote）

### 阶段三：追问（如有必要）
- 判断提取的信息是否充分覆盖今日计划
- 不足时追问，最多 2 次
- 第 3 次仍不足 → 标注 [部分信息缺失] 继续

### 阶段四：四层分析
调用 POST /api/analysis/generate 生成：
1. **完成总结**：客观事实，不解释
2. **偏差分析**：与目标的差距，风险等级
3. **执行诊断**：根因分析，重复模式识别
4. **外部视角**：结合时事趋势审视方向

### 阶段五：评分反馈
展示分析报告后，要求用户打分 (0-100)：
- score < 60：追问原因 → 记录到反思
- score ≥ 80：追问好在哪 → 记录到优秀案例
`.trim();
}
