---
title: 阿里巴巴 & 蚂蚁 LoongSuite GenAI 可观测语义规范：从统一数据语言到规模化落地
source_url: https://mp.weixin.qq.com/s/vr_wp73rqUQAZT3p_g4GVQ
publish_date: 2026-05-12
tags: [wechat, article, agent, llm, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: ddd81c8164b924ecd9aa2c4ce1ea62579090715e19c3d13e015f456d42ded8d1
---
# 阿里巴巴 & 蚂蚁 LoongSuite GenAI 可观测语义规范：从统一数据语言到规模化落地
> 原创 铖朴、瑜棕、顺岭 阿里云开发者 2026年5月12日
## 背景
随着 AI Agent 系统中涌现出大量新概念（Model、Prompt、Token、Tool Calling、Agent、Memory、Session 等），它们需要像传统 HTTP 请求一样被标准化采集、展示和消费。OpenTelemetry（OTel）自 2024 年初推动 GenAI 语义规范——Semantic Conventions（SemConv）建设。
## SemConv 定位与价值
OTel 社区核心 Maintainer 认为 SemConv 是 OTel 的灵魂。一个统一的 SemConv 实现三大价值：统一数据语言解决口径不一致、支撑性能成本质量安全统一治理、降低接入成本推动基础设施复用。
## LoongSuite GenAI SemConv 介绍
阿里云、阿里控股与蚂蚁集团可观测团队联合启动，2025 年内部建模，2026 年开源至 LoongSuite 品牌下，作为 OTel GenAI SemConv 的厂商增强标准，后续贡献至 OTel 上游。
### 1. 新增 Entry/Step Span
Agent 长程任务中单个 Trace 包含成百上千个 Span，难以清晰观测。
- Entry Span：Agent 入口处，还原用户原始输入输出
- Step Span：每次 ReAct 循环的层次化表达（反思—>工具调用—>模型调用），Top-down 逐轮排查
已落地 OpenClaw、QwenPaw、Hermes Agent。
### 2. 新增 Skill 语义
Skill 是介于 Tool 和 Agent 之间的业务功能编排单元。新增 gen_ai.skill.* 属性（name/id/description/version）附着在 execute_tool Span 上，无需新 Span 类型即可快速落地。
### 3. Token 级推理观测
蚂蚁构建业界首个覆盖多推理引擎（vLLM/SGLang/TensorRT-LLM）、支持 Token 级深度 Trace 的可观测产品。采集 per-token 调度/执行时间、batch 负载、Top-K 候选分布。
典型案例：慢 Token 定位（prefill 干扰 decode —> PD 分离）、BOS Token 答非所问（模型 badcase）
## GenAI Utils
提供统一 Invocation 数据类 + Context Manager 编程模型。已支持 DashScope、Dify、AgentScope、Mem0、MCP、Agno、Google ADK、LangChain 等 8+ 框架。
GitHub: https://github.com/alibaba/loongsuite-semantic-conventions/