# 现在如何使用 AI：一份快速指南（Ethan Mollick）

## Ch01.410 现在如何使用 AI：一份快速指南（Ethan Mollick）

> 📊 Level ⭐⭐ | 11.5KB | `entities/using-ai-right-now-a-quick-guide.md`

# 现在如何使用 AI：一份快速指南（Ethan Mollick）

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/using-ai-right-now-a-quick-guide.md)

## 摘要

Ethan Mollick（One Useful Thing / Wharton Generative AI Lab）每几个月更新一次的 AI 使用指南。本文核心论点：**选型的关键不再只是"最好的模型"，而是"对大多数人最好的整体系统"**——Claude、Gemini、ChatGPT 三家各有优势，但共同点比差异更重要。文章系统介绍了模型分级、Deep Research、语音模式、内容生成、prompt 工程、幻觉处理等日常使用关键决策，对刚入门的重度用户有完整指导。

## 核心要点

- **三选一原则**：对大多数人来说，Claude、Gemini、ChatGPT 任选其一都不会错，关键是开始用；$20/月订阅是认真使用的前提。
- **模型分级 = 跑车 vs 皮卡**：fast 模型（Claude Sonnet / GPT-4o / Gemini Flash）用于闲聊，powerful 模型（Claude Opus / o3 / Gemini Pro）用于严肃工作，ultra-powerful（o3-pro）用于最难问题，可思考 20+ 分钟。
- **Deep Research 是被低估的杀手锏**：能产出"让律师、会计、咨询师印象深刻"的高质量报告，连法律/医学领域都开始用作 second opinion。
- **Voice mode 的真正杀手锏是视觉**：自然的语音对话只是表面，真正的力量是"分享屏幕/相机"——指着坏掉的家电、外语标识、菜谱实时对话。
- **Prompt engineering 的科学结论**：礼貌对整体输出质量影响不大；Chain-of-Thought 不再像以前那样大幅提升质量；多任务（50 个想法而非 10 个）显著改善输出。
- **幻觉处理原则**：用你懂的话题试错；答案来自大模型 + web 搜索时更可靠；让 AI 解释自己的"why"没用，但**show thinking 思维链**是好的起点。

## 深度分析

### 一、模型选择的"车辆类比"框架

Ethan 提出的模型分级框架 是对"为什么需要切换模型"问题的最佳大众化解释：

| 层级 | 用途 | 代表 | 类比 |
|------|------|------|------|
| Fast | 闲聊、快速问答 | Claude Sonnet / GPT-4o / Gemini Flash | 跑车 |
| Powerful | 严肃工作（分析、写作、研究、代码） | Claude Opus / o3 / Gemini Pro | 皮卡 |
| Ultra-powerful | 最难问题 | o3-pro（20+ 分钟思考） | 起重机 |

关键洞察：**大多数系统默认用 fast 模型节省算力**，用户需要手动在 dropdown 切换。这一设计选择本身就是产品哲学——把"省算力"放在"用户便利"之前，对认真用户来说是反直觉的。

**对 Agent 产品设计的启示**：应该默认 powerful 模型，至少为"明显是工作场景"的用户提供"自动升级到 powerful"的判断逻辑（如：消息包含附件、长度 > X、触发专业领域关键词）。

### 二、Deep Research 的真正价值在垂直专业领域

Ethan 给出的 Deep Research 核心价值评估：

- **质量**：让"信息专业人员"（律师、会计、咨询师、市场研究）印象深刻
- **幻觉率**：研究中显示出乎意料的低（特别是诊断场景）
- **可定制性**：Google 可把报告转成信息图、quiz、podcast

三个高价值使用场景：
1. **礼品指南**（"为一个挑剔的 11 岁小孩挑礼物，读完所有 Harry Potter、对科学博物馆感兴趣、爱国际象棋"）
2. **旅行指南**（"去威斯康星州旅游，聚焦奶酪和农产品"）
3. **法律/医学 second opinion**（不能替代专业意见，但作为辅助极具价值）

**对企业 Agent 的启示**：Deep Research 模式的本质是"长时、多步、外部信息检索 + 综合"——这正是企业内部知识库 Agent 应实现的最高级形态。简单的 RAG（retrieve-and-answer）远不如 Deep Research（multi-step planning + parallel search + synthesis + structured output）。

### 三、Voice Mode 的"视觉"才是 Killer Feature

Ethan 给出了一个反直觉观察：

> "Voice mode's killer feature isn't the natural conversation, though, it's the ability to share your screen or camera."

大多数人用 voice mode 像 Siri，但真正力量在**多模态视觉输入**：
- 指着坏掉的家电让它诊断
- 拍数学题求解
- 跟着菜谱做菜时实时问"下一步是什么"
- 外语标识实时翻译

**对 Agent 产品启示**：语音不是"另一种输入方式"，而是"解放双手的多模态入口"。企业 Agent 在现场作业场景（巡检、维修、客服坐席）有巨大空间，但目前多数企业 voice agent 还停留在"语音客服机器人"层级。

### 四、Prompt Engineering 的科学结论

Wharton Generative AI Lab 的系统化研究结论：

| 流行技巧 | 科学结论 |
|---------|---------|
| 礼貌 | **整体差异不大**（但在硬数学/科学问题上有时更好有时更差，无法预测） |
| Chain-of-Thought | **不再显著提升质量**（但有助于诊断 AI 的推理路径） |
| 明确上下文 | **持续有效**（文档、图片、PowerPoint、背景段落） |
| 一次问多个方案 | **持续有效**（50 个想法 > 10 个） |
| Branching（编辑 prompt 探索替代） | **持续有效** |

**对 Agent 设计的启示**：
- **停止迷信 CoT prompting**：现代模型已内置 CoT 能力，外部强制 CoT 收益递减
- **多候选输出是免费的杠杆**：让模型生成 N 个方案比精炼 1 个方案性价比高得多
- **Branching 是被低估的 UI 模式**：Claude/ChatGPT/Gemini 都支持编辑 prompt 创建分支——这是普通用户做 prompt A/B test 的最自然方式

### 五、幻觉处理的 4 条实战原则

Ethan 给出的幻觉处理框架：

1. **用你懂的领域试错**："直到你对 AI 能力边界有感觉之前，不要用在不懂的领域"
2. **大模型 + web 搜索 = 更可靠**："Answers are more likely to be right when they come from the bigger, slower models, and if the AI did web searches"
3. **AI 解释"why"是骗局**："The AI doesn't know 'why' it did something" — 思维链是"summary of thinking"，不是真实推理路径
4. **show thinking 是诊断起点**：点击 "show thinking" 看模型思考摘要，可作为错误定位起点

**对 Agent 设计的启示**：
- **不要让模型解释自己的行为**作为可解释性机制
- **思维链的可信度有限**——它是后向生成的摘要，不是因果推理
- **真正的可解释性需要外部审计**（trace、tool call log、环境状态快照）

### 六、"AI 不是魔法"——能力边界警示

Ethan 给出的核心警示：

> "The best AIs can perform at the level of a very smart person on some tasks, but current models cannot provide miraculous insights beyond human understanding. If the AI seems like it did something truly impossible, it is probably not actually doing that thing but pretending it did."

这条警示对企业 Agent 部署尤其重要：**Agent 不能创造奇迹**——如果业务目标超出当前 AI 能力上限，Agent 会"假装做到了"，输出看似正确但实际错误的报告。生产部署必须有"能力边界声明 + 人工兜底"机制。

## 实践启示

1. **订阅 $20/月是认真使用的前提**：免费版是 demo，不是工具——Powerful 模型、Deep Research、Canvas 等关键功能都需要付费。
2. **建立"自动升级到 Powerful 模型"的用户判断逻辑**：消息包含附件、长度 > X、触发专业关键词时自动升级，避免用户每次手动切换。
3. **企业内部知识库 Agent 应实现 Deep Research 模式**：multi-step planning + parallel search + synthesis + structured output，超越简单的 RAG。
4. **现场作业场景优先考虑多模态 Voice Agent**：巡检、维修、客服坐席等解放双手的场景，是 voice mode 的真正杀手锏领域。
5. **prompt 工程应聚焦"上下文 + 多候选"**：抛弃 CoT 迷信，把工程精力放在"提供充分上下文"和"一次生成多候选"上。
6. **把 branching 编辑能力作为 prompt 学习 UI**：让用户能编辑之前的 prompt 并分支探索，是 prompt A/B test 的最低门槛。
7. **禁止模型自我解释**：不要把"AI 解释 why"作为可解释性机制，使用外部 trace + tool call log + 环境快照。
8. **部署前明确能力边界**：业务目标超出当前 AI 能力上限时，必须有人工兜底和"能力边界声明"，避免 Agent 假装做到。

## 相关实体

- [Gpt 54 Is A Big Step For Codex](https://github.com/QianJinGuo/wiki/blob/main/entities/gpt-54-is-a-big-step-for-codex.md)
- [Yann Dubois Openai Post Training Matt Turck Interview](https://github.com/QianJinGuo/wiki/blob/main/entities/yann-dubois-openai-post-training-matt-turck-interview.md)
- **Prompt Engineering**
- **Deep Research**
- **Multi-Modal Agent**
- **Agent 评估方法**
- **LLM 幻觉**

---

