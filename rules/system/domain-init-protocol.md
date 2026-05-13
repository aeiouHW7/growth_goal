# ACE 领域初始化规范 (ACE Domain Init Protocol)

> **核心原则**: 所有的业务领域 (Domain) 必须保持“资产纯净”，避免 AI 配置冗余与冲突。

## 1. 初始化标准步骤 (The Init Process)

当创建一个新的业务领域时，必须严格遵循以下顺序：

1.  **L1 - 规范初始化**: 
    - 在 `domains/${domain}/` 目录下运行 `openspec init`。
    - **[关键] 立即清理**: 运行后必须立即删除该目录下的 `.claude/` 和 `.cursor/` 文件夹。
    - **理由**: ACE 采用根目录全局配置，子目录的 AI 配置会导致指令冲突和上下文污染。

2.  **L2 - 资产注入**:
    - 创建 `10_DOCS/` 结构 (business, technical, api)。
    - 创建 `domain.yaml` 声明项目目标与依赖。

3.  **L3 - 动态链接**:
    - 更新 `.engine/active-domain`。
    - 将根目录的 `openspec/` 符号链接重连至新领域的 `openspec/`。

## 2. 自动化守卫 (Automation Guard)

未来的 `ace-init-domain` 技能必须集成上述逻辑：
```bash
# 伪代码逻辑
cd domains/$NAME
openspec init --force
rm -rf .claude .cursor  # 强制清理冗余配置
# ... 注入资产
```

## 3. 辩证思考
- **为什么不保留子目录配置?** 虽然它提供了极致的灵活性，但对于 99% 的场景，多份配置意味着同步成本和难以排查的 Bug。全局配置 + 动态业务上下文（通过 AGENTS.md 注入）是目前的最优解。
