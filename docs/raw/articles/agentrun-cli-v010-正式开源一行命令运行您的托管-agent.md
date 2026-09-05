---
title: AgentRun CLI v0.1.0 正式开源：一行命令运行您的托管 Agent
source_url: https://mp.weixin.qq.com/s/WRZruW1gG1a-meLU9E7joQ
publish_date: 2026-05-09
tags: [wechat, article, claude, openai, deepseek, agent, rag, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 92fc40c4f424c316dd367503743bb2c62cd03bbabb61b6b7583a22ec2f486209
---
# AgentRun CLI v0.1.0 正式开源：一行命令运行您的托管 Agent
> 托管 Agent 的范式已经确立，接下来我们要做的，是让开发者能够通过一条命令将其运行起来。 
** 01  **
_ ** AgentRun 平台优势已立，开发者侧补位  ** _
_ Cloud Native  _
在上一篇文章  《  [ 托管 Agent 执行循环只是起点——AgentRun 托管的更是企业 AI 生产全链路  ](<https://mp.weixin.qq.com/s?__biz=MzUzNzYxNjAzMg==&mid=2247583492&idx=1&sn=d6ce0429f03fb1042bfc377d38301685&scene=21#wechat_redirect>) 》  中，我们将阿里云 AgentRun 与 Claude Managed Agents (CMA) 进行了正面对比。结论非常清晰：托管式 Agent 已成为行业共识。 
AgentRun 是以高代码为核心、生态开放、灵活组装的一站式 Agentic AI 基础设施平台，为企业级 Agent 提供开发、调试、部署、运维的全生命周期管理。助力企业和开发者专注于 AI 业务创新，无需自建和管理底层基础设施，让 Agentic AI 真正进入企业生产环境。从定位上来讲，  ** AgentRun 是阿里云提供的 Managed Agents 平台  ** ，  与 CMA 相比具备企业级、无厂商锁定两大差异化优势。 
上一篇文章末尾，我们提到了 AgentRun 在开发者生态方面存在的差距。Anthropic CMA 在发布之初便覆盖了 Python / TypeScript / Go / Java / C# / Ruby / PHP 七种语言的 SDK，并配备了  ant  CLI，开发者仅需几行命令即可跑通完整的会话流程。这一方向无疑是正确的：托管平台能否实现规模化，最终取决于开发者能否使用最熟悉的工具，在最短的时间内将 Agent 接入到自己的工程中。 
今天，我们将补齐开发者生态的这块拼图。  AgentRun CLI v0.1.0 正式开源发布，  同时 AgentRun Python SDK 也迎来了同步迭代，原生支持超级 Agent（Super Agent）的定义与调用。代码仓库现已全面开放： 
  * AgentRun CLI：  https://github.com/Serverless-Devs/agentrun-cli 
  * AgentRun Python SDK：  https://github.com/Serverless-Devs/agentrun-sdk-python 
下文将分别从 CLI 快速体验、声明式 API，以及同步升级的 SDK 三个维度进行详细介绍。 
** 02  **
_ ** ar：一条命令，将托管 Agent 接入终端  ** _
_ Cloud Native  _
ar  （或  agentrun  ）是一个单二进制 CLI 工具，其内部封装了 AgentRun Python SDK。在设计之初，我们主要聚焦于两类用户群体：一类是本地开发者，希望免去“打开浏览器、登录控制台、点击按钮、粘贴 Prompt”的繁琐流程；另一类是脚本、CI 流水线，以及越来越多开始自主调用 CLI 的 LLM Agent，对它们而言，默认输出 JSON、确定性的退出码、以及在非 TTY 环境下不弹出交互提示，是不可或缺的刚需。 
v0.1.0 版本核心能力清单： 
  * ar super-agent run  ：一条命令创建托管 Agent 并进入 REPL 交互环境。 
  * ` Kubernetes 风格的 YAML：通过  ` ar sa apply -f superagent.yaml  实现幂等部署。 
  * 六大资源组：涵盖  config  /  model  /  sandbox  /  tool  /  skill  /  super-agent  ，采用统一的  ar <group> <action> 命令模式。 
  * 多 Profile 配置：支持单机管理多套环境，使用  \--profile staging  即可轻松切换。 
  * 丰富的输出格式：支持  json  （默认）、  table  、  yaml  、  quiet  ，对管道操作高度友好。 
  * 完整的沙箱原语：内置代码执行、文件系统、进程管理，以及 CDP/VNC 浏览器自动化能力。 
  * 跨平台独立二进制包：通过 PyInstaller 构建，提供 Linux / macOS / Windows（涵盖 x86_64 与 arm64）架构的独立执行文件，无需在本地环境中预装 Python。 
▍  2.1 快速开始：三步获取第一条回复 
根据内部测试记录：一位此前未使用过 AgentRun 的研发人员，从打开终端到获取 Agent 的首条回复，仅耗时 63 秒。在完成一次性的云端授权后，整个流程仅需三个步骤： 
** 前置条件：完成一次性的 RAM 授权  **
首次调用  ar super-agent  系列命令前，需要在阿里云侧完成两项一次性授权： 
  * ** 创建 AgentRun 自定义服务角色  ** AliyunAgentRunSuperAgentRole  ` ：  通过 RAM  ` 一键授权链接  在控制台一键确认。AgentRun 借助该角色在您账号下托管运行时资源，未授权时  run  /  apply  会在创建阶段直接失败。 
  * ** 为 AccessKey 挂载  ** AliyunAgentRunFullAccess  ** 系统策略：  保存到 CLI 中的 AccessKey 所属的 RAM 用户（或角色）必须具备此权限，否则将以  ** AccessDenied  （退出码  3  ）退出。 
完成授权后，即可进入下面的三步流程。 
** 第一步：安装 CLI  **
  * 
    curl -fsSL https://raw.githubusercontent.com/Serverless-Devs/agentrun-cli/main/scripts/install.sh | sh
Windows 用户可以使用对应的 PowerShell 脚本  irm .../install.ps1 | iex  。安装脚本会自动拉取 GitHub Releases 的最新版本、校验 SHA256，并将执行文件安装至  $HOME/.local/bin  。如果您倾向于使用 Python 包管理器，也可以通过  pip install agentrun-cli  进行安装。安装完成后，运行  ar --version  验证。 
** 第二步：配置访问凭证  **
凭证文件默认存储在  ~/.agentrun/config.json  下的  default  Profile 中： 
  *   *   *   * 
    ar config set access_key_id     LTAI5t...ar config set access_key_secret ***ar config set account_id        1234567890ar config set region            cn-hangzhou
对于多环境场景，可以通过追加  \--profile staging  进行隔离。系统的凭证解析优先级为：命令行参数 > Profile 配置 > 环境变量。 
** 第三步：运行 Agent  **
  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   * 
    $ ar super-agent run --prompt "你是一个 Python 专家"Creating super agent: super-agent-tmp-20260424140912 ...Ready. Type your message (/help for commands).> 写一个快速排序def quicksort(arr):    if len(arr) <= 1:        return arr    pivot = arr[len(arr) // 2]    left  = [x for x in arr if x < pivot]    mid   = [x for x in arr if x == pivot]    right = [x for x in arr if x > pivot]    return quicksort(left) + mid + quicksort(right)> /exit─────────────────────────────────────────────Super agent created: super-agent-tmp-20260424140912Last conversation:  conv-9f8e7d6c-xxxResume:  ar sa chat super-agent-tmp-20260424140912Delete:  ar sa delete super-agent-tmp-20260424140912─────────────────────────────────────────────
在这条命令背后，CLI 自动完成了原先需要在控制台多次操作的流程：读取本地凭证、解析可用的 ModelService（默认场景下自动选用，多模型场景下可通过  \--model-service svc-tongyi --model qwen-max  参数直达，或在 TTY 中以交互式方式选择）；在服务端创建超级 Agent 并自动命名为  super-agent-tmp-<时间戳> ；建立 SSE 流并进入 REPL 交互模式；退出时自动保留 Agent 资源，并将最近的会话 ID 记录在本地  ~/.agentrun/super-agent-state.json  中。 
因此，如果需要继续之前的对话，只需指定 Agent 名称即可： 
  *   * 
    ar sa chat super-agent-tmp-20260424140912       # 自动恢复上一次的会话ar sa chat super-agent-tmp-20260424140912 --new # 强制开启全新会话
若在脚本或 CI 环境中进行单次调用，可以使用  invoke  命令： 
  * 
    ar sa invoke my-helper -m "解释一下闭包" --text-only | tee answer.txt
通过  \--text-only  参数，工具将仅输出 Assistant 的文本回复，屏蔽 SSE 信封格式及工具调用细节，便于直接对接  jq  工具、下游 Agent 或是 CI 构建日志。 
▍  2.2 声明式 API：通过 YAML 管理 Agent 资产 
除了本地开发调试，一旦进入“团队协作、版本控制、可回滚”的生产级场景，单纯的交互式命令便显得捉襟见肘。此时，工程化团队真正需要的是 GitOps 实践。 
为此，CLI 提供了基于 Kubernetes 风格的 YAML 配置方案。只需编写一个配置文件，即可通过  ` apply  ` 命令实现幂等的资源创建与更新： 
  *   *   *   *   *   *   *   *   *   *   *   *   *   *   * 
    apiVersion: agentrun/v1kind: SuperAgentmetadata:  name: my-helper  description: "我的超级 Agent"spec:  prompt: "你是我的超级 Agent 助手，可以帮我完成各种任务"  tools:    - mcp-time-sa  skills:    - skill-wechat-article-search  sandboxes: []  workspaces: []  subAgents:    - agent-research-assistant
常见运维操作： 
  *   *   *   *   *   *   * 
    ar sa apply -f superagent.yaml# → action: "created"   （首次执行）# → action: "updated"   （后续执行）ar sa render -f superagent.yaml            # 本地渲染验证，无需凭证，适用于 CI 环境的 Schema 校验ar sa apply  -f superagent.yaml --dry-run  # 服务端预检，验证配置但不实际生效ar sa chat   my-helper                     # 发起 REPL 对话ar sa invoke my-helper -m "帮我规划今天的事情" --text-only
这一设计的核心优势在于： 
apply  命令依据  metadata.name  自动判断执行  created  还是  updated  操作，确保在 CI 流水线中反复执行也能保持状态收敛。支持使用  \---  分隔的多文档 YAML，实现整条 Agent 链路的批量部署。  subAgents  字段允许直接引用其他 Agent 资源，使父子 Agent 的调度在服务端闭环完成，从而让多 Agent 编排成为原生平台能力，无需客户端介入转发。此外，  render  命令脱离服务端和凭证依赖，极大地方便了 CI 流水线中的配置检查和 Diff 差异比对。 
这套 API 成功将“Agent 的定义描述”与“Agent 的运行时调度”进行了解耦：前者由托管在 Git 仓库中的 YAML 负责，后者则交由 AgentRun 托管平台执行。 
▍  2.3 六大资源组，统一的操作语义 
超级 Agent 背后连接着模型、工具、沙箱和技能，这些实体均为独立的云端资源。CLI 将其抽象为六大核心命令组： 
命令组  |  别名  |  核心用途   
---|---|---  
` config  ` |    
|  访问凭证与多 Profile 环境管理   
` model  ` |    
|  接入通义、DeepSeek、OpenAI 或私有部署模型，构建 ModelService   
` sandbox  ` |  ` sb  ` |  沙箱管理，涵盖文件、进程、运行上下文、模板及浏览器实例   
` tool  ` |    
|  MCP 与 FunctionCall 原生工具管理   
` skill  ` |    
|  平台技能包的生命周期管理及本地的 scan / load / exec 操作   
` super-agent  ` |  ` sa  ` |  一键运行、资源 CRUD、声明式部署及会话管理   
六大命令组统一遵循  ar <group> <action> 的设计模式，实现了  list / get / create / update / delete  等标准语义的对齐。以下列举几个典型的高频操作： 
  *   *   *   *   *   *   *   *   *   *   * 
    # 注册通义千问为系统内置的 ModelServicear model create --name svc-tongyi --provider dashscope --api-key $DASHSCOPE_API_KEY# 启动包含代码解释器环境的 Sandbox，并执行 Python 代码SB=$(ar sandbox create --template py-default --type CodeInterpreter --output quiet)ar sandbox exec "$SB" --code "import pandas as pd; print(pd.__version__)"# 挂载外部 MCP 工具ar tool create --name mcp-time-sa --type mcp --endpoint https://time-mcp.example.com# 部署本地的 Skill 技能包ar skill upload ./skills/wechat-article-search# 审查特定会话的执行记录ar sa conv get my-helper conv-9f8e7d6c-xxx
通过指定  \--output quiet  参数，系统将仅输出资源的主标识符。配合  $(ar ... --output quiet)  语法，可以无缝将当前资源的 ID 传递给下一条命令。这种高度可组合的设计秉承了经典的 Unix 命令行哲学，不仅使开发者在编写脚本时游刃有余，也为后续交由 LLM 自主驱动操作提供了坚实的稳定性保障。 
** 03  **
_ ** SDK 同步升级：  ** _
_ ** 在代码中定义完整的 Agent 生命周期  ** _
_ Cloud Native  _
CLI 是面向开发和运维的外层封装，而其底层驱动力则源于本次 SDK 升级带来的  SuperAgentClient  。这标志着超级 Agent 从“仅能在控制台配置”正式走向了“在 Python 代码中获得完整定义”。 
以下示例涵盖了从资源创建、首轮调用、会话延续、会话管理到 CRUD 完整操作的生命周期，代码摘自代码库中的  quick_start_super_agent.py  ： 
  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   * 
    import asyncio, osfrom agentrun.super_agent import SuperAgentClientasync def main():    client = SuperAgentClient()    # 1. 创建超级 Agent    agent = await client.create_async(        name="my-helper",        description="A super agent created from SDK",        prompt="You are a helpful assistant.",        tools=["mcp-time-sa"],        skills=[],        sandboxes=[],        agents=[],    )    print(f"Created: {agent.name}")    # 2. 首轮调用。两阶段 Stream 设计：await 返回即可获取 conversation_id，    #    业务侧可借此完成会话落库，随后再进入 async for 消费事件。    stream = await agent.invoke_async(        messages=[{"role": "user", "content": "现在几点了"}]    )    saved_conv_id = stream.conversation_id    async for event in stream:        print(f"  [{event.event}] {event.data}")    # 3. 使用已有的 conversation_id 继续对话    stream2 = await agent.invoke_async(        messages=[{"role": "user", "content": "And what can you do?"}],        conversation_id=saved_conv_id,    )    async for event in stream2:        print(f"  [{event.event}] {event.data}")    # 4. 会话生命周期管理    for conv in await agent.list_conversations_async():        print(f"  - {conv.conversation_id} title={conv.title!r}")    await agent.delete_conversation_async(saved_conv_id)    # 5. 资源 CRUD 管理    await client.update_async("my-helper", prompt="You are a concise assistant.")    await client.delete_async("my-helper")asyncio.run(main())
这一套 API 设计背后，隐含了我们在架构演进中的多项核心取舍，值得深入探讨： 
首先，调用与会话管理仅保留异步接口，而资源 CRUD 操作则提供同步与异步双版本。流式消费 SSE 事件通过  async  机制运行更加稳定，能够有效避免同步网络在长连接场景下经常面临的各种阻塞问题；而 CRUD 作为短周期的状态操作，双版本并行有助于业务代码的灵活选型。 
其次，会话标识（  conversation_id  ）由调用方自行持久化，SDK 层面的 Agent 对象被设计为无状态。通过  await agent.invoke_async(...)  返回的  InvokeStream  采用了两阶段设计：在阶段一（await 返回瞬间）业务即可获取到  conversation_id  并立即执行数据库写入操作；随后在阶段二中通过  async for  消费流事件。这种模式确保了单一 Agent 对象天然具备并发安全性，同时让“先持久化会话 ID，再流式处理数据”的业务逻辑变得异常直观。 
再次，调用链路不再承载业务元数据。  invoke_async  接口严格限制入参，仅接受  messages  及可选的  conversation_id  ，而 prompt、tools、skills、sandboxes、sub-agents 等配置项均在创建阶段固化于 AgentRuntime 中，由服务端直接读取。这一逻辑与 CLI 的声明式 YAML 一脉相承：Agent 本质上是一套可被版本控制的确定性配置，而非每次调用时临时拼装的松散组合。 
最后，多 Agent 编排机制在服务端实现闭环。在  create_async  中配置的  agents=[...]  参数，直接对应 YAML 中的  subAgents  声明，使得主 Agent 对子 Agent 的调度完全下沉至平台侧执行，避免了客户端冗余的网络转发开销，保障了 CLI 与 SDK 两端编排语义的严格一致。 
▍  3.1 SDK 与 CLI 的协同作战 
既然 SDK 已经具备了如此顺畅的调用体验，为什么还需要投入精力单独打造 CLI？答案很明确：二者定位各异，互为补充。SDK 专注于业务代码的深度集成，使后端系统能够将超级 Agent 视作一个原生可  await  的流式对象；而 CLI 则重点服务于研发、运维以及 CI/CD 场景——涵盖了本地快速调试、配置版本化部署以及流水线中的非交互式调用。 
我们推荐如下成熟的工程化协作模式： 
  * ** 开发调试阶段：  使用  ** ar sa run  快速验证 Prompt 效果与工具组合，待逻辑收敛后，将配置固化为 YAML 并通过 Git 进行版本管理。 
  * ** 发布部署阶段：  在 CI/CD 流水线中执行  ** ar sa apply -f superagent.yaml  ，实现整套 Agent 栈的一键部署。 
  * ** 业务运行阶段：  后端服务通过引入 SDK 的  ** SuperAgentClient  发起调用，并将  conversation_id  妥善落入业务数据库中。 
  * ** 线上排查阶段：  结合  ** ar sa conv list my-helper  与  ar sa conv get ...  命令，研发人员可直观、高效地审查线上特定会话的真实运行轨迹。 
** 04  **
_ ** 未来展望与规划  ** _
_ Cloud Native  _
v0.1.0 标志着我们的首个高可用版本落地，而后续的演进路线也已提上日程： 
  * 官方 Skills 市场将持续丰富预置能力矩阵，配合现有的工具链，彻底打通本地开发与云端托管的壁垒。 
  * 在现有的  subAgents  原语基础之上，抽象并封装更高维度的多 Agent 编排语义体系。 
  * 逐步构建覆盖离线回归测试、线上 Trace 采样追踪以及整体质量评估的一体化评测链路。 
如果您正在为您的 Agent 应用寻找一款能够稳定运行在生产环境的托管运行时，不妨即刻尝试以下命令： 
  *   * 
    curl -fsSL https://raw.githubusercontent.com/Serverless-Devs/agentrun-cli/main/scripts/install.sh | sh \  && ar super-agent run
如您在体验过程中有任何疑问或建议，欢迎前往 GitHub 提交 Issue 与我们交流。 
_ 开源代码仓库：  _
  * _ AgentRun CLI  ：  https://github.com/Serverless-Devs/agentrun-cli  _
  * _ AgentRun Python SDK：  https://github.com/Serverless-Devs/agentrun-sdk-python  _
_ 延伸阅读：  _
  * 《  [ 托管 Agent 执行循环只是起点——AgentRun 托管的更是企业 AI 生产全链路  ](<https://mp.weixin.qq.com/s?__biz=MzUzNzYxNjAzMg==&mid=2247583492&idx=1&sn=d6ce0429f03fb1042bfc377d38301685&scene=21#wechat_redirect>) 》 
  * AgentRun CLI 中文手册：  https://github.com/Serverless-Devs/agentrun-cli/blob/main/docs/zh/index.md 
  * Super Agent SDK Quick Start 示例：  https://github.com/Serverless-Devs/agentrun-sdk-python/blob/main/examples/quick_start_super_agent.py 
  * 阿里云 AgentRun 产品文档：  https://help.aliyun.com/zh/functioncompute/fc/what-is-agentrun