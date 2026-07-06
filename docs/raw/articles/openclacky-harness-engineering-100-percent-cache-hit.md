---
source_url: "https://mp.weixin.qq.com/s/5jR9MjhEERMI59iYjFIJxg"
title: "Harness 工程实践复盘：100% Cache 命中的 Agent 怎么设计？"
author: "ClackyAI 创始人李亚飞（经 Founder Park 发布）"
published: 2026-05-19
created: 2026-05-19
type: article
platform: wechat
tags: [harness, OpenClacky, Cache, claude-code, LLM, Prompt-Cache, Multi-Agent, context-management, Ruby]
  - Harness
  - OpenClacky
  - Cache
  - Claude-Code
  - LLM
  - Prompt-Cache
  - Multi-Agent
  - Context-Management
  - Ruby
sha256: "57ece831427cfd0a88937c18920c8af44b50c7741b461307448a15dc1304680c"
rating: 8.5/9.0
review_value: 8.5
review_confidence: 9.0
review_result: strong
---
# Harness 工程实践复盘：100% Cache 命中的 Agent 怎么设计？
> OpenClacky 开源项目：https://www.openclacky.com/
> Benchmark：https://www.openclacky.com/benchmark
> GitHub：https://github.com/clacky-ai/openclacky
## 核心结论
ClackyAI 团队近期拿 4 家 Agent 做了一次横向测评，结果发现：同样的 prompt、同样的模型、同样的任务，成本最高可以相差 6 倍，且能与 ClaudeCode 保持同等能力。Harness 工程的水平，才是 Agent 产品真正拉开差距的地方。
## 两代失败
### 第一代：RAG / 知识库
把用户代码库、文档、历史会话全部 embedding 进向量库，检索 + 重排 + 改写查询。实际跑下来三个致命问题：
- 向量更新成本高且实时性差
- 90% 的召回率对 Agent 场景完全不够用（判断 97% 才刚刚够用）
- 多了一个会挂的部件，延迟也上来了
**结论：不要搞 RAG。如果要上 Agent，直接上 Agent，外加一个适合 AI 阅读的文档站就够了。**
### 第二代：多 Agent 工作流
Planner、Coder、Reviewer、Tester 各一个 agent，消息总线编排。结果：
- 每个 sub-agent 各有 cache 命名空间，交接一次就 miss 一次
- 单 agent 4 分钟能完成的任务，多 agent 编排到 14 分钟，成本翻 6 倍
- SWEBench 分数能刷上去，但实际用户体验脱节得厉害
**结论：不要做多 Agent 编排。人类的分工逻辑不适用于 AI——AI 不需要「一个人想、一个人写、一个人审」，一个足够好的 agent 加一套足够好的 harness 就够了。Benchmark 跑分也不重要，模型每半年跨一个台阶，用工作流堆出来的分数会被下一代模型 + 朴素 harness 直接抹平。**
### 第三代
围绕两件事组织：**Cache 局部性**和**工具集稳定性**。
## 7 个关键工程决策
### 决策 1：双 Cache 标记
大模型的 prompt cache 是按前缀匹配的——前缀里改一个字节，从那里往后全部失效。最直觉的做法是每轮在消息末尾打一个标记。但这个做法在三个场景下会失效：历史消息追加后原标记位置的内容变了；模型回退一次工具调用后标记直接作废；切换模型时标记抖动导致额外的 miss。
**做法：每轮标两条连续消息，形成一个滚动双缓冲。** 任何时刻都持有两个断点，一个读一个写。下一轮把「读」再读一次，在新尾部写一个新的。这样即使模型回退了一步，倒数第二个标记仍然落在有效消息上——单步回退仍能命中。
**为什么是 2 不是 3？** 双标记正好覆盖「旧尾部 / 新尾部」这一个边界，第三个标记落在更前面的位置，对应的 cache 段永远会被前两个覆盖——多写一次白花钱。
### 决策 2：System Prompt 字节冻结
OpenClacky 的 system prompt 在 session 启动时一次性构建，之后一个字节都不动。这是 cache 命中率的第一道地基——system prompt 一变，后面所有 cache 全废。
日常运行中至少有四类信息「天然想插进 system prompt」：当前时间、当前模型、新装的 Skill、用户偏好更新。如果真写进去，任何一次变更都是全量失效。
**做法：把这些动态信息写成一条普通消息插进对话历史，打上「系统注入」标签。** 它不会被 cache 标记选中，不会被算作真实用户轮数，压缩时也不会原样搬进新历史。同一天内只注入一条，跨天或切模型时再插一条新的。
**代价：session 中途装的新 Skill，当前 session 里看不到，要开新 session 才能用。** 接受这个摩擦——装 Skill 是低频操作，cache 命中是每轮都在享受的收益。
### 决策 3：Skill 子 Agent 架构
`invoke_skill` 是整个 OpenClacky 最核心的设计。它启动一个子 agent，子 agent 拥有跟主 agent 完全相同的工具集，执行完后把结果返回给主 agent。主 agent 的历史里只看到一对「调用 → 结果」消息。
这个设计解决了好几个问题：
**状态隔离。** 做代码审查的 Skill 可能需要读几十个文件、跑大量搜索、输出长篇分析。这些中间过程隔离在子 agent 的 session 里，主 agent 的历史没有被污染——cache 命中率不受影响，压缩也不会被提前触发。
**动态加载，不改工具列表。** 装新 Skill 就是放一个文件到指定目录。`invoke_skill` 这个工具本身始终存在，Skill 的内容是调用那一刻才读取的。不需要改 system prompt，不需要改工具 schema，不需要重启 session。
**能力可以无限扩展，但工具数始终是 16 个。** 代码探索、记忆召回、PPT 生成、部署上线——这些能力全部是 Skill，通过 `invoke_skill` 这一个工具入口调用。
### 决策 4：固定 16 个工具
工具 schema 紧贴 system prompt 之后，在 cache 前缀里。每多一个工具，不只多了 schema 的 token 成本，还多了「下次改工具时全量失效」的风险面。但工具太少也有代价：模型本来一步能做完的事要分好几步，轮次上去了，每轮都在付钱。
**16 个工具：**
- 文件读写 3 个
- 代码搜索 2 个
- 终端 1 个
- 浏览器 1 个
- 网络 2 个
- 任务管理 4 个
- 用户交互 1 个
- Skill 调用 1 个
- 安全删除 1 个
**设计原则：参数尽量少（减少模型出错），粒度刚好够用（不冗余也不过度合并），每个工具有充分的测试覆盖（1600+ 测试用例）。**
那些「看起来需要专用工具」的能力——代码库分析、记忆读写、浏览器多动作、sub-agent 编排、定时任务——全部通过 Skill 实现，不占工具位。这一套跑了 4 个月，没有需要加第 17 个工具的时候。
### 决策 5：压缩不换模型，空闲时做
上下文窗口再大也会填满。压缩不可避免，但压缩是 cache 命中率最大的单点威胁：老消息被替换成摘要，前缀从那一刻起就不一样了，必然 miss。
**不换模型压缩。** 很多 agent 开一个独立的 LLM call 用小模型做摘要。问题是这个独立 call 跟主 session 没有任何共享前缀，压缩本身就是 100% miss；压完之后主 session 的历史也变了，又是一轮 miss。等于每次压缩付两笔钱。
**做法：把压缩指令作为一条消息插进当前对话末尾，走正常请求路径。** 压缩 call 命中现有 cache（只有尾部几百 token 的指令是冷的），压完后重建历史只 miss 一轮。对比独立 call 方案，一次 50K token 会话的压缩事件，冷 token 从 50000 降到 500。
**空闲第 3 分钟启动压缩。** 大模型厂商的 cache 有 TTL，一段时间无请求就过期。用户停止输入 90 秒后检查，如果历史接近阈值就立刻压缩——此时 cache 还是热的，代价极低。用户思考几分钟回来，看到的是一个已经压缩好、cache 已经 warm 的 session。不做这一步的话，用户回来面对的是 cache 过期的长历史，单那一轮可能就是 10 倍成本。
**积极压缩而非用满上下文。** 100 万 token 即使全部 cache hit，一轮也要付 10 万 token 等价的钱。策略是压缩后保持历史在 1 万 token 以内。短历史 + 高命中率，比长历史 + 偶尔 miss 便宜得多，效果也更可控。
### 决策 6：工具自进化
PDF、Excel、Word、PPT 的读取是 Agent 高频需求。内置专用工具会让工具列表膨胀（违背决策 4），做成 Skill 让用户手动装体验又差。
**第三条路：首次安装时把一组 Python 脚本复制到用户目录，agent 需要读文档时用终端工具跑这些脚本。** 工具列表没有增加。如果脚本跑不过（缺依赖、格式变了），agent 自己修改脚本、装依赖，下次就不会出问题。
处理文档的能力不是写死在代码里的，它活在用户目录的脚本里，agent 自己可以维护和进化。
### 决策 7：内置浏览器，接管已有 Chrome
主流做法是 Headless 浏览器或外接 MCP 服务，两种都不用——内置了一个 MCP Client，直接接管用户已经在跑的 Chrome / Edge。
**Headless 的问题：** 用户不知道 agent 在干什么，出了问题无法判断，登录态和 cookie 也拿不到。
**外接 MCP 的问题：** 安装成本高、稳定性不可控、工具 schema 不可控（外部 MCP 可能暴露几十个细粒度工具，直接打进工具列表就违背了决策 4）。
**接管已有浏览器的好处：** 用户看得见 agent 的操作、登录态和 cookie 直接可用、对外只暴露一个 browser 工具（snapshot / click / type / navigate 等动作都是这一个工具的参数），schema 稳定。代价是需要维护 daemon 的生命周期管理，但这是一次性的工程投入。
## 核心原则
**把工程预算花在 Harness 上，把智能预算留给模型。**
不做 RAG，不做多 Agent 编排、不做工具堆叠——不是因为这些东西没用，而是因为模型在快速变好。半年前需要 4 个 agent 协作才能通过的任务，今天一个 agent + 一套好的 harness 就能做得更快更便宜。
选择把精力放在那些不会随模型进步而过时的事情上：cache 命中率、工具稳定性、安装体验、压缩策略。这些是 Harness 层面的基础设施，不管模型换到哪一代都用得上。