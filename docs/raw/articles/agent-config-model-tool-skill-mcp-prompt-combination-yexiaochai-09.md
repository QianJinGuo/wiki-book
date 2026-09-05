---
source: wechat
source_url: https://mp.weixin.qq.com/s/mkXjnRxwoRtuYWL9ZtS8rw
ingested: 2026-07-11
feed_name: 叶小钗
wechat_mp_fakeid: MP_WXS_3863728491
source_published: 2026-07-11
sha256: d8543ffeea966bdb5851f9ae806d4fc33c5d0ebba10415953f5ee6167b5fe4e5
---

# 第 09 篇 · Agent 配置：模型、工具、技能、MCP 与提示词的组合

前面我们已经可以运行一个本地CLI的Agent，并且我们的Agent已经可以配置模型，工具，技能和MCP。但是这些

配置我们都是写死的，这意味我们只能跑一个Agent，如果我们想让Agent去做不同的事情，例如

> 我想要一个写日报用的 Agent，只用 daily-report 这个技能，不要那些文件操作工具。
> 
> 我想要一个代码 review 用的 Agent，用 read_file 和 web_search，技能用 code-review。

我们就只能去改代码，给不同的Agent，配置不同的工具，技能，这样就非常麻烦。

这一篇 我们就把这些从代码里面抽取出来，做成配置，我们就可以根据需要配置多个Agent。

## 哪些内容是需要配置

我们先想清楚一个问题，一个Agent哪些东西是写代码，哪些东西该是配置？

代码实现的：
    
    
    工具的实现（python函数）  
    技能的执行机制  
    工具的执行机制  
    Agent Loop 循环机制  
    SSE 协议  
    

这些是系统怎么工作的底层机制，它们不会因为用户的不同而改变。

配置的部分：
    
    
    模型的选择  
    Agent需要使用的工具  
    Agent需要使用的技能  
    Agent的系统提示词  
    

这些配置的不同，就会产生不同的业务Agent，同一套代码，组装出几个不同的Agent，差的就是这几样。

把这些抽取出来，我们就可以在不改变代码的情况下，新增Agent。

文件就是数据，数据驱动行为。

## 为什么使用JSON文件，不用数据库

我们在mini-openclaw 源码里面，所有的配置都是通过JSON文件来存储，而没有使用传统的数据库。

这件事容易产生争论，对于传统的应用程序我们的数据一般都是存在数据库中的，效率更高也更加安全，

但是作为一个个人Agent而言，我反而觉得 通过JSON本地文件配置，更加的方便。而且有几个数据库给不了好处

  * 可读可手编，你随时可以打开JSON文件，看一眼有哪些Agent，配有哪些工具和技能，你甚至界面都不要开发，就能配置好一个Agent。

  * 可版本化，直接把这些配置文件 放到git里面，进行版本管理。有了变动 git diff一眼就看出来改了什么。

  * 简化部署，没有数据库，部署就简单很多，本地不用部署数据库，把Agent分享给好朋友也方便了，如果使用云数据库，就存在数据安全问题。

  * 无并发问题，这个很重要，我们能够使用JSON文件来存储数据，因为这种个人Agent都是在自己本机中自己使用，不会出现并发问题，都是配置类的低频写入。

所以我们先用这种JSON文件配置存储，非常适合我们目前开发的这个Agent，当然如果你开发的Agent要做成一个产品给其他用户使用，那么数据库还是需要的。

我们简单对比下

## 源码配置

我们开发一个Agent，需要这几个配置：模型，工具，技能，MCP 。

我们把源码运行起来后，可以看到这个页面

> 源码地址 我放在文末

如上图所示，模型管理，工具管理，技能管理，MCP服务器，这几个模块的基础CRUD我们就不做过多的介绍，它们实现起来非常简单。

> CRUD的意思就，Create 新增，Update 修改，Read 查询，Delete 删除
> 
> 比如 模型管理就需要这4类操作，可以新增一个模型，新增之后可以修改，查询模型列表进行展示，不需要的模型可以删除不再使用。

这一篇不再从零手写一套 JSON文件操作的 CRUD。我们直接读 mini-openclaw 的源码，回答一个更关键的问题：

> 当用户选择一个 Agent 并发送消息后，模型，工具，技能配置，MCP 和 系统提示词，究竟怎样影响最后一次模型请求？

### 先看下全链路

一次聊天请求里，配置的流向如下：

这条链路可以拆成四层：

### 配置路径

所有工作区路径集中定义在 `backend/app/config.py`：
    
    
    WORKSPACE_DIR = Path(__file__).resolve().parent.parent.parent / "workspace"  
    MODELS_FILE = WORKSPACE_DIR / "models.json"  
    TOOLS_FILE = WORKSPACE_DIR / "tools.json"  
    SKILLS_DIR = WORKSPACE_DIR / "skills"  
    AGENTS_FILE = WORKSPACE_DIR / "agents.json"  
    AGENTS_DIR = WORKSPACE_DIR / "agents"  
    MCP_SERVERS_FILE = WORKSPACE_DIR / "mcp_servers.json"  
    

所有的配置文件都放在workspace这个目录下面。

Agent 配置不只是一个文件，我们把它分成了2部分
    
    
    workspace/  
    ├── models.json  
    ├── agents.json  
    └── agents/  
        └── 00000000/  
            └── agent.md  
    

`agents.json` 保存结构化字段，例如模型 ID、工具 ID 列表，技能id等，`agent.md` 保存长文本系统提示词。

这个是专门这样设计的：

  * 结构化数据适合校验、筛选和关联

  * 长提示词适合用 Markdown 方便编辑和查看，以及版本管理

### Agent的Schema配置

`backend/app/schemas/agents.py` 里有三组模型：

  * `AgentCreate`：创建时允许提交的字段

  * `AgentUpdate`：更新时所有字段都可选

  * `AgentConfig`：服务端返回的完整结构

核心字段是：
    
    
    class AgentConfig(BaseModel):  
        id: str  
        name: str  
        description: str  
        model_id: str  
        tool_ids: list[str]  
        skill_ids: list[str]  
        mcp_server_ids: list[str] = []  
        is_default: bool  
        created_at: str  
    

这里没有保存工具定义、技能正文或模型密钥，只保存关联 ID。
    
    
    Agent  
    ├── model_id -> models.json 中的一条模型配置  
    ├── tool_ids -> tools.json中的配置id列表  
    ├── skill_ids -> skills.json 中的配置id列表  
    ├── mcp_server_ids -> mcp_servers.json 中的的配置  
    └── agent.md -> 这个 Agent 自己的角色与行为要求的提示词  
    

## Agent Service
