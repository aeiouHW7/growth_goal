---
name: feedback-ace-init-docker
description: ace-init 必须生成 docker-compose.yml，不能因为"测试"就跳步骤
metadata:
  type: feedback
---

ace-init 选了数据库就必须生成 docker-compose.yml，Step 8 不可跳过。

**Why:** E2E 自测时漏了 docker-compose.yml，导致数据库无法启动，用户指出"你的流程里说了要用 docker 吗？"。流程文档写了但执行时跳过了 — 这比没写更糟糕。

**How to apply:** 执行 ace-init 时逐步对照 Step 1-9，每步完成后自检。domain.yaml 中有 database 配置时，Step 8 是必须项而非可选项。同理，环境检测（Step 2）也要完整执行，包括 tmux 检测。
