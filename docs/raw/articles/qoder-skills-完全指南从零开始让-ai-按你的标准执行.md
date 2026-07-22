---
title: Qoder Skills 完全指南：从零开始，让 AI 按你的标准执行
source_url: https://mp.weixin.qq.com/s/PG-rXJllhrtynAfNZn5asg
publish_date: 2026-05-16
tags: [wechat, article, claude, agent, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 06b70cd1b0dd9828b3391517247c6c8384865c2321caa9a5c8d83b3522be7554
---
# Qoder Skills 完全指南：从零开始，让 AI 按你的标准执行
阿里妹导读
文章内容基于作者个人技术实践与独立思考，旨在分享经验，仅代表个人观点。
在 AI 原生工作流加速普及的今天，掌握 Skill 已不再是开发者的专属能力，而是产品、运营、设计乃至技术管理者提升人机协同效能的核心职业素养。它直接决定你能否把模糊需求转化为稳定、可复用、可协作的 AI 执行单元，从而在项目交付中显著提升质量一致性、降低沟通成本、规避重复试错。
一、理解 Skill 的本质：菜单与菜谱的比喻
** 没有菜单的餐馆，会发生什么？  **
想象你走进一家餐馆，直接对厨师说："帮我做一道红烧肉。"
结果——厨师按自己的理解自由发挥。你收到的可能是完全不合口味的东西。
这正是我们每天在用 AI 时遇到的问题。
你向 AI 传达了需求，AI 却按自己的理解执行，导致你不得不反复修正输出，持续"调教"——高成本、低确定性、难以复现。
** 有了菜谱，一切就不同了  **
> Skill 就是 AI 世界里的菜谱（Recipe）  。
当 AI 有了一份清晰的菜谱，它就知道：
* 这道菜的标准做法是什么
* 哪些步骤是必须的
* 用哪些食材、什么火候、什么顺序
你作为顾客（用户）只需点菜，AI（厨师）就能按菜谱稳定交付。
###  整个 AI 工具生态的类比映射
餐馆场景  |  AI 工具  |  说明
---|---|---
菜谱 / 菜单  |  Skill  |  告诉 AI 怎么做、按什么标准做
厨师  |  Agent / 模型  |  执行者
食材 + 专业厨具  |  MCP  |  连接外部服务，提供"食材"
今天的固定套餐  |  Slash Command（/指令）  |  一次性快捷指令
厨房基本规则  |  Rules  |  全局约束，始终生效
副厨、帮厨  |  Sub-agent  |  专项协作角色
MCP 提供专业厨房  ——让 AI 能访问你的工具、数据和外部服务。
Skill 提供菜谱  ——告诉 AI 如何将这些工具用好、按什么工作流执行。  两者结合，才能让用户无需每次从头解释，AI 也能稳定交付高质量结果。
二、Skill 是什么？结构与工作原理
** Skill 的本质定义  **
Skill 是一个  开放标准的文件夹  ，包含一套告诉 AI 如何处理特定任务或工作流的指令。它是目前最强大的 AI 定制方式之一：  教 AI 一次，永久受益  ——不再需要在每次对话中重新解释你的偏好、流程和领域知识。
** Skill 的文件结构  **
    your-skill-name/           ← 文件夹名用 kebab-case（小写+短横线）├── SKILL.md               ← 必须有，且必须是这个大小写├── scripts/               ← 可选：Python、Shell 等可执行脚本│   ├── process_data.py│   └── validate.sh├── references/            ← 可选：按需加载的参考文档│   ├── api-guide.md│   └── examples/└── assets/                ← 可选：模板、字体、图标等资源    └── report-template.md
> ⚠️  三个命名硬规则  ：
** 三级渐进式披露机制（Progressive Disclosure）  **
这是 Skill 最核心的工作原理，决定了它既节省上下文，又能承载复杂知识：
    第一级：YAML Frontmatter（元数据头部）  → 始终加载在 AI 的系统提示词中  → 只包含 name 和 description  → 作用：让 AI 知道"我有哪些技能、分别在什么时候用"  → 类比：图书馆的目录卡片  
    第二级：SKILL.md 正文  → 当 AI 判断当前任务与该 Skill 相关时，才加载完整正文  → 包含具体执行步骤、示例、注意事项  → 类比：从书架上取出那本书，深度阅读  
    第三级：scripts/ references/ assets/ 中的文件  → 只在 Skill 执行过程中需要时才按需读取  → 类比：书中引用的附录和参考资料
这个机制的三大优势：
优势  |  说明
---|---
省上下文  |  大量 Skill 并存时，AI 只加载目录信息，不会撑爆上下文窗口
省推理成本  |  步骤清晰，AI 减少"想怎么做"的推理次数，降低 token 消耗
结果确定  |  固定步骤 + 可脚本化执行，输出稳定，关键细节不遗漏
** Skill 的跨平台兼容性  **
Skill 是开放标准，在以下环境中完全兼容：
* ✅ Qoder（Quest 模式、AIDE 模式、CLI）
* ✅ Claude.ai 网页端
* ✅ Claude Code CLI
* ✅ JetBrains 插件（即将支持）
* ✅ Claude API（通过  ` container.skills  ` 参数）
创建一次，所有平台通用。
三、三个关键问题：Skill vs Slash Command vs MCP vs Rules
维度  |  Skill  |  Slash Command  |  MCP  |  Rules
---|---|---|---|---
触发方式  |  AI 自主判断 + 可主动  ` /  ` 调用  |  用户主动输入  ` /xxx  ` |  工具调用时自动触发  |  始终在上下文中生效
内容复杂度  |  高：多步骤、脚本、资源、引用文件  |  低：固定短提示词  |  中：工具接口定义  |  低：全局约束规则
上下文占用  |  极低（只加载 meta data）  |  中（加载固定提示词）  |  高（一次性加载所有工具定义）  |  低（始终存在）
可分发性  |  ✅ 天然适合团队共享和生态传播  |  ❌ 难以共享  |  ✅ 通过服务端共享  |  ❌ 通常个人配置
适合场景  |  重复性工作流、跨项目规范、领域最佳实践  |  一次性快捷动作  |  调用外部系统数据  |  全局行为约束
** 简单判断法则  **
    需要调用外部系统（数据库、邮件、日历、Notion）？ → MCP只是一条全局约束（语言、格式）？ → Rules  一次性快捷操作，不需要复用？ → Slash Command可复用的标准化工作流，需要团队共享？ → Skill ✅  
> 💡  实践结论  ：  Slash Command 能做的，Skill 都能做（Skill 也可以通过  ` /  ` 调用）。但 Skill 还能引用脚本、内嵌资源、模块化分发。  对新用户来说，直接学 Skill 即可，无需纠结 Slash Command。
四、什么任务最适合写成 Skill？三大使用场景
根据 Anthropic 官方总结，Skill 最适合以下三类场景：
###  场景一：文档与资产创建（Document & Asset Creation）
适合人群  ：  运营、产品、设计、所有人
核心特征  ：  需要生成符合特定风格、规范或品牌标准的输出物
典型案例  ：
* 给产品制作宣传视频（Remotion Best Practice Skill）
* 生成高质量前端界面（frontend-design Skill）
* 按公司模板生成 Word/PPT/Excel 文档
* 制作符合设计规范的海报或社交媒体图文
为什么用 Skill  ：  你不熟悉该领域，无法指导 AI 达到专业标准。Skill 携带了该领域的最佳实践，让 AI 直接按专家标准执行。
###  场景二：工作流自动化（Workflow Automation）
适合人群  ：  开发、技术管理者、任何有重复性工作的人
核心特征  ：  多步骤流程，期望每次输出结果一致
典型案例  ：
* 每次新增 API 后自动同步文档 + 兼容性检查 + 单元测试框架
* 代码提交前自动执行 Code Review 规范
* 按固定模板生成项目进展报告
为什么用 Skill  ：
* 重复动作脚本化 → 不遗漏任何步骤
* 不依赖 AI 每次"想起来"提醒 → 结果确定
* 将步骤固化到文件 → 减少 token 消耗，降低成本
###  场景三：MCP 能力增强（MCP Enhancement）
适合人群  ：  已经连接了 MCP 的开发者、技术团队
核心特征  ：  有了工具访问权限，但缺乏"怎么用好"的工作流知识
典型案例  ：
* 连接了 Linear MCP，但每次都要解释 Sprint 规划流程 → 写一个 Skill 固化这套流程
* 连接了 GitHub MCP，但代码审查没有标准 → 写一个 Skill 定义审查步骤
为什么用 Skill  ：
* MCP 解决"AI 能做什么"（工具访问）
* Skill 解决"AI 应该怎么做"（工作流知识）
* 两者结合，用户无需每次从头解释，AI 自动按最佳实践执行
五、安装你的第一个开源 Skill（5 分钟上手）
** 找到 Skill 的两个主要入口  **
* https://skills.sh  — 当前最流行的开放 Skill 市场，含 Remotion（视频）、from-design（前端）等热门 Skill
* Qoder 官方 Skill 门户  （即将上线，中英双语，按角色分类：开发 / 运营 / 产品 / AI 技术）
** 三种安装方式  **
方式 A：命令行安装（推荐，最快）
*
    npx skills add <skill-name>
执行后，按交互提示：
1.选择目标 Agent → 选  Qoder
2.选择安装级别：
* Global（用户级）  → 安装到  ` ~/.qoder/skills/  ` ，适合个人长期使用
* Project（项目级）  → 安装到  ` <项目根>/.qoder/skills/  ` ，适合团队规范
3.选择  ` copy  ` 模式，无需额外依赖
> 💡  这个命令还有一个隐藏优势：它会为不同的 Agent 创建软链接，让多个工具共用同一份 Skill 文件，避免重复维护。
方式 B：手动放置文件
直接将 Skill 文件夹复制到以下目录：
    # 用户级（全局生效）~/.qoder/skills/  
    # 项目级（项目内生效，推荐团队规范）<项目根目录>/.qoder/skills/
方式 C：在 Qoder Quest 模式中用内置 Skill 生成
Qoder Quest 模式内置了一个  create skill  元技能。直接对话：
*
    帮我创建一个 Skill，用于 [描述你的需求]
AI 会引导你完成所有步骤，并自动放置到正确目录。
** 验证安装是否成功  **
在 Qoder 对话框输入  ` /  ` ，如果安装的 Skill 出现在联想列表中，说明安装成功。
或者直接在 Quest 模式中输入与该 Skill 匹配的任务，观察 AI 是否自动识别并调用。
> ⚠️  注意：目前 Qoder Skills  不支持热更新  ，安装或修改 Skill 后，需要重启会话才能生效。
六、三大实战场景演示
###  场景 A：用 Skill 制作产品宣传视频（适合运营/产品）
背景  ：  不懂视频制作，想为产品生成一个可下载的宣传视频文件。
无 Skill 时的困境  ：  AI 给你三个不满意的方案——用 Python 库、纯 HTML 动画、或只生成素材，都不是你想要的。
操作步骤  ：
    # 第一步：安装 Remotion Best Practice Skillnpx skills add remotion-best-practice# 选择 Qoder，选择 Global，选择 copy 模式  
    # 第二步：在 Qoder Quest 模式中输入帮我为 [产品名] 制作一个中文宣传视频，请先访问官网了解产品特性。
AI 执行流程  ：
1.自动识别并加载 Remotion Skill
2.访问官网，了解产品背景
3.按 Skill 的最佳实践搭建 Remotion 工程（自动处理 npm 环境）
4.生成分页视频脚本，渲染成视频文件
后续可继续提需求  ：  更换配色匹配官网、替换为官网 Logo、增加 3D 效果……
###  场景 B：有 Skill 与无 Skill 的前端设计对比（适合所有人）
背景  ：  用 AI 做了一个 Todo 网站，输出是典型的"AI 味"——蓝白配色、Inter 字体、毫无设计感。
无 Skill 时  ：  你想改善但不知道怎么提需求，反复说"再好看一点"毫无效果。
安装 from-design Skill  ：
*
    npx skills add from-design
同样的需求，有 Skill 后 AI 会  ：
1.首先  确认设计方向  （这是无 Skill 时根本不会问的环节）
2.选择独特字体搭配、非常规色彩方案、有格调的布局
3.输出具有审美一致性的完整设计
核心洞察  ：  Skill 填补了你的"知识盲区"。你不知道怎么提设计需求，但 Skill 知道——它把设计领域的最佳实践打包进来，让 AI 按专家标准执行。
###  场景 C：规范化 Java 工程的 API 开发（适合开发/技术管理）
背景  ：  团队规定新增 API 必须同步文档、做兼容性检查、写单元测试，但 AI 默认只写代码，经常遗漏。
Step 1：在 Quest 模式中生成 Skill
    帮我创建一个 Skill，要求：在创建、修改、删除 API 接口时，必须完成：1. 同步更新 OpenAPI 格式的 API 文档2. 检查新接口不破坏现有接口的兼容性3. 生成对应的单元测试框架4. 以 change log 格式记录本次变更
Step 2：强化 Skill——加入确定性脚本
    在这个 Skill 中，添加一个 Python 脚本，用于扫描项目内所有 API 接口，检查是否每个接口都有对应的文档。结果以报告形式输出。
AI 会在  ` scripts/check_api_docs.py  ` 中生成脚本，并在  ` SKILL.md  ` 中引用，以后直接本地运行，不消耗 AI token。
Step 3：放入项目目录，团队共享
    git add .qoder/skills/git commit -m "feat: add api-standard skill v1.0"git push# 团队成员 git pull 后立即生效  
七、动手编写你自己的 Skill（含官方规范）
** 完整文件格式  **
    ---name: your-skill-namedescription: |  [说明这个 Skill 做什么] + [说明什么时候使用它，含触发词]  例如：当用户需要新增、修改或删除 API 接口时，  或说到"接口文档"、"兼容性检查"、"单元测试"时，使用本 Skill。license: MITmetadata:  author: 你的名字或团队  version: 1.0.0---  
    ## 目标  
    [一句话描述这个 Skill 要实现什么]  
    ## 执行步骤  
    ### 第一步：[具体行动]  
    [清晰说明做什么，怎么做]  
    ```bash# 如需执行脚本，明确给出命令python scripts/check_api_docs.py --project-id PROJECT_ID期望输出：[描述成功时看到什么]  
    ### 第二步：[具体行动][继续...]示例示例 1：[常见场景]用户说："新增一个用户登录接口"AI 执行步骤：1. 创建接口代码2. 在 OpenAPI 文档中添加对应条目3. 检查是否与现有认证接口兼容4. 生成 JUnit 测试框架错误处理错误：[常见错误信息]● 原因：[为什么发生]● 解决：[怎么修复]  
参考资料
* 详见  ` references/api-guide.md  `
    ---  
    ### YAML Frontmatter 详解（最重要的部分）  
    Frontmatter 是 AI 决定"是否调用这个 Skill"的唯一依据。  
    **必填字段**  
    ```yaml---name: api-standard-check     # 必须是 kebab-case，小写+短横线description: |               # 必须同时包含"做什么"和"何时用"  当开发者新增、修改或删除 API 接口时，自动执行本 Skill，  完成 API 文档同步、向后兼容性检查和单元测试框架生成。  触发词：接口文档、API 规范、兼容性、单元测试、接口变更。---
###  可选字段（完整版）
    ---name: api-standard-checkdescription: |  [必填，1024字以内，无 XML 尖括号]license: MITmetadata:  author: 栗子团队  version: 1.0.0  mcp-server: github        # 如果配合某个 MCP 使用，注明名称  category: development  tags: [api, documentation, testing]  documentation: https://your-docs-url.com---
###  禁止事项
    # ❌ 禁止在 frontmatter 中使用 XML 尖括号description: Use for <important> cases  # 错误！  
    # ❌ 禁止 name 中含 "claude" 或 "anthropic"（保留词）name: claude-helper         # 错误！  
    # ❌ 禁止 name 有空格或大写name: My Cool Skill         # 错误！name: my-cool-skill         # ✅ 正确
** 写好 Description 的三个黄金原则  **
Description 是 Skill 的"触发器"，决定 AI 在什么时候调用它。
原则一：同时说明"做什么"和"什么时候用"
    # ❌ 太模糊description: 帮助处理项目。  
    # ❌ 只说做什么，没有触发条件description: 创建复杂的多页面文档系统。  
    # ✅ 好的示例description: |  分析 Figma 设计文件并生成开发交付文档。  当用户上传 .fig 文件、说到"设计规范"、  "组件文档"或"设计转代码"时使用。
原则二：包含用户实际会说的话（触发词）
用户一般不会说专业术语，要预测他们的自然语言：
    description: |  管理 Linear 项目工作流，包括 Sprint 规划、任务创建和状态跟踪。  当用户提到"冲刺"、"Linear 任务"、"项目计划"，  或要求"创建工单"时触发。
原则三：控制长度，不超过 1024 字符
Frontmatter 会被加载到系统提示词中，过长会占用上下文。2-4 句话即可，核心信息优先。
** 正文写作的四个技巧  **
1\.  用第三人称描述步骤  ：  ` "当被触发时，AI 需要先……"  ` 而非  ` "你要……"  ` ，便于阅读和修改
2\.  步骤编号化  ：  每步只做一件事，AI 不会跳过或混淆顺序
3\.  关键验证前置  ：  把最重要的检查放在最前面，用  ` ## 重要  ` 或  ` CRITICAL:  ` 标注
4\.  引用胜过嵌入  ：  复杂文档放在  ` references/  ` 中，主文件只写引用路径，保持 SKILL.md 在 5000 词以内
八、五大进阶模式：让 Skill 处理复杂工作流
以下五种模式来自 Anthropic 官方总结的实践经验，适合需要处理更复杂场景的用户。
** 模式一：顺序工作流编排  **
适用  ：  需要严格按顺序执行的多步流程
    ## 工作流：新客户接入  
    ### 第一步：创建账户调用 MCP 工具：`create_customer`参数：姓名、邮箱、公司名  
    ### 第二步：设置支付方式调用 MCP 工具：`setup_payment`等待：支付方式验证完成  
    ### 第三步：创建订阅调用 MCP 工具：`create_subscription`依赖参数：来自第一步的 customer_id  
    ### 第四步：发送欢迎邮件调用 MCP 工具：`send_email`模板：welcome_email_template  
关键技巧  ：  明确步骤依赖关系、在每步加验证、提供失败时的回滚指令。
** 模式二：跨 MCP 协调  **
适用  ：  工作流跨越多个外部服务
    ## 设计转开发交付流程  
    ### 阶段一：Figma 导出（Figma MCP）1. 导出设计资产2. 生成设计规范文档3. 创建资产清单  
    ### 阶段二：文件存储（Drive MCP）1. 创建项目文件夹2. 上传所有资产3. 生成分享链接  
    ### 阶段三：任务创建（Linear MCP）1. 创建开发任务2. 将资产链接附到任务3. 分配给工程团队  
    ### 阶段四：通知（Slack MCP）1. 在 #engineering 频道发布交付摘要2. 包含资产链接和任务引用  
** 模式三：迭代优化循环  **
适用  ：  需要多轮优化才能达到质量标准的输出
    ## 报告生成流程  
    ### 初稿生成1. 通过 MCP 获取数据2. 生成第一版报告3. 保存到临时文件  
    ### 质量检查1. 运行验证脚本：`scripts/check_report.py`2. 检查项：缺失章节 / 格式不一致 / 数据错误  
    ### 优化循环1. 逐项修复检查出的问题2. 重新生成受影响的章节3. 再次验证4. 重复直到通过质量标准  
    ### 最终输出1. 应用最终格式2. 生成摘要3. 保存正式版本
** 模式四：上下文感知的工具选择  **
适用  ：  同一个目标，根据文件类型或场景选择不同工具
    ## 智能文件存储  
    ### 决策树1. 检查文件类型和大小2. 选择最佳存储位置：   - 大文件（>10MB）→ 云存储 MCP   - 协作文档 → Notion/Google Docs MCP   - 代码文件 → GitHub MCP   - 临时文件 → 本地存储  
    ### 执行存储根据决策调用对应 MCP 工具，并向用户说明选择该存储方式的原因。
** 模式五：领域专业知识内嵌  **
适用  ：  需要将复杂的合规规则、行业知识内嵌到工作流中
    ## 支付处理合规流程  
    ### 处理前（合规检查）1. 获取交易详情（MCP）2. 应用合规规则：   - 检查制裁名单   - 验证司法管辖权   - 评估风险等级3. 记录合规决策  
    ### 执行处理IF 合规通过：  - 调用支付处理 MCP  - 执行欺诈检测  - 完成交易ELSE：  - 标记待人工审核  - 创建合规案例  
    ### 审计记录- 记录所有合规检查过程- 生成审计报告
九、测试与迭代：让 Skill 越来越准
** 三类测试，覆盖 Skill 生命周期  **
测试一：触发测试（最关键）
目标：确保 Skill 在正确的时机加载，不该加载时不加载。
    ✅ 应该触发的测试用例（至少 10 个）：- "帮我新增一个用户登录接口"- "这个 API 和现有接口会不会冲突"- "帮我写接口文档"  
    ❌ 不应该触发的测试用例：- "帮我写一首诗"- "旧金山的天气怎么样"- "帮我做个 PPT"  
快速诊断法  ：  直接问 AI：  ` "你什么时候会用 [skill-name] 这个 Skill？"  ` AI 会复述你的 description，根据复述结果判断是否需要调整描述。
测试二：功能测试
运行同一个请求 3-5 次，检查：
* 输出结果是否一致
* API 调用是否成功（0 错误为目标）
* 关键步骤是否都完成（无遗漏）
测试三：与无 Skill 基线对比
指标  |  无 Skill  |  有 Skill  |  改善
---|---|---|---
用户需要提供的说明  |  每次都要解释  |  无需解释  |  ✅
来回对话轮次  |  15 轮  |  2 轮  |  ✅
API 调用失败次数  |  3 次  |  0 次  |  ✅
Token 消耗  |  12,000  |  6,000  |  ✅
** 根据反馈信号迭代  **
信号：Skill 没有自动调用（触发不足）
* 问题：description 太模糊，或缺少用户实际会说的触发词
* 修复：在 description 中添加更多具体触发短语，包括技术术语和口语表达
信号：Skill 总是莫名被调用（过度触发）
* 问题：description 太宽泛
* 修复：加入负向说明，例如：  ` "Do NOT use for simple data queries (use data-viz skill instead)"  `
信号：Skill 被调用了但 AI 没按步骤执行
* 问题：指令太冗长或模糊
* 修复：缩短正文，关键步骤前置，考虑用脚本替代语言描述（脚本是确定的，语言描述存在解读偏差）
** 动态优化：用自然语言修改 Skill  **
    你刚才的输出中，[具体描述问题]。请把这个改进固化到 [skill-name] 这个 Skill 文件中，下次遇到同样情况时直接按新方式处理。
这是 Skill 区别于 Slash Command 的核心优势：  Skill 是活文档，每次修正都可以沉淀，减少下次犯同样错误的概率。
十、团队协作与 Skill 治理
** 两级安装策略  **
级别  |  路径  |  适用场景
---|---|---
用户级（全局）  |  ` ~/.qoder/skills/  ` |  个人偏好、跨项目通用（如个人设计风格偏好）
项目级  |  ` <项目根>/.qoder/skills/  ` |  团队规范、项目特定流程（推荐提交到 Git）
** Git 协作最佳实践  **
    # 1. 将项目级 Skill 纳入版本控制git add .qoder/skills/git commit -m "feat: add api-standard skill v1.0"git push  
    # 2. 团队成员拉取后立即生效，无需额外操作git pull  
    # 3. 更新 Skill 时写清楚变更内容git commit -m "fix(skill/api-standard): 增加对 DELETE 接口的兼容性检查"
** Skill 版本管理建议  **
在  ` metadata  ` 中维护版本号，重大变更在  ` references/CHANGELOG.md  ` 中记录：
    metadata:  version: 1.2.0  author: 栗子团队
对于 breaking change（会改变 AI 行为的变更），在 description 中注明，并在团队群里发布通知。
** 组织级 Skill 部署  **
如果你的公司使用 Claude 企业版，管理员可以在工作区级别统一部署 Skill，所有成员自动获得，并可集中管理版本更新（2025 年 12 月已上线此功能）。
十一、常见问题排查 FAQ
Q：Skill 上传失败，提示 "Could not find SKILL.md"
检查文件名是否严格为  ` SKILL.md  ` （区分大小写）。  ` skill.md  ` 、  ` SKILL.MD  ` 都不行。
*   *
    ls -la your-skill-folder/   # 应该看到 SKILL.md
Q：上传失败，提示 "Invalid frontmatter"
最常见的 YAML 格式错误：
    # ❌ 缺少 --- 分隔符name: my-skilldescription: Does things  
    # ❌ 引号未关闭description: "Does things  
    # ✅ 正确格式---name: my-skilldescription: Does things---
Q：AI 没有自动调用我装好的 Skill
两步排查：
1.输入  ` /  ` 检查 Skill 是否出现在联想列表（确认安装成功）
2.询问 AI：  ` "你什么时候会用 [skill-name] 这个 Skill？"  ` 根据回答判断 description 是否需要调整
临时解决：输入  ` /skill-name  ` 手动调用，或在提示词中明确说"请使用 xxx Skill"。
Q：Skill 触发太频繁，影响不相关任务
在 description 中加入负向说明：
    description: |  用于 CSV 文件的高级数据分析（统计建模、回归分析、聚类）。  不适用于简单数据查询（请使用 data-viz Skill）。
Q：Skill 加载了但 AI 没有按步骤执行
可能原因：
1.指令过于冗长 → 精简正文，关键步骤前置
2.语言描述模糊 → 用脚本替代语言描述（代码是确定的，语言存在解读偏差）
3.添加明确提醒：在关键步骤前加  ` CRITICAL:  ` 或  ` ## 重要  `
Q：Skill 有多少数量限制？
产品层面没有数量限制。实际上限由上下文窗口决定，但由于 Skill 只加载 meta data，通常可以同时携带大量 Skill（建议不超过 20-50 个同时启用），远比 MCP 节省资源。
Q：一个 Skill 能不能调用另一个 Skill？
可以。由于所有 Skill 的 meta data 都在 Agent 的上下文中，一个 Skill 执行过程中可以自然地触发另一个。如有明确依赖，在 description 中注明（如"使用前请确保已安装 xxx Skill"）。
Q：Skill 里的 reference 文件越大越好吗？
不是。建议：
* SKILL.md  控制在 5000 词以内
* 大型文档放  ` references/  ` 并在正文中引用路径
* 核心步骤优先放在主文件，细节文档按需引用
* 可以引用外部网站链接，但要注意 token 消耗
Q：我用 Slash Command 习惯了，切到 Skill 有什么优势？
Slash Command 能做的，Skill 都能做（Skill 也可以  ` /  ` 调用）。但 Skill 还支持：引用脚本文件、内嵌资源、模块化分发、Git 版本管理、跨团队共享。对于任何超过 3-4 行的重复性指令，Skill 都是更好的选择。
十二、最小闭环实践路径：现在就开始
不要等"完全准备好"再行动。按以下四步，30 分钟内完成你的第一个 Skill 实践：
    第 1 步（5 分钟）：安装一个开源 Skill→ 打开终端，运行：    npx skills add from-design→ 选择 Qoder，选择 Global，选择 copy 模式  
    第 2 步（5 分钟）：测试是否生效→ 在 Qoder Quest 模式中，输入一个前端设计需求→ 观察 AI 是否自动调用 from-design Skill→ 如果没有，输入 "/from-design" 手动调用  
    第 3 步（10 分钟）：修改这个 Skill 的 description→ 打开 ~/.qoder/skills/from-design/SKILL.md→ 在 description 中加一句符合你实际场景的触发词→ 重启会话，再次测试  
    第 4 步（10 分钟）：为你的团队写第一个 Skill→ 在项目目录下：    mkdir -p .qoder/skills/my-first-skill    touch .qoder/skills/my-first-skill/SKILL.md→ 填写 name、description 和执行步骤→ git commit 提交，通知团队成员拉取
> 别等完美，先让第一个 Skill 在你本地跑起来。你的 AI 工程化能力，就从这一次点击真正启程。
十三、附录：YAML Frontmatter 速查表 + 完整 Checklist
** Frontmatter 完整速查  **
    ---# ✅ 必填name: skill-name-in-kebab-casedescription: |  [做什么] + [什么时候用，含触发词]  不超过 1024 字符，不含 XML 尖括号  
    # 🔧 可选license: MITallowed-tools: "Bash(python:*) Bash(npm:*) WebFetch"metadata:  author: Your Name / Team  version: 1.0.0  mcp-server: server-name        # 配合哪个 MCP 使用  category: productivity  tags: [tag1, tag2]  documentation: https://your-docs.com  support: support@company.com---
** 上线前完整 Checklist  **
开始之前
* [ ] 确定了 2-3 个具体使用场景
* [ ] 明确了需要用到哪些工具（内置 or MCP）
* [ ] 规划了文件夹结构
开发过程中
* [ ] 文件夹名是 kebab-case（无空格、无大写）
* [ ] 主文件名是  ` SKILL.md  ` （大小写完全正确）
* [ ] YAML frontmatter 有  ` ---  ` 开头和结尾
* [ ]  ` name  ` 字段：kebab-case，无空格，无大写
* [ ]  ` description  ` 包含"做什么"和"何时用"两部分
* [ ] description 不含 XML 尖括号（  ` < > ` ）
* [ ] 正文步骤清晰，每步只做一件事
* [ ] 关键步骤有错误处理说明
* [ ] 包含 1-2 个示例场景
* [ ] References 已清晰链接（不要内联大段文档）
测试阶段
* [ ] 用 10 个相关请求测试触发（目标：90% 自动触发）
* [ ] 用 5 个不相关请求测试（不应触发）
* [ ] 功能测试：重复运行同一任务，结果一致
* [ ] MCP 集成测试（如适用）：API 调用 0 失败
* [ ] 与无 Skill 基线对比，记录改善数据
发布之后
* [ ] 收集用户反馈
* [ ] 监控触发率（过多/过少）
* [ ] 定期迭代更新 description 和步骤
* [ ] 更新 metadata 中的 version 字段
* * *
##  资源链接
资源  |  地址  |  说明
---|---|---
开放 Skill 市场  |  https://skills.sh  |  当前最流行的开放 Skill 市场
Anthropic 官方 Skill 示例库  |  github.com/anthropics/skills  |  官方示例，可直接 fork 修改
Qoder 官方文档  |  Qoder 官网 → 文档 → 扩展能力  |  Skills 安装指南
Qoder 中文 Skill 社区  |  即将上线  |  中英双语，按角色分类
本文参考 Anthropic 官方《The Complete Guide to Building Skills for Claude》
关于作者
Heaven
阿里国际 AI 业务运营专家
* 10年+海外业务经验，熟悉海外流量生态
* 阿里国际AI产品增长负责人，从 0 到 1 操盘 Pic Copilot（出海 AI 电商设计产品，100w+ 电商用户）的GTM和用户增长——Product Hunt 冷启动、SEO / SEM、社媒营销，探索&跑通AI时代增长新范式
🔭 当前在做
正在深入探索 AI 海外内容营销系统的搭建与落地 （Claude ， QoderWork， Openclaw），通过内容+AI杠杆撬动业务流量增长 。非常欢迎同在这个方向上探索的朋友一起交流。