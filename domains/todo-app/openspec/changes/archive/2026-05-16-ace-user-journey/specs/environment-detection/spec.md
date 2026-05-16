## ADDED Requirements

### Requirement: ace-init 环境检测
ace-init 在创建项目目录后，SHALL 检测用户机器上的必要工具（node、npm、docker、git），输出缺失工具的安装指引。不自动安装（避免权限问题）。

#### Scenario: 所有工具已安装
- **WHEN** 用户运行 ace-init，且 node(>=18)、npm、docker、git 均已安装
- **THEN** 输出环境检测通过的状态报告，继续正常流程

#### Scenario: 缺少必要工具
- **WHEN** 用户运行 ace-init，且 node 未安装
- **THEN** 输出警告信息和对应平台的安装指引（brew/apt/官网链接），不中断流程

#### Scenario: 工具版本不满足
- **WHEN** 用户运行 ace-init，且 node 版本低于 18
- **THEN** 输出版本警告并建议升级命令
