# AI实践｜基于 Spring AI 从0到1构建 AI Agent

## Ch04.419 AI实践｜基于 Spring AI 从0到1构建 AI Agent

> 📊 Level ⭐⭐ | 5.5KB | `entities/spring-ai-aiagentdemo.md`

# AI实践｜基于 Spring AI 从0到1构建 AI Agent

文章内容基于作者个人技术实践与独立思考，旨在分享经验，仅代表个人观点。
Linux说过一句很经典的话：Talk is cheap, show me the code.
最近在学习AI Agent开发的时候，填鸭式地被灌输了很多新知识，但是这些新知识就像是漂浮的"空中楼阁"，看得见但摸不着，只知道理论如此但是不知道具体实现为何物。计算机工程的事儿，往往真的听再多毫无体感，看一遍代码就基本一通百通，由此产生一个很神奇的想法："最好的学习资料是代码，既然我要学AI Agent开发，那就让AI Agent本身帮我生成学习资料。"于是乎，便有了这篇文章，即我本文的项目代码几乎是由AI生成，我在其中的角色只是指挥家与验收员。
1、该项目本身纯作为学习用途的Demo，只是用作展示"理论背后看得见的代码"。

## 相关实体
- [Code As Agent Harness Survey](/ch09-046-code-as-agent-harness-综述//)
- [Cong 30 Fen Zhong Shou Gu Agent Dao Harness Cheng Wei Xin Hou Duan](/ch04-254-从-30-分钟手搓-agent-到-harness-成为-新后端//)
- [从 30 分钟手搓 Agent到 Harness 成为新后端](/ch04-388-从-30-分钟手搓-agent-到-harness-成为-新后端//)
- [Harness Engineering 第三代工程范式](/ch01-602-harness-engineering-ai-从-聪明-到-可靠-的第三代工程范式//)
- [Agentic Ai System Architecture Harness Skill Mcp](/ch04-197-mcp-skill-agent-llm-harness-一张图讲清-agentic-ai-系统如何真//)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/spring-ai-aiagentdemo.md)

## 深度分析

Spring AI 项目揭示了 AI Agent 工程化的核心矛盾：LLM 本质是"问答黑箱"，但实际使用中所有工程努力都在解决"有限的上下文窗口中该放什么内容"的问题。 这篇文章的价值不在于代码本身，而在于它展示了一条从"理论灌输"到"代码即学习"的范式转变路径——作者作为学习者，通过让 AI 生成代码来完成学习，形成了一个人机协同的知识内化闭环。

AgentCore 作为核心编排器，其设计理念体现了"意图识别先行"的工程原则：不是每次对话都触发 RAG，而是先用 LLM 判断用户意图再决定是否检索。 这种"前置过滤"思路在工程上极为重要——它避免了不必要的向量检索开销，同时让 RAG 模块的调用更加精准。记忆管理三层压缩策略（摘要压缩→Assistant裁剪→滑动窗口）则展示了在 token 成本约束下的精细化上下文管理思路。

Tool/Function Calling 机制是整个架构的地基。 文章的核心洞察在于：LLM 本身不会调工具，工具调用是 Harness 层做的——LLM 只是返回"要调哪些工具"的意图，真正的执行发生在 Agent 服务端。 这意味着 Skill、SubAgent、RAG、MCP 等等能力，在工程实现上都可以统一抽象为 ToolCallback 的注册与调用，形成了高度模块化的可扩展架构。

RAG 模块的多路召回（语义+BM25+查询改写）+ RRF 融合 + Rerank 流水线，是当前 RAG 工程的主流范式。 值得注意的是，查询改写召回器的设计——用 LLM 将问题改写为3种不同表达再分别召回，本质上是在解决"用户问题表述与文档表述之间的语义鸿沟"，这是一种将 LLM 自身能力纳入检索流程的优雅方案。

MCP（Model Context Protocol）的双向支持（Client+Server）是本文最面向未来的设计。 MCP 作为 Anthropic 提出的开放协议，正在成为 AI 应用连接外部工具和数据源的标准。Spring AI 项目同时实现 MCP Server（对外暴露知识库检索能力）和 MCP Client（动态连接外部 MCP 服务），体现了协议层设计的对称性思路——既能提供服务也能消费服务，这为多 Agent 协作提供了基础设施层面的可能性。

## 实践启示

1. **用代码学习 AI Agent 比听课更高效**：计算机工程的知识往往"听再多毫无体感，看一遍代码就基本一通百通"，让 AI Agent 帮你生成学习资料是一种值得推广的元学习方法。

2. **意图识别前置是节省算力的关键**：不是每次对话都触发 RAG，而是先判断用户意图再决定是否检索。这种"按需调用"的设计模式应该成为 Agent 开发的标准实践。

3. **Function Calling 是 Agent 架构的地基**：Skill、SubAgent、RAG 等各种能力在工程上都可以统一抽象为 ToolCallback 注册，这要求开发者在设计 Agent 时先想清楚工具有哪些、工具边界在哪里。

4. **记忆管理需要分层策略**：三层上下文压缩（摘要压缩→精准裁剪→滑动窗口兜底）是一个实用的工程模板，可以根据实际场景的对话长度和 token 成本灵活调整阈值。

5. **MCP 协议值得关注**：Anthropic 提出的 MCP 正在成为外部工具连接的标准协议，Spring AI 的双向 MCP 支持为未来的多 Agent 协作生态奠定了基础，开发者在设计新项目时应优先考虑 MCP 兼容性。

---

