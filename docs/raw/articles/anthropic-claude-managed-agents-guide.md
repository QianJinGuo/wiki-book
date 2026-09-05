---
title: Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南
source_url: https://mp.weixin.qq.com/s/A_ksLCNmIL4lXLcZeVSPsQ
publish_date: 2026-05-09
tags: [wechat, article, claude, agent, harness, aws]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: c62362d78651bab44331b8163c8aa9b9b04a2756e6cc937444d7459000ae30c5
---
# Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南
最近  ** Anthropic  ** 推出了  ** Claude Managed Agents  ** 。这是一套用来构建和部署云端 Agent 的 API。和常见的 Agent 框架不太一样，它的核心其实是一个叫  ** Harness  ** 的编排引擎：把工具调用、上下文管理、错误恢复这些事都帮你处理了，而且会随着模型能力一起升级。
之前 Anthropic 的产品线有一个明显的断层。面向消费者有  ** claude.ai  ** 和  ** Claude Code  ** ，面向开发者有  ** Messages API  ** 。但如果一家企业想基于 Claude 做一个长时间运行的、能自主调用工具的 Agent，它需要自己搭沙箱、做状态管理、处理权限、写错误恢复逻辑。这些基础设施工作可能比 Agent 本身的业务逻辑还重
Managed Agents 就是来填这个空的。你可以直接在 Anthropic 的云服务上跑一个 Agent，它自带环境、工具和执行能力。你只需要告诉它要做什么，然后接收结果就行了。
##  四大核心概念
Managed Agents 构建在四个相互协作的核心概念之上。如果你使用过 Claude Code 或 Agent SDK，这个思维模型会感觉很熟悉。
###  1\. Agent（智能体）
Agent 可以理解为一份可复用的配置：用哪个模型、系统提示词是什么、能用哪些工具、要不要接 MCP 服务，都在这里定义。创建之后会拿到一个 Agent ID，后面可以在不同会话里反复使用。
    from anthropic import Anthropic  
    client = Anthropic()  
    agent = client.beta.agents.create(  
        name="Code Reviewer",  
        model="claude-sonnet-4-6",  
        system="You are a senior code reviewer. Review code for bugs, performance issues, and security vulnerabilities. Be direct and specific.",  
        tools=[{"type": "agent_toolset_20260401"}],  
    )  
    print(agent.id)  # ag_01ABC...
` agent_toolset_20260401  ` 基本就是一套「开箱即用」的工具组合：包括 Bash、文件读写（Read / Write / Edit）、代码搜索（Glob / Grep），还有 Web 访问（Web Search / Web Fetch）。这些能力也不是强制全开，你可以按需要关掉，比如不想让它执行 shell 命令，就直接禁用。
另外，Agent 是带版本的。每次更新都会生成一个新版本，你可以查看历史记录，或者把某个会话固定在指定版本上。这在生产环境里挺有用——可以先用新版本跑一轮测试，没问题再切过去。
###  2\. Environment（环境）
Environment 可以理解为智能体的运行模板，用来定义它「在什么环境里干活」。这里可以配置依赖包、网络规则，以及需要挂载的文件。
    environment = client.beta.environments.create(  
        name="python-dev",  
        config={  
            "type": "cloud",  
            "packages": {  
                "pip": ["pytest", "requests", "pandas"],  
                "apt": ["git", "curl"],  
            },  
            "networking": {"type": "unrestricted"},  
        },  
    )
你可以用  ` pip  ` 、  ` npm  ` 、  ` apt  ` 、  ` cargo  ` 、  ` gem  ` 和  ` go  ` 提前装好依赖。而且同一个环境会被缓存，后续会话启动会更快，不用每次都重新装一遍。
网络默认是  ` unrestricted  ` ，也可以切到  ` limited  ` ，再配一个域名白名单。如果你的智能体会处理敏感数据，这样可以把它能访问的范围限制得很清楚。
另外，你还可以把 GitHub 仓库直接挂进环境里：
    environment = client.beta.environments.create(  
        name="my-repo-env",  
        config={  
            "type": "cloud",  
            "github": {  
                "repository": "myorg/myrepo",  
                "branch": "main",  
            },  
            "packages": {  
                "pip": ["pytest"],  
            },  
            "networking": {"type": "unrestricted"},  
        },  
    )
会话启动时会自动 clone 下来，用起来就像本地项目一样。配合代码审查类的智能体，可以很方便地做自动化 PR 检查。
###  3\. Session（会话）
Session 可以理解为智能体真正「干活」的地方，是运行在环境里的一个实例。每个会话都有独立的容器，包含自己的文件系统、进程和网络，不会互相影响。
    session = client.beta.sessions.create(  
        agent=agent.id,  
        environment_id=environment.id,  
    )  
    print(session.id)      # ses_01XYZ...  
    print(session.status)  # "running"
会话会一直存在，直到你手动关闭，或者超时结束。在这期间，智能体可以在多轮对话之间保留状态，用起来有点像 Claude Code 里的连续对话。
###  4\. Events（事件）
Events 就是你和正在运行的会话之间的「通信通道」。你通过服务器发送事件（SSE），把消息发给智能体，同时也能实时接收它的响应、工具调用和状态更新。
    with client.beta.sessions.events.stream(session.id) as stream:  
        # 向智能体发送消息  
        client.beta.sessions.events.send(session.id, events=[{  
            "type": "user.message",  
            "content": [{"type": "text", "text": "Review the code in src/ for security issues"}],  
        }])  
        # 流式传输响应  
        for event in stream:  
            if event.type == "agent.message":  
                for block in event.content:  
                    print(block.text, end="")  
            elif event.type == "agent.tool_use":  
                print(f"\n[Using tool: {event.name}]")  
            elif event.type == "session.status_idle":  
                print("\n[Agent finished]")  
                break
因为是流式的，你可以看到它在做什么：什么时候读文件、什么时候跑命令、什么时候去查 Web，整个过程都是可见的。必要的时候，也可以中途打断它。
##  完整实战示例
下面是一个完整的工作示例，创建一个编码助手、给它任务，然后实时看它执行的过程。
    from anthropic import Anthropic  
    client = Anthropic()  
    # 1. 创建智能体  
    agent = client.beta.agents.create(  
        name="Python Developer",  
        model="claude-sonnet-4-6",  
        system="""You are an expert Python developer. When given a task:  
    1. Plan your approach first  
    2. Write clean, well-tested code  
    3. Run the tests to verify everything works  
    4. Fix any issues before reporting completion""",  
        tools=[{"type": "agent_toolset_20260401"}],  
    )  
    # 2. 创建包含常用 Python 包的环境  
    environment = client.beta.environments.create(  
        name="python-env",  
        config={  
            "type": "cloud",  
            "packages": {  
                "pip": ["pytest", "requests", "pydantic", "fastapi", "uvicorn"],  
            },  
            "networking": {"type": "unrestricted"},  
        },  
    )  
    # 3. 启动会话  
    session = client.beta.sessions.create(  
        agent=agent.id,  
        environment_id=environment.id,  
    )  
    # 4. 给它一个任务并流式传输响应  
    with client.beta.sessions.events.stream(session.id) as stream:  
        client.beta.sessions.events.send(session.id, events=[{  
            "type": "user.message",  
            "content": [{"type": "text", "text": """  
                Build a FastAPI app with:  
                - A /health endpoint  
                - A /fibonacci/{n} endpoint that returns the nth fibonacci number  
                - Input validation (n must be between 1 and 1000)  
                - Unit tests for both endpoints  
                Run the tests and make sure they all pass.  
            """}],  
        }])  
        for event in stream:  
            if event.type == "agent.message":  
                for block in event.content:  
                    if hasattr(block, 'text'):  
                        print(block.text, end="")  
            elif event.type == "agent.tool_use":  
                print(f"\n  → {event.name}")  
            elif event.type == "session.status_idle":  
                break  
    # 5. 在同一会话中发送后续消息  
    with client.beta.sessions.events.stream(session.id) as stream:  
        client.beta.sessions.events.send(session.id, events=[{  
            "type": "user.message",  
            "content": [{"type": "text", "text": "Now add a /prime/{n} endpoint that checks if n is prime. Add tests for it too."}],  
        }])  
        for event in stream:  
            if event.type == "agent.message":  
                for block in event.content:  
                    if hasattr(block, 'text'):  
                        print(block.text, end="")  
            elif event.type == "session.status_idle":  
                break
智能体会自己走完整个流程：先想怎么做，再写代码、建文件、装依赖、跑测试，最后把结果返回给你。
因为 Session 是持续存在的，后面的任务可以直接基于前面已经写好的代码继续做，不需要重新来一遍。
本质上，这就是和 Claude Code 一样的那套  ** ReAct（Reason → Act → Observe）循环  ** 。不同的是，这一整套运行环境和调度逻辑都已经帮你搭好了，你只需要给任务就行。
##  自定义工具和 MCP 服务器
内置工具已经能覆盖不少场景，但一旦需要接入你自己的系统，就要用到扩展能力了。Managed Agents 提供了两种方式。
###  自定义工具
你可以用 JSON Schema 定义工具接口。当智能体决定调用时，会发出一个结构化请求，你的服务去执行，然后把结果再回传给它。
    agent = client.beta.agents.create(  
        name="Deploy Assistant",  
        model="claude-sonnet-4-6",  
        system="You help with deployments. Use the deploy tool to trigger deployments.",  
        tools=[  
            {"type": "agent_toolset_20260401"},  
            {  
                "type": "custom",  
                "name": "trigger_deploy",  
                "description": "Trigger a deployment to a specified environment",  
                "input_schema": {  
                    "type": "object",  
                    "properties": {  
                        "service": {"type": "string", "description": "Service name"},  
                        "environment": {"type": "string", "enum": ["staging", "production"]},  
                        "version": {"type": "string", "description": "Version tag to deploy"},  
                    },  
                    "required": ["service", "environment", "version"],  
                },  
            },  
        ],  
    )
比如智能体调用  ` trigger_deploy  ` ，你在事件流里接住这个请求，执行部署逻辑，再把结果返回。这种方式可以很方便地接入内部 API、数据库、CI/CD 流水线等。
###  MCP 服务器
如果你了解 MCP，这一块就更省事了。Managed Agents 可以直接连到 MCP 服务器，相当于复用一整套现成工具。比如 Slack、GitHub、Jira 这些，只要有 MCP 接口，基本不需要自己再写一层集成，直接就能用。
##  多智能体编排（研究预览版）
这里开始变得有意思了。Managed Agents 提供了一个多智能体编排的研究预览。你可以定义一个「协调器」智能体，把任务拆分后分配给多个「工作者」智能体来完成。
每个工作者在自己的上下文里运行，互不干扰，但它们共享同一个容器和文件系统。换句话说，对话是隔离的，但工作结果是共享的。
一个比较实际的例子：协调器把代码审查和测试分别交给两个智能体处理。
    # 创建专业智能体  
    reviewer = client.beta.agents.create(  
        name="Code Reviewer",  
        model="claude-sonnet-4-6",  
        system="You are an expert code reviewer. Focus on code quality, bugs, and security.",  
        tools=[{"type": "agent_toolset_20260401"}],  
    )  
    tester = client.beta.agents.create(  
        name="Test Writer",  
        model="claude-sonnet-4-6",  
        system="You write comprehensive test suites. Focus on edge cases and error handling.",  
        tools=[{"type": "agent_toolset_20260401"}],  
    )  
    # 创建可以委托给专业智能体的协调器  
    coordinator = client.beta.agents.create(  
        name="Tech Lead",  
        model="claude-opus-4-6",  
        system="""You are a tech lead managing a code review process. You have two team members:  
    - Code Reviewer: Reviews code for quality, bugs, and security  
    - Test Writer: Writes comprehensive tests  
    Delegate review and testing tasks to the appropriate specialist, then synthesize their findings into a final report.""",  
        tools=[{"type": "agent_toolset_20260401"}],  
        agents=[  
            {"agent_id": reviewer.id, "name": "Code Reviewer"},  
            {"agent_id": tester.id, "name": "Test Writer"},  
        ],  
    )
协调器负责什么时候拆任务、怎么拆，然后把各个结果收回来，最后统一整理输出。因为大家共享同一套文件系统，测试智能体可以直接看到审查智能体标出来的问题，再针对这些地方补测试，整个流程是串起来的。
目前的限制是只支持一层分工：协调器 → 工作者，工作者不能再继续往下拆。不过即便这样，这个模式已经挺实用了。可以把它理解成一套「AI 版 CI/CD 流水线」：不同智能体分别做 lint、测试、安全扫描、部署，各自处理，然后由协调器统一收口。
##  与其他方法的对比
Anthropic 现在的智能体相关产品其实有点重叠，可以简单按「你要自己管多少东西」来理解：
方法  |  你需要管什么  |  适合场景
---|---|---
** Messages API  ** |  全部（循环、工具、容器）  |  需要完全自定义
** Agent SDK  ** |  工具执行、容器  |  想用工具，但自己托管
** Managed Agents  ** |  只管提示词和任务  |  后端自动化
** Claude Code CLI  ** |  基本不用管  |  本地交互式开发
** Claude Cowork  ** |  不用管  |  非技术用户
** 如果换成更实际一点的选型思路，可以这么看：  **
** 使用 Messages API  ** 当你需要完全控制整个 Agent 流程，比如自己决定每一步怎么走、用什么模型，或者有一些很定制化的需求。。
** 使用 Agent SDK  ** 当你想用 Claude Code 那一套成熟工具（文件操作、搜索、bash），但又希望所有东西跑在自己的环境里。
** 使用 Managed Agents  ** 当你只想把 Agent 跑起来，不想管基础设施。很适合做后端自动化，比如 PR 审查、代码生成流水线、测试、文档生成这些。
** 使用 Claude Code  ** 当你是在本地写代码，需要一个能随时帮你改代码、查问题的助手。
##  定价详解
Managed Agents 的费用其实可以拆成两块：  ** token + 运行时间  ** 。
###  1）Token 费用（和普通 API 一样）
模型  |  输入  |  输出
---|---|---
Opus 4.6  |  $5/MTok  |  $25/MTok
Sonnet 4.6  |  $3/MTok  |  $15/MTok
Haiku 4.5  |  $1/MTok  |  $5/MTok
###  2）会话运行时间
按会话计费：  ** $0.08 / 小时  ** ，精确到毫秒。只有在运行中的时间才收费，空闲不算钱。
可以用一个简单的例子来感受一下：
一次用 Opus 4.6 跑了大约 1 小时的编码任务，消耗 50K 输入 token + 15K 输出 token，总成本大概是：
* • 输入：$0.25
* • 输出：$0.375
* • 运行时间：$0.08
* •  ** 总计：约 $0.705  **
从成本结构来看，其实挺好理解的：
* • token 是「思考成本」
* • runtime 是「环境成本」
而且 runtime 这部分其实不贵。你拿它和自己在 AWS 上搭一套（EC2 + 容器 + 调度 + 工具链）对比，会发现时间成本和工程复杂度往往更高。
还有几个容易忽略的点：
* •  ** Web 搜索  ** ：$10 / 1000 次
* •  ** 提示词缓存  ** ：命中缓存只算 0.1x，这点挺关键，因为 Agent 通常有很长的上下文
##  可以构建什么
下面这些是我觉得比较有意思、也比较实用的用法：
** 自动化 PR 审查  **
把 GitHub 仓库挂进来，做一个代码审查的智能体，每次有 PR 就跑一轮。它可以读 diff、查 bug、看安全问题、跑测试，然后直接给出审查结果。如果用多智能体，还可以把安全、性能、代码质量拆开，各自处理。
** 自愈 CI/CD  **
CI 挂了的时候，自动拉起一个智能体，把报错信息和代码给它。它去分析原因、写修复、再开一个 PR。对于 flaky 测试或者简单回归问题，这种方式能省掉不少人工排查时间。
** 文档生成  **
让智能体直接读代码库，生成或更新 API 文档、README、变更日志这些。因为它能跑代码、调命令，所以连示例代码都可以顺手验证一遍，而不是  「  看起来对  」  。
** 数据流水线调试  **
数据任务出问题时，拉一个能看代码、日志、监控的智能体（可以通过 MCP 接入）。  它可以一路追问题、找原因，甚至直接给出修复方案。
** 代码迁移  **
比如要从一个框架迁到另一个，可以做一个专门的迁移智能体。给它旧代码和新框架文档，让它一块一块地改，而不是一次性全推翻。
##  快速上手
安装其实很简单，常见语言基本都支持：Python、TypeScript、Java、Go、C#、Ruby、PHP。
    # Python  
    pip install anthropic  
    # TypeScript  
    npm install @anthropic-ai/sdk  
    # CLI  
    brew install anthropics/tap/ant
用的时候有一个小点要注意：所有请求需要带上  ` managed-agents-2026-04-01  ` 这个 beta 头。不过如果你直接用  ` client.beta.agents  ` 这一套接口，SDK 会帮你自动处理。
另外，一些还在预览阶段的功能（比如多智能体、内存、结果管理）需要单独  申请开通  [1]  。文档也已经比较全了，可以直接去  官方文档  [2]  看详细用法。
##  写到最后
Managed Agents 其实代表了 Anthropic 的一个明显变化：从「  ** 提供模型能力  ** 」，走向「  ** 提供完整的智能体运行平台  ** 」。以前是你调用 API、自己把循环和工具这些东西拼起来；现在更像是你定义任务，执行这件事交给平台。
我觉得可以用 AWS 来类比：从 EC2（什么都自己管）到 Lambda（只写逻辑，其他交给平台）。Anthropic 也在走类似的路径：从 Messages API，到现在的 Managed Agents。多智能体的预览版本，其实已经在暗示下一步：不是一个 Agent，而是一组分工明确的 Agent，一起完成任务。
换句话说，以后可能不是「  ** 写一个系统  ** 」，而是「  ** 配置一组智能体  ** 」。
如果你之前自己搭过 Agent，就会知道有多少时间花在这些事情上：循环控制、工具调用、执行环境、上下文管理……
Managed Agents 做的事情其实很简单：把这些基础设施都收走，让你只用关心任务本身。
####  引用链接
` [1]  ` 申请开通:  _ https://claude.com/form/claude-managed-agents  _
` [2]  ` 官方文档:  _ https://platform.claude.com/docs/en/managed-agents/overview  _
_
_
** 既然看到这里了，如果觉得有启发，随手点个赞、推荐、转发三连吧，你的支持是我持续分享干货的动力。  **