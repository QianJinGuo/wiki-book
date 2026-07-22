---
title: 我用 SKILL.md 做了一个简历生成器
source_url: https://mp.weixin.qq.com/s/FIHet6uF2T2Q_MTh5O4udA
publish_date: 2026-05-09
tags: [wechat, article, claude, agent, llm, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 57e83df5d20214a97f5f414f84b147f18e7c92f8199ea1f6045f7bfcea40a256
---
# 我用 SKILL.md 做了一个简历生成器
“你养龙虾了吗？”——这是2026年春天最流行的社交寒暄。一个月前，我也跟风在阿里云上花68块买了台轻量服务器，一键部署了OpenClaw。那只可爱的小龙虾在我的服务器里安了家，24小时在线，能操控电脑、执行命令、发消息。然后呢？然后我发现，我根本不知道怎么“教”它干活。
这大概是所有“养虾人”的共同困惑：OpenClaw给你的是一个空转的引擎，它有能力做任何事，但它不知道你要它做什么。有人用它自动抓取公告、盯盘选股，有人用它一键发文到微信公众号，有人用它处理政务民生服务。区别在哪？区别在于，那些真正用起来的人，都学会了一件事：给AI写“说明书”。
今天就带你亲手写一份“说明书”。我们要做一个Resume Forge Skill——把你的Markdown简历一键转成PDF。全程不用写复杂的Agent代码，只用SKILL.md，搭配OpenClaw的Skills机制。
###  为什么选“简历生成”这个场景？
因为：
* ** 零外部依赖  ** ：不需要API Key、数据库、网络。任何人克隆下来就能跑。
* ** 输出直观  ** ：丢进去一个Markdown，出来一个漂亮的PDF，立刻能看到效果。
* ** 天然覆盖Skill所有特性  ** ：元数据、三个渐进式披露层级、脚本、参考资料、资产、验证循环、陷阱清单、模板——全部用上。
我们的目标：构建一个能在Claude Code、VS Code with Copilot、Cursor或任何支持  ` agentskills.io  ` 规范的Agent中安装运行的完整Skill。
##  最终目录结构
    resume-forge/  
    ├── SKILL.md                           ← 核心：Skill的“大脑”  
    ├── scripts/                           ← Level 3: 可执行代码  
    │   ├── parse_resume.py                ← Markdown → 结构化JSON  
    │   ├── validate_resume.py             ← 检查缺失内容、质量问题  
    │   └── generate_pdf.py                ← JSON + 模板 → PDF  
    ├── references/                        ← Level 3: 按需加载  
    │   ├── ats-optimization.md            ← ATS关键词策略和格式规则  
    │   └── industry-styles.md             ← 不同行业的风格建议（科技、金融等）  
    └── assets/                            ← Level 3: 静态资源  
        ├── template_modern.html           ← 现代风格模板  
        ├── template_classic.html          ← 经典风格模板  
        ├── template_compact.html          ← 紧凑风格模板  
        ├── report_template.md             ← 质量报告模板  
        └── sample_input.md                ← 示例简历（供测试）  
每个文件都对应着Part 1中讲到的概念。我们一步步搭建。
##  Step 1: 定义前置元数据（Frontmatter）
这是Agent在Level 1看到的“身份证”。启动时嵌入系统提示词，只消耗约100个token。描述得好不好，直接决定了LLM会不会把相关请求路由到你的Skill。
    ---  
    name:resume-forge  
    description:>-  
      Convert a Markdown resume into a professionally formatted PDF with multiple  
      style options and ATS optimization. Use this skill when the user asks to  
      create a resume, format a resume, convert a resume to PDF, build a CV,  
      generate a professional resume, make a resume ATS-friendly, or restyle an  
      existing resume. Triggers include: 'resume', 'CV', 'curriculum vitae',  
      'resume PDF', 'format my resume', 'ATS-friendly resume', 'professional resume',  
      or any mention of creating career documents from markdown or plain text.  
      Do NOT use for: cover letters, job searching, interview preparation,  
      LinkedIn profile optimization, or portfolio websites.  
    license:Apache-2.0  
    compatibility:RequiresPython3.10+andweasyprint.Nonetworkaccessneeded.  
    metadata:  
    author:abvijaykumar  
    version:"1.0.0"  
    last-updated:"2026-03-17"  
    category:document-generation  
    tags:"resume, pdf, career, formatting"  
    allowed-tools:Bash(python3:*)Bash(pip:*)ReadWrite  
    ---  
** 逐项解读：  **
* ` name  ` ：规范要求1-64字符，只能小写字母、数字和连字符。必须和目录名一致。这里用  ` resume-forge  ` ，清晰明了。
* ` description  ` ：这是  ** 最关键的字段  ** 。因为没有算法路由，LLM靠它决定是否激活Skill。所以描述必须做好三件事：
    1. 说明做什么：“Convert a Markdown resume into a professionally formatted PDF” 
    2. 列出触发词：resume, CV, resume PDF, ATS-friendly resume…… 
    3. 划出负面边界：“Do NOT use for cover letters, job searching...”    
负面边界能防止“帮我准备面试”这类无关请求误触发Skill。
* ` license  ` ：既是法律声明，也是信任信号。Apache-2.0表示开源、允许商用，别人用起来放心。
* ` compatibility  ` ：告诉Agent环境需求。如果机器没有Python 3.10或WeasyPrint，Agent能提前知道。“No network access needed”是额外的安全加分项。
* ` metadata  ` ：规范没定义内容，自由键值对。我用它来版本管理、作者、分类。由于规范没有内置  ` version  ` 字段，这是推荐的版本追踪方式（配合Git）。
* ` allowed-tools  ` ：声明Skill需要的工具权限。这里只有Python脚本、pip安装包、读写文件。如果某个简历Skill突然要  ` curl  ` 或网络访问，就是危险信号。
至此，前置元数据用了规范里的所有字段，且每个都有实际意义。
##  Step 2: 编写SKILL.md正文
正文是Level 2——当LLM判断Skill相关时加载的内容。它是Agent遵循的完整指令。规范建议控制在500行以内、5000 token以内。我们这篇正文约186行，~1350 token，很安全。
下面提取几个关键模式。
###  模式1：清单式工作流
    ## Workflow  
    Progress:  
    - [ ] Step 1: Obtain the Markdown resume  
    - [ ] Step 2: Parse into structured JSON (`scripts/parse_resume.py`)  
    - [ ] Step 3: Validate structure and content (`scripts/validate_resume.py`)  
    - [ ] Step 4: Fix any validation issues (loop until clean)  
    - [ ] Step 5: Select style and generate PDF (`scripts/generate_pdf.py`)  
    - [ ] Step 6: Final review and delivery  
这个清单给Agent清晰的进度感：它知道自己在哪里、下一步做什么、哪些已完成。每一步都指向具体脚本，Agent不用自己摸索“怎么做”。
###  模式2：验证循环
    ### Step 4: Fix and Re-validate  
    If validation reports issues:  
    1. Read the specific error messages — they explain what's wrong and how to fix it  
    2. Edit `resume.md` to address the issues  
    3. Re-run Step 2 (parse) and Step 3 (validate)  
    4. **Only proceed to Step 5 when validation passes with zero errors**  
这是“执行-验证-修复-重复”的经典模式。Agent不通过验证就不进入下一步。验证器的错误消息设计成自解释的，让Agent能自我纠正。
###  模式3：计划-验证-执行
整体流程是：解析简历（计划）→ 验证结构（验证）→ 生成PDF（执行）。中间的  ` parsed.json  ` 就是“计划”——一个结构化表示，可以在生成PDF之前先按规则校验，防止垃圾进垃圾出。
###  模式4：条件文件加载（渐进式披露Level 3）
    For ATS-specific optimization, read  
    [references/ats-optimization.md](references/ats-optimization.md)  
    before generating — it contains keyword placement strategies and formatting  
    rules that affect how ATS parsers score the resume.  
    For industry-specific styling guidance, read  
    [references/industry-styles.md](references/industry-styles.md)  
    only if the user specifies a target industry.  
这就是渐进式披露在行动。参考文件不在启动时加载，也不在Skill激活时加载，只在具体任务需要时才加载。一个只想“把我的简历转成PDF”的用户，永远不会为ATS指南付出token成本。但说“为科技岗位做一份ATS友好的简历”时，两个文件才会被按需加载。
###  模式5：“Gotchas”陷阱清单
    ## Gotchas  
    - **WeasyPrint font rendering**: WeasyPrint uses system fonts. If a template  
      specifies a font not installed on the system, it silently falls back to  
      a default serif font.  
    - **Page overflow**: Long resumes may push content onto a second page with  
      awkward breaks mid-section.  
    - **Special characters in names**: Accented characters (é, ñ, ü) work fine  
      in the PDF but may break some ATS parsers.  
    - **Markdown parsing edge cases**: The parser expects `##` for sections and  
      `###` for sub-entries. Using `**bold text**` as a section header will cause  
      the parser to miss that section entirely.  
陷阱清单是Skill里价值最高的内容之一。这些都是Agent不被告知就会踩的坑。每个陷阱都说明症状、原因、隐含的解决方法。Agent不需要通过试错去发现，直接获得“前人智慧”。
##  Step 3: 编写脚本（scripts/）
脚本是干活的主力。它们通过bash运行，只有输出进入Agent的上下文，脚本代码本身不加载，省token。
###  ` scripts/parse_resume.py  ` —— 解析器
将Markdown转成结构化JSON。几个设计亮点：
** 内联依赖（PEP 723）  **
    # /// script  
    # dependencies = [  
    #   "markdown-it-py>=3.0",  
    # ]  
    # ///  
用  ` uv run scripts/parse_resume.py  ` 就能自动安装依赖，不需要  ` requirements.txt  ` ，不需要虚拟环境。Agent一个命令就跑起来。
** 结构化JSON输出  **
    {  
      "status": "success",  
      "name": "Alex Chen",  
      "sections_found": ["Summary", "Experience", "Education", "Skills", "Certifications"],  
      "total_entries": 6  
    }  
结构化输出比自然语言好解析得多。Agent可以程序化检查  ` sections_found  ` ，而不是去理解一段文本。
** 友好的错误信息  **
    Error: File not found: resume.md  
           Check the path and try again.  
错误信息直接告诉Agent该怎么做。同时提供  ` --help  ` 让Agent能发现接口：
    python3 scripts/parse_resume.py --input resume.md --output parsed.json  
    python3 scripts/parse_resume.py --input resume.md  # 输出到stdout  
###  ` scripts/validate_resume.py  ` —— 质量门禁
验证器让“计划-验证-执行”模式落到实处。下面是一个损坏简历的验证输出示例：
    {  
      "status": "fail",  
    "errors": [  
        {  
          "field": "name",  
          "message": "Missing name. Add an H1 heading (# Your Name) at the top of the Markdown."  
        },  
        {  
          "field": "contact.email",  
          "message": "Missing email address. Add it below your name: **Email:** you@example.com"  
        },  
        {  
          "field": "sections",  
          "message": "Missing required section: Skills. Add ## Skills to your Markdown."  
        },  
        {  
          "field": "sections.Experience",  
          "message": "Section \"Experience\" is empty. Add content or remove the heading."  
        }  
      ],  
    "warnings": [  
        {  
          "field": "contact.phone",  
          "message": "No phone number found. Recommended for most job applications."  
        },  
        {  
          "field": "sections",  
          "message": "Consider adding a Summary section to strengthen your resume."  
        }  
      ],  
    "summary": {  
        "error_count": 5,  
        "warning_count": 5  
      }  
    }  
注意几个点：
* ** 错误 vs 警告  ** ：错误会阻止流程（退出码3），警告不会（退出码0）。正文说“只有零错误才能继续”。
* ** 每条错误都包含修复建议  ** ：不只是“缺少姓名”，而是“添加H1标题 (# 你的姓名)”。Agent能直接执行，不需要再问用户。
* ** 退出码有意义  ** ：0=通过，1=文件错误，3=验证失败。不同失败类型用不同码，便于脚本编排。
` --strict  ` 开关可以对每个项目符号检查动词（例如要求用“Led”“Developed”等行为动词开头）。严格程度可调节。
###  ` scripts/generate_pdf.py  ` —— 渲染器
接收JSON和样式名，加载对应的HTML模板，用Jinja2渲染，再用WeasyPrint转PDF。
    $ python3 scripts/generate_pdf.py --input parsed.json --style modern --output resume.pdf  
    {  
      "status": "success",  
      "output": "resume.pdf",  
      "style": "modern",  
      "pages": 1,  
      "overflow_warning": false  
    }  
设计要点：
* ** 三种样式  ** ：modern, classic, compact，分别对应  ` assets/  ` 下的三个HTML模板。
* ** 页面溢出检测  ** ：脚本会检查PDF是否超过推荐页数，发出警告但不失败。长简历是有效的，但Agent需要知道。
* ** ATS可提取性  ** ：PDF由语义HTML生成，不是图片或Canvas绘图。像  ` pdfplumber  ` 这样的工具能提取每一个单词，这对ATS兼容性至关重要。
##  Step 4: 定义参考资料（references/）
参考资料是Level 3，存放在文件系统，零token成本，只在需要时加载，提供特定场景的深度知识。
###  ` references/ats-optimization.md  `
只在用户明确要求“ATS友好”时加载。内容包括：
* 主流ATS（Workday、Greenhouse、Lever、iCIMS）的工作原理
* 格式规则（禁用表格、多栏，用标准标题）
* 关键词策略（镜像职位描述，包含缩写和全称）
* 章节排序建议
* 可靠 vs 易出错的日期格式
没有这个文件，Agent只能给出泛泛的通用建议。有了它，Agent就有具体可操作的规则。
###  ` references/industry-styles.md  `
只在用户说“我想申请金融岗位”之类时加载。针对不同行业给出风格建议：
* ** 科技  ** ：现代风格，技能优先，包含GitHub链接
* ** 金融  ** ：经典风格，教育优先，严格一页
* ** 学术界  ** ：经典风格，无页数限制，出版物列表
* ** 设计  ** ：现代风格，突出作品集链接
* ** 医疗  ** ：经典风格，执照和证书优先
* ** 政府  ** ：经典风格，安全许可（如有）
Agent只读相关部分。瞄准科技行业的用户永远不会加载医疗行业的内容。
##  Step 5: 定义资产（assets/）
资产是Skill使用的原材料。
###  HTML+CSS模板
每个模板是一个自包含的HTML文件，内嵌CSS。生成器用Jinja2注入数据，WeasyPrint转PDF。以下是从现代模板截取的CSS片段：
    .section-title {  
    font-size: 11pt;  
    font-weight: 700;  
    color: [#1a1a2e](<javascript:;>);  
    text-transform: uppercase;  
    letter-spacing: 1.2pt;  
    border-bottom: 1.5pt solid [#2563eb](<javascript:;>);  
    padding-bottom: 3pt;  
    margin: 14pt08pt0;  
    }  
以及Jinja2模板标记：
    {% for section in resume.sections %}  
    <div class="section">  
      <div class="section-title">{{ section.title }}</div>  
      {% for entry in section.entries %}  
      <div class="entry">  
        <div class="entry-header">  
          <span class="entry-title">{{ entry.title }}</span>  
          {% if entry.organization %}  
            <span class="entry-org"> — {{ entry.organization }}</span>  
          {% endif %}  
          {% if entry.dates %}  
            <span class="entry-dates">{{ entry.dates }}</span>  
          {% endif %}  
        </div>  
      </div>  
      {% endfor %}  
    </div>  
    {% endfor %}  
三个模板，三种风格，全从同一份JSON数据生成。
###  ` assets/sample_input.md  `
一个完整的示例简历，方便用户立刻测试：
    # Alex Chen  
    **Email:** alex.chen@email.com | **Phone:** 555-0142 | **Location:** San Francisco, CA  
    https://github.com/alexchen | https://linkedin.com/in/alexchen  
    ## Summary  
    Full-stack engineer with 6 years of experience...  
    ## Experience  
    ### Senior Software Engineer — Acme Cloud Inc (2022–Present)  
    - Led migration of monolithic Node.js application to microservices...  
##  端到端运行演示
现在我们用示例文件跑通整个流程。
###  解析
    $ python3 scripts/parse_resume.py --input assets/sample_input.md --output parsed.json  
输出：
    {"status": "success", "name": "Alex Chen", "sections_found": ["Summary", "Experience", "Education", "Skills", "Certifications"], "total_entries": 6}  
5个章节，6个条目被提取出来。解析器找到了姓名、联系方式，并结构化每个经历项（标题、组织、日期、项目符号）。
###  验证
    $ python3 scripts/validate_resume.py parsed.json  
输出：
    {  
      "status": "pass",  
      "errors": [],  
      "warnings": [  
        {"field": "sections", "message": "Consider adding a Projects section to strengthen your resume."}  
      ],  
      "summary": {"error_count": 0, "warning_count": 1, "sections_found": ["Summary", "Experience", "Education", "Skills", "Certifications"], "total_entries": 6, "total_bullets": 11}  
    }  
零错误，一个警告（建议添加Projects章节，但不阻止生成）。退出码0，可以继续。
###  生成
    $ python3 scripts/generate_pdf.py --input parsed.json --style modern --output resume.pdf  
输出：
    {"status": "success", "output": "resume.pdf", "style": "modern", "pages": 1, "overflow_warning": false}  
一页，无溢出。PDF是干净、专业的现代风格简历。
也可以生成另外两种样式：
    $ python3 scripts/generate_pdf.py --input parsed.json --style classic --output resume_classic.pdf  
    $ python3 scripts/generate_pdf.py --input parsed.json --style compact --output resume_compact.pdf  
全部生成有效、一页、ATS可提取的PDF。
###  验证ATS可提取性
    import pdfplumber  
    with pdfplumber.open('resume.pdf') as pdf:  
        for page in pdf.pages:  
            print(page.extract_text())  
每个单词都能正确提取，没有乱码、没有缺漏章节。ATS系统读取无障碍。
##  渐进式披露计分卡
我们把构建的Skill映射到三个Level：
Level  |  内容  |  Token成本  |  何时加载
---|---|---|---
Level 1  |  前置元数据 (name, description)  |  ~100  |  启动时
Level 2  |  SKILL.md 正文  |  ~1,350  |  Skill激活时
Level 3  |  scripts/, references/, assets/  |  可变，按需  |  仅当需要时
如果用户安装了50个Skill，启动时开销为 50 × ~100 = ~5,000 token。只有用户说“格式化我的简历”时，~1,350 token的正文才加载。ATS指南、行业风格、模板只在任务需要时才加载。
如果我把所有内容（ATS规则、行业指南、三个模板、陷阱清单）都塞进一个  ` SKILL.md  ` ，它会有3000多行，轻松超过任何合理的token预算。渐进式披露让这一切变得可控。
##  功能检查清单
下面这张表对照了SKILL.md规范的每个特性，并标注我们在Resume Forge中是否用到：
特性  |  是否使用  |  说明
---|---|---
` name  ` |  ✅  |  resume-forge
` description  ` |  ✅  |  包含触发词和负面边界
` license  ` |  ✅  |  Apache-2.0
` compatibility  ` |  ✅  |  Python 3.10+, weasyprint
` metadata  ` |  ✅  |  版本、作者、标签等
` allowed-tools  ` |  ✅  |  声明权限
清单式工作流  |  ✅  |  Step 1-6
验证循环  |  ✅  |  Step 4 循环
计划-验证-执行  |  ✅  |  解析→验证→生成
条件文件加载  |  ✅  |  ATS和行业指南按需
Gotchas章节  |  ✅  |  列出常见陷阱
脚本  |  ✅  |  三个Python脚本
参考资料  |  ✅  |  ats-optimization.md, industry-styles.md
资产  |  ✅  |  三个HTML模板，示例文件
帮助文档（--help）  |  ✅  |  每个脚本支持
错误码  |  ✅  |  解析器、验证器用退出码区分状态
这就是一个覆盖了规范所有特性的完整Skill。
##  安装Skill
###  Claude Code
    # 项目级（推荐）  
    cp -r resume-forge/ .claude/skills/resume-forge/  
    # 或全局（所有项目可用）  
    cp -r resume-forge/ ~/.claude/skills/resume-forge/  
由于实时文件监听，Claude Code会立刻发现新Skill。
###  VS Code with GitHub Copilot
    cp -r resume-forge/ .github/skills/resume-forge/  
###  Claude.ai
打包成zip，通过“设置 → 功能”上传：
    cd resume-forge && zip -r ../resume-forge.zip . && cd ..  
##  调试技巧
* ** Skill没触发  ** ：直接问Agent：“你用了哪个Skill？”或“你用resume-forge Skill了吗？”如果没触发，可能是描述中缺触发词，添加上用户使用的短语。
* ** 解析器漏了章节  ** ：检查标题层级。解析器期望  ` ##  ` 作为章节标题，  ` ###  ` 作为条目。用  ` **加粗文本**  ` 当标题是无效的。
* ** PDF显示不对  ** ：检查系统字体。WeasyPrint使用操作系统字体，如果模板指定的字体不存在，会静默回退到serif。
* ** 验证太严/太松  ** ：用  ` --strict  ` 开启全面检查，默认模式是实用检查。可以修改  ` validate_resume.py  ` 里的  ` ACTION_VERBS  ` 集合来适配领域。
##  一些hack
在开始写Skill之前，可以先用这些工具加速开发。
###  Hack [ #1 ](<javascript:;>) ：用Skill Creator来构建Skill
Anthropic官方Skills仓库里有一个元Skill叫  ** skill-creator  ** 。它是一个专门创建其他Skill的Skill。
安装它：
    cp -r skill-creator/ .claude/skills/skill-creator/  
现在你对Claude Code说：“我想建一个Skill，把Markdown简历转成PDF。”skill-creator就会激活，带你走完整流程：它会采访你关于用例、写草稿SKILL.md、生成测试提示词、并行运行有/无Skill的测试、启动基于浏览器的评测视图让你对比输出、再根据你的反馈迭代。循环是：草稿→测试→评审→改进→重复。
它还包含一个描述优化器，会测试20多个触发查询，测量触发准确率，然后重写描述来最大化命中率、最小化误报。
最有用的功能：它会生成“基线运行”（无Skill）和“启用Skill的运行”，让你看到Skill真正增加了什么价值。还会记录每次运行的耗时和token消耗，让你知道Skill的真实成本。
用这个工具，构建Resume Forge的时间能砍半。
###  Hack [ #2 ](<javascript:;>) ：发布前验证 —— 用skills-ref
官方  ` agentskills/agentskills  ` 仓库里有一个参考库  ` skills-ref  ` ，可以验证Skill是否符合规范。
安装：
    pip install -e path/to/agentskills/skills-ref  
然后验证：
    skills-ref validate path/to/resume-forge  
它会检查前置元数据字段、目录命名规范、结构。捕获你在运行时才会发现的错误：name字段不匹配、缺少description、目录名和Skill名不一致等。
它还提供  ` to-prompt  ` 命令，生成Agent用来发现Skill的  ` <available_skills> ` XML块。这让你能预览Agent在Level 1看到的元数据——那个决定Skill是否被激活的内容。
###  Hack [ #3 ](<javascript:;>) ：从模板开始，别从零开始
Anthropic Skills仓库包含一个  ` template/  ` 目录，里面是最小化的SKILL.md骨架。就一个name、一个description占位符、一个正文占位符。这正是关键——别对着空文件发呆想前置元数据语法，克隆模板填空就行。
    cp -r template/ .claude/skills/my-new-skill/  
编辑  ` name  ` 字段匹配目录名，写你的描述，就可以开工。这消除了记住YAML格式的摩擦，保证你不会漏掉必填字段。
###  浏览示例Skill
在开始自己构建前，先看看官方仓库里的示例：  ` github.com/anthropics/skills/tree/main/skills  `
里面有生成PDF、构建DOCX、创建PowerPoint演示文稿、设计Canvas布局、构建MCP服务器等现成Skill。即便没有一个完全匹配你的用例，它们也是学习如何组织脚本、参考资料、渐进式披露的绝佳参考。特别是  ` docx  ` 和  ` pdf  ` 这两个Skill，如果你和我们一样在做文档生成，值得深入研读。
##  核心回顾
1. ** 原理  ** ：  ` SKILL.md  ` 通过前置元数据（Level 1）、正文（Level 2）和按需加载的资源（Level 3）实现渐进式披露，让Skill既强大又轻量。LLM根据描述进行路由，无需手写路由逻辑。
2. ** 实践  ** ：构建一个高质量Skill，关键在于写好  ` description  ` （触发词+负面边界），用清单式工作流、验证循环、计划-验证-执行模式组织正文，并合理划分脚本、参考资料和资产。
3. ** 避坑  ** ：调试Skill时，先检查描述是否包含用户实际使用的词汇；遇到触发不准就加负面边界；正文中一定要有“Gotchas”部分，把隐式知识显式化。
##  写在最后
这个Skill我们从头构建，每一行代码、每一个文件都对应着规范中的某个设计。但它的意义不只是“能运行”，而是演示了如何把人类专家的经验——简历怎么写、ATS怎么优化、行业偏好是什么——封装进一个文件夹里，让AI去自动执行。
最让我感慨的是，构建这样一个功能完整的Skill，我们几乎没有写复杂的Agent逻辑，只是写了一个“说明书”和一些确定性脚本。AI负责判断什么时候该用、怎么按步骤执行，而我们把领域知识沉淀下来，一次编写，到处运行。
现在，你手头是不是也有那种“每次都要手动指导AI做”的重复性任务？把它封装成一个  ` SKILL.md  ` ，会怎样？
在你的日常工作中，哪个任务最适合封装成Skill？是部署流程、代码审查清单、还是某种文档生成？你会怎么设计它的渐进式披露层级？欢迎在评论区分享你的想法，我们一起探讨。
#####  🏴‍☠️宝藏级🏴‍☠️ 原创公众号『  ** 数据STUDIO  ** 』内容超级硬核。公众号以Python为核心语言，垂直于数据科学领域，包括  可戳  👉[ Python ](<https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTI1OTQ2MQ==&action=getalbum&album_id=1974978822768771072&scene=173&from_msgid=2247519294&from_itemidx=1&count=3&nolastread=1#wechat_redirect>) ** ** ｜  ** ** [ MySQL ](<https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTI1OTQ2MQ==&action=getalbum&album_id=2023684574089658370&scene=173&from_msgid=2247519619&from_itemidx=2&count=3&nolastread=1#wechat_redirect>) ** ** ｜  ** ** [ 数据分析 ](<https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTI1OTQ2MQ==&action=getalbum&album_id=1974978820940054530&scene=173&from_msgid=2247518366&from_itemidx=1&count=3&nolastread=1#wechat_redirect>) ** ** ｜  ** ** [ 数据可视化 ](<https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTI1OTQ2MQ==&action=getalbum&album_id=1974991176839544834&scene=173&from_msgid=2247519244&from_itemidx=1&count=3&nolastread=1#wechat_redirect>) ** ** ｜  ** ** [ 机器学习与数据挖掘 ](<https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTI1OTQ2MQ==&action=getalbum&album_id=1963494160565354497&scene=173&from_msgid=2247512171&from_itemidx=1&count=3&nolastread=1#wechat_redirect>) ** ** ｜  ** ** [ 爬虫 ](<https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTI1OTQ2MQ==&action=getalbum&album_id=2318258648965644288&scene=173&from_msgid=2247518366&from_itemidx=1&count=3&nolastread=1#wechat_redirect>) ** 等，从入门到进阶！
长按👇关注- 数据STUDIO -设为星标，干货速递