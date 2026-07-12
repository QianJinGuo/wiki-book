# 被裁了想转 AI Agent？先看面试官到底在筛你哪 7 样东西

## Ch01.856 被裁了想转 AI Agent？先看面试官到底在筛你哪 7 样东西

> 📊 Level ⭐⭐ | 4.9KB | `entities/agent-interview-7-capabilities.md`

# 被裁了想转 AI Agent？先看面试官到底在筛你哪 7 样东西
> 原文由 Seven（公众号「LLM大模型Seven」）发布于 2026-05-04。
> 从被裁焦虑到 Agent 面经，三层能力模型 + 7 个考点 + 30 天补课路径。

- AI Agent 岗位同比增长 +300%（Anthropic《2026 智能体编码趋势报告》）
- Agent 岗位面试通过率：18.7%（Stanford AI Index 2026）

## 相关实体
- [Claude Code Source Leak Lifecycle Analysis](../ch03/075-claude-code.html)
- [Vibe Coding Agentic Engineering Convergence Simon Willison](../ch04/416-vibe-coding-agentic-engineering.html)
- [Claude Code Harness Deep Understanding](ch01/472-claude-code-harness-deep-understanding.html)
- [Pi Mono Github](ch01/804-pi-mono-github.html)
- [读完 Claude Code 和 Openclaw 的 Memory 源码我对Agent记忆需要向量数据库这件事产生了怀疑](../ch03/075-claude-code.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-interview-7-capabilities.md)

## 深度分析

1. **Multi-Agent 是过度设计重灾区**：文章明确指出"单 Agent+工具调用 50% 场景就够了，上 Multi-Agent 往往是过度设计"，并要求面试者能回答"什么情况下绝对不会用 Multi-Agent"。这与行业盲目追崇多智能体协作的风潮形成反差，揭示了工程务实派与 PPT 架构师之间的核心分歧。

2. **第三层工程能力才是 Offer 分水岭**：三层能力模型中，第一层（基础技术 40%）决定能否进门，第二层（AI 专项 35%）决定过几轮，但真正决定 Offer 的是第三层（工程实践 25%）——测试、监控、成本控制。这说明 Agent 工程师的核心差异不在于调 Prompt 的手艺，而在于能否把系统稳定地跑在生产环境并控制住成本。

3. **成本控制已上升为第一优先级**：文章将成本控制定义为"第三层·高阶"能力，并给出具体数字：中等流量 Agent 产品月 Token 账单 5-10 万美金。五个优化手段中，模型分层（降本 40-60%）和 Prompt Cache（30-90%）被摆在最高 ROI 位置，"按任务 P95 成本做预算"的思维模式是将工程思维引入 AI 系统的标志。

4. **Function Calling 是送命题也是入场券**：文章将 Function Calling 列为"第二层·送命题"，强调 LLM 从不执行函数只输出调用意图 JSON、工具 Description 写给 LLM 看而非给人看、工具报错不能回"failed"否则 Agent 会烧 Token 进死循环。这些细节构成 Agent 开发者与普通 LLM API 调用者的本质差距。

5. **工程师档位与通过率强相关，简历党处境最尴尬**：D 档（简历党，会调 API 跑过 Demo，没上过线）通过率 <10% 且无 Offer；B 档（生产型，上线过踩过死循环）达 60-70%；A 档（架构型，设计过 Multi-Agent）>80%。这揭示了当前市场对"真实上线经验"的饥渴程度远超对应聘者预期。

## 实践启示

1. **用模型分层快速降本 40-60%**：简单任务优先走 Haiku/gpt-4o-mini 等小模型，不要默认 GPT-4o 或 Claude Opus。用模型分级代替"全场景大模型"策略，是成本控制优先级最高的单点改动。

2. **Week 1 集中突破 Function Calling 三个核心细节**：工具 Description 写法、结构化错误回传（不用"failed"）、OpenAI 和 Claude 的 Schema 差异（parameters vs input_schema）。这三个细节是面试高频追问区，也是生产环境中 Agent 死循环的常见根因。

3. **用 Mock 工具返回值区分 LLM 糊涂 vs 工具返回有问题**：当面试官追问"怎么区分 LLM 糊涂了 vs 工具返回有问题"或生产环境调试时，标准答案是"mock 工具返回值让 LLM 重跑，对比 input/output"。这是 Agent 可观测性调试的基本功。

4. **构建三层记忆架构支撑跨会话服务**：短期（Messages 数组）、工作（Scratchpad/状态机）、长期（向量库+元数据）构成 Agent 区别于 ChatGPT 的核心能力。长期记忆更新冲突是工程难点，可关注 Anthropic Memory Tool、LangMem、Zep 等开源方案。

5. **每个项目准备 3 个"踩坑+解决"故事**：Week 4 的简历重写策略不仅是面试技巧，也是倒逼自己从"Demo 心态"转向"生产心态"的有效方法。面试官对 B/A 档候选人的期望是能讲清楚踩过的坑和对应的解决决策，而非仅仅描述项目功能。

---

