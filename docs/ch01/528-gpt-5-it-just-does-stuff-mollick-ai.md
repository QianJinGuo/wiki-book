# GPT-5：It Just Does Stuff — Mollick 的主动式 AI 原语

## Ch01.528 GPT-5：It Just Does Stuff — Mollick 的主动式 AI 原语

> 📊 Level ⭐⭐ | 8.5KB | `entities/gpt5-just-does-stuff-mollick.md`

# GPT-5：It Just Does Stuff — Mollick 的主动式 AI 原语

> 2026-06-07 引用自 Ethan Mollick《GPT-5: It Just Does Stuff》，One Useful Thing，2025-08-07。

## 核心原语："It Just Does Stuff"

Mollick 用 GPT-5 写 intro paragraph 时只给了一句指令"do something very dramatic"，GPT-5 写出了藏头诗（首字母拼出"This is a Big Deal"）+ 每句比前一句多一个词 + 每词首字母相同 + 风格连贯——这是模型自己想到的创意并精确执行。

**GPT-5 的本质变化**：
- 不再只是回答问题，而是**主动做事情**
- 告诉你用什么模型（auto-select）
- 建议下一步并主动执行
- 输出完整的工作成果，而非回答

## 两大常见 AI 使用问题的解决

### 问题一：选错模型
旧版 AI 默认给快速但弱的模型，用户不知道哪个是更好的。GPT-5 作为 switch 自动选择子模型+思考时长。但问题是：**GPT-5 对什么是"hard problem"判断过于随意**（2/3 的 SVG otter 请求被判定为简单问题，只有 1/3 进入 Reasoner）。

**解决**：在 prompt 里加"think hard"会更高概率路由到强模型；$200 套餐可以直接选 GPT-5 Pro/Thinking Heavy。

### 问题二：不知道让 AI 做什么
Vibecoding 之前的问题是：用户不知道该要求什么，然后陷入 doom loop（每轮修复产生更多错误）。**GPT-5 不再陷入 doom loop**——即使引入新错误，paste 错误文本就能修复。

## 案例：Vibecoding 的极致体验

Mollick 的 brutalist building creator 实验：
- Prompt："make a procedural brutalist building creator where i can drag and edit buildings in cool ways, they should look like actual buildings, think hard"
- 没有任何规格说明，没有技术约束
- 结果：2 分钟得到完整 3D city builder，包含 facade editing、neon lights、cars driving、save system
- Mollick 只需说"make it better"，AI 自己添加功能，从不询问

## GPT-5 Thinking vs autoGPT-5

| 模式 | 行为 |
|------|------|
| **auto GPT-5** | AI 自己决定用哪个子模型和思考时长，容易对复杂任务判断失误 |
| **GPT-5 Thinking** | 强模型，30 秒深度思考，主动产出高质量结果 |

Mollick 对弱版 GPT-5 信任度很低，**只信任 GPT-5 Thinking**。

## 主动式 AI 的意义

GPT-5 展示了"just gesture vaguely at what you want and somehow it works"的能力。这是从"AI as tool"到"AI as colleague"转变的关键节点。

但人类仍然在 loop 中：GPT-5 会要求你做决定（是否继续/修改），系统仍然产生幻觉。但问题是：**我们还会想待在 loop 里吗？**

> "Another big change in how we relate to AI is coming, but we will figure out how to adapt to it, as we always do. The difference, this time, is that GPT-5 might figure it out first and suggest next steps."

## 关键引用

> "This is what 'just doing stuff' really means. When I told GPT-5 to do something dramatic for my intro, it created that paragraph with its hidden acrostic and ascending word counts. I asked for dramatic. It gave me a linguistic magic trick."

> "I used to prompt AI carefully to get what I asked for. Now I can just... gesture vaguely at what I want. And somehow, that works."

## 深度分析

### 1. 模型路由器：交互范式的底层重构
GPT-5 不再是单一模型，而是一个**自动模型路由器**——根据任务难度动态选择子模型和思考时长 。这将"选模型"这个认知负担从用户转移到了系统层。对大多数只用默认模型从没见过 Reasoner 能力的用户，这是认知层面的巨大解放 。但 Mollick 也指出，GPT-5 对"什么是 hard problem"的判断相当随意（2/3 的 SVG 请求被误判为简单问题），意味着模型路由本身成了新的交互瓶颈——用户仍需通过"think hard"等 prompt hint 干预路由决策 。

### 2. 主动性作为相变：从工具到同事
GPT-5 的核心变化不是更好的输出，而是**主动做事情**——主动建议下一步、主动生成配套产物、主动超出用户预期 。这对 AI 使用第二大难题（不知道让 AI 做什么）提供了系统性解法 。Mollick 用"gesture vaguely"（含糊地比划）来形容新的交互方式——不再需要精心设计 prompt，模糊的指令就能获得完整的工作成果 。这是从"AI as tool"到"AI as colleague"的相变节点 。

### 3. Doom Loop 消失的含义：错误修复范式的根本性转变
Vibecoding 时代的 Doom Loop（每轮修复引入更多错误，最终陷入混乱）在 GPT-5 中消失。错误不再需要通过改 prompt 来修复，而是直接 **paste 错误文本**即可修正 。这意味着 AI 编程的瓶颈从"修复错误"转移到"确定方向"——人类的作用变成了提供高层次的鼓励（"make it better"），而非详细的规格说明 。

### 4. 人类还在 loop 中，但意愿将成为问题
GPT-5 仍会要求用户做决定，系统仍会产生幻觉 。但 Mollick 提出的真正问题是：**我们还会想待在 loop 里吗？**  当 AI 能够自主完成复杂任务并主动建议下一步时，人类参与 loop 的边际价值急剧下降。这不是技术问题，而是一个关于人机关系设计的社会性问题。

### 5. "Just Does Stuff"的隐藏前提：信任建立与能力边界感知
GPT-5 的"自动超额交付"（生成 landing pages、财务报表、网站、研究计划等配套产物）依赖于用户对系统能力的信任。但 Mollick 同时揭示了一个关键的不对称：他对 GPT-5 Thinking 有高度信任，对弱版 GPT-5 信任度很低 。这说明在"主动式 AI"时代，**模型选择本身就是一种关键技能**——不同模型的能力鸿沟大到足以影响信任结构的建立。

## 实践启示

### 1. 对复杂任务加 "think hard" 后缀
当任务需要高质量输出时，在 prompt 末尾加"think hard"可以显著提高被路由到强模型的概率 。对于需要精确推理或创意执行的任务，这一个词就能切换整个子模型生态。

### 2. 直接选用 GPT-5 Thinking，绕过 auto-router 的随机性
Auto GPT-5 的模型路由存在较大随机性，对同一请求可能给出差异极大的结果 。对于重要任务，直接选择 GPT-5 Thinking 可消除这种不确定性，获得 30 秒深度思考的高质量输出 。

### 3. 用"鼓励迭代"代替"详细规格"
Vibecoding 新范式下，最有效的交互不是给出详细规格说明，而是**持续鼓励**（"make it better"）让 AI 自主扩展功能 。这颠覆了传统的 prompt engineering 思维——指令越少，AI 的主动空间越大。

### 4. 错误修复：直接 paste 错误文本
遇到 AI 生成的代码或内容报错时，不要重新描述问题或修改 prompt，直接将**完整的错误文本粘贴**给 AI 即可完成精准修复 。这是 GPT-5 时代特有的零门槛调试方式。

### 5. 人机关系的重新定位：从指挥者到激励者
当 AI 能够主动完成复杂任务并超额交付时，人类的核心角色从"详细指令者"转变为"目标激励者" 。掌握这种新范式意味着：学会提出模糊但有方向性的目标，然后信任系统执行，而不是试图覆盖每一个实现细节。

## 相关主题

- [Co Existence Paradigm Shift Agentic Ai Mollick 2026](ch01/583-ai-mollick.html) — Co-Existence 范式（Mollick 后续的完整框架，同一作者）
- [Management As Ai Superpower Mollick](ch01/520-management-as-ai-superpower.html) — 管理作为 AI 超级能力（同一作者，同期不同议题）
- [Guide Ai Agents Models Apps Harnesses Mollick](../ch04/030-ai-agent.html) — 模型/应用/harness 选型指南（同一作者，2026-02 更新）
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/gpt-5-it-just-does-stuff.md)

---

