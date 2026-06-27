# Prompt System

**变更**: core-goal-review-system
**日期**: 2026-05-17

## 概述

Prompts 按职责分三层：System Prompt（常驻）、Flow Prompt（按需加载）、Analysis Prompt（分析时加载）。所有 prompt 以 TypeScript 带类型接口的模板函数导出。

## 实现要点

- 4 个 prompt 文件：`system.prompt.ts`、`goal-setup.prompt.ts`、`daily-review.prompt.ts`、`weekly-review.prompt.ts`
- 每个 prompt 有 `*Context` 接口定义依赖数据，通过 `build*Prompt(ctx)` 返回模板字符串

## 关键决策

- **信号深度评分**：8 维度加权评分，判定极厚/正常/薄/极薄四档，指导追问策略
- **Fogg 行为模型**：B = M × A × P，动机/能力/提示不足用不同的 Coach 干预方式
- **认知偏误检测**：8 种偏误，每种含触发词/追问策略/干预方向
- **模式识别**：频率触发（≥3 次）、矛盾触发（言行不一）、静默触发（连续无变化）
- **时间审计**：增长/维护/消耗三分类 + 战略评分 + 4 种问题类型诊断

## 注意事项

- 聚焦后改了 prompt 后记得同步更新 `*Context` 接口中的字段
- 分析框架需要用户评分闭环（0-100），低于 60 反思，高于 80 优秀案例
- 外部信息获取失败时标注降级，不阻塞分析
