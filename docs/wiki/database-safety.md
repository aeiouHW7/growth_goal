# 数据库安全规范

> 记录于 2026-07-05，一次数据丢失事故后。

## 事故回顾

一次恢复操作中，`restore-lmh.ts` 执行了 `deleteMany()` 清空所有表后插入旧备份数据，导致：
1. **6月2日 ~ 7月5日的复盘记录** 被覆盖（备份不包含这些数据）
2. **LifeArchive 人生档案** 被清空（任何备份都不包含档案数据）

### 根因

| 问题 | 说明 |
|------|------|
| 备份路径错误 | `db-backup.sh` 备份的是 `backend/dev.db`（空文件），实际数据库在 `backend/prisma/dev.db` |
| 恢复脚本不安全 | 使用 `deleteMany()` 先删再插，假设"备份 = 全部" |
| 前端默认月份 | 默认显示当前月（7月），用户数据在 5-6 月，造成数据"消失"的错觉 |

## 当前备份架构

```
数据入口                   存储             备份
─────────────────────────────────────────────────
Claude CLI ──→ POST /api    ──→  prisma/dev.db  ──→ backend/backups/growth-*.db
前端 Web    ──→ POST /api                        （shutdown 时自动备份）
飞书 Bridge ──→ POST /api                        （手动 bash db-backup.sh）
```

## 恢复流程（安全版）

禁止使用 `deleteMany()`。正确的恢复方式：

```bash
# 1. 先备份当前数据库
bash scripts/db-backup.sh "pre-restore"

# 2. 用 upsert 模式运行恢复（不删现有数据，只覆盖/新增）
cd backend && npx tsx scripts/restore-lmh.ts

# 3. 验证
curl http://localhost:3001/api/progress/overview
```

## 定时备份（推荐）

```bash
# 添加到 crontab（每天 22:00）
0 22 * * * bash /path/to/backend/scheduled-backup.sh
```
