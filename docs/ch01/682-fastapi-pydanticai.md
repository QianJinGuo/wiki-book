# FastAPI 之父的 PydanticAI 是真的夯！

## Ch01.682 FastAPI 之父的 PydanticAI 是真的夯！

> 📊 Level ⭐⭐ | 6.4KB | `entities/fastapi-之父的-pydanticai-是真的夯.md`

# FastAPI 之父的 PydanticAI 是真的夯！

**来源**: 数据STUDIO

**发布日期**: 2026-06-29

**原文链接**: https://mp.weixin.qq.com/s/SEUcHHLx1mL1oNI--5IiRQ

---

## 摘要

PydanticAI 是 FastAPI 创始人 Samuel Colvin 打造的 Agent 框架，核心思想是将类型系统引入 Agent 输出校验。不同于传统方法用 prompt 引导模型输出结构化数据，PydanticAI 通过声明输出类型（Pydantic model）让框架自动校验并强制重试，从根本上解决 LLM 输出字段漂移和类型不稳定的问题。该框架基于三节点有向图（UserPromptNode → ModelRequestNode → CallToolsNode）执行，支持 25+ LLM provider，并提供 UsageLimits 硬截断保护。对于需要可靠结构化输出的单 Agent 场景，PydanticAI 是目前最务实的选择。

## 核心要点

- **输出合约取代 prompt 引导**：通过 `result_type=MyModel` 声明输出形状，Pydantic 自动校验，不通过则 `ModelRetry` 让模型重来，无需手写 try/except 解析逻辑
- **类型参数泛型设计**：`Agent[DepsT, OutputT]` 双类型参数，DepsT 实现依赖注入（类似 FastAPI Depends），OutputT 定义输出合约
- **三节点执行图**：UserPromptNode（拼装 system prompt + schema + tools）→ ModelRequestNode（调用 25+ provider 的 native structured output API）→ CallToolsNode（Pydantic 校验 + tool 执行 + ModelRetry 循环）
- **25+ provider 统一抽象**：切换模型只需改一行字符串（openai:gpt-4o → anthropic:claude-sonnet-4-6），类型合约与模型选择完全解耦
- **UsageLimits 硬保护**：`request_limit` 和 `total_tokens` 双重截断，防止重试循环失控
- **不适合多 Agent 协作**：与 CrewAI 相比缺少角色系统，多 Agent 需通过 `agent_as_tool` 手动串联

## 深度分析

### 类型合约：从"建议"到"执行"的范式转变

传统 Agent 框架处理输出不可靠的方式是不断优化 prompt——加示例、加格式要求、加"please output valid JSON"。但 prompt 本质是在调概率分布，无法 guarantee 字段名和类型。PydanticAI 的关键洞察是：**应该用类型系统做执行时合约，而不是用自然语言做建议**。这一思路直接继承自 FastAPI——用 Python type hints 声明 API 参数，自动生成 OpenAPI schema，请求进来就校验格式。PydanticAI 把同一哲学搬到 Agent 输出侧：声明 `result_type=CodeReviewResult`，框架在模型返回后校验它是不是 `CodeReviewResult`——不是就 `ModelRetry`，无需手写校验逻辑。

### ModelRetry 作为控制流信号

PydanticAI 最优雅的设计之一是 `ModelRetry` 不是异常，而是控制流信号。当校验失败时，框架自动将失败信息作为 `RetryPromptPart` 注入："你上次返回的 confidence 字段是 string，但期望的类型是 float。请修正。"然后回到模型调用节点重新生成。默认重试 1 次，最多可配 5 次。这相当于工厂流水线上的在线质检——不是出货后抽检，而是每一件都过质检传送带，不合格当场退回重做。

### provider 抽象的层次与取舍

PydanticAI 的 ModelRequestNode 封装了 25+ provider，优先使用各 provider 的 native structured output API（如 OpenAI 的 `response_format`、Anthropic 的 `tool_use`），只有 provider 不支持时才退化到 prompted JSON parsing。这意味着切换模型不会降低输出可靠性——合约跟模型解耦。这与 LangChain 的"链"哲学（灵活但类型安全靠自己）和 CrewAI 的"团队"哲学（角色协作强但输出约束弱）形成鲜明对比。

### 与 CrewAI/LangGraph 的边界对照

PydanticAI 不适合多 Agent 协作场景——这是它与 CrewAI 最大的差距。CrewAI 的角色系统虽然灵活，但 token 开销也大：每个 Agent 的 role/goal/backstory 每次都发过去，社区 benchmark 显示比 PydanticAI 多消耗 15-20% token。PydanticAI + LangGraph 的组合（PydanticAI Agent 作为 LangGraph 的 node）在社区被认为是当前最灵活的生产方案。

### 工程启示：精确约束最小集

PydanticAI 的实践揭示了类型约束 Agent 输出时的关键原则：**核心字段用精确类型（枚举/float/int），辅助字段用 str 容错**。类型系统的优势是精确约束最小集——不是把偏好都写成 rule。一个常见反例是给 summary 字段加过多 regex 约束（如要求含数字、英文术语、动词），导致 LLM 注意力分散，内容质量反而下降。

## 实践启示

1. **优先锁定输出类型**：任何 Agent 接入下游系统（数据库/API/前端）的场景都应使用输出类型约束，PydanticAI 能省掉一整层胶水代码

2. **与依赖注入配合使用**：通过 `deps_type` 注入数据库连接、API 客户端等外部依赖，可写出可测试、可 mock 的 Agent 逻辑

3. **UsageLimits 永远设上限**：tool-calling agent 在重试时可能多跑好几轮，设 `request_limit=10, total_tokens=30000` 做硬截断，跑通了再调高

4. **单 Agent 用 PydanticAI，多 Agent 用组合方案**：一个 Agent 一件事的场景 PydanticAI 最优；需要多角色协作时考虑 PydanticAI + LangGraph 组合

5. **关注 Monty VM 和 PydanticAI v2**：Monty（Python-in-Rust VM）冷启动 6 微秒，v2.0 正在 beta 阶段（2026-06 beta 7），方向是深度的 multi-agent 支持和 durable execution，迁移成本很低

## 相关实体

- **LangGraph vs CrewAI vs PydanticAI 框架对比**
- **FastAPI 架构哲学**
- **Pydantic 深度解析**
- **Agent 输出校验模式**
- **类型安全的 Agent 开发**

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/fastapi-之父的-pydanticai-是真的夯.md)

---

