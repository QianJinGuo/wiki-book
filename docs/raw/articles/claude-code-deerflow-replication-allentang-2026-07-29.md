---
source_url: "https://mp.weixin.qq.com/s/APBfdOzDTFXVGtMj8MSvZw"
ingested: 2026-07-29
sha256: b10f325e4d2c8d7b1d7d4d2f0a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2
---

# 万字长文拆解 Agent 架构设计（七）：用 Deerflow 复刻 Claude Code

> AllenTang / 架构师带你玩转AI，2026-07-29
> 本系列目标：拆解 Claude Code 源码，理解 Agent 底层架构的设计思路。

## Part 1：拆解 DeerFlow 2.0

### 骨架：同一个循环，打包成了底座

DeerFlow 整体分两层：Harness 是运行时底座（也是 Python SDK），Lead Agent、中间件链、五大能力都在这一层；DeerFlow App 是建在底座之上的参考应用。

Lead Agent 执行流程：收到消息 → 中间件前处理（记忆注入、历史压缩等） → 模型推理（直接回答，或发起工具调用） → 工具执行（沙箱工具 / 外部工具 / task 工具派子 Agent） → 中间件后处理（生成标题等） → 循环，或输出最终响应。

Lead Agent 不硬编码任何特定工作流，靠模型推理适应任意任务——涌现式编排。

### 中间件链：行为是可插拔的零件

每条设计原则：行为由中间件链组合。每一轮模型调用都穿过这条链，每个中间件只管一件事。顺序：压缩排最前（先给上下文减负，后面所有处理都受益），澄清排最后（所有中间件处理完再决定要不要问人）。

### 五大能力：收敛到了名字层面

1. **子 Agent** — Lead Agent 通过 task 工具派发子 Agent（工具名和 Claude Code 一模一样）。内置两个子 Agent（general-purpose 和 bash），支持自定义 Agent 作为子 Agent。
2. **技能** — 技能按需加载，基座保持通用。平时只暴露一行简介，判断用得上时才取完整内容。
3. **记忆** — MemoryMiddleware 会话开始时注入持久记忆，会话结束后后台把新信息沉淀进记忆库。
4. **工具与 MCP** — 沙箱工具、社区工具、MCP 工具、技能自带的工具，统一注册进循环。MCP 是一等公民。
5. **沙箱** — 代码执行的隔离环境，支持路径映射和自定义挂载。

### 长时任务：循环长在状态图上

DeerFlow 的循环跑在 LangGraph 状态图之上，编译时挂 checkpointer：看得见（执行到哪是图上点亮的节点）、停得下（任意节点可设中断）、续得上（每步存档，进程崩了、人隔天回来都从断点继续）、分得出（子任务并行派发，全部完成再汇总）。

## Part 2：对照看设计——收敛到哪里，分叉在哪里

### 决策一：连 DeerFlow 都收敛到了涌现式循环

DeerFlow 1.0 不是循环，是一条固定流水线：Coordinator → Planner → 人审 → Researcher/Coder 并行 → Reporter 汇总。2.0 做通用底座时拆掉了这条流水线，换成 Lead Agent 的循环——不硬编码工作流，模型临场决定调什么工具、派不派子 Agent。

### 决策二：长时任务逼出来的三大基础设施

1. **循环长在状态图上** — 状态图 + checkpoint 把执行变成可随时存档的进度
2. **LoopDetectionMiddleware** — 模型可能陷进死循环，由中间件自动检测、注入警告、强制跳出
3. **ClarificationMiddleware** — 模型拿不准时正式询问用户，从"随时打断"变成"被正式询问"

三件事指向同一条：任务时长一旦超过人的耐心，工程设施就必须接替人做看门人——看门状态（checkpoint）、看门循环（loop detection）、看门沟通（clarification）。

## Part 3：用 DeerFlow 复刻

### SDK 组装自己的底座

```python
agent = create_agent(
    model=make_model(),
    tools=[
        sandbox_tools(),
        mcp_tools(),
        task_tool(subagents=[general_purpose, bash, custom_agents]),
    ],
    system_prompt=BASE_PROMPT,
    middleware=[
        SummarizationMiddleware(...),
        MemoryMiddleware(...),
        SubagentLimitMiddleware(max=3),
        LoopDetectionMiddleware(),
        ClarificationMiddleware(),
    ],
)
```

### 往底座上加能力

底座搭好之后，扩展全是配置和数据，不碰代码：
- **加技能** — 一个文件夹加一个 SKILL.md 文件，含安全扫描
- **加自定义 Agent** — Agent 配置自动进入 task 工具可选名单
- **接外部系统** — 配置 MCP 服务器，统一注册表
