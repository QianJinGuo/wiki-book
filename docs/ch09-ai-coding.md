# Ch09 AI 编程与代码生成

> 最成熟的 Agent 品类：Claude Code、OpenClaw、Codex 深度拆解

> 本章收录 **126 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 3 |
| ⭐⭐ 工程师 | 需编程基础 | 119 |
| ⭐⭐⭐ 专家 | 需ML基础 | 3 |
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

- [001. Claude Code Agent View](ch09/001-claude-code-agent-view.md)
- [002. Claude Code 个人学习系统：从答案机到学习工作台的 5 步法](ch09/002-claude-code-5.md)
- [003. Hardwood 1.0: A Fast, Lightweight Apache Parquet Reader for the JVM](ch09/003-hardwood-1-0-a-fast-lightweight-apache-parquet-reader-for.md)
- [004. Anthropic 内部 95% 数据分析自动化：分析 Agent 技术栈 + Skill 框架（21%→95% 准确率）](ch09/004-anthropic-95-agent-skill-21-95.md)
- [005. AI Coding 入门指南 - 如何更好地让AI真正帮你干活](ch09/005-ai-coding-ai.md)
- [006. 让 Coding Agent 从黑盒到透明：阿里云 Agent 观测审计数据采集实践（LoongSuite Pilot 端侧平台 + 3 类 Agent 形态 + 4 大观测审计能力）](ch09/006-coding-agent-agent-loongsuite-pilot-3-agent.md)
- [007. Claude Code 在大型代码库中的实战经验：从哪里入手？怎么做对？](ch09/007-claude-code.md)
- [008. 小米 MiMo Code — 长程编程 Agent 三大主线（计算/记忆/进化）+ 与 Claude Code 工程分化](ch09/008-mimo-code-agent-claude-code.md)
- [009. 业务 Agent 增强层架构：复用通用 Agent 基座，把业务能力做成可验证增强层](ch09/009-agent-agent.md)
- [010. AI 驱动的跨云网络搭建：用 Claude Code 和 Kiro CLI 实现 AWS-腾讯云 IPSec VPN 双隧道互联 | 亚马逊AWS官方博客](ch09/010-ai-claude-code-kiro-cli-aws-ipsec-vpn-aws.md)
- [011. Claude Code 一周年回顾：Boris Cherny + Cat Wu 的完整时间线](ch09/011-claude-code-boris-cherny-cat-wu.md)
- [012. Gene/GEP — EvoMap×清华 提出的「策略基因」经验对象框架（arXiv 2604.15097）](ch09/012-gene-gep-evomap-arxiv-2604-15097.md)
- [013. AI Coding Guide Tmall Deep Dive](ch09/013-ai-coding-guide-tmall-deep-dive.md)
- [014. How Claude Code works in large codebases: Best practices and where to start](ch09/014-how-claude-code-works-in-large-codebases-best-practices-and.md)
- [015. Claude Code 从 Demo 到产线 · 企业 Harness 工程化的 8 道关卡（黄佳/咖哥 CSDN）](ch09/015-claude-code-demo-harness-8-csdn.md)
- [016. OpenAI Symphony：Linear 即 Codex Agent 控制平面](ch09/016-openai-symphony-linear-codex-agent.md)
- [017. AI 编程智能体的质量防线：5 个代码质量控制机制（反馈传感器 / 语义评估 / 重构边界 / 来源追溯 / 智能体攻击面清单）](ch09/017-ai-5.md)
- [018. Ethan Mollick: Claude Code and What Comes Next (Practitioner View)](ch09/018-ethan-mollick-claude-code-and-what-comes-next-practitioner.md)
- [019. 采用 AI 编码智能体的六条经验](ch09/019-ai.md)
- [020. Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](ch09/020-karpathy-vibe-coding-agentic-engineering.md)
- [021. 基于浏览器请求录制与AI代码生成的E2E接口自动化测试实践](ch09/021-ai-e2e.md)
- [022. Claude Code 一周年回顾：Boris Cherny + Cat Wu 对话](ch09/022-claude-code-boris-cherny-cat-wu.md)
- [023. Prompt Caching 工程实践 — Anthropic Claude Code 经验总结](ch09/023-prompt-caching-anthropic-claude-code.md)
- [024. 使用 Kiro AI IDE 开发 基于Amazon EMR 的Flink 智能监控系统实践 | 亚马逊AWS官方博客](ch09/024-kiro-ai-ide-amazon-emr-flink-aws.md)
- [025. 使用Claude Code：session管理与1M上下文](ch09/025-claude-code-session-1m.md)
- [026. Cheap code means formal verification is reasonable now — Antfly Blog](ch09/026-cheap-code-means-formal-verification-is-reasonable-now-ant.md)
- [027. Thought-Aligner：智能体行为安全新范式——可插拔思维校正层（ICML 2026）](ch09/027-thought-aligner-icml-2026.md)
- [028. It’s safe to close your laptop now: Hosting coding agents on Amazon Bedrock AgentCore](ch09/028-it-s-safe-to-close-your-laptop-now-hosting-coding-agents-on.md)
- [029. Claude Code Openclaw Usage Ettin](ch09/029-claude-code-openclaw-usage-ettin.md)
- [030. 天猫新品营销技术团队AI编码实战指南（上）](ch09/030-ai.md)
- [031. AutoResearch：多 Agent 自动化软件开发](ch09/031-autoresearch-agent.md)
- [032. Claude Code 性能基准评测](ch09/032-claude-code.md)
- [033. HTTP/2 HPACK Bomb — Codex Discovered AI-Discovered DoS](ch09/033-http-2-hpack-bomb-codex-discovered-ai-discovered-dos.md)
- [034. gpt-54-烧完额度后我把七家国产-ai-公司-coding-plan-对比了一遍想不到最应该买的竟然是这家](ch09/034-gpt-54-ai-coding-plan.md)
- [035. AgentMemory：Coding Agent 本地记忆系统](ch09/035-agentmemory-coding-agent.md)
- [036. Matt Van Horn 的 22 个 Claude Code 黑客技巧：让 AI 写 plan.md 但不读 plan.md](ch09/036-matt-van-horn-22-claude-code-ai-plan-md-plan-md.md)
- [037. CLAUDE.md 规则从 Karpathy 的 4 条增加到 12 条](ch09/037-claude-md-karpathy-4-12.md)
- [038. Anthropic Coding Agent 社会科学家采用调查](ch09/038-anthropic-coding-agent.md)
- [039. Claude Code 18个隐藏设置](ch09/039-claude-code-18.md)
- [040. CLAUDE.md 12 条规则：Karpathy 扩展模板](ch09/040-claude-md-12-karpathy.md)
- [041. DeepSeek V4 DS4C Antirez 本地推理实践](ch09/041-deepseek-v4-ds4c-antirez.md)
- [042. Codex /goal 源码深度解析：状态表 + 续跑条件 + 预算账本](ch09/042-codex-goal.md)
- [043. Coding Agent在百度的落地实践：从反馈闭环到工程范式重构](ch09/043-coding-agent.md)
- [044. Cat Wu: Anthropic Claude Code/Cowork 产品负责人访谈](ch09/044-cat-wu-anthropic-claude-code-cowork.md)
- [045. 从Cursor返聘归来，90后华裔女高管带Claude开启日更模式](ch09/045-cursor-90-claude.md)
- [046. Claude Code 黑客松：技艺数字化六项目](ch09/046-claude-code.md)
- [047. Code as Agent Harness 综述](ch09/047-code-as-agent-harness.md)
- [048. Claude Code Agent Teams 架构分析](ch09/048-claude-code-agent-teams.md)
- [049. OpenAI models and Codex on Amazon Bedrock are now generally available](ch09/049-openai-models-and-codex-on-amazon-bedrock-are-now-generally.md)
- [050. Claw-SWE-Bench：首个独立测量Harness对编程Agent影响的基准](ch09/050-claw-swe-bench-harness-agent.md)
- [051. 1-Click GitHub Token Stealing via a VSCode Bug — ammaraskar 2026](ch09/051-1-click-github-token-stealing-via-a-vscode-bug-ammaraskar.md)
- [052. Chromium AI Coding 开发体系](ch09/052-chromium-ai-coding.md)
- [053. Codex Goal Six Hour Run](ch09/053-codex-goal-six-hour-run.md)
- [054. Claude Code 大型代码库最佳实践 — Anthropic 企业级部署指南](ch09/054-claude-code-anthropic.md)
- [055. 【图解】Claude Code 源码解析 ｜Prompt 提示词模块](ch09/055-claude-code-prompt.md)
- [056. Claude Code 七种自定义方法：官方全景指南](ch09/056-claude-code.md)
- [057. Claude Code Routines：从工具到队友的主动 Agent 模式](ch09/057-claude-code-routines-agent.md)
- [058. 两万字详解Claude Code源码核心机制](ch09/058-claude-code.md)
- [059. Claude Code 集成其他工具指南](ch09/059-claude-code.md)
- [060. OpenAI秘密矩阵曝光：Codex将所有设备连成超级电脑](ch09/060-openai-codex.md)
- [061. Hacker News 热帖：AI 会写代码了，为啥还要用 Python？](ch09/061-hacker-news-ai-python.md)
- [062. Claw Chain: Cyera Research Unveil Four Chainable Vulnerabilities in OpenClaw](ch09/062-claw-chain-cyera-research-unveil-four-chainable-vulnerabili.md)
- [063. 老代码克星：36k Star的 AI 神器，跑一条命令就把项目结构整明白了！](ch09/063-36k-star-ai.md)
- [064. MiniMax M3 开源 Frontier 模型](ch09/064-minimax-m3-frontier.md)
- [065. Claude Code团队10个使用技巧（Boris二刷）](ch09/065-claude-code-10-boris.md)
- [066. Claude Code 官方插件系统 (claude-plugins-official)](ch09/066-claude-code-claude-plugins-official.md)
- [067. 从提需求到部署发布，全AI全自动化后，研发效能全面跃升](ch09/067-ai.md)
- [068. Claude Code 可控性：软规则无法变成硬约束](ch09/068-claude-code.md)
- [069. DeepSeek Code Harness](ch09/069-deepseek-code-harness.md)
- [070. Claude Code 接入自建开源模型：企业私有化与降本实践 | 亚马逊AWS官方博客](ch09/070-claude-code-aws.md)
- [071. Claude Code Dynamic Workflows 实战模式与构建技巧](ch09/071-claude-code-dynamic-workflows.md)
- [072. 停止编码的那天，就是失去架构判断力的开始：一位 30 年架构师的 AI 生存指南](ch09/072-30-ai.md)
- [073. An Opinionated Guide to Using AI Right Now](ch09/073-an-opinionated-guide-to-using-ai-right-now.md)
- [074. Codex 5.21 更新：AI 编程助手开始变成电脑工作代理](ch09/074-codex-5-21-ai.md)
- [075. Codex Discovered a Hidden HTTP/2 Bomb](ch09/075-codex-discovered-a-hidden-http-2-bomb.md)
- [076. Engineering roles shift from developing code to managing AI | CIO Dive](ch09/076-engineering-roles-shift-from-developing-code-to-managing-ai.md)
- [077. Harness Engineering - 让 Coding Agent 可靠完成长程任务](ch09/077-harness-engineering-coding-agent.md)
- [078. Claude Dispatch + 接口力量：AI 从 Chatbot 到 Agent Interface 的转变](ch09/078-claude-dispatch-ai-chatbot-agent-interface.md)
- [079. Peter Steinberger / OpenClaw — 100个AI程序员案例](ch09/079-peter-steinberger-openclaw-100-ai.md)
- [080. Notes Inside China AI Labs Lambert](ch09/080-notes-inside-china-ai-labs-lambert.md)
- [081. AI Coding 入门指南：如何更好地让 AI 真正帮你干活](ch09/081-ai-coding-ai.md)
- [082. Anthropic 的 Harness 没管住 Claude Code？软规则 vs 硬约束](ch09/082-anthropic-harness-claude-code-vs.md)
- [083. When I reject AI code even if it works](ch09/083-when-i-reject-ai-code-even-if-it-works.md)
- [084. 天猫新品营销技术团队 AI 编码实战指南](ch09/084-ai.md)
- [085. Skill Issues: Compromising Claude Code with malicious skills & agents — Part 1](ch09/085-skill-issues-compromising-claude-code-with-malicious-skills.md)
- [086. Claude Code 27 条技巧：从工具清单到工程升级路径](ch09/086-claude-code-27.md)
- [087. AI can write code, but the CIOs still owns the operating model](ch09/087-ai-can-write-code-but-the-cios-still-owns-the-operating-mod.md)
- [088. 7个月，234次提交，1690行代码：AI编程大型翻车现场：我决定全部作废，手动重写！](ch09/088-7-234-1690-ai.md)
- [089. How to Avoid AI Code Slop](ch09/089-how-to-avoid-ai-code-slop.md)
- [090. Superpowers 深度解读（2）：Rule/Gate/Hook 与 Iron Law 方法论](ch09/090-superpowers-2-rule-gate-hook-iron-law.md)
- [091. Reward hacking is swamping model intelligence gains](ch09/091-reward-hacking-is-swamping-model-intelligence-gains.md)
- [092. 复制这套神仙配置，让Claude Code全自动修Bug！告别每天重复教AI写代码](ch09/092-claude-code-bug-ai.md)
- [093. Development environments for your cloud agents](ch09/093-development-environments-for-your-cloud-agents.md)
- [094. Hermes Agent自我进化机制与OpenClaw对比](ch09/094-hermes-agent-openclaw.md)
- [095. 让 Kiro 和 Claude Code 响应 IM 消息：用 ACP Bridge 打造异步 AI 编程工作流 | 亚马逊AWS官方博客](ch09/095-kiro-claude-code-im-acp-bridge-ai-aws.md)
- [096. Notes From Inside Chinas AI Labs](ch09/096-notes-from-inside-chinas-ai-labs.md)
- [097. The text in Claude Code’s “Extended Thinking” output is not authentic. – blog](ch09/097-the-text-in-claude-code-s-extended-thinking-output-is-not.md)
- [098. Claude Code 命令使用指南](ch09/098-claude-code.md)
- [099. 2 小时，0 行手写代码，我用 Claude 做了一个生产级 VSCode 插件](ch09/099-2-0-claude-vscode.md)
- [100. AI Coding 的底层框架：一切优化都是在对抗熵增——信息论视角](ch09/100-ai-coding.md)
- [101. Obsidian Claude Code Integration Guide](ch09/101-obsidian-claude-code-integration-guide.md)
- [102. Vibe Coding in Production — Erik Schluntz / Anthropic](ch09/102-vibe-coding-in-production-erik-schluntz-anthropic.md)
- [103. Codex can now control other desktop devices via Computer Use](ch09/103-codex-can-now-control-other-desktop-devices-via-computer-use.md)
- [104. Code is the easy part, or how we refactored half the business to fix a janky script | Swizec Teller](ch09/104-code-is-the-easy-part-or-how-we-refactored-half-the-busines.md)
- [105. Linn Fritz looks at the lighter side of life](ch09/105-linn-fritz-looks-at-the-lighter-side-of-life.md)
- [106. Claude Code 为什么会忽略指令：四类失效原因 + 五层规则框架](ch09/106-claude-code.md)
- [107. 无障碍设计师 vibe coding：当所有同事都在用 AI 写代码时](ch09/107-vibe-coding-ai.md)
- [108. Tether launches developer grants program for local AI payments](ch09/108-tether-launches-developer-grants-program-for-local-ai-paymen.md)
- [109. Introducing deepsec: The security harness for finding vulnerabilities in your codebase](ch09/109-introducing-deepsec-the-security-harness-for-finding-vulner.md)
- [110. 天猫新品营销技术团队AI编码实战指南（上）](ch09/110-ai.md)
- [111. The New Bottleneck: Theory of Constraints in the Age of AI Coding](ch09/111-the-new-bottleneck-theory-of-constraints-in-the-age-of-ai-c.md)
- [112. 天猫新品团队AI编码实战指南（下）](ch09/112-ai.md)
- [113. Automate progressive rollouts with Vercel Flags - Vercel](ch09/113-automate-progressive-rollouts-with-vercel-flags-vercel.md)
- [114. We have Mythos at Home: GLM 5.2 beats Claude in our Cyber Benchmarks](ch09/114-we-have-mythos-at-home-glm-5-2-beats-claude-in-our-cyber-be.md)
- [115. Using Local Coding Agents](ch09/115-using-local-coding-agents.md)
- [116. AI 写前端 ≠ 设计 —— Anomaly 创始人对 Vibe Coding 哲学批判](ch09/116-ai-anomaly-vibe-coding.md)
- [117. Unlocking AI flexibility in Europe: A guide to cross-region inference for EU data processing and model access](ch09/117-unlocking-ai-flexibility-in-europe-a-guide-to-cross-region.md)
- [118. Dynamically Splitting Wide Partitions in Cassandra for Time Series Workloads](ch09/118-dynamically-splitting-wide-partitions-in-cassandra-for-time.md)
- [119. How Baz improved its AI Agent Code Review accuracy using Amazon Bedrock AgentCore](ch09/119-how-baz-improved-its-ai-agent-code-review-accuracy-using-ama.md)
- [120. OpenAI大神教你如何榨干Codex](ch09/120-openai-codex.md)
- [121. Code Intelligence – Changelog](ch09/121-code-intelligence-changelog.md)
- [122. Device Code Phishing Forensics: What We Learned from BEC Investigations in the Wild](ch09/122-device-code-phishing-forensics-what-we-learned-from-bec-inv.md)
- [123. FastContext（微软开源 Coding Agent 仓库探索子代理）](ch09/123-fastcontext-coding-agent.md)
- [124. DeepSeek Visual Primitives：视觉原语作为思考媒介](ch09/124-deepseek-visual-primitives.md)
- [125. AI Coding Agent Token 成本控制五层模型](ch09/125-ai-coding-agent-token.md)
- [126. GLM-5 Scaling Pain 推理复盘](ch09/126-glm-5-scaling-pain.md)
