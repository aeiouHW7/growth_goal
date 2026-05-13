## ADDED Requirements

### Requirement: Standard-Domain-Structure
初始化的领域必须具备 ACE 标准的“三层资产”结构。

#### Scenario: Init-New-Domain
- **WHEN**: 用户运行 `ace init-domain my-new-app`
- **THEN**: 
  1. `domains/my-new-app/` 目录被创建。
  2. 目录下存在 `openspec/` (已初始化且无冗余 `.claude`)。
  3. 目录下存在 `10_DOCS/` 及 `domain.yaml`。
  4. 根目录的 `openspec` 链接自动指向新领域。

### Requirement: Safe-Switching
切换领域时，必须保证链接的原子性更新。

#### Scenario: Switch-Active-Domain
- **WHEN**: 用户运行 `ace select ace-core`
- **THEN**: 
  1. `.engine/active-domain` 内容更新为 `ace-core`。
  2. 根目录的 `openspec` 软链接目标变为 `domains/ace-core/openspec`。
  3. 终端提示“焦点已切换至 ace-core”。
