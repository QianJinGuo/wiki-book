# 鹅厂 Token 刺客：AI Agent 使用中的 Token 浪费反模式与实践教训

## Ch04.686 鹅厂 Token 刺客：AI Agent 使用中的 Token 浪费反模式与实践教训

> 📊 Level ⭐⭐ | 4.7KB | `entities/tencent-token-刺客-token浪费反模式-2026-07-23.md`

# 鹅厂 Token 刺客：AI Agent 使用中的 Token 浪费反模式与实践教训

> **vxc score**: 54 | 腾讯技术工程征集员工真实使用案例，系统性盘点 AI Agent / Copilot 使用中的 Token 浪费反模式（Token 刺客），每条附具体数字与止损策略。

## Summary

腾讯技术工程（2026-07-23）发起内部征集，员工分享日常使用 AI Agent / 编码助手时遭遇的 Token 消耗异常（"Token 刺客"）。文章以 9+ 个真实案例总结出可复现的浪费模式：喂入范围失控、上下文污染膨胀、工具注册过载、重试无成本感知、会话复用错误等，每条都给出实践层面的止损规则。

## Token 刺客反模式清单

### 1. 输入范围失控（大文件 + 深层依赖 = token 黑洞）
- 只想改一个前端组件样式，把整个 src 目录喂进去 → Agent 顺藤摸瓜读完全部 i18n、mock 数据，产出大量无关修改。
- Agent 重构组件时读完整个文件 + 相关 hooks/utils/类型定义 + 重排 import → 改动 5 行代码烧 3 万 token。**教训：大文件 + 深层依赖引用是 token 黑洞，喂入前先裁剪范围。**

### 2. 上下文污染与越滚越大
- 短指令 + 巨量上下文 + 模型切换：任务卡死后换模型说"继续任务"，但上下文已积压几百条消息 → 每轮回顾全部历史，消耗异常高。**规则：上下文过长开新对话，关键信息落成文件，不用简短模糊指令续接。**
- 长任务第 1 轮 2k token，第 20 轮可能 50k+，真正有用的上下文只有最近三轮。**解法：长任务拆段跑，做完一段开新 session，历史不带走。**
- 输出 md 过长时每次修改都要从头重读全文 → 上下文理解消耗巨大，需要上下文工程（如分层引用、增量 patch）。

### 3. 工具注册过载（MCP schema 开销）
- 同时挂 20+ 个 MCP 工具，每轮对话光工具 schema 就烧 3-5k token，什么活没干钱先没了。**规则：只挂当前任务需要的工具，成本直接砍一大半。**
- 与 [GitHub Agentic Token 效率](ch04/298-agentic.html) 的"消灭未使用的 MCP 工具注册"（40 工具 → 每轮 10-15KB schema 开销）同源。

### 4. Agent 跑偏与无成本感知重试
- Agent 开始胡扯时等待"自我修正" → 越修越离谱，token 蹭蹭涨。**规则：发现不对劲立即掐断（"断"字诀）。**
- AI 没有成本感知，出错自动重试会带着完整失败记录反复试 → 越试越贵。**规则：同一问题重试超过 2 次，停下来问人。**

### 5. 指令边界模糊（scope creep）
- "顺便帮我看看还有没有别的问题" → Agent 一路检查整个模块、顺手优化代码、分析调用链 → Bug 两分钟改完，Token 已飞。**规则：先解决当前问题，再开新会话处理"顺便"的事。**

## 与现有实体关系

- [GitHub Agentic Token 效率](ch04/298-agentic.html) — 基础设施层（API proxy 审计/Optimizer 自动裁剪），本实体是使用层（开发者日常行为反模式）
- [Claude Code token 成本对比](../ch03/085-claude-code.html) — harness 间 token 差异（最多 30 倍），本实体是单 harness 内使用习惯的浪费
- [Token 不经济](../ch01/1133-20.html) — 经济学视角，本实体是工程实践视角
- [Context Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-engineering.md) — 上下文工程是 Token 刺客的核心解药

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/tencent-token-刺客-token浪费反模式-2026-07-23.md)

---

