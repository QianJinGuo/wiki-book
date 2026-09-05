---
source: wechat
source_url: https://mp.weixin.qq.com/s/_VaYlATQ9Ootfj2Q03sU7Q
ingested: 2026-07-08
feed_name: 新智元
wechat_mp_fakeid: MP_WXS_3271041950
source_published: 2026-07-08
sha256: 36fcfa21baa69c517a85aa6a65dd20131da8af8d9558d9111f40f61395225283
---


# 竞赛编程Agent进入全球前十！南大、清华新模型CF rating超3500

### 

### 

**   ****新智元报道  **

##### **【新智元导读】 大语言模型在代码生成上的能力不断增强，但在复杂算法题，尤其是竞赛编程场景中，仍然容易因为算法选择错误、边界条件遗漏、复杂度判断失误或隐藏测试覆盖不足而失败。Solvita是一款面向竞赛编程的智能体框架，通过四个角色（Planner、Solver、Oracle、Hacker）形成闭环系统，并利用可训练的图结构知识网络积累经验。**

  


竞赛编程并不只是「把题面翻译成代码」。一个正确解法往往需要经历多个复杂环节：理解自然语言题面、抽象出数学结构、选择合适算法范式、估计复杂度、实现代码、构造测试、处理多解输出、排查隐藏边界条件等。

对于LLM来说，这类任务有几个典型困难：

#### 1\. 算法选择高度依赖题目结构

#### 同样是图论、动态规划或字符串问题，不同约束下可能对应完全不同的算法。如果模型只根据表面相似度检索样例，很容易选到「看起来像但本质不对」的套路。

#### 2\. 样例测试远远不够

很多错误解法可以通过样例，却会在隐藏测试中失败。尤其是边界条件、复杂度极限、多答案checker、精度问题等，都很难靠普通自测覆盖。

#### 3\. 失败经验难以复用

现有很多coding agent失败后会重新尝试、重新生成、重新调试，但一次任务结束后，这些失败经验通常不会改变后续任务的求解策略。系统并没有真正学会「下次遇到类似结构要避开什么坑」。

4\. 多Agent框架仍然偏静态

AlphaCodium、MapCoder等方法已经把解题拆成多个阶段，但它们更像固定流程。每个阶段可以调用模型，却缺少一个会随历史经验更新的长期记忆与路由机制。

来自南京大学、清华大学等机构的研究者提出了Solvita，这是一个面向竞赛编程的Agentic Evolution框架。它不微调底层大模型，而是在Planner、Solver、Oracle、Hacker四类Agent外部构建可训练的图结构知识网络，让系统能够从解题、测试、攻击和修复过程中持续积累经验。

代码仓库：https://github.com/NJU-LINK/Solvita

论文链接：https://arxiv.org/pdf/2605.15301

Solvita的出发点正是：人类选手刷题变强，不是因为每道题都从零开始，而是因为会积累「什么题用什么套路」「什么实现容易WA」「什么测试最容易hack掉错误程序」这些经验。

  
**Solvita是如何工作的？**

###   


Solvita的核心思想是：把竞赛编程求解组织成一个闭环系统，并让每个环节都具备可训练的知识网络。整个系统由四个Agent组成：

#### 1\. Planner：负责题目抽象与策略选择

#### Planner首先把原始题面转化成更形式化的数学描述，去掉故事背景和无关信息，提取变量、约束、目标和输入输出结构。随后，它会预测可能的算法标签、实现思路和复杂度。它背后的知识网络会记录历史题目的形式化结构、预测标签和最终结果。后续遇到新题时，Planner不是简单靠prompt临场发挥，而是会参考结构相似问题的历史经验。

#### 2\. Solver：负责生成代码与局部修复

Solver根据Planner的策略生成C++程序，并在样例和Oracle生成的测试上进行验证。与很多「失败后整段重写」的方法不同，Solvita强调patch-basedrepair：如果程序失败，Solver会尽量生成SEARCH/REPLACE形式的局部补丁，而不是完全重新生成整份代码。这样做的好处是保留已经正确的部分，集中修改真正出错的局部，避免每次重写都破坏前面已经满足的条件。

#### 3\. Oracle：负责构造可靠内部测试

Oracle的任务不是写最终答案，而是为解法构造「可信监督」。它会生成testlib-basedgenerator、validator、checker和reference solver，并检查reference solver是否能复现公开样例输出，再生成更多测试输入并进行认证。对于多答案问题，Oracle还需要提供custom checker的证据。只有当测试输入、期望输出、认证比例等条件满足要求时，Oracle生成的测试才会被接受。

#### 4\. Hacker：负责主动攻击候选程序

Hacker更像一个对拍高手。它会分析候选代码的潜在漏洞，生成结构化vulnerability report，然后选择semantic、stress、antihash等攻击路线，尝试构造能击穿错误程序的输入。如果某条攻击路线失败，系统还会沿着fallback chain 继续尝试。成功hack到的bug不只用于当前题修复，还会作为失败经验传播给Planner、Solver、Oracle和Hacker的知识网络。

  
**可训练的图结构知识网络 制**

###   


Solvita最重要的设计不是「多了几个Agent」，而是每个Agent都配有一个可训练的graph-structured knowledge network。

以Solver为例，它的知识网络分为三层：

  * Q Layer：记录历史题目描述和元信息；

  * M Layer：记录解法分解、失败对比和metacognitive analysis；

  * S Layer：记录可复用算法技能和C++模板。

当新题到来时，系统会先检索相似的Q节点，再沿着Q→M→S的两跳路径激活相关技能。

不同路径的边权不是固定的，而是会根据历史成功与失败进行更新。成功路径会被强化，失败路径会被削弱或生成新的contrastive节点。这和传统RAG有本质差异。

传统RAG更像「找到相似文本塞进prompt」，而Solvita的知识网络更像「学习什么问题结构应该路由到什么算法技能」。记忆不再只是静态检索，而变成了可训练的策略路由。

* * *

  
**Oracle和Hacker**

###   


在算法题中，测试本身就是能力的一部分。一个Agent能不能解题，很大程度上取决于它能不能判断自己的解法是否真的正确。

Solvita将测试能力拆成两个互补方向：

#### Oracle关注「可靠监督」。

它更倾向于构造reference solver、generator、validator和checker，目标是生成可以稳定判断程序正确性的内部测试。

#### Hacker关注「发现漏洞」。

它更倾向于寻找边界输入、复杂度极限、结构性反例或哈希冲突等攻击样例，目标是暴露候选代码中隐藏的错误。

二者的功能并不重复。Oracle更保守，能较好保护正确解法不被误杀；Hacker更激进，更擅长发现隐藏bug。论文实验也显示，二者结合后，在错误解法检测、正确解法保留和stronger-test confirmation上都取得了更好的平衡。

  
**实验结果**

###   


论文在CodeContests、APPS、AetherCode以及近期Codeforces rounds上评测了Solvita，并与single-pass、Codex CLI、Claude Code、AlphaCodium、MapCoder等方法进行比较。

主实验结果显示，Solvita在15个backbone-benchmark组合中，有14个取得最高pass@1。

以GPT-5.4 backbone为例：

可以看到，Solvita相比single-pass几乎实现了大幅跃升；相比已有agent framework，也在多个benchmark上保持稳定领先。更重要的是，这种提升并不是靠无限增加token换来的。论文的成本分析显示，Solvita的平均token消耗与开源agent framework处于相近区间，并没有接近部分商业CLI agent的更高消耗水平。

****

**消融实验**

#####   


论文进一步做了additive ablation，用来区分两个问题：

第一，Solvita的收益是不是只是因为多 Agent流程更复杂？

第二，可训练知识网络是否真的带来了额外提升？

结果显示，从single-pass切换到没有训练的多Agent框架，本身已经能显著提升性能。这说明solve–certify–attack–repair的闭环结构确实更适合复杂算法题。

但在此基础上，加入Solver/Oracle/Hackerknowledge network后，性能还能继续提升，并且随着训练问题数量从1.5k到3k再到4.5k，收益持续增长。

在GPT-5.4上，完整系统最终达到：

这说明三个网络不是互相替代，而是互补叠加。Solver network主要提升算法技能路由与实现修复；Oracle network提升内部监督质量；Hacker network提升对隐藏漏洞的攻击能力。完整系统将三类经验整合起来，最终取得最强表现。

##### Patch-based Repair：为什么不要每次都重写？

论文还专门比较了Solver内部的两种修复方式：full regeneration和patch repair

**Full regeneration是每次失败后重新生成完整代码；**

**Patch****repair则只针对诊断出的错误位置生成局部补丁** 。

在相同最大迭代预算下，patch repair不仅通过率更高，而且平均迭代次数更少、token节省更多。

以GPT-5.4为例：

这说明在长链路解题中，「推倒重来」并不总是好策略。很多时候，候选解法已经有大部分逻辑正确，真正需要的是精准修补，而不是重新生成一份可能引入新错误的代码。

****

**Codeforces真实比赛评测**

#####   


除了离线benchmark，论文还在近期Codeforces rounds上进行了更接近真实比赛的评估。

评测选取12场post-cutoff Codeforces rounds，共76道题。每场比赛都在官方时间限制内完成，不允许赛后修改，约束与真实选手一致。结果显示，使用GPT-5.4、Claude Opus 4.6、DeepSeek V4 Pro作为backbone的Solvita版本，最终都进入Legendary Grandmaster区间；而相同backbone的bare model则停留在较低区间。

这说明Solvita的收益不只是底层模型本身带来的，而是来自agentic loop、知识网络和对抗验证机制的系统性增强。

  
**总结与展望**

###   


Solvita是一个面向竞赛编程的Agentic Evolution框架。它试图回答一个重要问题：如何让代码Agent不只是「多试几次」，而是真正从过去的成功和失败中积累经验？

该研究的核心贡献可以概括为三点：

##### 1\. 提出solve–certify–attack–repair闭环

Solvita将算法题求解拆解为Planner、Solver、Oracle、Hacker四个角色，让策略选择、程序生成、测试认证和对抗攻击形成闭环。

##### 2\. 引入可训练的图结构知识网络

每个Agent都拥有自己的知识网络，通过pass/fail verdict、测试认证质量和adversarial vulnerability等反馈信号更新边权，在不微调底层LLM的前提下持续积累经验。

##### 3\. 在竞赛编程任务上取得显著提升

Solvita在CodeContests、APPS、AetherCode和Codeforces真实比赛评测中均展现出强性能，在多数backbone-benchmark组合上超过已有agent framework。

从更大的角度看，Solvita传达了一个很重要的观点：

未来更强的coding agent，不一定只来自更大的模型，也可能来自更好的经验组织方式。

真正可靠的代码智能体，需要会规划、会验证、会攻击自己的答案，也需要能把失败转化为下一次成功的经验。

对于AI for Code研究而言，Solvita提供了一种新的思路：从一次性代码生成，走向持续进化的代码智能体。

参考资料：  


https://arxiv.org/pdf/2605.15301

  


编辑：LRST

  
**秒追ASI****⭐****点赞、转发、在看一键三连****⭐****点亮星标，锁定新智元极速推送！****  
**
