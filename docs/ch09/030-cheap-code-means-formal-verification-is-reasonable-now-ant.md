# Cheap code means formal verification is reasonable now — Antfly Blog

## Ch09.030 Cheap code means formal verification is reasonable now — Antfly Blog

> 📊 Level ⭐⭐ | 15.6KB | `entities/agent-formal-verification-ai-code.md`

# Cheap code means formal verification is reasonable now — Antfly Blog

[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-formal-verification-ai-code.md)

It would be an understatement hardly worth uttering to say that coding agents are a big deal. But using them most effectively isn't exactly as simple as telling Claude to build you a SaaS product and make no mistakes. Collectively, as software engineers (or whatever you call this job these days), it's up to us to find ways to be most effective with them while minimizing harm to what we're building.

One of the best techniques I know is having your agent hill climb on verifiable problems. This can be as simple as giving your agent a hundred (or a thousand, or ten thousand) checkboxes to check, like your unit test suite, and having it make sure that every test passes. Just be sure to double-check that it didn't mark a bunch to be skipped, and if your test suite is decent, you can be reasonably confident that your code behaves correctly. Or, you can give the agent a metric and ask it to optimize it. You might not use any of the code it produces, but reading its devlog as to how it went about optimizing for that metric could uncover valuable information. We've used this technique successfully to improve queries per second in Antfly by orders of magnitude, for example.

This is why comprehensive conformance test suites can be so valuable. If they're actually comprehensive, then you have strong guarantees that you'll end up with something that actually does what you want it to (see Simon Willison's writeup). Agents are also very good at using a pre-existing set of ideas and procedures to create their own hills to climb. Martin Kleppmann (author of Designing Data-Intensive Applications) made this argument in December by pointing out that formal languages would make excellent targets for coding agents. Essentially, formal verification of your codebase becomes vastly cheaper with good coding agents because formal languages have proof checkers and other ways of catching many of the types of hallucinations that language models create.

Enter TLA+. It's a formal spec language for modeling complex systems with many moving parts, with a model checker that exhaustively searches all possible states which are implied by the spec. It's perfect for finding the kinds of gnarly bugs like race conditions which can be hard to find other ways.

## introducing the hill

TLA+ is a way to formally model systems to check whether it's possible to reach certain states. For example, you could model an escape room and check whether it's possible for players to ever become stuck. You define possible starting points and transitions, like players discovering the Red Key in Room 1. If it's possible for some other part of the escape room to close access to the Red Key before players discover it, and the Red Key is necessary to progress, the TLA+ checker should discover that. Or you model participants in a distributed data storage system and check that it is impossible for data to be lost due to unresolved intents (ask me how I know).

Point is, this is very useful for distributed and concurrent systems like Antfly. There are all sorts of processes that are straightforward to model in isolation (shard A splits into shards B and C under conditions XYZ) but fiendishly complex when interacting with lots of other such components.

So our question was: how much value could we get out of modeling some or all of this in TLA+ without needing to write it or even read it ourselves? Sure, it might be _more_ effective if we spent a long time studying the language's intricacies and carefully modeling our systems with it, but how much value could we get from just a few afternoons of modeling it with agents? The answer, it turns out, is quite a lot!

## how it works

Here's the workflow I eventually settled on. At first, I kept everything in one SKILL.md file that I directed the agents to use, but eventually I wrote my own CLI to scaffold it better.

Decide what we're actually focusing on. Generally the agent will have a list of hypotheses of problems we will be looking out for once I direct it to a section of the codebase we're interested in. I'll have it write up an assumptions.md and boundaries.md so it's forced to be clear about what is and is not in-bounds during the modeling step. This should exclude enough of the rest of the codebase so that we don't blow up the TLA checker (what actually checks all possible states of the system once we have written the spec) with a combinatorial number of pathways. We generally don't want to model third-party dependencies, operating system quirks, or cosmic rays hitting our VRAM, especially when the checker will happily write tens of gigabytes of system traces if your spec is sufficiently complicated. So it's worth getting clear on what we're _excluding_ from our model now.

Have the agent write the model and run the checker. This is another gate where the agent can find flaws in its initial assumptions. If you know that in your escape room it's possible for the players to lock the box the Red Key is in before retrieving it, that is a failure condition that the checker should show you the exact steps to take to reproduce.

Did we validate a hypothesis? If the agent found nothing, I might prod it to go deeper–look for anything inside the boundary we drew that it might still be making assumptions about, and explicitly add it to the model. Anyway, once it discovers a bug, I'll have it reproduce that bug by writing a test file proving it exists, and then fix the bug.

The fix. If I'm satisfied we have something real that's worth opening a pull request for, I'll have the agent draw up a brief for several different personas: layperson, CEO, CTO, and the (imagined) engineer that'll have to maintain this code in the future. This is another way that I can make sure I understand it at several different levels and that nothing seems off. The actual code for the fix should generally be short and obvious given all the work we've done to get there.

The important output of one of these workflows is a replication of the bug, the fix, and the explanation. The actual deliverable is really small! Just a test showing the cases where the bug happens, and a succinct fix that demonstrates that it now passes the tests. We don't necessarily care about the rest of the code that the agent wrote. We _could_ keep the TLA+ model, or we could just discard it. Code is, after all, cheap now.

## building confidence

Here are some things that raised my confidence that the issues I initially uncovered were real:

- Having the person who implemented the code verify that it was a real bug
- Replicating the behavior in a unit test, and then fixing it
- Testing that this workflow would discover confirmed bugs in a battle-tested codebase

For the last one, I first found a race condition PR that had been merged into the Pebble repo (a key/value store) which was also recent enough that it would be unlikely to be in Claude's training data. Then I checked out the commit just before that merge and did my workflow. It actually homed in on another bug, which I was then able to verify was also fixed in another Pebble PR later.

But the bigger risk with this kind of bug hunting isn't whether it _could_ find bugs, but that they would be buried in a haystack of spurious findings. That after diving into several of these bug reports and taking the time to understand them, I would come to the conclusion that this was mostly noise and not worth the effort. To build confidence here you pretty much just have to do the work. Generally I've found that at worst the problems the agents discover are minor, and often they're real issues that would inevitably affect actual users.

## reflections

When code was much more expensive to write, we needed a lot more of the codebase to be valuable and load-bearing. Now it is cheap and we don't. For a distributed database, it's an obvious benefit to model it out in a language that lets us exhaustively enumerate the states our system can be in. This would have previously taken long enough that we might not have bothered, but now we can do it so quickly that it becomes another obvious way to check our system for flaws. The hill of modeling the system has become much easier to climb, and so we send Claude on its way because it's likely to find useful things in so doing.

Confidence in your codebase can't be automated away. It's ultimately your job as the builder to bear responsibility for what you're releasing into the world. So why not use agents to not simply make things faster, but make them _better_?

## 相关实体
- [Apple Corecrypto Formal Verification Blueprint](../ch12/026-apple-corecrypto-formal-verification-blueprint-post-quantu.md)
- [Is Software Losing Its Head](../ch01/810-is-software-losing-its-head.md)
- [Npm Supply Chain Compromise Postmortem](../ch04/229-ai.md)
- [Cloudflare Glasswing Mythos Security](https://github.com/QianJinGuo/wiki/blob/main/entities/cloudflare-glasswing-mythos-security.md)
- [When Growth Slows Is It Sales Fault Or The Products Fault The Answer Has Changed](https://github.com/QianJinGuo/wiki/blob/main/entities/when-growth-slows-is-it-sales-fault-or-the-products-fault-the-answer-has-changed.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-formal-verification-ai-code.md)

## 深度分析

**1. 成本结构翻转：从"不值得"到"必须做"**

传统观点认为形式化验证成本过高，仅适用于安全关键系统。但代码成本结构的根本性改变重写了这一判断标准。当 AI Coding Agent 使代码生成成本降低 10-100 倍时，"为验证投入大量人力"的经济账完全改变。TLA+ 模型本身也是代码——现在它的编写和迭代成本同样被压缩。更关键的是，作者发现即使只花几个下午让 agent 建模，也能发现真实并发 bug。这揭示了一个深层规律：**当某类工作的成本下降一个数量级时，其应用边界会系统性扩张**。

**2. "Hill Climbing on Verifiable Problems"作为 Agent 可靠性的核心框架**

作者的核心方法论是让 agent 在"可验证的目标"上爬山：单元测试套件（通过所有测试）、性能指标（QPS 最大化）、TLA+ 模型检查器（无状态违反）。这与"让 agent 随意写代码然后人工审查"的模式形成鲜明对比。可验证目标的关键属性是：**agent 的输出能被客观评判，无需人工判断对错**。测试套件是最常见的可验证目标——如果测试质量足够高，agent 只需保证"无一跳过、全数通过"即可获得高置信度。这种模式值得在任何 AI Coding 工作流中优先考虑。

**3. TLA+ 模型的价值在于边界定义，而非模型本身**

文章中最反直觉的洞见是：TLA+ 模型本身几乎可以丢弃——价值在于建模过程中**迫使工程师明确定义系统边界**这一步骤。assumptions.md 和 boundaries.md 强制 agent（和人类）回答"什么在建模范围内，什么不在"。这一边界定义过程对任何复杂系统的设计审查都有独立价值，无论最终是否使用形式化验证工具。具体来说，排除第三方依赖、OS 特性等因素是防止模型状态空间爆炸的关键——TLA+ 检查器的穷举搜索特性使其极易在复杂模型下产生数十 GB 的追踪输出。

**4. 置信度建立：Agent 发现的问题必须经过三重验证**

Agent 发现 bug 后的置信度建立流程包含：① 实现该代码的工程师确认是真实 bug；② 通过单元测试复现行为；③ 在 battle-tested 代码库中验证该方法能发现已知 bug。作者在 Pebble 数据库的实验中，agent 实际发现了另一个 PR 才修复的 bug——而非作者最初植入的那个。这说明 agent 的 bug 发现能力是真实的，但"信号淹没在噪音中"才是真正的风险。因此，作者强调"必须做工作来建立置信度"——通过人工确认、测试复现和基准验证三重关卡过滤假阳性。

**5. 交付物极简化原则："小而精准"优于"大而模糊"**

工作流最终的代码交付物极小：一个复现 bug 的测试用例 + 一个简洁的修复。Agent 生成的所有中间代码、探索路径、失败尝试都可以丢弃。代码现在是廉价的，但**验证和修复的质量才是核心**。这一原则在 AI Coding 时代具有普遍意义：agent 的价值不在于生成代码的数量，而在于最终交付物的可验证性。"TLA+ 模型可以丢弃"这一声明实际上是在说：**形式化方法的输出是洞见，不是模型本身**。

## 实践启示

1. **为 Agent 设定可验证目标，而非开放式任务**：在分配 AI Coding 任务时，优先定义"通过什么就算完成"。对于性能优化，给出具体的指标目标（如 QPS > 基准 × 1.5）；对于 bug 修复，要求 agent 提供能复现问题的测试用例。不可验证的任务是 Agent 幻觉的主要来源。

2. **对分布式和并发系统优先考虑形式化验证**：TLA+ 特别擅长发现竞态条件、死锁、状态丢失等难以通过单元测试触发的 bug。在 2026 年，用 AI Coding Agent 生成 TLA+ 模型的成本已大幅降低，团队应将形式化验证纳入日常开发流程，而非仅视为安全关键系统的专属工具。

3. **用 Assumptions + Boundaries 文档约束建模范围**：让 agent 在建模前写出 assumptions.md 和 boundaries.md，可以防止模型膨胀（combinatorial explosion）并强制工程师主动思考"什么不在范围内"。这两个文档对任何代码审查、设计文档都有独立价值。

4. **建立三重置信度过滤**：Agent 发现的问题不要直接提 PR。建议的过滤流程：① 原始代码作者确认 → ② 单元测试复现 → ③ 在独立代码库验证方法有效性。这三步将假阳性率降至可接受水平，同时不阻碍真实问题的发现。

5. **关注工具间的互补性，而非互相取代**：AI Coding Agent 不取代 TLA+，TLA+ 也不取代测试套件。正确的架构是：TLA+ 发现架构级 bug，agent 用单元测试复现，然后生成精确的修复代码。每一层工具的输出都是下一层工具的输入。 [^raw/articles/agent-formal-verification-ai-code.md:37-44]

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-formal-verification-ai-code.md)

---

