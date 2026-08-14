---
title: "deepseek-harness是今年最有野心的一次agent开源"
source_url: "https://mp.weixin.qq.com/s?__biz=MzIwNzc2NTk0NQ==&mid=2247619604&idx=1&sn=9b2cad7baf1482f39db84a5c956eb749"
source_published: 2026-08-13
ingested: 2026-08-15
feed_name: "WeChat-夕小瑶科技说"
sha256: bd028c8d4e42aa65f1ab8e283aebe705d81daf3bce7a813cdfda3b45391b2321
---

# DeepSeek Harness，是今年最有野心的一次Agent开源

原创 夕小瑶编辑部 2026-08-14 06:00 北京

DeepSeek Harness 终于来了。

昨晚八点半，DeepSeek Harness （开发者预览版）开启上线，并开源。

虽然还只是开发者预览版，版本号都还是 v0.1，但是整个社区已经炸了。

同一天，DeepSeek V4 Pro正式版发布，作为Deepseek最新一代旗舰模型，对标Fable 5和GPT-5.6 Sol 的国产之光，我们昨天早上在Codex里测V4-Pro的时候，结论是模型不差，但不适合当Codex的主力模型。

当时就有人说，等自家 harness 出来再看。

现在，DeepSeek Harness 正式发布， _我连夜装上跑了一晚。_

结论先放这儿：**产品外壳还很早期，但架构野心是我今年见过最大的。**

顺便，还有个坏消息，放在最后说。

(PS：本文后面对DeepSeek Harness统一简称为dsh）

## ◈一、先说怎么用上DeepSeek 家的Harness

DeepSeek Harness是什么？

它是DeepSeek搞的Agent，和Claude Code、和Codex类似。

它不是一个模型。DeepSeek 内部的公式定义是：

Model + Harness = Agent

模型是大脑，负责推理；Harness 是负责把大脑接到真实世界（文件、终端、浏览器）的那套外围系统。

所以，dsh你可以理解为是一个Agent产品， 但更准确地定义是，它是一个智能体框架。

我知道很多人和我一样，看到这个消息第一眼先关心DeepSeek 家的Harness 长成什么样儿，和Claude Code、和Codex有啥不一样。

先看看怎么用上DeepSeek 家的Harness。

两个方法：

第一个适用于所有人，包括小白用户。

在终端里输入安装指令：
    
    
    npx @deepseek-ai/dsh web

在浏览器打开下面这个网址：
    
    
    <http://127.0.0.1:3080>

会立马弹出来一个页面，让你输入Deepseek 的API Key。

不同于其他Agent产品，打开就能看到产品页面，发起提问。dsh要求你必须先输入模型的API key才能用。

输入Key，就进入主界面，长这个样，一句话slogan「探索未至之境」，右上角挂着「预览版」的标。

第二个方法是下载源码安装。非开发者不需要考虑这个。

## ◈二、四个工作模式

进入产品首页，先选工作区，就是工作目录，再选模式。

官方预装了四套模式：

  1. **标准模式**



功能全开的编码 Agent，文件编辑、Shell、检索、Skills、计划、目标、子代理、工作流。

这就是对标 Claude Code / Codex 的那一档。你可以把它理解成默认产品形态，** _绝大多数人只会用这个。_**

  2. **PTC 模式**



PTC = Programmatic Tool Calling，程序化工具调用。这是四个里唯一需要解释的。

PTC把工具包装成代码 API，模型直接写一段 TypeScript 程序，一次性把十几步操作串起来跑完，只把最终结果返回。中间数据留在执行环境里，不进模型上下文，目的是省token。

PTC是给把 Agent 当批处理工具、在意 token 成本的重度用户和做自动化的开发者准备的。** _大部分人用不上，用标准模式就够了。_**

  3. **极简模式**



只给两个工具：持久 bash + str_replace_editor。

只要有一个能持续跑命令的终端和一个能改文件的编辑器，就能完成绝大部分编码任务，不需要那一堆脚手架。

这份自信来自于“我对我的模型有信心”，一个足够强的模型，只要bash和文件处理能力就够干大部分活了。

** _想比较模型本体的编码能力而不被 harness 干扰，就跑这个。_**

  4. **创造模式**



用来创建自定义 Agent preset，具备标准模式全部能力，另外提供运行时检查、插件实验和 preset 创作指导。** _“做模式的模式”，是给插件开发者用的。_**

每种加载一套不同的默认插件集，对应不同使用场景。理解这一点很重要——切换模式不是切换模型能力，是切换「这个 agent 手上有哪些工具、按什么规则跑」。

## ◈三、核心理念：一切皆插件

OK，上面dsh的样子已经给大家看完了。看上去产品上没什么特别的，还是左边是历史session，中间对话框，选择工作目录，外加选个工作模式。

甚至4个工作模式的描述文案，都有点冗余，保留v0.1版本的原始样子。

再甚至说，连启动方式都如此demo，和你平时vibe coding一个服务运行跑起来的方式一模一样。

**这篇文章我开头就抛出来一个结论：dsh的产品外壳还很早期，但架构野心是我今年见过最大的。**

因为我觉得 DeepSeek Harness 这次最有意思的地方，确实不是“DeepSeek 也做了一个 Claude Code”，而是它对 **Agent 到底应该是什么东西** ，给了一个很不一样的答案：

**Agent 不应该是一个做好的产品，而应该是一堆可以自由拼装、替换的组件。**

所以，官方一直强调 Everything is a Plugin（一切皆插件）。

一切皆插件，换句话说，就是可以随意插拔、替换和定制。

先看个例子，我们顺手给原本的页面换了个皮肤。

上面这六套皮肤，都是我们自己做的皮肤，直接接入真实 dsh Web profile 的表现层插件——会话、模型、工具、沙箱这些原生能力一个不动，复制一条命令就能安装、切换，也能一键恢复官方界面。

PS : 我觉得还挺好看的，于是顺手做了一个开源皮肤合集：**夕小瑶 × DeepSeek Harness 皮肤工坊** 。

目前首发六套皮肤，同时把创作者模板、投稿通道、三平台测试和素材授权规范都一起放进了仓库。大家想直接用，或者自己做一套来投稿，可以看这里：

> <https://github.com/147228/dsh-xiaoyao-skins>

下面开始实测！

## ◈四、Case实测

这是我最直观的震撼。

我给了它一个写网文的任务：

> 写一篇10万字的小说。宗门废柴弟子在杂役房扫地十年，扫出了一座上古大能的道场。今天掌门跪在门口求他出关，他说：再扫十年。

我用的是创造模式。

它没有直接开写，而是先篡改了我的提示词。。

一句话，被补成了一个完整项目：

> 先设计世界观、人物关系和章节大纲，再拆成40章，每章约2500字；正文完成后统一合并，检查字数、人物一致性和AI味。

然后，它直接启动了**40个子Agent** 。

一个子Agent，负责一章。

全部并发跑。

标题栏那里就挂着「40 个子代理」的按钮，点开是完整列表：写第 1 章 杂役房 243K tok、写第 2 章 十年 337K tok、写第 3 章 那些人 183K tok……

每个都标着自己的 token 消耗和运行时长。

还能继续点进去看详情。

里面会显示当前计划、执行步骤和上下文使用情况。

主会话底部也有一条实时状态栏，实时显示当前系统的运行状态。这个信息密度，比 Codex 的前端显示充实太多了。

昨天在 Codex里测V4 Pro，我最难受的一点，就是它不说话。

跑十几分钟命令，你不知道它在调查、卡住，还是已经顺着错误方向冲出去了。

到了 DSH，V4 Pro还是不爱说话。

但 Harness 把它正在干什么，直接摊在了界面上。

开了多少子Agent、每个Agent在做什么、上下文吃了多少、工具跑了多久、缓存命中了多少，全都能看见。

它没有牺牲模型的上下文窗口去做摘要，让模型变得更爱汇报，而是直接在前端让整个工作过程变得可观察。

小说完成后，我把全文从头读了一遍，**大主线是连贯的，核心人物也立得住。**

40个子Agent各写一章，最后居然没有把整本书写成40篇互不相干的文章。

这一点，比我预期强很多。

至少说明，DSH 在管理大纲、核心设定和主线目标时，记忆控制是有效的。

但读到二三十章以后，还是有不少细节的偏差，同一项规则，十几章前还是一种限制，二十几章后又换了一个版本。有一些拼接感。

所以，这次40子Agent写小说，这个 haness 给我的感觉是：**它的全局记忆很强，但局部细节的连续性把控还不够。** 至少长文本写作是这样的。

当然，写作只是热身。

真正让我确认「这不是同一个模型」的，是接下来两道题。

### ◽换个Harness，V4 Pro真不一样

昨天在 Codex 里，我给 V4 Pro 的前端评价很低。

渲染效果肉眼可见地糙，甚至还不如同门的 V4 Flash。

今天，我把同一个多人 FPS 任务重新丢进 DSH。

效果明显好了。

我自己进去打了一会儿，还真把BOSS干掉了，谈不上商业游戏。

但完成度明显比昨天在 Codex 里高一截。

不过，目前产品外壳的问题也不少。

我让它做股票策略回测，任务本身正常完成，也生成了报告和图表。

可以看到，虽然用到了绘图库，但整体的审美效果是不错的。

但我也从中发现了 harness 本身的一个bug，页面上明明显示「点击查看」，点进去以后，图就是打不开，属于是 harness 前端界面的一个细节问题。

再之，harness的工作链几乎全是英文。

Think、Read、Bash、Tool Call 一路刷下来，中文用户看久了还是有点累。

所以这一节的结论我得说明确一点。

昨天我判 V4 Pro「前端能力低于预期」，这个结论需要修正。它的本事可能一直都在，只是 Codex 那套工作流没把它接出来。

## ◈五、几个关键设计

同样一个V4 Pro，DSH 为啥比 codex 的效果好这么多呢？

我翻了一晚上官方的架构文档，答案基本都在下面这四个设计里。

### ◽一切皆插件

这里说的“插件”，不是我们平时理解的给 Agent 多装一个浏览器、GitHub、天气工具。

DeepSeek Harness 里的模型适配器、工具注册表、会话日志，甚至 agent loop 本身——都是插件，因此都能通过配置替换。

我们可以先把一个 Agent 拆开来看。

今天一个 Codex / Claude Code，本质上大概都是：

**模型** → System Prompt → Agent Loop → 调工具 → Shell / 文件系统 → Sandbox / 权限 → Session / Memory → Subagent → UI

Agent 真正厉害的地方，其实已经不只是“模型聪明”，而是外面这整套 Harness 怎么组织。

OpenAI 自己现在也明确把 Codex 的核心称为 **agent loop / harness** ：它负责把用户输入、模型推理、工具调用、执行结果不断循环起来，直到任务完成。

Codex 的思路是：**我给你一个已经调好的 Codex Agent，然后允许你往外扩。**

你可以加 MCP，可以加 Skills，可以换一些配置；但 Codex 的核心 Agent Loop、Session 怎么跑、什么时候调用模型、内部怎么管理上下文，主要还是 **Codex 这个产品定义好的，也是「core logic」是死的，是不能动的。**

Claude Code 相对开放一些，有 Skills、Hooks、Subagents、MCP，还有 **Plugin。**

Claude Code 官方定义的 Plugin是一个扩展打包层——把 Skills、Agents、Hooks、MCP Server、LSP 等东西打成一个可安装包。

所以 Claude Code 的 Plugin 是：

**给 Claude Code 装插件。**

DeepSeek Harness 的 Plugin 是：

**DeepSeek Harness 自己就是插件拼出来的。**

举个特别极端的例子。

你觉得 DeepSeek Harness 的 Agent Loop 不好？

**换掉。**

你不想用它默认的模型接口？

**换 model adapter。**

dsh 里连“模型适配器”都是一个插件，可以从配置里替换掉。也就是说 **dsh 在设计上并不绑定 DeepSeek 的模型** 。

你不想让 Agent 在本机 Bash 里干活，想全部丢进远程 Sandbox？

**换 filesystem / subprocess / sandbox provider。**

你觉得默认的 Session 机制不好，想自己做持久化、fork、resume？

**换对应组件。**

甚至你想在模型每次真正执行 Tool 之前插进去一层审查逻辑，也不用去魔改 Agent Loop，因为它把 `agent/pre-step`、`agent/request`、`tools/pre-execute`、`tools/execute`、`tools/post-execute`、`agent/turn-stopping` 这些生命周期节点都暴露成了 extension point。

所以dsh不是：

**Agent + 插件**

是：

**Agent = 插件 A + 插件 B + 插件 C + 插件 D + ……**

###  ◽工具归一化

这个我觉得是最实用的设计。

普通 Agent 干活是这样的：想调工具，停下来，告诉你要调什么。每调一次工具，就是一次完整的模型往返。

查十个文件，就是十个来回，每一趟的原始数据还都得往上下文里塞。

DSH 的思路很特别，**它只给模型一个工具，叫 run_code。**

**然后把所有可用工具自动打包成一套 TypeScript SDK，直接塞给模型。**

模型可以一口气写出一段程序，拿到结果本地汇总，只把结论返回来。

**中间那一大堆原始数据，压根不进上下文。**

往返少了，上下文也干净了。

而且这些调用不是脱缰野马，照样走权限、审计、超时那一整套流水线。

### ◽事件可溯源

DSH 把会话做成了一条追加式的事件日志。

模型的输出、你按下的取消、子 Agent 的生生死死，等等每一轮、每一步、全都记下来，而且能重放。

这样一来，就算上述的**Code Mode模式返回的内容崩了，整个系统依旧能通过这个事件日志恢复状态。**

会话能恢复，跨会话还能互相引用。

说到这个我得插一句。

昨天在测试 Codex +V4 Pro 的时候，我最不爽的一点就是它太爱翻别的 session 了，甚至直接把旧结论抄过来交差。

现在看，那个「极度渴望上下文」的毛病，在 DSH 这套架构里其实是被官方鼓励的——跨会话引用本来就是内置能力。

模型的性格，和 harness 的设计，是配套的。

### ◽Agent 统帅

这是整个 DSH 里我认为最值得说的东西。

它内置了真实的 Codex 子 Agent 后端，和 Claude Code 子 Agent 后端。

注意，不是「兼容它们的配置格式」这种表面功夫。

是真的能拉起你本机上装着的官方 Codex 和 Claude Code，把一个独立任务甩过去，等它干完，只取最终答案回来。

你品品这个定位，DeepSeek 想做的是一个 Agent 调度操作系统。

你手里已经有的那些工具，在它眼里都是可以被调用的执行单元。

## ◈六、坏消息，V4 涨价了

8月17日 00:00 起，V4 API 执行新定价，而且分高峰和空闲时段。

高峰时段是北京时间 9:00–12:00、14:00–18:00，其余算空闲。

涨幅是这样的——缓存命中的输入涨了 150% 到 1100%，未命中输入涨 50% 到 200%，输出涨 125% 到 350%。

「便宜到敢让它随便试错」这个心态，8 月 17 号之后得重新算一遍账。

## ◈七、DeepSeek 会不会想把 Harness 做成 Agent 世界里的一个Linux

再回来一切都是插件的核心理念上来，官方架构说明文档是这么说的：

> 一个正在运行的 `dsh`，其实就是一棵 **plugin tree** 。

> <https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.zh.md>

最基础的一层 `dsh-base` 里装的是模型适配器、Tools、Persistence、Sandbox、Approval Policy、Settings、Credentials、Telemetry；如果你想要 Web，再叠 `dsh-web-app`；如果只想跑一次任务，则可以叠 `dsh-headless`。

所以你可以把它想成：

**Codex / Claude Code 更像一台 Mac。**

机器已经做好了，你可以装很多软件、插件、MCP、Skills，甚至做很深的自动化。

而 DeepSeek Harness 想做的东西更像：

**一台可以自己换主板、显卡、操作系统、硬盘、外壳的 PC。**

以前大家做 Agent 插件，想的是：

“我还能给 Claude Code 增加什么能力？”比如 Jira、Figma、浏览器、数据库。

如果 DeepSeek 这套东西真的长起来，社区写的“插件”会开始变成：

我能不能把 Agent 的某个器官直接换掉？

比如有人可能会做：

  * 一个超强的 context compression / memory 插件；

  * 一个专门针对代码 Agent 的 Loop；

  * 一个 Browser Agent Loop；

  * 一个更激进的 Subagent 调度器；

  * 一个企业级审批与 Sandbox；




官方现在已经把这些接口留出来了，开放的程度不是 MCP 的级别了。

MCP解决：Agent 能调用什么。

Skills解决：Agent 知道怎么做什么。

Hooks解决：Agent 运行到某一步时，我插一脚。

“一切皆插件”想解决：Agent 本身应该怎么组成。

如果有人问我：

**DeepSeek Harness 与 Codex、Claude Code 最本质的不一样是什么** 。

我会说：

**Codex 和 Claude Code 首先是 Agent 产品，然后提供扩展能力；DeepSeek Harness 首先想成为一个 Agent 运行时/组装框架，然后由插件组成具体的 Agent。**

所以，我反而会观察一件事情：

**DeepSeek 会不会想把 Harness 做成 Agent 世界里的一个Linux？**

不用自己把每一种 Agent 都做完，把 Agent 的模型、Loop、Tools、Memory、Sandbox、UI 全部拆成组件，让社区自己组合出 Coding Agent、Research Agent、Browser Agent、企业 Agent，甚至各种奇奇怪怪的 Agent。 目前它还只是 developer preview，连她自己都说“未来会有breaking changes”。

但真正值得看的，不是今天这个版本已经做完了多少，是它开启了Agent 生态的下一层，往后长出来的，可能是一整片森林。

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=903e7f92&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzIwNzc2NTk0NQ%3D%3D%26mid%3D2247619604%26idx%3D1%26sn%3D9b2cad7baf1482f39db84a5c956eb749>)
