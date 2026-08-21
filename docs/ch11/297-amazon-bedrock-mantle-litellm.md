# Amazon Bedrock Mantle 推理引擎 + LiteLLM 网关统一收敛

## Ch11.297 Amazon Bedrock Mantle 推理引擎 + LiteLLM 网关统一收敛

> 📊 Level ⭐⭐ | 3.2KB | `entities/amazon-bedrock-mantle-litellm-gateway-2026.md`

# Amazon Bedrock Mantle 推理引擎 + LiteLLM 网关统一收敛

## Mantle 是什么

Mantle 是 Amazon Bedrock 的下一代推理引擎（next-generation inference engine），OpenAI 的 GPT-5.6（Sol / Terra / Luna）等模型由它提供服务，通过 OpenAI 兼容的 `bedrock-mantle` 端点（`https://bedrock-mantle.{region}.api.aws`）暴露。关键概念区分：**引擎**（Mantle 自身，底层基础设施，Model Deployment Account 隔离设计）vs **端点**（`bedrock-mantle` 这一 OpenAI 兼容 HTTPS API）。

三个值得关注的特性：零运维人员访问（Zero Operator Access，参照 AWS Nitro System 从零设计，技术上排除 AWS/客户/模型提供方接触 prompt 与 completion）；OpenAI 兼容 API（可直接用 OpenAI Python/TS SDK，改 base URL 和模型 ID 即可迁移，暴露 Chat Completions 与 Responses 两套 API）；为 Agent 流量设计（Agent 负载突发——一次用户请求可能触发上百次模型调用，Mantle 池化容量吸收峰值并隔离各客户吞吐，支持带显式 cache breakpoint 的 prompt caching，缓存输入一折计费、可复用至少 30 分钟）。

## 接入时的三个不对齐

2026 年 7 月 GPT-5.6 三个变体在 Bedrock 正式可用，对已在用 Claude 的团队会碰到三处不对齐：端点不对齐（GPT-5.6 走 `bedrock-mantle`，Claude 走经典 `bedrock-runtime`，两套 base URL）；协议不对齐（同一端点下按模型分派不同协议：GPT-5.x 只支持 Responses API「input」字段，gpt-oss 系列只支持 Chat Completions「messages」字段）；客户端 SDK 分派复杂度叠加。

## 用 LiteLLM 网关收敛

本文用一台 EC2 上的 LiteLLM 网关（测试形态，生产化建议见原文）把两个端点收敛到同一个入口，实测供出 9 个模型（GPT-5.6 三变体、GPT-5.5、GPT-5.4、gpt-oss 两款、Claude 两款），客户端只认一个地址、一个 key；网关侧完全用 EC2 实例角色做 SigV4 认证，不落盘任何 API key。还给出一个 92 行的 pre-call 钩子，解决 Codex 客户端与 Mantle 请求体不兼容的问题，让 Codex 与 opencode 共用同一套网关。

## 可迁移性判据与定位

去掉品牌词后，核心方法（用统一网关收敛多协议/多端点、实例角色 SigV4 免落盘 key、pre-call 钩子修 agent 客户端请求体不兼容）可指导任何多推理提供商的网关设计，且与 wiki 已入库的 [LiteLLM Bedrock 成本控制](ch11/049-litellm-amazon-bedrock.html)、[LiteLLM ECS/EKS 网关](../ch01/1147-llm.html) 同属 LiteLLM×Bedrock 网关工程族；本实体聚焦新的 Mantle 推理引擎 + 双协议收敛。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/amazon-bedrock-mantle-litellm-gateway-2026.md)

---

