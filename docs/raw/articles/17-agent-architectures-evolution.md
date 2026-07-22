---
source_url: https://mp.weixin.qq.com/s/5f0I2apY4oFsHrttANBOJg
source_name: 腾讯技术工程
title: "从0开发大模型的17种Agent架构演进详细拆解"
author: linkxzhou（周末程序猿）
ingested: 2026-05-18
sha256: b84535bb2ddaf82b6a7c4ba1a3436f9fd22b8dc183d38666cf2de5ceffdcf20c
tags: [agent, architecture, control-flow, reflection, react, planning, pev, multi-agent, blackboard, ensemble, memory, tot, dry-run, metacognitive, self-improve, cellular-automata, agno]
type: article
---
用 agno 框架重写 17 种 Agent 控制流的完整演进指南。
核心论点：Agent architecture 的本质不是 prompt engineering，而是控制流设计。17 次系统升级拆解为：上一个架构为什么不够、下一个架构多了什么控制能力、复杂度从哪里开始失控。
统一分析框架（六个问题）：它要解决什么问题、State 是什么、拓扑是什么、Router 怎么工作、失败模式是什么、什么时候升级。
总演化路径：单次生成优化 → 反思闭环 → 工具交互 → 观察-行动循环 → 显式规划 → 验证驱动重规划 → 多Agent编排 → 长期记忆系统 → 搜索/模拟/涌现计算 → 安全边界。
总览表：
阶段 | 新增能力 | 代表架构
单次生成优化 | critique pass | Reflection
与世界交互 | tool interface | Tool Use
观察持续行动 | observation loop | ReAct
显式规划 | explicit planning | Planning
验证接入主回路 | verification loop | PEV
认知任务拆角色 | role decomposition | Multi-Agent
中间状态共享 | shared workspace | Blackboard
入口路由系统 | entry routing | Meta-Controller
冗余换可靠性 | parallel redundancy | Ensemble
历史状态入系统 | long-term memory | Episodic+Semantic
推理变搜索 | search tree | ToT
行动前模拟 | counterfactual execution | Mental Loop
副作用关闸门 | side-effect gating | Dry-Run
自我边界建模 | self-boundary reasoning | Metacognitive
质量改进循环 | iterative refinement | Self-Improve
去中心化计算 | emergence | Cellular Automata
详细拆解（每种架构含 agno 代码）：
1. Reflection：最小质量闭环。generator → critic → refiner 三阶段线性流程。新增 state: draft/critique/refined_code。无 router。失败模式: 无法验证 refiner 是否真修好了。
2. Tool Use：文本世界到结构化世界的跨越。state 是事件日志(user input→model output→tool call→tool return→next round)。agno 内部 while 循环: 只要 model 回复有 tool_calls，就继续。失败来自边界层（工具名幻觉、参数类型错误、序列化/反序列化失败）。
3. ReAct：Agent 真正成形。Tool Use 的 tool→model 循环边是最重要的回边。agno 内置 reasoning=True 将 Thought→Action→Observation 写进 trace。拓扑是闭环。80% 任务起点。失败模式: 局部贪心。
4. Planning：控制流变成模型输出。新增 plan: List[str] state。Loop(execute_all) + end_condition=plan_is_empty。路由从"LLM 临时决定"变成"数据结构是否还有剩余项"。失败模式: plan 错了后面全错（可预测性增强，适应性下降）。
5. PEV（Plan→Execute→Verify）：验证成为控制流一等公民。新增 VerificationResult state。拓扑: plan→execute→verify→(continue|replan|finish)。Router selector 根据 verdict 决策。核心收益: 错误不再静默传播。
6. Multi-Agent：认知分工写进图。不同 agent 写入不同 state 区域。可用 Team(mode="coordinate") 让 leader 调度。失败: 流程固定，执行半路无法动态调回。
7. Blackboard：共享状态成为系统中心。Controller 持续检查 blackboard 决定下一步激活谁。拓扑是持续调度回路。失败: controller 决策不稳定、信息冲突、过度循环。
8. Meta-Controller：一次性入口分诊。Team(mode="route")，leader 只做选择不做任务。和 Blackboard 本质区别: 分诊台 vs 总控台。
9. Ensemble：不是分工是冗余。Parallel fan-out + aggregator fan-in。多个 agent 分析同一问题。收益: 用多视角降低单次偏差。关键: 保留冲突信息而不仅是取平均。
10. Episodic + Semantic Memory：state 从"图内"扩展到"图外可检索历史"。agno Memory + AgentKnowledge + enable_agentic_memory。失败: 错误记忆长期污染。
11. Graph / World-Model Memory：从相似性召回到结构性推理。Text→Knowledge Graph→Text-to-Cypher→Query→Answer。解决多跳关系查询。
12. Tree-of-Thoughts：推理变搜索。关键判断: LLM 负责候选生成，程序化代码负责搜索树扩展和剪枝。失败: 组合爆炸，只适回溯场景。
13. Mental Loop：行动前在内部世界试错。双工具: simulate_action（fork copy 预演）+ execute_action（真实执行）。核心: 反事实执行。
14. Dry-Run Harness：副作用关进闸门。工具带 dry_run 参数，Workflow 显式插入人工审批 Step。让副作用成为可审批对象。
15. Metacognitive Agent：自我边界建模。维护 AGENT_SELF_MODEL（知识域、工具列表、置信度阈值、高风险话题）。策略: reason_directly / use_tool / escalate。
16. Self-Improvement Loop：进化回路。Loop(end_condition=...) + GoldStandardMemory 跨任务积累高质量样例。和 Reflection 区别: 迭代优化 + 跨任务记忆。
17. Cellular Automata：LLM 退出主循环。LLM 只做规则设计，局部 CellAgent 同步并行更新，全局行为从局部规则涌现。
Evaluator 五类：LLM-as-a-Judge、内置 critic、程序化验证、Human-in-the-Loop、演示式验证。
选型指南：缺输出质量→Reflection/Self-Improve；缺与世界交互→ToolUse/ReAct；缺显式步骤→Planning/PEV；缺角色分工→Multi-Agent/Blackboard/Meta-Controller/Ensemble；缺长期状态→Episodic/Graph Memory；缺求解范式→ToT/Mental Loop/CA；缺安全边界→Dry-Run/Metacognitive。
最终结论三句话：先把状态和控制流画清楚；大多数从 ReAct 起步，可靠系统一定引入验证/记忆/边界控制；真正高级的 agent 不是更敢做事，而是更知道什么时候不该做。