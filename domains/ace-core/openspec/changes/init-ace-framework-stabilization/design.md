# Design: init-ace-framework-stabilization

## 1. 架构目标 (Architecture Goals)

### 核心组件
- **`ace-init-domain` (Skill)**: 负责新领域的标准化创建。
- **`ace-select` (Skill)**: 负责活跃领域的无缝切换与软链接维护。

### 逻辑链路
1. 用户输入指令 -> AI 激活对应 Skill。
2. Skill 读取 `rules/` 下的规范 (Protocol)。
3. Skill 调用底层系统命令 (mkdir, openspec init, ln)。
4. Skill 执行后置清理 (rm) 与资产注入。

## 2. 实现路径 (Implementation Path)

### 文件变更
- `skills/tools/ace-init-domain/executor.mjs`: 初始化脚本逻辑。
- `skills/tools/ace-select/executor.mjs`: 切换脚本逻辑。
- `domains/ace-core/10_DOCS/technical/skill-development.md`: 记录 Skill 编写规范。

### 核心算法
- **自适应链接算法**:
  - 检查根目录 `openspec` 是否存在且为软链接。
  - 如果是物理目录且非空 -> 报错（保护已有资产）。
  - 如果不存在 -> 创建指向 `domains/${domain}/openspec` 的软链接。

## 3. 方案权衡 (Trade-offs)

- **方案 A (选定): Node.js (ESM) 脚本**
  - *利*: 与 OpenSpec CLI 栈一致，路径处理能力强（`path` 模块），跨平台性好。
  - *弊*: 运行前需要环境中有 Node.js（已有）。
- **方案 B: 纯 Bash 脚本**
  - *利*: 无依赖，启动快。
  - *弊*: Windows 适配极其痛苦，JSON/YAML 处理能力弱。

## 4. 技术债务 (Technical Debt)
- 暂时未实现“回滚功能”。如果 `ln -s` 失败，需要用户手动修复。
- 初始化暂不支持自定义模板注入，仅使用 `ace-core` 的默认模板。
