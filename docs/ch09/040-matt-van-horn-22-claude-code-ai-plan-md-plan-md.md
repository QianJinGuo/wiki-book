# Matt Van Horn 的 22 个 Claude Code 黑客技巧：让 AI 写 plan.md 但不读 plan.md

## Ch09.040 Matt Van Horn 的 22 个 Claude Code 黑客技巧：让 AI 写 plan.md 但不读 plan.md

> 📊 Level ⭐⭐ | 13.4KB | `entities/matt-van-horn-claude-code-workflow-philosophy.md`

## 摘要

Matt Van Horn（EveryInc，Python/Go 顶级项目贡献者）的 Claude Code 22 个黑客技巧，**核心哲学**：让 AI 写 plan.md 但不读 plan.md；6 个 cmux 标签页并行；用 Agent Cookie 让 Agent 登录真实世界服务；彻底放弃 IDE。

不只是一份技巧清单，而是一套**完整的 Agent 时代开发者工作流哲学** —— 人类 = 信号/品味/方向，智能体 = 执行/产量。

## 核心反直觉

- **80% 计划 + 20% 执行**（传统相反）。思考过程全在 plan.md，执行是机械的
- **强制生成 plan.md 是为了让智能体不偷懒** —— 写计划迫使它研究、承诺方法、列验收标准
- **不读 plan.md** —— 扫一眼标题就 `/ce-work`，内联提问 TLDR / eli5
- **直接索要交付物会偷工减料**。让它先计划如何生成交付物，再执行 —— 每次都是深度版本

## 22 个黑客技巧（六大类别）

### A. 计划循环（CE 系列）
1. **`/ce-plan` 永远第一步** —— 任何想法（产品/bug/截图/Slack）都先 plan.md
2. **不读 plan.md** —— 300 行 markdown 是智能体的作业
3. **`/ce-plan` 不只用于代码** —— 让第一个 plan 成为「关于计划的计划」

### B. 输入与并行
4. **彻底接受语音** —— LLM 能填补转录错；Mac: Monologue/Wispr Flow + 鹅颈麦
5. **cmux 4-6 个标签页** —— 并行：1 个写计划 / 1 个构建 / 1 个跑 last30days / 1 个修 bug
6. **终端默认进入 Claude** —— 新标签页直接打开智能体

### C. 远程与权限
7. **远程控制 + AgentMail 邮箱** —— 邮件触发新会话，白名单 DKIM/SPF 闸门
8. **危险地跳过权限** —— `bypassPermissions` + `skipDangerousModePermissionPrompt` + 声音钩子 `afplay Blow.aiff`

### D. 引擎分工
9. **Codex 负责构建，Claude 负责计划** —— 三种方式不离开 Claude 把工作交给 Codex；两个 200 美元订阅 = 一整个辅助引擎
10. **计划前先研究** —— `/last30days <topic>` 并行搜索 9 平台
11. **Granola + 原始转录稿** —— 不先总结，整个乱糟糟的转录稿直接喂

### E. 内容与信号
12. **人类信号** —— 稀有且有价值的不是打字速度，是判断力
13. **HyperFrames 制作视频** —— 视频 = HTML + script.md
14. **笔记即知识库** —— Bear/Obsidian + gbrain/supermemory

### F. 工程基础设施
15. **远程工作（Mac mini）** —— Mosh + Tmux + Hermes + OpenClaw + Agent Cookie 同步
16. **Proof 分享 plan** —— 人能读 + 评论回流智能体循环
17. **编写自己的技能** —— 做超过 2 次的事 → 技能；让智能体读 CE 这种优秀技能模仿结构
18. **为热爱项目做贡献** —— 真正宝贵的是人
19. **M5 Max 64GB + 永不休眠** —— `sudo pmset -a disablesleep 1`
20. **Printing Press 真实 CLI** —— 智能体跑腿：车辆预热/超市下单/订机票
21. **诚实的部分** —— **成瘾** 是真问题，不是休息
22. **这篇文章就是这样写出来的** —— cmux + Claude + 语音 + Proof

## 关键哲学提炼

> 「直接索要交付物，它会偷工减料。让它先计划如何生成交付物，再执行该计划，每次都能做出深度版本。」

> 「智能体本该替人类做所有的工作。但相反，所有的朋友都在比以往任何时候更努力地工作。**陷阱不在于空荡的发布，而在于整个人消失在构建过程中，失去了身边的人。**」

## 工具栈速查

| 类别 | 工具 |
|------|------|
| 计划/执行 | /ce-plan, /ce-work, /ce-brainstorm（Compound Engineering）|
| 终端多标签 | cmux（基于 Ghostty）|
| 语音 | Mac: Monologue/Wispr Flow + 鹅颈麦；手机: 苹果听写 |
| 研究 | /last30days（开源，2.6 万+ 星）|
| 会议 | Granola + Printing Press Granola CLI |
| 视频 | HyperFrames（script.md → MP4）|
| 审查 | Proof（plan.md → 人能读 + 评论回流）|
| 记忆 | Bear/Obsidian + gbrain/supermemory |
| 远程 | Mosh + Tmux + AgentMail + 远程控制 |
| 真实 CLI | Printing Press + Agent Cookie |
| 备用引擎 | Codex（xhigh + 快速模式）|

## 与现有实体的关系

- **与 [Claude Code 1 周年回顾](../ch03/076-claude-code.html)** 互补：1 周年是时间线 + 团队视角；本文是开发者工作流哲学
- **与 [Harness Engineering 核心模式](../ch05/112-harness-engineering.html)** 互补：CE plan.md 循环是 harness engineering 的具体实现
- **与 [工作流 Skill 模式](../ch04/267-skill.html)** 呼应：「任何做超过 2 次的事 → 做成技能」是 SkillOS 哲学的实战版
- **与 [Hermes 自进化](../ch03/092-hermes-agent.html)** 平行：Matt 用 OpenClaw + Hermes 跑远程工作
- **与 [Agent 六机制](../ch03/046-agent.html)** 呼应：「先 plan 后 work」是六机制中"计划-执行分离"的具体实现

## 工程可复现项

- **`/ce-plan` + `/ce-work` 双技能**：是 Compound Engineering 插件（`EveryInc/compound-engineering-plugin`）的入口
- **CE plan.md 结构**：问题诊断 + 解决方法 + 修改文件清单 + 验收标准复选框
- **6 标签页并行 + 声音钩子**：唯一分辨 6 个会话完成方式
- **Agent Cookie**：将真实浏览器会话交给 CLI，是「智能体登录服务」的关键
- **`/last30days`**：并行 9 平台研究，决策前必跑

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/matt-van-horn-22-claude-code-hacks-everyinc.md)

## 深度分析

### 核心观点：80% 计划 + 20% 执行是 AI 时代人机协作的结构性反转

传统软件工程中，开发者的时间大量投入"执行"（写代码、调试），计划只是前期铺垫。Matt Van Horn 的实验揭示了一个结构性反转：当 AI 能承担高质量执行时，人类的价值迁移到**计划质量本身**。写计划强迫 Agent 研究、承诺方法、列出验收标准——这是防止 Agent 偷懒的机制，而不是给人类自己看的文档。[Agent Self Improvement Six Mechanisms](../ch03/046-agent.html) 中的"计划-执行分离"与此呼应，但本文的贡献在于将这个原则 operationalize 为日常工具使用行为（每件事都先 /ce-plan）。

### 技术要点："让 AI 写 plan.md 但不读 plan.md"本质是委托-代理最优分离

这个看似反直觉的做法有深刻的工程逻辑：plan.md 是 Agent 的作业而非人类的阅读材料。人类只需要扫一眼标题判断方向，然后 /ce-work 内联提问 TLDR/eli5。这意味着人类扮演的是**评审者而非消费者**——计划的生产者和计划的执行者是同一个 Agent，但人类只消费计划的摘要而非完整内容。这与 [Harness Engineering Core Patterns Claude Code](../ch05/112-harness-engineering.html) 中描述的 Harness Engineering 原则一致：人类定义验收标准，Agent 负责实现路径。

### 实践价值：cmux 6 标签页并行 + 声音钩子是分布式认知的物理实现

传统 Terminal 工作流是单线程的（一个任务完成后再开始下一个）。Matt 的 cmux 配置实现了真正的并行多 Agent 工作流：每个标签页是不同的认知进程，声音钩子（afplay Blow.aiff）是完成信号的人机交互协议。这个模式的深层洞察：**完成感知不是眼睛盯着进度条，而是听觉信号触发的注意力路由**。这与 [Llm Observability 4 Layer Model](https://github.com/QianJinGuo/wiki/blob/main/concepts/llm-observability-4-layer-model.md) 中的"交互控制系统"概念相通——但这里是声音驱动的，而非仪表盘驱动的。

### 深层博弈：Agent Cookie 让 CLI "登录真实世界"是 Agent 工具调用能力的质变

Agent Cookie（将真实浏览器会话交给 CLI）解决了 AI Agent 落地最难的最后一公里：如何让 Agent 操作需要身份验证的第三方服务。在此之前，Agent 的工具调用被限制在"无状态 API 调用"。Agent Cookie 将 session/cookie 级别的上下文引入 CLI，这是从"函数调用"到"身份感知操作"的质变，也是 Matt Printing Press（车辆预热/超市下单/订机票）的技术基础。

### 技术判断：成瘾是真实风险，而非边缘警告

Matt 坦诚提到"成瘾是真实问题，不是休息"，这个判断值得认真对待。AI coding 的反馈循环（快速产出 → 即时满足 → 更大目标）在神经机制上与游戏/社交媒体类似，但产出的社会价值完全不同。这不是道德说教，而是可持续性问题。当"努力工作"变成了 Agent 代为执行、人类负责批准的状态时，职业身份的瓦解可能比工作效率的提升来得更快。这与 [Agentic Ai System Architecture Harness Skill Mcp](../ch05/084-harness-skill.html) 中讨论的"AI 影子采纳率"问题（77.55% 管理者无法分辨 AI 使用）形成微观-宏观对应：成瘾是个人层面的影子采纳，影子采纳是组织层面的成瘾。

## 实践启示

1. **所有任务都从 /ce-plan 开始，哪怕只是"写一个脚本"**：计划不是给人类看的文档，而是强迫 Agent 做深度研究的机制。直接索要交付物 → 偷工减料版本；先 plan 如何生成交付物 → 每次都是深度版本。这个原则与 [Skill Writing Patterns Best Practices](../ch04/267-skill.html) 中"做超过 2 次的事 → 做成技能"的精神一致：都是将重复行为升级为系统性工程。

2. **6 标签页并行是 Agent 时代的"多线程"**：设置 cmux 为 4-6 个标签页，分别运行 /ce-plan（研究）、/ce-work（构建）、/last30days（研究）、修 bug（调试）。用声音钩子区分完成信号（不同 tab 完成后播放不同声音）。这是分布式认知的物理实现，让人类同时"监控"多个 Agent 进程而不过载。

3. **语音输入将瓶颈从打字速度切换到判断力**：Mac 上用 Monologue/Wispr Flow + 鹅颈麦，语音转文字 + LLM 纠错。核心洞察：LLM 能填补转录错误——这意味着语音输入的质量下限由 LLM 的容错能力决定，而非麦克风质量。这个模式将人类的竞争优势锁定在"判断力"而非"执行速度"，这正是 Agent 时代最稀缺的资源。

4. **构建自己的技能库作为复利资产**：任何做超过 2 次的事 → 做成技能。[Skill Writing Patterns Best Practices](../ch04/267-skill.html) 是技能编写的最佳实践，Matt 的实践进一步说明：让 Agent 读优秀技能（如 CE 体系）模仿结构，是技能积累的正向飞轮。每一次技能封装都是可复用资产的下一次复利。

5. **警惕"整个人消失在构建过程中"**：Matt 的警告值得每个 Agent 时代工程师认真对待：Agent 本该替人类工作，但相反所有人都在比以往更努力地工作。破解方法：有意识地保留"非 AI 时间"——与人的真实连接、线下的身体感知、离开屏幕的判断力训练。Agent 是强大的，但判断力只有在持续使用中才能保持锐度。

---

