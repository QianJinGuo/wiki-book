# Embabel

> 📊 Level ⭐⭐⭐ | 15.0KB

> "这可能已经是'最后一代由人类主动选择的框架'了。以后越来越多的技术选型，都会由我们的工具替我们完成。" —— Rod Johnson（Spring 创造者，Embabel 创始人）

**Embabel = Rod Johnson 2024 回归一线创业做的企业 AI Agent 框架**。核心用 **GOAP（Goal-Oriented-Action-Planning）寻路算法**（来自游戏 NPC）做**确定性规划**，让 LLM 嵌入可控、可解释、可审计的业务流程。Apache 2.0，0.3.5（4-6 周到 1.0），核心 Kotlin / 示例 Java。

→ [原文存档](https://mp.weixin.qq.com/s/qQfs6qSmNOt4JvPZQqNq7w)

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
- 这是 Python 在 AI 领域主导的**最后一年**
- 区分**数据科学**（Python）与**企业 AI 应用**（业务邻接语言）
- OpenClaw 不是 Python → "Peter Steinberger 用他偏爱的语言"

### 2. Coding Agent 正在毁掉代码库（如果你放弃控制）
> "如果失去架构监督 → Agent 会愉快地加功能 → 设计退化 → 代码变糟糕。"

### 3. Alien Stack 双向伤害
- 技术上让一切都难
- 把战略权交到**根本不懂核心业务**的人手里
- 真实案例：Python 首席 AI 架构师入职一年不知道公司 70% Java

### 4. 对 MCP 持相对怀疑
- 如果这么容易用 Java 方法暴露工具，为什么还要多此一举走 MCP？
- MCP 是催化剂但不是一刀切
- 完美适合某 Agent 的工具很可能就是该 Agent 独有的

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
- 纯支持模式一直非常困难；有了 Coding Agent 会更难

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

### 确定性规划是企业 AI 的第一性约束，而非性能优化
Rod 对企业 AI 的基本判断是：瓶颈不在模型的聪明程度，而在流程的可控性。「扔 30 个工具给模型循环跑」的架构把控制流交给概率系统，注定满足不了企业对一致性、可解释、可审计的硬性要求。Embabel 的回应是把「决定下一步」这件事从模型手里拿回来：GOAP 在运行时根据当前世界状态寻路，相同状态产生相同计划，规划器与框架层面持续发出事件供监听和持久化——可解释、可审计、可预测其实是同一设计决策的三个侧面，而不是三个独立特性。访谈里澳大利亚客户的案例把这一原则推向极致：95% 的表单提交用正则处理，只有 5% 真正需要模型——「适度用 LLM」意味着先用确定性手段收窄问题空间，模型只负责剩余的模糊地带。A* 寻路还有一个常被忽略的细节：「不存在可行动路径」本身就是有用信息，规划器可以显式报告失败，而不是让模型在循环里无声耗尽预算；再叠加动作级 cost 分配与高负载动作动态涨价，规划器会自动绕开拥堵路径，确定性规划因此同时具备了对现实负载的适应性 [Langgraph State Machine](https://github.com/QianJinGuo/wiki-public/blob/main/entities/langgraph-state-machine.md)。

### 类型系统被重新定位为规划引擎的骨架
Embabel 最反直觉的设计，是把类型系统从「编译期安全网」提升为「运行时路由结构」：动作的排序由 Java/Kotlin 方法的参数类型和返回类型决定，用户只需用注解标记方法即可声明动作，框架保证动作永远不会在缺少所需参数的上下文里被调用。相比之下，用 prompt 约束模型「永远用某类型」「永远遵守某规范」存在天然的对抗趋势——访谈明确指出训练数据体量太大，模型默认并不遵守这类指令。类型签名是机器强制执行的，prompt 约束是统计意义上大概率遵守的，两者的可靠性不在同一量级；这也解释了为什么「注解声明动作」比「prompt 工程堆约束」更值得作为企业 Agent 的默认手段。另一个反直觉发现是 Kotlin：语料虽少但质量高，反而成为 Coding Agent 表现最好的语言——说明训练数据量并不决定一门语言的工程可用性，热门语言不会因数据体量被固化，这反过来支撑了 Embabel「核心 Kotlin、对 Java 用户无缝」的选型逻辑 [Agentscope Java Harness Framework Enterprise Distributed](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentscope-java-harness-framework-enterprise-distributed.md)。

### Alien Stack 与邻接性：选型是治理问题而非技术问题
Rod 把语言之争的终结归结为「邻接性」原则：LLM 只是一次 HTTP 调用，在什么技术栈里就在什么栈里调用。真正的危险不是「用错语言」，而是为赶 AI 潮流引入 Alien Stack——真实案例里，Python 首席 AI 架构师入职一年都不知道公司 70% 的代码是 Java、30% 是 .NET。这里的伤害是双向的：工程上所有事情都变难，战略上核心业务的决策权被交到根本不懂业务的人手里，问题从技术债升级为治理结构错位。更深一层是那句「这可能已经是最后一代由人类主动选择的框架」：当技术选型越来越多由工具替人完成，你的代码库长什么样，将决定未来的 Agent 自动选中哪条技术路线——今天每一次邻接性选择，都会通过代码库这份「遗产」被后续的自动化选型指数级放大 [Agent Architecture Harness New Backend](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-architecture-harness-new-backend.md)。

### 模型吃掉 harness 的边界，与 MCP 的真实定位
面对「模型变强会不会消灭框架」的追问，Rod 的回答是把问题拆成两条并行推进的线：11/12 月那波剧烈跃迁是真实的，Claude Code 相比 4-5 个月前的工作方式也完全不同——「模型变聪明 vs harness 变聪明不是冲突，是两个地方同时推进」。但在自动化业务流程里，把规划从模型控制中外移出来仍有不可替代的价值；harness 侧的具体教训同样成立：Skills + CLAUDE.md 有效，但上下文膨胀到 50% 附近会出现注意力衰减，大上下文并不等于强遵循。对 MCP 的怀疑与这一逻辑同构：既然用 Java 方法暴露工具已经足够容易、行业已有 OpenAPI/Swagger/GraphQL 这类 API 规范，跨 Agent 的通用工具协议就未必是默认解——完美适合某 Agent 的工具很可能恰恰是该 Agent 独有的，MCP 是催化剂而非一刀切。这与他对 AI 能力边界的判断一致：模型擅长当批评者（来回讨论时能提出人没想到的问题），不擅长原创设计；5% 手写 + 95% AI 生成的公式能够成立，前提是人类牢牢掌握架构控制权，否则 Agent 会「愉快地加功能」直到设计退化。开源层面的推论同样冷静：纯支持模式一直困难，Coding Agent 时代会更难，Spring 挺过三轮收购靠的是「全职开发者修所有 boring bug」的完整产品式开发——这也是 Embabel「Apache 框架 + 上层知识工作者产品」路线的底层依据 [Model Context Protocol Mcp](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-context-protocol-mcp.md) [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering.md)。

## 实践启示

1. **在企业级 Agent 系统中，优先考虑确定性规划层**：不是让 LLM 决定下一步动作，而是用 GOAP/A* 类算法做运行时规划，把 LLM 定位为"动作步骤里的一次 HTTP 调用"——这样才能实现可解释、可审计的业务流程

2. **用注解 + 类型签名声明动作，而非 prompt 工程**：Embabel 的方案是用户用 Java 注解标记方法声明动作，类型系统自动保证动作不会被缺少所需参数的上下文调用——这是比大量 prompt 约束更可靠的设计 [Agentscope Java Harness Framework Enterprise Distributed](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentscope-java-harness-framework-enterprise-distributed.md)

3. **警惕 Alien Stack：技术选型要遵循邻接性原则**：在什么技术栈就用什么技术栈的 AI 工具，不要为了赶潮流引入根本不懂核心业务的技术栈——这会把战略决策权交给错误的人

4. **MCP 是催化剂不是银弹：为每个 Agent 定制工具集**：跨 Agent 共享工具听起来美好，但实践中完美适合某 Agent 的工具往往就是该 Agent 独有的——不要为了追求标准化而牺牲工具的有效性 [Agent Architecture Harness New Backend](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-architecture-harness-new-backend.md)

5. **控制权是 5%+95% 范式的核心前提**：Rod 的 5% 手写 + 95% AI 公式成立的前提是"牢牢掌握控制权"——没有架构监督，Coding Agent 会导致设计退化。保持人类对架构决策的 100% 控制，AI 生成代码必须经过人工纠正才能合入代码库 Skillopt [Impeccable](https://github.com/QianJinGuo/wiki-public/blob/main/entities/impeccable.md)

## 相关对照
- 状态机/规划对照：LangGraph、Crew.ai、Semantic Kernel
- 企业 Java Harness：[AgentScope Java Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentscope-java-harness-framework-enterprise-distributed.md)
- Alien Stack 反思：[Harness 成为新后端](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-architecture-harness-new-backend.md)（同样"邻接性"原则）
- 模型 vs Harness 之争：SkillOpt / [Impeccable](https://github.com/QianJinGuo/wiki-public/blob/main/entities/impeccable.md)
- GOAP 起源：游戏 NPC AI（学术界 F.E.A.R / Left 4 Dead 等已用）

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/tool-use-mcp-patterns.md)

---

