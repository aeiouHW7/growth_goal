# fix-hardcoded-user-profile

## 问题陈述

`analysis-runner.service.ts:11-18` 中 `USER_PROFILE` 是硬编码的字符串，描述一个特定的「新能源公司 AI 产品经理」用户画像。这意味着所有用户（无论 userId 是谁）的 AI 分析都使用相同的画像，导致分析结果无法个性化，在多用户场景下完全错误。

## 方案对比

| 方案 | 做法 | 优点 | 缺点 |
|------|------|------|------|
| A（推荐） | 从 `User` 表 + `LifeArchive` 表动态构建用户画像 | 个性化，准确 | 需构建 prompt 拼接逻辑 |
| B | 硬编码改为多用户配置 | 快速修复 | 不可扩展 |
| C | 前端传用户画像参数 | 灵活 | 不可靠，易篡改 |

## 设计决策

- userService.get() 已获取当前用户，其字段包含 `occupation`、`industry`、`goalDomains`、`weekdayAvailableHours` 等
- LifeArchive 表 `summary` 字段已由 AI 自动生成用户摘要
- 将 User 字段 + LifeArchive.summary 组合为动态 prompt 片段，替换硬编码 USER_PROFILE

## 影响范围

| 文件 | 改动 |
|------|------|
| `backend/src/services/analysis-runner.service.ts` | USER_PROFILE 常量删除，从 DB 动态构建 |
