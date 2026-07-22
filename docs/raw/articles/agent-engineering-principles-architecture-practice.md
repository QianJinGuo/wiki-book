---
title: agent-engineering-principles-architecture-practice
source_url: https://mp.weixin.qq.com/s/cIQYl9Wr1Eov4ma-_bYh-w
publish_date: 2026-04-28
tags: [wechat, article, claude, openai, gpt, agent, harness, rag, coding, llm, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: b2b46d98dccb1588f2580ad632636a57f9d9a597f5fad9c2cf5d519b9c1ed814
---
你不知道的 Agent：原理、架构与工程实践
侑夕 阿里云开发者
2026年4月28日 08:32 浙江
阿里妹导读
文章内容基于作者个人技术实践与独立思考，旨在分享经验，仅代表个人观点。
这篇文章主要讲 Agent 架构里几块最影响工程效果的内容，包括控制流、上下文工程、工具设计、记忆、多 Agent 组织、评测、追踪和安全，最后再用 OpenClaw 的实现把这些设计原则串起来看一遍。
整理下来，有几处判断和我原来想的不太一样，更贵的模型带来的提升，很多时候没有想象中那么大，反而 Harness 和验证测试质量对成功率的影响更大，调试 Agent 行为时，也应优先检查工具定义，因为多数工具选择错误都出在描述不准确，另外，评测系统本身的问题，很多时候比 Agent 出问题更难发现，如果一直在 Agent 代码上反复调，效果未必明显，读完这篇，这几个问题应该能有些答案。
一、Agent Loop 的基本运转方式
Agent Loop 的核心实现逻辑抽象后其实不到 20 行代码：
const messages: MessageParam[] = [{ role: "user", content: userInput }];
while (true) {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 8096,
    tools: toolDefinitions,
    messages,
  });
  if (response.stop_reason === "tool_use") {
    const toolResults = await Promise.all(
      response.content
        .filter((b) => b.type === "tool_use")
        .map(async (b) => ({
          type: "tool_result" as const,
          tool_use_id: b.id,
          content: await executeTool(b.name, b.input),
        }))
    );
    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });
  } else {
    return response.content.find((b) => b.type === "text")?.text ?? "";
  }
}
对应的控制流如下，感知 -> 决策 -> 行动 -> 反馈四个阶段不断循环，直到模型返回纯文本为止：
看过不少 Agent 实现和官方 SDK，结构都差不多，循环本身相当稳定，从最小实现一路扩展到支持子 Agent、上下文压缩和 Skills 加载，主循环基本没有变化，新增能力通常都是叠加在循环外部，而不是改动循环内部。
新能力基本只通过三种方式接入：扩展工具集和 handler、调整系统提示结构、把状态外化到文件或数据库，不应该让循环体本身变成一个巨大的状态机，模型负责推理，外部系统负责状态和边界，一旦这个分工确定下来，核心循环逻辑就很少需要频繁调整了。
Workflow 和 Agent 有什么区别
Anthropic 对这两类系统有一个直接区分：执行路径由代码预先写死的是 Workflow，由 LLM 动态决定下一步的是 Agent，核心区别在于控制权掌握在谁手里，现实中很多标着 Agent 的产品，深入看其实更接近 Workflow，不过两者本身并无高下之分，真正重要的是给任务找到更适合的解决方案。
五种常见控制模式
大多数 AI 系统拆开看，其实都是这五种模式的组合：提示链（Prompt Chaining）、路由（Routing）、并行（Parallelization）、编排器-工作者（Orchestrator-Workers）、评估器-优化器（Evaluator-Optimizer）。
二、为什么 Harness 比模型更关键
Harness 是指围绕 Agent 构建的测试、验证与约束基础设施，包括：验收基线、执行边界、反馈信号和回退手段。
核心判断：模型虽然重要，但决定系统能不能稳定运行的，往往是这些外围工程条件。这个判断在代码编写这类高可验证任务上最成立，但在开放式研究、多轮协商这类弱验证任务里，模型上限本身仍然更关键。
Harness 的关键结论：任务清晰度和验证自动化程度决定 Agent 适合区域。右上角（目标明确 + 结果可自动验证）最适合 Agent；Harness 要做的就是把任务推进右上角，让对错有机器可执行的判断标准。
三、上下文工程为什么决定稳定性
Transformer 的注意力复杂度是 O(n²)，上下文越长关键信号越容易被噪声稀释。常见失效模式 Context Rot：无关内容一旦占到上下文大头，Agent 决策质量明显下滑。
上下文分层：
- 常驻层：身份定义、项目约定、绝对禁止项，保持短、硬、可执行
- 按需加载：Skills 和领域知识，描述符常驻，完整内容触发时再注入
- 运行时注入：当前时间、渠道 ID、用户偏好等动态信息
- 记忆层：跨会话经验写入 MEMORY.md，需要时才读取
- 系统层：Hooks 或代码规则处理确定性逻辑，完全不进上下文
Prompt Caching：常驻层越稳定，前缀命中率越高，边际成本越低。稳定的大系统提示比频繁变动的小提示实际成本更低（写入成本只付一次，后续调用读取折扣可达 90%）。
Skills 按需加载：系统提示只保留索引，完整知识按需加载。没有反例时准确率从 73% 掉到 53%，加上反例后升到 85%，响应时间还降了 18.1%。
压缩保留优先级：1. 架构决策，不得摘要；2. 已修改文件和关键变更；3. 验证状态；4. 未解决的 TODO 和回滚笔记；5. 工具输出可删只留 pass/fail 结论。
四、工具设计决定 Agent 能做什么
工具定义的质量比数量更关键。仅 5 个 MCP 服务器就可能带来约 55,000 tokens 的工具定义开销。
工具设计演进三代：
- 第一代：API 封装，每个 Endpoint 对应一个工具，粒度过细
- 第二代：ACI（Agent-Computer Interface），工具对应 Agent 目标而不是底层 API
- 第三代：Advanced Tool Use（Tool Search + Programmatic Tool Calling + Tool Use Examples）
ACI 三原则：面向目标而不是底层 API、边界明确、参数防错、定义里直接给示例。
调试 Agent 时应先检查工具定义，大多数工具选择错误的原因出在描述不准确，不在模型能力。
五、记忆系统如何设计
四种记忆分类：
- 上下文窗口 = 工作记忆
- Skills = 程序性记忆
- JSONL 会话历史 = 情景记忆
- MEMORY.md = 语义记忆
ChatGPT 四层记忆：Session Metadata / User Memory（约33条）/ Conversation Summary（约15个摘要）/ Current Session。
OpenClaw 混合检索：memory/YYYY-MM-DD.md 追加写 + MEMORY.md 精选 + 70%向量+30%关键词混合检索。
记忆整合触发阈值：tokenUsage / maxTokens >= 0.5。可回退设计：只移动指针，不删除原始消息。
六、如何逐步放开 Agent 自主度
长任务跨 session：Initializer Agent + Coding Agent 协作模式。Initializer Agent 首轮生成 feature-list.json、init.sh、git commit 和 claude-progress.txt，Coding Agent 循环从文件系统恢复现场。
任务状态显式写出来，用 JSON 而不是 Markdown。
七、多 Agent 如何组织
两种工作模式：
- 指挥者模式：同步协作，人与单个 Agent 紧密互动，session 结束 context 就没了
- 统筹者模式：异步委派，人在起点和终点出现，中间产出是分支/PR 等可持久化工件
协作协议核心：JSONL inbox + Worktree 隔离 + 任务图管理依赖。
子 Agent 只回传摘要，探索细节留在自己的消息历史里。
多 Agent 下幻觉会互相放大。顺序：先有可持久化任务图，再引入有身份的队友，再引入结构化通信协议，最后再加交叉验证。
八、Agent 评测如何做
三组核心概念：
- task（测什么）/ trial（跑多少次）/ grader（怎么打分）
- transcript（执行记录）/ outcome（环境最终结果）
- agent harness（被测 Agent 运行框架）/ evaluation harness（评测基础设施）
两个关键指标：
- Pass@k：k 次至少一次正确 → 探索能力上限
- Pass^k：k 次全部正确 → 上线回归
代码评分器 / 模型评分器 / 人工评分器，按确定性从高到低选。
先修评测，再改 Agent：评测系统出错来源（资源不足/评分器 bug/测试用例脱节/只看聚合分数）和模型退化表现一模一样，很难从结果数字区分。
九、如何追踪 Agent 的执行过程
Trace 记录：完整 Prompt + messages[] + 工具调用参数和返回值 + 推理链 + 最终输出 + token 消耗和延迟。
两层可观测性：人工抽样标注（错误案例/长对话/负反馈）+ LLM 自动评估（全量 Trace）。
在线评测采样策略：负反馈 100% 进队列 / 高成本对话优先审查 / 时间窗口随机采 / 变更后48小时全量。
事件流：tool_start / tool_end / turn_end 三节点 emit，一次发布多路消费。
十、用 OpenClaw 看 Agent 如何落地
五层架构：Gateway（WebSocket 端口18789）/ Channel 适配器（23+渠道）/ Pi Agent（主循环+会话状态）/ 工具集（ACI原则）/ 上下文+记忆。
MessageBus 解耦渠道和 Agent：dispatch 不做 await，不同 session 并发处理，同一 session 内串行。
安全边界先于功能：白名单授权 + 工作空间隔离（realpath+relative检查）+ 操作审计日志。
两层兜底：Prompt Injection（source-sink 拆分/最小权限/显式确认/标注外部内容边界/独立LLM验证）+ Provider 故障切换（多 Provider fallback）。
十一、常见反模式
系统提示当知识库 / 工具数量失控 / 缺少验证机制 / 多 Agent 无边界 / 记忆不整合 / 没有评测 / 过早引入多 Agent / 约束靠期望不靠机制。
十二、划重点
1. Agent 核心是感知→决策→行动→反馈的稳定循环，新能力通过工具扩展、提示结构调整和状态外化实现
2. Harness 比模型本身更决定系统能否收敛
3. 上下文工程重点是防 Context Rot，通过分层管理
4. 工具设计按 ACI 原则
5. 四种记忆分类，MEMORY.md + 可回退整合是关键
6. 长任务靠状态外化（Initializer + Coding Agent）
7. 多 Agent 先有任务图和隔离边界再并行
8. Pass@k 验证能力边界，Pass^k 保证上线质量
9. Trace 是排查前提，事件流做底座
10. OpenClaw 验证：消息解耦 + 状态外化 + 分层提示 + 记忆整合 + 安全边界
参考资料
1. OpenAI, Harness engineering: leveraging Codex in an agent-first world — https://openai.com/index/harness-engineering/
2. Cloudflare, How we rebuilt Next.js with AI in one week — https://blog.cloudflare.com/vinext/
3. Simon Willison, I ported JustHTML from Python to JavaScript with Codex CLI — https://simonwillison.net/2025/Dec/15/porting-justhtml/
4. Anthropic, Introducing Agent Skills — https://claude.com/blog/skills
5. Anthropic, Managing context on the Claude Developer Platform — https://claude.com/blog/context-management
6. LangChain, State of Agent Engineering — https://www.langchain.com/state-of-agent-engineering
7. Anthropic, Measuring AI agent autonomy in practice — https://www.anthropic.com/research/measuring-agent-autonomy
8. OpenAI, Designing AI agents to resist prompt injection — https://openai.com/index/designing-agents-to-resist-prompt-injection/
9. Anthropic, Demystifying evals for AI agents — https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents