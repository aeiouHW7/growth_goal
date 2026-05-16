## ADDED Requirements

### Requirement: 先读后写 hook
系统 SHALL 在 Edit/Write 操作前检查目标文件是否已被 Read，未读过则阻止操作并提示先读取。

#### Scenario: 未读文件被编辑
- **WHEN** AI 尝试 Edit 一个当前会话中未 Read 过的文件
- **THEN** hook 阻止操作，输出 "请先读取该文件再编辑"

#### Scenario: 已读文件被编辑
- **WHEN** AI 尝试 Edit 一个当前会话中已 Read 过的文件
- **THEN** hook 放行，不干预

### Requirement: 配置保护 hook
系统 SHALL 阻止修改 eslint、tsconfig、prettier、biome 等配置文件，引导 AI 修复代码而非降低配置标准。

#### Scenario: 尝试修改 eslint 配置
- **WHEN** AI 尝试 Edit `.eslintrc.*` 或 `eslint.config.*` 文件
- **THEN** hook 阻止操作，输出 "不要修改 linter 配置，请修复代码以满足规则"

### Requirement: 禁止 --no-verify hook
系统 SHALL 阻止包含 `--no-verify` 的 git commit 命令。

#### Scenario: git commit 带 --no-verify
- **WHEN** AI 执行 `git commit --no-verify`
- **THEN** hook 阻止操作，输出 "禁止跳过 git hooks，请修复问题后正常提交"

### Requirement: 前台服务阻断 hook
系统 SHALL 阻止在非 tmux 环境下执行 `npm run dev`、`npm start` 等前台服务命令。

#### Scenario: 非 tmux 环境启动前台服务
- **WHEN** AI 在无 tmux 环境中执行 `npm run dev`
- **THEN** hook 阻止操作，输出 "前台服务会阻塞 shell，请使用 tmux 启动"

### Requirement: 编辑后类型检查 hook
系统 SHALL 在 .ts/.tsx 文件编辑后自动运行 `tsc --noEmit`，异步执行不阻塞编辑。

#### Scenario: TypeScript 文件编辑后
- **WHEN** AI 完成对 .ts 文件的 Edit 操作
- **THEN** 异步运行 tsc --noEmit，若有类型错误则通知 AI

### Requirement: 编辑后格式化 hook
系统 SHALL 在文件编辑后自动运行项目配置的格式化工具（prettier/biome）。

#### Scenario: 文件编辑后自动格式化
- **WHEN** AI 完成对源代码文件的 Edit 操作
- **THEN** 自动运行格式化命令，确保代码风格一致

### Requirement: 提交前质检 hook
系统 SHALL 在 git commit 前检查暂存文件中是否包含 console.log、debugger、硬编码 secrets。

#### Scenario: 暂存文件包含 console.log
- **WHEN** AI 执行 git commit，且暂存文件中包含 `console.log`
- **THEN** hook 输出警告（不阻塞），提示移除调试代码

#### Scenario: 暂存文件包含疑似 secrets
- **WHEN** AI 执行 git commit，且暂存文件中包含 API key 模式匹配
- **THEN** hook 阻止提交，输出 "检测到疑似 API key，请移除后重新提交"

### Requirement: 流程守卫 hook
系统 SHALL 在检测到 AI 直接创建新业务代码文件时提醒先走 planner 流程。

#### Scenario: 直接创建业务组件文件
- **WHEN** AI 使用 Write 工具创建 `src/components/*.tsx` 或 `src/controllers/*.ts` 新文件
- **THEN** hook 输出提醒 "检测到新建业务文件，建议先走 ace-planner 流程"（不阻塞）
