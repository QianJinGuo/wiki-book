---
source: rss
source_url: https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651052598&idx=2&sn=c248e65c9354ba2d754dd3915cb37507
ingested: 2026-08-30
feed_name: WeChat-机器之心
source_published: 2026-08-27
---

# 刚刚，Claude Code又进化了，替用户起草「反馈报告」

机器之心 2026-08-27 11:57 北京

干砸了，会主动上报自己

机器之心编辑部

Claude Code 又更新了一个颇有意思的小功能。

这一次，它可以帮你起草反馈报告了。

当某个功能出现故障、Claude 发现自己犯了错误，或者你告诉它哪里出了问题时，它会自动把相关情况整理成一份报告。

你可以在发送之前进行查看、修改，并决定是否批准提交。

不过，你也可以在 /config 中禁用这一功能，或者修改它的行为设置。

官方也整理了一份详细文档，我们看下具体内容。

Claude Code 开始给自己「写反馈报告」

Claude 起草的反馈，是由 Claude 代你撰写的一份关于 Claude Code 的反馈报告。该功能要求使用 Claude Code v2.1.238 或更高版本。

Claude Code 会将每份反馈草稿保存在你的本地设备上，路径为：~/.claude/feedback/drafts/。在你主动发送之前，任何内容都不会传给 Anthropic。

具体而言，在以下情况下，Claude 会通过 SendFeedback 工具自动起草一份反馈：

  * 某个工具或命令持续失败； 

  * Claude 无法完成你提出的某项请求； 

  * 你指出 Claude 犯了错误，或者 Claude 自己意识到出错； 

  * 你要求 Claude 提交反馈。




文档地址：

<https://code.claude.com/docs/en/tools-reference>#sendfeedback-tool-behavior

Claude 起草反馈时，你会看到什么

当 Claude 将一份反馈草稿加入队列后，你会在输入框上方看到一张卡片，会显示该草稿的标题。你可以：

  * 按 1 查看草稿； 

  * 连续按两次 2，直接按原样发送； 

  * 按 0 忽略这张卡片。 




即使你忽略了卡片，这份草稿仍然会保留在反馈队列中。

当你忽略一张反馈卡片后，Claude Code 会询问你是否要关闭 Claude 自动起草反馈功能。如果你连续两次选择不关闭，它之后就不会再询问。

默认情况下，每个会话最多显示 3 张反馈卡片。

超过这一上限后，或者当你将 feedbackDrafts 设置为 quiet 时，输入框底部只会显示当前排队中的反馈草稿数量，不再弹出具体卡片。

查看和编辑反馈草稿

运行不带任何参数的 /feedback，即可打开反馈队列。

这里会列出你所有会话中尚未处理的草稿，包括那些你已经关闭反馈卡片、或者此前根本没有看到过卡片的草稿。

选中某份草稿后，你可以对其进行审核，并执行以下操作：

  * 编辑标题、所属类别和具体内容； 

  * 将 Send transcript（发送对话记录） 设置为 yes 或 no。如果 Claude 创建这份草稿时对应的会话记录仍然存在，该选项默认会是 yes，意味着发送反馈时会同时将这段对话提交给 Anthropic；选择 no 则只发送反馈报告本身； 

  * 发送草稿、删除草稿，或者暂时将其留在队列中，之后再处理。 




如果你想自己手动撰写反馈报告，可以按 w 打开标准反馈窗口。

带有文本内容的 /feedback 命令，以及 /bug 命令，也会直接打开这个标准反馈窗口。

发送反馈草稿

当你发送一份草稿时，Claude Code 会以与 /feedback 报告相同的方式提交，并遵循相同的数据保留政策。发送完成后，这份草稿会从你的本地设备中删除。

如果你直接从反馈卡片发送，会显示：✓ Sent。如果你从反馈队列中发送，窗口关闭时会显示一个回执 ID。

需要注意的是，直接从反馈卡片发送时，不会附带对话记录。

Claude Code 会在本地草稿中保存你的工作目录信息，以便找到对应的对话记录，但不会把这个工作目录发送出去。

对于启用了零数据保留（Zero Data Retention，ZDR） 的组织，Claude Code 不会提供这一工具，/feedback 也同样不可用。

删除或保留反馈草稿

当你删除一份草稿时，Claude Code 会直接将它从本地设备中移除。

如果你将草稿留在反馈队列中不处理，它会在 30 天后自动过期。

反馈队列最多可以在所有会话之间保存 10 份草稿。

当 Claude 创建第 11 份草稿时，Claude Code 会自动删除最早的一份。

哪些会话不支持 Claude 自动起草反馈

Claude Code 只会在以下场景中提供这一功能：

运行在用户自己电脑上的交互式终端会话，并且直接使用 Claude API，而不是通过云服务提供商调用。

以下场景不会提供该工具：

  * 非交互式的 -p 运行模式，以及 Agent SDK 会话，因为这些场景没有用于审核反馈队列的界面； 

  * 云端会话，例如 Claude Code on the web，因为它无法把反馈草稿写入你的本地设备； 




通过以下平台运行的会话： 

  * Amazon Bedrock

  * Claude Platform on AWS

  * Google Cloud Agent Platform

  * Microsoft Foundry




设置了以下环境变量或相关配置的会话： 

  * CLAUDE_CODE_SEND_FEEDBACK=0

  * DISABLE_FEEDBACK_COMMAND=1

  * 将 CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC 设置为任意非空值



  * 关闭了功能开关拉取（feature-flag fetching）； 

  * 已关闭产品反馈功能的组织； 

  * 启用了零数据保留（Zero Data Retention）的组织。




© THE END 

转载请联系本公众号获得授权

投稿或寻求报道：liyazhou@jiqizhixin.com

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=bd5b80a2&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzA3MzI4MjgzMw%3D%3D%26mid%3D2651052598%26idx%3D2%26sn%3Dc248e65c9354ba2d754dd3915cb37507>)
