---
source: wechat
source_url: https://mp.weixin.qq.com/s/MjH1zVaEAkmGCrSyvP1h7g
ingested: 2026-07-22
feed_name: 叶小钗
wechat_mp_fakeid: MP_WXS_3863728491
source_published: 2026-07-21
sha256: 38dfb020a78097b2f44542811187b01ab6066a6c27006ed08d45f2d99ffecb83
---

# 我用阿里 AgentScope 复刻了一个 WorkBuddy

最近在研究一个阿里的开源框架 AgentScope，一般来说，学习框架做好的方法就是实践了，我就想要不要用这个框架整一个agent出来。

之前我用python开发了一个Agent，有基础的模型配置，工具管理，技能配置，记忆管理，会话压缩等功能，我用AgentScope把这些功能都实现了，基本也就了解这个框架要怎么使用了。

正好这段时间我又在折腾 workbuddy，研究他的一些实现机制，那我就用AgentScope这个框架来实现一个mini版本的workbuddy。那不又学习了框架，还搞懂了workbuddy的一些工作机制，顺便写文章记录下。

## AgentScope 是什么

AgentScope 是一个面向大模型 Agent 应用开发的开源框架，由阿里巴巴团队发起，目前托管在 `AgentScope-AI` 开源组织下。

它主要帮助开发者构建具备模型推理、工具调用、上下文管理、记忆管理以及多 Agent 协作能力的智能体应用。

在没有 Agent 框架的情况下，我们通常需要自己处理模型调用、消息格式、工具执行、历史上下文、Agent Loop、多智能体通信等问题。AgentScope 对这些常用能力进行了封装，开发者可以在框架提供的基础组件上配置模型、提示词、工具和记忆，而不需要从头实现一套完整的 Agent 运行逻辑。

AgentScope 提供的核心能力包括：

  * 可以对接不同的厂商的模型，工具调用和 MCP 工具接入，以及skill的执行

  * 消息和上下文管理，支持短期记忆与长期记忆

  * 标准的ReAct Agent实现

  * 多 Agent 对话、路由和任务交接

  * Agent 运行追踪与调试

AgentScope 既可以用于开发简单的对话助手，也可以构建代码处理、数据分析、文档生成等类型的 Agent，还可以通过多个 Agent 的协作完成更复杂的任务。

它解决的核心问题是：如何把大模型、提示词、工具、记忆和执行流程组合起来，形成一个能够持续推理并执行任务的完整 Agent。

AgentScope 的 GitHub 地址：
    
    
    https://github.com/agentscope-ai/agentscope  
    

### AgentScope-AI 是什么

在 GitHub 上，我们会看到一个名为 `AgentScope-AI` 的组织。

它并不是某一个具体框架，而是 AgentScope 相关开源项目所在的 GitHub 组织，也可以将它理解为整个 AgentScope 开源生态的代码仓库集合。
    
    
    https://github.com/agentscope-ai  
    

除了核心的 AgentScope 框架，这个组织下面还有 AgentScope Runtime、AgentScope Java、AgentScope Studio、AgentScope Samples 等多个项目，分别覆盖 Agent 开发、运行、部署、调试和示例应用等不同环节。

**AgentScope Runtime**

AgentScope Runtime 是 AgentScope 生态中的 Agent 运行时项目。

如果说 AgentScope 主要解决的是“如何开发 Agent”，那么 AgentScope Runtime 主要解决的是“如何让 Agent 安全、稳定地运行和对外提供服务”。

**AgentScope Java**

AgentScope 最早主要面向 Python 开发者，而 AgentScope Java 则是面向 Java 和 JVM 技术栈提供的 Agent 开发框架。

它同样提供了 Agent 开发所需要的基础能力，AgentScope Java 更适合已经采用 Java、Spring Boot 或其他 JVM 技术栈的企业项目。Java 开发者不需要为了构建 Agent 单独维护一套 Python 服务，可以直接在现有 Java 系统中集成 Agent 能力。

它与 Python 版本的 AgentScope 定位相近，只是面向的语言和应用环境不同

本文接下来主要介绍的是 Python 版本的 `AgentScope`。AgentScope Runtime 和 AgentScope Java 属于同一开源生态中的相关项目，这里只做简单说明，不作为本文重点。

### 如何使用AgentScope来开发一个mini-workbuddy

在开发之前，我们需要先想一下，开发一个mini-workbudy需要哪些功能，我们知道正常开发一个Agent，需要配置模型，配置工具，MCP和skills是按需使用，一般来说skills都是需要的，会话压缩，记忆管理这些上下文工程。复杂一点的任务还需要多Agent来完成。这些构成了一个Agent的基本元素。

workbuddy和其他Agent没有什么不同，其底层都是一样的，但是它内置了很多的技能，专家和专家团。大部分用户无需关心这些是怎么配置的，开箱即可用，包括新建skills，专家和专家团，都是通过技能来引导用户完成。对于大部分用户而言，这个是非常友好的。他不关心你的技能是怎么写的，专家的提示词是怎么描述，它需要的是一个可以帮助干活的助手。

下面我们就来逐步拆解这些功能

## 模型配置

开发Agent的第一件事情，肯定是配置模型，不同模型，能力边界并不相同，我们需要提供配置不同厂商模型的能力。

AgentScope 的模型层由 API 凭证（Credential）和模型族组成。

Credential 负责存储调用某个 API 所需的认证参数（比如 api_key 和 base_url）。系统可以根据这个凭证，按模型族（model family）分组，列出该提供商所有可用的模型。

下面代码是一个模型接入的标准用法，可以获取到一个qwen-plus的模型，并且采用流式输出

上面的代码适合直接在程序中创建一个固定模型，但是 mini-WorkBuddy 是一个面向用户的产品，用户需要在模型管理页面中添加多个模型，并在聊天时选择使用哪一个模型。因此我们需要在 AgentScope 模型层的外面加一层模型配置管理。

AgentScope 只负责根据 Credential 和模型参数创建可以调用的模型对象，并不负责保存我们在页面中填写的模型配置。模型配置保存、默认模型切换读需要在项目中自己实现。

整个模型管理的流程如下：

模型管理页面需要保存以下几个主要字段：

  * `provider`：模型厂商，例如 DashScope、DeepSeek、Moonshot、Ollama 或 OpenAI 兼容服务

  * `model`：具体的模型名称，例如 `qwen-plus`、`deepseek-chat`

  * `api_key`：模型服务的 API Key

  * `base_url`：模型服务地址，自定义 OpenAI 兼容接口时会用到

  * `thinking`：是否开启模型的思考模式

  * `max_context`：模型支持的上下文长度

我们把这些配置保存在 `workspace/models.json` 中，并使用 `active_model_id` 记录默认模型。

> workspace是我们自己定义的一个配置保存目录，没有使用数据库来保存，后续所有的配置数据都保存到这个目录，并且使用json文件的形式来保存。

下面是一个简化后的配置结构：

新增模型时,我们把数据写入配置文件，设置默认模型时更新 `active_model_id`。前端读取模型列表时，后端会主动移除 `api_key`，避免把密钥重新返回给浏览器。

在聊天页面发送消息时，我们会把用户选择的模型通过 `model_profile` 这个参数会穿给聊天API。如果传入 `auto`，后端就使用当前默认模型。

后端再根据 `model_profile` 再workspace/models.json 中找到完整配置，再把数据转换成 AgentScope 的模型对象。

我们在项目中做了一个适配器方法 `create_model_client`

上诉代码我们只判断了dashscope的模型，项目里面可以根据不同的的模型厂商做不同的适配，如果需要DeepSeek、Moonshot、Ollama 以及 OpenAI 兼容模型，也是一样的处理方式，只是使用的 Credential 和 ChatModel 不同。

模型管理页面只需要维护一套统一字段，真正创建模型时再根据 `provider` 选择 AgentScope 对应的实现。

聊天服务先读取用户选择的模型配置，根据选择的模型创建模型客户端，最后把模型对象传给 Agent。

这里有一个问题，同一个会话中用户可能会切换模型。已经创建的 Agent 内部绑定了原来的模型客户端，用户手动切换后，还需修改AgentScope的模型配置，我们在开发中，把模型配置 ID 放进 Agent 的缓存 key 中，用户切换模型以后，之前的key就无法命中，系统就会创建一个使用新模型的 Agent，避免页面显示已经切换，后端实际还在使用旧模型在回复。

通过上述的处理，我们就把 mini-WorkBuddy 页面上的添加模型、设置默认模型和聊天时切换模型，与 AgentScope 的 Credential、ChatModel 和 Agent 连接起来了。

## 工具管理和权限控制

模型接入以后，Agent 已经可以完成普通问答，但是还不能读取项目文件、搜索代码或者执行命令。我们开发的mini-WorkBuddy 是一个工作助手，只能聊天显然不够，它需要通过工具操作用户的工作目录。

mini-WorkBuddy 接入工具后，很多问题就自然而然的来了

  * 哪些工具可以交给模型，模型从哪里知道工具参数，

  * 工具结果怎么返回，删除文件是否需要用户确认，

  * Agent 又能访问哪些目录，这些都需要一套完整的管理机制。

AgentScope 中负责管理工具的是 `Toolkit`，负责判断工具能不能执行的是 Permission 系统。我们需要使用它们来实现 mini-WorkBuddy 的工具列表、工作空间和权限管理。

### AgentScope 的 Toolkit 是什么

`Toolkit` 不是某一个具体工具，它是 AgentScope 的工具容器和调用入口。模型在一轮任务中能看到哪些工具、工具以什么 JSON Schema 提供给模型、调用哪个 Python 对象、如何返回流式结果，都由 Toolkit 处理。

从 AgentScope 2.0.4 的实现来看，Toolkit 主要管理四类内容。

  * 普通 Tool，例如 `Read`、`Write` 和 `Bash`

  * MCP Client 提供的远程工具

  * Agent Skills 以及 Skill Loader

  * Tool Group，用于按组启用或停用工具

Toolkit 的构造参数也对应这四类内容。
    
    
    toolkit = Toolkit(  
        tools=[...],  
        skills_or_loaders=[...],  
        mcps=[...],  
        tool_groups=[...],  
    )  
    

这里面的 `tools`、`skills_or_loaders` 和 `mcps` 都属于 `basic` 基础工具组，`basic`工作组的工具始终可用。额外传入的 `tool_groups` 可以动态启用和停用，适合工具很多、又不希望一次把所有工具 Schema 都塞给模型的场景。

### Toolkit 如何把工具交给模型

每个 AgentScope Tool 都有名称、说明和输入 Schema。以 `Read` 为例，它的名称是 `Read`，输入参数包括绝对文件路径、起始行和最大行数。

Agent 执行前会调用 Toolkit 的 `get_tool_schemas()`，把当前可用工具转换成模型 Function Calling 使用的 JSON Schema。

模型返回 ToolCall 后，Toolkit 会使用 `call_tool()` 方法来处理工具调用逻辑:

  1. 检查工具是否存在以及所属工具组是否已经激活

  2. 解析模型生成的 JSON 参数

  3. 在需要时注入当前 `AgentState`

  4. 调用同步函数、异步函数或者生成器

  5. 将增量结果统一转换成 `ToolChunk`

  6. 最后汇总为完整的 `ToolResponse`

Toolkit 不只是一个工具数组，用来管理系统内置的工具。它同时处理工具发现、分组、MCP的接入、以及Skill的加载和使用，最后还统一做了工具的执行。

AgentScope 自带了一批工具类，包括 `Read`、`Write` 、`Bash`等， 但创建一个空的 `Toolkit()`，不会自动把 全部注册进去，我们需要根据自己的产品边界显式选择需要哪些工具，然后传入给`Toolkit()`。

Toolkit 内部还有两个特殊工具。

  * 注册了 Skill 时，会提供 Skill 查看工具，让模型按需读取完整的 `SKILL.md`

  * 配置了额外 Tool Group 时，会提供 `ResetTools` 元工具，让 Agent 动态切换工具组

这两个工具由 Toolkit 根据当前配置加入。文件工具和 Bash等工具必须由项目明确注册。

我们开发的 mini-WorkBuddy 项目时，显式的选择了六个通用工具。

这组工具对于 mini-WorkBuddy 主要使用场景，我觉得是完全够用了。Agent 可以查看项目、搜索文件、修改文件和执行bash命令。任务相关的工具主要用于后面专家团的管理，MCP 和 Skills 也通过 Toolkit 的其他参数接入。

创建 Agent 时把这一个 Toolkit 传进去。
    
    
    agent = Agent(  
        name="WorkBuddy",  
        system_prompt=SYSTEM_PROMPT,  
        model=model,  
        toolkit=toolkit,  
    )  
    

模型在 ReAct 循环中决定是否调用工具。工具结果返回以后，模型可以继续调用下一个工具，也可以整理最终答案。

### mini-WorkBuddy 的工作目录

WorkBuddy还有一个重要的处理，就是选择工作目录，让Agent在这个目录下工作。我们在设计的时候，系统配置了一个默认的工作空间，当然也允许用户把本地文件夹添加成新的工作空间。这个配置的话我们也保存到了workspace/workspace.json文件中，然后给每一个工作空间分配一个workspace_id和workspace_dir。

用户和mini-WorkBuddy交互的时候，都会在一个工作空间中，每一轮聊天请求接口都会将 `workspace_id` 和 `workspace_dir`传入，后端会根据 `workspace_id` 从workspace.json中获取到配置的工作目录。

`WorkspaceStore.validate_workdir()` 还会检查路径是否存在、是否为目录以及是否可写。

拿到工作目录后，项目做了两层配置。

第一层是 `Bash(cwd=workdir)`，它决定 Bash 启动时的当前目录。模型执行 `pwd`、`git status` 或相对路径命令时，都以这里为起点。
    
    
    Bash(cwd=workdir)  
    

第二层是 `PermissionContext.working_directories`。这个是 AgentScope 的权限引擎，它告诉Agent 哪些目录属于本轮任务允许工作的范围。

`cwd` 只决定命令从哪里开始执行，它本身没有任何安全属性，也做不了一点安全限制。`PermissionContext` 中保存的工作目录，会在agent调用 `Write`、`Edit` 和文件类 Bash 命令的时候做权限判断。

项目除了当前工作目录，还会按需登记长期记忆目录和 Skill 目录，因为Agent执行任务的时候可能需要读取skill和长期记忆，需要开放这些目录权限给他Agent。

所以工作目录主要承担三个作用。它给工具提供默认执行位置，为写入和文件命令提供自动放行范围，也帮助项目选择当前会话操作的仓库。不同 WorkBuddy 工作空间的聊天数据由项目存储层隔离，文件系统的强隔离则需要另外实现。

### AgentScope 原始权限系统有哪些模式

我们目前使用的是 AgentScope 2.0.4 一共有五种 `PermissionMode`
    
    
    class PermissionMode(Enum):  
        DEFAULT = "default"  
        ACCEPT_EDITS = "accept_edits"  
        EXPLORE = "explore"  
        BYPASS = "bypass"  
        DONT_ASK = "dont_ask"  
    

权限引擎会给出四种行为结果。

  * `ALLOW`，允许执行

  * `DENY`，拒绝执行

  * `ASK`，暂停并询问用户

  * `PASSTHROUGH`，工具不直接决定，继续交给权限规则和当前模式判断

#### DEFAULT

`DEFAULT` 是最保守的交互模式。权限引擎依次检查 DENY 规则、ASK 规则、工具自己的安全判断和 ALLOW 规则。如果都没有明确允许，最终结果是 `ASK`。

`Read`、`Glob` 和 `Grep` 虽然是只读工具，但它们自己的权限检查返回 `PASSTHROUGH`。在 `DEFAULT` 模式中，如果没有额外 ALLOW 规则，它们仍会落到默认询问。Bash 对 `ls`、`git status` 这类能够识别的只读命令可以直接返回 `ALLOW`。

#### ACCEPT_EDITS

`ACCEPT_EDITS` 会先放行只读调用，再让工具判断写入目标是否位于 `working_directories` 中。`Write` 和 `Edit` 修改工作目录内文件可以直接执行，工作目录外的写入不会因为选了这个模式就自动放行。

它也不是所有命令自动同意。普通网络命令、不能确认目标路径的命令以及工具判断为安全风险的调用，仍可能进入 `ASK` 或 `DENY`。

#### EXPLORE

`EXPLORE` 是严格只读模式。`Read`、`Glob`、`Grep` 和只读 Bash 命令允许执行，`Write`、`Edit` 以及修改文件的命令直接拒绝。

它很适合先让 Agent 阅读仓库并给方案，但不希望它改任何文件的场景。即使用户配置了 ALLOW 规则，也不能破坏 EXPLORE 的只读保证。

#### BYPASS

`BYPASS` 用于明确选择跳过确认的场景。工具产生的安全 ASK 也会被跳过，包括危险删除、写入 shell 配置文件和部分命令注入风险。

它不是绝对无规则。用户显式配置的 DENY 或 ASK 规则仍然生效，工具直接返回 DENY 也会保留。但是不能把它理解为普通的自动确认，最好只在沙箱、容器或用户完全清楚风险时使用。

#### DONT_ASK

`DONT_ASK` 与 BYPASS 的方向相反。它同样不会弹确认框，但凡是需要询问用户的操作都会转成拒绝。

后台定时任务没有用户守在页面前，使用 `DEFAULT` 会永远停在确认事件，使用 `BYPASS` 又过于宽松。`DONT_ASK` 就是给这种无人值守任务准备的。

### mini-WorkBuddy 只保留三种权限

workbuddy的权限只有两种，一个默认，一个完全放行。但是AgentScope的权限分的比较细，默认就有5种，我最开始弄的时候，把他们都放出来了，看了这几个模式，我自己都有点晕，直接提供给用户不太友好，最后我们在 mini-WorkBuddy 聊天页提供下面三档权限。

默认，自动审批，完全放行，映射代码如下。

这里的 `auto-approve` 是当前项目前后端使用的字段名，实际映射的是AgentScope的 `ACCEPT_EDITS`，这个不是表示所有工具都自动同意。只能在当前工作目录下先是自动放行，如果模型请求其他路径还是需要用户审批

虽然我们在聊天页面保留了3中模式，但是在使用过程中，我们更多的是使用自动审批这个权限档位，如果使用默认 Agent在执行任务的时候，就需要不停的点击同意，这个挺烦人的。

完全放行的风险太高，基本也不会使用。

### PermissionRule

AgentScope的PermissionMode 解决的是怎么处理权限。它定义了一些默认的规则，但是如果我们有一些自定义的规则要怎么办呢，这个时候就需要使用PermissionRule 来处理

例如：

  * 其他 Bash 命令使用默认策略，但 `uv run pytest` 始终允许

  * 执行 `npm install` 时始终询问

  * 所有以 `rm` 开头的命令直接拒绝

  * 禁止 `Read` 读取项目的 `.env`

  * 只允许 `Write` 写入 `docs` 目录

这些自定义的配置不是定义在 Toolkit 里，需要保存在当前 Agent 的 `PermissionContext` 中。
    
    
    context = agent.state.permission_context  
      
    print(context.mode)  
    print(context.allow_rules)  
    print(context.deny_rules)  
    print(context.ask_rules)  
    

PermissionRule 由下面几个字段组成

字段| 含义  
---|---  
`tool_name`| 规则作用于哪个工具，名称必须与 Tool 的 `name` 一致，例如 `Bash`、`Read`、`Write`  
`rule_content`| 要匹配的命令或路径；填写 `None` 表示匹配该工具的所有调用  
`behavior`| 命中后执行 `ALLOW`、`DENY` 或 `ASK`  
`source`| 规则来自哪里，例如 `userSettings`、`projectSettings`  
  
配置规则最直接的方法是创建 `PermissionEngine`，再调用 `add_rule()`。

`PermissionEngine.add_rule()` 会根据 behavior，把规则放进 `context.allow_rules`、`context.deny_rules` 或 `context.ask_rules`。执行工具时，AgentScope 就会使用这个 PermissionContext。

### 工具审批如何继续执行

当权限结果为 ASK 时，AgentScope 会先把待确认工具调用记录到 AgentState，并将其状态标记为 ASKING，随后产生 RequireUserConfirmEvent。

收到用户确认后，必须向同一个 Agent，或者向从该 AgentState 完整恢复出的 Agent，传入匹配的 UserConfirmResultEvent，才能继续原来的 ReAct 流程。

AgentScope 会将待确认工具记录在 AgentState 中，并通过 RequireUserConfirmEvent 通知调用方暂停执行。

然后mini-WorkBuddy会将这个审批的动作显示到用户的界面上，等待用户确认后,才能继续执行，mini-WorkBuddy 需要自行保存恢复审批流程所需的应用层信息。

所以我们在项目中定义了 PendingApproval，用于记录如何定位原 Agent、待确认的工具调用、原请求配置以及已经产生的流式内容。它不是 AgentScope 提供的类型。用户确认后，后端根据这份记录构造 UserConfirmResultEvent，交给原 Agent 继续执行。

当前 PendingApproval 只保存在后端进程内存中，因此服务重启后，尚未处理的审批无法继续。

我们现在是把 Agent key、reply ID、待确认工具、原始请求和已经产生的流式内容保存为 `PendingApproval`，然后向页面发送 `approval_required`。

用户确认后，后端构造 `UserConfirmResultEvent`，交回原来的 Agent。

模型可能一次发出多个并行工具调用。项目按 reply ID 保存一个 `ConfirmationBatch`，用户确认一次以后，把这一批 `ConfirmResult` 一起返回给 AgentScope。

拒绝也不是简单关闭弹窗。拒绝结果需要回到 Agent，模型可以改用其他安全方法，也可以向用户说明任务因为权限不足没有完成。

## 工具执行过程如何显示

工具执行结果需要显示吗，对于我们开发者而言，展示出来更容易观察agent是否按照预期执行，但是对于用户，他们对这个无感，只需要显示一些思考过程，表示Agent正在努力干活就行。

AgentScope 通过 ToolCallStartEvent、ToolCallDeltaEvent 和 ToolCallEndEvent 流式输出工具名称与调用参数。

后端按照 tool call ID 聚合参数片段，在参数完整后发送 tool_call_end；工具执行结果也以相同方式聚合，并在结束时发送 tool_result。

前端根据 tool call ID 创建或更新同一张工具卡片，显示工具名称、格式化后的参数、执行状态和结果。对于需要审批的工具，后端则从 RequireUserConfirmEvent 中取出完整的 ToolCallBlock，放入 approval_required 事件供审批卡片展示。

mini-workbuddy的工具可以分成四层。

今天就先介绍到这里，后面我们再继续拆解，有想深入学习 AI 的同学可了解：

[第 10 篇 · 前端如何消费 Agent 的 SSE 流](<https://mp.weixin.qq.com/s?__biz=Mzg2MzcyODQ5MQ==&mid=2247503147&idx=1&sn=26b0b578c1b6fc290d05b9414c6c2997&scene=21#wechat_redirect>)
