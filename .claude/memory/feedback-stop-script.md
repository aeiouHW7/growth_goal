---
name: feedback-stop-script
description: 新项目应配套 stop.sh 一键关闭脚本，用户不想手动 kill 进程
metadata:
  type: feedback
---

每个有 start.sh 的项目都应该有对应的 stop.sh。

**Why:** 用户问"没有一键的那种吗？"— 手动 `kill $(lsof -ti :port)` + `docker compose down` 太繁琐。用户期望和 start.sh 对称的一键操作。

**How to apply:** ace-init 生成 Docker 环境时（Step 8），同时生成 stop.sh（关前端 → 关后端 → 关数据库）。参考 [[feedback-ace-init-docker]]。
