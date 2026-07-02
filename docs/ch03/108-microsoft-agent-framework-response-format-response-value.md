# Microsoft Agent Framework 结构化输出：response_format 与 response.value

## Ch03.108 Microsoft Agent Framework 结构化输出：response_format 与 response.value

> 📊 Level ⭐⭐ | 5.8KB | `entities/microsoft-agent-framework-structured-output.md`

## 核心问题
传统方案：提示词要求"只输出 JSON" + `json.loads()` → 易夹杂 markdown、缺字段、类型漂移。Agent Framework 的解法：Schema 由 API 约束，框架负责解析 。

## 两种声明方式

### 方式一：Pydantic 类
```python
from pydantic import BaseModel

class PersonInfo(BaseModel):
    """Information about a person."""
    name: str | None = None
    age: int | None = None
    occupation: str | None = None
```
字段类型与 `required` 语义映射为 JSON Schema 发给模型；模型被约束在 Schema 内生成，降低幻觉字段与格式错误 。 See also [Agent Harness Architecture](ch03/044-agent.md)

### 方式二：JSON Schema dict
```python
person_info_schema = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "age": {"type": "integer"},
        "occupation": {"type": "string"},
    },
    "required": ["name", "age", "occupation"],
}
```
适合动态 Schema、配置中心下发场景 。

## response.value vs response.text
| 属性 | 含义 |
|------|------|
| `response.text` | 原始文本聚合 |
| `response.value` | 解析后的结构化对象（Pydantic 实例或 dict） |

业务代码应优先使用 `response.value` 做类型安全访问；`text` 可用于日志或降级展示 。

## 配置时机
- **单次运行**：`agent.run(..., options={"response_format": PersonInfo})`
- **默认 Schema**：构造 Agent 时 `default_options={"response_format": PersonInfo}`，单次 `options` 可覆盖

## 流式 + 结构化
```python
stream = agent.run(query, stream=True, options={"response_format": PersonInfo})
async for update in stream:
    print(update.text, end="", flush=True)

final_response = await stream.get_final_response()
if final_response.value:
    person_info = final_response.value
```
`get_final_response()` 会自动消费完整流再解析；流式过程中 `update.text` 可能是 JSON 片段（打字机效果可展示），业务落库必须以 `final_response.value` 为准 。

## 能力边界
**重要**：结构化输出依赖底层 Chat Client 是否支持 JSON Schema / Structured Outputs。标准 Agent + 兼容客户端（Azure OpenAI Chat Completion、OpenAI Responses 等）可用；部分远程代理或旧协议 Agent **可能不支持**。选型时先确认 Provider 文档 。

## 生产注意点
1. **兼容性**：换 Provider 时重新验证 `response_format` 是否支持
2. **Schema 设计**：字段过多、嵌套过深会增加失败率；必填项用 `required` 明确声明
3. **工具调用共存**：Agent 若同时启用 tools，需确认"先调工具再结构化"或"仅结构化"的产品逻辑
4. **不支持场景**：需额外 LLM 把文本转成 JSON（二次调用、可靠性下降），仅作兜底

## Pydantic vs JSON Schema 怎么选
| 方式 | response.value 类型 | 适用 |
|------|---------------------|------|
| Pydantic 类 | 模型实例 | 固定领域模型、强类型代码库 |
| dict Schema | 解析后的 JSON | 动态 Schema、配置驱动 |

## 深度分析
### 结构化输出是 Agent 进入业务系统的门槛
Agent Framework 的 structured output 本质上是把 LLM 的自由文本输出**契约化**——让 Agent 的输出可直接进入业务系统（数据库写入、API 响应、流程触发），而不需要人工解析层。这是从"对话助手"到"自动化执行器"的关键一步 。

### response.value 的工程意义
`response.value` 不仅仅是一个解析结果，它代表了一种**类型安全的 Agent 调用契约**。使用 Pydantic 时，调用方可以获得 IDE 自动补全、类型检查、运行时验证——这在生产环境中是可靠性保障 。

## 实践启示
**1. 优先使用 response.value 而非 text。** 即使当前业务只需要文本展示，也为未来结构化需求留出空间——只需改 Schema 而不需要改调用代码。

**2. Schema 设计遵循最小必要原则。** 字段过多会降低模型填充准确率，必填项明确声明，可选字段提供合理的 `None` 默认值。

**3. 流式场景必须调用 get_final_response()。** 流式过程中的 `update.text` 是中间状态，不可靠；只有 `final_response.value` 才是可信的结构化结果。

**4. 换 Provider 前验证 structured output 支持。** 这是跨云/跨厂商迁移时的隐性风险点，需要在架构选型阶段纳入评估。
## 相关实体

- [announcing genkit middleware](ch04/007-announcing-genkit-middleware-intercept-extend-and-harden.md)

---

