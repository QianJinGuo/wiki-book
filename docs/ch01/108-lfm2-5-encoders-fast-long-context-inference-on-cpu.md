# LFM2.5-Encoders: Fast Long-Context Inference on CPU

> 📊 Level ⭐ | 3.0KB | `entities/liquid-ai-lfm2-5-encoders-fast-long-context-cpu.md`

# LFM2.5-Encoders: Fast Long-Context Inference on CPU

Liquid AI 发布 LFM2.5-Encoders 系列（230M / 350M 双向编码器），从 LFM2 decoder backbone 初始化并转为双向架构，主打 CPU 上的长上下文推理与低延迟。

## 架构要点

- 从 LFM2 decoder backbone 初始化，通过双向注意力 + 对称 padding 将因果 decoder 转为 encoder
- 两阶段预训练：短上下文 masked-language objective（1024 token）→ 长上下文扩展（8192 token，强化事实/法律/多语言能力）
- 全量微调：14 个模型 × 17 个任务（GLUE / SuperGLUE / 多语言），5 个 held-out seeds 取均值，结果稳定可复现

## 性能亮点

- LFM2.5-Encoder-350M 在 14 模型对比中排名第四，前三名都是更大模型（含近 10 倍大小的 3.5B 模型）
- CPU 推理速度全场最快：230M 在任意序列长度下快于更小的 ModernBERT 变体；GPU 上约 1K token 起反超 ModernBERT-base
- 定位：高吞吐理解任务（分类、路由、抽取、打分、PII 检测、policy linting），成本随输入长度增长缓慢

## 应用场景

- Intent router / policy linter / PII detector / text classifier，全 CPU-only Hugging Face Space 可跑
- 开放权重，HF 可直接 `AutoModelForMaskedLM.from_pretrained(model_id, trust_remote_code=True)`，支持 Flash Attention 2

## 与同系列产品的关系

LFM2.5-Encoders 与 [LFM2.5-230M](../ch04/052-ai.html)（decoder 小模型，面向边缘部署/Agent 工具调用）同属 LFM2.5 架构家族，但产品线不同：Encoders 是双向编码器，面向理解/分类/路由类任务；230M decoder 面向生成/Agent 场景。

## 相关概念

- [推理优化](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/inference-optimization.md) — CPU 长上下文推理速度是核心卖点
- 长上下文技术 — 8192 token 上下文扩展
- [LFM2.5-230M](../ch04/052-ai.html) — 同家族 decoder 模型

→ [原文存档](https://huggingface.co/blog/LiquidAI/lfm2-5-encoders)

---

