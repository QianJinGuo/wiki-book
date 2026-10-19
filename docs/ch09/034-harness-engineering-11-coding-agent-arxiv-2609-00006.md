# Harness Engineering 源码研究：11 个 Coding Agent 的解剖（arXiv:2609.00006）

> 📊 Level ⭐⭐⭐ | 9.7KB

## Harness Engineering 源码研究：11 个 Coding Agent 解剖

2026-07-15 上 arXiv 的 83 页论文《Harness Engineering: Anatomy, Architecture, and Evolution of Coding Agents》（arXiv:2609.00006）：作者**逐行分析了 11 个 Coding Agent 的源码**——Claude Code、Codex CLI、Gemini CLI、Mistral Vibe、OpenHands、Aider、Mini-SWE-Agent、Hermes、Pi、OpenCode、OpenClaw，以 Omnigent 为 meta-harness 对照，产出 13 条横向观察、29 个复用模式、18 条设计建议和一个约 90 行的最小 Harness 骨架。研究边界：对 Claude Code 的分析来自 2026 年 3 月源码快照，非当前闭源实现的完整审计。

## 七个责任边界

论文把 Harness 拆成七块，强调它们**不是功能菜单而是运行时的责任边界**：Agent 循环（下一步怎么推进、何时停）/ 模型接入（协议、流式、缓存、错误）/ 工具与动作（读写执行、结果回传）/ 记忆与上下文（本轮看什么、历史怎么压、什么跨会话留存）/ 安全与权限（动作准入、执行环境边界）/ 编排（子 Agent 分工与汇总）/ 扩展（Skills、MCP、Hooks、插件、客户端协议）。

七块接成的运行链路：**Goal → Context → Decide → Act → Observe → Verify → State → Next**。Planner、MCP、Memory、Reflection 只有放进这条链里边界才清楚，否则"每个词都懂，系统还是跑不稳"。

## 循环很短，责任在循环外面

最小循环（组装输入→调模型→执行工具→返回观察→再调模型）本身不神秘，差异在循环外：状态、并发、取消、恢复和验证的处理方式：
- **Mini-SWE-Agent**：线性循环 + 一个 shell 工具，最小骨架（研究取向）。
- **OpenHands**：执行过程写成持久事件日志，围绕会话/分支/回放组织状态；工具调用按资源加锁——两个读操作未必互斥，写同一文件的要排队。
- **Claude Code**：按工具是否适合并发分批，读取和搜索可并行（源码快照节选）。

## 方法论定位：源码研究不是排行榜

论文不是同一模型/同一任务/同一环境下的性能对照实验，引用的基准成绩模型、日期、环境各异，不能排座次。合适的读法是看**每个系统在替模型承担什么责任**——Agent 之间的很多差异已经落在模型之外的 Harness 上。这与本库 [Agent Harness Engineering: A Survey](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-engineering-survey-2026.md)（CMU/Amazon 系，2026-05）是**两篇不同的综述**：前者是学术框架综述，本篇是源码级逐系统解剖，且时间晚两个月、覆盖了 Claude Code 快照。

## 深度分析

### 循环之外的状态机才是工程难点

论文样本里最简与最繁的系统形成了清晰的两极：Mini-SWE-Agent 用一个线性循环加一个 shell 工具就跑通了修代码的任务，而 OpenHands 把执行过程写成持久事件日志，围绕会话、分支、回放组织状态，并按资源对工具调用加锁——读操作可以并行，写同一文件必须排队。Codex CLI 则更像异步状态机，把会话、模型流式事件、工具执行和对外事件读取分开处理。三种形态说明：循环本身五步就写完了，取消、超时、重试、恢复、预算这些真正决定可用性的机制全在循环外面。循环复杂不代表 Agent 强，循环简单也不代表系统弱，该记录的有没有留下、该拦住的有没有拦住才是分水岭。

### 工具契约的本质是"失败可恢复"

论文中一个容易被忽略的观察是：工具定义本身占上下文，工具越多选择负担越重、误选空间越大。更关键的是工具失败时模型拿到什么。以编辑工具为例，"旧文本/新文本唯一匹配"契约很硬——匹配不到或多处匹配都拒绝，但模型能得到明确信号去重读文件；模糊匹配提高表面成功率，却在两个相似片段并存时说不清到底改了哪里。Harness 至少要区分三组状态：搜索无结果 vs 输出被截断、命令退出失败 vs 命令仍在运行、编辑未定位 vs 已写入但测试失败。模型下一轮是重读、重试、等待还是交给人，完全取决于这些状态能否被准确表达。

### 压缩是状态保存，事件日志是另一本账

压缩的正确问法不是"怎么把记录写短"，而是"下一轮继续执行最少要保留哪些状态"。原文的 CSV 导出例子很直观：压缩后只剩一句"正在实现导出"，筛选条件和分页约束就丢了。各系统的做法各有侧重——Aider 保最近原文、旧历史交模型总结；OpenHands 把压缩请求和结果本身也写进事件记录，事后能追查是模型没用上还是压缩漏了；OpenCode 按目标/细节/状态/下一步/相关文件结构化合并；Hermes 用父子会话关联压缩前后。核心区分是：上下文服务下一轮推理，事件记录服务恢复、回放和审计——模型本轮看不到的日志不等于没用。长期记忆同理，该定义为"可复用的线索"而非"说过的话"，否则过期前提会被后续任务反复继承。

### 权限、沙箱、取消是四个独立问题

用户点"同意"只是授权层：这次动作允不允许发生。动作允许之后能触达哪些资源（文件、网络、子进程）是隔离层；已经发生的副作用有没有留证据是记录层；重试时会不会重复执行有副作用的动作是恢复层。论文样本中 Codex 在跨平台沙箱投入很重，Claude Code 有可选 OS 级沙箱，OpenHands 借工作空间和执行后端——代码量和隔离强度并不可画等号。取消语义也要落到这四层上问：模型请求停了工具停了吗？工具停了子进程停了吗？父 Agent 停了子 Agent 还在跑吗？"界面显示停了"和"系统真的停了"之间不能靠感觉。

### 扩展接口分属三个抽屉，平台化是趋势

Skills、MCP、ACP 都被叫"扩展"但接入对象不同：Skills 是过程资产（任务步骤、规则、脚本，样本采用率 9/11 还高于 MCP 的 8/11），MCP 是工具与数据服务的连接协议，ACP 偏客户端/宿主接口并已开始承载 harness hosting——一套系统经适配器托管另一套 Harness。当一个 CLI 开始提供 SDK、HTTP 服务、会话接口和技能市场，Harness 就从"模型外面的一层壳"变成可嵌入、可扩展、可治理的平台运行时。值得注意的是样本中两个"缺席"：没有通用 Agent 框架进入运行时，也没有向量嵌入检索代码——跑起来的系统靠的是 ripgrep、glob、tree-sitter、RepoMap 这类确定性结构信号。

## 实践启示

1. **先把事件记录补齐再谈架构**：模型输入、工具参数、工具结果、文件变更、测试结果、结束原因都要可查。没有事件日志，失败后只能靠聊天记录猜；有了它，排障、回放、审计才有依据。
2. **给每个工具写清楚失败契约**：编辑工具要定义定位方式、拒绝歧义、报告失败的格式；命令工具要区分运行中/超时/退出失败/输出截断。工具的价值不在数量而在模型失败后能否自恢复。
3. **压缩时保结构不保篇幅**：摘要必须保留目标、约束、已改文件、验证结果、当前卡点和下一步；完整事件记录另行保存，压缩不能销毁唯一证据。
4. **权限设计拆成授权/隔离/记录/恢复四层**：用户确认只是第一层；有副作用的操作在恢复时禁止盲目重试；取消要级联到子进程和子 Agent。
5. **多 Agent 先切边界再谈并行**：子任务定义要窄到可验收（如"检查导出接口支持哪些筛选参数，返回文件位置与参数定义，暂不修改代码"）；调查阶段只给读权限，实施阶段再放开写权限；单 Agent 的状态、权限、验证没理清之前，拆多 Agent 只会放大混乱。

## 相关实体

- [Agent Harness Engineering Survey](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-engineering-survey-2026.md)
- [Agent Harness 架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture.md)——若飞同作者更早的运行链拆解（7 层视角），本篇是论文转述版
- [微软 M⋆ + 谷歌 AutoHarness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/two-harness-papers-microsoft-google.md)
- [Harness 7 层框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-7-layers-openclaw-hermes-claude-code-p1anu.md)

→ [原文存档](https://mp.weixin.qq.com/s/HK1qFKZTsMzMg_c6YIn-jw)

---

