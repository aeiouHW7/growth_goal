# ACE Engine Skills

**17 个 Skills** 覆盖项目全生命周期。

## 分类

| 分类 | 数量 | Skills |
|------|------|--------|
| **system/** | 3 | 环境、项目管理 |
| **workflow/** | 9 | 开发工作流（核心+增强） |
| **coding/** | 1 | 编码辅助 |
| **knowledge/** | 4 | 知识管理 ⭐ |

---

## system/（系统管理）

- **ace-init-env** - 检查/安装 Node.js、Docker、Git
- **ace-create-project** - 生成完整项目结构
- **ace-doctor** - 环境诊断

---

## workflow/（开发工作流）

### 核心（6 个必需）

- **ace-explore** - 探索需求，苏格拉底式对话
- **ace-propose** - 创建提案，复杂度评估
- **ace-apply** - 实现变更，执行 tasks
- **review** - 代码审查，自动修复
- **verify** - 运行测试，复杂度感知
- **ace-archive** - 归档变更，沉淀知识

### 增强（3 个可选）

- **plan** - 需求规划，复杂需求拆分
- **investigate** - 问题诊断，根因定位
- **retro** - 变更复盘，提取经验

---

## coding/（编码辅助）

- **dialectical-thinking** - 辩证思考，方案对比

---

## knowledge/（知识管理）⭐

- **codebase-recon** - 代码库侦察，先查再写
- **cross-review** - 审核引擎，自审+交叉审核
- **docs-extractor** - 文档提取，从代码生成知识库
- **db-schema-manager** - 数据库管理，schema 基线+版本 SQL

详见 [knowledge/README.md](./knowledge/README.md)

---

## 使用方式

**自然语言触发**（无需记忆命令）：

```
用户: "初始化环境"
AI:   → ace-init-env

用户: "创建提案"
AI:   → ace-propose

用户: "有没有类似的实现？"
AI:   → codebase-recon

用户: "从代码生成文档"
AI:   → docs-extractor
```

---

## 详细文档

- [AGENTS.md](../AGENTS.md) - AI 协作指令
- [SKILLS_REFERENCE.md](../SKILLS_REFERENCE.md) - Skills 速查表
- [QUICKSTART.md](../QUICKSTART.md) - 使用示例
