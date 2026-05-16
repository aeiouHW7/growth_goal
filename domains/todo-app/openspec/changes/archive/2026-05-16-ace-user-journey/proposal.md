# Proposal: ACE 用户旅程补全

## 背景

ACE 的 workflow 流程链（planner → applier → reviewer → archiver → retro）已经建好，项目协议层（domain.yaml → CLAUDE.md）也落地了。但以用户视角走一遍完整旅程，仍有 **5 个环节是断的**。

## 目标

让用户从"我要开始一个项目"到"功能上线可以用"全程无断点。不止能用，还要好用。

---

## 用户旅程 & 当前断点

```
用户旅程                    现状              需要做的
─────────────────────────────────────────────────────────
① "我要开始 XX 项目"
   ├── 创建项目             ✓ ace-init        —
   ├── 装环境/工具          ❌ 缺             ace-init 增强：环境检测与安装
   └── 看到各服务状态       ❌ 缺             ace-status command

② "我想做一个需求"
   ├── 进入 planner         ✓ skill 触发      —
   ├── 读项目知识           ⚠️ 刚修好        planner 强制读术语表
   ├── 和用户深度探索       ✓ Grill 方法      增强：prototype 验证假设
   ├── 出 PRD + 原型        ✓ oais-prd        —
   └── 出提案               ✓ openspec        —

③ "开始实现"
   ├── 逐 task 实现         ✓ applier         增强：复杂 task 支持 TDD 模式
   ├── 即时验证             ✓ tsc+lint+test   hooks 硬保障（类型检查、格式化）
   └── 知识沉淀             ✓ 追加 proposal   —

④ "代码审查"
   ├── 多维度审查           ✓ reviewer        增强：术语一致性检查
   └── 架构侵蚀检查         ✓ 维度 B         增强：deep module 深度检查

⑤ "我想看看效果"
   └── 启动服务让用户用     ❌ 缺             applier 完成后提示/启动服务

⑥ "归档收尾"
   ├── 知识沉淀             ✓ archiver        —
   └── 更新 wiki index      ✓ 已修好         —

⑦ "复盘总结"
   ├── W.W.L.D             ✓ retro           增强：架构健康体检
   └── 模式沉淀             ✓ wiki            —

⑧ "下次继续 / 换人接手"
   └── 会话交接             ❌ 缺             handoff 能力
```

---

## 变更内容

### 一、环境引导增强（ace-init）

**问题**：用户说"创建一个 React + Prisma 项目"，ace-init 建了目录但用户的机器上可能没装 node/docker。

**方案**：ace-init Step 2 增加环境检测：

```bash
# 检测必要工具
command -v node >/dev/null || echo "⚠ Node.js 未安装"
command -v npm >/dev/null || echo "⚠ npm 未安装"
command -v docker >/dev/null || echo "⚠ Docker 未安装"
node -v 2>/dev/null | grep -qE 'v(18|20|22)' || echo "⚠ Node.js 版本需 18+"
```

缺工具时给用户安装指引，不自动装（避免权限问题）。

### 二、项目状态面板（ace-status command）

**问题**：用户不知道前端/后端/数据库各服务是否在跑。

**方案**：新建 `.claude/commands/ace-status.md`

```bash
# 从 domain.yaml 读 services 段，逐个检测端口
# 输出：
# ┌──────────┬──────┬────────┐
# │ Service  │ Port │ Status │
# ├──────────┼──────┼────────┤
# │ database │ 5432 │ ✓ UP   │
# │ backend  │ 3000 │ ✗ DOWN │
# │ frontend │ 5173 │ ✗ DOWN │
# └──────────┴──────┴────────┘
```

### 三、核心 Hooks（6-8 个）

基于 ECC 的 ESSENTIAL 分析，ACE 需要以下 hooks：

| Hook | 事件 | 作用 |
|------|------|------|
| **先读后写** | PreToolUse(Edit/Write) | 编辑文件前强制先 Read，防止盲改 |
| **配置保护** | PreToolUse(Edit/Write) | 阻止修改 eslint/tsconfig/prettier 配置 |
| **禁止 --no-verify** | PreToolUse(Bash) | 阻止 git commit --no-verify |
| **前台服务阻断** | PreToolUse(Bash) | 阻止非 tmux 下的 npm run dev |
| **编辑后类型检查** | PostToolUse(Edit/Write) | .ts/.tsx 文件编辑后自动 tsc --noEmit |
| **编辑后格式化** | PostToolUse(Edit/Write) | 编辑后自动 prettier/biome 格式化 |
| **提交前质检** | PreToolUse(Bash) | git commit 前检查 console.log、secrets |
| **流程守卫** | PreToolUse(Edit/Write) | 检测到直接写业务代码时提醒先走 planner |

### 四、Matt Pocock 哲学集成

#### 4.1 CONTEXT.md 术语表

ace-init 创建项目时生成 `docs/wiki/glossary.md`（已有模板）。

增强：
- planner 的 Grill 过程中，发现新术语时**实时追加**到 glossary
- applier 实现时**强制读** glossary，命名必须与术语表一致
- reviewer 新增检查维度：**术语一致性**

#### 4.2 TDD 模式（applier 增强）

applier 的 Step 2 ④ 即时验证，增加 TDD 分支：

```
task 复杂度判断
├── 简单 → 现有模式（写代码 → 验证）
└── 复杂（新实体/核心逻辑） → TDD 模式
    ├── 先写一个测试（红）
    ├── 写最小实现让测试通过（绿）
    └── 重构（保持测试绿）
```

#### 4.3 反馈循环优先（investigator 增强）

investigator Step 1 前增加 Step 0：

```
Step 0: 建立反馈循环
├── 能复现吗？→ 找到稳定复现路径
├── 有日志吗？→ 加标记日志 [DEBUG-{hash}]
└── 有信号吗？→ 确保能观测到问题
```

#### 4.4 架构深度检查（retro 增强）

retro Step 3 W.W.L.D 后增加 Step 3.5：

```
Step 3.5: 架构深度检查
├── 本次变更引入了新模块吗？
│   └── 做 deletion test：删掉它，复杂度去哪了？
├── 接口是否比实现更简单？（deep module）
└── 有没有模块变成 pass-through？（shallow module 警告）
```

#### 4.5 会话交接（handoff 能力）

新增 `.claude/commands/ace-handoff.md`：

当会话必须中断时，生成交接文档：
- 当前在哪个阶段、哪个 task
- 未完成的决策和开放问题
- 下次会话建议用哪个 skill 开始
- 引用已有 artifacts 路径，不重复内容

#### 4.6 启动服务（applier 增强）

applier Step 3 完成收尾后，增加：

```
所有 task 完成且测试通过后：
1. 读 domain.yaml 的 scripts.dev 段
2. 提示用户："实现完成，要启动服务看效果吗？"
3. 用户确认后在 tmux 中启动服务
4. 输出访问地址（从 domain.yaml services 段读端口）
```

---

## 不做的事

- **不做 cross-IDE 适配**（ECC 做了 cursor/kiro/codex 等）— ACE 只支持 Claude Code
- **不做 plugin 打包**（ECC 的 plugin.json）— 当前 domains/ 模式够用
- **不做 cost tracker / metrics bridge**（ECC 的可观测性层）— 属于 OPTIONAL
- **不做 caveman 模式**（Matt 的 token 压缩）— 等上下文压力真的成为问题时再加
- **不做 graphify 知识图谱**（ADE 的重型方案）— grep + wiki index 够用

---

## 复杂度评估

**中等偏复杂**。涉及：
- 2 个新 command（ace-status、ace-handoff）
- 1 个增强 command（ace-init 环境检测）
- 6-8 个 hooks（需要写 JS 脚本 + hooks.json 配置）
- 4 个 agent 增强（planner/applier/investigator/retro 各加几行）

建议拆分执行：
1. **Phase A**：agent 增强（改 .md 文件，低风险）
2. **Phase B**：新 commands（ace-status、ace-handoff）
3. **Phase C**：hooks 系统（需要调研 Claude Code hooks 配置格式，风险最高）
