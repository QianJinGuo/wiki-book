---
source: newsletter
source_url: "https://www.pointfive.co/AI-Research"
ingested: 2026-08-12
sha256: 2c91dc2e85375449cea34aadc6c506deba1449c8e2d96c65c41bc73ce9091cee
---

# Token reduction is not cost reduction | PointFive research

PointFive 的研究发现，Agent 的 token 成本归因可拆解如下：

- **75%** 的成本来自框架自身的 system prompt 和工具定义（framework's own system prompt and tool definitions）
- 另外 **19%** 是模型的隐藏推理（hidden reasoning）
- 压缩工具能触及的一切合计只有 **6.0%**

框架行李（framework baggage）在会话的每一轮都被重新发送和重新读取，任务真正贡献一个词之前就已经在计费。账单不是由 prompt 体量驱动的——它逐轮由"机器为了回答而必须记住和思考的一切"驱动。

测量方法：基于真实软件任务的模拟工程会话，按实际 provider 价格计费；结果因任务而异。

**核心含义**：token 压缩/精简工具对 Agent 成本的影响被系统性高估——即使压缩工具理想工作，也只能触及总成本的 6%。
