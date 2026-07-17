# LLM agent脚手架如何具备自进化能力？——以hermes agent为例

## Ch01.243 LLM agent脚手架如何具备自进化能力？——以hermes agent为例

> 📊 Level ⭐⭐ | 29.7KB | `entities/llm-agent脚手架如何具备自进化能力以hermes-agent为例.md`

[Llm Agent脚手架如何具备自进化能力以Hermes Agent为例](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-agent脚手架如何具备自进化能力以hermes-agent为例.md)

#  前言 
笔者之前讲解了claude code这一code agent脚手架(两万字详解Claude Code源码核心机制)，和cc相比，最近大火的 hermes agent 定位则是更加日常的、通用的agent脚手架，体现在system prompt内容（强调用来完成问答、代码、分析、创作、工具执行等全场景任务）、工具集设计（更加丰富的Web 与浏览器工具、文本&语音等多模态工具）、多平台使用（Telegram、Discord、微信等多平台发送消息、调用远端执行后段）等方面。hermes agent更加强调是其"自进化（self-improve）"机制，本文将会基于hermes agent，讲解如果想让agent脚手架具备自进化能力，需要配套构建哪些机制。
首先需要澄清的是，虽然hermes agent提供了调用自家tinker-atropos训练平台的RL工具（rl_start_training、rl_get_results等），但是这里所说的self imporve并非是进行模型权重更新，而是一套显式的知识沉淀机制——模型通过工具主动记录经验，下次会话自动加载。
self-improving机制主要基于更加完善的memory机制来记住用户偏好（比如用户倾向于用pandas库处理csv文件）以及用沉淀skill机制来保存复杂的操作流程（比如整理一份文件需要先清洗空值，再按日期分组，最后计算平均值）。Hermes能够做到self imporving 机制需要在system prompt、工具设计、memory等各个基础组建上做针对性的定制。

#  System Prompt 的引导设计 
self imporve机制需要利用skill来不断沉淀、优化操作流程，因此在system prompt里边进行了重点说明。
1.首先是明确说明了如果遇到复杂操作，需要沉淀为skill，方便后续调用，提高自身能力，如果发现skill有问题，也要及时修复，具体prompt如下：
完成复杂任务（调用工具 5 次及以上）、修复棘手报错，或是摸索出一套实用流程后，要用 skill_manage 将这套方法保存为技能，方便后续复用。 使用技能时如果发现内容过时、流程不全或存在错误，主动立即用 skill_manage(action='patch') 修补，不要等他人提醒。得不到维护的技能，终将变成累赘隐患。
2.模型在回复前先查看skill，看看之前有没有沉淀下来有用的skills，避免绕弯路：
回复前，请先通读下方所有技能。若某项技能与你的任务匹配，哪怕只是部分相关，你都必须用skill_view(name) 加载该技能，并严格遵循其指令执行。 宁可多加载无关技能，也绝不遗漏关键流程、潜在坑点和既定工作规范。技能中包含专属专业知识：API 接口地址、专属工具命令、经过验证的成熟工作流，效果远优于通用处理方式。 即便你认为只用网页搜索、终端等基础工具就能完成任务，也依然要加载对应技能。 技能同时固化了用户在代码审查、方案规划、测试等任务上的惯用处理方式、格式规范和质量标准。哪怕是你本来就会做的任务，也要加载技能 —— 因为技能规定了在此环境下必须按这套标准来做。 若加载的技能存在问题，使用 skill_manage(action='patch') 进行修复。完成复杂任务或多轮迭代任务后，主动询问是否将本次流程保存为新技能。如果你加载的技能存在步骤缺失、命令错误、未标注潜在风险等问题，请在任务结束前主动更新完善该技能。

#  Self-Improve 相关工具设计 
hermes agent的self improve非常依赖skills能力，因此还专门为skills设计了3种工具：
工具  |  功能  |  在 Self-Improve 中的作用
---|---|---
skills_list  |  列出所有可用技能  |  扫描有哪些技能可用，只返回名称和描述（渐进式披露）
skill_view  |  读取指定技能的完整内容  |  发现相关技能后加载详情，支持读取 SKILL.md 或 references/、templates/ 等子目录文件
skill_manage  |  创建/修改/删除技能  |  完成任务后保存经验（create），或修复过时技能（patch/edit），或清理废弃技能（delete）
其中skill_manage设计的最为复杂，其schema如下。skill_manage可实现"create", "patch", "edit", "delete", "write_file", "remove_file"这6种能力，这6种能力其实本质上又进一步对应6种函数实现，统一交由skill_manage调度可以减少工具定义的个数。不同能力可能仅需要传入部分参数，比如 patch能力对应_patch_skill这个底层函数，只需要传入old_string、new_string、file_path、replace_all。
    SKILL_MANAGE_SCHEMA = {
            "name": "skill_manage",
            "parameters": {
                "properties": {
                    "action": {
                        "type": "string",
                        "enum": ["create", "patch", "edit", "delete", "write_file", "remove_file"],
                        "description": "The action to perform."
                    },
                    "name": { "type": "string", "description": "Skill name..." },
                    "content": { "type": "string", "description": "Full SKILL.md content..." },
                    "old_string": { "type": "string", "description": "Text to find (for patch)..." },
                    "new_string": { "type": "string", "description": "Replacement text (for patch)..." },
                    "replace_all": { "type": "boolean", "description": "Replace all occurrences..." },
                    "category": { "type": "string", "description": "Optional category..." },
                    "file_path": { "type": "string", "description": "Path to supporting file..." },
                    "file_content": { "type": "string", "description": "Content for the file..." },
                },
                "required": ["action", "name"],
            },
    }

    # 使用skill_manage工具实现patch功能的例子
    skill_manage(
        action="patch",
        name="docker-setup",
        old_string="docker-compose up -d",
        new_string="docker compose up -d"  # 新版 Docker 语法
    )
skill_manage 6种能力详细的说明如下表所示：
Action  |  用途  |  关键参数  |  典型使用场景
---|---|---|---
create  |  创建新技能  |  name, content, category  |  完成复杂任务（5+ tool calls）后保存经验
patch  |  局部修改（最常用）  |  name, old_string, new_string  |  修复过时命令、添加新步骤、更新错误处理
edit  |  全文重写  |  name, content  |  技能大改版、重构结构、合并多个技能
delete  |  删除技能  |  name  |  清理废弃技能、合并重复技能后删除旧版
write_file  |  添加辅助文件  |  name, file_path, file_content  |  添加模板、脚本、参考文档到 references//templates//scripts/
remove_file  |  删除辅助文件  |  name, file_path  |  清理无用的辅助文件
这里解释一下可能存在的疑问：

  * • 问：system prompt会加载skills的描述，为啥还需要skills_list工具？ 答：System Prompt 中的技能索引是会话开始时的静态快照，如果会话期间技能被修改（skill_manage 创建/更新/删除），不能实时更新 System Prompt，否则会导致 Prefix Cache 失效，token 成本翻倍，因此需要调用skills_list 工具实时获取skills最新状态 
  * • 问：对skills专门设计工具是必要的吗？其他框架不也没有skills工具？ 答：首先这个跟工具设计模式有关，举另外一个例子，比如执行shell命令，当然可以只提供一个shell工具就能完成很复杂的搜索、替换等操作（codex更倾向于这种方案），但是你也可以把最常用的几个功能比如Glob、edit、grep这种shell本身也能完成的能力单独封装成工具（claude code倾向于这种方式），这样能让模型调用工具更简单，更不容易出错（试想一下如果用原生shell命令实现替换需要一串长长的指令，更容易出错）。回到skill的问题上来，不为skills设计工具当让也可以用基础的edit、read等功能对skill进行操作，只不过对模型来说更难，单独设计成工具也能增强模型调用相关工具的意愿。hermes agent定位就是让 Agent 能够对skills自主创建（完成复杂任务后保存经验）、即时修复（发现过时时立即 patch）、版本演化（技能随使用不断进化），其他agent脚手架通常是不需要agent自己自动迭代skills，人提前定义好就行，因此hermes agent有必要针对skills设计一套专有工具。 
和self imporve功能相关的除了skill相关工具，也有`session_search` 工具，基于 SQLite FTS5 的跨会话文本检索工具，让 Agent 能回顾自己过去的完整思考轨迹。session search机制会在下文介绍。遇到如下情况时，会触发这个工具：
主动在以下场景使用本规则：当用户说出「我们之前做过这个」「还记得当时」「上次」这类表述时……只要属于跨会话场景，就果断检索；检索成本低、速度快。宁可主动检索核实，也不要凭空猜测，或是让用户重复说明。

#  更加完善的memory机制 
Hermes主要依赖于MEMORY和USER两种md文件用于记录用户的偏好。Hermes还专门为模型设计了"memory"工具让 Agent 把重要的用户信息写入持久化存储。记忆文件默认是加载到system prompt中的，但本次会话的 system prompt 并不会改变。记忆内容要等到下次会话启动时才作为新快照读入。这种设计是为了保护 prefix cache，如果每次写 memory 都更新 system prompt，长会话的成本会翻倍。
memory机制主要依赖于如下两个文件：
    MEMORY.md：工作笔记——环境事实、项目约定、工具怪癖
    USER.md：用户画像——名字、角色、偏好、沟通风格
为了防止 prompt 注入攻击注入工具，这两个文件写入前会扫描内容，命中任何威胁模式都会拒绝写入。这是 self-improving 的关键防护，防止攻击者通过诱导 Agent 记录恶意内容来持久化污染 system prompt。主要原理是基于正则表达式进行恶意注入识别：
    _MEMORY_THREAT_PATTERNS = [

        # Prompt injection
        (r'ignore\s+(previous|all|above|prior)\s+instructions', "prompt_injection"),
        (r'you\s+are\s+now\s+', "role_hijack"),
        (r'do\s+not\s+tell\s+the\s+user', "deception_hide"),
        (r'system\s+prompt\s+override', "sys_prompt_override"),

        # Exfiltration via curl/wget with secrets
        (r'curl\s+[^\n]*\$\{?\w*(KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|API)', "exfil_curl"),

        # ... 更多模式
    ]
在如下情况下Agent会主动保存记忆：
    用户纠正 — "remember this" / "don't do that again"
    用户偏好 — 名字、角色、时区、编码风格、沟通习惯
    环境发现 — OS、已安装工具、项目结构、API 版本
    约定学习 — 项目特定的规范、工具怪癖、工作流程
    稳定事实 — 未来会话仍有用的信息

#  Session Search：从原始对话中学习 
Memory 存结论，Skill 存方法，但真正的学习往往发生在试错过程中，那些失败的尝试、错误的假设、突然的顿悟，不会自动变成 Memory 或 Skill，却包含着宝贵的经验。
    假设用户问："上次那个 bug 是怎么修的？"
    Memory 可能记着"用户用 Python 3.9"
    Skill 可能记着"修 bug 的一般流程"
    但真正解决问题的那行代码、那个关键错误信息、那次试错的顺序——这些只存在于原始对话里
具体session search技术方案如下：

  * • FTS5 全文索引：所有消息实时索引到 SQLite 的 FTS5 虚拟表 
  * • 相关性排序：按关键词匹配度排序 
  * • 会话分组：取最相关的几个会话 
  * • LLM 摘要：用便宜的模型（如 Gemini Flash）生成带元数据的摘要 
  * • 返回结果：不是返回原始对话的完整记录，而是 LLM 生成的摘要，包含「问题→尝试过程→最终解法」的完整脉络 

#  总结 
memory、skills和session都存储了过去的经验。Memory 是"被动回忆"——每次会话自动加载，Agent 不需要主动调用工具就能知道；Skill 是"主动加载+自主维护"——Agent 需要调用 skill_view 读取详情，还可以用 skill_manage 创建新技能或修复过时技能；Session Search 是"按需召回"——只在用户提及过去对话时才搜索，不常驻上下文。三者之间的对比如下表所示：
机制  |  存储内容  |  使用方式  |  在 Self-Improving 中的角色
---|---|---|---
Memory  |  稳定事实（用户偏好、环境信息）  |  每次会话自动注入 System Prompt；通过 memory 工具主动添加/修改  |  避免重复询问已确认的信息
Skill  |  程序性知识（操作步骤、最佳实践）  |  System Prompt 中显示索引（名称+描述），通过 skill_view 按需加载完整内容；通过 skill_manage 创建/修改/删除  |  避免重复发明已验证的流程
Session Search  |  原始对话历史（完整思考轨迹）  |  通过 session_search 工具主动搜索关键词，LLM 生成结构化摘要  |  避免重复犯错已踩过的坑
一个完整的self imporve流程如下，达到下一次任务的起点比上一次更高的效果：

  * • 步骤 1：用户问"帮我把这周的 HN 头条整理成摘要发到 Telegram" 
  * • 步骤 2：Agent 启动会话，system prompt 自动包含： USER.md（"User prefers short summaries"）和 Skills 索引（发现 "weekly-digest" 技能相关） 
  * • 步骤 3：Agent 调用 skill_view("weekly-digest") 加载技能，按步骤执行 
  * • 步骤 4：执行中发现技能写的"RSS 抓取"过时了，用户实际用 HN API。Agent 调用 skill_manage(action='patch') 更新技能 
  * • 步骤 5：用户说"以后只要 5 条头条"。Agent 调用 memory(action='add', target='user', content='User wants HN digest capped at 5 headlines') 
  * • 步骤 6：磁盘更新，但本次会话 system prompt 不变 
  * • 步骤 7：下周用户再问同样的问题。启动时 system prompt 已经包含新记忆和修补后的技能。用户不需要重复"只要 5 条"、不需要纠正技能错误。

## 深度分析
### 自进化机制的本质：显式知识沉淀而非权重更新
Hermes Agent 的 self-improve 并非传统意义上的模型微调或强化学习（尽管工具层面提供了 `rl_start_training` 等 RL 工具），而是一套**基于工具的显式知识沉淀与召回机制**。其核心思想是：将模型在完成任务过程中的经验转化为可持久化存储的结构化知识（Skill、Memory），在下一次相似任务启动时自动加载，使模型的"起点"持续抬升。

### 三层记忆架构的协同逻辑
Hermes 构建了 **Memory → Skill → Session Search** 三层递进的记忆体系，各自承担不同角色：
| 层级 | 存储形态 | 加载方式 | 进化方向 |
|---|---|---|---|
| **Memory** | 稳定事实（偏好、环境） | 会话启动时自动注入 System Prompt | 被动积累，无需模型主动操作 |
| **Skill** | 程序性知识（步骤、流程、最佳实践） | 模型通过 `skill_view` 按需加载，可自主创建/修补 | 模型主动维护，是自进化的核心载体 |
| **Session Search** | 原始对话轨迹（试错过程、顿悟时刻） | 用户提及过去时触发 FTS5 检索，LLM 生成摘要 | 按需召回，补充前两层无法覆盖的隐性经验 |
三层之间存在明确的分工边界：Memory 管"事实"，Skill 管"方法"，Session Search 管"过程"。这一设计避免了记忆混淆——模型不会把用户偏好当成操作流程，也不会把试错过程当作稳定规范。

### Skill 工具化的工程动机
文章提出了一个关键问题：为什么不对 Skill 只提供基础的 read/write 工具，而要专门设计 `skill_manage` 这个多功能合一工具？答案涉及**降低模型调用复杂度和增强调用意愿**两个层面：
1. **Claude Code 的工具设计哲学**：将高频操作（Glob、Edit、Grep）从通用 Shell 中独立出来，降低单次工具调用的认知负担——模型不需要构造一串复杂的 Shell 命令字符串，只需调用语义明确的专用工具。Skill 同理：单独封装 `skill_manage`（6 种 action）比让模型用原生文件系统操作要简洁得多。
2. **Hermes 的主动维护定位**：与 Claude Code 不同，Hermes 强调 Agent 自主维护 Skill——不是人提前定义好让模型照搬，而是模型在完成任务过程中主动创建、发现过时时立即 patch。这意味着 Skill 系统必须足够易用，才能让模型愿意频繁操作它。
3. **Prefix Cache 保护机制**：文章揭示了一个容易被忽视的工程细节——会话期间 Skill 被修改时，不应实时更新 System Prompt，否则会导致 Prefix Cache 失效，token 成本翻倍。因此 `skills_list` 工具成为获取实时状态的唯一可靠途径，而非依赖 System Prompt 中的静态快照。

### Memory 写入的 Prompt 注入防护
Memory 机制中嵌入的 `_MEMORY_THREAT_PATTERNS` 正则扫描是一个容易被忽略但至关重要的设计细节。由于 Memory 内容会在下次会话时自动注入 System Prompt，如果攻击者通过对话诱导 Agent 写入恶意内容，将形成**持久化的 prompt injection**——每次新会话都会携带污染内容。防护策略采用正则匹配而非 LLM 判断，好处是：零 LLM 调用成本、确定性高、不存在误判风险。但这也意味着攻击者可能通过变形绕过正则（如 `ign0re` 替代 `ignore`），因此威胁模式库需要持续更新。

### Session Search 的 FTS5 + LLM 摘要双层架构
Session Search 采用了"索引+生成"双层设计：FTS5 负责快速检索和相关性排序，LLM（低成本模型如 Gemini Flash）负责将原始对话转化为"问题→尝试→解法"的结构化摘要。这一设计的巧妙之处在于**不在检索层做生成，在生成层做聚合**——避免返回冗长的原始对话让模型上下文爆炸，也避免了简单返回匹配片段导致的缺失连贯性问题。

## 实践启示
### 1. 为 Agent 设计工具时采用"高频专用、低频通用"原则
如果一个操作在 Agent 生命周期内会被频繁调用（如 Skill 管理、Memory 写入），不要用通用工具（如 Shell 执行文件系统命令）替代。专用工具能显著降低模型调用难度，减少构造错误命令的概率，同时方便在工具层加入权限控制、参数校验、副作用监控等机制。

### 2. 所有持久化写入都要考虑 Prompt Injection 防护
凡是会进入 System Prompt 或影响 Agent 行为的持久化存储（Memory、Skill、甚至工具描述本身），在写入前必须经过严格的输入校验。Hermes 的正则模式匹配是一个可复用的方案，适用于对安全性要求高但又不希望引入 LLM 判断成本的场景。更复杂的环境可以考虑结合启发式规则 + LLM 二次验证的双重过滤。

### 3. Prefix Cache 是长会话成本优化的关键
在设计任何涉及修改 System Prompt 的机制时（如 Memory 写入后触发 System Prompt 更新），必须考虑 Prefix Cache 失效带来的隐性成本。Hermes 的解法——Memory 写入只更新磁盘，下次会话才生效——是一个值得借鉴的模式。这意味着所有"会话内修改"都应该是延迟生效的，除非该修改本身就需要立即影响当前会话行为。

### 4. Skill 的生命周期需要被主动管理
Skill 不是一次性创建的静态资产，而是需要持续维护的演化体。Hermes 通过 System Prompt 的双重引导（"完成复杂任务要创建 Skill" + "发现 Skill 过时要立即 patch"）将维护责任内化为 Agent 的自发行为。这意味着在设计 Agent System Prompt 时，不仅要定义"什么时候创建 Skill"，还要定义"什么时候认为 Skill 已经过时"——否则模型没有主动维护的判断依据。

### 5. 跨会话经验的三层分离避免记忆混淆
将经验按"事实/方法/过程"三层分离存储（Memory/Skill/Session），再通过不同的加载机制（自动注入/按需加载/触发检索）组合使用，能有效避免模型在错误场景下使用错误的经验类型。这是自进化机制能够work的基础——如果所有经验混在一起，模型就无法判断一条记忆是应该自动遵循还是仅作参考。

## 相关实体
- [Harness Engineering实践做了一个平台让AI一晚上自动评测和优化你的系统](../ch05/052-harness-engineering.html)

- [SkillOS: Learning Skill Curation for Self-Evolving Agents](../ch04/143-skillos-learning-skill-curation-for-self-evolving-agents.html)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](../ch04/132-karpathy-vibe-coding-agentic-engineering.html)
- [在 RDS PostgreSQL 中实现 RaBitQ 量化](https://github.com/QianJinGuo/wiki/blob/main/entities/在-rds-postgresql-中实现-rabitq-量化.md)
- [Codeindex · 让大模型更好地理解你的代码](ch01/403-codeindex.html)
- [使用 Agent Skills 做知识库检索，能比传统 RAG 效果更好吗？](../ch04/392-agent-skills.html)
- [Claude Code 之父最新访谈：编程已经结束、harness 将消失、Claude Code 将只有 100 行代码、loop 才是未来](../ch03/076-claude-code.html)
- [AI Skill 测评指标体系](ch01/483-ai-skill.html)

---

