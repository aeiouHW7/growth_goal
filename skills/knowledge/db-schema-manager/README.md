# db-schema-manager

数据库表结构管理与版本 SQL 收集。

## 功能

- **init**：从 init SQL 生成表结构基线文档（md），供 AI 和开发者参考
- **collect**：verify 通过后，扫描 change 的 diff 提取 DDL/DML 到版本目录
- **update-baseline**：版本发布后，用最新 init SQL 更新基线文档

## 使用

详见 [SKILL.md](./SKILL.md)
