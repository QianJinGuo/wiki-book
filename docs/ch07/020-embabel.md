# Embabel

## Ch07.020 Embabel

> 📊 Level ⭐⭐ | 11.5KB | `entities/embabel.md`

# Embabel
> "这可能已经是'最后一代由人类主动选择的框架'了。以后越来越多的技术选型，都会由我们的工具替我们完成。" —— Rod Johnson（Spring 创造者，Embabel 创始人）

**Embabel = Rod Johnson 2024 回归一线创业做的企业 AI Agent 框架**。核心用 **GOAP（Goal-Oriented-Action-Planning）寻路算法**（来自游戏 NPC）做**确定性规划**，让 LLM 嵌入可控、可解释、可审计的业务流程。Apache 2.0，0.3.5（4-6 周到 1.0），核心 Kotlin / 示例 Java。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/embabel-rod-johnson-framework-era-interview.md)

## 核心命题
**企业 AI 应用需要规划** — 不是"扔 30 工具给模型循环跑"。业务流程要一致性、可预测性、可解释性。**LLM 只是动作步骤里的一次 HTTP 调用**，不应该是整个控制流。

## 关键设计选择

### 为什么不用状态机（LangGraph 风格）
- 状态机需要提前定义 → 修改必须重新连线 → 难扩展
- 状态转换 + 每个动作状态所需类型正交 → 类型系统麻烦
- → 选 GOAP 寻路算法

### GOAP 两大特点
1. **动态规划**（运行时）
2. **类型系统完全集成** — 动作的排序由 **Java 方法的参数类型和返回类型** 决定
   - 动作**永远不会在缺少所需参数时被调用**
   - 用户用注解标记 Java 方法即可声明动作

### 规划过程（A* 本质）
- 识别目标 → 查动作前置条件 → 算路径
- 动作可加 cost（高负载动作可动态涨价 → 规划器自动选别的路径）
- 执行一步后**重新规划**（happy path 后置条件满足就继续）

## 与同类框架对比
| 框架 | 规划方式 | 类型集成 | 决定性 |
|---|---|---|---|
| LangGraph | 静态状态机 | 一般 | 决定性 |
| Crew.ai | LLM 决策 | 弱 | 不可预测 |
| Semantic Kernel | LLM 决策 | 弱 | 不可预测 |
| **Embabel** | **GOAP A*（运行时）** | **完全** | **运行时决定性** |

## 5 大核心优势
1. **可解释**：完整展示路径 + 观察到的世界状态 + 决策
2. **可审计**：规划器 + 框架整体发大量事件，可监听 + 持久化
3. **可预测**：相同世界状态 → 相同计划（除非 LLM 步骤内部）
4. **多模型支持**：每步可独立选模型（本地 LLM 处理敏感任务 → 数据不出企业）
5. **适度用 LLM**：3 工具 + 小 prompt vs 30 工具 + 3 页纸 prompt → 可预测性天差地别

## Rod Johnson 的 8 大核心观点
### 1. 语言之争基本结束 → 邻接性原则
- LLM 只是 HTTP 调用 → 在什么栈就在什么栈里调用
- "这是 Python 在 AI 领域主导的**最后一年**"
- 区分**数据科学**（Python）与**企业 AI 应用**（业务邻接语言）
- OpenClaw 不是 Python → "Peter Steinberger 用他偏爱的语言"

### 2. Coding Agent 正在毁掉代码库（如果你放弃控制）
> "如果失去架构监督 → Agent 会愉快地加功能 → 设计退化 → 代码变糟糕。"

### 3. Alien Stack 双向伤害
- 技术上让一切都难
- 把战略权交到**根本不懂核心业务**的人手里
- 真实案例：Python 首席 AI 架构师入职一年不知道公司 70% Java

### 4. 对 MCP 持相对怀疑
- "如果这么容易用 Java 方法暴露工具，为什么还要多此一举走 MCP？"
- "MCP 是催化剂但不是一刀切"
- "完美适合某 Agent 的工具很可能就是该 Agent 独有的"

### 5. 模型"吃掉 harness"会发生但有限
- 11/12 月那波"剧烈跃迁"是真实的
- 但"在自动化业务流程中，把规划从模型控制外移出来，使用确定性方法，仍然有价值"
- **Claude Code 比 4-5 个月前工作方式完全不同** → harness 也变强了
- "模型变聪明 vs harness 变聪明" — **不是冲突，是两个地方同时推进**

### 6. AI 擅长批评，不擅长原创
- Rod 真实使用：5% 手写 + 95% AI，但**牢牢掌握控制权**
- "来回讨论时它想到了我没想到的问题" → 适合当**批评者**
- "原创新设计"是 LLM 弱项
- **Skills + CLAUDE.md 配置有效但 50% 上下文大了会忘**（注意力衰减）

### 7. 语言之争的 LLM 视角
- 训练数据太多 → 对抗趋势：模型**默认不遵守** "永远用 X"
- **Kotlin 反而是 Coding Agent 做得最好的**（语料少但都是高质量代码）→ 反直觉
- 重要洞见：**热门语言不会因训练数据而被固化**

### 8. 开源生存法则
- Spring 挺过 VMware → Pivotal → Broadcom 收购的原因：
  - 收购时已是大象 → 惯性 + 事实标准
  - **有全职开发者修所有 boring bug**（不依赖志愿者）→ 完整产品式开发
- Embabel 计划：Apache 框架 + 更上层产品（针对知识工作者）
- "纯支持模式一直非常困难；有了 Coding Agent 会更难"

## 关键金句
> "我可能最多只写 5% 的代码……但我牢牢掌握着控制权。"
> "AI 生成的代码和我手写的设计风格非常清晰——因为我停下来纠正它。"
> "Vibe Coding 适合一次性 UI 应用；**你无法用 Vibe Coding 编写严肃软件**。"
> "Coding Agent 在每一门语言里都是大师级……**但维护成本也是真实的**。"
> "我不认为现在采用 Embabel 是什么高风险的事。**反倒是引入 Alien Stack 风险大得多**。"

## 现状
- 版本：0.3.5（2026-06-04），4-6 周到 1.0
- 语言：核心 Kotlin，示例 Java（对 Java 用户完全无缝）
- 许可证：Apache 2.0
- 商业模式：开放核心 + 上层产品（针对知识工作者）

## 启示（对 agent/harness 团队）
1. **规划可确定性 = 企业 AI 的关键约束** — 不是"模型强不强"
2. **类型系统是规划引擎的一部分** — 动作的输入输出 = 类型签名
3. **A* 寻路 + 动态成本** 是经过游戏工业验证的范式，可借用到企业 Workflow
4. **Alien Stack 是双向陷阱** — 技术债 + 战略权错位
5. **5% 手写 + 95% AI + 100% 控制权** = 可能的"新范式常态"
6. **MCP 不是银弹** — 完美工具很可能就是该 Agent 独有的
7. **框架之争 → 选型之争 → Agent 时代由工具自动选** — 范式转移的信号

## 深度分析

- **GOAP 作为游戏 NPC 算法的企业级迁移**：Rod Johnson 选择 GOAP（Goal-Oriented-Action-Planning）不是拍脑袋，而是看中了游戏行业多年验证的确定性规划能力。企业 AI 应用需要可解释、可审计的流程，而 GOAP 的运行时动态规划 + 类型系统完全集成，刚好满足这个需求 

- **Alien Stack 是双向陷阱**：访谈中提到的真实案例——Python 首席 AI 架构师入职一年不知道公司 70% Java 技术栈——揭示了 Alien Stack 的核心危害：技术邻接性断裂导致战略决策权落入不懂核心业务的人手中。这不是技术债问题，而是技术战略主导权的错位 

- **MCP 的局限性被低估**：Rod 指出"完美适合某 Agent 的工具很可能就是该 Agent 独有的"——这意味着 MCP 作为跨 Agent 共享工具规范的前提本身可能不成立。工具和 Agent 的紧耦合才是常态，MCP 作为催化剂而非一刀切方案的判断是务实的 

- **规划层与 LLM 层的关注点分离**：Semantic Kernel、Crew.ai 让 LLM 决定下一步（弱类型集成，不可预测），而 Embabel 让 GOAP 规划器决定（类型安全，运行时决定性）——这代表了两种不同的架构哲学：LLM-as-controller vs LLM-as-step-executor 

- **模型变强 ≠ harness 变弱**：11/12 月的模型跃迁是真实的，但 Rod 强调"模型变聪明 vs harness 变聪明不是冲突，是两个地方同时推进"——这意味着即使模型能力持续提升，确定性的规划层（Harness）依然有其不可替代的价值，尤其在企业级业务流程中 

## 实践启示

1. **在企业级 Agent 系统中，优先考虑确定性规划层**：不是让 LLM 决定下一步动作，而是用 GOAP/A* 类算法做运行时规划，把 LLM 定位为"动作步骤里的一次 HTTP 调用"——这样才能实现可解释、可审计的业务流程

2. **用注解 + 类型签名声明动作，而非 prompt 工程**：Embabel 的方案是用户用 Java 注解标记方法声明动作，类型系统自动保证动作不会被缺少所需参数的上下文调用——这是比大量 prompt 约束更可靠的设计 [Agentscope Java Harness Framework Enterprise Distributed](https://github.com/QianJinGuo/wiki/blob/main/entities/agentscope-java-harness-framework-enterprise-distributed.md)

3. **警惕 Alien Stack：技术选型要遵循邻接性原则**：在什么技术栈就用什么技术栈的 AI 工具，不要为了赶潮流引入根本不懂核心业务的技术栈——这会把战略决策权交给错误的人

4. **MCP 是催化剂不是银弹：为每个 Agent 定制工具集**：跨 Agent 共享工具听起来美好，但实践中完美适合某 Agent 的工具往往就是该 Agent 独有的——不要为了追求标准化而牺牲工具的有效性 [Agent Architecture Harness New Backend](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-architecture-harness-new-backend.md)

5. **控制权是 5%+95% 范式的核心前提**：Rod 的 5% 手写 + 95% AI 公式成立的前提是"牢牢掌握控制权"——没有架构监督，Coding Agent 会导致设计退化。保持人类对架构决策的 100% 控制，AI 生成代码必须经过人工纠正才能合入代码库 [Skillopt](https://github.com/QianJinGuo/wiki/blob/main/entities/skillopt.md) [Impeccable](https://github.com/QianJinGuo/wiki/blob/main/entities/impeccable.md)

## 相关对照
- 状态机/规划对照：LangGraph、Crew.ai、Semantic Kernel
- 企业 Java Harness：[AgentScope Java Harness](https://github.com/QianJinGuo/wiki/blob/main/entities/agentscope-java-harness-framework-enterprise-distributed.md)
- Alien Stack 反思：[Harness 成为新后端](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-architecture-harness-new-backend.md)（同样"邻接性"原则）
- 模型 vs Harness 之争：[SkillOpt](https://github.com/QianJinGuo/wiki/blob/main/entities/skillopt.md) / [Impeccable](https://github.com/QianJinGuo/wiki/blob/main/entities/impeccable.md)
- GOAP 起源：游戏 NPC AI（学术界 F.E.A.R / Left 4 Dead 等已用）

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

---

