---
source: rss
source_url: https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247722281&idx=1&sn=0b58c9f238549bdf1def79be509f745c
ingested: 2026-08-20
feed_name: WeChat-PaperWeekly
source_published: 2026-08-19
sha256: fda7160c3a4cb3ff9571ce1b43a809ed40f0778451a9cf48fecffb830bb366a5
---

# DeepSeek V4 Flash不换模型，只靠「自验证」反超Fable 5

原创 让你更懂AI的 2026-08-19 21:02 北京

答案已经在候选里

## 

把成功率拉到与 Fable 5 相近水平，DeepSeek 自验证单任务成本约 0.11 美元，不到后者的十分之一。

一个连自己都会答错的大模型，开始自己给自己挑答案了。

DeepSeek V4 Flash 在 Terminal-Bench 2.1 上对每个任务采样 5 条候选轨迹，自验证后的系统成功率达到 **88%** ，超过 Claude Fable 5。

没有额外接入更强的 GPT 或 Claude，生成和验证用的都是 DeepSeek V4 Flash。

**把成功率拉到与 Fable 5 相近的水平，DeepSeek 自验证单任务成本约 0.11 美元，Fable 5 则约 1.3 美元，成本不到后者的十分之一。**

**在这组实验里，多采样几次后，正确解往往已经出现在候选中，真正拉开差距的是能不能把它选出来。**

**这组新实验来自斯坦福、UC Berkeley 和 NVIDIA Research 团队此前提出的****LLM-as-a-Verifier** 。**它通过更细粒度的验证和排序，从 Agent 的多次尝试中筛选更可靠的结果。**

****

项目主页：

<https://llm-as-a-verifier.com/>

论文地址：

<https://arxiv.org/pdf/2607.05391>

代码地址：

<https://github.com/llm-as-a-verifier/llm-as-a-verifier>

API地址：

<https://llm-as-a-verifier.com/docs/>

DeepSeek V4 Flash 的自验证实验

这组结果来自项目 8 月 14 日发布的 **v0.2.0** 更新，其中新增了 DeepSeek V4 Flash 验证支持和 Terminal-Bench 2.1 自验证基准。

从项目整体设计看，LLM-as-a-Verifier 不只用于测试时扩展，验证信号还可以用于进度跟踪和强化学习。

〓LLM-as-a-Verifier 框架概览

实验中，每个任务预先由 DeepSeek V4 Flash 生成 5 条 mini-swe-agent 执行轨迹。Best-of-3 使用其中前 3 条，Best-of-5 使用全部 5 条。

DeepSeek V4 Flash 同时负责给候选轨迹打分，LLM-as-a-Verifier 据此完成排序和选择，**整个过程不需要再训练一个专门的验证模型 。**

效果并不只是小幅涨点。**Best-of-3 将成功率从 79.4% 提到 86.5%，Best-of-5 则把 78.7% 直接推到 88.0%。**

放到 Terminal-Bench 2.1 的成本—性能图里，差距更加直观。

〓DeepSeek V4 Flash 自验证的成本与任务成功率

DeepSeek 一侧使用 DeepSeek V4 Flash Max，成本按当时的 OpenRouter 定价计算。GPT-5.6 和 Claude 系列基线则沿用 GPT-5.6 技术报告中的结果。

上述成绩是系统级结果。DeepSeek 一侧加入了多次采样和 LLM-as-a-Verifier，Fable 5 一侧使用 Claude Code，因此不能直接视为两个基础模型在相同条件下的单次横评。

〓DeepSeek V4 Flash 自验证结果

项目还公开了这组实验的候选执行轨迹，以及 Best-of-3、Best-of-5 对应的复现脚本。

Best-of-5 还有一个更关键的数字，**Oracle（理想选择上限）达到 96.6%** 。

它说明，对大量任务来说，5 条候选里已经至少出现了一条成功轨迹。模型能够生成正确解，但验证器还没有把它们全部找出来。

原论文进一步汇总了 Terminal-Bench V2 排行榜中不同模型和 Agent 配置产生的执行轨迹，理想选择器下的任务覆盖率最高达到 98.9%。

〓候选覆盖率与评分概率分布

连续验证如何区分候选轨迹？

同一模型自验证并非让模型直接判断自己是否答对，而是先得到更细粒度的验证分数，再据此排序多个候选轨迹。

常见的 LLM-as-a-Judge 评估方式直接输出离散分数。两条质量不同的长执行轨迹，很可能同时得到 4 分或 5 分，离散评分无法继续区分二者。

原论文在 Terminal-Bench V2 上测得，单次离散评分的平局率达到 **26.7%** 。

LLM-as-a-Verifier 不只读取最终分数，而是保留各个评分 token 的概率分布，再通过概率加权得到连续验证分数。

即使两个候选最终都输出 4 分，只要模型对不同评分档位的置信分布不同，仍然能够进一步拉开差距。

框架还进一步使用更细的评分粒度，并通过重复评估降低单次判断的波动，同时将整体评价拆成多个维度分别判断。

〓验证扩展的三个维度

面对更多候选，框架使用 Probabilistic Pivot Tournament（PPT，概率枢轴锦标赛）进行排序，将完整的  两两比较降至 。

〓概率枢轴锦标赛的候选筛选流程

自验证的测试时扩展

低成本也不只来自模型价格。这次更新还专门优化了验证阶段的前缀缓存，Terminal-Bench 2.1 上缓存命中率从 5.2% 提升到 78.4%，未缓存输入成本也随之大幅下降。

测试时预算可以有不同的分配方式。选择更强的模型、增加采样次数，或把更多计算投入候选验证和选择，都会改变整套系统的成本—性能权衡。

5 次采样的实际结果距离 **96.6%** 的理想选择上限仍有明显差距。

**下一步最直接的提升空间，就在把现有候选选得更准。**

**更多阅读**

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721660&idx=1&sn=d83e012a94601ad35aacb132e5f9493f&scene=21#wechat_redirect>)

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721599&idx=2&sn=379a8064b9ae1a916e717f25301ec44d&scene=21#wechat_redirect>)

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

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=3e80ed59&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzIwMTc4ODE0Mw%3D%3D%26mid%3D2247722281%26idx%3D1%26sn%3D0b58c9f238549bdf1def79be509f745c>)
