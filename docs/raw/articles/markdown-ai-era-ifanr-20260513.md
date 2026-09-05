---
title: Markdown 不会过时
source_url: https://mp.weixin.qq.com/s/bmOE1VnUx1dj6ZYPIH3o9Q
publish_date: 2026-05-13
tags: [wechat, article, claude, agent, coding]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 4f2b63f0b503a1c771bcfa4ca452d41279a0bd0bb580f72e8d6115af0fb70bf6
---
# Markdown 不会过时
人类花了半个世纪把文档从打字机搬到 Word，又花了二十年搬到云端。结果 AI 时代真正的通用格式，是一门 2004 年发明的纯文本语言——Markdown。
## Thariq 的 HTML 主张 vs Markdown
Claude Code 工程师 Thariq 提出新观点：不用 Markdown，HTML 才是未来。观点在 X 上获得千万次浏览，Karpathy 转发并评论。
Karpathy 的看法：音频是大语言模型最好的输入，视觉是最好的输出；在 HTML 之后还有交互动画、神经网络直接生成的视频、以及最终某种人机之间真正的感知融合。
## 为什么 Markdown 最适合 AI
**诞生背景**：2004 年诞生，设计目标是「写起来像纯文本，渲染出来像 HTML」。2008 年随 GitHub 崛起成为程序员标准写作格式。
**AI 偏爱 Markdown 的原因**：
1. **训练数据**：大量技术博客/论坛以 Markdown 写作，模型学到的不只是格式，还有「Markdown = 认真、结构化、专业」的关联
2. **结构信号局部化**：一个标题只需 `#`，一个列表只需 `-`，`**` 就是加粗。不需要看很远上下文就能判断 token 的语义角色
3. **Token 效率**：HTML `<h1></h1>` vs Markdown `#`，语义跨度长（`<div>` 要等到 `</div>` 才闭合），模型生成时需要「记住」更远状态，负担更重、出错概率更高
4. **RLHF 奖励信号**：标注员给高分的回答往往有清晰标题、分点列举、结构一目了然——在纯文本环境里就是 Markdown
## 为什么不是 PDF、Word、PPT
- **PDF**：设计目标是「打印出来好看」而非「机器好读」。内部存储字符坐标而非文本逻辑顺序，两列布局解析出来顺序全乱；表格用绝对坐标定位，无语义信息
- **DOCX/PPTX**：本质是 ZIP 压缩包（XML），大量样式标记（字体、颜色、段落间距、主题）占用 token 但对理解内容毫无帮助
- **JSON/XML**：为程序解析设计，对语言模型是错配——模型通过 token 统计关联理解世界，而非程序式解析
- **TXT**：无噪声但无结构信号，模型靠自然语言线索猜结构，准确率不稳定
**Markdown 刚好在两者之间**：纯文本 + 轻量结构信号（`#`、`**`、`-`、` ``` `），不需要特殊工具解析，不会有 PDF 坐标混乱或 Word XML 噪声。
## HTML 的真正角色
Thariq 的 HTML 主张适用于：
- 详细需求文档（可用标签页、插图、链接组织结构）
- 可视化代码审查
- 交互原型（动画、动作效果）
- 研究报告
**但 HTML 和 Markdown 不竞争**：HTML 挑战的是 Markdown「用户最终看到的东西」这个角色，而非 Markdown 作为 AI 工作记忆/上下文载体的地位。
Karpathy 的格式演进图谱：
- 音频 = AI 最好的输入
- 视觉 = AI 最好的输出
- HTML = 当前的前台渲染
- 可交互 3D 空间 = 下一站
- 直接写进视网膜的信号流 = 最终形态
## 结论：Markdown 是协议，不是界面
> Markdown 是 AI 的工作语言，是上下文的载体，是 Agent 之间传递信息的格式。但它不需要是用户最终看到的东西。
HTML 或未来某种更好的格式，是 Markdown 被渲染之后的界面。Markdown 可以是 HTML 的一部分，被嵌入到网页里。
> 每一代人都在争论下一个界面是什么。但真正活下来的，从来不是界面，是协议。
Markdown 不会被取代，只会被遗忘。而在技术的世界里，被所有人遗忘，恰恰是一种格式最终胜利的方式。
---
来源：爱范儿（Ifanr）2026-05-13
https://mp.weixin.qq.com/s/bmOE1VnUx1dj6ZYPIH3o9Q