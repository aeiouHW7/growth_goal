# KPI Dashboard — OpenSpec Change

## ADDED Requirements

### Requirement: 20维度趋势数据
每周日生成 weekly_summary 时，包含20维度评分趋势表格：
- 维度名 | 上周分 | 本周分 | 趋势↑↓─ | 待追踪问题
- 用 ASCII 表格格式

### Requirement: 趋势图生成
趋势用文本箭头表示（↑ ↓ ─），不用图片
数据来源：config/capability_baseline.json 的 history 数组

### Requirement: 触发条件
当用户问"这周表现怎么样"时，输出 KPI 摘要
