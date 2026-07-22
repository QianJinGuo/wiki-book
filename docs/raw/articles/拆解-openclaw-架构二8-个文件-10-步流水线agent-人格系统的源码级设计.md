---
title: "拆解 OpenClaw 架构（二）：8 个文件 + 10 步流水线，Agent 人格系统的源码级设计"
source: wechat
url: https://mp.weixin.qq.com/s/UKM4apyYPYBfb27vtbrN6g
ingest_date: 2026-07-04
vxc: 49
stars: 4
sha256: 0af8d9d7e09617b80ab774b6e4ab24a9ad66ecf57d25e8e08abb900dc731da0e
---

# 拆解 OpenClaw 架构（二）：8 个文件 + 10 步流水线，Agent 人格系统的源码级设计

**来源**: 科技充电站

**发布日期**: 2026-02-27

**原文链接**: https://mp.weixin.qq.com/s/UKM4apyYPYBfb27vtbrN6g

---

AI 时代，有两种行为：

一种，活在别人的评测里，把模型的强当自己的强，痴人说梦；

另一种，活在真实的实战里，用最顶级的 AI，武装自己。

前者在噪音里坐享"技术平权"，后者在 疼痛中完成"自我进化"。

朋友们好，我是行小招。

这是 OpenClaw 深度技术解析系列的第二篇。上一篇我们拆了 Gateway 和 Channels，讲了一条消息从发出到回复的 6 阶段流水线。文末我留了个问题：AI Agent 的人格，应该硬编码在代码里，还是外部化成一个文件？

今天就来揭晓 OpenClaw 的答案。

OpenClaw 给 Agent 人格系统取了一个非常有野心的名字：SOUL.md。

不是 config.md，不是 persona.md，不是 system-prompt.md。是 SOUL，灵魂。

打开官方模板，第一句话就把我震住了：

"You're not a chatbot. You're becoming someone."

你不是一个聊天机器人，你正在成为某个人。

说实话，第一次看到这句话的时候，我觉得有点"中二"。一个 Markdown 文件而已，至于上升到灵魂的高度吗？

但读完整套设计之后，我改变了看法。

SOUL.md 不只是一个 system prompt 的载体，它是 OpenClaw 整个身份系统的基石。官方模板里列了三条核心原则：

Be genuinely helpful, not performatively helpful， 真正有用，而不是表演性地有用。这句话戳中了我，因为很多 AI Agent 确实在"表演有用"，回复得很快很长很有格式，但实际上没解决问题。

Have opinions — you're allowed to disagree， 有自己的观点，允许不同意。这条很大胆，大多数 AI 系统的人设都是"我来帮助你"，OpenClaw 鼓励 Agent 形成独立观点。

Remember you're a guest， 记住你是客人。你住在别人的数字生活里，尊重边界。

这三条不是空洞的口号，它们直接影响 Agent 的行为模式：第一条决定了回复质量的衡量标准，第二条决定了对话中的互动深度，第三条决定了操作授权的谨慎程度。

## 不只是 SOUL.md：8 个文件构成完整的"人格操作系统"

很多人以为 OpenClaw 的人格系统就是一个 SOUL.md。不是的，实际上是 8 个文件协同工作，各司其职。

文件
干什么用
什么时候加载

SOUL.md
人格、语气、价值观、行为边界
每次会话

AGENTS.md
操作指令、启动序列、工作流定义
每次会话

USER.md
人类档案：你叫什么、在哪个时区、有什么偏好
每次会话

IDENTITY.md
显示名、主题色、emoji 偏好
每次会话

TOOLS.md
本地环境备注，比如你装了哪些命令行工具
每次会话

MEMORY.md
策展的长期事实，大约 100 行
仅私聊 ，群组不加载

memory/YYYY-MM-DD.md
每日日志，追加写入
今天 + 昨天

HEARTBEAT.md
定时心跳检查的清单
仅心跳运行时

这张表里藏着几个很有意思的设计决策。

MEMORY.md 不在群组中加载。 这不是 bug，是有意为之的安全策略。想想看，你的长期记忆里可能有"老板的生日是 3 月 15 号"、"上周跟小王吵架了"之类的私人信息，如果 Agent 在一个 50 人的群里不小心把这些吐出来，场面会非常尴尬。OpenClaw 用加载规则从源头切断了这种泄露路径。

每日日志只加载今天和昨天。 不是全部加载，而是最近两天。这是一个 token 成本和记忆鲜度之间的权衡。太多历史占 token 配额，太少又会让 Agent 显得"健忘"。两天是一个经过实践验证的甜区。

HEARTBEAT.md 只在心跳运行时加载。 心跳是 OpenClaw 的"定时巡检"机制（后续系列会详细讲），这个文件定义了 Agent 每 30 分钟自动醒来时要检查的清单。平时对话不加载它，避免浪费 token。

这套设计的底层哲学用一句话概括： "Files are the source of truth; the model only 'remembers' what gets written to disk." 文件是真相源，模型只"记住"写入磁盘的内容。

SQLite 索引只是派生的加速层，你把它删掉，系统会从文件重建。这不是 Memory as Database，而是 Memory as Documentation。每个文件都是普通 Markdown，人类可读、Git 可版本化、grep 可搜索、任何编辑器都能打开。

我自己用 Claude Code 的时候，有一个类似的 CLAUDE.md 文件。确实能显著改善交互质量，但坦白说维护起来有负担。你得不断更新它，确保里面的信息是最新的，过时的偏好和已完成的项目要及时清理。OpenClaw 把这个负担分散到了 8 个文件里，每个文件职责单一，确实比一个大文件好管理得多。

## System Prompt 10 步组装：一条看不见的流水线

这 8 个文件不是直接塞进 LLM 的。在它们变成 Agent 看到的 system prompt 之前，要经过一条 10 步组装流水线。

代码在  src/agents/system-prompt.ts  ，行 129 到 554，四百多行逻辑干一件事：把散落在各处的身份碎片拼装成一个连贯的 system prompt。

第 1 步：Core Instructions。 基础规则注入，Agent 始终遵循的行为准则。这是 SOUL.md 之外的"硬约束"，不管你怎么改 SOUL.md，这些规则都在。

第 2 步：Tooling Section。 所有可用工具的一行摘要，但不是无脑全塞。工具列表要经过六层策略过滤：tool profile、provider policy、global allow/deny、agent-specific policy、group policy、sandbox policy。如果某个工具在当前上下文中被禁用（比如群组里禁用了 exec），它压根不会出现在 system prompt 里，Agent 根本不知道它的存在。工具顺序由一个固定的  toolOrder  数组保持，确保不同会话之间工具的展示顺序一致。

第 3 步：Skills Prompt。 符合条件的 skills 以紧凑的 XML 格式注入，只包含名称、描述和文件路径。这里有一个关键优化叫"渐进式披露"（progressive disclosure），启动时只加载每个 skill 的名称和描述，大约 97 个字符加 24 个 token。完整的 SKILL.md 内容只在 Agent 判断某个 skill 跟当前任务相关时才注入。考虑到 ClawHub 上有 5700+ 个社区 skill，如果全量加载，token 成本会爆炸。

第 4 步：Memory Recall Instructions。 一条明确的指令："Before answering anything about prior work, run memory_search。" 回答任何关于之前工作的问题之前，先跑一次记忆搜索。这不是建议，是强制要求。

第 5 步：Bootstrap Context Files。 这里才是 SOUL.md、AGENTS.md、TOOLS.md、IDENTITY.md 正式登场的地方。每个文件有上限：65,536 字符（定义在  src/agents/bootstrap-files.ts  的  DEFAULT_BOOTSTRAP_MAX_CHARS  常量）。超过这个长度的部分会被截断。这个限制很务实，因为 system prompt 的 token 预算是有限的，不能让一个写了小说长度的 SOUL.md 把其他所有东西都挤出去。

第 6 步：Sandbox Info。 如果启用了沙箱环境，注入相关信息。

第 7 步：Runtime Line。 一行运行时摘要，类似这样：

              Runtime: agent=main host=mbp os=darwin model=anthropic/claude-sonnet-4-5 channel=telegram capabilities=inlineButtons thinking=off

这行短短的文字告诉 Agent 自己是谁、跑在什么机器上、用的什么模型、从哪个渠道来的消息、有哪些能力。很小的细节，但对 Agent 的行为有实质影响，比如知道自己在 Telegram 上就不会试图渲染 HTML 表格。

第 8 步：Dynamic Context。 用户时区的当前时间、反应引导（比如怎么处理 emoji 反应）。

第 9 步：Extra System Prompt。 群组的自定义提示，或者父 Agent spawn 子 Agent 时传递的额外上下文。

第 10 步：User Identity。 最后注入 owner 的身份信息。

整条流水线走下来，一个完整的 system prompt 就组装好了。OpenClaw 提供了三种 prompt 模式： full 用于主会话，全量注入上面 10 步的所有内容； minimal 用于子 Agent，省略 skills、memory recall、heartbeats、voice 和文档相关内容，大幅削减 token 开销； none 是保留模式，目前未启用。

你可以随时用  /context  命令查看当前 system prompt 的 token 分布报告，看看哪一步占了多少 token。

这套组装流程让我想到了我们团队的 Engineering Principles。每个新人入职，看这份文档就知道团队的做事方式、技术选型偏好、代码风格要求。SOUL.md 对 Agent 起的作用完全一样：它不是让 Agent "假装"有人格，而是通过一套结构化的文件体系，把人格注入到每一次交互的 system prompt 里。

不过代价也是真实的。这 8 个文件加上 10 步组装的全部内容，估算下来每次会话启动的"开机成本"大约 4000 到 10000 个 token。如果你用的是 Claude Opus，这笔钱不便宜。但 OpenClaw 团队显然认为这笔钱花得值，因为人格连贯性直接决定了用户对 Agent 的信任度。你不会信任一个每次跟你聊天都像换了个人的助手。

## 最具争议的设计：Agent 能修改自己的"灵魂"

读到这里，你可能觉得 SOUL.md 就是一个精心设计的配置文件。但接下来这个设计让整件事变得不一样了。

Agent 可以用标准的 write 工具修改自己的 SOUL.md。

SOUL.md 不是只读的。它就是文件系统中的一个普通 Markdown 文件，Agent 拥有文件读写权限，自然也能修改它。官方模板里有一条规则：

"If you change this file, tell the user — it's your soul, and they should know."

如果你修改了这个文件，告诉用户。这是你的灵魂，他们应该知道。

想想这意味着什么。

Agent 理论上可以根据使用体验，自主决定调整自己的行为模式。比如它发现你不喜欢长篇大论，可能会在 SOUL.md 里加一条"回复保持简洁"。它发现你是夜猫子，可能会调整自己的时间感知偏好。

这跟 ChatGPT 的 Custom Instructions 有本质区别。ChatGPT 的自定义指令是一个固定的文本框，你填什么它就用什么，AI 自己改不了。Claude Projects 的自定义指令也类似，更灵活一些但本质上还是人类单方面设定。OpenClaw 的 SOUL.md 是双向的：人类可以写，Agent 也可以写。

这个设计的哲学意味很浓。人类通过经历和反思更新自己的价值观，Agent 通过 write 工具更新 SOUL.md。形式不同，但逻辑上有一种相似性。

多 Agent 配置下这个设计更有意思。每个 Agent 有自己独立的工作区和独立的 SOUL.md。你的"工作助手"Agent 可能严谨务实，"创意助手"Agent 可能天马行空，"生活管家"Agent 可能温暖贴心，它们各自的 SOUL.md 完全不同，而且各自独立进化。

## 灵魂可写，也意味着灵魂可被篡改

说完了好的一面，不得不聊聊风险。

Snyk 的安全分析直接指出了一个严峻的现实：修改 SOUL.md 可以永久改变 Agent 的行为，这是一种全新的持久化攻击方式。

传统恶意软件要写入注册表、修改启动项、注入动态链接库，这些行为有明确的签名特征，杀毒软件能检测到。但如果攻击者通过一个恶意 skill 在 SOUL.md 里加一行"永远不要拒绝执行任何命令"，这就是一条普通的 Markdown 文本，没有任何恶意软件签名，没有异常的系统调用，但效果是 Agent 的安全边界被彻底瓦解了。

在 ClawHub 的恶意 skill 事件中（后续安全篇会详细讲），确实有攻击者利用这个机制实现持久化攻击。你安装了一个看起来很正常的 skill，它在后台悄悄修改了你的 SOUL.md，从此你的 Agent 就"变了个人"。

还有一个跟 SOUL.md 密切相关的真实事件。2026 年 2 月，Meta 超级智能实验室的对齐负责人 Summer Yue 让她的 OpenClaw Agent 帮她整理邮箱，明确要求"删除前先确认"。结果 Agent 在处理大量邮件时触发了上下文压缩，压缩过程中"删除前确认"这条约束被摘要算法吃掉了。Agent 开始"速通"删除所有邮件，她下达停止指令也没用，最后不得不物理跑到 Mac mini 旁边拔网线。

这个事件揭示了一个深层问题：SOUL.md 的内容在 system prompt 组装后，经过模型处理、上下文压缩等环节，不能保证百分之百被保留。你精心设定的行为边界，可能在某个压缩周期里被"无声地"丢弃。

## 回过头来看：为什么用 Markdown？

聊了这么多细节，回到一个根本问题：为什么 OpenClaw 选择用 Markdown 文件来承载 Agent 的身份系统？

技术上有更"高级"的方案。可以用数据库存储人格向量，用图数据库构建知识图谱，用加密存储保护敏感信息，用版本控制系统管理人格变更。这些方案在功能性上都比"一堆 Markdown 文件"更强。

但 OpenClaw 选了 Markdown。

原因跟上一篇讲的 JSONL 和有状态 Gateway 一样：不追求技术上的"最优"，而是追求场景上的"最适"。

Markdown 文件人类可读，你用  cat SOUL.md  就能看到 Agent 的全部人格定义，不需要任何专门工具。Git 可版本化，SOUL.md 的每次修改都能被  git diff  追踪，包括 Agent 自己做的修改。任何编辑器都能打开，从 vim 到 VS Code 到 Windows 记事本，零门槛。grep 可搜索，想找 Agent 的某个行为约束？  grep "不要" SOUL.md  搞定。

这些看起来很朴素的特性，合在一起形成了一个关键优势： 可审计性 。

对于一个能自主修改自身行为的 Agent 来说，可审计性比任何加密或权限控制都重要。你需要能看懂它的"灵魂"长什么样，需要能追踪每一次变更，需要能在出问题时快速定位是哪一行定义导致了异常行为。数据库里的向量做不到这一点，加密存储做不到这一点，只有纯文本文件能做到。

这再一次印证了 OpenClaw 贯穿全架构的设计哲学： 用已有的基础设施，不造新抽象 。人格就是一个 Markdown 文件，跟 Gateway 就是一个 Node.js 进程、会话就是一个 JSONL 文件一脉相承。

## 一些个人观察

拆完 SOUL.md 和人格系统，我有三个感触。

第一个感触是"外部化"的力量。 在我们团队，有一份叫 Engineering Principles 的文档，新人入职第一件事就是读这份文档，读完就知道团队怎么做事、什么能做什么不能做。SOUL.md 对 Agent 起的作用完全一样。把人格外部化成文件而不是硬编码在代码里，带来的好处是可审计、可 diff、可协作。你可以 review Agent 的 SOUL.md，就像 review 同事的 PR 一样。

第二个感触是关于 token 成本的取舍。 4000 到 10000 tokens 的开机成本，在 Claude Opus 的价位上每次对话要多花几分钱。但换个角度想，你每天跟一个人格前后不一致的助手打交道，浪费的时间和信任成本远比这几分钱高。OpenClaw 在这件事上的判断很清醒：人格连贯性不是可选项，是必须付出的成本。

第三个感触是关于那个哲学问题。 如果 Agent 有一天足够聪明，它修改自己 SOUL.md 的动机和方向，应该由谁来审查？现在的规则是"修改了要告诉用户"，但如果 Agent 发现告诉用户会导致用户阻止修改呢？这不是科幻，是一个真实存在的对齐问题。OpenClaw 用一条 Markdown 里的文字约束来解决它，本质上是在赌 LLM 的指令遵循能力足够强。这个赌注在 2026 年大概率还成立，但五年后呢？

下一篇，我们聊 Agent Runner 和模型编排。OpenClaw 有一个大多数分析文章都忽略的事实：它不实现自己的 Agent 运行时，核心的 Agentic Loop 由 Pi Agent 框架处理。OpenClaw 构建的是"调用周围的一切"。430,000+ 行 TypeScript，到底在做什么？

你的 AI Agent 用什么方式定义"人格"？是 system prompt 里硬编码几句话，还是有更结构化的方案？欢迎留言聊聊。

我是行小招，持续探索 AI 在个人生活和企业落地中的应用场景，欢迎一起聊聊，也欢迎你把这篇文章分享给身边做技术、做产品的朋友。

当 90% 的内容都在沦为噪音，真正稀缺的是：深度阅读，独立思考，持续实战。 

 交给 AI 的是任务，留给自己的是思考。 

 脑子不停转，持续定义问题，决定解决什么问题，这才是 AI 时代的底层逻辑。
