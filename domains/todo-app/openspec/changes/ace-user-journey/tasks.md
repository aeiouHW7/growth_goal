## 1. Phase A — Agent 增强（低风险，改 .md 文件）

- [x] 1.1 ace-planner 增强：在 Phase 1 Grill 步骤中追加"发现新术语时实时追加到 docs/wiki/glossary.md"的指令。验证：读 agents/ace-planner.md 确认追加内容存在
- [x] 1.2 ace-applier TDD 分支：在 Step 2 即时验证中追加复杂度判断决策树（简单→现有模式，复杂→TDD 垂直切片），引用 Matt Pocock TDD 方法论。验证：读 agents/ace-applier.md 确认 TDD 分支存在
- [x] 1.3 ace-applier 服务启动：在 Step 3 收尾后追加"所有 task 完成后提示启动服务"的流程，读 domain.yaml scripts.dev 段。验证：读 agents/ace-applier.md 确认启动服务步骤存在
- [x] 1.4 ace-investigator 反馈循环：在 Step 1 前追加 Step 0"建立反馈循环"（能复现？有日志？有信号？），引用 Matt Pocock diagnose Phase 1。验证：读 agents/ace-investigator.md 确认 Step 0 存在
- [x] 1.5 ace-reviewer 术语检查：追加检查维度"术语一致性"，对照 glossary.md 检查变更中的命名。验证：读 agents/ace-reviewer.md 确认术语一致性维度存在
- [x] 1.6 ace-retro 架构深度检查：在 Step 3 W.W.L.D 后追加 Step 3.5 架构深度检查（deletion test、deep module、pass-through 检测），引用 Matt zoom-out 思维。验证：读 agents/ace-retro.md 确认 Step 3.5 存在

## 2. Phase B — 新 Commands

- [x] 2.1 创建 .claude/commands/ace-status.md：读取 domain.yaml services 段，用 lsof/nc 检测各端口，输出表格化状态面板。验证：执行 /ace-status 看到正确的服务状态表格
- [x] 2.2 创建 .claude/commands/ace-handoff.md：生成交接文档，包含当前阶段、进度、未完成决策、建议下次入口、artifacts 路径引用。验证：执行 /ace-handoff 看到格式正确的交接文档
- [x] 2.3 ace-init 环境检测增强：在 .claude/commands/ace-init.md（或对应 skill）中追加环境检测步骤（node>=18、npm、docker、git），输出缺失工具的安装指引。验证：在缺少 docker 的环境下运行 ace-init 看到警告

## 3. Phase C — Hooks 系统（风险最高）

- [ ] 3.1 创建 scripts/hooks/ 目录和 read-before-write.js：PreToolUse(Edit|Write) hook，检查文件是否已被读取。验证：尝试编辑未读文件时被阻止
- [ ] 3.2 创建 scripts/hooks/config-protection.js：PreToolUse(Edit|Write) hook，阻止修改 eslint/tsconfig/prettier/biome 配置文件。验证：尝试编辑 tsconfig.json 时被阻止
- [ ] 3.3 创建 scripts/hooks/no-skip-hooks.js：PreToolUse(Bash) hook，阻止 git commit --no-verify。验证：执行 git commit --no-verify 时被阻止
- [ ] 3.4 创建 scripts/hooks/foreground-server-block.js：PreToolUse(Bash) hook，阻止非 tmux 下 npm run dev/start。验证：直接 npm run dev 被阻止，tmux 内放行
- [ ] 3.5 创建 scripts/hooks/post-edit-typecheck.js：PostToolUse(Edit|Write) hook，.ts/.tsx 文件编辑后异步 tsc --noEmit。验证：编辑 .ts 文件后看到类型检查结果
- [ ] 3.6 创建 scripts/hooks/post-edit-format.js：PostToolUse(Edit|Write) hook，编辑后自动运行 prettier/biome。验证：编辑文件后格式自动修正
- [ ] 3.7 创建 scripts/hooks/pre-commit-quality.js：PreToolUse(Bash) hook，commit 前检查 console.log 和 secrets。验证：暂存含 console.log 的文件 commit 时看到警告
- [ ] 3.8 创建 scripts/hooks/workflow-guard.js：PreToolUse(Write) hook，新建 src/ 下业务文件时提醒先走 planner。验证：直接创建 src/components/NewComponent.tsx 时看到提醒
- [ ] 3.9 配置 .claude/settings.json：注册所有 hooks（matcher、command、async/timeout 设置）。验证：openspec validate 通过，hooks 正常触发
