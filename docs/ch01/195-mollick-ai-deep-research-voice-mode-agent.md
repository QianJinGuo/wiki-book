# Mollick 实用 AI 选型指南：模型选择·Deep Research·Voice Mode·Agent 工作流

> 📊 Level ⭐⭐⭐ | 9.9KB

> 2026-06-07 引用自 Ethan Mollick《Using AI Right Now: A Quick Guide》，One Useful Thing，2025-06-23。

## 三大系统选哪个

**ChatGPT**（OpenAI）、**Claude**（Anthropic）、**Gemini**（Google）三选一，都提供：高级+快速模型、语音模式、图像/文档处理、代码执行、移动 App、图片/视频生成（Claude 缺）、Deep Research。

免费版获得部分功能，$20/月获得完整功能集。选哪个都不会错，差异在细节。

## 模型分层

每个系统都有三层：
- **快速模型**（Claude Sonnet/GPT-4o/Gemini Flash）：头脑风暴、快速问答
- **强力模型**（Claude Opus/o3/Gemini Pro）：分析/写作/研究/编码等重要任务
- **超强力模型**（o3-pro等）：极难推理，可能需要 20+ 分钟思考

大多数系统默认快速模型节省算力，需手动切换到强力模型做重要工作。

## Deep Research（关键功能）

Deep Research 是被大多数人忽视的核心功能。能生成高质量报告，让律师/会计师/咨询师/市场研究员等专业信息工作者印象深刻。用途：
- 礼品指南（"给一个读过所有哈利波特的 11 岁孩子买什么"）
- 旅行指南（"去威斯康星州旅行，聚焦奶酪和农产品"）
- 法律/医学第二意见（AI 在诊断上表现良好，幻觉率低）

各系统 Deep Research 工具略有不同，Gemini 还能把报告转成信息图/测验/播客。

## Voice Mode

两个最佳实现：Gemini App 和 ChatGPT App/网站。Claude 的语音模式较弱。

Voice Mode 的 killer feature 不是自然对话，而是**共享屏幕/相机**功能。手机指向故障设备、数学问题、食谱、外语标识，AI 实时看到并回应。多模态能力真正未来感，但大多数人只用 Voice Mode 当 Siri。

## 制作输出：图片/视频/代码/文档

- **图片**：ChatGPT（最可控）> Gemini（Imagen + 多模态）
- **视频**：Gemini Veo 3 令人印象深刻，每天有几次免费使用
- **文档/分析/游戏/模拟**：使用 Canvas 选项让 Gemini/ChatGPT 运行代码，Claude 自己就能做

## Prompting 已死？

最新模型通常不需要复杂提示就能理解你的意图。研究表明**对 AI 礼貌对输出质量影响不大**。直接会话式提问即可。

但构建供他人重复使用的 prompt 仍需要真实技能。

## 相关实体
- [Opinionated Guide Ai Right Now Mollick](https://github.com/QianJinGuo/wiki-public/blob/main/entities/opinionated-guide-ai-right-now-mollick.md)
- [Three Years Gpt3 Gemini3 Mollick](https://github.com/QianJinGuo/wiki-public/blob/main/entities/three-years-gpt3-gemini3-mollick.md)
- [Guide Ai Agents Models Apps Harnesses Mollick](https://github.com/QianJinGuo/wiki-public/blob/main/entities/guide-ai-agents-models-apps-harnesses-mollick.md)
- [Miroflow Deep Research Agent Harness Mirothinker](https://github.com/QianJinGuo/wiki-public/blob/main/entities/miroflow-deep-research-agent-harness-mirothinker.md)
- [Meta Muse Spark Voice Mode Meta Glasses](https://github.com/QianJinGuo/wiki-public/blob/main/entities/meta-muse-spark-voice-mode-meta-glasses.md)

→ [原文存档](https://www.oneusefulthing.org/p/using-ai-right-now-a-quick-guide)

## 深度分析

### 1. 为什么「选哪个都不会错」：替换成本已低于选择成本

Mollick 在这篇指南里记录了一个 quietly 的关键转变：评价单位已经从「哪个模型最强」变成「哪个整体系统最好」。三大系统的功能集高度趋同——高级+快速双模型、语音模式、图像/文档理解、代码执行、移动 App、Deep Research——意味着选错系统的代价不再是能力缺失，而只是界面习惯与工作流的重新适配，替换成本已远低于选择成本。这正是通用技术扩散早期的典型特征：横向差异收敛后，采纳瓶颈从「选哪个」转移到「怎么用」。Mollick 自己的行文结构就是证据——推荐系统只用了一小节，随后的大半篇幅都在讲解如何有效使用；他明说「选系统只是开始，真正的挑战是理解这些日益复杂的工具」。 二线选择（Grok、Copilot、DeepSeek）只在特定生态偏好下才值得考虑，且各有透明度或长期演进的隐忧。

### 2. Deep Research 与信息工作的经济学

Deep Research 的意义不在「更好的搜索」，而在把一项小时级的信息工作压缩到分钟级且保持专业可信度：其报告质量足以让律师、会计师、咨询师、市场研究员等专业信息工作者印象深刻，引用通常真实可查，虽非零错误但远比直接提问可靠。 对个人采纳曲线而言，关键动作是 Mollick 建议的「在自己专业领域内测一次 Deep Research」——实质是用自己的专业判断校准 AI 产出的质量差距，这是决定用户是否持续投入的唯一可信标尺。该能力还是连续谱而非开关：在 Claude/o3 里打开 web search 就能得到迷你版 Deep Research（做些网络调研但不出完整报告），Gemini 则能把报告转成信息图、测验或播客——后者是用消费形态降低认知门槛的分发创新。

### 3. Voice Mode：被「Siri 化」误读的多模态入口

Voice Mode 被低估不是因为体验差，而是因为用户把它映射到了错误的参照物（Siri 式语音助手）。它真正的 killer feature 是共享屏幕/相机：手机指向故障设备、数学题、正在做的菜谱或外语标识，AI 实时看到你所见并回应——本质上是把「用语言描述问题」这个最容易失真的信息传递环节，替换成直接感知。 但存在两个隐藏约束：语音对话跑的是聊天优化模型而非强力模型（模型为此刻意加入了停顿和呼吸声），且较少主动搜索网络，事实性问题的幻觉率因此更高——在 ChatGPT 里听不到那个搜索点击声，就说明它并没有真的在查网。

### 4. 「Prompting 已死」的真实含义：从提示工程转向上下文与任务工程

Wharton 生成式 AI 实验室的实证研究显示，对 AI 礼貌对输出质量整体影响不大（脚注补充：在难的数学/科学题上，礼貌有时让它表现更好、有时更糟，方向无法预知），Chain-of-Thought 提示也不再像过去那样显著提升答案质量。 但这不等于提示技能消失，而是重心迁移。一次性会话中技巧的边际效益下降，三类能力反而更值钱：一是主动供给上下文——模型默认只知道当前对话内的信息，文档、图片甚至一段自我介绍都能显著改变输出；二是把目标说清到痛点层面，或干脆让 AI 反问你以澄清需求；三是大量索取与分支探索——要 50 个想法而非 10 个，用编辑后产生的分支对比不同提问的效果。Mollick 的判断是：普通用户与 power user 的差异不在 prompting 技巧（那会随经验自然积累），而在「知道这些功能存在并把它们用到真实工作上」。 唯一仍是硬技能的例外，是为他人构建可反复使用的 prompt——这恰是从个人会话工程走向组织级任务工程的衔接点，也与本实体 实践启示 第 5 条的 SOP 建议直接对应。

## 实践启示

### 1. 订阅 $20 并默认使用强力模型

将检查模型选择器作为每次任务的第一个动作，固化为工作流标准节点——就像发邮件前检查收件人。

### 2. 用 Deep Research 做一次真实研究任务

选一个用 Google+阅读+整理处理的信息需求，用 Deep Research 完成并用专业知识评估输出质量。

### 3. 用 Voice Mode 相机替代截图流程

拍一道不确定的食谱、陌生工具、外文标识或数学题，将「截图→切换→粘贴」简化为「手机直接指向问题」。

### 4. 用 Canvas 模式完成完整交付物

用 AI 处理合同草稿、数据可视化、报告分析等完整输出任务，而非仅用于快速问答——这才是理解 AI 能力边界的真正方式。

### 5. 为高频重复任务建立标准化 AI 辅助 SOP

识别每周超过 3 次的信息处理任务，为每个任务编写含背景、输出格式、组织约束的标准化 prompt。好的 SOP 可将 2 小时手动工作压缩到 20 分钟。

---

