# fix-hardcoded-user-profile — 设计

## 替换逻辑

在 `runInternal()` 中，获取 review 后同时查询 User + LifeArchive，动态构建 profileText：

```typescript
private async runInternal(reviewId: string): Promise<void> {
  const review = await prisma.dailyReview.findUnique({ where: { id: reviewId } });
  if (!review) throw new Error(`Review ${reviewId} not found`);
  const userId = review.userId;

  // 动态加载用户画像
  const [user, archive] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.lifeArchive.findUnique({ where: { userId } }),
  ]);

  const profileParts: string[] = [];
  if (user) {
    const fields = [
      user.occupation && `主业：${user.occupation}`,
      user.industry && `行业：${user.industry}`,
      user.weekdayAvailableHours != null && `工作日可用时间：约${user.weekdayAvailableHours}h`,
      user.weekendAvailableHours != null && `周末可用时间：约${user.weekendAvailableHours}h`,
    ].filter(Boolean);
    if (fields.length) profileParts.push(fields.join('、'));

    if (user.goalDomains) {
      const domains = parseJsonField<string[]>(user.goalDomains, []);
      if (domains.length) profileParts.push(`关注领域：${domains.join('、')}`);
    }
  }

  if (archive?.summary) {
    profileParts.push(`\nAI 摘要：${archive.summary}`);
  }

  const userProfileText = profileParts.length > 0
    ? profileParts.join('\n')
    : '暂无用户画像数据';
```

## User Profile 在 prompt 中的位置

替换硬编码段：

```diff
- - 用户画像: ${USER_PROFILE.trim()}
+ - 用户画像: ${userProfileText}
```
