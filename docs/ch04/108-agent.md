# Agent 上下文窗口管理对比

> 📊 Level ⭐⭐⭐ | 11.7KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/context-window-management.md`，一手来源仍见下方 sources。

## 机制与论文
- [Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-7-layers-openclaw-hermes-claude-code-p1anu.md) — 三框架演绎七层模型12857字rv9
- [AI Agent 架构设计（七）：Skills 系统设计（OpenClaw、Claude Code、Hermes Agent 对比）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-system-design-three-way-comparison.md) — 三框架skill系统设计对比
- Context Window Management Comparison — 四框架对比rv9
- [800行代码实现 Open Claw 的 Tool、消息总线、子Agent管理架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/open-claw-tool-bus-subagent-architecture.md) — 薄抽象显式控制流8802字rv9全版
- [TencentDB Agent Memory：符号化短期记忆+分层式长期记忆](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencentdb-agent-memory-hierarchical.md) — 8661字最全分层记忆版
- 深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践 — 三维度源码：23模块拼装+自适应分块+双层Memory
- How AI Agent Memory Works — 记忆五层+六架构权衡科普
- [Hermes Agent 为什么火了？和 OpenClaw 龙虾比一比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-vs-openclaw-comparison.md) — 爱马仕vs龙虾：控制面vs成长型定位对比
- [Agent 记忆架构：先别急着把 Memory 当数据库](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-architecture-past-influence-future-ruofei.md) — 记忆影响未来的治理
- [OpenClaw 与 Claude Code 的 Agent Loop 设计范式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-agent-loop-design-patterns.md) — 五级跃迁史+循环管控三硬约束5696字全版
- [AgentMemory 源码分析：给 Coding Agent 装上本地长期记忆](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentmemory-source-analysis-coding-agent-local-memory.md) — 源码级解析互补
- [800行代码实现 Open Claw 的 Tool、消息总线、子Agent管理架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/800行代码实现-open-claw-的-tool消息总线子agent管理架构.md) — agent核心组件实现
- [Claude Code 七层记忆架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-7-layer-memory-architecture.md) — 七层防御金字塔
- [Claude Code and What Comes Next](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-and-what-comes-next.md) — 压缩/Skills/Subagents
- [OpenClaw与Hermes源码架构对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-hermes-source-code-agent-architecture-review.md) — 双框架源码对比：OpenClaw四亮点+Hermes四补充

## 工程实践
- Claude Code Openclaw Memory Comparison — 记忆系统对比rv9
- [Claude Code Prompt 提示词体系源码解析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-prompt-source-analysis.md) — 六大prompt模块全版
- [MemOS Hermes 记忆插件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/memos-hermes-plugin.md) — MemOS插件：智能去重+混合检索7225字
- [扣子 3.0 多 Agent 协同实战：指挥所有 Agent 的 Agent + 5 人团队 6 步流水线](https://github.com/QianJinGuo/wiki-public/blob/main/entities/coze-3-multimagent-team-orchestration-wangheige.md) — 三案例实战报告
- Claude Code Openclaw Usage Ettin — Ettin rerank集成
- [Claude Code Agent Memory Systems — L0~L3 四层记忆方案](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-agent-memory-four-levels-analysis.md) — L0-L3演化
- [IMClaw：通过微信/飞书操控ClaudeCode/Codex/GeminiCLI/Pi Agent蜂群](https://github.com/QianJinGuo/wiki-public/blob/main/entities/imclaw通过微信飞书操控claude-code-coodex-gemini-clipi-agent蜂群.md) — ACP协议N+M解耦+网关架构6224字全版
- [阿里云 MSE AI 任务调度 + Agent Sandbox：动态休眠/唤醒 OpenClaw Agent 成本下降 90%+](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-mse-ai-task-scheduling-agent-sandbox-cost-90-percent.md) — 休眠唤醒短条borderline
- [Harness 工程 14 步路线图：从单 Agent 到自改进系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-14-step-roadmap.md) — 三层楼模型14步渐进构建

## 深度分析

### 四框架的三种设计哲学：harness 优先 / 纵深防御 / memory 优先

Pi、OpenClaw、Claude Code、Letta 在文件读取上呈现出三种截然不同的哲学站位。Pi 是纯粹的 harness 优先：读取有硬上限（2,000 行或 50KB，先到者胜），模型即使没有请求切片也会被强制截断，并附带明确的继续提示（`Use offset=2001 to continue`）——系统先保护，再教模型分页。Claude Code 在 harness 优先之上叠加了"可远程调参"的运营维度：读取前的 256KB stat 门禁、读取后的 25,000 token 预算、读取去重（同一范围重复读取且 mtime 未变时返回 stub），且全部行为可通过服务端 feature flag 调整。Letta 则是 memory 优先的极端反例：文件被解析、分块、嵌入向量库，上下文窗口只展示一个受管理的视图（字符上限随模型上下文分五档，8K→5,000 字符到 200K+→40,000 字符），可打开文件数按 LRU 驱逐策略扩展到最多 15 个。OpenClaw 居中：继承 Pi 的截断作为第一层，再对 bootstrap 文件叠加 75% 头部 / 25% 尾部的切分与独立预算（16,000 字符或窗口 30% 取较小），是典型的纵深防御。

### 压缩策略的差异才是长期运行 agent 的分水岭

文章最有判断力的观点是：文件管理上四框架趋同，但会话剪枝（compaction）的设计差异才真正决定长时间运行的 agent 是保持连贯还是慢慢退化。Pi 的触发点是 token 阈值（contextWindow - 16,384 reserve），保留尾部约 20,000 tokens，更早内容交给 LLM 总结成一条合成 user message。OpenClaw 在 Pi 之上叠加了两套机制：历史超过窗口 50% 时按 token 质量等分切块、丢弃最老块，被丢弃内容经分阶段多轮总结 + merge；更关键的是"压缩前 flush"——一个静默 agentic turn 让 agent 在历史消失前把状态持久化到 memory 文件，这一步直接回应了"压缩丢状态"的经典失效模式。Claude Code 则有九段结构化总结 prompt、compaction 后重新附加最近读取的 5 个文件、以及 prompt-too-long 兜底（对 compaction 调用本身溢出时做确定性 head-drop）——它预设了"压缩自己也会失败"这层故障。Letta 用 90% 水位触发 + 滑动窗口（从驱逐 30% 消息起每轮 +10%）、self-compact 模式（用 agent 自己的模型总结，省掉独立 summarizer 成本）和两阶段兜底（先钳制工具返回到 5,000 字符重试，仍溢出则 30% 头部 + 30% 尾部截断）。

### 收敛的证据：独立演化撞出同一套设计

比差异更值得注意的是共识的强度。四个 harness 共享六条模式：文件读取硬上限、offset/limit 分页、工具结果大小限制、子智能体会话隔离、token 阈值触发的 LLM compaction、上下文压力估算。具体设计甚至在细节上"押韵"：Pi 与 OpenClaw 同样做头部截断 + 继续提示；Claude Code 与 OpenClaw 同样把超大工具结果持久化到磁盘；三个框架都在 compaction 期间强制 tool-call/result 成对完整——永不切出孤立的工具结果，因为孤立 tool-result 会直接导致 API 层面的结构错误。最有说服力的独立收敛来自 Arize 自己的 Alyx agent：它为数据探索而非代码编辑构建，却独立走到了几乎相同的方案——工具结果 10,000-token 预算、二分搜索找最大数据集切片、长 cell value 头尾截断 + back-reference、50,000 tokens 强制 checkpoint、压缩前状态 flush。当两条完全独立的产品线在无协调的情况下收敛到同一组设计时，这组设计基本可以视为该问题的局部最优解。

### 上下文窗口正在被当作"分层内存系统"来管理

作者的最终论点把整个领域接回了操作系统五十年积累的内存管理经验：寄存器、缓存行、页表、交换空间，每一层由系统管理、对上一层不可见，程序只管运行。Agent harness 正朝同一方向移动——目标不是向模型展示一切，而是在正确的时间给它正确的工作集，并允许它动态决策、管理自己的上下文。这个视角能统一解释上面所有设计：stat 门禁与硬上限是"内存保护"，offset/limit 分页与向量检索是"按需调页"，compaction 是"交换空间回收"，压缩前 flush 是"脏页写回"，子智能体隔离是"进程地址空间隔离"。OpenClaw 的软剪枝/硬清除两级工具结果剪枝（带 5 分钟 TTL 缓存）则类似多级缓存失效策略。理解这层映射，新框架的设计决策可以直接借用 OS 教科书的成熟权衡，而不必从零试错。

## 实践启示

1. **给每个工具结果设独立预算，而不是只管上下文总量**：四个框架都不约而同地限制单次工具输出（OpenClaw 16K 字符或窗口 30%、Claude Code 每工具 50K 字符且每消息聚合 200K、Alyx 10K tokens）。一个失控的 `read` 或 SQL dump 就能挤占整个窗口。
2. **截断要附"如何继续"的出口**：截断消息里带 `Use offset=2001 to continue` 这样的可执行提示，比静默截断有效得多——模型会照做，而不是反复重读同一文件。重复读取去重（Claude Code 的 mtime stub）可以在此基础上再省一层 token。
3. **压缩前先把状态 flush 到持久层**：OpenClaw 的"静默 agentic turn 在历史消失前把状态写入 memory 文件"值得直接抄。任何 compaction 都可能丢掉关键任务状态，压缩本身应被视为一次有损操作而非无损转换。
4. **压缩必须保护 tool-call/tool-result 成对边界**：三个框架都强制这条不变量。孤立 tool-result 不只是信息丢失，而是 API 协议层面的结构错误；切分点永远要沿成对边界移动。
5. **为压缩失败本身准备兜底**：Claude Code 的 prompt-too-long head-drop 与 Letta 的两阶段钳制表明，compaction 调用自己也可能撑爆窗口。没有兜底的压缩策略在长会话中是定时炸弹。
6. **窗口按模型上下文规模分档配置，而不是一个全局常数**：Letta 的五档字符上限（8K→5,000 到 200K+→40,000）与可打开文件数随档位扩展的做法，说明预算参数应随模型能力伸缩，换模型时上下文策略应联动调整。
7. **评估新 harness 设计时，用六条收敛模式做 checklist**：硬上限、分页、工具结果限制、子 agent 隔离、阈值触发 compaction、压力估算——缺任何一条都是明确的红旗。

## 延伸导航
- [Claude Code 生态完全指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/claude-code-complete-guide.md)
- [OpenClaw 的架构设计为什么值得研究？它与 Hermes/Claude Code 的核心差异？](https://github.com/QianJinGuo/wiki-public/blob/main/moc/openclaw-architecture.md)
- [Agent Memory 架构选择的关键决策点是什么？](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-memory-architecture-decision-points.md)

---

