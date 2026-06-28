## Ch06.011 AI 的形状：Jagged Frontier·Bottleneck·Reverse Salient（Mollick）

> 📊 Level ⭐⭐ | 12.2KB | `entities/jagged-ai-frontier-mollick.md`

# AI 的形状：Jagged Frontier·Bottleneck·Reverse Salient（Mollick）

> 2026-06-07 引用自 Ethan Mollick《The Shape of AI: Jaggedness, Bottlenecks and Salients》，One Useful Thing，2025-12-20。

## Jagged Frontier 的本质

Mollick 2023 年与合著者提出"Jagged Frontier"描述 AI 在不同任务上的极端不均匀表现：

**超强例子**：
- 差异医学影像诊断达到超人水平
- 极难数学问题（国际数学奥林匹克）现已解决

**超弱例子**：
- 相对简单的视觉推理题
- 操作自动售货机

**为什么会 jagged？** 核心原因之一：**LLM 不记忆新任务，无法永久学习**。很多 AI 公司在解决这个问题，但可能比预期更难。

AI 和人类的能力域**不完全重叠**：AI 在某些领域超人类，在另一些领域远低于人类或根本不重叠。这创造了"人机互补"的工作机会。

## Bottleneck：即使超强 AI 也无法自动化

系统能力取决于最弱的组件。即使 AI 在大多数任务上超人类，以下瓶颈仍阻止完全自动化：

| 瓶颈类型 | 具体案例 | 为什么卡住 |
|---------|---------|-----------|
| AI 能力不足 | 医学影像 LLM 读片精度不够，无法替代医生 | AI 视觉系统不够精确 |
| AI 过于 helpful | LLM 无法在应该 push back 时保持立场，不能替代治疗师 | 过度顺从 |
| 幻觉 | 需要 100% 准确率的任务（如法律文档）无法完全自动化 | 幻觉率虽降低但仍存在 |
| 制度性瓶颈 | 药物发现提速 10x 但临床试验仍需招募真实患者 | FDA 仍需人类审查 |

**Cochrane Reviews 案例**：GPT-4.1 两天完成 12 个系统性综述（相当于 12 work-years），筛选 146,000 引文，阅读论文、提取数据、运行统计分析，表现优于人类审稿人。但无法访问补充文件+无法 email 作者请求未发表数据（占错误 <1%），意味着不能完全自动化——专家必须处理边缘情况。

## Reverse Salient：卡住整个系统的单点弱点

历史学家 Thomas Hughes 研究电力系统时发现：进展往往卡在单一技术或社会问题上，他称之为 **"reverse salient"**（反向凸出）。

**图像生成作为 reverse salient 的案例**：
- 此前所有 AI 公司努力让 AI 做 PowerPoint，但 AI 通过写代码创建 PPT，过程困难
- Google Nano Banana Pro（图像生成模型 + 智能 AI 指导）组合突破了这个问题
- NotebookLM 现在可以从文本生成精美幻灯片（不再是代码，是单张图像）
- **图像生成质量就是那个 holding back everything 的 reverse salient**

> "Image generation was holding back presentations, documents, visual communication of all kinds. Now it isn't."

## 观察瓶颈，而非 benchmarks

Mollick 的关键建议：**看瓶颈，别看 benchmark**。

当前 reverse salients 可能是：
- **Memory**（长期记忆）
- **Real-time learning**（实时学习）
- **Physical world actions**（物理世界操作）

当一个 reverse salient 被突破时，behind it 的所有能力都会 flood through。

## 深度分析

### 1. Jagged Frontier 的认知陷阱：专家与外行的共同盲区

Jagged Frontier 的核心认知挑战在于：AI 的能力分布与人类对任务难度的直觉判断**高度不匹配**。Mollick 指出，即使是 AI 研究者也难以准确预测哪些任务 AI 能做、哪些不能做——国际数学奥林匹克难题已被攻克，但操作自动售货机这种对人类trivial的任务却仍是难题。

这种不匹配创造了一个独特的认知陷阱：外行往往高估 AI 在"常识性任务"上的能力（如简单视觉推理），同时低估 AI 在"高度专业化任务"上的表现（医学影像诊断）。Tomas Pueyo 的"AI 能力将全面超越人类"的乐观模型忽视了能力图谱的非均匀扩张——即使整体向上移动，jaggedness 本身并不会消失，因为 LLM 无法以持久方式记忆新任务并从中学习。

### 2. Bottleneck 的四层分类体系：从 AI 能力到制度约束

Mollick 的分析揭示了 Bottleneck 并非单一类型，而是呈现**递进层级结构**：

**第一层：AI 内在能力不足**——视觉系统不够精确、幻觉难以根除、缺乏长期记忆。这类瓶颈理论上可通过更好的模型架构解决，但实际进展往往比预期慢。

**第二层：AI 行为特性矛盾**——LLM 的"过度顺从"本意是提高有用性，却在需要 AI 坚持立场时（如替代治疗师）成为致命缺陷。这是能力与场景错配的问题，并非简单的"不够强"。

**第三层：制度性瓶颈**——即使 AI 在智力层面完全超越人类，FDA 审批、临床试验招募、监管审查等制度性流程仍以机构速度运行。药物发现提速 10x 被临床试验的慢速卡住，瓶颈从"发现能力"迁移到"制度效率"。

**第四层：边缘 case 的不可自动化**——Cochrane Reviews 案例最具启发性：GPT-4.1 完成 99%+ 的工作且准确性优于人类，但无法访问补充文件和联系作者获取未发表数据——这 <1% 的错误意味着全自动化仍不可能。这类瓶颈的特点是：AI 已经能处理绝大多数情况，但**极端长尾的边缘 case 需要人类专业判断**。

### 3. Reverse Salient 的突破机制：断裂点与连锁跃迁

Thomas Hughes 研究电力系统时提出的"reverse salient"概念在 AI 领域展现出强大的解释力。其核心洞察是：**系统进步往往不来自全面改善，而是来自对单一卡点的突破**。当 Nano Banana Pro（图像生成模型 + 智能指导 AI）这一组合突破了图像生成质量这个 reverse salient，NotebookLM 立即获得了从前无法想象的幻灯片生成能力——不需要写代码，每张幻灯片作为单张图像渲染，风格可自由变换。

这个案例揭示了 reverse salient 突破的连锁机制：图像生成质量的提升不仅解决了幻灯片一个问题，而是同时解放了"视觉沟通"这个广泛领域——文档、演示、图表、风格化设计全部受益。这解释了为什么"看 benchmark"无法预测能力跃迁：benchmark 反映的是当前状态，而 reverse salient 的突破是**非线性的、不可微分的**。

### 4. 人机互补的结构性成因：能力域的非重叠性

Colin Fraser 的两张概念图描绘了 AI 与人类能力域之间的三种关系：超人类区域（AI 远优于人类）、低于人类区域（AI 远弱于人类）、以及**完全不重叠区域**——这是人机互补工作机会的结构性来源。

Mollick 强调，即使 AI 在分析和制作幻灯片上超越人类，咨询师和设计师的工作不会立即消失——因为这些工作包含大量沿着 jagged frontier 分布在 AI 薄弱区域的任务：收集多方信息并获得认同、理解未成文的潜规则、提出真正独特且脱颖而出的原创方案。这些恰恰是 AI 在可预见的未来仍难以替代的人类核心能力。

### 5. 当前 Reverse Salients 的优先级排序：Memory、实时学习与物理世界

Mollick 明确指出当前三个最值得关注的 reverse salients：**Memory（长期记忆）**、**Real-time learning（实时学习）**、**Physical world actions（物理世界操作）**。这三者的共同特点是：它们都是 LLM 架构层面的根本性限制，而非简单的模型能力不足。

从 Cochrane Reviews 案例可以看出，即使 GPT-4.1 在智力层面已经能处理极其复杂的分析任务，缺乏持久记忆意味着它无法跨会话积累专业知识，每次对话都需要重新初始化。这不是 prompt engineering 可以解决的问题，而是需要架构层面的根本性创新。

## 实践启示

### 1. 用 Bottleneck 思维替代能力清单思维

传统 AI 评估倾向于问"AI 能做什么"，而 Mollick 建议我们问"**什么在阻止 AI 完全自动化这项任务**"。对于任何拟引入 AI 的业务流程，首要动作是识别其中的 bottleneck 类型：如果是 AI 能力不足型（视觉精度、幻觉率），则等待模型进步；如果是制度性瓶颈（FDA 审批），则 AI 优化该环节的边际收益有限；如果是边缘 case 占比虽小但不可忽略，则需要设计"AI 处理主体+人类处理边缘"的人机协作流程。

### 2. 将 Cochrane Protocol 应用于知识工作自动化评估

GPT-4.1 完成 Cochrane Reviews 的案例提供了一个可复制的 AI 自动化可行性评估框架：**（1）让 AI 完成完整流程；（2）识别 AI 无法访问的资源类型（如补充文件、作者通信）；（3）评估这些缺失资源导致的错误率及影响；（4）如果错误率低但不可忽略，则 AI 适合担任主要执行者、人类担任质量审核者，而非追求全自动化**。这个框架特别适用于法律文献综述、竞品分析、技术评估等知识密集型任务。

### 3. 主动追踪 Reverse Salient 的突破信号

既然"看 benchmark 无法预测跃迁"，则需要建立针对 reverse salient 的主动监测机制。具体操作：对于 Memory、实时学习、物理世界操作这三个当前 reverse salients，关注相关 AI 实验室的技术更新（如海马体记忆架构、在线学习算法、机器人控制模型）。当某个 reverse salient 突破时，不仅要立即评估其对自己领域的影响，还要预判"behind it 的所有能力"——这些是将被连锁释放的能力。

### 4. 设计人机互补岗位而非人机竞争岗位

Jagged Frontier 的存在意味着 AI 和人类的能力域天然互补。管理者应主动识别业务流程中 AI 超强的环节（数据分析、文献检索、内容生成）和 AI 薄弱的环节（信息收集与多方沟通、理解潜规则、原创方案），然后**围绕这个互补结构重新设计岗位**，而非简单地将"AI 能做的事情"交给 AI、"AI 做不了的事情"交给人类。前者是效率优化，后者是结构性创新。

### 5. 在 AI 能力快速提升期保持"足够好"而非"完美"的判断标准

Cochrane 案例的核心教训：追求 100% 自动化往往是错误的目标。GPT-4.1 两天完成 12 work-years 的系统性综述，即使有 <1% 的边缘错误，相比人类同行已经产生质的飞跃。**对于大量知识工作，98% 准确率+人类审核比 100% 准确率但无 AI 辅助更有实用价值**——前提是正确评估边缘 case 的实际影响。当你的业务流程中 AI 能处理的部分已经显著优于人类，停滞等待"完美 AI"反而是最差策略。

## 相关实体
- [Ai Job Interview Model Evaluation Mollick](ch01-460-designing-with-ai-why-claude-design-is-not-the-future-of-en.html)
- [Sign Of The Future Gpt 55 Mollick](ch01-269-memento-skills-agent-arxiv-2603-18743.html)
- [Management As Ai Superpower Mollick](ch04-273-notes-on-amazon-v-perplexity.html)
- [Three Years Gpt3 Gemini3 Mollick](ch04-222-agent-skills-ui.html)
- [Bitter Lesson Garbage Can Mollick](ch04-272-bitter-lesson-vs-garbage-can-组织理论视角下的-ai-采用.html)

## 关键引用

> "A system is only as functional as its worst components. We call these problems bottlenecks."

> "When one bottleneck breaks, everything behind it comes flooding through."

> "A jagged frontier cuts both ways. So far, every lurch forward leaves yet more edges in which humans are needed."

## 相关主题

- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/the-shape-of-ai-jaggedness-bottlenecks-and-salients.md)

---
