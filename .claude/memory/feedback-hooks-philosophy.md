---
name: feedback-hooks-philosophy
description: 用户要求 6-8 个 hooks 而非 2-3 个，基于 AI 真实失败模式而非简化
metadata:
  type: feedback
---

Hooks 数量应该由 AI 的真实失败模式决定，不要为了"简洁"而减少。

**Why:** 用户明确反对"2-3 个够了"的建议，认为每个 hook 对应一个真实的 AI 犯错场景（改配置、跳 hooks、忘读文件等），减少 hook 意味着放弃对那个失败模式的防护。

**How to apply:** 新增 hook 时评估它防护的失败模式是否真实存在；不要因为 hooks 数量多就合并或删除。当前 8 个 hooks 都有明确的防护场景。
