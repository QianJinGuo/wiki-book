# Hermes Agent 记忆系统深度拆解

## Ch04.078 Hermes Agent 记忆系统深度拆解

> 📊 Level ⭐⭐ | 19.0KB | `entities/hermes-agent-memory-system-vs-openclaw.md`

[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-agent-memory-system-vs-openclaw.md)

# Hermes Agent 记忆系统深度拆解
> Source: https://mp.weixin.qq.com/s/0n5aw2I0yoyHS7W5fQ6ydA
> Author: 架构师（微信公众号，JiaGouX）
> Published: 2026-04-30
> Reference: Manthan Gupta — Fixes What OpenClaw Got Wrong

## 文章摘要
核心论点：Hermes 没有做"更强大的记忆"，而是把记忆的**成本账**算得更细。它把不同类型的信息放入成本和用途完全不同的机制，避免把所有东西混在一个越来越大的 memory 口袋里。

## Hermes 四层记忆体系
| 层级 | 存储位置 | 默认容量 | 定位 |
|------|---------|--------|------|
| **热记忆** | MEMORY.md + USER.md | 2,200 + 1,375 字符 | 每轮都该知道的事实和偏好 |
| **会话检索** | session_search (SQLite + FTS5) | 无硬上限 | 档案室，"上次那个问题怎么处理的" |
| **程序性记忆** | Skills (~/.hermes/skills/) | 无硬上限 | SOP，这类任务下次怎么做 |
| **深层用户建模** | Honcho（外部 provider） | 可选 | 跨平台/跨设备长周期画像 |
**容量设计细节**：MEMORY.md 和 USER.md 用**字符限制**而非 token 限制，不需要依赖某个模型的 tokenizer，实现朴素但稳定、可预测、少耦合。

## 核心设计原则
### 1. 不轻易改系统提示词
MEMORY.md 和 USER.md 在会话开始时作为 **frozen snapshot** 注入系统提示词。会话中途写入新内容，新内容会**立刻落盘**，但**不会立刻改掉当前会话已经构建好的 system prompt**。
**原因**：保护 prompt cache。如果前面的系统提示词部分频繁变化，模型供应商侧的 prompt caching 就很难命中。
**取舍**：牺牲一点即时性，换来更稳定的缓存命中和更可控的提示词结构。

### 2. memory 工具设计
```json
{ "add", "replace", "remove" }
```

- **没有复杂的"读"动作**：当前记忆在会话开始时已注入，模型不需要再读一遍。
- **replace 和 remove 用子字符串匹配**：模型不需要记住内部 ID，只需要拿现有条目里一段唯一文本来操作。
- **安全边界**：写入前检查危险内容——提示词注入、凭证泄露、SSH 后门暗示、不可见 Unicode 字符。
> **记忆是提示词供应链的一部分**。普通日志里混进恶意文本，影响范围有限；长期记忆里混进"忽略之前所有指令"，会在后续很多会话里反复污染系统状态。

### 3. 压缩前的 memory flush
长会话一定会遇到压缩。Hermes 在压缩**前**先做一次 memory flush：
1. 给模型专门指令：会话即将被压缩，请先保存值得长期记住的内容（用户偏好、修正、重复模式，**不要**保存一次性任务细节）
2. 运行一次额外模型调用，只开放 memory 工具
3. 把稳定事实写入 durable memory（MEMORY.md / USER.md）
4. 压缩旧历史，重建 prompt cache
5. 新热记忆进入新的稳定提示词快照
**流程**：长会话 → 压缩前保存稳定事实 → 压缩旧历史 → 重建提示词 → 带着更新后热记忆继续
> **记忆压缩不能只理解成把历史变短，而是把任务状态迁移到更稳定的位置。** 

### 4. session_search：档案室不等于随身备忘录
当模型需要回忆以前聊过什么时：
1. FTS5 在历史消息里搜索
2. 按 session 聚合结果
3. 解析父子会话关系（parent_session_id）
4. 加载最相关的会话
5. 在匹配点附近截断 transcript
6. 用便宜的辅助模型做 focused summary
7. 把压缩后的回顾交还给主模型
**边界清晰**：MEMORY.md 负责"我每次都要知道什么"；session_search 负责"用户说上次那个问题时，我怎么找回来"。
> **档案室很重要，但没人会把档案室背在身上。** 

### 5. Skills：Agent 也要记住做事方法
Skills 放在 ~/.hermes/skills/，称为 **procedural memory**（程序性记忆）。

- 事实记忆回答"环境是什么、用户偏好是什么"
- 会话检索回答"以前发生过什么"
- Skills 回答"下次遇到类似任务，应该怎么做"
**注入策略**：注入的是紧凑的 skills index，真正需要时再加载完整 skill。主上下文只保留当前推理需要的高密度信息。
> Skills 是 Agent Runtime 里的 SOP。它的价值不在"越来越有灵性"，而在于把团队和系统已经验证过的做事方法，变成可检索、可更新、可审查的运行时资产。

### 6. Honcho：深层用户建模也要守住缓存边界
- **第一轮**：预取到的 Honcho 上下文织入系统提示词
- **后续轮次**：不改稳定 system prompt，把 Honcho recall 附加到当前用户消息附近，API 调用时动态提供
**好处**：稳定前缀继续稳定 → prompt cache 继续发挥作用 → 深层用户建模不破坏缓存
**谨慎点**：深层用户建模带来更重的治理问题——用户是否知道哪些信息被保存，怎么删除，跨平台同步时权限怎么处理，外部 provider 出错时如何回滚。

## Hermes vs OpenClaw 系统重心差异
|  | OpenClaw | Hermes |
|--|---------|--------|
| **系统重心** | Gateway、workspace、入口治理、多 Agent、工作区隔离、可控执行、可审计 | cache-aware 执行型 runtime |
| **记忆厚在** | Memory plane + workspace | 热记忆 + 会话检索 + Skills |
| **哲学** | 把长期状态放进工作区和记忆平面里管理 | 先保护提示词稳定性，再把长期资产拆到各层 |
**不是谁更好，而是各自的擅长领域不同**：

- 目标是多入口、长期在线、强治理的 Agent Gateway → OpenClaw 那套控制面和工作区边界很有价值
- 目标是本地执行型 Agent，强调缓存成本、长任务连续性、过程经验沉淀 → Hermes 的分层值得研究
**真正被修正的不是"OpenClaw 没有记忆"，而是一种很容易出现的记忆观**：
> 只要把更多东西存下来、搜回来、塞给模型，Agent 就会越来越好用。
这句话有一半是对的（长期 Agent 确实需要记忆），但另一半绕不开：更多记忆会带来更多成本——全部塞进提示词会破坏缓存；全部交给历史搜索，召回质量和摘要质量就成了瓶颈；流程经验留在 transcript 里下次难以稳定复用；错误经验沉淀成 skill 又会在未来反复误导 Agent。
**共同方向**：Agent 不能只靠一个越来越长的聊天历史活着。它需要窗口外的状态层，也需要能把状态分门别类放好。

## 给自研 Agent 的三个小问题
1. **什么信息配得上进入热记忆？** → 用户偏好、环境事实、稳定约定可以进；任务进度、完成日志、一次性 TODO 留在别的层。一旦进入 system prompt，按提示词供应链做输入校验和安全扫描。
2. **历史会话有没有档案层？** → 保存完整事件或消息，提供关键词搜索、按 session 聚合、局部截断和摘要召回。用户问"上次那个问题"时，系统应该能查。
3. **压缩前有没有状态迁移动作？** → 长任务压缩前，最好有一轮明确的 durable state extraction。别等历史已经被摘要磨薄了，才发现关键事实没留下来。

## 深度分析
### 记忆的本质：不是存储，是成本分配
Hermes 对记忆系统的重构，本质上回答了一个更底层的问题：**当上下文窗口不再是无限资源时，Agent 应该把不同信息放在哪里？**
传统思路是"记忆越强大越好"——更多存入、更多召回、更多塞给模型。但 Hermes 的思路是**按成本分类**：热记忆成本最高（直接影响每次 token 消耗），档案层成本中等（召回时才有开销），Skills 层成本最低（按需加载，不占主上下文）。这个分层的背后是 token 经济的精确计算。
字符限制 vs token 限制的选择也值得注意。用字符而不是 tokenizer 模型的 token 数量做配额，意味着容量上限与模型解耦——换模型不会导致记忆容量突然变化。这是一种刻意为之的**稳定性选择**，用可预测性换取精确性。

### Frozen Snapshot 机制：缓存友好的设计
系统提示词在会话开始时被"冻结"成 snapshot，之后的热记忆写入只落盘、不改 prompt cache。这个设计解决了 LLM 应用中一个容易被忽视的问题：**每次 system prompt 变化都会使供应商侧的 prompt cache 失效**。
对于日均处理大量会话的 Agent runtime，prompt cache命中率直接影响响应延迟和成本。Frozen snapshot 的代价是记忆的即时性略有牺牲——新写入的内容不会立刻影响当前会话的推理。但这个代价是有意的：等到会话结束或压缩节点再做合并，缓存命中更稳定。
Honcho 的处理方式进一步印证了这个思路：预取数据在第一轮注入系统提示词，后续轮次把动态 recall 附加到用户消息附近，而不是改动稳定前缀。两层记忆（热记忆/Honcho）在缓存策略上形成了明确的分工：稳定的进前缀，动态的靠调用时参数传入。

### Memory Flush 的真正意义：状态迁移而非历史截断
压缩前的 memory flush 机制，是 Hermes 最值得单独拎出来讨论的设计。大多数 Agent 在长会话压缩时只是把历史摘要变短，但 Hermes 明确在这个节点插入了一个**状态迁移动作**：
压缩前 → 模型专门做一轮 memory extraction → 稳定事实写入 durable memory → 历史压缩 → 重建 prompt cache → 带着新热记忆继续
这个流程的核心洞察是：**长会话中真正有价值的信息，往往不是"历史上说了什么"，而是"环境/偏好/约定发生了什么变化"**。前者是事件记录，后者是状态更新。前者可以被安全压缩，后者必须迁移到稳定层。
如果跳过这一步，压缩后的 Agent 会丢失那些只在历史里出现过的偏好和事实修正——这些信息在摘要中很难被保留，却在下一会话中至关重要。

### session_search 的技术选型：FTS5 + SQLite
用 SQLite + FTS5 而不是向量搜索做会话检索，这个选择值得琢磨。向量检索适合语义相似性搜索，但会话检索的核心需求是**精确召回**：用户说"上次那个关于 SSH 配置的问题"，需要的不是语义相近的片段，而是那次会话的完整上下文和父子关系。
FTS5 的关键词搜索 + SQLite 的 session 聚合 + parent_session_id 的关系追踪，构成了一个针对时序事件的检索管道。辅助模型做 focused summary 则把最终的信息压缩工作交给了便宜的小模型，主模型只消费处理好的结果。这种**分离职责**的做法在延迟和成本上都有收益。

### Skills 的边界：SOP 不是知识库
Skills 作为程序性记忆，与常见的"知识库检索"有本质区别。知识库回答的是"X 是什么"，Skills 回答的是"遇到 Y 类型的任务，应该按什么步骤做"。前者是信息查询，后者是流程复用。
Hermes 的 skills 注入策略（index 按需加载完整 skill）也是一种成本控制：主上下文只保留推理直接需要的高密度信息，流程细节在需要时才展开。这与 memory 的分层逻辑一脉相承——**任何信息都有它该在的位置，不该全部堆在主上下文里**。

### OpenClaw 对比：两种 Agent 范式的根本差异
OpenClaw 和 Hermes 代表了两种 Agent 架构思路：
**OpenClaw** 走的是 Gateway/Control Plane 路线——强调入口治理、多 Agent 协作、工作区隔离、可控执行。它的记忆厚在 memory plane 和 workspace，核心是把 Agent 状态纳入企业级治理框架。这套体系在**多入口、长期在线、需要强审计**的场景下很有价值。
**Hermes** 走的是 Cache-Aware Runtime 路线——强调每次调用的 token 经济、prompt cache 命中稳定、长任务连续性。它的记忆厚在热记忆 + 会话检索 + Skills，核心是把记忆系统当作提示词供应链的一部分来设计。
两者并不互斥。一个结合了 OpenClaw 的控制面和 Hermes 的 cache-aware runtime 的混合架构，可能是更完整的方案。但对于专注于**本地执行型 Agent**的团队，Hermes 的分层记忆体系提供了更直接的参考实现。

## 实践启示
### 1. 先算成本，再设计记忆
在设计 Agent 记忆系统之前，先回答：热记忆每次推理都会被注入，它的 token 成本是多少？向量检索的延迟能否接受？Skills 加载的 I/O 开销在不在容许范围内？不同信息的召回频率和召回成本差异巨大，先算清楚成本账，再决定放哪一层。

### 2. 用字符限制而非 token 限制管理热记忆容量
如果热记忆用 token 配额，换模型时容量会变，容量设计就和模型选择耦合了。用字符限制可以保持容量边界稳定，实现更可预测的记忆管理。这个细节虽小，但在长期维护中省去很多意外的容量调整。

### 3. 保护 prompt cache 不要只靠"不改变系统提示词"
真正的 cache 友好设计是**让稳定前缀尽可能稳定**，但同时为动态信息预留清晰的注入路径。Honcho 的做法值得借鉴：预取数据进前缀，动态 recall 附加到用户消息层。搞清楚哪些该冻、哪些该放调用参数，比单纯"不变"要更有效率。

### 4. 压缩节点是记忆设计的试金石
一个记忆系统设计得好不好，看它在长会话压缩时会不会丢失关键信息。在压缩逻辑里加入显式的 state extraction 步骤，确保用户偏好、环境变化、修正记录在历史压缩前迁移到 durable memory。这个动作做和不做，长期来看差异巨大。

### 5. session_search 不要照搬向量检索
会话检索的核心需求是**事件召回**而不是语义相似。FTS5 + SQLite 的组合对这类场景更合适：按 session 聚合父子关系，截断局部 transcript，用辅助模型做 focused summary。如果直接上向量检索，可能召回的是语义相似但不属于同一次会话的内容，干扰反而更大。

### 6. Skills 是流程资产，不是知识资产
建 Skills 时想清楚它回答的是"怎么做"还是"是什么"。前者是程序性记忆，后者是知识库。两者的更新频率、格式要求、注入策略都不同。混在一起会导致 Skills 越来越难维护，最终失去"可检索、可更新、可审查"的初衷。

### 7. 深层用户画像要在治理框架完备后再上
Honcho 这类外部 provider 引入深层用户建模，但带来了额外的治理复杂度：用户知情权、数据删除权、跨设备同步的权限处理、provider 出错时的回滚机制。如果这些治理问题没有想清楚，深层画像宁可慢一点上，也不要留下用户信任和合规风险。

## 相关实体
- [深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践](../ch11/226-openclaw.html)
- [MemOS Hermes 记忆插件](https://github.com/QianJinGuo/wiki/blob/main/entities/memos-hermes-plugin.md)
- [深度拆解 Hermes Agent 记忆系统](../ch03/092-hermes-agent.html)
- [17种Agent架构演进：控制流设计的完整演化史](ch04/665-17-agent.html)
- [AIAIGC峰会嘉宾阵容](ch04/504-aiaigc.html)
- [OpenClaw 完全指南：这可能是全网最新最全的系统化教程了！（3.2W字，建议收藏）](../ch11/226-openclaw.html)
- [Agent Memory 架构解析](ch04/121-agent-memory.html)
- [Claude Code Prompt 提示词体系源码解析](../ch09/060-claude-code-prompt.html)
- [Hermes Agent vs OpenClaw 对比分析](../ch03/092-hermes-agent.html)
- [AutoClaw 使用体验：自带 66 个 Skill、可接入聊天工具、安全性高](ch04/267-skill.html)
- [深度解析LLM Wiki / Obsidian-Wiki / GBrain：Agent时代知识的"自组织"与"自进化"](../ch01/653-llm-wiki-obsidian-wiki-gbrain.html)
- [hermes-agent-self-evolving-source-analysis](../ch03/092-hermes-agent.html)
- [从多智能体编排到AI自主决策：资损防控体系的架构演进](../ch05/088-ai.html)
- [Agent 原理、架构与工程实践](../ch03/046-agent.html)
- [Agent 与后端统一架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-backend-unification.md)
- [Karpathy LLM Wiki V2](https://github.com/QianJinGuo/wiki/blob/main/concepts/karpathy-llm-wiki-v2.md)
- [Hermes Agent 三级 Memory 架构解析（One掌柜视角）](../ch03/092-hermes-agent.html)

- [AI Agent 记忆系统架构](ch04/156-how-ai-agent-memory-works.html)
- [Agent Memory System Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-system-design.md)
- [AI Agent 工程师能力地图](ch04/030-ai-agent.html)

---

