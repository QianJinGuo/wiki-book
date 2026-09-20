# Ch09 AI 编程与代码生成

> 最成熟的 Agent 品类：Claude Code、OpenClaw、Codex 深度拆解

> 本章收录 **107 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 9 |
| ⭐⭐ 工程师 | 需编程基础 | 11 |
| ⭐⭐⭐ 专家 | 需ML基础 | 36 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 34 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 17 |

---

## 导读

AI 编程是 Agent 最早成熟的品类，也是理解 Agent 工程的最佳窗口。

本章深度拆解三个标杆产品：Claude Code（Anthropic 的终端编程 Agent，2 万字源码分析）、OpenClaw（开源多 Agent 编程框架，32K 字完全指南）、以及 Codex（OpenAI 的云端编程 Agent，/goal 源码解析）。

你还会看到 Hooks 如何做安全门禁、Token 成本如何控制、以及从 Demo 到产线的 8 道关卡——这些都是从实战中提炼的血泪教训。

如果你想理解 Agent 工程，从 AI 编程开始是最好的切入点。

---



---

## 本章内容

### ⭐ 入门（9 篇）

- [001. AI Coding 的底层框架：一切优化都是在对抗熵增——信息论视角](ch09/001-ai-coding)
- [002. Claude Code 大型代码库最佳实践 — Anthropic 企业级部署指南](ch09/002-claude-code-anthropic)
- [003. 无障碍设计师 vibe coding：当所有同事都在用 AI 写代码时](ch09/003-vibe-coding-ai)
- [004. Harness Engineering - 让 Coding Agent 可靠完成长程任务](ch09/004-harness-engineering-coding-agent)
- [005. Prompt Caching 工程实践 — Anthropic Claude Code 经验总结](ch09/005-prompt-caching-anthropic-claude-code)
- [006. The Data Canary](ch09/006-the-data-canary)
- [007. CLAUDE.md 12 条规则：Karpathy 扩展模板](ch09/007-claude-md-12-karpathy)
- [008. Loop 的产品视角——项目中心从人挪到 Agent 系统](ch09/008-loop-agent)
- [009. 用 Kiro 构建行业专业软件：Spec vs Vibe Coding 的分层结论](ch09/009-kiro-spec-vs-vibe-coding)

### ⭐⭐ 工程师（11 篇）

- [010. Claude Code Loop Types — 官方四种循环模式分类法](ch09/010-claude-code-loop-types)
- [011. Claude Dispatch + 接口力量：AI 从 Chatbot 到 Agent Interface 的转变](ch09/011-claude-dispatch-ai-chatbot-agent-interface)
- [012. Notes Inside China AI Labs Lambert](ch09/012-notes-inside-china-ai-labs-lambert)
- [013. 7个月，234次提交，1690行代码：AI编程大型翻车现场：我决定全部作废，手动重写！](ch09/013-7-234-1690-ai)
- [014. Superpowers 深度解读（2）：Rule/Gate/Hook 与 Iron Law 方法论](ch09/014-superpowers-2-rule-gate-hook-iron-law)
- [015. 场景营销前端 AI Coding — AI Native 的视觉稿还原](ch09/015-ai-coding-ai-native)
- [016. 让 Kiro 和 Claude Code 响应 IM 消息：用 ACP Bridge 打造异步 AI 编程工作流 | 亚马逊AWS官方博客](ch09/016-kiro-claude-code-im-acp-bridge-ai-aws)
- [017. 2 小时，0 行手写代码，我用 Claude 做了一个生产级 VSCode 插件](ch09/017-2-0-claude-vscode)
- [018. Vibe Coding in Production — Erik Schluntz / Anthropic](ch09/018-vibe-coding-in-production-erik-schluntz-anthropic)
- [019. Introducing deepsec: The security harness for finding vulnerabilities in your codebase](ch09/019-introducing-deepsec-the-security-harness-for-finding-vulner)
- [020. Automate progressive rollouts with Vercel Flags - Vercel](ch09/020-automate-progressive-rollouts-with-vercel-flags-vercel)

### ⭐⭐⭐ 专家（36 篇）

- [021. 使用Claude Code：session管理与1M上下文](ch09/021-claude-code-session-1m)
- [022. Cheap code means formal verification is reasonable now — Antfly Blog](ch09/022-cheap-code-means-formal-verification-is-reasonable-now-ant)
- [023. It’s safe to close your laptop now: Hosting coding agents on Amazon Bedrock AgentCore](ch09/023-it-s-safe-to-close-your-laptop-now-hosting-coding-agents-on)
- [024. OpenAI models and Codex on Amazon Bedrock are now generally available](ch09/024-openai-models-and-codex-on-amazon-bedrock-are-now-generally)
- [025. DeepSeek V4 DS4C Antirez 本地推理实践](ch09/025-deepseek-v4-ds4c-antirez)
- [026. Coding Agent在百度的落地实践：从反馈闭环到工程范式重构](ch09/026-coding-agent)
- [027. Cat Wu: Anthropic Claude Code/Cowork 产品负责人访谈](ch09/027-cat-wu-anthropic-claude-code-cowork)
- [028. Claude Code 黑客松：技艺数字化六项目](ch09/028-claude-code)
- [029. The New Bottleneck: Theory of Constraints in the Age of AI Coding](ch09/029-the-new-bottleneck-theory-of-constraints-in-the-age-of-ai-c)
- [030. 1-Click GitHub Token Stealing via a VSCode Bug — ammaraskar 2026](ch09/030-1-click-github-token-stealing-via-a-vscode-bug-ammaraskar)
- [031. Open Code Review：阿里开源的 AI 代码评审 CLI 工具](ch09/031-open-code-review-ai-cli)
- [032. 天猫AI助手调度框架重构与AI Coding工程化](ch09/032-ai-ai-coding)
- [033. Hacker News 热帖：AI 会写代码了，为啥还要用 Python？](ch09/033-hacker-news-ai-python)
- [034. Claw Chain: Cyera Research Unveil Four Chainable Vulnerabilities in OpenClaw](ch09/034-claw-chain-cyera-research-unveil-four-chainable-vulnerabili)
- [035. Claude Code团队10个使用技巧（Boris二刷）](ch09/035-claude-code-10-boris)
- [036. Claude Code 官方插件系统 (claude-plugins-official)](ch09/036-claude-code-claude-plugins-official)
- [037. 从提需求到部署发布，全AI全自动化后，研发效能全面跃升](ch09/037-ai)
- [038. BlueCode 0 行手写代码重构 2 万行 Vue：约束体系驱动 AI 大规模重构](ch09/038-bluecode-0-2-vue-ai)
- [039. Claude Code 可控性：软规则无法变成硬约束](ch09/039-claude-code)
- [040. Claude Code 接入自建开源模型：企业私有化与降本实践 | 亚马逊AWS官方博客](ch09/040-claude-code-aws)
- [041. AI 原生开发工作流](ch09/041-ai)
- [042. 停止编码的那天，就是失去架构判断力的开始：一位 30 年架构师的 AI 生存指南](ch09/042-30-ai)
- [043. Device Code Phishing Forensics: What We Learned from BEC Investigations in the Wild](ch09/043-device-code-phishing-forensics-what-we-learned-from-bec-inv)
- [044. AI 编码效率分析方法论](ch09/044-ai)
- [045. Codex Discovered a Hidden HTTP/2 Bomb](ch09/045-codex-discovered-a-hidden-http-2-bomb)
- [046. Engineering roles shift from developing code to managing AI | CIO Dive](ch09/046-engineering-roles-shift-from-developing-code-to-managing-ai)
- [047. When I reject AI code even if it works](ch09/047-when-i-reject-ai-code-even-if-it-works)
- [048. 腾讯 AI 编码实践](ch09/048-ai)
- [049. Sakana Fugu 发布：Claude 禁令后的多 Agent 编排 API，LiveCodeBench 93.2](ch09/049-sakana-fugu-claude-agent-api-livecodebench-93-2)
- [050. AI can write code, but the CIOs still owns the operating model](ch09/050-ai-can-write-code-but-the-cios-still-owns-the-operating-mod)
- [051. How to Avoid AI Code Slop](ch09/051-how-to-avoid-ai-code-slop)
- [052. Skill Issues: Compromising Claude Code with malicious skills & agents — Part 1](ch09/052-skill-issues-compromising-claude-code-with-malicious-skills)
- [053. The text in Claude Code’s “Extended Thinking” output is not authentic. – blog](ch09/053-the-text-in-claude-code-s-extended-thinking-output-is-not)
- [054. 复制这套神仙配置，让Claude Code全自动修Bug！告别每天重复教AI写代码](ch09/054-claude-code-bug-ai)
- [055. Codex can now control other desktop devices via Computer Use](ch09/055-codex-can-now-control-other-desktop-devices-via-computer-use)
- [056. Dockerless: 免环境补丁验证器](ch09/056-dockerless)

### ⭐⭐⭐⭐ 科学家（34 篇）

- [057. 小米 MiMo Code — 长程编程 Agent 三大主线（计算/记忆/进化）+ 与 Claude Code 工程分化](ch09/057-mimo-code-agent-claude-code)
- [058. AI 驱动的跨云网络搭建：用 Claude Code 和 Kiro CLI 实现 AWS-腾讯云 IPSec VPN 双隧道互联 | 亚马逊AWS官方博客](ch09/058-ai-claude-code-kiro-cli-aws-ipsec-vpn-aws)
- [059. AI Coding Guide Tmall Deep Dive](ch09/059-ai-coding-guide-tmall-deep-dive)
- [060. How Claude Code works in large codebases: Best practices and where to start](ch09/060-how-claude-code-works-in-large-codebases-best-practices-and)
- [061. OpenAI Symphony：Linear 即 Codex Agent 控制平面](ch09/061-openai-symphony-linear-codex-agent)
- [062. AI 编程智能体的质量防线：5 个代码质量控制机制（反馈传感器 / 语义评估 / 重构边界 / 来源追溯 / 智能体攻击面清单）](ch09/062-ai-5)
- [063. Ethan Mollick: Claude Code and What Comes Next (Practitioner View)](ch09/063-ethan-mollick-claude-code-and-what-comes-next-practitioner)
- [064. Thought-Aligner：智能体行为安全新范式——可插拔思维校正层（ICML 2026）](ch09/064-thought-aligner-icml-2026)
- [065. CLAUDE.md 规则从 Karpathy 的 4 条增加到 12 条](ch09/065-claude-md-karpathy-4-12)
- [066. AutoResearch：多 Agent 自动化软件开发](ch09/066-autoresearch-agent)
- [067. HTTP/2 HPACK Bomb — Codex Discovered AI-Discovered DoS](ch09/067-http-2-hpack-bomb-codex-discovered-ai-discovered-dos)
- [068. gpt-54-烧完额度后我把七家国产-ai-公司-coding-plan-对比了一遍想不到最应该买的竟然是这家](ch09/068-gpt-54-ai-coding-plan)
- [069. Matt Van Horn 的 22 个 Claude Code 黑客技巧：让 AI 写 plan.md 但不读 plan.md](ch09/069-matt-van-horn-22-claude-code-ai-plan-md-plan-md)
- [070. Anthropic Coding Agent 社会科学家采用调查](ch09/070-anthropic-coding-agent)
- [071. Claude Code 18个隐藏设置](ch09/071-claude-code-18)
- [072. FastContext（微软开源 Coding Agent 仓库探索子代理）](ch09/072-fastcontext-coding-agent)
- [073. Claude Code 为什么会忽略指令：四类失效原因 + 五层规则框架](ch09/073-claude-code)
- [074. Chromium AI Coding 开发体系](ch09/074-chromium-ai-coding)
- [075. Code as Agent Harness 综述](ch09/075-code-as-agent-harness)
- [076. Claw-SWE-Bench：首个独立测量Harness对编程Agent影响的基准](ch09/076-claw-swe-bench-harness-agent)
- [077. Codex Goal Six Hour Run](ch09/077-codex-goal-six-hour-run)
- [078. Claude Code 七种自定义方法：官方全景指南](ch09/078-claude-code)
- [079. AI Coding Agent Token 成本控制五层模型](ch09/079-ai-coding-agent-token)
- [080. MiniMax M3 开源 Frontier 模型](ch09/080-minimax-m3-frontier)
- [081. Claude Code Routines：从工具到队友的主动 Agent 模式](ch09/081-claude-code-routines-agent)
- [082. OpenAI秘密矩阵曝光：Codex将所有设备连成超级电脑](ch09/082-openai-codex)
- [083. Spec-Driven AI 编程半年实战 — 有损管道、三工具比较与三大认知陷阱](ch09/083-spec-driven-ai)
- [084. Claude Code 集成其他工具指南](ch09/084-claude-code)
- [085. 老代码克星：36k Star的 AI 神器，跑一条命令就把项目结构整明白了！](ch09/085-36k-star-ai)
- [086. An Opinionated Guide to Using AI Right Now](ch09/086-an-opinionated-guide-to-using-ai-right-now)
- [087. Codex 5.21 更新：AI 编程助手开始变成电脑工作代理](ch09/087-codex-5-21-ai)
- [088. Claude Code Dynamic Workflows 实战模式与构建技巧](ch09/088-claude-code-dynamic-workflows)
- [089. 百度网盘主端 FE AICR：AI Code Review 准入实践](ch09/089-fe-aicr-ai-code-review)
- [090. Reward hacking is swamping model intelligence gains](ch09/090-reward-hacking-is-swamping-model-intelligence-gains)

### ⭐⭐⭐⭐⭐ 大师（17 篇）

- [091. DeepSeek Code Harness](ch09/091-deepseek-code-harness)
- [092. Anthropic 内部 95% 数据分析自动化：分析 Agent 技术栈 + Skill 框架（21%→95% 准确率）](ch09/092-anthropic-95-agent-skill-21-95)
- [093. 让 Coding Agent 从黑盒到透明：阿里云 Agent 观测审计数据采集实践（LoongSuite Pilot 端侧平台 + 3 类 Agent 形态 + 4 大观测审计能力）](ch09/093-coding-agent-agent-loongsuite-pilot-3-agent)
- [094. Claude Code 在大型代码库中的实战经验：从哪里入手？怎么做对？](ch09/094-claude-code)
- [095. 业务 Agent 增强层架构：复用通用 Agent 基座，把业务能力做成可验证增强层](ch09/095-agent-agent)
- [096. Claude Code 一周年回顾：Boris Cherny + Cat Wu 的完整时间线](ch09/096-claude-code-boris-cherny-cat-wu)
- [097. Gene/GEP — EvoMap×清华 提出的「策略基因」经验对象框架（arXiv 2604.15097）](ch09/097-gene-gep-evomap-arxiv-2604-15097)
- [098. Claude Code 从 Demo 到产线 · 企业 Harness 工程化的 8 道关卡（黄佳/咖哥 CSDN）](ch09/098-claude-code-demo-harness-8-csdn)
- [099. AgentMemory：Coding Agent 本地记忆系统](ch09/099-agentmemory-coding-agent)
- [100. 采用 AI 编码智能体的六条经验](ch09/100-ai)
- [101. 基于浏览器请求录制与AI代码生成的E2E接口自动化测试实践](ch09/101-ai-e2e)
- [102. 天猫新品营销技术团队AI编码实战指南（上）](ch09/102-ai)
- [103. Claude Code 性能基准评测](ch09/103-claude-code)
- [104. Claude Code Openclaw Usage Ettin](ch09/104-claude-code-openclaw-usage-ettin)
- [105. Claude Code Agent Teams 架构分析](ch09/105-claude-code-agent-teams)
- [106. Codex /goal 源码深度解析：状态表 + 续跑条件 + 预算账本](ch09/106-codex-goal)
- [107. Codex 五层架构：记忆/知识/护栏/委派/分发](ch09/107-codex)


---

## 本章收束

AI 编程是理解 Agent 工程的最佳窗口，因为代码有最强的验证器：编译器、测试、review。这一章的深度拆解反复指向同一件事——Coding Agent 的生产力差距不在模型，在质量门禁：谁先建好测试与回归防线，谁就敢让 Agent 跑得更快。这也是全书的工程哲学在编程场景的完整预演。

---
