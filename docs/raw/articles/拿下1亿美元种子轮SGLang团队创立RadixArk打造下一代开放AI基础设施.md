---
tags: [wechat, article, claude, openai]
title: "拿下1亿美元种子轮sglang团队创立radixark打造下一代开放ai基础设施"
source: wechat
url: wechat
sha256: e208b477adf7c59b886a0c727c7b1fb876eb28a658faca1a60f7cbf870fd2cd2
date: 2026-05-17 10:05
---
---
source: wechat
source_url: https://mp.weixin.qq.com/s/sTQb2ffdHCbt7gFZ9m3c7w
ingested: 2026-05-16
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-05-08
---
# 拿下1亿美元种子轮！SGLang团队创立RadixArk，打造下一代开放AI基础设施
机器之心发布
> 当所有人都盯着模型层厮杀，一支手握开源推理事实标准的团队，带着硅谷最豪华的种子轮投资人阵容，正式将矛头对准了新时代的 AI 基础设施。
5 月 5 日，AI 基础设施初创公司 RadixArk 宣布完成 1 亿美元种子轮融资，投后估值 4 亿美元。无论金额、估值还是投资人阵容，这都是 2026 年 AI Infra 赛道中目前最重的一笔早期下注。
本轮由 Accel 领投，Spark Capital 联合领投。机构投资人覆盖了 NVIDIA 旗下 NVentures、AMD、联发科、Databricks，以及 Salience Capital、HOF Capital、Walden Catalyst、A&E Investment、LDVP、WTT Fubon Family 等一线机构。从 GPU 到 CPU，从边缘芯片到数据平台，核心硬件与系统层的关键玩家几乎全部到齐。
在顶级机构阵营之外，多位涵盖 Intel、Broadcom、OpenAI、xAI、PyTorch 等背景的全球技术领袖也以天使投资人身份参与了本轮投资。
「硬件三巨头 CEO + 顶级模型实验室创始人 + PyTorch 缔造者」，要在一笔种子轮里同时凑齐这个组合，在 AI Infra 的历史上都极其罕见。熟悉这一领域的投资人直言：这是在押注「下一代基础设施事实标准」。
全世界最好的推理引擎，在他们手里
RadixArk 的故事，必须从一个叫做 SGLang 的开源项目说起。
自 2023 年诞生以来，SGLang 在两年内以难以置信的迭代速度，成为开源大模型推理的事实标准之一，在 GitHub 积累了 27K+ stars，被部署在 400K+ GPU。每天有数万亿 token 的生产流量跑在 SGLang 之上，其用户包括 Google、Microsoft、NVIDIA、Oracle、AMD、LinkedIn、xAI、Thinking Machines Lab。
过去两年，模型架构经历 MoE、长上下文、Reasoning 模型、多模态融合等一系列剧变。每一次架构的重塑，SGLang 都做到了 Day-0 兼容——首创的开源模型发布即支持机制，性能直逼机器物理极限。被投资人反复提及的一个评价是，SGLang 的迭代速度与工程纪律合一的风格，在开源项目中绝对顶尖。
底层纪律的背后，是一支在系统与算法领域积累深厚的创始团队。
CEO 盛颖（Ying Sheng）本科毕业于上海交通大学 ACM 班，博士毕业于斯坦福大学，是 LMSYS Org 的发起者及 SGLang 的主要创始人之一。她博士期间曾作为访问学者在 UC Berkeley Sky Lab 进行研究，先后就职于 Databricks 和 xAI，曾担任 xAI 推理团队负责人。盛颖在注意力稀疏化、KV 缓存复用等方向的工作备受业内关注，SGLang 早期的 RadixAttention 机制即是其代表作之一。
CTO 朱邦华（Banghua Zhu）本科毕业于清华大学电子工程系，博士毕业于 UC Berkeley，师从机器学习泰斗 Michael I. Jordan 与 Jiantao Jiao。博士期间曾联合创立 Nexusflow，后被英伟达收购，出任英伟达 Principal Research Scientist。在他经手过的项目里，既有面向工业级训练系统的整套搭建，也有 NVIDIA 内部底层系统优化与大规模训练上的长期积累。
某核心硬件厂商的技术负责人评价，这是 2026 年 AI Infra 创业中最有含金量的一组创始人组合：一边是握住开源推理事实标准的研究型创业者，一边是来自 GPU 厂商最核心研究层的大模型算法行家。
手握每天吞吐万亿级 token 的推理引擎 SGLang——这本身已经是 AI Infra 创业的梦幻起点。而这支团队的牌，还不止这一张。
Day-0 驯服 DeepSeek V4 强化学习
除了推理引擎，RadixArk 在训练端同样有所突破。
2025 年 11 月，团队开源了强化学习框架 Miles，主攻大规模 RL 训练的稳定性与效率，目前已被超 20 支团队用于 MoE 模型的强化学习训练。
2025–2026 年，Reasoning、Tool Use、Agentic 能力的竞争全面升级，而每一步进步背后，都需要一套能扛住超大规模分布式 RL 的系统。业内观察人士指出了一个被反复提及却长期无法解决的痛点：今天大模型团队最痛苦的，远超出任何一段单点优化。从训练到 RL 再到上线推理这条完整链路上的边界摩擦，每一段单独看都接近最优，拼在一起却处处掉效率。
Miles 与 SGLang 的组合，正试图填平当前大模型团队在「训练-RL-推理」完整链路上面临的效率断层。
新模型 Day-0 支持能力是 Infra 团队工程实力的直观体现。
4 月 25 日，架构复杂的 DeepSeek-V4 发布。当天，SGLang 和 Miles 便实现了对 DeepSeek-V4 推理和 RL 训练的同时支持。这得益于团队底层的系统级优化，包括为混合注意力设计的 ShadowRadix 前缀缓存、单次芯片内完成压缩的 Flash Compressor，以及将 Top-K 延迟压缩至 15 微秒的 Lightning TopK，并打通了从 FP8 推理到 BF16 训练的完整 RL 管线。
全栈共识背书：
巨头们集体入局，到底在焦虑什么？
NVIDIA、AMD、联发科、Broadcom、Intel——硬件层最关键的公司，同时出现在种子轮，在行业内几乎是不可想象的。事实上，硬件厂商比任何人都清楚，当下算力仍然昂贵且稀缺，仅靠堆硬件已经无法持续。一个真正硬件解耦、能在异构平台上将芯片性能压榨到极限的开源推理系统，是他们最迫切需要的最大诉求。
Databricks、PyTorch 缔造者、OpenAI / Thinking Machines / xAI 的一线人物同时入局，则代表了模型与系统层对「训练-推理一体化基础设施」的强烈预期。天使阵容中的每一个名字，都意味着一个极度精准的下注视角：
* 陈立武，Intel CEO，半导体行业深耕数十年的泰斗级人物。
* John Schulman 是 OpenAI 前联合创始人，Thinking Machines Lab 联合创始人，强化学习的奠基人之一。
* Soumith Chintala——PyTorch 联合创始人，全球深度学习框架的守门人。
* Igor Babuschkin，xAI 前联合创始人，亲手搭过业界最复杂的训练系统与硬件平台。
* Lilian Weng，Thinking Machines Lab 联合创始人，对 AI 系统的工业级落地有最一线的洞察。
当这些在任何场合都能独自撑起一轮融资的人，选择集体出现在同一张 cap table 上，便是未来的热切押注。
面向所有人的基础设施：
让 AI 的建设权，不再被少数人垄断
RadixArk 的愿景，用一句话可以概括：让 AI 基础设施，成为像电力一样普及、可靠、不被任何人垄断的公共品。这听起来像个理想主义宣言，但从实际落地来看，他们正在将这句话变为现实：
* 学术界
三年前，一个做 LLM 推理优化的博士生面前通常只有两个选项：一个是 OpenAI 的 API，按 token 计费、看不到任何内部结构；另一个是古早的开源代码，README 里写着「works on a single GPU」，离论文里要实现的真实分布式场景隔着数年的工程量。
SGLang 打破了这个二选一——工业级日吞吐、代码完全开放，斯坦福、伯克利、CMU、UW 的系统研究组默认将其设为 baseline。对做 agent 的研究者而言，RadixAttention 的 prefix cache 把共享前缀组织成树状结构、相同 KV 只算一次，原来要跑两天的实验半天就能跑完，本地推理论文引用 SGLang 几乎成了默认动作。
* 初创公司
一群离开大厂的工程师，带着对某个垂直场景的深刻理解出来创业。他们没有百万美元的算力预算，没有专门的 Infra 团队，只有对产品的一腔直觉。
过去，搭建生产级推理管线、维护跨硬件兼容性的工程重负，往往超出种子轮公司的承受上限，大量时间消耗在重复造轮子上。现在，他们可以直接站在 SGLang 之上拉起接近前沿性能的推理服务，用 Miles 训练领域专属模型——基础设施不再是瓶颈，省下的时间和钱可以全部投入他们真正想造的东西。
* 科技巨头
为什么 Google、Microsoft、NVIDIA 这些拥有全世界最强内部 Infra 的巨头，也会出现在 SGLang 的用户列表里？答案藏在本轮投资人结构中——NVIDIA、AMD、联发科、Broadcom、Intel 五家核心硬件厂商同时入局。它们比任何人都清楚，一个硬件无关、不被任何竞争对手锁定的开源推理系统对整个生态意味着什么。使用一个被社区共同维护、多家硬件厂商共同支持的开源系统，本身就是更高维度的基础设施战略。
RadixArk 的官方表述没有煽情，但足够锋利：
「下一代 AI 不应该被对私有基础设施的访问权所限制。更多团队应该能够拥有自己的模型、自己的系统、自己的未来。」
这 1 亿美元的种子轮融资，就是要让这句话变成工程现实：让 SGLang 成为任何新模型的 Day-0 生产标准；把 Miles 做成大规模训练与 RL 的基础设施级框架；然后，在开源内核之上，建一套不锁定模型、不绑架客户、却提供顶级基础设施能力的托管平台。
RadixArk 的愿景，从来不是取代谁。而是让一个学术实验室、一个三人工作室、一家刚拿到种子轮的初创公司，和市值万亿的巨头——站在同一条基础设施起跑线上。
如果说 2023 年的 Anthropic、2024 年的 Mistral、2025 年的 Thinking Machines Lab 各自代表了 AI 模型层一次方向性的下注，那么 2026 年的 RadixArk 下注的东西更底层、也更漫长：让前沿 AI 的建设权，真正回到足够多的人手里。
而融资落定之后，团队发起了一项面向开源社区的回馈: 参与注册平台并转发推特，即可在RadixArk 托管平台正式上线后获得免费使用积分。对于这支从开源社区生长出来的团队而言，这是用真金白银的算力，感谢那些一路支撑 SGLang 走到今天的人。
* 链接：platform.radixark.com
寻找那些对几毫秒延迟都无法容忍的人
RadixArk 目前正在全球范围招聘，系统、模型、编译器、内核、调度、评测等各条线全面开放。如果你也会因为几毫秒延迟睡不着觉，会为两次内存拷贝的冗余来回推敲，看到不优雅的系统就浑身不舒服，不动手改掉，绝不罢休。这或许是今年最值得认真考虑的一封简历。
* 简历投递入口：  https://job-boards.greenhouse.io/radixark
© THE END
转载请联系本公众号获得授权
投稿或寻求报道：liyazhou@jiqizhixin.com