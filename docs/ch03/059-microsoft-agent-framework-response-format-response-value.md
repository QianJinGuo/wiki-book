# Microsoft Agent Framework 结构化输出：response_format 与 response.value

> 📊 Level ⭐⭐⭐⭐⭐ | 9.3KB

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
字段类型与 `required` 语义映射为 JSON Schema 发给模型；模型被约束在 Schema 内生成，降低幻觉字段与格式错误 。 See also [Agent Harness Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture.md)

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

### 契约层：把"对话"抬进"事务边界"
对话输出给人看，含糊尚可容忍；一旦要写库、触发下游、作为 API 响应，含糊就是故障。structured output 的价值不在省掉 `json.loads()`，而在把输出从**叙述**提升为**契约**：Schema 由 API 约束、框架解析，调用方拿到可声明类型、可断言、可进事务的对象 。

它与 function calling 是方向相反的两条总线：工具 schema 描述"模型可请求外部做什么"，参数是出口请求、执行权在宿主；response_format 描述"模型必须交付什么形状"，字段是入口交付物、解释权在业务代码。同一套 JSON Schema，一个约束动作，一个约束返回值。二者共存时须先定死顺序，否则会产出"工具调了一半、字段全 None"的半成品。

### response.value：校验点、失败模式与重试
`response.value` 把类型检查前移到**解析边界**：Pydantic 在框架内做一次 `model_validate`，脏数据进不了业务代码，而不至于三个月后以 `KeyError` 出现在报表里。

但有校验不等于正确。**验证异常**（类型不符、enum 越界）最好办，异常自带字段路径，可回灌重试；**字段缺失**最阴险，`Optional[...] = None` 把"模型没说"静默成"模型说没有"，业务侧必须区分二者；**语义漂移**（结构对、值编造）Schema 管不了，只能靠规则校验或抽检；**静默截断**在长字段撞上 `max_tokens` 时仍可能凑成合法 JSON。

重试要**有界且带信息**：把 `ValidationError` 的字段级信息回灌下一轮，而非原样重跑（只会得到同一个错误）；仍失败则降级宽松 Schema 或转人工，不让脏数据穿过事务边界。

### 流式与结构化：一对天然冲突
流式要"尽早给反馈"，结构化要"整体合法才可用"，二者在时间轴上对立：JSON 前缀几乎从不是合法 JSON，`{"name": "Jo` 解析不出任何对象。故流式阶段的 `update.text` 只承担 UI 职责（打字机、进度感），不承担数据职责。

可行的部分校验只有**字段级嗅探**：对已知 key 增量匹配，某字段闭合后先展示或做轻量检查，对象级校验必须等流结束。`get_final_response()` 正是此语义——消费完整流再统一解析，`final_response.value` 才可落库 。 规则可压成一句：**流式给眼睛，final 给数据库**。若同时启用工具调用，增量还可能是 tool call 的 delta，此时任何结构假设都是错的。

### 能力边界：少而明确胜过全而可选
"部分 Provider 不支持"只是第一层，更贵的边界在 Schema 自身：字段数与嵌套深度和失败率正相关 。 不是模型笨，而是约束空间随字段线性、随嵌套组合增长；每多一个可选字段就多一次"填不填"的决策，而模型默认倾向**填满**——幻觉值比缺字段更常见。

代价细节：enum 约束强但要 token 承载候选，值多时收益递减；嵌套让局部错误污染整棵树，且多数 strict 模式要求每层 `required` + `additionalProperties: false`，等于把严格性复制 N 份；`$ref` 在部分实现里不被解析或需内联展开，跨 Provider 时最先坏。故准则不是"字段全而可选"而是"字段少而明确"：把可选字段拆成**独立第二次调用**，远比塞进 30 字段宽 Schema 可靠。

### 与 LangGraph / 自研 harness 的 state schema 同构
拉高一层看：LangGraph 的 `State`、自研 harness 的 run state，本质就是**给 Agent 的 response_format**，只不过收件人是宿主而非模型。节点返回值是一次局部结构化输出，图的边是对字段的断言，checkpoint 要求整份 state 可序列化。想通 response_format 的脾气，state 设计的争论会自动收敛：同样要少而明确，不能让 `Optional` 静默为 `None`，不能塞不可序列化对象。反之 state 里好用的字段结构通常可原样搬成 response_format。参见 [Agent Harness Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture.md)、[Microsoft Agent Framework Tools Overview Provider Matrix](https://github.com/QianJinGuo/wiki-public/blob/main/entities/microsoft-agent-framework-tools-overview-provider-matrix.md)。

## 实践启示
**1. 优先使用 response.value 而非 text。** 即使当前业务只需要文本展示，也为未来结构化需求留出空间——只需改 Schema 而不需要改调用代码。

**2. Schema 设计遵循最小必要原则。** 字段过多会降低模型填充准确率，必填项明确声明，可选字段提供合理的 `None` 默认值。

**3. 流式场景必须调用 get_final_response()。** 流式过程中的 `update.text` 是中间状态，不可靠；只有 `final_response.value` 才是可信的结构化结果。

**4. 换 Provider 前验证 structured output 支持。** 这是跨云/跨厂商迁移时的隐性风险点，需要在架构选型阶段纳入评估。
## 相关实体

- [announcing genkit middleware](https://github.com/QianJinGuo/wiki-public/blob/main/entities/developers.googleblog-announcing-genkit-middleware-intercept-extend-and-harden-y.md)

---

