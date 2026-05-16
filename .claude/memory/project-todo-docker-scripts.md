---
name: project-todo-docker-scripts
description: 待办：为各项目补齐 Docker 启停脚本（start.sh/stop.sh/status.sh）
metadata:
  type: project
---

为各项目补齐 Docker 启停脚本，以及其他待定项。

**Why:** flight-board 只有 stop.sh 没有 start.sh；todo-app 有 start.sh/status.sh 但没有 stop.sh。用户希望每个项目都有完整的一键启停体验。

**How to apply:** 下次会话时执行。范围不止启停脚本，用户还有其他要做的事，开工时先问清楚完整清单。

已确认的：
- 为 todo-app 和 flight-board 各补齐 start.sh / stop.sh / status.sh 三件套
- 考虑在 ace-init Step 8 中把三个脚本作为标准产出

待确认的：
- 用户说"不止这些"，具体内容下次会话开始时确认
