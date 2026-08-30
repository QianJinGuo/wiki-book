---
source: deepseek-harness-observability-tencent-agent可观测
source_url: https://mp.weixin.qq.com/s?__biz=MjM5ODYwMjI2MA==&mid=2649803822&idx=1&sn=82b4c1b6735d5757e5e0a3288312c73e
ingested: 2026-08-30
sha256: 56515de3ee73a8e0
---

# 六、腾讯云 Agent 可观测还提供哪些接入方式与能力

DSH 插件是接入形态之一。除此之外，腾讯云 Agent 可观测还提供以下上报方式，它们写入同一套数据模型，可在同一个控制台内查看与横向对比：

目前接入生态正在持续丰富中，逐步支持通用Agent框架（如langchain、OpenAI Agent SDK等）和Coding Agent（如CodeX、ClaudeCode等）中

数据上报后，控制台侧已提供的分析能力：

  * **应用列表** ——已接入应用、上报中应用、昨日写入量与昨日 Token 总数，以及各应用的地域、状态与接入类型。



  * **仪表盘** ——总览（请求数与错误数、模型调用次数、Input/Output Tokens、Agent 与模型 Top10、平均 TTFT）、性能（耗时直方图与 P50/P90/P99 分位趋势、模型平均耗时 Top10）、成本 & Token、应用观测（按 generation / tool / chain / agent / retriever / guardrail / event 等类型分析调用分布与耗时）。



  * **调用链** ——Traces 与 Span两种视图，可按状态、错误类型（工具调用失败、LLM 调用失败、Root span 状态码异常、Agent 执行失败）、Trace ID、Session ID 与耗时筛选，详情页提供调用树、节点 Input/Output 与错误根因定位。



  * **会话** ——按 Session 聚合 Trace，支持按会话时长、Trace 数、Token 与成本筛选，还原多轮对话上下文。



  * **告警能力** ——支持对常用指标比如可对耗时、失败率等异常情况配置告警




# 七、总结

DSH 原生的轨迹视图与事件流落盘，解决的是**本机、单会话、实时** 的调试问题；本文方案在此基础上把同一批运行时事件还原为结构化的五层调用链，补充**跨会话聚合、跨机汇聚、长期留存与告警能力** ，帮助用户快速搭建针对DeepSeek Harness的运维观测体系。

项目GitHub：  
[https://github.com/TencentCloud/tencentcloud-agentobs-sdk-dsh](<https://github.com/TencentCloud/tencentcloud-agentobs-sdk-dsh>)

相关接入指南：

  * Agent 可观测应用详情：




[https://cloud.tencent.com/document/product/614/133517](<https://cloud.tencent.com/document/product/614/133517>)

  * 接入 AI Coding Agent 数据（Onesuite-Pilot）：




[https://cloud.tencent.com/document/product/614/135910](<https://cloud.tencent.com/document/product/614/135910>)

  * 使用 Langfuse SDK 上报 Trace 数据到 CLS：




[https://cloud.tencent.com/document/product/614/133518](<https://cloud.tencent.com/document/product/614/133518>)

有任何关于 Agent 可观测的问题和建议，欢迎入群交流 ⬇️

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=8a0fdac1&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMjM5ODYwMjI2MA%3D%3D%26mid%3D2649803822%26idx%3D1%26sn%3D82b4c1b6735d5757e5e0a3288312c73e>)