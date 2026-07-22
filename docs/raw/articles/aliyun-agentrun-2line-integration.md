---
title: "用两行代码将 AgentRun 集成到你的应用"
sha256: bd93c6f41f9a9e7b41531675c8f4866540fb41519a37b2dfab48db64ce066b84
type: raw
created: 2026-05-14
updated: 2026-05-14
source_url: "https://mp.weixin.qq.com/s/139AsxhoOacnO84DkMN_ow"
author: "悠逸"
source_name: "阿里云云原生"
review_value: 7
review_confidence: 7
review_recommendation: worth-reading
review_stars: 3
tags: [agent, aliyun, integration, openai-compatible, api]
---
# 用两行代码将 AgentRun 集成到你的应用
> 作者：悠逸 | 来源：阿里云云原生 | 2026-05-14
## 前提
已在 AgentRun 上有一个跑起来的 Agent。如果还没有，先看[5 分钟上手 AgentRun](https://mp.weixin.qq.com/s/_TisUR-BKbwsvEnwVE8cNA)。
## 01 Agent 做好了，然后呢？
Agent 在控制台测试面板里对话正常，下一步就是接到自己的系统里——后端服务、IM 机器人、小程序、内部工具，都行。
多数 Agent 平台需要你先读懂自定义 API 文档、封装 SDK、处理鉴权和流式输出。AgentRun 选择让你用现有代码直接调用：端点直接兼容 **OpenAI Chat Completions** 协议（同时也支持 **AGUI**）。如果你的项目已经在使用 OpenAI，把 `base_url` 换一下，Agent 就接上了——不需要学新协议、不需要装新 SDK、现有的代码一行都不用改。
通过这个端点调用的不是一个裸模型，而是一个完整的 Agent 运行时——它可以挂载工具（MCP Server、Function Call、Skill 三种类型统一管理）、接入知识库（支持本地文件、OSS、飞书文档、百炼、Ragflow 等多种数据源做 RAG 检索增强）、使用长短期记忆保持上下文连贯性，还内置了内容安全护栏和基于 OpenTelemetry 的全链路可观测。
## 五条集成路径
1. **代码集成**：兼容 OpenAI 协议，改两行参数就能调通，Python / Node.js / Java / curl 都行
2. **SDK 集成**：在代码里直接管理 Agent 生命周期、调用沙箱和知识库，无缝对接 LangChain 等主流框架
3. **UI 嵌入**：四套视觉风格、三种嵌入方式，复制代码片段就能把聊天窗口嵌进网页，不用写后端
4. **IM 集成**：控制台配完钉钉 / 飞书 / 企微机器人就能用，不用自己写 webhook 转发
5. **事件集成**：接阿里云 EventBridge，云上事件自动触发 Agent，不需要人主动发起对话
## 02 改两行代码，现有项目直接调通
每个 AgentRun Agent 创建后都会生成一个固定的 HTTPS 端点：
```
https://{account-id}.agentrun-data.{region}.aliyuncs.com/agent-runtimes/{agent-name}/endpoints/{endpoint-name}/invocations
```
地址在控制台详情页的「集成与发布」→「代码集成」Tab 里可以直接复制。
### Python（用 OpenAI SDK）
```python
from openai import OpenAI
client = OpenAI(
    base_url="https://{your-endpoint}/openai/v1",
    api_key="your-agentrun-token",   # 控制台「集成与发布」里拿
)
response = client.chat.completions.create(
    model="default",
    messages=[{"role": "user", "content": "帮我查一下杭州明天的天气"}],
    stream=True,
)
for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```
### 多轮对话
在请求头里加 `x-agentrun-session-id: {你的会话ID}`，同一个 session-id 下的消息会自动关联上下文。不传的话每次都是独立对话。AgentRun 把 Session 当作平台级资源管理——每个 Session 有独立的生命周期（TTL、空闲超时、状态追踪），你不需要自己建会话存储或写过期清理逻辑，平台全包了。
### AI 网关透明能力
请求经过 AgentRun 的 AI 网关，自动处理模型路由、多 APIKey 负载均衡和内容安全检测（输入输出都会过安全护栏），这些能力对调用方完全透明。模型供应商的 API Key 由平台统一托管和轮转，调用方拿到的是 AgentRun 自己的 token，不会直接接触底层模型密钥。
### 其他调用方式
支持 cURL、Python（requests）、Java、Node.js 等多种调用方式，均走标准 OpenAI 协议。