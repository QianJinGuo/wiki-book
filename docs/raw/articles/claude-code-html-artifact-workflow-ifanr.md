---
source_url: https://unknown/claude-code-html-artifact-workflow-ifanr
tags: [article]
ingested: 2026-05-01
sha256: f0666ea4c70a6eb9935c03138ce6ca14dc4c1bac5a6aa8c83eef4f02986af970
---
Anthropic 在 2026 年 5 月 20 日发了一篇 Claude Code blog，标题叫《Using Claude Code: The unreasonable effectiveness of HTML》。这篇文章讲的是为什么团队成员越来越喜欢让 Claude Code 输出 HTML，逐步替代长篇 Markdown。（P.S. 我现在Html都觉得慢，喜欢gpt-image-2生成总结图限概览一遍）

但如果放到 Claude Code 最近几个月的产品节奏里看，它讲的其实是一个更大的问题：Agent 做的事越来越复杂之后，人怎么继续看懂它、审它、接住它的中间成果。

这篇文章真正讲的是什么

文章的表层观点很明确：Markdown 简单、可移植、容易编辑，也很适合短文本。但当 Claude Code 开始生成更长的计划、方案、PR 说明、设计探索、研究报告时，Markdown 会变成一堵墙。

作者提到一个很真实的场景：超过 100 行的 Markdown，他自己也不太会认真读，更不用说让同事读完。这个点很关键。Agent 产出的东西给机器看，也给人看。它经常要被 review、转发、复用，甚至作为下一轮实现的上下文。

HTML 在这里的价值就出来了。它能放表格、CSS、SVG、图片、交互控件、代码片段、流程图、绝对定位和 canvas。换句话说，HTML 可以把原本线性的输出，变成一个可导航的工作界面。

这里讨论的核心是提高人类审阅 agent 的带宽。

Markdown 强在轻，弱在线性

Markdown 对短任务很好。写个计划、解释一个函数、列一个 checklist，都没问题。

但复杂任务不一样。比如你让 Agent review 一个 PR，它需要同时表达：

PR 改了哪些文件。

风险集中在哪些模块。

diff 的关键行为什么要看。

调用链怎么走。

哪些问题是 blocking，哪些只是建议。

这些信息如果都放进 Markdown，阅读体验会很差。你需要上下滚动、脑内对齐、自己记住上下文。人一累，就会跳读。跳读之后，Agent 的错误就更容易漏过去。

HTML 可以把这些东西摊开：diff 放中间，旁边放注释；风险点用颜色标出来；模块关系画成图；长内容折叠；每个结论可以挂到对应代码片段上。

关键在 artifact 循环

我觉得这篇文章最值得拿走的是一个工作流，远比“以后都让 Claude 输出 HTML”这句口号更有价值：

让 Claude Code 读取项目上下文。

生成一个单文件 HTML artifact。

人在这个 artifact 里比较、审阅、调参数、选方案。

把选择结果导出成 Markdown、JSON、prompt 或 diff。

再交给下一轮 Claude Code 实现或验证。

这里的 HTML 主要扮演中间协作层。它像一个临时控制台，服务当前问题，用完可以留下来当记录，也可以给另一个 agent 继续读。

文章的 companion gallery 里有 20 个单文件 HTML 示例，覆盖方案探索、代码 review、设计、原型、图解、deck、研究、报告和自定义编辑器。这个 gallery 很有说服力，因为它展示的是具体场景。

Claude Code 的优势在上下文

文章里有个点很重要：作者说，用 Claude Code 生成 HTML，比用 Claude.ai 或 Claude Design 更有价值，原因是 Claude Code 可以读更多上下文。

它能读文件系统、git history，也能通过 MCP 接 Slack、Linear 等工具，还能结合浏览器上下文。上下文越多，生成出来的 HTML 就越不像普通网页，越像项目工作台。

比如让它解释一个 rate limiter。普通聊天工具可能只能给你一段通用解释。Claude Code 可以读代码，找到配置，摘出关键片段，画 token bucket 流程图，再把 gotchas 放到底部。这个 HTML 文件更像项目知识的临时界面。

Output styles 是另一个信号

我还专门看了 Claude Code 的 Output styles 文档。文档里明确说，output styles 会修改 Claude Code 的 system prompt，用来设定角色、语气和输出格式。

把这件事和这篇 blog 放在一起看，信号很清楚：Anthropic 不只是让用户临时 prompt 一句“make an HTML file”。它在把输出形态产品化。

以后 Claude Code 可能不只是一个会改文件的终端工具，它还会持续产出某种稳定格式的工作成果。比如 always diagrams first、always reviewer artifact、always implementation report。输出格式会变成团队流程的一部分。

这对 coding agent 很关键。很多团队真正卡住的地方，在 agent 做完之后：结果不好审、过程不好复盘、下一步不好交接。

最该直接套用的场景

我会优先在这些任务里让 Agent 输出单文件 HTML：

复杂 PR review。

多方案技术选型。

陌生模块理解。

设计稿和组件状态对比。

事故复盘时间线。

prompt 或配置调参。

Linear ticket 优先级整理。

研究报告和竞品分析。

这些任务都有一个共同点：你需要比较、审阅、分享，或者把人的判断再回流给 Agent。

如果只是问一个命令、改一个小 bug、解释三行代码，Markdown 仍然够用。HTML 的额外 token 和文件复杂度没有必要。

可以直接用的 prompt

可以从这个模板开始：

请读取当前项目上下文，生成一个单文件 HTML artifact，用来帮助我审阅这个任务。

要求：
- 第一屏给出 TL;DR 和风险点
- 用横向对比展示方案差异
- 用 SVG 或简洁图形展示模块关系
- 关键代码片段加注释
- 结尾提供 copy as Markdown 按钮，导出我可以贴回 agent 的下一步指令
- 不依赖外部资源，CSS 和 JS 内联

这类 prompt 的关键是先想清楚 artifact 要帮你完成什么判断。

总结

这篇文章最有价值的判断是：Agent 的输出会越来越像界面。

Markdown 还会长期存在，尤其适合短说明和轻量协作。但复杂任务里的计划、审阅、解释、原型、复盘、调参，会越来越适合变成单文件 HTML artifact。

原因很现实。Agent 做得越多，人越容易脱离过程。HTML artifact 给了人一个重新进入过程的位置：能看重点，能比较方案，能调参数，能导出结果，能把判断交给下一轮执行。

所以我不把这篇文章看成格式偏好。我更愿意把它看成 Claude Code 团队对 agent 工作流的一次公开提示：下一代 coding agent 不只要会做事，还要会交付让团队愿意看的中间成果。
