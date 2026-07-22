---
title: "DESIGN.md：Google Stitch 与 VoltAgent 开源，AI 设计 Agent 的视觉约束对齐文件"
source_url: https://mp.weixin.qq.com/s/5WiRmtuRxUPJUC-qoFbXnA
ingested: 2026-06-02
sha256: 37924a56a560fa131ed6f938a1b2865a4c3e455381fef89fbb05901e5d4dc780
author: "老章很忙"
feed: "Ai学习的老章"
published: 2026-05-22
tags: [design-md, google-stitch, voltagent, awesome-design-md, design-agent, ai-design, ui-generation, agents-md, claude-code, ai-coding]
---

# DESIGN.md：Google Stitch 与 VoltAgent 开源，AI 设计 Agent 的视觉约束对齐文件

> 来源：Ai学习的老章 / 2026-05-22 / 老章很忙
> 上一篇：顶级大佬把 .claude 目录里的 Skills 全开源了 · 下一篇：Vibe Coding 时 AI 写代码不守规矩，开源神器来了

## 1. 核心命题

**AGENTS.md 大家都熟了**——告诉 AI 怎么构建项目。

**但你让 AI 写个落地页 / 仪表盘 / 后台，它的视觉总是和你的产品风格对不上**——按钮颜色不对、字体不对、间距不对、动效不对。

**Google Stitch 推了一个新概念：DESIGN.md**——和 AGENTS.md 是兄弟文件。

| 文件 | 谁读 | 定义什么 |
|------|------|---------|
| `AGENTS.md` | **编码 Agent** | 怎么构建项目 |
| `DESIGN.md` | **设计 Agent** | 项目长什么样、什么感觉 |

> **一个纯文本设计系统文档，AI Agent 读完就能产出风格一致的 UI**——不用 Figma 导出、不用 JSON schema、不用任何特殊工具。

## 2. VoltAgent awesome 集合

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

## 3. 仓库已收集的 73 个网站

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

## 4. DESIGN.md 里写什么

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

## 5. 怎么用

### 最简单的玩法

1. 在 getdesign.md 找一个你心仪的网站风格
2. 把对应的 DESIGN.md 下载到自己项目根目录
3. 告诉 Claude Code / Cursor / Codex：**"基于 DESIGN.md，做一个 XX 页面"**

### 进阶玩法

- **混搭**：把两个站的 DESIGN.md 元素提炼后合并成你自己的
- **公司专用**：给团队所有 AI 工具配同一份 DESIGN.md，**保证多人多 Agent 出的页面是一套**
- **配 AGENTS.md 用**：一个说怎么搭，一个说怎么看，**前端项目两份文档够了**

## 6. 老章评价

> **这事的关键不在于"VoltAgent 帮你扒了 73 个网站"——而在于 DESIGN.md 这个概念本身值得纳入工作流。**

让 AI 写代码靠 AGENTS.md 来对齐**工程约束**，让 AI 写界面靠 DESIGN.md 来对齐**视觉约束**——一前一后，让 AI 做的事更可预测。

对个人开发者来说，**最大的解放**：
> 不用每次都把 Figma 链接、品牌指南、配色细节嚼烂喂给 AI——**一份 DESIGN.md 全搞定**。

---

- 原文：Ai学习的老章 / 老章很忙 / 2026-05-22
- Google Stitch 官方文档：stitch.withgoogle.com/docs/design-md/overview/
- VoltAgent 仓库：github.com/VoltAgent/awesome-design-md
- 浏览站点：getdesign.md
