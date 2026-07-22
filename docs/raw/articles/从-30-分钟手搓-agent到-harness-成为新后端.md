---
source: wechat
source_url: https://mp.weixin.qq.com/s/6bKuYLV1E5LGqUEKV0tbtA
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
ingested: 2026-05-19
feed_name: 架构师
wechat_mp_fakeid: MP_WXS_3006407565
source_published: 2026-05-02
sha256: cb03c442f57ec889d8f065709ea7e782b50c64bb25213fe90dc05f8983bf8e8e
---
---
# 从 30 分钟手搓 Agent，到 Harness 成为"新后端"
架构师（JiaGouX）  我们都是架构师！
架构未来，你来不来？
* * *
前段时间我们整理过一个demo：《 [ 30分钟手搓 Agent：LLM + Tools + Loop + Memory 跑通最小闭环 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409091&idx=1&sn=3c40343aefdf11fdb208588a44033e14&scene=21#wechat_redirect>) 》，我把 Agent 简化成一个很小的循环：
模型看任务，选择工具，程序执行工具，把结果写回上下文，再进入下一轮。
几十行代码就能跑起来。Demo 通了以后，确实挺有成就感。
但写完以后，我一直觉得还有一块没讲透：
** 这个 loop 真的进了业务系统，外面那层后端应该怎么配合它？  **
工具从哪里来？
浏览器、沙箱、Python 服务、Rust 服务、队列、状态、HTTP 入口，怎么放在同一条调用链里？
Agent 临时需要一个新能力，能不能动态拉起一个 worker，用完再退出？
出了问题以后，能不能沿着同一条 trace 看清楚模型、工具、队列、状态和服务之间发生了什么？
这次我想顺着这个问题，再往后端方向推一层。
这条线其实是接着前面几个文章往下走。
前面我们聊过 Harness 的 6 个关键模块，也拆过 Claude Code 长任务 runtime、上下文工作集、Subagents。那些文章看的是同一件事的不同侧面：模型外面那层系统，正在变得越来越重要。
最小 loop 让 Agent 动起来。
Harness 让它能被约束、能恢复、能验证。
再往后看，就会遇到今天这个问题：
** Harness 里那些承重的东西，最后会不会沉到后端里？  **
带着这个问题读 Mike Piccolo 在 Heavybit 的文章，再看配套的开源运行时，线索会变得具体很多：browser、sandbox、不同语言 worker，可以通过同一套连接方式进入系统。顺着这条线看，问题会自然落到后端架构：能力如何出现、如何下线、如何被追踪。
可以先看看这个图。
iii配图
左边是很多 worker 之间互相连，右边是共享运行时和实时能力发现。
这张图把问题从连线数量，带到了能力如何被发现和管理。
它背后是一个更贴近日常工程的问题：
** Agent 后端只靠一份静态工具列表，会越来越吃力。它需要一套能反映当前系统状态的运行时能力目录。  **
* * *
##  先把我的理解放前面
* • 30 分钟手搓 Agent，看到的是 loop：模型、工具、观察、下一轮。
* • 后来聊 Harness，看到的是 loop 外面那层工程系统：上下文、工具、状态、权限、恢复和验证。
* • 再看长任务 runtime、上下文工作集和 Subagents，会发现很多边界已经不适合只放在对话窗口里。
* • 这篇继续往后一层：当 Agent 真要接业务系统，Harness 会开始承担后端职责。
* • 原文里讲的  ` Worker / Function / Trigger  ` ，我更愿意翻译成三个朴素的工程词：参与者、能力、入口。
* • 参与者可以是 Agent、浏览器、沙箱、队列、Python 服务、Rust 服务；能力是它能做什么；入口是它什么时候被调用。
* • 代码层面，我更想看 worker 连接、注册、重连、清理、trace 传播这些生命周期细节，API 名字反倒是次要的。
* • 如果把这套思路借到我们自己的系统里，我会先看四件事：能力目录、生命周期管理、触发入口、统一 trace。
* • 边界也要提前摆出来：中心 engine 可用性、能力目录治理、动态 worker 安全、上下文工程和不同 trigger 的失败语义，都不能靠一句“统一抽象”带过去。
* * *
##  30 分钟 loop 只看到一半
我们之前手搓 Agent 时，主循环大概是这样：
    async function runAgent(task: string) {  
      const messages = [{ role: "user", content: task }];  
      for (let step = 0; step < 8; step++) {  
        const response = await model.create({ messages, tools });  
        if (!response.toolCall) {  
          return response.text;  
        }  
        const observation = await runTool(response.toolCall);  
        messages.push({ role: "tool", content: observation });  
      }  
      return "Stopped: step limit reached.";  
    }
这段代码很小，但能帮我们看见 Agent 的骨架。
模型不会自己读文件、跑命令、搜网页。
模型只是在上下文里表达“我下一步想调用什么工具”。实际执行工具、校验参数、裁剪输出、记录日志、限制权限、处理失败的，是模型外面的运行系统。
当时的demo里，我故意把工具收得很窄，只留  ` list_files  ` 、  ` read_file  ` 、  ` run_command  ` 这一类动作。
这么收窄工具，是想让边界露出来：模型的能力要跟验证、回滚、权限一起长。否则工具越多，系统越像把一堆开关递给模型。
所以那篇文章最后落在一句话：
** 最小循环让 Agent 动起来，Harness 关系到它能不能长期稳定地干活。  **
但这个说法还有半句没展开。
我们后来聊 [ Harness 的 6 个模块 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408973&idx=1&sn=e147f34daa2d9e3ea431d985b08486e5&scene=21#wechat_redirect>) 、 [ Claude Code 的长任务 runtime ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408950&idx=1&sn=8c14e4b7726dd478644e0a8e1acfbad4&scene=21#wechat_redirect>) 、 [ 上下文工作集 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409162&idx=1&sn=62556a10e227bcb8d977a4f3e0006c8b&scene=21#wechat_redirect>) 和 [ Subagents ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409171&idx=1&sn=f1205a72f8219032770c1144307d1efa&scene=21#wechat_redirect>) ，其实都在补这半句。
Harness 如果只在 Agent 进程里做，很快会遇到后端问题。
比如一个 Coding Agent 先读仓库，再开浏览器查文档，再进沙箱跑测试，再调用一个 Python 分析服务，最后把结果写进状态存储。
这些动作如果各走各的 SDK、各写各的日志、各管各的重试，Agent loop 本身写得再漂亮，排查起来也会很费劲。
iii.dev 有一个很粗糙但好用的提醒：  ` agents^2 * services  ` 。
1 个 Agent 接 5 个后端系统，还只是 5 条路径。4 个 Agent 接 5 个后端系统，组合路径就会变成 80 条。
这个公式不必当数学定律看。
它更像是在提醒我们：过去后端的复杂性，大多来自确定的服务边界；Agent 进来以后，复杂性会多一层运行时组合。
** 问题会从“Agent 能不能调用工具”，走向“后端能不能让这些工具以一种可发现、可恢复、可追踪的方式参与进来”。  **
这也是我理解“新后端”的起点。
这里说的新后端，传统后端那些东西还在：HTTP、队列、数据库、权限、日志都还在。变化在于，后端要多接住一类新调用方：会探索、会组合、会长时间执行、也会带来更多不确定性的 Agent。
* * *
##  把后端重新翻译成三个词
原文和项目文档都反复讲三个词：
---
原文里的词  |  我自己的理解  |  放到 Agent 系统里怎么看
---|---|---
` Worker  ` |  参与者  |  能连接到运行时、注册能力的进程
` Function  ` |  能力  |  一个有稳定 ID 的工作单元
` Trigger  ` |  入口  |  什么事情会触发这个能力运行
这三个词本身不复杂。
但它们把很多原来分散的东西放到了一张图里。
TypeScript API 服务是参与者。
Python 数据处理脚本是参与者。
Rust 微服务是参与者。
浏览器 tab 可以是参与者。
沙箱可以是参与者。
Agent 也可以是参与者。
它们不需要在概念上分成“后端服务”“工具”“队列消费者”“Agent 框架”“沙箱产品”好几类。只要能连接到运行时，注册自己能做什么，就可以进入同一套系统。
读到这里，我的关注点就从项目本身转到了后端。
它先把问题放回后端：
** 后端能不能把所有参与者、能力和入口放到同一张运行时目录里。  **
* * *
##  代码里能看到这个方向
SDK 的最小用法很直接：
    import { registerWorker } from "iii-sdk";  
    const runtime = registerWorker("ws://localhost:49134");  
    runtime.registerFunction("hello::greet", async (input) => {  
      return { message: `hello ${input.name}` };  
    });  
    runtime.registerTrigger({  
      type: "http",  
      function_id: "hello::greet",  
      config: { api_path: "/greet", http_method: "POST" },  
    });  
    const result = await runtime.trigger({  
      function_id: "hello::greet",  
      payload: { name: "world" },  
    });
如果只看代码表面，它像是在注册一个远程函数。
放到架构里看，它在做三件事：
* • 当前进程先登记成一个 worker；
* • 这个 worker 暴露  ` hello::greet  ` 这个能力；
* • 这个能力既能被 HTTP 触发，也能被另一个 worker 通过 function ID 调用。
换到 Agent 里，工具就从一段 prompt 说明，变成运行时里注册出来的能力。
官方 AGENTS 文档里有一句话讲得很直：
> An agent is a worker. Its tools are functions. Its memory is state. Its orchestration is triggers.
这句话放到工程里，可以拆成这样：
Agent 本身也是后端系统里的一个参与者；它用到的工具，不一定都在自己进程里；它的记忆可以落到状态层；它的编排不一定只靠一个  ` for  ` 循环，也可以被 HTTP、队列、cron、状态变化这些入口触发。
这和 30 分钟手搓版的差别很明显。
最小 loop 里，工具通常是这样：
    const tools = [  
      readFile,  
      listFiles,  
      runCommand,  
    ];
这对教学很好。
但真实长任务里，Agent 不一定在启动时就知道自己会用到哪些能力。今天可能需要浏览器，明天需要沙箱，后天需要临时拉起一个 Python worker 做数据清洗。
所以我觉得，Agent 后端第一步要补一份可靠的能力目录，再去谈更复杂的 prompt。
* * *
##  运行时目录，和工具列表不是一回事
官方 discovery 文档里有一个细节很关键：
worker 连接时，engine 把它的 functions 和 triggers 加进 live registry。
worker 断开或注销 function 时，registry 立刻变化。
同一个 registry 支持两类动作：
* • 查询当前系统里有哪些 worker、functions、triggers；
* • 订阅能力变化，比如有新 functions 出现或旧 worker 下线。
这和我们熟悉的服务发现有点像，但对 Agent 来说更具体。
服务发现告诉程序“服务在哪里”。
运行时能力目录告诉 Agent“此刻系统实际能做什么”。
这两句话差别挺大。
如果 Agent 拿的是一份启动时写死的工具菜单，它看到的是“理论上可用的工具”。
如果它查的是运行时目录，它看到的更接近“现在活着、能被调用、能被追踪的能力”。
我按自己的理解画了一张小图，放在这里更容易对齐上下文。
从工具列表到运行时能力目录
MCP 可以放在旁边一起看。
MCP 已经解决了很大一块问题：它降低了 Agent 连接外部工具的成本。
之前聊 [ MCP ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408348&idx=1&sn=4ef8f1d27beb410d1a4a94416137d65b&scene=21#wechat_redirect>) 和 [ Skills ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408639&idx=1&sn=ad325d5fa3dd0e112d62b0e34ea3c48a&scene=21#wechat_redirect>) 时，我更关心的是“经验和工具怎么被模型稳定复用”。
到了这里，问题又往下走了一层：工具背后的进程是不是在线，版本是不是对，权限是不是允许，调用结果能不能回到同一条链路。
运行时目录继续往后看一层：工具背后的 worker 是不是活着，function 能不能被发现，trigger 谁来送达，调用和结果能不能进同一条 trace。
两者可以同时存在，关注点不同。
* * *
##  我想借鉴的是四个设计动作
如果今天要给一个内部 Agent 系统做第一版架构，开源实现只能做参照，方案还得回到自己的系统边界。
看完原文和代码后，有四个动作我会认真借鉴。
第一，把工具从“函数数组”升级成“能力目录”。
工具要有 ID、描述、输入输出 schema、owner、版本、权限和观测信息。
这个目录可以先很简单，甚至就是一个数据库表或配置文件。
重要的是，团队先把这件事想清楚：工具不是 prompt 里的文字说明，它是系统可治理的运行时能力。
第二，把 worker 上下线当成正常路径。
Agent 系统里，worker 断开、重启、超时、重复注册、半失败，都会很常见。
代码里有两个细节值得记一下：
* • SDK 断线重连后，会重新发送 function 和 trigger 注册；
* • engine 里维护了  ` function_owners  ` 和  ` external_function_owners  ` ，处理旧 worker 清理和新 worker 注册之间的竞态。
它听起来不炫，但很接近生产问题。
第三，把视角从“Agent 主动调用工具”扩到业务事件触发。
Agent 也可能被 HTTP 触发，被 cron 触发，被队列触发，被状态变化触发。
比如：
* • 线上告警进入  ` pending  ` 状态，触发  ` agents::incident_triage  ` ；
* • 每晚 cron 触发  ` agents::release_notes  ` ；
* • 用户上传文件后，队列触发  ` agents::document_reader  ` ；
* • 审批通过后，状态变化触发  ` sandbox::execute_plan  ` 。
当 Agent 既能主动调用别人，也能被业务事件触发，它就开始进入后端执行模型。
第四，trace 要从协议层开始设计。
在  ` engine/src/protocol.rs  ` 里，  ` InvokeFunction  ` 和  ` InvocationResult  ` 都携带  ` traceparent  ` 和  ` baggage  ` 。
这类字段平时不显眼，排障时会很有用。
Agent 的执行路径常常会跨语言、跨进程、跨队列、跨工具。没有统一 trace，最后只能靠“把所有日志 grep 一遍”来猜。
如果一个浏览器 worker 连上来，  ` browser::navigate  ` 、  ` browser::screenshot  ` 变成可调用能力；一个 sandbox worker 连上来，  ` sandbox::run  ` 变成可调用能力；一个 Python worker 连上来，  ` analysis::summarize_csv  ` 变成可调用能力。
这些能力可以来自不同语言、不同进程、不同生命周期。
它们能落在同一条调用链里，排障会轻松很多。
* * *
##  边界也要提前想
从工程落地看，至少有几个边界要提前想。
第一，中心 engine 的可用性。
当 routing、registry、trigger、observability 都向同一个运行时收拢，这个运行时自己就变成承重点。部署、水平扩展、状态后端、备份恢复，都需要提前有方案。
第二，统一原语不等于统一语义。
HTTP、队列、cron、状态变化都可以被建模成 trigger，但它们的失败语义不一样。HTTP 关心延迟和响应，队列关心重复消费和死信，cron 关心锁和错过执行窗口。
抽象能减少需要理解的东西，但替不了这些工程事实。
第三，能力目录会膨胀。
如果每个 worker 都随意注册 function，Agent 看到的目录会越来越乱。命名规范、版本策略、owner、权限、废弃流程，都要跟上。
第四，动态创建 worker 很强，也很危险。
Agent 拉起 sandbox、浏览器、临时服务，这件事很诱人。
但只要涉及执行代码、访问网络、读取文件、调用内部 API，就要有 RBAC、沙箱隔离、资源配额和审计。
第五，许可证和生态边界也要看清。
当前 engine 是 Elastic License 2.0，SDK 是 Apache 2.0。内部研究、验证思路、学习架构都没问题，商业化二开和分发要单独看许可证条款。
第六，上下文工程不会自动消失。
运行时目录能告诉 Agent 系统里有哪些能力，不能替它决定当前任务该看哪段上下文。我们前面讲上下文更像工作集，讲 Subagents 隔离探索过程，底下都连着这个问题。
能力接进来了，只是第一步。
下一步仍然要设计：哪些事实进入窗口，哪些状态留在 session 外，哪些探索过程交给独立工作区，哪些结果需要回到主线。
* * *
##  再回到 30 分钟  手搓  Agent
现在再看我们之前的 30 分钟手搓 Agent，我会把它放在更清楚的位置上。
它解决的是第一层问题：
** 让 Agent 的 loop 跑起来。  **
后面聊 Harness、长任务 runtime、上下文工作集和 Subagents，是第二层问题：
** 让这个 loop 在真实任务里跑得稳一点。  **
这次代码和访谈提醒我的，是第三层问题：
** 这个 loop 怎么进入一个真实后端系统，和浏览器、沙箱、状态、队列、不同语言服务一起工作。  **
一个很小的 Agent loop，配上一组受控工具，可以让我们看清 Agent 怎么行动。
再往前走一步，工具、状态、触发、worker、trace、权限，就很难一直散在 loop 外面。
它们会慢慢变成后端设计的一部分。
这就是我理解的“Harness 成为新后端”。
如果把它放回日常工程里看：后端要开始给 Agent 提供可发现的能力、可恢复的状态、可审计的权限、可追踪的链路，以及能随运行时变化的工具目录。
所以下次再做 Agent 系统时，我可能会先把框架选择放一放。
我会先问自己一句：
** 我们的后端，离一个 Agent 能理解、能参与、能恢复、能追踪的系统，还有哪些缺口？  **
这个问题，我会继续盯着。
它不一定给出最后答案，但能让我们更早看到后端边界正在怎么变。
* * *
##  往期相关推文
* • 《 [ 30分钟手搓 Agent：LLM + Tools + Loop + Memory 跑通最小闭环 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409091&idx=1&sn=3c40343aefdf11fdb208588a44033e14&scene=21#wechat_redirect>) 》
* • 《 [ 模型差距在缩小，Harness 差距在放大：一篇讲清 Coding Agent 的 6 个关键模块 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408973&idx=1&sn=e147f34daa2d9e3ea431d985b08486e5&scene=21#wechat_redirect>) 》
* • 《 [ Agent Harness 综述：同一个模型，为什么做出来的 Agent 差这么远 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409084&idx=1&sn=b8db9f9925f5dba578cfc7044981f25a&scene=21#wechat_redirect>) 》
* • 《 [ Claude Code 长任务为什么不容易跑偏：从压缩、记忆到续写的 Runtime 设计 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408950&idx=1&sn=8c14e4b7726dd478644e0a8e1acfbad4&scene=21#wechat_redirect>) 》
* • 《 [ Agent Harness 上下文管理：聊天记录还是工作集？ ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409162&idx=1&sn=62556a10e227bcb8d977a4f3e0006c8b&scene=21#wechat_redirect>) 》
* • 《 [ Subagents 详解：Claude Code 如何避免上下文污染 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409171&idx=1&sn=f1205a72f8219032770c1144307d1efa&scene=21#wechat_redirect>) 》
* * *
##  参考资料
* • 项目 GitHub：https://github.com/iii-hq/iii
* • Engine README：https://github.com/iii-hq/iii/tree/main/engine
* • SDK README：https://github.com/iii-hq/iii/tree/main/sdk
* • Quickstart：https://iii.dev/docs/quickstart
* • Discovery：https://iii.dev/docs/primitives-and-concepts/discovery
* • Heavybit 采访：https://www.heavybit.com/library/article/back-end-engineering-in-the-age-of-ai
如喜欢本文，请点击右上角，把文章分享到朋友圈
如有想了解学习的技术点，请留言给若飞安排分享
** 因公众号更改推送规则，请点“在看”并加“星标”第一时间获取精彩技术分享  **
** ·END·  **
    **相关阅读：**
[刚刚，Claude Code“代码泄露”背后：如何重新看 Agent Harness](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408930&idx=1&sn=2fd7f3701ae8688e7720f80bb8296936&scene=21#wechat_redirect>)
[大家都在讲 Harness，但它到底该怎么理解](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408900&idx=1&sn=93bbae7c90fc03fb510f450c6fee97e0&scene=21#wechat_redirect>)
[模型越来越强，为什么大家却开始重写 Harness](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408891&idx=1&sn=639dc4a7c8482f6e1ac04d8d53c63459&scene=21#wechat_redirect>)
[如何让单个 Agent 做长任务不失真：Anthropic 给出了一套更工程化的答案](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408877&idx=1&sn=d27eb9e99ed526e342df775f0291cb2e&scene=21#wechat_redirect>)
[Claude Code高手的 8 个 Claude Code 实战习惯](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408884&idx=1&sn=6a2fa56f70f15cdd75eb5c2b12e687ef&scene=21#wechat_redirect>)
[别从 README 开始：一个架构师会怎样翻 Codex 仓库](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408870&idx=1&sn=ba53595a44ab55396b36795fbc78791b&scene=21#wechat_redirect>)
[Spec 不是代码的替代品，它是 AI Coding 的上下文管理层](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408860&idx=1&sn=b882b2ee97e3f798fea96e68d27c7071&scene=21#wechat_redirect>)
[如何让 Agents 自己设计、升级 Agents](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408848&idx=1&sn=aabf785116e9849dbd301a4f7c477181&scene=21#wechat_redirect>)
[OpenAI怎么把开源项目维护做成工作流：Skills、AGENTS.md 和 CI 的一套组合拳](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408832&idx=1&sn=ef00408738c853ea2e94be58c0612e51&scene=21#wechat_redirect>)
[Claude Skills 入门：把“会用 AI”变成“可复制的工程能力”](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408200&idx=1&sn=2f2cce7dfcbdb0766eac3590f777a17b&scene=21#wechat_redirect>)
[一套可复制的 Claude Code 配置方案：CLAUDE.md、Rules、Commands、Hooks](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408189&idx=1&sn=7d4f7a442a22af37f95c46ff1048a3df&scene=21#wechat_redirect>)
[Claude Code 最佳实践：把上下文变成生产力（团队可落地版）](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408183&idx=1&sn=0b6f1437465d3a61118db688cc889b17&scene=21#wechat_redirect>)
[把 AI 当成新同事：Agent Coding 的上下文与验证体系](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408169&idx=1&sn=7bba1377a31ffa0ce68932935c8d923a&scene=21#wechat_redirect>)
[一周写百万行的背后：Cursor长时间运行 Agent 的工程方法论](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408161&idx=1&sn=85aaff6f2f779e53b6ae9c5e1f003269&scene=21#wechat_redirect>)
[2026年生活重启指南](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408141&idx=1&sn=e1e64ad73d25414957aa5206ca969fc3&scene=21#wechat_redirect>)
[我真不敢相信，AI 先加速的是工程师。](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408153&idx=1&sn=d33b48464de93a2573a0a0cb025ada9e&scene=21#wechat_redirect>)
[扒一扒 Claude Cowork 系统提示词：Anthropic 如何打造数字同事](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408128&idx=1&sn=1b6c640de61986d1364847bffb2cd28f&scene=21#wechat_redirect>)
[Cowork 安全架构深度解析：从 Claude Code 到 Cowork，Anthropic 如何把“可控”做成产品](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408114&idx=1&sn=29a754281cd07c16b6191c6d146c5837&scene=21#wechat_redirect>)
[Anthropic官方万字长文：AI Agent评估的系统化方法论](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408107&idx=1&sn=905552d68f5b174fd9548360bdea4448&scene=21#wechat_redirect>)
[银弹还是枷锁？Claude Agent SDK 的架构真相](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408084&idx=1&sn=82f274ba084f9c289e2d141aad0c088b&scene=21#wechat_redirect>)
[Claude Code创始人亲授13条使用技巧](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408076&idx=1&sn=f139e90d699b528e80e79c558eed42ee&scene=21#wechat_redirect>)
[Claude Code 内部工具开源 code-simplifier：终结 AI 屎山代码的终极方案](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650408028&idx=1&sn=3a8571a9fa0bd5d7e59cd66fc6187b3e&scene=21#wechat_redirect>)
> 版权申明：内容来源网络，仅供学习研究，版权归原创者所有。如有侵权烦请告知，我们会立即删除并表示歉意。谢谢!
** 架构师  **
我们都是架构师！