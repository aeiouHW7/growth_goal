# fix-hardcoded-user-profile — 验收规格

## Requirement R-1：画像动态加载

- **前置**：数据库中有 2 个 User，职业/行业不同
- **操作**：分别提交复盘运行 AI 分析
- **预期**：prompt 中包含对应职业/行业的画像描述
- **证据**：在日志中观察 prompt 中的用户画像内容是否正确

## Requirement R-2：画像缺失降级

- **前置**：User 表有记录，但 LifeArchive 无 summary
- **操作**：运行 AI 分析
- **预期**：profieText 不完全为空（至少包含职业/时间信息）
- **证据**：分析正常完成，prompt 中有可用的画像信息

## Edge Case

- **User 无任何填写字段**：profieText 输出 "暂无用户画像数据"，分析继续运行不中断
