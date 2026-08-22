# Qwen 3.8-Max：首个开源权重的 Qwen-Max 级模型

## Ch01.1087 Qwen 3.8-Max：首个开源权重的 Qwen-Max 级模型

> 📊 Level ⭐⭐ | 5.7KB | `entities/qwen38-max-first-open-weights-release.md`

# Qwen 3.8-Max：首个开源权重的 Qwen-Max 级模型

## 摘要

Qwen 3.8-Max 是通义千问家族迄今最强的模型，也是**首次开源权重（open weights）的 Qwen-Max 级模型**——权重将于发布后一周放出。模型基于 Qwen 3.5 架构基础扩展至 **2.4 万亿参数（MoE，95B 激活）**，在编码、工作、研究、长程任务上全面提升。官方博客用三个「无人干预长程自主实验」证明其能力：10+ 天自主构建自进化 Harness、约 5 天复现并超越一篇 LLM 论文、24 小时在线竞赛击败 87% 的人类队伍。

## 核心要点

- **2.4T 总参数 / 95B 激活**：MoE 架构，激活参数约 95B，是 Qwen 家族规模最大模型，也是首个开源权重的 Max 级模型（对标闭源旗舰）。
- **自主编码实验（oh-my-cli）**：10+ 天长程自主运行，构建自进化 Harness，累计 265 commits / 127 PRs / 151 issues。
- **科研复现实验**：从零复现《Unified Data Selection for LLM Reasoning》论文（约 7,600 行代码、1,100+ actions、33 轮 GPU 训练），复现 6 大结论（AIME24 随机基线 +7.7%），随后自我进化出超越论文的新方法（再 +2.7 点）。
- **竞赛实验**：WWW2025 多模态对话意图识别挑战赛（526 个人类队伍），自主微调 BERT/MacBERT/RoBERTa + Qwen2.5-VL-7B + Chinese-CLIP 加权投票系统，最终准确率 0.60 → 0.853，击败 458/526（87%）队伍。
- **共同主线**：模型不遵循固定计划，而是通过**反馈环路自进化**（self-evolves through feedback loops）——无论是升级自身的 Harness、逐轮改进科研方法、还是逐次提交爬升竞赛榜单。

## 深度分析

### 自进化 Harness：任务状态机 + 调度 + 恢复

oh-my-cli 实验展示了一个完整的自主编码 Harness 架构：需求进入 GitHub Issues 后由 issue 状态机（`ready → leased → active`）认领并执行，完成实现后触发 E2E 测试与 CI 检查，通过后合并 PR。更新后模型触发 Build / Unit Test / E2E / Desktop Lifecycle 验证，异常状态回路由到对应 issue/PR 修复重验。社区经验与用户反馈被转换为可执行工作，持续演化 `/goal`、`/resume`、Dynamic Workflow、Session Replay、Desktop 等能力。

### 科研自我进化循环

模型从「论文 + GPU」零起步，先花约 37 小时从零重建论文 pipeline 并复现六大发现；随后进入「提出假设 → 写代码 → GPU 上运行 → 分析 → 再试」的自改进循环，四轮迭代测试了 18 个改进想法：

| Round | 当轮最佳想法 | AIME24 得分 | vs 基线 |
|---|---|---|---|
| 1 | 按难度拆分数据再选择 | 50.42% | +0.84 |
| 2 | 按 entropy-score gap 加权样本 | 51.67% | +2.09 |
| 4 | 计数硬决策点（nhighgate）★ | 52.29% | +2.71 |

最终方法超越论文原方案 +2.7 点（AIME24）。

### 竞赛自主方案

24 小时时限内模型阅读规则并构建完整代码方案：文本侧微调并集成 BERT、MacBERT、RoBERTa 三个中文模型，截图侧微调 Qwen2.5-VL-7B 并以 Chinese-CLIP 兜底，全部融合为加权投票系统，通过交叉验证校准权重并添加额外图像投票者破平。45 次提交，每轮反馈驱动下一轮微调与重加权。

### 规模化现实世界 RL

除展示实验外，官方还预告通过联合扩展 RL 环境与算力，在多个主流 harness（QwenWork / Claude Code / Codex / Open...) 上统一提升通用工作能力——即把「长程自主」从演示推向通用工作负载。

## 实践启示

1. **开源权重是新的竞争维度**：首个开源 Max 级权重意味着开源模型首次与闭源旗舰同规格（2.4T 规模）正面竞争，延续 Kimi K3（2.8T 开源）开启的「开源权重升级竞赛」。
2. **长程自主是评测前沿**：官方评测不再以单轮 benchmark 为主，而是以「多天长程任务 + 自主迭代 + 真实产物」衡量模型，与 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-harness-engineering-paradigm.md) 视角一致。
3. **自我进化循环是模型能力放大器**：oh-my-cli 的 issue 状态机 + 自测试 + 多源演化模式，与 [AgentScope Builder 自进化 Agent Harness](../ch04/802-self-evolving-agent.html) 属于同一设计空间。
4. **科研复现实验价值高**：复现论文（+7.7% 复现基线）到超越论文（+2.7 点）的完整轨迹，是评测模型科研自主性的可复现范例。

## 相关实体

- [Qwen3.7-Max Opus 级体验](https://github.com/QianJinGuo/wiki/blob/main/entities/qwen3.7-max-opus-level-experience-code-secret-garden.md) — 上一代旗舰实测
- [Kimi K3: The Open-Weights Escalation](ch01/608-kimi-k3-the-open-weights-escalation.html) — 开源权重升级竞赛背景
- [Open models recap](ch01/1418-kimi-k3.html) — 社区对 Qwen 3.8 的早期观察
- [AgentScope Builder 自进化 Harness](../ch04/802-self-evolving-agent.html) — 同类自主演化系统
- [Agent 自进化评测瓶颈](../ch03/019-agent.html) — 自主进化的评测约束
- [Agent Loop 设计](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-loop-design.md) — 反馈环路设计
- [MoE 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/moe-mixture-of-experts-2025.md) — 2.4T 稀疏激活架构基础

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/qwen38-max-open-weights-release.md)

---

