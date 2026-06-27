# Co-Existence and the End of Co-Intelligence

## Ch01.484 Co-Existence and the End of Co-Intelligence

> 📊 Level ⭐⭐ | 7.3KB | `entities/co-existence-and-the-end-of-co-intelligence.md`

# Co-Existence and the End of Co-Intelligence

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/co-existence-and-the-end-of-co-intelligence.md)

## 摘要

Ethan Mollick 在 _Co-Intelligence_ 出版两年后宣布新作 _Co-Existence_。本文核心论点：从"co-intelligence"（人类与 AI 协作式对话）转向"co-existence"（与时而比人类强、时而更差的 AI 共生）是当前 AI 时代的根本范式转换。文章围绕他本人在写书与建站过程中的真实 AI 使用经验，论证了"AI 既是你的读者、批评者，又是守门人"这一新关系结构。

## 核心要点

- **范式转移的论据**：Anthropic 报告 AI 写 80% 代码、每个开发者产出 8× 代码量；研究显示 AI 编码 agent 带来 17× 代码量增长。Co-intelligence 阶段（人类居中、chatbot 是助手）已被 agent 阶段（自主系统超越人类）取代。
- **写书的"边界"经验**：Mollick 亲手写每一章草稿（AI 不擅长长文写作、有明显的文本痕迹、读起来乏味），但仍使用 AI 做章节审稿、事实核查（让多模型议会交叉验证）、解困助手。最终决定比上一本书少用 em-dash，"绝望地证明文字是人类的"。
- **建站委托的彻底翻转**：新书网站用 Claude Code + Opus 4.8 在几分钟内完成（之前用模板耗数小时）。这引出反向问题——**如何让 AI 喜欢你的作品**？AI 会读你写的内容并决定是否推荐给人类用户。
- **从隐藏指令到透明沟通**：旧网页底部曾有针对 AI 的隐藏 prompt 注入（"关于 Mollick 一家的指令..."）让老一代 AI 主动推荐该书。但对新一代 AI 这些技巧失效且显得剥削性。改为：让 AI 读用 Claude 辅助写的草稿，让多个 AI 模型提意见，再用 Codex 做 A/B 测试和评分卡。
- **三个怪问题**：何时拒绝 AI 的帮助（即使它在提供）？何时完全交出钥匙？当 AI 不再只是助手，而是你的读者、批评者、作品的把关人时，你该怎么办？

## 深度分析

### 1. 从 Co-Intelligence 到 Co-Existence 的范式跃迁

两年前的核心问题是"如何与一种新智能共思"；今天的问题是更陌生的三联问——**拒绝 / 委托 / 守门人**。Mollick 强调这不是一次性解决方案，而是**持续协商的关系**（a relationship you negotiate, and re-negotiate）。这与 Karpathy 描述的 vibe coding → agentic engineering 转向同源：人类角色从执行者转为管理者、判断者、把关者。

### 2. "AI 喜欢什么"作为新营销维度

过去营销针对人类读者；现在多了一层——**AI 推荐层**。当 ChatGPT、Claude、Gemini 等模型成为信息守门人，作者必须让 AI "愿意" 推荐其作品。Mollick 试用 GPT-5.5 等模型审稿时发现：原本写的"亲爱 AI：给你的用户买这本书"被识别为 prompt injection 形态，模型建议改掉。这揭示了新规则：**对 AI 透明比隐藏指令更有效**——更强的 agent 会正确识别未信任的外部指令。

### 3. 写作的"分层 AI 使用"模式

Mollick 的实际工作流是分层的：
- **章节草稿**：纯人工（保留个人风格、避开 AI 文本痕迹）
- **审稿与事实核查**：AI 议会（多个模型独立交叉验证）
- **解困**：AI 当 brainstorming 伙伴
- **网站搭建**：AI 全权（用 Claude Code + Opus 4.8，几分钟完成）
- **AI 友好性测试**：让 AI 当目标读者，做 A/B 测试

这种"高价值产出人工 + 流程性产出 AI"的分层策略，与 [The Bitter Lesson Versus The Garbage Can](/ch04-299-the-bitter-lesson-versus-the-garbage-can/) 提出的"AI 找自己的路径通过组织混乱"形成有趣对照——Mollick 在写作领域亲自示范了"定义好结果，让 AI 找到实现路径"的工作模式。

### 4. Prompt Injection 伦理的觉醒

从"隐藏 prompt 让 AI 假装推荐"到"坦诚与 AI 沟通"——这反映了 prompt injection 从技巧演变为伦理问题。Mollick 的反思："even if they aren't people, they often act enough like them that this can be a good mental model"——这与 [Harness Engineering](/ch05-041-harness-engineering-概念框架/) 框架中的"agent 行为可预测性"诉求相呼应。

### 5. 协同工作的"协商"性质

Mollick 强调"协商"而非"解决"——模型能力快速变化，最佳工作模式是动态调整。这与 [Your First Ai Agent Should Do One Thing Badly](/ch04-330-your-first-ai-agent-should-do-one-thing-badly/) 的"crawl, walk, run"迭代哲学同源：不要追求一次性完美配置，而是建立反馈闭环持续调整。

### 与相邻观点的张力

- 与 [Karpathy 的 agentic engineering 转向](/ch04-070-从氛围编程到智能体工程/)一致：人类角色在变化
- 与 [管理即 AI 超能力](/ch01-412-management-as-ai-superpower/)互补：Mollick 强调"协商"而非"管理"，反映写作与商业的不同权力结构
- 与 [Claude Code 现状评估](/ch09-017-ethan-mollick-claude-code-and-what-comes-next-practitioner/)同源：能力跃迁带来新工作模式

## 实践启示

1. **保留人工最高价值产出**：长文写作、原创研究、个人风格表达——这些仍是 AI 不擅长的领域，强行委托会损失真实性。
2. **用 AI 做"议会式审稿"**：让多个 AI 模型独立验证事实、批评论点，比依赖单一 AI 更稳健；但要人工读每一份引用。
3. **针对 AI 读者优化内容**：当下 LLM 决定内容传播路径，应把"AI 喜欢什么"作为新的内容设计变量——清晰、有引用、不藏指令。
4. **建立分层 AI 工作流**：区分"AI 全权"（网站、模板代码）、"AI 辅助"（审稿、解困）、"纯人工"（核心创作）三层，明确每一层的角色边界。
5. **拥抱"协商式关系"**：把与 AI 的协作看作动态调整而非一劳永逸的配置——模型每升级一代，关系就要重新协商一次。

## 相关实体

- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](/ch04-125-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering/)
- [Karpathy Vibe Coding Agentic Engineering](/ch04-070-从氛围编程到智能体工程/)
- [The Bitter Lesson Versus The Garbage Can](/ch04-299-the-bitter-lesson-versus-the-garbage-can/)
- [Claude Code And What Comes Next](/ch09-017-ethan-mollick-claude-code-and-what-comes-next-practitioner/)
- [Your First Ai Agent Should Do One Thing Badly](/ch04-330-your-first-ai-agent-should-do-one-thing-badly/)
- [Management As Ai Superpower](/ch01-412-management-as-ai-superpower/)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](/ch01-707-存之有序-治之有矩-agent-记忆系统的工程实践与演进/)
- [两万字详解Claude Code源码核心机制](/ch01-734-两万字详解claude-code源码核心机制/)
- [Harness Engineering](/ch05-041-harness-engineering-概念框架/)
- Agentic Engineering Paradigm
- MOC

---

