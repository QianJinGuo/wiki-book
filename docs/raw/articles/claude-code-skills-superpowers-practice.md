---
title: claude-code-skills-superpowers-practice
source_url: https://mp.weixin.qq.com/s/Bkr-tw68m0y5zKXGAPIkMA
publish_date: 2026-05-02
tags: [wechat, article, claude, agent, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: afcb3fbe344cb4122062403b90f951a6ac4feb8519a204e2fb10ab30ee26a8f9
---
Claude Code的Skills实践及利器推荐：工欲善其事，必先利其器
原创 二师兄 师兄奇谈
2026年5月2日 07:01 北京
Claude Code系列回顾
目前在实践和应用Claude Code，顺便分享一些在实践过程中的经验，没想竟然写成一个系列了。如果你也对Claude Code感兴趣，可以先回顾一下之前的文章，然后开始今天的文章。
第1篇：《国内环境下的Claude Code安装与使用教程》
第2篇：《使用Claude Code最需要做的一件事：与AI签订一份契约（CLAUDE.md）》
第3篇：《Claude Code实践：从零开始，一行代码不写生成一个项目》
前言
在上篇文章《Claude Code实践：从零开始，一行代码不写生成一个项目》中完成了一个基础的项目框架的搭建，自始至终都在使用Claude Code的功能，没有动手写一行代码。
我们可以看到，通过与Claude Code的沟通已经可以实现基本的编程，效果也还不错，但不能止步于此，因为还有更好用的效率工具：Skills。
其实，在上篇文章中已经在使用Skills了，比如我们用到了"brainstorming"进行需求的"采访"以及生成执行规划。
这篇文章我们更加系统和全面的来讲解一下Claude Code中的Skills，让后面的开发更加效率和规范化。
什么是Skills？
我们知道Claude Code是Anthropic公司推出的AI编程助手，与此同时Agent Skills的概念和标准也同样是Anthropic公司提出的，顺便说一下，MCP协议也是这家公司。
当我们在说Skills时，往往说的就是Agent Skills。Agent Skills是一种标准化的程序性知识封装格式，它将指令、脚本和资源组织在特定文件中，AI Agent可以动态的发现并加载这里Skills，从而让AI在执行特定任务的时候表现的更加出色。
从技术实现来说，Skills就是一个文件夹，在其中必须包含一个SKILL.md文件，当然，还可以包含脚本（如Python或Bash脚本等）、参考文档（比如API调用文档等）和模板（比如输出格式类等）等可选资源。
Agent Skills目录结构
Agent Skills的目录结构示例大概是这样的：
pdf-skill/
├── SKILL.md            # Skill 元数据和核心指令（必需）
├── forms.md            # 表单填写指南（可选）
├── reference.md        # 详细 API 参考（可选）
└── scripts/            # 实用脚本
    └── extract_fields.py
当AI在执行任务时，它会根据具体的任务需要，审视所有可用的Skills，自动挑选适合执行任务的Skills，并加载相应的脚本或资源，按照SKILL.md中定义的任务步骤或方式方法来执行任务。这样最大的好处就是AI可以更加稳定地输出更符合预期的结果。
当然，Agent Skills的具体实现过程中，它采用了渐进式披露以及特定的目录、文件结构来保证更好的灵活性和可扩展性，关于这些具体实现，如果大家感兴趣后续可以单独写一篇文章，或者参考官方文档，这里就不再展开。
其实，在上面提到的比较重要的一个词就是"任务"，Skills的作用往往是把日常使用中那些重复的、或具有特定约束、或具有特定流程的操作通过Agent Skills封装成一个任务，当AI发现需要执行这个任务时，就按照SKILL.md中的定义来执行。
如果只是一次性操作或个性化操作，反而没必要写成Skills，因为这会导致AI在每次执行时都需要支付额外的token来加载和判断是否执行它。
Claude Code插件安装
在Claude Code中，Skills的作用是扩展了Claude Code能够做的事情，通过预置一些Skills，让Claude Code在执行某些任务中拥有特定的能力。
在实践过程中，一般情况下可以采用两种方式来实现基于Skills的能力扩展：自定义Skills和安装线程的Skills。
关于自定义Skills这里不再展开，基本上就是按照Skills的约束规范，生成一系列的任务描述和脚本资源等，然后将它们存放在~/.claude/skills/目录下，完整路径比如：~/.claude/skills/my-skill-name/SKILL.md。自定义的前提就是要学习和了解Skills的规范以及自己的任务流程和约束。
目前对于我们来说，大多数开发过程中所需要的共性Skills在Claude Code官方和一些marketplace（插件市场）的插件中已经提供了，我们直接拿来用即可。这篇文章我们中的讲一下如何拿来用。
在Claude Code中也有一个marketplace的概念，它是一个集中式的目录和平台，旨在帮助用户发现、安装和分发用于扩展Claude Code功能的插件。它支持skills、agents、hooks和MCP服务器，实现了插件的自动更新、版本追踪和高效分发，省去了手动配置的繁琐过程。
下面我们来具体看一下日常使用中经常用到的几个操作。
查看插件
通过/plugin命令（管理Claude Code插件的命令）可以用来查看在本机中Claude Code安装的插件：
/plugin命令
因为此时没有添加插件市场，所以Claude Code未发现任何可用插件，Claude Code也会提示先添加一个插件市场。
添加插件市场
插件市场的添加可以使用/plugin marketplace add命令实现。通常可以先将官方的插件市场添加上。
添加官方插件市场命令（通常下载Claude Code后会自带官方的插件市场）：
/plugin marketplace add anthropics/claude-code
添加过程：
安装过程
执行完添加命令之后，记得再执行一下/reload-plugins命令，刷新一下当前session，获得最新的插件市场以及插件发现信息。
添加完成之后，便可在Marketpalces中查看到对应的Marketplace，当然，还可以继续添加更多的插件市场。
比如，这是添加superpowers的插件市场的示例：
/plugin marketplace add obra/superpowers-marketplace
这里安装了两个插件市场：
查看插件市场
当添加完插件市场，在插件的Discover栏目中便可以看到市场中的一些插件。
移除插件市场
如果不需要对应的插件市场，也可以通过/plugin命令来remove对应的插件市场。
移除官方插件市场命令示例：
/plugin marketplace remove claude-plugins-official
插件安装
插件市场安装完毕之后，是可以看到一些推荐插件的。
插件发现
这里以superpowers插件为例，进行安装。
安装命令为：
/plugin install superpowers@superpowers-marketplace
安装完毕后，执行/reload-plugins，即可看到新安装的superpowers插件的Skills。
查看插件
后续在使用的过程中，Claude Code会根据具体的场景和提示词语意来执行对应的插件（Skills）。
推荐一款插件：Superpowers
上面了解了Claude Code对插件的支持以及安装操作，这里强烈推荐一款开源的Skills仓库：Superpowers，Github地址为：https://github.com/obra/superpowers。我们可以基于插件的形式来安装和使用它。
Superpowers
目前这个项目非常火爆，已经175k的Stars了。
Superpowers简介
这个Superpowers项目就是面向Agent编程而设计的，它提供了一些列可组合的Skills，并配合一些初始指令，可以让智能编程工具（类似Claude Code、Codex等）更好的使用这些技能。
在未使用Skills或使用普通的Skills时，当你下达一个指令，AI便直接开始干活了。而Superpowers在编程过程中带来的最大改变是当它意识到你在构建一个功能或系统时，它不会立马执行，而是先退一步，问清楚你真正想要的是什么。
这一表现在《Claude Code实践：从零开始，一行代码不写生成一个项目》中，当我说要创建一个Spring Boot + Mybatis Plus + Thymeleaf项目时，便是触发了Superpowers的功能，它便是一步一步的询问，最终梳理出一份规格说明，然后将内容拆分成足够短的小块展示出来。
当确认设计之后，Agent会整理出一份执行计划，当任务被拆分成一步一步的计划之后，执行难度会变得非常低，同时执行的成功率（正确性）也会大幅提高。
其实，Superpowers解决的最大问题就是：当你说我要创建一个项目时，如果不描述清楚需求，执行结果的偏差会非常大，而Superpowers提供了拆解与"采访"你的功能，先与你沟通清楚需求，再执行。
Superpowers提供的基础功能
Superpowers提供了以下基础的工作流：
brainstorming（头脑风暴）：在编写代码之前启动。通过提问来完善初步想法，探索不同方案，并分段展示设计内容以供确认。最后保存设计文档。这个有点苏格拉底式询问。
using-git-worktrees（使用 Git worktree）：在设计获批后启动。在新分支上创建隔离的工作区，运行项目初始化流程，并验证测试基线是干净的。
writing-plans（编写计划）：在设计获批后启动。将工作拆分为易于处理的小任务（每个任务耗时 2–5 分钟）。每个任务都包含精确的文件路径、完整代码以及验证步骤。
subagent-driven-development（子智能体驱动开发） 或 executing-plans（执行计划）：在计划制定完成后启动。为每个任务分派一个全新的子智能体，并进行两阶段审查（先检查是否符合规格，再检查代码质量）；或者按批次执行，并在关键节点由人工确认。
test-driven-development（测试驱动开发）：在实现过程中启动。强制执行 RED-GREEN-REFACTOR 流程：先写一个失败的测试，确认它确实失败；再编写最少量的代码，确认测试通过；然后提交。任何在测试之前写出的代码都要删除。
requesting-code-review（请求代码评审）：在任务之间启动。根据计划进行审查，并按严重程度报告问题。严重问题会阻止继续推进。
finishing-a-development-branch（完成开发分支）：在任务完成时启动。验证测试结果，给出选项（合并 / 提 PR / 保留 / 丢弃），并清理 worktree。
需要注意的是强制工作流，在Agent在执行任何任务之前，都会先检查是否有相关技能可用。上述工作流中还包含了一些内置的Skills，这里不再展开，官方文档也有相应的说明。
Superpowers安装
在上面我们已经演示了Superpowers的安装步骤，这里基于Claude Code的安装，统一整理一下。
先注册插件市场：
/plugin marketplace add obra/superpowers-marketplace
注册成功后可以通过/plugins命令查看到：
Marketplaces
然后执行插件安装命令：
/plugin install superpowers@superpowers-marketplace
执行完成，可以看到安装完成的插件：
Installed Plugin
后续便可以在开发过程中使用该插件提供的Skills了。
Skills实践案例
关于Claude Code对安装的Plugin（Skills）的使用其实在《Claude Code实践：从零开始，一行代码不写生成一个项目》中已经完全提现出来了。这里我们就在原来的项目上再添加一个注册登录的功能来简单验证一下。
我们先与Claude Code沟通，触发Claude Code使用Skills，提示词为：
我想在现有的项目中新增一个登录功能，请采访我并完善这个登录功能
Claude Code的执行如下：
触发Skills的执行
可以看到，上面的提示词触发了superpowers:brainstorming这一Skills，这正式superpowers中的第一个工作流。随后，它便展开了苏格拉底式诘问法的第一问。
随后它又问了7个问题，咱们来看一下这些问题是否专业（仅展示提问，选项隐藏）：
问题 1：您希望登录功能支持哪些认证方式？
问题 2：关于密码安全，您希望使用哪种加密方式？（当前项目使用的是简单的 MD5，安全性较低）
问题 3：关于登录后的 Token 管理，您需要哪些功能？
问题 4：关于验证码，登录时是否需要图形验证码？
问题 5：关于权限控制，您需要哪些功能？
问题 6：关于登录接口的请求/响应格式，您倾向于？
问题 7：关于会话超时，您希望 Token 有效期是多久？
问题 8：除了登录功能，您还需要以下哪些配套功能？（可多选）
这些问题是不是很专业，都问到点子上了？而且大多数方案只用做选择即可，随后它就给整理出了基础的需求项：
需求总结
随后推荐了两个改造方案，这里选择方案一"简单改造"。
呈现改造细节：
设计细节
这只是第一步设计细节，它会相信询问数据库、API接口、核心实现等，这里就不再展示了。
编写设计文档：
编写设计文档
完成文档编写之后，会让审阅和核实，随后指定详细的实现计划：
实现计划
这里我们可以看到，它使用了"superpowers:writing-plans"这一Skills来执行实现计划。同时提供了两种执行方式：
子代理驱动（推荐） - 我为每个任务分配独立的子代理，逐任务执行并在任务间进行审查，快速迭代
内联执行 - 在此会话中使用 executing-plans 技能批量执行，带有审查检查点
我们选择推荐的子代理驱动。
分步执行
这里又实用了superpowers:subagent-driven-development来进行分步执行。后续的执行和结果验证与《Claude Code实践：从零开始，一行代码不写生成一个项目》中的基本一致，就不再逐一贴图展示了。
通过上面的流程我们可以看到，利用现成的插件（这里重点是Superpowers）几乎不用太多的思考和描述，只是跟着插件定义的Skills来做选择即可。
开发是不是变得极其简单了？所以，再次推荐一下Superpowers。
小结
最后，我们来做一个简单的总结。这篇文章带大家简单了解了Agent Skills的基础概念及作用，对于Claude Code可以通过插件的形式来安装和使用现成的Skills。
然后介绍了一款非常好用的AI编程库——Superpowers，它定义了AI编程过程中几乎必备的步骤以及最佳实践，让我们可以在一步步的选择中快速完善和制定需求，生成执行计划，以及基于子代理驱动的模式进行执行。
关于Superpowers的使用我们着重介绍了它的基础功能，必备的工作流，以及如何安装和实践案例。虽然省略了一些步骤，但大家可以按照初始提示词尝试一下，后续步骤基本都是一致的（统一的工作流）。
好了，这篇文章先介绍这么多，后面我们再继续基于具体的实践来介绍Claude Code的一些最佳实践，关注，别错过最新的更新。
全文完，感谢阅读，如果喜欢请三连。
近期精选文章：
Claude Code实践：从零开始，一行代码不写生成一个项目
使用Claude Code最需要做的一件事：与AI签订一份契约（CLAUDE.md）
国内环境下的Claude Code安装与使用教程
专业人士是如何看待OpenClaw（龙虾）的？
OpenClaw真的那么神吗？技术架构解密
▲ "师兄奇谈"：职场&生活&自我提升
个人书籍：《Spring Boot技术内幕》&&《Drools 8规则引擎》
微信号：541075754