---
source: rss
source_url: https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721983&idx=2&sn=676043e96fd2ef5e6c0c0c85daccda8b
ingested: 2026-08-13
feed_name: WeChat-PaperWeekly
source_published: 2026-08-04
sha256: a1766e6a55a55b9e6234126a808824186590a6bc355bf41b31db829671812ab6
---

# ACL 2026 | AI润色还是代写？中科院四分类检测框架开源，锁定真实作者

原创 李阳 2026-08-04 21:45 北京

逻辑指纹锁定真正创作者

论文标题：

Beyond the Final Actor: Modeling the Dual Roles of Creator and Editor for Fine-Grained LLM-Generated Text Detection

论文链接：

<https://aclanthology.org/2026.acl-long.235/>

代码链接：

<https://github.com/ICTMCG/RACE>

背景：AI 生成文本检测已不再是简单的“真假二选一”

大语言模型（LLM）的爆炸式发展在改变内容生产方式的同时，也带来了严峻的信息可信度危机。

从大规模虚假新闻生成、学术不端辅助，到借助 AI 进行身份欺诈，合成文本的泛滥迫切需要可靠的检测技术。

然而，现有检测方法大多停留在二分类（人写 vs. AI 生成）乃至三分类（加入“人类-AI 协作”类）的框架内，这在现实监管中是远远不够的。

试想两种典型场景：

  * AI润色人写稿（LLM-Polished Human Text）：学生自己构思、撰写论文框架，用AI润色语言表达。

  * 人工伪装 AI 稿（Humanized LLM Text）：用 AI 生成全文后，利用所谓的人类化工具修改以逃避检测工具。




这两种情形在许多学术诚信政策中属于截然不同的违规类别，前者往往被视为合法的写作辅助，后者则构成欺骗行为。现有方法无法区分二者，监管就无从精细化落地。

〓 Figure 1：（上）创作者-编辑者框架示意；（下）现有二/三分类设置与本文四分类设置的对比。

关键洞察：“创作者”的逻辑骨架不会被“编辑者”抹去

本文提出了一个核心假设：编辑操作（无论是 AI 润色还是人类化改写）通常只改变语言表层，而不会根本性地改变文本创作者留下的痕迹——逻辑结构。

为验证这一假设，研究团队在 HART 数据集上进行了修辞结构理论（RST）关系分布的统计分析（Z-score），结果非常直观：

  * 人类创作者倾向于使用更复杂的修辞关系，如 _Attribution_（归因）和 _Temporal_（时序），体现出更深层的外部引用意识和叙事逻辑。

  * LLM 创作者则高度依赖 _Elaboration_（阐述）和 _Cause_（导致），呈现出“信息密度优先、叙事逻辑简化”的特征。




更重要的是，当人类文本被 AI 润色后，高 Attribution 特征依然显著保留；当 AI 文本被人工改写后，Elaboration 的主导地位同样未被掩盖。

〓 Figure 2：RST 关系 Z-score 分布。（a）人类与 LLM 创作者修辞结构的分歧；（b）AI 润色后人类修辞底层结构依然保留；（c）人工改写后 LLM 修辞底层结构依然显著。

通过计算同一文本原稿与各变体之间修辞关系频率向量的余弦相似度，可以看到：同一创作者产出的文本，其修辞结构相似度明显高于不同创作者之间的比较（Human-Written 与 LLM-Polished 均值达 0.92，而 Human-Written 与 LLM-Generated 仅为 0.84）。

这说明：修辞结构可作为创作者身份的“逻辑指纹”，即便经过编辑也难以被彻底清除。

RACE：面向创作者-编辑者双角色建模的检测框架

基于上述分析，本文提出 RACE（Rhetorical Analysis for Creator-Editor Modeling），一个面向四分类细粒度检测任务的逻辑结构感知检测框架。

RACE 的核心思路是：同时建模“创作者的逻辑组织”与“编辑者的语言风格”，通过双轨特征实现细粒度区分。

〓 Figure 3：RACE 整体架构。（a）双轨痕迹提取；（b）逻辑感知图初始化；（c）修辞引导消息传递；（d）图读出与分类。

RACE 包含四个核心模块：

1\. 双轨痕迹提取（Dual Trace Extraction）

使用端到端的 RST 解析器（IsaNLP），将输入文本解析为一棵二叉修辞结构树。树的叶节点是基本话语单元（EDU），代表编辑者的语言表达；内部节点是修辞关系节点，代表创作者的逻辑组织。

2\. 逻辑感知图初始化（Logic-Aware Graph Initialization）

将 RST 树转化为多关系图，并通过以下两种策略初始化节点特征：

  * 后代跨度池化（Descendant Span Pooling）：对 EDU 节点使用预训练语言模型（RoBERTa-base）提取语义表示；对关系节点，则以其所有后代 EDU 表示的均值作为语义中心。

  * 信息瓶颈投影（Information Bottleneck Projection）：将高维 PLM 特征压缩到低维结构空间，过滤无关的表层词汇噪声，迫使模型专注于对身份判断有用的结构性特征。




3. 修辞引导消息传递（Rhetoric-Guided Message Passing）

采用关系图卷积网络（RGCN）在逻辑图上进行消息传递。与普通 GCN 对所有边一视同仁不同，RGCN 为不同修辞关系类型分配独立的变换矩阵，从而学习不同修辞逻辑下的差异化传播规则。

为防止关系类型过多导致参数爆炸，引入基分解正则化，强迫模型学习修辞逻辑的“原子成分”，提升稀疏关系上的泛化能力。

4. 图读出与分类（Graph Readout and Classification）

由于 RST 树具有天然的层次结构，根节点蕴含了整个文本的全局修辞意图，因此采用根节点池化直接提取全局表示，输入分类头进行四分类预测。优化目标结合监督对比损失与交叉熵损失，进一步收紧类内距离，扩大类间区分度。

实验：低误报率下表现突出

4.1 主实验

〓Table 1：主实验表

在 HART 基准数据集上，RACE 与 12 条基线（包括 RoBERTa、CoCo、LF-Motifs、Binoculars、Fast-DetectGPT 等）展开全面对比，核心指标为：

  * Macro-AUROC：衡量分类器概率排序的全局质量

  * TPR@1%FPR：在极低误报率（1%）约束下的检出率，直接对应实际监管场景的精准性需求




RACE 以 97.99% AUROC 和 83.06% 平均 TPR@1%FPR 位居第一，比最强基线 CoCo（79.70%）高出 3.36 个百分点，在低误报约束下的表现尤为突出。纯统计方法（如 Binoculars、Fast-DetectGPT）因信息压缩严重，在多分类场景下表现大幅下滑，TPR@1%FPR 最低甚至降至 0%。

4.2 消融实验

〓 Table 2：消融实验表。其中Bottleneck 代表信息瓶颈投影，Basis 代表基分解正则化，w/o Relation 代表采用普通 GCN

逐一去除各模块后，性能均有不同程度下降，验证了各组件的必要性：

  * 去除修辞关系（改用普通 GCN）：对 LLM 生成类文本的检出率下降最显著

  * 去除 RGCN（仅使用图上初始特征）：对人工伪装类文本影响最大

  * 去除对比学习：整体性能下降，尤以“编辑者相似”的两类（LLM-Polished 与 LLM-Generated）受影响明显

  * 去除信息瓶颈：对 LLM-Polished 类的检测性能专项下降，印证了该模块对抗表层词汇干扰的作用




4.3 深入分析

〓 Figure 4：不同文本长度区间下的 TPR@1%FPR 对比，RACE 在中短文本（200-600 tokens）上优势更明显。

  * 特征可分离性：RACE 的 Davies-Bouldin 指数（0.8042）低于 CoCo（0.9286），Calinski-Harabasz 指数（4333.32）接近 CoCo（2289.40）的两倍，表明 RACE 学到了更加紧凑且边界分明的表示空间。

  * 文本长度鲁棒性：对于 200-600 词的较短文本，RACE 的优势比长文本更为显著，图结构方法在信息量有限时更能高效捕捉细粒度差异。




〓 Table3：跨域泛化性分析。采用留一域测试，即用不属于目标域的数据用于训练，属于目标域的数据仅用于测试

〓 Table 4：替换RST解析器后的表现结果

  * 跨域泛化（OOD 测试）：在留一域测试中，RACE 在 Arxiv、Essay、News 等领域均优于 CoCo 和 LF-Motifs，尤其在结构性更强的学术论文和议论文领域优势明显。原因在于 CoCo 依赖的实体分布高度依赖领域，而 RACE 同时利用语言表达与逻辑组织两个维度，跨域适应性更强。

  * 解析器无关性：更换 RST 解析器（DMRST vs. IsaNLP）后，RACE 性能基本稳定，说明改进来自创作者-编辑者建模本身，而非单一解析器的特定偏置。




局限与展望

研究团队坦诚指出三点局限：目前仅在 HART 一个数据集上验证；绝对性能尚未达到商用部署要求，建议实际使用时辅以人工复核；四分类框架尚未覆盖多轮次、

多模型编辑的更复杂场景。

未来工作方向包括：

  * 基于逻辑指纹的 LLM 溯源：将 RACE 的图结构特征用于追溯特定模型身份

  * EDU 级别细粒度标注：精确定位人工干预的具体话语单元

  * 对抗逻辑防御：随着 LLM 逐步学会模仿人类修辞结构，构建面向逻辑混淆的对抗攻防体系




小结

RACE 的核心贡献在于将 AI 生成文本检测从“看结果”推进到“看过程”，通过修辞结构理论对文本的逻辑骨架进行建模，区分“是谁创作了这篇文章的框架”与“是谁打磨了最终的语言表达”。

这一思路不仅在学术指标上超越了现有方法，也与实际监管政策的精细化需求高度契合。

代码已开源：

<https://github.com/ICTMCG/RACE>

**更多阅读**

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721552&idx=2&sn=fd7ed276519879e33af4dea881891cbc&scene=21#wechat_redirect>)

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721532&idx=2&sn=abf8b7313c30c206d7c0028e49ef3489&chksm=96e5bdbca19234aa580ad6429b9150cc5a7d3913b01bba88e3f00b5b8c8e8fad7c4dd7ccd6bf&cur_album_id=3368799358032527365&scene=21#wechat_redirect>)

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247720929&idx=2&sn=a225a2975656e8234bc0536718fab2e1&chksm=96e54061a192c977f8e5cb736e9128de09f6a4f9c4d061ea24c716924ecc2591ab8d0c308747&cur_album_id=3368799358032527365&scene=21#wechat_redirect>)

**# 投 稿 通 道#**

**让你的文字被更多人看到**

如何才能让更多的优质内容以更短路径到达读者群体，缩短读者寻找优质内容的成本呢？**答案就是：你不认识的人。**

总有一些你不认识的人，知道你想知道的东西。PaperWeekly 或许可以成为一座桥梁，促使不同背景、不同方向的学者和学术灵感相互碰撞，迸发出更多的可能性。 

PaperWeekly 鼓励高校实验室或个人，在我们的平台上分享各类优质内容，可以是**最新论文解读** ，也可以是**学术热点剖析** 、**科研心得** 或**竞赛经验讲解** 等。我们的目的只有一个，让知识真正流动起来。

📝 **稿件基本要求：**

• 文章确系个人**原创作品** ，未曾在公开渠道发表，如为其他平台已发表或待发表的文章，请明确标注 

• 稿件建议以 **markdown** 格式撰写，文中配图以附件形式发送，要求图片清晰，无版权问题

• PaperWeekly 尊重原作者署名权，并将为每篇被采纳的原创首发稿件，提供**业内具有竞争力稿酬** ，具体依据文章阅读量和文章质量阶梯制结算

📬 **投稿通道：**

• 投稿邮箱：hr@paperweekly.site 

• 来稿请备注即时联系方式（微信），以便我们在稿件选用的第一时间联系作者

• 您也可以直接添加小编微信（**pwbot02** ）快速投稿，备注：姓名-投稿

**△长按添加PaperWeekly小编**

🔍

现在，在**「知乎」** 也能找到我们了

进入知乎首页搜索**「PaperWeekly」**

点击**「关注」** 订阅我们的专栏吧

·

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=20a9eece&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzIwMTc4ODE0Mw%3D%3D%26mid%3D2247721983%26idx%3D2%26sn%3D676043e96fd2ef5e6c0c0c85daccda8b>)
