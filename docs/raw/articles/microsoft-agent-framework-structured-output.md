---
source_url: "https://mp.weixin.qq.com/s/K6y6YZ8KoHjvmjLpiLbHHQ"
source: wechat
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
ingested: 2026-05-23
sha256: ""
---

# Agent Framework Agent 篇（五）：结构化输出

**来源：** 智子AI社 | 2026年5月23日
**系列：** Microsoft Agent Framework Agent 篇（五）

## 核心要点

### 核心问题
传统方案：提示词要求"只输出 JSON" + `json.loads()` → 易夹杂 markdown、缺字段、类型漂移。Agent Framework 解法：Schema 由 API 约束，框架负责解析。

### response_format 两种方式
**Pydantic 类** → `response.value` 为 Pydantic 模型实例（强类型代码库）
**JSON Schema dict** → `response.value` 为 dict（动态 Schema、配置驱动）

### response.value vs response.text
- `response.text`：原始文本聚合
- `response.value`：解析后的结构化对象（业务代码应优先使用）

### 配置时机
- 单次运行：`agent.run(..., options={"response_format": PersonInfo})`
- 默认 Schema：`default_options={"response_format": PersonInfo}`

### 流式 + 结构化
`stream = agent.run(query, stream=True, options={"response_format": PersonInfo})` → `get_final_response()` 自动消费完整流再解析

### 能力边界
依赖底层 Chat Client 支持 JSON Schema / Structured Outputs。换 Provider 时需重新验证。

## 生产注意点
1. 换 Provider 验证 response_format 支持
2. Schema 字段过多/嵌套过深增加失败率
3. Agent 同时启用 tools 时的产品逻辑确认
4. 不支持时需二次 LLM 调用（兜底方案）

## 代码示例
```python
from pydantic import BaseModel

class PersonInfo(BaseModel):
    name: str | None = None
    age: int | None = None
    occupation: str | None = None

response = await agent.run(
    "Please provide information about John Smith...",
    options={"response_format": PersonInfo},
)

if response.value:
    person_info = response.value
    print(f"Name: {person_info.name}, Age: {person_info.age}")
```
