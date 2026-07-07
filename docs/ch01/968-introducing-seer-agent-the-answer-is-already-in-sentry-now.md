# Introducing Seer Agent: The answer is already in Sentry. Now you can ask for it.

## Ch01.968 Introducing Seer Agent: The answer is already in Sentry. Now you can ask for it.

> 📊 Level ⭐⭐ | 3.8KB | `entities/introducing-seer-agent-the-answer-is-already-in-sentry-now-you-can-ask-for-it.md`

## 核心要点
- Sentry Seer Agent：利用 LLM 在 Sentry 内直接回答开发者问题
- 将调试工作流从人工排查转变为自然语言问答
## 相关实体
- [Seer Agent Workshop](../ch03/045-agent.html)
- [Introducing The Ettin Reranker Family](ch01/455-introducing-the-ettin-reranker-family.html)
- [Ai Phishing Attacks Are On The Rise Are You Prepared Bitward](https://github.com/QianJinGuo/wiki/blob/main/entities/AI-phishing-attacks-are-on-the-rise-Are-you-prepared-Bitward.md)
- [Alphaevolve Deepmind Discovery Agent](../ch03/045-agent.html)
- [Ai Agents Inside Perimeter Hackernews](../ch04/147-ai-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/introducing-seer-agent-the-answer-is-already-in-sentry-now-you-can-ask-for-it.md)

- [intercom, now called fin, launches an ai agent whose only jo](../ch04/368-intercom-now-called-fin-launches-an-ai-agent-whose-only-jo.html)

## 深度分析
Seer Agent 的核心产品逻辑是**"答案已在 Sentry 中，只是需要被正确提问"**。Sentry 积累的 telemetry 数据（错误堆栈、性能追踪、用户事件）本身就包含了问题的答案，但传统界面要求开发者具备手动检索和分析的能力。Seer Agent 将这一过程语言模型化——开发者用自然语言描述问题，LLM 在 telemetry 图谱中检索并合成答案。
这是一个**调试工作流的范式转换**：从"工程师主动排查"到"系统主动回答"。传统 Debug 流程是工程师阅读错误信息 → 猜测根因 → 查看相关数据 → 验证假设。Seer Agent 将这一流程内化为 LLM 的推理路径，工程师的角色从"调查者"变为"提问者"。
Seer Agent 展示的"Telemetry is already a graph"能力值得关注。它没有将 Sentry 数据视为日志序列，而是将其建模为图结构——错误、事务、用户会话、部署事件形成关联网络。这使得 LLM 能够进行**多跳推理**：从错误现象出发，沿着因果链追溯到根因或上游触发事件。
Sentry 将 Seer Agent 定位为"Multiplayer Mode in Slack"——这暗示了 AI Debugging 的社交化方向：AI 生成的诊断结果可以跨团队共享，资深工程师的经验可以被编码并复用。这比单纯的 AI Autofix 更具战略价值，因为它将 Sentry 从"监控工具"升级为"组织知识库"。

## 实践启示
- **开发者**：在日常调试中，尝试先用自然语言描述问题再开始手动排查——这有助于判断 AI 诊断与人工判断的差距
- **工程团队**：Seer Agent 的"团队经验编码"能力是技术 Leader 值得关注的方向——它可能成为 SRE/Kubernetes 时代知识传承的新载体
- **可观测性产品团队**：Seer Agent 证明了将 LLM 能力与 telemetry 数据深度集成比单纯增加 AI 助手数量更有价值——数据模型的优化（如图结构）往往比 prompt 工程更关键
- **AI 应用开发者**：在构建 AI Debugging 产品时，关键挑战不在于 LLM 的推理能力，而在于如何将已有的监控数据建模为 LLM 可高效检索的知识图谱

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/introducing-seer-agent-the-answer-is-already-in-sentry-now-you-can-ask-for-it.md)

---

