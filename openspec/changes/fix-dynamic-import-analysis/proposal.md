# fix-dynamic-import-analysis

## 问题陈述

`analysis-runner.service.ts:147-148` 在每次 AI 分析运行时才动态加载子服务模块：

```typescript
const patternService = new (await import("./pattern.service")).PatternService();
const biasDetection = new (await import("./bias-detection.service")).BiasDetectionService();
const capabilityService = new (await import("./capability.service")).CapabilityService();
```

这导致：
1. **性能**：每次分析重复解析和编译模块
2. **类型安全**：`import()` 返回的类型是 `any`，TypeScript 无法做静态检查
3. **可靠性**：如果文件路径写错或模块加载失败，运行期才抛出错误

这是项目早期遗留的代码，当时这三个文件还不存在。现在它们已经稳定存在，应改为顶部静态导入。

## 方案对比

| 方案 | 做法 | 优点 |
|------|------|------|
| A（推荐） | 顶部静态 `import` 替换动态 `import()` | 类型安全、性能好 |
| B | 保留动态 import | 容忍问题 |

## 设计决策

方案 A。将三个 `new (await import(...))` 改为顶部标准 import 后直接 `new` 构造。

## 影响范围

| 文件 | 改动 |
|------|------|
| `backend/src/services/analysis-runner.service.ts` | 删除 3 处动态 import，添加标准 import |

## 验收

- `analysis-runner.service.ts` 无任何 `import()` 动态加载
- 类型检查通过
- AI 分析功能正常
