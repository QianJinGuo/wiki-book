---
title: "多轮 Agent 场景下，滴滴的 EAGLE-3 训推加速实践"
sha256: 618aaaaa90e8aa9f81c196b97b3221fdd615557d36ab1dd0195e4c5c90bd6a2f
source_url: "https://mp.weixin.qq.com/s/PZMX-55W_gqJKtHIYXJVyA"
original_title: "多轮 Agent 场景下，滴滴的 EAGLE-3 训推加速实践"
author: ["封宇", "唐永振"]
publication: "滴滴技术"
published_date: 2026-05-14
created: 2026-05-15
updated: 2026-05-15
type: raw
tags: [speculative-decoding, eagle-3, agent, inference-optimization, didi, specforge, llm-inference, sequence-parallelism]
review_value: 8
review_confidence: 8
review_score: 64
review_stars: 4
review_recommendation: "入库"
source: wechat
---
# 多轮 Agent 场景下，滴滴的 EAGLE-3 训推加速实践
> 原文来源：滴滴技术（微信公众号），2026-05-14
## 概述
过去两年，大语言模型（LLM）的应用形态从 ChatBot 快速演进为 AI Agent。在自动化代码工程、长文档分析、多轮工具调用等复杂工作流中，上下文长度已从千级 token 扩展至数十万级；与此同时，LLM 的自回归生成具有强串行特性，导致延迟和吞吐成为制约用户体验与成本的核心瓶颈。
围绕这一问题，本文基于开源投机采样框架——SpecForge，介绍滴滴在多轮 Agent 场景中对 EAGLE-3 训练与推理的实践。在训练侧，针对 EAGLE-3 在长序列场景中的显存与通信瓶颈，引入统一序列并行（USP），使得在大规模集群上训练 128K 乃至更长上下文成为可能；在推理侧，相较 MTP 方法，EAGLE-3 在长序列场景中可实现超过 **2 倍** 的 TPOT（Mean/P95）收益。
## 核心要点
### 1. 为什么 Agent 场景需要极致推理速度
- **延迟复合放大**：Agent 执行"思考—行动—观察—再规划"多轮循环，生成 500 tokens 的"思考过程"在 20 tokens/s 速度下需 25 秒，10 轮循环可达分钟级
- **memory-bound 瓶颈**：每生成一个 token 都需执行一次前向计算并伴随对显存的高频访问（权重访问 + KV cache 读写）
- **串行依赖**：自回归顺序依赖使整个生成过程难以并行优化
### 2. 投机解码的核心逻辑
**两阶段流程**：
1. **Draft**：生成一段候选 token（用更便宜的方式写草稿）
2. **Verify**：Target 模型一次前向整体校验
3. **Accept/Reject**：通过的直接输出，失败则回退重来
**加速效果取决于两个因素**：
- Draft 的生成成本
- Accept Len（单次可被接受的 token 数）的长度与稳定性
在 Agent 长上下文场景（工具调用历史、长链路推理、代码/文档混合输入），高熵片段密集，前序一步偏差往往导致整段作废，Accept Len 容易骤降。
### 3. 为什么选 EAGLE-3
对比各投机路线（MTP、Model-free、独立小 Draft、多头预测）：
- **长序列是前置条件**：在 Agent 场景中 64K/128K+ 是常态，只用 2K/4K 训练会导致高熵段频繁掉链子
- **EAGLE-3 的优势**：用 TTT（Training-Time Test）机制按真实推理流程对齐训练，让长上下文下的连续放行长度更稳
### 4. EAGLE-3 训练形态与显存问题
#### 4.1 多层特征融合
EAGLE-3 的 Draft 融合 Target 的低层/中层/高层特征：
- **低层**：局部形式、短程线索
- **中层**：结构与模式
- **高层**：语义与决策信号
代价：需要保留多层特征参与计算，反向传播时保存更多中间激活，显存开销随序列长度增长进一步放大。
#### 4.2 TTT（Training-Time Test）
- **传统训练**：以 ground truth 历史 token 作为条件，训练-推理分布不一致
- **TTT 机制**：按照真实 decode 流程展开——先生成一步预测，再将该预测作为下一步输入，多步递进
#### 4.3 显存 OOM 的本质
一句话总结：EAGLE-3 的显存问题来自 **<长序列 L × TTT 展开步数 k × 多层特征带来的额外中间态>** 的叠加，而不是 Draft 参数量本身。
### 5. 解决方案：USP（Unified Sequence Parallelism）
#### 5.1 两种序列并行方式
- **Ulysses（按 head 切分）**：All-to-All 重排，将 attention 计算分摊到不同 head 上，吞吐易提升；但切分粒度受 head 数限制
- **Ring（按序列切分）**：ring attention 通信，将 KV/中间状态按 token 分布到多卡，显存可随 SP 规模近似线性下降
#### 5.2 核心设计
USP 将两者统一协同：
- **主干（Main）**：沿用 ring attention（causal attention），将主干历史按 token 分片分布到多卡
- **TTT 分支（Branch）**：在本卡完成增量更新（TTT 步数通常在 7 以内）
- **Fusion（流式 softmax 融合）**：采用流式 softmax，在引入分支增量的同时持续维护归一化过程
#### 5.3 效果
- **显存可控**：每张卡仅需保存 1/SP 的主干 KV 与中间态
- **训练更稳**：借助 LSE 融合保证分布式切分下归一化口径一致
- **吞吐更高**：最重的主干计算交由高效 ring attention 路径处理，分支采用轻量级增量更新
### 6. 工程实践补齐
1. **输入与 loss 计算都按 SP 分片**：显存随卡数近似线性下降
2. **统一训练口径**：将 backend 差异收敛到 adapter，减少漂移问题
3. **压缩 hidden states**：存储下降约 25%，Accept Len 保持 1.93，time/step 仅增加 4%
### 7. 实测效果
**Accept Len 对比**：EAGLE-3 的平均 Accept Len 约为 MTP 的 **2.2–2.3×**
**P95 TPOT**：在并发 1–32 范围内，EAGLE-3 相对 MTP 在 P95 TPOT 上稳定降低约 **35%–44%**
**Mean/Median TPOT**（并发 8）：
- EAGLE-3：Mean TPOT 4.38，Median TPOT 3.27
- MTP：Mean TPOT 10.67，Median TPOT 11.70
- **Mean TPOT 降幅 ≈ 59%（≈ 2.4×）**
### 8. 当前挑战与后续规划
**挑战**：
1. **OOD（分布偏移）**：Accept Len 为何会掉，如何长期稳定
2. **长序列训练与特征管线成本仍高**：Offline 依赖 hidden states 落盘与搬运，Online 与线上服务争抢资源
3. **系统要面向"稳定收益"**：P95/P99 稳定收益比 mean 更重要
4. **算法快速演进**：Infra 必须可插拔
**规划**：
- **A**：分离式特征生成 + 训练解耦（Mooncake store）
- **B**：近线/在线快速迭代（周/月级 → 天级/小时级）
- **C**：更强表达的 Draft + 路由专精（MoE / Routing Draft）
- **D**：面向未来范式的可插拔框架
---
## 相关链接
- SpecForge GitHub PR: https://github.com/sgl-project/SpecForge/pull/425
- SpecForge GitHub PR: https://github.com/sgl-project/SpecForge/pull/454
- EAGLE-3 论文: arXiv:2503.01840