# Prompt Caching 工程实践 — Anthropic Claude Code 经验总结

## Ch09.027 Prompt Caching 工程实践 — Anthropic Claude Code 经验总结

> 📊 Level ⭐⭐ | 16.1KB | `entities/anthropic-prompt-caching-claude-code.md`

## 核心约束：Prompt Caching = 前缀匹配
API 缓存从请求开头到每个 `cache_control` 断点之间的所有内容。只要下次请求的前缀跟上次一样，就能复用计算结果。
Claude Code 是长对话 Agent，用户在一个 session 里聊几十轮，每轮都带完整上下文重新发请求。没有缓存，延迟和成本都会爆炸。

## 9条工程经验
### 1. 缓存即基建
Anthropic 内部把 Prompt Cache 命中率当作 `uptime` 级别的指标监控，一旦下降就触发 oncall 告警，工程师得像处理线上事故一样排查。

### 2. 排好队形（Prompt 排列优先级）
从不变到易变，从前到后排列：
| 层级 | 内容 | 缓存范围 |
|------|------|----------|
| 第1层 | 静态系统 prompt + 工具定义 | 全局（所有 session 共享）|
| 第2层 | CLAUDE.md 文档 | 项目级（同一项目内共享）|
| 第3层 | Session 上下文 | 会话级（单次会话内共享）|
| 第4层 | 对话消息 | 逐轮增长（每轮只新增最后一条）|
**原则：越不容易变的东西，越往前放。**
常见踩坑：

- 静态 prompt 里嵌时间戳 → 每秒都在变，缓存废掉
- 工具定义顺序不确定（dict/set）→ 前缀对不上
- 工具参数更新（哪怕一个字段）→ 整个前缀缓存失效

### 3. 别动 Prompt
过时信息（时间戳、文件状态）不要去改 prompt，而是用 `<system-reminder>` 标签塞进 user message 或 tool result 里。
**架构原则：prompt 是「不可变的基础设施」，消息才是「流动的信息层」。**

### 4. 别换模型
缓存跟模型绑定。换模型 = 所有缓存作废从头重建，代价往往比让 Opus 直接回答简单问题还高。
**策略：主对话自始至终用同一模型。需要小模型时用子 Agent，它有独立上下文和缓存，不污染主对话缓存链。**
注意：缓存按账号隔离，账号池混用会导致命中率骤降。

### 5. 别碰工具
工具定义是缓存前缀的一部分。加一个/减一个工具 → 整个对话缓存全断 → 全部重建，代价远超多放几个工具定义的 token 开销。

### 6. Plan Mode 设计
直觉做法：进 Plan Mode 移走执行类工具，退出再加回来。
**Anthropic 做法：工具集不动，加两个特殊工具 `EnterPlanMode` 和 `ExitPlanMode`。** 用 system message 传达"规划模式下不能执行"的约束，工具集始终不变。
好处：模型可自主判断何时进 Plan Mode，不需要用户手动切换。

### 7. 延迟加载（Lazy Loading）
MCP 工具 schema 全塞进 prompt 太贵，按需加减又破坏缓存。
**方案：初始只放轻量 stub（`defer_loading: true`），模型需要时通过 Tool Search 拉取完整 schema。**
Prompt 前缀始终只含轻量 stub，不会因加载完整 schema 而变化。
类比：图书馆书目索引——先翻目录找书，再去书架取，不用把所有书搬到桌上。

### 8. Cache-Safe Forking（压缩的学问）
Context 填满后需要压缩另起调用，但另起调用用了不同的 system prompt → 从第一个 token 就跟主对话缓存对不上。
**方案：压缩请求必须用跟主对话完全一样的 system prompt、user context、工具定义，把主对话消息作为历史带上，在末尾追加压缩指令作为新 user message。**
这样压缩请求复用主对话缓存链，新增成本只有最后那条压缩指令本身。Compaction 功能已内置到 API。

### 9. 前缀匹配是一切
所有设计的核心约束：**Prompt Caching = 前缀匹配。**
清单：

- 别改 prompt
- 别换模型
- 别动工具
- 别另起炉灶做压缩
- 别瞎切账号
**系统设计哲学：先确定约束，再围绕约束做设计。不是「做完了顺便加个缓存」，而是从第一天起就围绕缓存来设计。**
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-prompt-caching-claude-code-agihunt.md)

## 深度分析
### 从优化手段到架构约束的范式转移
传统认知里，缓存是「做完功能后再加」的优化层。Anthropic 将其倒转：Prompt Caching 是架构设计的起点，而非终点。这意味着在画系统架构图之前，缓存策略就得先想清楚——前缀怎么切、哪层放什么、哪些东西永远不动。
这与 Web 性能优化中的「缓存即契约」理念一脉相承。HTTP 缓存 RFC 里讲的很清楚：缓存不是浏览器端的锦上添花，而是服务端声明的契约。Prompt Caching 沿用了相同逻辑——API 端通过 `cache_control` 声明哪些内容可复用，客户端的设计必须与之对齐。

### 不可变性设计是缓存友好的本质
9条经验的核心洞察可以浓缩成一句话：**不可变性是缓存友好的前提**。

- Prompt 不可变 → 静态前缀稳定，跨 session 复用
- 工具集不可变 → 主对话缓存链不中断
- 模型不可变 → 缓存资产不因模型切换而蒸发
- 消息可变 → 动态信息通过消息流转，不污染缓存前缀
这与函数式编程中「不变数据结构的持久化」思路一致。Edmonds 的《Programming in Scala》早就论证过：不可变数据虽然看起来有拷贝成本，但避免了锁竞争，在并发场景下净收益为正。Prompt Caching 在上下文管理领域复现了同样的trade-off分析——接受单次计算的冗余，换取多次调用时缓存复用的收益。

### 分层缓存失效与灾难链
值得特别注意的工程风险是**缓存失效的灾难链效应**（Cascade Failure）。在分层缓存架构中：

- 第1层（系统 prompt + 工具定义）出问题 → 所有 session 全局失效
- 第2层（CLAUDE.md）出问题 → 同一项目所有会话失效
- 第3层（Session 上下文）出问题 → 单会话内所有轮次失效
- 第4层（对话消息）出问题 → 当前轮次后所有轮次失效
工具定义的顺序不确定性是一个典型灾难链触发点：Python 3.7+ 的 dict 保持插入顺序，但 `json.dumps()` 默认不保证排序；如果工具定义在序列化时顺序打乱，每次请求前缀实际都在变，但肉眼完全不可见。这种 bug 极难排查，需要在序列化层强制 sort_keys=true 或使用有序数据结构。

### 子 Agent 架构与缓存隔离
「用子 Agent 处理简单任务以保护主对话缓存」这一策略，隐含了一个更通用的设计模式：**缓存边界（Cache Boundary）**。
主对话是一个缓存单元，子 Agent 是另一个缓存单元。两者通过消息传递（结果回传）而非共享上下文通信。这与微服务架构中的「通过 API 通信而非共享数据库」原则完全对应——共享缓存就像共享数据库，是强耦合的根源。
子 Agent 的独立缓存链还有额外好处：可以在子 Agent 侧用更小的模型，降低单次成本；主对话始终保持高配模型，保证回答质量。这个策略本质上是**缓存级联的解耦**——不同缓存链服务不同任务，不在同一个链上追求所有目标。

### 压缩问题的本质：缓存延续性
Cache-Safe Forking 解决的不是压缩问题，而是**缓存延续性（Cache Continuity）**问题。
压缩请求天然需要一个新上下文——要处理的文本来自历史对话，格式和主对话不同。但 Anthropic 观察到：如果允许缓存链在新请求的第一个 token 就分叉，那整个缓存积累的资产就全部浪费了。
解决方案的巧妙之处在于：不是让压缩请求「绕过缓存」，而是让压缩请求「继承缓存」。通过严格复刻主对话的前缀（system prompt + user context + 工具定义），压缩请求从第 N+1 个 token 开始才是新增成本。这相当于在缓存链上「长出」一个新分支，而不是「另起炉灶」。
API 内置 Compaction 功能意味着这个模式已经被固化为平台能力，开发者不需要自己实现 fork 逻辑。这预示着一个更大的方向：**平台级缓存管理**会成为 Agent 基础设施的标准组件。

### 延迟加载的取舍
`defer_loading: true` 策略本质上是**懒计算（Lazy Evaluation）在架构设计层的应用**：不在初始化时做全局展开，而是按需获取完整信息。
这里有一个隐含的权衡：延迟加载把计算成本从初始化阶段转移到了实际使用阶段。对于 MCP 工具这种「可能用到但不一定用到」的 resource，懒加载省下了不必要的 schema 解析；但一旦模型真正需要某个工具，拉取 schema 的延迟会比初始化时就加载更高。
这个 trade-off 在高并发场景下尤其值得注意：如果多个并发请求几乎同时触发同一个延迟工具的加载，cache population stampede（缓存填充踩踏）会导致短期延迟毛刺。Anthropic 可能通过在 API 层实现幂等性和缓存来规避这个问题，但使用方仍需留意。

## 实践启示
### 1. 从第一天起就把缓存策略写进架构设计文档
不要等性能测试出问题再考虑缓存。在写第一个系统 prompt 之前，就明确：哪些内容是「永不变」的（放进第1层），哪些是「本次 session 不变」的（放进第3层），哪些是「每轮都可能变」的（放进第4层）。
建议在架构设计阶段输出一个 **Prompt Layer Map**，明确每层的内容、缓存范围和变更频率。变更频率是分层的唯一标准。

### 2. 强制排序所有结构化数据的序列化
工具定义、文件列表、任何 dict/set 类型的数据结构，在送入 prompt 之前必须排序。对于 JSON 序列化，统一使用 `sort_keys=True`；对于编程语言侧的结构，直接在构造完成后调用排序。
这一条应该在代码规范中明确，并加入 CI 检查——因为 dict 顺序问题在 Python 3.7+ 虽然保持插入顺序，但跨版本迁移或换用其他语言时就可能是坑。

### 3. 用 `<system-reminder>` 而非改 prompt 的心智模型
团队内部推广这个原则时，建议直接说：**prompt 是「宪法」，消息是「日常行政」**。宪法不天天改，日常行政事务走消息通道。
对应到代码实现：创建一个 `append_system_reminder(message)` 方法，而不是提供 `update_system_prompt()` 方法。从工具层面就限制住改 prompt 的路径，强制所有动态信息走消息通道。

### 4. 模型切换前先做缓存 ROI 计算
在考虑切模型之前，先估算：当前缓存命中率 × 平均每 session 节省的 token 数 = 已积累的缓存价值。如果这个价值大于换模型带来的潜在节省，就不值得换。
这个计算不要求精确，但需要一个**定性判断**：「我的 session 已经跑了 20 轮了，换模型不划算」比「我想要更便宜的模型」更能指导决策。

### 5. 设计一个缓存健康仪表盘
Prompt Cache 命中率应该进监控，且告警阈值要严格。如果团队还没有这个指标，第一优先级把它搭起来。告警响应 checklist 建议包括：

- 最近一次部署是否改了 prompt？
- 工具定义顺序最近是否有变更？
- 是否有账号池混用导致缓存隔离失效？
- session 平均长度是否突然下降（说明缓存链根本没建起来）？

### 6. 子 Agent 场景下的缓存策略文档化
当多个子 Agent 并行运行时，每个 Agent 都有独立的缓存链。需要在架构文档中明确：每个子 Agent 的缓存是否需要回收、结果回传时是否需要截断历史、哪个 Agent 负责最终的状态同步。
推荐做法：给每个子 Agent 定义一个 **Cache Budget**（本次 session 允许的最大 token 消耗），超出后主动结束而非等 context window 填满。这比被动式压缩更容易预测成本。

### 7. 压缩请求强制走 Cache-Safe Forking
如果你的 Agent 实现了自定义压缩逻辑，立即检查它是否遵循了 Cache-Safe Forking 原则：压缩请求的前缀是否与主对话完全一致？如果不一致，压缩的成本实际上等于从头重建一个 session，成本是被严重低估的。

### 8. 延迟加载工具要做好 schema 缓存
`defer_loading: true` 的工具 stub 拉取后，如果模型接下来反复使用同一个工具，不要每次都重新拉取 schema。在本地实现一个**工具 schema 缓存**，TTL 可以设长一些（数小时或本次 session 结束），避免重复拉取的网络开销和延迟。

## 相关实体
- [Claude Code Prompt 提示词体系源码解析](ch09/059-claude-code-prompt.html)
- [深度解析 Claude Code 在 Prompt / Context / Harness 的设计与实践](ch09/059-claude-code-prompt.html)
- [Claude Code vs OpenClaw Agent 记忆系统对比](../ch03/075-claude-code.html)
- [开源 AI 知识管理搭档 Obsidian + Claude Code 完整集成指南](../ch03/002-obsidian-claude-code.html)
- [CLAUDE.md 12 条规则：Karpathy 扩展模板](ch09/151-claude-code-1.html)
- [两万字详解Claude Code源码核心机制](../ch03/075-claude-code.html)
- [Claude Code Agent 工程设计](../ch03/067-claude-code-agent.html)
- [Cat Wu — Anthropic Claude Code/Cowork产品负责人](../ch03/075-claude-code.html)
- [Claude Code 工具设计演化](https://github.com/QianJinGuo/wiki/blob/main/concepts/claude-code-tool-design-evolution.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/memory-context-systems.md)

---

