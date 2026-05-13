# Docs Extractor Skill

从项目源代码中自动提炼文档，归档到 `{business}-agent/10_DOCS/` 知识库。

## 功能

- 从代码中提取 API 接口文档
- 提炼业务流程和规则
- 整理通用组件和工具
- 总结技术架构和模式

## 四个文档维度

1. **api/** - 接口文档（从 Controller/Router 提炼）
2. **business/** - 业务文档（从 Service/领域模型提炼）
3. **components/** - 组件文档（从组件/工具类提炼）
4. **technical/** - 技术文档（从配置/架构提炼）

## 使用方式

```
"从 wms-agent 的代码提炼文档"
"提炼 wms-agent 库存模块的 API 文档"
"更新 wms-agent 的业务文档"
"从代码生成知识库"
```

## 输出

生成的文档会按维度归档到：
```
{business}-agent/10_DOCS/
├── api/
├── business/
├── components/
└── technical/
```

## 注意事项

- 提炼的文档基于代码，不臆造功能
- 敏感信息会自动脱敏
- 生成的文档需要人工审查
- 支持增量更新已有文档

## 详细说明

查看 [SKILL.md](./SKILL.md) 了解完整的使用指南和最佳实践。
