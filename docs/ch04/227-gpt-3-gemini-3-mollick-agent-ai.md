# 三年从 GPT-3 到 Gemini 3：Mollick 对 Agent 时代 AI 演进的实测

## Ch04.227 三年从 GPT-3 到 Gemini 3：Mollick 对 Agent 时代 AI 演进的实测

> 📊 Level ⭐⭐ | 10.4KB | `entities/three-years-gpt3-gemini3-mollick.md`

# 三年从 GPT-3 到 Gemini 3：Mollick 对 Agent 时代 AI 演进的实测

> 2026-06-07 引用自 Ethan Mollick《Three Years from GPT-3 to Gemini 3》，One Useful Thing，2025-11-18。

## 三年的指数曲线

2022 年 11 月：AI 只能写一个关于 candy-powered FTL 飞船逃离水獭的**连贯段落**。

2025 年 11 月：AI 可以在 2022 年同样的提示下，**自己编写出完整可玩的游戏**。 

Gemini 3 发起挑战：用同一篇文章演示 AI 进步。收到"show how far AI has come since this post by doing stuff"的单一提示后，Gemini 3 主动构建了完整的 Candy-Powered FTL Starship Simulator——不是描述游戏，是**写代码、做界面、让你亲自玩**。

## 编码工具不只是程序员的工具

Gemini 3 发布时同步推出 **Antigravity**（类似 Claude Code/OpenAI Codex 的编程 Agent）。Mollick 强调：**编程能力本质上是能够在电脑上做任何事情的能力**——构建仪表板、操作网站、创建 PowerPoint、读取文件。Agent 能编码 = Agent 能做任何人类用电脑能做的事。

Antigravity 的 Inbox 概念：发送 AI 任务，Agent 在需要批准时 ping 你。Mollick 用 Antigravity 分析了自己所有 newsletter 文章、进行网络研究、创建网站、部署结果，全程像在管理队友而非操作 chatbot。

## PhD 级智能测试

Mollick 给 Gemini 3 分配了一个典型的二年级 PhD 学生任务： 
- 访问混乱的旧研究文件（各种命名不规范、过期数据格式）
- "弄清楚数据结构，做数据清理，找新发现"
- 然后"写一篇原创论文，关于众筹但涉及创业或商业策略的重要理论主题，做深度研究，做复杂分析，写成期刊格式"

AI 自动完成： 
- 恢复损坏数据，理解复杂环境
- 提出原创假设，统计检验
- 生成原创研究论文（14页）

最有趣的部分：AI 在没有提示的情况下自己想出了衡量众筹想法独特性的方法（用 NLP 比较数学描述）。当然也有 PhD 学生水平的弱点：部分统计方法需要更多工作，部分方法不是最优的，部分理论推演超出证据范围。

"PhD 智能"不再那么遥远——定义为做合格研究生的实际工作。 

## 结论

Chatbot 时代正在转变为**数字同事时代**。"Human in the loop"从"人类修复 AI 错误"演变为"人类指挥 AI 工作"。这可能是 ChatGPT 发布以来最大的变化。

## 深度分析

### 从"能说"到"能做"的范式跃迁

GPT-3 时代的核心限制在于其输出本质上是**文本生成**——无论多么流畅，都停留在"能说"的层面。Mollick 的 candy-powered FTL 飞船测试揭示了一个关键拐点：2022 年 AI 被要求写一首关于这个概念的诗，它只能产出文字描述；2025 年同样模糊的指令却触发了**自主构建完整可运行游戏**的行为。  这不是性能的线性提升，而是任务执行模式的根本性转变——从响应 prompt 到**自主规划并交付完整成果**。这种跃迁意味着 AI 正在从"高级搜索引擎"进化为"可委托任务的数字员工"。

### Agentic AI 的权力不对称

Mollick 强调编程能力本质上是"在电脑上做任何事情的能力"，这一洞察揭示了 Agent 工具的真正颠覆性。传统视角下，编程是程序员的专属技能；但当 AI Agent 能够编程时，这个等式两端同时发生了变化——**编程不再是人类的专业技能，而成为 AI 与操作系统之间的通用接口**。  Antigravity 的 Inbox 模式（发送任务→AI ping 你审批）将这种不对称进一步显性化：人类扮演的是**管理者而非执行者**，权力位置从"做"转向"决定做什么"。

### "PhD 级智能"的定义陷阱

Mollick 对"PhD 级智能"的测试暴露了这一概念的双重含义。技术厂商宣称"PhD 级"通常指的是**知识储备的广度与深度**——模型在各项基准测试上逼近或超越人类专家水平。但 Mollick 的实测却揭示了更复杂的图景：Gemini 3 确实能完成二年级 PhD 学生级别的原创研究任务，包括恢复损坏数据、提出可检验假设、生成完整论文。  然而它的弱点恰恰也是 PhD 学生常见的弱点——部分统计方法需要更多工作，部分方法选择并非最优，部分理论推演超出证据支撑范围。这提示我们"PhD 级智能"可能需要重新定义为**完成合格研究生的实际工作**，而非单纯的学术知识储备。

### "Human in the Loop"的语义迁移

从 ChatGPT 到 Gemini 3，"Human in the loop"的概念发生了根本性语义迁移。早期 AI 时代，这个短语意味着**人类负责纠正 AI 的错误输出**——是一种质量控制机制。Mollick 观察到的变化是它正在演化为"人类指挥 AI 工作"——从错误修复者转变为工作导演。  这种迁移带来的管理挑战是全新的：不再需要"AI 做对了什么"的监督能力，而需要"应该让 AI 做什么"的决策能力。管理 Agentic AI 的核心技能从技术判断力转向**战略判断力与任务分解能力**。

### 从聊天界面到数字同事的体验鸿沟

Mollick 明确指出管理 Agent 与使用 chatbot 是两种截然不同的体验："感觉更像是在管理队友，而不是在 chat 界面中 prompt AI"。  这个体验鸿沟揭示了 Agentic AI 的真正革命性所在：它不仅仅是能力的增强，更是**人机协作模式的范式转换**。传统 chatbot 使用者需要把自己调整为"AI 能理解的表达方式"；而 Agent 使用者则可以维持自然的人类工作流，让 AI 适应人类的沟通习惯。这意味着非技术用户采用 AI 的门槛大幅降低——不再需要学习"如何 prompt"，而是可以用自己的专业语言布置任务。

## 实践启示

### 1. 用"任务"替代"问题"重构工作流

传统 AI 使用模式是向 chatbot **提问**（"帮我写一封邮件"）；Agent 时代应该转向**委托任务**（"帮我分析这份报告，找出三个战略机会，输出结构化建议"）。关键转变在于从开放式问题到明确交付物的思维转换。  这要求工作者在发起任务前先完成**任务分解与预期定义**——这恰恰是人类判断力应该投入的地方。

### 2. 建立"AI 团队成员"的管理心智

Mollick 用 Antigravity 的体验是"管理队友"而非"操作工具"。对于知识工作者，这意味着需要建立新的工作心智模型：把 AI Agent 视为**有能力的同事，但需要明确授权与边界设定**。实践建议是，为每个 Agent 任务明确范围（我能做什么）、决策权限（何时需要我审批）、以及交付标准（什么算完成）。  这种心智模型还意味着需要容忍 Agent 的"人类式错误"——Mollick 指出他的 Agent 犯的更多是判断偏差而非 AI 幻觉。

### 3. 投资"任务分解"而非"Prompt 工程"

随着 Agentic AI 普及，真正有价值的人类技能从"学会如何向 AI 表达需求"转向"学会如何将复杂目标拆解为可执行的任务序列"。Mollick 的案例中，他将"分析所有 newsletter 文章并生成预测准确率网站"这样的高层目标委托给 Agent，Agent 自己完成了文件读取、代码执行、网页研究、结果部署的完整链条。  这提示知识工作者应该更多练习**目标拆解**而非 prompt 技巧——把精力放在"想清楚要什么"，而非"怎么说清楚"。

### 4. 主动为 Agent 设置检查点

Mollick 强调 Agent"在需要批准时会 ping 你"——这意味着有效的 Agent 使用需要工作者**主动设计检查点而非被动等待错误**。实践建议是，在任务流程的关键节点（数据处理完成、分析框架确定、初稿生成）预设审核点，而非等 Agent 完成全部工作后再检查。  这与软件工程中"早发现早修复"的原则类似，但检查的是判断质量而非代码正确性。

### 5. 用"指导学生"的方式引导 Agent 迭代

Mollick 发现，当他对 Gemini 3 提出模糊但有空间的改进建议（"build it out more, make it better"），Agent 的表现提升显著——"就像指导学生一样"。  这提示 Agentic AI 的最佳交互模式不是"一次性给出完整指令"，而是**迭代式引导**：给方向而非给细节，让 AI 自己补全执行路径。这要求工作者具备"模糊指令精确化"的能力——既能给出战略方向，又能为 AI 的创造性执行留出空间。

## 相关实体
- [Using Ai Right Now Mollick Quick Guide](ch04/150-ai.md)
- [Gpt5 Just Does Stuff Mollick](https://github.com/QianJinGuo/wiki/blob/main/entities/gpt5-just-does-stuff-mollick.md)
- [Guide Ai Agents Models Apps Harnesses Mollick](ch04/150-ai.md)
- [Sign Of The Future Gpt 55 Mollick](https://github.com/QianJinGuo/wiki/blob/main/entities/sign-of-the-future-gpt-55-mollick.md)
- [Bitter Lesson Garbage Can Mollick](https://github.com/QianJinGuo/wiki/blob/main/entities/bitter-lesson-garbage-can-mollick.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/three-years-from-gpt-3-to-gemini-3.md)

---

