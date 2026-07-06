# fix-lifearchive-race-condition — 验收规格

## Requirement R-1：原子读写

- **前置**：用户有 LifeArchive 记录
- **操作**：并发调用 `updateEnergy` 两次，传不同 energyDescription
- **预期**：最终 `layerResources.energy` 包含两个操作的合并结果，而不是后写入覆盖先写入
- **证据**：并发测试脚本验证

## Requirement R-2：原有行为不变

- **前置**：单线程调用 `updateEnergy`
- **操作**：传 energyDescription="上午精力好"
- **预期**：`layerResources.energy.energyDescription` 为 "上午精力好"，`previousEnergyDescription` 为上一次的值（或 null）
- **证据**：API 测试验证

## Edge Case

- **archive 不存在**：`findUnique` 返回 null → transaction 内 upsert 创建新记录，正常
