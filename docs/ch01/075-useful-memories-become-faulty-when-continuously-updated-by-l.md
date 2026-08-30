# Useful Memories Become Faulty When Continuously Updated by LLMs

## Ch01.075 Useful Memories Become Faulty When Continuously Updated by LLMs

> 📊 Level ⭐ | 7.2KB | `entities/useful-memories-become-faulty-when-continuously-updated-by-llms.md`

# Useful Memories Become Faulty When Continuously Updated by LLMs

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/useful-memories-become-faulty-when-continuously-updated-by-llms.md)

## 摘要

UIUC 的 Dylan Zhang 在 ALFWorld、ScienceWorld、WebShop、AppWorld、Mind2Web 五个 Agent benchmark 以及基于 ARC-AGI 构建的可控实验流上，检验了"distill experience → store as text → rewrite later"这一主流 Agent 记忆范式，结论是：持续被 LLM 重写的文本记忆不是可靠的自改进引擎，反而会让 Agent 在曾解决的问题上退化。即使在每一步都提供 ground-truth 解的条件下，GPT-5.4 在 19 个 ARC-AGI 问题上的准确率仍从无记忆时的 100% 跌至 54%。

## 核心要点

- **记忆效用随更新次数非单调变化**：ScienceWorld 得分在前约 20 步上升后持续下滑，最终跌破无记忆 baseline；WebShop AWM 从 8 个样例时的 0.64 降至 128 个样例时的 0.20——扩展记忆规模反而抹掉了它自己的收益。
- **故障出在 rewrite 步骤而非数据**：19 个无记忆时 100% 求解的 ARC-AGI 问题，在 ground-truth 解全程可得的 consolidation loop 后准确率降至 54%；轨迹是完美的，是压缩环节让 Agent 忘记了如何求解。
- **同一轨迹池、三种调度产生三种记忆**：Static-Group（按任务族分组后一次性抽象）最优，Static-All 次之，Stream（增量式，真实持续部署 Agent 的处境）最差。
- **三个失败机制**：Misgrouping 将不同问题族合并进一个条目、Interference 剥除适用条件使 lesson 误导相邻任务、Overfit 让记忆退化为对已见样例的描述。
- **Episodic-Only 是意外的最强方案**：选择性保留/删除 raw episodes 且禁用抽象的 Agent 匹配或超越所有 tested consolidator；Abstract-Only 从未超过无记忆 baseline。
- **本质是无锚点的迭代生成循环**：每次 consolidation 都是一次 LLM 采样，记忆向模型对"好 lesson"的先验漂移，而非向真实轨迹收敛。
- **与认知科学预测一致**：将 episodic 与 schema 存储塌缩进单一强制重写循环，恰好触发了 Complementary Learning Systems 理论所警告的干扰灾难。

## 深度分析

### 结构性缺陷：每次 consolidation 都是一次生成

循环由三步构成：Read（读取当前记忆与新轨迹）→ Generate（LLM 前向采样"应有"的记忆条目）→ Write（把样本当作 ground-truth 写回）。堆叠 200 步后，第 k+1 步的上下文是第 k 步样本的条件采样，具体事实（哪个颜色、哪个容器、哪个 selector）作为最"意外"的 token 逐轮脱落，记忆漂移向 LLM 的先验而非轨迹的真实。ExpeL 中 99 票的 top 条目在 200 个 stage 内被替换过三次概念，最终变成适用于任何 benchmark 的 tautology——票数度量的是编辑量而非内容质量。

### Misgrouping、Interference 与 Overfit

Misgrouping 发生在抽象前的分组环节：强制 consolidation 将共享结构很少的 episode 混入一池，甚至把失败 solver 代码中的 typo 当作证据，蒸馏出 phantom rule。Interference 表现为抽象剥除适用条件：Cumulative 方式产生的 over-generalized 记忆约为 Fresh 的 5 倍、garbage 记忆约 20 倍，在 ScienceWorld 15 任务序列上造成 203 分的差距。Overfit 在输入分布收窄时出现："recolor the largest object"的 selector 经 49 次重写后从"max size"变成"某个数值属性"，exact repeat 上稳定、close variant 上崩溃——lesson 变成了对例子的描述。

### 反直觉的修复：保留原始证据，而非更好的抽象

在 ARC-AGI GT Stream 400 步实验中，Auto（默认保留 episodes、谨慎抽象）与 Episodic-Only（完全禁用抽象）均优于 Force（强制每次 consolidation）。组件消融显示：只读抽象条目的 Abstract-Only 在四个 checkpoint 上从未超过无记忆 baseline，而只读原始 episode 的 Episodic-Only 恢复了 Auto 几乎全部增益——consolidator 的蒸馏在原始证据之上贡献约等于零，Auto 模式下 Agent 自己也选择 episodic-first。在 WebShop、ALFWorld、AppWorld 上，episodic-only 与 ACE、AWM、Dynamic Cheatsheet 等蒸馏方法竞争持平，暗示依赖蒸馏的记忆方法都应加上"直接用 raw rollouts 做 in-context learning"的对照 baseline。

### 理论锚点：CLS 双系统记忆的工程化验证

Complementary Learning Systems 理论要求快速 episodic 存储与慢速 schema 形成存储架构分离、consolidation 由 schema fit 门控而非每次事件触发；当代 agentic-memory 设计把两者合并进单一强制重写循环，本研究的实验结果正是该理论预测的干扰灾难在工程上的应验。这与 [episodic vs semantic memory](https://github.com/QianJinGuo/wiki/blob/main/concepts/episodic-vs-semantic-memory-agent.md) 的分野以及 [consolidation 与遗忘](https://github.com/QianJinGuo/wiki/blob/main/concepts/memory-consolidation-decay.md) 的既有结论相互印证。

## 实践启示

1. **把 raw episodes 当作一等证据**：不要默认压缩它们；今天的 solver 可直接经 in-context learning 使用保留的 rollouts，[Agent Memory Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-architecture.md) 设计时应让 episodic 层与抽象层各司其职。
2. **让抽象 opt-in 且由 Agent 门控**：不是每条轨迹都需要变成 lesson，多数不应该；强制 consolidation（当前多数系统的默认值）会主动破坏记忆质量。
3. **解耦 episodic 与 schema 角色**：快速 episodic buffer + 慢速门控抽象存储优于单一强制重写循环——这正是 AI Agent Memory Types 下两类记忆的正确分工方式。
4. **对规模做压力测试**：8 个样例有效、128 个样例失效的记忆系统不是记忆系统，而是"漏水的 prompt"；WebShop 的 scaling 曲线就是警示。
5. **始终加入 episodic-only baseline**：若蒸馏记忆打不过作为 in-context demo 检索的原始 rollouts，蒸馏就没有在"挣它的位子"；评估方法可参照 Agent Evaluation Benchmarks。
6. **警惕基于编辑频率的信任指标**：99 票的 tautology 说明 vote 分数衡量的是被改写次数而非内容价值；评估需区分 exact repeat、close variant 与新问题三种场景，其表现与 [灾难性遗忘](https://github.com/QianJinGuo/wiki/blob/main/concepts/catastrophic-forgetting.md) 存在表面相似但机制不同（权重未变，是记忆本身被改写）。

## 相关实体

- [Build Live Translation Apps with gpt-realtime-translate](081-build-live-translation-apps-with-gpt-realtime-translate.html)
- [A recent experience with ChatGPT 5.5 Pro | Gowers's Weblog](712-chatgpt.html)
- [GPT-5.4 is a big step for Codex](392-codex.html)

---

