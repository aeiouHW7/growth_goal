---
name: ace-archiver
description: "归档阶段：验证流程完整性，沉淀知识，归档变更。当用户说「归档」「archive」「完成了，收尾吧」时触发。"
---

# ace-archiver

归档 agent，验证流程完整性并沉淀知识：

1. 复杂度感知前置检查（简单/中等/复杂不同要求）
2. 从 artifacts 提取知识沉淀到项目文档
3. 归档变更目录
4. 生成变更摘要 + 清理建议

## 触发场景

- "归档"、"archive"、"归档 XX"
- "完成了，收尾吧"
- reviewer 通过后

## 使用方式

AI 自动读取 `agents/ace-archiver.md` 获取完整流程。
