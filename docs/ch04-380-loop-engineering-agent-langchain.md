# Loop Engineering 四层循环栈：从 Agent 循环到爬坡循环 — LangChain 官方框架

## Ch04.380 Loop Engineering 四层循环栈：从 Agent 循环到爬坡循环 — LangChain 官方框架

> 📊 Level ⭐⭐ | 6.6KB | `entities/loop-engineering-langchain-four-layer-loopcraft.md`

LangChain 团队（2026）提出的 Agent 循环工程 4 层栈框架，将「loopcraft」（循环工艺）从概念推向可落地的分层架构。文章以 LangChain 内部文档 Agent 为贯穿示例，每层对应一个 LangChain 产品原语。

## 理论基础：Loopcraft 与 Agent 的"辛辣教训"

Loopcraft（循环工艺）指围绕 Agent 叠加循环以成倍放大效能的技艺。swyx、Steipete、Boris Cherny、Andrej Karpathy 等人不约而同得出同一结论：**不应再手动给 Agent 写 prompt，应设计循环让循环去驱动 Agent**。

类比 Rich Sutton 的"苦涩的教训"（Bitter Lesson），LangChain 提出 Agent 的"辛辣教训"（Spicy Lesson）：**不要亲自修修补补，把精力放在能随 Agent 数量扩展的系统上**——目标设定和编排调度才是杠杆所在。

## 四层循环栈

### 第一层：Agent 循环（模型 + 工具）

最基本的循环：模型反复调用工具直到任务完成。LangChain 原语：`create_agent`，选择任意模型接入工具即可运行。

文档 Agent 示例：接收文档改进请求 → 模型规划起草 → 克隆仓库、读文件、写文档、提交 PR。

### 第二层：验证循环（Agent + 评分器）

在外层包裹验证循环：评分器（scorer/grader）检查 Agent 输出，不达标则带反馈重试。评分器可以是确定性的，也可以是基于 Agent 的（LLM-as-Judge）。LangChain 原语：`RubricMiddleware` 或 `create_agent` 的 `after_agent` 钩子。

**权衡**：验证增加延迟和成本，但当质量比速度更重要时（大多数生产环境）值得。

### 第三层：事件驱动循环（验证 + 系统）

将 Agent 接入生态系统，事件触发（Webhook、cron、Slack channel）自动运行。Agent 不再是手动调用的工具，而是持续运行的组件。LangChain 原语：LangSmith Deployment / Fleet channels。

cron 的流行用法是 openclaw 的"心跳"机制——Agent 变成始终在线的主动助手。

### 第四层：爬坡循环（系统 + Engine）

最重要的层次：自动化改进过程。生产 trace 输入分析 Agent → 发现问题 → 改写框架配置（prompt/工具/评分器）。LangChain 原语：LangSmith Engine（trace 分析 Agent）。

**关键洞察**：反馈箭头深入内部直接更新 Agent 循环本身——外层循环的每次迭代让内层循环更高效。未来可接入 RL 微调，将 trace 作为训练信号。

## 人类监督

自动化不等于去人化。四层中每层都有人类监督的天然节点：

| 层次 | 人类角色 |
|---|---|
| Agent 循环 | 敏感操作/工具调用前确认 |
| 验证循环 | 敏感工作流的评分者 |
| 事件循环 | 输出返回前审批 |
| 爬坡循环 | 框架改进部署前审查 |

## 四层汇总表

| 循环 | 作用 | 影响 | LangChain 原语 |
|---|---|---|---|
| L1: Agent 循环 | 模型反复调用工具直到完成 | 自动化工作 | `create_agent` |
| L2: 验证循环 | 输出评分，不通过则反馈重试 | 保证质量 | `RubricMiddleware` |
| L3: 事件循环 | 事件触发运行，更新系统 | 规模化运作 | LangSmith Deployment / Fleet |
| L4: 爬坡循环 | trace 分析 → 改进配置 | 持续改进 | LangSmith Engine |

## 深度分析与实践启示

**1. 四层栈与现有 Loop Engineering 框架的对齐**

LangChain 的 4 层与清华 Loop Stack 六件套（Skill/Spec/Tool/Act/Eval/Stop）存在映射关系：L1≈Tool+Act，L2≈Eval+Stop，L3≈Spec（事件触发规则），L4≈Skill（从 trace 中提炼技能）。区别在于 LangChain 以产品原语（create_agent/RubricMiddleware/Engine）为锚点，清华以抽象层为锚点。

**2. L4 爬坡循环是真正的护城河**

前三层在 Addy Osmani、Boris/Peter、若飞等人的文章中已有充分讨论。L4 的独到之处在于将 trace 分析 Agent 作为一等公民——不是事后复盘而是持续自动化。这与 OpenAI Codex 的 trace-driven improvement 和 Anthropic 的 Agent 自改进循环方向一致。 [Loop Engineering Addy Osmani Challengehub](/ch05-002-loop-engineering-不再写提示词-而是设计替你写提示词的循环-先写刹车再写循环-13-来源深度合并-ad/)

**3. 产品原语即架构约束**

文章每层都绑定一个 LangChain 原语，这既是优势（可落地）也是局限（绑定特定产品）。使用 Hermes Agent 的团队可在 L1 用 agent loop、L2 用 pre-commit hook + lint、L3 用 cron + webhook、L4 用 session trace 分析来实现等价栈。 [Hermes Agent Skills Source Code Analysis Shuge](/ch04-447-hermes-agent-skills-源码级拆解-3级渐进加载-6步调度-5维安全扫描/)

**4. "辛辣教训"的可证伪性**

"把精力放在能随 Agent 数量扩展的系统上"是好的高层指导，但当前 Agent 能力水平下，prompt 工程仍然是第一层循环可靠性的基础。Steipete 和 Boris 的建议适用于已经跑通 L1-L2 的团队，对刚起步的团队来说过早跳到 L3-L4 可能欲速则不达。这是"辛辣教训"的适用边界。

## 相关实体

- [Loop Engineering — 12 来源合并](/ch05-002-loop-engineering-不再写提示词-而是设计替你写提示词的循环-先写刹车再写循环-13-来源深度合并-ad/)
- [Loop Engineering: 把反馈循环放进工程现场](/ch05-004-loop-engineering-把反馈循环放进工程现场/)
- 循环工程 — 清华 2026 框架
- [Agent Loop 8 个未解问题](/ch04-143-agent-loop-工程手册-8-个未解问题-self-protocol-治理薄壳-腾讯陈进的二手解读与单-age/)
- [Hermes Agent Skills 源码分析](/ch04-447-hermes-agent-skills-源码级拆解-3级渐进加载-6步调度-5维安全扫描/)
- Loop Engineering 主题地图
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/loop-engineering-langchain-four-layer-loopcraft.md)

---

