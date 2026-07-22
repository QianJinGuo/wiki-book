---
title: "Rod Johnson 回归：Embabel 与「最后一波由人类选择的框架」 — Spring 创始人对企业 AI Agent 框架的深度访谈"
source_url: "https://mp.weixin.qq.com/s/qQfs6qSmNOt4JvPZQqNq7w"
publish_date: 2026-06-04
tags: [wechat, article, embabel, rod-johnson, spring, agent-framework, java, kotlin, goap, planning, deterministic, mcp, langgraph, codex, claude-code, framework-era, alien-stack]
review_value: 9
review_confidence: 9
review_recommendation: strong
sha256: 04403c6588835d702ae3219ace97c51690113e56a45a31f8f2af092ec6b289a2
---
# Rod Johnson 回归：Embabel 与「最后一波由人类选择的框架」
> 整理自 InfoQ 翻译的 Simon Whittaker 播客访谈
> 原文：https://mp.weixin.qq.com/s/qQfs6qSmNOt4JvPZQqNq7w
> 视频：https://www.youtube.com/watch?v=UcvxYltiS7E
> 编译：宇琪 · 策划：Tina

## 一句话定位
**Rod Johnson（Spring 创造者）2026 年再次创业，做 Embabel —— 一个面向企业 AI Agent 的 Kotlin/Java 开源框架（Apache 2.0，已到 0.3.5，4-6 周到 1.0）。** 核心用 **GOAP（Goal-Oriented-Action-Planning）算法**（来自游戏 NPC）做**确定性规划**，让 LLM 嵌入可控、可解释、可审计的业务流程。

> "这可能已经是'最后一代由人类主动选择的框架'了。以后越来越多的技术选型，都会由我们的工具替我们完成。"

## Rod Johnson：履历背景
- **19 世纪巴黎钢琴音乐博士** → 当了 2 年音乐史教师 → 90 年代写共享软件（真有人寄支票）
- **2002 创立 Spring** → 2009 SpringSource 被 VMware 收购（Spring 已成事实标准）
- 中间：董事会 + 投资（VMware/Pivotal/Broadcom 都曾拥有 Spring）
- **2024 回归一线**：创办 **Embabel**（基元律动？不，创始公司名 Rod 未详述）
- 个人 5% 手写 + 95% AI 写代码（核心代码）；保留所有架构决策权

## Embabel 核心设计

### 为什么不用 LangGraph 风格的状态机
- 状态机需要提前定义 → 修改时必须重新连线 → 难扩展
- 状态转换 + 每个动作状态所需的类型正交 → 类型系统麻烦
- → **选 GOAP 寻路算法**（来自游戏 NPC）

### GOAP 两大特点
1. **动态**：规划发生在运行时
2. **类型系统完全集成**：动作的排序由 **Java 方法的参数类型和返回类型**决定
   - 一个动作**永远不会在缺少所需参数时被调用**
   - 用户用注解标记 Java 方法即可声明动作

### 规划过程（A* 本质）
- **目标**：识别出"用户要什么"
- **前置条件**：目标要满足 → 必须世界状态中有这些条件
- **动作前置条件** + **后置条件**（动作承诺的副作用）
- **规划器从当前世界状态出发 → 找通往目标的路径**
- **不存在可行动路径也是有用信息**
- **执行第一个动作 → 重新规划**（happy path 后置条件满足就继续）
- **成本可分配**：每个动作可加 cost；高负载动作可动态涨价 → 规划器自动选别的路径

### 与 LangGraph/Crew.ai/Semantic Kernel 的关键差异
| 框架 | 规划方式 | 类型集成 |
|---|---|---|
| LangGraph | 静态状态机 | 一般 |
| Crew.ai | LLM 决策下一步 | 弱 |
| Semantic Kernel | LLM 决策 | 弱 |
| **Embabel** | **GOAP A* 寻路（运行时动态）** | **完全（Java/Kotlin 类型）** |

## Embabel 的 5 大核心优势
1. **可解释性**：完整展示规划的整个路径 + 观察到的世界状态 + 决策
2. **可审计**：规划器 + Embabel 整体发出大量事件，可监听 + 持久化 + 审计日志
3. **可预测**：相同世界状态 → 相同计划（除非 LLM 步骤内部）
4. **多模型支持**：每步可独立选模型（本地 LLM 处理敏感任务 → 数据不出企业边界）
5. **适度用 LLM**：3 工具 + 小 prompt vs 30 工具 + 3 页纸 prompt → 可预测性天差地别

## Rod Johnson 的核心观点

### 1. 编程语言之争已经基本无关紧要
- "邻接性（Adjacency）" 原则：在什么栈就在什么栈里调用 LLM（LLM 只是 HTTP）
- "这是 Python 在 AI 领域主导的**最后一年**"
- 区分 **数据科学**（Python 主场）和 **企业 AI 应用**（业务邻接语言主场）
- OpenClaw 不是 Python → "Peter Steinberger 用他偏爱的语言"

### 2. Coding Agent 正在毁掉代码库（如果你放弃控制）
- "如果失去架构监督 → Agent 会愉快地加功能 → 设计退化 → 代码变糟糕"
- 反模式：高层喊"AI 一切" → 团队盲目开展
- 黄金案例：澳大利亚客户 95% 的表单提交用正则处理（**不一定要 LLM**）→ 5% 留给人工 → 立刻降低摩擦

### 3. 异构技术栈（Alien Stack）双向伤害
- 技术上让一切都难
- 把战略权交到**根本不懂核心业务**的人手里
- "Python 首席 AI 架构师入职一年不知道公司 70% Java + 30% .NET" — 真实案例

### 4. 对 MCP 持相对怀疑
- "如果这么容易用 Java 方法暴露工具，为什么还要多此一举走 MCP？"
- "如果 MCP 是 API 规范，我们已经有 OpenAPI/Swagger/GraphQL"
- "完美适合某 Agent 的工具很可能就是该 Agent 独有的"
- "MCP 是催化剂但不是一刀切"
- 行业有 MCP、Anthropic 推 MCP，但 Rod 不认为应该默认走 MCP

### 5. 框架未来：模型"吃掉 harness"会发生，但有限
- 11/12 月那波"剧烈跃迁"是真实的 → 模型变强
- 但"在自动化业务流程中，把规划从模型控制外移出来，使用确定性方法，仍然有价值"
- **Claude Code 比 4-5 个月前工作方式完全不同** → harness 也变强了
- "模型变聪明 vs harness 变聪明" — **不是冲突，是两个地方同时推进**

### 6. AI 擅长批评，不擅长原创
- Rod 的真实使用模式：5% 手写 + 95% AI，但**牢牢掌握控制权**
- "来回讨论时它想到了我没想到的问题" → 适合当**批评者**
- 但"原创新设计"是 LLM 弱项
- 内部产品测试基础设施 Claude Code 表现糟糕（场景太新）
- **Skills + CLAUDE.md 配置有效但 50% 上下文大了会忘**（注意力衰减）

### 7. 语言之争的 LLM 视角
- 不应该写"2019 年的 Java 或 2019 年的 Python"
- 训练数据太多 → 对抗趋势："永远用值类型""永远用 type hint" → 模型**默认不遵守**
- **Kotlin 反而是 Coding Agent 做得最好的**（语料少但都是高质量代码）→ 反直觉发现
- 重要洞见：**热门语言不会因训练数据而被固化**

### 8. 开源生存法则
- Spring 挺过 VMware → Pivotal → Broadcom 收购的原因：
  - 收购时已是大象 → 惯性 + 事实标准
  - **有全职开发者修所有 boring bug**（不依赖志愿者）→ "完整产品式开发方法"
- Embabel 计划：Apache 框架 + 更上层产品（针对知识工作者）
- "纯支持模式一直非常困难；有了 Coding Agent 会更难" → 框架作为竞争优势

## Embabel 现状
- 版本：0.3.5（2026-06-04），4-6 周到 1.0
- 语言：核心 Kotlin，示例 Java（对 Java 用户完全无缝）
- 许可证：Apache 2.0
- 公司：开放核心 + 上层产品
- 社区：活跃 Discord + GitHub + issue tracker

## 关键金句
> "我可能最多只写 5% 的代码……但我牢牢掌握着控制权。"
> "AI 生成的代码和我手写的设计风格非常清晰——因为我停下来纠正它。"
> "Vibe Coding 适合一次性 UI 应用；**你无法用 Vibe Coding 编写严肃软件**。"
> "Coding Agent 在每一门语言里都是大师级……**但维护成本也是真实的**。"
> "理解架构、清楚正在发生什么、不要过于信任——是开发者新方式工作的核心技能。"
> "我不认为现在采用 Embabel 是什么高风险的事。**反倒是引入 Alien Stack 风险大得多**。"

## Java vs Python vs Kotlin vs TypeScript 取舍
| 场景 | 推荐语言 | 理由 |
|---|---|---|
| TensorFlow / 数据科学 | Python | 邻接性 + 生态 |
| 企业 AI 应用（Java 栈） | **Java/Kotlin** | 邻接性 + 不要硬塞 Python |
| 服务端 + React | TypeScript | 强类型 + 工具链 |
| 不推荐 | Node.js 做企业应用 | 生态薄弱 |
| Kotlin 优势 | 无 builder / 无 companion object 等怪东西 | 优雅但 Java 用户无缝 |
| Rod 个人观点 | 团队 <20 人 → Kotlin；>20 人 → Java | 学习曲线考虑 |

## 关键启示（对 agent/harness 团队）
1. **规划可确定性 = 企业 AI 的关键约束** — 不是"模型强不强"
2. **类型系统是规划引擎的一部分** — 动作的输入输出 = 类型签名
3. **A* 寻路 + 动态成本** 是经过游戏工业验证的范式，可借用到企业 Workflow
4. **Alien Stack 是双向陷阱** — 技术债 + 战略权错位
5. **5% 手写 + 95% AI + 100% 控制权** = 可能的"新范式常态"
6. **MCP 不是银弹** — "完美工具很可能就是该 Agent 独有的"
7. **框架之争 → 选型之争 → Agent 时代由工具自动选** — 这是范式转移的信号

## 相关对照
- 暂无 Embabel 直接实体（首次入库）
- 概念对照：
  - 状态机/规划：[LangGraph] [Crew.ai] [Semantic Kernel]
  - 企业 Java Harness：[AgentScope-Java-Harness-Framework]
  - Alien Stack 反思：[agent-architecture-harness-new-backend]（Harness 成为新后端 — 同样的"邻接性"原则）
- 模型 vs Harness 之争：[entities/skillopt|SkillOpt]（Skill 层优化）、[entities/impeccable|Impeccable]（前端 Skill 落地）
- 编程语言视角：[entities/agentium-agent-framework] [entities/agentscope-java-harness-framework-enterprise-distributed]
