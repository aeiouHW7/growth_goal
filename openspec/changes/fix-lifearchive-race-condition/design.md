# fix-lifearchive-race-condition — 设计

## 事务包裹模式

每个分层更新方法改用 `prisma.$transaction`：

```typescript
async updateEnergy(userId: string, data: { energyDescription: string }) {
  return prisma.$transaction(async (tx) => {
    const archive = await tx.lifeArchive.findUnique({ where: { userId } });
    const current = (archive?.layerResources as Record<string, unknown>) || {};

    return tx.lifeArchive.upsert({
      where: { userId },
      create: {
        userId,
        layerResources: {
          energy: {
            ...data,
            previousEnergyDescription: null,
            lastAssessedAt: new Date().toISOString().slice(0, 10),
          },
        },
      },
      update: {
        layerResources: {
          ...current,
          energy: {
            ...data,
            previousEnergyDescription: (current.energy as Record<string, unknown>)?.energyDescription || null,
            lastAssessedAt: new Date().toISOString().slice(0, 10),
          },
        },
      },
    });
  });
}
```

`updateHealth` 和 `updateBehavior` 采用相同的模式改造。
