# 深度拆解 Hermes Agent 记忆系统：它修正了 OpenClaw 的哪层误区？

## Ch04.412 深度拆解 Hermes Agent 记忆系统：它修正了 OpenClaw 的哪层误区？

> 📊 Level ⭐⭐ | 6.4KB | `entities/深度拆解-hermes-agent-记忆系统它修正了-openclaw-的哪层误区.md`

# 深度拆解 Hermes Agent 记忆系统：它修正了 OpenClaw 的哪层误区？
架构师（JiaGouX）  我们都是架构师！

## 相关实体
- [Ai Agent 的迁移与现代化 使用 Amazon Bedrock Agentcore 将 Openclaw 从单机改造为多租户 Serverless 架构 ](ch04/150-ai.md)
- [Hermes Agent Vs Openclaw Comparison](ch03/044-agent.md)
- [Skill System Design Three Way Comparison](ch04/245-skill.md)
- [Hermes Agent Goal Runtime Architecture State Persistence Judge Closed Loop](ch03/044-agent.md)
- [Hermes Agent K2 6 Multi Agent](ch03/044-agent.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/深度拆解-hermes-agent-记忆系统它修正了-openclaw-的哪层误区.md)

## 深度分析

Hermes 的记忆系统之所以值得单独拆解，不在于它功能更全，而在于它对"记忆"这件事做了更彻底的工程化拆解。OpenClaw 的记忆方案本质上是一个更大的"口袋"——把所有历史、偏好、文件索引都扔进 memory plane，按需检索。这种做法有两个隐患：一是记忆边界模糊导致的管理困境，二是每次召回都可能冲击 prompt cache 成本模型。

Hermes 的核心洞察是把"记忆"这个动词拆成四个完全不同的问题：

**第一层：热记忆的护城河是稳定性而非容量。** MEMORY.md 和 USER.md 加起来不到 4KB，全部作为 frozen snapshot 注入系统提示词。这意味着每次 API 调用都会带着它，但它本身几乎不变——这正是 prompt caching 最喜欢的 pattern。相比之下，OpenClaw 的记忆会随使用增长，缓存命中率会持续下降，而 Hermes 的热记忆是设计阶段就锁定的常量。

**第二层：档案室和随身本不是一回事。** session_search 解决的是"上次那个 Docker 问题怎么处理的"这类长尾回忆，用 FTS5 + 摘要召回。但这类信息不该进热记忆，因为它们的召回是事件驱动的，不是每轮都需要。OpenClaw 没有显式区分这两层，导致热记忆容易被低频信息污染。

**第三层：memory flush 是压缩的checkpoint。** 大多数 Agent 在长会话压缩时只是把历史变短，但 Hermes 在压缩前会先让模型把"值得长期记住的事实"写入记忆，再压缩旧历史，最后重建 prompt cache。这个顺序很关键：它把状态迁移从"被动压缩"变成了"主动整理"。

**第四层：Skills 是元层，不是记忆层。** Skills 回答的是"这类任务下次怎么做"，而不是"这次发生了什么"。把它和历史检索放在同一个存储引擎里是错误的——前者是程序性知识，后者是事件性知识。Hermes 用 skills index + 按需加载的机制处理这个问题，和 Claude Code Subagents 的思路一致。

OpenClaw 被误读的那层记忆观，本质上是把"记住更多"当成了目标。Hermes 的回答更务实：先问这条信息属于哪一层，再问它应该以什么成本被召回。

## 实践启示

如果正在设计或改进一个 Agent 的记忆系统，有几个具体的决策点值得落地：

**热记忆的写入要设置硬性边界。** MEMORY.md 和 USER.md 的字符限制不是技术约束，是设计选择。它强制你只能放"每次都影响行为"的高价值事实。一旦放开这个边界，热记忆会随使用膨胀，最终每轮都带着一堆低频信息跑。建议设置 2-3KB 的严格上限，并用工具校验代替人工管理。

**history search 和 memory search 要解耦。** 多数系统用同一个向量库处理"找相关历史"和"召回用户偏好"，但这两者的召回方式、使用频率、更新模式完全不同。前者适合 FTS + 摘要，后者适合结构化 KV。用一个引擎处理会增加系统复杂度而没有收益。

**压缩前必须有 memory flush 步骤。** 长任务运行中，定期触发一个"把当前状态写入 durable memory"的checkpoint，再压缩历史。这是防止"会话结束后记忆全丢"的最直接方案。具体实现不复杂：压缩前调用一次模型，只开放 memory 工具，让它决定哪些事实该从 ephemeral history 迁移到 persistent memory。

**Skills 要有独立生命周期。** 技能文件需要支持版本化、修补、删除和范围标注。一个写坏的 skill 比一段普通错误更危险，因为它会反复触发。建议为每个 skill 附带：适用范围、验证步骤、已知失败模式。

**外部用户建模要慎用。** Honcho 这类外部 provider 适合深度用户画像，但会带来隐私、权限、同步问题。先把热记忆、历史检索、skill 生命周期跑清楚，再考虑是否引入外部建模层。

**观测记忆使用是底线。** 至少要能回答：哪些条目进了 prompt、哪些来自历史检索、哪些 skill 被触发、压缩前写了什么。不观测记忆使用，系统迟早会积累一堆没人敢删的过期状态。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/深度拆解-hermes-agent-记忆系统它修正了-openclaw-的哪层误区.md)

---

