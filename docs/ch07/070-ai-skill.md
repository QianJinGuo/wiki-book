# 当我把AI变成一个\"算法\"：Skill工程化设计的心路历程

## Ch07.070 当我把AI变成一个\"算法\"：Skill工程化设计的心路历程

> 📊 Level ⭐⭐ | 4.5KB | `entities/skill-engineering-ai-as-algorithm.md`

# 当我把AI变成一个\"算法\"：Skill工程化设计的心路历程

**目标：把 Agent 当成一个算法来用。**
给 Agent 输入，它给你指定格式的输出。中间推理过程不关心，但结果是确定的、可预期的。
但 LLM 天生不是这样的东西——它是概率模型，不是函数。每次调用都在概率空间里掷骰子。

### 痛点 1：Token 是钱，试错是浪费
Agent 在模糊需求前反复揣摩、多轮尝试、走了一半发现方向不对再重来——每一步都在烧 Token。

## 相关实体
- [我用 Skillmd 做了一个简历生成器](../ch04/266-skill.html)
- [Hermes Agent Getting Started Guide 2026](../ch03/090-hermes-agent.html)
- [Llm Raiders Private Ai Server](../ch01/619-llm.html)
- [Pi Mono Github](../ch01/807-pi-mono-github.html)
- [我用 Skillmd 做了一个简历生成器](../ch04/266-skill.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/skill-engineering-ai-as-algorithm.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/ai-skill-design.md)
## 深度分析

**1. 概率模型与确定性执行的根本矛盾**
LLM 是概率模型，每次调用在概率空间"掷骰子"；而工程化生产需要的是输入→输出的确定性映射。这个矛盾不能靠提示词优化解决，必须在架构层面把不确定性封装在最小范围内 ^

**2. "修渠不改河"是 Agent Harness 的核心哲学**
不改变 LLM 的本质（概率性、泛化能力），而是通过外部确定性系统（CLI）给它修好轨道。Agent 保留"理解人话、做判断、组织表达"的能力，所有确定性事务（流程顺序、数据格式、API 调用）全部外置 ^

**3. 上下文管理是 Skill 工程化的真正瓶颈**
当工具数量扩张到 20+ 时，SKILL.md 全量方案会导致 AI 注意力分散，按需加载引入复杂性。CLI 的深层角色是接管 Agent 的上下文管理——把每次需要关注的信息压缩到最小 ^

**4. Agent/CLI 职责边界：JSON 参数作为协议**
Agent（大脑）负责意图理解和决策，CLI（手脚）负责确定性执行。两者通过 JSON 参数/结果进行解耦通信。Agent 的不确定性被 CLI 的确定性包裹，而非试图消除 ^

**5. Token 消耗是架构失效的信号，而非资源问题**
试错式 Token 消耗不是"钱的问题"，是设计问题的指示器。当 Agent 需要反复揣摩、多轮尝试才能完成确定性任务时，说明上下文压缩和职责分离没有做到位 ^

## 实践启示

1. **用 CLI 包裹所有确定性操作**：HTTP 请求拼装、YAML 写入、API 字段校验等 AI 容易出错的操作，全部由 CLI 接管，Agent 只输出 JSON 参数 ^

2. **建立最小上下文暴露机制**：每个执行步骤只向 Agent 提供该步骤必需的参数和上下文信息，用架构而非提示词工程来解决上下文膨胀问题 ^

3. **设计 JSON 参数/结果的标准化协议**：Agent 与 CLI 之间的接口应该是结构化的、类型明确的，而非自然语言的随意交接，便于确定性验证 ^

4. **把"让 AI 只做决策"作为 Skill 拆分的原则**：如果一个 Skill 里 AI 做的事太多（拼请求、写格式），说明它应该被拆分——决策归 Agent，执行归 CLI ^

5. **用 Token 消耗率监控架构健康度**：正常执行应该是 1 轮对话完成确定性任务；如果出现多轮试错，立即检查是上下文缺失还是职责边界不清 ^

---

