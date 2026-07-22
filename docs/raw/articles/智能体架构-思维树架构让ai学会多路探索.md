---
title: "智能体架构 -- 思维树架构，让AI学会多路探索"
source: wechat
url: https://mp.weixin.qq.com/s/hQvhbIwI9nkIclCj5SxEAA
ingest_date: 2026-07-04
vxc: 64
stars: 4
sha256: 728729ddca19af7576ed16cdb0246031c56cafbd333f670bc2a652acb58fecd8
---

# 智能体架构 -- 思维树架构，让AI学会多路探索

**来源**: 数据STUDIO

**发布日期**: 2026-04-10

**原文链接**: https://mp.weixin.qq.com/s/hQvhbIwI9nkIclCj5SxEAA

---

你以为AI只会“一条道走到黑”？思维树架构让它学会多路探索

你有没有遇到过这种AI助手：当你问一个逻辑谜题，它要么直接给出正确答案，要么就彻底卡住，甚至给你一个荒谬的结论？就像问你“狼、山羊和卷心菜怎么过河”，它要么完美复述答案，要么就让你陷入“狼吃了羊，羊吃了菜”的死循环，毫无补救余地。

问题出在哪里？因为大多数AI的推理方式就像 思维链（Chain of Thought） ，只有一条直线，一旦选错方向，就再也回不了头。而今天我们要介绍的 思维树（Tree of Thoughts） 架构，让AI学会“条条大路通罗马”——它会同时探索多条推理路径，评估每条路的可行性，砍掉死胡同，专注于最有希望的方向，直到找到真正的解决方案。

我们将通过一个经典谜题来实战演示：狼、山羊和卷心菜过河问题。你会看到，为什么思维链会偶尔“翻车”，而思维树却能有条不紊地构建出正确计划。更重要的是，我们将亲手用LangGraph实现这个智能体，让你掌握构建高可靠、强规划能力AI的秘籍。

推荐阅读：

智能体架构 -- 反思模式，让AI自己当代码审查员

智能体架构 -- 工具使用，秒变真·智能助手

智能体架构 -- ReAct，让AI学会“三思而后行”

智能体架构 -- 反思性元认知智能体，让AI学会“三省吾身”

智能体架构 -- 规划架构，让你的智能体效率翻倍！

智能体架构 -- 多智能体系统，组专家团队

智能体架构 -- 黑板系统，让专家团队动态协作

智能体架构 -- 情景记忆与语义记忆栈，让智能体真正“长脑子”

## 什么是思维树？

想象一下，你站在一个迷宫入口。思维链的做法是：闭上眼睛，凭直觉一条路走到底，撞墙了就认输。而思维树的做法是：每到岔路口，就停下来，探索所有可能的方向，标记哪些是死路，哪些看起来有希望，然后重点推进最有希望的那几条，必要时还可以回头重新选择。

技术定义 ：思维树是一种将问题解决建模为 搜索树 的推理框架。在每个决策点，智能体生成多个候选“想法”或下一步行动，通过一个“评判者”评估每个想法的可行性、进展和潜力，然后剪除无效或前景不佳的分支，扩展最有希望的路径。这个过程持续进行，直到找到目标状态。

### 工作流程

- 分解
   ：将复杂问题分解为一系列可管理的步骤或想法。

- 想法生成
   ：针对当前状态，同时生成多个潜在的下一步想法，在搜索树中创建分支。

- 

状态评估
   ：每个新想法导向一个新状态，由评估函数判断：

- 

有效性
  ：这一步是否符合问题规则？（比如过河时狼和羊不能单独留下）

- 进展
  ：这一步是否让我们更接近目标？

- 

启发式
  ：这条路径成功的可能性有多大？

- 

剪枝与扩展
   ：无效或无前景的分支被剪除，然后从最有希望的活跃分支出发，重复想法生成过程。

- 解决方案
   ：重复直到达到目标状态，从根节点到目标节点的想法路径即为解决方案。

### 什么时候该用它？

思维树特别适合以下场景：

- 逻辑谜题与数学问题
  ：如数独、过河谜题、旅行商问题等，规则明确，需要多步骤、非线性推理。

- 复杂规划
  ：当任务涉及顺序操作、必须遵守约束条件时，例如规划一个包含多段行程、预算限制的旅行。

- 创意写作或代码生成
  ：在确定最终方案前，先探索多个故事分支或实现策略，再择优录用。

### 优势与局限

- 优势
  ：

- 鲁棒性强
  ：系统性地探索问题空间，不容易卡在局部死胡同，相比单次推理更可靠。

- 处理组合爆炸
  ：非常适合可能路径数量庞大、传统方法难以穷举的问题。

- 局限
  ：

- 计算开销大
  ：需要大量LLM调用和状态管理，速度和成本都比简单思维链高。

- 评估器依赖
  ：搜索效果很大程度上取决于状态评估逻辑的质量。如果评估不准，可能误剪优质分支。

## 动手实战：用思维树解决“狼、山羊和卷心菜”谜题

让我们亲手搭建一个思维树智能体。我们将使用LangGraph来管理状态和流程，并用一个LLM来生成“有希望的下一步”，同时用环境规则来自动验证和剪枝。

### 阶段 0：准备工作

安装依赖，配置API密钥。这里我们使用Nebius提供的LLM服务，也可以用任何兼容OpenAI API的服务。

# !pip install -q -U langchain-nebius langchain langgraph rich python-dotenv

import os  
import re  
from typing import List, Dict, Any, Optional  
from dotenv import load_dotenv  
from collections import defaultdict  

# Pydantic 用于数据建模  
from pydantic import BaseModel, Field  

# LangChain 组件  
from langchain_nebius import ChatNebius  
from langchain_core.prompts import ChatPromptTemplate  

# LangGraph 组件  
from langgraph.graph import StateGraph, END  
from typing_extensions import TypedDict  

# 美化打印  
from rich.console import Console  
from rich.markdown import Markdown  
from rich.tree import Tree  

# --- API 密钥和追踪设置 ---  
load_dotenv()  
os.environ["LANGCHAIN_TRACING_V2"] = "true"  
os.environ["LANGCHAIN_PROJECT"] = "Agentic Architecture - Tree-of-Thoughts (Nebius)"  

# 检查所需环境变量  
required_vars = ["NEBIUS_API_KEY", "LANGCHAIN_API_KEY"]  
for var in required_vars:  
    if var notin os.environ:  
        print(f"⚠️ 环境变量 {var} 未设置。")  

console = Console()  
print("✅ 环境变量加载完成，追踪已启用。")

### 阶段 1：定义谜题环境

思维树需要一个定义良好的环境来运行。我们为狼、山羊和卷心菜问题定义：

- 状态表示
  ：左岸和右岸有哪些物品，船在哪边。

- 验证规则
  ：检查是否有物品被吃掉（即狼和羊单独在一起，或羊和菜单独在一起）。

- 目标状态
  ：所有物品都到了右岸。

- 可能移动
  ：从当前状态生成所有合法移动。

classPuzzleState(BaseModel):  
    """狼、山羊和卷心菜谜题的状态表示。"""  
    left_bank: set[str] = Field(default_factory=lambda: {"wolf", "goat", "cabbage"})  
    right_bank: set[str] = Field(default_factory=set)  
    boat_location: str = "left"  
    move_description: str = "初始状态。"  

    defis_valid(self) -> bool:  
        """检查当前状态是否有效（没有物品被吃掉）。"""  
        # 检查左岸  
        if self.boat_location == "right":  
            if"wolf"in self.left_bank and"goat"in self.left_bank:  
                returnFalse  
            if"goat"in self.left_bank and"cabbage"in self.left_bank:  
                returnFalse  
        # 检查右岸  
        if self.boat_location == "left":  
            if"wolf"in self.right_bank and"goat"in self.right_bank:  
                returnFalse  
            if"goat"in self.right_bank and"cabbage"in self.right_bank:  
                returnFalse  
        returnTrue  

    defis_goal(self) -> bool:  
        """检查是否达到目标状态。"""  
        return self.right_bank == {"wolf", "goat", "cabbage"}  

    def__hash__(self):  
        # 使状态可哈希，用于检测循环  
        return hash((frozenset(self.left_bank), frozenset(self.right_bank), self.boat_location))  

    def__eq__(self, other):  
        return self.__hash__() == other.__hash__()  

defget_possible_moves(state: PuzzleState) -> list[PuzzleState]:  
    """从当前状态生成所有可能且有效的下一步状态。"""  
    moves = []  
    current_bank = state.left_bank if state.boat_location == "left"else state.right_bank  

    # 选项1：带一个物品过河  
    for item in current_bank:  
        new_state = state.model_copy(deep=True)  
        if state.boat_location == "left":  
            new_state.left_bank.remove(item)  
            new_state.right_bank.add(item)  
            new_state.boat_location = "right"  
            new_state.move_description = f"带{item}到右岸。"  
        else:  
            new_state.right_bank.remove(item)  
            new_state.left_bank.add(item)  
            new_state.boat_location = "left"  
            new_state.move_description = f"带{item}回左岸。"  
        if new_state.is_valid():  
            moves.append(new_state)  

    # 选项2：空船过河  
    empty_move_state = state.model_copy(deep=True)  
    if state.boat_location == "left":  
        empty_move_state.boat_location = "right"  
        empty_move_state.move_description = "空船划到右岸。"  
    else:  
        empty_move_state.boat_location = "left"  
        empty_move_state.move_description = "空船划回左岸。"  
    if empty_move_state.is_valid():  
        moves.append(empty_move_state)  

    return moves  

print("✅ 谜题环境定义完成。")

### 阶段 2：用 LangGraph 实现思维树智能体

现在构建智能体本身。图的状态将跟踪所有活动路径（分支）。节点执行关键的思维树操作：

- 扩展路径
  ：由LLM驱动的想法生成器。它查看每个活动路径的最后一个状态，并从所有合法移动中选择所有可能性（这里我们选择全部扩展，展示树结构）。

- 剪枝路径
  ：状态评估器。移除进入无效状态或形成循环的路径。

- 检查解决方案
  ：条件节点，判断是否有路径达到目标，若达到则终止。

llm = ChatNebius(model="mistralai/Mixtral-8x22B-Instruct-v0.1", temperature=0.4)  

# LLM 移动选择的 Pydantic 模型（这里只作演示，实际我们扩展所有分支）  
classMoveChoice(BaseModel):  
    best_move_index: int = Field(description="从提供的可能移动列表中选择最佳移动的索引。")  
    reasoning: str = Field(description="简要说明为什么这是最有希望的移动。")  

# LangGraph 状态  
classToTState(TypedDict):  
    problem_description: str  
    active_paths: List[List[PuzzleState]]  # 每条路径是 PuzzleState 对象的列表  
    solution: Optional[List[PuzzleState]]   # 最终解决方案  

# 图节点  
definitialize_search(state: ToTState) -> Dict[str, Any]:  
    """节点：设置搜索的初始状态。"""  
    initial_puzzle_state = PuzzleState()  
    return {"active_paths": [[initial_puzzle_state]]}  

defexpand_paths(state: ToTState) -> Dict[str, Any]:  
    """想法生成器：为每个活动路径扩展所有可能的下一步。"""  
    console.print("--- 🌱 正在扩展路径 ---")  
    new_paths = []  

    for path in state['active_paths']:  
        last_state = path[-1]  
        possible_next_states = get_possible_moves(last_state)  

        ifnot possible_next_states:  
            continue# 此路径是死胡同  

        # 为每个合法移动生成新路径  
        for next_state in possible_next_states:  
            new_paths.append(path + [next_state])  

    console.print(f"[cyan]扩展至 {len(new_paths)} 条潜在路径。[/cyan]")  
    return {"active_paths": new_paths}  

defprune_paths(state: ToTState) -> Dict[str, Any]:  
    """状态评估器：剪除无效或包含循环的路径。"""  
    console.print("--- ✂️ 正在剪枝路径 ---")  
    pruned_paths = []  
    for path in state['active_paths']:  
        # 检查循环：如果最后一个状态在路径中先前出现过  
        if path[-1] in path[:-1]:  
            continue# 发现循环，剪除此路径  

        # get_possible_moves 已经确保有效性，这里额外检查循环即可  
        pruned_paths.append(path)  

    console.print(f"[green]剪枝至 {len(pruned_paths)} 条有效、无循环的路径。[/green]")  
    return {"active_paths": pruned_paths}  

# 条件节点  
defcheck_for_solution(state: ToTState) -> str:  
    """检查是否有任何路径已达到目标。"""  
    for path in state['active_paths']:  
        if path[-1].is_goal():  
            console.print("[bold green]🎉 找到解决方案！[/bold green]")  
            state['solution'] = path  # 在状态中记录解决方案  
            return"solution_found"  
    return"continue_search"  

# 构建图  
workflow = StateGraph(ToTState)  
workflow.add_node("initialize", initialize_search)  
workflow.add_node("expand", expand_paths)  
workflow.add_node("prune", prune_paths)  

workflow.set_entry_point("initialize")  
workflow.add_edge("initialize", "expand")  
workflow.add_edge("expand", "prune")  

workflow.add_conditional_edges(  
    "prune",  
    check_for_solution,  
    {  
        "solution_found": END,  
        "continue_search": "expand"  
    }  
)  

tot_agent = workflow.compile()  
print("✅ 思维树智能体图编译完成。")

### 阶段 3：对比测试

现在，我们让思维树智能体去解决谜题，并与简单的思维链（CoT）提示进行对比。

problem = """一个农夫想用一条船带着一只狼、一只山羊和一棵卷心菜过河。船一次只能载农夫和另外一件物品。农夫不在时，狼不能和山羊单独在一起，山羊不能和卷心菜单独在一起。农夫怎样才能把所有东西都安全地运到对岸？"""  

console.print("--- 🌳 正在运行思维树智能体 ---")  
# 递归限制防止图陷入无限循环  
config = {"recursion_limit": 15}  
final_state = tot_agent.invoke({"problem_description": problem}, config=config)  

console.print("\n--- ✅ 思维树智能体解决方案 ---")  
if final_state.get('solution'):  
    solution_path = final_state['solution']  
    # 用 rich.Tree 可视化解决路径  
    tree = Tree("[bold magenta]🐺 狼、山羊和卷心菜问题解决路径[/bold magenta]")  
    for i, state in enumerate(solution_path):  
        tree.add(f"[green]{i+1}.[/green] {state.move_description}")  
    console.print(tree)  
else:  
    console.print("[bold red]在步骤限制内未找到解决方案。[/bold red]")  

console.print("\n--- 🤔 正在运行简单思维链智能体 ---")  
cot_prompt = ChatPromptTemplate.from_messages([  
    ("system", "你是一位世界级的逻辑谜题解决者。请为用户谜题提供逐步解决方案。"),  
    ("human", "{problem}")  
])  
cot_chain = cot_prompt | llm  
cot_result = cot_chain.invoke({"problem": problem}).content  
console.print(Markdown(cot_result))

结果分析 ：

- 思维链（CoT）
  ：对于这个经典问题，一个足够强大的LLM通常能直接给出正确答案，因为它可能已经“背”过答案。但如果你稍作修改（比如物品名称换一下），它就可能犯逻辑错误，而且没有自我纠错机制。它的正确性依赖于记忆和模式匹配，而非真正的可验证推理。

- 思维树（ToT）
  ：我们的智能体通过系统性、可验证的搜索找到了解决方案。从日志中可以看到，它不断扩展路径、剪除死胡同和循环，最终收敛到唯一可行的路径。即使LLM在某些分支上做出次优选择（比如把羊带回左岸看似倒退），智能体仍会保留这个分支，因为它在规则内是合法的，并且可能在后续步骤中变得必要。最终，它构建的路径保证符合问题规则，因为每一步都经过了环境验证。

思维树智能体的成功不靠运气或记忆，而是靠 搜索算法 的可靠性。这使得它成为处理高可靠性、强规划要求任务的理想选择。

## 写在最后

通过这次实战，我们看到了思维树架构如何让AI从“单线推理”升级为“多路探索”。它像一位优秀的棋手，不只考虑一步，而是推演多种可能，再择优落子。

核心回顾

- 原理
   ：思维树将问题转化为状态空间树，通过生成、评估、剪枝、扩展的循环，系统性地搜索解决方案。

- 实践
   ：我们利用LangGraph构建了针对“狼、山羊和卷心菜”谜题的思维树智能体，并亲眼见证了它如何有条不紊地找到答案。

- 避坑
   ：思维树虽然强大，但计算成本高，且依赖高质量的状态评估器。对于简单、路径唯一的问题，思维链可能更经济高效。

对于AI系统设计者而言，思维树是应对复杂规划任务的“重型武器”。它赋予了AI“试错”和“回溯”的能力，让可靠推理成为可能。

如果你要设计一个AI来帮你规划复杂的旅行（比如多城市、多交通方式、有预算和时间限制），你会选择思维树还是其他架构？为什么？或者，你遇到过哪些AI“死脑筋”的场景，让你觉得它需要“多想想”再回答？欢迎在评论区分享你的观察和思考！

🏴‍☠️宝藏级🏴‍☠️ 原创公众号『 数据STUDIO 』内容超级硬核。公众号以Python为核心语言，垂直于数据科学领域，包括 可戳 👉 Python ｜ MySQL ｜ 数据分析 ｜ 数据可视化 ｜ 机器学习与数据挖掘 ｜ 爬虫 等，从入门到进阶！

长按👇关注- 数据STUDIO -设为星标，干货速递
