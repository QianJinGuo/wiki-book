---
title: "关于 RSI 的一些思考：Test-Time 沉淀与 Training-Time 演化的架构终局"
source_url: "https://mp.weixin.qq.com/s/r0rFponJnI5KmW1I9B-VIg"
source_account: "大模型智能（来源 青稞AI，作者 一口鸟）"
source_type: "wechat"
ingested: "2026-08-27"
sha256: "a47f72a8acb61080bb2f97e71371548765fe47b1a30e1c87c92887462d402dd3"
tags: [self-improvement, rsi, recursive-self-improvement, test-time-training, harness-evolution, self-play, verifier, meta-evaluation]
type: raw
---

# 关于 RSI 的一些思考：Test-Time 沉淀与 Training-Time 演化的架构终局

> 来源：大模型智能（青稞AI，作者 一口鸟）| 2026-08-27 入库 | v=6 c=5 v×c=30 Raw only

## 核心框架

RSI（Recursive Self-Improvement，递归自改进）= 让 LLM/Agent 不仅完成任务，还能利用自身产生的经验、数据、反馈甚至代码迭代改进自己。相关术语（self-evolve / self-play / self-refine / self-reward / self-distill）大量交叠，区别在于闭环程度与"被改进的东西"。

RSI 目标：逐渐把人移出 improvement loop，三阶段：
- **Human-in-the-loop**（人在环路）：AI 提出改进，每次修改需人确认。
- **Human-on-the-loop**（人在环上）：data/reward/verifier 已自动产生，人负责监督结果与部署。
- **Closed loop**（闭环）：系统自己产生、验证并应用改进，不再需要人工审核。

目前绝大多数 self-evolving 工作仍停留在 human-on-the-loop，真正 closed-loop 未实现。

## Test-Time RSI（更严格说是 Deployment-Time RSI）

self-improvement 发生在部署过程中而非下一轮 offline training。核心差别是改进能保留多久，以及人类从参与者退到监督者。

**(1) Chatbot I：Self-critique & Self-refine** — Generate → Critique/Verify → Refine。权重冻结，只针对当前 query。关键是 verification signal：单靠 self-critique 不稳定，需引入 execution feedback / retrieval / solver / judge 提供 grounding。但改进只停留在当前 output，episode 结束后经验消失。

**(2) Chatbot II：Test-Time Training (TTT)** — 直接更新模型参数，经验写入 weights。Experience → Better Answer 变成 Experience → Update → Better Model → New Experience。与后训练算法结合，热门方向为 Test-Time RL (TTRL)。

**(3) Agent：Harness Evolution** — 改进对象从 output/weights 扩展到整个 Harness（Prompt/Tool/Memory/Skill/Workflow/Agent Code）。典型方向：从真实 interaction 与失败 trajectory 积累经验（Computer-use Agent 从 failure 生成新训练经验；Experience Graph 保存 branch/execution/failure/repair）；SkillMaster/SkillSmith/Socratic-SWE 让 Agent 自动生成/修改/组合 skills 与 tools；更激进的是 Gödel Agent、Darwin Gödel Machine 把 self-modification 推到 Agent code 层面。

**关键变化是 accumulation（积累）**：一次 response refinement 会消失，一次 test-time update 可保留一段时间，而新的 memory/skill/tool/workflow 可跨 task 持续存在并成为下一轮 evolution 基础。Test-Time RSI 脉络 = 改进从 output → weights → Agent 本身，persistence 不断增强，从 bounded refinement 走向持续 self-modification。但绝大多数系统仍需人外层监督与 gate deployment，离 closed loop 有距离。

## Training-Time RSI

系统自己产生 learning signal 并送回 training loop，使改进通过参数更新跨 iteration 持续积累，变化直接进入下一轮 model。人类从直接提供 label/reward 退到设计 training rule 与监督 loop。

**(1) 场景 I：zero-label** — problem 仍由外部提供，supervision 由模型自己产生。三条路线：
- **Fine-tuning**：模型生成 reasoning trace，筛选高质量 trajectory 作下一轮 SFT 数据（STaR 仍需正确答案筛选；更进一步从 unlabeled questions 出发经 self-verification 构造数据）。
- **RL**：self-rewarding RL。一类用 confidence/likelihood/entropy/self-certainty 等内生信号；另一类用同一 problem 多个 rollout 的 majority voting 构造 pseudo reward。
- **Distillation**：on-policy self-distillation。OPSD 去掉独立 external teacher，让同一模型既当 student 又当 teacher（但 teacher 仍需 verified/ground-truth solution）；U-OPSD 连 reference label 也拿掉，用多个 self-generated rollouts 的 majority consensus 构造 pseudo-solution。

风险两类：**self-confirming loop**（generator 与 verifier 共享相似 bias，错误沿 model bias → biased evaluation → biased learning signal → stronger bias 写回模型）；**training collapse**（reward 正确但 dynamics 不稳，code RL 中真实 binary verifier 仍出现 rise-and-collapse，KL/EWC 无法完全阻止）。zero-label 把问题从"如何获得 supervision"转向"self-generated signal 是否可靠 + improvement 能否稳定累积"——更接近长期 stability engineering 问题。

**(2) 场景 II：zero-data** — 模型进一步自生成 problem/curriculum。Absolute Zero 与 R-Zero 采用 proposer/challenger ↔ solver 的 co-evolution；Agent0 扩展到 agentic task（curriculum agent 与 tool-using executor 从 zero external data 共同 evolve）。
- zero-label = human problem + self-generated learning signal
- zero-data = self-generated problem + self-generated learning signal

前者把 how to learn 交给模型，后者把 what to learn 也交给模型。但 improvement procedure（majority voting / uncertainty reward / filtering rule）通常仍是人为预先设计，不会随 solver 提升自动获得更强 verification。风险：**diversity collapse**（proposer 收敛到易满足 reward 的小类问题，curriculum 变窄）；**reward grounding failure**（reward 无法锚定真实能力提升，proposer/solver 共同偏离有价值 frontier）。

**(3) 延伸：auto research** — self-improvement 扩展到 research process 本身，优化 improvement strategy。research agent 分析 failure、提 hypothesis、选 data/training recipe、跑实验、据 evaluation 调整 research decision。
- zero-label：self-generated supervision
- zero-data：self-generated curriculum
- auto research：self-generated improvement strategy

人类从提供 supervision、problem，进一步退出部分 research decision。无论 loop 扩展到哪一层，最终都要回答：verification 本身是否足够可靠？

## Key Component：Verifier

Test-time 与 training-time RSI 的共同约束：系统能逐步自生成 answer/experience/learning signal/problem/curriculum，但每次 evolution 都需要可靠标准判断"这次更新是否真的带来 improvement"。**verification 很可能比 generation 更接近 RSI 核心瓶颈。**

- math/code 等可依赖 proof checker / unit test / execution feedback，较易形成稳定自动化 loop，但通常仍是 bounded self-improvement（evaluation criterion 预先固定）。
- open-ended agent / creative task / research taste 时，verification 明显更难：不仅判断结果正确性，还要评价 novelty/usefulness/importance。

针对 verifier 自身的 self-improvement 方向：
- **Self-Trained Verification**：把 verifier 本身作为训练对象。
- **Self-evolving Deep Research Agent**：agent 能力演化同时持续更新评价 research output 的 rubric/verifier。
- **Meta-evaluation**：不只评价 output，进一步评价 evaluator 本身。
- **Red Queen Gödel Machine**：让 agent 与 evaluator 共同 evolve，使 evaluation criterion 不再固定。与 R-Zero 不同——R-Zero 的 verification mechanism（majority voting/uncertainty reward）仍人为设定，RQGM 真正把 verifier 能力与 evaluation criterion 本身纳入 evolution loop。

RSI 闭环逐步扩展：answer → experience → learning signal → problem/curriculum → verifier。verifier 可由 meta-verifier 评价，evaluator 可与 agent co-evolve，但最终仍要回答：不断变化的 evaluation mechanism 如何保持与真实目标的 grounding？**如何让 verifier 持续 evolve 同时避免 policy 与 verifier 共同 drift，可能是 closed-loop RSI 最关键、最难的问题。**

## 参考文献

[1] arXiv:2607.07663
[2] https://lsl.zone/blog/2026/a-taxonomy-of-self-evolving-agents/
[3] https://www.anthropic.com/institute/recursive-self-improvement
