sha256: 12f24d9c42c1c6be47f52c3e47c55735dc6971140f6e6105ca55c2829903ef8c
---

# 1.前言

对于LLM agent来说， code和 deep research是两类最主要任务。code 任务和 deep research 任务在认知模式、错误成本、信息来源、上下文需求上有很大区别，这必然导致脚手架在工具集、context 管理、错误恢复、answer 提取等环节都做出截然不同的取舍。笔者之前在 两万字详解 Claude Code 源码核心机制 中介绍了claude code这一主流code agent脚手架的核心机制，此篇文章将会围绕miroflow（MiroThinker产品背后的agent脚手架， github ）介绍一下deep research任务的脚手架有什么特点，在必要的时候也会和code agent脚手架做一些对比。最后一小节也会给出MiroFlow的具体工作流程，让读者了解任务执行的全貌。

首先来整体看下code和deep research这两个任务的主要差异：

- •
  目标的确定性不同
  ：Code 任务的目标通常是清晰且可验证的：修复 bug X、把函数 A 重构成 B、加一个新的 API 接口等。Deep research 任务则相反，答案分散在网络的各个角落，需要多轮搜索、交叉验证、信息整合。没有自动测试能告诉模型"答对了"，目标状态是模糊的。

- •
  信息来源的可控性不同
  ：code agent操作的是本地文件系统——确定性强、权限可控、结果可预期。deep research agent操作的是不可控的外部世界，搜索引擎可能限流、网页reader工具可能抓不下来网页，这要求框架必须具备更强的容错和重试机制。

- •
  轨迹长度不同
  ：code 任务通常 5–50 个工具调用就能完成，deep research可能需要操作几百轮。

- •
  错误成本不同
  ：code 任务里写错文件、跑错命令可能直接破坏工程，所以 code agent会有那么复杂的权限系统、Hooks 系统、Plan 模式审批。Deep research 任务里"搜错关键词"、"读错网页"几乎没有副作用，最多浪费一些 token 重来一次。

- •
  多模态需求不同
  ：Code 任务里几乎都是纯文本（代码、日志、命令）。Deep research 任务在 GAIA 这样的评测上要求模型能看图、听音频、读 PDF等复杂文件操作。

# 2.system prompt

对于agent脚手架来说，system prompt像一个蓝图体现了整体目标和任务特点 。miroflow的完整的system prompt在 https://github.com/MiroMindAI/MiroFlow/tree/main/config/agent_prompts ，这里边有为特定bench（GAIA、BrowseComp）或模型（deepseek）设计的一些prompt本文不再赘述，主要介绍下一些通用的特殊设计的点：

- •
  当天日期硬编码进 SP
  ：模型的训练数据有 cutoff，而 deep research 任务经常涉及"最近一年的某事"。如果 SP 里不显式注入真实日期，模型可能会按训练时的时间认知来判断"今年是哪一年"，写出诡异的搜索 query。

- •
  明确每一次response只返回一个工具调用
  ：这条与 Claude Code、Codex 的"鼓励并行调用"形成鲜明对比。Claude Code 在 SP 里明确说"如果可以并行，请同时发起多个 tool_use"，因为读代码、跑测试这些操作没有强依赖。但 deep research 的工具调用之间几乎都有强依赖——第二次 search 的 query 取决于第一次 search 的结果，第三次 scrape 的 URL 取决于第二次的内容。强制 one-tool-per-message 是为了让模型必须把每一步的中间结果纳入推理后再做下一步。

- •
  Tool-use 必须放在response末尾、不能嵌套
  ：这点和miroflow设计的以xml格式返回有关，防止在正则表达式提取工具调用时乱套，“工具调用”章节会详细介绍miroflow的工具掉用格式。

- •
  打消模型"急着给答案"的倾向
  ：明确说"don't rush to a single definitive answer"。deepresearch任务搜的越多，更容易可能给出正确答案，鼓励进行更多步骤的搜索。

- •
  模型跳出agent loop后system prompt增加一段提示强制总结
  ：如果是因为模型不调用tool call跳出的agent loop说明执行成功，进行总结；如果是因为超过max turn跳出的agent loop要提示任务失败了也要进行强制总结，用户在做deep research时候总归是要一个答案，瞎猜一个总比不输出强。

# 3.工具调用

### miroflow独特的工具调用形式

miroflow的工具调用比较特殊，在介绍其工具调用方式之前，先介绍下原生的function call底层原理。

大部分agent脚手架（codex、opencode等）都使用原生的function call能力，在每次请求中都带着tools字段，传一个dict，告诉模型能用哪些工具，一个简单function call demo如下。

from openai import OpenAI  

client = OpenAI()  

tools = [  
    {  
        "type": "function",  
        "function": {  
            "name": "google_search",  
            "description": "Search Google via Serper.",  
            "parameters": {  
                "type": "object",  
                "properties": {  
                    "q":   {"type": "string",  "description": "query"},  
                    "num": {"type": "integer", "default": 10},  
                    "gl":  {"type": "string",  "default": "us"},  
                    "hl":  {"type": "string",  "default": "en"},  
                },  
                "required": ["q"],  
            },  
        },  
    },  
]  

messages = [  
    {"role": "system", "content": "You are a deep research agent."},  
    {"role": "user",   "content": "Who is the 17th president of Tsinghua University?"},  
]  

resp = client.chat.completions.create(  
    model="gpt-5",  
    messages=messages,  
    tools=tools,           # ← provider 服务端把 dict 序列化进它的 chat template  
    tool_choice="auto",  
)

本质上， 模型本身从头到尾只看 token 序列，根本不存在所谓"结构化 dict" 。当你给 OpenAI / Anthropic 传tools= tools=[...] 时，provider 服务端做的事是把这个 dict 序列化成一段文本，拼进它们自己的system prompt里边（比如GPT的SP中相关部分会用...包裹，不同模型有所不同），让模型感知能用哪些工具。模型感知能用哪些工具后，如果想调用工具，会输出一段带特殊 token 的字符串（OpenAI 的<|tool_call|>{...}<|/tool_call|>、Anthropic 的...）。provider 服务端再把这段字符串解析回结构化 tool_calls JSON dict还给客户端，让用户不感知模型底层的字符串格式。也就是说，本质上， 所有工具调用都是 prompt-based。tools=[...]不过是一种用户把 dict 交给 server端，让它替我们塞进它训练时见过的位置和模板格式"的方便做法 。

MiroFlow 的工具调用规则比较特殊，它不使用 LLM 原生 function call，即 不支持让不同的模型使用不同的tools调用相关token模版 ，直接在system prompt里写死"所有模型"都需要必须以如下xml格式输出，然后在本地（client端）解析出这串文本为dict格式进而能后续进行真正的工具执行（原生function call这个工作是在server端完成的）。

<use_mcp_tool>  
<server_name>searching-mcp-server</server_name>  
<tool_name>google_search</tool_name>  
<arguments>  
{  
  "q": "Tsinghua University 17th president",  
  "num": 10,  
  "gl": "cn",  
  "hl": "zh"  
}  
</arguments>  
</use_mcp_tool>

原生/非原生function call的对比如下：

维度
原生function call
非原生function call（miroflow）

工具描述格式
客户端写 dict
客户端手写文本

工具描述塞在哪
服务端拼进它自己的 chat template
用户控制的 system prompt

模型看到的工具描述
每个模型自己的固定模板
自定义 markdown（对自训练模型 in-distribution，对通用模型 OOD）

模型输出工具调用的格式
模型自己训练过的特殊 token
自定义  XML

工具调用的解析
服务端解析后给 SDK
miroflow框架用正则解析

MiroFlow不使用原生funciton call和deep research这个任务性质无关， 和产品生态有关 。MiroFlow有配套的自训练模型MiroThinker，MiroThinker就是按照这套XML训练的，天然适配。但是这对其他GPT、claude等模型接入miroflow非常不友好，因为这些模型并没有在miroflow这种格式上训练过， 完全依赖 in context learning的能力 。 MiroFlow 论文里报的 "Claude-3.7 跑 X 分、MiroThinker-72B 跑 Y 分、Y > X" 这种结论， 严格来说证明的是"我们的训练 + 框架联合设计在它自己的协议下打过了基线模型在我们协议下的表现" ，而不是"我们的模型本身比 Claude 强"。

如果要让评测真的公平，必须给每个模型配一套它最擅长的（专门训练过的）协议——比如Claude走自家的Cluade Code、GPT-5 走 OpenAI 的Codex、MiroThinker 走自家 XML，并且每套协议都要有等效精心调优的 SP / 错误兜底 / context 管理。这等于要写 三套 完整的 agent 脚手架，每套都要单独消融、单独调参。所以说，有时候，模型训练和agent脚手架的设计是一个co-design系统。

### 工具集

通常的agent脚手架都是将大部分工具写死在代码库里，MiroFlow有所不同， 它所有工具都依托于MCP server。工具都依托于MCP server主要是为了让工具是" 独立可执行的子系统 "。MiroFlow 的工具大多是网络服务 / 沙箱执行（Serper API、Jina Reader、E2B 沙箱、o3 reasoning、Claude visual QA），这些本来就在另一个进程 / 容器 / 网络服务里跑，包成 MCP server 等于把"已经存在的子系统边界"显式化，几乎没有额外开销。而且这些工具调用本身就慢（几百 ms 到十几秒），通信开销相对忽略不计。对于code agent就不能这么设计，code agent需要的是访问文件系统、shell、IDE，如果包成 MCP server 反而麻烦（每次调用都要序列化-反序列化、跨进程通信，开销大）。而且工具本身轻量、调用频繁，直接本地函数调用是更经济的形态。

MiroFlow的主要工具如下所示。整个工具集只有 6 类、十来个工具，而claude code有40多个工具。但MiroFlow每一个工具内部都偏"重"：一次google_search拉回 10 条结构化结果，一次scrape_website拉回一整页渲染好的 markdown，一次run_python_code在 E2B 沙箱里跑完整段 Python 脚本...

MCP server
提供的工具
解决的问题

tool-searching
google_search / wiki_get_page_content / search_wiki_revision / search_archived_webpage / scrape_website
信息检索

tool-reading
read_file
把本地的 PDF/Word/PPT/Excel 用 markitdown 转成 markdown

tool-code
create_sandbox /run_python_code / run_command / upload_file_from_local_to_sandbox / download_file_from_internet_to_sandbox / download_file_from_sandbox_to_local
E2B 沙箱里跑 Python，把"算术 / 解析 / 加密 / 棋局"这些非语言能力补回来

tool-image-video
visual_question_answering、video_understanding
多模态问答

tool-audio
audio_transcription
把 mp3/wav 转写成文字

tool-reasoning
reasoning
把"复杂推理"外包给 o3 / Claude extended thinking

deep research 适合"少而重"的工具集，关键在于工具调用的边际成本。Claude Code 里Read一个本地文件几乎是 0 延迟、0 失败率，多调几次没什么代价；MiroFlow 里google_search一次至少几百 ms，scrape_website跑 Jina Reader 经常要 3–10s，再加上配额、限流、网络抖动的不确定性。"工具调用昂贵"的场景下，模型每多调一次都要付出真实成本，框架就更倾向于一次拉大量结构化结果，让模型在响应里慢慢消化。

下面挑几个比较重要的工具介绍下：

- •
  google_search
  ：google_search参数里设置gl/hl能把对应语言的内容站点拍到搜索列表的前边。tbs能够实现按时间搜索，当模型问"2024 年某 NeurIPS 论文的第一作者"时，如果不限制时间范围，搜索结果可能会被旧版预印本、博客转载淹没，通过这个时间参数过滤噪声信息。

@mcp.tool()  
async def google_search(  
    q: str,  
    gl: str = "us",        # 国家上下文：cn / us / uk  
    hl: str = "en",        # 界面语言：en / zh / es  
    location: str = None,  # 城市级别精度："SoHo, New York, United States"  
    num: int = 10,  
    tbs: str = None,       # 时间过滤：'qdr:y' 近一年、'qdr:m' 近一月  
    page: int = 1,  
) -> str:

- • scrape_website ：scrape_website高优使用jina reader API（需要配置api key）将网页转成markdown格式，能过滤广告、能对图片进行识别，一般agent脚手架带的web fetch工具都没有这么强的能力。如果jina reader不能用的话，会降级成Serper scraping或者原生requests.get，如果调用一次都失败了，还有重试机制。这套复杂的逻辑都藏在这个工具里，也体现出了miroflow设计工具的“重”。

- • search_archived_webpage ：该工具的接口设计如下，可以看到除了url外还有时间信息。他的功能是找到某个url某个时间的网页快照内容，他依托于Wayback Machine提供的服务。这个功能对deep research十分重要。举个例子，比如有个query是"X 公司在 2018 年 Q3 财报里写的某个数字" ， 公司今天的官网早就把那份财报下架了，此时就得需要找该公司的历史快照了。这个功能在claude code中是没有的。该工具返回的也是个url，后续就能用scrape_website进行读取了。

async def search_archived_webpage(url: str, year: int, month: int, day: int) -> str:  
    """Search the Wayback Machine for archived versions of a webpage,  
    optionally for a specific date."""

- • tool-code ：这是一系列和沙箱，能上传文件、执行命令、下载文件等，在沙箱里写代码处理文件之类的。该系列工具会在 E2B 远程服务上起一个云端 Python 沙箱。MiroFlow 的策略是尽量预装好所有可能用到的库（PyPDF2、docx2txt、python-pptx等常用文件处理工具），沙箱启动时一次性 apt-get / pip install，然后整轮任务期间反复复用同一个 sandbox_id，避免每次工具调用都重启沙箱。

- • 为啥用写代码使用沙箱而不是本地修改文件？ ：设计原理也和任务性质有关，deepresearch任务并不像code agent那样改用户的代码，与用户本地无关，远程沙箱更加安全。

- • 为啥设计run_python_code工具，command命令不也能启动python？ 最重要的，run_code 后面挂的是一个 长期存活的 Jupyter Kernel ，整个 sandbox 生命周期内 变量、import、函数定义都在 kernel 内存里持续存在，后边轮的操作可以方便的读之前操作的代码变量。run_python_code返回的是Jupyter execution 对象，能返回matplotlib 图、DataFrame HTML 表、image等复杂数据，这是command命令做不到的。

- • read_file ：mcp server 调用markitown库，PDF/Word/PPT/Excel/HTML等都转成 markdown。当 markitdown 处理本地路径失败（重试穷尽）时，它会降级调用 scrape_website 把这个 URI 当成网页再抓一次。这个工具只能做文件解析，图片内容 、 扫描版pdf这种需要ocr能力的文件是无法处理的，需要额外调用对应的多模态工具。多模态工具底层调用的是VLM、Whisper这类多模态模型API。

- • reasoning ：该工具里边本质上就是再调用一次强推理模型。这个强推理模型只能推理，不能调用任何工具。这么做的优势是，miroflow的 主模型 可以不一定有十分强的推理能力，如果需要强推理让强大的其他模型来干，大大降低整体流程的成本。这个设计完全契合miroflow自家训练的模型（ https://github.com/MiroMindAI/MiroThinker ）特点，他家的模型都是基于qwen开源模型后训练的，模型能力不如claude、gpt等顶尖模型，但是成本会低很多。遇到如下情况时，会调用reasoning工具( 这个工具比较特殊，其他脚手架几乎没有，如果不针对miroflow做agentic训练，未必能用的好)

- • 整合与归纳已收集信息

- • 分析数据中的规律与关联

- • 逻辑推理与问题求解

- • 制定规划与策略

- • 解答复杂数学题、益智谜题、脑筋急转弯及智力测试题目

# 4.agent loop前后的独特处理

### 开头分析题目

和普通的agent脚手架相比，MiroFlow在执行agent loop之前和之后都强制单独调用了一次LLM，这是专门为执行 deep research benchmark设计的。

在执行agent loop之前，MiroFlow会把题面（query）交给一个强模型分析，分析题面里有哪些容易被忽略、容易理解错的点。举个例子，比如对"清华大学第十七任校长是谁"这种题，模型可能会输出如下内容：

注意是"第十七任"，不是"现任"也不是"最有名的"；  
注意校长任期可能跨年度，问的是哪个时间点的状态？  
注意可能存在"代理校长 / 临时校长"是否计入"任"的歧义；

这些内容会被原样拼到 main agent 收到的 user message 后面， 作为提示而不是结论 。背后的设计哲学是把"理解题"和"解题"两个能力解耦：

- •
  推理强和执行强是两种不同的能力
  ：强推理模型擅长把一段文字嚼透、找出隐含约束，但是执行工具不一定效果好，尤其是像MiroFlow这种工具协议比较特殊的脚手架。把理解的任务专门交给更强的模型，执行任务就可以用一个专门训练过的轻量模型来执行了（比如mirothinker的模型是微调的qwen），大大降低deep research任务的成本。reasoning工具也是这个设计哲学的体现。

- •
  题面误读是 deep research 任务里最廉价、最致命的失败模式
  ：一个题面读错的 agent，后面 50 个 turn 全是在错的方向上做高质量执行。在开头用强模型做一次最大幅度的误读防御，是非常划算的。

- •
  分析题目和plan本质是不同的
  ：Claude Code 的 Plan 模式输出的是"我打算做哪几步"，这是步骤层面的东西。MiroFlow 的题目分析阶段刻意不输出计划，只输出"哪里容易翻车"。原因是 deep research 任务里，"计划"会随着搜到新信息不断重写，预先定计划反而是束缚；但"题面里的陷阱"是不变量，越早提醒越好。

### 结尾重写格式

MiroFLow跑完agent loop后，框架会让它换一套 system prompt 输出一份结构化总结（summary阶段，后文会介绍），但是这份总结报告对于GAIA这种要求精确到字符级别的答案来说还是太自由，很容误判（这也是RL verify时候比较头疼的地方）。MiroFlow 在这里又起了一次独立的 LLM 调用，分两步把总结编译成评测协议要的格式：

- • 第一步：判类型。 先用一次 强模型调用决定这道题期望的答案是什么类型，只能是 number / date / time / string 之一。这一步本质上是在做"语法分析"，把自然语言题面归约到一个有限状态机的 4 个状态之一。

- • 第二步：按类型套不同的 prompt。 4 个类型对应 4 段非常长的格式说明 prompt。以 number 类型为例，prompt 里会精确到这种程度：$100 必须输出 100，不能带美元符号；70% 输出 70，不带百分号；...

这块会有一个很自然的疑问，为啥不在主agent loop的 system prompt里约束输出格式？这再次体现了MiroFlow的工程哲学：尽量给main agent loop model减负，能剥离出去的任务就单独剥离出去。main agent loop model的角色被压缩到"只做工具调用 + 信息整合"，其他事情都让外部 LLM 调用兜底。这样训练好一个小模型执行agent loop更容易。

# 5.context管理

deep research任务的context压力通常比code agent任务大不少。MiroFlow可以连续search好几十轮，每轮允许调用最多10次search工具。最主要的是，search、分析网页这些操作经常一次就拉回来好几k token的context，很容易超过模型context len上限（尤其是自家训练的mirothinker小模型）。MiroFlow通过仅保留最近工具调用结果策略和summary阶段的retry-and-rollback机制保证不会因为context超长而失败。

### 仅保留最近调用工具结果

MiroFlow始终保留第一条 user 消息（题面 + 开头分析题目），加上最后 N 条工具结果。中间所有工具结果的 content 字段被替换成一句占位符（"Tool result is omitted to save tokens."）。这种按固定规则仍工具调用结果的方式虽然看起来粗暴，但是对于deep research任务是合理的，因为绝大多数当下的决策依赖最近 1-3 次工具结果。下面给出一个例子，需要强调的是，这块只替换工具结果，assistant的工具调用记录以及再下一轮assistant的

<message role="assistant">  
  <text>我需要查清华大学历任校长列表。</text>  
  <tool_use id="call_001" name="google_search">  
    <args>{"q": "清华大学 历任校长 列表"}</args>  
  </tool_use>  
</message>  

<message role="user">  
  <tool_result tool_use_id="call_001">  
    Tool result is omitted to save tokens.  ⬅️ 只有这里被替换  
  </tool_result>  
</message>  

<message role="assistant">  
  <text>让我抓官网的历任校长名录页。</text>  
  <tool_use id="call_002" name="scrape_website">  
    <args>{"url": "https://www.tsinghua.edu.cn/..."}</args>  
  </tool_use>  
</message>

注意是替换 content 而不是把整条 user 消息删掉，这是一个 API 协议层面的工程妥协，Anthropic / OpenAI 的 messages API 强校验 tool_use 和 tool_result 必须配对，assistant 里出现过的 tool_use_id 必须有对应的 tool_result 跟在后面，少一条 provider 直接拒收。所以只能动 content、不能删消息。

还有一个值得注意的点：这套裁剪机制实际默认是关闭的（keep_tool_result = -1）。原因是 MiroFlow 主用 Claude-3.7（200K context，代码仓库比较老）打榜几乎不会爆，能不丢信息就不丢；它真正派上用场的场景是接 32K context 的本地小模型（比如自家 MiroThinker 8B），不裁剪几乎context必爆。

### summary阶段的retry-and-rollback机制

首先，先介绍一下summary阶段。 主agent loop 环结束之后，框架会给同一个 main agent 换一套 system prompt，新 SP 大致告诉它"现在请基于你之前的工作写一段总结：你找到了什么证据、你的推理过程、你给出的最终答案"，然后调一次 LLM，输入是“ [新 SP] + [完整的对话历史] + [新追加的请总结 prompt] ”， ，输出是一段几百字的结构化总结文本。

在主agent loop中，MiroFlow并没有像claude code那样的（至少开源版本是这样的，很久没更新了）的内容压缩机制，如果agent loop过程中多轮工具调用超长了，直接跳出agent loop，直接走summary流程，将所有的context超长处理逻辑都下放给summary阶段。他之所以超长就放弃的效果还不差的原因在于，一个任务可以执行多次（温度不为0，输出有多样性），单次尝试超长了还可以依赖其他次的rollout。

如果summary阶段遇到超长情况，会不断retry从“完整对话历史”后边一点点删掉assistant+user信息，直到不超长为止。这块其实有点反直觉，多轮搜索越后边的搜索越接近真相，为啥要优先删除后边的工具调用而不删前边的呢？ 串行搜索是有比较严谨的递进逻辑，删除前边的内容会导致逻辑链断裂，summary时候容易出现错误。

"删最近的assistant+user信息"不是没有代价的策略，它赌的是"最近的 turn 在统计上更可能是死循环挣扎的产物"：反复 scrape 同一个加载失败的 URL、反复换关键词搜同一个查不到的事实、陷入 reasoning 循环。这些 turn 占大量 token、几乎没贡献有效信息，删它们近乎无损。但反例也存在——模型可能正好在最后一搜搜到关键证据，这时候删就是真损失。

# 6.sub agent

MiroFlow的sub agent设计和常见的agent脚手架区别很大。在一般agent脚手架中（claude code、codex都这样），main agent 自己干大部分活、偶尔派子任务给 task agent。而MiroFlow 的 main agent 和 sub agent 在功能上几乎是互斥的：开了 sub agent 模式以后，main agent 自己就基本没有工具可以直接调了，仅仅保留reasoning工具，所有执行操作都下放给sub agents，main agent仅进行结果汇总。

从MiroFlow的配置文件中能发现，执行GAIA、HLE这类相对复杂的agent任务时候才开启，只在子任务粒度足够大、sub agents 内部确实能消化掉大量原始信息的场景下才划合适。MiroFlow之所以这么设计sub agent模式和deep research的任务特点也是有关的：

- •
  信息隔离，避免 context 过长
  ：deep research 的工具调用太"重"了，scrape_website、google_search等工具很容易把context撑爆。把信息收集下放给 sub agent 之后，worker 内部消化所有原始 tool_result，最后只交给 main agent一段几百字的 summary。这等于在 main agent的 context 上做了一次按 sub-task 边界的天然压缩，main agent的 context 增长是按"子任务数"线性的，而不是按"工具调用数"线性的。

- •
  任务天然可拆，正好对齐 sub agent 的边界
  ：deep research 任务有个关键特点——它能被干净地切成一个个自包含的子任务（"查清楚 X 的生卒年月"、"找到 Y 论文的第一作者及其所属机构"）。每个子任务自己就能独立完成搜索、交叉验证、得出一个小结论，子任务之间耦合很弱。这种"可拆性"正是 sub agent 架构能成立的前提：你可以把一整个子任务直接丢给性能强大的sub agent，让它在自己的 context 里从头跑到尾，main agent只管收一个结论。

- •
  sub agent 天然带有失败兜底的属性
  ：deep research任务需要大量调用远端环境、工具复杂，跟code agent相比更容易调用失败。sub agent执行任务时，不论成功失败都会给一段 summary 报告，失败时也会显式说"我没完成这个子任务，但我搜到了这些线索"，main agent 拿到这种"半成品"也能继续工作或者重新派一个新的子任务。

# 7.case对比

最后用一个简单的例子来展示claude code这种非专业deep research脚手架和MiroFlow做同样一个任务时候的对比。假设有如下query：

最近一年 NeurIPS 会议上 LLM agent 方向被引最多的论文是哪篇？

### claude code回答过程

- 

- 发起一次网页搜索：WebSearch("NeurIPS 2024 LLM agent most cited paper")

- 

- 扫一眼搜索结果摘要，挑两个看着相关的链接，用 WebFetch 把网页正文抓回来

- 

- 直接根据抓到的网页内容回答，并主动补一句不确定性说明（比如"引用数会随时间变化，以上结果建议你再核实一下"）

### MiroFlow回答过程

- 

- 开始agent loop前处理：在正式开跑之前，先让一个推理能力很强的模型把题面读一遍，提炼出几条"陷阱提示"——比如把"最近一年"翻译成具体的日期区间 2024-05 到 2025-05，并提醒后面"NeurIPS 和 ICLR 是两个不同的会议，容易搞混"。这一步相当于先把一道模糊的题"编译"成一份模型友好的注意事项清单。

- 

- main agent 第 1 轮：调用 google_search 搜索 "NeurIPS 2024 LLM agent paper citation"，并带上参数把时间限制在最近一年（tbs="qdr:y"）、地区设为美国（gl="us"）、语言设为英文（hl="en"），尽量让搜索结果更准。

- 

- main agent 第 2 轮：从搜索结果里挑出 Google Scholar 那个按被引数排序的列表页，用 scrape_website 把整页内容抓回来，拿到候选论文的初步排名。

- 

- main agent 第 3 轮：再用 scrape_website 抓 OpenReview 上对应论文的详情页，核对论文的准确标题和作者，避免被搜索摘要里的错误信息误导。

- 

- main agent 第 4 轮：发现 OpenReview 页面可能改版了、信息对不上，于是调用 search_archived_webpage 去查这个页面的历史存档快照，从旧版本里把需要的信息捞出来。

- 

- main agent 第 5 轮：调用 reasoning 工具做一次交叉验证，把前面几轮搜到的候选答案对照一遍，确认最可能的那个。

- 

- main agent 第 6 轮：这一轮模型不再发起任何工具调用，框架就据此判断"它觉得搜得差不多了"，于是跳出 agent loop，进入收尾的总结（summary）阶段。

- 

- summary 阶段：让模型把整段对话历史读一遍，写成一份结构化的总结报告，给出"候选答案 X（被引 1234）、候选答案 Y（被引 1100）"这样带证据的结论。

- 

- 抽取最终答案：再用一次 LLM 调用，把上一步那段自然语言总结"编译"成评测系统能直接读的格式，也就是 \boxed{X}。

- 

- 给出置信度（confidence）：最后让模型对这个答案的可靠程度打个分，这里给了 75 分（中等），因为论文的被引数本身会随时间变化，答案没法做到百分百确定。