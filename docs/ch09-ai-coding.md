# Ch09 AI 编程与代码生成

> 最成熟的 Agent 品类：Claude Code、OpenClaw、Codex 深度拆解

> 本章收录 **110 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 12 |
| ⭐⭐ 工程师 | 需编程基础 | 14 |
| ⭐⭐⭐ 专家 | 需ML基础 | 35 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 33 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 16 |

---

## 导读

AI 编程是 Agent 最早成熟的品类，也是理解 Agent 工程的最佳窗口。

本章深度拆解三个标杆产品：Claude Code（Anthropic 的终端编程 Agent，2 万字源码分析）、OpenClaw（开源多 Agent 编程框架，32K 字完全指南）、以及 Codex（OpenAI 的云端编程 Agent，/goal 源码解析）。

你还会看到 Hooks 如何做安全门禁、Token 成本如何控制、以及从 Demo 到产线的 8 道关卡——这些都是从实战中提炼的血泪教训。

如果你想理解 Agent 工程，从 AI 编程开始是最好的切入点。

---

---

## 本章内容

- [001. AI Coding 的底层框架：一切优化都是在对抗熵增——信息论视角](ch09/001-ai-coding)
- [002. Claude Code 大型代码库最佳实践 — Anthropic 企业级部署指南](ch09/002-claude-code-anthropic)
- [003. 无障碍设计师 vibe coding：当所有同事都在用 AI 写代码时](ch09/003-vibe-coding-ai)
- [004. Prompt Caching 工程实践 — Anthropic Claude Code 经验总结](ch09/004-prompt-caching-anthropic-claude-code)
- [005. The Data Canary](ch09/005-the-data-canary)
- [006. Harness Engineering - 让 Coding Agent 可靠完成长程任务](ch09/006-harness-engineering-coding-agent)
- [007. The New Bottleneck: Theory of Constraints in the Age of AI Coding](ch09/007-the-new-bottleneck-theory-of-constraints-in-the-age-of-ai-c)
- [008. CLAUDE.md 12 条规则：Karpathy 扩展模板](ch09/008-claude-md-12-karpathy)
- [009. Loop 的产品视角——项目中心从人挪到 Agent 系统](ch09/009-loop-agent)
- [010. 用 Kiro 构建行业专业软件：Spec vs Vibe Coding 的分层结论](ch09/010-kiro-spec-vs-vibe-coding)
- [011. Dynamically Splitting Wide Partitions in Cassandra for Time Series Workloads](ch09/011-dynamically-splitting-wide-partitions-in-cassandra-for-time)
- [012. Device Code Phishing Forensics: What We Learned from BEC Investigations in the Wild](ch09/012-device-code-phishing-forensics-what-we-learned-from-bec-inv)
- [013. Claude Code Loop Types — 官方四种循环模式分类法](ch09/013-claude-code-loop-types)
- [014. Claude Dispatch + 接口力量：AI 从 Chatbot 到 Agent Interface 的转变](ch09/014-claude-dispatch-ai-chatbot-agent-interface)
- [015. Peter Steinberger / OpenClaw — 100个AI程序员案例](ch09/015-peter-steinberger-openclaw-100-ai)
- [016. Notes Inside China AI Labs Lambert](ch09/016-notes-inside-china-ai-labs-lambert)
- [017. 7个月，234次提交，1690行代码：AI编程大型翻车现场：我决定全部作废，手动重写！](ch09/017-7-234-1690-ai)
- [018. Superpowers 深度解读（2）：Rule/Gate/Hook 与 Iron Law 方法论](ch09/018-superpowers-2-rule-gate-hook-iron-law)
- [019. 场景营销前端 AI Coding — AI Native 的视觉稿还原](ch09/019-ai-coding-ai-native)
- [020. 让 Kiro 和 Claude Code 响应 IM 消息：用 ACP Bridge 打造异步 AI 编程工作流 | 亚马逊AWS官方博客](ch09/020-kiro-claude-code-im-acp-bridge-ai-aws)
- [021. 2 小时，0 行手写代码，我用 Claude 做了一个生产级 VSCode 插件](ch09/021-2-0-claude-vscode)
- [022. Vibe Coding in Production — Erik Schluntz / Anthropic](ch09/022-vibe-coding-in-production-erik-schluntz-anthropic)
- [023. Claude Code 为什么会忽略指令：四类失效原因 + 五层规则框架](ch09/023-claude-code)
- [024. Introducing deepsec: The security harness for finding vulnerabilities in your codebase](ch09/024-introducing-deepsec-the-security-harness-for-finding-vulner)
- [025. Spec-Driven AI 编程半年实战 — 有损管道、三工具比较与三大认知陷阱](ch09/025-spec-driven-ai)
- [026. Automate progressive rollouts with Vercel Flags - Vercel](ch09/026-automate-progressive-rollouts-with-vercel-flags-vercel)
- [027. 使用Claude Code：session管理与1M上下文](ch09/027-claude-code-session-1m)
- [028. Cheap code means formal verification is reasonable now — Antfly Blog](ch09/028-cheap-code-means-formal-verification-is-reasonable-now-ant)
- [029. It’s safe to close your laptop now: Hosting coding agents on Amazon Bedrock AgentCore](ch09/029-it-s-safe-to-close-your-laptop-now-hosting-coding-agents-on)
- [030. OpenAI models and Codex on Amazon Bedrock are now generally available](ch09/030-openai-models-and-codex-on-amazon-bedrock-are-now-generally)
- [031. DeepSeek V4 DS4C Antirez 本地推理实践](ch09/031-deepseek-v4-ds4c-antirez)
- [032. Coding Agent在百度的落地实践：从反馈闭环到工程范式重构](ch09/032-coding-agent)
- [033. Cat Wu: Anthropic Claude Code/Cowork 产品负责人访谈](ch09/033-cat-wu-anthropic-claude-code-cowork)
- [034. Claude Code 黑客松：技艺数字化六项目](ch09/034-claude-code)
- [035. 1-Click GitHub Token Stealing via a VSCode Bug — ammaraskar 2026](ch09/035-1-click-github-token-stealing-via-a-vscode-bug-ammaraskar)
- [036. Open Code Review：阿里开源的 AI 代码评审 CLI 工具](ch09/036-open-code-review-ai-cli)
- [037. 天猫AI助手调度框架重构与AI Coding工程化](ch09/037-ai-ai-coding)
- [038. 两万字详解Claude Code源码核心机制](ch09/038-claude-code)
- [039. Hacker News 热帖：AI 会写代码了，为啥还要用 Python？](ch09/039-hacker-news-ai-python)
- [040. Claw Chain: Cyera Research Unveil Four Chainable Vulnerabilities in OpenClaw](ch09/040-claw-chain-cyera-research-unveil-four-chainable-vulnerabili)
- [041. Claude Code团队10个使用技巧（Boris二刷）](ch09/041-claude-code-10-boris)
- [042. Claude Code 官方插件系统 (claude-plugins-official)](ch09/042-claude-code-claude-plugins-official)
- [043. 从提需求到部署发布，全AI全自动化后，研发效能全面跃升](ch09/043-ai)
- [044. BlueCode 0 行手写代码重构 2 万行 Vue：约束体系驱动 AI 大规模重构](ch09/044-bluecode-0-2-vue-ai)
- [045. Claude Code 可控性：软规则无法变成硬约束](ch09/045-claude-code)
- [046. Claude Code 接入自建开源模型：企业私有化与降本实践 | 亚马逊AWS官方博客](ch09/046-claude-code-aws)
- [047. AI 原生开发工作流](ch09/047-ai)
- [048. 停止编码的那天，就是失去架构判断力的开始：一位 30 年架构师的 AI 生存指南](ch09/048-30-ai)
- [049. AI 编码效率分析方法论](ch09/049-ai)
- [050. Codex Discovered a Hidden HTTP/2 Bomb](ch09/050-codex-discovered-a-hidden-http-2-bomb)
- [051. Engineering roles shift from developing code to managing AI | CIO Dive](ch09/051-engineering-roles-shift-from-developing-code-to-managing-ai)
- [052. When I reject AI code even if it works](ch09/052-when-i-reject-ai-code-even-if-it-works)
- [053. 腾讯 AI 编码实践](ch09/053-ai)
- [054. Sakana Fugu 发布：Claude 禁令后的多 Agent 编排 API，LiveCodeBench 93.2](ch09/054-sakana-fugu-claude-agent-api-livecodebench-93-2)
- [055. AI can write code, but the CIOs still owns the operating model](ch09/055-ai-can-write-code-but-the-cios-still-owns-the-operating-mod)
- [056. How to Avoid AI Code Slop](ch09/056-how-to-avoid-ai-code-slop)
- [057. Skill Issues: Compromising Claude Code with malicious skills & agents — Part 1](ch09/057-skill-issues-compromising-claude-code-with-malicious-skills)
- [058. The text in Claude Code’s “Extended Thinking” output is not authentic. – blog](ch09/058-the-text-in-claude-code-s-extended-thinking-output-is-not)
- [059. 复制这套神仙配置，让Claude Code全自动修Bug！告别每天重复教AI写代码](ch09/059-claude-code-bug-ai)
- [060. Codex can now control other desktop devices via Computer Use](ch09/060-codex-can-now-control-other-desktop-devices-via-computer-use)
- [061. Dockerless: 免环境补丁验证器](ch09/061-dockerless)
- [062. DeepSeek Code Harness](ch09/062-deepseek-code-harness)
- [063. 小米 MiMo Code — 长程编程 Agent 三大主线（计算/记忆/进化）+ 与 Claude Code 工程分化](ch09/063-mimo-code-agent-claude-code)
- [064. AI 驱动的跨云网络搭建：用 Claude Code 和 Kiro CLI 实现 AWS-腾讯云 IPSec VPN 双隧道互联 | 亚马逊AWS官方博客](ch09/064-ai-claude-code-kiro-cli-aws-ipsec-vpn-aws)
- [065. AI Coding Guide Tmall Deep Dive](ch09/065-ai-coding-guide-tmall-deep-dive)
- [066. How Claude Code works in large codebases: Best practices and where to start](ch09/066-how-claude-code-works-in-large-codebases-best-practices-and)
- [067. OpenAI Symphony：Linear 即 Codex Agent 控制平面](ch09/067-openai-symphony-linear-codex-agent)
- [068. AI 编程智能体的质量防线：5 个代码质量控制机制（反馈传感器 / 语义评估 / 重构边界 / 来源追溯 / 智能体攻击面清单）](ch09/068-ai-5)
- [069. Ethan Mollick: Claude Code and What Comes Next (Practitioner View)](ch09/069-ethan-mollick-claude-code-and-what-comes-next-practitioner)
- [070. Thought-Aligner：智能体行为安全新范式——可插拔思维校正层（ICML 2026）](ch09/070-thought-aligner-icml-2026)
- [071. CLAUDE.md 规则从 Karpathy 的 4 条增加到 12 条](ch09/071-claude-md-karpathy-4-12)
- [072. AutoResearch：多 Agent 自动化软件开发](ch09/072-autoresearch-agent)
- [073. HTTP/2 HPACK Bomb — Codex Discovered AI-Discovered DoS](ch09/073-http-2-hpack-bomb-codex-discovered-ai-discovered-dos)
- [074. gpt-54-烧完额度后我把七家国产-ai-公司-coding-plan-对比了一遍想不到最应该买的竟然是这家](ch09/074-gpt-54-ai-coding-plan)
- [075. Matt Van Horn 的 22 个 Claude Code 黑客技巧：让 AI 写 plan.md 但不读 plan.md](ch09/075-matt-van-horn-22-claude-code-ai-plan-md-plan-md)
- [076. Anthropic Coding Agent 社会科学家采用调查](ch09/076-anthropic-coding-agent)
- [077. Claude Code 18个隐藏设置](ch09/077-claude-code-18)
- [078. FastContext（微软开源 Coding Agent 仓库探索子代理）](ch09/078-fastcontext-coding-agent)
- [079. Chromium AI Coding 开发体系](ch09/079-chromium-ai-coding)
- [080. Code as Agent Harness 综述](ch09/080-code-as-agent-harness)
- [081. Claw-SWE-Bench：首个独立测量Harness对编程Agent影响的基准](ch09/081-claw-swe-bench-harness-agent)
- [082. Codex Goal Six Hour Run](ch09/082-codex-goal-six-hour-run)
- [083. Claude Code 七种自定义方法：官方全景指南](ch09/083-claude-code)
- [084. AI Coding Agent Token 成本控制五层模型](ch09/084-ai-coding-agent-token)
- [085. MiniMax M3 开源 Frontier 模型](ch09/085-minimax-m3-frontier)
- [086. Claude Code Routines：从工具到队友的主动 Agent 模式](ch09/086-claude-code-routines-agent)
- [087. OpenAI秘密矩阵曝光：Codex将所有设备连成超级电脑](ch09/087-openai-codex)
- [088. Claude Code 集成其他工具指南](ch09/088-claude-code)
- [089. 老代码克星：36k Star的 AI 神器，跑一条命令就把项目结构整明白了！](ch09/089-36k-star-ai)
- [090. An Opinionated Guide to Using AI Right Now](ch09/090-an-opinionated-guide-to-using-ai-right-now)
- [091. Codex 5.21 更新：AI 编程助手开始变成电脑工作代理](ch09/091-codex-5-21-ai)
- [092. Claude Code Dynamic Workflows 实战模式与构建技巧](ch09/092-claude-code-dynamic-workflows)
- [093. 百度网盘主端 FE AICR：AI Code Review 准入实践](ch09/093-fe-aicr-ai-code-review)
- [094. Reward hacking is swamping model intelligence gains](ch09/094-reward-hacking-is-swamping-model-intelligence-gains)
- [095. Anthropic 内部 95% 数据分析自动化：分析 Agent 技术栈 + Skill 框架（21%→95% 准确率）](ch09/095-anthropic-95-agent-skill-21-95)
- [096. 让 Coding Agent 从黑盒到透明：阿里云 Agent 观测审计数据采集实践（LoongSuite Pilot 端侧平台 + 3 类 Agent 形态 + 4 大观测审计能力）](ch09/096-coding-agent-agent-loongsuite-pilot-3-agent)
- [097. Claude Code 在大型代码库中的实战经验：从哪里入手？怎么做对？](ch09/097-claude-code)
- [098. 业务 Agent 增强层架构：复用通用 Agent 基座，把业务能力做成可验证增强层](ch09/098-agent-agent)
- [099. Claude Code 一周年回顾：Boris Cherny + Cat Wu 的完整时间线](ch09/099-claude-code-boris-cherny-cat-wu)
- [100. Gene/GEP — EvoMap×清华 提出的「策略基因」经验对象框架（arXiv 2604.15097）](ch09/100-gene-gep-evomap-arxiv-2604-15097)
- [101. Claude Code 从 Demo 到产线 · 企业 Harness 工程化的 8 道关卡（黄佳/咖哥 CSDN）](ch09/101-claude-code-demo-harness-8-csdn)
- [102. AgentMemory：Coding Agent 本地记忆系统](ch09/102-agentmemory-coding-agent)
- [103. 采用 AI 编码智能体的六条经验](ch09/103-ai)
- [104. 基于浏览器请求录制与AI代码生成的E2E接口自动化测试实践](ch09/104-ai-e2e)
- [105. 天猫新品营销技术团队AI编码实战指南（上）](ch09/105-ai)
- [106. Claude Code 性能基准评测](ch09/106-claude-code)
- [107. Claude Code Openclaw Usage Ettin](ch09/107-claude-code-openclaw-usage-ettin)
- [108. Claude Code Agent Teams 架构分析](ch09/108-claude-code-agent-teams)
- [109. Codex /goal 源码深度解析：状态表 + 续跑条件 + 预算账本](ch09/109-codex-goal)
- [110. Codex 五层架构：记忆/知识/护栏/委派/分发](ch09/110-codex)
