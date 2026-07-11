# CyberSecQwen-4B: Why Defensive Cyber Needs Small, Specialized, Locally-Runnable Models

## Ch01.038 CyberSecQwen-4B: Why Defensive Cyber Needs Small, Specialized, Locally-Runnable Models

> 📊 Level ⭐ | 8.7KB | `entities/cybersecqwen-4b-why-defensive-cyber-needs-small-specialized-locally-runnable-mod.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cybersecqwen-4b-why-defensive-cyber-needs-small-specialized-locally-runnable-mod.md)
来自 newsletter 文章 [CyberSecQwen-4B: Why Defensive Cyber Needs Small, Specialized, Locally-Runnable Models](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cybersecqwen-4b-why-defensive-cyber-needs-small-specialized-locally-runnable-mod.md) 提取。

## 核心内容
CyberSecQwen-4B 是一个 4B 参数的专项网络安全模型，在 CTI-Bench 基准上以 4B 参数量超越了 Cisco 8B 通用安全模型 Foundation-Sec-Instruct-8B（CTI-MCQ 58.68% vs 49.96%，+8.7pp），同时参数减半。模型可运行于单张 12GB 消费级 GPU，数据全程不离本地，适合 SOC、MDR、威胁情报、漏洞分析等敏感场景。

### 主要章节
- ## Why this matters
- ## Why a small specialized model, not just a small model
- ## A 5-minute walkthrough
- ## Why AMD MI300X
- ## The training data
- ## The recipe
- ## Companion model: same recipe, different substrate
- ## Challenges and fixes
- ## Try it yourself
- ## Intended use
- ## What's next
- ## Closing

### 关键性能数据
| Metric (CTI-Bench, n=5, temp 0.3) | CyberSecQwen-4B | Foundation-Sec-Instruct-8B | Δ |
| --- | --- | --- | --- |
| **CTI-MCQ** (2,500 items) | **0.5868 ± 0.0029** | 0.4996 | **+8.7 pp** |
| **CTI-RCM** (1,000 CVE→CWE items) | **0.6664 ± 0.0023** | 0.6850 | −1.9 pp |
| Parameters | 4 B | 8 B | half the size |

### 训练配方
```
LoRA r       = 64
LoRA alpha   = 64        # alpha/r = 1.0
LoRA dropout = 0.05
LR           = 5e-5      # cosine, warmup ratio 0.03
Epochs       = 10
Precision    = bf16
Attention    = FlashAttention-2 (forward + backward)
Max seq len  = 4096
Batch        = 4 (no accumulation)
Optimizer    = paged_adamw_8bit
```

## 深度分析
### 1. 小专项模型 vs 大通用模型的 trade-off 重新被审视
过去两年 LLM 发展主旋律是"规模即性能"——GPT-4、Claude、Gemini 都在堆参数、堆算力。但 CyberSecQwen-4B 的核心论点在于：**防御性网络安全是一个强约束场景，通用大规模模型的三高（高调用成本、高数据泄露风险、高部署门槛）与该场景天然不兼容**。
这揭示了一个重要趋势：**AI 落地正在从"通用最优"向"场景最优"分化**。不是每个场景都需要 70B 或 100B+ 的模型；垂直领域的专项微调可以用 1/10 的参数实现相当甚至更好的专业任务表现。

### 2. 数据主权与隐私边界成为选购模型的硬指标
文章指出的四个核心驱动因素中，**三条与数据安全直接相关**：

- 敏感证据（泄露的凭据、恶意软件样本、漏洞披露草案）不能上传外部 API
- 气隙环境（关键基础设施、医疗、政府）是常态而非例外
- API 按调用计费在 SOC 规模化场景下成本不可控
这意味着**在网络安全场景中，"模型能不能本地运行"已经从"加分项"变成"准入门槛"**。这一趋势会向其他高敏感行业（金融、医疗、法律）蔓延。

### 3. LoRA 微调 + 专项数据的 recipe 可迁移性得到验证
文章训练了基于 Qwen3-4B-Instruct 的 CyberSecQwen-4B 和基于 Gemma-4-E2B-it 的 Gemma4Defense-2B，使用完全相同的训练语料和超参数。结果两者在 CTI-RCM 上仅差 0.9pp，证明**recipe 本身是核心资产，而非基座模型本身**。
这一发现对行业有重要启示：企业自研安全模型时，可以基于已有的内部数据 + 开源 4B 基座 + 标准化 LoRA recipe 快速构建，无需从零预训练。

### 4. AMD ROCm 生态正在补齐 AI 训练最后一公里
训练全程跑在单卡 AMD MI300X 192GB 上，使用 ROCm 7 + vLLM 完整技术栈。文章详细记录了 ROCm 兼容性问题（AITER 内核冲突、bitsandbytes 非官方支持、FA2 对 head_dim=512 的 Gemma 不兼容等），但这些问题都有工程解法。
这说明**AMD GPU 在 AI 训练场景的可用性已大幅提升**，对需要大显存但不想用 NVIDIA 的场景（如部分政府、涉密、国产化要求）有直接意义。

### 5. 指令微调会损害 MCQ 能力的"缩放反噬"现象
文章发现一个反直觉现象：Qwen3-4B-Instruct（IT 版本）在 CTI-MCQ 上的表现比原始预训练基座差——这与 Cisco 报告的 Foundation-Sec-Instruct vs Foundation-Sec 的规律完全一致。**指令微调在注入对话能力的同时，会"侵蚀"模型在结构化多项选择任务上的原始能力**。
这是一个值得警惕的发现：企业在做领域微调时，如果任务涉及 MCQ/分类类结构化输出，需要专门设计 recovery 策略，不能简单认为 SFT 只会带来增益。

## 实践启示
### 给网络安全团队
1. **优先评估本地可运行模型**：在采购或自建 SOC 自动化能力时，将"数据不出网"作为硬性需求纳入评估体系。CyberSecQwen-4B 证明 4B 量级完全能满足 CTI 任务精度要求，且能覆盖 CWE 分类、CVE→CWE 映射、结构化威胁问答三大核心场景。
2. **小模型 + RAG 是更经济的组合**：与其追求一个大模型覆盖所有安全分析场景，不如用专项小模型处理结构化任务（分类、映射），配合本地 RAG 处理非结构化威胁报告解读，token 成本可控且数据完全自主。
3. **关注 CVE 年份分布对模型有效性的影响**：文章使用 2021 年 CVE 数据，且明确做了与 CTI-Bench 评估集的去重。这意味着**模型对 2022 年之后新出现的漏洞类型覆盖存在盲区**，使用时需要确认任务场景与训练数据的时效匹配度。

### 给 AI/ML 工程师
1. **LoRA recipe 的标准化价值**：文章证明相同的 LoRA 配置（r=64, alpha=64, lr=5e-5, cosine, 10 epochs）可以跨基座模型迁移且效果稳定。在企业内部，可以将有效 recipe 标准化为内部最佳实践，减少重复调参成本。
2. **FlashAttention-2 的硬件适配注意事项**：Qwen（head_dim=128）完美适配 MI300X shared memory，step time ~7.85s；但 Gemma（head_dim=512）无法在 global attention 层使用 FA2，被迫回退到 sdpa，速度慢 ~1.6×。**选择基座模型时需将 attention 实现兼容性纳入评估维度**。
3. **IT base vs Pretrained base 的任务适配**：如果下游任务涉及 MCQ/结构化分类，应考虑在 pretrained checkpoint 而非 instruct checkpoint 之上做微调，或设计专门的 recovery 训练阶段来弥补 IT 对 MCQ 能力的侵蚀。

### 给企业安全决策者
1. **"模型即服务"的隐藏风险**：使用外部 API 处理敏感安全数据（漏洞报告、攻击痕迹、凭据泄露）意味着数据控制权转移。在合规要求严格的环境（等保、GDPR、医疗 HIPAA），需要提前评估这一风险。
2. **国产化替代窗口**：AMD MI300X + ROCm 生态在 192GB 大显存场景已具备生产可用性，为受出口管制无法采购 NVIDIA H100/H200 的场景提供了替代路径。CyberSecQwen-4B 证明了这一路径的工程可行性。
3. **持续评估机制不可或缺**：文章计划持续跟踪 NVD 新增 CVE 数据扩充训练集。对于已部署的领域模型，**建议建立定期重训/增量训练机制**，防止模型因数据分布漂移而逐渐失效。

## 相关实体
- [CyberSecQwen-4B](../ch12/100-cybersecqwen-4b.html)
- [CyberSecQwen-4B: Why Defensive Cyber Needs Small, Specialized, Locally-Runnable Models](ch01/038-cybersecqwen-4b-why-defensive-cyber-needs-small-specialize.html)

---

