# 在 Amazon Bedrock 上为 Claude 应用设计稳健的 Prompt Cache 策略

## Ch11.058 在 Amazon Bedrock 上为 Claude 应用设计稳健的 Prompt Cache 策略

> 📊 Level ⭐⭐ | 11.6KB | `entities/amazon-bedrock-claude-prompt-cache-strategy.md`

## 核心要点
- Prompt Caching 可降低长上下文应用的输入 token 成本和响应延迟
- Content Block 的 20-block 回看限制是关键约束
- 推荐布局：受控场景单 CP，通用 agentic 场景三 CP
- Claude Thinking 与 cache checkpoint 的交互需要注意 TTL 和成本权衡
- 代码示例提供三 CP 稳健布局的工程实践
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/amazon-bedrock-claude-prompt-cache-strategy.md)

## 深度分析
### 20-block 回看限制的几何含义
20-block 回看限制是理解 prompt cache 行为的核心，但其实际含义比表面看起来更微妙。该限制约束的不是"system/tools 到当前尾部的绝对距离"，而是"当前 checkpoint 与最近可命中 checkpoint 边界之间的 block 距离"。
这意味着在一个超长对话中，即使 system prompt 已经距离当前请求超过 20 个 blocks，只要每轮新增的 blocks 数量保持在限制之内，缓存仍然可以命中包含 system 和 tools 的完整 prefix。这个设计允许长对话应用在不必频繁重写静态内容的情况下维持高效的缓存命中率。
然而，当某一轮突然新增大量 content blocks（如大量 toolResult 或 RAG chunks），使得上一轮 checkpoint 边界与当前 checkpoint 之间的距离超过约 20 个 blocks 时，尾部单 checkpoint 可能无法找到历史 prefix，导致 cacheReadInputTokens 下降而 cacheWriteInputTokens 增大。这个风险在工具调用频繁或 RAG chunk 不稳定的 agentic 应用中尤为突出。

### 三 CP 布局的工程代价与收益
三 CP 布局（system prompt 末尾 + tools 定义末尾 + moving tail）本质上是用两个额外的静态 checkpoint 换取对复杂场景的鲁棒性。额外的 checkpoint 意味着每次请求需要写入更多的 cache 内容，cacheWriteInputTokens 会相应增加；但换来的好处是 system 和 tools 作为最稳定的大段内容拥有了独立的安全锚点，即使某一轮动态内容导致尾部 moving checkpoint 无法命中最长历史 prefix，静态内容仍然可以命中。
从成本模型角度分析，如果 system prompt 包含 5,000 tokens、每轮动态 user token 约 100 token，使用三 CP 布局在每轮都命中的情况下，effective cost 约为 600 等价 input token（100 × 1.0x + 5,000 × 0.1x），相比不开 cache 的 5,100 token 成本降低约 88%。但关键前提是每轮都必须命中 system checkpoint——如果某轮 system checkpoint 无法命中，整个 system prompt都需要按普通 input 价格计费，成本优势会显著缩小。

### Claude Thinking 与 Cache Checkpoint 的交互边界
Claude thinking (extended thinking 或 adaptive thinking) 引入了一个特殊的 content block 类型——reasoningContent。生产实践中的关键规则是：不要把 cachePoint 放在 reasoningContent 之后，Bedrock 会拒绝这种位置。同时，应保留完整 reasoningContent 和 signature，不要修改其中内容。
实测观察表明，thinking block 对 cache billing 的影响与模型推理上下文的剥离行为并不完全等同。当后续 user block 不是 tool result 时，历史 thinking blocks 会被从模型上下文中剥离，但在 usage metrics 中是否计入 cache read token 可能因场景而异。这种不完全对称的行为意味着在 agentic 应用中使用 thinking 时，建议将 thinking 相关行为纳入上线监控，而非仅依赖静态推断。

### 模型支持与 TTL 选择策略
三个 Claude 模型（Sonnet 4.6、Opus 4.6、Opus 4.7）在 prompt cache 能力上存在差异。Sonnet 4.6 和 Opus 4.6 的 prompt caching 支持已在官方 model card 中列出，包含 5-minute 和 1-hour 两种 TTL 选项。Opus 4.7 的 model card 尚未公开 prompt caching 支持表，实测曾观察到 5-minute cache 可用，且 1-hour TTL 在特定测试中 35 分钟内仍命中，但这不应作为生产承诺。
对于 TTL 选择，5-minute TTL 的回本点是写入后命中 1 次（1.25x write + 0.1x read = 1.35x < 两次普通 input 的 2.0x）；1-hour TTL 的回本点建议至少命中 2 次（2.0x write + 2 × 0.1x read = 2.2x < 三次普通 input 的 3.0x）。如果同一个请求中混用不同 TTL，较长 TTL 的 checkpoint 应出现在较短 TTL 之前，以便把更稳定的 system 或工具定义放在更长 TTL 上。

## 实践启示
### 策略选择决策树
场景 1：固定客服 bot 或固定 RAG pipeline，每轮新增 block 数稳定且远小于 20 → 使用单 moving tail checkpoint，优先放在当前 user message 尾部。
场景 2：开放 agentic 应用，工具数量或 toolResult 数量不稳定，RAG chunk 数不稳定，多业务接入同一 agent 框架 → 使用三 CP 布局作为默认策略，通过监控确认命中率后再考虑简化。
场景 3：使用 Claude thinking（extended 或 adaptive thinking）→ 保留完整 reasoningContent 和 signature，不要在 reasoningContent 后插入 cachePoint，三 CP 布局中 moving checkpoint 放在最后一个非 reasoningContent block 后或当前 user/toolResult 末尾。

### 上线后必建监控指标
最小监控集应包含：inputTokens、cacheWriteInputTokens、cacheReadInputTokens，并计算 total_input = 三者之和以及 hit_rate = cacheReadInputTokens / total_input。建议建立以下排障顺序：当 cacheWriteInputTokens 一直为 0 时检查 prefix 是否达到模型最小 cache token 阈值或 SDK 是否支持 cachePoint/ttl 字段；当 cacheReadInputTokens 突然下降时检查 system、tools、thinking 参数、历史消息或序列化是否发生变化；当长对话中 hit rate 波动时检查某一轮是否新增了超过约 20 个 content blocks。
一个实用的生产基线是：先部署三 CP 稳健布局，观察 7 天的 cache hit rate、cache write token 和请求延迟，再决定是否为受控路径优化为单 moving tail checkpoint。

### 常见陷阱与规避
陷阱 1：在使用 thinking 时把 cachePoint 放在 reasoningContent 之后 → 会导致 Bedrock 拒绝请求。规避方法：始终将 moving checkpoint 放在最后一个非 reasoningContent block 后。
陷阱 2：某轮突然新增大量 content blocks（如30个 toolResult），导致尾部单 checkpoint 超出 20-block 回看窗口 → 导致 cacheReadInputTokens 下降、cacheWriteInputTokens 增大，整段静态 prompt 一起重写。规避方法：在 agentic 场景中使用三 CP 布局作为默认，或在业务层控制 content block 拆分粒度。
陷阱 3：将 Opus 4.7 的 prompt cache 能力当作生产承诺 → Opus 4.7 的 model card 未公开 prompt caching 支持表，实测观察不应作为生产决策依据。规避方法：在 Sonnet 4.6 和 Opus 4.6 之间切换时使用官方文档能力表，在 Opus 4.7 上线前进行充分验证并将 cache 行为纳入上线验证和监控。

### 代码实现关键函数
生产实现中三个关键函数：strip_cache_points 清理历史中的旧 cachePoint 以避免污染当前请求；add_tail_cache_point 在当前请求尾部放置新的 cachePoint，优先 user/toolResult 尾而避免 reasoningContent；build_converse_request 整合前两者并构建完整的 Converse API 请求结构。
核心逻辑是：每次请求前先清理历史 cachePoint，然后在 system prompt 末尾、tools 定义末尾和当前请求尾部各放置一个 cachePoint，这样即使某轮动态内容导致尾部 checkpoint 无法命中最长的历史 prefix，system 和 tools 仍然有独立 checkpoint 可以命中。

## 相关实体
- [Anthropic Prompt Caching for Claude Code](../ch01-677-anthropic) — Anthropic 官方博客解析：Prompt Caching 的 7 条经验与架构约束
- Amazon Nova Multimodal Embeddings 制造业智能应用
- [基于 Prowler 与 GenAI 构建金融行业智能合规中枢（Alt）](../ch11-035-基于-prowler-与-genai-构建金融行业智能合规中枢-alt)
- [Introducing OS Level Actions in Amazon Bedrock AgentCore Browser](../ch04-329-introducing-os-level-actions-in-amazon-bedrock-agentcore-bro)
- [SQS+Lambda异步管道：2000并发0%限流的工程细节](../ch11-084-aws-bedrock-serverless-async-inference-sqs-lambda)
- [build-custom-code-based-evaluators-in-amazon-bedrock-agentco](../ch11-049-build-custom-code-based-evaluators-in-amazon-bedrock-agentco)

- [Real-time voice agents with Stream Vision Agents and Amazon Nova 2 Sonic](../ch04-048-real-time-voice-agents-with-stream-vision-agents-and-amazon)
- [Improve bot accuracy with Amazon Lex Assisted NLU](../ch01-516-improve-bot-accuracy-with-amazon-lex-assisted-nlu)
- [AWS 一周综述：Amazon Bedrock AgentCore 付款、适用于 AWS 的 Agent 工具套件等（2026 年 5 月 11 日）](../ch11-045-aws-一周综述-amazon-bedrock-agentcore-付款-适用于-aws-的-agent-工具套件等-2)
- [航班变更信息智能识别解决方案 | Amazon Web Services](../ch04-204-航班变更信息智能识别解决方案)
- SunFinance: Textract+Claude准确率90.8%的ID提取方案
- [Zenjoy 基于 Amazon Bedrock 和 EKS 构建 AIOps Agent：打通 Prometheus、ES 与夜莺的智能化告警实战](../ch11-144-zenjoy-基于-amazon-bedrock-和-eks-构建-aiops-agent-打通-prometheus)
- [Amazon Finance 监管查询自动化](../ch11-010-how-amazon-finance-streamlines-regulatory-inquiries-by-using) — Bedrock + RAG 在金融合规场景的实战：多级 KV Cache、Query Expansion、DynamoDB 状态管理的完整架构
- [From siloed data to unified insights: Cross-account Athena Access for Amazon Quick](../ch01-555-from-siloed-data-to-unified-insights-cross-account-athena-a)
- [Control where your AI agents can browse with Chrome enterprise policies on Amazon Bedrock AgentCore](../ch11-128-control-where-your-ai-agents-can-browse-with-chrome-enterpri)
- [yc掌门人60天写了60万行代码：gstack开源](../ch01-497-garry-tan)
- [markdown 不会过时](../ch01-588-markdown-不会过时)
- [miro-amazon-bedrock-bug-routing](../ch11-159-miro-amazon-bedrock-bug-routing)

---

