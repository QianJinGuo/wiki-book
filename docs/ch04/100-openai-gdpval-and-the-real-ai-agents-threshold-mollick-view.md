# OpenAI GDPval and the Real AI Agents Threshold (Mollick View)

## Ch04.100 OpenAI GDPval and the Real AI Agents Threshold (Mollick View)

> 📊 Level ⭐⭐ | 16.4KB | `entities/openai-gdpval-real-ai-agents-threshold.md`

# OpenAI GDPval and the Real AI Agents Threshold (Mollick View)

> **Core insight**: 2025-09 OpenAI 发布 **GDPval**——一个**由 14 年经验行业专家**设计的真实任务基准（每任务 4-7 小时），AI 几乎追平人类（**略输但差距很小**）。Mollick 用 Claude Sonnet 4.5 实测**学术 replication 危机**可被 AI 自动化解决——这不止节省时间，而是**改变整个学术领域**的可能。

## OpenAI GDPval：与众不同的基准

**特点**（vs 传统 math/trivia benchmark）：
- **任务设计者**：14 年平均经验的行业专家（金融、法律、零售等）
- **任务长度**：4-7 小时人类专家完成时间
- **参与者**：AI + 其他专家（双盲）
- **评分者**：第三方专家，**不知道哪个答案来自 AI 哪个来自人类**，每题评分 ~1 小时
- **数据公开**：[所有任务](https://huggingface.co/datasets/openai/gdpval/viewer/default/train) + [论文](https://cdn.openai.com/pdf/d5ebeb7428-c4e9-4a33-bd86-86dd4bcf12ce/GDPval.pdf)

**结果**：
- **人类专家胜出，但优势很小**
- 行业间差距大
- 更新的 AI 模型远胜旧模型
- **AI 失败主因**：不是幻觉和错误，而是**格式不佳 / 不严格按指令执行**——这些是"快速改进区"

**预测**：如果当前模式持续，**下一代 AI 模型应能平均超过人类专家**在这个测试上。

## "AI 准备取代人类工作吗？"——Mollick 的关键反驳

**答案：不会（短期内）**。原因：**测的是任务不是工作**。

> "My job as a professor is not just one thing, it involves teaching, researching, writing, filling out annual reports, supporting my students, reading, administrative work and more. AI doing one or more of these tasks does not replace my entire job, it shifts what I do. And as long as AI is jagged in its abilities, and cannot substitute for all the complex work of human interaction, it cannot easily replace jobs as a whole…"

**关键洞察**：工作 ≠ 任务总和。**任务被自动化 ≠ 工作被取代**——而是工作内容重新分配。

## "AI 现在能做的有极高价值任务"——学术 Replication

Mollick 的标志性实测：

**任务**：用 Claude Sonnet 4.5 复制 [sophisticated economics paper](https://direct.mit.edu/rest/article-abstract/102/4/648/96785/Using-Goals-to-Motivate-College-Students-Theory?redirectedFrom=fulltext) 的发现。

**输入**：论文 PDF + [完整 replication data archive](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/IO8NQU) + 两个 prompts：
1. "replicate the findings in this paper from the dataset they uploaded. you need to do this yourself. if you can't attempt a full replication, do what you can"
2. "can you also replicate the full interactions as much as possible?"

**Claude 自主做了什么**：
1. 读论文
2. 打开 archive 分类文件
3. **从 STATA 转 Python**（统计代码语言转换）
4. 逐一过所有 findings
5. 报告成功 reproduction

**Mollick 验证**：
- 自己 spot-check
- 用另一个 AI（GPT-5 Pro）复现 reproduction
- **都通过**

**意义**：

> "But the revolutionary part is not that I saved a lot of time. It is that a crisis that has shaken entire academic fields could be partially resolved with reproduction, but doing so required painstaking and expensive human effort that was impossible to do at scale. **Now it appears that AI could check many published papers, reproducing results, with implications for all of scientific research.**"

**学术 replication 危机**——重要发现无法被其他研究者复现——原本是**只能靠痛苦、昂贵、无法规模化的人类劳动**。现在 AI 似乎可以批量检查论文、复现结果，**对所有科学研究有深远影响**。

## 关键论文：为什么 Agent 突然变强

Mollick 引用 [arXiv 2509.09677](https://arxiv.org/pdf/2509.09677) 解释**反直觉的发现**：

> "It turns out most of our assumptions about AI agents were wrong. Even small increases in accuracy (and new models are much less prone to errors) leads to huge increases in the number of tasks an AI can do. And the biggest and latest 'thinking' models are actually self-correcting, so they don't get stopped by errors."

**三个发现**：
1. **准确率小幅提升 → 任务完成数大幅增长**（非线性放大）
2. 新模型错误率显著降低
3. **"thinking" 模型自我纠错**——不因中间错误停止

→ 含义：AI agents **能完成比之前多得多的步骤**，**能在不需人类干预下使用工具**（含"任何你电脑能做的事"）。

## METR 测试：5 年指数曲线

[METR 任务长度测试](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/) 是少数覆盖 GPT-3 → GPT-5 整个时间段的 AI 能力指标。**指数级增长**跨 5 年非常一致——证明 agent 工作的持续改进。

## "如何用 AI 做有经济价值的事"

Mollick 的关键警告：

> "For now, we need to decide what to do with them, and that will determine a lot about the future of work."

**两个风险**：
1. **显性风险**：用 AI 取代人类劳动（不难想象未来几年成为主要问题，尤其对**只关注削减成本而非扩展/转型**的"无想象力组织"）
2. **隐性的、更可能的风险**："用 agent 做我们现在做的更多任务，**不思考**"

**噩梦预览**：Mollick 给 Claude 一个公司备忘录，让它做 PowerPoint。换个角度，再做。**做了 17 个不同 PowerPoint**——"那是太多 PowerPoint"。

**启示**：**任务自动化没有"自动停止"机制**——人类必须学会**设定完成条件**，否则 AI 一直迭代到天荒地老。

## 三个独到洞察

1. **"测的是任务不是工作"** —— 这是反驳"AI 取代工作"叙事的**最关键框架**。Mollick 用自己 professor 工作分解（teaching/researching/writing/admin 等）实证**任务自动化 ≠ 工作取代**。这比"AI 不会取代你"的口号更具理论支撑。

2. **"Replication 危机 = AI 的高价值应用"** —— 学术界几十年未能规模化解决的痛点，AI 提供了根本性解决方案。这**改变整个学术领域**，不是节省时间。

3. **"17 PowerPoint 噩梦"** —— 用幽默捕捉了**任务自动化的隐性风险**：**AI 没有"够好"判断**，需要人类定义完成条件。这是组织使用 AI 的**核心新能力**。

## 与 [Opus 4 7 Launch Claude Code Best Practices Wechat](../ch03/075-claude-code.html) / the Claude Code what-comes-next analysis 的关系

| 维度 | GDPval / Real Work (本文) | Claude Code What Comes Next | Opus 4.7 实战 |
|------|--------------------------|---------------------------|----------------|
| 视角 | **真实工作价值**的基准 | 单条 prompt 端到端 | Anthropic 官方 + WeChat 实战 |
| 重点 | 任务 vs 工作，隐性风险 | 4 个 magic tricks | hooks / subagents / skills 工程深度 |
| 关联 | agent 时代经济含义 | agent 能力的用户演示 | agent 能力的技术实现 |
| 风险讨论 | 充分（17 PowerPoint 噩梦） | 简短警告 | 工程风险（sandbox） |

→ **互补**：
- GDPval 提供**"为什么 agent 重要"的实证基准**
- Claude Code What Comes Next 提供**"agent 能做到什么"的用户演示**
- Opus 4.7 实战提供**"如何工程化实施 agent"的技术深度**

## 实践要点

**对个人 / 知识工作者**：
- **不要担心"AI 取代工作"**——担心"AI 把工作内容改得面目全非"
- **学会定义"完成条件"**——否则陷入 17 PowerPoint 噩梦
- **把"任务"和"工作"分开**——把高价值任务让给 AI 自动化，但保留**人际交互 / 复杂判断 / 原创工作**

**对企业**：
- **不要只关注削减成本**——用 AI 扩展和转型工作
- **设定 agent 完成条件**——避免"AI 一直迭代"
- **重新设计工作流**——围绕"AI 能做的任务"和"人独有的工作"重新组织

**对学术界**：
- **AI 可以批量复现研究**——潜在解决 replication 危机
- **挑战**：基准化准确性和公平性
- **机会**：让科研更可验证、更可重现

## 上线状态

- **作者**：Ethan Mollick（One Useful Thing，Wharton 教授）
- **发布日期**：2025-09-29
- **GDPval 发布**：2025-09（OpenAI）
- **GDPval 公开数据集**：[huggingface.co/datasets/openai/gdpval](https://huggingface.co/datasets/openai/gdpval/viewer/default/train)
- **GDPval 论文**：[cdn.openai.com/.../GDPval.pdf](https://cdn.openai.com/pdf/d5eb7428-c4e9-4a33-bd86-86dd4bcf12ce/GDPval.pdf)
- **关键引用论文**：[arXiv 2509.09677](https://arxiv.org/pdf/2509.09677) —— agent 能力非线性增长
- **METR 任务长度**：[metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)

## 关键引用

> "AIs have quietly crossed a threshold: they can now perform real, economically relevant work."

> "AI doing one or more of these tasks does not replace my entire job, it shifts what I do. And as long as AI is jagged in its abilities, and cannot substitute for all the complex work of human interaction, it cannot easily replace jobs as a whole…"

> "It is that a crisis that has shaken entire academic fields could be partially resolved with reproduction, but doing so required painstaking and expensive human effort that was impossible to do at scale. Now it appears that AI could check many published papers, reproducing results, with implications for all of scientific research."

> "Even small increases in accuracy (and new models are much less prone to errors) leads to huge increases in the number of tasks an AI can do. And the biggest and latest 'thinking' models are actually self-correcting, so they don't get stopped by errors."

> "The risk everyone focuses on is using AI to replace human labor... But there is a second, very likely, risk about using AI at work: using agents to do more of the tasks we do now, unthinkingly."

## 深度分析

1. **准确率提升的非线性放大效应** —— 小幅准确率提升带来任务完成数大幅增长，"thinking"模型自我纠错能力使AI agents能完成比以往多得多步骤且无需人类干预。 这意味着当前AI的能力阈值正在快速上移，"不可能"的任务边界每天都在收缩。

2. **任务自动化 ≠ 工作取代** —— GDPval测的是任务（task）而非工作（job）。Mollick以自己教授职责拆解为例：教学、研究、写作、行政、支持学生等多项任务组成一份工作，AI替代一个或多个任务并不等于替代整份工作。 这是反驳"AI取代人类工作"叙事的核心分析框架——工作内容被重新分配，而非工作本身被消灭。

3. **学术 Replication 危机是AI高价值任务的范式案例** —— 学术界几十年无法规模化的痛点（重要发现无法被复现），AI可以在极短时间内批量检验已发表论文的统计结果。 这一应用不止节省时间，而是根本性地改变科学的可验证性结构——对所有学科都有深远影响。

4. **"17 PowerPoint噩梦"的深层含义：任务自动化没有内置停止机制** —— Mollick让Claude根据一份备忘录制作不同角度的PPT，最终得到17个版本。 这个幽默案例揭示了一个深刻风险：AI没有"够好"的内在判断，人类必须学会定义完成条件和质量标准，否则AI会无限迭代直到资源耗尽。

5. **"不思考地用AI做更多任务"是比"AI取代人类"更隐性、更可能的系统性风险** —— 公众注意力集中在AI替代人类劳动的显性风险上，但Mollick指出第二个风险：用AI无意识地放大现有工作流程，而不质疑为什么要做这件事。 这会导致组织被AI产生的大量内容淹没，而非真正提升能力。

## 实践启示

1. **在部署AI agent前明确定义"完成条件"** —— 缺乏清晰的停止标准是"17 PowerPoint噩梦"的根本原因。团队需要建立AI任务的验收标准：质量指标、产出数量上限、人工审核节点，而非让AI无限生成直到资源耗尽。

2. **优先将学术Replication类高价值任务交给AI** —— 论文复现、数据验证、统计检查等重复性知识工作，是AI当前最具变革性价值的应用场景。组织应建立内部AI辅助研究验证流程，尤其对政策影响大、可重复性要求高的研究领域。

3. **采用"AI first pass + 专家审核"混合工作流** —— OpenAI论文建议：先用AI完成初稿，若质量不足则提供纠正指令，若仍不达标则人工接手。 这一模式可将工作效率提升40%、成本降低60%，同时保持人类对AI产出的控制权。

4. **围绕"AI能完成的任务"和"人独有的工作"重新设计组织流程** —— 不是简单用AI替换人力，而是重新划分职责：AI负责数据处理、格式转换、初步分析；人类负责问题定义、结果判断、复杂人际交互和原创决策。这是真正扩展（expand）而非仅削减成本（cut）。

5. **建立组织级AI使用政策，而非依赖个人即兴使用** —— 个人用户容易陷入"无意识地用AI做更多任务"陷阱。组织需要自上而下地定义：哪些任务值得AI介入、什么时候需要人工审核、AI产出的质量门槛是什么。AI的能力已经足够，差距在于组织的判断力。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/real-ai-agents-and-real-work.md)

---

