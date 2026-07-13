# CyberSecQwen-4B

## Ch12.102 CyberSecQwen-4B

> 📊 Level ⭐⭐ | 5.0KB | `entities/cybersecqwen-4b.md`

## Key Capabilities
- **CWE Classification**: Maps vulnerability descriptions (CVEs, advisories) to MITRE CWE categories
- **CTI Q&A**: Structured question answering about cybersecurity concepts, attacks, controls
- **Defensive triage assistance**: Supports human analysts triaging CVEs, prioritizing patches

## Performance
On CTI-Bench (2,500 CTI-MCQ items + 1,000 CVE→CWE items):
| Model | Parameters | CTI-MCQ | CTI-RCM |
| --- | --- | --- | --- |
| **CyberSecQwen-4B** | 4B | **0.5868** | 0.6664 |
| Foundation-Sec-Instruct-8B | 8B | 0.4996 | 0.6850 |
| Qwen3-4B-Instruct (base) | 4B | 0.473 | 0.519 |
Outperforms the 8B Cisco baseline on CTI-MCQ by +8.7 pp while being half the size.

## Technical Details
- **Base model**: Qwen3-4B-Instruct-2507 (Apache 2.0)
- **Training**: Single AMD MI300X 192GB, ROCm 7, bf16, FlashAttention-2
- **LoRA config**: r=64, alpha=64, dropout=0.05, LR 5e-5 cosine, 10 epochs
- **License**: Apache 2.0

## 深度分析
### 小专项 vs 大通用：参数效率的核心逻辑
CyberSecQwen-4B 的实验结果揭示了一个重要规律：在垂直领域，**专精比庞大更有价值**。4B 参数的专项微调版本在 CTI-MCQ 上超越 8B 通用基线 8.7 pp，同时在 CTI-RCM 上保留了 97.3% 的准确率。这说明对于 CVE→CWE 映射这类结构化任务，关键在于领域数据的覆盖度和微调策略，而非原始模型大小。

### AMD ROCm 生态的实战验证
整个训练流程（训练→适配器合并→评估）全程运行在单块 AMD Instinct MI300X 192 GB 上，验证了 ROCm 7 + FlashAttention-2 在生产级任务中的可用性。遇到的四个工程挑战（FA2 在 Gemma-4 上的 head_dim 不兼容、AITER 内核冲突、bitsandbytes 不支持 ROCm、vLLM ROCm + chat template 兼容性）都有明确解决方案，表明 AMD 算力在 LLM 微调场景已具备可操作性。

### 微调配方的高度可迁移性
Gemma4Defense-2B 采用完全相同的训练语料和超参数，仅更换基模型（Qwen3-4B → Gemma-4-E2B-it），两项指标差距在 0.9 pp 以内。这条证据至关重要：LoRA r=64, alpha=64, dropout=0.05, LR 5e-5 cosine 的配方本身具有跨架构复现性，基模型切换不要求重新调试训练流程。

### 安全边界的清醒定位
项目明确列出"不适合生成漏洞利用代码、自动执行安全决策或通用聊天"，这是一个值得肯定的自我约束。在 defensive AI 领域，模型的用途边界和技术能力边界同样重要——4B 参数规模本身也在某种程度上限制了恶意使用的上限。

## 实践启示
1. **选择专项微调而非持续预训练**：当领域任务明确（如 CWE 分类）且有高质量标注数据时，LoRA 微调比继续预训练更高效。CyberSecQwen-4B 从 Qwen3-4B-Instruct-2507（已 instruction-tuned）起步，避免了从零训练的高成本。
2. **参数减半、性能提升的配方可参考**：r=64, alpha=64, dropout=0.05, cosine LR warmup ratio 0.03, bf16 + FlashAttention-2 这套组合在两个不同基模型上均告有效，具备跨家族复现的参考价值。
3. **AMD MI300X 是可行的替代选择**：对于需要大显存（192 GB）且关注多 GPU 成本优化的团队，ROCm 7 生态已基本成熟，vLLM、transformers、peft、trl 均可对接。
4. **本地部署是 defensive 网络安全的硬需求**：API 成本、数据泄露风险和 air-gapped 环境三重约束下，12 GB 消费级显卡可运行的 4B 模型是当前最具可操作性的落地方案。
5. **后续演进关注量化版本**：项目计划发布 Q4_K_M 和 Q5_K_M 的 GGUF 格式，这将显著扩展其在边缘设备和笔记本电脑上的适用场景。

## 相关实体
> [主题导航](https://github.com/QianJinGuo/wiki/blob/main/moc/cybersecurity-privacy.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cybersecqwen-4b.md)

## 相关实体
>

- [CyberSecQwen-4B: Why Defensive Cyber Needs Small, Specialized, Locally-Runnable Models](../ch01/038-cybersecqwen-4b-why-defensive-cyber-needs-small-specialize.html)
- [Fake OpenAI Privacy Filter Repo Hits #1 on Hugging Face, Draws 244K Downloads](../ch01/445-openai.html)
- [Adversaries Leverage AI for Vulnerability Exploitation, Augmented Operations, and Initial Access](../ch05/084-ai.html)

---

