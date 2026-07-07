# GPT 5.4 Codex 评测：Interconnects 的 Agent 使用体验

## Ch01.641 GPT 5.4 Codex 评测：Interconnects 的 Agent 使用体验

> 📊 Level ⭐⭐ | 6.8KB | `entities/gpt54-codex-interconnects.md`

# GPT 5.4 Codex 评测：Interconnects 的 Agent 使用体验

> 2026-06-07 引用自 Interconnects《GPT 5.4 is a big step for Codex》，2026-03-18。

## Agent 评测的四个维度

传统 benchmark 简化为单一正确性分数，但这不能反映 Agent 实际体验。Interconnects 关注四个维度：
1. **Correctness**（正确性）
2. **Ease of use**（易用性）
3. **Speed**（速度）
4. **Cost**（成本）

GPT 5.4 在所有四个维度都感觉是意义重大的进步，不只是纸面 benchmark 的增量提升。

## 为什么之前离开 OpenAI Agent

作者之前总是从 OpenAI Agent 切换离开——死于千刀（death by a thousand cuts）：git 操作失败需要重置，各种小问题累积成挫折感。GPT 5.4 之前那些硬边缘不再存在。

## GPT 5.4 vs Claude 的个性差异

- **Claude**：超级智能模型，有性格，在辩论中有妙语，有时会忘记东西。更温暖，有魅力，让人愿意留下来。
- **GPT 5.4 in Codex**：超级精确，略微冷淡，但深入机械。精确到指令遵循让作者改变与模型交互的方式。

用途分化：
- 需要更多意见 → Claude
- 需要消解压倒性具体 TODO 清单 → GPT 5.4

两种非常不同的"什么是最好 Agent 模型"的哲学。

## 实际优势

- **Codex app**：有时完全爱上这个产品
- **率限制**：$200/月 ChatGPT plan 从未接近 Codex 限制，Claude $100/月计划有时会碰到
- **上下文管理**：从未遇到上下文墙或上下文焦虑。GPT 5.4 推理效率让初始上下文窗口能做更多事情，压缩时也更不易察觉
- **推理效率**：token 效率持续提升，benchmark 所需的 token 越来越少，这代表推理效率

## 弱点

两者（Claude Opus 4.6 和 GPT 5.4）的共同问题：**轻度健忘**。如果在单个消息中给模型多个 TODO，它们经常遗漏。有时感觉模型 glitch 试图解决之前的问题而非最新问题。多消息排队细化任务在简单案例外有风险。

## 深度分析

1. **四维度 Agent 评测框架**：传统 benchmark 简化为单一正确性分数，但实际 Agent 体验取决于四个维度的混合：正确性（Correctness）、易用性（Ease of use）、速度（Speed）和成本（Cost）。GPT 5.4 在所有四个维度都表现出有意义的进步，而非仅在纸面 benchmark 上的增量提升。

2. **"千刀之死"问题已被解决**：此前 OpenAI Agent 总因累积的小问题（git 操作失败、上下文管理问题等）导致用户愤怒退出。GPT 5.4 消除了这些硬边缘——这是质变，不是 benchmark 的量变。

3. **两种"最佳 Agent 模型"哲学**：Claude = 个性 + 温暖 + 魅力（吸引新手用户）；GPT 5.4 = 精确 + 机械式指令遵循（吸引专家级协调者）。这是两种根本不同的哲学，代表了 AI Agent 模型设计的两条路径。

4. **推理效率作为竞争护城河**：OpenAI 的迭代模型在获得峰值 benchmark 性能时所需的 token 数量持续减少。这种 token 效率直接转化为更好的上下文管理——初始上下文窗口能做更多事情，压缩也更不易察觉。

5. **共享弱点揭示当前架构限制**：Claude Opus 4.6 和 GPT 5.4 都存在轻度健忘问题——在单个消息中给予多个 TODO 时经常遗漏。这一共同缺陷提示当前模型在多任务队列管理上的架构局限，多消息排队细化任务在简单场景之外存在风险。

## 实践启示

1. **以四维度框架评估 Agent**：在评估 Agent 模型时，将正确性、易用性、速度、成本作为独立变量而非合并为单一分数。单一维度 benchmark 会遗漏关键可用性因素。

2. **利用 GPT 5.4 的上下文效率**：GPT 5.4 的推理效率意味着可在初始上下文窗口中放入更多内容，只在必要时才进行压缩。这改变了 Agent 的上下文策略设计思路。

3. **按任务类型分流使用**：将需要意见判断的任务导向 Claude，将消解压倒性具体 TODO 清单的任务交给 GPT 5.4。模型选择应匹配任务类型，而非凭品牌偏好决定。

4. **以架构设计对抗轻度健忘**：在规划模式外避免在单个消息中批量发送多个 TODO；应发送单一明确任务或显式启用规划模式，以规避健忘风险。

5. **将率限制纳入生产架构决策**：GPT 5.4 的 $200/月 ChatGPT 计划提供更宽松的率限制，而 Claude 的 $100/月计划有时会遇到限制。在高流量 Agent 部署中，率限制差异是重要成本因素。

## 结论

GPT 5.4 是把极强软件基础（GPT 5.3 Codex）和更多简单可用性/Agent 特性结合的 Agentic 模型。大步前进，期待两家公司下一个更新。

## 相关实体
- [Codex Goal Six Hour Run](../ch09/057-codex-goal-six-hour-run.html)
- [Three Years Gpt3 Gemini3 Mollick](https://github.com/QianJinGuo/wiki/blob/main/entities/three-years-gpt3-gemini3-mollick.md)
- GPT-5.5 实测
- [Kimi Work Codex Vibe Working Paradigm Shift](ch01/520-codex.html)
- [Openai Codex Super Computer Network Xinzhiyuan](../ch09/141-openai-codex.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/gpt-54-is-a-big-step-for-codex.md)

---

