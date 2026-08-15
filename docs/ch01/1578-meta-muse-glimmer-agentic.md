# Meta Muse Glimmer — 本地级 Agentic 多模态开源模型

## Ch01.1578 Meta Muse Glimmer — 本地级 Agentic 多模态开源模型

> 📊 Level ⭐⭐⭐ | 1.7KB | `entities/meta-muse-glimmer-local-agentic-multimodal-open-source.md`

# Meta Muse Glimmer — 本地级 Agentic 多模态开源模型

Meta 与 Hugging Face 合作发布 Muse Glimmer（30B 级），定位**本地规模、可编码、多模态**的开放权重模型——"a local scale personal assistant that can code"。与 [Muse Spark 1.1](../ch04/704-11-agent.html) 系列互补：Spark 主打云端强推理，Glimmer 主打单卡可跑的本地 Agentic 能力。

## 关键规格

- **规模**：Muse-Glimmer-30B，1×80GB H100 即可推理/评估（BF16）
- **能力**：多模态 + 强编码能力（OpenCode + AsyncGRPO 实验验证）
- **微调**：TRL 全链路支持——SFT 到 Async GRPO；LoRA SFT 单卡可跑，Full SFT 需 8×80GB H100（FSDP/ZeRO-3）
- **发布配套**：MolmoWeb 子集 QLoRA 示例、结构化输出/图像微调 notebook

## 工程启示

Glimmer 的硬件门槛表（推理 1×H100 / LoRA SFT 1×H100 / Full SFT 8×H100 / GRPO 8×H100 4+4）是本地 Agentic 模型训练成本的最小可行参考，与 [量化](https://github.com/QianJinGuo/wiki/blob/main/entities/quantization-techniques.md) 结合可进一步下探单卡部署。属于 [Meta AI 开源竞争策略](../ch05/108-ai.html) 的本地化分支。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/meta-muse-glimmer-local-agentic-multimodal-open-source.md)

---

