## Ch06.031 MiroFlow：Deep Research Agent 脚手架 —— 与 Code Agent 的 6 大工程差异

> 📊 Level ⭐⭐⭐ | 29.8KB | `entities/miroflow-deep-research-agent-harness-mirothinker.md`

# MiroFlow：Deep Research Agent 脚手架
> "**code 任务和 deep research 任务在认知模式、错误成本、信息来源、上下文需求上有很大区别，这必然导致脚手架在工具集、context 管理、错误恢复、answer 提取等环节都做出截然不同的取舍。**"
>
> "**模型训练和 agent 脚手架的设计是一个 co-design 系统。**"

**MiroFlow** = **MiroMind AI 专为 Deep Research 任务设计的 agent 脚手架**（配套自训练模型 MiroThinker，基于 qwen 后训练）。**核心创新**：把"理解题"和"解题"解耦 + XML 自定义工具调用协议 + 长期存活 Jupyter Kernel 沙箱 + sub agent 信息隔离 + 按子任务边界的天然 context 压缩。**对比 Claude Code 等 Code Agent，6 大工程差异**全部围绕"任务确定性低 + 信息源不可控 + 轨迹长 + 错误成本低 + 多模态需求高"展开。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/miroflow-deep-research-agent-harness-mirothinker.md)
→ [GitHub](https://github.com/MiroMindAI/MiroFlow)

## 一句话定位

**"Code Agent 和 Deep Research Agent 是两种不同物种"** —— 5 大维度差异决定脚手架在工具集、context 管理、错误恢复、answer 提取上做出截然不同的取舍

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

### ⑤ Loop 跳出后强制总结
- "**用户做 deep research 时候总归是要一个答案，瞎猜一个总比不输出强**"

## 2. 工具调用：XML 协议 vs 原生 Function Call

### 原生 Function Call 的本质
> "**本质上，所有工具调用都是 prompt-based**。"

- 模型从头到尾只看 token 序列，不存在"结构化 dict"
- 客户端把 `tools=[...]` 交给 provider，**服务端序列化成文本拼进 chat template**
- 模型输出特殊 token 字符串（OpenAI `<|tool_call|>` / Anthropic `<tool_use>`）
- 服务端再解析回结构化 JSON dict 还给客户端

### MiroFlow 的非原生方案
**MiroFlow 不使用 LLM 原生 function call**：
- 直接在 system prompt 里写死"所有模型"都必须以 **XML 格式输出**
- **在本地（client 端）解析**这串文本为 dict 格式
- 用 `<use_mcp_tool>` 自定义 XML

### 关键判断
> "**MiroFlow 论文里报的'Claude-3.7 跑 X 分、MiroThinker-72B 跑 Y 分、Y > X'这种结论，严格来说证明的是'我们的训练 + 框架联合设计在它自己的协议下打过了基线模型在我们协议下的表现'，而不是'我们的模型本身比 Claude 强'。**"

> "**如果要让评测真的公平，必须给每个模型配一套它最擅长的（专门训练过的）协议**……这等于要写**三套**完整的 agent 脚手架，每套都要单独消融、单独调参。**所以说，有时候，模型训练和 agent 脚手架的设计是一个 co-design 系统。**"

## 3. 工具集：少而重（6 类 10+ 工具 vs Claude Code 40+ 工具）

### 关键设计：所有工具依托 MCP server
> "**MiroFlow 所有工具都依托于 MCP server。**"

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

> "**deep research 适合'少而重'的工具集，关键在于工具调用的边际成本。** Claude Code 里 Read 一个本地文件几乎是 0 延迟、0 失败率，多调几次没什么代价；MiroFlow 里 google_search 一次至少几百 ms，scrape_website 跑 Jina Reader 经常要 3-10s，再加上配额、限流、网络抖动的不确定性。**'工具调用昂贵'的场景下，模型每多调一次都要付出真实成本，框架就更倾向于一次拉大量结构化结果。**"

### 4 个核心工具详解

**google_search**：
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

**tool-code**（E2B 远程沙箱）：
- 跑 Python / 上传下载文件 / 启动 sandbox
- **预装所有可能用到的库**（PyPDF2 / docx2txt / python-pptx 等）
- 沙箱启动时一次性 apt-get / pip install，**整轮任务期间反复复用同一个 sandbox_id**

**为什么需要 run_python_code（command 命令不也能启动 Python？）**：
- **run_code 后面挂的是一个长期存活的 Jupyter Kernel**
- 整个 sandbox 生命周期内**变量 / import / 函数定义都在 kernel 内存里持续存在**
- 后边轮的操作可以**方便地读之前操作的代码变量**
- 返回的是 Jupyter execution 对象，**能返回 matplotlib 图 / DataFrame HTML 表 / image 等复杂数据**——command 命令做不到

**reasoning**（**特殊工具，其他脚手架几乎无**）：
- 本质上是**再调用一次强推理模型**
- **强推理模型只能推理，不能调用任何工具**
- 主模型可以不一定有十分强的推理能力，需要强推理时让强大模型来干
- 适用场景：整合归纳 / 分析数据规律 / 逻辑推理 / 制定规划 / 解答复杂数学题/益智谜题

## 4. Agent Loop 前后独特处理

### 开头：单独 LLM 调用分析题目
> "**MiroFlow 在执行 agent loop 之前和之后都强制单独调用了一次 LLM，这是专门为执行 deep research benchmark 设计的。**"

**开头分析题目**：
- 把题面（query）交给一个**强模型**分析
- 提炼出"**容易被忽略、容易理解错的点**"
- 例：清华大学第十七任校长是谁 → 提示"注意是'第十七任'，不是'现任'"等
- 这些内容**原样拼到 main agent 收到的 user message 后面，作为提示而不是结论**

**设计哲学**：
> "**理解题"和"解题"两个能力解耦**：
> - 推理强和执行强是**两种不同的能力**
> - **题面误读是 deep research 任务里最廉价、最致命的失败模式**——一个题面读错的 agent，后面 50 个 turn 全是在错的方向上做高质量执行。**在开头用强模型做一次最大幅度的误读防御，是非常划算的**
> - **分析题目和 plan 本质是不同的**——MiroFlow 的题目分析**刻意不输出计划，只输出"哪里容易翻车"**。原因：deep research 任务里"计划"会随着搜到新信息不断重写，预先定计划反而是束缚；但"题面里的陷阱"是**不变量**，越早提醒越好

### 结尾：重写格式（两步法）
**两步把总结编译成评测协议要的格式**：
- **第一步：判类型**——强模型调用决定答案类型（number / date / time / string）
- **第二步：按类型套不同的 prompt**——精确到 `$100 必须输出 100，不能带美元符号`

> "**尽量给 main agent loop model 减负，能剥离出去的任务就单独剥离出去**。main agent loop model 的角色被压缩到'只做工具调用 + 信息整合'，其他事情都让外部 LLM 调用兜底。**这样训练好一个小模型执行 agent loop 更容易**。"

## 5. 上下文管理：少而精（与 code agent 完全不同）

### 仅保留最近工具调用结果策略
> "**MiroFlow 始终保留第一条 user 消息（题面 + 开头分析题目），加上最后 N 条工具结果。中间所有工具结果的 content 字段被替换成一句占位符（'Tool result is omitted to save tokens.'）。**"

**为什么粗暴但合理**：
- **绝大多数当下的决策依赖最近 1-3 次工具结果**
- Anthropic / OpenAI 的 messages API **强校验 tool_use 和 tool_result 必须配对**（assistant 里出现过的 tool_use_id 必须有对应的 tool_result 跟在后面，**少一条 provider 直接拒收**）
- 所以**只能动 content、不能删消息**

> "**这套裁剪机制实际默认是关闭的（keep_tool_result = -1）**。原因是 MiroFlow 主用 Claude-3.7（200K context）打榜几乎不会爆，**能不丢信息就不丢**；它真正派上用场的场景是接 **32K context 的本地小模型（比如自家 MiroThinker 8B）**，不裁剪几乎 context 必爆。"

### Summary 阶段的 retry-and-rollback 机制
> "**MiroFlow 并没有像 claude code 那样（至少开源版本是这样的，很久没更新了）的内容压缩机制**。**如果 agent loop 过程中多轮工具调用超长了，直接跳出 agent loop，直接走 summary 流程。** 他之所以超长就放弃的效果还不差的原因在于，**一个任务可以执行多次（温度不为 0，输出有多样性），单次尝试超长了还可以依赖其他次的 rollout**。"

**Retry-and-Rollback 机制**：
- 如果 summary 阶段遇到超长情况 → **不断 retry 从"完整对话历史"后边一点点删掉 assistant+user 信息，直到不超长为止**
- **反直觉决策**：优先删除后边的工具调用而不删前边的
  - 理由：**串行搜索有比较严谨的递进逻辑**，删除前边的内容会导致逻辑链断裂
  - 代价："删最近的 turn 在统计上更可能是死循环挣扎的产物"
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

**3 大设计理由**：

**① 信息隔离，避免 context 过长**
- Deep research 的工具调用太"重"（scrape_website / google_search 很容易撑爆）
- 把信息收集下放给 sub agent 之后，**worker 内部消化所有原始 tool_result，最后只交给 main agent 一段几百字的 summary**
- 在 main agent 的 context 上做了**按 sub-task 边界的天然压缩**
- **main agent 的 context 增长是按"子任务数"线性的，而不是按"工具调用数"线性的**

**② 任务天然可拆，正好对齐 sub agent 的边界**
- Deep research 任务**能被干净地切成一个个自包含的子任务**（"查清楚 X 的生卒年月"、"找到 Y 论文的第一作者及其所属机构"）
- **子任务之间耦合很弱**——这种"可拆性"正是 sub agent 架构能成立的前提

**③ Sub agent 天然带有失败兜底的属性**
- Deep research 任务需要大量调用远端环境、工具复杂，**更容易调用失败**
- Sub agent 执行任务时，**不论成功失败都会给一段 summary 报告**
- 失败时也会**显式说"我没完成这个子任务，但我搜到了这些线索"**
- main agent 拿到这种"半成品"也能继续工作或者重新派一个新的子任务

## 7. 完整工作流示例（10 步对比 Claude Code）

**Query**：最近一年 NeurIPS 会议上 LLM agent 方向被引最多的论文是哪篇？

### Claude Code 回答过程
1. 发起一次网页搜索：WebSearch("NeurIPS 2024 LLM agent most cited paper")
2. 扫一眼搜索结果摘要，挑两个看着相关的链接，用 WebFetch 把网页正文抓回来
3. 直接根据抓到的网页内容回答，**并主动补一句不确定性说明**

### MiroFlow 回答过程（10 步）
1. **开始 agent loop 前处理**：先让一个推理能力很强的模型把题面读一遍，提炼出几条"陷阱提示"——把"最近一年"翻译成具体的日期区间 2024-05 到 2025-05，并提醒"NeurIPS 和 ICLR 是两个不同的会议"
2. **main agent 第 1 轮**：调用 google_search + tbs 时间限制 + gl/hl 地区语言参数
3. **第 2 轮**：scrape_website 抓 Google Scholar 按被引数排序的列表页
4. **第 3 轮**：scrape_website 抓 OpenReview 论文详情页
5. **第 4 轮**：发现 OpenReview 改版了 → search_archived_webpage 查 Wayback Machine 历史快照
6. **第 5 轮**：reasoning 工具做交叉验证
7. **第 6 轮**：模型不再调用工具 → 跳出 agent loop
8. **summary 阶段**：结构化总结报告
9. **抽取最终答案**：LLM 调用把自然语言总结"编译"成 `\boxed{X}` 格式
10. **给出置信度**：75 分（中等）—— 答案没法做到百分百确定

## 8. 核心金句

- "**code 任务和 deep research 任务在认知模式、错误成本、信息来源、上下文需求上有很大区别，这必然导致脚手架在工具集、context 管理、错误恢复、answer 提取等环节都做出截然不同的取舍。**"
- "**本质上，所有工具调用都是 prompt-based**。"
- "**模型训练和 agent 脚手架的设计是一个 co-design 系统**。"
- "**deep research 适合'少而重'的工具集，关键在于工具调用的边际成本。**"
- "**理解题"和"解题"两个能力解耦**"
- "**题面误读是 deep research 任务里最廉价、最致命的失败模式**——在开头用强模型做一次最大幅度的误读防御，是非常划算的"
- "**计划"会随着搜到新信息不断重写，预先定计划反而是束缚；但"题面里的陷阱"是不变量，越早提醒越好**"
- "**尽量给 main agent loop model 减负，能剥离出去的任务就单独剥离出去**"
- "**用户做 deep research 时候总归是要一个答案，瞎猜一个总比不输出强**"
- "**Anthropic / OpenAI 的 messages API 强校验 tool_use 和 tool_result 必须配对**——只能动 content、不能删消息"
- "**main agent 的 context 增长是按"子任务数"线性的，而不是按"工具调用数"线性的**"
- "**deep research 任务能被干净地切成一个个自包含的子任务**——这种'可拆性'正是 sub agent 架构能成立的前提"
- "**答案没法做到百分百确定**"——置信度是 deep research 的内在要求

## 9. 与已有 wiki 实体的关系

### vs [Agent Harness 架构](ch04-207-agentcore-managed-harness.html)
- 7 层 harness 模型 = 抽象框架
- **MiroFlow = "deep research 任务性质的脚手架"**——把 harness 设计哲学落到 deep research 任务上的**具体实现 + 工程决策**

### vs [Rein](ch04-050-rein-4-模块-5-类型边界防止-agent-go-膨胀到-3000-行.html)
- Rein = **Code Agent** 的 4 模块 + 5 类型边界
- **MiroFlow = Deep Research Agent 的 6 大工程差异**——与 Rein 互补
- 共同点：都强调"边界 / 工程约束"是 harness 关键

### vs [wow-harness v3](ch05-028-wow-harness-v3-ai.html)
- v3 = 跨 session 事件时间线（**协议层**治理）
- MiroFlow = 任务级别（**单次任务**）的完整执行流
- 共同点：都强调"治理"是 harness 关键

### vs [MAC Skills + Hooks](ch05-026-mac-multi-agent-coding-skills-hooks-两层-harness-完全委托-0.html)
- MAC = 工程师个人框架（**概率层 + 确定性层**）
- MiroFlow = **任务级别**（理解题 / 解题 / 总结 / 答案提取 4 阶段解耦）
- 共同点：都强调"用机制保证关键事件发生"

### vs [高德 AI-Native 生产线](ch04-028-高德-ai-native-生产线-第-3-期-7x24-self-healing-pipeline-agent-自.html)
- 高德 = 7×24 永动生产线（**企业级 R&D 链路**）
- MiroFlow = **Deep Research 单次任务执行**（在 GAIA / HLE 评测上打榜）

### vs [晓斌 Agent-Oriented Infra](ch04-031-晓斌-从-people-oriented-到-agent-oriented-infra-意图驱动-代码沉淀的进.html)
- 晓斌 = 哲学框架（4 层设计）
- MiroFlow = 任务级别（**理解题 / 解题 / 总结 / 答案提取** 4 阶段解耦）

## 10. 启示

1. **Code Agent 和 Deep Research Agent 是两种不同物种** —— 5 大维度差异决定脚手架在所有环节的不同取舍
2. **"理解题"和"解题"必须解耦** —— 强推理模型读题 + 轻量模型执行 + reasoning 工具外包复杂推理
3. **"少而重"的工具集哲学** —— 每次工具调用有真实成本时，框架倾向"一次拉大量结构化结果"
4. **长期存活的 Jupyter Kernel 沙箱** —— 变量 / import / 函数定义在 sandbox 生命周期内持续存在
5. **main agent 与 sub agent 互斥** —— main 只保留 reasoning 工具，所有执行下放 sub agent
6. **按子任务天然压缩** —— main agent context 增长按"子任务数"线性而非"工具调用数"线性
7. **search_archived_webpage**（Wayback Machine）—— Claude Code 没有的功能，是 deep research 的关键工具
8. **MCP server 适合 deep research**（网络服务/沙箱/慢调用）—— Code agent 适合本地函数调用（轻量/频繁）
9. **XML 协议是 co-design** —— 自训练模型 + 自定义协议才能发挥最大效能
10. **删后边 turn 留前边逻辑链** —— context 超长时优先删除最近的死循环挣扎 turn

## 11. 局限 / 待验证

- 评测公平性问题：**自承"严格来说证明的是'我们的训练+框架联合设计在我们的协议下打过了基线模型在我们的协议下的表现'"**
- **自训练模型 MiroThinker 基于 qwen 后训练** —— 能力不如 Claude / GPT（自承）
- "**长期存活的 Jupyter Kernel**" —— 沙箱成本 / 配额 / 稳定性未详细说明
- **retry-and-rollback 优先删后边** —— 承认"反例也存在"
- **bench 偏向 GAIA / HLE** —— 其他 deep research 场景（如行业研究 / 学术综述）未充分验证

## 深度分析

- **MiroFlow 的 XML 协议本质上是"训练-框架联合设计"的产物，而非通用方案**。MiroFlow 不使用 LLM 原生 function call，直接在 system prompt 里写死 XML 格式输出，在 client 端解析为 dict 格式。这种设计的核心前提是 MiroThinker 模型本身按此格式后训练，天然 in-distribution。对于第三方模型（Claude/GPT），只能靠 in-context learning 泛化，协议收益大打折扣。这再次印证了"模型训练和 agent 脚手架的设计是一个 co-design 系统" 

- **"少而重"工具集的背后是工具调用边际成本的结构性差异**。对比 Code Agent（Read 本地文件几乎 0 延迟、0 失败率），MiroFlow 里 google_search 至少几百 ms、scrape_website 跑 Jina Reader经常要 3-10s，再加上配额、限流、网络抖动。在"工具调用昂贵"的场景下，框架必须倾向于一次拉大量结构化结果让模型慢慢消化，而非频繁小调用。这是 deep research 任务性质决定的工程取舍，不是实现细节 

- **"理解题"和"解题"解耦是 MiroFlow 最核心的架构洞察**。题面误读是 deep research 任务里最廉价、最致命的失败模式——一个题面读错的 agent，后面 50 个 turn 全是在错的方向上做高质量执行。在开头用强模型做最大幅度的误读防御，把"陷阱提示"原样拼到 main agent 收到的 user message 后面作为提示而非结论，同时刻意不输出"计划"（计划随搜到新信息不断重写），只输出"哪里容易翻车"——这是题面不变量和计划可变性的本质区分 

- **main agent 与 sub agent 的互斥设计，本质上是按子任务边界做 context 压缩**。Deep research 任务能被干净切成自包含子任务（查 X 生卒年月、找 Y 论文第一作者），子任务间耦合很弱。开了 sub agent 模式后，main agent 只保留 reasoning 工具，所有执行下放 sub agent，worker 内部消化所有原始 tool_result 只交给 main agent 一段几百字 summary。main agent context 增长变成按"子任务数"线性而非"工具调用数"线性，这是架构层面的上下文管理突破 

- **置信度是 deep research 的内在要求而非可选项**。MiroFlow 结尾用两步法（判类型→套格式 prompt）把总结编译成精确格式，给出置信度评分（示例 75 分中等），明确"答案没法做到百分百确定"。这与 GAIA/HLE 等 benchmark 要求精确到字符级别答案形成张力——框架必须在"强制给答案"和"诚实评估不确定性"之间取得平衡 

## 实践启示

- **在 deep research 场景优先考虑"题面分析"前置步骤**。用强推理模型单独分析 query，提炼"容易被忽略、容易理解错的点"作为提示拼到 user message 后面。这个设计成本极低（额外一次 LLM 调用），但能显著降低"题面误读导致全链路失败"的概率。对比 Code Agent 几乎不需要这个步骤，因为 code 任务的题面是确定性的 

- **当工具调用有真实边际成本时，框架应设计"一次拉大量结构化结果"的策略**。google_search 优先带齐 gl/hl/tbs 参数、scrape_website 优先用 jina reader API 一次转 markdown、reasoning 工具外包给 o3/Claude extended thinking——每次工具调用都尽量让返回信息密度最大化，避免模型因为工具调用代价高而陷入"调一次不够、调两次太贵"的两难困境 

- **context 超长时采用"删后边 turn 留前边逻辑链"的 retry-and-rollback 策略**。优先删除最近的死循环挣扎 turn（反复 scrape 同一个加载失败的 URL、反复换关键词搜同一个查不到的事实），这些占大量 token 但几乎没贡献有效信息。代价是"删最近的 turn 在统计上更可能是最后一搜搜到关键证据的 turn"——承认反例也存在，决策建立在统计概率而非确定性上 

- **sub agent 架构适用于子任务粒度足够大、内部能消化大量原始信息的场景**。MiroFlow 的 sub agent 设计在功能上与 main agent 几乎互斥——开了 sub agent 后 main agent 自己几乎没有工具可调，所有执行下放 sub agent。这个设计适用条件是：子任务自包含、子任务间耦合弱、worker 内部能消化掉大量原始 tool_result。如果子任务太细碎，sub agent 架构反而增加 overhead 

- **长期存活的 Jupyter Kernel 沙箱是 deep research 区别于 code agent 的关键基础设施**。整个 sandbox 生命周期内变量/import/函数定义在 kernel 内存里持续存在，后边轮的操作可以读之前操作的代码变量，返回 Jupyter execution 对象能带 matplotlib 图/DataFrame HTML 表/image 等复杂数据。这是 command 命令做不到的，也是 deep research 任务（需要分析数据、画图、读复杂文件）区别于 code agent（改用户本地代码）的本质需求 

## 相关对照
- [Agent Harness 架构](ch04-207-agentcore-managed-harness.html) —— 7 层模型
- [Rein](ch04-050-rein-4-模块-5-类型边界防止-agent-go-膨胀到-3000-行.html) —— Code Agent 架构
- [wow-harness v3](ch05-028-wow-harness-v3-ai.html) —— 协议层治理
- [MAC Skills + Hooks](ch05-026-mac-multi-agent-coding-skills-hooks-两层-harness-完全委托-0.html) —— 工程师个人框架
- [高德 AI-Native 生产线](ch04-028-高德-ai-native-生产线-第-3-期-7x24-self-healing-pipeline-agent-自.html) —— 企业级 R&D
- [晓斌 Agent-Oriented Infra](ch04-031-晓斌-从-people-oriented-到-agent-oriented-infra-意图驱动-代码沉淀的进.html) —— 哲学框架
- [Kimi Work](ch01-159-kimi-work-通用-agent-战场从云端迁移到本地.html) —— 本地 Agent
- [ANOLISA v0.3](ch04-055-agent-skillify.html) —— 阿里 Agentic OS

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/miroflow-deep-research-agent-harness-mirothinker.md)

---
