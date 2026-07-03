# LangGraph 底层原理：它是怎么把 LLM 变成一台状态机的

## Ch01.309 LangGraph 底层原理：它是怎么把 LLM 变成一台状态机的

> 📊 Level ⭐⭐ | 19.9KB | `entities/langgraph-state-machine-under-the-hood.md`

[Langgraph State Machine Under The Hood](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/langgraph-state-machine-under-the-hood.md)

## 01 LangChain 的老问题
LangChain 早期架构是**线性 Chain**：
```
用户输入 → PromptTemplate → LLM → OutputParser → 输出
```
致命弱点：控制流是固定的。一旦需要「如果 LLM 觉得需要查数据库就查，不需要就跳过」，Chain 根本放不下这些逻辑。
**现实中的 Agent 场景根本不是线性的：**

- 调工具 → 看结果 → 决定调下一个还是直接回答
- 生成草稿 → 自我审查 → 不行就重写
- 多轮对话 → 根据意图走不同分支
这些都需要**带状态的循环控制流**——这正是 LangGraph 解决的核心问题。

## 02 状态机是什么
**状态机（State Machine）三要素：**
| 要素 | 含义 |
|------|------|
| **State** | 当前的数据快照（系统处于什么情况） |
| **Node** | 执行动作，并更新 State |
| **Edge** | 决定下一步去哪个 Node |
**LangGraph 把这套机制套在 LLM 上：**

- State = 对话历史 + 工具结果 + 中间变量
- Node = LLM 调用 / 工具执行 / 业务逻辑
- Edge = 普通跳转 / 条件分支（Conditional Edge）

## 03 StateGraph 执行引擎：心脏长什么样
打开 LangGraph 源码（Python: `langgraph/graph/state.py`，JS 同理），StateGraph 维护了核心数据结构：
```
┌──────────────────────────────────────────────────┐
│                  StateGraph 内部                  │
├─────────────────┬────────────────────────────────┤
│ nodes           │ Map<名称, 函数>                 │
│ edges           │ Map<from, to[]>                │
│ conditional_    │ Map<from, (state)=>节点名>     │
│ edges           │                                │
│ channels/       │ 每个状态字段的 Reducer          │
│ schema          │                                │
└─────────────────┴────────────────────────────────┘
```
**compile() 阶段做了什么：**
```
compile() 阶段
     │
     ├─ 验证图结构（有没有孤立节点？有没有到 END 的路径？）
     ├─ 构建邻接表（预计算每个节点的后继）
     ├─ 初始化 Channels（每个状态字段注册 Reducer）
     └─ 返回 CompiledGraph（可以 invoke/stream）
```
`compile()` 本质上是把「描述的图」变成「可执行的调度器」。

## 04 一次完整执行：从 invoke 到节点运行的全流程
**TypeScript 示例：**
```typescript
import { StateGraph, START, END } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
// 1. 定义状态结构
const AgentState = Annotation.Root({
  messages: Annotation<HumanMessage[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
});
// 2. 初始化 LLM
const llm = new ChatOpenAI({ model: "gpt-4o-mini" });
// 3. 定义节点函数
async function callLLM(state: typeof AgentState.State) {
  const response = await llm.invoke(state.messages);
  return { messages: [response] };
}
// 4. 构建图
const graph = new StateGraph(AgentState)
  .addNode("llm", callLLM)
  .addEdge(START, "llm")
  .addEdge("llm", END)
  .compile();
// 5. 运行
const result = await graph.invoke({
  messages: [new HumanMessage("你好，介绍一下自己")],
});
```
**执行流程逐步拆解：**
```
graph.invoke({ messages: [...] })
         │
         ▼
   1. 初始化 State
      messages = [HumanMessage("你好...")]
         │
         ▼
   2. 调度器从 START 出发
      → 找到边：START → "llm"
         │
         ▼
   3. 执行节点 "llm"
      callLLM(state) 被调用
      → llm.invoke(messages)
      → 返回 { messages: [AIMessage("我是...")] }
         │
         ▼
   4. 合并状态（Reducer）
      新 messages = [...旧, AIMessage("我是...")]
         │
         ▼
   5. 调度器检查下一步
      → "llm" 的边指向 END
      → 执行结束
         │
         ▼
   6. 返回最终 State
```
调度器是一个事件循环，每次处理一个节点：执行 → Reducer合并 → 查询出边 → 决定下一个节点。

## 05 Reducer：状态更新的核心机制
**核心概念：节点函数返回的不是「新 State」，而是「State 的更新片段」。**
```typescript
// 三种常见 Reducer 写法
// 方式1：追加消息（messagesStateReducer）
const State1 = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (prev, next) => [...prev, ...next],
  }),
});
// 方式2：覆盖（最新值覆盖旧值）
const State2 = Annotation.Root({
  step: Annotation<number>({
    reducer: (_, next) => next, // 直接替换
  }),
});
// 方式3：累加计数
const State3 = Annotation.Root({
  callCount: Annotation<number>({
    reducer: (prev, next) => prev + next,
    default: () => 0,
  }),
});
```
**Reducer 执行时机：**
```
节点返回 { key: value }
         │
         ▼
  对每个 key，找到对应 Reducer
  newState[key] = reducer(oldState[key], value)
         │
         ▼
  生成新 State 快照
  （旧 State 不变，不可变数据结构）
```
**关键点：State 是不可变的。** 每次节点执行都产生一个新的 State 快照，旧快照被保留（这是 Checkpoint 能实现的基础）。

## 06 图的调度器：它怎么决定下一步去哪
**调度器本质是一个事件循环：**
```python
while 当前节点 != END:
    1. 执行当前节点 node(state) → partial_update
    2. 用 Reducer 合并状态 → new_state
    3. 查询当前节点的出边

       - 普通边：直接去下一个节点
       - 条件边：调用路由函数 router(new_state) → 返回节点名
    4. 把下一个节点加入执行队列
    5. 取队列头 → 重复
```
**条件边（Conditional Edge）示例：**
```typescript
// 路由函数：根据 state 返回下一个节点名
function routeAfterLLM(state: typeof AgentState.State): string {
  const lastMessage = state.messages[state.messages.length - 1];
  // 如果 LLM 想调工具
  if ("tool_calls" in lastMessage && lastMessage.tool_calls?.length) {
    return "tools"; // → 去工具节点
  }
  return END; // → 直接结束
}
const graph = new StateGraph(AgentState)
  .addNode("llm", callLLM)
  .addNode("tools", callTools)
  .addEdge(START, "llm")
  .addConditionalEdges("llm", routeAfterLLM, {
    tools: "tools",
    [END]: END,
  })
  .addEdge("tools", "llm") // 工具执行完回到 LLM
  .compile();
```
**这就是 ReAct Agent 的本质：一个带条件边的循环图。**

## 07 并行执行：Fan-out / Fan-in 模式
```typescript
// Fan-out：一个节点触发多个并行节点
const parallelGraph = new StateGraph(AgentState)
  .addNode("start", startNode)
  .addNode("search_web", searchWeb)   // 并行
  .addNode("search_db", searchDB)      // 并行
  .addNode("merge", mergeResults)      // 合并
  .addEdge(START, "start")
  .addEdge("start", "search_web")    // 同时出发
  .addEdge("start", "search_db")      // 同时出发
  .addEdge("search_web", "merge")    // 都完成后汇聚
  .addEdge("search_db", "merge")
  .addEdge("merge", END)
  .compile();
```
**调度器处理并行：**
```
start 节点执行完毕
         │
         ├──→ search_web（加入执行队列）
         └──→ search_db（加入执行队列）
执行队列：[search_web, search_db]
同时调度（异步并发执行）
两者都完成后：
merge 节点的所有前驱都就绪 → merge 入队
         │
         ▼
        merge 执行 → END
```
Fan-out/Fan-in 是**并行搜索、多 Agent 协作的基础**。

## 08 编译产物：CompiledGraph 里藏了什么
```typescript
interface CompiledGraph {
  // 同步执行，返回最终 State
  invoke(input: State, config?: RunnableConfig): Promise<State>;
  // 流式执行，每个节点完成后 yield 一次
  stream(
    input: State,
    config?: RunnableConfig
  ): AsyncGenerator<Record<string, State>>;
  // 可视化图结构（调试用）
  getGraph(): DrawableGraph;
  // 获取当前状态（需要 Checkpointer）
  getState(config: RunnableConfig): Promise<StateSnapshot>;
}
```
**stream() 的输出格式：**
```typescript
for await (const chunk of graph.stream(input)) {
  // chunk: { 节点名: 该节点产生的状态更新 }
  // 例如：
  // { llm: { messages: [AIMessage(...)] } }
  // { tools: { messages: [ToolMessage(...)] } }
  console.log(chunk);
}
```
这就是为什么前端能实现**「打字机效果」**——每个节点完成，前端就能收到一次更新。

## 总结
LangGraph 把 LLM 变成状态机的核心机制：
1. **StateGraph 三要素**：State 存数据、Node 执行动作、Edge 决定走向，缺一不可
2. **Reducer 是关键**：节点返回的是「更新片段」而非「完整新状态」，Reducer 负责合并，State 始终不可变
3. **调度器是心脏**：本质是一个事件循环，条件边让它能根据运行时状态动态决策
4. **compile() 的意义**：把声明式的图描述变成可执行的调度引擎，做结构验证和邻接表预计算
5. **并行靠 Fan-out**：多条出边同时触发，Fan-in 等待所有前驱完成，调度器自动处理同步
6. **stream() 是流式基础**：每个节点完成即 yield，这是打字机效果和实时反馈的技术支撑
---

## 深度分析
**1. 状态机模型是 Agent 控制在工程上可行的唯一路径**
LangGraph 之前，业界尝试用 Prompt Engineering 让 LLM 自己决定下一步做什么——这叫「Huggable Agent」路线，效果极不稳定。引入状态机后，控制流从 LLM 的「模糊判断」转移到图的「精确路由」：LLM 只负责产生动作（节点），图负责决定什么时候做什么（边）。这种分离让 Agent 从「靠感觉行动」变成「按计划行动」。本质上是把 LLM 当作一个函数——给定输入产生输出，而流程编排交给确定性代码。
**2. Reducer 模式是实现无限上下文记忆的基石**
传统函数式编程中，函数返回完整新状态。在 LangGraph 中，节点只返回「增量」——`{ messages: [newMsg] }` 而非整个对话历史。Reducer 负责合并：`(oldMessages, newMessages) => [...oldMessages, ...newMessages]`。这个设计的深层含义：State 永远不可变，每次都是新快照。这意味着：

- Checkpointing 成为可能：任意时刻可以恢复旧快照
- 并行执行成为可能：多个节点可以同时修改不同字段而不冲突
- 调试成为可能：每一步状态变化都被记录
这是工程上的「不可变性」，不是函数式的教条。
**3. 条件边是 ReAct 模式的本质实现**
业界常把 ReAct（Reasoning + Acting）当作一种 Prompt 技巧——让 LLM 在回答时说出思考过程并调用工具。但从 LangGraph 视角看，ReAct 的本质是一个**带条件边的循环图**：LLM 节点执行后，条件边检查是否有 `tool_calls`，有就去工具节点，没有就结束。这个结构说明：ReAct 不是技巧，是架构模式。Prompt 只能引导 LLM「愿意」调工具，图才能保证「正确」调工具并回收结果。
**4. compile() 的结构验证将运行时错误提前到部署时**
大多数图运行框架允许你描述一个荒谬的图——孤立节点、死循环、无穷递归——然后在运行时崩溃。LangGraph 在 `compile()` 阶段做三件事：孤立节点检测（有没有节点从不被任何边连接？）、可达性验证（每个节点是否都有到达 END 的路径？）、邻接表预计算（为每个节点预计算后继列表，避免每次查询边的动态开销）。这相当于编译器的「类型检查」阶段，把图结构的合法性验证提前到部署时而非运行时。
**5. Fan-out/Fan-in 是多 Agent 协作的底层调度模式**
当一个「协调者」节点需要同时查询多个「工作者」时，Fan-out 把协调者的一个出边变成多条边，同时触发多个节点执行。调度器内部维护一个队列，并行执行这些节点。Fan-in 等待所有前驱节点完成后才触发合并节点。这种模式在工程上的意义：天然支持「一个提问，并行检索多个数据源，汇总回答」的场景，比如同时查询网页、数据库、API。
---

## 实践启示
**1. 在定义 State 时，优先使用 Annotation.Root 而非简单对象**
新手常写 `state: { messages: [], ... }`，但正确方式是 `Annotation.Root({ messages: Annotation<HumanMessage[]>({ reducer: ... }) })`。Annotation 提供了类型安全和 Reducer 绑定。TypeScript 类型会精确到 `state.messages[0].tool_calls`，而非宽泛的 `any`。这在调试时能通过 IDE 自动补准确定位字段，在重构时能通过 TypeScript 报错发现遗漏的字段更新。
**2. 条件边的路由函数必须是无副作用的纯函数**
路由函数 `routeAfterLLM(state)` 只根据 state 返回节点名，不应该修改 state，不应该发起 API 调用，不应该有副作用。这是因为调度器可能在同一个 state 上调用多次路由（重试、超时恢复等场景）。如果路由函数有副作用，会导致不可预测的状态污染。正确做法：路由函数只做状态读取和 if/switch 逻辑，所有外部交互都在节点函数里。
**3. 对于需要维护「步骤计数」或「循环上限」的场景，用 Reducer 而非全局变量**
常见错误：在图外部维护 `let callCount = 0` 然后在节点里自增。这在单次调用没问题，但在 `stream()` 并行或 `batch()` 多次调用时会相互覆盖。正确做法：在 State 里定义 `callCount: Annotation<number>({ reducer: (prev, next) => prev + next, default: () => 0 })`，每次节点执行返回 `{ callCount: 1 }`，Reducer 自动累加。这样每个 State 快照都精确记录了当时的调用次数，支持精确的循环上限控制。
**4. stream() 的 chunk 不是每 token，是每节点完成**
很多开发者期望 stream() 像 LLM 的 token stream 一样细粒度，但实际上是节点级别的批量更新。如果需要真正的细粒度流式输出（如打字机效果），应该用 `graph.stream()` 返回的 `AsyncGenerator` 并配合前端的 WebSocket 或 SSE 推送。在后端，每个 chunk 是 `{ "llm": { "messages": [...] } }`——节点名到状态更新的映射。你可以基于这个实现「节点 A 完成时显示加载动画，节点 B 完成时更新 UI」的细粒度控制。
**5. 多 Agent 协作时，用 Fan-out 而非在一个节点里串行调用**
新手实现「同时查天气、查新闻、查股价」的做法是在一个 LLM 节点里 `await Promise.all([weather(), news(), stock()])`——这破坏了图的可见性：外部无法观测到有三个子任务在执行，也不知道哪个先完成。正确做法：用 Fan-out 图结构，三个节点并行执行，一个 merge 节点汇总结果。这样 `stream()` 输出里每个 chunk 都能看到具体是哪个子节点完成了，前端可以精确渲染每个数据源的加载状态。
## 相关实体
- [Gepa Optimize Anything](ch01/313-gepa-optimize-anything.md)
- [Ai Phishing Attacks Are On The Rise Are You Prepared Bitward](https://github.com/QianJinGuo/wiki/blob/main/entities/AI-phishing-attacks-are-on-the-rise-Are-you-prepared-Bitward.md)
- [How Open Model Ecosystems Compound](ch01/677-how-open-model-ecosystems-compound.md)
- [读完这篇你就搞懂 Deepseek V4 了 V2](ch01/777-deepseek.md)
- [Context Window Management Comparison](https://github.com/QianJinGuo/wiki/blob/main/entities/context-window-management-comparison.md)

- [Tomtunguz Ai Model Inflation](ch04/150-ai.md)
- [Hiclaw 发布 V110提供 Kubernetes 集群部署实现支持 Hermes Worker 运行时](ch01/206-0.md)
- [Llava Onevision 2 Full Frame Rate Vlm Glintlab](ch01/612-vlm.md)
- [We Let Four Ais Run Radio Stations Heres What Happened](ch04/150-ai.md)
- [Liangzi Recruitment](https://github.com/QianJinGuo/wiki/blob/main/entities/liangzi-Recruitment.md)
- [Lightfield Ai Pipeline Generation](ch04/150-ai.md)
- [Creativeboom Ai Views Changed](ch04/150-ai.md)
- [Netflix Is Building An Ai Animation Studio](ch11/206-netflix-is-building-an-ai-animation-studio.md)
- [Minicpm V 46 13B Xinazhiyuan](https://github.com/QianJinGuo/wiki/blob/main/entities/minicpm-v-46-13b-xinazhiyuan.md)
- [不改模型不降质量谷歌让Gemma 4快了3倍本地跑大模型彻底变天](https://github.com/QianJinGuo/wiki/blob/main/entities/不改模型不降质量谷歌让gemma-4快了3倍本地跑大模型彻底变天.md)
- [Model Half Life Aifoc](ch04/150-ai.md)
- [Ghostbyt3 Github Io Blog Nday Research Ai](ch04/150-ai.md)
- [Ai Friendly Architecture Design](ch04/150-ai.md)
- [Obsidian Llm Wiki Local Kytmanov 2026](ch01/890-llm.md)
- [Olmo Hybrid And Future Llm Architectures](ch01/420-olmo-hybrid-and-future-llm-architectures.md)
- [Ai Friendly Architecture Design Taobao](ch04/150-ai.md)
- [Spec As Aios Anti Entropy Architecture Gaode App Platform 2026](ch04/150-ai.md)

---

