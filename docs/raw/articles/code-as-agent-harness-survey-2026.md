---
title: "UIUC、Meta、斯坦福等最新综述！Code as Agent Harness"
source_url: "https://mp.weixin.qq.com/s/vJqB2bXnpqU4XqiOEJqL2Q"
author: "Hyman的杂货铺"
published: "2026-05-20"
type: raw
tags: [agent, harness, coding-agent, survey, llm, multi-agent]
created: "2026-05-20"
sha256: 29a2351e6fe6da2126477fa19e53fcfe97d713c0ee56ba3c5f5382d66090e78c
---
---
# UIUC、Meta、斯坦福等最新综述！Code as Agent Harness
## 一句话讲清楚
如果把今天的 Coding Agent 拆开看，模型只是一部分；真正决定它能不能持续干活的，是背后的代码运行底座：谁来读仓库、谁来跑测试、谁来记录失败、谁来限制危险命令、谁来判断一次修改是否真的可接受。
这篇 102 页综述换了一个切口。它问的是：当模型已经能写代码、读仓库、跑命令、调工具之后，真正让 Agent 运转起来的那层系统结构是什么？
论文给出的答案是 **Code as Agent Harness**。
## 为什么需要"Agent Harness"这个视角
一个裸模型是无状态的。它接收上下文，输出文本；下一轮是否记得上一轮，取决于外部系统怎么把历史塞回去。
一个真正能干活的 Agent 要复杂得多。它需要知道当前任务做到哪一步，哪些文件读过，哪些命令跑过，哪些测试失败，哪些权限不能碰，哪些结果需要人确认。它还要能在失败后恢复，而不是无限重复同一个动作。
论文把这层包裹模型的系统称为 Agent Harness。这个 Harness 至少包含：
| 层面 | 具体内容 | 作用 |
|------|----------|------|
| 执行 | 终端、沙箱、API、浏览器 | 把模型输出变成动作 |
| 状态 | 仓库、日志、轨迹、记忆 | 记录任务进展 |
| 验证 | 测试、静态分析、评审 | 判断动作是否有效 |
| 治理 | 权限、审批、审计、回滚 | 控制风险边界 |
代码比自然语言更适合作为 Harness，关键在于它会留下可复查的状态变化：一次 patch 是否生效，可以看 diff；一次命令是否成功，可以看退出码和日志；一次测试是否覆盖目标，可以看测试名、断言和失败栈。这些证据让 Agent 的行为从"说得通"变成"查得到、复现得了"。
论文把这种能力拆成三个自然属性：
1. **可执行**：能跑起来，能产生结果。
2. **可检查**：中间状态、错误、日志、diff、trace 都能被读取。
3. **有状态**：文件、仓库、测试结果、运行环境能跨步骤保留。
## 第一层：代码作为 Harness Interface
论文的第一层叫 Harness Interface，也就是模型连接外部世界的接口。核心问题是：模型通过什么媒介和任务环境发生关系？答案拆成三类：
### 1. 代码用于推理：把思考变成可运行计算
Program-of-Thoughts、PAL、Chain of Code 这类方法把中间推理交给程序执行。模型负责写过程，解释器负责计算结果：
- 算术、符号、控制流可以交给运行时；
- 中间变量和执行轨迹可以被检查；
- 出错时可以根据异常、断言或测试反馈修正。
论文还把 Lean、Coq、Isabelle 等形式化证明系统纳入这个视角。证明脚本本质上也是代码，模型生成证明步骤，证明器负责验证每一步是否合法。
更进一步，执行轨迹还能成为训练和反馈信号。CodePRM、RLEF、ExecVerify 等工作把变量级、语句级、函数级执行结果变成过程奖励。
### 2. 代码用于行动：把意图变成可执行动作
Agent 的行动不是一句"点击按钮"就能完成。GUI、OS、机器人、软件仓库都有自己的接口和约束。
论文把代码看成行动边界：模型输出的不是模糊动作，而是可调用的 API、脚本、行为树、技能函数或控制策略。
代表工作：
- SayCan（机器人）：通过可执行技能库和可行性估计选择动作
- Code as Policies：直接让模型生成 Python 控制程序
- Voyager：把 Minecraft 中成功完成的动作沉淀成可复用技能库
GUI/OS 场景：WebArena、BrowserGym、OSWorld 等环境中，Agent 的动作编译成 Playwright、ADB、pyautogui 或系统 API 调用。
### 3. 代码用于环境建模：把世界变成可检查状态
Code for Environment 的思路是把环境显式变成程序对象：仓库、测试、模拟器、日志、执行轨迹、状态转移函数，都可以作为 Agent 可读、可查、可运行的世界模型。
代表方向：
- **结构化世界表示**：把视觉场景、GUI 状态、3D 房间、仿真环境编码为程序结构
- **执行轨迹世界模型**：从程序 trace 学习状态转移
- **代码化评测环境**：SWE-bench、InterCode、LiveCodeBench 用真实执行结果评估 Agent
- **可验证环境构造**：SWE-smith、EnvScaler 自动生成可运行任务、验证器和反馈机制
## 第二层：Harness Mechanisms，让 Agent 长期可靠工作
有了接口还不够。一个长期 Agent 需要计划、记忆、工具使用、控制循环和 Harness 自我优化。论文把这些称为 Harness Mechanisms。
### 1. Planning：计划是可审查的控制对象
Agent 的 plan 应该像一张轻量变更单：读哪些文件是读集，改哪些模块是写集，跑哪些测试是验收条件，哪些命令需要审批是风险边界。
规划方法分成四类：
| 类型 | 核心机制 | 适合场景 |
|------|----------|----------|
| 线性拆解 | 顺序步骤 | 明确小任务 |
| 结构约束 | 图、依赖、仓库结构 | 多文件项目 |
| 搜索规划 | 多候选轨迹 | 高不确定任务 |
| 编排规划 | 多角色、多阶段 | 长链路工程 |
### 2. Memory：记忆不是更大的上下文窗口
论文对记忆的表述很克制：Memory 不是简单把更多历史塞进 prompt，也不是一个万能向量库。它是状态管理层。
代码 Agent 的记忆至少有五类：
| 类型 | 存什么 | 主要价值 |
|------|--------|----------|
| Working | 当前轨迹、失败测试 | 支撑下一步动作 |
| Semantic | 仓库结构、API、文档 | 找到相关证据 |
| Experiential | 过往修复、失败经验 | 跨任务复用 |
| Long-term | 验证过的长期知识 | 降低重复探索 |
| Multi-agent | 多角色共享状态 | 防止协作割裂 |
### 3. Tool Use：工具不是按钮，是受治理的状态转移
论文把工具使用分成四类：
- **Function-oriented**：查询 API、文档、库函数
- **Environment-interaction**：读写仓库、跑命令、操作浏览器或沙箱
- **Verification-driven**：运行测试、lint、type check、静态分析
- **Workflow-orchestration**：把检索、编辑、执行、验证、审批串成稳定流程
### 4. PEV Loop：计划、执行、验证成为闭环
Plan--Execute--Verify（PEV）框架：
1. **Plan**：形成变更契约，明确目标、约束和验证方式
2. **Execute**：在沙箱和权限边界内执行动作
3. **Verify**：用确定性传感器判断状态是否可接受
"传感器"可以是编译器、单元测试、集成测试、类型检查、静态分析、fuzzer、运行时监控、CI，也可以是人类评审。
### 5. AHE：Harness 自身也会成为优化对象
Agentic Harness Engineering（AHE）把 Harness 设计变成可观测、可诊断、可回归测试的工程过程。
deep telemetry 记录：提示词、检索内容、token 成本、工具参数、延迟、编辑文件、命令输出、测试结果、栈信息、分支决策、被拒绝方案、人工干预和最终结果。
## 第三层：Scaling Harness，多智能体围绕代码协作
单 Agent 的限制：上下文有限，一个模型同时做架构师、开发、测试、评审也不经济，而且自己很难稳定发现自己的错误。
论文总结了几种典型角色：
- Program synthesis agent：负责生成或修改代码
- Program understanding agent：负责读仓库、抽象结构、定位问题
- Verification agent：负责测试、静态分析、评审
- Execution agent：负责和真实运行时交互
- Planning agent：负责拆任务、分派角色、协调进度
四种常见互动：协同生成、批评修复、对抗验证、推理辩论。
## 落地场景
### 1. 代码助手
SWE-agent、OpenHands、Claude Code、Codex、Copilot coding agents 已经进入仓库级工作流。Alibaba Cloud LingmaAgent 报告：16.9% 全自动解决，43.3% 需要人工介入。
### 2. GUI/OS Agent
WebArena、OSWorld、AndroidWorld、BrowserGym、WorkArena 等 benchmark。
### 3. 科学发现
AI Scientist、AI co-scientist、Virtual Lab、Biomni、Coscientist、AlphaEvolve 在这条路上探索。
### 4. 个性化 Agent
### 5. 具身智能
Voyager 的 Minecraft 技能库、机器人里的行为树。
## 开放问题
1. **Harness-level evaluation**：不能只看最终成功率
2. **Oracle adequacy**：绿色测试不等于语义正确
3. **Self-evolving Harness**：会自改，也要能回归
4. **Transactional shared state**：多 Agent 需要事务语义
5. **Human-in-the-loop**：人工审批应该成为持久状态
6. **Multimodal Harness**：视觉和物理反馈也要可管理
## 工程实践六条启发
1. Agent 的核心资产不是聊天记录，而是可执行状态
2. 工具调用要有生命周期
3. 计划必须可审查
4. 记忆要有写入门槛
5. 验证要有证据包
6. Harness 变化要跑回归
## 资源链接
- 论文：https://arxiv.org/abs/2605.18747
- 代码仓库：https://github.com/YennNing/Awesome-Code-as-Agent-Harness-Papers