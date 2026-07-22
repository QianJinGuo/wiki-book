---
source: wechat
source_url: https://mp.weixin.qq.com/s/SEUcHHLx1mL1oNI--5IiRQ
ingested: 2026-07-10
feed_name: 数据STUDIO
wechat_mp_fakeid: MP_WXS_3949259461
source_published: 2026-06-29
sha256: b43ccf2e1fb7f27dc0ab3b3284a905d2ea3d2ea07468f544d96527c773209efc
---

# FastAPI 之父的 PydanticAI 是真的夯！

###  全文速览

* Agent输出不可靠不是prompt问题——LLM概率本质决定字段漂移是常态。
* Samuel Colvin把FastAPI类型校验搬进Agent：声明输出类型→自动校验→失败重来。
* 核心字段精确类型锁死，辅助字段str容错，加UsageLimits硬截断——最务实的方案。

##  01  Agent 输出不对？你需要的不是更好的 prompt

先看两段 Agent 输出。

用纯 prompt 调 Claude，让它分析一篇文章并返回分类结果：

    {"label": "tech", "score": 0.9, "reasoning": "这篇文章主要讲的是..."}  

看起来还行。但跑第 3 次的时候：

    {"category": "technology", "confidence": "high", "explain": "..."}  

字段名变了。  ` label  ` 变成了  ` category  ` ，  ` score  ` 变成了字符串  ` "high"  ` 。

我猜你也写过这种代码：

    try:  
        data = json.loads(agent_response)  
        label = data.get("label") or data.get("category") or data.get("type")  
    except json.JSONDecodeError:  
        label = "unknown"# 先兜底再说  

这就是 Agent 输出的日常现实——格式不可靠，全靠 try/except 救场。而且你心里清楚：这段代码能跑，但经不起推敲。哪天多加一个字段、换一个模型、或者上游改了 system prompt——你又得多写三行  ` .get()  ` 。

但 Samuel Colvin 给了另一个答案：  ** 别去求模型，给它一份执行合约。  **

同样是这个任务，用 PydanticAI 类型约束之后：

    from pydantic import BaseModel  
    from pydantic_ai import Agent  

    class ArticleAnalysis(BaseModel):  
        label: str  
        confidence: float  
        reasoning: str  

    agent = Agent("openai:gpt-4o", result_type=ArticleAnalysis)  
    result = agent.run_sync("分析这篇文章...")  
    print(result.data.label)   # 类型安全，IDE 自动补全  
    print(result.data.confidence)  # 一定是 float，不是字符串  

差别不在代码长短。差别在于：右边的  ` result.data  ` 是 IDE 能检查、运行时能校验的  ** Pydantic 实例  ** ——字段不会漂移、类型不会飘忽、校验失败会自动让模型重来。你不是在补丁式防御，你是在定义时就锁死了输出形状。

这篇文章拆的就是这套机制。

##  02  为什么 prompt engineering 有解决不了的问题

写过 Agent 的人都经历过这个循环：

1. 花 10 分钟写个 prompt，模型返回还行
2. 连跑 5 次，发现 2 次格式跑偏、1 次少字段、1 次多了不该有的东西
3. 往 prompt 里加规则、加示例、加"please ensure your output is valid JSON"
4. 重跑，好了一阵
5. 换了个模型，规则又失效了

这不是你的 prompt 写得不够好。根因在 LLM 本身——  ** temperature + 概率采样 = 非确定输出  ** 。Prompt 说到底是在调概率分布：把某些 token 的概率推高、把另一些压低。但它不是逻辑约束——没法 guarantee 字段名一定是  ` label  ` 不会变成  ` category  ` ，也没法保证  ` confidence  ` 一定是 float 不会是  ` "high"  ` 。

我在一个实际项目里统计过：用 prompt-only 方式让 Agent 输出结构化的 JSON，跑 100 次，  ** 完全合规率 73%  ** 。剩下 27 次里：字段漂移 11 次、类型不对 9 次、嵌套缺失 7 次。

27% 的不合规率意味着什么？如果你的 Agent 输出直接接数据库写入、API 返回、前端渲染——每 4 次调用就有 1 次会炸下游。更糟的是：这 27 次不是均匀分布的。同一段代码，深夜跑、模型负载高的时候、换了一个 provider 的时候——格式漂移的概率会突然跳升。你没法靠"再跑一次"搞定，因为你不知道哪次会出问题。

这就是为什么业界解法从"写更好的 prompt"转向了"加一层合约"。

##  03  Samuel Colvin 的答案：用类型系统锁死 Agent 输出

Samuel Colvin 这个名字你应该不陌生。他写了 FastAPI——那个用 Python type hints 声明 API 参数、自动生成 OpenAPI schema、在请求进来时就校验格式的框架。他还维护着 Pydantic——Python 生态里结构化数据验证的事实标准，2026 年 2 月突破了  ** 10 亿总下载量  ** 。

这俩项目的底层逻辑是同一条：  ** 类型声明应该可执行。不是在文档里写期望，是让代码强制执行。  **

FastAPI 做的事：你声明一个  ` user_id: int  ` ，框架就在请求进来时校验它是不是 int——不是就 422。你不用手写校验逻辑。PydanticAI 把完全相同的思路搬到了 Agent 领域：你声明  ` result_type=ArticleAnalysis  ` ，框架就在模型返回后校验它是不是  ` ArticleAnalysis  ` ——不是就 ModelRetry。你也不用写 try/except。

核心设计是一条泛型：

    Agent[DepsT, OutputT]  

这两个类型参数就是全部哲学：

* **` DepsT  ` ** — Agent 运行需要的依赖（数据库连接、API 客户端、配置），通过依赖注入进  ` RunContext  ` ，跟 FastAPI 的  ` Depends()  ` 一模一样。没有全局状态。
* **` OutputT  ` ** — Agent 输出什么。可以是 Pydantic model、TypedDict、primitive 类型、甚至 Union。框架会在每次调用后，把模型输出塞进这个类型的校验器——通过就返回，不通过就自动让模型重试。

认知转折在这里——

你以前写的是 "prompt → 祈祷 → json.loads → try/except 救场"。

PydanticAI 写的是 "Agent 定义 → LLM 调用 →  ** Pydantic 校验 → 不通过则自动 ModelRetry  ** → 你拿到的一定是 OutputT 类型"。

这不是在运行时修 bug。这是在  ** 定义时  ** 就把输出形状锁死了。

##  04  这么简单的东西怎么保证可靠

PydanticAI 的每次 Agent 调用都被编译为一个三节点的有向图。

理解这个图就理解了全部执行逻辑：

** Node 1 — UserPromptNode（拼装）  **

它不是简单地把你的 prompt 发给模型。它做的事情是：

1. 合并 system_prompt + 你的输入
2. 把  ` OutputT  ` 的 schema 注入（比如告诉 OpenAI "返回格式必须符合这个 JSON Schema"）
3. 把所有已注册的 tool 的 function definition 注入
4. 拼成一条完整的 prompt

你不需要手写 "please output in this format:"——框架帮你干了。

** Node 2 — ModelRequestNode（调用）  **

这一层封装了 25+ provider。不管底层是 OpenAI 的  ` response_format  ` 、Anthropic 的 tool_use、还是 Ollama 本地推理——它都优先用 provider 的  ** native structured output API  ** 。只有 provider 不支持时才退化到 prompted JSON parsing。

切换模型只需改一个字符串：

    agent = Agent("openai:gpt-4o", result_type=MyOutput)  # 用 OpenAI  
    agent = Agent("anthropic:claude-sonnet-4-6", result_type=MyOutput)  # 切 Anthropic  
    agent = Agent("ollama:llama3.2", result_type=MyOutput)  # 切本地模型  

Agent 定义不变。这就是 Model 抽象层的价值：类型契约跟模型选择完全解耦——你换模型，合约还在。

** Node 3 — CallToolsNode（校验 + tool 执行 + 重试）  **

这是整条链路最核心的一环。响应到达后的处理：

* 如果是  ** tool_call  ** → 执行 tool → 把结果送回 Node 2（标准的 tool-calling 循环）
* 如果是  ** final output  ** → 进入两阶段 validator pipeline：
    * ** Phase 1 Validate  ** ：Pydantic 校验。字段类型、必填项、自定义 validator 全部跑一遍。全部通过 → 进入 Phase 2；任一失败 →  ` ModelRetry(message)  ` 信号。 
    * ** Phase 2 Process  ** ：validated data → 语义处理（如调用你自定义的  ` @agent.output_validator  ` ）。 

**` ModelRetry  ` 不是异常。它是控制流信号。  ** 框架自动把校验失败的信息作为  ` RetryPromptPart  ` 注入："你上次返回的 confidence 字段是 string，但期望的类型是 float。请修正。"

然后回到 Node 2，模型拿到错误提示重新生成。默认重试 1 次，最多可配 5 次。

你可能会问：重试多了 token 不会爆吗？会——所以 PydanticAI 提供了  ` UsageLimits  ` （request_limit + total_tokens 硬截断）。这是 Colvin 的工程习惯：给你自由度，但也在关键位置加硬边界。

这就像工厂流水线上的在线质检——不是在出货后抽检，而是每一件都过质检传送带，不合格当场退回重做。

##  05  10 分钟跑通第一个类型安全的 Agent

废话不多说。以下代码可以直接复制运行。需要 Python 3.10+ 和一个 LLM API key。

** Step 1：装依赖 + 设 API key  **

    pip install pydantic-ai  
    export OPENAI_API_KEY="sk-..."# 或用 anthropic / gemini / ollama  

** Step 2：定义输出模型 + 创建 Agent  **

定义输出模型这一步是全部工作的核心——你想让 Agent 返回什么，就用 Pydantic Field 写清楚。  ` Field(ge=0, le=10)  ` 不光给 IDE 看，框架会把它转成 JSON Schema 发给模型、再拿它来校验返回值。一条定义，三处生效：IDE 类型检查 + LLM structured output hint + runtime Pydantic validation。

    from pydantic import BaseModel, Field  
    from pydantic_ai import Agent  

    class CodeReviewResult(BaseModel):  
        """让 Agent 审查代码后按这个格式返回"""  
        overall_score: float = Field(ge=0, le=10, description="综合评分 0-10")  
        bugs_found: int = Field(ge=0, description="发现的 bug 数量")  
        summary: str = Field(max_length=200, description="一句话总结")  
        suggestion: str = Field(description="改进建议")  

    review_agent = Agent(  
        "openai:gpt-4o",  
        result_type=CodeReviewResult,  
        system_prompt="你是一个资深代码审查员。按要求的格式返回审查结果。"  
    )  

** Step 3：运行，拿到类型安全的结果  **

    code = '''  
    def divide(a, b):  
        return a / b  
    '''  

    result = review_agent.run_sync(f"审查这段代码:\n{code}")  
    review: CodeReviewResult = result.data  # IDE 自动补全 review.overall_score  

    print(f"评分: {review.overall_score}")  
    print(f"Bug 数: {review.bugs_found}")  
    print(f"总结: {review.summary}")  

你会注意到——  ` result.data  ` 已经是  ` CodeReviewResult  ` 类型。没有  ` json.loads  ` 、没有  ` try/except  ` 、没有字段名漂移。如果在写代码时把  ` review.overall_score  ` 打错成  ` review.score  ` ，  ** IDE 当场红线  ** ——不等运行时才炸。

** Bonus：加自定义 validator  **

有时候框架的类型校验不够——比如评分不能是 10 但 summary 写得太敷衍。你可以加自己的校验逻辑：

    from pydantic_ai import ModelRetry  

    @review_agent.output_validator  
    def validate_quality(ctx, result: CodeReviewResult):  
        if result.overall_score == 10 and len(result.summary) < 20:  
            raise ModelRetry("给满分但 summary 太短，请展开说明理由")  
        return result  

` ModelRetry  ` 会直接把你的抱怨送回模型："你上次给的评分满分但说明太短了，请修正。"模型拿到反馈重新生成——你不需要写任何重试逻辑。

##  06  这几个坑我帮你踩过了

写这篇文章之前我在一个内部项目里用了两个月 PydanticAI。以下是真实踩坑总结。

** 坑 1：schema 太严，模型反而变笨了  **

我一个同事把  ` summary  ` 字段设了 regex 约束——要求包含至少一个数字、一个英文术语、一个动词。结果 LLM 花了大量"注意力"在凑格式上，实际内容质量反而下降。

解法：核心字段用精确类型（枚举 / float / int），辅助字段用  ` str  ` 容错。类型系统的优势是精确约束最小集——不是把你所有偏好都写成 rule。

** 坑 2：PydanticAI 没有多 Agent 协作  **

这是它跟 CrewAI 最大的差距。PydanticAI 的设计哲学是"一个 Agent 一件事"，agent 之间只能通过  ` agent_as_tool  ` 手动串联。如果你需要 5 个 Agent 各自扮演不同角色、互相传 context——PydanticAI 不擅长这个。

但话说回来，CrewAI 的角色系统虽然灵活，token 开销也大——每个 Agent 的 role/goal/backstory 是每次请求都发过去的。社区 benchmark 显示 CrewAI 比 PydanticAI 多消耗 15-20% 的 token。对成本敏感的场景，这是个真差异。

** 坑 3：UsageLimits 是救命配置，但很容易忘  **

    from pydantic_ai import UsageLimits  

    agent = Agent(  
        "openai:gpt-4o",  
        result_type=MyOutput,  
        usage_limits=UsageLimits(request_limit=20, total_tokens=50000)  
    )  

这个配置经常被跳过去——"我的 Agent 逻辑很简单，不会失控的"。但实际情况是 tool-calling agent 在重试时可能多跑好几轮。设一个硬上限，跑通了再调高。CrewAI 就没这层保护——社区已经报告过单次运行 $414 的极端案例。

** 什么时候选 PydanticAI，什么时候选别的？  **

场景  |  选什么
---|---
单个 Agent，输出要接入下游系统（数据库/API/前端）  |  ** PydanticAI  ** — 类型约束省掉一整层胶水代码
多个 Agent 各自扮演不同角色，需要协作  |  ** CrewAI  ** — 角色系统是为此设计的
复杂的条件分支、循环、人机交互  |  ** LangGraph  ** — 图编排最灵活
已经被 OpenAI 生态深度绑定  |  ** OpenAI Agents SDK  ** — 但锁 vendor

##  07  从 API 合约到 Agent 合约：一场静默的变化

把镜头拉远一点看，PydanticAI 做的事不是"又一个 Agent 框架"。

在它之前，行业默认 Agent 输出不可靠是常态。解法是把 prompt 写得像保险合同——越详细越安心。这说到底是在用"文本建议"解决"逻辑约束"问题。打错了一个维度。

Samuel Colvin 做的是把这个方向翻过来：  ** Agent 输出应该像 API 返回值一样可预期。  ** 不是请求模型按格式输出——是给模型一个格式合约，不按合约来就自动打回修正。

这个变化的意义不只在 Agent 领域。它意味着软件工程的基础设施——类型系统、依赖注入、OpenTelemetry——正在包围 AI 的概率性。从 REST API 的输入校验到 Agent 的输出校验，Colvin 花了 8 年把同一条工程哲学推进了两个时代。

横向看三个主流框架，路线分野已经很清楚：

* ** LangChain  ** — "链"的哲学，灵活但类型安全靠你自己
* ** CrewAI  ** — "团队"的哲学，角色协作强但输出约束弱
* ** PydanticAI  ** — "合约"的哲学，输出最可靠但多 Agent 靠外挂

而且 Pydantic 团队在持续铺路。2026 年 1 月发布的  ** Monty  ** （Python-in-Rust VM），冷启动 6 微秒——是 Docker 的 3 万分之一、Pyodide 的近 500 倍。Colvin 自己的数据：任务成本从 $2 降到了 4 美分。

PydanticAI v2.0 正在 beta 阶段（6 月 10 日发了 beta 7），方向是更深的 multi-agent 支持和 durable execution。如果你现在上手 v1，v2 的迁移成本会很低——Pydantic 团队对 API 稳定性有洁癖级的承诺。

##  08  一份可复用的 Agent 类型约束模板

给你一个可以直接拿去改的模板。定义你的类型、注册你的 tool、跑就完了：

    from pydantic import BaseModel  
    from pydantic_ai import Agent, RunContext, ModelRetry, UsageLimits  

    # 1. 定义你的输出（这是合约，不是建议）  
    class MyOutput(BaseModel):  
        decision: str  
        confidence: float  
        next_step: str  

    # 2. 定义你的依赖（数据库连接、配置等）  
    class MyDeps:  
        user_id: str  
        api_key: str  

    # 3. 注册你的工具  
    @agent.tool  
    async def get_user_context(ctx: RunContext[MyDeps]) -> str:  
        """获取当前用户的操作上下文"""  
        return f"用户 {ctx.deps.user_id} 的操作历史: ..."  

    # 4. 创建 Agent — 类型参数就是你的合约  
    agent = Agent(  
        "openai:gpt-4o",          # 25+ provider 任选，切换只改这行  
        result_type=MyOutput,     # 输出类型——框架帮你 enforce  
        deps_type=MyDeps,         # 依赖类型——FastAPI 模式  
        system_prompt="你是...",  
        usage_limits=UsageLimits(request_limit=10, total_tokens=30000),  
    )  

    # 5. 跑  
    result = agent.run_sync("用户需求...", deps=MyDeps(user_id="u1", api_key="sk-..."))  
    output: MyOutput = result.data  # 这就是你要的类型安全结果  

GitHub: pydantic/pydantic-ai （17.6k stars, MIT license）

下一步怎么玩：

* ** PydanticAI 官方文档  ** — ai.pydantic.dev，output validator 和 tool 系统的例子比我这篇文章多 10 倍
* ** Monty VM  ** — pydantic/monty，如果你需要安全执行 Agent 生成的代码
* ** 多 Agent 编排  ** — 把 PydanticAI Agent 注册为 LangGraph 的 node，既得类型安全又得图编排
