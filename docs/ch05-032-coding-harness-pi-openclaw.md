# Coding Harness 工程本质：从 Pi 到 OpenClaw

## Ch05.032 Coding Harness 工程本质：从 Pi 到 OpenClaw

> 📊 Level ⭐⭐ | 15.9KB | `entities/pi-openclaw-coding-harness.md`

## 核心定义
Coding harness 是模型从"建议你怎么修"走到"自己去修"所必须的那套工程外壳。Pi 在 coding-agent README 里把自己称为 minimal terminal coding harness——它先给模型一组很小的身体能力：read、write、edit、bash。再往外，才是 session、context files、compaction、skills、extensions、TUI、RPC、SDK。
**Pi 这个顺序把 Agent 的底层工程暴露得很清楚：能力不会从概念里自动长出来，它靠一层层工程边界托住。**

## Pi 分层架构
```
Provider API -> agent loop -> coding tools
-> session / context / compaction
-> terminal UI / RPC / SDK
```
packages 分层：

- `packages/ai`：多 provider 的 LLM API 适配层
- `packages/agent`：通用 agent runtime，处理 tool calling、state、event streaming
- `packages/coding-agent`：终端 coding harness，也就是 pi
- `packages/tui` / `packages/web-ui`：界面层

## Harness 补齐的八个能力
让模型从建议走向行动，至少要补齐：
1. 读取项目
2. 修改文件
3. 执行命令
4. 把工具结果送回模型
5. 保存行动轨迹
6. 裁剪上下文
7. 拦截风险动作
8. 用真实证据判断完成状态

## 五个可复用的工程模式
### 1. Context 像投影，不像容器
Session 可以很丰富，但模型每轮看到的应该是一份经过治理的 projection。三类状态分开：给模型看的、给用户界面看的、只给审计和恢复看的。

### 2. Transcript 是账本，working context 是视图
Pi 的 session JSONL 记录行动轨迹和分支历史，compaction 也只是新增摘要 entry，不删除旧消息。
```
durable history: 完整行动轨迹
working context: 当前模型可见材料
summary: 二者之间的压缩视图
```
**两层都要保留：只保留完整历史，模型会被旧日志拖垮；只保留摘要，摘要一错就没证据可查。**

### 3. 权限要进运行时管线
Pi 的 beforeToolCall / afterToolCall 给工具执行前后留出边界：

- `beforeToolCall`：发生在工具实际执行前，适合做参数、路径、权限、风险动作检查
- `afterToolCall`：发生在工具结果返回后，适合做审计、截断、结构化补充和错误标记
OpenClaw 继续往前走：按 owner-only、agent 配置、provider、group/channel、sender、sandbox、sub-agent 等规则算出 effective tool policy，再把最终可用工具通过 customTools 注入 Pi。

### 4. Runtime kernel 小，产品 control plane 厚
Pi 没有把所有时髦能力都塞进核心。核心主要负责模型、loop、工具调用、状态、事件和 session。
OpenClaw 展示了另一半年：长期运行的个人助理系统会长出 Gateway、通道接入、pairing、Control UI、auth profile 管理、usage 展示、sandbox、队列、fallback、cron、webhook。
**Pi 负责内核语义，OpenClaw 负责产品世界。**

### 5. 失败路径和证据链一起设计
Pi 工具没有假设一切顺利：

- read 会截断并提示续读 offset
- bash 保留完整输出路径、支持 timeout 和 abort
- edit 会因为 oldText 不唯一或重叠而拒绝修改
OpenClaw 处理 provider fallback、auth profile 管理、idle timeout、context overflow、tool result truncation、trajectory 记录和 compaction 超时。

## Pi → OpenClaw 的演进
| 维度 | Pi | OpenClaw |
|------|-----|---------|
| 定位 | Runtime kernel | Product control plane |
| session | JSONL transcript | JSONL + sessions.json（两层状态） |
| 工具策略 | 内置 | 动态化（按 agent/provider/channel/sender 规则计算） |
| context builder | 基础 | 进入运行时层面 |
| 通道 | TUI 本地 | IM/移动/Canvas/cron/webhook |

### session 需要两层状态
Pi 的 transcript 是 JSONL，适合记录对话和工具轨迹。OpenClaw 还维护 sessions.json，用 sessionKey -> sessionId 管不同通道、群组、cron、hook、sub-agent 的路由和当前会话。

- transcript 记录发生了什么
- session store 记录消息该进入哪条轨道

### 工具策略需要动态化
OpenClaw 会根据 agent、provider、group/channel、sender、sandbox、owner-only 规则算出 effective tool policy，再把最终可用工具通过 customTools 统一注入 Pi。

## 稳定路线
自己搭 Agent，不用一次做成 Pi。比较稳的路线是：
1. **先做只读 Agent**：接模型 provider，写最小 loop，提供 read、grep、find、ls，重点放在工具 schema、上下文组装和结果截断
2. **再加精确修改**：提供 edit，用小块 replacement，返回 diff，保证路径限制和 diff 可见
3. **然后加命令执行**：提供 bash，带 cwd、timeout、输出截断、abort，让 Agent 形成"改完跑测试，失败再修"的闭环
4. **尽早做 event log**：不要只存 messages，工具调用、工具结果、模型变化、文件修改、人工插话都应该能回放
5. **再做 context builder 和 compaction**：把 durable history 和 working context 分开
6. **最后再上 skills、extensions、MCP、memory**

## Harness 会被模型内化吗
一部分会：认知策略层可以被模型学进去（"先读文件再改"、"改完跑测试"）。
模型内化不了的部分（也不应该交给模型内化）：

- 文件系统在哪里
- 当前用户是谁
- 哪些路径不能碰
- 哪条消息来自群聊
- 谁有 owner 权限
- 工具结果怎么截断
- session 怎么恢复
- 成本怎么记
**如果把 harness 理解成一堆提示词和流程模板，它会被模型吸收一部分；如果把 harness 理解成模型进入真实任务后的运行时秩序，它只会越来越重要。prompt scaffolding 会变薄，runtime harness 会变硬。**

## 深度分析
### 工程的北极是运行时语义，不是提示词
Coding harness 的核心价值不在于给模型多少提示词，而在于建立一套运行时语义秩序。Pi 的分层结构揭示了一个关键洞察：能力不是从概念里长出来的，是靠工程边界托出来的。这和软件开发中的关注点分离原则一脉相承——每一层只管一件事，层与层之间通过定义清晰的接口衔接。当我们把 agent 的工程和模型的认知混为一谈时，就会误以为"只要提示词足够好，模型就能自动完成任务"。现实是，即使模型的认知策略再好，它仍然需要一个运行时环境来执行：读哪个文件、改哪块内容、跑什么命令、向谁汇报结果——这些全是运行时语义，不是认知问题。

### Pi → OpenClaw 揭示的不仅是演进，是架构类型分裂
Pi 和 OpenClaw 的关系通常被描述为"演进"，但更精确的说法是"架构类型分裂"。Pi 代表的是 runtime kernel 类型：只做 agent loop、tool calling、session transcript、context projection，追求的是语义完备和可审计。OpenClaw 代表的是 product control plane 类型：处理通道接入、auth profile、usage 计量、sandbox 隔离、pairing 管理，追求的是可用性、可靠性和产品化。两者不是在同一个维度上比谁功能更多，而是在回答不同层次的问题。kernel 类型问的是"模型能不能正确做事"，product 类型问的是"系统能不能长期稳定服务用户"。把这两者混在一起设计，是大多数 Agent 系统早期犯的错误。

### durable history 和 working context 的分离是认识论设计
Pi 的 session 设计把 transcript（完整行动轨迹）和 working context（模型当前看到的）分开，compaction 只新增摘要 entry 而不删除旧消息。这不只是一个存储策略问题，而是 Agent 系统的认识论设计。模型需要推理材料，但模型的上下文窗口有限；无限膨胀的历史日志会稀释关键信息，但过度压缩又会让摘要错误传播且无法回溯。两层分离的本质是承认模型在认知上的局限：它需要治理过的投影来做推理，同时也需要完整的证据链来验证推理是否正确。这和人类专家工作时"既看摘要报告，也保留原始资料"的行为模式是一致的。

### 权限进运行时管线是安全架构，不是功能特性
beforeToolCall / afterToolCall 不仅仅是 Pi 提供的两个钩子，而是代表了一种安全架构思路：权限检查必须在工具执行路径上，而不是在提示词里。OpenClaw 的 effective tool policy 动态计算则把这个思路推得更远——工具策略不再是在代码里硬编码的开关，而是根据 owner、agent、provider、channel、sender、sandbox 等多维规则实时计算出来的。这里的关键洞察是：权限不能靠模型自己判断，必须靠运行时管线强制执行。如果权限检查在提示词里，模型理论上可以绕过它；如果权限检查在运行时管线上，每一次工具调用都必须经过它，无法绕过。这是工程上的实质差异，不是形式上的差异。

### 模型内化的边界由外部性决定
文章列举了模型无法内化的部分：文件系统路径、当前用户身份、禁止访问的路径、群聊消息来源、owner 权限、结果截断方式、session 恢复机制、成本记录。仔细看这个清单，它们有一个共同特征：全是外部性信息。这些信息对任务执行有决定性影响，但它们本身不在模型的训练数据里，也不是模型能够自行获取的（除非运行时显式提供）。这给了一个更清晰的标准来判断什么该进 harness、什么可以留给模型：只要是外部性信息，就该进 harness；只有认知策略（先做什么后做什么、用什么方法试错）才可以留给模型自己去学。这意味着随着 Agent 系统覆盖的场景越来越广，需要进入运行时管线的外部性信息会越来越多，而不是越来越少。runtime harness 变厚不是技术债务，是系统能力扩展的必然结果。

## 实践启示
### 1. 用分层思维设计 Agent 工程，先跑通最小闭环
文章给出的稳路线不是随意排列的，而是按照依赖关系严格排序的。只读 Agent 验证的是"模型能不能理解项目结构"；加 edit 验证的是"模型能不能做精确改动"；加 bash 验证的是"模型能不能形成改-测-改的反馈闭环"。每一层都建立在前一层验证通过的基础上。如果跳过只读阶段直接做全功能 harness，大概率会在上下文治理和工具 schema 这两个基础问题上反复返工。花时间把最小闭环跑通，后续扩展反而更快。

### 2. 事件日志要在工具层面埋点，不要只在 message 层面记录
大多数 Agent 系统最初只记录 messages（对话回合），后来发现不够用才倒回来加工具调用和工具结果的日志。Pi 的设计是，一开始就把工具调用、工具结果、模型输出变化、文件修改、人工干预全都设计成可回放的事件。提前埋这个点成本很低（只是在工具执行前后加日志调用），但后期想加的时候才发现结构不对，改造成本极高。

### 3. durable history 和 working context 的分离要在早期做
这条建议的关键词是"早期"。当 transcript 还只有几百条记录的时候做分离，只需要定义好两层数据的边界和各自的更新规则。当 transcript 已经有几万条记录的时候再分离，就涉及历史数据迁移、摘要重算、工作流改造。Compaction 策略（什么时候做、做什么粒度的摘要）对 working context 的质量影响极大，这个决策越早固定越好。

### 4. Runtime kernel 要克制，Control plane 要完备
Pi 的 runtime kernel 不做技能管理、不做 extensions、不做 MCP、不做 memory——这些全都放在 harness 层甚至更外层。这个克制的设计让 kernel 的语义是稳定的：模型、loop、工具调用、状态、事件、session，理解成本低，出了问题好排查。OpenClaw 补了另一半：Gateway、pairing、Control UI、auth profile、usage 展示、sandbox、队列、fallback、cron、webhook。这些东西多而杂，但它们不该污染 kernel 的语义。实际工程中，这意味着如果你的团队在设计 Agent 系统，不要把所有功能都往 core agent 包里塞，先想清楚哪些是内核语义、哪些是产品功能。

### 5. 工具的失败路径要和证据链一起设计
Pi 的 read 截断时给 offset、edit 拒绝时说明原因（oldText 不唯一或重叠）、bash 支持 timeout 和 abort——这些不是防御性编程，是证据链设计。工具的每一次失败都是模型重新推理的机会，如果失败信息足够精确，模型可以就地修正而不需要从头再来。实际工程中很多工具只返回成功/失败两种状态，错误信息就是一句"操作失败"，这等于放弃了失败信息这个推理资源。工具的每一层失败都应该有对应的诊断信息返回给模型。

### 6. 判断一个新能力该放哪层：用外部性标准
当你在设计一个新的 Agent 能力时（比如一个新工具、一个新过滤规则、一个新上下文来源），先用外部性标准判断它该放在哪层：模型自己能学会的认知策略放提示词层；需要外部输入才能判断的信息放运行时层；需要产品化支持（多租户、计量、隔离）的能力放 control plane 层。这个判断标准比"功能大小"或"实现复杂度"更准确，能避免把本该在 runtime 的东西塞进 prompt，也避免把本该在 product 层的功能污染到 kernel。

## 相关
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/pi-openclaw-coding-harness.md)
## 相关实体
- Openclaw Prompt Context Harness
- [Harness Engineering 让 Coding Agent 可靠完成长程任务 V2](/ch04-071-harness-engineering-让-coding-agent-可靠完成长程任务/)
- [Harness Engineering Long Term Agent Tasks](/ch04-160-harness-engineering-让-coding-agent-可靠完成长程任务/)
- [Harness Engineering 7 Layers Openclaw Hermes Claude Code P1Anu](/ch05-014-harness-到底是什么-看看-openclaw-hermes-claude-code-的演绎吧/)
- [Agent Memory Architecture Ruofei](/ch04-111-agent-memory-架构解析/)

---

