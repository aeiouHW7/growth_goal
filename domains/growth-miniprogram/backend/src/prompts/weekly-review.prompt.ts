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

### 阶段三：聚合分析（含模式识别 + 认知偏误趋势 + 机会成本）

目标进度：
${ctx.goalProgress}

用户画像：
${ctx.userProfile}

生成完整分析，必须包含以下四个子层：

**1. 周期总结**
- 整体完成率
- 与上一周期对比（趋势方向）

**2. 模式识别（核心差异化）**
扫描周期内所有每日复盘，查找**频率 ≥ 3 次的重复模式**：

| 模式类型 | 举例 | 信号意义 |
|---------|------|---------|
| 重复阻碍 | 用户 3 次提到"会议干扰" | 系统性时间管理问题 |
| 重复情绪 | 多天出现"焦虑""疲惫" | 需关注心理状态 |
| 重复偏误 | 多次出现计划谬误/自我美化 | 思维习惯问题 |
| 重复亮点 | 多次提到某个高效时段 | 可复用的成功模式 |
| 沉默信号 | 某个目标维度一直未被提及 | 可能被忽视或回避 |

- 识别后清晰表述：这个${isWeekly ? "周" : "月"}，你 N 次提到「主题」，这已形成一个需要关注的模式
- 如果无频率 ≥ 3 的模式，注明"无明显重复模式"

**3. 认知偏误趋势**
回顾周期内的决策和判断，检测：
- 是否持续存在某种偏误（如每周都低估任务时间）
- 偏误是否在用户意识到后有所改善（对照反馈记录）
- 给出具体的改进建议

**4. 外部视角 + 机会成本分析**
- 搜索当前时事趋势，结合目标方向审视
  - 如外部搜索失败 → 标注 [外部信息获取失败]，不阻塞分析
- **时间配置审计**：将周期内的时间按三类归类：
  - 🟢 增长型（直接推进目标）
  - 🟡 维护型（必要但不推进目标）
  - 🔴 消耗型（低价值耗散）
  - 如果消耗型 > 30%，给出调整建议
- **Fogg 趋势分析**：如果某个执行问题反复出现，判断是 M/A/P 中哪个要素持续不足：
  - 持续动机不足 → 建议重新审视目标与个人价值观的连接
  - 持续能力不足 → 建议拆解任务或学习新技能
  - 持续提示缺失 → 建议建立固定的时间块或提醒机制

### 阶段四：用户补充
1. 展示聚合报告
2. 用户可补充个人感受/细节
3. 调用 ${createEndpoint} 保存

### 阶段五：评分反馈
- 用户打分 (0-100)
- < 60 记录反思，≥ 80 记录优秀案例
`.trim();
}
