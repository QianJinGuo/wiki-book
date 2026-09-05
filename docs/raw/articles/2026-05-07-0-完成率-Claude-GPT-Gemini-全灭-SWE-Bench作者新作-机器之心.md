---
title: "0%完成率！Claude、GPT、Gemini 全灭，SWE-Bench作者新作把AI圈干沉默了"
source_url: "https://mp.weixin.qq.com/s/43wPVMKzNxC_R0ZYmUn0Rg"
ingested: 2026-07-01
sha256: 61a9a437db372ffa64f40fff9fbf9c0202c994e9d2cf890fbf425e82a61dc68a
---

编辑｜Sia

SWE-Bench 的创建者，刚刚又放出了一个地狱级新 benchmark。

结果相当震撼：

Claude Opus 4.7、GPT-5.4、GPT-5 mini、Gemini 3.1 Pro、Gemini 3 Flash——这一代几乎所有最强的一线模型，全部 0% 完成率。

没有一个模型，能够真正完整重建一个软件项目。

这意味着什么？

今天的大模型，已经很会写代码了，但依然不会做软件工程。

最近，Meta FAIR 联合斯坦福、哈佛等机构发布了一项很有意思的新 benchmark， 本质上是在重新定义 AI Coding 的评估方式：

ProgramBench: Can Language Models Rebuild Programs From Scratch?

过去的大模型编程 benchmark，大多测的是局部能力：补全函数、修复 bug、实现 feature……本质上，仍然是在已有代码结构里做局部修改。

而 ProgramBench 第一次把问题推进到了真正的软件工程层面：如果只给 AI 一个程序的功能描述和 usage docs，它能不能像真正的工程师一样，从零开始，重新构建一个真实、可执行的软件系统？比如 ffmpeg、SQLite、ripgrep。

而且——不能联网。

换句话说：模型到底有没有工程智能？

为了测试这一点，研究团队直接删除了原始源码和测试，只保留 executable 和 usage docs，模型需要自己决定语言、架构、模块拆分、数据结构乃至整个 repo 的组织方式。

更关键的是，ProgramBench 不再按照源码相似度打分。它采用的是 behavioral equivalence，行为等价。也就是说，你可以用完全不同的语言、算法、架构，甚至完全不同的工程实现。只要最终输入输出行为与原程序一致，就算通过。

研究团队甚至使用了 agent-driven fuzzing，自动生成大量端到端行为测试。

这是第一次，一个 benchmark 真正开始逼近现实世界的软件工程，而不再只是代码做题。结果出来之后，整个 AI 圈都沉默了。

所有模型：0% 完成率。

Table 2 负责制造震撼，那么 Figure 4 负责解释震撼背后的细节。它告诉我们，模型并不是完全不会做，而是经常能做出一部分，甚至在少数任务上接近完成；但只要要求 100% 行为等价，所有模型都会倒下。但这最后一公里，正是软件工程和普通代码生成最大的区别。另外，如果 矮子里面拔将军，Claude 系列（尤其是 Opus 4.7 和 4.6）表现相对最好。

即便论文专门增加了一个 Almost 指标——统计那些完成度超过 95% 的任务。目前表现最强的 Claude Opus 4.7，也只有 3% 的任务接近完成。

论文里，有一句特别关键的话：

Models favor monolithic, single-file implementations that diverge sharply from human-written code.

翻译过来就是：模型极度倾向于生成单体化代码。大量逻辑被塞进单文件；目录结构极浅；模块拆分极少；函数超长；整个 repo 看起来像一坨巨型脚本。

这和优秀人类工程师的习惯，几乎完全相反。

后者往往讲究模块和关注点分离，会把代码拆得很优雅——配置放  config.json  ，工具函数放  utils.py  ，数据库操作放  db.py  ，然后通过  import  相互调用。

这其实暴露出了一个非常核心的问题：AI 擅长的是局部代码生成，但不擅长全局系统规划。而真实的软件工程，本质上恰恰是后者。

这也是为什么模型在 LeetCode、SWE-Bench、Copilot 场景里已经非常强，一旦进入真实世界的大型工程系统，就会迅速掉进深水区。

当前 AI Coding 的真正瓶颈已经不再是代码生成能力，而是长期的软件系统构建能力。

另一个很有意思的结果，是不同语言之间的表现差异。

研究团队分别统计了模型在 C/C++、Go、Rust 等不同语言项目上的表现。可以明显看到，传统 C/C++ 项目完成度最高，而 Rust 表现最差。

不同模型在任务难度上的排序高度一致：nnn、fzf、gron 这类相对简单的 CLI 工具，模型普遍能拿到更高通过率；但 FFmpeg、php-src、typst、ast-grep 这类复杂系统，几乎所有模型都很难推进。这说明 ProgramBench 测到的不是某个模型偶然失手，而是复杂软件系统本身对当前模型形成了稳定压制。

这其实并不让人意外。

互联网里关于 C/C++ 的历史代码、工程实践和 Stack Overflow 内容实在太多了，模型已经被这些模式浸泡了很多年。

而 Rust 的工程哲学本身就更强调模块化、ownership、trait system 和长期可维护性，这些恰恰是当前模型最不擅长的东西。

某种意义上，Rust 测出来的，其实不是代码能力，而是工程能力。

随着 ProgramBench 引发热议，围绕这项 benchmark 的争论也开始迅速扩散。其中最主要的质疑之一是：这不就是在考模型有没有背过 FFmpeg 吗？毕竟，ProgramBench 里的很多项目本身就是公开开源软件。

对此，知名硅谷投资人 Deedy Das 专门发文回应：任何 benchmark 都可能被 overfit。

SWE-Bench 可以被记住 bug，LeetCode 可以被背题，甚至 ARC-AGI 未来也可能通过隐藏题库来避免泄漏。单纯讨论是否存在记忆本身，其实并不能否定 benchmark 的价值。

他认为：如果模型真的试图用 brute force 的方式去硬背这些程序，它往往会在别的地方明显退化。

因为真正的大模型训练，并不是简单把整个 FFmpeg 塞进参数里。更何况，研究人员还可以通过比对生成代码与原始源码的相似度，去检测是否存在直接 memorization。

他真正想强调的， 从底层重建一个真实世界的软件系统，本身就是一种高 utility、长时间跨度的复杂任务。如果模型真的能够推理并完成这类任务，那么这种能力很可能会泛化到大量其他工程场景中 。

另一类争议则更有意思。有人吐槽说：连人类都不可能从零重写 FFmpeg，这 benchmark 根本不合理。

Deedy Das 回应，那又怎样？今天很多 LLM 能做到的事情，人类平均水平也做不到。

benchmark 的目标，从来不是模拟普通人的平均能力，而是推动模型向更高层次的智能逼近。人类做不到，并不意味着 benchmark 没价值。

比如，AlphaGo 下棋超过绝大多数人，并不影响它推动了 AI；同样，一个远高于普通工程师能力边界的 benchmark，也可能是未来 Agent 系统必须攻克的问题。

当然，他也承认，ProgramBench 仍然存在不少缺陷。比如，目前它没有测试 Claude Code、Codex 这类完整的 agent harness；只统计是否完成，没有更细粒度地衡量进展。

同时还限制了联网能力，以避免一些明显作弊行为。

Deedy Das 同意，这可能导致模型为了在特定指标上得分而走偏（Hill-climbing on the wrong thing）。不过，人们也随时可以增加一项在有网络访问权限下的性能测试作为对比。

还有人建议：为什么不用真正没人解决过的新问题？对此，Deedy Das 表示，因为那会让 benchmark 几乎无法构建。

你很难为一个没有标准答案的问题设计完备测试；也很难判断任务是否真的属于现实世界工程任务，还是研究者凭空捏造出来的 challenge。

但这些问题，其实都可以随着 benchmark 演进继续修正。

真正重要的是：ProgramBench 第一次把 AI Coding 的评估，从函数级拉到了系统级。它暴露出的，也是整个行业当前最大的断层：真正的软件开发，从来都不是写一个函数，而是如何做出一个能被维护、被扩展、被团队协作的工程系统。

今天的大模型，已经非常擅长生成局部代码。但依然缺乏长期、一致、稳定地维护复杂系统的能力。

所以你会发现，最近整个行业都开始疯狂研究另一批关键词：memory、agents、repo-level reasoning、long-horizon planning、autonomous software engineering。

因为下一阶段的竞争，可能已经不再是谁能一次性生成更长的代码，而是谁能在长时间、多轮交互、复杂上下文中，持续稳定地维护一个活着的软件系统。

论文链接：

https://programbench.com/static/paper.pdf

© THE END

转载请联系本公众号获得授权

投稿或寻求报道：liyazhou@jiqizhixin.com
