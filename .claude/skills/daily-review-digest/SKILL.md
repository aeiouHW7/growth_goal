---
name: daily-review-digest
description: 从飞书复盘机器人拉取碎碎念，按天整理后记录到 Obsidian 笔记「每天碎碎念.md」（先记录），再逐日跑 AI 分析并附分析小节（后分析）。当用户说"取复盘内容/同步碎碎念/更新每天碎碎念/记录并分析碎碎念/继续取复盘"时使用。也适用于补录历史碎碎念。
---

# 碎碎念记录 + 分析

把飞书复盘机器人的每日碎碎念，**按天整理 → 记录到 Obsidian → 逐日分析**。
严格遵循 **先记录、再分析**：原文先落盘，分析后追加。

## 关键位置

| 项 | 值 |
|----|----|
| 来源 | 飞书复盘机器人 P2P · chat_id `oc_b139aa2e604688ec6566c812dbff09b9` |
| 记录文件 | `D:\AI-ACE\AI-Coding-Engine\domains\knowledge-base\knowledge-vault\1. 原生笔记\每天碎碎念.md` |
| 分析引擎 | growth_goal 后端 `http://localhost:3001` |

## ⚠️ 环境约束（重要）

- **本机不要用 Bash 工具** —— 会泄漏 git-bash/mintty 进程，shell 一律用 **PowerShell 工具**
- 分析需要后端在跑：`cd D:\AI-ACE\growth_goal\backend; npm run dev`（后台启动，用 PowerShell）
- lark-cli 需已授权（`lark-cli auth login`；授权细节见会话记忆 `feishu-review-bot`）

## 用法

一条命令跑完整流程（推荐）：

```powershell
cd "D:\AI-ACE\growth_goal"
node ".claude\skills\daily-review-digest\scripts\sync.mjs"
```

可选参数：
- `--no-analyze` — 只记录原文，跳过分析（后端没起时用这个）

脚本按序执行 5 步，见下。

## 流程

### 1 · 拉取（翻页取全量）
```
lark-cli im +chat-messages-list --chat-id oc_b139aa2e604688ec6566c812dbff09b9 --as user --page-size 50 --order desc
# 若 has_more=true，带上一页的 page_token 继续翻页，直到取完
```
> 脚本会自动翻页，把**全部历史**（不止最近 50 条）取回。

### 2 · 按天整理
- 只保留 `msg_type === "text"`（跳过图片、系统消息、分析报告等非碎碎念）
- 同一天多条消息（含「补充」）→ 合并为一条，按时间顺序拼接
- 按日期**升序**排列

### 3 · 去重
解析 md 中已存在的日期标题（`## YYYY-MM-DD`），仅处理**未记录的新日期**。

### 4 · 记录（先）
把新日期的**碎碎念原文**追加到 md。这一步先做、单独完成，保证原文不会因分析失败而丢失。

### 5 · 分析（后）
对每个新日期：
1. 确保后端存在该日复盘：`POST /api/reviews/daily` with `{date, rawInput}`（返回 409 = 已存在，正常）
2. 轮询 `GET /api/reviews/daily/<date>` 直到 `aiAnalyses` 非空
3. 把**精简分析小节**追加到该日期正文之后

## 记录格式（双来源）

```markdown
# 每天碎碎念

> 复盘机器人 + 自聊区 双来源 · 按天记录（复盘内容附 AI 分析）

---

## 2026-08-18

### 碎碎念                    ← 复盘机器人原文（可含多天合并的「补充」）

<碎碎念原文>

> **AI 分析** ｜ 精力 80 · 信号 80 · 完成率 85%
> **洞察**：<insight.pattern 精简>
> **缺什么**：<foggDiagnosis.missing 类型 + insight.missing 精简>
> **建议**：
> - [类型] <建议内容>

### 自聊区                    ← 自聊区内容（只记录，不分析）

[21:18] 【图片转文字】<OCR 结果>
[11:20] <文本消息>
[09:05] [文件附件: xxx.md]

---
```

- 日期标题统一 `## YYYY-MM-DD`（去重靠它）；同日条目按时间升序
- 复盘机器人内容 → `### 碎碎念` 小节 + AI 分析；自聊区内容 → `### 自聊区` 小节
- 分析小节**精简**，完整结构化报告在后端数据库

## 自聊区（第二来源，可选）

自聊区是个人杂记流（笔记/截图/链接/证照…），**只记录不分析**。全量流程：

```powershell
cd "D:\AI-ACE\growth_goal"
node ".claude\skills\daily-review-digest\scripts\fetch-selfchat.mjs"        # 翻页拉全部消息 + 下载图片
node ".claude\skills\daily-review-digest\scripts\build-ocr-batches.mjs"     # 图片按 25 张/批 切分
# → 用并行子 agent 对每批做 OCR，各自写 work/ocr-result-N.md
node ".claude\skills\daily-review-digest\scripts\merge-selfchat.mjs"        # 合并进 md
```

**图片 OCR**：图片无法本地识别，需用**子 agent 分批转录**（每批 ~25 张，读图→转文字→写 `work/ocr-result-N.md`，格式 `## <image_key>` + `- 日期:` + `- 转录:`）。合并脚本靠 image_key 把 OCR 结果映射回日期。

**敏感信息过滤（重要）**：合并脚本内置 `SENSITIVE_RE`，命中即整条替换为 `[含敏感信息，已剔除]`——覆盖身份证号（18 位）、居民身份证、受益所有人、股东持股、统一社会信用代码、营业执照、借记卡/银行卡号、开户行。**故意不匹配泛化的"信用卡/银行卡"字样**，避免误伤行情数据与 App 设置截图。

> 注意：`work/` 中间产物（消息 JSON、OCR 结果）仍含**未过滤的原始内容**，已加入 `.gitignore`，**不要提交**。

## 常见情况

- **某天分析失败/超时**：原文已记录，分析小节会缺失；重跑脚本会补（脚本对已在 md 的日期跳过原文、只补分析——见脚本 `--only-analyze` 说明）
- **后端没起**：用 `--no-analyze` 先记录，稍后补分析
- **同一天多条消息**：合并，不拆成多条记录
- **7/21 这类无消息的日期**：自然跳过，不产生空记录

## 依赖

- `lark-cli`（已授权）
- growth_goal 后端（分析用）
- 记忆：`feishu-review-bot`（chat_id 与消息读取方式）、`windows-bash-tool-leaks-mintty`（环境约束）
