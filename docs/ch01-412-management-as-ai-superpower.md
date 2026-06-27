# Management as AI superpower

## Ch01.412 Management as AI superpower

> 📊 Level ⭐⭐ | 8.7KB | `entities/management-as-ai-superpower.md`

# Management as AI superpower

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/management-as-ai-superpower.md)

## 摘要

Ethan Mollick 在宾大实验班的发现：非技术背景的 EMBA 学生用 Claude Code + Google Antigravity 在四天内创建的 startup 原型，比他 15 年教学生涯中**整学期学生产出还要好一个数量级**。原因不是学生突然变成 AI 专家——而是他们**会用管理技能委托 AI**：明确目标、定义交付物、识别结果好坏。这些被贬为"软技能"的能力在 AI 时代变成"硬技能"。本文提出"管理即 AI 超能力"的核心论断与决策公式。

## 核心要点

- **GDPval 实证**：OpenAI 的 GDPval 研究让各领域（金融、医疗、政府）资深专家与最新 AI 对决——专家平均 7 小时完成任务，AI 几分钟出活但需 1 小时审核。GPT-5.2 Thinking/Pro 以 72% 概率打平或击败人类专家。
- **委托决策的三个变量**：
  1. **Human Baseline Time**：自己做要多久？
  2. **Probability of Success**：AI 一次出活的概率？
  3. **AI Process Time**：让 AI 出活 + 评估要多久？
- **净收益公式**：在 7 小时任务、72% 成功率、1 小时评估下，AI 辅助平均节省 3 小时。失败的 AI 任务浪费了时间（prompt + review 都白费），成功的 AI 任务节省大量时间。
- **三招提升 Probability of Success**：（1）给更好的指令，明确目标；（2）提升评估反馈能力；（3）让评估更容易。**所有这些都受益于领域专业知识**——专家知道给什么指令、能看出哪里出错、会修正。
- **委托即新 prompt 范式**：传统 prompt 是"用 AI 写"；新 prompt 是"用 AI 做"——更接近工作交接而非文字生成。各种领域已有的工作交接文档（PRDs、shot lists、design intent、Five Paragraph Orders）**作为 AI 指令意外地好用**。
- **AI 改变稀缺结构**：管理学一直假设稀缺——人才有限所以要委托。AI 改变等式：人才充裕而廉价。**稀缺的是知道要什么**。

## 深度分析

### 1. 从"prompting"到"delegation"的概念跃迁

传统 prompt 工程关注"如何让 AI 写好这段文字"。本文提出的**委托**关注"如何让 AI 完成这个工作"——这是根本概念跃迁。文中列举各种领域已有的工作交接文档：
- 软件开发：Product Requirements Documents (PRDs)
- 电影导演：shot lists
- 建筑师：design intent documents
- 海军陆战队：Five Paragraph Orders
- 咨询：scoped engagement specs

这些文档**作为 AI 指令意外地好用**——因为本质都是"把一个人脑中的东西变成另一个人的行动"。这是 Mollick 的关键洞见：**AI 时代不是发明新工作流，而是复用已有工作流**。

### 2. "好交付文档"的结构共性

文中提炼的"好委托文档"六要素：
1. **目标与原因**：我们要完成什么，为什么？
2. **授权边界**：委托权限的边界是什么？
3. **"完成"定义**：什么算"做完了"？
4. **具体交付物**：我需要什么具体产出？
5. **中间产出**：需要看到什么中间产出以跟进进度？
6. **交付前自查**：交付前自己检查什么？

这与软件工程中的 acceptance criteria、definition of done 如出一辙——**管理学已经发展出所有必要的工具，AI 时代只是把它们从"对人"扩展到"对 AI"**。

### 3. AI 时代稀缺性的反转

管理学经典假设：人才稀缺、昂贵，所以要委托。AI 颠覆这个假设：
- 人才（AI 模型）变得**充裕且便宜**
- 真正稀缺的是**知道要什么**
- 能定义"好结果"的人成为关键资源

这一反转解释了为什么 EMBA 学生（不缺领域知识，缺 AI 技术）在四天内比传统 CS 学生做得好——他们的**领域知识 + 委托能力** 成了新核心资产。

### 4. 软技能到硬技能的范式重估

文中关键反转："**The skills that are so often dismissed as 'soft' turned out to be the hard ones.**"

- 解释能力 → 硬技能（决定 prompt 质量）
- 反馈能力 → 硬技能（决定 iteration 速度）
- 评估能力 → 硬技能（决定 AI 输出的可用性判断）

**被传统工程师文化贬为"软"的能力，在 AI 时代变成最难获得的硬技能**。这是知识工作者价值重估的根本命题。

### 5. 决策公式的边界条件

Mollick 的三变量公式（Human Baseline Time、Probability of Success、AI Process Time）有以下边界条件：
- 适合**单次任务**——多次任务需要考虑 learning curve
- 假设**评估成本固定**——实际可能任务越复杂评估越难
- 未考虑**质量波动**——AI 输出质量分布可能双峰（很好/很差）
- 忽略**机会成本**——评估时间本可做别的事

实操中要按"7 小时任务"经验值校准，根据自己的任务类型调整。

### 6. 与 [Claude Code 现状](/ch09-017-ethan-mollick-claude-code-and-what-comes-next-practitioner/)的呼应

文中提到"found Claude Code was able to generate an entire 1980s style adventure game with one prompt"——这是 Claude Code 能力的真实案例，与 [Claude Code 现状评估](/ch09-017-ethan-mollick-claude-code-and-what-comes-next-practitioner/) 的"1 小时 14 分钟自建创业项目"形成同一现象的不同展示。

**Mollick 的两个论点是同构的**：
- [Claude Code 现状](/ch09-017-ethan-mollick-claude-code-and-what-comes-next-practitioner/)：AI 能力跃迁让 Karpathy 感觉自己"落后了"
- 本文：AI 能力跃迁让非技术 EMBA 学生"四天抵一学期"

**[AI 让程序员与商业人士同时感到职业重构]**

### 与相邻观点的张力

- 与 [苦味教训](/ch04-299-the-bitter-lesson-versus-the-garbage-can/)的张力：苦味教训暗示"算力 + 通用方法"会取代"工艺精心设计"；本文强调"管理能力"成为新稀缺——前者是技术派，后者是组织派。
- 与 [CrewAI 迭代论](/ch04-330-your-first-ai-agent-should-do-one-thing-badly/)的同源：都强调"迭代"与"真实失败数据"的重要性。不同在于本文关注"管理能力"，CrewAI 关注"工程迭代节奏"。
- 与 [co-existence](/ch01-484-co-existence-and-the-end-of-co-intelligence/) 的互补：co-existence 关注写作/创意领域的人机关系，本文关注商业/管理领域——同一作者的两个互补视角。

## 实践启示

1. **复用已有工作交接文档**：不要从零设计 AI 工作流——用领域现有的 PRDs、shot lists、Five Paragraph Orders 等文档作为 AI 指令模板。
2. **培养"解释你想要什么"的能力**：这是最被低估的硬技能——做不好的人会在 AI 时代落后。
3. **建立"好结果"定义文档**：每个项目明确定义"什么算完成"——这比"怎么完成"更关键。
4. **用决策公式筛选委托任务**：低 Probability of Success 的任务自己来，高 Probability + 高 Human Baseline 的任务优先委托。
5. **以领域知识放大 AI 杠杆**：专家能给出更好指令、更准评估、更快修正——领域知识是 AI 时代的复利资产。
6. **接受"管理"为新核心技能**：在 AI 时代，**管理不再是"指挥人"而是"指挥 AI + 必要时指导人"**——这要求技能迁移。

## 相关实体

- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](/ch04-125-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering/)
- [Karpathy Vibe Coding Agentic Engineering](/ch04-070-从氛围编程到智能体工程/)
- [The Bitter Lesson Versus The Garbage Can](/ch04-299-the-bitter-lesson-versus-the-garbage-can/)
- [Claude Code And What Comes Next](/ch09-017-ethan-mollick-claude-code-and-what-comes-next-practitioner/)
- [Your First Ai Agent Should Do One Thing Badly](/ch04-330-your-first-ai-agent-should-do-one-thing-badly/)
- [Co Existence And The End Of Co Intelligence](/ch01-484-co-existence-and-the-end-of-co-intelligence/)
- [Giving Your Ai A Job Interview](/ch11-125-giving-your-ai-a-job-interview/)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](/ch04-268-agentops-operationalize-agentic-ai-at-scale-with-amazon-bed/)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](/ch01-707-存之有序-治之有矩-agent-记忆系统的工程实践与演进/)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](/ch05-005-一文带你弄懂-ai-圈爆火的新概念-harness-engineering/)
- [Harness Engineering](/ch05-041-harness-engineering-概念框架/)
- Agentic Engineering Paradigm
- Agent Orchestration Patterns
- MOC

---

