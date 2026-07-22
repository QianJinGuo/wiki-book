---
title: LLM agent脚手架如何具备自进化能力？——以hermes agent为例
source_url: https://mp.weixin.qq.com/s/OcCtw7lrAvXKwOoIH_Gxsg
publish_date: 2026-05-09
tags: [wechat, article, claude, agent, llm, gemini]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 059000c12153b40f278376f5b2d2afc466ab8f43bc7b585c4ff3a2b3c1bcdd7c
---
# LLM agent脚手架如何具备自进化能力？——以hermes agent为例
#  前言 
笔者之前讲解了claude code这一code agent脚手架(两万字详解Claude Code源码核心机制)，和cc相比，最近大火的 hermes agent 定位则是更加日常的、通用的agent脚手架，体现在system prompt内容（强调用来完成问答、代码、分析、创作、工具执行等全场景任务）、工具集设计（更加丰富的Web 与浏览器工具、文本&语音等多模态工具）、多平台使用（Telegram、Discord、微信等多平台发送消息、调用远端执行后段）等方面。hermes agent更加强调是其“自进化（self-improve）”机制，本文将会基于hermes agent，讲解如果想让agent脚手架具备自进化能力，需要配套构建哪些机制。 
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
        new_string="docker compose up -d"  # 新版 Docker 语法  
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