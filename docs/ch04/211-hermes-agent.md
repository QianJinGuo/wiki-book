# Hermes Agent 九模块架构解析

## Ch04.211 Hermes Agent 九模块架构解析

> 📊 Level ⭐⭐ | 11.0KB | `entities/hermes-9-module-architecture-winty.md`

## 9 大模块

### 1. Agent Loop（执行核心）

极简 ReAct 循环：接收输入 → 拼 prompt → 调模型 → 调工具 → 结果喂回 → 直到完成。

每一轮 Loop 都与其他模块"对话"：启动时找 Prompt Assembly，调工具时找 Tool/MCP 要权限，跑一段时间被 Nudge Engine 提醒复盘，跑完触发 Session 写 trajectory。

### 2. Prompt Assembly（系统提示词组装）

system prompt 每次任务现拼，不是写死字符串。拼装内容：SOUL.md（人格）、MEMORY.md（环境事实）、USER.md（用户偏好）、当前激活 Skills、上下文文件。

连接"沉淀的知识"和"当下的执行"的桥梁。

### 3. Memory Store（记忆系统）

两个 markdown 文件：MEMORY.md（环境/项目事实）+ USER.md（用户偏好）。

三个关键设计：有界（token 上限）、声明式（事实陈述）、冻结（snapshot 不被本轮对话污染）。

### 4. Skill Manager（技能系统）

过程式操作手册：When to use + Steps + Verification + Pitfalls。

职责：创建（Review Agent 决定沉淀时）→ 激活（任务相关时拽进 prompt）→ Patch（复用发现不准确时修补）→ 回滚 → 安全扫描。

### 5. Tool / MCP 系统（能力接口）

内置 Tool（文件/命令/网络/环境）+ MCP 协议（外部工具统一接入）。

关键设计：权限分级（无害/有副作用/危险）。

### 6. Nudge Engine（学习触发器）

后台维护计数器：自上次 Memory 更新过去多少轮？自上次 Skill 创建过去多少次任务？这次跑了多少步？

阈值触发 → 给主 Agent 推提醒 → fork Review Agent。

### 7. Review Agent（后台复盘）

独立 fork 的 Agent 实例，不与主 Agent 共用 prompt/任务。输入：对话和操作快照。输出：Memory 写入 / Skill 创建或 Patch。

解耦：主 Agent 专注干活，学习交给独立角色。

### 8. Session / Trajectory Store（执行档案）

SQLite 存储：用户输入、每一步 reasoning、工具调用和返回值、最终输出、时间戳/token/错误。

用途：Review Agent 输入 + 可观测性回放 + 未来评估基础。

### 9. Personality / SOUL.md（人格层）

定义说话风格、价值观底线、拒绝/坚持做什么、性格倾向。

解决两件事：行为一致性 + 价值观护栏。

## 一次任务全链路

用户输入 → Prompt Assembly（拉 SOUL+Memory+USER+Skill 拼 system prompt）→ Agent Loop 调模型 → 模型决定调工具 → Tool/MCP 执行 → 喂回模型循环 → 写进 Session/Trajectory → Nudge 计数器跳一格 → 阈值触发 fork Review Agent → Review Agent 读 Trajectory 决定写 Memory/创建 Skill/Patch Skill → 落盘 → 下次任务 Prompt Assembly 拉到已更新内容。

三条主线交织：执行链（Loop+Tool+Session）→ 学习链（Nudge+Review+Memory+Skill）→ 拼装链（Prompt Assembly+SOUL）。

## 核心观点

自进化 Agent 比普通 Agent 至少多三件事：记住事（Memory）、沉淀做法（Skill）、有人后台复盘（Review）。

Hermes 把"自进化"拆成 6 块工程实体：触发（Nudge）→ 审视（Review）→ 记录（Memory+Skill）→ 回放（Session）→ 加载（Prompt Assembly）→ 执行（Loop+Tool）。每一块都是真实代码、真实落盘文件、真实可复盘数据。

## 深度分析

### 三线解耦架构：执行与学习的正交分离

Hermes 架构最核心的设计决策是将 Agent 的行为分解为三条正交主线：执行链（Loop+Tool+Session）、学习链（Nudge+Review+Memory+Skill）和拼装链（Prompt Assembly+SOUL）。这种解耦带来的工程优势是显著的：执行链路追求低延迟、高吞吐，不需要为学习任务承担额外开销；学习链路则可以独立运行更慢但更深度的推理（如 Review Agent），不受实时性约束。更重要的是，学习链的产物（Memory 和 Skill）以 markdown 文件形式沉淀，与执行链的运行时状态完全隔离——这意味着即使 Agent 崩溃重启，积累的知识不会丢失。相比之下，许多 Agent 实现将记忆和学习混在同一个 ReAct 循环里，导致"一边干活一边反思"的效率损失。

### Skill Manager 的生命周期管理：过程式知识显性化

Hermes 的 Skill 不是简单的 prompt 模板，而是一套完整的"过程式知识"封装：When to use + Steps + Verification + Pitfalls 四段式结构使得每个 Skill 都是可独立验证、可安全复用、可诊断错误的操作手册。这个设计解决了 Agent 工程中一个常见问题：经验知识的"隐性与显性"转化。Review Agent 将实践中的操作经验显性化为结构化的 Skill 文档，而 Skill Manager 的 Patch 机制则允许这些文档在后续使用中被迭代修正。Skill 的创建→激活→Patch→回滚→安全扫描的完整生命周期，本质上是一个小型的知识管理 CI/CD 流程。

### Nudge Engine：隐式经验到显式知识的触发器设计

Nudge Engine 的计数器机制（轮次计数、任务计数、步数计数）是一个精巧的隐式经验捕获设计。与让 Agent 主动决定"什么时候该学习"不同，Hermes 选择了被动的阈值触发模式——这避免了主 Agent 在执行和学习之间的注意力分散，也避免了主动反思可能带来的决策疲劳。阈值触发后 fork 独立 Review Agent 的设计则进一步解耦了学习和执行：Review Agent 可以运行更慢、更彻底的推理，而不会阻塞主 Agent 的响应。这种"触发-解耦"模式是 Hermes 区别于单循环 Agent 的关键工程选择。

### Prompt Assembly 的动态拼装：版本化知识的增量加载

与大多数 Agent 将 system prompt 视为静态字符串不同，Hermes 的 Prompt Assembly 在每次任务执行时动态拼装 system prompt，素材包括 SOUL.md、MEMORY.md、USER.md、当前激活 Skills 和上下文文件。这种设计的深层逻辑是：每次任务的执行上下文都不同（项目环境、用户偏好、当前激活的 Skills），因此 system prompt 应该是这些输入的函数而非固定字符串。更重要的是，Memory 的"冻结"设计确保了 Review Agent 写入的知识不会污染当前执行轮的 prompt——这是一个关键的隔离保证：学习发生在独立的时间窗口，而非在同一个推理循环内。

### SOUL.md 的人格层：行为一致性的宪法保障

SOUL.md 作为人格层，解决的不是"Agent 说什么"的问题，而是"Agent 绝对不能说什么/做什么"的底线问题。将其与 Prompt Assembly 解耦、作为独立文件维护，意味着人格约束是跨任务持久生效的，而不是被每次任务的动态 prompt 覆盖。这是一种"宪法+普通法"的分层治理模式：SOUL.md 定义不可违背的价值观底线（拒绝/坚持做什么），而 Skill 和 Memory 则在底线之上填充具体的操作经验。

## 实践启示

### 构建分离式学习架构

在设计生产级 Agent 时，应将执行链路和学习链路严格分离——主 Agent 循环专注低延迟响应，后台独立的学习/反思组件负责知识积累。这种分离不仅提升了实时响应能力，还使得学习过程可以在不阻塞主任务的情况下进行深度推理。Review Agent 的 fork 模式是这一设计原则的具体实现参考。

### 用结构化 Skill 封装经验知识

将 Agent 在实践中积累的操作经验从隐性的"感觉"转化为显性的 Skill 文档时，应采用过程式结构（When to use + Steps + Verification + Pitfalls）而非简单的 prompt 模板。每个 Skill 应该能回答：这个问题什么时候该用它？具体步骤是什么？怎么验证成功？已知有哪些坑？这种结构使得 Skill 不仅可以被 Agent 调用，还可以被人类审查、修正和版本化管理。

### 阈值触发的隐式经验捕获

避免让主 Agent 主动决定何时学习——这种方式容易导致注意力分散和决策疲劳。改用阈值触发机制（轮次、任务数、步数等可量化指标）来驱动学习流程，将"是否该反思"这个元认知决策外包给计数器而非 Agent 自身。这种被动触发模式在工程实现上更简单可靠，同时确保了学习发生的频率与实际工作强度成正比。

### 记忆冻结隔离学习与执行

在 Memory 系统的设计中，应确保 Review Agent 写入的知识（冻结快照）不会污染当前执行轮的上下文。这可以通过在 prompt 拼装时只引用"已提交"的 Memory 文件，而非"正在写入中"的版本来实现。这种冻结机制不仅保证了执行上下文的确定性，还使得知识积累过程可审计、可回滚——每次学习的结果都是一次独立的快照，而非对主循环状态的直接修改。

### 人格约束作为独立持久层

将行为约束（SOUL.md）与动态内容（Memory、Skill）分层管理，确保价值观底线不受任务上下文影响。SOUL.md 应该定义 Agent 的"宪法级"约束——什么绝对不能做、什么必须坚持——这些约束在每次任务中都生效，不因为具体任务的 prompt 拼装而被覆盖。这是一种比在 system prompt 里塞约束更可靠的分层治理策略。

## 架构图
→ [C4 架构图](assets/c4/hermes-9-module-architecture-winty-c4.html)

## 相关实体
- [Claude Code Search Architecture Tencent 2026](../ch03/076-claude-code.html)
- [Openclaw Prompt Context Harness](../ch11/227-openclaw.html)
- [Fudan Peking Ahe Agentic Harness Engineering](ch04/236-ahe-agentic-harness-engineering.html)
- [Loongsuite Genai Semconv Alibaba](ch04/446-loongsuite-genai.html)
- [Agent Evolution Four Stages Six Dimensions Aliyun](../ch03/046-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/hermes-9-module-architecture-winty.md)

---

