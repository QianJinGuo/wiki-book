---
sha256: ac662c10b4b991cad97b75a8ea8e3d81e4eb44d6a3eab834b5cdc598f3d5118b
source: rss
source_url: https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651052471&idx=2&sn=e243403e1ae25a94cb0822e80332c0fc
ingested: 2026-08-27
feed_name: WeChat-机器之心
source_published: 2026-08-26
source_published: 2026-08-26
---

# Shopify CEO考虑禁用Claude Code，因其不兼容AGENTS.md

原创 关注编程的 2026-08-26 17:30 北京

Anthropic：正在让 Claude Code 更加灵活

机器之心编辑部

Shopify CEO Tobi Lütke 考虑在 Shopify 禁用 Claude Code，直到其支持读取 `AGENTS.md`、`.agents/skills` 等文件。

他认为，Claude Code 坚持读取 `CLAUDE.md`，在团队成员使用不同 AI 编程工具时，可能导致同一个代码仓库里的开发者获得不同的项目规则和操作指令。

随着 AI coding agent 进入软件开发流程，越来越多代码仓库开始加入专门面向 AI 的说明文件。

这些文件通常会写入项目结构、编码规范、测试要求、开发流程以及可调用技能，让 AI 代理在处理代码前获得相对稳定的项目上下文。

`AGENTS.md` 正在成为其中较常见的一种约定。OpenAI Codex、Cursor、Amp 等工具已经支持相关格式，一些项目还会通过 `.agents/skills` 目录组织更细化的技能与操作规范。

Claude Code 采用的是另一套体系，包括 `CLAUDE.md` 以及 `.claude/skills` 等文件和目录。

当团队成员同时使用多种 AI 编程工具时，两套配置入口便可能产生同步问题。同一个代码仓库中，使用 Codex 的开发者可能读取 `AGENTS.md`，使用 Claude Code 的开发者则会获得 `CLAUDE.md` 中的内容。如果两份文件在某个目录出现差异，AI 获得的项目规则也会随之不同。

这引起了不少共鸣。

开发者社区很快给出了一批现成方案。

最常见的方法之一，是在项目中建立软链接：`ln -s AGENTS.md CLAUDE.md`

另一种方式利用了 Claude Code 自身的文件引用能力。开发者可以在 `CLAUDE.md` 中写入 `@AGENTS.md`，让 Claude Code 加载团队已经维护的通用规则，同时保留在 `CLAUDE.md` 中加入 Claude 专属配置的空间。

面对评论区不断出现的解决办法，Lütke 随后再次发帖回应。

「很多人告诉我处理这个问题的技巧——我全都知道。」他进一步解释，agent 和 Claude 相关配置文件都会沿目录树递归应用。在拥有数千名开发者的大型 monorepo 中，很难保证每个目录始终同时维护完整的两套文件。一旦某个目录缺少其中一份配置，部分开发者使用的 AI 工具就可能获得不同的项目上下文。

「我们可以通过自动化修复，」Lütke 写道，「但这是一种不应该由开发者承担的愚蠢的复杂性税（complexity tax）。」

对于个人项目或规模较小的代码仓库，这些方法通常比较容易实施。

Lütke 的担忧集中在规模放大后的维护环节。Shopify 这样的 monorepo 包含大量目录和多人并行开发场景，配置文件需要持续跟随目录结构、项目边界和团队规范变化。软链接、引用关系和同步脚本也会成为工程系统中的长期维护对象。

# Anthropic：正在让 Claude Code 更加灵活

随后，Claude Code 团队成员 Thariq 也回复了 Lütke。他表示，相关功能准备发布后，他会继续分享进展。

他同时解释了 Anthropic 此前的产品思路。

Claude Code 团队认为，不同模型家族具有各自的行为特点，system prompt 会显著影响模型表现。Claude 模型对于 skills、system prompt 和 `CLAUDE.md` 的组织方式有特定偏好，Claude Code 也会针对不同模型配置不同的 system prompt。

这套思路与 Anthropic 近期关于「context engineering」的讨论相呼应。今年 7 月，Thariq 曾分享 Claude 5 一代模型的上下文工程经验，并称团队在最新模型中移除了约 80% 的 Claude Code system prompt，同时总结了如何编写 system prompt、skills 和 `CLAUDE.md`。

面对 Lütke 提出的兼容需求，Thariq 也承认，多套配置会产生额外维护工作，并表示团队会持续跟进。

目前的短期方案仍包括在 `CLAUDE.md` 中引用其他 Markdown 文件，例如通过 `@AGENTS.md` 加载已有内容。

当被问到是不是打算通过开源 harness 来实现时，Thariq 还调侃了一下 Claude Code 之前「被开源」。

你有遇到过类似的困扰吗？欢迎在评论区讨论。

参考链接：<https://x.com/tobi/status/2092259436538495186>

© THE END 

转载请联系本公众号获得授权

投稿或寻求报道：liyazhou@jiqizhixin.com

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=df7ba356&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzA3MzI4MjgzMw%3D%3D%26mid%3D2651052471%26idx%3D2%26sn%3De243403e1ae25a94cb0822e80332c0fc>)
