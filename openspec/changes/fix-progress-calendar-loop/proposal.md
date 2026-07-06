# fix-progress-calendar-loop

## 问题陈述

`progress.service.ts:72-88` 的 `calendar()` 方法中，遍历当月每一天时使用 `.filter()` 和 `.find()` 在 JavaScript 数组中做 O(n) 匹配：

```typescript
const plans = dailyPlans.filter((p) => p.date.toISOString().slice(0, 10) === dateStr);
const review = dailyReviews.find((r) => r.date.toISOString().slice(0, 10) === dateStr);
```

31 天的月份每次迭代都全量扫描 `DailyPlan[]` 和 `DailyReview[]` 数组。如果用户每天有 5-10 个计划，31 天就是 155-310 次 date 字符串比较。

## 方案对比

| 方案 | 做法 | 优点 |
|------|------|------|
| A（推荐） | 预建 `Map<dateString, item[]/item>`，循环内 O(1) 查找 | 简单，性能提升明显 |
| B | 数据库层按天 Group By | SQLite 不支持灵活日期截断 |
| C | 保持现状 | 性能浪费 |

## 设计决策

方案 A：在循环外分别构建 `dailyPlansMap: Map<string, DailyPlan[]>` 和 `dailyReviewsMap: Map<string, DailyReview>`，循环内 O(1) 查找。

## 影响范围

| 文件 | 改动 |
|------|------|
| `backend/src/services/progress.service.ts` | `calendar()` 方法添加 Map 预建，替换 filter/find |

## 验收

- `GET /api/progress/calendar?year=&month=` 返回格式不变
- 循环内部使用 Map.get() 替代数组 filter/find
