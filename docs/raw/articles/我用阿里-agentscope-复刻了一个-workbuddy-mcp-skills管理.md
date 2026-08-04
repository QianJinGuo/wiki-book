---
source: wechat
source_url: https://mp.weixin.qq.com/s/9SUyL-e-BTLJc13KIkoBxg
ingested: 2026-08-04
feed_name: 叶小钗
wechat_mp_fakeid: MP_WXS_3863728491
source_published: 2026-07-29
title: "我用阿里 AgentScope 复刻了一个 WorkBuddy"
sha256: 4cff64ae9af8e58350a59040fe755d885aa9cfcbd0b1568afd2de965a7ac005b
---

# 我用阿里 AgentScope 复刻了一个 WorkBuddy

---
source: wechat
source_url: https://mp.weixin.qq.com/s/9SUyL-e-BTLJc13KIkoBxg
ingested: 2026-08-04
source_published: 2026年7月29日 09:00
---


书接上文：[《我用阿里 AgentScope 复刻了一个 WorkBuddy》](<https://mp.weixin.qq.com/s?__biz=Mzg2MzcyODQ5MQ==&mid=2247503204&idx=1&sn=a9f21e0b2b1f36037d59a436412cf71a&scene=21#wechat_redirect>)

这篇文章是 如何使用agentscope来开发一个mini-workbuddy系列文章中的第二篇文章，上一篇我们简单介绍了agentscope这个框架，以及如何使用这个框架来开发Agent的模型配置，工具管理和工具权限管理。

本篇主要介绍的是如何使用agentscope这个框架来管理MCP和skills。

## MCP

MCP这个概念，我相信大家应该都很熟悉了，这个概念出来也这么久了，我就不在这里啰嗦这个名词了，如果有不太懂的可以去翻一翻 我们的历史文章，有很详细的讲述。

MCP（Model Context Protocol）主要包含两大核心组成部分：

  * MCP Server：负责对外暴露可调用的工具能力

  * MCP Client：部署在 Agent 侧，用于发现并调用Server端的工具。

### 腾讯 WorkBuddy 里面有 MCP 吗

我们先来看看WorkBuddy这个桌面Agent是否包含MCP相关的设计。如果用过老版本的还可以看到MCP的配置

WorkBuddy 的更新迭代非常快，新版本已经不再把 MCP 作为独立的一级入口，而是统一提供连接器入口。其中，自定义连接器支持安装和配置 MCP 服务。

我们来看看WorkBuddy是怎么回答 连接器的架构是什么

workbuddy的回答是 连接器的底层协议是MCP，不过，根据官方文档来看。个人版 WorkBuddy 把连接器定义为 WorkBuddy 与外部服务之间的桥梁，用来把第三方的数据和能力引入 AI 工作流。它目前包含两种技术形态：

  * MCP + CLI：通过标准化协议接入外部工具

  * Skill + CLI：通过内置脚本完成调用

个人版既提供 QQ 邮箱、腾讯文档、腾讯乐享、腾讯会议、TAPD 等预置连接器，也允许用户安装自定义 MCP 服务。预置连接器通常只需要完成授权、启用或停用，自定义连接器才会进一步暴露 MCP 配置。

个人版连接器文档：
    
    
    https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Connector  
    

> 连接器是面向用户的外部服务入口，MCP 是实现自定义连接器的一种技术方式。

### Mini-WorkBuddy 的连接器设计

个人版腾讯 WorkBuddy 已经提供了预置连接器、授权管理、连接状态以及自定义 MCP 服务等能力。

我们不做那么复杂，链接器就做一个MCP的配置。最开始我想的是也可以做一个链接器的市场，用户可以选择一个服务直接安装就行，但是我没有找到能够获取腾讯的MCP server的服务的API。

不过我们可以通过这个网址自己去复制MCP Server的配置，手动导入。
    
    
    https://cloud.tencent.com/developer/mcp  
    

这里有很多MCP的配置服务，可以按需导入到我们开发的链接器中。

mini—workBuddy我们就按照自定义链接器的方式来开发：

  * 使用标准 `servers` 或 `mcpServers` JSON 导入连接器

  * 重点支持 `npx`、`uvx` 等 STDIO MCP Server

  * 同时兼容 SSE 和 Streamable HTTP MCP Server

  * 支持 `command`、`args`、`env`、`cwd`、Header 和工具过滤

  * 支持一次导入多个 Server，并保证批量写入的原子性

  * 支持启用、停用、删除和测试连接

  * 聊天时由用户显式选择需要使用的连接器

  * 只把本轮选中的连接器注册到 AgentScope Toolkit

  * 默认权限下，非只读 MCP 工具继续走现有的审批机制

整个流程如下：

这里有个地方需要注意下：AgentScope 的 STDIO MCP 需要使用 Stateful Client。界面上测试连接时，后端启动子进程，拿到工具列表就可以关闭了，真正在聊天流程处理的时候，则要在创建 Agent 前先做 `connect()`。

HTTP MCP 仍然使用 Stateless Client，不需要维护本地子进程生命周期。

### WorkspaceStore 是什么

这里先介绍一下后面会多次出现的 `WorkspaceStore`。它不是 AgentScope 提供的类，而是 Mini-WorkBuddy 自己实现的一层本地配置仓库。

Mini-WorkBuddy 没有引入数据库，而是把系统配置保存在 `workspace/` 目录的 JSON 文件和子目录中。`WorkspaceStore` 负责统一管理这些文件：
    
    
    workspace/  
    ├── workspace.json       # 默认工作空间及当前工作目录  
    ├── models.json          # 模型配置  
    ├── tools.json           # 工具开关  
    ├── connectors.json      # 连接器配置  
    ├── skills.json          # 用户 Skill 索引  
    ├── skills/              # 用户安装的 Skill  
    ├── experts/             # 专家包  
    └── teams/               # 专家团包  
    

它主要承担四类职责：

  * 应用启动时创建缺失的目录和默认配置文件

  * 提供模型、连接器和 Skill 等配置的查询与增删改查方法

  * 校验工作目录、连接器参数等数据，避免无效配置进入运行时

  * 通过 临时文件 + `os.replace` 原子写入 JSON，避免程序中断后留下不完整文件

可以把它理解为 Mini-WorkBuddy 的配置中心 + Repository 层。API 层不直接操作 JSON 文件，而是调用 `WorkspaceStore`，聊天运行时也从这里读取用户启用的模型、连接器和 Skill，再交给 AgentScope 创建对应的模型客户端、MCP Client 或 Skill Loader。

### 连接器配置保存

AgentScope 负责创建和调用 MCP Client，连接器管理页面和配置持久化还得我们自己做。为此，`WorkspaceStore` 又增加了一个配置文件：
    
    
    workspace/connectors.json  
    

默认内容很简单：
    
    
    {  
      "connectors": []  
    }  
    

以高德地图 STDIO MCP 为例，导入后保存的结构类似下面这样：
    
    
    {  
      "connectors": [  
        {  
          "id": "connector",  
          "name": "高德地图",  
          "description": "",  
          "transport": "stdio",  
          "command": "npx",  
          "args": [  
            "-y",  
            "@amap/amap-maps-mcp-server"  
          ],  
          "env": {  
            "AMAP_MAPS_API_KEY": "真实的高德 Web 服务 API Key"  
          },  
          "enabled": true,  
          "stateful": true,  
          "enable_tools": [],  
          "disable_tools": [],  
          "execution_timeout": 30,  
          "source": "json-import"  
        }  
      ]  
    }  
    

主要字段的作用如下：

  * `id`：连接器唯一标识，同时会进入 MCP 工具名称

  * `transport`：`stdio` 或 `http`

  * `command`、`args`：启动 STDIO MCP Server 的命令和参数

  * `env`：传给本地 MCP 子进程的环境变量

  * `url`、`headers`：HTTP MCP Server 的地址和认证请求头

  * `enabled`：是否允许用户在聊天中选择这个连接器

  * `enable_tools`：只允许使用指定工具

  * `disable_tools`：禁止使用指定工具

  * `execution_timeout`：工具执行超时时间

连接器的增删改查仍然由 `WorkspaceStore` 完成，写入配置时继续复用项目已有的原子写入逻辑，先写临时文件，再通过 `os.replace` 替换正式文件，避免程序中断以后留下只写了一半的 JSON。

### 使用 AgentScope 创建 MCP Client

连接器配置保存以后，下一步才是把这份普通的 JSON 配置转换成 AgentScope 能使用的 `MCPClient`。

我们知道链接MCP一般有两种传输方式一个是stdio，一个是http，这里我们把它们做成了两个配置文件 `StdioMCPConfig` ， `HttpMCPConfig`，创建过程可以拆成两步，先根据传输方式创建连接配置，再用连接配置创建 `MCPClient`。

#### 第一步：创建连接配置

STDIO MCP Server 是由本地命令启动的，所以需要把 `command`、`args`、`env` 和 `cwd` 交给 `StdioMCPConfig`：
    
    
    from agentscope.mcp import StdioMCPConfig  
      
    mcp_config = StdioMCPConfig(  
        command="npx",  
        args=["-y", "@amap/amap-maps-mcp-server"],  
        env={"AMAP_MAPS_API_KEY": "your-api-key"},  
    )  
    

HTTP MCP Server 已经运行在远端，只需要提供 URL、请求头和超时时间：
    
    
    from agentscope.mcp import HttpMCPConfig  
      
    mcp_config = HttpMCPConfig(  
        url="https://example.com/mcp",  
        headers={"Authorization": "Bearer token"},  
        timeout=30,  
    )  
    

在当前项目使用的 AgentScope 版本中，`HttpMCPConfig` 会根据 URL 选择 SSE 或 Streamable HTTP：以 `/sse` 或 `/messages/` 结尾的 URL 使用 SSE，其他 URL 使用 Streamable HTTP。

#### 第二步：创建 MCPClient

有了连接配置以后，就可以创建客户端：
    
    
    from agentscope.mcp import MCPClient  
      
    client = MCPClient(  
        name="amap",  
        is_stateful=True,  
        mcp_config=mcp_config,  
        enable_tools=None,  
        disable_tools=None,  
        execution_timeout=30,  
    )  
    

几个参数的含义如下：

参数| 作用  
---|---  
`name`| 客户端名称，也是区分不同 MCP 连接器的重要标识  
`is_stateful`| 是否维护一个持续存在的连接  
`mcp_config`| 前一步创建的 STDIO 或 HTTP 连接配置  
`enable_tools`| 只暴露指定工具；`None` 表示不设置白名单  
`disable_tools`| 隐藏指定工具；`None` 表示不设置黑名单  
`execution_timeout`| 单次工具调用的超时时间  
  
Mini-WorkBuddy 对两种传输方式采用不同的生命周期策略：

传输方式| 配置类型| Client 模式| 使用前是否调用 `connect()`  
---|---|---|---  
STDIO| `StdioMCPConfig`| Stateful| 是  
HTTP| `HttpMCPConfig`| Stateless| 否  
  
STDIO Server 是 Client 启动的本地子进程。为了让后续多次工具调用复用同一个进程，项目把它设为 Stateful，并在注册到 Toolkit 之前显式执行 `await client.connect()`。

HTTP Server 独立运行，不需要 Mini-WorkBuddy 维护本地子进程，所以项目把它设为 Stateless。AgentScope 会在列举或调用工具时管理临时会话。

#### 项目中的统一工厂函数

实际运行时，我们不知道用户保存的是哪种连接器，因此项目用一个工厂函数完成上述映射：
    
    
    from typing import Any  
      
    from agentscope.mcp import HttpMCPConfig, MCPClient, StdioMCPConfig  
      
      
    def create_mcp_client(  
        config: dict[str, Any],  
    ) -> MCPClient:  
        transport = str(  
            config.get("transport") or "http"  
        ).lower()  
        timeout = float(  
            config.get("execution_timeout") or 30  
        )  
      
        if transport == "stdio":  
            mcp_config = StdioMCPConfig(  
                command=str(config["command"]),  
                args=list(config.get("args") or []) or None,  
                env=dict(config.get("env") or {}) or None,  
                cwd=config.get("cwd") or None,  
            )  
            is_stateful = True  
        else:  
            mcp_config = HttpMCPConfig(  
                url=str(config["url"]),  
                headers=dict(  
                    config.get("headers") or {}  
                ) or None,  
                timeout=timeout,  
            )  
            is_stateful = False  
      
        return RequestSafeMCPClient(  
            name=str(config["id"]),  
            is_stateful=is_stateful,  
            mcp_config=mcp_config,  
            enable_tools=list(  
                config.get("enable_tools") or []  
            ) or None,  
            disable_tools=list(  
                config.get("disable_tools") or []  
            ) or None,  
            execution_timeout=timeout,  
        )  
    

这段代码只负责根据不同的配置来创建Client，创建一组 Client 后，项目会在另一个函数中统一连接其中的 Stateful Client：
    
    
    async def connect_stateful_mcp_clients(  
        clients: list[MCPClient],  
    ) -> None:  
        connected: list[MCPClient] = []  
        try:  
            for client in clients:  
                if client.is_stateful:  
                    await client.connect()  
                    connected.append(client)  
        except Exception:  
            for client in reversed(connected):  
                await client.close()  
            raise  
    

#### 项目没有直接使用AgentScope提供的MCPClient

上面的工厂函数最终返回的是 `RequestSafeMCPClient`，它是 Mini-WorkBuddy 自己实现的 `MCPClient` 子类，不是 AgentScope 的默认方法。

之所以增加这一层，是因为项目中同时使用了 Stateful STDIO 连接、Starlette `StreamingResponse` 和跨请求的工具审批。AgentScope 底层通过 AnyIO 管理 STDIO 连接，如果在一个请求任务中执行 `connect()`，却在后续请求中执行 `close()`，AnyIO 的 cancel scope 可能跨越不同任务，进而破坏 Starlette 的任务状态。

`RequestSafeMCPClient` 的处理方式是：

  1. 创建一个长期存活的 owner task。
  2. 在 owner task 中执行真正的 `connect()`。
  3. 让连接在多轮工具调用和审批请求之间保持存活。
  4. 收到关闭信号后，仍在同一个 owner task 中执行真正的 `close()`。

### 把 MCP 注册到 Toolkit

MCP Client 创建好以后，还要放进 `Toolkit`。

项目原来已经注册了几个本地工具：
    
    
    Read()  
    Glob()  
    Grep()  
    Write()  
    Edit()  
    Bash(cwd=workdir)  
    

但我不想把所有已启用连接器都挂到每个 Agent 上。页面会把当前聊天选中的连接器 id 放到 `WorkContext.connectors`，后端只读取已启用且被选中的配置，再通过 `mcps` 参数交给 Toolkit。
    
    
    async def create_agent_with_connectors(  
        connector_ids: list[str],  
    ):  
        clients = create_mcp_clients(  
            self.workspace.connector_configs(  
                enabled_only=True,  
                connector_ids=connector_ids,  
            )  
        )  
        await connect_stateful_mcp_clients(clients)  
      
        toolkit = Toolkit(  
            tools=[  
                Read(),  
                Glob(),  
                Grep(),  
                Write(),  
                Edit(),  
                Bash(cwd=workdir),  
            ],  
            skills_or_loaders=skill_loaders,  
            mcps=clients,  
        )  
    

这时的 Toolkit 里同时有三类能力：

  * AgentScope 内置的本地文件和命令工具

  * 项目加载的 Skills

  * 用户在当前聊天中选中的 MCP 连接器

AgentScope 会访问 MCP Server服务，获取工具定义，然后把名称、描述和参数 Schema 交给模型。模型发起调用后，工具结果再回到 Agent 的执行循环。

完整调用流程如下：

### MCP 工具的权限审批

MCP 的工具也可以查询天气，发送消息、改文档甚至删除数据，所以它不能自动跳过权限系统。

AgentScope在创建 MCPTool 时，会读取 MCP Server 随工具定义返回的 annotations.readOnlyHint。如果该值为 true，MCPTool.check_permissions() 返回 ALLOW，如果该字段缺失或不是 true，则返回 ASK。它的处理逻辑大致如下：
    
    
    if self.is_read_only:  
        return PermissionDecision(  
            behavior=PermissionBehavior.ALLOW,  
            message="This is a read-only MCP tool.",  
        )  
      
    return PermissionDecision(  
        behavior=PermissionBehavior.ASK,  
        message=(  
            "MCP tools must be explicitly "  
            "allowed by the user."  
        ),  
    )  
    

我们上一篇的时候定义了三个权限，在默认权限档位下，这个 `ASK` 会变成 `RequireUserConfirmEvent`。后端把事件推给页面，用户确认后继续原来的工具权限审批流程。

### 连接器修改以后要创建新的 Agent

上一篇讲模型切换时提到过，已经创建的 Agent 内部绑定了模型客户端。用户切换模型以后，不能继续复用原来的 Agent。

连接器也存在相同的问题。

Agent 创建时，Toolkit 已经包含了当前聊天选中的 MCP Client。如果用户更换选择、停用连接器或者修改配置，但是后端仍然复用旧 Agent，那么页面状态和模型实际看到的工具就会不一致。

所以增加连接器子后，我们用来缓存的Agent 的key 也需要增加连接器相关的配置。

没有选择连接器时缓存 key 不会包含连接器版本，选择不同连接器组合时会生成不同的 key。只要所选连接器的启用状态、命令、参数、环境变量、URL、认证信息、工具过滤或者超时配置发生变化，下一次对话就会创建新的 Agent 和 Toolkit。

### 连接器页面

后端功能完成以后，前端没有继续为连接器保留一个孤立的侧边栏入口，而是参考 WorkBuddy 的信息架构，把 专家、技能、连接器 放到同一个入口中。

左侧菜单显示“专家·技能·连接器”，进入以后，右侧顶部使用三个 Tab 切换：

## Skills

Skill 这个概念我们这里也不多做解释，核心就是把完成特定任务所需的专业知识、操作流程和判断标准，封装成一个AI可随时调用的标准化指令集，同时提供渐进式披露的加载机制。

### WorkBuddy的技能

腾讯的WorkBuddy的技能使用非常方便，其技能市场提供了大量已经配置好的技能，对用户而言，只需要在市场查找自己需要的技能，点击安装，在聊天页面选择即可使用。
    
    
    市场浏览 → 查看详情 → 安装 → 在聊天中使用  
    

Mini-WorkBuddy 我们也是按照这个闭环做，用户可以通过市场搜索安装，不需要知道skills怎么写的，也不用到网上到处找技能。

这个项目我们选择 SkillHub 作为市场数据源。后端读取最热、推荐、最新和趋势榜单，前端整理成统一的技能卡片。这部分是参考 WorkBuddy 的市场体验在本地项目中重新实现。

安装时，SkillHub CLI 把完整目录下载到 `workspace/skills/`，后端再把名称、版本和来源等信息写入本地索引文件中 `workspace/skills.json`，这个文件配置提供开启和禁用skill的配置。

安装成功后，只是把技能相关的文件保存到了本地`workspace/skills/`目录下面，接下来我们还要让 AgentScope 来加载它。

### AgentScope 如何加载 Skill

AgentScope 提供了 `LocalSkillLoader`，可以从本地目录读取 Skill，最后通过 `skills_or_loaders` 放进 `Toolkit`。
    
    
    from agentscope.skill import LocalSkillLoader  
    from agentscope.tool import Toolkit  
      
    loader = LocalSkillLoader(  
        directory="workspace/skills/article-rewriter"  
    )  
      
    toolkit = Toolkit(  
        tools=[Read(), Glob(), Grep(), Write(), Edit(), Bash(cwd=workdir)],  
        skills_or_loaders=[loader],  
    )  
    

`skills_or_loaders` 也可以直接传 Skill 目录，AgentScope 会负责创建对应的 Loader。我们做的时候就是直接把目录路径交给 Toolkit。

创建 Agent 时，Toolkit 不会把所有 `SKILL.md` 的完整正文都塞进 System Prompt。

如果安装了十几个复杂 Skill，每个 Skill 又有很长的操作说明，一开始就全部放进上下文，不但浪费 Token，还会让不同 Skill 的规则互相干扰。

AgentScope 也是采用按需加载的方式，Toolkit 先向模型提供可用 Skill 的名称、简介和目录信息，同时增加一个名为 `Skill` 的特殊工具。模型判断当前任务需要某个 Skill 时，再调用这个工具读取完整说明。

### Mini-WorkBuddy 的 Skills 设计

腾讯 WorkBuddy 中的技能对普通用户来说是一种可以安装和使用的能力。用户不需要知道 `LocalSkillLoader`，只需要在技能市场中找到技能，安装以后启用，聊天时直接使用。

Mini-WorkBuddy 也按照这个思路实现了两类 Skill。

第一类是用户 Skill，保存在下面的目录中：
    
    
    workspace/skills/<slug>/SKILL.md  
    

它们会显示在 我的技能 页面，可以从 SkillHub 安装，也可以由用户手动放进目录。用户可以启用、停用、查看详情和卸载。

第二类是内置 Skill，保存在：
    
    
    workspace/builtin-skills/<slug>/SKILL.md  
    

当前项目内置了技能创建器和专家管理器。这类 Skill 是产品功能的一部分，不会出现在我的技能列表中，只有用户点击添加技能，创建专家等入口时，前端才会把对应的 Skill ID 放进聊天上下文，让后端显式加载。

整个 Skills 流程如下：

### 技能配置保存

Skill 的完整内容放在独立目录中，`workspace/skills.json` 只保存页面展示和安装状态需要的索引信息。

技能经过开关操作后，索引中的一条记录大致如下：
    
    
    [  
      {  
        "slug": "article-rewriter",  
        "name": "文章去 AI 味工具",  
        "summary": "检查并修改文章中的 AI 写作痕迹",  
        "description": "让文章表达更自然，同时保留原文事实",  
        "dir_name": "article-rewriter",  
        "source": "skillhub",  
        "owner": "demo-user",  
        "version": "1.0.0",  
        "tags": ["文章写作", "内容改写"],  
        "installed_at": "2026-07-12T04:29:47Z",  
        "enabled": true  
      }  
    ]  
    

主要字段包括：

  * `slug`：技能唯一标识，也是接口和聊天上下文使用的 ID

  * `dir_name`：技能在 `workspace/skills/` 下的真实目录名

  * `name`、`summary`、`description`：技能卡片和详情页展示内容

  * `source`、`owner`、`version`：技能来源、作者和版本

  * `enabled`：是否允许通用 Agent 自动发现

页面读取技能时，后端会把索引信息与 `SKILL.md` Frontmatter 合并，索引中的字段优先。这样市场提供的名称、图标和版本可以正常展示，手动复制到目录中的 Skill 也可以从 Frontmatter 获得基本信息。

项目还会扫描 `workspace/skills/`。如果某个目录包含 `SKILL.md`，但是没有出现在 `skills.json` 中，系统会把它作为 `manual` 手动安装的技能返回页面。这个主要是为了方便用户在其他技能市场或者手动编写的skill，只需要放到目录中就可以正常使用，不需要再手动修改索引文件。

### 技能市场数据与安装实现

技能市场的数据我们用的是 SkillHub。后端请求最热、推荐、最新和趋势四个榜单，再把返回字段整理成前端统一使用的卡片。

点击 + 号安装的时候，我们直接使用了SkillHub CLI：
    
    
    skillhub install <slug> --dir workspace/skills  
    

安装流程主要分成下面几步：

  1. 校验 `slug`，只允许字母、数字、点、下划线和连字符

  2. 检查本机是否安装了 `skillhub` CLI

  3. 记录安装前已有的技能目录

  4. 启动 CLI，并设置 60 秒超时

  5. 安装完成后，根据目录名和 Frontmatter 找到新 Skill

  6. 读取 `SKILL.md` 元数据，写入 `skills.json`

    
    
    process = await asyncio.create_subprocess_exec(  
        "skillhub",  
        "install",  
        slug,  
        "--dir",  
        str(self.user_skills_dir),  
        stdout=asyncio.subprocess.PIPE,  
        stderr=asyncio.subprocess.PIPE,  
    )  
      
    stdout, stderr = await asyncio.wait_for(  
        process.communicate(),  
        timeout=60.0,  
    )  
    

没有安装 CLI 时，列表中显示的技能只能查看，安装按钮会禁用，页面同时给出安装提示。需要用户在电脑上手动安装skillhub的cli，后续如果要做成桌面版的Agent，可以直接将这个打包到Agent的包中，用户就需要手动安装这些工具。

### 自动发现和显式选择

运行时分两种情况。

如果用户在聊天 `+` 菜单中明确选择了 Skill，我们需要查找这个Skill的安装目录，然后把这个目录交给 Toolkit。
    
    
    skill_dir = self.workspace.user_skill_dir(  
        request.context.skill  
    )  
      
    if skill_dir:  
        skill_loaders.append(str(skill_dir))  
    

如果用户没有选择指定的Skill，我们需要通过skills.json这个配置文件，自动发现所有已启用的用户 Skill，把这些技能的安装目录交给Toolkit。

最后在创建 Toolkit 时，把本地工具、Skill 和 MCP Client 一起注册进去：
    
    
    toolkit = Toolkit(  
        tools=[  
            Read(),  
            Glob(),  
            Grep(),  
            Write(),  
            Edit(),  
            Bash(cwd=workdir),  
        ],  
        skills_or_loaders=skill_loaders,  
        mcps=mcp_clients,  
    )  
    

### 显式切换 Skill 后需要新的 Agent

Agent 创建后已经持有自己的 Toolkit。同一个会话里，用户可能上一轮选文章改写 Skill，下一轮又换成浏览器自动化。

如果继续复用原来的 Agent，页面虽然显示选择已经变化，但 Agent 的 Toolkit 仍然绑定着旧 Skill。因此显式选择的 Skill ID 也要进入 Agent 缓存 key。
    
    
    def _agent_key_for_request(  
        self,  
        base_key: str,  
        request: ChatRequest,  
    ) -> str:  
        connector_revision = (  
            self.workspace.connector_revision(  
                request.context.connectors  
            )  
        )  
        if connector_revision:  
            base_key = (  
                f"{base_key}:connectors:"  
                f"{connector_revision}"  
            )  
        if request.context.skill:  
            return (  
                f"{base_key}:skill:"  
                f"{request.context.skill}"  
            )  
        return base_key  
    

所以显式 Skill ID 也进入缓存 key。模型、专家、连接器和 Skill 都一样时可以继续复用 Agent，只要切换了显式 Skill，就创建带新 Toolkit 的 Agent。

没有显式选择时不需要把所有启用 Skill 拼进 key，因为动态 Loader 会重新读取启用列表，权限上下文也会在复用 Agent 时同步更新。

### Skill 目录也需要权限

把 Skill 注册到 Toolkit，只代表模型能发现和读取 `SKILL.md`。如果说明里还要求读 `references/`、跑 `scripts/` 或使用 `assets/`，文件和命令工具也必须能访问这个目录。

因此项目在配置 Agent 权限时，除了加入当前工作目录，还会加入下面几类 Skill 路径：

  * 用户显式选择的 Skill 目录

  * 自动发现模式下所有已启用的用户 Skill 目录

  * 专家包自己携带的 Skill 目录

这些技能目录会进入 `PermissionContext.working_directories`。否则模型明明在 Skill 里看到了 运行 `scripts/run.py` 这个指令，执行 Bash 时却会因为脚本在工作目录外面而被拒绝。

上一篇 我们介绍过这个 `PermissionContext.working_directories`。这个是 AgentScope 的权限引擎，它告诉Agent 哪些目录属于本轮任务允许工作的范围。

### Skills 页面和聊天选择

前端页面把 Skills 分成技能市场和我的技能两个页面。

技能市场展示skillhub里面最热、推荐、最新和趋势榜单。用户可以查看技能名称、简介、标签、作者、版本、下载量和收藏数，点击右上角的 `+` 完成安装。

我的技能 展示本地已经安装的 Skill，可以进行下面这些操作：

  * 启用或停用 Skill

  * 查看 `SKILL.md` 详情和安装目录

  * 在系统文件管理器中打开目录

  * 卸载 Skill

  * 返回技能市场继续安装

添加技能 这个功能也是按照 workBuddy的实现方式，用户点击这个按钮后，直接进入聊天页面，在聊天框中加入一个内置的 `skill-creator` 技能，这个技能我是直接复制workBuddy的内置技能过来，一个字都没有改。用户在通过对话来创建一个新的skill。

聊天输入框的 `+` 菜单会列出内置功能 Skill 和所有已启用的用户 Skill。用户选择以后，页面显示一个 Skill 标签，并把 ID 写入 `WorkContext.skill`。发送消息时，后端据此选择显式加载或自动发现模式。

## 小结

连接器 和 Skill 好像是两套不同的功能，在AgentScope里面它都是交给 `Toolkit` 来管理。连接器配置转成 `RequestSafeMCPClient`（它是 AgentScope `MCPClient` 的子类），Skill 目录则交给 `LocalSkillLoader` 或工作空间动态 Loader。

整个实现可以看下图

这样一来，Mini WorkBuddy 有了三种扩展方式：本地 Tool 负责操作工作目录，MCP 负责连接外部系统，Skill 负责复用工作方法。

想要更多了解AI知识的同学可点击下面图片：
