# CyberSecQwen-4B

> 📊 Level ⭐⭐⭐ | 9.7KB

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
CyberSecQwen-4B 的实验结果揭示了一个重要规律：在垂直领域，**专精比庞大更有价值**。4B 参数的专项微调版本在 CTI-MCQ（2,500 题）上以 0.5868 超越 8B 安全专项基线 Foundation-Sec-Instruct-8B（0.4996）8.7 pp，同时在 CTI-RCM（1,000 条 CVE→CWE 映射）上以 0.6664 保留了 8B 基线 97.3% 的准确率。 这说明对于 CVE→CWE 映射这类结构化任务，关键在于领域数据的覆盖度和微调策略，而非原始模型大小。
把它与自家基座对比，逻辑更清晰：Qwen3-4B-Instruct-2507 原始检查点在 CTI-RCM 上仅 0.519、CTI-MCQ 上仅 0.473，一次 LoRA 微调就把两项指标分别拉高约 14.7 pp 和 11.4 pp——微调带来的绝对增益，远大于参数量从 4B 翻倍到 8B 所能解释的差距。
但结果并非全面碾压，差距的方向性值得部署者注意：CTI-RCM 上仍落后 8B 专项基线 1.9 pp，且评估是在 n=5 次试验、温度 0.3 的协议下进行的，标准差仅 ±0.0023/±0.0029，说明这 1.9 pp 是稳定的真实差距而非测量噪声。 对防御者的启示是按任务形态取舍：多选类广度任务（CTI-MCQ）选 4B 专项即可全面占优；CVE→CWE 深度映射若 2 pp 不可接受，则仍需 8B。
另一个容易被忽视的方法学细节：训练语料中的 2021 年 CVE→CWE 映射（来自 MITRE/NVD 公开记录）在训练之前就去除了与 CTI-Bench 评估集的全部重叠，同时合成的防御分析师问答也以去重后的 CVE 描述为接地。评测集污染是安全领域基准被普遍质疑的原因，这种"先去重后训练"的纪律让 +8.7 pp 的领先具备可信度，也是该实验设计里最值得其他垂直微调项目照抄的一环。

### AMD ROCm 生态的实战验证
整个训练流程（训练→适配器合并→评估）全程运行在单块 AMD Instinct MI300X 192 GB（gfx942）实例上，经由 AMD Developer Cloud 完成，验证了 ROCm 7 + FlashAttention-2 在生产级任务中的可用性。 具体的栈版本构成一条可复现的基线：ROCm 7.0、PyTorch 2.6.0 (ROCm)、flash-attn 2.8.3、vLLM 0.10.1、Docker 镜像 vllm/vllm-openai-rocm，transformers/peft/trl 取训练时最新版。
遇到的四个工程挑战都有明确的、且大多是一行配置级别的解决方案：FA2 在 Gemma-4 上因 head_dim=512 不兼容需对全局注意力层回退 sdpa；AITER 内核冲突需设 VLLM_ROCM_USE_AITER=0；bitsandbytes 不支持 ROCm 需改用 paged_adamw_8bit（仅优化器路径）；vLLM ROCm + chat template 兼容性问题需切换 TRITON_ATTN 后端。 这组"问题→修复"对照表的价值在于：没有一个坑需要深度改造框架，AMD 算力在 LLM 微调场景已具备可操作性，剩余摩擦是配置层面的。
性能上也有正证据：实测约 7.85 s/step，同一配方在 Gemma-4-E2B 基座上要慢约 1.6 倍，说明 Qwen 系基座在 MI300X 上的执行效率尚有余量。 对于关注多 GPU 成本优化的团队，这意味着 AMD 平台不只是"能用"，而是已经进入可比较性能的区间。

### 微调配方的高度可迁移性
Gemma4Defense-2B 采用完全相同的训练语料和超参数，仅更换基模型（Qwen3-4B → Gemma-4-E2B-it），两项指标差距收敛在 0.9 pp 以内——CTI-RCM 上 2B 版本（0.6754 ± 0.0035）甚至反超 4B 的 0.6664，CTI-MCQ 上 0.6042 ± 0.0090 同样领先于 0.5868。 这条证据至关重要：LoRA r=64, alpha=64, dropout=0.05, LR 5e-5 cosine（warmup ratio 0.03）、10 epochs、bf16 + FlashAttention-2、max seq len 4096 的整套配方具有跨架构、跨参数规模的复现性，基模型切换不要求重新调试训练流程。原文的概括很准确："关键在于如何微调 IT 检查点，而非选择哪个家族"。
对资源受限团队的推论是：若 4B 仍超出显存或延迟预算，同一配方可以直接套在 2B 级基座上，性能损失有限甚至可能为正；配方迁移的边际成本接近零。这比单点模型发布更可复用——真正被验证的资产不是这一个 checkpoint，而是"小基座 + 优质领域语料 + 固定 LoRA 配方"这条路本身。同时 2B 版本在 5 次试验下的标准差（±0.0035/±0.0090）略大于 4B，提示更小的基座在输出稳定性上可能有轻微代价，严格场景仍应以 4B 为默认。

### 安全边界的清醒定位
项目明确列出"不适合生成漏洞利用代码、自动执行安全决策或通用聊天"，只保留 CWE 分类、CTI 问答和辅助人类分析师三件事，这是一个值得肯定的自我约束。 定位背后是防御侧的三重硬约束：敏感证据（泄露凭证转储、恶意样本、CVE 披露草稿）本身可能就是泄露源，不应送入托管 API；中型 SOC 每天处理数千条低置信告警，托管 API 的按次成本会让防御自动化变成预算问题；关键基础设施、医疗与政府场景中气隙/弱连接环境是常态而非例外。 对手侧同样在自动化——勒索团伙用 LLM 多语言批量写钓鱼，自动化漏洞利用链的速度超过人工审查，防御要跟上速度就需要防御者自己拥有且本地可跑的模型。12 GB 消费级显卡即可运行的 4B 规模正好落在"本地可部署"的甜点上，这与 [本地 vs 云部署的权衡](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/local-vs-cloud-agent-deployment-strategy.md) 中敏感数据优先本地的原则一致。
路线图把这条逻辑延续下去：1B 笔记本级变体、Q4_K_M/Q5_K_M 的 GGUF 量化发布、随新 CVE→CWE 映射发布持续评估、对抗样本鲁棒性研究。 在 [AI 安全](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-safety.md)与 [AI 安全全景](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-security-landscape.md)的语境下，模型的用途边界和技术能力边界同样重要——明确拒绝攻击性用途的声明，加上 4B 参数规模本身对恶意使用的天然上限，共同构成一个攻防不对称时代的防御者友好设计样本。

## 实践启示
1. **选择专项微调而非持续预训练**：当领域任务明确（如 CWE 分类）且有高质量标注数据时，LoRA 微调比继续预训练更高效。CyberSecQwen-4B 从 Qwen3-4B-Instruct-2507（已 instruction-tuned）起步，避免了从零训练的高成本。
2. **参数减半、性能提升的配方可参考**：r=64, alpha=64, dropout=0.05, cosine LR warmup ratio 0.03, bf16 + FlashAttention-2 这套组合在两个不同基模型上均告有效，具备跨家族复现的参考价值。
3. **AMD MI300X 是可行的替代选择**：对于需要大显存（192 GB）且关注多 GPU 成本优化的团队，ROCm 7 生态已基本成熟，vLLM、transformers、peft、trl 均可对接。
4. **本地部署是 defensive 网络安全的硬需求**：API 成本、数据泄露风险和 air-gapped 环境三重约束下，12 GB 消费级显卡可运行的 4B 模型是当前最具可操作性的落地方案。
5. **后续演进关注量化版本**：项目计划发布 Q4_K_M 和 Q5_K_M 的 GGUF 格式，这将显著扩展其在边缘设备和笔记本电脑上的适用场景。

## 相关实体
>

- [CyberSecQwen-4B: Why Defensive Cyber Needs Small, Specialized, Locally-Runnable Models](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cybersecqwen-4b-why-defensive-cyber-needs-small-specialized-locally-runnable-mod.md)
- [Fake OpenAI Privacy Filter Repo Hits #1 on Hugging Face, Draws 244K Downloads](https://github.com/QianJinGuo/wiki-public/blob/main/entities/thehackernews-fake-openai-privacy-filter.md)
- [Adversaries Leverage AI for Vulnerability Exploitation, Augmented Operations, and Initial Access](https://github.com/QianJinGuo/wiki-public/blob/main/entities/google-ai-vulnerability-exploitation-threat-intel.md)

---

