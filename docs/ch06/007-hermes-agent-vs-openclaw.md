# Hermes Agent 记忆系统 vs OpenClaw 记忆观

> 📊 Level ⭐⭐⭐ | 11.6KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/hermes-agent-memory-system.md`，一手来源仍见下方 sources。

## 机制与论文
- [AgentScope Java Harness Framework 2.0 — 企业级 Agent 分布式场景的 Harness 实现 (Java 2.0 重大升级)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentscope-java-harness-framework-enterprise-distributed.md) — AgentScope Java全版
- [深度拆解 Hermes Agent 记忆系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-memory-system-openclaw-comparison.md) — 记忆成本账四层体系15260字rv10最深版
- [Hermes Agent Skill 互优化：SkillEvolver × Darwin × EmbodiSkill 4 轮闭环](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-skill-crossover-optimization.md) — SkillEvolver×Darwin×EmbodiSkill互优化13412字
- [MiroFlow：Deep Research Agent 脚手架 —— 与 Code Agent 的 6 大工程差异](https://github.com/QianJinGuo/wiki-public/blob/main/entities/miroflow-deep-research-agent-harness-mirothinker.md) — Code vs Research Agent 6大工程差异16596字rv10
- [Hermes Agent 深度解析（阿里云/飞樰）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-deep-dive.md) — 自进化内外双路径+四维工程7934字rv9全版
- Context Window Management Comparison — 四框架对比rv9
- [Agent Harness 上下文管理：工作集视角](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-context-management-working-set.md) — 工作集视角上下文管理
- 深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践 — 三维度源码：23模块拼装+自适应分块+双层Memory
- [Hermes Agent 为什么火了？和 OpenClaw 龙虾比一比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-vs-openclaw-comparison.md) — 爱马仕vs龙虾：控制面vs成长型定位对比
- [AI Coding Agent 记忆系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-coding-agent-memory-system.md) — 分层记忆设计
- [HiClaw v1.1.0 — Kubernetes 集群部署与 Hermes Worker 运行时](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hiclaw-v110-k8s-hermes-worker.md) — HiClaw K8s Controller-Reconciler架构分析
- [AI Agent工具数量陷阱——5个边界清楚的工具胜过20个模糊工具](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-agent-tool-count-trap.md) — 工具税数据与机制
- [OpenClaw与Hermes源码架构对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-hermes-source-code-agent-architecture-review.md) — 双框架源码对比：OpenClaw四亮点+Hermes四补充
- [Hermes Agent 爱马仕的三级 memory，到底在记什么？](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-three-layer-memory-architecture-one.md) — 三级memory详解7410字，80% consolidation
- [Agent 记忆系统的主矛盾：历史增长 vs 临场上下文调度](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-main-contradiction-context-scheduling.md) — 主矛盾框架分析

## 工程实践
- [Claude Code 源码深度解析（13 核心机制）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-source-deep-dive-warrior.md) — 13机制rv10
- Claude Code Openclaw Memory Comparison — 记忆系统对比rv9
- [MemOS Hermes 记忆插件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/memos-hermes-plugin.md) — MemOS插件：智能去重+混合检索7225字
- Openclaw Multi Agent Team Practice V2 — 七Agent花园团队：专精胜于全能12180字全版
- [MFS：zilliztech 的 Agent 统一上下文 harness，一套动词打通 20+ 数据源](https://github.com/QianJinGuo/wiki-public/blob/main/entities/zilliztech-mfs-open-tag-claude-tag-shuge-2026.md) — 统一动词文件树寻址
- [Claude Code 从 Demo 到产线 · 企业 Harness 工程化的 8 道关卡（黄佳/咖哥 CSDN）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-demo-to-production-8-gates-huang-jia-csdn-2026.md) — 8道关卡清单
- [阿里云 MSE AI 任务调度 + Agent Sandbox：动态休眠/唤醒 OpenClaw Agent 成本下降 90%+](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-mse-ai-task-scheduling-agent-sandbox-cost-90-percent.md) — 休眠唤醒短条borderline
- [OpenClaw 多租户系列 #7 — 基于 ECS Fargate + Graviton 的轻量级企业 AI Agent 平台 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-multi-7-ecs-fargate-graviton.md) — ECS变体+双Agent并行+四层隔离
- [淘宝主播 Agent Harness 工程：六元组框架与直播场景八项实战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/taobao-live-anchor-agent-harness-engineering-2026.md) — harness六元组八项实战

## 深度分析

### 记忆的"成本账"视角：不是更强，而是分层更细

这篇文章最有价值的重构，是把"Hermes 记忆系统好"翻译成一句可操作的工程判断：Hermes 没有做"更强大的记忆"，而是把记忆的**成本账**算得更细——不同类型的信息进入成本和用途完全不同的机制，避免所有东西混进一个越来越大的 memory 口袋。四层体系（热记忆 MEMORY.md/USER.md、会话检索 session_search、程序性记忆 Skills、可选的 Honcho 深层用户建模）本质上是按"每轮都要知道 / 偶尔要找回 / 下次要会做 / 长周期画像"四种访问模式切分的存储策略。这与 [Agent 记忆系统的主矛盾](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-main-contradiction-context-scheduling.md) 所刻画的"历史增长 vs 临场上下文调度"是同一问题的两种表述：分层的目的就是让临场上下文只装高密度信息。值得注意的细节是热记忆用**字符限制**（2,200 + 1,375 字符）而非 token 限制——不依赖任何模型的 tokenizer，朴素但稳定、可预测、少耦合。

### Prompt cache 是贯穿所有设计的隐形约束

把六个设计原则放在一起看，会发现一个贯穿性的隐形约束：**保护 system prompt 前缀的稳定性，就是保护 prompt cache 命中率**。MEMORY.md/USER.md 以 frozen snapshot 形式注入系统提示词，会话中途写入新内容立刻落盘但**不改当前会话的 prompt**——牺牲即时性换缓存命中。Honcho 的处理更精巧：第一轮预取织入系统提示词，后续轮次改为附加在用户消息附近动态提供，深层用户建模因此不破坏稳定前缀。压缩流程同样围绕缓存设计——压缩前 memory flush 保存稳定事实，压缩旧历史后**重建 prompt cache**，新热记忆进入新的稳定快照。文章的点睛判断是"记忆压缩不能只理解成把历史变短，而是把任务状态迁移到更稳定的位置"：压缩是状态迁移（transcript → durable memory），不是简单截断。对照 OpenClaw 三维度设计哲学 可以看出，OpenClaw 把重心放在 gateway/workspace 控制面，而 Hermes 的 cache-aware 执行型 runtime 选择了另一条路线——两者不是优劣关系，而是治理型 vs 执行型的定位差异。

### Memory 即提示词供应链：写入面必须当输入校验做

文章把安全视角拉进了记忆设计：**记忆是提示词供应链的一部分**。普通日志混进恶意文本影响有限；长期记忆混进"忽略之前所有指令"，会在后续很多会话里反复污染系统状态。对应的工程动作是 memory 工具的三点设计：只有 `add/replace/remove` 三个动作、没有复杂的"读"（当前记忆会话开始时已注入，不需要再读一遍）、replace/remove 用子字符串匹配（模型不需要记住内部 ID）；写入前检查提示词注入、凭证泄露、SSH 后门暗示、不可见 Unicode 字符。这个"写入面 = 输入校验面"的观点与 [MemOS Hermes 记忆插件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/memos-hermes-plugin.md) 的智能去重+混合检索形成互补：前者防记忆被污染，后者管记忆的质量与检索。对于把 MEMORY.md 塞进 system prompt 的所有 Agent 框架，这个供应链检查是通用必修课，不限于 Hermes。

### 记忆分类学与 Skills 作为可审查的运行时资产

原文给出了一套干净的记忆分类学，可与 [三级 memory 详解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-three-layer-memory-architecture-one.md) 对照阅读：事实记忆回答"环境是什么、用户偏好是什么"，会话检索回答"以前发生过什么"，Skills（程序性记忆）回答"下次遇到类似任务怎么做"。关键洞察有二：其一，session_search 是**档案室不是随身备忘录**——FTS5 搜索 → 按 session 聚合 → 解析 parent_session_id → 局部截断 → 便宜辅助模型做 focused summary，一整套流程只为"用户说上次那个问题时能找回来"，档案室很重要，但没人会把档案室背在身上。其二，Skills 的价值不在"越来越有灵性"，而在把已验证的做事方法变成**可检索、可更新、可审查的运行时资产**（注入紧凑 index，需要时再加载完整 skill）——这与 [Skill 互优化闭环](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-skill-crossover-optimization.md) 的演化视角相接：先有可审查的资产，才谈得上自动演化。文章同样点破了反面：错误经验沉淀成 skill 会在未来反复误导 Agent，记忆"更多"本身不等于"更好"。

## 实践启示

1. **先给记忆分层定"准入标准"，再谈容量。** 用户偏好、环境事实、稳定约定才配进热记忆；任务进度、完成日志、一次性 TODO 留在别的层。判断标准是"每一轮都需要知道吗"，而不是"现在不存怕丢"。
2. **把 system prompt 当 frozen snapshot 对待。** 高频变动的内容不要进系统提示词；会话中途产生的记忆先落盘，下个会话再生效——用一点即时性换 prompt cache 稳定命中，长会话场景这笔账几乎总是划算的。
3. **长会话压缩前必须做一轮 durable state extraction。** 给模型专门指令（只开放 memory 工具），把用户偏好、修正、重复模式迁入持久记忆，不要保存一次性任务细节；别等历史被摘要磨薄了才发现关键事实没留下来。
4. **历史会话要有独立的档案层，且与热记忆边界清晰。** 完整保存消息 + 关键词搜索 + 按 session 聚合 + 局部截断摘要召回；"上次那个问题"类问题走检索，不占热记忆配额。Claude Code 与 OpenClaw 记忆对比 可作为参考实现。
5. **记忆写入按提示词供应链做安全扫描。** 任何进入长期记忆的文本都可能在后续 N 个会话里反复注入系统，写入前的注入检测/凭证检测/不可见字符检查应视为默认配置而非可选项。
6. **Skills 是 SOP 不是魔法。** 团队已验证的做事方法应显式沉淀为 skill 文件（可检索、可更新、可审查），而不是指望模型从 transcript 里"悟"出来；同时警惕错误经验固化——skill 需要定期审查，这正对应 [工作集视角](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-context-management-working-set.md) 中把状态分门别类的原则。

## 延伸导航
- [Agent 记忆与上下文系统](https://github.com/QianJinGuo/wiki-public/blob/main/moc/memory-context-systems.md)

---

