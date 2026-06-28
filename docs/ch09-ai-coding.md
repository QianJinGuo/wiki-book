# Ch09 AI 编程与代码生成

> 最成熟的 Agent 品类：Claude Code、OpenClaw、Codex 深度拆解

> 本章收录 **229 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 2 |
| ⭐⭐ 工程师 | 需编程基础 | 115 |
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

- [001. Claude Code Agent View](/ch09-001-claude-code-agent-view/)
- [002. Claude Code 个人学习系统：从答案机到学习工作台的 5 步法](/ch09-002-claude-code-5/)
- [003. Anthropic 内部 95% 数据分析自动化：分析 Agent 技术栈 + Skill 框架（21%→95% 准确率）](/ch09-003-anthropic-95-agent-skill-21-95/)
- [004. AI Coding 入门指南 - 如何更好地让AI真正帮你干活](/ch09-004-ai-coding-ai/)
- [005. 让 Coding Agent 从黑盒到透明：阿里云 Agent 观测审计数据采集实践（LoongSuite Pilot 端侧平台 + 3 类 Agent 形态 + 4 大观测审计能力）](/ch09-005-coding-agent-agent-loongsuite-pilot-3-agent/)
- [006. Claude Code 在大型代码库中的实战经验：从哪里入手？怎么做对？](/ch09-006-claude-code/)
- [007. 小米 MiMo Code — 长程编程 Agent 三大主线（计算/记忆/进化）+ 与 Claude Code 工程分化](/ch09-007-mimo-code-agent-claude-code/)
- [008. 业务 Agent 增强层架构：复用通用 Agent 基座，把业务能力做成可验证增强层](/ch09-008-agent-agent/)
- [009. AI 驱动的跨云网络搭建：用 Claude Code 和 Kiro CLI 实现 AWS-腾讯云 IPSec VPN 双隧道互联 | 亚马逊AWS官方博客](/ch09-009-ai-claude-code-kiro-cli-aws-ipsec-vpn-aws/)
- [010. Claude Code 一周年回顾：Boris Cherny + Cat Wu 的完整时间线](/ch09-010-claude-code-boris-cherny-cat-wu/)
- [011. Gene/GEP — EvoMap×清华 提出的「策略基因」经验对象框架（arXiv 2604.15097）](/ch09-011-gene-gep-evomap-arxiv-2604-15097/)
- [012. ai coding guide tmall deep dive](/ch09-012-ai-coding-guide-tmall-deep-dive/)
- [013. How Claude Code works in large codebases: Best practices and where to start](/ch09-013-how-claude-code-works-in-large-codebases-best-practices-and/)
- [014. Claude Code 从 Demo 到产线 · 企业 Harness 工程化的 8 道关卡（黄佳/咖哥 CSDN）](/ch09-014-claude-code-demo-harness-8-csdn/)
- [015. OpenAI Symphony：Linear 即 Codex Agent 控制平面](/ch09-015-openai-symphony-linear-codex-agent/)
- [016. AI 编程智能体的质量防线：5 个代码质量控制机制（反馈传感器 / 语义评估 / 重构边界 / 来源追溯 / 智能体攻击面清单）](/ch09-016-ai-5/)
- [017. Ethan Mollick: Claude Code and What Comes Next (Practitioner View)](/ch09-017-ethan-mollick-claude-code-and-what-comes-next-practitioner/)
- [018. 采用 AI 编码智能体的六条经验](/ch09-018-ai/)
- [019. Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](/ch09-019-karpathy-vibe-coding-agentic-engineering/)
- [020. 基于浏览器请求录制与AI代码生成的E2E接口自动化测试实践](/ch09-020-ai-e2e/)
- [021. Claude Code 一周年回顾：Boris Cherny + Cat Wu 对话](/ch09-021-claude-code-boris-cherny-cat-wu/)
- [022. Prompt Caching 工程实践 — Anthropic Claude Code 经验总结](/ch09-022-prompt-caching-anthropic-claude-code/)
- [023. 使用 Kiro AI IDE 开发 基于Amazon EMR 的Flink 智能监控系统实践 | 亚马逊AWS官方博客](/ch09-023-kiro-ai-ide-amazon-emr-flink-aws/)
- [024. 使用Claude Code：session管理与1M上下文](/ch09-024-claude-code-session-1m/)
- [025. Cheap code means formal verification is reasonable now — Antfly Blog](/ch09-025-cheap-code-means-formal-verification-is-reasonable-now-ant/)
- [026. Thought-Aligner：智能体行为安全新范式——可插拔思维校正层（ICML 2026）](/ch09-026-thought-aligner-icml-2026/)
- [027. It’s safe to close your laptop now: Hosting coding agents on Amazon Bedrock AgentCore](/ch09-027-it-s-safe-to-close-your-laptop-now-hosting-coding-agents-on/)
- [028. claude code openclaw usage ettin](/ch09-028-claude-code-openclaw-usage-ettin/)
- [029. 天猫新品营销技术团队AI编码实战指南（上）](/ch09-029-ai/)
- [030. AutoResearch：多 Agent 自动化软件开发](/ch09-030-autoresearch-agent/)
- [031. Claude Code 性能基准评测](/ch09-031-claude-code/)
- [032. HTTP/2 HPACK Bomb — Codex Discovered AI-Discovered DoS](/ch09-032-http-2-hpack-bomb-codex-discovered-ai-discovered-dos/)
- [033. gpt-54-烧完额度后我把七家国产-ai-公司-coding-plan-对比了一遍想不到最应该买的竟然是这家](/ch09-033-gpt-54-ai-coding-plan/)
- [034. AgentMemory](/ch09-034-agentmemory/)
- [035. Matt Van Horn 的 22 个 Claude Code 黑客技巧：让 AI 写 plan.md 但不读 plan.md](/ch09-035-matt-van-horn-22-claude-code-ai-plan-md-plan-md/)
- [036. CLAUDE.md 规则从 Karpathy 的 4 条增加到 12 条](/ch09-036-claude-md-karpathy-4-12/)
- [037. Anthropic Coding Agent 社会科学家采用调查](/ch09-037-anthropic-coding-agent/)
- [038. Claude Code 18个隐藏设置](/ch09-038-claude-code-18/)
- [039. CLAUDE.md 12 条规则：Karpathy 扩展模板](/ch09-039-claude-md-12-karpathy/)
- [040. deepseek v4 ds4c antirez local inference qbitai](/ch09-040-deepseek-v4-ds4c-antirez-local-inference-qbitai/)
- [041. Codex /goal 源码深度解析：状态表 + 续跑条件 + 预算账本](/ch09-041-codex-goal/)
- [042. Coding Agent在百度的落地实践：从反馈闭环到工程范式重构](/ch09-042-coding-agent/)
- [043. Cat Wu: Anthropic Claude Code/Cowork 产品负责人访谈](/ch09-043-cat-wu-anthropic-claude-code-cowork/)
- [044. 从Cursor返聘归来，90后华裔女高管带Claude开启日更模式](/ch09-044-cursor-90-claude/)
- [045. Claude Code 黑客松：技艺数字化六项目](/ch09-045-claude-code/)
- [046. Code as Agent Harness 综述](/ch09-046-code-as-agent-harness/)
- [047. Claude Code Agent Teams 架构分析](/ch09-047-claude-code-agent-teams/)
- [048. OpenAI models and Codex on Amazon Bedrock are now generally available](/ch09-048-openai-models-and-codex-on-amazon-bedrock-are-now-generally/)
- [049. Claw-SWE-Bench：首个独立测量Harness对编程Agent影响的基准](/ch09-049-claw-swe-bench-harness-agent/)
- [050. 1-Click GitHub Token Stealing via a VSCode Bug — ammaraskar 2026](/ch09-050-1-click-github-token-stealing-via-a-vscode-bug-ammaraskar/)
- [051. Chromium AI Coding 开发体系](/ch09-051-chromium-ai-coding/)
- [052. codex goal six hour run](/ch09-052-codex-goal-six-hour-run/)
- [053. Claude Code 大型代码库最佳实践 — Anthropic 企业级部署指南](/ch09-053-claude-code-anthropic/)
- [054. 【图解】Claude Code 源码解析 ｜Prompt 提示词模块](/ch09-054-claude-code-prompt/)
- [055. Claude Code 七种自定义方法：官方全景指南](/ch09-055-claude-code/)
- [056. Claude Code Routines：从工具到队友的主动 Agent 模式](/ch09-056-claude-code-routines-agent/)
- [057. 两万字详解Claude Code源码核心机制](/ch09-057-claude-code/)
- [058. Claude Code 集成其他工具指南](/ch09-058-claude-code/)
- [059. OpenAI秘密矩阵曝光：Codex将所有设备连成超级电脑](/ch09-059-openai-codex/)
- [060. Hacker News 热帖：AI 会写代码了，为啥还要用 Python？](/ch09-060-hacker-news-ai-python/)
- [061. Claw Chain: Cyera Research Unveil Four Chainable Vulnerabilities in OpenClaw](/ch09-061-claw-chain-cyera-research-unveil-four-chainable-vulnerabili/)
- [062. 老代码克星：36k Star的 AI 神器，跑一条命令就把项目结构整明白了！](/ch09-062-36k-star-ai/)
- [063. MiniMax M3 开源 Frontier 模型](/ch09-063-minimax-m3-frontier/)
- [064. Claude Code团队10个使用技巧（Boris二刷）](/ch09-064-claude-code-10-boris/)
- [065. Claude Code 官方插件系统 (claude-plugins-official)](/ch09-065-claude-code-claude-plugins-official/)
- [066. 从提需求到部署发布，全AI全自动化后，研发效能全面跃升](/ch09-066-ai/)
- [067. tmall ai coding practice team knowledge base](/ch09-067-tmall-ai-coding-practice-team-knowledge-base/)
- [068. Claude Code 可控性：软规则无法变成硬约束](/ch09-068-claude-code/)
- [069. DeepSeek Code Harness](/ch09-069-deepseek-code-harness/)
- [070. Claude Code 接入自建开源模型：企业私有化与降本实践 | 亚马逊AWS官方博客](/ch09-070-claude-code-aws/)
- [071. Claude Code Dynamic Workflows 实战模式与构建技巧](/ch09-071-claude-code-dynamic-workflows/)
- [072. 停止编码的那天，就是失去架构判断力的开始：一位 30 年架构师的 AI 生存指南](/ch09-072-30-ai/)
- [073. An Opinionated Guide to Using AI Right Now](/ch09-073-an-opinionated-guide-to-using-ai-right-now/)
- [074. Codex 5.21 更新：AI 编程助手开始变成电脑工作代理](/ch09-074-codex-5-21-ai/)
- [075. Codex Discovered a Hidden HTTP/2 Bomb](/ch09-075-codex-discovered-a-hidden-http-2-bomb/)
- [076. Engineering roles shift from developing code to managing AI | CIO Dive](/ch09-076-engineering-roles-shift-from-developing-code-to-managing-ai/)
- [077. Harness Engineering - 让 Coding Agent 可靠完成长程任务](/ch09-077-harness-engineering-coding-agent/)
- [078. Claude Dispatch + 接口力量：AI 从 Chatbot 到 Agent Interface 的转变](/ch09-078-claude-dispatch-ai-chatbot-agent-interface/)
- [079. Peter Steinberger / OpenClaw — 100个AI程序员案例](/ch09-079-peter-steinberger-openclaw-100-ai/)
- [080. notes inside china ai labs lambert](/ch09-080-notes-inside-china-ai-labs-lambert/)
- [081. AI Coding 入门指南：如何更好地让 AI 真正帮你干活](/ch09-081-ai-coding-ai/)
- [082. Anthropic 的 Harness 没管住 Claude Code？软规则 vs 硬约束](/ch09-082-anthropic-harness-claude-code-vs/)
- [083. When I reject AI code even if it works](/ch09-083-when-i-reject-ai-code-even-if-it-works/)
- [084. 天猫新品营销技术团队 AI 编码实战指南](/ch09-084-ai/)
- [085. Skill Issues: Compromising Claude Code with malicious skills & agents — Part 1](/ch09-085-skill-issues-compromising-claude-code-with-malicious-skills/)
- [086. AI can write code, but the CIOs still owns the operating model](/ch09-086-ai-can-write-code-but-the-cios-still-owns-the-operating-mod/)
- [087. 7个月，234次提交，1690行代码：AI编程大型翻车现场：我决定全部作废，手动重写！](/ch09-087-7-234-1690-ai/)
- [088. How to Avoid AI Code Slop](/ch09-088-how-to-avoid-ai-code-slop/)
- [089. Superpowers 深度解读（2）：Rule/Gate/Hook 与 Iron Law 方法论](/ch09-089-superpowers-2-rule-gate-hook-iron-law/)
- [090. Reward hacking is swamping model intelligence gains](/ch09-090-reward-hacking-is-swamping-model-intelligence-gains/)
- [091. 复制这套神仙配置，让Claude Code全自动修Bug！告别每天重复教AI写代码](/ch09-091-claude-code-bug-ai/)
- [092. Development environments for your cloud agents](/ch09-092-development-environments-for-your-cloud-agents/)
- [093. Hermes Agent自我进化机制与OpenClaw对比](/ch09-093-hermes-agent-openclaw/)
- [094. 让 Kiro 和 Claude Code 响应 IM 消息：用 ACP Bridge 打造异步 AI 编程工作流 | 亚马逊AWS官方博客](/ch09-094-kiro-claude-code-im-acp-bridge-ai-aws/)
- [095. notes from inside chinas ai labs](/ch09-095-notes-from-inside-chinas-ai-labs/)
- [096. The text in Claude Code’s “Extended Thinking” output is not authentic. – blog](/ch09-096-the-text-in-claude-code-s-extended-thinking-output-is-not/)
- [097. claude-code-commands-usage-guide](/ch09-097-claude-code-commands-usage-guide/)
- [098. 2 小时，0 行手写代码，我用 Claude 做了一个生产级 VSCode 插件](/ch09-098-2-0-claude-vscode/)
- [099. obsidian claude code integration guide](/ch09-099-obsidian-claude-code-integration-guide/)
- [100. Vibe Coding in Production — Erik Schluntz / Anthropic](/ch09-100-vibe-coding-in-production-erik-schluntz-anthropic/)
- [101. Codex can now control other desktop devices via Computer Use](/ch09-101-codex-can-now-control-other-desktop-devices-via-computer-use/)
- [102. Linn Fritz looks at the lighter side of life](/ch09-102-linn-fritz-looks-at-the-lighter-side-of-life/)
- [103. 无障碍设计师 vibe coding：当所有同事都在用 AI 写代码时](/ch09-103-vibe-coding-ai/)
- [104. Tether launches developer grants program for local AI payments](/ch09-104-tether-launches-developer-grants-program-for-local-ai-paymen/)
- [105. Introducing deepsec: The security harness for finding vulnerabilities in your codebase](/ch09-105-introducing-deepsec-the-security-harness-for-finding-vulner/)
- [106. 天猫新品营销技术团队AI编码实战指南（上）](/ch09-106-ai/)
- [107. The New Bottleneck: Theory of Constraints in the Age of AI Coding](/ch09-107-the-new-bottleneck-theory-of-constraints-in-the-age-of-ai-c/)
- [108. 天猫新品团队AI编码实战指南（下）](/ch09-108-ai/)
- [109. Automate progressive rollouts with Vercel Flags - Vercel](/ch09-109-automate-progressive-rollouts-with-vercel-flags-vercel/)
- [110. AI 写前端 ≠ 设计 —— Anomaly 创始人对 Vibe Coding 哲学批判](/ch09-110-ai-anomaly-vibe-coding/)
- [111. Unlocking AI flexibility in Europe: A guide to cross-region inference for EU data processing and model access](/ch09-111-unlocking-ai-flexibility-in-europe-a-guide-to-cross-region/)
- [112. Dynamically Splitting Wide Partitions in Cassandra for Time Series Workloads](/ch09-112-dynamically-splitting-wide-partitions-in-cassandra-for-time/)
- [113. How Baz improved its AI Agent Code Review accuracy using Amazon Bedrock AgentCore](/ch09-113-how-baz-improved-its-ai-agent-code-review-accuracy-using-ama/)
- [114. OpenAI大神教你如何榨干Codex](/ch09-114-openai-codex/)
- [115. Code Intelligence – Changelog](/ch09-115-code-intelligence-changelog/)
- [116. Device Code Phishing Forensics: What We Learned from BEC Investigations in the Wild](/ch09-116-device-code-phishing-forensics-what-we-learned-from-bec-inv/)
- [117. 用 Amazon Quick 加速日常数据工作](/ch09-117-amazon-quick/)
- [118. FastContext（微软开源 Coding Agent 仓库探索子代理）](/ch09-118-fastcontext-coding-agent/)
- [119. DeepSeek Visual Primitives：视觉原语作为思考媒介](/ch09-119-deepseek-visual-primitives/)
- [120. AI Coding Agent Token 成本控制五层模型](/ch09-120-ai-coding-agent-token/)
- [121. GLM-5 Scaling Pain 推理复盘](/ch09-121-glm-5-scaling-pain/)
