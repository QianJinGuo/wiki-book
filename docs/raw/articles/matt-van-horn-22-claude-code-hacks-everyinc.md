---
source_url: "https://mp.weixin.qq.com/s/-Ok39jmFZcXO_g0Bd1ROpA"
ingested: 2026-06-26
sha256: fdd9bcbe233e6f82
---

# Matt Van Horn 的 22 个 Claude Code 黑客技巧

> 来源：进化 AI 实验室（xiaojianke 翻译），2026-06-08
> 原文：Matt Van Horn 个人经验分享

Matt Van Horn 今年成为 Python、Go 等顶级开源项目的核心贡献者。**他说：不用 IDE，只需要 plan.md 文件和语音。**

## 核心哲学

- 传统开发：80% 编码，20% 计划。**完全反过来** —— 思考过程在计划中，执行是机械的
- 让 AI 写 plan.md，但**几乎从不读 plan.md** —— 强制生成计划是为了让智能体不偷懒
- 工作流：`/ce-plan` → `/ce-work` 循环，是 Compound Engineering 插件（EveryInc）提供的
- 人类 = 信号/品味/方向；智能体 = 执行/产量

## 22 个黑客技巧（核心摘要）

### 1. /ce-plan 永远第一步
任何想法（产品/bug/截图/报错/Slack 讨论）→ `/ce-plan` 生成结构化 plan.md
- 内置并行研究智能体（读代码库/查历史方案/查外部文档）
- 输出：问题诊断 + 解决方法 + 修改文件清单 + 验收标准复选框
- 模糊想法先用 `/ce-brainstorm`，清晰了再用 `/ce-plan`

### 2. 不要读 plan.md
扫一眼标题 → `/ce-work` 执行。会话内联提问：「TLDR?」「eli5 这个计划」「等等，为什么要用这个方法？」。**300 行 markdown 是智能体的作业，不是人类的。**

### 3. /ce-plan 不只用于代码
让第一个 plan 成为「关于计划的计划」 —— 战略文档、产品规格、竞品分析、董事会简报。
> 「直接索要交付物，它会偷工减料。让它先计划如何生成交付物，再执行该计划，每次都能做出深度版本。」

### 4. 彻底接受语音
语音对 LLM 不同于语音对其他任何东西 —— 转录不需要完美，LLM 能填补空白。
- Mac: Monologue / Wispr Flow + 鹅颈麦克风
- 手机: 苹果内置听写（避免切换应用的烦人）

### 5. cmux 4-6 个标签页
并行运行：1 个写计划 / 1 个构建 / 1 个跑 last30days / 1 个修 bug

### 6. 终端默认进入 Claude/Codex
新标签页直接打开 Claude Code，**不需要 cd**。当启动新会话只需按一次键时，会开启更多会话。

### 7. 远程控制 + 邮箱地址
- 每个窗口开远程控制 → Claude 移动应用访问
- AgentMail 给 Claude 一个邮箱地址 → 邮件触发新会话
- 白名单（DKIM/SPF 验证）= 闸门

### 8. 危险地跳过权限
```json
{
  "permissions": { "allow": ["WebSearch","WebFetch","Bash","Read","Write","Edit","Glob","Grep","Task","TodoWrite"], "deny": [], "defaultMode": "bypassPermissions" },
  "skipDangerousModePermissionPrompt": true
}
```
声音钩子（6 个会话时唯一能分辨哪个完成的方式）：`afplay /System/Library/Sounds/Blow.aiff`

### 9. Codex 负责构建，Claude 负责计划
三方式把工作交给 Codex 而不离开 Claude：
1. Codex IDE 扩展
2. `/ce-work --codex`（CE 循环内直接委托）
3. Printing Press Codex 模式（CLI 末尾加 `codex`）

**两个并排的 200 美元订阅 = 一整个辅助引擎**

### 10. 计划前先研究（/last30days）
`/last30days <topic>` 并行搜索 Reddit/X/YouTube/TikTok/Instagram/HN/Polymarket/GitHub/全网。开源，2.6 万+ 星。
> 例：选 Vercel agent-browser vs Playwright → 几分钟内：agent-browser 上下文少得多，Playwright 工具定义就耗数千 token

### 11. Granola + 原始转录稿
把完整原始转录稿（包括聊到寿司的闲话）扔给 `/ce-plan`，**不先做总结**。Granola 上下文 + 代码库 + 过往计划 = 真金白银。

### 12. 人类信号
**工作不是做具体的事，工作是成为那个信号。** 智能体提供产量，人类提供品味/方向/重定向循环。稀有且有价值的不是打字速度，是判断力。

### 13. HyperFrames 制作视频
视频 = HTML + script.md，智能体合成渲染成 MP4。无需剪辑软件/时间轴。一个视频成本 = 一次对话。

### 14. 笔记即知识库
将智能体指向整个大脑：
- Bear + Bear CLI（个人版 RAG）
- Obsidian（不推荐但插件生态深）
- gbrain（多机同步）
- supermemory（智能体记忆层）

### 15. 远程工作（Mac mini）
- Mosh（糟糕 WiFi 保持会话响应）
- Tmux（飞机上 SSH，断了 20 分钟重连不丢状态）
- Hermes + OpenClaw 两者同时跑
- Agent Cookie 同步 Mac mini 和主 Mac 的 cookie/.env

### 16. Proof 分享 plan
Proof 把 plan.md 渲染成人能读的文档 → 发链接 → 同事内联评论 → 评论回流到智能体循环。**解决 markdown 贴到 Slack 渲染成垃圾的问题。**

### 17. 编写自己的技能
任何做超过 2 次的事 → 做成技能。诀窍：让智能体读 Compound Engineering 这种优秀技能，模仿其结构。
- last30days（2.6 万星，从个人技能长成开源项目）
- Printing Press（3700+ 星，320+ PR）

### 18. 为热爱项目做贡献
- 选每天都用的工具 → 找缺失 → 用相同 `/ce-plan` + `/ce-work` 循环发布
- 真正宝贵的是人，不是合并的代码
- X 上订阅尊敬的人，提交 PR 时发推文，他会收到特殊通知

### 19. M5 Max 64GB + 永不休眠
```bash
sudo pmset -a disablesleep 1
```
电池最短 1 小时 → 随身带 Anker 充电宝 + 特斯拉里放充电器

### 20. Printing Press 真实世界 CLI
- 让智能体跑腿：车辆预热 / 超市下单 / 体育比赛轮询 / 给孩子订机票
- Agent Cookie 把真实浏览器会话交给 CLI → 智能体登录服务（无需粘贴密码/重新验证）
- 真正的黑客技巧：拿整天泡的 API → Printing Press 生成智能体原生 CLI

### 21. 诚实的部分
> 「智能体本该替人类做所有的工作。但相反，所有的朋友都在比以往任何时候更努力地工作。」

不是休息/接触自然的问题。**是成瘾**。陷阱不在于空荡的发布，而在于整个人消失在构建过程中，失去了身边的人。

### 22. 这篇文章是这样写出来的
在 cmux 里的 Claude Code，对着 Monologue 说话。Proof 审查。last30days 喂素材。没有 IDE。不敲代码。说话、计划、构建。

## 工具栈速查

| 类别 | 工具 |
|------|------|
| 计划/执行 | /ce-plan, /ce-work, /ce-brainstorm（Compound Engineering）|
| 终端多标签 | cmux（基于 Ghostty）|
| 语音 | Mac: Monologue/Wispr Flow + 鹅颈麦；手机: 苹果听写 |
| 研究 | /last30days（开源）|
| 会议 | Granola + Printing Press Granola CLI |
| 视频 | HyperFrames（script.md → MP4） |
| 审查 | Proof（plan.md → 人能读 + 评论回流）|
| 记忆 | Bear/Obsidian + gbrain/supermemory |
| 远程 | Mosh + Tmux + AgentMail + 远程控制 |
| 权限 | bypassPermissions + skipDangerousModePermissionPrompt + 声音钩子 |
| 真实 CLI | Printing Press + Agent Cookie |
| 备用引擎 | Codex（xhigh + 快速模式）|
