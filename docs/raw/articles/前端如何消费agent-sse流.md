---
source: wechat
source_url: https://mp.weixin.qq.com/s/GX7KHAKoLC64Sy8nvKp3MA
ingested: 2026-07-24
feed_name: 叶小钗
wechat_mp_fakeid: MP_WXS_3863728491
source_published: 2026-07-18
sha256: fc904e638dd0720ee64170578cd897cbfdc19431c23b3b13714dbd79406c3441
---
source: wechat
source_url: https://mp.weixin.qq.com/s/GX7KHAKoLC64Sy8nvKp3MA
ingested: 2026-07-24
source_published: 2026年7月18日 10:04
---

# 第 10 篇 · 前端如何消费 Agent 的 SSE 流

前面我们已经把 Agent 后端主线串起来了：模型调用、工具执行、Skill、MCP、Agent 配置都有了。

第 05 篇里我们做过事件流处理，Agent loop 不再把执行过程直接 `print` 到终端，而是一边运行一边产出事件。

当时的核心思想是：
    
    
    for event in run_agent_events(user_message):  
        print_event(event)  
    

Agent 只负责产出事件，外面的消费者决定怎么展示。

CLI 可以把事件打印到终端。Web 页面要做的事情也一样，只是消费者从 `print_event(event)` 变成了：
    
    
    后端把事件转成 SSE  
    浏览器读取 SSE 流  
    前端把 token / tool_start / tool_result 渲染到页面上  
    

这篇文章我们不开展开来讲Vue项目初始化，也不讲模型、Agent、Tool、Skill、MCP 这些管理模块的CRUD，这些都比较简单，一些常规项目的标准操作，大家自己看下就行。

我们主要来讲解SSE 事件流：

**前端如何接住后端的 SSE 事件流，并把它变成一个不断更新的 Agent 聊天页面。**

##  整体框架

mini-openclaw 的前端是一个 Vue 3 应用，大致分成这些目录：
    
    
    frontend/src/  
    ├── api/                 # 后端接口封装  
    ├── stores/              # Pinia 状态  
    ├── views/               # 页面级组件  
    ├── components/          # 布局和复用组件  
    ├── router/index.ts      # 路由表  
    ├── App.vue              # 应用入口  
    └── assets/main.css      # 全局样式  
    

路由里面有聊天、Agent 管理、模型管理、工具管理、Skill 管理、MCP 管理、日志和观测页面：
    
    
    /chat  
    /agents  
    /models  
    /tools  
    /skills  
    /mcp  
    /logs/execution  
    /logs/model  
    /observability  
    

只有这几个模块，整个项目还是比较简单的，大多数管理页面都是普通 REST 请求，如模型列表、Agent 配置保存、工具启停、Skill 上传、MCP server 配置，都是常规 CRUD。

真正和 Agent 强相关、是聊天页面的流式链路：

如上图所示，在这条链路里面，`ChatView.vue` 负责页面显示，`stores/chat.ts` 负责状态管理，`api/chat.ts` 负责网络流解析。

## 后端给前端的不是 JSON，而是一条SSE流

普通接口是一次请求、一次响应就结束了，聊天接口不是这样。

用户问一个问题以后，Agent 可能会先输出一段文字信息，再输出调用工具开始，再输出工具结果，然后进入下一轮模型调用。页面要把这些发生的事件，实时显示出来，不能等所有事情结束以后才返回一个大JSON。

后端路由做的是：
    
    
    return StreamingResponse(  
        chat_service.stream_chat(session_id, data.message, agent_id),  
        media_type="text/event-stream",  
        headers={  
            "Cache-Control": "no-cache",  
            "Connection": "keep-alive",  
            "X-Accel-Buffering": "no",  
        },  
    )  
    

这里的 `stream_chat(...)` 是一个 generator。它不是一次性返回最终答案，而是不断 `yield` SSE 文本：
    
    
    data: 我先看一下文件。  
      
    data: __tool_start__:{"tool_call_id":"call_1","name":"read_file","args":{"path":"a.txt"}}  
      
    data: __tool_result__:{"tool_call_id":"call_1","name":"read_file","output":"...","is_error":false}  
      
    data: __done__  
    

每个事件由一组文本行组成，常见的是 `data:` 行。一个事件结束时，用一个空行分隔，也就是 `\n\n`，这也是前端解析时最重要的边界。

## 为什么不用 EventSource

浏览器原生支持 SSE，接口叫 `EventSource`。

但这里不能直接用它，因为 `EventSource` 主要适合这种请求：
    
    
    GET /events  
    

聊天接口需要带上用户输入和当前 Agent：
    
    
    POST /api/chat/sessions/{session_id}/chat  
    body: { "message": "...", "agent_id": "..." }  
    

所以前端用采用的是：
    
    
    fetch + response.body.getReader()  
    

这意味着我们要自己实现一个类似 `EventSource` 的功能：

  * 读取网络字节流

  * 把字节解码成文本

  * 按 `\n\n` 拆成 SSE event block

  * 从 block 里取出 `data:` 内容

  * 根据内容分发给不同回调

这部分内容在 `frontend/src/api/chat.ts`

## API 层只管解析流

`chatApi.sendMessage` 的返回值是 void，真正的输出全在回调参数里。它把一条 SSE 流的各种可能（文本、推理、工具调用、工具结果、结束、异常）都显式暴露出来，让上层可以精准地控制每一步的页面表现。
    
    
    async sendMessage(  
      sessionId: string,  
      message: string,  
      agentId: string,  
      onToken: (token: string) =>void,  
      onToolStart: (info: ToolCallInfo) =>void,  
      onToolResult: (info: ToolResultInfo) =>void,  
      onReasoning: (info: ReasoningInfo) =>void,  
      onDone: () =>void,  
      onError: (error: string) =>void,  
      onAnomaly?: (info: AnomalyInfo) =>void,  
    ): Promise<void>  
    

发请求的部分是：
    
    
    const response = await fetch(`${API_BASE}/sessions/${sessionId}/chat`, {  
      method: 'POST',  
      headers: { 'Content-Type': 'application/json' },  
      body: JSON.stringify({ message, agent_id: agentId }),  
    })  
    

如果 HTTP 状态码不是 2xx，就按普通错误处理：
    
    
    if (!response.ok) {  
      const err = await response.json().catch(() => ({ detail: response.statusText }))  
      onError(err.detail || '请求失败')  
      return  
    }  
    

如果请求成功，重点就来了：
    
    
    const reader = response.body?.getReader()  
    const decoder = new TextDecoder()  
    let buffer = ''  
    

`reader.read()` 每次读到的是一段 `Uint8Array`二进制的字节。这段字节不一定就刚好是一个完整的SSE事件，也不一定刚好就是一个完整字符。

所以代码用 `TextDecoder` 做流式解码：
    
    
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')  
    

这里有两个细节。

第一，`{ stream: true }` 是为了处理中文这类多字节字符。网络 chunk 可能从一个汉字中间切开，流式 decoder 能把不完整字节留到下一次再拼。

第二，`.replace(/\r\n/g, '\n')` 是把 Windows 风格换行统一成 `\n`。后面按 `\n\n` 拆事件时，换行格式需要保持稳定。

## chunk 不是事件，buffer 才是关键

流式解析中的常见 bug，往往源于一个错误假设：认为单次 reader.read() 调用总能返回一个完整的事件。实际上，网络数据以不定长的 chunk 传输，事件边界可能与 chunk 边界不对齐，因此必须处理跨 chunk 拼接。
    
    
    第 1 次 read:  
    data: __tool_start__:{"tool_call_id":"call_1","na  
      
    第 2 次 read:  
    me":"read_file","args":{"path":"a.txt"}}  
    

也可能一次读到多个事件：
    
    
    data: hello  
      
    data: world  
      
    data: __done__  
    

所以 `api/chat.ts` 里一直维护一个 `buffer`：
    
    
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')  
    const blocks = buffer.split('\n\n')  
    buffer = blocks.pop() || ''  
    

这段逻辑的意思是：

  * 新读到的文本先追加到 `buffer`

  * 用空行 `\n\n` 切出一批 block

  * 最后一个 block 可能是不完整的，先放回 `buffer`

  * 只处理前面那些已经完整的 block

循环结束以后，如果 `buffer` 里还有内容，再处理一次：
    
    
    if (buffer.trim()) {  
      if (processEventBlock(buffer)) return  
    }  
    

## 一个 SSE block 怎么变成事件

拿到完整 block 后，前端先取出所有 `data:` 行：
    
    
    const dataLines = block  
      .split('\n')  
      .filter((line) => line.startsWith('data:'))  
      .map((line) => (line.startsWith('data: ') ? line.slice(6) : line.slice(5)))  
    

这里不是只取第一行，而是把所有 `data:` 行拼起来：
    
    
    const data = dataLines.join('\n')  
    

SSE 允许一个事件里有多行 `data:`。后端发普通文本时，也会按行拆：
    
    
    def _sse_data(payload: str) -> str:  
        return "".join(f"data: {line}\n" for line in payload.split("\n")) + "\n"  
    

所以前端必须把多行重新 join 回来。

拿到 `data` 以后，前端按约定前缀分发处理。
    
    
    if (data === '__done__') {  
      onDone()  
    returntrue  
    }  
    if (data.startsWith('__error__:')) {  
      onError(data.slice('__error__:'.length))  
    returntrue  
    }  
    if (data.startsWith('__tool_start__:')) {  
      onToolStart(JSON.parse(data.slice('__tool_start__:'.length)))  
    returnfalse  
    }  
    

当前前端显式处理的协议可以整理成这张表：

SSE data 内容| 前端回调| 页面含义  
---|---|---  
普通文本| `onToken(token)`| assistant 正文继续追加  
`__reasoning__:{...}`| `onReasoning(info)`| reasoning 片段继续追加  
`__tool_start__:{...}`| `onToolStart(info)`| 出现一个 pending 的工具调用  
`__tool_result__:{...}`| `onToolResult(info)`| 工具调用结束，显示输出和错误状态  
`__anomaly__:{...}`| `onAnomaly(info)`| 异常检测事件，当前聊天 store 还没有展示  
`__error__:...`| `onError(message)`| 本次请求失败  
`__done__`| `onDone()`| 本次流结束  
  
SSE 这一层没有用浏览器的 `event:` 字段，而是把事件类型编码在 `data` 前缀里。

比如：
    
    
    data: __tool_result__:{"tool_call_id":"call_1","name":"read_file","output":"...","is_error":false}  
    

这种实现简单。后端只需要 yield 字符串，前端也只需要看前缀。

如果以后要扩展更多事件，比如 evaluation、trace 标记、任务状态，也可以继续加一个前缀分支：
    
    
    if (data.startsWith('__evaluation__:')) {  
      onEvaluation(JSON.parse(data.slice('__evaluation__:'.length)))  
      return false  
    }  
    

关键是要在普通 `onToken(data)` 之前处理，否则未知前缀会被当成 assistant 正文显示。

## Store 把事件流变成页面状态

`api/chat.ts` 解析完流以后，并不直接改 DOM。

真正管理聊天状态的是 `frontend/src/stores/chat.ts`。

它维护几类核心状态：
    
    
    sessions              # 会话列表  
    currentSessionId      # 当前会话  
    sending               # 当前是否正在发送并等待流  
    historicalEvents      # 后端已经落盘的历史事件  
    liveEvents            # 本次请求正在产生的临时事件  
    currentTimelineEvents # 页面最终渲染的数据源  
    

其中最值得看的是 `currentTimelineEvents`：
    
    
    const currentTimelineEvents = computed<RenderableConversationEvent[]>(() => {  
      const fallbackEvents = createFallbackEvents(currentSession.value?.messages ?? [])  
      const baseEvents = historicalEvents.value.length > 0 ? historicalEvents.value : fallbackEvents  
      return [...baseEvents, ...liveEvents.value]  
    })  
    

这里分成两段：

第一段是已经存在的历史。优先用后端事件历史 `historicalEvents`，如果没有历史事件，就用 session 里的 messages 生成一个 fallback。

第二段是正在发生的事件，也就是 `liveEvents`。

这样页面可以同时显示：

  * 已经落盘的旧会话

  * 当前这一次请求还没结束的 token、工具调用和工具结果

## 发送消息时发生了什么

用户在聊天页点发送以后，会进入 `chatStore.sendMessage(message, agentId)`。

第一步先追加用户消息，这里不等后端返回，先把用户刚输入的内容放到页面上。否则用户点了发送以后，页面会显得没反应。

然后进入流式阶段：
    
    
    sending.value = true  
    liveEvents.value = []  
    

本次回复的所有临时事件都会放进 `liveEvents`。

store 里有一个小工具函数 `buildLiveEvent`：
    
    
    const event: RenderableConversationEvent = {  
      id: `live-${targetSessionId}-${++liveEventCounter}`,  
      type,  
      role,  
      timestamp: new Date().toISOString(),  
      data,  
      live: true,  
      pending: options.pending,  
      tool_call_id: options.toolCallId,  
      reasoning: options.reasoning,  
    }  
    

它把 token、reasoning、tool call、tool result 都统一建模成 `RenderableConversationEvent`。

这点很重要：Agent 聊天页面展示的不是单纯的文本流，而是一次任务执行过程。前端真正维护的，也不是一个大字符串，而是一条由用户消息、模型输出、工具调用、工具结果组成的事件时间线。
    
    
    user_message  
    assistant_text  
    tool_call  
    tool_result  
    assistant_text  
    done  
    

有了这条事件时间线，页面就不只是显示一段正在变长的回答，而是能把一次 Agent 执行过程完整展开：用户问了什么、模型说了什么、中间调用了哪个工具、工具返回了什么结果。