# fix-capability-service-query — 任务列表

估算: 0.2 小时
依赖链: T1

---

### T1: 限制 getLatestScores 查询范围

**文件:** `backend/src/services/capability.service.ts`

```diff
  async getLatestScores(userId: string) {
+   const since = new Date();
+   since.setDate(since.getDate() - 90);
+
    const scores = await prisma.capabilityScore.findMany({
      where: { userId,
+       createdAt: { gte: since },
+     },
      orderBy: { createdAt: "desc" },
+     take: 100,
    });
    // ... dedup 逻辑不变 ...
  }
```

- 验证: 返回格式不变，每个维度仍取最新一条
