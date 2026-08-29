# Ch09 AI 编程与代码生成

> 最成熟的 Agent 品类：Claude Code、OpenClaw、Codex 深度拆解

> 本章收录 **121 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 1 |
| ⭐⭐ 工程师 | 需编程基础 | 115 |
| ⭐⭐⭐ 专家 | 需ML基础 | 4 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 1 |

---

## 导读

AI 编程是 Agent 最早成熟的品类，也是理解 Agent 工程的最佳窗口。

本章深度拆解三个标杆产品：Claude Code（Anthropic 的终端编程 Agent，2 万字源码分析）、OpenClaw（开源多 Agent 编程框架，32K 字完全指南）、以及 Codex（OpenAI 的云端编程 Agent，/goal 源码解析）。

你还会看到 Hooks 如何做安全门禁、Token 成本如何控制、以及从 Demo 到产线的 8 道关卡——这些都是从实战中提炼的血泪教训。

如果你想理解 Agent 工程，从 AI 编程开始是最好的切入点。

---



---

## 本章内容

- [001. 场景营销前端 AI Coding — AI Native 的视觉稿还原](ch09/001-ai-coding-ai-native)
- [002. Anthropic 内部 95% 数据分析自动化：分析 Agent 技术栈 + Skill 框架（21%→95% 准确率）](ch09/002-anthropic-95-agent-skill-21-95)
- [003. DeepSeek Code Harness](ch09/003-deepseek-code-harness)
- [004. 让 Coding Agent 从黑盒到透明：阿里云 Agent 观测审计数据采集实践（LoongSuite Pilot 端侧平台 + 3 类 Agent 形态 + 4 大观测审计能力）](ch09/004-coding-agent-agent-loongsuite-pilot-3-agent)
- [005. Claude Code 在大型代码库中的实战经验：从哪里入手？怎么做对？](ch09/005-claude-code)
- [006. 小米 MiMo Code — 长程编程 Agent 三大主线（计算/记忆/进化）+ 与 Claude Code 工程分化](ch09/006-mimo-code-agent-claude-code)
- [007. 业务 Agent 增强层架构：复用通用 Agent 基座，把业务能力做成可验证增强层](ch09/007-agent-agent)
- [008. Claude Code 一周年回顾：Boris Cherny + Cat Wu 的完整时间线](ch09/008-claude-code-boris-cherny-cat-wu)
- [009. AI 驱动的跨云网络搭建：用 Claude Code 和 Kiro CLI 实现 AWS-腾讯云 IPSec VPN 双隧道互联 | 亚马逊AWS官方博客](ch09/009-ai-claude-code-kiro-cli-aws-ipsec-vpn-aws)
- [010. Gene/GEP — EvoMap×清华 提出的「策略基因」经验对象框架（arXiv 2604.15097）](ch09/010-gene-gep-evomap-arxiv-2604-15097)
- [011. How Claude Code works in large codebases: Best practices and where to start](ch09/011-how-claude-code-works-in-large-codebases-best-practices-and)
- [012. Claude Code 从 Demo 到产线 · 企业 Harness 工程化的 8 道关卡（黄佳/咖哥 CSDN）](ch09/012-claude-code-demo-harness-8-csdn)
- [013. OpenAI Symphony：Linear 即 Codex Agent 控制平面](ch09/013-openai-symphony-linear-codex-agent)
- [014. AI 编程智能体的质量防线：5 个代码质量控制机制（反馈传感器 / 语义评估 / 重构边界 / 来源追溯 / 智能体攻击面清单）](ch09/014-ai-5)
- [015. AgentMemory：Coding Agent 本地记忆系统](ch09/015-agentmemory-coding-agent)
- [016. 采用 AI 编码智能体的六条经验](ch09/016-ai)
- [017. Prompt Caching 工程实践 — Anthropic Claude Code 经验总结](ch09/017-prompt-caching-anthropic-claude-code)
- [018. 基于浏览器请求录制与AI代码生成的E2E接口自动化测试实践](ch09/018-ai-e2e)
- [019. Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](ch09/019-karpathy-vibe-coding-agentic-engineering)
- [020. Claude Code 一周年回顾：Boris Cherny + Cat Wu 对话](ch09/020-claude-code-boris-cherny-cat-wu)
- [021. 使用Claude Code：session管理与1M上下文](ch09/021-claude-code-session-1m)
- [022. 使用 Kiro AI IDE 开发 基于Amazon EMR 的Flink 智能监控系统实践 | 亚马逊AWS官方博客](ch09/022-kiro-ai-ide-amazon-emr-flink-aws)
- [023. Cheap code means formal verification is reasonable now — Antfly Blog](ch09/023-cheap-code-means-formal-verification-is-reasonable-now-ant)
- [024. Thought-Aligner：智能体行为安全新范式——可插拔思维校正层（ICML 2026）](ch09/024-thought-aligner-icml-2026)
- [025. Claude Code Openclaw Usage Ettin](ch09/025-claude-code-openclaw-usage-ettin)
- [026. 天猫新品营销技术团队AI编码实战指南（上）](ch09/026-ai)
- [027. It’s safe to close your laptop now: Hosting coding agents on Amazon Bedrock AgentCore](ch09/027-it-s-safe-to-close-your-laptop-now-hosting-coding-agents-on)
- [028. AutoResearch：多 Agent 自动化软件开发](ch09/028-autoresearch-agent)
- [029. Claude Code 性能基准评测](ch09/029-claude-code)
- [030. HTTP/2 HPACK Bomb — Codex Discovered AI-Discovered DoS](ch09/030-http-2-hpack-bomb-codex-discovered-ai-discovered-dos)
- [031. gpt-54-烧完额度后我把七家国产-ai-公司-coding-plan-对比了一遍想不到最应该买的竟然是这家](ch09/031-gpt-54-ai-coding-plan)
- [032. Matt Van Horn 的 22 个 Claude Code 黑客技巧：让 AI 写 plan.md 但不读 plan.md](ch09/032-matt-van-horn-22-claude-code-ai-plan-md-plan-md)
- [033. Anthropic Coding Agent 社会科学家采用调查](ch09/033-anthropic-coding-agent)
- [034. OpenAI models and Codex on Amazon Bedrock are now generally available](ch09/034-openai-models-and-codex-on-amazon-bedrock-are-now-generally)
- [035. Claude Code 18个隐藏设置](ch09/035-claude-code-18)
- [036. CLAUDE.md 12 条规则：Karpathy 扩展模板](ch09/036-claude-md-12-karpathy)
- [037. DeepSeek V4 DS4C Antirez 本地推理实践](ch09/037-deepseek-v4-ds4c-antirez)
- [038. Coding Agent在百度的落地实践：从反馈闭环到工程范式重构](ch09/038-coding-agent)
- [039. Codex /goal 源码深度解析：状态表 + 续跑条件 + 预算账本](ch09/039-codex-goal)
- [040. Cat Wu: Anthropic Claude Code/Cowork 产品负责人访谈](ch09/040-cat-wu-anthropic-claude-code-cowork)
- [041. 从Cursor返聘归来，90后华裔女高管带Claude开启日更模式](ch09/041-cursor-90-claude)
- [042. Claude Code 黑客松：技艺数字化六项目](ch09/042-claude-code)
- [043. Chromium AI Coding 开发体系](ch09/043-chromium-ai-coding)
- [044. Code as Agent Harness 综述](ch09/044-code-as-agent-harness)
- [045. 1-Click GitHub Token Stealing via a VSCode Bug — ammaraskar 2026](ch09/045-1-click-github-token-stealing-via-a-vscode-bug-ammaraskar)
- [046. Claw-SWE-Bench：首个独立测量Harness对编程Agent影响的基准](ch09/046-claw-swe-bench-harness-agent)
- [047. Codex Goal Six Hour Run](ch09/047-codex-goal-six-hour-run)
- [048. Open Code Review：阿里开源的 AI 代码评审 CLI 工具](ch09/048-open-code-review-ai-cli)
- [049. Claude Code 七种自定义方法：官方全景指南](ch09/049-claude-code)
- [050. 【图解】Claude Code 源码解析 ｜Prompt 提示词模块](ch09/050-claude-code-prompt)
- [051. 天猫AI助手调度框架重构与AI Coding工程化](ch09/051-ai-ai-coding)
- [052. MiniMax M3 开源 Frontier 模型](ch09/052-minimax-m3-frontier)
- [053. Claude Code Routines：从工具到队友的主动 Agent 模式](ch09/053-claude-code-routines-agent)
- [054. OpenAI秘密矩阵曝光：Codex将所有设备连成超级电脑](ch09/054-openai-codex)
- [055. 两万字详解Claude Code源码核心机制](ch09/055-claude-code)
- [056. Codex 五层架构：记忆/知识/护栏/委派/分发](ch09/056-codex)
- [057. Claude Code 集成其他工具指南](ch09/057-claude-code)
- [058. Claw Chain: Cyera Research Unveil Four Chainable Vulnerabilities in OpenClaw](ch09/058-claw-chain-cyera-research-unveil-four-chainable-vulnerabili)
- [059. Hacker News 热帖：AI 会写代码了，为啥还要用 Python？](ch09/059-hacker-news-ai-python)
- [060. 老代码克星：36k Star的 AI 神器，跑一条命令就把项目结构整明白了！](ch09/060-36k-star-ai)
- [061. Claude Code团队10个使用技巧（Boris二刷）](ch09/061-claude-code-10-boris)
- [062. Claude Code 官方插件系统 (claude-plugins-official)](ch09/062-claude-code-claude-plugins-official)
- [063. 从提需求到部署发布，全AI全自动化后，研发效能全面跃升](ch09/063-ai)
- [064. BlueCode 0 行手写代码重构 2 万行 Vue：约束体系驱动 AI 大规模重构](ch09/064-bluecode-0-2-vue-ai)
- [065. An Opinionated Guide to Using AI Right Now](ch09/065-an-opinionated-guide-to-using-ai-right-now)
- [066. Claude Code Loop Types — 官方四种循环模式分类法](ch09/066-claude-code-loop-types)
- [067. Claude Code 可控性：软规则无法变成硬约束](ch09/067-claude-code)
- [068. Codex 5.21 更新：AI 编程助手开始变成电脑工作代理](ch09/068-codex-5-21-ai)
- [069. Claude Code Dynamic Workflows 实战模式与构建技巧](ch09/069-claude-code-dynamic-workflows)
- [070. Claude Code 接入自建开源模型：企业私有化与降本实践 | 亚马逊AWS官方博客](ch09/070-claude-code-aws)
- [071. 百度网盘主端 FE AICR：AI Code Review 准入实践](ch09/071-fe-aicr-ai-code-review)
- [072. 停止编码的那天，就是失去架构判断力的开始：一位 30 年架构师的 AI 生存指南](ch09/072-30-ai)
- [073. Codex Discovered a Hidden HTTP/2 Bomb](ch09/073-codex-discovered-a-hidden-http-2-bomb)
- [074. Engineering roles shift from developing code to managing AI | CIO Dive](ch09/074-engineering-roles-shift-from-developing-code-to-managing-ai)
- [075. Harness Engineering - 让 Coding Agent 可靠完成长程任务](ch09/075-harness-engineering-coding-agent)
- [076. Claude Dispatch + 接口力量：AI 从 Chatbot 到 Agent Interface 的转变](ch09/076-claude-dispatch-ai-chatbot-agent-interface)
- [077. When I reject AI code even if it works](ch09/077-when-i-reject-ai-code-even-if-it-works)
- [078. Notes Inside China AI Labs Lambert](ch09/078-notes-inside-china-ai-labs-lambert)
- [079. Reward hacking is swamping model intelligence gains](ch09/079-reward-hacking-is-swamping-model-intelligence-gains)
- [080. Sakana Fugu 发布：Claude 禁令后的多 Agent 编排 API，LiveCodeBench 93.2](ch09/080-sakana-fugu-claude-agent-api-livecodebench-93-2)
- [081. 天猫新品营销技术团队 AI 编码实战指南](ch09/081-ai)
- [082. 7个月，234次提交，1690行代码：AI编程大型翻车现场：我决定全部作废，手动重写！](ch09/082-7-234-1690-ai)
- [083. AI can write code, but the CIOs still owns the operating model](ch09/083-ai-can-write-code-but-the-cios-still-owns-the-operating-mod)
- [084. How to Avoid AI Code Slop](ch09/084-how-to-avoid-ai-code-slop)
- [085. Skill Issues: Compromising Claude Code with malicious skills & agents — Part 1](ch09/085-skill-issues-compromising-claude-code-with-malicious-skills)
- [086. Superpowers 深度解读（2）：Rule/Gate/Hook 与 Iron Law 方法论](ch09/086-superpowers-2-rule-gate-hook-iron-law)
- [087. Development environments for your cloud agents](ch09/087-development-environments-for-your-cloud-agents)
- [088. The text in Claude Code’s “Extended Thinking” output is not authentic. – blog](ch09/088-the-text-in-claude-code-s-extended-thinking-output-is-not)
- [089. AI Coding 的底层框架：一切优化都是在对抗熵增——信息论视角](ch09/089-ai-coding)
- [090. Hermes Agent自我进化机制与OpenClaw对比](ch09/090-hermes-agent-openclaw)
- [091. 复制这套神仙配置，让Claude Code全自动修Bug！告别每天重复教AI写代码](ch09/091-claude-code-bug-ai)
- [092. Claude Code 命令使用指南](ch09/092-claude-code)
- [093. 2 小时，0 行手写代码，我用 Claude 做了一个生产级 VSCode 插件](ch09/093-2-0-claude-vscode)
- [094. 让 Kiro 和 Claude Code 响应 IM 消息：用 ACP Bridge 打造异步 AI 编程工作流 | 亚马逊AWS官方博客](ch09/094-kiro-claude-code-im-acp-bridge-ai-aws)
- [095. Linn Fritz looks at the lighter side of life](ch09/095-linn-fritz-looks-at-the-lighter-side-of-life)
- [096. Vibe Coding in Production — Erik Schluntz / Anthropic](ch09/096-vibe-coding-in-production-erik-schluntz-anthropic)
- [097. Codex can now control other desktop devices via Computer Use](ch09/097-codex-can-now-control-other-desktop-devices-via-computer-use)
- [098. 无障碍设计师 vibe coding：当所有同事都在用 AI 写代码时](ch09/098-vibe-coding-ai)
- [099. Claude Code 为什么会忽略指令：四类失效原因 + 五层规则框架](ch09/099-claude-code)
- [100. Tether launches developer grants program for local AI payments](ch09/100-tether-launches-developer-grants-program-for-local-ai-paymen)
- [101. The Data Canary](ch09/101-the-data-canary)
- [102. The New Bottleneck: Theory of Constraints in the Age of AI Coding](ch09/102-the-new-bottleneck-theory-of-constraints-in-the-age-of-ai-c)
- [103. 从需求到原型：50 个设计师与产品经理的 AI 智能体技能](ch09/103-50-ai)
- [104. Loop 的产品视角——项目中心从人挪到 Agent 系统](ch09/104-loop-agent)
- [105. 打造 Claude Code 可持续推进的工作流：Loop Engineering 完整上手攻略](ch09/105-claude-code-loop-engineering)
- [106. Spec-Driven AI 编程半年实战 — 有损管道、三工具比较与三大认知陷阱](ch09/106-spec-driven-ai)
- [107. 天猫新品营销技术团队AI编码实战指南（上）](ch09/107-ai)
- [108. Automate progressive rollouts with Vercel Flags - Vercel](ch09/108-automate-progressive-rollouts-with-vercel-flags-vercel)
- [109. 用 Kiro 构建行业专业软件：Spec vs Vibe Coding 的分层结论](ch09/109-kiro-spec-vs-vibe-coding)
- [110. 天猫新品团队AI编码实战指南（下）](ch09/110-ai)
- [111. How Baz improved its AI Agent Code Review accuracy using Amazon Bedrock AgentCore](ch09/111-how-baz-improved-its-ai-agent-code-review-accuracy-using-ama)
- [112. AI 写前端 ≠ 设计 —— Anomaly 创始人对 Vibe Coding 哲学批判](ch09/112-ai-anomaly-vibe-coding)
- [113. Unlocking AI flexibility in Europe: A guide to cross-region inference for EU data processing and model access](ch09/113-unlocking-ai-flexibility-in-europe-a-guide-to-cross-region)
- [114. Dynamically Splitting Wide Partitions in Cassandra for Time Series Workloads](ch09/114-dynamically-splitting-wide-partitions-in-cassandra-for-time)
- [115. OpenAI大神教你如何榨干Codex](ch09/115-openai-codex)
- [116. Device Code Phishing Forensics: What We Learned from BEC Investigations in the Wild](ch09/116-device-code-phishing-forensics-what-we-learned-from-bec-inv)
- [117. FastContext（微软开源 Coding Agent 仓库探索子代理）](ch09/117-fastcontext-coding-agent)
- [118. DeepSeek Visual Primitives：视觉原语作为思考媒介](ch09/118-deepseek-visual-primitives)
- [119. AI Coding Agent Token 成本控制五层模型](ch09/119-ai-coding-agent-token)
- [120. Dockerless: 免环境补丁验证器](ch09/120-dockerless)
- [121. GLM-5 Scaling Pain 推理复盘](ch09/121-glm-5-scaling-pain)
