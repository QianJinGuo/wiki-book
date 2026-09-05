---
title: "从静态测试走向环境演化，OpenART重新定义长程Agent红队评测"
source_url: "https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247722656&idx=2&sn=c8680371c9d7849813a0c16942fa7368"
ingested: "2026-09-04"
sha256: f314f48805911d927b938b4c70cc3d192db95db0bd86709131f1290f2fbb5a01
type: raw
---

# 从静态测试走向环境演化，OpenART重新定义长程Agent红队评测

原创 让你更懂AI的 2026-09-04 18:39 北京

挑战Agent安全盲区

Agent 进入真实工作流后，安全问题会沿着多步执行过程逐渐显现。文件、工具结果、权限、记忆和计划状态会在后续步骤中被反复读取与修改，一个早期变化可能沿着长程执行继续传播，直到很多步之后才表现为安全失效。

OpenART 围绕这一问题，把 Agent 红队评测从固定环境中的一次测试扩展为持续演化环境中的系统级评测。它主要解决三个问题：怎样构造足够长、能够真实执行的测试场景，怎样让同一个场景适配不同 Agent Harness，以及怎样在任务目标不变的前提下持续演化环境并寻找新的风险状态。

〓 图1：OpenART 整体框架。

论文标题：

OpenART Arena: Scaling Agent Red Teaming via Open-Ended Environment Evolution

作者：

Yunhao Chen、Xin Wang、Yixu Wang、Yi Liu、Jie Li、Yan Teng、Xingjun Ma、Xia Hu、Yu-Gang Jiang

研究机构：

复旦大学、上海人工智能实验室、XSafeAI

论文地址：

<https://huggingface.co/papers/2608.00677>

arXiv地址：

<https://arxiv.org/abs/2608.00677>

代码地址：

<https://github.com/AI45Lab/OpenART>

核心观点

现有 Agent 安全基准已经逐步从单轮回答扩展到工具调用和交互任务，但不少测试仍建立在相对固定或可重置的环境中。对于持续运行的 Agent，这类设置很难覆盖状态累积、跨步骤传播，以及不同 Harness 对安全结果带来的影响。

OpenART 因此把完整的可执行场景作为评测单位。测试过程中，良性任务目标和隐藏的安全约束保持不变，变化的是 Agent 实际能够看到和使用的环境状态。这样，评测可以继续观察同一个任务在环境持续变化后，Agent 是否仍能保持安全，而不会局限在某一步的局部结果。

方案

2.1 让长程任务真正可执行

OpenART 从超过 50 万个 Tools、MCPs 和 Skills 组成的能力库出发，在 50 个应用领域中构造并验证了超过 1 万个有状态场景。每个场景都需要通过执行检查和 Evaluator 验证后才能进入测试集，任务所需工具调用次数的中位数达到 97。

较长的依赖链让前面产生的状态能够在后续流程中继续被读取、组合和修改，也为研究长期状态依赖下的安全问题提供了真实的执行基础。

〓 图2：OpenART 覆盖的 50 个应用领域及 Tools、MCPs 和 Skills 能力库。

2.2 让同一个场景适配不同Agent

不同 Agent 使用的接口、状态组织方式和能力入口并不相同。OpenART 先用一种 target-agnostic 的方式描述场景，再通过轻量 Adapter 把相同的任务目标、安全约束和 Evaluator 映射到各个 Agent 的原生 Harness 中。

论文覆盖 15 个已部署 Agent 和 5 个基础模型，共形成 75 种 Agent-Model 配置。这样，不同系统面对同一个场景和同一套评价标准，可以更直接地比较基础模型、Agent 实现和接口差异带来的影响。

2.3 固定任务，让环境持续演化

在场景进入目标 Agent 后，OpenART 把环境状态纳入红队搜索。每一轮从当前环境  和历史攻击状态  出发，由策略生成一组候选环境变化 。这些变化经过目标 Agent 的 Adapter 检查，只保留对应 Harness 支持且允许修改的 state surfaces，得到真正写入环境的更新 ：

目标 Agent 随后继续执行原始任务，产生执行轨迹  和新的环境状态 ，Evaluator 给出本轮反馈 。这些信息会继续写回攻击状态 ，用于下一轮环境演化：

整个过程中，任务目标  和安全约束保持固定，环境状态沿着多轮执行持续变化。OpenART 支持 Workspace、Instructions、Skills、Tools、MCPs、Short-Term Memory、Plan State和Long-Term Memory 八类 state surfaces。

在这一框架上，论文提出 Evolutionary Markov Hypergraph Attack（EMHA）作为参考搜索方法。EMHA 采用 black-box 反馈，并保持 target model 和 attacker model 的参数固定：

适应过程发生在外部 attacker state 中，其中保存历史反馈、路径价值和不断演化的 graph pool。

EMHA 用 Hypergraph 表示需要协同发生的环境变化。设第  轮的图为

其中 vertex 表示一个 attack subgoal，hyperedge 连接它的前置条件与后续 subgoals。系统从当前可执行的 hyperedges 中逐步采样，形成一条路径

再由冻结的 attacker model 把这条路径转换成实际环境更新：

其中  来自历史攻击状态中的检索结果。这样，一次 environment evolution 可以同时协调多个 state surfaces，并把前一轮得到的反馈带入下一轮搜索。

Evaluator 反馈还会更新不同路径的价值。EMHA 在给定轮数预算  下关注搜索过程中得到的最佳结果：

当某一轮得到更高的 Evaluator 分数时，这部分增益会被重新分配到该轮路径中的 hyperedges，并影响后续路径选择。同时，Archive 保留不同搜索区域中表现较好的 graph，新的 graph 再从这些历史结果中继续演化。经过多轮执行，EMHA 会逐步积累有效的环境组合，并继续探索新的组合。

〓 图3：OpenART 的场景构造、目标执行与 EMHA 环境演化流程。

发现

在 75 种 Agent-Model 配置上，EMHA 的 pooled Strict ASR 达到 85.0%。在 DeepSeek-V4-Pro 的五轮环境演化实验中，累计 Strict ASR 从 第一轮的 42.9% 逐步上升到第五轮的 94.7%。这说明，随着环境继续变化，后续状态仍然能够暴露初始测试没有发现的问题。

〓 图4：五轮环境演化中的累计 Strict ASR。

随着场景复杂度上升，完整环境演化与仅演化指令之间的差距也在扩大。依赖深度增加时，最大差距达到 17.6 个百分点；工具调用增加时，最大差距达到 17.2 个百分点。这表明，流程越长、状态依赖越复杂，只测试局部输入越容易低估环境变化带来的风险。

〓 图5：不同场景复杂度下 Full EMHA 与 instruction-only evolution 的对比。

风险本身也具有明显的延迟。在 1 万条转换后的执行轨迹中，变化状态首次被使用时，执行进度的中位位置约为 23%，首次不安全行为则出现在 64%。两者中位相隔 37 个目标动作，对应整个执行流程约 41% 的延迟。

〓 图6：环境变化从首次被读取到首次出现不安全行为之间的传播距离。

论文还发现，在控制基础模型和正常任务完成情况后，加入目标 Agent 身份可以额外解释 7.6% 的攻击成功率变化。这意味着 Agent 安全不仅取决于基础模型，也与 Agent Harness 的设计、状态组织和接口方式有关。

总结

OpenART 的三个部分共同把 Agent 红队评测向前推进了一步。长程可执行场景让持续状态真正进入测试；target-agnostic 的场景描述与 Adapter 机制，让同一个任务能够进入不同 Agent Harness；环境演化则在任务目标和安全约束保持不变的情况下，持续寻找新的风险状态。

因此，OpenART 把关注范围扩展到完整的 Agent 系统，考察其在复杂状态依赖、不同 Harness 和持续环境变化中能否长期保持安全。对于长期运行、持续调用工具并依赖环境状态的 Agent，这类评测能够覆盖静态测试较难发现的风险传播和安全失效。
