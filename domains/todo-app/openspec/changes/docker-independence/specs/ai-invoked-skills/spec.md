## ADDED Requirements

### Requirement: Skills 通过自然语言触发
Skills（如 `ace-init-env`, `ace-create-project`）SHALL 通过用户对 AI（Claude Code/Cursor）说话来触发，而不是用户在终端手动输入命令。

#### Scenario: 用户通过自然语言初始化环境
- **WHEN** 用户对 AI 说："初始化开发环境" 或 "检查我的环境"
- **THEN** AI 自动调用 `ace-init-env` Skill
- **THEN** Skill 执行 `node skills/system/ace-init-env/executor.mjs`
- **THEN** 用户无需在终端输入任何命令

#### Scenario: 用户通过自然语言创建项目
- **WHEN** 用户对 AI 说："创建一个新项目叫 my-app"
- **THEN** AI 自动调用 `ace-create-project` Skill
- **THEN** Skill 执行 `node skills/system/ace-create-project/executor.mjs my-app`
- **THEN** 完整项目自动生成到 `domains/my-app/`

#### Scenario: 中英文双语触发
- **WHEN** 用户用中文说："帮我配置环境"
- **THEN** AI 识别并调用 `ace-init-env` Skill
- **WHEN** 用户用英文说："initialize environment"
- **THEN** AI 同样调用 `ace-init-env` Skill

### Requirement: Skill 文档明确触发场景
每个 Skill 的 `SKILL.md` 文档 SHALL 包含 "触发场景" 章节，列出用户可能对 AI 说的自然语言表述。

#### Scenario: SKILL.md 包含触发场景
- **WHEN** 查看任意 Skill 的 `SKILL.md` 文件
- **THEN** 文档包含 "## 触发场景" 章节
- **THEN** 该章节列出 3-5 个用户可能说的话（中英文）

#### Scenario: 触发场景示例清晰
- **WHEN** 阅读 `ace-init-env/SKILL.md` 的触发场景
- **THEN** 示例包括："初始化开发环境"、"帮我配置环境"、"检查我的环境"
- **THEN** 用户可以直接复制这些表述对 AI 说

### Requirement: 根目录无需用户记忆命令
根目录的所有初始化、配置、项目创建操作 SHALL 通过 AI 调用 Skills 完成，用户不需要记忆任何 `npm run` 命令。

#### Scenario: 无需记忆 npm run 命令
- **WHEN** 用户想初始化环境或创建项目
- **THEN** 用户只需对 AI 说话描述需求
- **THEN** AI 自动调用对应的 Skill
- **THEN** 用户无需查阅文档或记忆命令

#### Scenario: package.json 中的命令仅为 AI 元数据
- **WHEN** 查看根目录的 `package.json`
- **THEN** 其中的 `ace:*` 命令是 AI 调用 Skills 的元数据
- **THEN** 文档明确说明这些命令不是给用户手动输入的
