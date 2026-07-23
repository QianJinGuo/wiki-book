# GPT 5.4 是 Codex 的一次大跨越：四维评估视角与 Agent 战争回归

## Ch01.461 GPT 5.4 是 Codex 的一次大跨越：四维评估视角与 Agent 战争回归

> 📊 Level ⭐⭐ | 9.2KB | `entities/gpt-54-is-a-big-step-for-codex.md`

# GPT 5.4 是 Codex 的一次大跨越：四维评估视角与 Agent 战争回归

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/gpt-54-is-a-big-step-for-codex.md)

## 摘要

Interconnects（Nathan Lambert）从 agent-native 工作流视角评测 GPT 5.4 + Codex 组合：相比传统 benchmark 的"单点正确性"，真正的 agent 体验是"正确性、易用性、速度、成本"四维混合，GPT 5.4 在这四个维度上都比前代有实质提升，"硬棱角"消失，是首个让人感觉"扔什么都能干"的 OpenAI agent。文章同时给出 Claude 与 GPT 在 agent 哲学上的关键分野："Claude 推测你的意图，GPT 严格按你说的做"，并预言 agent 工具的形态会像 Slack——多个 agent 在用户视野下互相沟通。

## 核心要点

- **从单维到四维评估**：传统 benchmark 把模型压缩成"单一正确性分数"，但 agent 任务是正确性 × 易用性 × 速度 × 成本的混合，GPT 5.4 是首个在这四维都有意义提升的 OpenAI 模型。
- **"硬棱角"消失**：之前 Codex 经常在 git 操作、文件管理等小任务上"切死"用户；GPT 5.4 这些边缘问题不再发生，"感觉不到死亡"是体验质变。
- **Reasoning efficiency = 思考用更少 token 拿同样分**：OpenAI 每次发版都展示"达到 peak benchmark 所需 token 数显著下降"，这是 reasoning efficiency 指标。
- **上下文管理质变**：GPT 5.4 几乎从未让用户撞到 context wall 或 context anxiety；context compaction 也不那么刺眼。
- **Claude vs GPT agent 哲学分歧**：Claude 推测你的 intent（性格、措辞、偶尔忘事），GPT 严格按你说的做（精确、略显冷感、纯机械）；前者吸引新用户，后者吸引"老 agent 协调员"。
- **未来形态 = Slack 风格**：多个 agent 在用户视野下互相沟通、协调，是 agent 工具的下一形态。

## 深度分析

### 一、四维评估框架取代单点正确性

Nathan 提出了一个清晰的 agent 评估范式转换：

> "Traditional benchmarks reduce model performance to a single score of correctness... agentic tasks are all about a mix of correctness, ease of use, speed, and cost."

这个观察很关键：**单一正确性分数无法反映 agent 体验**。一个 95% 正确的 agent 如果每次都在小任务上"切死"用户，实际体验可能不如一个 90% 正确但流畅的 agent。这呼应了 `Yann Dubois 提到的"可靠性台阶"`——单步可靠性的累积效应比单点 benchmark 更影响产品感受。

对企业 Agent 建设的启示：内部评测体系应抛弃"单次成功率"作为唯一指标，建立**正确性 × 易用性 × 速度 × 成本**四维仪表盘，每维独立追踪。

### 二、Reasoning Efficiency：被低估的模型竞争维度

Nathan 引用 OpenAI 发布博客的反复信号：

> "most of OpenAI's release blogs showcase each iterative model being substantially more concise in the number of tokens it takes to get peak benchmark performance. This is a measure of reasoning efficiency."

reasoning efficiency 是 GPT 5.4 上下文管理质变的根因：模型用更少 token 完成同等任务，意味着在相同 context window 下能做的事更多，context compaction 触发频率更低，用户感知不到。

Cursor 的 cursorbench 进一步证实：**第三方评测也开始把速度/价格作为正交维度展示**，二维 benchmark 图是趋势 [raw/articles/gpt-54-is-a-big-step-for-codex.md:30]。

### 三、Claude vs GPT 的 Agent 哲学分歧

Nathan 给出了一个简洁的对比框架：

| 维度 | Claude | GPT 5.4 |
|------|--------|---------|
| 性格 | 有性格、有措辞、偶尔忘事 | 精确、略显冷、纯机械 |
| 意图理解 | 推测 intent（更宽容） | 严格按指令做 |
| 适用场景 | 新手、需要观点、需要"温度" | 高级 agent 协调员、明确 TODO 列表 |
| 风险 | 误解时仍会做 | 字面执行时易错 |

这是两种截然不同的 agent 设计哲学：**意图推测 vs 字面执行**。对应 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 的不同分支——Claude harness 倾向于"宽松意图补全 + 安全感"，GPT harness 倾向于"严格指令执行 + 透明可控"。

### 四、Agent 工具的下一形态 = Slack

Nathan 的预言很值得玩味：

> "I expect them to eventually look like Slack (when multiple agents need to talk to each other, under my watch)."

含义：未来 agent 工具不再是"我 → 单个 agent"的对话界面，而是"我 → 多个 agent 在频道里互相沟通"的协作界面。用户从"指挥单个 agent"变成"管理 agent 团队"——这与 [Karpathy 谈的 agentic engineering](../ch04/134-karpathy-vibe-coding-agentic-engineering.html) 范式转变一致：从 vibe coding（人写代码）→ agentic engineering（人协调 agent）。

### 五、共同的"轻微遗忘"问题

Nathan 报告了一个跨模型的共同问题：

> "If you give the models multiple TODOs in a single message outside of planning mode, I find them often dropping them. Sometimes it feels like the models glitch and try to solve a previous problem rather than the recent ones."

**规划模式（planning mode）之外的多 TODO 容易丢失**——这是当前主流 agent 的共同短板，根因可能是 instruction following 在长上下文中的衰减，或 harness 的 prompt 重组策略有问题。生产级 agent 必须依赖 planning mode 或外部 TODO tracker 来保证不丢失任务。

## 实践启示

1. **建立四维评估体系**：抛弃单一正确性指标，建立正确性 × 易用性 × 速度 × 成本的 dashboard，分别追踪。
2. **reasoning efficiency 是选型关键**：不要只看"能不能做对"，还要看"用多少 token 做对"。在长任务、成本敏感的 agent 场景下，reasoning efficiency 的差异会被放大 10 倍以上。
3. **上下文管理作为可观测指标**：监控 context window 使用率、compaction 频率、context anxiety 触发次数，作为模型升级的硬指标。
4. **场景决定哲学**：客户面向 C 端用户的产品选 Claude 系（宽容、温度好）；企业内部自动化、明确 TODO 任务选 GPT 系（精确、可控）。
5. **多 TODO 场景必须用 planning mode 或外部 tracker**：当前主流 agent 在非规划模式下的多 TODO 任务上有"轻微遗忘"，不能信任模型自身的 TODO 跟踪。
6. **为多 agent 协作设计界面**：未来 agent 工具形态是"多 agent 在用户视野下协作"，提前在 UI/UX 上设计 agent 间的消息流和状态同步。
7. **保持双模型订阅的工程实践**：$100 Claude + $200 ChatGPT = 同时拥有两种 agent 哲学；高级用户按"今天需要温度还是精确"动态切换。

## 相关实体

- [Yann Dubois Openai Post Training Matt Turck Interview](ch01/743-openai.html)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](../ch04/234-agentic.html)
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- **Agent 评估方法**
- **Reasoning Efficiency**
- [Multi-Agent Orchestration](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-orchestration.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/evaluation-benchmarks-extended.md)

---

