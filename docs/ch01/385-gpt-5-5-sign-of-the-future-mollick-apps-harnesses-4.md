# GPT-5.5：Sign of the Future — Mollick 的模型/Apps/Harnesses 三层框架与 4 提示 PhD 论文实验

## Ch01.385 GPT-5.5：Sign of the Future — Mollick 的模型/Apps/Harnesses 三层框架与 4 提示 PhD 论文实验

> 📊 Level ⭐⭐ | 13.6KB | `entities/sign-of-the-future-gpt-55-mollick.md`

# GPT-5.5：Sign of the Future — Mollick 的模型/Apps/Harnesses 三层框架与 4 提示 PhD 论文实验

> 2026-06-08 引用自 Ethan Mollick《Sign of the future: GPT-5.5》，One Useful Thing，2026-04-23。Mollick 强调：未收 OpenAI 任何费用，OpenAI 也未审稿。

## 核心原语：Models / Apps / Harnesses 三层独立推进

Mollick 提出 AI 思考的新分层模型——不要把"AI"当一个东西看，而是三个相互关联的概念：

- **Models**（模型）：Opus 4.7 / Gemini 3.1 / GPT-5.5 — 推理能力的载体
- **Apps**（应用）：用户实际接触的产品界面 — ChatGPT 网站、Claude.ai、Claude Code、Claude Cowork、OpenAI Codex
- **Harnesses**（工具管线/Agent 框架）：AI 能调用的工具集 — 电脑控制、代码、研究、图像生成

**GPT-5.5 同期在三层都推进了**：
- 模型层：GPT-5.5 Pro（仅网站可访问）是最强子模型
- Apps 层：OpenAI Codex 桌面应用正在追赶 Claude Code 的设计
- Harnesses 层：图像模型 GPT-imagegen-2 是最有趣的突破

**关键洞察**：单层突破意义有限。Mollick 的两个"组合实验"都依赖三层联动——PhD 论文靠 Codex 调度 GPT-5.5 + Pro 反哺 + Codex 整合；D&D 游戏靠 Codex 调 GPT-5.5 + GPT-imagegen-2 + 多步自我修订。

## GPT-imagegen-2 与 Otter Test 跨越门槛

新图像模型能渲染高质量文字 + 几乎任意场景描述——这是 Otter Test（让 AI 画"在飞机上用 wifi 的水獭"）第一次真正跨过实用门槛。Mollick 用三段 prompt 演示：

1. **学术论文首图**："水獭科学家展示 Otter Test 结果，论文完美排版放在桌上"——可放大到看清正文
2. **艺术画廊**："Klimt + Rothko + Matisse + Monet + Picasso + Titian + Rembrandt + O'Keefe 风格的画廊，墙上每幅画都是水獭在飞机上用笔记本，下面有可读标签"
3. **可应用工作流**：PowerPoint slides / 产品 mockup / 示例网站 / 任何可描述的视觉

**实际意义**：能渲染可读文字的图像模型第一次把"AI 图像生成"从"娱乐"推到"可工作流"层——产品 mockup、UI 线框、营销素材都可以 prompt 直接出。

## 4 提示 PhD 论文实验（最关键实证）

Mollick 用 GPT-5.5 测了一个"拖延了十年"的任务——他从 2010 年代初做众筹研究时累积的 100+ 份匿名数据（STATA + CSV + XLS + Word），从未写成论文。

**Prompt 链（仅 4 步）**：
1. "帮我整理这些数据，生成新假设，用严格统计测试，写成学术论文，加文献综述和排版"
2. 论文初稿生成后，让 GPT-5.5 Pro 评论
3. 把 Pro 的意见喂回 Codex
4. Codex 整合修改

**结果**：
- 文献综述**全部真实**
- 统计数据**全部真实**（用复杂统计方法解决因果问题）
- Mollick 作为专家判断："**这假设不够 interesting，causation 有些 standard concern**"
- 整体评价："2nd year PhD 项目级别，4 提示就出了，自己没碰过一个字"

**意义**：4 提示 ≠ 4 动作。背后是 Codex 调度 + GPT-5.5 推理 + Pro 评论 + 多轮迭代的 harness 编排。统计真实 + 文献真实 + 排版正确 = 跨过了"博士级产出"的事实门槛。唯一短板是**判断力**（什么假设值得做）——这是 research taste，不是模型能力。

## 第二个组合实验：101 页 D&D 桌面 RPG

Mollick 让 Codex 创建一个原创 D&D 风格桌面 RPG：
- 全新奇幻世界设定 + 完整规则书 + 所有需要的表格
- 模拟玩家试玩 → 根据发现修订规则
- 自动用 imagegen-2 配 101 页 PDF
- 结果：**可玩的 101 页 RPG，含配图 + 试玩反馈**

## Jagged Frontier 的延伸边界

**进步领域**：
- 4 提示近 PhD 论文
- 一句话生成 101 页可玩 RPG
- 一年前都不可能的事

**仍然卡壳的领域**：
- 长篇虚构：所有世代的模型都败在这里
  - 诡异的氛围过度
  - 复杂想法不兑现
  - 怪比喻（"weather and architecture are the same argument at different speeds"）
  - 太多华丽句式（一两次很酷，整本会累死）
  - 所有角色用同一种简短发声
  - 角色都叫 "Mara"
- 研究判断力：统计真实但假设平庸
- 长尾细节：复杂规则书每条规则都自洽很难

**核心结论**：GPT-5.5 证明模型/Apps/Harnesses 三层在同步加速，"jagged frontier"（参差不齐的前沿）仍在，但边界**外推**到一年前不可想象的领域。

## 与现有 Mollick 实体的差异化

| 实体 | 焦点 | 独特价值 |
|------|------|----------|
| `gpt5-just-does-stuff-mollick` | GPT-5 早期体验，"It Just Does Stuff"主动式 AI 原语 | 主动建议、auto-router、vibecoding 不陷入 doom loop |
| `mollick-ai-32-otters-benchmark` | Otter Test 30 模型对比基准 | 第一次系统量化图像模型能力变化 |
| `claude-dispatch-interfaces-mollick` | Claude Code 调度接口哲学 | 反思工具/任务/上下文架构 |
| `jagged-ai-frontier-mollick` | Jagged frontier 概念原始定义 | "AI 在某些事上超级强，其他事上完全不行" |
| **`sign-of-the-future-gpt-55-mollick`** (本文) | **GPT-5.5 三层框架 + 4 提示 PhD 论文实证** | **模型/Apps/Harnesses 分层 + 加速 + 仍未克服的虚构瓶颈** |

**核心轴差异**：本文是 GPT-5.5 升级版的实证（不是 GPT-5 早期体验），且首次提出三层框架作为 AI 思考的**生产分层**（不是观察视角）。

## 实践启示（4 条）

1. **AI 思考分层**：不要比"Claude vs GPT"，而要思考"哪一层在加速"——模型是底座，App 是界面，Harness 是放大器
2. **Harness 才是差异化**：同样 GPT-5.5 + 4 提示，Codex 的 multi-turn 调度让"PhD 论文"成为可能
3. **数据真实 ≠ 价值真实**：LLM 生成的论文统计全部真实但假设平庸 — research taste 仍是人类独占
4. **Jagged frontier 在外推**：每年 frontier 都推得更远，但 fiction 这类"长期被卡"的领域仍未突破 — 投资/学习要选 frontier 推进速度快的方向

## 深度分析

### 1. Models/Apps/Harnesses 三层框架的系统性验证
Mollick 在本篇和 `Guide Ai Agents Models Apps Harnesses Mollick` 中反复强调同一模型在不同 harness 下的表现差异——这是 2026 年 AI 选型的核心变量。GPT-5.5 在聊天窗口和 Codex harness 中的能力差距验证了这一论点：模型能力只是起点，harness 决定了能力上限。

### 2. 4 提示 PhD 论文的"真实性陷阱"
Mollick 用 4 个提示从原始数据生成接近 PhD 水平的论文，统计方法真实但假设平庸。这揭示了一个关键风险：AI 生成的研究可能在方法论上无懈可击，但在核心洞察上平庸——审查者需要同时评估"方法是否正确"和"洞察是否原创"。

### 3. Jagged frontier 的加速外推
Mollick 的 jagged frontier 框架（AI 在某些任务超人、其他任务仍弱）的边界正在加速外推。2025 年不可想象的能力（4 提示生成论文、图像跨过可用门槛）在 2026 年成为现实，但长篇虚构仍卡在同样的瓶颈。

### 4. Otter Test 与图像生成的"可用门槛"
GPT-imagegen-2 通过 Otter Test（可渲染文字 + 高细节）标志 AI 图像生成从"玩具"跨越到"工具"。这一门槛的跨越对设计、营销、教育等领域的影响可能比文本生成更大，因为视觉内容的"可接受标准"比文本更容易判断。

### 5. 长篇虚构的瓶颈揭示 AI 创造力的结构性限制
长篇虚构仍卡在 uncanny、奇喻、对话同质化——这些不是模型规模能简单解决的问题。它们反映了当前 LLM 架构在长程一致性和原创性上的结构性限制，可能需要新的架构突破（如持久化叙事记忆、显式情节规划）。

## 实践启示

### 1. AI 研究：4 提示生成论文后必须人工审查核心洞察
AI 可以快速生成方法论正确的论文框架，但假设的原创性和洞察的深度仍需人类判断。将 AI 用于"加速方法论部分"，人类聚焦"核心观点"。

### 2. 选型：三层框架下，优先投资 harness 而非模型
模型能力趋近时，harness 的差异化决定产出质量。投资自定义 harness（工具集成、工作流编排）的 ROI 高于在多个模型间切换。

### 3. 图像生成：GPT-imagegen-2 已达到"可用"标准
如果你的工作流需要 AI 图像（营销素材、教育插图、设计原型），GPT-imagegen-2 的文字渲染和高细节能力使其首次达到"无需大量后处理"的可用标准。

### 4. 长篇创作：不要期待 AI 独立完成
长篇虚构仍是 AI 的弱项。将 AI 定位为"创意催化剂"（生成大纲、角色设定、段落变体）而非"独立作者"，避免产出 uncanny 的内容。

### 5. 用 jagged frontier 框架评估 AI 在你领域的边界
明确哪些子任务 AI 已经超人、哪些仍弱，据此分配人机协作模式——而非一刀切地"用"或"不用"。

## 相关实体
- [Gpt5 Just Does Stuff Mollick](https://github.com/QianJinGuo/wiki/blob/main/entities/gpt5-just-does-stuff-mollick.md)
- [The Shape Of The Thing Mollick](ch01/299-the-shape-of-the-thing.md)
- [Three Years Gpt3 Gemini3 Mollick](https://github.com/QianJinGuo/wiki/blob/main/entities/three-years-gpt3-gemini3-mollick.md)
- [Guide Ai Agents Models Apps Harnesses Mollick](ch04/277-ai.md)
- [Ai Job Interview Model Evaluation Mollick](ch04/277-ai.md)

## 关键引用（保留原文）

- "What AI models are best at is coding, so I gave a coding challenge to AIs ranging from OpenAI's first reasoning model, o3 to GPT-5.5 Pro" — 跨代对比 o3 → Kimi K2.6 → GPT-5.5 Pro
- "GPT-5.4 Pro took 33 minutes to complete the task, GPT-5.5 Pro took 20" — 速度提升 40%
- "I would have been very happy if this paper was the outcome of a 2nd year PhD project. And I just gave it four prompts, without ever touching the text myself" — 4 提示 PhD 论文关键论断
- "GPT-5.5 is clearly not the end of this process, but it is a noteworthy step along the way" — 加速而非收敛

## 上线状态 / 链接

- **原文**：https://www.oneusefulthing.org/p/sign-of-the-future-gpt-55
- **发布**：2026-04-23（One Useful Thing newsletter）
- **数据附件**：[Mollick 的 PhD 论文 PDF](https://drive.google.com/file/d/1ahtmtBYlFkd8QmmyiNVNnq_SoOVb_JxH/view?usp=sharing)
- **D&D 游戏附件**：[101 页 RPG PDF](https://drive.google.com/file/d/10QKnfjJaWHxsTu4fo_dgMU6pAJXxuw3t/view?usp=sharing)
- **对比画廊**：[o3 → GPT-5.5 Pro 编码挑战](https://69e8dfc625a99f19144c86bf--hg-20f7d1a3ce.netlify.app/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/sign-of-the-future-gpt-55-mollick.md)

---

