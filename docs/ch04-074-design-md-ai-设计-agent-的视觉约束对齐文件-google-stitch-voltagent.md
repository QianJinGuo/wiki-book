# DESIGN.md：AI 设计 Agent 的视觉约束对齐文件（Google Stitch × VoltAgent）

## Ch04.074 DESIGN.md：AI 设计 Agent 的视觉约束对齐文件（Google Stitch × VoltAgent）

> 📊 Level ⭐⭐ | 18.1KB | `entities/design-md-google-stitch-voltagent-ai-design-agent.md`

# DESIGN.md：AI 设计 Agent 的视觉约束对齐文件（Google Stitch × VoltAgent）

## 概述

老章很忙（Ai学习的老章）2026-05-22 介绍 **Google Stitch 推出的 DESIGN.md 概念**——和 AGENTS.md 是兄弟文件。**编码 Agent 读 AGENTS.md**（怎么构建项目），**设计 Agent 读 DESIGN.md**（项目长什么样、什么感觉）。**VoltAgent 团队开源 `awesome-design-md` 仓库**，扒了市面上 73 个主流网站的 DESIGN.md，可直接 copy 到项目根目录用。AI Agent 读完即能产出风格一致的 UI——不用 Figma 导出、不用 JSON schema、不用任何特殊工具。

## 核心命题

**AGENTS.md 大家都熟了**——告诉 AI 怎么构建项目。

**但你让 AI 写个落地页 / 仪表盘 / 后台，它的视觉总是和你的产品风格对不上**——按钮颜色不对、字体不对、间距不对、动效不对。

> **Google Stitch 推了一个新概念：DESIGN.md**——和 AGENTS.md 是兄弟文件。

| 文件 | 谁读 | 定义什么 |
|------|------|---------|
| `AGENTS.md` | **编码 Agent** | 怎么构建项目 |
| `DESIGN.md` | **设计 Agent** | 项目长什么样、什么感觉 |

> **一个纯文本设计系统文档，AI Agent 读完就能产出风格一致的 UI**——不用 Figma 导出、不用 JSON schema、不用任何特殊工具。 

## VoltAgent awesome 集合

**VoltAgent 团队搞了个 awesome 集合**：

- GitHub: `github.com/VoltAgent/awesome-design-md`
- **把市面上 73 个主流网站的 DESIGN.md 都扒下来了**
- 可以直接 copy 到自己项目里用

### 思路有多简单

> **Copy a DESIGN.md into your project, tell your AI agent "build me a page that looks like this" and get pixel-perfect UI that actually matches.**

把 DESIGN.md 丢项目根目录，跟 AI 说"照这个风格做"，就完事。

**为什么用 Markdown**：因为 LLM 读 Markdown 最顺，没东西需要 parse 或配置。

### 浏览站点

每个站点的 DESIGN.md 都在 **getdesign.md** 这个站点上点开就能看。

## 仓库已收集的 73 个网站

仓库按品类组织，**AI & LLM 平台**类（直接拿来抄的目标）：

| 网站 | 风格 |
|------|------|
| **Claude** (Anthropic) | 温暖的赤陶色调，干净的编辑式版面 |
| **Cohere** | 企业 AI 平台，活泼渐变，数据密集仪表盘 |
| **ElevenLabs** | AI 语音，暗色电影感 UI，音频波形美学 |
| **Mistral AI** | 法国式极简，紫色调 |
| **Ollama** | 终端优先，单色简洁 |
| **OpenCode AI** | 开发者向暗色主题 |
| **Replicate** | 白色画布，代码优先 |
| **Runway** | AI 创意工具，电影节式美学 |
| **Together AI** | ... |

**73 个网站基本覆盖了 AI / 工具 / 编辑器 / 设计 / 内容 / SaaS / 个人站**等大类，需要哪种感觉直接挑。

## DESIGN.md 里写什么

按 **Google Stitch 官方定义**（stitch.withgoogle.com/docs/design-md/overview/）大致包括：

- **品牌定位 / 个性形容词**
- **配色**（主色、辅色、语义色）
- **字体**（家族、字号、字重、行高）
- **间距系统**
- **圆角 / 阴影 / 边框**
- **组件示范**（按钮、卡片、表单、导航）
- **动效原则**
- **整体气质描述**（"克制"、"活泼"、"电影感"…）

**所有这些都用人话写在一个 markdown 文件里**，没有任何嵌套 JSON 或 token 结构。

## 怎么用

### 最简单的玩法

1. 在 getdesign.md 找一个你心仪的网站风格
2. 把对应的 DESIGN.md 下载到自己项目根目录
3. 告诉 Claude Code / Cursor / Codex：**"基于 DESIGN.md，做一个 XX 页面"**

### 进阶玩法

- **混搭**：把两个站的 DESIGN.md 元素提炼后合并成你自己的
- **公司专用**：给团队所有 AI 工具配同一份 DESIGN.md，**保证多人多 Agent 出的页面是一套**
- **配 AGENTS.md 用**：一个说怎么搭，一个说怎么看，**前端项目两份文档够了** 

## 核心洞察

> **让 AI 写代码靠 AGENTS.md 来对齐工程约束，让 AI 写界面靠 DESIGN.md 来对齐视觉约束**——一前一后，让 AI 做的事更可预测。

对个人开发者来说，**最大的解放**：
> 不用每次都把 Figma 链接、品牌指南、配色细节嚼烂喂给 AI——**一份 DESIGN.md 全搞定**。 

## 与现有 entity 的差异化

| 维度 | 本文（DESIGN.md） | 现有 `anthropic-agent-skills-design-patterns-*` |
|------|------------------|---------------------------------------|
| 关注对象 | **设计 Agent / UI 生成** | **编码 Agent / Skills 模式** |
| 约束类型 | **视觉约束**（配色/字体/间距/动效） | **工程约束**（Skill 结构/工具调用） |
| 范式来源 | Google Stitch 官方 | Anthropic 官方 |
| 资源集合 | VoltAgent awesome-design-md（73 站） | 无（仅有 Anthropic 14 模式） |
| 配合使用 | 与 AGENTS.md **兄弟文件**，前端项目两份文档 | 单独使用 |
| 应用范围 | 前端 UI / 落地页 / 仪表盘 | 全栈 Agent 工程 |

**关键判断**：本文**不与现有 Anthropic Skills 模式重复**——DESIGN.md 是**视觉层**约束的独立概念。

## 学术pro 续篇：71 套设计规范的 Skill 化整合（2026-05-11）

> 后续作者**学术pro** 2026-05-11 推文强调 — **把 71 套设计规范做成一个 Skill**。与老章 `5WiRmtuRxUPJUC-qoFbXnA` 报道的 **73 站 DESIGN.md 集合** 同期：作者用"71 套"这个数字说明项目动态更新（不同时间快照）。

### 核心定位：Design MD Collection = Skill 而非文件集合

**关键差异**：与老章报道的"DESIGN.md 文件格式 + VoltAgent awesome 集合"侧重 **文件协议** 不同，学术pro 强调 **Skill 化使用体验**：

- **不是单一风格**，而是把 71 套产品级视觉系统整合到一个 Skill 中
- 用户只需说"参考 Vercel / Stripe / Linear 风格，帮我设计 XX"，Skill 自动选择参考风格
- **稳定输出**：把"设计审美"封装到可复用能力中，不擅长设计的人也能产出高质量视觉
- **实测结论**：比普通 prompt "稳定太多"

### 五大应用场景分类

学术pro 给出更落地的**使用场景分类**：

| 场景 | 推荐风格 | 共同特征 |
|------|---------|---------|
| **独立开发者**（不会设计的全栈） | Vercel / Stripe / Linear | 视觉气质 + 排版层级 + CTA + 卡片 + 布局节奏完整方向 |
| **AI 产品 / 开发者工具项目** | Claude / Cursor / Vercel / Supabase / Raycast / Warp / Replicate / Together AI / Ollama | 技术感强、信息层级清晰、不花哨 |
| **SaaS / 后台 / 管理系统** | Linear / Notion / Airtable / Slack / Intercom / Zapier / Cal / Mintlify | 强调信息组织、交互效率、清晰度 |
| **金融 / 支付 / 加密类产品** | Stripe / Coinbase / Binance / Kraken / Revolut / Wise / Mastercard | 信任感、安全感、数字金融气质 |
| **消费品牌 / 电商 / 生活方式** | Apple / Nike / Shopify / Airbnb / Starbucks / Spotify / Pinterest | 情绪、品牌感、用户吸引力 |

### 实战 demo 验证

学术pro 提供了 5 个**完整 demo 截图**验证 Skill 化效果：

1. **官网**：BMW corporate 风格汽车官网 UI
2. **支付页面**：参考 Stripe 风格重做支付页
3. **后台系统**：Linear-app 风格项目管理后台
4. **文档站**：Mintlify 风格开发者文档首页
5. **无参考风格自由发挥**：AI Agent 框架官网

**意外发现**：Skill 自动生成了**简易版可交互 UI 设计页面**（不仅是静态截图）。

### 关键洞察：从"感觉"到"规则"

> 模糊感受很难执行 → Design MD Collection 把这些**感受拆成可执行设计规范**。

具体规范维度：
- **配色**：主色 + 辅助色的角色定义
- **气质**：冷静/温暖/科技/极简/大胆的整体倾向
- **字体层级**：标题/正文/注脚的组织方式
- **组件处理**：按钮/卡片/导航/表单的标准做法
- **布局密度**：宽松 vs 紧凑的节奏选择
- **装饰元素**：阴影/边框/圆角/渐变的使用规则
- **推荐 vs 避免做法**：明确的"好/坏"示例

**对稳定输出非常关键**——AI 不是"凭感觉发挥"，而是在**明确的视觉系统里工作**。

### 补充：与原作者定位的差异

学术pro 提到可能有人会质疑"这不就是高仿吗？"——这与**老章原文**的定位形成互补：

- **老章**强调 **DESIGN.md 协议**（让设计 Agent 能读懂约束文件）
- **学术pro**强调 **Skill 化使用**（让不会设计的人也能产出稳定高质量视觉）
- **共同结论**：DESIGN.md / Skill 化都把"模糊感受"变成"可执行规则"

## 深度分析

### 设计约束的协议化：从 Figma 到纯文本的范式转移

DESIGN.md 的核心创新不是文件格式本身，而是**将视觉约束协议化**的思路转变。传统工作流中，设计系统以 Figma 文件或 JSON token 形式存在，AI 使用时需要额外的解析步骤。DESIGN.md 把这个过程倒过来——不是让 AI 学会解析 Figma API，而是**让人类用 AI 更容易理解的格式表达设计意图**。这是一个从"工具本位"到"agent 本位"的根本转变。

### Stitch 的方法论：轻量接口 vs 重量平台的战略选择

Google Stitch 选择用纯文本而非结构化 schema 定义 DESIGN.md，这是一个有意为之的设计哲学。JSON Schema 或 Design Token 格式（如 Theo、W3C Design Token）更精确，但对 LLM 的读取门槛更高；纯文本更模糊，但 LLM 理解成本更低。Stitch 在**表达力**和**可读性**之间选择了后者——对于 AI Agent 的视觉约束场景，这个权衡是合理的，因为 LLM 的推理能力可以填补模糊性的空白。

### AGENTS.md + DESIGN.md：前端工作流的关注点分离

将工程约束（AGENTS.md）和视觉约束（DESIGN.md）分离，是前端工作流中**关注点分离原则**的延伸。传统开发中，产品需求和工程实现需要分离；AI Agent 时代，**设计规范**和**实现指令**也需要分离。这两个文件组合在一起，形成了一套完整的产品级前端项目规范协议——一个面向"建筑结构"，一个面向"视觉外观"。

### VoltAgent awesome 集合的本质：设计风格市场的原语化

VoltAgent 把 73 个主流网站的 DESIGN.md 聚合在一起，本质上是在构建一个**可引用的设计风格语料库**。当每个设计风格都被标准化为一个文本文件时，AI Agent 可以在语料库中做"风格检索"——说"参考 Linear 的风格"比描述"用 Linear 那种干净的深色主题加蓝色强调色"更精确。这种原语化（primitivization）让设计风格的传递从**隐性经验**变成**显性协议**。

### Skill 化趋势的深层逻辑：从文件到能力的认知升级

学术pro 将 DESIGN.md 集合 Skill 化，反映了 AI 工作流中一个更广泛的趋势：**把一次性指令封装为可复用能力**。DESIGN.md 作为文件，需要每次调用时手动指定；Skill 作为能力，可以被 AI Agent 持久记住。对于不会设计的开发者来说，这个封装层消除了"把审美转译为规范"的认知负担——说一句"用 Linear 风格"，剩下的由 Skill 自动完成。

## 实践启示

### 建立 DESIGN.md 工作流的五步法

对于初次接触 DESIGN.md 的开发者，建议按以下步骤建立工作流：首先，在 getdesign.md 上浏览现有风格并选择与项目需求最接近的参考站；然后，将对应 DESIGN.md 文件复制到项目根目录；接着，在 AI 编码工具（Claude Code、Cursor、Codex 等）中明确指示 AI 读取 DESIGN.md；之后，根据初步输出提供视觉反馈并迭代；最后，将最终的 DESIGN.md 沉淀为团队资产。这五步构成一个完整的"参考—对齐—迭代—固化"周期，比临时抱佛脚式的设计注入更稳定。

### 在团队中强制推行 DESIGN.md 作为设计一致性的保障

多人多 Agent 协作时，每个 Agent 独立生成的 UI 页面往往视觉语言不一致——颜色、字体、间距各有偏差。将 DESIGN.md 作为团队级约束文件强制推行，可以让所有 Agent 共享同一套视觉规范。具体做法是：在项目根目录同时放置 AGENTS.md 和 DESIGN.md，并在团队编码规范中明确要求所有 Agent 必须先读取这两个文件。这类似于传统开发中的"代码规范文件"，但针对的是视觉输出。

### 为公司或产品线建立专属 DESIGN.md 模板资产库

对于有稳定产品的团队，建议将从现有产品中提取的 DESIGN.md 作为长期资产维护。具体操作是：挑选产品中最具代表性的页面（如官网首页、产品 dashboard、核心功能页），将其实施的视觉细节（实际使用的 hex 色值、font-family、spacing 数值）反向工程为 DESIGN.md 格式。这个资产库可以在新功能开发或 AI 辅助设计时直接引用，省去每次重新定义视觉约束的重复劳动。

### 关注 VoltAgent awesome-design-md 的动态更新

VoltAgent awesome-design-md 集合仍在活跃更新中（学术pro 使用"71 套"而非"73 个"说明不同时间快照的差异）。建议定期关注该仓库的 Release 或 Commit 动态，将新加入的设计风格同步到团队资产库中。同时可以考虑向该仓库贡献你从实际产品中提取的 DESIGN.md——这既是对生态的正向贡献，也是建立个人/团队影响力的方式。

### 将 DESIGN.md 与 AGENTS.md 协同使用以获得完整项目上下文

在实际项目中，DESIGN.md 和 AGENTS.md 需要作为**协同文件**使用而非孤立文件。当 AI Agent 同时读取这两个文件时，它才能获得完整上下文：AGENTS.md 告诉它"项目怎么搭"（目录结构、技术栈、代码规范），DESIGN.md 告诉它"项目长什么样"（视觉风格、组件规范、动效偏好）。缺少任何一个，AI 的输出都会出现方向性偏差——只读 AGENTS.md 会视觉失控，只读 DESIGN.md 会工程失控。

## 进一步阅读

- Google Stitch 官方文档：stitch.withgoogle.com/docs/design-md/overview/
- VoltAgent 仓库：github.com/VoltAgent/awesome-design-md
- 浏览站点：getdesign.md

---

## 相关实体
- [Agentexecutorgooglesdistributedagentruntime](/ch04-003-agentrun/)
- [Anthropic Google Agent Skills Design Patterns](/ch01-677-anthropic/)
- [Google Agentic Rag Sufficient Context Agent Framesqa](/ch01-297-google-agentic-rag-sufficient-context-agent-framesqa-90/)
- [Agent Executor Googles Distributed Agent Runtime Da1Bb4](/ch04-434-agent-executor-google-s-distributed-agent-runtime/)
- Scalable Voice Agent Design With Amazon Nova Sonic Multi Agent Tools And Session
- MOC

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/design-md-google-stitch-voltagent-ai-design-agent.md)

---

