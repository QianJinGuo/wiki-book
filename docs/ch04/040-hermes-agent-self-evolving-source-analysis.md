# hermes-agent-self-evolving-source-analysis

## Ch04.040 hermes-agent-self-evolving-source-analysis

> 📊 Level ⭐⭐ | 26.4KB | `entities/hermes-agent-self-evolving-source-analysis.md`

前言笔者之前讲解了claude code这一code agent脚手架(两万字详解Claude Code源码核心机制)，和cc相比，最近大火的 hermes agent 定位则是更加日常的、通用的agent脚手架，体现在system prompt内容（强调用来完成问答、代码、分析、创作、工具执行等全场景任务）、工具集设计（更加丰富的Web 与浏览器工具、文本&语音等多模态工具）、多平台使用（Telegram、Discord、微信等多平台发送消息、调用远端执行后段）等方面。hermes agent更加强调是其"自进化（self-improve）"机制，本文将会基于hermes agent，讲解如果想让agent脚手架具备自进化能力，需要配套构建哪些机制。
首先需要澄清的是，虽然hermes agent提供了调用自家tinker-atropos训练平台的RL工具（rl_start_training、rl_get_results等），但是这里所说的self imporve并非是进行模型权重更新，而是一套显式的知识沉淀机制——模型通过工具主动记录经验，下次会话自动加载。
self-improving机制主要基于更加完善的memory机制来记住用户偏好（比如用户倾向于用pandas库处理csv文件）以及用沉淀skill机制来保存复杂的操作流程（比如整理一份文件需要先清洗空值，再按日期分组，最后计算平均值）。Hermes能够做到self imporving 机制需要在system prompt、工具设计、memory等各个基础组建上做针对性的定制。
System Prompt 的引导设计self imporve机制需要利用skill来不断沉淀、优化操作流程，因此在system prompt里边进行了重点说明。
1.首先是明确说明了如果遇到复杂操作，需要沉淀为skill，方便后续调用，提高自身能力，如果发现skill有问题，也要及时修复，具体prompt如下：
完成复杂任务（调用工具 5 次及以上）、修复棘手报错，或是摸索出一套实用流程后，要用 skill_manage 将这套方法保存为技能，方便后续复用。 使用技能时如果发现内容过时、流程不全或存在错误，主动立即用 skill_manage(action='patch') 修补，不要等他人提醒。得不到维护的技能，终将变成累赘隐患。
2.模型在回复前先查看skill，看看之前有没有沉淀下来有用的skills，避免绕弯路：
回复前，请先通读下方所有技能。若某项技能与你的任务匹配，哪怕只是部分相关，你都必须用skill_view(name) 加载该技能，并严格遵循其指令执行。 宁可多加载无关技能，也绝不遗漏关键流程、潜在坑点和既定工作规范。技能中包含专属专业知识：API 接口地址、专属工具命令、经过验证的成熟工作流，效果远优于通用处理方式。 即便你认为只用网页搜索、终端等基础工具就能完成任务，也依然要加载对应技能。 技能同时固化了用户在代码审查、方案规划、测试等任务上的惯用处理方式、格式规范和质量标准。哪怕是你本来就会做的任务，也要加载技能 —— 因为技能规定了在此环境下必须按这套标准来做。 若加载的技能存在问题，使用 skill_manage(action='patch') 进行修复。完成复杂任务或多轮迭代任务后，主动询问是否将本次流程保存为新技能。如果你加载的技能存在步骤缺失、命令错误、未标注潜在风险等问题，请在任务结束前主动更新完善该技能。
Self-Improve 相关工具设计hermes agent的self improve非常依赖skills能力，因此还专门为skills设计了3种工具：
工具功能在 Self-Improve 中的作用skills_list列出所有可用技能扫描有哪些技能可用，只返回名称和描述（渐进式披露）skill_view读取指定技能的完整内容发现相关技能后加载详情，支持读取 SKILL.md 或 references/、templates/ 等子目录文件skill_manage创建/修改/删除技能完成任务后保存经验（create），或修复过时技能（patch/edit），或清理废弃技能（delete）其中skill_manage设计的最为复杂，其schema如下。skill_manage可实现"create", "patch", "edit", "delete", "write_file", "remove_file"这6种能力，这6种能力其实本质上又进一步对应6种函数实现，统一交由skill_manage调度可以减少工具定义的个数。不同能力可能仅需要传入部分参数，比如 patch能力对应_patch_skill这个底层函数，只需要传入old_string、new_string、file_path、replace_all。
SKILL_MANAGE_SCHEMA = {
        {
            {
                },
            },
    }# 使用skill_manage工具实现patch功能的例子
skill_manage(
    action="patch",
    name="docker-setup",
    old_string="docker-compose up -d",
    new_string="docker compose up -d"  # 新版 Docker 语法
)skill_manage 6种能力详细的说明如下表所示：
Action用途关键参数典型使用场景create创建新技能name, content, category完成复杂任务（5+ tool calls）后保存经验patch局部修改（最常用）name, old_string, new_string修复过时命令、添加新步骤、更新错误处理edit全文重写name, content技能大改版、重构结构、合并多个技能delete删除技能name清理废弃技能、合并重复技能后删除旧版write_file添加辅助文件name, file_path, file_content添加模板、脚本、参考文档到 references//templates//scripts/remove_file删除辅助文件name, file_path清理无用的辅助文件这里解释一下可能存在的疑问：
• 问：system prompt会加载skills的描述，为啥还需要skills_list工具？ 答：System Prompt 中的技能索引是会话开始时的静态快照，如果会话期间技能被修改（skill_manage 创建/更新/删除），不能实时更新 System Prompt，否则会导致 Prefix Cache 失效，token 成本翻倍，因此需要调用skills_list 工具实时获取skills最新状态• 问：对skills专门设计工具是必要的吗？其他框架不也没有skills工具？ 答：首先这个跟工具设计模式有关，举另外一个例子，比如执行shell命令，当然可以只提供一个shell工具就能完成很复杂的搜索、替换等操作（codex更倾向于这种方案），但是你也可以把最常用的几个功能比如Glob、edit、grep这种shell本身也能完成的能力单独封装成工具（claude code倾向于这种方式），这样能让模型调用工具更简单，更不容易出错（试想一下如果用原生shell命令实现替换需要一串长长的指令，更容易出错）。回到skill的问题上来，不为skills设计工具当让也可以用基础的edit、read等功能对skill进行操作，只不过对模型来说更难，单独设计成工具也能增强模型调用相关工具的意愿。hermes agent定位就是让 Agent 能够对skills自主创建（完成复杂任务后保存经验）、即时修复（发现过时时立即 patch）、版本演化（技能随使用不断进化），其他agent脚手架通常是不需要agent自己自动迭代skills，人提前定义好就行，因此hermes agent有必要针对skills设计一套专有工具。和self imporve功能相关的除了skill相关工具，也有`session_search` 工具，基于 SQLite FTS5 的跨会话文本检索工具，让 Agent 能回顾自己过去的完整思考轨迹。session search机制会在下文介绍。遇到如下情况时，会触发这个工具：
主动在以下场景使用本规则：当用户说出「我们之前做过这个」「还记得当时」「上次」这类表述时……只要属于跨会话场景，就果断检索；检索成本低、速度快。宁可主动检索核实，也不要凭空猜测，或是让用户重复说明。
更加完善的memory机制Hermes主要依赖于MEMORY和USER两种md文件用于记录用户的偏好。Hermes还专门为模型设计了"memory"工具让 Agent 把重要的用户信息写入持久化存储。记忆文件默认是加载到system prompt中的，但本次会话的 system prompt 并不会改变。记忆内容要等到下次会话启动时才作为新快照读入。这种设计是为了保护 prefix cache，如果每次写 memory 都更新 system prompt，长会话的成本会翻倍。
memory机制主要依赖于如下两个文件：
MEMORY.md：工作笔记——环境事实、项目约定、工具怪癖
USER.md：用户画像——名字、角色、偏好、沟通风格为了防止 prompt 注入攻击注入工具，这两个文件写入前会扫描内容，命中任何威胁模式都会拒绝写入。这是 self-improving 的关键防护，防止攻击者通过诱导 Agent 记录恶意内容来持久化污染 system prompt。主要原理是基于正则表达式进行恶意注入识别：
_MEMORY_THREAT_PATTERNS = [

    # Prompt injection
(r'ignore\s+(previous|all|above|prior)\s+instructions', "prompt_injection"),
    (r'you\s+are\s+now\s+', "role_hijack"),
    (r'do\s+not\s+tell\s+the\s+user', "deception_hide"),
    (r'system\s+prompt\s+override', "sys_prompt_override"),

    # Exfiltration via curl/wget with secrets
(r'curl\s+[^\n]*\$\{?\w*(KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|API)', "exfil_curl"),

    # ... 更多模式
]在如下情况下Agent会主动保存记忆：
用户纠正 — "remember this" / "don't do that again"
用户偏好 — 名字、角色、时区、编码风格、沟通习惯
环境发现 — OS、已安装工具、项目结构、API 版本
约定学习 — 项目特定的规范、工具怪癖、工作流程
稳定事实 — 未来会话仍有用的信息Session Search：从原始对话中学习Memory 存结论，Skill 存方法，但真正的学习往往发生在试错过程中，那些失败的尝试、错误的假设、突然的顿悟，不会自动变成 Memory 或 Skill，却包含着宝贵的经验。
假设用户问："上次那个 bug 是怎么修的？"
Memory 可能记着"用户用 Python 3.9"
Skill 可能记着"修 bug 的一般流程"
但真正解决问题的那行代码、那个关键错误信息、那次试错的顺序——这些只存在于原始对话里具体session search技术方案如下：
• FTS5 全文索引：所有消息实时索引到 SQLite 的 FTS5 虚拟表• 相关性排序：按关键词匹配度排序• 会话分组：取最相关的几个会话• LLM 摘要：用便宜的模型（如 Gemini Flash）生成带元数据的摘要• 返回结果：不是返回原始对话的完整记录，而是 LLM 生成的摘要，包含「问题→尝试过程→最终解法」的完整脉络总结memory、skills和session都存储了过去的经验。Memory 是"被动回忆"——每次会话自动加载，Agent 不需要主动调用工具就能知道；Skill 是"主动加载+自主维护"——Agent 需要调用 skill_view 读取详情，还可以用 skill_manage 创建新技能或修复过时技能；Session Search 是"按需召回"——只在用户提及过去对话时才搜索，不常驻上下文。三者之间的对比如下表所示：
机制存储内容使用方式在 Self-Improving 中的角色Memory稳定事实（用户偏好、环境信息）每次会话自动注入 System Prompt；通过 memory 工具主动添加/修改避免重复询问已确认的信息Skill程序性知识（操作步骤、最佳实践）System Prompt 中显示索引（名称+描述），通过 skill_view 按需加载完整内容；通过 skill_manage 创建/修改/删除避免重复发明已验证的流程Session Search原始对话历史（完整思考轨迹）通过 session_search 工具主动搜索关键词，LLM 生成结构化摘要避免重复犯错已踩过的坑一个完整的self imporve流程如下，达到下一次任务的起点比上一次更高的效果：
• 步骤 1：用户问"帮我把这周的 HN 头条整理成摘要发到 Telegram"• 步骤 2：Agent 启动会话，system prompt 自动包含： USER.md（"User prefers short summaries"）和 Skills 索引（发现 "weekly-digest" 技能相关）• 步骤 3：Agent 调用 skill_view("weekly-digest") 加载技能，按步骤执行• 步骤 4：执行中发现技能写的"RSS 抓取"过时了，用户实际用 HN API。Agent 调用 skill_manage(action='patch') 更新技能• 步骤 5：用户说"以后只要 5 条头条"。Agent 调用 memory(action='add', target='user', content='User wants HN digest capped at 5 headlines')• 步骤 6：磁盘更新，但本次会话 system prompt 不变• 步骤 7：下周用户再问同样的问题。启动时 system prompt 已经包含新记忆和修补后的技能。用户不需要重复"只要 5 条"、不需要纠正技能错误。

## 深度分析
**1. Self-Improving的本质：显式知识沉淀而非隐式权重更新**
Hermes Agent的自进化机制之所以值得关注，在于它选择了一条完全不同于模型微调的道路：不是通过RLHF或模型权重更新来实现能力提升，而是通过建立一套显式的知识沉淀系统，让模型通过工具主动记录经验并在后续会话中自动加载。这两种路径的本质区别在于：权重更新是全局的、不可逆的、难以撤回的；而显式知识沉淀是局部的、可审计的、可即时修补的。对于需要高度可靠性和可预测性的生产环境，显式知识沉淀的可控性远优于黑箱式的权重更新。此外，显式知识以结构化的skill和memory形式存在，使得人类可以直接检查、修改和删除，这为AI系统的可解释性和安全性提供了重要基础。
**2. Memory/Skill/Session Search的三层架构设计：覆盖不同认知需求**
Hermes的self-improving系统由三个相互补充的机制组成，每一层针对不同类型的知识：Memory层存储稳定的事实性信息（用户偏好、环境配置），特点是会话启动时自动注入，Agent无需主动调用即可感知；Skill层存储程序性知识（操作步骤、最佳实践），需要Agent主动调用skill_view加载，并在使用中发现问题时主动修补；Session Search层则存储试错过程中的完整思考轨迹，按需检索，只在用户提及过去对话时才激活。这三层设计的精妙之处在于：每层的持久化策略和调用频率与该层知识的更新频率和认知价值高度匹配。稳定性高的信息（如用户偏好）适合低频更新的持久化存储；需要频繁试错积累的信息（如bug修复过程）适合按需检索而非常驻上下文。
**3. Prompt注入防护的三层防御体系**
Hermes在Memory写入层面引入了正则表达式-based的威胁模式识别，这是一个务实但有限的安全措施。务实之处在于：它以极低的计算成本阻止了最常见的prompt注入模式，无需引入复杂的NLP模型进行语义分析。局限性在于：正则表达式无法防御语义层面的注入攻击（如通过自然语言描述绕过模式匹配）。这提示我们：对于self-improving系统，prompt注入防护需要多层策略——输入层（正则/规则过滤）、推理层（让模型在写入前对内容进行合理性判断）和审计层（事后检查已记录的内容）。目前大多数agent框架只实现了第一层，在高对抗性场景下这是不够的。
**4. Skill工具化的工程哲学：降低调用门槛 vs. 保持灵活性**
Hermes选择为skill机制设计专门的工具（skill_list/skill_view/skill_manage），而非使用通用的read/write工具来操作skill文件——这是一个有深刻工程哲学考量的设计决策。通用工具的灵活性更高（可以用一个工具完成所有操作），但会提高模型调用的认知负担和错误率；专用工具的灵活性更低，但让模型的工具选择更清晰、更不容易出错。这反映了agent系统设计中一个核心的张力：如何在"工具的专业化"和"工具的统一性"之间取得平衡。Hermes的答案是：对于高频、标准化的操作（如skill管理），专用工具优于通用工具；对于低频、创新的操作（如任意文件编辑），通用工具更合适。
**5. Prefix Cache保护策略：性能优化与功能正确性的博弈**
Hermes选择"写入memory时不更新当前会话的system prompt，而是等到下次会话启动时才应用新记忆"——这是一个在性能和正确性之间的务实权衡。如果每次memory写入都实时更新system prompt，可以保证即时性，但会破坏prefix cache（长会话成本翻倍）。选择牺牲即时性换取成本控制，意味着系统设计者认为"下次会话能用到正确的记忆"比"当前会话感知到记忆更新"更重要。这个权衡在多会话、长周期使用的场景下是合理的，但在单次长时间会话中可能导致用户体验的不连续感。设计self-improving系统时需要明确：目标使用模式是长单会话还是短多会话，这将直接影响是否采用类似的缓存保护策略。

## 实践启示
**1. 为agent构建知识沉淀系统时的三层分离原则**
在设计自己的agent知识沉淀系统时，建议采用Memory/Skill/Session Search三层分离架构：Memory层存储用户偏好和环境配置等稳定事实，使用key-value或文档形式，会话启动时自动加载；Skill层存储标准操作流程和最佳实践，使用结构化文档形式，Agent主动按需加载；Session Search层使用FTS全文索引存储完整对话历史，支持按关键词检索和LLM摘要。三层分离的关键好处是：每层的存储格式、加载策略和更新频率可以独立优化，避免用单一机制处理所有类型的知识带来的系统性低效。
**2. Skill的"自主创建+即时修复"机制的实现要点**
让Agent能够自主创建和修复skill，需要在system prompt中明确三个要素：触发条件（"完成复杂任务5+次工具调用后应保存为skill"）、维护责任（"发现skill过时时立即patch，不要等他人提醒"）和质量标准（"skill包含步骤缺失、命令错误、潜在风险时应主动更新"）。技术实现上，skill_manage工具的patch能力是最核心的——它允许Agent用old_string/new_string的局部替换来更新skill内容，而无需重写整个skill文档，这大大降低了Agent维护skill的认知负担。
**3. Prompt注入防护的最小可行实现**
对于在构建self-improving agent的团队，建议至少实现以下prompt注入防护层：第一层，输入过滤，使用正则表达式过滤最常见的注入模式（ignore previous instructions、you are now、do not tell the user等）；第二层，上下文验证，在Agent写入记忆前，让其用原始语言复述"你正在记录什么，为什么要记录"，通过复述一致性判断是否存在注入意图；第三层，内容审计，定期扫描已存储的memory/skill内容，检测异常模式或与已知工作不相关的内容。成本敏感的场景可以从第一层开始，逐步增加防御深度。
**4. Session Search的技术选型参考**
如果需要实现跨会话的历史检索，Hermes使用的SQLite FTS5是一个值得参考的选择：它无需独立的搜索服务、查询速度快、支持BM25相关性排序，且与项目文件共存在单一SQLite数据库中降低了运维复杂度。结合LLM生成结构化摘要（而非返回原始对话）可以显著降低token消耗。选型建议：如果团队已有Elasticsearch/Typesense等专用搜索服务，可以直接集成；如果希望保持轻量，SQLite FTS5是生产可用的选择；如果对语义检索有更高要求（如理解同义词、上下文），可以加一层向量嵌入+近似最近邻检索。
**5. Prefix Cache保护策略的工程权衡决策框架**
决定是否采用"写入不更新当前会话"的策略，需要评估两个因素：目标使用模式（长单会话 vs. 短多会话）和记忆更新的即时性需求（当前会话是否需要感知最新更新）。如果系统主要面向长单会话用户（如Code Agent），记忆更新的即时性更重要，可能需要接受prefix cache失效的代价；如果主要面向短多会话用户（如日常助手），保护prefix cache、控制成本更重要，"下次会话生效"是可接受的权衡。建议在实现前做明确的use case分析，而不是默认套用某一种策略。
**6. Agent工具设计的专业化 vs. 统一性权衡指南**
当某个操作模式在系统中出现频率高、步骤标准化、错误后果严重时，应当考虑将其专用工具化（而不是用通用工具的组合来替代）。判断标准：调用频率（每天多次 vs. 每月一次）、操作步骤是否标准化（高度标准化可以封装为单一工具，灵活多变的操作更适合通用工具）、错误成本（patch操作错误可能导致skill失效，需要专用工具提供更清晰的参数校验）。skill_manage是一个很好的参考案例——它的6种能力（create/patch/edit/delete/write_file/remove_file）如果拆成6个独立工具会增加工具数量，用统一的action参数调度则保持了工具定义的简洁性。

## 相关实体
- [企业级AI记忆基质三层架构：事实/交互/行动记忆](https://github.com/QianJinGuo/wiki/blob/main/entities/enterprise-ai-memory-substrate-three-layer-architecture.md)
- [AI Coding Agent 记忆系统](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-coding-agent-memory-system.md)
- [AI Agent 记忆系统架构](https://github.com/QianJinGuo/wiki/blob/main/entities/how-ai-agent-memory-works.md)
- [Self-Evolving Agents 系统性综述](https://github.com/QianJinGuo/wiki/blob/main/entities/self-evolving-agents-survey.md)
- [Hermes Agent 记忆系统深度拆解](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-memory-system-vs-openclaw.md)
- [Agent Memory System Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-system-design.md)
- [KAIROS — Claude Code 常驻协作范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/kairos-claude-code-paradigm.md)
- [上下文工程：三种 Agent Memory 方案对比实验](https://github.com/QianJinGuo/wiki/blob/main/entities/context-engineering-three-memory-paradigms.md)

- [SkillClaw](https://github.com/QianJinGuo/wiki/blob/main/entities/skillclaw.md)
- [Agent 自我改进的六条路](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-self-improvement-six-mechanisms.md)
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-skill-system-winty.md)
- [GBrain](https://github.com/QianJinGuo/wiki/blob/main/entities/gbrain.md)
- [Demis Hassabis YC 专访：AGI / 记忆 / Agent / 创造性观点集](https://github.com/QianJinGuo/wiki/blob/main/entities/demis-hassabis-yc-interview-2026.md)
- [OpenHuman: AI Agent 持久记忆框架](https://github.com/QianJinGuo/wiki/blob/main/entities/openhuman-ai-agent-memory-tree-tokenjuice.md)
- [Agent Memory System 设计指南](https://github.com/QianJinGuo/wiki/blob/main/queries/agent-memory-system-design.md)
- [上下文工程 - 三种Memory方案对比](https://github.com/QianJinGuo/wiki/blob/main/entities/context-engineering-three-memory-paradigms-comparison.md)

---

