## Ch08.007 JiuwenSwarm — Coordination Engineering 多智能体协作框架（含 SwarmFlow 可控编排 + Jiuwen Symphony 技能编排与分发）

> 📊 Level ⭐⭐⭐ | 25.2KB | `entities/jiuwenswarm-coordination-engineering.md`

## 概述
JiuwenSwarm 是 openJiuwen 社区发布的**多智能体蜂群协作框架**，代表从 Harness Engineering 向 **Coordination Engineering** 的范式跃迁。
**背景演进路径：** ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

- Prompt Engineering → Context Engineering → Harness Engineering → **Coordination Engineering**

## 核心架构：四组件全栈体系
| 组件 | 解决的问题 |
|------|-----------|
| **Agent Swarm** | 多个 Agent 如何"成军"——自主分工、动态协商、高效协作 |
| **Swarm Skills** | 如何把团队经验沉淀为可复用资产 |
| **Swarm Skills Hub** | 能力如何在开发者之间流通、复用 |
| **Swarm Skills 自演进** | 系统如何越用越强，而非越跑越僵 |

### Agent Swarm
多智能体团队协同机制内核。支持**成员对不同模型的路由**，针对不同角色提供合适能力的模型，减少负载压力，提升整体效果。
核心能力：**自主分工 + 动态协商 + 高效协作**，从"单兵作战"到"精锐团队"。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### Swarm Skills
把团队协作中的最佳实践、SOP、角色搭配、调度策略**标准化封装成"团队级技能"**——让优秀的 Agent 团队变成一套即插即用的作战能力。

### Swarm Skills Hub
开放的团队级协作经验共享市场。地址：https://swarmskills.openjiuwen.com/

### Swarm Skills 自演进
演进引擎观察完整轨迹（任务拆解、角色调度、消息往来），**自动从轨迹反推出可复用的 Swarm Skill**，提交用户审批即可入库。
两层同时演进： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

- **团队层**：自动增减角色、补充约束规则、优化协作流程
- **成员层**：沉淀工具报错、接口超时、调用技巧等实战经验

## Human-Agent 协作模式
| 模式 | 描述 | 姿态 |
|------|------|------|
| **HOTS** (Human on the Swarm) | 人是指挥官，实时观察全局，随时下场介入 | 全局调度 |
| **HITS** (Human in the Swarm) | 人是团队成员，与 Agent 同流程实时协作 | 沉浸式参与 |

## Benchmark 表现
- **PinchBench**：94.2% SOTA（OpenClaw 91.6%），token 消耗降低 34.8%
- **LOCOMO**：记忆准确率 85%（8B 大模型），优于业界主流记忆系统
底层支撑来自 openJiuwen Harness 的 DeepAgent 架构、上下文工程、长期记忆机制。

## 开源地址
- GitHub：https://github.com/openJiuwen-ai/jiuwenswarm
- Swarm Skills Hub：https://swarmskills.openjiuwen.com/

## 相关概念
- Harness Engineering — Coordination Engineering 的前置范式
- Multi-Agent Collaboration — 广义的 Multi-Agent 协作研究
- Agent Swarm — 蜂群智能体架构模式

## 深度分析
### 1. 从单Agent到多Agent协作的范式跨越
JiuwenSwarm 的出现映射了 AI Agent 工程领域的核心矛盾：当任务复杂度超过单个 Agent 的能力边界时，如何组织多个 Agent 像团队一样工作？
传统单 Agent 框架（如 LangChain Agent、AutoGPT）在面对跨领域调研、软件交付，多角色决策等真实复杂任务时，暴露出明显的协作盲区。JiuwenSwarm 的**Coordination Engineering**范式，将多 Agent 协作从"多个单 Agent 堆叠"提升为"原生团队协同"——这不是工具升级，而是工程思维的根本转变。

### 2. 四组件体系的递进逻辑
四组件构成了一套完整的递进体系： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

- **Agent Swarm** 是协作内核，解决"能协同"的基础问题
- **Swarm Skills** 解决"协同经验可复用"的知识沉淀问题
- **Swarm Skills Hub** 解决"跨团队能力流通"的价值放大问题
- **Swarm Skills 自演进** 解决"系统持续进化"的长期生命力问题
自演进机制是这套体系中最具创新性的设计——它不是让用户手动维护技能库，而是通过**轨迹自动发现**模式，将实战中涌现的协作规律自动提取为可复用的 Swarm Skill，形成越用越强的正向飞轮。

### 3. HOTS vs HITS：人机协作的两极
HOTS（Human on the Swarm）和 HITS（Human in the Swarm）代表了人参与多 Agent 系统的两种截然不同的哲学：

- **HOTS** 保留了人类的主体性和全局视角，适合高不确定性的战略决策场景
- **HITS** 将人类嵌入协作流程，适合需要人类直觉和判断力的创意探索场景
这种二分法为实际落地提供了清晰的选择框架：是想让 AI 团队做执行、人类做决策（→ HOTS），还是想让人类和 AI 共同参与执行过程（→ HITS）。

### 4. Benchmark 数据的意义
PinchBench 94.2% SOTA 配合 token 消耗降低 34.8%，说明多 Agent 协作不仅没有因为协作开销而降低效率，反而通过**合理的角色分工和模型路由**实现了更好的效果。这与单 Agent 时代"更大模型=更好效果"的思路形成鲜明对比。

## 实践启示
### 何时考虑引入 JiuwenSwarm
- 任务涉及**多个领域或多个专业角色**的协同（如医疗联合会诊、复杂软件交付）
- 需要**跨模型路由**以充分利用不同模型的优势
- 团队积累了大量**可复用的协作 SOP**，希望将其固化为可分享的技能资产
- 项目需要**长期演进能力**，而非一次性解决方案

### 如何从 Harness Engineering 过渡到 Coordination Engineering
对于已有 Harness Engineering 基础的团队，过渡路径可以是： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
1. **先单 Agent 跑通**：确保每个角色 Agent 在 Harness 层面已经过优化 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
2. **识别协作瓶颈**：哪些任务因为"单 Agent 能力边界"而受限 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
3. **引入 Agent Swarm**：从两个角色开始尝试协作，观察通信和协商机制 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
4. **沉淀 Swarm Skills**：将成功的协作模式标准化为可复用技能 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### 使用 Swarm Skills Hub 的策略
- **从社区共享技能开始**：不要重复造轮子，先在 Hub 中寻找场景匹配的技能
- **贡献打磨过的技能**：团队验证有效的协作模式是高质量的技能来源
- **关注自演进信号**：当系统开始自动推荐新的 Swarm Skill 时，说明实战数据在积累

## SwarmFlow — 从"能协作"到"稳稳地干完"（2026-06 增量）

openJiuwen 在 2026-06 开源 **SwarmFlow** —— 面向多智能体团队的**可控工作流编排方案**，把"团队怎么配合"从 Leader 临场判断升级为**系统稳定执行 + 自动追踪 + 可被复用**。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

**核心思路一句话：编排归系统，智能归 Agent。** SwarmFlow 增加的不是 Agent 数量，而是**协作的确定性**。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### 三个绕不开的问题（复杂任务带来的考验）

主流多 Agent 协作模式（Leader Agent 临场调度）在面对长链路、多分支任务时： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

1. **Leader 变成瓶颈**：每份中间结果都回 Leader，上下文被过程信息淹没 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
2. **过程不稳定**：同一任务跑两次可能走出两条不同路径 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
3. **执行不可靠**：谁先做、谁并行、什么时候汇总、失败怎么处理，即便提前写清楚仍依赖 Leader 临场发挥 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### Swarm Skill 的两种形态

**判定标准只有一个：编排能不能提前确定？** ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

| 形态 | 适用场景 | 协作方式 | workflow.py |
|------|---------|---------|-------------|
| **形态一**：不带脚本 | 多专家圆桌、方案评审、战略讨论 | 议程确定，但观点如何流动得在协作中自然发生 | 无 |
| **形态二**：带脚本 | 论文分析、办公自动化、批量 PPT 生成 | 角色 + 阶段 + 交接都提前定好 | 固化编排 |

**形态选择哲学**：编排是动态的用形态一保留开放协作；编排能提前确定的用形态二承接可执行编排。**确定性与开放性在同一套体系里各得其所。** ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### 算子积木（Operator Library）

SwarmFlow 提供一组算子作为积木，每个算子只管一件事，拼起来就能描述出复杂协作： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

| 算子 | 作用 | 备注 |
|------|------|------|
| **parallel** | 多个智能体一起跑、全部完成后统一汇总 | 适合多视角研判后合并 |
| **pipeline** | 多个条目各自独立逐级流过、互不等待 | 适合批量逐条处理 |
| **agents_session** | 有状态智能体在多轮协作中保留记忆 | 可"分身"一个副本做假设推演而不污染主线 |
| **human** | 在关键环节插入人机节点 | 向人类要一条输入或一次审批 |
| **budget** | 约束资源与额度消耗 | 把"会不会跑超"也纳入可控范围 |

**一个动作一块积木，复杂协作由简单积木拼出来，无需从零设计编排逻辑。** ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### 可视化：JiuwenSwarm TUI

通过 `/swarmflows` 命令打开**实时交互式树状图**： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
- 上方展示**阶段进度**
- 下方联动展示选中阶段里的 **Agent 状态**
- 排查时下钻到单个 Agent，查看**提示词、输出结果、错误日志**

### 三个真实落地场景

| 场景 | 流程 | 价值点 |
|------|------|--------|
| **金融分析** | 用户上传流程图 → SwarmSkill Creator 直接生成 SwarmFlow → 数据采集清洗 → 5 维度并行分析 → 交叉验证 + 综合置信度 → 完整报告 | **整条 SwarmFlow 不用手动编排，由一张图直接生成** |
| **技术调研 + 邮件** | 搜资料 → 整理素材 + 提取图片 → 分析核心问题/趋势/可讨论议题 → 生成结构清晰邮件并发送 | 避免步骤遗漏、口径变化、交付不一致 |
| **200 页 PPT 稳定产出** | 阶段一规划章节分工 → 阶段二 10 章节**并行生成** → 阶段三合并汇总 | 既靠并行明显加速，又能稳定产出结构统一、风格一致的 200 页 |

### SwarmSkill Creator（生成端）

JiuwenSwarm 内置 SwarmSkill Creator，根据自然语言需求**自动判断该生成哪种形态**： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
- 默认生成不带脚本的 Swarm Skill（角色、协作规则、流程说明、约束）
- 判断用户要工作流 → 生成仅含脚本的版本（最小 Skill.md + workflow.py）
- 两者都要时支持生成完整协作规范 + 脚本的版本

**用户不必先理解文件结构，也不必手写编排脚本，只要把目标说清楚。** ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### Team 模式自动调用（调用端）

用户不用分辨任务属于哪种形态，在 Team 模式下一句需求自动进入。系统判断任务形态： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
- 适合固定编排 → 进入 SwarmFlow
- 更适合开放协作 → 用不带脚本的 Swarm Skill
- 单个 Agent 够用 → 不额外启动多 Agent

**这是 openJiuwen 想定义的可控协同工程新范式——让复杂协作在系统内部变得可控，让用户侧保持自然和简单。** ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### 与自演进的衔接

从生成工作流（可控）到自演进（越用越强），**沉淀、编排、演进三者环环相扣**，构成 Coordination Engineering 的完整闭环。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

## Jiuwen Symphony — 海量技能的"精准发现 + 稳定协同"（2026-06-17 增量）

如果说 SwarmFlow 解决的是**多 Agent 团队怎么稳定配合**，那么 Jiuwen Symphony 解决的是更底层的问题：**单个 Agent 面对海量技能时怎么选得对、串得稳**。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

> 当一个 Agent 能调用的 Skill 从 5 个膨胀到 50 个，会发生什么？答案是：任务执行效果出现"断崖式下滑"——技能越多，Agent 反而越选不准。

### 两个绕不开的核心难题

- **选不准**：技能太多，上下文窗口装不下所有技能说明书，必然出现信息过载、上下文过长。改用语义检索查找相似技能，由于检索与任务执行相互独立，仍无法解决多意图、隐式意图这类需要推理的选择问题。
- **用不好**：技能选对了，还需要精准编排。技能广场上的技能标准不统一，上一个技能的产出能否喂给下一个、谁先谁后、谁依赖谁，若每次让模型临场发挥，常常出现执行失败、流程中断等稳定性问题。

### 双核心架构：检索用树，编排用图

| 组件 | 数据结构 | 解决的问题 | 关键机制 |
|------|---------|-----------|---------|
| **技能检索** | 层次化技能树 | 选不准 | LLM 在树上按任务需求**逐步导航**，而非一次性读完全部技能 |
| **技能编排** | 技能依赖图 | 用不好 | 基于能力指纹 + 双向搜索（向后扩展"下一步"+ 反向回溯"谁能补上"） |

**技能检索设计要点**： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

- 把平铺的技能列表预先组织成层次化技能树，变成可逐层浏览的技能目录；
- 检索机制被设计为面向 Agent 的**专用工具集**（递归能力树构建 / 分支探索 / 轻量预览 / 候选技能读取），而非执行前的一次性预处理；
- 关键判断："**技能选择被真正融入了 Agent loop，而非检索与执行相互独立**"。

**技能编排设计要点**： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

- **离线能力指纹**：覆盖技能的基础信息、输入输出产物、能力质量评估；
- **动态词表归一**：把命名不一的同义字段（如 body / content / 正文）归一到规范词；
- **依赖关系图**：节点是技能，边是"技能 A 的输出能否成为技能 B 的输入"，**作为结构化资产沉淀，可被反复读取、复用和演进**；
- **运行时双向搜索**：种子技能 → 向后扩展 / 反向回溯 → 拼出真正接得上的技能组合。

### SkillsBench 实测数据（Top-5 选择）

| 方案 | 召回率 | 成功率 | 平均最大上下文 |
|------|--------|--------|---------------|
| 关闭检索 | 低 | 低 | ~82k tokens |
| Embedding 检索 | 中 | 中 | 中 |
| **Symphony 技能检索** | **0.741** | **0.615** | **~21.5k tokens** |

Symphony 在 Top-5 选择上取得最佳效果，且把平均最大上下文从约 82k tokens 降到约 21.5k tokens（**降幅 ~74%**）。

### 三个实战场景（独立可接力）

**场景一：视频处理（仅使用技能检索）**——技能库膨胀到数千时，Agent 通过技能目录逐步探索"视频/音频处理"主分支 + "文本整理 / 报告生成"辅助分支，最终覆盖：视频读取与处理 / 音频转写 / 口头禅检测 / 停顿分析 / 关键片段整理 / 报告生成 / 备选兜底处理。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

**场景二：办公写作（仅使用技能编排）**——任务："英文博客截图翻译后整理成公众号文案并发邮件"。没有编排时 Agent 输出仍是图片无法串联；有编排后规划稳定路径：**图片翻译 → 文字识别（图片→可编辑文本）→ 文案撰写 → 邮件发送**，每步输出必须能喂入下一步。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

**场景三：出行规划（先检索后编排）**——两个核心组件联动的典型用例。

启用方式：在 JiuwenSwarm 页面"配置信息-其他配置"打开"**技能交响乐**"开关。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### Symphony 与 SwarmFlow 的层次关系

| 维度 | SwarmFlow（团队层） | Symphony（能力层） |
|------|-------------------|------------------|
| 抽象对象 | 多个 Agent 角色 | 多个 Skill |
| 核心数据结构 | 工作流编排图（含阶段 / 交接 / 并行） | 技能依赖图（输入输出衔接） |
| 解决的问题 | 团队怎么稳定配合 | 单 Agent 怎么从海量技能里选对 + 串稳 |
| 决策权 | 编排归系统、智能归 Agent | 检索归 LLM（融入 Agent loop）、编排归图结构 |

**关键洞察**：SwarmFlow 是"团队怎么配合"，Symphony 是"个人怎么打仗"。两者在 openJiuwen 体系里形成 **Agent 内部能力编排（Symphony） + Agent 之间协同（SwarmFlow）** 的完整双层架构。

### 与"动态能力分发"行业趋势的对照

openJiuwen 的判断与行业共识一致：**模型能力在增强，但系统能力没有同步增长**： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

- 模型可以理解复杂需求，却常常无法稳定调用外部能力；
- 工具越来越多，却难以被高质量地检索和复用；
- 流程越来越复杂，却缺乏统一的技能组织方式。

Symphony 把 skill 当作"系统资产"来管理，而不只是提示词里附带的一段工具说明。这与 Anthropic MCP、OpenAI Codex 等的行业探索方向一致，但 Symphony 的差异点在于**双核心（树检索 + 图编排）同时落地**，且给出了 SkillsBench 上的量化收益（82k → 21.5k tokens 上下文降幅）。

### 5 条独到判断

1. **"选不准 + 用不好"是技能规模化的两大死结**，分开解决都不彻底——必须"检索 + 编排"双核心同时设计。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
2. **检索要融入 Agent loop，而不是执行前一次性预处理**。否则多意图 / 隐式意图这种需要推理的选择问题永远解不掉。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
3. **依赖图作为"结构化资产"沉淀**比每次临场推理更有价值——图可以"反复读取、复用、演进"，符合"长期资产 > 一次性推理"的工程哲学。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
4. **能力指纹 + 动态词表归一**是图能起作用的前提，否则"同名不同义 / 同义不同名"会让依赖关系失真。这是从 RAG / Schema 工程借来的关键技巧。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
5. **失败可局部修复**——沿图结构定位失败节点，就近替换或修补，不必整条链路推倒重跑。这把"局部性"思想从系统架构层（cache locality）推到了 Agent 编排层。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### 3 条实践启示

1. **技能数量超过 10-20 个就该考虑检索机制**，而非等"出问题再修"。Embedding 检索是过渡方案，**树检索 + Agent loop 集成**才是规模化终态。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
2. **依赖关系图应该离线构建 + 在线查询**，避免每次编排都做语义匹配——性能与稳定性双赢。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
3. **组合可靠 / 协同可解释 / 失败可局部修复**是判断"编排系统是否成熟"的三个硬指标，比"功能丰富"更重要。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

## 相关实体
- [Agent Development Crawl Walk Run Crewai Iterative](ch04-166-gui-opencli-agent.html)
- [Agent Orchestration](ch04-409-agent-01-agent.html)（AWS — 多 Agent 编排对照）
- [Meta Skill Skill Orchestration Opensquilla Jay](ch01-810-agent.html)（笨小葱 — 单 Skill 编排对照）
- [Ai Agent Tool Count Trap](ch04-243-ai-agent工具数量陷阱-5个边界清楚的工具胜过20个模糊工具.html)（execute_code 算子的极简设计同源思想）
- [Agentic Design System From Chatbot To Orchestration](ch01-012-agentic-design-system-from-chatbot-to-orchestration.html)

## 3rd Source 原文存档
→ [openJiuwen 开源 Jiuwen Symphony 技能编排与分发系统 — CSDN 2026-06-17](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwen-symphony-skill-orchestration-distribution-openjiuwen.md)

## 2nd Source 原文存档
→ [openJiuwen开源SwarmFlow — AI技术立文 2026-06-12](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-swarmflow-controllable-orchestration-ai-tech-newspaper.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/05-11-the-great-memory-panic-of-2026.md)

### HOTS/HITS 选择指南
| 场景 | 推荐模式 | 理由 |
|------|---------|------|
| 战略决策支持 | HOTS | 需要人类把握全局，AI 做信息处理和方案生成 |
| 创意探索/头脑风暴 | HITS | 需要人类的直觉和灵感，与 AI 共同推演 |
| 标准化流程执行 | HOTS | AI 团队负责执行，人只在异常时介入 |
| 游戏/沉浸式体验 | HITS | 体验的核心是参与感，而非结果优化 |
---
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jiuwenswarm-coordination-engineering.md)

---
