---
source_url: https://www.xiaohongshu.com/explore/6a586e69000000000c017527
source: xiaohongshu
title: "我们的Benchmark被马斯克转发两次了！— LHTB Long-Horizon Terminal-Bench 发布"
ingested: 2026-08-05
type: raw-article
tags: [agent, benchmark, evaluation, long-horizon, terminal, lhtb, harness]
sha256: 053d3060b74990460d66e947247e137e7577ee5fa52e1e1cd72026e03357660f
---

# 我们的Benchmark被马斯克转发两次了！— LHTB Long-Horizon Terminal-Bench 发布

> 作者：Yucheng Shi（腾讯 HY LLM Frontier / Harness Handbook 共同作者）
> 发布于小红书，2026-07-16（美国）。标题：「我们的Benchmark被马斯克转发两次了！这两天有点魔幻。」

## 正文

这两天有点魔幻。我们刚发布的 Long-Horizon Terminal-Bench（LHTB），被 Elon Musk 连续转发了两次。看到接近百万的曝光当然很开心，但我更强烈的感受是：长程 Agent 这个方向，大家真的都在盯。

现在大多数 Agent benchmark，几分钟就结束了。但真实的终端任务往往需要几十分钟甚至几个小时，连续完成上百个相互依赖的操作，还要不断调试、纠错和管理上下文。

因此，我们做了 46 个长程任务，并用 dense reward 评估 Agent 不仅"最终有没有做完"，还包括"到底推进了多远"。

从 Grok 4.2 倒数第一到 4.5 正数第一，也让我再次感受到 Cursor & XAI 团队的训练能力和工程能力真的很强。模型训练、RL、真实环境、harness 和评测闭环，一旦全部接起来，再加上足够的算力，进步速度肉眼可见。

那没有大量 GPU 的普通研究者，是不是就没得做了？当然不是。与其正面和大厂拼算力，不如去研究 Agent 真正工作的系统，harness。同一个模型，换一套 harness，表现可能完全不同。工具怎么组织、上下文怎么管理、失败后如何恢复……这些都可能直接决定 Agent 能不能完成长程任务。

我们最近也开源了 Harness Handbook：把复杂的 Agent harness 转化成一张人类可读的"行为地图"，告诉你系统做了什么，以及每个行为具体在哪里实现。

没有大规模算力，也可以从 harness、context management、tool design、verifier 和 reward 这些方向切入。这里仍然有大量真正重要、而且普通研究者可以做的工作。

🔍 Long-Horizon Terminal-Bench：arXiv 2607.08964
🔍 Harness Handbook：HF Papers 2607.13285

后面会继续分享长程 Agent、Terminal Agent RL、reward 和 harness 相关的研究与实践，欢迎关注！

## 配图内容（5 张轮播，OCR 提取）

### 图 1：封面
「我们的 / Benchmark被 / 马斯克转发 / 两次了！」（PPT 风格封面）

### 图 2：LHTB leaderboard 截图（核心）
上半为两条 X 推文：
- @elonmusk: "Good reason to try Grok 4.5 with Grok Build. It gets better every day!"
- @XFreeze 转发: "Grok 4.5 just took the #1 spot on the Long-Horizon Terminal-Bench, outperforming Claude Fable 5, Claude Opus 4.8 and GPT-5.6-sol…"（90 分钟/数百个终端操作）

下半榜单（46 tasks，Mean reward，solved = reward ≥ 0.95，可切换 Partial reward / Binary pass）：
| 排名 | 模型 | Mean reward | Solved |
|------|------|-------------|--------|
| 1 | Grok 4.5 (xAI) | 0.505 | 13/46 |
| 2 | Claude Sonnet 5 (Anthropic) | 0.497 | 8/46 |
| 3 | Claude Opus 4.8 | 0.492 | 9/46 |
| 4 | Claude Fable 5 | 0.487 | 12/46 |
| 5 | GPT-5.6-Sol (OpenAI) | 0.451 | 7/46 |
| 6 | GPT-5.5 | 0.445 | 7/46 |
| 7 | MiniMax M3 | 0.385 | 3/46 |
| 8 | Claude Sonnet 4.6 | 0.373 | 4/46 |
| 9 | Kimi K2.7 Code (Moonshot) | 0.367 | 3/46 |
| 10 | GLM 5.2 (Zhipu) | 0.316 | 1/46 |
| 11 | Qwen3.6 Plus (Alibaba) | 0.313 | 1/46 |
| 12 | DeepSeek V4 Pro | 0.307 | 3/46 |

底部推文互动数：829 / 1.1K / 4.4K / 1.4M

### 图 3：完整榜单 + Musk 原推
- @elonmusk 原推："Grok 4.5 reaches #1 position on Long-Horizon Terminal-Bench"
- tetsuo（@tetsuoai, Jul 13）长评：5 月论文、15 模型最高完成 7/46、均值约 2，"That ceiling is what fifth place looks like"
- 20 行完整榜单（前 12 名同图 2，其后）：
  - 13. Qwen3.7 Max 0.296 (2)
  - 14. Hy3 0.288 (1)
  - 15. Doubao Seed 2.1 Pro 0.286 (2)
  - 16. Gemini 3.1 Pro 0.279 (2)
  - 17. GPT-5.4 0.272 (1)
  - 18. GLM 5.1 0.267 (2)
  - 19. Kimi K2.6 0.255 (0)
  - 20. GPT-5.3 Codex 0.203 (2)
  - 21. **Grok 4.2 0.080 (0) 垫底**
- 0.0–0.6 横轴条形图；10:58 PM Jul 13, 2026 · 2.9M Views

### 图 4：LHTB 论文首页（arXiv 2607.08964, 9 Jul 2026）
标题：*Long-Horizon Terminal-Bench: Testing the Limits of Agents on Long-Horizon Terminal Tasks with Dense Reward-Based Grading*
作者：Zongxia Li、Junyao Yang、Zhichao Liu 等（Tencent HY LLM Frontier / UMD 等）
摘要要点：
- 46 个任务、15 个前沿模型
- 平均每任务 9.9M tokens / 约 231 episodes / 85.3 分钟执行
- 最强模型 pass@1 仅 15.2%（0.95 阈值）/ 10.9%（1.0 阈值）
- 模型均值 4.3% / 1.7%
- Project page: z1i12321.github.io/LHTB

### 图 5：Harness Handbook 论文首页（arXiv 2607.13285, 14 Jul 2026）
作者含 Yucheng Shi（Tencent）；项目 ruhan-wang.github.io/Harness-Handbook

## 话题标签
#AIAgent #大模型 #人工智能 #科研 #Cursor #Grok #强化学习 #AgentHarness

## 关联
- Harness Handbook（arXiv 2607.13285）→ 已有实体 [[entities/harness-handbook-tencent-behavior-level-manual-2026]]
- 发布者 Yucheng Shi 为 Harness Handbook 共同作者（Ruhan Wang / Yucheng Shi / Zongxia Li 等）
