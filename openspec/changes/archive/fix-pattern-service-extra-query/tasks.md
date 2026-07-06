# fix-pattern-service-extra-query — 任务列表

估算: 0.2 小时
依赖链: T1

---

### T1: 删除多余 findUnique

**文件:** `backend/src/services/pattern.service.ts`

```diff
       if (matched) {
-        await prisma.behaviorPattern.update({
+        const updated = await prisma.behaviorPattern.update({
           where: { id: matched.id },
           data: { lastDetected: new Date(), frequency: { increment: 1 } },
         });
       } else {
-        const created = await prisma.behaviorPattern.create({
+        const updated = await prisma.behaviorPattern.create({
           data: { ... },
         });
-        matched = created;
+        matched = updated;
       }

-      const updated = await prisma.behaviorPattern.findUnique({ where: { id: matched.id } });
       if (updated) {
         results.push({
           pattern: updated.pattern,
```
- 验证: `trackIssuesFromAnalysis` 返回的 frequency 与数据库中一致
