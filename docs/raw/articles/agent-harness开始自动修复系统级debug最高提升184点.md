---
title: "agent-harness开始自动修复系统级debug最高提升184点"
source_url: "https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247722169&idx=2&sn=fdb17581cfd7cf4fc0f4a9db4a156059"
source_published: 2026-08-13
ingested: 2026-08-15
feed_name: "WeChat-PaperWeekly"
sha256: 3fe420e6794b20f74285fadd91a9b9d4f8d14b2d3a1093d965ec0db1c1519f58
---

# Agent Harness开始自动修复：系统级Debug最高提升18.4点

原创 让你更懂AI的 2026-08-13 22:39 北京

失败轨迹变成修复证据

很多 LLM agent 的失败，看起来像是模型没有想明白：工具调错了、上下文漏了、最终答案提前交了。

但在复杂任务里，问题往往不只在模型本身，而在模型外部的 agent harness：执行环境、工具接口、上下文与记忆、生命周期编排、可观测性、验证，以及治理策略共同决定了模型每一步能看到什么、能做什么、何时停止。

论文 From Failed Trajectories to Reliable LLM Agents: Diagnosing and Repairing Harness Flaws 提出 HarnessFix。

论⽂地址：

<https://arxiv.org/abs/>2606.06324

代码地址：

<https://github.com/HarnessFix/HarnessFix>

它的核心判断是：失败轨迹不应只被当作打分反馈，而应被当作结构化证据，用来定位哪一步失败、哪段 harness 机制造成了失败，以及应该用多大范围的修改去修复它。

作者在 GAIA、SWE-Bench Verified、AppWorld 和 Terminal-Bench 2.0 Verified 这 4 个 benchmark 上评估 HarnessFix，报告相对初始 harness 的提升为 6.3 到 18.4 个百分点。

〓 图1 HarnessFix 的整体流程：先把原始轨迹和 harness artifact 编译成 HTIR，再做失败归因和 flaw record 汇总，最后用 scoped repair operator 生成并验证补丁。

为什么只改 prompt 不够

传统软件的很多 bug 可以沿着显式控制流和数据结构追踪；agent 系统不同，行为在运行时由 prompt、工具描述、检索上下文、控制器、验证器和环境反馈共同塑造。

一次失败轨迹里，模型消息、工具调用、环境观察和中间状态交织在一起，很难直接对应到某个 prompt 模板、工具 schema、配置文件或编排代码。

作者先做了一个动机研究：分析 30 个流行开源 LLM agent 仓库和约 57,780 条开发记录，其中 26,174 条被归为 harness 相关，占 45.3%。

这些问题覆盖harness的 7 层职责，而不是集中在 prompt 一处；Lifecycle、Tool Interface 和 Observability 尤其常见，几乎出现在全部 30 个仓库中，说明问题具有系统性。

〓 图2 真实开源 agent 中 harness flaw 的层分布：缺陷覆盖 Execution、Tool Interface、Context/Memory、Lifecycle、Observability、Verification 和 Governance 这 7 层。

这解释了为什么 outcome-driven 的自进化方法容易改得过宽。只看最终成功率时，系统也许能调出一个更好的提示词或工作流，但未必知道失败证据到底在哪里，更未必知道该改工具接口、上下文构造、完成条件，还是验证脚本。

HTIR：把轨迹变成可归因证据

HarnessFix 的第一步是构造 Harness-aware Trace Intermediate Representation，简称 HTIR。

HTIR 把轨迹拆成 TraceStep，每个 step 保存请求消息、响应消息、角色、执行状态，以及对外部 artifact 或应用状态的影响。

同时，它重建 TraceLink，包括数据流链接和控制流链接，用来描述信息如何被复用、丢失、变形，以及 harness 为什么从一步转到下一步。

更关键的是 implementation anchor：HTIR 不只说某个 runtime step 可疑，还尝试把它锚定到可编辑的 harness artifact，比如 prompt 模板、工具规范、适配器、控制器、日志钩子或验证脚本。

这样，失败归因才有可能从“这次执行错了”推进到“应该修哪类机制”。

〓 图3 AppWorld 示例：工具文档中要求 user_email，但后续 payment request 省略该字段；API 返回 success 却没有预期状态变化，completion guard 仍允许 finalization，从而暴露 Lifecycle、Verification 和 Observability 相关缺陷。

在图 3 的例子里，失败不只是“模型少填了一个字段”。HTIR 会把 API 文档到请求体之间的数据流关系、success 状态到 complete_task() 的控制流关系，以及缺失的 artifact/state effect 串起来。

这样一来，诊断就可以指向更具体的 harness 问题：错误没有被充分暴露，完成条件没有验证真实副作用，最终提交被过早放行。

从 flaw record 到有边界的修复

HarnessFix 的诊断 agent 先做症状定位，再沿数据流和控制流回溯候选责任 step，随后判断这些 step 是否形成、传播、隐藏或未验证与失败相关的信息或状态。

多条失败轨迹中反复出现的诊断会被合并成 flaw record，记录共同根因、涉及的 harness 层以及支撑证据。

修复阶段并不让 agent 自由编辑整个仓库，而是把 flaw record 映射到 scoped repair operators。

例如，Tool Interface 层可能对应 tool-schema narrowing、argument validation 或 error-message repair；Lifecycle 层可能对应 loop guarding、verification-gated finalization；Verification 层则可能对应 expected/actual state comparison、effect-evidence completion guarding 或 regression testing 等机制。

这种做法的价值在于约束。修复 specification 会明确目标、可编辑 artifact、禁止触碰的范围和必须满足的行为；validation agent 再检查补丁是否在范围内、是否降低目标 flaw出现频率、是否在验证集上引入不可接受的回归。

对于 agent harness 这种跨 prompt、工具、状态和验证逻辑的系统，这个“先诊断、再限域修复”的顺序比盲目搜索更稳。

实验结果：提升来自诊断，而不只是更多搜索

实验覆盖 4 类任务：GAIA 的开放式研究问答、SWE-Bench Verified 的仓库级软件修复、AppWorld 的有状态应用自动化，以及 Terminal-Bench 2.0 Verified 的命令行工作流。

默认运行模型是 GPT-5 mini，指标为任务完成率 TCR。

〓 表1 在 GPT-5 mini 设置下，HarnessFix 相比初始 harness 的任务完成率提升

注：指标为 TCR，论文报告为三次独立运行的算术平均值。

在端到端比较中，HarnessFix 平均比 human-designed harness 高 6.3 个百分点，也比从同一初始 harness 出发的自动 self-evolution/repair baseline 高 6.9 个百分点。

即使面对最强的 Meta-Harness，HarnessFix 仍高出 2.6 到 5.0 个百分点，同时 Meta-Harness 的离线 evolving/repair token 消耗比 HarnessFix 多 63.5% 到 100.5%。

诊断质量也支持这个解释。Full HTIR 在人工标注诊断集上达到 85.0% step accuracy、83.8% cause accuracy、81.3% implementation anchor accuracy、86.2% harness-layer macro-F1 和 82.5% repair-operator accuracy；raw trace 的对应指标只有 55.0%、53.8%、50.0%、58.4% 和 51.3%。

消融实验显示，prompt-only repair、去掉 trace-grounded diagnosis、去掉 scoped repair operators、去掉 regression-aware acceptance 都会降低表现。

跨模型迁移实验中，用 GPT-5 mini 修好的 GAIA harness 在 Claude Sonnet 4.5、DeepSeek V3.2、Qwen3.5 Plus 和 Gemini 3 Pro 上仍带来 5.5 到 9.5 个百分点提升，说明一部分修复确实针对的是模型共享的 harness 机制，而非单个模型的偶然行为。

这篇工作的边界

HarnessFix 并不是在训练一个更强的模型，也不是声称 agent 失败都能靠 harness 修掉。

它依赖可获得的轨迹、可定位的 harness artifact 和可执行的验证集；如果系统缺乏可观测性，或者任务本身没有可靠的回归检查，修复质量也会受限。

但这篇论文给出的视角很重要：当 LLM agent 开始承担长链路、工具密集、带状态的任务时，可靠性问题不能只被压缩成“模型能力不够”。

失败轨迹里有证据，harness artifact 里有可修的机制；把两者对齐，才可能让 agent 系统从事后调参走向可诊断、可验证的工程修复。

**更多阅读**

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721725&idx=1&sn=0d27f93fd35c1e4a28a310f1b956189c&scene=21#wechat_redirect>)

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721660&idx=1&sn=d83e012a94601ad35aacb132e5f9493f&scene=21#wechat_redirect>)

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721463&idx=1&sn=3239c4d6d252661fc3142433e75b8b13&scene=21#wechat_redirect>)

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

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=7e8131f3&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzIwMTc4ODE0Mw%3D%3D%26mid%3D2247722169%26idx%3D2%26sn%3Dfdb17581cfd7cf4fc0f4a9db4a156059>)
