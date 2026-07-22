---
title: "Codex 上线关键特性 Record & Replay：把操作录成 Skill"
source_url: "https://mp.weixin.qq.com/s/lGfeT6xWXOmbTeAa7N1pLQ"
author: "VibeCoder (Vibe编码)"
published: 2026-06-28
ingested: 2026-06-28
language: zh
type: raw
sha256: "df0eddf71938cb3b0f6ecda1122db8318852064a15ed08fb185c7df813ca65a9"
---

# Codex 上线关键特性 Record & Replay：把操作录成 Skill

OpenAI 把 Codex 的 Record & Replay 放进了官方文档：在 Mac 上给 Codex 演示一次 workflow，然后把它变成可复用 Skill。

乍看像屏幕录制，实际更接近 workflow capture。它让很难写成提示词的操作流程，先通过演示沉淀，再变成 Codex 能反复使用的工作说明。

## 它是什么

官方说得很清楚：Record & Replay 当前可用于 macOS，初始可用范围不包含欧洲经济区、英国和瑞士，而且 Computer Use 必须可用并启用。

使用方式很直白。打开 Codex app 的 Plugins，从加号菜单里选择 Record a skill。Codex 会先给出建议 prompt，你补充目标、输入、成功标准。等它请求录制权限后，在 Mac 上把流程走一遍，结束时停止录制。

录制期间，Codex 会观察完成这段流程所需的动作和窗口内容。停止后，它会检查捕获到的 workflow，并起草一个 Skill。Skill 会写清楚什么时候用、需要哪些输入、执行步骤是什么、怎么验证结果。

这和保存一段视频不一样，Skill 能让 Codex 在下次任务里读取并执行。

## 技术链路

我把它拆成三段：录制、转译、回放。

录制阶段靠的是 Computer Use。官方 Computer Use 文档里写到，macOS 上需要 Screen Recording 和 Accessibility 权限。前者让 Codex 看见目标 app，后者让它点击、输入、导航。Record & Replay 依赖 Computer Use，所以它天然接入的是桌面 GUI 这层能力。

转译阶段更有意思。官方没有公开底层事件 schema，也没有说它保存的是坐标、控件树、OCR 结果还是更复杂的轨迹。能确认的是，停止录制后产物是 Skill 草稿。Codex 会把录制整理成一份 agent 可读的流程说明，不是直接交给一个宏播放器。

这中间会发生一次抽象：一次具体操作会被拆成稳定步骤、可变输入、隐藏偏好和验收方式。比如创建 issue，Skill 里更该沉淀的是标题格式、默认 label、描述模板、创建后的检查方式，而不是第几个按钮被点到。

回放阶段，用户在新线程里要求 Codex 使用这个 Skill，并提供这次不同的输入。Codex 读取 Skill 后，再调用当前环境能用的工具完成任务。官方提到的工具包括 Computer Use、browser actions、已安装插件，或者这些能力的组合。

更准确的说法是：record once，compile to Skill，then execute with tools。

## 它到底改变什么

过去要写一个好 Skill，门槛其实不低。你得知道触发条件怎么写，输入项怎么拆，步骤怎么表达，失败时怎么处理，结果怎么验证。

很多真实流程的问题就在这里：人会做，但写不出来。每周下载报表、按自己的命名习惯发布素材、给内部系统创建记录，这些流程让用户从零写成 Skill 不太现实。先演示，再让 Codex 生成草稿，会顺很多。

它和 AGENTS.md、MCP、Plugin 的关系也要分清。AGENTS.md 放项目长期规则，Skill 放可复用流程，Plugin 负责团队分发，MCP 和 connector 负责结构化接外部系统。

Record & Replay 的位置，是帮你生产 Skill。它把那些还没结构化、但已经稳定重复的 GUI 流程先抓下来。跑几次、修订几次，确认有复用价值，再工程化。

## 怎么录才有用

官方 tips 里有几个很实在的建议：录制要短、完整、聚焦；录制前告诉 Codex 目标和会变化的输入；用真实输入，但避免秘密和敏感数据；录完后继续 refine Skill，把命名习惯、默认字段、决策点补进去。

我会把它翻译成更工程化的操作方式：流程会重复、步骤稳定、失败能看出来，输入也能参数化，比如日期范围、文件路径、issue 标题、导出格式。这些东西要提前告诉 Codex。

录完以后不要急着用。先读 Skill，看触发条件、输入项、验证方式有没有写清楚。第一次回放最好用低风险测试输入，别一上来就提交正式表单、发正式内容、改生产配置。

## 效果和边界

这个能力最直接的效果，是省掉大量长提示词。以前你要写一大段步骤，现在可以把这段变成 Skill，下次只给变量。Skill 还能继续修，慢慢接近团队 SOP。

第二个效果，是少丢细节。字段默认值、标签、等待时机、结果截图，这些碎细节通过一次演示加后续修订，比纯提示词更容易沉淀。

第三个效果，是跨工具。官方回放说明里提到，Codex 可以用 Computer Use、browser actions、installed plugins 或组合方式完成任务。GUI 只是入口，后续能走结构化工具时，还是应该走结构化工具。

边界也很明显。UI 经常变，回放稳定性会下降。流程里有密钥、支付、隐私数据，也不适合录。结果没法验证，Codex 就很难判断自己做对没有。明明有 API 或 MCP，却为了省事去录 UI，短期看快，长期看维护成本高。

企业环境还要关注管理配置。官方文档写到，如果 [features].computer_use 设成 false，会禁用 Computer Use、Record & Replay 以及相关安装和设置流程。这个能力继承 Computer Use 的权限和安全边界。

## 总结

Record & Replay 的价值，不在于让 Codex 更会点按钮。真正值得关注的是，它把 Skill 创作门槛降下来了。

过去自动化常常卡在第一步：流程在人的手里，但没人把它写成可维护资产。Record & Replay 给了一条更自然的路：先演示，再生成 Skill，再修订，再回放。稳定后，再进入 Plugin、MCP、团队分发。

我会把它用在低风险高频流程上，比如报表下载、内容发布前置检查、内部系统记录创建。凡是涉及账号安全、资金、隐私、生产配置的流程，我会保持人工确认。

这也是我对它的判断：Record & Replay 是 Codex Skills 生态里的 Skill 生成器。它不会替你消灭所有不稳定 GUI，但能把原本散落在个人手里的操作经验，变成 Codex 可以复用、团队可以维护的流程资产。
