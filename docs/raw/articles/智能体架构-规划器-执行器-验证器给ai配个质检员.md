---
title: "智能体架构 -- 规划器 → 执行器 → 验证器，给AI配个“质检员”"
source: wechat
url: https://mp.weixin.qq.com/s/63PyETVbhr0UgAJew-z6uA
ingest_date: 2026-07-04
vxc: 49
stars: 4
sha256: 599dc00aa1338cfb3243d66e7b5232eb5ebe87c1b998683df934b93a227fb5eb
---

# 智能体架构 -- 规划器 → 执行器 → 验证器，给AI配个“质检员”

**来源**: 数据STUDIO

**发布日期**: 2026-03-31

**原文链接**: https://mp.weixin.qq.com/s/63PyETVbhr0UgAJew-z6uA

---

你的AI智能体还在“装死”吗？试试这个“质检员”模式，让它学会自我修复！

你有没有遇到过这种场景：你写了一个自动化脚本，去调用某个第三方API，结果API突然挂掉，返回了一堆乱码。你的脚本呢？它像个老实人一样，把这堆乱码原封不动地塞进下一步计算，最后给你一个莫名其妙的答案。

这其实就是很多AI智能体的通病： 它们太“天真”了，只会按计划执行，却不会“质疑”结果的正确性。 上篇文章我们聊了规划架构，让AI学会了“先想后做”。但如果它规划好了，执行时却遭遇了“不可抗力”——比如API宕机、数据为空、格式错误——它照样会傻乎乎地往下走，最终产出一堆垃圾。

怎么办？答案是：给AI配个“质检员”。

今天，我们要深入探讨 规划器 → 执行器 → 验证器（PEV） 架构。它在前面的规划-执行模式上，增加了一个关键角色： 验证器 。这个角色就像一个严格的测试工程师，每执行一步，都会检查结果是否正确。如果发现错误，它会立刻叫停，并触发“重新规划”流程，直到问题解决为止。

我们将从零开始，先构建一个“傻白甜”的规划-执行智能体，看着它如何在错误面前“装死”。然后，我们再为它配上“质检员”，看看它如何起死回生，优雅地完成任务。

推荐阅读：

智能体架构 -- 反思模式，让AI自己当代码审查员

智能体架构 -- 工具使用，秒变真·智能助手

智能体架构 -- ReAct，让AI学会“三思而后行”

智能体架构 -- 反思性元认知智能体，让AI学会“三省吾身”

智能体架构 -- 规划架构，让你的智能体效率翻倍！

智能体架构 -- 多智能体系统，组专家团队

## 为什么要给AI配个“质检员”？

在深入代码之前，我们先来拆解一下PEV架构的核心思想。它的灵感其实来自于我们软件工程里最朴素的道理： 写完代码要测试，测试通过才能上线 。

### 什么是PEV架构？

你可以把它想象成一个严格的餐厅后厨：

- 规划器（Planning）
   ：主厨接到订单后，制定出做菜的步骤：“先去冷库拿牛肉，再去备菜区拿土豆，然后开始烹饪。”

- 执行器（Execution）
   ：切配师傅拿着清单去执行，比如去冷库拿牛肉。

- 

验证器（Verification）
   ：
   质检员
   接过牛肉，仔细检查：“这肉是牛肉吗？新鲜吗？符合标准吗？”

- 

通过
  ：没问题，交给主厨进行下一步。

- 

不通过
  ：牛肉不新鲜！质检员立刻上报：“肉有问题，重新规划！”主厨收到反馈后，修改计划：“换成鸡肉，或者联系供应商更换牛肉。”

- 

重新规划与迭代
   ：直到所有步骤的产出都通过质检，最后才能端给客人。

在技术世界里，PEV架构的工作流是这样的：

- 规划
   ：规划器将大目标分解成一系列具体步骤（比如
   search('研发支出')
   ,
   search('员工数')
   ）。

- 执行
   ：执行器执行下一个步骤，并调用工具（比如网络搜索）。

- 验证
   ：验证器检查执行结果。它会判断结果是有效数据，还是一个错误信息（比如“API不可用”）。

- 

路由与迭代
   ：

- 

成功
  ：如果这一步成功，就继续执行计划的下一步。

- 失败
  ：如果这一步失败，就带着错误信息，
  回到规划器，让它重新制定一个更聪明的计划
  。

- 完成
  ：所有步骤都成功验证后，进入最终的答案合成阶段。

### 什么时候该用它？

这种带“质检员”的架构，尤其适合以下场景：

- 金融、医疗等安全关键型应用
  ：在这些领域，错误信息的代价是巨大的。你绝对不能容忍AI基于一条“找不到”的数据，就给出“这家公司不存在”的结论。

- 依赖不可靠外部API的系统
  ：现实世界中的API（尤其是免费或测试版）并不总是稳定的。PEV架构能帮你优雅地处理这些不稳定因素。

- 高精度任务（法律、科研）
  ：对于需要高度事实准确性的任务，验证器可以充当“事实核查员”，确保每一步检索到的信息都准确无误，然后再被用于后续的推理。

### 优势与局限

优势：

- 鲁棒性与可靠性
  ：这是它的核心价值。它让系统拥有了“免疫系统”，能从错误中学习和恢复。

- 模块化
  ：规划、执行、验证各司其职，代码清晰，易于调试和维护。

局限：

- 延迟与成本增加
  ：每一次工具调用后，都要多一次LLM调用来做验证。这使得PEV成为我们目前讨论过的架构中，速度最慢、成本最高的模式。

- 验证器设计难度
  ：如何设计一个足够智能的验证器，让它能区分“小问题”和“关键故障”，是一个挑战。

## 动手实战：从“装死”到“自救”

理论说完了，直接上代码。我们将分三步走：先搭一个“傻白甜”的基线，再给它配个“质检员”，最后看看效果。

### 阶段 0：准备工作

和之前一样，先准备好我们的开发环境。

# 安装依赖库  
# !pip install -q -U langchain-nebius langchain langgraph rich python-dotenv langchain-tavily

import os  
import re  
from typing import List, Annotated, TypedDict, Optional  
from dotenv import load_dotenv  
import json  

# LangChain 核心组件  
from langchain_nebius import ChatNebius  
from langchain_tavily import TavilySearch  
from langchain_core.messages import BaseMessage, ToolMessage  
from pydantic import BaseModel, Field  

# LangGraph 组件 (用于构建工作流)  
from langgraph.graph import StateGraph, END  

# 美观打印  
from rich.console import Console  
from rich.markdown import Markdown  

# --- 加载API密钥和追踪设置 ---  
load_dotenv()  
os.environ["LANGCHAIN_TRACING_V2"] = "true"  
os.environ["LANGCHAIN_PROJECT"] = "Agentic Architecture - PEV (Nebius)"  

# 检查密钥是否已设置  
for key in ["NEBIUS_API_KEY", "LANGCHAIN_API_KEY", "TAVILY_API_KEY"]:  
    ifnot os.environ.get(key):  
        print(f"⚠️ 未找到 {key}。请创建 .env 文件并填入你的密钥。")  
    else:  
        print(f"✅ {key} 已加载")  

console = Console()  
print("\n🚀 环境准备就绪！")

### 阶段 1：基线测试 - “傻白甜”规划-执行智能体

首先，我们构建一个最简单的规划-执行智能体。为了模拟现实中的失败，我们特意创建一个“不稳定”的工具，它会在遇到特定查询时返回错误。

llm = ChatNebius(model="meta-llama/Meta-Llama-3.1-8B-Instruct", temperature=0)  

# ⚠️ 定义一个“不稳定”工具，对于“员工数”的查询会故意失败  
defflaky_web_search(query: str) -> str:  
    """执行网络搜索，但对特定查询设计为失败。"""  
    console.print(f"🔧 [cyan]正在搜索: '{query}'...[/cyan]")  
    if"employee count"in query.lower():  
        console.print("💥 [bold red]模拟 API 失败！API 端点当前不可用。[/bold red]")  
        return"错误：无法检索数据。API 端点当前不可用。"  
    else:  
        result = TavilySearch(max_results=2).invoke(query)  
        # 确保结果始终是字符串  
        if isinstance(result, (dict, list)):  
            return json.dumps(result, indent=2)  
        return str(result)  

# 定义基础智能体的状态  
classBasicPEState(TypedDict):  
    user_request: str  
    plan: Optional[List[str]]  
    intermediate_steps: List[str]  # 存放执行结果  
    final_answer: Optional[str]  

# Pydantic模型，强制规划器输出结构化的步骤列表  
classPlan(BaseModel):  
    steps: List[str] = Field(description="要执行的查询列表。")  

defbasic_planner_node(state: BasicPEState):  
    """规划器节点：制定行动计划。"""  
    console.print("📝 [bold green]（基础）规划器: 正在创建计划...[/bold green]")  
    planner_llm = llm.with_structured_output(Plan)  
    prompt = f"""  
    你是一个规划智能体。你的任务是将用户的请求分解为一系列清晰的工具查询。  
    - 只返回符合此模式的 JSON：{{ "steps": [ "query1", "query2", ... ] }}  
    - 不要返回任何散文或解释。  
    - 始终使用 'flaky_web_search' 工具进行查询。  

    用户的请求：“{state['user_request']}”  
    """  
    plan = planner_llm.invoke(prompt)  
    return {"plan": plan.steps}  

defbasic_executor_node(state: BasicPEState):  
    """执行器节点：执行计划中的下一步。"""  
    console.print("⚙️ [bold blue]（基础）执行器: 正在运行下一步...[/bold blue]")  
    next_step = state["plan"][0]  
    result = flaky_web_search(next_step)  
    return {  
        "plan": state["plan"][1:],  
        "intermediate_steps": state["intermediate_steps"] + [result]  
    }  

defbasic_synthesizer_node(state: BasicPEState):  
    """合成器节点：根据所有中间步骤生成最终答案。"""  
    console.print("📄 [bold magenta]（基础）合成器: 正在生成最终答案...[/bold magenta]")  
    context = "\n".join(state["intermediate_steps"])  
    prompt = f"使用以下数据为 '{state['user_request']}' 综合一个答案：\n{context}"  
    answer = llm.invoke(prompt).content  
    return {"final_answer": answer}  

# 构建基础图  
pe_graph_builder = StateGraph(BasicPEState)  
pe_graph_builder.add_node("plan", basic_planner_node)  
pe_graph_builder.add_node("execute", basic_executor_node)  
pe_graph_builder.add_node("synthesize", basic_synthesizer_node)  

pe_graph_builder.set_entry_point("plan")  
pe_graph_builder.add_conditional_edges("plan", lambda s: "execute"if s["plan"] else"synthesize")  
pe_graph_builder.add_conditional_edges("execute", lambda s: "execute"if s["plan"] else"synthesize")  
pe_graph_builder.add_edge("synthesize", END)  

basic_pe_app = pe_graph_builder.compile()  
print("✅ 基础规划器-执行器智能体已成功编译。")

用“傻白甜”智能体处理一个“不稳定”问题

我们给它一个需要两个步骤的任务，其中第二步（查询员工数）是我们的“不稳定”工具会失败的那个。

flaky_query = "苹果公司上个财年的研发支出是多少，总员工数是多少？计算每位员工的研发支出。"  

console.print(f"\n🎯 [bold yellow]给基础 P-E 智能体下达任务:[/bold yellow]\n'{flaky_query}'\n")  

initial_pe_input = {"user_request": flaky_query, "intermediate_steps": []}  
final_pe_output = basic_pe_app.invoke(initial_pe_input)  

console.print("\n--- [bold red]基础 P-E 智能体的最终输出[/bold red] ---")  
console.print(Markdown(final_pe_output['final_answer']))

输出讨论： 我们看到了什么？智能体成功执行了第一步（研发支出），但第二步（员工数）返回了错误消息。然而，合成器并不知道这是一个错误，它把错误消息当成了有效数据，并试图用这个错误消息去计算“每位员工的研发支出”。最终答案毫无意义，大概率是“我无法计算，因为其中一个输入是错误消息”。

这个结果完美地展示了“傻白甜”智能体的致命缺陷： 它盲目信任每一个工具的输出，没有自己的判断力。

### 阶段 2：进阶方法 - 规划器-执行器-验证器智能体

现在，我们为这个“傻白甜”配上一个“质检员”——验证器。核心思路是：每执行一步，就验证一步。如果验证失败，就清空计划，触发重新规划。

# 定义验证器的输出结构  
classVerificationResult(BaseModel):  
    is_successful: bool = Field(description="如果工具执行成功且数据有效，则为 True。")  
    reasoning: str = Field(description="验证决策的理由。")  

# 为PEV智能体定义更丰富的状态  
classPEVState(TypedDict):  
    user_request: str  
    plan: Optional[List[str]]  
    last_tool_result: Optional[str]  # 存放上一步工具的执行结果  
    intermediate_steps: List[str]    # 存放已验证通过的有效结果  
    final_answer: Optional[str]  
    retries: int                      # 记录重新规划的次数  

defpev_planner_node(state: PEVState):  
    """PEV规划器节点：能基于失败历史重新规划。"""  
    retries = state.get("retries", 0)  
    if retries > 3:  # 防止无限循环，最多重试3次  
        console.print("🚫 [bold red]（PEV）规划器: 已达重试次数上限。停止。[/bold red]")  
        return {"plan": [], "final_answer": "错误：多次重试后无法完成任务。"}  

    console.print(f"📝 [bold green]（PEV）规划器: 正在创建/修改计划（重试 {retries}）...[/bold green]")  
    planner_llm = llm.with_structured_output(Plan, strict=True)  # 严格模式，强制输出JSON  

    # 将之前所有步骤和失败信息作为上下文，让规划器学习  
    past_context = "\n".join(state["intermediate_steps"])  
    base_prompt = f"""  
    你是一个规划智能体。  
    创建一个计划来回答：'{state['user_request']}'。  
    使用 'flaky_web_search' 工具。  

    规则：  
    - 只返回符合此格式的有效 JSON：{{ "steps": ["query1", "query2"] }}  
    - 最多 5 个步骤。  
    - 不要重复失败的查询或无休止的变体。  
    - 不要输出解释，只输出 JSON。  

    之前的尝试和结果：  
    {past_context}  
    """  
    plan = planner_llm.invoke(base_prompt)  
    return {"plan": plan.steps, "retries": retries + 1}  

defpev_executor_node(state: PEVState):  
    """PEV执行器节点：执行计划中的下一步，并保存结果待验证。"""  
    ifnot state.get("plan"):  
        console.print("⚠️ [yellow]（PEV）执行器: 没有剩余步骤，跳过执行。[/yellow]")  
        return {}  

    console.print("⚙️ [bold blue]（PEV）执行器: 正在运行下一步...[/bold blue]")  
    next_step = state["plan"][0]  
    result = flaky_web_search(next_step)  
    return {"plan": state["plan"][1:], "last_tool_result": result}  

defverifier_node(state: PEVState):  
    """验证器节点：检查上一步工具的执行结果是否有效。"""  
    console.print("🔍 [bold yellow]验证器: 正在检查上次工具结果...[/bold yellow]")  
    verifier_llm = llm.with_structured_output(VerificationResult)  
    prompt = f"""  
    验证以下工具输出是成功结果还是错误消息。  
    任务是 '{state['user_request']}'。  

    工具输出：  
    '{state['last_tool_result']}'  
    """  
    verification = verifier_llm.invoke(prompt)  
    console.print(f"✅ 验证器: 判断为 '{'成功'if verification.is_successful else'失败'}'。理由: {verification.reasoning}")  
      
    if verification.is_successful:  
        # 验证通过：将有效结果添加到最终步骤列表中  
        return {"intermediate_steps": state["intermediate_steps"] + [state['last_tool_result']]}  
    else:  
        # 验证失败：清空计划（触发重新规划），并记录失败原因  
        return {"plan": [], "intermediate_steps": state["intermediate_steps"] + [f"验证失败：{state['last_tool_result']}"]}  

defpev_synthesizer_node(state: PEVState):  
    """PEV合成器节点（复用基础合成器）。"""  
    console.print("📄 [bold magenta]（PEV）合成器: 正在生成最终答案...[/bold magenta]")  
    context = "\n".join(state["intermediate_steps"])  
    prompt = f"使用以下数据为 '{state['user_request']}' 综合一个答案：\n{context}"  
    answer = llm.invoke(prompt).content  
    return {"final_answer": answer}  

defpev_router(state: PEVState):  
    """路由函数：根据当前状态决定下一步。"""  
    # 如果已经有最终答案，直接去合成  
    if state.get("final_answer"):  
        console.print("✅ 路由器: 已有最终答案。转向合成器。")  
        return"synthesize"  

    # 如果计划为空，检查是不是因为验证失败导致的  
    ifnot state["plan"]:  
        if state["intermediate_steps"] and"验证失败"in state["intermediate_steps"][-1]:  
            console.print("🔄 路由器: 验证失败。触发重新规划...")  
            return"plan"# 回到规划器  
        else:  
            console.print("✅ 路由器: 计划完成。转向合成器。")  
            return"synthesize"  
    else:  
        console.print("➡️ 路由器: 计划还有更多步骤。继续执行。")  
        return"execute"  

# 构建PEV图  
pev_graph_builder = StateGraph(PEVState)  
pev_graph_builder.add_node("plan", pev_planner_node)  
pev_graph_builder.add_node("execute", pev_executor_node)  
pev_graph_builder.add_node("verify", verifier_node)  
pev_graph_builder.add_node("synthesize", pev_synthesizer_node)  

pev_graph_builder.set_entry_point("plan")  
pev_graph_builder.add_edge("plan", "execute")  
pev_graph_builder.add_edge("execute", "verify")  
pev_graph_builder.add_conditional_edges("verify", pev_router)  
pev_graph_builder.add_edge("synthesize", END)  

pev_agent_app = pev_graph_builder.compile()  
print("✅ 规划器-执行器-验证器（PEV）智能体已成功编译。")

### 阶段 3：正面交锋

现在，让我们看看配了“质检员”的智能体，在同一个“不稳定”任务面前的表现。

console.print(f"\n🎯 [bold green]给 PEV 智能体下达任务:[/bold green]\n'{flaky_query}'\n")  

initial_pev_input = {"user_request": flaky_query, "intermediate_steps": [], "retries": 0}  

final_pev_output = pev_agent_app.invoke(initial_pev_input)  

console.print("\n--- [bold green]PEV 智能体的最终输出[/bold green] ---")  
console.print(Markdown(final_pev_output['final_answer']))

输出讨论： 这一次，整个流程完全不同，充满了“智能感”：

- 第一次规划
   ：智能体制定了一个计划，比如
   ["苹果公司上个财年研发支出", "苹果公司总员工数"]
   。

- 执行与验证（第一次）
   ：它成功执行了“研发支出”查询，验证器通过。接着执行“员工数”查询，
   flaky_web_search
   返回了错误消息。
   验证器
   立刻捕获了这个错误，并判断为“失败”。

- 路由与重新规划
   ：路由器看到验证失败，于是没有直接去合成答案，而是
   把流程踢回了规划器
   。

- 第二次规划
   ：规划器现在知道了上一次的失败。它可能会制定一个更聪明的计划，比如尝试用不同的搜索词，如
   "苹果公司全球员工人数 2023"
   ，来规避API的故障。

- 执行与验证（第二次）
   ：执行器执行新计划，这次成功了。验证器确认数据有效。

- 合成
   ：最终，合成器只收到了两个有效数据（研发支出和员工数），顺利计算出“每位员工的研发支出”，并给出了正确答案。

这个“规划-执行-验证-失败-重规划-成功”的循环，完美展示了PEV架构的自我修正能力。

### 阶段 4：量化评估

最后，我们用“LLM作为评委”来给两个智能体的鲁棒性和错误处理能力打分。

classRobustnessEvaluation(BaseModel):  
    """评估智能体鲁棒性和错误处理的模式。"""  
    task_completion_score: int = Field(description="评分 1-10，评估智能体是否成功完成任务，忽略数据错误。")  
    error_handling_score: int = Field(description="评分 1-10，评估智能体检测并从错误中恢复的能力。")  
    justification: str = Field(description="对分数的简要理由。")  

judge_llm = llm.with_structured_output(RobustnessEvaluation)  

defevaluate_agent_robustness(query: str, final_state: dict):  
    context = "\n".join(final_state.get("intermediate_steps", []))  
    final_answer = final_state.get("final_answer", "")  
    trace = f"上下文：\n{context}\n\n最终答案：\n{final_answer}"  
          
    prompt = f"""  
    你是一位 AI 智能体的专家评判员。智能体使用的工具被设计为对特定查询失败。评估智能体处理此失败的能力。  
      
    用户的任务： {query}  
    完整的智能体追踪：\n```\n{trace}\n```  
    """  
    return judge_llm.invoke(prompt)  

console.print("--- 📊 评估基础 P-E 智能体的鲁棒性 ---")  
pe_agent_evaluation = evaluate_agent_robustness(flaky_query, final_pe_output)  
console.print(pe_agent_evaluation.model_dump())  

console.print("\n--- 📊 评估 PEV 智能体的鲁棒性 ---")  
pev_agent_evaluation = evaluate_agent_robustness(flaky_query, final_pev_output)  
console.print(pev_agent_evaluation.model_dump())

输出讨论： 评委的评分非常直观：

- 基础P-E智能体
  ：
  error_handling_score
  会非常低，因为它完全没能识别出错误，导致最终答案毫无意义。

- PEV智能体
  ：
  error_handling_score
  会接近满分，因为它成功地检测到了错误，并触发了重新规划，最终恢复了正确的答案。

这份评估从量化角度证明了PEV架构的价值： 它不仅能在一切顺利时工作，更能在出现问题时优雅地恢复，防止错误的传播。

## 写在最后

通过这次实战，我们为AI智能体装上了一双“火眼金睛”和一个“纠错大脑”。PEV架构通过引入验证器，让智能体从盲目的执行者，变成了一个能自我检查、自我修正的“靠谱”助手。

核心回顾

- 原理
   ：PEV架构通过“规划-执行-验证”三阶段循环，为智能体引入了一个关键的“自我修正”能力。

- 实践
   ：我们用LangGraph构建了PEV智能体，并演示了它如何从工具失败中优雅恢复，最终完成任务。

- 避坑
   ：虽然PEV带来了鲁棒性，但也增加了延迟和成本。它最适合对可靠性要求极高，且能接受一定资源消耗的“安全关键型”任务。

构建真正可靠的AI系统，不能只追求它在阳光明媚的日子里的表现，更要确保它在风雨交加的夜晚依然能稳健前行。PEV架构，就是那把为你遮风挡雨的伞。

在开发AI应用时，你是否也遇到过因为外部依赖不稳定而导致“翻车”的经历？你是如何处理的？或者，你觉得除了验证器之外，还有没有其他给AI“上保险”的好方法？欢迎在评论区分享你的经验和脑洞！

🏴‍☠️宝藏级🏴‍☠️ 原创公众号『 数据STUDIO 』内容超级硬核。公众号以Python为核心语言，垂直于数据科学领域，包括 可戳 👉 Python ｜ MySQL ｜ 数据分析 ｜ 数据可视化 ｜ 机器学习与数据挖掘 ｜ 爬虫 等，从入门到进阶！

长按👇关注- 数据STUDIO -设为星标，干货速递
