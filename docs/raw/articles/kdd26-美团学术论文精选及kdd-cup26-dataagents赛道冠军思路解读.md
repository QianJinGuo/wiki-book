---
title: "KDD'26 美团学术论文精选及KDD Cup'26 DataAgents赛道冠军思路解读"
source: rss
source_url: "https://mp.weixin.qq.com/s?__biz=MjM5NjQ5MTI5OA==&mid=2651783138&idx=1&sn=31ddcb07ef2bf6c73c2415934ab288dc"
ingested: 2026-08-15
feed_name: WeChat-美团技术团队
source_published: 2026-08-13
sha256: 81e031d12f7eae4bcaffa0e488d989ae7b0281bcc82dea7c279aaf2cfb17ed3b
---

# KDD'26 美团学术论文精选及KDD Cup'26 DataAgents赛道冠军思路解读

原创 美团技术团队 2026-08-13 10:24 北京

KDD 2026 美团技术团队 8 篇精选论文 | 大众点评技术部荣获2026 KDD Cup 复杂数据分析Data Agents国际竞赛冠军、季军

点亮👆“☆”星标，不错过推送内容~

KDD（ACM SIGKDD Conference on Knowledge Discovery and Data Mining）是数据挖掘与知识发现领域最具影响力的国际顶级学术会议。KDD 以其严格的论文录用标准和深厚的学术影响力著称，是推动数据驱动研究与应用创新的重要平台。大会为学术界和工业界提供了交流前沿成果的高水平论坛，论文录用率通常在 15%-20% 左右，属于计算机领域的 CCF-A 类顶级会议。

本文精选了美团技术团队被 KDD 2026 收录的 8 篇论文进行分享，这些论文覆盖了推荐大模型、生成与奖励建模框架、智能体搜索、Transformer 框架、元泛化框架等技术领域。

🏆 此外，大众点评技术部还荣获了 2026 KDD Cup 复杂数据分析 Data Agents 国际竞赛的冠军、季军，本文介绍了团队比赛思路和解题策略。希望以上这些内容能够对大家有所帮助或启发。

## **01**

MTFM: A Scalable and Alignment-free Foundation Model for Industrial Recommendation in Meituan

论文下载：[PDF](<https://arxiv.org/pdf/2602.11235>)

论文简介：工业推荐系统通常涉及多个场景，而现有的跨域（CDR）和多场景（MSR）方法往往需要大量资源且要求严格的输入对齐，限制了其可扩展性。该论文提出了MTFM（Meituan Foundation Model for Recommendation），一种基于Transformer的框架，旨在解决上述挑战。MTFM不预先对齐输入，而是将跨域数据转换为异质Token，以无对齐的方式捕捉多场景知识。为提升训练效率，MTFM引入了多场景用户级样本聚合机制，显著减少了总实例数量，大幅提升训练吞吐量；同时融合了Grouped-Query Attention和定制化的Hybrid Target Attention，有效降低了内存占用和计算复杂度。

此外，论文还实现了多项系统级优化，如kernel融合和消除CPU-GPU阻塞，进一步提升了训练和推理吞吐。在**外卖** 等场景的离在线实验均验证了MTFM的有效性，证明了通过扩展模型容量和多场景训练数据可以实现显著的性能提升。基于MTFM，团队构建了服务于以上多个业务主场景的统一基座推荐大模型，替换各自的独立精排模型，并完成了全量。

02

CDRRM: Contrast-Driven Rubric Generation for Reliable and Interpretable Reward Modeling

论文下载：[PDF](<https://arxiv.org/pdf/2603.08035>)

论文简介：本文提出CDRRM，一个对比驱动的评分准则生成与奖励建模框架，旨在提升LLM对齐中奖励模型的可靠性、可解释性与数据效率。传统奖励模型是“黑箱”且依赖昂贵标注；现有准则方法存在冗余与偏见。CDRRM采用“对比-聚合”流程：先对比好/差回答定位关键差异，再聚合为简洁的任务相关准则，指导评判模型。实验表明，CDRRM在三个基准上达最先进水平，缓解话痨、位置等偏见，且仅用3千样本让未微调模型超越全量微调基线，兼具高效与可解释性。

03

LocalSearchBench: Benchmarking Agentic Search in Real-World Local Life Services

论文下载：[PDF](<https://arxiv.org/abs/2512.07436>)

论文简介：本文针对本地生活服务领域AI搜索的研究空白，构建LocalSearchBench评测基准。该基准涵盖国内 9 座城市、6 大服务品类，包含 900 道多跳问答任务，同时配套交互环境 LocalPlayground 与商户检索工具 LocalRAG。实验测评 16 款主流大语言推理模型后发现，当前模型在此类任务表现不佳，普遍存在信息完整性、可信度不足等问题。研究还剖析了模型工具调用、多跳推理等典型缺陷，为本地生活服务场景下智能体搜索的模型训练和基准测试提供了重要支撑。

04

Deterministic-Allocation and Anonymous Joint Advertising in E-commerce Platforms

论文下载：[PDF](<https://dl.acm.org/doi/epdf/10.1145/3770855.3818370>)

论文简介：针对联合广告拍卖场景中的算法无法同时满足匿名性和确定性分配的问题，导致实际应用中存在分配不公平和激励不兼容等问题，提出了JTransNet模型。匿名性要求拍卖结果仅依赖于竞标价值，而与参与者身份和顺序无关，确定性分配则保证同样的输入下分配结果唯一。JTransNet通过引入匿名性和确定性分配机制，结合可微分的NeuralSort排序方法，实现了端到端数据驱动的AMD自动化模型拍卖算法。该算法很好的解决了联合拍卖场景下多方出资的流量分配和扣费问题，在离线和在线实验中均显著提升了平台广告收益。JTransNet已在美团零售核心业务场景全量上线，促进了广告业务流量售卖的公平性与收益提升，同时为工业界大规模自动化模型拍卖机制算法设计提供了有效的解决方案。

05

UME: A Unified Meta-Generalization Framework for Cross-Domain ETA

论文下载：[PDF](<https://arxiv.org/abs/2606.00979>)

论文简介：在即时物流场景中，提单页面的预估到达时间（checkout page ETA）对提升用户满意度、优化调度策略和控制运营成本至关重要。在美团Keeta等国际化即时配送平台上，具有显著的跨域异质性，多域建模已成为核心需求。然而，现有方法面临三大挑战：一是无法泛化到完全未见过的新市场域，无法在冷启动阶段实现零样本预测；二是跨域特征空间不一致，新市场域由于缺乏历史数据积累导致离线统计特征结构性缺失；三是成熟域与冷启动域往往需要分别建模，阻碍了知识迁移并增加了维护成本。

为此，本文提出了UME（Unified Meta-generalization framework for ETA），一个统一元泛化框架。UME设计了统一双分支网络和基于超网络的元学习机制，通过域级知识和实例级上下文动态调制特征门控、专家注意力和最终预测，实现跨域关联建模和域内自适应。同时引入知识蒸馏策略弥合特征缺失带来的信息差距。该方法在离线实验与线上实验中均优于现有方法。

06

Generative Large-Scale Pre-trained Models for Automated Ad Bidding Optimization

论文下载：[PDF](<https://arxiv.org/abs/2508.02002>)

论文简介：现代自动竞价系统需要在整体效果、广告主多样化目标和现实约束之间取得平衡，反映行业不断变化的需求。近年来，条件生成模型（如Transformer和扩散模型）能够根据广告主偏好直接生成竞价轨迹，为传统基于马尔可夫决策过程的方法提供了有前景的替代方案。但这些生成方法也面临诸如离线与在线环境分布偏移、动作空间探索有限以及需满足CPM和ROI等约束的挑战。为此，我们提出了GRAD，这是一种可扩展的自动竞价基础模型。GRAD通过动作混合专家模块实现多样化竞价行为探索，并结合因果Transformer进行约束优化。

07

HMAF: A Hierarchical Multi-Slot GD-RTB Allocation Framework

论文下载：[PDF](<https://arxiv.org/abs/2606.09896>)

论文简介：在现代在线广告平台中，保证交付（GD）合约与实时竞价（RTB）拍卖共存并相互竞价。现有方法要么将GD与RTB的优化解耦，要么依赖启发式的优先级规则，因此无法在复杂的多坑位投放和曝光约束下，有效平衡短期收入最大化与长期合约交付目标。针对这些问题，我们提出了HMAF（分层多坑位分配框架），这是一个统一框架，旨在优化GD-RTB广告平台中的曝光分配。HMAF以“规划–校准–执行”范式为核心结构，将离线约束优化与在线决策相结合，统筹离线GD资源规划、动态校准GD与RTB的竞争强度，并在多坑位环境中做出实时的列表级排序决策。

08

MTGenRec: An Efficient Distributed Training System for Generative Recommendation Models in Meituan

论文下载：[PDF](<https://arxiv.org/pdf/2505.12663>)

论文简介：生成式推荐在搜索、推荐、广告领域得到越来越广泛的应用，在用户体验和平台收入方面均取得了显著的提升。随着生成式推荐模型Scaling Dense的发展趋势，业界越来越倾向于基于PyTorch生态构建下一代推荐模型训练引擎，最大程度上复用LLM的发展红利。然而，PyTorch 生态在对大规模稀疏Embedding训练的支持上，仍有较大的提升空间。因此，我们基于PyTorch 生态提出了MTGenRec训练框架，统一「稀疏-稠密」训练能力，满足工业级生成式推荐模型训练需求。

具体来说，针对稀疏ID我们提出使用动态Hashtable替换静态表，解决ID动态上下线的问题，方便用户使用；为了提升训练效率，我们提出自动合表、ID去重、变长序列负载均衡等技术，针对推荐场景进行极致优化。此外我们还开发了断点续训、混合精度训练、梯度累积、算子融合等配套技术。大量实验结果显示相比TorchRec baseline，MTGenRec能够取得1.6倍~2.4倍的训练加速比，同时保证训练精度不变。从8卡扩展到128卡，MTGenRec也取得了近似线性的扩展效率。目前MTGenRec已在美团内部多个核心场景落地使用。

* * *

| 大众点评技术部荣获2026 KDD Cup 复杂数据分析 Data Agents 国际竞赛冠军、季军

KDD Cup 是数据挖掘与知识发现领域全球公认的顶级赛事。在 2026 赛季的 DataAgents 赛道中，美团技术团队历时两个月，从全球参赛队伍中突围，最终摘得冠军与季军。

比赛考察的是模型在真实复杂数据场景下的理解与推理能力——多模态输入、非结构化文档、干扰信息识别，每一项都是当前 Agent 落地的硬骨头。

传统的 Data+AI 系统虽已在特定任务上取得显著进展，但端到端的分析流程仍高度依赖人类专家编排，成为制约数据分析可扩展性与适应性的主要瓶颈。为此，KDD Cup 2026 提出以「数据智能体（Data Agents）」破局——通过融合知识理解、推理与规划能力，自主完成任务拆解与规划、工具选择与调用、异构数据推理以及结果综合。复杂数据分析是其中的核心任务，主要挑战在于真实数据的「异构鸿沟」与推理链路的非线性复杂性。Data Agents智能体接收一份异构的多模态数据包（涵盖数据库、PDF 报告、JSON 数据、图表乃至视频等），并针对一个高层次的自然语言问题，自主编排包含并行分支、迭代循环与结果汇聚的复杂推理过程，最终给出准确答案，旨在推动构建真正自主的数据分析系统。

比赛中，队伍将点评「问点仔」建设过程中积累的 Agent Harness 能力迁移至赛题，利用业余时间构建了完整的 Agent 运行时，支持多类型数据文件的自主探索以及 SQL、Python 等分析工具的选择与执行。通过错误反馈、超时控制和自动重试等机制，提升智能体在长链路任务中的稳定性与容错能力。针对视频和非结构化文档等异构数据，还构建了多模态视频理解子智能体和非结构化文档 ETL 子智能体，进一步增强主智能体的数据提取、理解与综合分析能力。此次获奖验证了相关技术在复杂异构数据分析Agent场景中的有效性，也为后续持续提升「问点仔」智能化水平提供了技术积累。

目前，相关代码已在[GitHub开源](<https://github.com/zhezh/kddcup2026_champion>)，后续我们还会通过技术博客分享更多的技术细节，敬请期待！

* * *

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=ebb7463a&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMjM5NjQ5MTI5OA%3D%3D%26mid%3D2651783138%26idx%3D1%26sn%3D31ddcb07ef2bf6c73c2415934ab288dc>)
