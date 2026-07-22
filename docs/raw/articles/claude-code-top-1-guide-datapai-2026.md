sha256: 25efdb106c799aecb8ace4075f961ab372abb5436d41ddf875991ea65b14ce2d
---

name: code-reviewer
description: Reviews code for style, correctness, security, and performance. Use after any implementation is complete.
tools: Read, Grep, Glob, Bash
model: claude-opus-4-6
---
You are a staff engineer doing a thorough code review. Challenge every shortcut.
For each file changed, check:
1. Correctness — does this actually do what's intended?
2. Edge cases — what inputs would break this?
3. Security — any injection vectors, exposed secrets, auth gaps?
4. Performance — any O(n²) loops, unnecessary DB calls, memory leaks?
5. Readability — will a new team member understand this in 6 months?
Output: structured report with MUST FIX, SHOULD FIX, and CONSIDER sections.




说明：这个文件定义了一个 code-reviewer 子代理，指定名称、用途、可用工具和模型，并要求它以资深工程师视角检查正确性、边界情况、安全性、性能和可读性。



工具范围控制至关重要



默认情况下，子代理会继承主会话中的所有工具，包括 MCP 工具。因此必须有意识地限定它们的工具范围：




---
name: safe-researcher
description: Reads codebase to answer questions. Cannot modify anything.
tools: Read, Grep, Glob
---




说明：这个 safe-researcher 子代理只能读取代码库并回答问题，工具范围被限制为 Read、Grep 和 Glob，不能修改任何内容。




disallowedTools 这种方式通常更好：先继承所有工具，再移除危险部分。




双 Claude 审查模式



这是整篇指南中回报率最高的技巧之一。




会话 A 负责实现功能。它掌握全部上下文，做出了所有权衡，也因为推进速度很快而采取了一些捷径。




会话 B 则从零开始。它没有这些上下文，它会在不了解背景的情况下直接阅读这次代码差异。它会暴露出 Session A 走的每一个捷径、做的每一个假设，以及 Session A 认为理所当然的一切。这会是你得到过的最诚实的代码审查。




# Session A
claude "implement the payment webhook handler, write tests, commit when passing"
# Session B (in a new terminal)
claude "review the last commit on this branch as a staff engineer. 
Check correctness, security, and edge cases. 
Be harsh — this is going to production."




说明：示例中，会话 A 负责实现支付 webhook 处理器并在测试通过后提交；会话 B 在新终端中冷启动审查最后一次提交，重点检查正确性、安全性和边界情况。




你也可以使用 --agent 标志把这个流程正式化：




第 6 部分：MCP 服务器



Model Context Protocol（MCP）是把 Claude Code 连接到真实世界的方式。你的数据库、GitHub、内部 API、Jira、Slack，只要有 MCP 服务器，就可以成为 Claude 能够原生使用的工具。




可以这样理解：现在 Claude 能够读写你机器上的文件。有了 MCP，Claude 还可以查询生产数据库（只读）、获取最新的 GitHub issue、查看 Slack 中关于某个 bug 的上下文，或者查找 Jira 工单。所有这些都不需要你手动复制粘贴。

 

Claude MCP




在 settings.json 中添加 MCP 服务器


{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@localhost/mydb"
      }
    }
  }
}




说明：这个配置示例把 GitHub MCP 和 Postgres MCP 加入 mcpServers，使 Claude 能通过对应 token 或连接字符串访问外部服务。




配置完成后，Claude 就可以用自然语言与这些工具交互：




"Check the last 5 failing GitHub Actions runs and identify the common pattern"
"Query the users table to understand the schema before writing the migration"
"Find the Jira ticket for this bug and add a comment with the fix approach"




说明：这些是配置 MCP 后可以直接交给 Claude 的自然语言任务，例如检查 GitHub Actions 失败模式、查询用户表 schema，或查找 Jira 工单并补充修复方案。




始终遵循最小权限原则



关于 MCP 最重要的一课是：默认只读。对于绝大多数任务，Claude 需要读取数据库，而不是写入数据库。可以设置两套 MCP 服务器配置：一套只读，用于探索和调试；另一套读写配置，但需要经过授权才能使用。




一个具体例子是：你可以给 code-reviewer 子代理只读数据库权限，让它理解 schema；给 implementer 子代理写入权限，但只允许写入开发数据库，绝不能写生产库。




Skills 与 MCP：什么时候用哪个



一个常见问题是：我应该为这件事构建 MCP 服务器，还是写一个 skill？




Skill（位于 .claude/skills/ 中的 SKILL.md 文件）是教 Claude 如何做某件事的 Markdown 文件，承载的是知识和指令。MCP 服务器则暴露实时工具和数据。一个经验法则是：




当你想给 Claude 提供工作流程、模式或领域知识时，使用 skill。例如：“以下是我们将应用程序部署到 Kubernetes 集群中的具体步骤。”

当你需要实时数据或实时操作时，使用 MCP。例如：“查询生产数据库的当前状态”。

拿不准时优先使用 skill。你可以阅读并了解一个 skill，而 MCP 服务器则是黑箱。




第 7 部分：分步使用指南



让我们把它具体化。以下是一个真实工作流程：使用完整的专家级配置，从想法开始，构建一个新的 API 端点，直到代码的合并。




场景设定



你需要为 Node.js API 添加一个新的 /api/v2/recommendations 端点。它应当基于用户的历史数据来提供个性化的内容推荐。同时还需要包含 Redis 缓存机制、适当的身份验证中间件，以及完整的测试流程。




步骤 0：你的 CLAUDE.md 已经加载




因为你已经完成了这些设置，Claude 已经知道你的技术栈、测试框架、git 工作流程，以及它在你的代码库中容易做错的事情。每次会话都不再需要额外设置。




步骤 1：使用访谈模式来明确需求规格




claude "I want to build a /api/v2/recommendations endpoint. 
Interview me using the AskUserQuestion tool. 
Ask about auth, caching strategy, response shape, edge cases, 
and performance constraints. Don't assume anything. 
When we've covered everything, write a complete spec to SPEC.md."




说明：这条命令让 Claude 通过访谈模式收集需求，询问认证、缓存策略、响应结构、边界情况和性能约束，并在信息充分后写出完整规格说明。




在 Claude 工作时，你的 PostToolUse 钩子会自动检查它所编写的每个文件。 PreToolUse 钩子会阻止任何危险命令。你不需要手动考虑这些事情。




> ⚠️ 原文缺失：Step 2在原文中缺失，原文直接从 Step 1 跳至 Step 3。




步骤 3：通过子代理进行并行审查



当 Claude 仍在实现功能时（或刚提交之后），启动一次并行审查：




claude "Use the code-reviewer subagent on the changes in the last commit"




说明：这条命令要求 Claude 使用 code-reviewer 子代理审查最后一次提交中的改动。




子代理会在独立的上下文中启动，读取差异信息后，会生成一份结构化的报告并返回。




MUST FIX:
- Redis connection not being released on error path (memory leak)
- Auth middleware applied after rate limiter — should be before
SHOULD FIX:  
- Cache key doesn't include user locale, will serve wrong language
- Missing test for empty history edge case
CONSIDER:
- Could cache at the CDN layer for anonymous users




说明：这是子代理返回的结构化审查报告示例，分为必须修复、应该修复和可以考虑三类问题。




步骤 4：修复并验证



回到主会话：




"The reviewer found a Redis connection leak on the error path 
and auth middleware in wrong order. Fix both, re-run tests."




说明：这条反馈要求主会话修复审查者发现的 Redis 连接泄漏和认证中间件顺序问题，并重新运行测试。




Claude 修复这些问题，测试通过，同时还将自动代码检查功能也进行了整合。




步骤 5：安全审计


claude "Use the security-auditor subagent on this feature"




说明：这条命令让 Claude 使用 security-auditor 子代理对该功能进行安全审计。




安全审计器会检查注入向量、泄露的密钥、认证缺口和限流缺口。它会返回一份无异常结论，或者指出更多需要修复的问题。




步骤 6：自动化 PR


claude "Create a PR for this feature. Include the spec, 
what was changed and why, test coverage summary, 
and any known limitations."




说明：这条命令让 Claude 创建 PR，并在描述中包含规格说明、修改内容和原因、测试覆盖总结以及已知限制。




Claude 使用 GitHub MCP 创建 PR，同时确保其描述完整无误，还通过 Jira MCP 将相关链接指向工单，并请求审查者进行审核。




完整流程图

 




原本需要 2 到 3 小时才能完成的任务，现在只需~25 分钟即可完成。更重要的是，所有的质量检测都是自动进行的。安全审计也无需人工干预即可完成。项目的描述也是一目了然的。




第 8 部分：值得了解的进阶模式


上下文管理是你最重要的能力



每个 Claude Code 会话都有一个上下文窗口。当它被填满时，Claude 会自动压缩上下文，也就是总结旧内容来腾出空间。管理不当的压缩会丢失关键状态。




两条规则：




1. 在上下文用量达到大约 50% 时手动执行 /compact，不要等自动压缩。这样你可以控制哪些内容被保留下来。

2. 在你的 CLAUDE.md（http://claude.md/） 中添加一条压缩指令：“压缩时，始终保留：已修改文件列表、当前测试状态，以及所有未解决问题。”



使用 /loop 进行后台监控



这是最被低估的功能之一。当你在处理其他事情时：




/loop 5m check if the CI pipeline on branch feat/recommendations passed and report back
/loop 30m check for any new failing tests on main




说明：这些 /loop 命令用于后台定时检查 CI 状态或 main 分支上的新失败测试。

这些命令会按定时器在后台运行。无需再切换标签页来查看 CI 的进度。




按任务选择模型



并不是每个任务都需要 Opus。要有意识地选择：




claude --model claude-sonnet-4-6   # Default, best for most coding
claude --model claude-opus-4-6     # Complex architecture, multi-file refactors
claude --model claude-haiku-4-5    # Quick lookups, simple fixes, fast answers







说明：这些命令展示了如何按任务选择模型：Sonnet 适合多数编码任务，Opus 适合复杂架构和多文件重构，Haiku 适合快速查询和简单修复。




你也可以在 frontmatter 中为每个子代理设置模型，这意味着昂贵的 Opus 调用只会发生在真正值得使用的地方。




异步工作流程的远程控制


claude remote-control




说明：claude remote-control 会启动一个可远程连接的 Claude 会话，用于异步工作流。




这在你的机器上启动一个会话，你可以从 claude.ai 或 iOS 应用连接它。你可以启动一个长时间运行的任务，合上笔记本，然后在手机上查看进度。会话运行在你的机器上，浏览器只是一个窗口。




/voice 加空格键工作流程



运行 /voice 启用即按即说功能。按住空格键，描述你想要什么，然后松开。对于某些工作流程，尤其是你需要边思考边表达的场景，这比打字快得多。




第 9 部分：从零搭建生产级配置



以下是一个配置良好的 Claude Code 项目的文件结构：




your-project/
├── CLAUDE.md                    ← project memory (commit this)
├── CLAUDE.local.md              ← personal overrides (gitignore)
├── .claude/
│   ├── settings.json            ← hooks, models, permissions
│   ├── agents/
│   │   ├── code-reviewer.md
│   │   ├── test-writer.md
│   │   ├── security-auditor.md
│   │   └── pm-spec.md
│   ├── skills/
│   │   ├── deploy.md            ← how we deploy to staging/prod
│   │   ├── database-patterns.md ← our DB conventions
│   │   └── api-design.md        ← our API design rules
│   ├── commands/
│   │   ├── review-pr.md         ← /review-pr $ARGUMENTS
│   │   ├── ship.md              ← /ship — full pipeline
│   │   └── diagnose.md          ← /diagnose — debugging workflow
│   └── hooks/
│       ├── block_dangerous.py
│       ├── auto_format.sh
│       └── session_summary.py




说明：这个目录树展示了生产级 Claude Code 项目的推荐结构，包括项目记忆、个人覆盖配置、钩子、子代理、skill、命令和脚本。




最低限度可用的 CLAUDE.md


# Project: [Name]
## Stack
- Node.js 22, TypeScript 5.4, Fastify 4
- PostgreSQL 16 + Drizzle ORM
- Redis 7 for caching
- Jest for testing
See @package.json for all dependencies.
See @docs/architecture.md for system design.
## How to work on this project
- Run tests: `npm test`
- Run single test: `npm test -- --testPathPattern=auth`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
## Things to get right
- Always use ESM imports (not CommonJS require)
- Redis keys must include version prefix: `v2:user:{id}:...`
- Auth middleware must run BEFORE rate limiting in route registration
- All DB queries go through the service layer, never directly in routes
## Git workflow
- Never commit to main directly
- Branch naming: `feat/`, `fix/`, `chore/`
- Commit messages: conventional commits format




说明：这是一个最小可用 CLAUDE.md 示例，包含技术栈、常用命令、容易出错的项目规则和 git 工作流程。




这不到 30 行。它只包含 Claude 真正需要的内容，因此会被遵循。




是什么让那些处于顶尖 1%的人脱颖而出：思维方式的转变



高级用户与其他人的真正差别在这里：




其他人：“我给 Claude 一个任务，看看它做得怎么样。”




前 1% 用户：“我要设计一个系统，让 Claude 能够在最少监督下高效运行。”




这就是把基础设施思维应用到 AI 工具上。你在前期投入时间：写出精炼的 CLAUDE.md，设置钩子，定义子代理。而这项投入会在每一次会话中持续复利。




用 Claude Code 交付最多成果的开发者，并不是最会写提示词的人。他们是最好的系统设计者。他们会思考上下文会在哪里退化，并提前预防；他们会判断哪些质量检测应该由系统自动完成，哪些则需要人工审核；他们会思考任务的哪些部分可以并行运行，哪些必须串行执行。




最贴切的类比是：关键不是成为更好的司机，而是修出更好的路。




你本周的行动计划



你不需要一次性完成所有事情。下面是一套按优先级推进的落地计划：




第 1 天：CLAUDE.md 基础。在主项目中运行 /init。删除它生成内容的 70%。补充 Claude 容易做错的内容。开始时先控制在 50 行以内。




第 2 天：你的第一个钩子。在 Write 上添加一个 PostToolUse 钩子，用来运行代码检查工具。仅这一项改动，就能为你节省数百次手动进行代码检查循环。




第 3 天：双 Claude 审查。下一个功能完成时，在主会话结束后打开第二个会话，让它重新检查上一次的提交内容。比较它发现的问题与你自己原本会发现的问题。




第 4 天：你的第一个子代理。在 .claude/agents/ 中创建一个 code-reviewer 子代理。把它用于 PR 审查。观察隔离上下文如何让审查更彻底。




第 5 天：一个 MCP 服务器。接入 GitHub MCP。让 Claude 在实现修复之前获取 issue 上下文。你会注意到自己需要复制粘贴的内容少了很多。




第 2 周及以后：迭代并复利。根据 Claude 持续出错的地方打磨 CLAUDE.md。为你的领域特定模式添加 skill。搭建完整流水线。




结论：工具已经准备好了，瓶颈在于你自己



Claude Code 已经具备构建真正自主开发流程所需的所有基本要素。子代理、钩子、MCP 集成、skill 和命令行指令，都不是为了营销而设计的——而是一套连贯的系统：它的设计目标是把你从软件开发的重复循环中解放出来，同时让你保留对真正重要决策的掌控。




那些未来回望 2025 到 2026 年，认为这是自己最富有成效的阶段的开发者，将会是那些不再把 Claude Code 当成终端聊天机器人，而是开始把它视为可编程基础设施的人。




构建 CLAUDE.md。设置钩子。定义子代理。连接 MCP。根据实际出问题的地方持续迭代。




前 1% 并不是一个固定群体。它属于那些把这件事当作工程来对待的人：系统化、迭代式，并且始终持续改进。




值得收藏的资源



Claude Code 官方文档：code.claude.com/docs/en/overview，权威来源，更新频繁。

Anthropic 最佳实践：code.claude.com/docs/en/best-practices，最简洁的官方指南。

GitHub 上的 claude-code-best-practice：github.com/shanraisshan/claude-code-best-practice，社区整理的 84 条最佳实践，超过 2 万 star。

ClaudeLog：claudelog.com，独立社区资源，包含深入实验和配置指南。

GitHub 上的 awesome-claude-code：github.com/hesreallyhim/awesome-claude-code，整理了 skill、钩子、插件和 MCP 服务器。

Claude Code ultimate guide：github.com/FlorianBruniaux/claude-code-ultimate-guide，从入门到高级用户，包含测验和速查表。

Claude Agent SDK 文档：letsdatascience.com/blog/claude-agent-sdk-tutorial，用于以编程方式构建生产级智能代理。

写好 CLAUDE.md（http://claude.md/）：humanlayer.dev/blog/writing-a-good-claude-md（https://www.humanlayer.dev/blog/writing-a-good-claude-md），关于 CLAUDE.md（http://claude.md/） 指令预算最严谨的分析。

MCP 协议规范：modelcontextprotocol.io，适合想构建自己 MCP 服务器的人。

Anthropic 高级模式 webinar：anthropic.com/webinars/claude-code-advanced-patterns（https://www.anthropic.com/webinars/claude-code-advanced-patterns），Anthropic 官方关于子代理和大规模 MCP 的深入讲解。







原文标题：

Becoming a top 1% Claude Code user: the complete playbook no one else is sharing

原文链接：

https://pub.towardsai.net/becoming-a-top-1-claude-code-user-the-complete-playbook-no-one-else-is-sharing-96057be1468e







编辑：于腾凯

校对：林亦霖

译者简介

王琰玮，清华大学能源环境经济研究所研究专员，数据科学与 AI 前沿爱好者。日常关注 AI 领域前沿动态，很高兴加入数据派THU，期待在翻译组参与 AI 前沿内容的中文化整理与传播，和大家一起产出有意义的内容！

翻译组招募信息

工作内容：需要一颗细致的心，将选取好的外文文章翻译成流畅的中文。如果你是数据科学/统计学/计算机类的留学生，或在海外从事相关工作，或对自己外语水平有信心的朋友欢迎加入翻译小组。

你能得到：定期的翻译培训提高志愿者的翻译水平，提高对于数据科学前沿的认知，海外的朋友可以和国内技术应用发展保持联系，THU数据派产学研的背景为志愿者带来好的发展机遇。

其他福利：来自于名企的数据科学工作者，北大清华以及海外等名校学生他们都将成为你在翻译小组的伙伴。




点击文末“阅读原文”加入数据派团队~






转载须知

如需转载，请在开篇显著位置注明作者和出处（转自：数据派ID：DatapiTHU），并在文章结尾放置数据派醒目二维码。有原创标识文章，请发送【文章名称-待授权公众号名称及ID】至联系邮箱，申请白名单授权并按要求编辑。

发布后请将链接反馈至联系邮箱（见下方）。未经许可的转载以及改编者，我们将依法追究其法律责任。














关于我们

数据派THU作为数据科学类公众号，背靠清华大学大数据研究中心，分享前沿数据科学与大数据技术创新研究动态、持续传播数据科学知识，努力建设数据人才聚集平台、打造中国大数据最强集团军。










新浪微博：@数据派THU

微信视频号：数据派THU

今日头条：数据派THU

点击“阅读原文”拥抱组织


