---
title: "Kimi Work 发布 + Codex 并入 ChatGPT：通用 Agent 战场从云端迁移到本地"
source_url: "https://mp.weixin.qq.com/s/Qyd8mHuR5ryfztgqQtSgGw"
publish_date: 2026-06-04
tags: [wechat, article, agent, kimi, moonshot, k2.6, kimi-work, codex, chatgpt, openai, vibe-working, vibe-coding, desktop-agent, webbridge, harness]
review_value: 9
review_confidence: 9
review_recommendation: strong
sha256: pending
---

# Kimi Work 发布 + Codex 并入 ChatGPT：通用 Agent 战场从云端迁移到本地
> 整理：Hermes Agent
> 原文：https://mp.weixin.qq.com/s/Qyd8mHuR5ryfztgqQtSgGw
> 作者：机器之心编辑部
> 关键词：Vibe Coding → Vibe Working / 本地 Agent / Agent 集群 / WebBridge / 金融数据源

## 一句话定位
**Kimi Work = 月之暗面 K2.6 模型 + Kimi Code Harness 搬到用户桌面**——通用 Agent 战场从"云端独立沙盒"迁移到"本地桌面 + 用户账号 + 真实文件"。**与 OpenAI 把 Codex 并入 ChatGPT** 同一时间发布，标志**"Vibe Working" 时代开启**。

> "AI 长任务的真正挑战，不再是上下文窗口有多长，而是 **Harness 搭建得好不好**。" —— 文章核心断言

## 三个关键事件

### ① OpenAI：Codex 周活 500 万，并入 ChatGPT
- **数据**：Codex 周活用户已突破 **500 万**，桌面版用户自 2 月上线后**翻了 6 倍多**
- **增长最快群体**：**不是程序员，而是知识工作者**（做报告 / 做表格 / 做 PPT 的"普通白领"）—— 以**开发者三倍以上的速度**涌入，占全部用户约 20%
- **判断**：**AI Agent 的主战场，正在从写代码迁移到普通人的日常工作上**
- **决策**：**未来几周内，Codex 的核心能力直接并入 ChatGPT**——把 Codex 这个执行利器塞进 ChatGPT 高频入口，走规模渗透路线

### ② Anthropic 提前布局：2 月企业 Agent 计划 + 5 月金融 Agent
- 2 月：推出面向金融、工程等场景的**企业 Agent 计划**
- 5 月：上线**深度面向金融行业的 Agent 产品**
- **策略**：Coding Agent 不只能写代码，也能整理文件、分析数据、自动化工作流、完成过去需要助理才能做的事

### ③ Kimi 发布 Kimi Work（Beta）
- **官方自评**："还是个 Baby"
- **K2.6 模型参与共创**，很快完成 Beta 版的开发与上线
- **核心定位**：**"本地通用 Agent 模式"**——Kimi 电脑客户端推出，面向更广泛的知识工作者
- **技术路径**：Kimi Work 内核源自 **Kimi Code Coding Agent**——把 Harness 从程序员终端**下放到通用桌面**

## 5 大技术特性

### ① Harness 搬到用户电脑上（核心架构决策）
**对比云端 Agent**（Kimi 网页版 / OpenAI cloud sandbox / Google Project Mariner）：
- 共同特点：在云端启动独立工作环境，**帮用户把任务做完再交付结果**
- 优势：安全隔离、易于部署
- 劣势：**与用户真实工作环境的割裂**——看不到本地文件、用不了用户账号、任务之间无记忆无上下文

**Kimi Work 路线**：**Agent 住在本地、用你的环境、操作你的文件、带着你的登录状态去工作**。理论上讲，本地 Agent 的边界 = 用户桌面工作的全部边界。^[raw/articles/kimi-work-codex-vibe-working-paradigm-shift.md]

### ② Agent 集群：默认并行（最多 300 个分身）
**核心理念**："串行工作是人类受限于精力的默认设定，但 AI 天生就应该是并行的"。
- **测试版上线即支持 Agent 集群**——最多可**自主创建 300 个分身**，同时处理多线程任务
- 一边跑数据、一边写材料、同时自动化处理流程

**实测案例**（新能源汽车融资调研）：
- 4 个子 Agent（"研究员"）各自独立搜集信息，**互不等待**
- 完成后**自动创建 2 个专职 Agent**（数据清洗 + Excel 制作）
- **整个过程不需要人工拆解任务、安排分工**——它自己就把"项目管理"做掉了 ^[raw/articles/kimi-work-codex-vibe-working-paradigm-shift.md]

### ③ Kimi WebBridge（浏览器桥接）
**核心创新**：**直接操作用户当前正在使用的浏览器**（包含用户自己的登录状态和习惯），而不是去新建一个空白的 AI 专用浏览器。

**价值主张**：
- AI 直接**"借用"**你现有的浏览器环境——你登录过的账号、保存过的状态都直接成了它的资源
- 摩擦感降到最低
- **基本上你在浏览器上能做的 50% 的事情，它都能直接帮你操作**

**测试案例**（通过 WebBridge 发布微博）：
- 全程不离开 Kimi Work 交互界面
- 后台调用默认浏览器的登录状态
- 完成"内容撰写 → 页面打开 → 文本填入 → 发布确认"完整操作链路
- 反馈微博链接

**对比传统 AI 自动化**：
- 给 AI 一个专用沙盒浏览器（没账号没 Cookie）—— 安全但割裂
- 用户手动授权 + 配置 API——安全但摩擦
- **WebBridge 思路**：借用现有浏览器环境，**摩擦感最低** ^[raw/articles/kimi-work-codex-vibe-working-paradigm-shift.md]

### ④ 内置专业金融数据源
**出厂自带**：同花顺、天眼查、世界银行经济数据库等权威环境
- 金融人士**无需再去头疼如何购买和配置各种 API**——开箱即用
- 真实数据获取和处理流程（**20 条工具调用** + **20 条命令**），不是换说法的联网搜索

**测试案例**（英伟达股价分析）：
- 不去联网搜索现成分析文章
- 真正调用数据源，20 个工具 / 20 条命令
- 11 页完整分析报告（股价走势 / 累计收益率 / 波动率分析）
- 达到投资参考基本标准 ^[raw/articles/kimi-work-codex-vibe-working-paradigm-shift.md]

### ⑤ "全部允许" 模式（类似 `--dangerously-skip-permissions`）
- 内置类似 `claude --dangerously-skip-permissions` 的"全部允许"模式
- 用户只需指定**一个具体的项目文件夹**，选择"全部允许"即可
- Kimi 官方主张"足够安全，并不会超出文件夹行事"
- **建议**：关键目录仍用"请求权限"模式

## 5 大测试场景实测

| 场景 | 任务 | 关键结果 |
|---|---|---|
| **调研** | 2025 年以来国内新能源汽车融资事件 → Excel | 4 子 Agent 并行搜集 + 2 专职 Agent 清洗/制表 |
| **本地文件** | 近一个月"具身智能 + 机器人"选题分类 | 飞快完成，**真实本地文件（无需上传/复制粘贴）** |
| **浏览器操控** | 通过 WebBridge 发微博 | 借用登录状态，**50% 浏览器操作可自动化** |
| **长任务稳定性** | 30 位天才各 1000-3000 字演讲稿 + 日程 | 50+ 分钟、**超时后自动重启动 + 断点续传**、104 页 Word |
| **金融数据源** | 英伟达 2023+ 股价分析 | 20 工具 / 20 命令，**11 页报告**，**真实数据管道**（非搜索） |

> 30 位天才演讲稿任务的关键考验：**"长程连贯性"**——前面选了哪 30 个人、每个人确立了什么风格基调，后面的撰写必须和这些设定保持一致。**50 分钟、跨越数十个子任务，Kimi Work 没有出现前后矛盾，超时后选择继续而不是放弃**。^[raw/articles/kimi-work-codex-vibe-working-paradigm-shift.md]

## 长程连贯性的工程细节（值得记录）

**莫扎特演讲稿超时 → 自动重启 → 断点续传**：
- 任务失败后**自动重新启动**
- **从断点继续完成后续内容**（不是从头再来）
- **进度不丢失**

**对 Beta 版的评价**：在长达 50 分钟、跨越数十个子任务的执行链条里，Kimi Work 没有出现前后矛盾，也没有在超时后选择放弃——**对于一个刚发布的 Beta 版产品来说，已经相当能打**。

## Vibe Coding → Vibe Working 范式转移

> "Vibe Coding 让不懂编程的人开始用 AI 写代码。**Vibe Working 想做的是让不懂技术的人开始用 AI 完成知识工作**。"
>
> "两者的核心逻辑是一样的：**把执行权交给 AI，把判断权留给人**。"

**两条路**：
- **OpenAI**：把 Codex 这个执行利器并进 ChatGPT 这个高频入口 → **规模渗透路线**
- **Kimi**：本地 Agent 住在桌面上 → **深度嵌入路线**

> "两条路都在通向同一个地方：**一个 AI 真正参与知识工作日常流程的未来**。那个未来，比大多数人预想的，要来得要早一些。"

## 模型公司在通用 Agent 上的天然优势

> "**只有同时掌握模型能力和 Agent 运行环境的公司，才能做到两者的深度协同**：模型知道什么时候该调用什么工具，Harness 知道模型需要什么样的上下文。**这种协同是外部集成商很难复制的**。"^[raw/articles/kimi-work-codex-vibe-working-paradigm-shift.md]

**Kimi 路径**（不是临时起意）：
- 2025-07：万亿参数开源模型 **Kimi K2**——国内最早一批将 Agentic Coding、工具调用和自主任务执行能力作为核心目标打造的基础模型之一
- 2025-09：**内测 Agent 模式**（代号"OK Computer"）
- 2026-06：**Kimi Work 发布**——这条技术路径在桌面端的自然延伸

## Kimi Work 的局限（官方自评）

- 任务失败时的**恢复机制**还需打磨
- **长时任务的中断与恢复**还需完善
- **用户意图的准确理解**还需提升
- "还是个 Baby"——Beta 版自评

**迭代速度**：「Kimi Work 正以**一天 N 版**的速度迭代中」——发布本身不是表明产品多完善，而是**这个方向上的竞争已经进入了一个新的速度节奏**。

## 核心断言

> **"AI 长任务的真正挑战，不再是上下文窗口有多长，而是 Harness 搭建得好不好。"**
>
> **"Vibe Coding 之后，下一个词是 Vibe Working。"**

## 与现有 wiki 实体的关系

### vs [[entities/wow-harness-v3-governance-protocol|wow-harness v3]]
- v3 = 跨 session 事件时间线 + 概念图（**协议层**治理）
- Kimi Work = Harness 搬到本地桌面（**运行环境层**变革）
- 共同点：都在解决"AI Agent 如何与真实工作环境对接"问题

### vs [[entities/pilotdeck-agent-os-openbmb-tsinghua|PilotDeck]]
- PilotDeck = WorkSpace + Always-on + Dream 模式（**多项目隔离**）
- Kimi Work = **本地桌面 + 用户账号 + 真实文件**（**单桌面全场景**）
- 共同点：都强调"AI 套上家"的工程范式

### vs [[entities/agent-harness-architecture|Agent Harness 架构]]
- 7 层 harness 模型是抽象框架
- Kimi Work + WebBridge 是具体落地实现
- 文章强化："**Harness 决定一切**"——比模型能力重要

### vs [[entities/rein-go-agent-4-modules-5-type-boundaries|Rein]]
- Rein = 4 模块 + 5 类型边界（**代码层**架构）
- Kimi Work = Harness 从云端到本地（**部署层**架构）
- 共同点：都在"防止上帝文件 / 防止环境割裂"层面做工程化

### vs [[entities/codex-role-plugins-sites-annotations|Codex 6 职位插件]]
- 之前 Codex 还在"加插件拓展能力"
- 现在 OpenAI 直接把 Codex 并入 ChatGPT——**赛道战略转向**

## 启示

1. **Vibe Coding → Vibe Working 范式转移** —— AI Agent 主战场从代码迁移到知识工作（Codex 周活 500 万中**白领增速 3 倍于开发者**）
2. **通用 Agent 战场从云端迁移到本地** —— 云端沙盒浏览器 vs 本地借用用户账号（WebBridge 思路胜出）
3. **模型公司 + 自家 Harness = 不可复制的协同** —— 同时掌握模型 + Agent 运行环境的公司有天然优势
4. **Agent 集群是默认而非开关** —— AI 天生并行（最多 300 个分身）
5. **本地 Agent 边界 = 桌面工作全部边界** —— 文件、账号、状态、应用都成为可调用资源
6. **金融数据源是"开箱即用"分水岭** —— 内置数据管道 vs 联网搜索摘抄，差别巨大
7. **"一天 N 版"是 AI Agent 新节奏** —— Beta 版不再"打磨完美才发布"，速度胜过完整
8. **Harness > 上下文窗口** —— AI 长任务的真正挑战是 Harness 搭建质量

## 局限 / 风险

- **Kimi Work 是 Beta 版**，任务恢复 / 中断恢复 / 意图理解都还在打磨
- **"全部允许"模式**（类似 `--dangerously-skip-permissions`）有潜在风险——**用户需主动限制到具体文件夹**
- **WebBridge 借用登录状态**是双刃剑——便利性 vs 账号安全责任边界
- **300 个 Agent 并行的成本 / 限速 / 沙箱**问题未在文章中详细披露
- **Codex 500 万周活 / 桌面版 6 倍**数据来自 OpenAI 自报，缺第三方验证
