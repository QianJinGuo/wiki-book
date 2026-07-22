---
title: 何恺明首个语言模型：105M参数，不走GPT自回归老路
source_url: https://mp.weixin.qq.com/s/RyuLfX29ZZP535uXveitug
publish_date: 2026-05-13
tags: [wechat, article, gpt, coding, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: b87d2ec9540c0859062d151715035c9db7a2828e71b66a262fc75044ee0c51ca
---
# 何恺明首个语言模型：105M参数，不走GPT自回归老路
**作者**：量子位（henry 发自 凹非寺）  
**平台**：微信  
**原始链接**：https://mp.weixin.qq.com/s/RyuLfX29ZZP535uXveitug  
**抓取日期**：2026-05-13  
**来源**：量子位 | 公众号 QbitAI
---
何恺明，也下场做语言模型了。
只不过，这次他带队做的不是大家熟悉的、像ChatGPT背后那套"预测下一个词元"（next token prediction）的自回归范式。
而是另一条过去几年在图像领域大火、如今正被越来越多人搬进文本生成的新路线：扩散语言模型（Diffusion Language Model，DLM）。
在最新的论文中，何恺明团队放出全新连续扩散语言模型：**ELF：Embedded Language Flows**。
与不少还停留在token层面做扩散的语言模型不同，ELF把整个生成过程都留在了连续的embedding空间里，直到最后一步，才重新离散化，将表示变回token。
靠着这套设计，ELF只用了**105M参数、45B训练token、32步采样**，就正面跑赢了一批主流扩散语言模型。
最直观的一项指标是它在OpenWebText上，把生成困惑度（Generative Perplexity）直接压到了**24**。
> **简单科普一下生成困惑度**：让一个强大的语言模型，给生成结果"检查作业"，看看这些文本到底像不像真实人类写出来的语料。值越低，说明生成质量越高。
## ELF到底做了什么
扩散语言模型主要有两种技术路线：
- **离散派**（MDLM、Duo）：直接在token空间做扩散，每一步处理离散随机变量
- **连续派**（Diffusion-LM、CDCD、DiffuSeq）：把token映成连续embedding，在连续空间里去噪
此前，离散路线占据上风。原因很简单：语言本身就是离散的。
恺明团队给出的判断恰恰相反——**问题可能不是"语言必须离散"，问题可能是：前人根本没有让连续路线，连续到底。**
Diffusion-LM这类方法虽然在embedding空间去噪，但每一步都要算一次token-level的交叉熵，把连续轨迹一路绑在词表上。
后来的LD4LG、Cosmos走latent diffusion路线，去噪过程是连续了，但要单独训一个decoder把latent解回token，相当于多一个模块。
**ELF的核心创新**：把所有denoising全留在continuous embedding space；直到最后一步 t=1，才重新投回token。
## 核心技术细节
### 把token变成连续embedding
ELF先用T5预训练encoder把离散token映射为双向contextual embedding（也测试了jointly trained embedding和随机embedding方案）。**注意**：这个encoder只在训练阶段使用，推理时不额外增加模块。
### 在连续embedding空间里做Flow Matching
- t=0时，是高斯噪声；t=1时，是干净的embedding；中间状态是rectified flow
- **x-prediction**：直接预测干净embedding（而非传统的v-prediction），最小化MSE
- 论文给出两个选择x-prediction的理由：
  1. 高维表示（768维+）上更稳定
  2. 天然和最后一步"预测干净token"的目标对齐
  3. v-prediction与denoising/decoding之间的权重共享不兼容
### 从连续embedding，再回到离散token
最后一步 t=1，把continuous embedding投回token空间。**关键**：decoder和前面的denoiser是同一个网络。
具体做法：
- 最后一步额外加入一次token-level corruption，构造带扰动输入
- 同一个网络输出clean embedding，再通过可学习的unembedding矩阵 W 投影成token logits
- 训练目标是标准的token-level cross-entropy loss
- 整个网络共享同一套参数，并额外接收一个二值mode token（去噪模式/解码模式）
### Self-CFG
ELF把图像生成里最常用的CFG（classifier-free guidance）搬过来了：用self-conditioning作为条件信号，套上training-time CFG（一次forward模拟两次推理，没有inference开销）。
## 实验对比
| 指标 | ELF | 主流离散扩散模型 |
|------|-----|----------------|
| 生成困惑度（OpenWebText） | **24** | 需要1024步才接近 |
| 采样步数 | **32步** | 1024步 |
| 训练token | **45B** | 500B+ |
在WMT14机器翻译和XSum文本摘要等条件生成任务上，ELF也稳定超过现有扩散语言模型，甚至压倒了部分自回归baseline。
**论文总结**：ELF在生成质量、采样效率和训练成本之间实现了很强的trade-off。连续派不是不能打，只是以前没把连续这件事做到底。
## 参考
- 论文：https://arxiv.org/pdf/2605.10938
- 恺明团队半年前的工作：《Back to Basics: Let Denoising Generative Models Denoise》