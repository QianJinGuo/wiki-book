# DeepSeek Code Harness

## Ch09.016 DeepSeek Code Harness

> 📊 Level ⭐⭐ | 43.8KB | `entities/deepseek-code-harness.md`

## Overview
DeepSeek 正在组建团队，从零开始构建对标 Claude Code 的代码智能体产品。核心公式：**Model + Harness = Agent**。除模型本身以外的所有工作，都属于 Harness 的范畴。官网职位描述明确："他们正在把 DeepSeek 的前沿模型能力转化为领先的 Agent 产品。"

## 背景：Claude Code 定义上限，但中国开发者被排除在外
Anthropic 官方明确禁止中国大陆访问 Claude。2025年9月更出台政策：任何由中国资本控制超过50%的公司，不管注册地在哪，都不准用。CEO 达里奥·阿莫迪本人也公开主张对中国实施技术制裁。
Claude Code 的市场表现：

- GitHub 公开提交量的 4%
- 首次采购 AI 服务的企业中，Anthropic 面对 OpenAI 正面竞争赢下约 70% 订单
- 不到一年跑出数十亿美元的年化收入
- 约 27% 的任务是开发者没有这个工具时原本不会尝试的（任务边界扩大） See also [Harness Engineering](../ch05/065-harness-engineering.html)

## DeepSeek 招聘详情
**核心团队成员：**

- **陈德里（Deli Chen）** — 北大毕业，2023年加入 DeepSeek，高级研究员，NVIDIA GTC 2024 / 乌镇峰会 2025 演讲者
- **Cui Tianyi** — 浙大毕业，Jane Street 近九年（股票/固定收益软件开发），后联合创办香港量化基金 TSY Capital
**职位要求：**
深度使用过 Claude Code、Cowork、Codex、Cursor、OpenCode、GitHub Copilot、Manus、OpenClaw、Hermes 等产品。加分项："其它超乎常人的与工作相关的才能"（DeepSeek 极客气质）

## 核心公式：Model + Harness = Agent
DeepSeek 对 Harness 的定位：除模型本身以外的所有工作，都属于 Harness 的范畴。
> "真正的护城河在外围：权限控制、上下文压缩、MCP 工具、插件、Skills、Hooks、Subagent 调度、会话存储和安全策略。它把一个简单循环包成了可控、可扩展、可长时间运行的工程系统。"

## 关键数据：Harness 的决定性作用
**CORE-Bench Hard：**

- Claude Opus 4.5 + Claude Code Harness: **95%**
- 同样模型 + Hugging Face Smolagents 朴素配置: **42%**
- 同一模型，单是 Harness 差距：**53 个百分点**
**Terminal Bench：** 头部清一色用 Claude Opus 4.6，大家拼的已经不是模型，而是谁的 Harness 更好。

## Anthropic 模型+Harness 共同演化编年史
| 时间 | 模型 | Harness 更新 |
|------|------|------|
| ~2024 | Sonnet 3.5 | 第一次展现编码+自验证+迭代潜力（Claude Code 前奏） |
| 2025-02 | Sonnet 3.7 + Claude Code 研究预览版 | Claude Code 目标：收集开发者真实使用数据反哺模型训练 |
| 2025-05 | Opus 4 + Sonnet 4 + Claude Code 正式 GA + SDK 开放 | SDK 开放，Harness 被公开 |
| ~2025 | Sonnet 4.5 | 加入 Checkpoints（回退机制），运行时长推到约 30 小时 |
| 2025 | Opus 4.5 + Sonnet 4.5 | Opus 做规划、Sonnet 做执行分工；Skills 渐进式披露补上下文窗口 |
| 2026 | Opus 4.6 + Sonnet 4.6 | Sonnet 4.6 成主力编码模型；Opus 4.6 "非常 agentic"，极简 Harness 下稳定运行时长从约 4 小时跳到 12 小时；推出 agent teams、server-side compaction、100万上下文窗口 |
**Anthropic 总结规律：** "找到模型里的缺口，用 Harness 补上，再用 Harness 的数据去训练模型——到某个时间点，那部分 Harness 可能就不再需要了，然后循环继续。"

## 长时运行能力：区分"会写代码"和"能完成任务"
**关键差距：** 短任务一次生成即可；真实工程任务是持续的"修改→测试→出错→再修改"循环，可能持续几十分钟甚至数小时。

- 只能稳定跑几分钟的 Agent：本质仍是代码助手
- 能跑几小时甚至几天的 Agent：开始像真正的工程代理
**长时运行难点：**

- 上下文窗口有限且越跑越乱
- 模型规划能力弱容易半途而废
- 模型总高估自己的完成度（半成品却说"好了"）
**解决路径：**
1. 模型能力直接烘焙进权重（Opus 3.7→4.6，稳定完成50%任务的运行时长从约1小时→12小时）
2. Harness 外层优化（模型外面的脚手架）

## DeepSeek 的机会与挑战
**机会：**

- 模型价格优势 + 自建 Harness → 挑战 Claude Code 完整体验
- AI 编程下一阶段：不是单点模型竞争，也不是单点工具竞争，而是模型能力、Harness 设计、运行成本和开发者入口的组合竞争
**挑战：**

- 真正难的是建立长时运行闭环：让模型在真实代码库里工作 → 记录失败路径 → 用户修正 → 变成下一轮产品/工具/模型训练的输入
- 如果 DeepSeek 只做模型，永远被包在别人的工具里
- 只有跑通模型+Harness 共同演化循环，才有机会长出自己的 Claude Code

## Harness 正在成为新市场
各家对 Harness 层的商业化态度：

- **Anthropic**：托管运行时单独计费，按会话小时收费
- **Google/Microsoft**：把会话、内存、代码执行、工具调用拆成平台消费项
- **OpenAI**：Agents SDK 开源，不额外收第一方运行时费用，只对模型和工具调用收费
> "Model + Harness = Agent，正在成为行业共识。控制层不再只是模型的附属品，而是一个独立的产品维度。"

## 深度分析
### 1. 为什么 2026 年 Harness 站到台前
AI 行业关注点的迁移路径：

- 2022：权重、微调、RLHF
- 2023：上下文、RAG、长上下文
- 2024：工具调用、MCP
- 2026：**Harness**（最外层）
任务复杂度升级：从"给段评论判断情绪（几十个token）"到"看完整个代码库找bug写补丁跑测试验证（可能消耗上千万token、持续数十分钟、数百次工具调用）"。

### 2. 中国市场的特殊机会窗口
Claude Code 越强，缺口越大。灰色渠道扩大的背后是刚性需求。DeepSeek 的出现恰好填补这个空白——不是"做一个更好的工具"，而是"没有别的选择"。

### 3. 飞轮效应
Claude Code 每一次真实使用都在收集问题/失败轨迹/用户修正，反哺模型训练。模型越强 → Harness 越顺手 → 使用越多 → 模型进步越快。DeepSeek 如果能建立同等飞轮，就不只是对标，而是真正竞争。

## 2026-08-13 v0.1 开源：一切皆插件（SUPP 追加）

2026 年 8 月 13 日，DeepSeek 正式发布 Harness 开发者预览版 v0.1，MIT 协议开源（github.com/deepseek-ai/deepseek-harness），回答了两年前的悬念：DeepSeek 会怎样做自己的 Harness。答案是**一切皆插件**——插件边界下沉到整个运行时。

### 一切皆插件：可替换范围覆盖整个运行时

主流 Coding Agent 的可扩展性通常局限在工具与技能层；DeepSeek Harness 把模型、工具、技能、会话、沙箱、存储、Agent Loop、调度和 UI 全部插件化，替换范围从单个 MCP Server 延伸到 Agent 循环方式、子 Agent 调度、会话保存与交互界面，全程无需修改 Harness 源码。

支撑架构是 **Cordis 插件系统**：元框架只负责插件的加载、卸载与依赖关系，Agent 能力全部由插件提供，插件间通过服务与事件协作，由配置决定组合方式。工具调用被拆成可扩展流水线：执行前经过 Hook、审批、权限检查、沙箱与超时控制，执行后支持结果改写、记录与 UI 渲染；PTC 模式中的代码及其子调用同样经过该流水线，不能绕过审批与沙箱。

### 四种模式 = 四套插件组合

同一底座提供四种运行模式，差异仅在默认加载的插件集合：标准模式（完整工具组合）、PTC 模式（Programmatic Tool Calling，模型生成代码组合多轮工具调用）、极简模式（仅 shell+文件编辑，最小环境测模型能力）、创造模式（Agent 检查自身运行时、在内存中试验 Cordis 插件并创作新运行模式）。其中创造模式最值得关注——Harness 配置本身开始成为 Agent 可操作的对象，朝向"Agent 自己改造自己的 Harness"。

### 多 Agent：层级式 Supervisor–Worker 混合，无范式突破

内置多 Agent 系统：父 Agent 通过 Spawn 启动全新上下文子 Agent、Fork 继承已有会话；workflow 工具现场编写 JavaScript 用 parallel()/pipeline() 组织并行或流水线任务；Ralph 模式让多个全新 Agent 按轮次接力。最接近五种编排模式中的层级式 Supervisor–Worker，兼容并行/流水线/Ralph 的混合系统；任务分配与控制权仍在父 Agent 手中，缺 Agent 间自主发现/协商/竞争/动态接管，离 Swarm 有距离。真正特别处：编排方式本身做成可配置替换的插件，甚至可把 Claude Code、Codex 或 ACP 外部 Agent 接到同一子 Agent 接口后。

### append-only 统一事件流

另一核心设计：模型看到的所有内容（系统提示词、推理、工具调用及结果、子 Agent 调度、每次上下文注入）进入同一份 append-only 会话日志，Trajectory 视图按来源检查；会话恢复、分叉、检索与回放均建立在同一事件流上。统一事件流解决可观测性（任务失败时可还原模型当时所见），并为会话分叉提供自然数据结构（新分支沿用分叉点前事件再追加，不覆写历史）——对插件可替换系统尤其重要，开发者可比较不同 Loop/工具/调度插件在相同任务轨迹上的表现。

### 差异化押在架构开放，挑战与观察点

当前差异化在架构层而非新编排算法。业内判断：Harness 框架整体趋同，拉开差距的将是记忆压缩、冲突清理、路径复用与 Plan 结构化校验（"编译"式检查：异常分支完整性/不可执行操作/权限范围）等局部环节——"一切皆插件"正为这些局部能力预留替换空间。挑战：插件边界越深，接口稳定性/依赖管理/版本兼容/性能/调试复杂度越难控制，v0.1 阶段迁移成本高；"什么都能换"不自动带来更高任务成功率，价值取决于官方默认插件质量、稳定组合范式与可信评测，以及第三方生态。

## 2026-08-14 橙皮书深度实测（SUPP 追加）

第三方一手实测文档（花叔，120 页，基于官方仓库+683 篇设计笔记考古+本机实测，快照 @deepseek-ai/dsh@0.1.0-rc.6）验证并深化上述架构认知，补充大量官方文档没有的机制细节与量化数据。

### 核心不变式：Model-visible ⟺ logged

模型看到的一切都必须能从会话日志重建；新增模型可见输入必须新增会话事件。每次发请求前代码自己比对（真要发的消息列表 vs 从日志重算应得的列表，六项逐项比），对不上抛异常请求发不出——把"模型到底看到了什么"从玄学变成可逐字节复原的事实。会话日志 44 种事件类型，**模型能看见的只有 3 种**（用户说的/模型说的/工具返回），审批记录、沙箱模式、权限变更等 41 种只进日志不进模型眼睛（3:41）。分叉/恢复/回放是同一份日志的三种读法（分叉=拷日志前段当种子、切口必须落整轮外；恢复=日志当种子；回放=无密钥重跑真实日志）。压缩不删原文：被压事件留在日志原位只是从模型可见面遮住，摘要是新写消息标注遮住范围。

### 权限设计的两条撤回教训

**软性封锁**：最早把沙箱模式写进固定系统提示词，线上数据打碎直觉——模型会拒绝尝试本可升权拿到的工作（首次人工会话 12 轮里 5 轮零工具调用，直接解释"我没有权限"）。换来的原则：**不要在开头劝退，要在撞墙时给梯子**——现在标准模式系统提示词无沙箱字样，策略作为单独运行时快照注入；只读档措辞专门设计"别光凭这条策略就拒绝，正常去试工具，按返回的拒绝和升权指引走"。**凭据保护撤回**：给沙箱加"凭据路径禁止读"规则写完上线又撤回（Linux 需在只读目录树建挂载点、父目录不存在就拒绝整个约束；另一路无法从已给出读权限做减法）——"一个在它生效的地方破坏约束、在它不生效的地方谎报状态的保护，比被文档化的缺席更糟"。结论：存下来的凭据对模型没有边界（谨慎≠边界），真正的系统钥匙串记成待办。

### 成本实测：13,809 token 入场费构成

第一次请求未命中输入 13,838 token：25 个工具说明书 6,510（47%）+ 本机 skill 目录清单 6,242（45.1%，用户自带） + 系统提示词 844 + 环境快照 129 + 协议开销 82 + 用户提问仅 29（0.2%）——"问了一句 29 token 的话，harness 替我先付了 13,809 token 的入场费"。缓存：flash 命中价 1/50、pro 1/120；命中数全是 64 的整数倍（验证官方"64 token 一个存储单元"）；DeepSeek 缓存寿命几小时到几天且写入不收费（对照 Anthropic 订阅 1 小时/按量 5 分钟）。219 个包 README 强制 "KV Cache effect" 节写明缓存影响（215 填+4 白名单豁免，门禁脚本 38KB）。**摘要器教训**：默认摘要器另发请求致同一段历史按全价付两次；三条省钱直觉全被否——"明知道摘要器一个工具都不会用，还是要原样带上两万多字符工具说明书，因为少传反而更贵（前缀错位）"。

### PTC 模式实测：不省在前面，省在后面

PTC 模型眼前只剩 run_code 一件工具，写 TypeScript 组合工具调用（"只有你打印或返回的东西会回到你这里，中间工具结果永远不进入对话"）；那 24 件工具是"报关单从信封外挪进信封里"——参数表 26,894→897 字符但系统提示词 4,100→35,643，首轮输入反而多 9%。省的是中间结果体积：5 次程序调用实际发起 15 次操作，中间 10 次输出从没进模型眼睛。**同任务对照实测**（三小文件 V4-Pro）：标准 21.9s vs PTC 305.9s、输出 token 12 倍（思考 13,095 vs 739）——PTC 是赌注，任务越碎中间产物越大越划算，小任务稳输。执行环节堵死：8-7 修复笔记"当直接调用方能绕过时，省略参数表不构成任何强制"（模型直呼原生工具名照样穿透执行）；主动拒绝程序间共享状态（保"请求是日志纯函数"不变式，Anthropic 反方向加状态持久化）；全程不给省钱数字。极简模式=给模型跑分用（扒掉上下文压缩/环境说明/系统提示词注入，连"完全放开"沙箱都不用——要去掉的是限制在模型眼里的痕迹）。

### 创造模式实测：它给自己长出一只手

对话中途让模型现场造新工具（count_chinese 数汉字）成功：工具清单 32→33（32=标准 25+创造模式 7 件自指工具）、动态插件 0→1、实测调用返回 6（正确）。19 步 24 次调用，**前 14 步 20 次全在读自己的说明书**（查运行时/翻安装目录/读 types.d.ts/搜 defineTool/加载 cordis-plugin-development 技能），真正动手最后 4 次——"一个 agent 在读自己身上零件的规格书，为给自己再装一个零件"。边界：动态插件只活进程内存，不创建文件/不装包/不改配置/重启不存活/**不能被自动提升为正式插件**；风险声明"隔离全局变量但不是安全边界，当成 bash 权限对待"。卡住沉淀的不是技术是那条不变式（Model-visible⟺logged 得管到跨会话、管到配置目录）——"不是做不到，是不敢默认打开"。文档落后代码现场：官方写 5 个自指工具实测 7 个。

### 四篇事故复盘与工程制度

docs/postmortem/ 四篇（0001-0004）：①**178 个绿测试+100% 行覆盖率生产无法工作**——根因一行 `export default apply`；测试全手工挂载不经过加载器；真走全流程的测试要 API key，CI 没 key 跳过；本地"通过"靠残留旧编译代码——"覆盖率证明代码行被执行过，不能说明功能按交付方式正常"；方法论"信 trace 不信理论"。②配置开关写错位置致工具集体消失——快照测试刷新把"找不到工具"存成新正确答案（"快照刷新是 fixture 的生产过程，不是正确性审查"）。③验收替身服务器——模型探精简版 200 就宣布成功、起新端口验收，用户真正用的 3081 从没探过（修法 $DSH_WEB_URL/$DSH_WEB_MODE）。④一行无害提示被当沙箱故障——stderr 带内归因通道可被伪造。**教训固化**：219 包各带 invariant.ts（184 份空，空实现第一行必须 `No runtime invariant:` 写明包特有理由）；崩溃恢复合成消息明确"结局未知，只读或幂等才重试"。**AI 写代码库**：12,293 提交/64 天/单日最高 887、683 篇设计笔记（被否 11 篇）、27 道机械检查、Agent Note 制度（每个非平凡改动必须同提交带笔记+写清否决方案+归档哈希冻结）、"工作量很大不构成成本论据"（劳动由 agent 完成时）、崔添翼（Jane Street 背景）一人 5,235 次提交占 42.6%。

### 四注赌局（§14）

①一切皆插件=赌生态扔开箱即用（133 插件在跑设置页只能改 3 张卡）；②有迹可循=赌可审计扔磁盘简洁（无保留期策略"它不会自己删"）；③技能/MCP 只是普通插件=赌抽象正确扔贴合度（技能门开最大 57 个零配置读走、MCP 只桥工具类默认零服务端）；④模型公司亲自下场=赌能力兑现扔中立（Composio 实测：固定 V4-Flash 套 8 个 harness 通过率 46.7%-66.7%、每次成功成本差约 7 倍；匿名 UUID 跟请求走关不掉）。Cordis 框架考古：Shigma 2022 年个人项目（公开前几百星），9 包整份拷入（核心 2600 行 TS）改动清单 18 条，作者本人在仓库有 2 次提交，其论文《一种时空可组合性的编程范式》草稿 8-13 与公开同日。

## 2026-08-14 范式对比补充（SUPP 追加）

阿里云云原生（王晨/望宸）从工程范式对比视角解读 DSH，提供库内零覆盖的分析框架：与 LangChain 范式的"双层不透明"诊断、与 Pi Agent 的"手术刀 vs 手术台"对比、Bundle→Profile→Patch→Overlay 四层叠加模型、能力接缝（Capability Seam）概念。

### LangChain 范式 vs DSH 范式：双层不透明诊断

LangChain（及 LlamaIndex/AutoGen/CrewAI）设计目标=降低 Agent 开发复杂度：向上封装，提供 Chain/Agent/Tool/Memory/Retriever 高度抽象，把 Prompt 拼装、工具调度、状态管理包进框架、藏起运行时细节。代价是**模型黑盒 + 框架黑盒 = 双层不透明**：模型决策过程（为何选这工具/为何这段推理/为何这步失败）本身缺乏透明性，LangChain 的封装再叠一层框架黑盒（Agent 循环、工具编排、Memory、Prompt 组装、重试、中间件藏在内部），出问题（幻觉/死循环/工具混乱/成本暴涨）要穿过多层抽象才能碰到真实数据流。DSH 的解法=一切皆插件+日志作为唯一真相源：模型看到的每段内容、工具调用与结果、上下文注入、循环决策都记录在可回放事件流里，插件边界清晰、换掉或拦截某一层影响可控可观察，"杜绝框架替你做决定却不告诉你"。代价是开发门槛更高（需理解更多底层细节），换来框架层行为尽量看清、针对性地做效果和成本优化。

### Pi Agent 对比：手术刀 vs 手术台

Pi Agent（pi-mono）=最小化终端 Coding Harness：极简核心（Read/Write/Edit/Bash 四工具+极短系统提示），TypeScript 扩展/Skills/Packages 按需加载，树状 Session、高缓存友好，Composio 评测中同模型换 Pi 成功率和成本领先。哲学="最小核心+按需扩展"，适合终端工作流。DSH 走得更彻底：不仅工具可扩展，循环/会话/沙箱/UI/调度本身都是插件，Web UI+多运行模式（标准/极简/创造/PTC）+更完整 Session 事件流，面向更广泛的 Agent 基础设施而非仅终端 Coding。**Pi 像精巧的手术刀，DSH 像可自由重组的手术台与器械库。**

### 四层叠加模型与能力接缝

插件不是简单平铺而是分层叠加成插件树：**Bundle（组合包）层**（npm 包+ cordis.patch.yml 声明挂载插件行；dsh-base/dsh-web-app/dsh-headless 官方示例）→ **Profile（配置档案）层**（~/.dsh/profiles/<name>，"具名组装方案"，列出 Bundle 列表+自己的 cordis.patch.yml）→ **用户 Patch 层**（Profile 级优先于 Home 级 $DSH_HOME/cordis.patch.yml）→ **命令行 Overlay 层**（--patch 最高优先级，按参数顺序生效）。叠加顺序：Bundle（按 Profile 列表顺序）→ Profile patch → Home patch → --patch。`dsh --profile web --dump-config` 可查看实际启动完整配置树，任意一行可按 id 整段替换。**能力接缝（Capability Seam）**：每个可替换能力由"接口定义+Provider 实现+Consumer 使用"三部分组成，换 Provider 影响整条相关链路。

### 插件开发与调优入口

插件三形式（函数/对象/类继承 Service），模板：`export const name` + 可选 `export const inject = ['tools']` 声明依赖 + `export function apply(ctx)` 注册（ctx.tools.register 等），注册一切可逆、卸载自动清理。贡献方式：写可安装 Bundle（package.json 声明 "dsh": {"bundle": {"patch": "./cordis.patch.yml"}} + cordis.patch.yml + TypeScript apply(ctx) 模块，发布 npm+GitHub dsh-plugin 话题）或直接贡献官方仓库（CONTRIBUTING.md/docs/cookbook）。调优入口：效果（独立替换循环策略/上下文注入/工具执行流水线/沙箱；极简模式跑基准；创造模式内存试验；轨迹回放看失败原因）；成本（Session 日志暴露 token 消耗来源、针对缓存友好调整 Prompt 组装和工具 Schema 排序、换轻量循环/工具集、Provider 级优化）；持续迭代（插件可逆热替换，像调参一样调架构）。

## 2026-08-14 源码级机制拆解（SUPP 追加）

腾讯技术工程（chino，腾讯 WXG 工程师）源码级拆解 Cordis 运行时机制——Fiber 生命周期、effect 撤销栈、Proxy 服务解析、遮蔽算法、Code Mode 隔离选型、Preset 两层 scope 链，全部为库内零覆盖的机制级内容（Fiber/disposables/遮蔽算法/worker_threads/时间可组合性/ToolLayer/PresetTree/turn-stopping 均无命中）。

### Fiber 与 effect：可逆副作用的地基

Cordis 是 Shigma 的通用插件框架（Meta-Framework for Modern JS Applications），与 agent/LLM 无直接关系，此前已支撑 Koishi 聊天机器人生态（QQ/Discord/Telegram/微信插件热插拔场景与 agent 几乎相同）。DSH 将 Cordis 源码 vendor 进仓库改名 @deepseek-ai/cordis，每个自研包设成 peer dependency——整个产品构建在 cordis 之上。对比：传统 DI 容器有缺口（bind 了没人负责 unbind/cleanup、无依赖驱动重载、配置启动时读一次）；Pi 的 Extension 无依赖注入/无插件间依赖管理（加载顺序即优先级）/不能卸载；Cordis 插件是带依赖声明、生命周期、可逆副作用的组件。

**Fiber = 插件实例生命周期状态机，六状态：PENDING/LOADING/ACTIVE/FAILED/DISPOSED/UNLOADING**。插件声明 inject 依赖，Fiber 停在 PENDING 直到服务在依赖链出现才 ACTIVE（Cordis 自实现依赖解析，无需手写轮询）。**effect 机制**：插件注册的任何东西（事件监听/服务/定时器/子插件）都通过 ctx.effect() 登记，回调立即执行、返回撤销函数推进 disposables 列表；卸载时 `disposables.splice(0).reverse().forEach(dispose => dispose())` 按 LIFO 逆序撤销（类似退栈）。子 Fiber 的销毁函数挂在父 Fiber 的 effect 上（插件本身 = 父 fiber 上的一个 effect），子组件逆 prepend 到父上下文累加器形成递归结构（论文称 twisted composition 𝜕²Γ）——卸载插件连带拆净子插件，无需单独清理表。可靠性细节：幂等（dispose 首次置 armed=false 后再调用直接返回）+ 中断（迭代器型 callback 每步查 guard）。Cordis 设计论文定义**时间可组合性**（卸载时组件对共享环境的修改必须完整安全逆转——追踪每次资源分配/事件注册/状态变更）与**空间可组合性**（依赖变化时组件自动激活/停用）；论文把"自进化 Agent Harness"列为两大动机之一（未来 harness 持续服务时生成并部署对自己组件的修改，无时间可组合性则每次自修改都迫使完整重启且坏的自修改可能废掉恢复进程）——对比 VSCode 扩展宿主无法卸载单个扩展必须重启整个宿主。

**四条约束保证 effect 被执行**：①API 入口唯一（ctx 上每个操作内部都是 effect 封装）；②Context 是 Proxy（`new Proxy(this, ReflectService.handler)`，属性 get/set 全走代理，反应性 coeffect+interception 来源）；③生命周期状态机（ctx.effect() 第一行 assertActive()，已卸载 fiber 上创建 effect 抛 INACTIVE_EFFECT）；④事务性 HMR（import 失败时 backup/restore 整体回滚）。**系统边界**：边界内（inside）系统独占修改且可恢复，记录在 Γ；边界外（outside）表现为 idΓ 不追踪不恢复——按位置划分与介质无关（私有 scratch 文件/本系统内存=边界内；公共文件/别进程写的东西=边界外）。获取/发射两阶段：open/malloc/fork 在边界内可逆，write/send 数据离开系统在边界外不可逆（恢复靠 withholding 暂缓发射或 compensation 补偿，补偿按 LIFO 组合但元理论不保证）。**coeffect 物化外部位置移动边界**=工程上的服务抽象（ctx.database/ctx.assets 不直接接触连接/句柄/子进程，资源生命周期关进服务自己的 effect）。逆的正确性标准=**观察等价**（两个状态相关当没有任何观察者能区分，比较行为而非表示）；运行时保证"逆会被调用"（结构性）不保证"逆写得对"（语义性，作者义务）。TS/JS 落地最直接：原型系统动态调整类型结构、Proxy 动态路由、Module Augmentation 动态改全局 Context 类型、程序化模块注册表可卸载回收。

### ctx.\<service\> 解析：Proxy + Fiber 链

根上下文包 Proxy（ReflectService.handler），访问 ctx.tools/ctx.llm 走 get 陷阱：自身属性走 Reflect.get，未知名先查注册过的访问器，没有则沿 Fiber 链向上（`fiber.store?.[prop]` → inject 里则抛 'service not active' → 无 runtime 抛 'unknown service' → 父 Fiber）直到找到提供者或确认没人提供。服务发布=Service 基类构造时 ctx.reflect.provide()（包在 ctx.fiber.effect 里，store 塞记录+唤醒依赖方，撤销函数摘记录再通知）——**系统里没有专门的"服务注册中心"类**。作用域隔离天然：子 Fiber 看得到父 Fiber 服务，反过来不行；挂到对应层级 Fiber 即可限定服务范围。真实场景："llm"服务接口只规定流式调用/重试，两个互不知道对方的实现插件并存——dsh-llm-deepseek（自家）+ dsh-llm-pi-ai（包第三方 @earendil-works/pi-ai 做多厂商协议转换，近 40 家厂商大部分由它支持；此 pi 与 Pi agent harness 撞名无关），换实现上层 loop 不用改一行——官方称"设计验证双胞胎"（两套独立实现满足同一接口定义证明接口通用）。

### Agent Loop 细节与 Preset 两层 scope 链

Loop 五处细节：①轮次结束条件多来源（工具结果可带 concludesTurn: true 标记声明"该停"，不等模型说"好了"）；②max-tokens 状态粘性（某 step 因输出上限截断后，后续正常完成也不覆盖结束原因——上层"这轮被截断过"信号不丢）；③轮次关闭前广播 agent/turn-stopping 事件可被插件截住（插件 agent.steer() 塞新消息轮次继续，默认才真结束——收尾从 loop 内部移到外部）；④工具调度每次实际调用前问工具能否并行（executionMode 动态判定 isConcurrencySafe(exec.arguments)，同一工具不同参数不同答案；并行组混进当下互斥调用则截断该组；结果按模型原始顺序提交）；⑤工具执行前后检查独立可插拔（tools/pre-execute waterfall 事件可拦截审批 → 内置防护检查 → 调用工具体 → tools/post-execute 二次处理，四段固定顺序独立注册）。

**Preset 两层 scope 链**：全局→预设是真实上下文派生（createScope() 调 ctx.plugin(scope) 拿 Fiber + ctx.extend 在 Cordis 上下文树真实建节点）；预设→会话用 **WeakMap 记"逻辑上级"关系**（bindScopeParent，不在 Fiber 树开节点）——标准挂载实例只建一次（ensureStanding()），多会话复用同一份实例、子 agent 继承父预设只是表上查找加绑定（同步不重挂载）。会话当前 preset 判定=倒扫事件日志找最新 agent-preset/selected（无则回退 session.header.agentPreset）——会话中途换 preset 架构允许。预设发现只认命名规则匹配且有 agent.cordis.yml 的子目录，损坏条目标记不中断；多根目录同名按先出现者优先。

### Code Mode 隔离：worker_threads（vs Codex V8 isolate）

DSH 用 node:worker_threads 跑模型写的编排代码：node:vm 同进程沙箱原型链可逃逸、热循环无法外部打断，被认为不可靠；独立工作线程代价是每次开新线程，换来独立 V8 堆 + 可外部强制终止。代码先 stripTypeScriptTypes（前后缀撑住位置保证行列号不变），塞进动态构造的 AsyncFunction（工具命名空间/错误类/替换 console 全部形参化，支持顶层 await 和 return 值）；资源上限 resourceLimits.maxOldGenerationSizeMb + 两道独立超时（事件循环利用率轮询 CPU 时间 + setTimeout 兜底），任意触发强制中断。工具调用走消息通道（{type:'call',global:'tools',...} / {type:'reply'}）不直接引用函数，宿主侧当作正常工具调用推进 pre-execute/防护/dispatch/post-execute 流水线——与模型结构化调用共用同一执行内核只入口不同；Object.hasOwn() 精确判断 + Object.create(null) 起手防 __proto__/constructor 绕过原型链；代码注释明写"把 worker 当成敌对的另一方"。Codex 差异：独立 V8 isolate 全局 tools 对象，权衡每次新建 isolate vs 每次开工作线程的开销。

### 工具注册分层遮蔽算法 + 与 Codex 工程决策对比

每个作用域维护 ToolLayer（按名索引表），view() 决定可见工具：①全局层工具为基础 → ②每层祖先 scope 依次覆盖同名条目（越近优先级越高，只处理继承部分）→ ③限制规则（preset 禁掉的工具）筛一遍 → ④**当前 scope 自己直接注册的工具覆盖所有继承同名条目（即使限制规则禁用了它）**——自己注册 > 继承 > 限制规则。run_code 名字硬编码保留（任何插件不能注册/覆盖，防 preset 挂载后与 Code Mode 入口冲突）；注册走 effect()（撤销函数进 Fiber disposables，卸载自动摘工具）。Code Mode 代码调用也进同一 TOOL_RUNTIME_SCHEDULER 队列共享并发控制与前检查。

**与 Codex 五差异**：①核心循环可替换性——Codex 循环固定在核心无法独立替换，DSH 的 ReactLoopAgent 注册为工厂理论上可换（目前只有一个实现、工厂只允许注册一次）；②沙箱位置——Codex 把 bwrap/Landlock/Seatbelt 编译进核心执行路径，DSH 把沙箱做成能力插件（Linux 经独立原生 Node 扩展调 Landlock，走同一服务注册路径可换）；③代码规模——Codex ~上百 Rust crate 服务同一不可替换核心循环，DSH 两百多 TS 包（含循环本身）都在同一可替换层级无特殊模块；④代码编排隔离——Codex V8 isolate vs DSH worker_threads（独立得出同一功能判断）；⑤工具暴露粒度——Codex 的 DIRECT/DEFERRED/CODE_MODE/Hidden 是工具静态自声明，DSH 可见性运行时按 scope 链实时计算（同工具不同会话可见性不同）。

**DSH 生态盘点**（写作时 #dsh-plugin topic 1008 仓库）：精选索引（awesome-dsh-plugin 256⭐/awesome-dsh-plugins 507⭐/awesome-deepseek-harness 227⭐/dsh-handbook 74⭐）；Web UI 增强（dsh-web-ui 922⭐/DSH-better-sidebar 371⭐）；视觉多模态（modlens 857⭐ 首个视觉插件/ dsh-vision-toolkit 232⭐）；终端桌面（dsh-TUI 487⭐/dsh-launcher/dsh-desktop）；记忆上下文（dsh-memory-evolve 24⭐ 跨会话长期记忆/dsh-turn-rewind）；多 Agent 工作流（dsh-agent-teams 142⭐/dsh_workflow）；通讯通知（dsh-lark-bot 飞书/QQ/Telegram 机器人/dsh-notification）；开发配套（dsh-genui/dsh-at-file Codex 风格 @file 引用/plugin-registry）。展望：Koishi 插件机器人路径在 DSH 重演（底层自带 agent loop），webui 即插件意味着产品形态可热更新，DSH 有潜力成"Agent 界的 VSCode"（生态插件数/真实场景/使用复杂度包装三条件）。

## 实践启示
1. **Harness 是独立的产品维度** — Model + Harness = Agent，控制层不是模型的附属品
2. **选型要看真实代码库表现** — CORE-Bench / Terminal Bench 数据，同模型不同 Harness 差距可达 53pp
3. **长时运行能力是分水岭** — 能跑几小时的 Agent 才是真正的工程代理，否则仍是代码助手
4. **中国市场特殊窗口** — Anthropic 禁令创造的需求缺口，有技术能力的团队可以填补

## 第 6 来源 — DeepSeek Harness 拆解：一套能拼装的 Agent 架构（2026-08-15 入库，vxc=64）

来自阿里云云原生（WeChat 通道）的 DeepSeek Harness 架构拆解文，将 Harness 拆解为可拼装的模块体系。

互补角度：
1. **模块化拼装视角** — Harness 不是单块系统，而是可独立替换的组件集合（上下文管理、工具调度、记忆、执行循环各自成模块）
2. **架构层拆解** — 从 Agent 运行时到 Harness 控制面的分层关系，与前 5 来源的「Model + Harness = Agent」公式互相印证
3. **拼装 vs 一体化的取舍** — 讨论模块化带来的配置复杂度与灵活性的权衡

## 第 7 来源 — DeepSeek Harness：今年最有野心的一次 Agent 开源（2026-08-15 入库，vxc=56）

夕小瑶科技说对 DeepSeek Harness 开源的报道，强调其开源策略在 Agent 基础设施领域的野心。

互补角度：
1. **开源策略信号** — DeepSeek 将 Harness 定位为开放生态组件，而非封闭产品
2. **生态对比** — 与 Claude Code / Codex 等闭源 Harness 的竞争格局分析

## 第 8 来源 — DeepSeek Harness 实测：模型之外的那一半（2026-08-15 入库，vxc=48）

腾讯技术工程（元宝产品中心）在 DeepSeek-V4-Pro 上线当天对开源的 DeepSeek Harness 进行本机实测：跑通 npm、Web、Headless、Python SDK 四通道，拆解默认配置与 session log，并用 Kimi K3 对照 DSH 与 Kimi Code、让 V4 Pro 连续执行带视觉产物的复杂任务。

互补角度：
1. **实测视角补位** — 前 7 来源以架构拆解/生态分析为主，本文提供真实的四通道运行验证：runtime 已很开放，默认产品体验仍带预览版毛边，未追上 Claude Code / Codex / Kimi Code
2. **Trajectory 价值定位** — 社区称其为「Agent 的 DevTools」：时间轴/每轮请求/日志可见，查上下文压缩、Skill 过多、模型犯错时有用；实现上直接从 session event log 投影，不另埋监控数据，轨迹更接近模型真实输入
3. **Plugin/Preset 分工澄清** — 插件提供新能力、Preset 决定某类 Agent 能看见哪些能力；生产价值落在「删掉什么、替换什么」——Data Agent 只保留 read/edit/write 并用 sqlcmd 替换 bash，模型围着数据库执行结果转
4. **长任务与账单数据** — Adam Platin 用内测版管理机器学习竞赛 89 步收尾；微信接入从需求到真机回复约 87.6 分钟、花费约 18 元，含 SDK 调研/零依赖客户端/mock server/真实端点冒烟
5. **完成度不对称结论** — DSH 同时是「成熟 coding agent」与「可继续开发 Agent 的平台」两个身份，runtime 开放度与默认产品完成度不对称，一切皆插件的理念 + Trajectory 源码设计口碑最好

## 第 9 来源 — AgentLoop 三维确定性评测（千问AI平台，2026-08-19 入库，vxc=63）

千问AI平台（阿里官方）基于阿里云 AgentLoop 平台对 DeepSeek Harness + Qwen3.7 Plus 做 terminal-bench 2.1（10 任务子集）实测。前 8 来源以架构拆解/生态分析/四通道实测为主，本文提供**库内零覆盖的评测方法论 + 量化数据**。

互补角度：
1. **三维确定性评估方法论** — 采信程序化 verifier（容器终态判定）基础上，构建 3 个正交确定性评估器：Outcome（任务完成度，原样采信 verifier reward，超时/边缘任务 0.50 封顶体现"时限即约束"）/ Compliance（红线规则判定）/ Process（执行过程可靠性，从 Session Log 事件流提取）。全部规则化脚本实现，从机制上排除 LLM 打分方差与宽松偏差
2. **Agent-As-Judge 阅卷类比** — Agent 评估抽象为考试判卷：task=题目、Trajectory=解题步骤、交付物=答卷、评估器=判题人；Code-As-Judge 对应机器批客观题、Agent/LLM-As-Judge 对应人工批主观题；"高考大题有过程分"说明复杂任务执行有迹可循（Trajectory 评估的意义）。评估器本身是"评估任务"执行者（"弟子不必不如师"），可用更小更便宜模型
3. **一手量化结果** — DSH 通过 8/10 任务（通过率 80%）；失败 extract-elf（outcome 0.1917，6 产物仅写出 2）与 chess-best-move（0.2）；2 项 verifier 通过但 outcome 0.50 封顶（qemu-startup/hf-model-inference 超时）；三维平均 outcome 0.74 / compliance 0.98 / process 0.83
4. **AgentLoop 接入链路** — LoongSuite Pilot 非侵入注入 `$DSH_HOME/cordis.patch.yml`（Cordis 微内核插件机制直接应用），Session Log 事件流投影为 OpenTelemetry GenAI trace；评测器以 AGENT+Skill 形态挂载，评分与轨迹同源可审计
5. **评测学理补充** — 评测结论度量"Harness+模型"组合能力（模型无关性）、Session Log 事件溯源保证过程性评估证据基础、极简模式提供受控可复现能力面

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/coding-agent-practice.md)

---

