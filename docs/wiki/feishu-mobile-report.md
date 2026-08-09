# 飞书手机端报告（feishu-mobile-report）

**变更**: feishu-mobile-report
**日期**: 2026-08-09
**复杂度**: 中等

## 概述

飞书机器人作为手机端入口：碎碎念/复盘 + 看报告（AI 分析/进度/周期总结），同时碎碎念同步 Obsidian。复用现有 Bridge（`bridge/auto-processor.cjs`）。

## 能力

- **复盘后 6 卡片**：💡洞察 / ✅完成 / 📊偏差+Fogg / 🧠偏误 / 📈能力 / 💪建议（`sendAnalysisCards`）
- **「进度」指令**：进行中目标 + 本月计划进度卡片
- **周期提醒 + 启动**：周日/月末 21:00 提醒，回复「开始」聚合周/月分析
- **「详情」指令**：重发最近分析完整卡片
- **Obsidian 同步**：复盘创建时写入 `OBSIDIAN_NOTES_DIR/YYYY-MM-DD.md`（不存在创建 `# 日期 + ## 碎碎念`，存在追加）

## 飞书接入要点（lark-cli）

### 配置
1. `npm install -g @larksuite/cli`
2. `lark-cli config init --new`（浏览器填 appId/secret）—— **交互式，需前台运行（`!` 前缀）**
3. `lark-cli auth login --recommend`（用户授权，含 im:message）
4. **飞书开放平台**：事件订阅 → 添加 `im.message.receive_v1` + **启用长连接**（本地需跑消费服务才能验证通过）

### 启动
```bash
# bridge/.env 配置：
# LARK_CLI_PATH=lark-cli（shell:true 下完整路径含空格会解析失败，用命令名）
# LARK_CLI_RUN_JS=<绝对路径>/@larksuite/cli/scripts/run.js（mac 无 APPDATA，需 env 覆盖）
# USER_FEISHU_ID=<飞书用户 open_id>
# OBSIDIAN_NOTES_DIR=/Users/hw7/Documents/lmh知识库/碎碎念

PATH="$PATH:<lark-cli bin 目录>" node bridge/auto-processor.cjs
```

## 坑与注意事项

- **lark-cli 事件消费只支持 `--as bot`**（不支持 user）
- **`shell:true` spawn 带空格完整路径会解析失败** → 用 `lark-cli` 命令名（PATH）
- **mac 无 APPDATA** → `LARK_CLI_RUN_JS` 需 env 覆盖
- **长连接验证需本地消费服务运行**（`event consume` 保持 stdin 打开）
- Bridge 建议 PM2 保活（电脑重启后需手动重启）
