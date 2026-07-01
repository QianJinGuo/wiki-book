# Three Years from GPT-3 to Gemini 3

## Ch01.270 Three Years from GPT-3 to Gemini 3

> 📊 Level ⭐⭐ | 16.5KB | `entities/three-years-from-gpt-3-to-gemini-3.md`

# Three Years from GPT-3 to Gemini 3

> Source: One Useful Thing (Ethan Mollick, Substack), 2025-11-18
> URL: https://www.oneusefulthing.org/p/three-years-from-gpt-3-to-gemini

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/three-years-from-gpt-3-to-gemini-3.md)

## 摘要

Ethan Mollick 通过让 Gemini 3 复刻自己三年前 GPT-3 时代的"糖果驱动 FTL 飞船"演示，展示了 AI 三年来的跨越式进步：从"能写诗描述引擎"进化为"能编码、设计界面、让你真正驾驶飞船"。核心论断是：**"编写代码的能力不仅是编程，而是能做计算机上发生的任何事"**——这使任何能编码的 Agent 变成通用工具。Gemini 3 配合的 Antigravity 工具引入 Inbox 概念，让人从"通过聊天界面提示 AI"演化为"管理数字同事"。

## 核心要点

- **三年跨越式进步**：2022 年 ChatGPT 发布时 AI 能写连贯段落；2025 年 Gemini 3 能编码引擎、设计界面、让你实际驾驶飞船。
- **"编写代码的能力不仅是编程"**：所有在计算机上做的事情最终都是代码——构建仪表板、操作网站、创建 PowerPoint、读取文件。**这使任何能编码的 Agent 变成通用工具**。
- **Antigravity 的 Inbox 概念**：可以给 AI Agent 分配任务、需要权限或帮助时它们会 ping 你——人从"通过聊天界面提示 AI"演化为"管理数字同事"。
- **PhD 级智能测试**：Mollick 给 Gemini 3 真实的研究任务——分析十年前的众筹研究数据、提出原创假设、做统计分析、生成期刊风格的论文——AI 自动设计了原创衡量方法（用 NLP 工具比较众筹项目描述的独特性），最终输出 14 页格式化论文。
- **"PhD 智能"的边界**：在某些方面是的——能做有能力的 PhD 学生工作；但也有 PhD 学生的弱点——有些统计方法需要改进、有些方法不够最优、有些理论化超出证据。
- **从 chatbox 到 digital coworker**：三年内 AI 从"会写诗"进化为"能建立自己研究环境的数字同事"，**chatbot 时代正在变成数字同事时代**。
- **Human-in-the-loop 的演变**：从"修复 AI 错误的人"变成"指导 AI 工作的人"——这可能是自 ChatGPT 发布以来最大的变化。

## 深度分析

### 1. "能编码 = 通用工具"的核心论断

本文最深刻的判断是：**编写代码的能力不仅是编程，而是能做计算机上发生的任何事**——所有在计算机上做的事情最终都是代码，如果 AI 能与代码协作，它能做任何计算机能做的事：构建仪表板、操作网站、创建 PowerPoint、读取文件。

**这一论断的工程含义**：

1. **Agent 能力的基础设施视角**：Agent 能力的边界不是由"特定任务的专门模型"决定，而是由"它能与多少计算资源交互"决定。
2. **通用工具与专用工具的分野**：能编码的 Agent 是通用工具，不能编码的 Agent 是专用工具。
3. **编程语言作为 Agent 的元能力**：编程语言不只是给程序员用的，而是 Agent 系统能力的元层级。

这与 [Code as Agent Harness Survey](ch09/046-code-as-agent-harness.md) 中关于"代码即 Agent Harness"的论述形成强对应——编程能力是 Agent 系统能力的"乘数因子"，而不是"附属技能"。

### 2. Antigravity Inbox：从 Chatbox 到 Coworker 的产品形态

Google 配套 Gemini 3 推出的 Antigravity 工具引入 **Inbox** 概念——可以给 AI Agent 分配任务，需要权限或帮助时它们会 ping 你。

**Inbox 范式的革命性**：

- **去对话化**：用户不再是"在聊天界面输入 prompt"，而是"在收件箱里分配任务"
- **异步化**：Agent 不需要实时响应，可以独立工作数小时
- **多 Agent 并行**：可以同时管理多个 Agent，识别"哪个在工作、哪个需要你的帮助"
- **权限模型**：Agent 自主工作时，遇到关键决策点会 ping 用户等待授权

Mollick 截图展示的工作场景："同时有四个不同 Agent 在工作，一个在工作，另一个需要你的帮助才能继续"——这与 [Factory Mission](ch04/150-ai.md) 中 Orchestrator 协调多 Worker 的模式有异曲同工之妙，但 Inbox 把"协调者"角色直接交给了用户。

### 3. "管理数字同事"的人机协作模式

Mollick 描述的真实工作流：

1. 给 Antigravity 访问包含所有 newsletter 文章的目录
2. 让 Gemini 3"制作一个我所有 AI 预测的漂亮列表站点，也做网络搜索看哪些预测对哪些错"
3. AI 读取所有文件、执行代码，直到给出计划
4. 用户可以编辑或批准计划
5. AI 执行网页研究、创建站点、接管浏览器确认站点工作
6. 用户审查结果，提出改进建议
7. AI 打包结果供部署

**关键观察**："不像传统的 AI 问题；更像管理一个队友。"

Mollick 的总结："我感觉自己掌控着 AI 正在做的选择，因为 AI 检查了，它的工作是可见的。"

**与 [Harness Engineering Core Patterns](ch03/074-claude-code.md) 的对照**：harness engineering 的核心是"控制面应当外置给人类"——Antigravity 的 Inbox 模式正是这一原则的产品化实现。

### 4. PhD 级智能的真实测试

Mollick 给 Gemini 3 一个"二年级 PhD 学生"级别任务 —— 用十年前的众筹研究数据写一篇原创学术论文。

**测试过程的关键节点**：

- **数据清洗挑战**：目录里是杂乱无章的文件（`project_final_seriously_this_time_done.xls`）和过时格式数据。AI 自行恢复损坏数据、弄清环境复杂性。
- **原创性挑战**：用户**不给任何研究提示**——AI 必须自己判断"什么是值得研究的题目"。
- **方法论挑战**：AI 自行设计了原创的衡量方法——用 NLP 工具比较众筹项目描述的独特性，自己写代码、自己执行、自己检查结果。
- **最终输出**：14 页格式化论文。

**Mollick 的平衡评估**：

> "它是 PhD 智能吗？某些方面是的，如果把 PhD 智能定义为做研究型大学中一个有能力的 PhD 学生的工作。但它也有 PhD 学生的弱点——想法很好，执行也很好，但有些统计方法需要更多工作、有些方法不够最优、有些理论化超出证据。**我们已经从幻觉和错误转移到更微妙的、常常类似人类的关切**。有趣的是，当我给学生式宽泛指导时（'确保覆盖众筹研究更多以建立方法论等'），它大幅改善——所以也许更多指导就是 Gemini 所需的。我们还没到那里，但'PhD 智能'已不再那么遥远。"

**核心判断**：错误从"AI 特有的问题"（幻觉、失败）转为"人类研究员也有的问题"（判断、方法论选择、理论化超出证据）。

### 5. Human-in-the-Loop 的演变：从"修复者"到"指导者"

Mollick 的关键洞察：

> "Human in the loop 正在从'修复 AI 错误的人'演变为'指导 AI 工作的人'——这可能是自 ChatGPT 发布以来最大的变化。"

**这一演变的工程含义**：

| 阶段 | 角色定义 | 主要活动 |
|------|---------|---------|
| Chatbot 时代 | 提示者 | 实时对话、调试 prompt、修复错误 |
| Agent 早期 | 监督者 | 监控输出、调整参数、避免偏离 |
| 数字同事时代 | 指导者 | 定义目标、设定边界、审查结果、提供方法论指导 |

**对团队建设的启示**：当 AI 能做更多"执行类"工作（编码、研究、数据清洗），人类团队的核心价值应当转向：
- **目标定义能力**：清晰表达"想要什么"而非"如何做"
- **方法论判断**：识别 AI 工作的"哪种思路是对的"
- **质量审查能力**：在结果中识别"类似人类的错误"而非"AI 特有的错误"
- **指导能力**：用学生式宽泛指导提升 AI 表现

### 6. Chatbox → Digital Coworker：产品形态的范式转移

Mollick 给整篇文章的总结：

> "三年前，我们对机器能写关于水獭的诗印象深刻。不到 1000 天后，我在与一个建立自己研究环境的 Agent 争论统计方法论。chatbot 时代正在变成数字同事时代。"

**这一判断与 [Karpathy Vibe Coding 到 Agentic Engineering](ch03/044-agent.md) 形成跨作者印证**——两篇文章都指向同一个结论：AI 工具的产品形态正在从"对话窗口"迁移到"工作流伙伴"。

### 7. 与 OpenAI Codex 演进的方向对照

Mollick 明确把 Antigravity 与 Claude Code、OpenAI Codex 并列——三大 Agent 编程工具共同验证了"通用 Agent + 代码执行"的产品范式。这与 [GPT-5.4 Codex 的进展](ch01/436-codex.md) 中关于 OpenAI Codex 演进方向的论述形成跨厂商印证。

## 实践启示

### 1. 重新理解 Agent 编程工具的能力边界

不要把 Agent 编程工具定位为"程序员的辅助工具"——它们是**通用 Agent**：

- 能读取文件、操作网站、构建仪表板、创建 PowerPoint
- 对非程序员：可作为"个人数字化助手"
- 对程序员：是"数字同事"而非"代码补全器"

重新评估你的 Agent 工具选型和应用场景。

### 2. 采用 Inbox 范式设计 Agent 交互界面

如果你的产品或工作流涉及多 Agent 协作，考虑采用 Inbox 范式：

- **任务分配**：用户/协调者把任务"发到" Agent 的收件箱
- **异步处理**：Agent 自主工作数小时，不需要实时响应
- **权限审批**：Agent 遇到关键决策点 ping 人类
- **状态可视化**：用户能一眼看出"哪个 Agent 在工作、哪个等待审批、哪个已完成"

### 3. 训练"指导者"而非"提示者"的能力

Human-in-the-loop 的角色在演变，团队需要相应升级：

- **从"修复 AI 错误"到"指导 AI 工作"**——这需要不同的技能组合
- **培养方法论判断力**：识别 AI 工作的"哪种思路是对的"
- **练习宽泛指导**：用学生式指导而非详细指令
- **构建审查框架**：在"类似人类的错误"中识别质量问题

### 4. 评估 AI 智能时关注"类人错误"而非"AI 错误"

传统的 AI 评估关注"是否产生幻觉"——但随着 Agent 智能提升，错误模式转为：

- 统计方法选择不当
- 理论化超出证据
- 方法不够最优
- 价值判断偏差

这些是 PhD 学生也有的问题。**评估 AI 时应当转向更细致的"质量审查"框架，而非简单的"对错判断"**。

### 5. Gemini 3 与 Antigravity 的能力组合值得学习

- **强推理 + 工具组合**：Gemini 3 推理 + Antigravity 工具 = 真实工作空间
- **Inbox 交互模式**：从 chatbox 范式转向 inbox 范式
- **数字同事定位**：让用户从"提示 AI"转为"管理 AI"

### 6. PhD 智能的临近意味着知识工作重构

当 AI 接近 PhD 级智能时，知识工作的分工将重构：

- **执行类工作（编码、研究、数据清洗）**：AI 主导
- **判断类工作（方法论选择、价值评估、批判性审查）**：人类主导
- **创意类工作（原创问题提出、跨领域联想）**：协同

提前规划团队的能力升级路径。

### 7. Agent 工具选型应关注"工作流整合度"

不要只比较模型的 benchmark，更要看：

- **真实工作空间的接入能力**（文件、终端、Git、CI、PR）
- **异步工作能力**（Inbox 模式、长任务管理）
- **权限模型**（关键决策点的审批流程）
- **多 Agent 协调能力**（同时管理多个 Agent）

## 相关实体

- [Code as Agent Harness Survey](ch09/046-code-as-agent-harness.md)
- [GPT-5.4 Codex 进展](ch01/436-codex.md)
- [Karpathy Vibe Coding 到 Agentic Engineering](ch03/044-agent.md)
- [Karpathy Agentic Engineering 综述](ch04/118-karpathy-vibe-coding-agentic-engineering.md)
- [AgentOps on Bedrock](ch04/150-ai.md)
- [Yann Dubois OpenAI 后训练访谈](ch04/150-ai.md)
- [GPT-5.5 Copilot Session 设计](ch07/015-wiki-evolver.md)
- [AI Agent Harness 构建](ch04/150-ai.md)
- [Harness 状态边界与失败闭环](ch05/009-harness.md)
- [Agent Vibecoder 上下文压缩](ch03/044-agent.md)
- [腾讯混元 HY3 开源预览](ch01/109-hy3-preview.md)
- [Agent 记忆系统工程实践](ch03/044-agent.md)

---

