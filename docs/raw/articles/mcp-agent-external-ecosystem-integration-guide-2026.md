---
source: wechat
source_url: https://mp.weixin.qq.com/s/8HBkECPTXuIxsUSbghEc3A
ingested: 2026-07-05
feed_name: 叶小钗
wechat_mp_fakeid: MP_WXS_3863728491
source_published: 2026-07-05
sha256: 43de8f7aef8c2842d42bfda5d19736ed614361855a3b9cfd8460ad39755227e8
---

# 第 08 篇 · MCP：让 Agent 跟外部生态对接

我们前面开发出来的Agent已经有两类能力：

  * **Tools** ：`read_file`、`write_file`、`list_files` 这种可以真正执行动作的函数
  * **Skills** ：`SKILL.md` 这种方法论，让 Agent 知道某类任务应该怎么做

这两种能力都在我们的项目内部实现的，工具写在 `backend/app/tools/`，技能写在 `skills/`，Agent 启动时自己扫描、自己注入、自己执行。

今天我们要接入第三类能力：**MCP**

**MCP = Model Context Protocol** ，Anthropic 在 2024 年 11 月开源的一个协议，它关注的不是某一个具体工具，而是如何以统一、标准的方式，把外部系统的能力、数据和上下文暴露给模型使用。

> MCP 是一套标准，让 Agent 不只会调用自己项目里的 Python 函数，还能连接一个外部工具服务，发现它有哪些工具，并按统一格式调用它们。

我们先来看看我们之前在系统中是如何使用工具的

工具函数和Agent在同一个python进程里面，可用工具通过registry 注册到模型中， 模型推理后需要调用工具比如 read_file 的时候，Agent就在本地的 registry 找到  execute（） 方法就直接执行了。

如果我们使用了MCP，它们最大的区别是中间多了一个独立的Server:

在 MCP 体系中，Agent不会直接调用工具，而是通过协议连接到一个 **MCP Server** 。这个 Server 可以对外提供多种能力，例如工具调用、资源读取、上下文查询等，Agent通过 MCP Client 与之通信。

这里有一点需要注意。模型仍然只能看到工具，它不知道也不关心这个工具是本地Python函数，还是MCP Server。

变化的是Agent runtime，之前是Agent直接调用本地函数，有了MCP，Agent通过MCP Client发送JSON-RPC消息，让MCP Server 执行工具。

这就是 MCP 和 Tools 的关系：**Tools 是模型可调用能力的形态，MCP 是把这些能力跨进程、跨项目、跨生态暴露出来的协议。**

##  为什么需要MCP

如果我们的Agent功能比较单一，工具也比较少，没有接入外部能力的需要，不用MCP也是可以的，在我们的Agent中 自己实现需要的工具即可。

大多数的时候，我们要开发一个比较通用一点的Agent，基本都会遇到和外部系统打交道，都需要一些外部业务系统的能力。

当然 这个时候，我们也可以直接开发一套工具，用来接入外部系统，这样也是可以的。 但是你开发的这些工具就不能给其他Agent复用了。

比如 公司要开发销售Agent，订单Agent，它们都需要接入用户系统，查询用户信息，这个时候，如果没有MCP，那么2个Agent都要自己去开发一些工具去查询用户信息，如果我们使用MCP 就只需要开发一次，后面所有需要查询用户信息的Agent，只需要接入这个用户MCP就行。

还有一个问题，就是维护，比如查询用户增加一个新的查询函数返回用户明细，如果是MCP 那么我们只需要改一下MCP Server，就行了，Agent端是无感的，什么都不需要去改。如果你自己开发的工具 就要去改Agent的代码，新增一个工具才行。

MCP 解决是：**外部生态能力的复用和标准化** 。

## MCP 里最重要的三个概念

### 1\. Server 暴露能力

一个 MCP server 可以暴露三类能力：

  * **tools** ：可以调用的动作，比如 `read_file`、`search_issues`
  * **resources** ：可以读取的上下文，比如某个文档、某张表、某个 URI
  * **prompts** ：预定义提示词模板

真实项目里最常用的是 tools，其他resources和prompts 基本不会在这里使用。

### 2\. Client 负责连接和调用

Agent 不直接跟 server 的内部函数打交道，而是通过 MCP client 发请求：
    
    
    initialize     建立会话  
    tools/list     列出 server 暴露了哪些工具  
    tools/call     调用某个工具  
    

这些请求底层走 JSON-RPC。我们不需要手写 JSON-RPC 包，Python SDK 已经封装好了。

### 3\. Transport 决定消息怎么传

MCP 常见传输方式有三种：

  * **stdio** ：把 MCP server 当子进程启动，通过 stdin/stdout 通信。本地 server 最常用。
  * **streamable HTTP** ：通过 HTTP 连接远程 server，适合公司内部统一部署。

这一篇的动手案例用 stdio。
