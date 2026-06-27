# The Shape of AI: Jaggedness, Bottlenecks and Salients

## Ch01.379 The Shape of AI: Jaggedness, Bottlenecks and Salients

> 📊 Level ⭐⭐ | 9.5KB | `entities/the-shape-of-ai-jaggedness-bottlenecks-and-salients.md`

# The Shape of AI: Jaggedness, Bottlenecks and Salients

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/the-shape-of-ai-jaggedness-bottlenecks-and-salients.md)

## 摘要

Ethan Mollick（One Useful Thing）2025 年 12 月的这篇文章把 AI 能力的"形状"从抽象的"参差不齐的边界"（Jagged Frontier）延伸到两个工程概念：**Bottleneck**（瓶颈）— 即使 AI 在大部分子任务上超人，少数短板会卡住整个工作流；**Reverse Salient**（反向突出部）— 历史学家 Thomas Hughes 的术语，指那种"卡住整个系统、解决后能带来跳跃式进步"的关键短板。Mollick 用 Google 的 Nano Banana Pro（图像生成突破直接解锁了 NotebookLM 演示文稿生成）作为近期最典型的 reverse salient 案例。

## 核心要点

### 1. Jagged Frontier 是 AI 的持久特征

Mollick 与合作者 2023 年提出 "Jagged Frontier"（参差不齐的边界）描述 AI 在某些任务超人、某些任务远低于人类直觉预期的能力分布。两年后这个特征依然存在 — AI 既能在医学诊断上超人、又能在金奖数学奥赛上超人，同时在"相对简单的视觉谜题"和"开售货机"上表现糟糕。

**Tomas Pueyo 的乐观预测**认为：随着 frontier 持续扩大，jaggedness 的相对重要性会下降。但 Mollick 反驳：LLM 缺乏对新任务的永久记忆可能是比想象中更难解决的问题，这意味着 AI 与人类工作永远存在"非完全重叠"的区域。

### 2. 即使 AI 几乎完全超人，人类仍需处理边缘情况

Cochrane reviews 的案例研究极有说服力：GPT-4.1 在两天内完成 12 个 Cochrane 综述（相当于 12 个工作年），146,000 篇引用筛选、全文阅读、数据提取、统计分析。**AI 实际在准确性上超过了人类审稿人**。

但 AI 无法访问补充文件、无法给作者发邮件索取未公开数据。这只占整个工作 < 1% 的错误率，**但这 1% 让流程无法完全自动化** — 12 个工作年变成 2 天，但必须有懂科研流程的专家处理边缘情况。

**关键工程含义**：瓶颈往往不是 AI 能力不足，而是"流程的最后一英里"无法自动化。设计 agent 系统时应优先识别这些"流程最后 1%"。

### 3. 瓶颈会从智力迁移到制度

药物发现的例子极具代表性：即使 AI 把候选药物发现速度提升 10 倍以上，**约束从智力转移到制度** — 临床试验仍需招募患者、FDA 仍需人工审查，机构以机构速度运转。

**真正的瓶颈可能是工作流中最"非智力"的部分**：合规、机构沟通、物理流程、跨组织协调。AI 加速认知，制度减速执行。

### 4. Reverse Salient：解决一个短板带来跳跃

Thomas Hughes 研究电力系统发展时提出 reverse salient — "阻碍整个系统跃进的单一技术或社会问题"。当 AI 实验室把短板视为 reverse salient 并集中解决时，**整个系统会突然跳跃前进**。

Nano Banana Pro 是过去一个月最典型的例子：把"好的图像生成模型"和"能调用搜索的智能体"组合起来，**图像生成的瓶颈解除了，整个可视化表达（演示文稿、文档、视觉沟通）的能力洪水般涌出**。

PowerPoint 演示的案例特别说明：之前 Claude、ChatGPT 通过"写代码生成 PowerPoint"实现这一功能，受限于代码表达；现在 NotebookLM 把每张幻灯片作为单张图片生成，**演示能力从受瓶颈限制突然变成不收限制**。

### 5. 跳跃式前进不会消除 jaggedness

即使 AI 在分析与演示上超人，**顾问和设计师的工作仍包含很多 AI 不擅长但人类擅长的 jagged frontier 任务**：
- 收集信息并获得多方 buy-in
- 理解"人们真正需要什么"的潜规则
- 提出独特而深刻的方案，区别于 AI 批量产物

**jagged frontier 是一把双刃剑**：每次跳跃前进会留下更多"人类被需要"的边缘。

### 6. 关注瓶颈，不要关注 benchmark

Mollick 给出的实操建议：**不要看 benchmark，要看瓶颈**。当一个瓶颈被突破，它身后堆积的能力会洪水般涌出。图像生成曾卡住演示、文档、所有视觉沟通 — 现在不再是这样。下一个瓶颈是什么？**记忆？实时学习？在物理世界行动？** 某个 AI 实验室现在正把它们视为 reverse salient 处理。

**预测能力的关键不是跟踪总分，而是识别哪些短板被列为"必须解决"的项目**。

## 深度分析

Mollick 通过 Cochrane 案例揭示了一个关键洞察：智力瓶颈往往不是真正的工程瓶颈——那 1% 的边缘情况（无法访问补充文件、无法邮件联系作者获取未公开数据）暴露的是**工作流的制度性接口**而非 AI 能力不足。这意味着 agent 系统设计需要把"跨越制度边界"视为一等公民。

药物发现案例揭示了另一层含义：即使 AI 把候选分子发现速度提升 10 倍，**约束从智力迁移到了制度**。临床试验招募、FDA 审批、机构沟通——这些以机构速度运转的环节不会因为 AI 加速认知而加速。对 AI 落地而言，制度瓶颈比模型能力瓶颈更值得优先投资。

Nano Banana Pro 的案例完美印证了 reverse salient 的工程逻辑：图像生成质量曾卡住整个可视化表达链条（演示文稿、文档、视觉沟通），当 Google 将其视为 reverse salient 投入资源解决后，**NotebookLM 的演示生成能力从受限于代码表达突然变成无限**。这个"卡住—解决—洪水般释放"的模式是识别下一个投资机会的关键框架。

LLM 无法永久记忆新任务这一特性可能是比想象中更难解决的 jagged frontier 根源。Mollick 指出这个弱点解释了为什么 AI 与人类工作永远存在"非完全重叠"的区域。对于系统设计者而言，这意味着**基于上下文的可重用 prompt、skill 和 agent 配置比期待"AI 学会"更有价值**。

jagged frontier 的双刃剑效应：每次 reverse salient 被解决、每轮跳跃前进，都会**在边缘留下更多人类被需要的任务**——收集多方 buy-in、理解潜规则、提出区别于批量 AI 产物的独特方案。这种动态意味着 AI 替代并非线性收敛，而是持续创造新的"人类专属区域"。

## 实践启示

1. **用 bottleneck 视角规划产品路线**：不要在 AI 已经擅长的能力上加码投资；识别"被卡住的工作流最后一英里"，那是高 ROI 的工程切入点。
2. **用 reverse salient 视角追踪 AI 进展**：监控头部实验室的研究资源分配 — 哪些短板被列为"必须解决"，决定哪些能力会突然跳跃。
3. **设计"专家 + AI 处理边缘情况"的协作模式**：Cochrane 案例的 1% 边缘情况表明，完全自动化是错的；正确模式是 AI 完成 99% + 专家处理 1% 不可自动化的部分。
4. **对永久记忆的局限保持敬畏**：LLM 不能永久记忆新任务这一事实，意味着"教会 AI 你的业务"不会发生 — 应优先设计基于上下文的可重用 prompt、skill 和 agent 配置，而不是期待"AI 学会"。
5. **关注制度性瓶颈而非智力瓶颈**：在企业 AI 落地中，瓶颈通常不在模型能力，而在合规、审批、跨部门流程；agent 系统设计应把"流程协调能力"作为一等公民。

## 关联实体

- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](../ch04-125-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](../ch01-781-ethan-he-cosmos-grok-imagine-latent-space-video-agent-202606)
- [Karpathy Vibe Coding Agentic Engineering](../ch04-070-从氛围编程到智能体工程)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch01-707-存之有序-治之有矩-agent-记忆系统的工程实践与演进)
- [两万字详解Claude Code源码核心机制](../ch01-734-两万字详解claude-code源码核心机制)
- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](../ch01-800-scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on)
- [Harness Engineering Framework](../ch05-041-harness-engineering-概念框架/)
- [Real Ai Agents And Real Work](../ch04-209-real-ai-agents-and-real-work)

---

