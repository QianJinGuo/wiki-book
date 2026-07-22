---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/amazon-bedrock-claude-application-design-prompt-cache-policy/
tags: [aws-china-blog, agentic-ai, context-engineering]
ingested: 2026-05-19
feed_name: AWS China Blog
source_published: 2026-05-19T03:48:36Z
sha256: a1c2fadf326588b65e218312ceb4b3ee4e690c14cdb697b710047f564724bd01
---
---
# 在 Amazon Bedrock 上为 Claude 应用设计稳健的 Prompt Cache 策略
摘要：本文介绍如何在 Amazon Bedrock 上为 Claude 应用设计 Prompt Cache。
**目录**
01 一、概览
02 二、Prompt cache 的核心心智模型
03 三、什么是 content block，以及 20-block 回看限制
04 四、推荐布局：受控场景单 CP，通用 agentic 场景三 CP
05 五、Claude thinking 与 cache checkpoint
06 六、TTL、成本和模型支持
07 七、代码示例：三 CP 稳健布局
08 八、监控和排障
09 九、总结
10 十、参考资料
11 十一、动态演示
* * *
## **一、概览**
Prompt caching 可以降低长上下文应用的输入 token 成本和响应延迟。对于包含长 system prompt、工具定义、RAG 文档或多轮历史的 Claude 应用，正确放置 cache checkpoint 往往能把重复上下文的计费降低到普通输入 token 的一小部分，并改善高并发场景下的有效吞吐。
但在真实生产环境中，prompt cache 的难点不只是“打开功能”。工程团队还需要回答几个具体问题：
  * cache checkpoint 应该放在哪里？
  * 多轮对话越变越长后，尾部 checkpoint 还能命中早期 system 和 tools 吗？
  * Claude thinking block 会不会影响 cache 命中？
  * 单 checkpoint 和多 checkpoint 哪个更适合 agentic 应用？
  * 上线后应该监控哪些 usage 字段？
本文基于 [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) 官方文档和一组 Claude 模型实测，给出一套可落地的设计建议。官方文档已经说明：Claude 模型支持 simplified cache management，可以在静态内容末尾放置单个 cache checkpoint，Bedrock 会从该 checkpoint 往前最多约 20 个 content block boundary 查找最长匹配 prefix。本文进一步讨论这个机制在多轮对话和 agentic 工作流里的工程含义。
## **二、Prompt cache 的核心心智模型**
Prompt cache 缓存的是 prompt prefix，也就是从当前请求开头到某个 cache checkpoint 之前的连续内容。它不是缓存任意中间片段。
例如一次请求可以抽象为：
    S | Tools | U1 | A1 | U2 | CP
这里 CP 是 cache checkpoint。该 checkpoint 对应的 prefix 是：
    S | Tools | U1 | A1 | U2
如果上一轮已经缓存过：
    S | Tools | U1
那么本轮可以命中这段 prefix，并把新增部分写入 cache：
    cache read  = S | Tools | U1
    cache write = A1 | U2
需要注意的是，cacheWriteInputTokens 统计的是本轮新增写入部分的 token 数；但新建立的 cache checkpoint 语义上对应的是一个更长的完整 prefix：
    S | Tools | U1 | A1 | U2
因此，prompt cache 的命中判断可以理解为：
    在当前 cache checkpoint 之前，寻找一个与历史已缓存 checkpoint 完全一致的最长 prefix。
    命中的 prefix 计入 cache read；
    从命中结束位置到当前 checkpoint 的新增部分计入 cache write。
## **三、什么是 content block，以及 20-block 回看限制**
在 Bedrock Converse API 中，一个 content 数组里的一个元素可以按一个 content block 理解。例如：
    {
        "role": "user",
        "content": [
            {"text": "请总结这份文档"},
            {"image": {...}},
            {"text": "重点看财务风险"},
        ],
    }
这条 user message 包含 3 个 content blocks。常见 block 类型包括 text、image、document、toolUse、toolResult、reasoningContent 和 cachePoint。在 Converse API 中，cachePoint 本身是一个独立 content block。
AWS 官方文档说明，Claude simplified cache management 会从指定 breakpoint 往前最多约 20 个 content blocks 查找最长匹配 prefix。这个限制看的是 block 数，不是 token 数。一个 10,000-token 的大 text 仍然可以只是 1 个 block；而 30 个很短的 toolResult 则是 30 个 blocks。
这带来一个重要结论：
    长对话本身不是问题。
    某一轮突然新增过多 content blocks，才是单尾部 checkpoint 的主要风险。
假设第 99 轮已经缓存：
    S | Tools | U1 | A1 | ... | U99
第 100 轮请求为：
    S | Tools | U1 | A1 | ... | U99 | A99 | U100 | CP
虽然 S 和 Tools 早已距离当前尾部超过 20 个 blocks，但上一轮 checkpoint 的结束边界 U99 离当前 CP 只有 2 个新增 blocks。因此 Bedrock 仍然可以命中完整 prefix：
    cache read = S | Tools | U1 | A1 | ... | U99
换句话说，20-block 限制约束的是“当前 checkpoint 与最近可命中 checkpoint 边界之间的 block 距离”，不是 system/tools 到当前尾部的绝对距离。
风险出现在某一轮新增大量 blocks：
    S | Tools | ... | U99 | TR1 | TR2 | ... | TR30 | CP
如果上一轮 checkpoint 边界 U99 离当前 CP 超过约 20 个 blocks，尾部单 checkpoint 可能无法找到这个历史 prefix，导致 cacheReadInputTokens 下降、cacheWriteInputTokens 增大。
## **四、推荐布局：受控场景单 CP，通用 agentic 场景三 CP**
在 Bedrock 上为 Claude 设计 prompt cache 时，可以按场景复杂度选择两种策略。
### 4.1 策略一：单 moving tail checkpoint
如果应用能控制每轮新增的 content block 数，最简单的策略是每次请求只保留一个 cache checkpoint，并把它放在当前 prompt 的尾部。
每次请求前：
1\. 清理历史中的旧 cachePoint。
2\. 在当前最后一个 user message 或 toolResult message 的末尾放置一个新的 cachePoint。
3\. 发送请求，并监控 cache read / cache write。
这个策略适合：
  * 固定客服 bot
  * 固定 RAG pipeline
  * 每轮新增 block 数稳定且远小于 20
  * 团队能控制 toolResult、RAG chunk、image、document 的拆分方式
示意：
    R1: S | Tools | U1 | CP
    R2: S | Tools | U1 | A1 | U2 | CP
    R3: S | Tools | U1 | A1 | U2 | A2 | U3 | CP
只要每轮新增 block 数很少，上一轮 checkpoint 边界始终在当前 CP 的 20-block 回看窗口内，即使完整历史已经很长，也可以继续命中包含 system 和 tools 的长 prefix。
### 4.2 策略二：system + tools + moving tail 的三 CP 布局
对于开放 agentic 应用，单 checkpoint 隐含一个假设：客户端能够预测并控制每轮新增 content block 数。这个假设在受控 pipeline 中成立，但在接入任意业务系统、工具调用和 RAG 工作流时容易失效。
更稳健的默认布局是：
    CP #1: system prompt 末尾
    CP #2: tools 定义末尾
    CP #3: 当前请求尾部 moving checkpoint
这个布局用两个静态 checkpoint 的小成本，换取对复杂场景的鲁棒性。即使某一轮 toolResult 或 RAG chunk 过多，导致尾部 moving checkpoint 无法命中最长历史 prefix，system 和 tools 仍然有独立 checkpoint 可以命中，不至于整段静态 prompt 一起重写。
这个策略适合：
  * 工具数量或工具结果数量不稳定
  * RAG chunk 数不稳定
  * 多业务接入同一 agent 框架
  * SDK 或业务层可能自动拆分 content blocks
  * 团队无法保证每轮新增 blocks 少于 20
可以把它理解为：三 CP 不是否定 simplified cache management，而是在开放 agentic 场景中为 simplified 的尾部 checkpoint 增加两个静态安全锚点。
## **五、Claude thinking 与 cache checkpoint**
Claude 模型在 Bedrock 上支持 extended thinking 或 adaptive thinking。使用 thinking 时，客户端通常会在 assistant message 中看到 reasoningContent，并且该内容可能包含 signature。
生产建议是：
  * 保留完整 reasoningContent 和 signature，不要修改其中内容。
  * 不要把 cachePoint 放在 reasoningContent 之后。Bedrock 会拒绝这种位置。
  * 如果使用三 CP 布局，moving checkpoint 放在最后一个非 reasoningContent block 后，或放在当前 user/toolResult 末尾。
  * 如果使用单 CP 布局，优先放在当前 user message 的尾部，避免触碰 assistant thinking block。
AWS extended thinking 文档说明，在 tool result 接续时，历史 thinking blocks 可以被缓存并在 usage metrics 中作为 cache read token 计入；当后续 user block 不是 tool result 时，之前的 thinking blocks 会被忽略并从模型上下文中剥离。实测中，一些场景下 thinking block 对 cache billing 的影响与模型推理上下文的剥离行为并不完全等同。因此，建议把 thinking 相关行为纳入上线监控，而不要只依赖静态推断。
## **六、TTL、成本和模型支持**
Prompt caching 的成本模型可以按三类 input token 理解。Amazon Bedrock 在响应的 usage 中分别返回普通 input、cache write 和 cache read token 数：
类型 | 含义  
---|---  
inputTokens | 未命中、也未写入 cache 的普通 input token  
cacheWriteInputTokens | 本轮新写入 cache 的 token  
cacheReadInputTokens | 本轮从 cache 读取的 token  
对 Converse API 来说，完整 prompt input 可以近似按以下方式核对：
    完整输入 token = inputTokens + cacheWriteInputTokens + cacheReadInputTokens
这三个桶互不重叠。也就是说，一个 token 不会既按普通 input 计费，又按 cache read 计费。一次请求中的有效输入成本可以按下面的方式估算：
    effective input cost =
      inputTokens × standard_input_price
    + cacheWriteInputTokens × cache_write_price
    + cacheReadInputTokens × cache_read_price
对 Claude prompt caching，cache read 通常显著低于普通 input 价格；cache write 则高于普通 input 价格，用于支付创建 cache checkpoint 的成本。以常见倍率理解：
Token bucket | 典型计费倍率（相对普通 input） | 含义  
---|---|---  
普通 input | 1.0x | 未命中、未写入 cache 的输入  
5-minute cache write | 1.25x | 写入 5-minute TTL cache  
1-hour cache write | 2.0x | 写入 1-hour TTL cache，需模型支持  
cache read | 0.1x | 从 cache 读取已缓存 prefix  
实际价格会随模型、Region、服务层级和 AWS 定价更新变化；生产前应以 Amazon Bedrock pricing 页面为准。上表的价值在于帮助快速判断回本点：
    5-minute TTL: 写入后命中 1 次即开始节省
    1.25x write + 0.1x read = 1.35x < 两次普通 input 的 2.0x
    1-hour TTL: 写入后至少命中 2 次更稳
    2.0x write + 2 × 0.1x read = 2.2x < 三次普通 input 的 3.0x
举例，如果一个请求包含 5,000 个可复用 system prompt token 和 100 个动态 user token，且 system prompt 已命中 cache：
    不开 cache: 5,100 × 1.0x
    命中 cache: 100 × 1.0x + 5,000 × 0.1x = 600 等价 input token
这类长而稳定的 prompt prefix 是 prompt caching 最容易产生收益的场景。
在设计 TTL 时，通常遵循两个原则：
  * 高频请求优先使用默认 5-minute TTL。只要在 TTL 内持续命中，缓存会刷新。
  * 较长间隔的会话、batch、side-agent 或用户可能超过 5 分钟才继续交互的场景，可以评估 1-hour TTL，但必须先确认目标模型支持。
如果同一个请求中混用 1-hour 和 5-minute TTL，较长 TTL 的 checkpoint 应该出现在较短 TTL 的 checkpoint 之前。这样可以把更稳定的 system 或工具定义放在更长 TTL 上，把更动态的历史放在较短 TTL 上。
下表汇总了本文重点讨论的三个 Claude 模型在 Bedrock 上的 prompt cache 能力。Sonnet 4.6 和 Opus 4.6 的信息来自各自 AWS model card；Opus 4.7 当前 model card 未公开列出 prompt caching 支持表，因此下方将本项目观察到的行为标注为实测观察，而不是 AWS 官方支持承诺。
模型 | 最小 cache prefix size | 每请求最大 checkpoint 数 | 官方 TTL 信息 | 字段 | 备注  
---|---|---|---|---|---  
Claude Sonnet 4.6 | 1,024 tokens | 4 | 5 minutes, 1 hour | system, messages, tools | 来自 Sonnet 4.6 model card  
Claude Opus 4.6 | 1,024 tokens | 4 | 5 minutes, 1 hour | system, messages, tools | 来自 Opus 4.6 model card  
Claude Opus 4.7 | 1,024 tokens（实测观察） | 4（按 Claude 上限设计） | 5-minute cache 和 1-hour TTL 需生产前确认 | system, messages, tools（按 Claude cache API 设计） | 当前 model card 未公开 prompt caching 支持表；本文项目曾观察到 5-minute cache 可用，且 1-hour TTL 在特定测试中 35 分钟内仍命中，但不建议在未确认前作为生产承诺  
这个表的工程含义是：如果你在 Sonnet 4.6 和 Opus 4.6 之间切换，cache prefix 达到 1,024 tokens 通常即可满足官方最小阈值；如果加入 Opus 4.7，应把 cache 行为纳入上线验证和监控，不要只依赖其他 Claude 4.x 模型的能力表做推断。
## **七、代码示例：三 CP 稳健布局**
下面的示例展示 Converse API 中的基本结构。实际生产代码还需要处理工具执行、错误重试和 usage 监控。
    def strip_cache_points(messages: list[dict]) -> None:
        for msg in messages:
            content = msg.get("content")
            if isinstance(content, list):
                msg["content"] = [
                    block for block in content
                    if not (isinstance(block, dict) and "cachePoint" in block)
                ]
    def add_tail_cache_point(messages: list[dict]) -> None:
        """Add a moving cachePoint at the current prompt tail.
        Prefer user/toolResult tail. Avoid inserting after reasoningContent.
        """
        if not messages:
            return
        tail = messages[-1].setdefault("content", [])
        if isinstance(tail, list):
            tail.append({"cachePoint": {"type": "default"}})
    def build_converse_request(model_id: str, system_prompt: str, tools: list[dict], messages: list[dict]) -> dict:
        strip_cache_points(messages)
        add_tail_cache_point(messages)
        tool_specs = [
            {
                "toolSpec": {
                    "name": tool["name"],
                    "description": tool["description"],
                    "inputSchema": {"json": tool["input_schema"]},
                }
            }
            for tool in tools
        ]
        return {
            "modelId": model_id,
            "system": [
                {"text": system_prompt},
                {"cachePoint": {"type": "default"}},
            ],
            "toolConfig": {
                "tools": [
                    *tool_specs,
                    {"cachePoint": {"type": "default"}},
                ],
            },
            "messages": messages,
            "inferenceConfig": {"maxTokens": 4096},
        }
如果你确认每轮新增 block 数稳定且很少，可以去掉 system 和 tools 后的 checkpoint，仅保留尾部 moving checkpoint。但对通用 agentic 应用，建议先采用三 CP 布局，并通过监控确认命中率后再简化。
## **八、监控和排障**
上线后，不要只看请求是否成功。至少记录以下字段：
    usage = response["usage"]
    input_tokens = usage.get("inputTokens", 0)
    cache_write = usage.get("cacheWriteInputTokens", 0)
    cache_read = usage.get("cacheReadInputTokens", 0)
    total_input = input_tokens + cache_write + cache_read
    hit_rate = cache_read / total_input if total_input else 0
建议建立以下排障顺序：
  1. cacheWriteInputTokens 一直为 0：检查 prefix 是否达到模型的最小 cache token 阈值，或 SDK 是否支持 cachePoint / ttl 字段。
  2. cacheReadInputTokens 突然下降：检查 system、tools、thinking 参数、历史消息或序列化是否发生变化。
  3. 长对话中 hit rate 波动：检查某一轮是否新增了超过约 20 个 content blocks。
  4. agentic 场景中偶发整段重写：考虑从单 CP 切换到三 CP，或合并 toolResult / RAG chunk。
  5. 使用 thinking 时出现异常：确认没有把 cachePoint 放在 reasoningContent 后，并保留完整 reasoningContent/signature。
一个实用的生产基线是：先部署三 CP 稳健布局，观察 7 天的 cache hit rate、cache write token 和请求延迟，再决定是否为受控路径优化为单 moving tail checkpoint。
## **九、总结**
Amazon Bedrock 的 Claude prompt caching 不只是一个成本优化开关，它会影响多轮对话、工具调用和 agentic workflow 的整体架构。
可以用以下规则快速决策：
  * 如果是固定 bot 或固定 pipeline，且每轮新增 content blocks 可控，使用单 moving tail checkpoint。
  * 如果是开放 agentic 场景，默认使用 system + tools + moving tail 的三 CP 布局。
  * 20-block 回看限制约束的是当前 checkpoint 与最近可命中 checkpoint 边界之间的距离，不是 system/tools 到尾部的距离。
  * thinking block 默认完整保留，不要修改 signature，不要在 reasoningContent 后插入 cachePoint。
  * 用 inputTokens、cacheWriteInputTokens 和 cacheReadInputTokens 做持续监控，而不是只凭布局推断命中率。
通过把 checkpoint 放置策略、content block 数控制和 usage 监控结合起来，团队可以在降低 token 成本的同时，提高 Claude 多轮应用在 Bedrock 上的稳定性和可预测性。
**下一步行动：**
**相关产品：**
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1>) — 用于构建生成式人工智能应用程序和代理的端到端平台
**相关文章：**
  * [通过 Amazon Bedrock 运行 Claude Cowork 配置实践](<https://aws.amazon.com/cn/blogs/china/claude-cowork-amazon-bedrock-configuration-practice/?p=bl_ar_l=1>)
  * [别让你的 Amazon Bedrock 模型为他人”打工”——API 调用安全防护指南](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-model-api-invocation-security-guide/?p=bl_ar_l=2>)
  * [自己的工具自己控：MCP Server、Amazon Bedrock AgentCore、Quick Suite集成指南](<https://aws.amazon.com/cn/blogs/china/tool-mcp-server-amazon-bedrock-agentcore-quick/?p=bl_ar_l=3>)
## **十、参考资料**
  * [Amazon Bedrock Prompt caching for faster model inference](<https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html>)
  * [Amazon Bedrock Extended thinking](<https://docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-extended-thinking.html>)
  * [Amazon Bedrock Adaptive thinking](<https://docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-adaptive-thinking.html>)
  * [Amazon Bedrock pricing](<https://aws.amazon.com/bedrock/pricing/>)
## **十一、动态演示**
Demo Link：<https://ds470b74heox1.cloudfront.net/prompt-cache-demo/index.html>
*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。
## 本篇作者
### 薛东
亚马逊云科技资深解决方案架构师，负责基于亚马逊云科技的解决方案设计和构建。加入亚马逊云科技之前曾就职于 EMC，阿里云等头部 IT 企业，积累了丰富的企业级应用开发，测试和架构经验。目前服务亚马逊云科技中国媒体和广告行业客户。专注于无服务，安全，生成式 AI 等技术方向。
### 赵克鸣
亚马逊云科技解决方案架构师，负责云计算解决方案的咨询和设计。热爱 AI/ML 领域的技术研究，并通过可实施的解决方案，帮助客户取得业务价值。
* * *
## AWS 架构师中心：云端创新的引领者
探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---