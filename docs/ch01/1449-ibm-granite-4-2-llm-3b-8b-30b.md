# IBM Granite 4.2：首个稠密推理 LLM 家族（3B/8B/30B）

## Ch01.1449 IBM Granite 4.2：首个稠密推理 LLM 家族（3B/8B/30B）

> 📊 Level ⭐⭐ | 2.1KB | `entities/ibm-granite-4-2-reasoning-architecture-2026.md`

# IBM Granite 4.2：首个稠密推理 LLM 家族（3B/8B/30B）

> Granite 4.2 是 IBM Granite 语言模型家族的推理向发布——首个稠密、纯解码器推理 LLM 家族，三种尺寸 3B/8B/30B，从零预训练约 15T token，Apache 2.0 开源。HF Granite Team 技术走查了其训练管线。

## 训练管线

- **预训练**：从零训练，约 15T token，五阶段策略将上下文窗口扩展到 **512K token**。
- **SFT**：在 chain-of-thought、推理、agentic-trajectory 数据上监督微调。
- **后训练**：多阶段强化学习管线，包含 **agentic RL**——8B 与 30B 模型在真实沙箱环境中学习使用工具行动。

## 关键特性

每个模型具备：**thinking / non-thinking 切换**；**low-effort 思考模式**（对简单问题只花少量推理预算）；**原生工具调用（native tool calling）**。全部 Apache 2.0 开源。

## 关系与对比

- [IBM 模型路由优化](ch01/1133-20.html) 同属 IBM 大模型工程研究方向
- [ScarfBench（IBM）](../ch04/684-ai-agent.html) 覆盖 IBM 在企业 Java 框架迁移场景的 Agent 基准
- [自蒸馏推理用于 SFT](https://github.com/QianJinGuo/wiki/blob/main/entities/exploring-self-distilled-reasoning-for-supervised-fine-tunin.md) 是本文 SFT 推理数据阶段的同类方法
- agentic RL（真实沙箱环境工具学习）与 [Agent Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-harness-engineering-paradigm.md) 的沙箱工具训练视角相关

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ibm-granite-4-2-reasoning-model-2026.md)

---

