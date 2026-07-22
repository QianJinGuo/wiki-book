---
source: wechat
source_url: https://mp.weixin.qq.com/s/OR2TTDdfsv250JS8A2BtLA
ingested: 2026-07-11
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-07-11
sha256: ea15db2fc229ffc9ec1d39b3e2bdcd2eadc8bce1022c98471a93925d880597a6
---


# 仅11天，Claude重写百万行代码，AI史诗级工程却引来愤怒

机器之心编辑部

  


这几天，科技圈都在吃瓜：编程语言 Zig 的创始人 Andrew Kelley 怒了。

  


  


原因在于原来全面押注 Zig 语言的 Bun，被其创始人 Jarred Sumner 用 Rust 语言重写了。

  


  


Andrew Kelley 毫无遮拦地展示了自己的怒火，他没有在这个现象级技术事件中说客套话，直接将矛头对准了 Jarred Sumner 的个人工程习惯、管理能力，以及这起事件背后的商业逻辑。

  


Bun 是一个高性能 JavaScript/TypeScript 运行时，旨在成为 Node.js 的更快速、现代的直接替代品，近年来已经成为了前端世界挑战 Node.js 霸权的重量级选手。

  


Bun 的核心卖点是极速：无论是启动速度、依赖安装还是测试运行，都远超竞品，其部分原因在于它是用 Zig 语言编写的。

  


去年 12 月，Anthropic 宣布收购了 Bun，将其作为基础设施来驱动其 AI 编程工具 Claude Code 和 Claude Agent SDK。Jarred Sumner 和 Bun 团队的其他成员目前都在 Anthropic 工作。

  


在大规模应用，尤其是作为 Claude Code 的底层后，Bun 团队认为遇到了难以根除的稳定性问题。

  


具体来说，Zig 版本的 Bun 存在大量内存安全 bug——use-after-free、double-free、错误路径中忘记释放内存等。这些问题在 Zig 中只能靠编码规范约束，而在 Rust 中通过借用检查器和 Drop 机制会直接变成编译错误。

  


另一方面，Zig 上游社区对大语言模型（LLM）生成代码采取零容忍政策，即使是与 AI 无关的优化改动也无法合入上游。Bun 团队重度依赖 AI 辅助开发，继续使用 Zig 意味着必须长期维护自己的编译器分支，成本很高。

  


于是在今年 5 月，我们见证了科技圈的一场大工程：Bun 的创始人 Jarred Sumner 宣布，将 Bun 的百万行代码在 11 天内推倒重来用 Rust 重写了，他们使用的是 Anthropic 当时尚未公开发布的 Claude Fable 5（Mythos 级模型）和 Claude Code 的动态工作流能力。

  


  


这是一次史诗级的智能体工作流（Agentic Workflow）大测试，后来也被 Anthropic 作为 Dynamic Workflows 的标杆案例进行宣传，但也因为「背叛信仰」引来了争议。

  


Zig 创始人 Andrew Kelley 在最近的博客文章中指出，Bun 在改写前之所以 Bug 频出，根本原因是 Jarred Sumner 糟糕的工程习惯。

  


首先是 AI 还没有兴起的时候，Jarred 就一直在写垃圾代码。Kelley 表示，Zig 团队经常会检查用户的代码库，而他们对 Bun 的代码库感到「极其恐惧」。里面充满了黑客式的补丁摞补丁（hacks on top of hacks）、滥用断言，并且为了快速上线新功能，几乎从不花时间消除 Bug 和技术债。

  


然后就是用 Claude 生成的百万行代码了。Kelley 反问道：「Bun 官方声称 100 万行未经过人工审查的 Rust（AI 写的）代码因为有测试用例所以是安全的；那如果测试用例真的这么完备，为什么原来用 Zig 写的时候没能抓出那些烦人的 Bug？」

  


现在，Kelley 对 Jarred 从一个有新手冲劲（beginner energy）的开源开发者变成一个糟糕的经理（stinky manager）感到极度失望。

  


Kelley 直言当得知 Bun 决定弃用 Zig 时，他不仅没有被背叛的愤怒，反而松了一口气。他害怕打着 Zig 招牌的 Bun 会让外界产生误解，更怕它引来一群只会复制粘贴 AI 代码的用户。他甚至讽刺地表示，自己正捧着一杯茶，庆幸「这终于不关我的事了」。

  


这么直白的开火，科技圈的其他人也纷纷加入战局，发表了看法。

  


首先是算了一笔账：都说 Claude 的 token 太贵，但根据 Jarred Sumner 和 Bun 官方公布的数据，Rust 语言重写的 Bun 项目预计消耗了 16.5 万美元的 API 费用。在科技圈和工程界看来，这个价格和时间便宜得令人恐惧。

  


仅仅从账面上看，AI 将开发成本压缩到了原本的十分之一左右，时间也从大约一年减到了不到两个星期。

  


  


其次是对开源社区文化与 AI 时代碰撞的态度。有人在看完 Zig 创始人 Andrew 的博文之后感到极度不适，认为他公开攻击曾经的重要用户和赞助者（Bun 曾长期资助 Zig），显得缺乏职业素养，甚至有人激进地表示「从未如此主动希望一种编程语言失败」。

  


但也有老派程序员站出来声援，认为在这个被资本和 AI 泡沫裹挟的时代，Andrew 只是在捍卫纯粹的工程质量，展现了当年 Linus Torvalds 的作风。

  


  


当然，大家更关心的是项目这么折腾了一番之后，还是否好用。

  


目前争议最大的的地方在于，这 100 万行代码由于是 AI 直接由 Zig 机械翻译而来，缺少人类工程师的架构重构。新代码库中残留了高达 2.7 万行 unsafe 代码块。很多人担忧，未来人类开发者在维护、阅读和修改这坨庞大的「AI 生成物」时，耗费的认知成本和排错成本，最终可能会超过今天省下的前置开发成本。

  


这个打破软件工程历史规律的项目，最终会是一场 AI 改变编程范式的里程碑，还是会在未来化作一座难以维护的技术债火山？可能只能交给时间来验证了。

  


参考内容：

https://bun.com/blog/bun-in-rust

https://andrewkelley.me/post/my-thoughts-bun-rust-rewrite.html

  
  
  
**「蚂蚁InTech奖」倒计时申报中** 蚂蚁InTech奖是由蚂蚁集团发起，面向对计算机领域科研进步有关键推动作用的中国青年学者、青年博士颁发的纯公益性奖项，分为蚂蚁InTech科技奖与蚂蚁InTech奖学金。2026届蚂蚁InTech奖将于7月17日24时截止申报，有意向申报的学者/同学欢迎扫描海报中二维码进行申报。© THE END 转载请联系本公众号获得授权投稿或寻求报道：liyazhou@jiqizhixin.com
