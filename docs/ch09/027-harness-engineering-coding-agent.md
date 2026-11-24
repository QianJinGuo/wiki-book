# Harness Engineering - 让 Coding Agent 可靠完成长程任务

> 📊 Level ⭐⭐⭐ | 10.7KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.85**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/harness-engineering-reliable-long-term-agent.md`，一手来源仍见下方 sources。

## 机制与论文
- [Code as Agent Harness 综述](https://github.com/QianJinGuo/wiki-public/blob/main/entities/code-as-agent-harness-survey.md) — 102页综述
- [Agent生产级Harness工程指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-production-harness-engineering.md) — 四支柱审查框架
- [Agent Memory 架构解析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-architecture-ruofei.md) — memory架构解析
- [Agent Reliability: Context Drift & Tool Calling Hallucination](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-reliability-context-drift-tool-hallucination.md) — 漂移与幻觉分层解法
- [Agent Harness 6 种运行模式与 SDB 方法论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-6-runtime-patterns-sdb.md) — SDB边界形式化
- [Prime Agent — 以 RLM + Continual Harness 双抽象为核心的自改进编码 Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/prime-agent-self-improving-rlm-agent.md) — RLM+Continual Harness：harness状态可CRUD
- [ICML 2026 Open Reproductions — 大规模 Agent 驱动的论文复现审计](https://github.com/QianJinGuo/wiki-public/blob/main/entities/icml-2026-open-reproductions-agent-audit.md) — 2226篇论文35908个claim的agent复现审计
- [Databricks CEO用3000名程序员真实任务测试GLM 5.2 — Harness选择比模型更重要](https://github.com/QianJinGuo/wiki-public/blob/main/entities/databricks-glm-52-3000-engineer-benchmark-coding-agent.md) — 3000工程师实测
- [SemaPLC：验证门控的 PLC 代码生成 Agent Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/semaplc-verification-gated-agent-harness-plc-codegen-2026-08-26.md) — 验证门控PLC代码生成harness

## 工程实践
- 'Harness Engineering：AI 从 — 六层架构+七大反模式+分级决策树19712字rv9
- [Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cursor-复盘-harness模型决定能力上限harness-决定生产下限.md) — Cursor复盘主版
- DeepSeek Code Harness — DSH 28k主版
- [vivo Agent 系统分析：大模型是大脑不是马，Harness 是 ICU 不是马鞍](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vivo-agent-brain-body-icu-harness-evolutionary-framework-2026.md) — 大脑身体ICU隐喻框架
- [AI-DLC：紫讯落地 AI 原生研发新范式的实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-dlc-zixun-ai-native-development-lifecycle.md) — AI-DLC四件套
- [FastContext（微软开源 Coding Agent 仓库探索子代理）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/microsoft-fastcontext-coding-agent-explore-subagent-vibecoder.md) — Explore子Agent只读三工具，证据bundle
- [It’s safe to close your laptop now: Hosting coding agents on Amazon Bedrock AgentCore](https://github.com/QianJinGuo/wiki-public/blob/main/entities/bedrock-agentcore-coding-agent-hosting.md) — 远端工作站即服务
- [Coding Agent在百度的落地实践：从反馈闭环到工程范式重构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/baidu-comate-coding-agent-feedback-loop-wanpeng.md) — 双层loop实践
- [Harness Engineering 系统性解读](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-systematic-explainer.md) — 李宏毅课程解读7933字最全版
- [Devin Fusion: 多模型路由 Harness 实现 35% 成本降低](https://github.com/QianJinGuo/wiki-public/blob/main/entities/devin-fusion-multi-model-harness-cognition.md) — Sidekick双agent路由
- [Skill Hell：Agent Skill 工程方法论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-hell-agent-skill-engineering-ruofei.md) — Skill Hell四失效模式治理
- [从Vibe Coding到Harness—— 一套大仓AI工程化实战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/从vibe-coding到harness-一套大仓ai工程化实战.md) — TAB大仓实战2293字版
- [Claude Code 多 Agent Harness 源码拆解：留纸条、抠上下文、抠缓存、捆手脚](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-multi-agent-harness-source-analysis.md) — 留纸条抠上下文
- [去哪儿 AI Coding 驱动大型核心系统重构 — Harness+Loop+Task 工程化方法论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/qunar-ai-coding-large-core-system-refactor-2026.md) — 15万行重构提效70%：Harness约束+Loop推进
- [AI Native SDLC Playbook：Anthropic 应用 AI 团队的软件开发生命周期重构方法论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-native-sdlc-playbook-anthropic.md) — SDLC六阶段重构

## 深度分析

### 长程任务为何会失控：上下文漂移是第一失效源
长程任务（上千文件、跨多个会话、上亿 Token）的可靠性问题，首先是一个上下文问题。上下文窗口有限，框架的自动压缩是必然选择，但每一轮压缩都在抹除早期细节——约定被"忘掉"、已被纠正的错误反复出现，本质是压缩信息损失的逐轮复利。更隐蔽的一层是模型的"上下文焦虑"：Agent 感知到窗口将满时倾向于提前收尾、草率宣告完成，把失控伪装成了成功。这意味着长程可靠性的第一个设计推论是：**不能把任何进度状态寄托在模型记忆里**，会话上下文应被视为易失性缓存，唯一可信的进度载体是落盘文件；恢复逻辑只需读"当前状态"而不需回放"历史发生了什么"，状态机因此必须是自描述的（仅凭状态即可推导下一步）。

### 验证是可靠性的承重墙：程序化校验优先、评价与执行分离
长程任务涉及成百上千文件的产出，人工核验不可行，可靠性的可判定性必须外置到验证体系上。这里有一条清晰的分层原则：**能用脚本判定的绝不交给 Agent**——编译、构建、测试、AST 结构对比零 Token 消耗、结果确定、可无限重放；只有主观维度（如审查意见的质量）才引入独立会话的 Evaluator Agent。评价与执行必须在干净上下文中分离，因为同一会话内的历史推理会形成"自我说服"效应，让 Agent 偏袒自己的产出；跨模型评估则进一步引入视角差异、降低系统性偏见。另一条常被忽略的原则是**允许局部失败**：1000 个文件失败 5 个不应阻塞其余 995 个，且失败要区分"真失败"（回退人工）与"通过但有妥协"（记录遗留项后合入）——把 99% 搞定的文件当硬失败反复重跑，浪费的 Token 比失败本身更贵。

### 断点续传与状态设计：以产出物为准，而非以状态字段为准
中断（网络断、Token 尽、进程崩溃）在长程任务中是常态而非异常，可续传设计的核心难题在于 IN_PROGRESS 残留的歧义性：状态字段本身无法区分"真的在跑"与"跑到一半挂了"。可靠的判定依据是**产出物而非状态**——预期的产出文件是否存在、内容是否通过完整性校验（编译、schema 解析），据此才能决定是补记 DONE 还是清理半成品后重置 TODO。状态粒度是精确度与成本的权衡：每个中间状态都需要一个对应的持久化检查点，状态越细恢复断点越精确，但维护成本越高——执行时间长、中间产物可复用的步骤才值得加状态，秒级任务三状态足够。配合 Git Worktree 物理隔离，半成品清理退化为丢弃整个工作区，避免在主分支上做逐文件回滚。

### 子任务作为 CLI 进程：编排权从模型手里收回到脚本
子任务不在对话里嵌套调用，而是作为独立 CLI 进程由脚本启动和监控，是这个方法论里结构性最强的一个选择。它同时解决了三件事：**Prompt 确定性**（脚本程序化组装指令，避免主 Agent 转述时"自由发挥"把文件内容整段贴入、塞进自己的推断，带偏子任务）；**上下文零累积**（每个子任务是全新会话，主会话不会堆积前 29 个子任务的历史）；**并发可控**（模型倾向保守、不愿开高并发，调度权交给脚本后并发数可随资源与限流动态调整）。调度采用"随到随补"而非"批次等齐"，因为子任务耗时天然不均匀，等齐会让空槽位长时间闲置。这体现了一个更深的原则：harness 的价值正在于把确定性逻辑从概率性的模型推理中剥离出来——Agent 只做判断类工作，流程控制、状态更新、进程管理全部留给脚本。随着编排经验本身被沉淀为 meta-skill（让 Agent 生产执行框架），harness 正从"每个任务的定制脚手架"演变为"可复用的基础设施后端"。

## 实践启示

1. **把上下文当易失缓存，状态一律落盘。** 每完成一步立即写入进度文件，不攒批、不依赖会话记忆；新会话恢复只读文件，不做历史回放。
2. **每个子任务先定义可程序化检查的完成条件，再开始执行。** 编译通过、构建成功、测试全绿、AST 对比一致这类标准优先交给脚本校验；确实需要主观判断的，才用独立会话（甚至跨模型）的 Evaluator，且评价 Agent 与执行 Agent 必须上下文分离。
3. **粒度用 Token 预算反推，而不是拍脑袋。** 按"Prompt 模板 + 输入文件 + 2-3 倍工作过程消耗"估算单子任务总消耗，让样本经常落在窗口的 30%-80% 区间；同目录文件尽量同组，共享 import 与类型带来的局部上下文比行数凑整更影响质量。
4. **子任务走 CLI 进程 + Git Worktree 隔离，调度权交给脚本。** Prompt 由脚本程序化组装而非主 Agent 转述；并发用"随到随补"而非批次等齐；主循环用退出码传递信号，Agent 只消费状态摘要。
5. **重试分层，边界明确。** 内层恢复会话续传、中层带完整报错反馈定向修复（限 2-3 次）、外层由主 Agent 权衡重新 dispatch 的成本；判断走哪层看产出文件状态，不解析 Agent 的文本输出；重试耗尽即 revert、标记 FAILED，绝不把有问题的产出混进已完成队列。
6. **把 Harness 边界当作需要持续重估的假设清单。** 框架里每个环节都隐含"当前模型做不到"的假设，模型每次升级都应重新审视边界、逐项移除脚手架并观察影响；"确定哪些交给模型、哪些留在框架"的判断本身不会过时。

## 关联

- 同题异语种孪生页：[Harness Engineering 让 Coding Agent 可靠完成长程任务 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-让-coding-agent-可靠完成长程任务-v2.md)（归并候选，提案卡 #11 批1）
- 同题异语种孪生页：[Agent架构关键变化Harness正在成为新后端](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent架构关键变化harness正在成为新后端.md)（归并候选，提案卡 #11 批1）
- 同题异语种孪生页：[Harness Engineering耗时一周我是如何将应用的Ai Coding率提升至90的](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering耗时一周我是如何将应用的ai-coding率提升至90的.md)（归并候选，提案卡 #11 批1）

---

