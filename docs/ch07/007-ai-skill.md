# 当我把AI变成一个\"算法\"：Skill工程化设计的心路历程

> 📊 Level ⭐⭐ | 6.9KB

**目标：把 Agent 当成一个算法来用。**
给 Agent 输入，它给你指定格式的输出。中间推理过程不关心，但结果是确定的、可预期的。
但 LLM 天生不是这样的东西——它是概率模型，不是函数。每次调用都在概率空间里掷骰子。

### 痛点 1：Token 是钱，试错是浪费
Agent 在模糊需求前反复揣摩、多轮尝试、走了一半发现方向不对再重来——每一步都在烧 Token。

## 相关实体
- [我用 Skillmd 做了一个简历生成器](https://github.com/QianJinGuo/wiki-public/blob/main/entities/我用-skillmd-做了一个简历生成器.md)
- [Hermes Agent Getting Started Guide 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-getting-started-guide-2026.md)
- [Llm Raiders Private Ai Server](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llm-raiders-private-ai-server.md)
- [Pi Mono Github](https://github.com/QianJinGuo/wiki-public/blob/main/entities/pi-mono-github.md)

→ [原文存档](https://mp.weixin.qq.com/s/bD10zbBeTtzMyEKqjIdT1w)

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/ai-skill-design.md)
## 深度分析

**1. 概率模型与确定性执行的根本矛盾**
LLM 是概率模型，每次调用在概率空间"掷骰子"；而工程化生产需要的是输入→输出的确定性映射。这个矛盾不能靠提示词优化解决——提示词调得再好，漏 header、拼错字段名这类低级错误依然会随机复发。唯一的出路是在架构层面把不确定性封装进最小范围：Agent 的输入是用户的自然语言，输出被约束为结构化的 JSON 参数，推理之外的一切（流程顺序、数据格式、状态管理）全部由确定性程序接管。原文把它总结为"修渠不改河"：不改变河的本性，但给它修好渠。

**2. "修渠不改河"是 Agent Harness 的核心哲学**
具体到职责切分：Agent（大脑）只做理解意图、收集参数、组织回复；CLI（手脚）只做调 API、写文件、管状态。对照原文的翻车清单——AI 拼 HTTP 请求漏 header、写 YAML 缩进错位、API 字段名拼写错误——这些恰恰是确定性事务，是 CLI 一行代码就能彻底消灭的错误类别。原文把翻车现场列得很具体：拼 HTTP 请求时漏了 header、写 YAML 时缩进错了、API 字段名拼写错误——全是可以用一行校验代码拦住的确定性错误，却让概率模型随机地犯。新方式下 Agent 只说"调用 create_project，参数 name=foo, host=bar.com"，剩下的一切由 CLI 完成。Agent 的不确定性没有被消除，而是被 CLI 的确定性包裹住了——相同输入必然相同输出的部分，根本不该让概率模型碰。

**3. 上下文管理是 Skill 工程化的真正瓶颈**
原文给出了一个量化的临界点：Skill 背后有 5 个工具时，把每个工具的参数说明全写进 SKILL.md 没问题；扩张到 20 个、50 个时就进入死亡螺旋——全量写进 SKILL.md，AI 注意力有限读不全；拆成多个 Markdown，需要 AI 自己判断该读哪个，又引入新的不确定性；做按需加载，动态加载机制本身复杂度陡增。三条路各有代价，根源是同一个：上下文预算没有随着工具数扩张，注意力被摊薄到每个工具的说明上。所以 CLI 的深层角色不是"稳定执行"，而是接管 Agent 的上下文管理：每次只把当前步骤所需的最小上下文喂给 Agent，让"怎么设计一个让 AI 在每个时刻都只需要关注最少信息的执行环境"取代"怎么写更好的提示词"，成为真正的核心问题。

**4. Agent/CLI 职责边界：JSON 参数作为协议**
两者通过 JSON 参数/结果解耦通信：Agent 端"沟通方式 = 只输出 JSON 参数"，CLI 端"沟通方式 = 只返回 JSON 结果"。这个协议设计的意义在于让两侧的不确定性不可跨越边界——Agent 内部怎么掷骰子无所谓，只要吐出的 JSON 符合 schema，CLI 的执行路径就是确定的；CLI 返回的结构化结果又反向压缩了 Agent 下一步需要消化的上下文——它不需要记住中间状态，因为状态由 CLI 管理并按需回传。自然语言的随意交接做不到这一点，因为自然语言本身没有可验证的类型约束。

**5. Token 消耗是架构失效的信号，而非资源问题**
原文开头就把痛点定性为"Token 是钱，试错是浪费"：Agent 在模糊需求前反复揣摩、多轮尝试、走了一半发现方向不对再重来，每一步都在烧 Token。但这笔账的真相比成本更严峻——试错式消耗说明上下文压缩和职责分离没有做到位：要么 Agent 看到的上下文超出当前步骤所需（注意力被无关信息稀释后开始猜），要么确定性事务还留在它脑子里让它翻车重试。Token 消耗率因此成为架构健康度的直接仪表盘，而不是一笔可以靠预算硬扛的开销。

## 实践启示

1. **用 CLI 包裹所有确定性操作**：HTTP 请求拼装、YAML 写入、API 字段校验等 AI 容易出错的操作，全部由 CLI 接管，Agent 只输出 JSON 参数 ^

2. **建立最小上下文暴露机制**：每个执行步骤只向 Agent 提供该步骤必需的参数和上下文信息，用架构而非提示词工程来解决上下文膨胀问题 ^

3. **设计 JSON 参数/结果的标准化协议**：Agent 与 CLI 之间的接口应该是结构化的、类型明确的，而非自然语言的随意交接，便于确定性验证 ^

4. **把"让 AI 只做决策"作为 Skill 拆分的原则**：如果一个 Skill 里 AI 做的事太多（拼请求、写格式），说明它应该被拆分——决策归 Agent，执行归 CLI ^

5. **用 Token 消耗率监控架构健康度**：正常执行应该是 1 轮对话完成确定性任务；如果出现多轮试错，立即检查是上下文缺失还是职责边界不清 ^

---

