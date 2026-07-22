---
title: "如何手搓一个 CLI：只需 80 行代码，彻底看清 AI 的底层逻辑"
source: wechat
url: https://mp.weixin.qq.com/s/vw8UrflhcAOBJs-l7EQ8GA
ingest_date: 2026-07-04
vxc: 63
stars: 4
sha256: 42365baa70d0abbca1f154bdb5156bd4c833e6016fae6d31437e1a7a51a52ff4
---

# 如何手搓一个 CLI：只需 80 行代码，彻底看清 AI 的底层逻辑

**来源**: 高可用架构

**发布日期**: 2026-03-09

**原文链接**: https://mp.weixin.qq.com/s/vw8UrflhcAOBJs-l7EQ8GA

---

导读 ：文章介绍了通过构建简单AI命令行工具（CLI）来学习 AI 底层机制的教程，强调“做中学”比阅读更有效，并分享了一个仅80行代码的GitHub仓库，无需框架，直接使用 Anthropic 的 Claude API。

作者：Morgan Linton，Bold Metrics联合创始人兼CTO，早年加入Sonos，曾就读卡内基梅隆大学工程系。现居Tahoe，热衷AI开源项目（Zen Open Source）、域名投资与持续学习。

我认为我们正进入一个非常酷的历史时期：人们的学习方式正在从“读博看片”（看书和看 YouTube 视频）转向“直接开搞”（动手构建）。这也意味着，任何人都能比以前更深入地掌握知识。因为我始终认为， 实践出真知 ，这比单纯的阅读或观看要高效得多。

最近，我一直在深挖 CLI（命令行界面） 。因为我相信，随着我们进入一个“智能体（Agent）多于人类”的软件交互时代，CLI 将变得越来越重要，尤其是在对速度和性能有极致要求的情况下。

大多数 AI 教程在让你理解底层逻辑之前，都会先扔给你一个框架（比如 LangChain 等）。但我感觉， 从原始的 API 调用开始 ，能让你真正理解以后那些框架到底在封装什么。

就我个人而言，我经常思考“ 智能体商业（Agentic Commerce） ”。当涉及到帮助 AI 智能体做出购买决策或向购物者展示内容时，每一秒钟的速度差异都至关重要。

所以，考虑到 CLI 正在变得（或者说已经）如此重要，我想随手写一个简单的 AI CLI 。它不仅人人都能上手构建和使用，还能帮你理解 AI CLI 的底层运作原理。在这个示例中，它由 Claude 驱动。

你不需要精通编程也能理解并运行它。我已经把 GitHub 仓库公开了，你甚至可以先去瞄一眼：

🔗 SimpleCLI  [1]

好了，现在让我们通过亲手构建一个简单的 CLI 来学习它。

### 核心亮点

首先你会注意到，所有的东西都在一个文件里：  index.js  。只有大约 80 行代码，仅此而已。 没有框架，没有抽象层 ，只有原始的 SDK 和 Node.js 自带的功能。

通过亲手构建、克隆仓库或阅读代码，你会了解到 LLM（大语言模型）在 API 层面是如何工作的，以及构建一个 CLI 是多么简单——这也能解释为什么它们运行得如此之快。

### 9 个核心组成部分详解

- 导入 (Imports)
   ：三样东西：
   dotenv
   （读取环境变量）、Node 自带的
   readline
   （终端输入输出）、Anthropic SDK（内置流式传输的 HTTP 客户端）。

- 客户端设置
   ：使用
   new Anthropic()
   。SDK 会自动寻找环境变量中的
   ANTHROPIC_API_KEY
   ，如果找不到就会报错。

- 对话历史 (Conversation history)
   ：这是我希望大家产生
   “原来如此！”（Aha moment）
   的地方。Claude API 完全是
   无状态
   的——它不记得任何事情。你需要自己维护一个包含
   { role, content }
   对象的数组，并在每次请求时把整个数组发过去。
   这个数组就是它的“记忆”。

- 系统提示词 (System prompt)
   ：作为一个独立字段发送，不在
   messages[]
   数组里。它决定了 Claude 的全局行为。换掉它，就能彻底改变 AI 的性格。你会发现我已经把我的偏好写进去了，因为我受不了 Claude 默认那种客套过头的性格，所以我把它改成了：“你是一个简洁的 CLI 助手。直接、准确、别废话，实话实说。”

- Readline
   ：封装了标准输入（stdin）和标准输出（stdout），让你能逐行接收终端输入。这是 Node 内置的，不需要额外依赖。

- ANSI 颜色
   ：锦上添花的小功能。只是三个利用转义代码的小辅助工具。比如
   \x1b[36m
   是青色，
   \x1b[0m
   是重置。在任何现代终端都能跑。

- chat()
   函数
   ：真正的 AI 调用。使用了
   client.messages.stream()
   而不是
   create()
   。区别在于
   stream()
   会在每个 Token 生成时触发事件，这样你就能立即看到输出，而不用等整段话生成完。最后，所有文本会被推入历史数组，以便 Claude 下次参考。

- 输入循环
   ：一个递归异步函数。它提示输入、等待输入、调用
   chat()
   ，然后再次调用自己。它还处理了两个斜杠命令：
   /quit
   用于安全退出，
   /history
   用于查看原始的 JSON 上下文。

- 入口点 (Entry point)
   ：打印标题并启动循环。大功告成！🕺

你会发现  index.js  文件里的注释非常详尽，你可以对照仓库里的文件一起看。

几个我觉得很有趣、且新手可能没意识到的点：

- Claude（以及所有主流 LLM API）完全是
  无状态
  的——两次调用之间它没有任何记忆。

- 所谓的“记忆”只是一个
  由你亲手维护
  并在每次请求时发送的数组。

我自己以前也不知道这一点，当我学到这里时，感觉认知被刷新了。把“记忆”看作一个简单的数组，也让我意识到在大学学习数组是多么有用——天呐，它们从未过时，甚至比以往任何时候都更有用。

好了，现在你有一个可以把玩的简单 CLI 了，也了解了 AI CLI 的底层逻辑。去 Fork 它，拆解它，扩展它，尽情折腾吧！有了这个基础，你会学到更多。

就这样，我没有通讯录要推销，也没有播客让你订阅。我唯一的请求是：如果你觉得这东西有用，请点赞并分享。

哦还有最重要的一点：我会尽力回复每一条评论。在 X（原 Twitter）上的交流是我最喜欢的。所以如果你有任何问题、建议或看法，请在下方留言，让我听到你的声音！

原文： https://x.com/morganlinton/status/2030366723711651857  [2]

接下来我们看下这个 GitHub 项目

## AI CLI

这是一个由 Claude 驱动、极简且 AI 原生的命令行聊天界面。 单文件架构，无框架封装，支持 Token 流式实时输出。 由 Morgan Linton 开发的开源项目。

## 前提条件

- Node.js
  [3]
  v18 或更高版本

- 一个
  Anthropic API 密钥
  [4]

## 项目设置

# 1. 克隆或下载本项目，然后进入文件夹  
cd ai-cli  

# 2. 安装依赖  
npm install  

# 3. 创建环境变量文件  
cp .env.example .env  

# 4. 打开 .env 文件并粘贴你的 API 密钥  
ANTHROPIC_API_KEY=sk-ant-your-key-here

## 运行项目

npm start

你会看到如下提示符：

AI CLI  |  输入 /quit 退出  |  输入 /history 查看上下文  

You: _

输入任何内容并回车，Claude 将实时给出响应。

## 内置命令

命令
功能说明

/quit 或 /exit
退出 CLI

/history
以 JSON 格式打印完整的对话上下文

## 运作原理

无状态 API，有状态数组。 Claude API 在两次调用之间不具备任何记忆。本应用维护了一个包含所有消息的  history  数组，并在每次请求时将整个数组发送给 API。 这个数组就是 AI 的“记忆”。

流式传输 (Streaming)。 使用  client.messages.stream()  而非  client.messages.create()  ，这样 Token 会在生成时立即打印，而无需等待完整响应就绪。

单文件。 整个应用都位于  index.js  中。只需约 5 分钟即可从头到尾读完代码。

## 参考阅读

- 从任务到系统：深度拆解2027年百万年薪的6项AI核心技能

- Context 不是免费的：解析长文档 agent 的性能天花板与架构优化

- 别再死磕模型调优了！Cursor和Manus告诉我们: 外壳(Harness)才是真正的护城河

- 像智能体一样观察：Anthropic 团队谈 Claude Code 工具设计的演进与艺术

References

- SimpleCLI:
   https://github.com/Zen-Open-Source/SimpleCLI

- https://x.com/morganlinton/status/2030366723711651857

- Node.js:
   https://nodejs.org/

- Anthropic API 密钥:
   https://console.anthropic.com
