# Prompt Caching 工程实践 — Anthropic Claude Code 经验总结

> 📊 Level ⭐⭐⭐ | 10.2KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/anthropic-prompt-caching-claude-code.md`，一手来源仍见下方 sources。

## 机制与论文
- [Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-7-layers-openclaw-hermes-claude-code-p1anu.md) — 三框架演绎七层模型12857字rv9
- [Claude Opus 4.7 发布分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-opus-4-7-launch.md) — 4.7发布分析
- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/刚刚opus-47发布相比46核心变化与claude-code搭配最佳实践.md) — 6588字最全发布分析
- Context Window Management Comparison — 四框架对比rv9
- [800行代码实现 Open Claw 的 Tool、消息总线、子Agent管理架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/open-claw-tool-bus-subagent-architecture.md) — 薄抽象显式控制流8802字rv9全版
- [王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/wangyunhe-harness-optimization-agentsoul.md) — Agent=Models+Harness联合优化
- [Building for the Rising Complexity of Agentic Systems with Extreme Co-Design](https://github.com/QianJinGuo/wiki-public/blob/main/entities/nvidia-agentic-systems-extreme-co-design.md) — 三种交互模式+33分钟真实trace+prompt caching挑战
- [AI Agent工具数量陷阱——5个边界清楚的工具胜过20个模糊工具](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-agent-tool-count-trap.md) — 工具税数据与机制

## 工程实践
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](https://github.com/QianJinGuo/wiki-public/blob/main/entities/boris-cherny-新访谈开发工具正在从-ide-变成-agent-控制台.md) — Boris访谈rv10全版
- [Claude Code 源码深度解析（13 核心机制）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-source-deep-dive-warrior.md) — 13机制rv10
- [Claude Code 源码核心机制详解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-core-internals.md) — 源码机制18k主版
- [Claude Code 架构深度解析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-deep-architecture-analysis.md) — 并发与延迟加载深析
- [Claude Harness 设计：Generator-Evaluator 架构与 Context Reset 演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-generator-evaluator-anthropic.md) — Generator-Evaluator+context reset 10329字rv9全版
- Claude Code Openclaw Memory Comparison — 记忆系统对比rv9
- [Anthropic发布「AI原生创业公司」手册：涵盖全流程四大核心阶段，一人公司法典来了](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-ai-native-startup-handbook.md) — 创业四阶段手册
- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/opus-4-7-launch-claude-code-best-practices-wechat.md) — Opus 4.7核心变化+CC六新功能14779字rv9
- [Anthropic 内部 95% 数据分析自动化：分析 Agent 技术栈 + Skill 框架（21%→95% 准确率）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-95pct-data-analysis-skill-stack-architecture.md) — 95%技术栈26k
- [Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-comprehensive-guide-conardli.md) — ConardLi六层架构14634字rv9
- [Claude Code 性能基准评测](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-performance-benchmarking.md) — 性能指标体系
- [Claude Code 一周年回顾：Boris Cherny + Cat Wu 的完整时间线](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-first-year-retrospective-boris-cat-2026.md) — 一周年回顾14k主版
- [CPU 缓存类比下的 Agent 上下文管理：L1/L2/L3 层级架构与 execute_code 单工具设计](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cpu-cache-analogy-agent-context-management-liwen.md) — L1/L2/L3缓存类比
- [我把 Claude Design 做成了 Skill，人人都能成为顶级网站设计师](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-design-skill-web-design-engineer.md) — Claude Design拆解全版
- [Anthropic 最新博客：Prompt Caching 是构建 Claude Code 的一切](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-prompt-caching-claude-code-agihunt.md) — 缓存9条12k全版
- [Claude Code 多 Agent Harness 源码拆解：留纸条、抠上下文、抠缓存、捆手脚](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-multi-agent-harness-source-analysis.md) — 留纸条抠上下文

## 深度分析

### 前缀匹配是唯一的第一性原理

这篇博客最有价值的地方，是把散落的工程经验还原成一个单一原理：Prompt Caching 本质上是**前缀匹配**——API 缓存从请求开头到每个 `cache_control` 断点之间的所有内容，只要下次请求的前缀与上次一致，就能复用计算结果。九条经验（缓存即基建、排好队形、别动 Prompt、别换模型、别碰工具、Plan Mode、延迟加载、Cache-Safe Forking、前缀匹配）没有一条是独立技巧，全部可以从前缀不变性推导出来。这与 [CPU 缓存类比下的 Agent 上下文管理](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cpu-cache-analogy-agent-context-management-liwen.md) 的 L1/L2/L3 层级视角互为印证：缓存层级越稳定，命中越可预期。

### 命中率是基础设施指标，不是优化指标

Anthropic 把 Prompt Cache 命中率当作与服务器 uptime 同级的基础设施指标来监控：命中率下降会触发 oncall 告警，工程师要像处理线上事故一样排查。这个定位转换的依据是 Agent 产品的长对话特性——一个 session 聊几十轮，每轮都要携带全部历史上下文重发，若每轮从头计算，延迟和成本都会爆炸。缓存因此不是「做完顺便加个优化」，而是系统能跑起来的前提；这也是原文标题「Prompt Caching 就是一切」的字面含义。

### 不可变前缀 + 流动消息层的分层设计

Anthropic 的内容排序遵循「越不容易变的越往前放」：静态系统 prompt 与工具定义（全局缓存）→ CLAUDE.md（项目级）→ Session 上下文（会话级）→ 对话消息（逐轮只新增最后一条）。信息过时（时间戳、文件变更状态）时不改 prompt，而是用 `<system-reminder>` 标签把更新塞进下一轮 user message 或 tool result——prompt 是不可变的基础设施，消息才是流动的信息层。三个经典失效模式都源自破坏前缀：静态 prompt 里嵌每秒变化的时间戳、用 dict/set 导致工具定义顺序不确定、只改一个字段也让整个前缀缓存作废。

### 约束优先的设计哲学与三个反直觉决策

博客的深层结论是一种系统设计哲学：**先确定约束，再围绕约束做设计**。三个决策最能体现「约束倒逼架构」：

- **不动态切换模型**：缓存与模型绑定，切到 Haiku 省的钱抵不上重建全部缓存的成本；主对话自始至终用同一模型，小模型任务交给拥有独立上下文和缓存链的子 Agent，只回传结果。
- **Plan Mode 不增删工具**：直觉做法是规划时移走执行类工具，但 Anthropic 保留全部工具，用 `EnterPlanMode`/`ExitPlanMode` 两个特殊工具加 system message 约束来表达「只规划不执行」——副产品是模型可自主决定何时进入规划。
- **延迟加载 MCP 工具**：几十个 MCP 工具的完整 schema 太贵，按需加减又断缓存；折中是只放 `defer_loading: true` 的轻量 stub，模型经 Tool Search 拉取完整 schema，前缀始终保持轻量不变。

同理，Cache-Safe Forking 解决压缩问题：压缩请求必须复用与主对话完全一致的 system prompt、user context 和工具定义，把主对话消息作为历史带上，只在末尾追加一条压缩指令，从而共享同一条缓存链；Compaction 已内置于 API。

### 两个容易被忽略的运营细节

- **缓存按账号隔离**：账号池混用会导致命中率过低——多租户部署 Agent 时这是隐性的成本杀手。
- **session 期间工具集冻结**：看似「移除用不到的工具」是精简优化，实际每加减一个工具就断一次前缀，整个对话缓存重建的代价远超保留冗余工具定义的 token 开销——看似优化，实为添乱。

## 实践启示

1. 把缓存命中率当 SLO 监控并接告警，而不是当性能调优项——命中率下跌按线上事故响应。
2. Prompt 内容按可变性升序排列：全局静态（系统 prompt、工具定义）在最前，逐轮增长的消息在最后；任何新需求优先考虑追加消息而非修改前缀。
3. 时间戳、文件状态等易变信息一律放进 `<system-reminder>` 类的消息层注入，严禁写入静态 prompt；工具定义避免依赖 dict/set 等无序结构。
4. 主对话锁死单一模型；需要小模型时用独立缓存的子 Agent 承接，只回传结果。多账号部署时不要混用账号池。
5. Session 期间冻结工具集；模式切换（如 Plan Mode）用特殊工具 + system message 表达，而不是增删工具。
6. 大量 MCP 工具场景采用 stub + `defer_loading: true` + Tool Search 的延迟加载模式；长对话压缩必须走 Cache-Safe Forking，与主对话共享同一条缓存链。

## 延伸导航
- [Claude Code 生态完全指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/claude-code-complete-guide.md)

---

