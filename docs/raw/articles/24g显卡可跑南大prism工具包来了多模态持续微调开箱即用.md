---
source: wechat
source_url: http://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721233&idx=2&sn=9115be24ecfdfcaa348e0805e133521f&chksm=96e5be91a19237876de77709d5dc3ff40688fcbf5b85ee9c717923c50355a9a69c24760804d3#rd
ingested: 2026-07-02
feed_name: PaperWeekly
wechat_mp_fakeid: MP_WXS_3201788143
source_published: 2026-06-27
sha256: b66573a3efd28e215879b98fc8503fb5447faa9d4e1c1d15f66991eb02693e49
---

# 24G显卡可跑！南大PRISM工具包来了，多模态持续微调开箱即用

#  24G显卡可跑！南大PRISM工具包来了，多模态持续微调开箱即用

原创  让你更懂AI的  让你更懂AI的  [ PaperWeekly ](<javascript:void\(0\);>)

__ _ _ _ _

在小说阅读器读本章

去阅读

在小说阅读器中沉浸阅读

##

南京大学 LAMDA 团队推出 PRISM，用插件式架构和全栈精度调度，把多模态持续指令微调实验压到 24G 显卡上。

多模态大语言模型（MLLM）通过指令微调统一了视觉理解与视觉-语言任务，但真实部署要求模型按序学习新任务而不遗忘旧能力——这正是  多模态持续指令微调（MCIT）  的核心挑战。

然而，现有 MCIT 研究面临两大瓶颈：

一是硬件门槛，MLLM 的持续训练被认为必须依赖多卡高显存集群；

二是工程壁垒，各方法维护独立大模型代码副本，新方法接入与跨方法对比成本极高。

南京大学 LAMDA 团队提出的  PRISM  ——一个  低门槛、插件式、可复现、持续维护  的 MCIT 研究基础设施，在 24G 显卡上即可完成从训练到评估的完整实验流程。

PRISM 基于全栈定制的精度调度、骨干注册表与插件式方法接口，支持四种精度模式、多种 MLLM 骨干与 12 种 MCIT 算法，配合子数据集快速验证机制，实现一天内完成多轮方法迭代，为 MCIT 领域建立起真正「开箱即用」的研究基座。

论文标题：

Prism: A Plug-in Reproducible Infrastructure for Scalable Multimodal Continual Instruction Tuning

论文地址：

https://arxiv.org/abs/2605.26110

代码链接：

https://github.com/LAMDA-CL/Prism

引言

多模态持续指令微调旨在使 MLLM 能够按序学习新任务而不遗忘旧能力，是连接大模型能力与现实部署需求的核心技术。然而，该领域的发展长期受制于两道隐性壁垒。

一是硬件壁垒。  MLLM 的持续训练通常被认为需要多卡高显存集群，这极大地限制了研究者的参与范围。

二是工程壁垒。  现有工具箱为每种方法维护独立的 MLLM 代码副本，新方法接入、跨方法对比、跨骨干迁移的成本极高，研究者大量精力被耗费在工程上而非算法创新上。

PRISM 从底层打破这两道壁垒。它并非一个「能跑实验」的代码仓库，而是一个  让研究者用消费级硬件、以小时为单位迭代方法  的基础设施：

24G 显卡  ：PRISM 针对 MLLM 的持续学习场景，定制了一套完整的量化训练方案。LLM 主体采用 bitsandbytes 8-bit 加载（QLoRA 风格），计算与 LoRA 适配器保持 bf16 精度。

同时对  mm_projector  等关键多模态连接模块跳过量化，并为 SAME、MoE-LoRA 等自定义调优器专门实现了  Linear8bitLt  兼容层，确保量化状态下路由与专家逻辑仍能正常工作。

在这一配置下，可将 InternVL 本体、其视觉编码塔，以及用于路由的 CLIP vision tower 和 text tower  全部载入同一张卡  。

一天 5–6 版迭代  ：高度结构化的模块划分、清晰的项目目录、以及 12 种可参考的方法实现，使 AI Agent 能在高密度的上下文中快速理解项目逻辑。

配合对各类 benchmark 的  子数据集（sub-split）  支持，无需等待全量数据跑完，即可在当天完成多轮「改方法 → 训练 → 评估」闭环。

Vibe coding 友好  ：插件式  CLIntegration  接口、集中式  config/  配置、统一的  run.py  入口，让 Agent 都能以最小上下文代价定位改动点，显著缩短从 idea 到可运行代码的路径。

本文的贡献可以总结如下：

* 提出了 PRISM 框架  ，一个低门槛、高可复现的 MCIT 研究基础设施，使 24G 消费级显卡即可完成完整 MCIT 实验流程，大幅降低领域准入门槛。

* 设计了全栈定制的精度调度系统与骨干注册表  ，支持四种精度模式（bf16 / fp16 / 8bit / 4bit）与多种 MLLM 骨干（LLaVA-1.5 / InternVL-Chat），实现方法的即插即用与高效对比。

* 集成 12 种 MCIT 算法与 3 套标准 benchmark  ，配合子数据集快速验证机制，实现一天内完成 5–6 版方法迭代。

PRISM 系统设计

PRISM 的整体架构如图 1 所示。其核心设计理念是  将精度控制、骨干适配与方法逻辑完全解耦  ，实现各组件独立演进与灵活组合。

〓  图1：PRISM 框架总览：支持多种 benchmark、MLLM 模型、MCIT 方法和各种训练配置。与现有的 MCIT 工具包相比，PRISM 有更加清晰简洁的项目结构，降低了理解代码和工程开发的难度。PRISM 通过统一的插件接口，将数据、模型、方法与评估全流程解耦，对任意一个部分的扩展无需改动其他部分，具备长期可扩展性。

2  .1 全精度配置：一套接口，四种模式

PRISM 在训练与推理两端提供统一的精度抽象层，  12 种 MCIT 方法全部打通  ，精度切换与算法逻辑完全解耦：

一行设置即可切换：

    TRAIN_PRECISION = "8bit"      
    INFER_PRECISION = "bf16"      

与 QLoRA 不同，PRISM 的量化方案是  面向 MCIT 全栈定制  的：不仅处理了 LLM 主体的 8-bit 加载，还将多模态投影层、视觉塔、路由塔与自定义 PEFT 调优器纳入统一的精度调度——各组件以适配自身角色为前提协同工作，而非简单套用现成量化脚本。

在 24G 显存的极限条件下，PRISM 仍可将 InternVL 大模型、InternViT 视觉塔，以及 CLIP 的 vision tower 与 text tower 同时载入——这意味着即使是显存开销较大的路由类方法，对算力资源的要求也大幅降低。

2.2 多 MLLM 骨干：即插即用，持续扩展

PRISM 通过骨干注册表（Backbone Registry）将 MLLM 架构与持续学习逻辑彻底解耦。目前已支持  LLaVA-1.5  与  InternVL-Chat  两套主流骨干，切换只需一个参数：

    python run.py train 0 --benchmark trigap --method same --backbone llava  

PRISM 自动处理骨干间的差异——检查点命名后缀、视觉塔加载方式、对话模板、路由特征维度、方法级超参覆盖等，研究者无需关心底层细节。

当增加新型 MLLM 时，只需按注册规范扩展骨干配置，  所有已集成的 MCIT 方法即可自动获得支持  ，无需逐方法、逐基准地重写加载逻辑。

2.3 插件式方法集成

PRISM 的核心抽象是  CLIntegration  接口，定义了持续学习方法的完整生命周期：模型初始化、前向钩子、跨任务状态持久化等。

新方法在  method/custom/<name>/integration.py  中实现上述接口，用  @CLMethodFactory.register("name")  注册即可接入统一流水线，无需修改  run.py  或训练器。

自定义 PEFT 调优器注册在  PEFT/tuners/custom/  下。

2.4 统一训练流水线

以  run.py  为唯一入口，编排配置读取 → DeepSpeed 分布式训练 → 检查点保存 → 推理 → 指标聚合的全流程。

所有实验参数集中在  config/methods  中。

基准数据集

PRISM 目前集成三套 MCIT 标准基准，任务均按固定顺序依次学习：

* CoIN  （8 任务）：覆盖 ScienceQA、VQA、分类、定位等经典视觉理解任务；

* UCIT  （6 任务）：涵盖 ImageNet-R、ArxivQA、CLEVR、Flickr30k 等异构任务序列；

* TriGap  （10 任务）：面向长序列、大领域差距场景，覆盖文档理解、医学影像、化学、灾害监测等专业领域。

实验结果

〓  表1、表2: UCIT 和 TriGap 上各个方法的实验结果。PRISM 能够兼容多种类型的持续学习方法，包括但不限于基于回放、MoE 架构、动态网络、正则化以及基于提示（Prompt-base）的方法。

总结与展望

PRISM 旨在促进多模态大模型持续指令微调的发展：  降低 MCIT 研究的准入门槛，加快迭代速度。

24G 显卡、四种精度自由切换、多种骨干即插即用——硬件不再是障碍。

高度结构化的项目设计、12 种可参考的方法实现、子数据集快速验证——配合 Vibe coding 工作流，研究者和 AI Agent 可以在一天内完成 5–6 版方法迭代，把精力从工程细节转向算法创新。

未来，PRISM 将被长期维护并持续扩展更多 MLLM 骨干与 MCIT 方法，支持更多的精度优化策略。

我们欢迎社区贡献，共同推动多模态持续学习领域的标准化与可复现性建设。

** 更多阅读  **

[ ](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721067&idx=2&sn=82b23158c4f51801488304b5d6a10f5c&scene=21#wechat_redirect>) [ ](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247720971&idx=2&sn=dbc7ce93a7438c76efc3a48af0dfbb9d&scene=21#wechat_redirect>) [ ](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247720700&idx=1&sn=a384ebb6f68638abaf2dcfa264c2eef1&scene=21#wechat_redirect>)

** #  投 稿 通 道  #  **

** 让你的文字被更多人看到  **

如何才能让更多的优质内容以更短路径到达读者群体，缩短读者寻找优质内容的成本呢？  ** 答案就是：你不认识的人。  **

总有一些你不认识的人，知道你想知道的东西。PaperWeekly 或许可以成为一座桥梁，促使不同背景、不同方向的学者和学术灵感相互碰撞，迸发出更多的可能性。

PaperWeekly 鼓励高校实验室或个人，在我们的平台上分享各类优质内容，可以是  ** 最新论文解读  ** ，也可以是  ** 学术热点剖析  ** 、  ** 科研心得  ** 或  ** 竞赛经验讲解  ** 等。我们的目的只有一个，让知识真正流动起来。

📝  ** 稿件基本要求：  **

• 文章确系个人  ** 原创作品  ** ，未曾在公开渠道发表，如为其他平台已发表或待发表的文章，请明确标注

• 稿件建议以  ** markdown  ** 格式撰写，文中配图以附件形式发送，要求图片清晰，无版权问题

• PaperWeekly 尊重原作者署名权，并将为每篇被采纳的原创首发稿件，提供  ** 业内具有竞争力稿酬  ** ，具体依据文章阅读量和文章质量阶梯制结算

📬  ** 投稿通道：  **

• 投稿邮箱：  hr@paperweekly.site

• 来稿请备注即时联系方式（微信），以便我们在稿件选用的第一时间联系作者

• 您也可以直接添加小编微信（  ** pwbot02  ** ）快速投稿，备注：姓名-投稿

** △长按添加PaperWeekly小编  **

🔍

现在，在  ** 「知乎」  ** 也能找到我们了

进入知乎首页搜索  ** 「PaperWeekly」  **

点击  ** 「关注」  ** 订阅我们的专栏吧

·

预览时标签不可点

微信扫一扫
关注该公众号

[ 知道了 ](<javascript:;>)

微信扫一扫
使用小程序

****

[ 取消 ](<javascript:void\(0\);>) [ 允许 ](<javascript:void\(0\);>)

****

[ 取消 ](<javascript:void\(0\);>) [ 允许 ](<javascript:void\(0\);>)

****

[ 取消 ](<javascript:void\(0\);>) [ 允许 ](<javascript:void\(0\);>)

×  分析

__

微信扫一扫可打开此内容，
使用完整服务

：  ，  ，  ，  ，  ，  ，  ，  ，  ，  ，  ，  ，  。  视频  小程序  赞  ，轻点两下取消赞  在看  ，轻点两下取消在看  分享  留言  收藏  听过
