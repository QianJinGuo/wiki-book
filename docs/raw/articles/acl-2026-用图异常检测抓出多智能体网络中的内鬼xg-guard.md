---
source: wechat
source_url: https://mp.weixin.qq.com/s/V1NTbaNsWKgwq-iTPaqgSA
ingested: 2026-07-10
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-07-10
sha256: e8ac4af480f1cd537115ab24103f5290ec918bd1b117036f636fd9109040b429
---

# ACL 2026 | 用图异常检测抓出多智能体网络中的内鬼！XG-Guard：首个无监督、可解释、细粒度的MAS安全防线

引言

  


从单一 LLM Agent 发展到多智能体系统（Multi-Agents System, MAS），Agents 解决问题的能力得到了很大提高。然而，这些 Agents 之间的通信也放大了安全风险。一个受攻击的 Agent 可以在协作推理中插入恶意信息，导致其他 Agents 沿着错误的逻辑链推理，或被引导进行恶意行为，最终共同收敛到有缺陷甚至有害的输出上。

  


为了解决这个问题，近期工作引入了图异常检测（Graph Anomaly Detection, GAD）用于防御恶意 Agents。作为一种无监督防御范式，其通常将问题建模成图结构，并在其之上训练一个 GAD 模型来找到被攻击的 agent 节点，并阻断其输出的误导性内容的传播。然而，现有方法虽然能起到一定作用，但仍然面临两大瓶颈：

  


缺陷 1：只看得到粗粒度信息，忽视细粒度信息

  


现有方法将 Agents 的完整文本输出，压缩为单个句子表征向量来用于后继检测。然而恶意行为往往隐藏在长篇大论中，比如大量套话中冷不丁冒出几句恶意指令，或注入的隐私窃取工具调用。目前的建模思路将这些关键短句和大量套话一同塞入句子表征向量，使得异常特征不再明显。

  


缺陷 2：缺乏可解释性

  


并且，这类方法只能做出判断该 Agent 是否为异常，却无法揭示是什么为什么是异常。这种不透明性不仅妨碍人工介入检查系统漏洞，也削弱了这类方法在实际部署中的可靠度。

  


为解决上述局限性，研究团队提出了 XG-Guard (eXplainable and fine-Grained safeGuarding framework), 一个基于 GAD 且兼具可解释性和细粒度检测能力的无监督安全防护框架。目前工作已被 ACL 2026 Main Conference 接收。

  


  


  * 论文标题：Explainable and Fine-Grained Safeguarding of LLM Multi-Agent Systems via Bi-Level Graph Anomaly Detection

  * 论文链接：https://arxiv.org/abs/2512.18733

  * 代码链接：https://github.com/CampanulaBells/XG-Guard

  * 论文作者：Junjun Pan, Yixin Liu, Rui Miao, Yu Zheng, Kaize Ding, Quoc Viet Hung Nguyen, Alan Wee-Chung Liew, Shirui Pan

  


核心贡献包括: 

  


  1. 问题建模创新：本文首次实现具备可解释性的无监督 GAD 的多智能体系统（MAS）防御。

  


  2. 方法设计贡献：本文提出 XG-Guard，通过学习粗细粒度的表征 + 基于对话主题的异常检测，兼顾了无监督场景下对异常 Agents 的有效检测和解释。

  


  3. 实验验证与效果：多种 MAS 拓扑结构与不同攻击策略下的大量实验表明，XG-Guard 在防御性能上始终表现优越，同时能够为做出的决策提供可靠的解释。

  


方法解读

  


XG-Guard 核心思想建立在同时感知词语和句子粒度的表征，而后通过对话主题捕捉异常语义，最后融合粗细粒度证据提供量化解释。具体来说，XG-Guard 包含三个关键模块：

  


  


阶段一：双层智能体表征编码（Bi-Level Agent Encoder）

  


为了同时兼顾宏观的对话语境与微观的词汇细节，XG-Guard 摒弃了单一的粗粒度文本编码，而是为每个 Agent 的输出都构建了粗细粒度的特征：

  


  * 粗粒度特征 (Sentence-leve)：捕获发言的语义大意。

  


  * 细粒度特征 (Token-level）：捕获每个词语的的语义细节。

  


随后，框架利用图神经网络（GNN），在通信图上进行消息传递，得到节点的 encoding。

  


  


借此，Agents 的 encoding 在这个过程中，不仅包含了粗细粒度的文本语义，还融合了通信图的结构化信息。

  


阶段二：基于对话主题的无监督异常检测 (Theme-based Anomaly Detector)

  


正常 MAS 协作解决问题的过程中，Agents 的发言应当始终围绕当前的任务和讨论主题展开。而相反的，恶意 Agents 的发言则为了扭曲结果而偏离主题，或者带有隐蔽恶意的言论。

  


XG-Guard 利用此直觉，设计了基于主题的异常检测器，来实现无监督异常检测：

  


系统首先聚合当前当前对话的特征，得到对话主题原型（theme prototype）:

  


  


接着，通过度量各个 Agent 的表征与该主题原型的距离，计算出句子级别，和词元级别的异常分数: 

  


  


这里算出的两个分数也为后继融合否提供可解释性奠定了基础。

  


阶段三：双层分数融合与异常解释机制

  


一般来说，theme prototype 代表了正常主题。但是由于 token-level 对于细粒度的异常信息极度敏感，故 token-level theme prototype 可能会错误地反应异常 Agents 带来的恶意主题信息。因此，直接组合粗细粒度信息会导致这种情况下效果变差。为了解决这个问题，XG-Guard 引入了基于协方差的分数融合机制，确保句子和词元之间的分数能够对齐: 

  


  


通过将句子和词元级别的异常分数融合到统一的框架内，XG-Guard 也借此获得了可解释性。XG-Guard 能够通过对齐后的词元级异常分数，来高亮出恶意关键词，为异常检测提供了可解释性，增加了方法的透明度。

  


  


这种内生的细粒度可解释性，为安全审计提供了极高的透明度。

  


阶段四：隔离恶意 Agents，避免恶意传播

  


在精准定位到恶意 Agents 后，系统会触发通信隔离策略，实时裁剪恶意 Agents 在图拓扑中的所有通信边，阻断恶意信息在 MAS 内部的扩散，避免恶意 Agents 影响其余正常 Agents 之间的协同工作能力。

  


实验结果

  


我们在多种不同的 MAS 通信结构和攻击模式下进行了测试。实验结果说明 XG-Guard 在无监督场景下具有卓越的异常检测性能。

  


1\. 主实验

  


  


在严格无监督 (无人工攻击标签标注，训练集仅包含正常对话) 的设定下，XG-Guard 在各个指标（ROAUC、ASR@3）上均显著超越了现有的先进无监督异常检测方法，并且在一些数据集上都获得了和有监督 Baseline 持平的好效果。

  


  


我们也用了其他 LLM backbone 进行测试 (如 GPT-4o-mini、DeepSeek-V3、Qwen-30B-A3B)。实验结果展示出，XG-Guard 在各个 backbone 上均保持了稳定的高性能表现，说明了其良好的泛化能力。

  


2\. 消融实验

  


  


为验证 XG-Guard 各组件的必要性，我们分别移除分数融合机制 (-Fusion) 或细粒度信息 (-Token)。结果显示移除任一核心组件都会导致检测性能显著下降。 

  


去掉细粒度后，模型难以捕捉隐藏在少数词汇中的恶意信号，导致检测结果明显下降；而去掉自适应混合以后，模型难以区分正常话题偏移与真正的异常行为，有时甚至真假不分，导致 ROAUC 小于 50%。只有同时所有模块，才能实现既稳定又可靠的异常检测。

  


3\. 可解释性

  


  


可视化结果显示，XG-Guard 的粗细粒度架构能够有效地找出到底是那句话导致的异常，如 (a) 中，恶意 Agent 传播的误导性信息，或 (b) 中，agents 尝试调用工具来盗取个人资料。

  


总结

  


总而言之，XG-Guard 提出了一套全新的无监督 MAS Safeguarding。通过引入词元级的特征，XG-Guard 不仅能有效检测出恶意 Agents, 更能为决策提供解释，增进了异常检测系统的透明度。

  


作者介绍

  


本文第一作者为潘钧君（Junjun Pan），主要研究方向为图异常检测（Graph Anomaly Detection）。目前作为博士生于Griffith University潘世瑞教授（Shirui Pan）的 TrustAGI 研究团队开展科研工作。

  


© THE END

转载请联系本公众号获得授权

投稿或寻求报道：liyazhou@jiqizhixin.com
