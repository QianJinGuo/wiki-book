# Mistral Shieldstral — Policy-Adaptive Multimodal Safety Classifier

> 📊 Level ⭐ | 3.4KB

> **Background**：Mistral AI 发布 Shieldstral（3B open-weights 多模态安全分类器），核心创新是把内容审核从「固定有害类别 taxonomy」重构为「policy-adaptive question-answering」——模型在推理时接受自然语言策略（如"这段内容是否煽动针对受保护群体的暴力？"），返回校准安全分数，无需针对每个部署上下文重训。

## 核心创新：Policy-Adaptive QA 范式

传统 guardrail 模型把固定 harm categories taxonomy 烘焙进权重，重新定向到新部署上下文意味着重训。Shieldstral 换了一个思路：**推理时用自然语言写策略，模型返回校准安全分数**——无重训、文本图像统一接口、单 token 出 verdict。

同一内容在不同场景的安全性不同（网络安全研究工具 vs 心理健康平台），因此不存在单一"正确"的类别集合——这正是 policy-adaptive 设计的前提。

## 关键指标

- **3B open-weights**，Apache 2.0 协议
- **文本安全**：匹配 7× 体量模型
- **多模态审核**：SOTA（文本 + 图像统一接口）
- **运行开销**：单张 16GB NVIDIA GPU 即可高效运行
- **输出**：校准安全分数（calibrated safety scores）

## 对 LLM 安全工程的意义

- **Guardrail 部署成本下降**：policy-adaptive 意味着一个模型服务所有部署场景，不再为每个产品/受众维护专用审核模型——与 [Bedrock Guardrails](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-guardrails-code-generation-six-patterns.md) 类平台方案形成互补（平台 vs open-weights 两种路线）
- **审核即推理任务**：把 content moderation 从分类任务重构为 QA 任务，与 Nova 2 prompting 审核 思路同源
- **多模态统一**：文本+图像一个接口、一个模型，规避多模态安全审核需多模型拼装的工程负担

## 相关主题

- 同类 open-weights 安全模型：[Nemotron 3.5 Content Safety (multimodal)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/nemotron-3-5-content-safety-multimodal.md)、Nemotron 3.5 Content Safety
- 平台级 guardrail：[Amazon Bedrock Guardrails](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-guardrails-code-generation-six-patterns.md)

→ [原文存档](https://mistral.ai/news/shieldstral/)

---

