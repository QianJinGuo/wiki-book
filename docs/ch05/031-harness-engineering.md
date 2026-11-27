# 深入浅出 Harness Engineering 之核心模式与理念

> 📊 Level ⭐⭐⭐ | 11.1KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.85**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/harness-engineering-core-patterns-claude-code.md`，一手来源仍见下方 sources。

## 机制与论文
- [一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/一文带你弄懂-ai-圈爆火的新概念harness-engineering.md) — 13141字最全科普版
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](https://github.com/QianJinGuo/wiki-public/blob/main/entities/深入理解-claude-code-源码中的-agent-harness-构建之道.md) — 16095字源码8步循环
- [Claude Code and What Comes Next](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-and-what-comes-next.md) — 压缩/Skills/Subagents
- Harness Engineering Deletable Worksite Ruofei — 可删工作现场：Vercel删80%工具成功率反升
- [从零构建大语言模型 —— 读完这篇你就懂了](https://github.com/QianJinGuo/wiki-public/blob/main/entities/build-llm-from-scratch-7-chapters-zion.md) — LLM教程七章

## 工程实践
- [Impeccable：把 AI 前端设计变成可检查的工作流 — 33.4k Star 开源项目深度分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/impeccable-frontend-design-skill-harness-vibecoder.md) — Impeccable四层架构9210字rv9全版
- [数据级 Harness：架构师 JiaGouX 解读 Anthropic 95% 数据分析与 5 个反直觉边界](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-95pct-data-analysis-jiagoux-data-level-harness-20260606.md) — 数据级harness解读
- [高德 Marketing AutoResearch：AI Native 营销增长经营托管框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/autoresearch-marketing-growth-amap-ai-native.md) — 营销经营托管
- [存之有序，治之有矩——Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md) — 写入纪律prompt cache冲突
- [AgentOps: Operationalize agentic AI at scale with Amazon Bedrock AgentCore](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md) — 四支柱解析版
- [你不知道的 Agent：原理、架构与工程实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/你不知道的-agent原理架构与工程实践-v2.md) — 真实内容harness影响实证
- [Anthropic Institute《When AI builds itself》深度解读：AI 进入 AI 研发执行层、瓶颈迁移与研发级 Harness（架构师 JiaGouX）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-institute-when-ai-builds-itself-jiagoux-interpretation.md) — 解读短条borderline
- [面向大型代码库的 Claude Code 团队落地经验与扩展策略（Agent Harness）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-large-codebase-team-deployment-agent-harness.md) — 13模式全版
- [构建无服务器Kiro调度平台：用Kiro CLI + EventBridge + ECS Fargate实现定时AI任务](https://github.com/QianJinGuo/wiki-public/blob/main/entities/构建无服务器kiro调度平台用kiro-cli-eventbridge-ecs-fargate实现定时ai任务.md) — 定时AI任务7x24
- [长期运行的 Agent 怎么管：Hermes 治理分层与 5 张卡](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-long-running-governance-five-cards-ruofei.md) — don't automate slop+5张卡治理
- [让 Amazon Quick 操作飞书：构建远程 MCP 服务的设计实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/让-amazon-quick-操作飞书构建远程-mcp-服务的设计实践.md) — MetaTool分层注册设计
- [Claude Code 泄露后的漏网之鱼 claude-code-best 这两个月到底演进了什么](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-best-community-fork-evolution-vibecoder.md) — 社区fork演进短条
- [阿里云 MSE AI 任务调度 + Agent Sandbox：动态休眠/唤醒 OpenClaw Agent 成本下降 90%+](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-mse-ai-task-scheduling-agent-sandbox-cost-90-percent.md) — 休眠唤醒短条borderline
- Secure AI agents with Policy and Lambda interceptors in Amazon Bedrock AgentCore gateway — Cedar策略+Lambda拦截器双模式
- [腾讯云Agent Memory：Mermaid无限画布×上下文卸载](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencentdb-agent-memory-context-offloading.md) — Mermaid画布上下文卸载
- [Amazon Quick integration with time-series databases for market intelligence using MCP](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-quick-mcp-kdbx-time-series.md) — 集成短条
- [小刘商业 Agent 增强层通用基座](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-xiaolaoliu-business-agent-augmentation-layer-general-base-20260606.md) — 基座+增强层论点短条
- [本地 vs 云端 Agent 的现场之争：当下选本地，终局云端（行小招）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/local-vs-cloud-agent-onsite-context-debate-xingxiaozhao.md) — 当下本地终局云端的现场判断
- [我把 Karpathy 的 AutoResearch 搬到了软件开发领域，效果炸了](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-autoresearch-software-development-niaowo.md) — AutoResearch迁移软开+交叉审核

## 延伸导航
- [Agent Memory 架构选择的关键决策点是什么？](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-memory-architecture-decision-points.md)
- [Agent 工程全景指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-engineering-guide.md)
- [第 2 层全库索引：交互实践](https://github.com/QianJinGuo/wiki-public/blob/main/moc/layer-2-interaction.md)

## 深度分析

### 共同机制：把状态从模型搬进系统

细读这些核心模式会发现它们共享同一个底层机制：都不指望在单次推理内让模型"变聪明"，而是把状态、规则与流程从模型的概率推理中搬出，交给确定性代码托管。持久化指令把"项目约定"外置为文件；分层记忆与渐进式压缩把"历史对话"重组为常驻摘要、按需细节、可搜索全档三级结构（参见 [Agent Memory Substrate Three Layer](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-substrate-three-layer.md)）；Session 只追加事件流则把"会话状态"物化为可重放的日志，整个组装过程本质是一套 [Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md)。模型的权重是冻结的、不可工程的，而 harness 层的这些模式都是可版本化、可测试、可回滚的普通软件——这正是它们全部长在 harness 而非模型层的根本原因。一次无状态的模型调用，被 harness 包装成一个有状态、可恢复、可审计的系统。

### 为什么这些模式在 harness 层成立

这些模式的第二个共性是"确定性优先"：能用代码保证的，绝不托付给模型记忆。生命周期钩子在会话开始、工具调用后强制执行格式化等动作，不依赖模型是否记得指令；命令风险分类用静态规则把命令分为安全/有风险/危险三级，只有灰区才交给模型判断；保险库+代理架构让凭证在拓扑上就不可达沙盒，而不是"请求模型不要泄露"。宠物与牲畜哲学同样依赖这一点：正因为状态全部住在 Session 事件流里，Harness 与 Sandbox（见 [Agent Sandbox](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-sandbox.md)）才可以随时销毁重建——被牲畜化的是"承载计算的组件"，被当宠物保存的是"事件本身"。同理，大脑与容器解耦带来首 Token 延迟降低 60-90%，这是编排架构的收益，换更强的模型也换不来；驱动循环的逐步拆解可进一步参见 [深入理解 Claude Code 源码中的 Agent Harness 构建之道](https://github.com/QianJinGuo/wiki-public/blob/main/entities/深入理解-claude-code-源码中的-agent-harness-构建之道.md)。

### 模式间的协同与冲突

模式之间既互相放大也互相顶撞。协同方向上，渐进式压缩为分层记忆持续供给"轻量总结"这一层；探索-规划-行动的相位分离与上下文隔离子智能体（[Multi Agent Context Isolation](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-context-isolation.md)）互为犄角——前者定义阶段边界，后者用独立上下文把边界物理化；多脑一手/一脑多手/多脑多手三种协作模式则是三件套解耦"免费"派生出的组合空间。冲突方向的代价更值得留意：作用域上下文组装把规则拆散到组织/项目两级后，规则之间可能互相冲突，反过来污染持久化指令想建立的确定性；定期"做梦整理"式的记忆回收与分层记忆的留存目标存在张力，误删即静默降级；压缩必有信息损失，极端情况下会诱发模型"编造"，与记忆工具追求的可信检索直接矛盾；写入纪律与 prompt cache 的互相干扰（详见 [存之有序治之有矩Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md)）则说明连"何时写记忆"都要与推理成本联动设计。还有一个常被忽视的结论：删减本身也是模式——Vercel 删掉 80% 工具后成功率反而上升（Harness Engineering Deletable Worksite Ruofei），在 [Context Window Economics](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-window-economics.md) 的预算视角下，做减法常常优于做加法。

### 模式的成立条件与治理

每个模式在原文里都明码标价：指令文件要持续维护否则误导、编排让小任务显得笨重、并行合并带来代码冲突、做梦整理消耗资源。所以真正的工程判断不是"上不上模式"，而是"该模式在本场景的收益是否覆盖其成本"：高重复度的长周期任务才值得上持久化指令与分层记忆；任务复杂度足够高时，探索-规划-行动的"笨重"才划算；并行分支只在合并成本可控时启用。规模越大，治理的权重越高——长期运行的 Agent 需要"不要自动化 slop"的纪律与治理分层（见 [Hermes Agent Long Running Governance Five Cards Ruofei](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-long-running-governance-five-cards-ruofei.md)），否则模式会从生产力退化为负资产。

## 实践启示

1. **先立持久化指令，再谈别的。** 为每个项目建立指令文件并纳入维护流程，过期规则比没有规则更危险——把"更新指令文件"当作代码评审的一部分。
2. **把上下文当预算管理。** 按"常驻精华 → 按需细节 → 可搜索全档"组织记忆（参考 [Agent Memory Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-architecture.md)），窗口内只放摘要，原始数据沉到只追加的事件流/全档里按需检索；任何压缩之前，先确认原始数据仍可回放。
3. **用权限边界落实相位分离。** 探索阶段只读、规划阶段与用户对齐、执行阶段才授予写权限；并行分支放进独立子智能体/沙盒，并事先设计合并策略而非事后救火。
4. **确定性的事交给代码，概率性的事才交给模型。** 格式化、安全检查等关键动作用生命周期钩子强制执行；命令按风险分级自动执行/请求确认/拦截；优先封装单用途工具而非裸 Shell。
5. **凭证永不进沙盒。** 采用保险库+代理架构：最小权限、外部调用全部可审计、凭证集中轮换——这是安全设计的兜底线，优先级高于一切便利性。
6. **每个模式上线前先算成本，失败时优先做减法。** 延迟、复杂度、信息损失都要计入收益核算；当工具与规则堆积导致成功率下降时，先删后加——删掉 80% 工具成功率反升的案例说明减法常是第一选项。

## 关联

- 同题异语种孪生页：[Harness Engineering耗时一周我是如何将应用的Ai Coding率提升至90的](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering耗时一周我是如何将应用的ai-coding率提升至90的.md)（归并候选，提案卡 #11 批1）

---

