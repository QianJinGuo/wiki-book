---
source_url: "https://www.xiaohongshu.com/explore/6a708855000000002202d3e6?xsec_source=app_share&xsec_token=CBjhtLDgr4aGkqF4rKYaATYSIk63wybsleaRLSQ8tqQrU="
source_author: "adwardlee"
source_title: "AGENT长任务处理新突破：ACM框架"
source_date: "2026-08-03"
source_publication: "小红书（论文解读号）"
ingested: "2026-08-03"
sha256: "d5365a47215b4040e126723bfdade3a658df108b7752546181ebd63fd07464c4"
---

AGENT长任务处理新突破：ACM框架

长周期智能体任务会导致上下文长度迅速膨胀和噪声积累，导致即便在大上下文窗口模型中也会出现信息丢失或模型推理注意力分散的问题。现有的上下文压缩方案（如固定触发机制或启发式丢弃）往往与模型实时的推理重点不匹配，且无法有效平衡推理效率与关键信息的留存。

本文提出了 Agentic Context Management (ACM) 框架，该框架赋予智能体两类专用的内存操作工具：

1. **manage_context**：将当前对话压缩并转存至外部长效存储
2. **query_memory**：按需检索存储的原始信息

这一设计模仿人类短期与长期记忆的交互逻辑。此外，作者开发了一个基于双重约束（Dual-Constraints）的教师-学生微调流程：教师模型通过审阅智能体的轨迹，在需要压缩处"注入"操作，在过度压缩处"移除"操作，从而引导智能体自主学习在长周期任务中执行无损压缩和精确检索的准确时机。

## 实验结果

在 BrowseComp-Plus、DeepSearchQA 和 SWE-Bench Verified 等任务上的实验表明，ACM 显著提升了模型的任务表现（在 BrowseComp-Plus 上对比 ReAct 提升了 27%）。研究发现：

1. 有效的上下文管理可减少约 20% 的峰值 token 压力；
2. 压缩机制不仅没有损失信息，反而通过保持工作区整洁，延长了模型进行深度探索的窗口，并提高了在不同独立试验中解法的一致性；
3. 该方法使得 9B 参数规模的模型在某些指标上能够逼近甚至达到更大规模模型的性能水平。

#大模型 #人工智能
