---
title: "谷歌PM公开：2026开发者五大新技能——问题塑形/上下文设计/审美/编排/判断力"
created: 2026-05-28
updated: 2026-05-28
type: raw
tags: [problem-shaping, context-curation, taste, agent-orchestration, judgment, developer-skills, google, shubham-saboo, 93k-stars]
sources:
  - https://mp.weixin.qq.com/s/L_uAB0NjfgIuvlDIrP4TYQ
review_value: 7
review_confidence: 7
sha256: 233900950da66bc68e7d88391c329eec5bcc9851c659ea3d063ccbc5fb7b4590
---

## 背景

作者：云昭，51CTO技术栈。

谷歌高级 AI 产品经理 Shubham Saboo（运营 93k 星的 Awesome LLM Apps 仓库）在 X 上分享文章《2026 年，什么技能最重要》，结合多年在谷歌的工作经历。

**核心观点**："2026 年最优秀的开发者，更像电影导演，而不是程序员。"

**时间窗口**：Gemini 3 Pro（2025年11月）到 Claude Opus 4.6（2026年2月），不到 3 个月，足以改变产品开发范式。"6 个月前招人的技能标准，现在已毫无价值。"

## 被商品化的四项旧技能

1. **从零开始写代码**：智能体写得更快、Bug 更少
2. **样板代码和项目脚手架**：一句提示词直接生成
3. **死记硬背语法和 API**：超长上下文窗口已解决
4. **把规格说明翻译成代码**：规格本身就是代码

> "上周在我担任顾问的一家初创公司里，一个实习生的交付速度超过了一位资深开发者。那位资深工程师花了三天手写的内容，实习生一个下午就交付了。并不是实习生更强，而是他把问题定义得足够清晰，然后让 Claude Code 完成剩下的工作。"

## 五种新技能

### 技能一：问题塑形（Problem Shaping）

把模糊目标变成可执行的任务。区分"玩 AI"和"用 AI 做产品"的人。

**核心是拆解能力**。问题塑形把"帮我做一个仪表盘"（愿望）拆成十二个具体、可测试的子任务，每个都有明确的成功标准。

**案例**：一个人负责问题塑形、十六个智能体负责执行，产出 10 万行可运行的 Rust 代码。那个人没有写代码，把问题拆解到足够精确，让智能体仅凭拆解结构就能完成编译器。

### 技能二：上下文设计（Context Curation）

智能体产出质量与你提供的上下文质量直接成正比。

**差上下文示例**：
> Build me a customer support agent.

**好上下文示例**：
```
Target user: SaaS customers who are frustrated and considering canceling.
They've already tried the help docs. They're messaging because docs failed them.
Tone: Empathetic but efficient. Don't over-apologize. Don't be robotic.
Here are 3 real tickets that got 5-star ratings: [examples]
Here are 2 that got complaints: [examples]
Edge cases requiring human handoff:
- Billing disputes over $500
- Account security concerns
- Legal or compliance questions
Success metric: Resolution without escalation in under 4 messages.
```

**本质**：选择什么信息进入模型的思考空间。给错信息，模型稳定输出错误方向；给对信息，它稳定产生接近产品级结果。

**实践**：维护 CLAUDE.md、.cursor/rules、GEMINI.md，让智能体一开始就理解产品世界观。第一版输出达到 90% 而不是 50%。

### 技能三：审美（Taste）

**定义**：在东西尚未存在之前，就知道该做什么。是在十个选项摆在面前时，知道其中九个不行。

**案例**：AI 讨价还价模拟器（双智能体围绕二手车交易对弈）。第一版代码干净没有报错，但界面只是普通聊天窗口，没有人格张力，没有戏剧瞬间。"它作为软件是成立的，作为体验是失败的。"

**智能体的局限**：智能体能构建任何你描述的东西，但无法判断什么值得被描述。智能体优化"正确性"，人优化"会不会有人克隆这个项目"。

**培养方法**：回顾最近五个智能体产出，逐个写下会改什么以及为什么。那个"为什么"就是审美正在形成。

### 技能四：智能体编排（Agent Orchestration）

知道什么时候用一个智能体，什么时候用多个；什么时候并行，什么时候串行；什么时候加护栏，什么时候放手。

**三种核心模式**：

1. **串行流水线**：A 完成后交给 B，适用于有依赖关系的步骤（研究→分析→写作）

2. **协调者 + 专家团队**：主智能体分派任务并整合结果，适用于复杂任务。协调者会在专家偏离方向时重新提示，并最终合并输出

3. **并行执行 + 合并**：多个智能体同时处理独立任务，最后统一汇总。适用于无依赖场景（市场调研、竞品分析），过去一个下午的串行工作现在只需几分钟

**关键判断**：知道何时放手让智能体调试，何时介入。盲目信任和全部手动，代价一样昂贵。

### 技能五：知道什么时候不用智能体（判断力）

**核心**：不是每个问题都需要智能体。有些问题只需要一个快速模型和清晰提示。

**例子**：
- 重新格式化 JSON → 丢给 Gemini 3 Flash
- 十个文件里的文案替换 → 轻量模型几秒搞定
- 一个你已经完全理解的 Bug → 自己改比向智能体解释更快

**框架**：
- 问题模糊、多步骤、需要探索解空间 → 用智能体
- 问题简单、定义清晰、答案已知 → 用快速模型
- 问题显而易见 → 用自己的手

## 如何培养这五种能力

1. **培养审美**：回顾最近五个智能体输出，写下会改什么以及为什么
2. **优化上下文**：为当前项目写 CLAUDE.md，哪怕只花 30 分钟
3. **练习问题塑形**：面对模糊需求，在提示之前先拆成 10 个子任务
4. **练习编排能力**：把串行工作流拿出来，看哪些步骤可以并行
5. **校准工具判断**：连续一周记录哪些任务用了智能体而简单提示就够

## 结论

> "打开你最近一个项目问问自己：你花更多时间在写代码，还是在塑造问题？如果答案是写代码，那你仍在用旧时代的技能结构。新的方式，从一份上下文文档和清晰的问题定义开始。代码，会自己出现。"

参考链接：https://x.com/Saboo_Shubham_/status/2021416352637125110