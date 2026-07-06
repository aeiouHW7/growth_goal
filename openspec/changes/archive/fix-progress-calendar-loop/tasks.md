# fix-progress-calendar-loop — 任务列表

估算: 0.2 小时
依赖链: T1

---

### T1: 用 Map 替换循环内 filter/find

**文件:** `backend/src/services/progress.service.ts`

- 在循环前构建 Map：

```typescript
// 构建 O(1) 查找 Map
const plansByDate = new Map<string, typeof dailyPlans>();
for (const p of dailyPlans) {
  const key = p.date.toISOString().slice(0, 10);
  if (!plansByDate.has(key)) plansByDate.set(key, []);
  plansByDate.get(key)!.push(p);
}

const reviewByDate = new Map<string, typeof dailyReviews[0]>();
for (const r of dailyReviews) {
  const key = r.date.toISOString().slice(0, 10);
  if (!reviewByDate.has(key)) reviewByDate.set(key, r);
}
```

- 循环体内替换为 Map.get：

```typescript
const plans = plansByDate.get(dateStr) || [];
const review = reviewByDate.get(dateStr);
```

- 验证: 日历 API 返回数据格式不变
