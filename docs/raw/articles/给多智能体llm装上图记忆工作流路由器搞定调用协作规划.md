---
sha256: 27fd978ba1b09d575b7eb839121c5383dbeede47fac684c01a7bfbf02e815a1e
source: wechat
source_url: https://mp.weixin.qq.com/s/aT8lG-926ULS8TlZDwaXcA
ingested: 2026-07-12
feed_name: 新智元
wechat_mp_fakeid: MP_WXS_3271041950
source_published: 2026-07-12
---

# 给多智能体LLM装上「图记忆工作流路由器」，搞定调用、协作规划

### 

### 

**   ****新智元报道  **

##### **【新智元导读】 GraphPlanner通过引入图记忆网络，将多智能体LLM的路由过程升级为动态工作流生成。不仅选择调用哪个模型，还决定每个模型应承担的角色，实现任务分解与协作规划。**

  


当大语言模型从「单模型回答」走向「多模型协作」，一个新的问题正在浮现：

系统不只需要知道该调用哪个LLM，还需要知道该让这个LLM扮演什么角色、在什么步骤调用、如何与其他模型协作。

现有LLM Router大多关注query-level的模型选择：给定一个问题，判断该交给Qwen、LLaMA、Gemma、Mixtral还是其他模型。进一步的多轮Router虽然能够进行多次调用，但通常仍然只是「连续选择模型」，缺少对多智能体协作流程本身的显式建模。

对此，University of Illinois Urbana-Champaign（UIUC）的研究人员提出GraphPlanner，将LLM Routing从「选择模型」推进到「生成多智能体工作流」：系统在每一步同时决定调用哪个模型以及激活哪个智能体角色，并利用图结构记忆历史交互与当前工作流状态，从而实现更高效、更可泛化的多模型协作。

论文链接: https://arxiv.org/abs/2604.23626

代码链接: https://github.com/ulab-uiuc/GraphPlanner

  
**研究背景**

传统Single-Round Router的逻辑很直接：给定一个query，选择一个最合适的LLM来回答。

这种方式简单高效，但面对复杂任务时存在明显限制：它无法分解任务，也无法组织多个模型之间的协作。

Multi-Round Router则进一步允许多次调用不同模型，例如Router-R1可以在「思考—路由—聚合」的过程中反复调用多个LLM。

但这类方法本质上仍然更关注backbone selection，也就是「下一步该调用哪个模型」，而没有显式建模多智能体系统中的角色分工与协作结构。

现实中的复杂任务往往需要更接近agentic workflow的处理方式。例如：

  * 先由Planner将复杂问题拆解成子问题；

  * 再由多个Executor分别解决不同子任务；

  * 最后由Summarizer汇总中间结果并形成最终答案。

GraphPlanner正是围绕这一点提出：Router不应只决定调用哪个模型，还应决定调用哪个Agent Role，并动态生成适合当前query的协作工作流。

  
**GraphPlanner**

GraphPlanner的核心思想是将routing过程建模为一个sequential decision-making problem。

在每一步，GraphPlanner不再只选择一个LLM，而是选择一个二元动作：

Action = Agent Role + LLM Backbone

研究人员默认定义了三类基础Agent Role：

1\. Planner：负责将复杂query分解为若干atomic sub-queries；

2\. Executor：负责回答原始query或子问题；

3\. Summarizer：负责聚合多个中间结果，生成更一致的上下文或最终回答。

因此，GraphPlanner的每一步决策都在回答两个问题：

**当前应该由哪个角色执行？应该使用哪个LLM执行？**

这种设计让Router从一个简单的「模型选择器」，升级为一个能够构建query-specific agentic workflow的「多智能体规划器」。

对于简单问题，GraphPlanner可以直接选择Executor一步完成回答；对于复杂数学、代码或多跳推理任务，它可以先调用Planner拆解问题，再调用多个Executor解决子问题，最后调用Summarizer汇总推理链路。

  
**GARNet**

GraphPlanner的另一个关键创新是引入异构图记忆网络GARNet。

在多智能体LLM系统中，每次调用都会产生丰富的交互信息：query 是什么、哪个模型被调用、它扮演什么角色、输出了什么结果、成本是多少、最终是否正确。

这些历史 interaction traces 本身就是非常宝贵的 routing memory。它们能够告诉系统：在相似任务上，哪些模型更适合担任 Planner？哪些模型更适合做 Executor？哪些角色组合更高效？

为此，GraphPlanner构建了两类图记忆：

Workflow Memory Graph：记录当前 query 在本轮推理过程中生成的子问题、角色调用和中间回复；

Historical Memory Graph：记录过去任务中的query、response、LLM-role交互、accuracy 和 cost 信息。

GARNet将query node、response node、LLM-role node以及accuracy-cost edge组织成异构图，并通过共享的role hub nodes连接当前工作流与历史记忆。

这样，GraphPlanner在做下一步routing决策时，不仅能看到当前query的状态，还能利用历史交互中积累下来的模型能力画像与协作模式。

  
**用强化学习训练Agentic Router****  
**

由于GraphPlanner的routing workflow包含离散的角色选择、模型调用、子问题分解和结果汇总，整个过程难以直接端到端求导。

因此，研究人员将workflow generation建模为Markov Decision Process，并使用PPO进行强化学习训练。

奖励函数同时考虑任务效果与调用成本：

  * 最终回答正确性带来task utility；

  * 每一步模型调用会产生computational cost；

  * 超参数α用于控制accuracy-cost trade-off。

换言之，GraphPlanner学到的不是一个固定工作流模板，而是一种动态策略：在面对不同 query 时，自适应决定是否需要规划、是否需要拆解、调用几个模型、每个模型扮演什么角色，以及何时汇总并输出最终答案。

实验结果：更强性能、更低训练成本、更好泛化

GraphPlanner在14个任务、6个领域上进行了系统评估，覆盖Math、Code、Commonsense Reasoning、World Knowledge、Popular Benchmark以及Out-of-domain Testing。

实验包含两个阶段：

Phase 1：在用户预定义的agentic workflow中，优化不同agent的LLM backbone选择；

Phase 2：同时生成agentic workflow并选择对应的LLM backbone。

结果显示，GraphPlanner在两个阶段均显著优于single-round与multi-round router baselines。

在Phase 1中，GraphPlanner在固定工作流下仍能取得最高平均准确率，说明图记忆增强的 routing policy 能更好地为不同agent分配合适模型。

在Phase 2中，当系统允许自由生成workflow时，GraphPlanner的优势进一步扩大，相比最强baseline带来约9.3%的平均准确率提升，说明 query-specific workflow generation 比固定工作流更适合复杂任务。

更重要的是，GraphPlanner还展现出优秀的效率表现。相比Router-R1等RL-based multi-round router，GraphPlanner在训练阶段显著降低GPU compute，并通过轻量级图策略网络实现更高效的routing决策。

泛化能力：支持Unseen Tasks与Unseen LLMs

一个好的LLM Router不应只记住训练集中的任务和模型，而应能泛化到新的任务类型和新的LLM backbone。

GraphPlanner在out-of-domain任务LogicGrid、MGSM和CommonGen上取得了78%的平均准确率，明显优于 GraphRouter、RouterDC 和 Router-R1 等 baseline。

同时，当实验中加入训练阶段未见过的 LLM 时，GraphPlanner 仍能保持稳定且更优的表现。这说明它并不是简单记忆某个模型在某个任务上的标签，而是通过 LLM-role graph 和 historical interaction memory 学到了更可迁移的协作模式。

此外，GraphPlanner 支持两种 inference 方式：

Inductive Setting：不依赖保留的历史交互，部署更轻量；

Transductive Setting：利用历史 interaction memory，获得更高性能。

这种设计使 GraphPlanner 可以根据实际部署需求，在效率和性能之间灵活切换。

  
**总结****  
**

GraphPlanner的核心贡献在于，它将LLM Router从传统的backbone selection推进到了agentic workflow generation。

过去的Router主要回答：这个query应该交给哪个模型？

GraphPlanner 进一步回答：

> 这个query应该如何拆解？

> 哪些Agent Role应该参与？

> 每个角色应该由哪个LLM执行？

> 当前工作流如何利用历史交互经验？

> 如何在效果与成本之间取得更优平衡？

因此，GraphPlanner不只是一个更强的Router，而是迈向多智能体 LLM 系统自动化编排的重要一步。

它让多个异构LLM不再只是被动调用的工具，而是能够在Planner、Executor、Summarizer等角色下形成结构化协作流程。

对于未来的AI基础设施而言，这种ability to plan, route, remember, and coordinate将成为构建可扩展、多模型、多智能体系统的关键能力。

  


参考资料：  


https://arxiv.org/abs/2604.23626

  


编辑：LRST

  
**秒追ASI****⭐****点赞、转发、在看一键三连****⭐****点亮星标，锁定新智元极速推送！****  
**
