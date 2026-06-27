# Anthropic Claude Managed Agents 平台正式发布

## Ch01.181 Anthropic Claude Managed Agents 平台正式发布

> 📊 Level ⭐⭐ | 23.0KB | `entities/anthropic-claude-managed-agents-platform-2026.md`

## 概述
本文介绍 Anthropic 正式开放 Claude Managed Agents 平台，系统性拆解其四大新功能模块：Managed Agents（四核心抽象）、Multiagent Sessions（多 Agent 协作）、Outcomes Loop（结果驱动自我评估）、Webhooks（异步通知）、Dreams（记忆整理）。Anthropic 的战略意图是将 Claude 从"调用模型"转变为"能代你把事情做完的系统"。

## 四大新功能
### 1. Managed Agents 四核心概念
| 概念 | 含义 |
|------|------|
| **Agent** | 定义的角色——用哪个模型、系统提示、能用哪些工具和 MCP 服务器 |
| **Environment** | 运行容器——预装 Python/Node.js/Go，配置好网络访问规则 |
| **Session** | 一次具体的任务执行实例 |
| **Events** | 应用与 Agent 之间互发的消息流 |
**定位对比**：Messages API 直接调模型（精细控制），Managed Agents 是预建好的 Agent 运行框架（长时间异步任务）。

### 2. Multiagent Sessions（多 Agent 协作）
- 协调者 Agent 将子任务分配给专门的执行者 Agent
- 各自独立上下文窗口（互不干扰），共享同一文件系统（可以读写对方产出）
- **线程机制**：主线程是协调者事件流；子线程在委派时动态创建并保持上下文持久化——协调者可以随时与之前召唤过的子 Agent 继续聊
- **一层委派限制**：协调者可调用子 Agent，但子 Agent 不能再调用其他 Agent（研究预览阶段的合理安全边界）
- 本质：智能体编排终于做成了

### 3. Outcomes Loop（结果驱动自我评估）
解决根本问题：Agent 怎么知道任务做好了？

- 用户提供 **Rubric 评分标准**（如：收入预测用5年历史数据、增长率假设明确说明、产出 xlsx 等）
- Agent 完成后，召唤独立的**评分者 Agent** 打分（执行者与评分者用独立上下文窗口隔离，防止自欺）
- 评估结果：`satisfied`（达标，结束）/ `needs_revision`（需修改，继续迭代）/ `max_iterations_reached`（达最大迭代次数）
- 本质：**"计划-执行-评估-修正"闭环**，默认 max_iterations=3，最多可设20次

### 4. Webhooks（异步通知机制）
- 配置 HTTPS 回调地址，任务完成后推送通知
- 支持多种事件类型：`session.status_idled`（任务完成）、`session.outcome_evaluation_ended`（评估结束）等
- 每次推送含事件类型+ID，再 GET 拉取完整数据（防止重试导致过期数据）
- **签名验证**：X-Webhook-Signature 头，超过5分钟 payload 被拒绝
- 意义：Agent 从"工具"（需一直握着）向"服务"（委托出去等结果）进化

### 5. Dreams（记忆整理）
- 背景：Session 积累后记忆库会产生重复、过时、矛盾的内容
- 异步任务：让 Claude 后台读取多个历史 Session 记录，对记忆库做整理（合并重复、用新覆盖旧、提炼新模式）
- **非破坏性**：输出全新的整理后的记忆库，原记忆库不被修改，可先审查再决定是否采纳
- 模拟人类睡眠时的记忆整理过程
- 单次最多支持100个 Session，目前支持 `claude-opus-4.7` 和 `claude-sonnet-4.6`
- **战略意义**：在 Agent 应用层面实现持续优化，不依赖模型重新训练

## 战略判断
> **"Anthropic 不只是在卖模型能力，而是在构建一套 Agent 运行的基础设施。"**
| 维度 | 从"调用"到"托管" |
|------|----------------|
| 计算环境 | Anthropic 接管 |
| 工具执行 | Anthropic 接管 |
| 上下文管理 | Anthropic 接管 |
| 开发者职责 | 只定义 Agent"职责" |

- **Outcomes Loop**：让 Agent 输出质量有可量化度量，是从"实验品"变"可信任工作流节点"的关键
- **Multiagent**：让 AI 有"组织结构"，是从单个 AI 向 AI 工作流系统跨越
- **Dreams**：让 Agent 从静态执行系统变成会随使用越来越好的系统

## 技术细节
- Webhook 签名验证机制（X-Webhook-Signature，超过5分钟拒绝）
- Multiagent 目前只支持一层委派（安全边界）
- Outcomes Loop 评分者与执行者上下文窗口刻意隔离
- Dreams 非破坏性输出，可审查后再采纳
- Multiagent Sessions、Outcomes、Dreams 均处于研究预览阶段，需单独申请权限

## 深度分析
### 平台定位：从"模型供应商"到"Agent 基础设施运营商"
Anthropic 此次发布的意义远超功能迭代。从战略层面看，这是 Anthropic 第一次明确将自己定位为 **Agent 基础设施提供商**，而非单纯的模型供应商。Messages API 仍然面向需要精细控制的开发者，而 Managed Agents 则面向希望将 AI 能力快速产品化的团队。这一转变意味着 Anthropic 在与 OpenAI、Google 的竞争中，选择了一条"垂直整合 + 平台化"的路径——不只是卖模型，而是卖一整套能让 AI Agent 真正落地的运行时环境。

### 核心创新：Outcomes Loop 的质量保证机制
Outcomes Loop 是本次发布中最具护城河潜力的功能。传统的 AI 工作流依赖 Prompt 工程来保证输出质量，结果不可预测且难以量化。Outcomes Loop 通过引入**独立的评分者 Agent + Rubric 评分标准**，将输出质量的评估从主观变成了可配置、可复现的自动化流程。这对于将 AI 集成到企业级业务流程至关重要——企业需要的是确定性，而非"AI 偶尔能做好"的赌博。评分者与执行者之间上下文窗口的刻意隔离，是防止自评自夸的关键设计，这种工程上的细节处理体现了对实际应用场景的深度理解。

### Multiagent Sessions：智能体编排终于有标准答案
多 Agent 协作一直是行业难题，大多数实现停留在"共享上下文"阶段，而 Claude Managed Agents 的解决方案更加成熟：通过 Thread 机制实现上下文持久化，使得协调者可以随时与之前召唤过的子 Agent 继续对话；同时通过文件系统共享实现产出互通。这比 LangChain Agents 的早期探索前进了一大步。"一层委派限制"看似保守，实际上是在安全性和功能性之间取得的合理平衡。

### Dreams：持续优化的差异化路径
Dreams 功能模拟人类睡眠时的记忆整理过程，将多个历史 Session 的内容进行整合优化。这是业界首次将**持续学习**概念引入 Agent 层面的产品设计中。与其依赖模型重新训练来提升能力，不如通过记忆整理让 Agent 在使用过程中越来越聪明。这种设计思路的巧妙之处在于：非破坏性输出确保了安全性（可以先审查再采纳），而可配置的 Session 上限（100个）则控制了计算成本。

### 战略意图：打造闭环的 Agent 生态系统
从整体架构看，Managed Agents（执行环境）+ Multiagent（协作层）+ Outcomes Loop（质量层）+ Webhooks（通知层）+ Dreams（优化层）构成了一套完整的 Agent 生命周期管理方案。Anthropic 的目标是让开发者只需定义"做什么"（Agent 职责），而将"怎么做"（环境配置、上下文管理、任务协调、质量评估）全部下沉到平台层。这与 AWS Lambda 对服务器运维的革命性改变如出一辙——Anthropic 正在做的是 AI 版本的"无服务器化"。

## 实践启示
### 1. 评估你的工作流是否适合迁移到 Managed Agents
适合迁移的场景：长时间运行的异步任务、多步骤复杂任务、需要确定性输出的业务场景（如财务建模、代码审查、数据分析pipeline）。不适合的场景：需要实时交互的对话、精细控制模型行为的场景、简单的一次性任务。评估标准：如果你的任务需要自己写一套"框架代码"来管理上下文窗口、执行环境、轮询逻辑，那么 Managed Agents 很可能能替你省掉这些工作。

### 2. 设计好你的 Rubric 是使用 Outcomes Loop 的关键
Outcomes Loop 的效果直接取决于 Rubric 的质量。建议Rubric 设计遵循以下原则：**具体可量化**（而非模糊描述）、**覆盖核心需求和边界情况**、**明确输出格式要求**。以 DCF 财务模型为例，Rubric 应具体说明：收入预测需使用过去5年历史数据、增长率假设需要明确说明、产出必须是 xlsx 格式且包含特定sheet。Rubric 越清晰，评分者 Agent 的评估越准确，迭代修正的效率越高。

### 3. 从单 Agent 场景开始，逐步引入 Multiagent 协作
Multiagent Sessions 功能强大但复杂度也高。建议从单 Agent 开始：先定义好 Agent 的角色、Environment 配置、系统提示，然后跑通基础任务。在此基础上，再考虑将任务分解给多个专门的执行者 Agent。分解的原则是：**高内聚低耦合**——每个子 Agent 应该有明确且独立的职责，Agent 之间通过文件系统共享产出而非直接调用。这种设计能避免多 Agent 场景下的上下文污染和调试困难。

### 4. 利用 Webhooks 构建事件驱动的 AI 工作流
Webhook 机制是实现"委托-等待"模式的关键。你的应用可以将任务委托给 Managed Agents，然后通过 Webhook 回调来接收完成通知，而不是一直保持连接轮询。这种模式特别适合：后台批处理任务、长时运行的 AI 流程、需要与其他系统集成的场景。在实现时，记得验证 X-Webhook-Signature 签名，并且设计好幂等处理逻辑（因为重试可能推送多次）。

### 5. 将 Dreams 作为长期记忆管理的补充手段
在高频使用 Agent 的场景下，Session 积累会导致记忆库出现重复、过时、矛盾的内容。Dreams 功能可以定期帮你整理这些记忆。建议的使用节奏：**每周或每两周运行一次 Dreams**，整理最近一周的 Session 记忆。由于输出是非破坏性的，可以先审查整理结果，确认无误后再采纳。同时注意单次最多支持100个 Session，所以对于高频场景，可能需要分批处理。

### 6. 关注研究预览阶段的限制，合理规划技术路径
Multiagent Sessions、Outcomes、Dreams 目前均处于研究预览阶段，需要单独申请权限。在生产环境中使用这些功能时，需要考虑：权限申请的不确定性、功能可能变化的兼容性维护、备用方案的准备。建议将预览阶段的功能用于非关键路径，或者设计成可降级方案（如 Outcomes Loop 暂时用人工评估替代）。同时关注官方文档的更新，及时跟进正式发布后的变化。

## 相关产品/人物
- [Claude Managed Agents 开发者指南](/ch04-421-claude-managed-agents/)
- [Anthropic Computer Use 最佳实践](/ch01-677-anthropic/)
- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](/ch01-347-opus-4-7-发布-相比-4-6-核心变化与-claude-code-搭配最佳实践/)
- [Anthropic 长时运行 Agent 架构：对抗式设计 + 合同谈判 + 审美量化](/ch01-677-anthropic/) — 另一篇技术解读，覆盖 API 细节和定价
- [Anthropic PM 的 Agentic 工作流](/ch01-677-anthropic/) — 同一时期 Jess Yan 的 PM 视角，同一产品不同维度
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-claude-managed-agents-platform-launch.md)

## 相关实体
- [Claude Managed Agents 官方 Harness 平台指南](/ch01-677-anthropic/)
- [Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南](/ch01-677-anthropic/)
- [Multica — 开源 Managed Agents 平台](/ch07-050-multica-开源-managed-agents-平台/)
- [claude managed agents official](/ch04-457-claude-managed-agents-official/)
- [claude managed agents](/ch01-445-claude-managed-agents-官方-harness-平台指南/)

- [从 Anthropic 到 Google：Agent Skills 进入设计模式阶段](/ch01-677-anthropic/)
- [Anthropic puts Claude agents on a meter across its subscriptions](/ch01-677-anthropic/)
- [Introducing Claude for Small Business](/ch01-030-introducing-claude-for-small-business/)
- [Introducing Claude for Small Business](/ch01-030-introducing-claude-for-small-business/)
- [Xero Announces Integration with Anthropic's Claude](/ch01-677-anthropic/)
- [Mythos for Offensive Security: XBOW's Evaluation](/ch01-291-mythos-for-offensive-security-xbow-s-evaluation/)
- [Anthropic 首次揭秘下一代 Claude 怎么造](/ch01-677-anthropic/)
- [Anthropic 14 个 Agent Skills 设计模式](/ch01-677-anthropic/)
- [Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式](/ch01-677-anthropic/)
- [Anthropic 官方技能最佳实践：14 个可复用的 Agent Skills 设计模式](/ch01-677-anthropic/)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](/ch04-086-boris-cherny-新访谈-开发工具正在从-ide-变成-agent-控制台/)
- [Claude 发布官方报告，承认存在 3 处质量退化问题](/ch01-375-claude-发布官方报告-承认存在-3-处质量退化问题/)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/2026.md)

## 第 2 来源：VibeCoder「脑手分离」架构视角（2026-06-11）

VibeCoder 对 Claude Managed Agents 更新（scheduled deployments + vault env vars）的架构解读，提出「脑手分离」四层模型，并给出落地设计路径。原文：[VibeCoder 原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-managed-agents-sandbox-vault-schedule-vibecoder.md)

### 核心创新 / 关键数据

- **脑手分离四层架构**：Agent(脑) / Sandbox(手) / Vault(身份证) / Session+Memory(状态层)——将生产 Agent 最容易纠缠的四个维度（谁在思考、动作在哪执行、用哪个身份访问、哪些状态要留下）解耦
- **Vault 占位值机制**：sandbox 里 CLI 读到的只是 placeholder，真实 key 在网络边界才附到请求上，安全边界从进程内变量变成网络请求边界——比普通 env var（`env` 可见）安全一个层级
- **Schedule = Session Factory**：deployment 绑定 cron + timezone + agent + environment + 初始 message，时间到创建 deployment run → 启动 session；成功关联 session_id，失败记录错误类型
- **状态分层设计**：短期中间产物 → sandbox / 一次任务过程 → session event stream / 跨任务偏好+规范+摘要 → memory store / 业务权威数据 → 外部系统（DB/SaaS/仓库）
- **Memory store 文件系统形态**：挂载 /mnt/memory/，用 read/write/edit/grep 普通文件工具维护，「能 grep 的记忆比黑盒向量库更可控」

### 对照表：第 1 来源 vs 第 2 来源

| 维度 | 第 1 来源（平台首发） | 第 2 来源（VibeCoder 脑手分离） |
|------|----------------------|-------------------------------|
| 核心叙事 | Managed Agents 四模块首发（Agent/Env/Session/Events + Multiagent/Outcomes/Webhooks/Dreams） | 更新解读：schedule + vault env vars 补齐长期运行和安全接入 |
| 架构框架 | 四核心概念（Agent/Environment/Session/Events） | 脑手分离四层（脑/手/身份证/状态层）——更偏工程边界划分 |
| 安全机制 | Outcomes Loop 隔离评估者/执行者上下文 | Vault 占位值 + 网络边界附着——secret 不在进程环境 |
| 状态管理 | 未展开跨 session 状态策略 | 四层状态分层（sandbox/session/memory/外部系统） |
| Schedule | 未覆盖 | Session Factory 模式 + 状态分层影响 |
| 与 Codex 对比 | 未涉及 | Codex: setup scripts 期解密 → agent phase 前移除 vs Managed Agents: 运行期网络边界附着 |
| CLI 集成 | 未覆盖 | vault env vars 让现有 CLI 安全调用，无需写 MCP server |
| 落地建议 | 从单 Agent 开始 → Multiagent | 先画状态表 → 低风险流程试 → 保留人工确认点 |
| publish_time | 2026-05-08 | 2026-06-11 |
| 媒体立场 | 中性偏分析 | 工程实践导向，更尖锐（「生产 Agent 竞争点从模型回答转向运行系统」） |

### 与第 1 来源呼应

第 1 来源覆盖平台首发四模块（Managed Agents / Multiagent / Outcomes / Webhooks / Dreams），侧重功能介绍和战略分析。第 2 来源聚焦 **更新功能**（schedule + vault env vars），并通过「脑手分离」框架将已有概念重新组织为工程边界视角。两者互补：第 1 来源是「有什么」，第 2 来源是「怎么拼」——特别在安全边界（vault 占位值 vs 进程内变量）和状态管理（四层分层 vs 未展开）上，第 2 来源补全了第 1 来源缺失的工程细节。

### 实践启示

- **先画状态表再选流程**：Agent config(行为) / Environment(依赖) / Vault(身份) / Session(一次运行) / Memory(跨运行知识) / 外部系统(业务事实)——六个位置各有归属，不要把跨天状态塞进 sandbox 临时文件
- **vault env vars 的 CLI 优先策略**：很多企业系统先有 CLI 再有 SDK，让 Agent 安全调用现有 CLI 比每个系统重写 MCP server 更轻量
- **强事务写路径暂不适用**：自动退款/改账/删数据等需要额外 approval + 幂等 + 回滚 + 审计，Managed Agents 给了执行层但业务控制不能省
- **低风险验证流程**：日报 Agent（读指标→查 Sentry→生成摘要→发 Slack/Notion）→ 验证四个边界（schedule 触发/sandbox 工具/vault 访问/memory 记忆）→ 稳定后再推高价值流程
- **不要做低价值 ablation**：反复验证不用 vault 会否泄密或十种 schedule 粒度不影响架构判断

### 上线状态 / 链接

- Anthropic 更新博客：https://claude.com/blog/whats-new-in-claude-managed-agents
- Managed Agents Overview：https://platform.claude.com/docs/en/managed-agents/overview
- Vaults 文档：https://platform.claude.com/docs/en/managed-agents/vaults
- Memory 文档：https://platform.claude.com/docs/en/managed-agents/memory

→ [第 2 原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-managed-agents-sandbox-vault-schedule-vibecoder.md)

---

