# 开源 AI 知识管理搭档 Obsidian + Claude Code 完整集成指南

## Ch01.240 开源 AI 知识管理搭档 Obsidian + Claude Code 完整集成指南

> 📊 Level ⭐⭐ | 36.6KB | `entities/开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md`

[开源 Ai 知识管理搭档 Obsidian Claude Code 完整集成指南](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md)

##  核心痛点：文件分散与混乱
Claude Code 的配置分散在多个位置：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:25]
位置  |  用途
---|---
` ~/.claude/CLAUDE.md  ` |  全局指令
` ~/.claude/plans/  ` |  计划文件
` ~/.claude/projects/  ` |  每个项目的记忆
` ~/.claude/skills/  ` |  可复用技能
` {repo}/CLAUDE.md  ` |  项目内指令（随仓库提交）
一旦你同时维护多个仓库，这些文件就会变得很分散，很难统一管理。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:35]
如果直接把代码仓库当成 Obsidian Vault 打开，虽然能看到这些 Markdown 文件，但问题也很明显：各种 PNG、JS 文件、lock 文件，甚至  ` node_modules  ` 也会一股脑出现在文件列表里，整个视图很快就乱掉了。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:37]
Obsidian 虽然提供了「排除文件」的设置（设置 > 文件与链接），但它只是  ** 软隐藏  ** ——文件看起来不见了，其实还是被索引着。对这个问题来说，帮助有限。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:39]

##  五大集成策略
###  策略 1：独立开发者 Vault + 符号链接
** 适合场景  ** ：同时维护多个项目，希望统一搜索和管理信息。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:45]
思路很简单：建一个独立的 Obsidian Vault，不放在任何代码仓库里，然后用符号链接把你关心的内容「拉」进来。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:47]

    # 创建独立仓库（不在任何项目里）
    mkdir ~/Developer-Vault
    cd ~/Developer-Vault

    # 链接 Claude Code 全局配置
    ln -s ~/.claude claude-global

    # 链接各个项目
    ln -s ~/projects/my-app my-app
    ln -s ~/projects/my-api my-api
然后在  ` .obsidian/app.json  ` 里过滤掉代码噪音：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:60]
    {
     "userIgnoreFilters": ["node_modules/", ".next/", "dist/", ".git/", ".vercel/"]
    }
再配合  ** File Explorer++  ** ，按扩展名隐藏  ` *.js  ` 、  ` *.ts  ` 、  ` *.png  ` 这些文件，界面会干净很多。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:66]
** 这样做的效果是  ** ：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:68]

* • 可以统一搜索所有  ` CLAUDE.md  ` 、计划、记忆和技能
* • 能跨项目做 Dataview 查询
* • 不同项目之间可以互相链接笔记
* • 各个代码仓库本身不会被  ` .obsidian/  ` 污染
** 需要注意的点  ** ：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:85]

* • Obsidian 只支持  ** 目录级  ** 符号链接，不支持单文件
* • 移动端对符号链接支持不太稳定，建议不要同步这些目录
* • Obsidian Git 插件只会跟踪当前仓库，不会跟踪这些链接进来的内容
* • 在文件浏览器里跨链接移动文件，基本是行不通的

###  策略 2：Vault = Claude Code 工作目录
** 适合场景  ** ：做个人知识管理 / 「第二大脑」这类工作流。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:94]
这是目前社区里比较流行的一种方式：直接把 Obsidian Vault 当成 Claude Code 的工作目录来用。Vault 根目录的  ` CLAUDE.md  ` 一身二用——既是给 Claude 的指令，也是你在 Obsidian 里阅读的笔记。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:96]
    my-vault/
    ├── CLAUDE.md              # Claude 用它，Obsidian 也能直接读
    ├── .claude/               # 技能、钩子、配置
    ├── daily-notes/
    ├── projects/
    │   ├── pixelmuse/
    │   └── my-api/
    ├── research/
    ├── decisions/
    └── templates/
** 社区里常见的做法大概是这样  ** ：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:109]

* •  ** 根目录的  ` CLAUDE.md  ` ** ：当作整个 Vault 的「操作手册」
* •  **` VAULT-INDEX.md  ` ** ：给 Claude 用的入口，相当于一个实时总览
* •  ** 每个目录下配一个  ` index.md  ` ** ：由 Claude 自动维护（新建/删除文件时更新）
比如  ballred/obsidian-claude-pkm  [1]  这种项目，会再加一层目标管理（年 / 月 / 周）。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:115]
还有像  ** Noah Vincent  ** 的  IPARAG 结构  [2]  ，本质上是把内容分成：收件箱、项目、领域、资源、归档，以及类似 Zettelkasten 的笔记体系。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:116]
这种方式在  ** 你的 Vault 本身就是工作内容  ** 时特别好用，比如写作、研究、个人项目管理。但如果你已经有一套成熟的代码仓库结构，再硬套进来，反而会比较别扭。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:118]

###  策略 3：MCP 桥接
** 适合场景  ** ：既想保持代码仓库干净，又希望 Claude 能随时访问你的知识库。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:122]
这种方式的思路是：代码仓库和 Obsidian 完全分开，但通过 MCP 把两边「连起来」。你还是在项目目录里正常用 Claude Code，但它可以随时去 Obsidian 里查资料。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:124]

    # 在项目仓库中正常工作
    cd ~/projects/my-app
    claude

    # 同时可以访问 Obsidian 里的内容
    # 不需要符号链接，也不用改仓库结构
比如  obsidian-claude-code-mcp  [3]  这样的插件，会通过 WebSocket 自动发现你的仓库（默认端口 22360），支持多个仓库同时使用。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:123]
还有  Claudesidian MCP  [4]  ，在此基础上加了语义搜索（基于  ** Ollama embedding  ** ）和更完整的 agent 能力，用起来更像一个「会查资料的助手」。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:125]
** 这种方案的优点是  ** ：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:128]

* • 代码仓库完全干净，不需要引入 Obsidian
* • 不用符号链接，也不用调整项目结构
* • 可以直接访问你的笔记、计划和上下文
** 需要权衡的点：  ** ：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:134]

* • 使用时需要一直开着 Obsidian
* • 整体多了一层 MCP，系统稍微复杂一点

###  策略 4：每个仓库一个 Vault
** 适合场景  ** ：只专注单个项目，想要简单直接的配置。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:141]
这种方式最简单：直接把每个代码仓库当成一个 Obsidian Vault 来用。配合  ` userIgnoreFilters  ` 把非 Markdown 文件隐藏掉（下面会讲怎么处理文件混乱的问题）。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:142]
同时记得把  ` .obsidian/  ` 加进  ` .gitignore  ` ，避免污染代码仓库：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:144]

    # Obsidian
    .obsidian/
    .trash/
** 这种方式的好处是  ** ：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:151]

* • 配置简单，没有额外结构
* • 每个项目自成一体，干扰少
** 但缺点也很明显  ** ：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:156]

* • 没法跨项目搜索
* • 多项目切换比较麻烦
* • 看不到全局  ` ~/.claude/  ` 的计划、记忆和项目内容

###  策略 5：QMD + 会话同步
** 适合场景  ** ：重度使用 Claude Code，希望把「上下文」真正沉淀下来。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:164]
这是偏进阶的一套玩法，核心思路是：使用  ** Shopify CEO Tobi Lutke  ** 的  QMD  [5]  把 Claude 的对话也当成知识来管理。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:165]
大致是三样东西组合在一起：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:167]
1. ** QMD  ** ：在 Markdown 仓库上做语义搜索，比简单的 grep 更省 token
2. ** sync-claude-sessions  ** ：会话结束时自动导出为 Markdown
3. **` /recall  ` 技能  ** ：新会话开始前，把相关上下文拉回来
这样一来，Claude Code 的每次对话都会变成可搜索的笔记，慢慢沉淀在你的本地仓库里。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:173]
** 这套方案的特点  ** ：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:176]

* • 全部本地运行，不依赖云端
* • 会话可以复用，不再是「一次性上下文」
* • 查历史信息比单纯关键词搜索更高效
一些开发者的反馈也比较一致：用 QMD 做语义分块之后，token 使用和处理时间都有明显下降（有的场景能到 60%+）。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:181]
** 需要权衡的点  ** ：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:184]

* • 搭建成本更高，需要多工具配合
* • 需要一定使用习惯（比如定期 recall、维护结构）

##  解决文件混乱问题
如果你已经把代码仓库当作 Obsidian vault 使用，结果文件列表里全是 PNG 和各种资源文件，可以这样处理。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:190]

###  步骤 1：通过  ` app.json  ` 排除目录
打开「设置 → 文件与链接 → 排除文件」，或者直接编辑  ` .obsidian/app.json  ` ：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:194]
    {
     "userIgnoreFilters": ["node_modules/", ".next/", "dist/", ".git/", ".vercel/", "public/"]
    }

###  步骤 2：用正则排除文件类型
在同一个「排除文件」设置里，可以加一些正则规则，把不关心的文件类型隐藏掉：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:202]
    /.*\.png/
    /.*\.jpg/
    /.*\.jpeg/
    /.*\.svg/
    /.*\.gif/
    /.*\.ico/
    /.*\.webp/
    /.*\.js/
    /.*\.ts/
    /.*\.tsx/
    /.*\.jsx/
    /.*\.css/
    /.*\.json/
    /.*\.lock/
** 注意  ** ：这只是「软隐藏」。这些文件在界面上看不到了，但 Obsidian 还是会在内部索引它们，所以并不是彻底隔离。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:220]

###  步骤 3：用 File Explorer++ 做「硬过滤」
可以装一个  File Explorer++  [6]  插件，它支持按文件名或路径做通配符 / 正则过滤，而且可以随时开关，比内置的排除功能更灵活。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:223]

###  步骤 4：关闭「检测所有文件扩展名」
在「设置 → 文件与链接」里，把「检测所有文件扩展名」关掉。这样像 JS、TS、JSON 这些 Obsidian 本身不处理的文件，就不会再出现在文件列表里。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:227]

###  替代方案：File Ignore 插件
如果你想要更彻底一点，可以用  File Ignore  [7]  插件。它支持  ` .gitignore  ` 风格的规则，并通过给文件加前缀的方式，让 Obsidian 在索引时直接跳过这些文件。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:231]
不过要注意，这种方式会  ** 实际修改文件名  ** ，所以更适合你能接受这种改动、或者本身就是个人仓库的场景。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:233]

##  插件推荐
###  开发者 Vault 必备
插件  |  用来做什么
---|---
File Explorer++  [6]  |  用通配符 / 正则过滤文件，隐藏  ` *.js  ` 、  ` *.png  ` 等，支持一键开关
Dataview  [8]  |  跨所有  ` CLAUDE.md  ` 做查询，比如项目状态、计划汇总
Templater  [9]  |  用模板生成统一结构的  ` CLAUDE.md  ` ，减少重复工作

###  Obsidian 内直接用 Claude Code（选一个）
插件  |  用法特点
---|---
Claudian  [10]  |  侧边栏聊天形式，支持不同权限模式（YOLO / 安全 / 计划）
Agent Client  [11]  |  集成多个模型（Claude / Codex / Gemini），支持 @ 引用笔记
Claude Sidebar  [12]  |  更接近终端体验，自动启动 Claude Code，支持多标签

###  MCP 插件（远程访问）
如果你不想把 Obsidian 和代码仓库绑在一起，可以用 MCP 这类插件做远程访问：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:256]
插件  |  用法特点
---|---
obsidian-claude-code-mcp  [3]  |  自动发现仓库，Claude Code 可以直接访问，不用  ` cd `
Claudesidian MCP  [4]  |  更完整的代理模式，支持语义搜索（Ollama）

###  其他实用插件
插件  |  用来做什么
---|---
Folder Note  [13]  |  给文件夹绑定一个说明页，点击文件夹就能打开对应笔记
File Hider  [14]  |  支持右键隐藏单个文件或文件夹，适合临时清理视图
Hide Folders  [15]  |  按规则控制文件夹的显示与隐藏，用起来更灵活

##  Dataview 查询技巧
给  ` CLAUDE.md  ` 加一点结构化信息之后，Dataview 的价值会一下子体现出来。很多原本分散的信息，都可以用查询统一整理出来。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:272]

###  给每个  ` CLAUDE.md  ` 加 frontmatter
    ---
    type: claude-config
    project: my-app
    stack: [nextjs, tailwind, supabase]
    status: active
    ---

###  查询所有项目配置
    ```dataview
    TABLE project, stack, status
    FROM ""
    WHERE type = "claude-config"
    SORT project ASC
    ```

###  列出所有 Claude 计划（按最近更新）
    ```dataview
    TABLE file.mtime as "最后修改"
    FROM "claude-global/plans"
    SORT file.mtime DESC
    ```

###  配合 Templater 自动生成  ` CLAUDE.md  `
    ---
    type: claude-config
    project: <% tp.system.prompt("项目名称") %>
    status: active
    date: <% tp.date.now("YYYY-MM-DD") %>
    ---

    # <% tp.system.prompt("项目名称") %> — Claude Code 配置
    ## 技术栈
    -

    ## 代码质量
    -

    ## 关键架构
    -

    ## 环境变量
    -

##  Obsidian CLI 的突破性进展
Obsidian  ` 1.12  ` 引入的 CLI，可以说把整个集成方式往前推了一大步。现在像 Claude Code、Codex、Gemini CLI 这类工具，都可以直接「使用」 Obsidian，而不只是简单地读文件。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:329]
有开发者在一个 4,000+ 文件、16GB 的仓库上做过测试，结果很直观：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:331]

* •  ** 找孤立笔记  ** ：从十几秒降到不到 1 秒（大约 50 倍提升）
* •  ** 全仓搜索  ** ：也有明显加速
本质上，它解决的是一个老问题：以前 AI 只能用 grep 这种方式「硬扫文件」，现在可以直接利用 Obsidian 的索引能力。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:336]
** 如果把几种接入方式简单排一下  ** ：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:339]
1. ** Obsidian CLI  ** → 最快、最省 token
2. ** REST API（社区插件）  ** → 灵活，但多一层调用
3. ** 文件系统（grep / glob）  ** → 最慢，也最耗 token
另外一个值得关注的点是：Obsidian 官方也在逐步完善 Claude 相关能力（比如专门的 skills），让 Claude 能更自然地编辑  ` .md  ` 、.  ` canvas  ` 这类文件。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:344]

##  社区最佳实践
社区里有个挺有共识的原则，可以用一句话来概括：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:348]
> ** AI 负责读取，人负责书写  **
意思是，你的 vault 应该记录的是  ** 你自己的思考  ** 。Claude 用来读这些内容、补充上下文，但不应该把生成的内容一股脑写进去，把 vault 变成「AI 输出的集合」。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:352]
更清晰一点的做法是：把 Claude 的输出（比如计划、会话、记忆）放在  ` ~/.claude/  ` ，而 vault 本身只保留真正有价值的知识和思考。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:354]
在这个思路下，一些自定义命令也挺有意思：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:356]

* •  **` /my-world  ` ** — 加载整个 vault 的上下文
* •  **` /today  ` ** — 从每日笔记出发做当天规划
* •  **` /close  ` ** — 做一天的总结和反思
* •  **` /trace  ` ** — 回溯一个想法是怎么一步步演变的
* •  **` /ghost  ` ** — 用你的语气，基于已有内容来回答

##  深度分析
从五种集成策略的结构来看，可以梳理出一条清晰的演进路径：**从最简单的"直接共用"到最完整的"MCP 桥接 + QMD 会话沉淀"**，背后反映的是两套工具范式的根本差异——Claude Code 以代码仓库为中心、面向生成；Obsidian 以笔记为中心、面向沉淀。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:41-50]
五种策略的选择逻辑其实很清晰：策略 1（符号链接）解决了多项目统一管理的痛点，但符号链接本身是 Obsidian 的弱支持场景；策略 2（Vault = 工作目录）最符合"第二大脑"的直觉，但与成熟代码仓库结构冲突；策略 3（MCP 桥接）提供了干净的分离，但需要保持 Obsidian 一直运行；策略 4（每仓库一个 Vault）最简单，却失去了跨项目搜索能力；策略 5（QMD + 会话同步）最重，但唯一真正解决了"上下文不沉淀"的问题。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:82-108]
Obsidian CLI 的出现是一个重要转折点。它让 AI 工具不再依赖 grep 式的文件扫描，而是直接利用 Obsidian 的内部索引。在 4,000+ 文件的仓库上，查找孤立笔记从十几秒降到不足 1 秒，提升约 50 倍。这意味着接入方式的优先级已经改变：Obsidian CLI > REST API（社区插件）> 文件系统 grep/glob。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:327-343]
社区共识"AI 负责读取，人负责书写"划定了一条关键边界：Claude Code 的输出（计划、会话、记忆）应沉淀在  ` ~/.claude/  ` 目录，而 Vault 本身只保留经过人工筛选和加工的知识。这避免了 Vault 退化为 AI 输出的无结构堆积。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:346-354]
QMD 语义搜索的价值在于 token 成本控制。开发者反馈显示，使用 QMD 做语义分块后，token 使用和处理时间在部分场景下降了 60% 以上。这对于需要长期维护大量会话记录的团队是一个实质性的收益。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:181-186]

## 实践启示
**选策略看场景**：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:50-108]

* **多项目维护者** → 策略 1（独立 Vault + 符号链接），配合  ` userIgnoreFilters  ` 和 File Explorer++ 做多仓库统一管理
* **纯 PKM 用户** → 策略 2（Vault = 工作目录），Vault 即工作内容，CLAUDE.md 一身二用
* **不想污染代码仓库** → 策略 3（MCP 桥接），Claudesidian MCP 在此基础上还支持语义搜索（Ollama embedding）
* **单项目专注** → 策略 4（每仓库一个 Vault），最简单，勿忘将  ` .obsidian/  ` 加入  ` .gitignore `
* **重度会话沉淀需求** → 策略 5（QMD + sync-claude-sessions + `/recall`），token 节省可达 60%+
**文件过滤组合拳**：^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:188-233]
1. 在  `.obsidian/app.json` 的  ` userIgnoreFilters ` 中配置目录级过滤
2. 用正则排除文件类型（ `.*\.png` 、 `.*\.js` 等）
3. 安装 File Explorer++ 做按路径/扩展名的可视过滤，支持随时开关
4. 关闭「检测所有文件扩展名」，避免 TS/JS/JSON 进入文件列表
5. 如需彻底排除，用 File Ignore 插件（基于  `.gitignore` 风格规则，实际修改文件名）
**Dataview 驱动 CLAUDE.md 结构化**：给每个  ` CLAUDE.md` 加上 frontmatter（type、project、stack、status），即可用 Dataview 跨项目查询所有配置、汇总计划、追踪状态。Templater 可用于自动化生成标准模板，减少重复配置工作。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:270-326]
**Obsidian CLI 是未来方向**：如果 Obsidian 版本 >= 1.12，优先使用 CLI 接入方式，比文件系统的 grep/glob 方式快 50 倍。在自动化脚本和 agent 工作流中，这意味着可量化的速度和成本优势。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:327-344]
**自定义命令沉淀工作流**：`/my-world` 、 `/today` 、 `/close` 、 `/trace` 、 `/ghost` 这类命令将 Claude Code 融入了 Obsidian 的日常笔记生态，让 AI 不是孤立的生成工具，而是知识循环的一部分。^[开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南.md:356-362]
## 相关实体
- [Obsidian Claude Code Integration Guide](../ch09/127-obsidian-claude-code-integration-guide.html)
- [刚刚Opus 47发布相比46核心变化与Claude Code搭配最佳实践](../ch03/076-claude-code.html)
- [打造可靠的 Ai 编程环境Claude Code Hooks 完整开发者指南 V2](../ch03/076-claude-code.html)
- [Opus 4 7 Launch Claude Code Best Practices Wechat](../ch03/076-claude-code.html)
- [打造可靠的 Ai 编程环境Claude Code Hooks 完整开发者指南](../ch03/076-claude-code.html)

---

