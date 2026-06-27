---
name: backup-after-new-data
description: 每次生成新数据后必须执行数据库备份
metadata:
  type: feedback
---

每次生成、修改或删除数据后，必须立即运行 `npx tsx scripts/backup.ts` 创建备份。

**Why:** 用户明确要求"每次生成新数据都要进行备份"，之前发生过 seed 脚本覆盖真实数据导致丢失的问题。

**How to apply:** 在每次创建/修改/删除分析、复盘、模式、偏误、能力评分等数据后，立即在 `domains/growth-miniprogram/backend/` 目录下执行备份脚本。备份文件自动保存到 `backups/` 目录，按时间戳命名。
