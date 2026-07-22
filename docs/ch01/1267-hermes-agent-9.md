# Hermes Agent 9 模块系统架构

## Ch01.1267 Hermes Agent 9 模块系统架构

> 📊 Level ⭐⭐⭐ | 6.3KB | `entities/hermes-9-module-architecture.md`

## 三条主线
| 链路 | 模块 | 职责 | 
|------|------|------| 
| **执行链** | Agent Loop + Tool/MCP + Session Store | 干活 | 
| **学习链** | Nudge Engine → Review Agent → Memory Store → Skill Manager | 复盘沉淀 | 
| **拼装链** | Prompt Assembly + SOUL.md | 知识注入 | 

## 9 大模块速览
| # | 模块 | 一句话 | 
|---|------|--------| 
| 1 | **Agent Loop** | ReAct 循环心脏，每轮与其他 8 模块对话 | 
| 2 | **Prompt Assembly** | system prompt 每次现拼，连接「沉淀」与「执行」 | 
| 3 | **Memory Store** | MEMORY.md + USER.md，有界/声明式/冻结 | 
| 4 | **Skill Manager** | 操作手册（触发+步骤+验证+坑），支持创建/激活/Patch/回滚/安全扫描 | 
| 5 | **Tool/MCP** | 内置工具 + MCP 协议接入，权限分级（无害/副作用/危险） | 
| 6 | **Nudge Engine** | 后台计数器，阈值触发复盘提醒 | 
| 7 | **Review Agent** | 独立 fork，读 Trajectory 决定写 Memory/创建 Skill/Patch | 
| 8 | **Session/Trajectory Store** | SQLite 执行档案，供 review + 回放 + 评估 | 
| 9 | **SOUL.md** | 人格层：风格/价值观/底线/护栏 | 

## 一次任务全链路
用户输入 → Prompt Assembly（拉 SOUL+Memory+USER+Skill 拼 system prompt）→ Agent Loop → 调工具 → Tool/MCP 执行 → 写 Session → Nudge 计数 → 阈值触发 → fork Review Agent → Review Agent 读 Trajectory → 落盘 Memory/Skill → 下次任务 Prompt Assembly 更新。

## 关键设计理念
- **学习拆成 6 块实体**：触发/审视/记录/回放/加载/执行，每块都可测、可治理、可企业化
- **解耦原则**：主 Agent 专注干活，Review Agent 专注学习，Nudge Engine 负责触发，互不干扰
- **工程化 > 玄学**：自进化不是 prompt 里的空话，是有真实代码、落盘文件、可复盘数据的工程系统
→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/hermes-9-module-architecture-winty.md)

## 深度分析
### 执行链与学习链的进程解耦
Hermes 架构的核心分隔之一，是将执行代理（Agent Loop）和学习代理（Review Agent）通过 fork 机制严格分离。执行链专注干活（ReAct 循环 + 工具调用），学习链专注复盘（Review Agent 读 Trajectory 写 Memory/Skill），两者不共享 prompt 上下文，也不在同一进程阻塞运行 。这种解耦保证了学习不增加主链路延迟，也不因学习结果污染执行环境。

### Prompt Assembly 的动态拼装机制
Prompt Assembly 每次任务执行时动态拼装 system prompt，而非使用写死字符串。拼装来源包括：SOUL.md（人格层定义行为风格和价值观底线）、MEMORY.md（项目环境事实）、USER.md（用户偏好）、当前激活的 Skills（操作步骤）。这一机制将「历史沉淀」与「当下执行」通过工程化的组装流程连接，而非靠 prompt 注入的隐式记忆 。

### Memory Store 的有界冻结设计
Memory Store 两个文件（MEMORY.md + USER.md）的设计体现了三个关键原则：有界（token 上限防止无限膨胀）、声明式（事实陈述而非对话记录）、冻结（snapshot 不被本轮对话污染）。这三项设计使得记忆系统在长期运行中保持可管理性和可靠性，而非退化为难以检索的对话历史堆叠 。

### Skill 的生命周期管理体系
Skill Manager 将过程性知识封装为标准化操作手册（When to use + Steps + Verification + Pitfalls），并通过工程化的生命周期管理（创建→激活→Patch→回滚→安全扫描）保证复用准确性。相比松散的 prompt 片段积累，Skill 系统提供了版本化、可验证、可回滚的治理能力 。

### Nudge Engine 的计数器触发与 Review Agent 联动
Nudge Engine 后台维护三组计数器：距上次 Memory 更新的轮数、距上次 Skill 创建的任务数、当前任务步数。阈值触发后推送提醒给主 Agent，并 fork 出独立的 Review Agent 实例进行复盘。这种触发-解耦-写入的链路设计，将学习行为从被动的模型反思升级为可量化、可配置的主动机制 。

## 实践启示
1. **动态 Prompt 替代静态字符串**：避免将 system prompt 写死为固定文本，改为在每次任务执行时从 SOUL、Memory、User 偏好、激活 Skills 等模块动态拼装，使系统能感知历史沉淀并据此调整行为。
2. **异步学习链路与主执行解耦**：将 Review Agent 等学习组件设计为独立 fork 的进程或服务，而非主执行循环的同步步骤，确保学习不增加用户可见延迟，学习结果通过规范接口（如落盘文件）异步写回。
3. **为 Memory 系统设置有界约束**：明确 token 上限和 snapshot 隔离机制，防止长期运行中记忆系统膨胀失控。快照设计确保本轮对话不会污染已沉淀的历史知识。
4. **建立 Skill 生命周期管理规范**：定义完整的 Skill 创建、激活、Patch、回滚和安全扫描流程，使跨任务的知识复用可验证、可治理，而非依赖 prompt 片段的松散积累。
5. **配置多维度 Nudge 触发阈值**：通过计数器组合（轮数/任务数/步数）设置学习触发条件，避免仅依赖单一指标，实现更精细化的自进化节奏控制。

## 相关实体
- [AI Agent Gateway 架构设计 — OpenClaw/Claude Code/Hermes 三框架对比](../ch11/227-openclaw.html)

---

