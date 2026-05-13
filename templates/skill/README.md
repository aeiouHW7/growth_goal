# Skill 模板

这个目录包含创建新技能时使用的标准模板。

## 📝 模板说明

### skill-template.md

技能文档的标准格式，包括：
- 技能描述
- 辩证思考
- 使用方法
- 依赖说明

### skill.yaml.template

Skill 配置文件模板（YAML 格式），定义：
- 技能名称和版本
- 描述和用法
- 标签和作者

### executor.mjs.template

Skill 执行器的代码模板，包含：
- 基础框架
- 彩色输出工具
- 错误处理
- 使用示例

## 🚀 创建新技能

### 快速开始

```bash
# 1. 创建技能目录
mkdir -p skills/system/my-skill

# 2. 复制模板
cp templates/skill/skill.yaml.template skills/system/my-skill/skill.yaml
cp templates/skill/executor.mjs.template skills/system/my-skill/executor.mjs

# 3. 编辑配置
vim skills/system/my-skill/skill.yaml

# 4. 实现逻辑
vim skills/system/my-skill/executor.mjs

# 5. 添加执行权限
chmod +x skills/system/my-skill/executor.mjs

# 6. 测试
node skills/system/my-skill/executor.mjs
```

### 集成到 package.json

在根目录 `package.json` 中添加快捷命令：

```json
{
  "scripts": {
    "my-skill": "node skills/system/my-skill/executor.mjs"
  }
}
```

## 📂 技能分类

根据功能将技能放入对应目录：

- `skills/system/` - 系统级技能（基础设施、环境管理）
- `skills/workflow/` - 工作流技能（业务流程编排）
- `skills/tools/` - 工具类技能（代码生成、格式化等）

## 💡 最佳实践

1. **单一职责**: 每个技能只做一件事
2. **清晰输出**: 使用彩色日志，区分成功/警告/错误
3. **错误处理**: 捕获异常，给出清晰的错误信息
4. **辩证设计**: 考虑技能的自适应能力和校验机制
5. **文档完整**: 提供使用示例和依赖说明
