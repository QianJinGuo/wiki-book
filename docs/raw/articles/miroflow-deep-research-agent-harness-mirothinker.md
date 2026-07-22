---
title: "MiroFlow：Deep Research Agent 脚手架 —— 与 Code Agent 的 6 大工程差异"
source_url: "https://mp.weixin.qq.com/s/ETP2htGp1YxgEM0S8-TRzA"
publish_date: 2026-06-04
tags: [wechat, article, miroflow, mirothinker, miromind, deep-research, agent-harness, code-vs-research, xml-tool-use, mcp-server, e2b-sandbox, context-management, sub-agent]
review_value: 10
review_confidence: 9
review_recommendation: strong
sha256: pending
---

# MiroFlow：Deep Research Agent 脚手架
> 整理：Hermes Agent
> 原文：https://mp.weixin.qq.com/s/ETP2htGp1YxgEM0S8-TRzA
> 项目：MiroFlow (MiroThinker 背后的 agent 脚手架) · [GitHub](https://github.com/MiroMindAI/MiroFlow)
> 配套模型：MiroThinker（基于 qwen 后训练）
> 关键词：Deep Research / Code Agent / XML 工具调用 / MCP server / 上下文管理

## 一句话定位
**MiroFlow = MiroMind AI 专为 Deep Research 任务设计的 agent 脚手架**（配套自训练模型 MiroThinker）。**核心创新**：把"理解题"和"解题"解耦 + XML 自定义工具调用协议 + 长期存活 Jupyter Kernel 沙箱 + sub agent 信息隔离 + 按子任务边界的天然 context 压缩。**对比 Claude Code 等 Code Agent，6 大工程差异**全部围绕"任务确定性低 + 信息源不可控 + 轨迹长 + 错误成本低 + 多模态需求高"展开。

> "**对于 LLM agent 来说，code 和 deep research 是两类最主要任务。code 任务和 deep research 任务在认知模式、错误成本、信息来源、上下文需求上有很大区别，这必然导致脚手架在工具集、context 管理、错误恢复、answer 提取等环节都做出截然不同的取舍。**"

## 0. Code Agent vs Deep Research Agent 5 大核心差异

| 维度 | Code Agent | Deep Research Agent |
|---|---|---|
| **目标确定性** | 清晰可验证（修 bug / 重构函数 / 加 API） | **答案分散在网络各处**（多轮搜索 + 交叉验证 + 信息整合） |
| **信息来源可控性** | 本地文件系统（确定 / 权限可控） | **不可控的外部世界**（限流 / 抓不下来） |
| **轨迹长度** | 5-50 个工具调用 | 可能需要**几百轮** |
| **错误成本** | 写错文件 / 跑错命令可能**直接破坏工程** | 搜错关键词 / 读错网页**几乎无副作用**（最多浪费 token） |
| **多模态需求** | 几乎都是纯文本（代码 / 日志 / 命令） | **看图 / 听音频 / 读 PDF** 等复杂文件操作（GAIA 评测） |

## 1. System Prompt 5 大独特设计

### ① 当天日期硬编码
- 模型训练数据有 cutoff
- Deep research 任务经常涉及"最近一年的某事"
- 不显式注入真实日期 → 模型按训练时认知判断"今年是哪一年" → 写出**诡异搜索 query**

### ② 强制 one-tool-per-message（与 Claude Code 鼓励并行形成对比）
- Claude Code 在 SP 里明确说"如果可以并行，请同时发起多个 tool_use"——读代码 / 跑测试没有强依赖
- **Deep research 工具调用之间几乎都有强依赖**——第二次 search 的 query 取决于第一次的结果
- **强制 one-tool-per-message** 是为了让模型**必须把每一步的中间结果纳入推理后再做下一步**

### ③ Tool-use 必须放在 response 末尾、不能嵌套
- 与 MiroFlow 设计的 **XML 格式返回**有关
- 防止在正则表达式提取工具调用时乱套

### ④ 打消"急着给答案"倾向
- 明确说 "**don't rush to a single definitive answer**"
- **搜得越多，更可能给出正确答案**
- 鼓励进行更多步骤的搜索

### ⑤ Loop 跳出后强制总结
- **如果是模型不调用 tool call 跳出** → 任务成功，进行总结
- **如果超过 max turn 跳出** → 任务失败也要强制总结
- "**用户做 deep research 时候总归是要一个答案，瞎猜一个总比不输出强**"^[raw/articles/miroflow-deep-research-agent-harness-mirothinker.md]

## 2. 工具调用：XML 协议 vs 原生 Function Call

### 原生 Function Call 的本质
> "**本质上，所有工具调用都是 prompt-based**。"

- 模型从头到尾只看 token 序列，不存在"结构化 dict"
- 客户端把 `tools=[...]` 交给 provider，**服务端序列化成文本拼进 chat template**（GPT 用 `...` 包裹，Anthropic 格式不同）
- 模型输出特殊 token 字符串（OpenAI `<|tool_call|>` / Anthropic `<tool_use>`）
- 服务端再解析回结构化 JSON dict 还给客户端

### MiroFlow 的非原生方案
**MiroFlow 不使用 LLM 原生 function call**：
- 直接在 system prompt 里写死"所有模型"都必须以 **XML 格式输出**
- **在本地（client 端）解析**这串文本为 dict 格式
- 用 `<use_mcp_tool>` 自定义 XML

```
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
```

### 对比表

| 维度 | 原生 function call | 非原生（miroflow） |
|---|---|---|
| 工具描述格式 | 客户端写 dict | 客户端手写文本 |
| 工具描述塞在哪 | 服务端拼进 chat template | **用户控制的 system prompt** |
| 模型看到的工具描述 | 每个模型自己的固定模板 | **自定义 markdown**（自训练模型 in-distribution / 通用模型 OOD） |
| 模型输出工具调用的格式 | 模型训练过的特殊 token | **自定义 `<use_mcp_tool>` XML** |
| 工具调用的解析 | 服务端解析后给 SDK | **miroflow 框架用正则解析** |

### 关键判断
> "**MiroFlow 不使用原生 function call 和 deep research 这个任务性质无关，和产品生态有关。** MiroFlow 有配套的自训练模型 MiroThinker，**MiroThinker 就是按照这套 XML 训练的，天然适配**。但是这对其他 GPT / Claude 等模型接入 miroflow 非常不友好，因为这些模型并没有在 miroflow 这种格式上训练过，**完全依赖 in context learning 的能力**。"

> "**MiroFlow 论文里报的'Claude-3.7 跑 X 分、MiroThinker-72B 跑 Y 分、Y > X'这种结论，严格来说证明的是'我们的训练 + 框架联合设计在它自己的协议下打过了基线模型在我们协议下的表现'，而不是'我们的模型本身比 Claude 强'。**"^[raw/articles/miroflow-deep-research-agent-harness-mirothinker.md]

> "**如果要让评测真的公平，必须给每个模型配一套它最擅长的（专门训练过的）协议**——比如 Claude 走自家的 Claude Code、GPT-5 走 OpenAI 的 Codex、MiroThinker 走自家 XML，并且每套协议都要有等效精心调优的 SP / 错误兜底 / context 管理。这等于要写**三套**完整的 agent 脚手架，每套都要单独消融、单独调参。**所以说，有时候，模型训练和 agent 脚手架的设计是一个 co-design 系统。**"

## 3. 工具集：少而重（6 类 10+ 工具 vs Claude Code 40+ 工具）

### 关键设计：所有工具依托 MCP server
> "**MiroFlow 所有工具都依托于 MCP server。**"

**设计理由**：
- 让工具是"**独立可执行的子系统**"
- MiroFlow 的工具大多是**网络服务 / 沙箱执行**（Serper API / Jina Reader / E2B 沙箱 / o3 reasoning / Claude visual QA）
- 这些**本来就在另一个进程 / 容器 / 网络服务里跑**
- 包成 MCP server 等于把"已经存在的子系统边界"显式化，**几乎没有额外开销**
- 这些工具调用本身就**慢（几百 ms 到十几秒）**，通信开销相对忽略不计

**对比 Code Agent**：
- **Code agent 不能这么设计**——需要访问文件系统、shell、IDE
- 如果包成 MCP server 反而麻烦（每次调用都要序列化-反序列化、跨进程通信）
- Code agent 工具**本身轻量、调用频繁**，**直接本地函数调用是更经济的形态**

### MiroFlow 工具集（6 类 10+ 工具）

| MCP server | 工具 | 解决的问题 |
|---|---|---|
| **tool-searching** | google_search / wiki_get_page_content / search_wiki_revision / search_archived_webpage / scrape_website | 信息检索 |
| **tool-reading** | read_file | 把本地 PDF/Word/PPT/Excel 用 markitdown 转成 markdown |
| **tool-code** | create_sandbox / run_python_code / run_command / upload_file_from_local_to_sandbox / download_file_from_internet_to_sandbox / download_file_from_sandbox_to_local | E2B 沙箱里跑 Python |
| **tool-image-video** | visual_question_answering / video_understanding | 多模态问答 |
| **tool-audio** | audio_transcription | 把 mp3/wav 转写成文字 |
| **tool-reasoning** | reasoning | 把"复杂推理"外包给 o3 / Claude extended thinking |

> "**deep research 适合'少而重'的工具集，关键在于工具调用的边际成本。** Claude Code 里 Read 一个本地文件几乎是 0 延迟、0 失败率，多调几次没什么代价；MiroFlow 里 google_search 一次至少几百 ms，scrape_website 跑 Jina Reader 经常要 3-10s，再加上配额、限流、网络抖动的不确定性。**'工具调用昂贵'的场景下，模型每多调一次都要付出真实成本，框架就更倾向于一次拉大量结构化结果，让模型在响应里慢慢消化。**"^[raw/articles/miroflow-deep-research-agent-harness-mirothinker.md]

### 4 个核心工具详解

**google_search**：
```python
async def google_search(
    q: str,
    gl: str = "us",       # 国家上下文：cn / us / uk
    hl: str = "en",       # 界面语言：en / zh / es
    location: str = None, # 城市级别精度："SoHo, New York, United States"
    num: int = 10,
    tbs: str = None,      # 时间过滤：'qdr:y' 近一年、'qdr:m' 近一月
    page: int = 1,
) -> str:
```
- gl/hl 把对应语言内容站点排到搜索列表前面
- **tbs 按时间搜索**（当问"2024 年某 NeurIPS 论文第一作者"时，不限制时间范围可能淹没在旧版预印本/博客转载中）

**scrape_website**：
- **优先用 jina reader API** 把网页转成 markdown（**过滤广告 + 图片识别**）
- jina 不可用 → 降级 Serper scraping 或 requests.get
- 都失败 → **重试机制**
- "**一般 agent 脚手架带的 web fetch 工具都没有这么强的能力**"

**search_archived_webpage**（**Claude Code 没有的功能**）：
- 找某个 URL 某个时间的**网页快照**（依托 Wayback Machine）
- 例：X 公司 2018 Q3 财报数字 → 今天的官网已下架 → 必须找历史快照
- 返回的是 URL → 后续用 scrape_website 读取

**tool-code**（E2B 远程沙箱）：
- 跑 Python / 上传下载文件 / 启动 sandbox
- **预装所有可能用到的库**（PyPDF2 / docx2txt / python-pptx 等）
- 沙箱启动时一次性 apt-get / pip install，**整轮任务期间反复复用同一个 sandbox_id**，避免每次工具调用都重启沙箱

**为什么用沙箱而不是本地修改文件？**
- Deep research 任务不像 code agent 改用户代码，**与用户本地无关，远程沙箱更安全**

**为什么需要 run_python_code（command 命令不也能启动 Python？）**
- **run_code 后面挂的是一个长期存活的 Jupyter Kernel**
- 整个 sandbox 生命周期内**变量 / import / 函数定义都在 kernel 内存里持续存在**
- 后边轮的操作可以**方便地读之前操作的代码变量**
- 返回的是 Jupyter execution 对象，**能返回 matplotlib 图 / DataFrame HTML 表 / image 等复杂数据**——command 命令做不到

**read_file**：
- 调用 markitdown 库，PDF/Word/PPT/Excel/HTML 都转成 markdown
- markitdown 处理失败 → 降级调用 scrape_website
- 只能做文件解析，**图片内容 / 扫描版 PDF 需要 OCR**，需额外调用多模态工具

**reasoning**（**特殊工具，其他脚手架几乎无**）：
- 本质上是**再调用一次强推理模型**
- **强推理模型只能推理，不能调用任何工具**
- 主模型可以不一定有十分强的推理能力，需要强推理时让强大模型来干
- **降低整体流程成本**（MiroThinker 基于 qwen 后训练，能力不如 Claude/GPT 但成本低很多）
- 适用场景：整合归纳 / 分析数据规律 / 逻辑推理 / 制定规划 / 解答复杂数学题/益智谜题

> "**如果不针对 miroflow 做 agentic 训练，未必能用的好**"（reasoning 工具）

## 4. Agent Loop 前后独特处理

### 开头：单独 LLM 调用分析题目

> "**MiroFlow 在执行 agent loop 之前和之后都强制单独调用了一次 LLM，这是专门为执行 deep research benchmark 设计的。**"

**开头分析题目的设计**：
- 把题面（query）交给一个**强模型**分析
- 提炼出"**容易被忽略、容易理解错的点**"
- 例：清华大学第十七任校长是谁 → 提示：
  - 注意是"第十七任"，不是"现任"也不是"最有名的"
  - 注意校长任期可能跨年度，问的是哪个时间点的状态？
  - 注意可能存在"代理校长 / 临时校长"是否计入"任"的歧义
- 这些内容**原样拼到 main agent 收到的 user message 后面，作为提示而不是结论**

**设计哲学**：
> "**理解题"和"解题"两个能力解耦**：
> - 推理强和执行强是**两种不同的能力**——强推理模型擅长把一段文字嚼透、找出隐含约束，但执行工具不一定效果好
> - **题面误读是 deep research 任务里最廉价、最致命的失败模式**——一个题面读错的 agent，后面 50 个 turn 全是在错的方向上做高质量执行。**在开头用强模型做一次最大幅度的误读防御，是非常划算的**
> - **分析题目和 plan 本质是不同的**——Claude Code 的 Plan 模式输出"我打算做哪几步"，是步骤层面；MiroFlow 的题目分析**刻意不输出计划，只输出"哪里容易翻车"**。原因：deep research 任务里"计划"会随着搜到新信息不断重写，预先定计划反而是束缚；但"题面里的陷阱"是**不变量**，越早提醒越好^[raw/articles/miroflow-deep-research-agent-harness-mirothinker.md]

### 结尾：重写格式（两步法）

> "**MiroFLow 跑完 agent loop 后，框架会让它换一套 system prompt 输出一份结构化总结（summary 阶段），但是这份总结报告对于 GAIA 这种要求精确到字符级别的答案来说还是太自由，很容易误判**。"

**两步把总结编译成评测协议要的格式**：

**第一步：判类型**——用一次强模型调用决定这道题期望的答案是什么类型
- 只能是 **number / date / time / string** 之一
- 本质上是"语法分析"，把自然语言题面归约到一个**有限状态机的 4 个状态**

**第二步：按类型套不同的 prompt**——4 个类型对应 4 段非常长的格式说明 prompt
- 以 number 类型为例，prompt 里精确到：**$100 必须输出 100，不能带美元符号；70% 输出 70，不带百分号**

> "**这块会有一个很自然的疑问，为啥不在主 agent loop 的 system prompt 里约束输出格式？** 这再次体现了 MiroFlow 的工程哲学：**尽量给 main agent loop model 减负，能剥离出去的任务就单独剥离出去**。main agent loop model 的角色被压缩到'只做工具调用 + 信息整合'，其他事情都让外部 LLM 调用兜底。**这样训练好一个小模型执行 agent loop 更容易**。"

## 5. 上下文管理：少而精（与 code agent 完全不同）

### 仅保留最近工具调用结果策略

> "**MiroFlow 始终保留第一条 user 消息（题面 + 开头分析题目），加上最后 N 条工具结果。中间所有工具结果的 content 字段被替换成一句占位符（'Tool result is omitted to save tokens.'）。**"

**为什么粗暴但合理**：
- **绝大多数当下的决策依赖最近 1-3 次工具结果**
- Anthropic / OpenAI 的 messages API **强校验 tool_use 和 tool_result 必须配对**（assistant 里出现过的 tool_use_id 必须有对应的 tool_result 跟在后面，**少一条 provider 直接拒收**）
- 所以**只能动 content、不能删消息**

**示例**：
```
<message role="assistant">
  <text>我需要查清华大学历任校长列表。</text>
  <tool_use id="call_001" name="google_search">
    <args>{"q": "清华大学 历任校长 列表"}</args>
  </tool_use>
</message>

<message role="user">
  <tool_result tool_use_id="call_001">
    Tool result is omitted to save tokens.  ⬅️ 只有这里被替换
  </tool_result>
</message>

<message role="assistant">
  <text>让我抓官网的历任校长名录页。</text>
  <tool_use id="call_002" name="scrape_website">
    <args>{"url": "https://www.tsinghua.edu.cn/..."}</args>
  </tool_use>
</message>
```

**关键细节**：
> "**这套裁剪机制实际默认是关闭的（keep_tool_result = -1）**。原因是 MiroFlow 主用 Claude-3.7（200K context，代码仓库比较老）打榜几乎不会爆，**能不丢信息就不丢**；它真正派上用场的场景是接 **32K context 的本地小模型（比如自家 MiroThinker 8B）**，不裁剪几乎 context 必爆。"

### Summary 阶段的 retry-and-rollback 机制

**主 agent loop 结束后**：
- 给同一个 main agent 换一套 system prompt
- 新 SP 大致说"现在请基于你之前的工作写一段总结"
- 输出是一段几百字的结构化总结文本

**关键判断**：
> "**MiroFlow 并没有像 claude code 那样（至少开源版本是这样的，很久没更新了）的内容压缩机制**。**如果 agent loop 过程中多轮工具调用超长了，直接跳出 agent loop，直接走 summary 流程，将所有的 context 超长处理逻辑都下放给 summary 阶段。** 他之所以超长就放弃的效果还不差的原因在于，**一个任务可以执行多次（温度不为 0，输出有多样性），单次尝试超长了还可以依赖其他次的 rollout**。"

**Retry-and-Rollback 机制**：
- 如果 summary 阶段遇到超长情况 → **不断 retry 从"完整对话历史"后边一点点删掉 assistant+user 信息，直到不超长为止**
- **反直觉决策**：优先删除后边的工具调用而不删前边的
  - 理由：**串行搜索有比较严谨的递进逻辑**，删除前边的内容会导致逻辑链断裂
  - 代价："删最近的 turn 在统计上更可能是死循环挣扎的产物"——反复 scrape 同一个加载失败的 URL、反复换关键词搜同一个查不到的事实、陷入 reasoning 循环
  - 这些 turn 占大量 token / 几乎没贡献有效信息，删它们近乎无损
  - **反例也存在**——模型可能正好在最后一搜搜到关键证据，这时候删就是真损失

## 6. Sub Agent：main agent 与 sub agent 互斥

> "**MiroFlow 的 sub agent 设计和常见的 agent 脚手架区别很大。**"

**一般脚手架（Claude Code / Codex）**：
- main agent 自己干大部分活、偶尔派子任务给 task agent

**MiroFlow 的设计**：
- main agent 和 sub agent 在功能上**几乎是互斥的**
- 开了 sub agent 模式以后，**main agent 自己就基本没有工具可以直接调了**
- 仅仅保留 reasoning 工具
- **所有执行操作都下放给 sub agents**
- main agent 仅进行结果汇总

**适用条件**：
- 执行 GAIA / HLE 这类相对复杂的 agent 任务时候才开启
- **只在子任务粒度足够大、sub agents 内部确实能消化掉大量原始信息的场景下才划合适**

**为什么这么设计**（3 大理由）：

**① 信息隔离，避免 context 过长**
- Deep research 的工具调用太"重"（scrape_website / google_search 很容易撑爆）
- 把信息收集下放给 sub agent 之后，**worker 内部消化所有原始 tool_result，最后只交给 main agent 一段几百字的 summary**
- 在 main agent 的 context 上做了**按 sub-task 边界的天然压缩**
- **main agent 的 context 增长是按"子任务数"线性的，而不是按"工具调用数"线性的**

**② 任务天然可拆，正好对齐 sub agent 的边界**
- Deep research 任务**能被干净地切成一个个自包含的子任务**（"查清楚 X 的生卒年月"、"找到 Y 论文的第一作者及其所属机构"）
- 每个子任务自己就能独立完成搜索、交叉验证、得出小结论
- **子任务之间耦合很弱**——这种"可拆性"正是 sub agent 架构能成立的前提

**③ Sub agent 天然带有失败兜底的属性**
- Deep research 任务需要大量调用远端环境、工具复杂，**更容易调用失败**
- Sub agent 执行任务时，**不论成功失败都会给一段 summary 报告**
- 失败时也会**显式说"我没完成这个子任务，但我搜到了这些线索"**
- main agent 拿到这种"半成品"也能继续工作或者重新派一个新的子任务^[raw/articles/miroflow-deep-research-agent-harness-mirothinker.md]

## 7. 完整工作流示例（10 步对比 Claude Code）

**Query**：最近一年 NeurIPS 会议上 LLM agent 方向被引最多的论文是哪篇？

### Claude Code 回答过程
1. 发起一次网页搜索：WebSearch("NeurIPS 2024 LLM agent most cited paper")
2. 扫一眼搜索结果摘要，挑两个看着相关的链接，用 WebFetch 把网页正文抓回来
3. 直接根据抓到的网页内容回答，**并主动补一句不确定性说明**

### MiroFlow 回答过程（10 步）
1. **开始 agent loop 前处理**：先让一个推理能力很强的模型把题面读一遍，提炼出几条"陷阱提示"——把"最近一年"翻译成具体的日期区间 2024-05 到 2025-05，并提醒"NeurIPS 和 ICLR 是两个不同的会议，容易搞混"
2. **main agent 第 1 轮**：调用 google_search 搜索 "NeurIPS 2024 LLM agent paper citation"，并带上参数把时间限制在最近一年（tbs="qdr:y"）、地区设为美国（gl="us"）、语言设为英文（hl="en"）
3. **第 2 轮**：从搜索结果里挑出 Google Scholar 那个按被引数排序的列表页，用 scrape_website 把整页内容抓回来，拿到候选论文的初步排名
4. **第 3 轮**：再用 scrape_website 抓 OpenReview 上对应论文的详情页，核对论文的准确标题和作者
5. **第 4 轮**：发现 OpenReview 页面可能改版了、信息对不上，于是调用 search_archived_webpage 去查这个页面的历史存档快照
6. **第 5 轮**：调用 reasoning 工具做一次交叉验证，把前面几轮搜到的候选答案对照一遍
7. **第 6 轮**：这一轮模型不再发起任何工具调用，框架就据此判断"它觉得搜得差不多了"，于是跳出 agent loop，进入收尾的总结（summary）阶段
8. **summary 阶段**：让模型把整段对话历史读一遍，写成一份结构化的总结报告
9. **抽取最终答案**：再用一次 LLM 调用，把上一步那段自然语言总结"编译"成评测系统能直接读的格式，也就是 `\boxed{X}`
10. **给出置信度（confidence）**：最后让模型对这个答案的可靠程度打个分（这里给了 75 分（中等）），因为论文的被引数本身会随时间变化，**答案没法做到百分百确定**^[raw/articles/miroflow-deep-research-agent-harness-mirothinker.md]

## 8. 核心金句

- "**code 任务和 deep research 任务在认知模式、错误成本、信息来源、上下文需求上有很大区别，这必然导致脚手架在工具集、context 管理、错误恢复、answer 提取等环节都做出截然不同的取舍。**"
- "**本质上，所有工具调用都是 prompt-based**。"
- "**模型训练和 agent 脚手架的设计是一个 co-design 系统**。"
- "**deep research 适合'少而重'的工具集，关键在于工具调用的边际成本。**"
- "**'工具调用昂贵'的场景下，模型每多调一次都要付出真实成本，框架就更倾向于一次拉大量结构化结果，让模型在响应里慢慢消化。**"
- "**理解题"和"解题"两个能力解耦**——推理强和执行强是两种不同的能力"
- "**题面误读是 deep research 任务里最廉价、最致命的失败模式**——在开头用强模型做一次最大幅度的误读防御，是非常划算的"
- "**计划"会随着搜到新信息不断重写，预先定计划反而是束缚；但"题面里的陷阱"是不变量，越早提醒越好**"
- "**尽量给 main agent loop model 减负，能剥离出去的任务就单独剥离出去**——这样训练好一个小模型执行 agent loop 更容易"
- "**用户做 deep research 时候总归是要一个答案，瞎猜一个总比不输出强**"
- "**MiroFlow 始终保留第一条 user 消息（题面 + 开头分析题目），加上最后 N 条工具结果**"
- "**Anthropic / OpenAI 的 messages API 强校验 tool_use 和 tool_result 必须配对**——只能动 content、不能删消息"
- "**main agent 的 context 增长是按"子任务数"线性的，而不是按"工具调用数"线性的**"
- "**deep research 任务能被干净地切成一个个自包含的子任务**——这种'可拆性'正是 sub agent 架构能成立的前提"
- "**答案没法做到百分百确定**"——置信度是 deep research 的内在要求

## 9. 与已有 wiki 实体的关系

### vs [[entities/agent-harness-architecture|Agent Harness 架构]]
- 7 层 harness 模型 = 抽象框架
- **MiroFlow = "deep research 任务性质的脚手架"**——把 harness 设计哲学落到 deep research 任务上的**具体实现 + 工程决策**
- 共同点：都强调"任务性质决定 harness 设计"

### vs [[entities/rein-go-agent-4-modules-5-type-boundaries|Rein]]
- Rein = **Code Agent**（Claude Code 类）的 4 模块 + 5 类型边界
- **MiroFlow = Deep Research Agent 的 6 大工程差异**——与 Rein 互补
- 共同点：都强调"边界 / 工程约束"是 harness 关键

### vs [[entities/wow-harness-v3-governance-protocol|wow-harness v3]]
- v3 = 跨 session 事件时间线（**协议层**治理）
- MiroFlow = 任务级别（**单次任务**）的完整执行流
- 共同点：都强调"治理"是 harness 关键

### vs [[entities/mac-multi-agent-coding-skills-hooks-harness|MAC Skills + Hooks]]
- MAC = 工程师个人框架（**概率层 + 确定性层**）
- MiroFlow = **任务级别**（理解题 + 解题解耦 + sub agent 信息隔离 + 上下文按子任务压缩）
- 共同点：都强调"用机制保证关键事件发生"

### vs [[entities/gaode-ai-native-7x24-pipeline-self-healing|高德 AI-Native 生产线]]
- 高德 = 7×24 永动生产线（**企业级 R&D 链路**）
- MiroFlow = **Deep Research 单次任务执行**（在 GAIA / HLE 评测上打榜）
- 共同点：都强调"用基础设施保证关键事件发生"

### vs [[entities/agent-oriented-infra-intent-driven-code-sedimentation|晓斌 Agent-Oriented Infra]]
- 晓斌 = 哲学框架（4 层设计）
- MiroFlow = 任务级别（**理解题 / 解题 / 总结 / 答案提取** 4 阶段解耦）
- 共同点：都强调"分层 / 解耦"是工程化关键

## 10. 启示

1. **Code Agent 和 Deep Research Agent 是两种不同物种** —— 5 大维度差异（确定性 / 信息源 / 轨迹长度 / 错误成本 / 多模态）
2. **"理解题"和"解题"必须解耦** —— 强推理模型读题 + 轻量模型执行 + reasoning 工具外包复杂推理
3. **"少而重"的工具集哲学** —— 每次工具调用有真实成本时，框架倾向"一次拉大量结构化结果"
4. **长期存活的 Jupyter Kernel 沙箱** —— 变量 / import / 函数定义在 sandbox 生命周期内持续存在
5. **main agent 与 sub agent 互斥** —— main 只保留 reasoning 工具，所有执行下放 sub agent = 上下文按子任务压缩
6. **按子任务天然压缩** —— main agent context 增长按"子任务数"线性而非"工具调用数"线性
7. **search_archived_webpage**（Wayback Machine）—— Claude Code 没有的功能，是 deep research 的关键工具
8. **MCP server 适合 deep research**（网络服务/沙箱/慢调用）—— Code agent 适合本地函数调用（轻量/频繁）
9. **XML 协议是 co-design** —— 自训练模型 + 自定义协议才能发挥最大效能，第三方模型走 in-context learning 难做
10. **删后边 turn 留前边逻辑链** —— context 超长时优先删除最近的死循环挣扎 turn（赌统计概率）

## 11. 局限 / 待验证

- 评测公平性问题：**"MiroFlow 论文里报的 Y>X 严格来说证明的是'我们的训练+框架联合设计在我们的协议下打过了基线模型在我们的协议下的表现'"** —— 自承评测不够公平
- **自训练模型 MiroThinker 基于 qwen 后训练** —— 能力不如 Claude / GPT（自承）
- "**长期存活的 Jupyter Kernel**" —— 沙箱成本 / 配额 / 稳定性未详细说明
- **retry-and-rollback 优先删后边** —— 承认"反例也存在"（最后一搜搜到关键证据就损失）
- **bench 偏向 GAIA / HLE** —— 其他 deep research 场景（如行业研究 / 学术综述）未充分验证

## 相关对照
- [[entities/agent-harness-architecture|Agent Harness 架构]] —— 7 层模型
- [[entities/rein-go-agent-4-modules-5-type-boundaries|Rein]] —— Code Agent 架构
- [[entities/wow-harness-v3-governance-protocol|wow-harness v3]] —— 协议层治理
- [[entities/mac-multi-agent-coding-skills-hooks-harness|MAC Skills + Hooks]] —— 工程师个人框架
- [[entities/gaode-ai-native-7x24-pipeline-self-healing|高德 AI-Native 生产线]] —— 企业级 R&D
- [[entities/agent-oriented-infra-intent-driven-code-sedimentation|晓斌 Agent-Oriented Infra]] —— 哲学框架
- [[entities/kimi-work-codex-vibe-working-paradigm-shift|Kimi Work]] —— 本地 Agent
- [[entities/anolisa-v03-alibaba-agentic-os|ANOLISA v0.3]] —— 阿里 Agentic OS

→ [[raw/articles/miroflow-deep-research-agent-harness-mirothinker.md|原文存档]]
