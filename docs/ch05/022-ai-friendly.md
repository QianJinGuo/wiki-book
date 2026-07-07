# AI Friendly 架构设计：后端系统面向无人值守开发时代的标准与路径

## Ch05.022 AI Friendly 架构设计：后端系统面向无人值守开发时代的标准与路径

> 📊 Level ⭐⭐ | 17.6KB | `entities/ai-friendly-architecture-design.md`

# AI Friendly架构设计

> [!summary] 核心洞察
> AI Friendly架构不是对传统工程的全盘否定，而是为应对AI"不确定性"的精准升级——通过**三范式转变**（确定性→概率性、结构化→语义化、静态→动态）赋予传统工程驾驭不确定性的能力。并非所有AI工程都需要此架构，仅当业务涉及深层次AI应用（记忆管理、工具管理、上下文工程、Multi-Agent调度等）时才需要演进。

## 三范式框架

传统工程架构（无论DDD平台型或MVC业务型）都基于"以人为本"的确定性设计——输入规范、输出可预测、流程预定义、依赖规则配置。AI天生具有概率性和涌现性，两者的冲突体现在：

- AI输出不遵循既定schema时传统架构无法处理
- 流程/工具需要上下文动态选择时传统架构无能为力
- 高延迟低吞吐的Agent进入低延迟高吞吐传统架构导致超时

解决之道是通过三个范式的转变：

### 1. 确定性 → 概率性

传统工程输出严格遵循 y=f(x)，结果非黑即白。AI工程运行于概率空间，输出是大模型、提示词、上下文与环境的共同涌现。架构设计核心目标不再是追求零误差，而是通过**RAG增强、上下文工程及评测机制**将概率性输出收敛至业务可接受的"安全区间"。

### 2. 结构化 → 语义化

传统工程要求输入精确符合预定义Schema，任何越界触发校验失败。AI工程拥抱语义化柔性交互，能直接理解自然语言和非结构化模糊输入的意图，基于"意图"而非"格式"响应。系统边界从"刚性墙"变为"弹性膜"。

### 3. 静态 → 动态

传统工程基于预定义流程开发，执行路径依赖硬编码规则。AI工程基于模型决策，具备推理能力，可无需人工干预拆解任务、调用工具、响应未知变化。架构设计核心从"规则"转向"规划"。

## 架构大图与核心能力层

### 基础依赖层

| 能力 | 实现方式 |
|------|----------|
| 模型管理 | 统一协议调用多厂商多版本大模型 |
| 知识管理 | 多来源知识向量化存储与检索（Embedding + Vector DB） |
| 工具管理 | MCP协议（HSF→MCP Server）、Function Calling、RPA Computer Use |

开发框架可选Spring AI Alibaba或自研方案，管理模型/知识/工具及Agent、意图、会话等上层能力。

### AI Friendly独有三层

- **Agent层**：两种类型——动态规划Agent + 固定流程编排Agent。具体实现为BaseAgent（ChatBot/Workflow）、ReActAgent（ReAct推理）、PlanAgent（Plan计划）。支持Multi-Agent协作（中心化决策/去中心化协商等模式）。
- **意图层**：任务真实目的识别处理，实现结构化→语义化转变。需处理并行意图、顺序依赖意图、逻辑依赖意图，结合Query改写/扩写优化。非所有场景需要，简单任务可直接调用Agent。
- **会话层**：多轮会话及长短期记忆。记忆本质是上下文工程，重要程度甚至高于模型本身——"优秀模型若无适配记忆，表现不如过时模型"。

### 质量和稳定性

AI可观测、AI评测、Agent安全——SLA衡量标准与传统架构不同，需关注Agent执行路径、TTFT、Token消耗/成本、TPM、QPM等指标。

## 实战案例：淘天秒杀业务

### AI审核系统

覆盖商品全生命周期，解决审核负担重/风险识别滞后和在团商品"只管上线不管表现"两大问题。基于多模态AI模型实现风险自动分级（自动通过/驳回）+ 实时巡检健康度指标。

**量化成果**：准确率95.7%、召回率99.1%、日均2-3w商品审核、小二80%以上效率提升。通过微调+MOE优化可识别未定义潜在问题。

### CogentAI答疑系统

具备自主规划、推理解决问题能力的AI助理，根据问题进行意图识别→自主规划解决路径→灵活选择工具和知识库→动态调整计划。

**量化成果**：问题解决准确率98%以上，80%以上效率提升。

## Context Engineering实践

上下文工程（而非Prompt Engineering）是AI时代工程师的核心关注点——精心挑选、组织和压缩信息，在有限窗口内让大模型获得最优知识。

### 审核场景的上下文工程

- **历史审核案例库**：沉淀历史优秀案例到向量数据库，相似性向量检索召回最佳案例给大模型参考，**准确率提升~8%**。
- **混合审核决策**：多模型投票+置信度机制，水位有差异的多模型多次判断投票结果给大模型参考，**准确率提升>10%**。

### 通用上下文工程能力

长短记忆、摘要总结等通用能力可直接复用；进阶技术包括知识图谱与结构化（GraphRAG）、动态上下文剪枝等。

## AI Friendly API设计

从REST-ful到LLM-ful的核心改造：

1. **工具原子化**：接口拆分为适配大模型ReAct推理的原子工具
2. **出入参拟人化**：名称清晰体现用途，仅保留核心参数，平铺KV对
3. **Error改造**：预期内情况提供简短错误描述方便推理，预期外提供堆栈方便定位

## 架构升级的边界

**并非所有系统都需要向AI Friendly架构演进。** 对于将Agent当接口使用（仅需关注API调用和结果处理）的系统，传统架构或平台能力已足够。核心判断标准：业务场景是否涉及深层次AI能力维度（记忆管理、工具管理、上下文工程、Multi-Agent调度、自主规划、AI可观测性、数据采样评测）。不要"为用AI而用AI"，也不要"为升级而升级"。

## 评测与可观测体系

评测链路：**线上数据采样 → 样本集构建 → 评测（自动+人工） → 优化（工程优化+模型微调） → 线上AB → 指标观测**。评测不仅从执行结果维度衡量，还应从执行路径维度评测（ReAct推理路径、Plan执行计划过程的合理性）。AI可观测未来将与测试紧密结合，完成上线前"回归测试"。

## 补充

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-friendly-architecture-design-taobao.md)

## 相关主题

- Agent编排范式：ReAct、Plan、Multi-Agent
- 上下文工程：RAG、向量检索、记忆管理
- MCP协议：HSF到MCP的工具标准化
- LLM应用可观测性
- 意图识别与Query改写

## 深度分析

**1. AI Friendly是选择性演进，非全量替代**

文章开篇即明确：**并非所有AI工程都需要向AI Friendly架构演进** 。判断标准在于业务场景是否涉及深层次AI能力——记忆管理、工具管理、上下文工程、Multi-Agent调度、自主规划、AI可观测性和数据采样评测。若仅需将Agent当接口使用，传统架构或平台能力已足够。这意味着架构升级是精准手术，而非推倒重建。

**2. 记忆（上下文工程）的重要性甚至高于模型本身**

原文反复强调："优秀模型若无适配记忆，表现不如过时模型" 。秒杀AI审核场景中，通过历史案例向量检索召回最佳案例给大模型参考，准确率提升~8%；多模型投票+置信度机制带来>10%准确率提升 。这揭示了上下文工程是AI时代工程师的核心关注点，而非Prompt Engineering本身。

**3. 三范式转变为传统工程注入"不确定性驾驭"能力**

确定性→概率性（通过RAG增强、上下文工程、评测机制将输出收敛至安全区间）、结构化→语义化（基于意图而非格式响应）、静态→动态（从规则转向规划）——这三范式并非否定传统工程，而是在坚实工程地基上的一次精准升级 。传统平台型架构（DDD）和业务型架构（MVC）的经验积累并未被抛弃，而是被重新定位。

**4. Multi-Agent的MOE形态是复杂业务场景的自然选择**

淘天秒杀答疑系统将业务域划分为商品、订单、库存、报名、补贴、素材等，每个域基于ReAct+Plan范式实现具备"计划-推理能力"的Agent，由中心Agent统一做意图识别与任务分发，形成MOE（混合专家）形态的Multi-Agent 。这种中心化决策模式在高频、海量、时效性强的秒杀场景中表现出色。

**5. AI可观测性必须深入到LLM/Agent决策层**

与传统架构关注延迟、吞吐量不同，AI可观测需关注Agent执行路径、首Token响应时间（TTFT）、Token消耗与成本、TPM、QPM等指标 。评测链路应形成"线上数据采样→样本集构建→评测→优化→线上AB→指标观测"的正循环，且不仅从执行结果维度衡量，还应从执行路径维度评测ReAct推理路径和Plan执行计划的合理性。

## 实践启示

**1. 从"为用AI而用AI"回归业务价值判断**

在考虑架构升级前，先明确业务场景是否真正需要深层次AI能力。如果只需要接入AI Workflow获取结果，将Agent当作接口使用即可，无需引入AI Friendly架构的额外复杂度。架构演进应服务于业务价值，而非技术趋势追随。

**2. 优先建设上下文工程能力，再追求模型升级**

实证数据表明：案例检索带来~8%准确率提升，多模型投票带来>10%准确率提升 。在模型选型之前，应优先建设知识管理（Embedding+向量数据库）、历史案例库、多模型置信度投票等上下文工程基础设施，这往往比模型升级来得更直接有效。

**3. 工具接口按LLM-ful原则改造：原子化+拟人化+语义化Error**

将接口拆分为适配ReAct推理的原子工具，接口名称清晰体现用途，出入参仅保留核心参数并使用平铺KV对描述 。对于预期内错误提供简短描述方便大模型推理，预期外错误提供堆栈信息帮助定位。这一原则适用于任何需要与大模型交互的系统设计。

**4. 通过MCP协议实现工具标准化管理**

淘天通过ZETTA（HSF团队开发的MCP管理平台）将HSF接口快速转化为MCP Server，配合ideaLab的MCP Client实现工具的标准化管理 。这提示我们：在多工具、多模型、多团队的场景下，协议层面的标准化是规模化应用的前提。

**5. 建立AI专属的评测与可观测体系**

传统SLA指标无法衡量AI应用质量，需引入Agent执行路径分析、TTFT、Token消耗/成本、TPM/QPM等AI专属指标 。评测不仅看结果对错，更要看推理路径是否合理、计划执行是否高效。这与[Agent编排范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md)的评测思路一脉相承。

## 第 2 来源 — 刘瑞洲 (阿里技术 2026-06-15)

> Source: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-friendly-backend-architecture-standard-pathway-alibaba-liu-ruizhou-2026.md)
> Author: 刘瑞洲 (阿里技术)
> Date: 2026-06-15

这是第 1 来源（淘天久游 6 月 1 日）的**大型后端落地标准补全**——前者给出"为什么 AI Friendly + 三范式框架"，本文给出"具体 AI Friendly 标准长什么样 + 14 章系统化路径"。

### 互补角度

1. **6 类架构事实（核心贡献）**：架构事实 / 服务事实 / 领域事实 / 接口事实 / 数据事实 / 运行事实——把第 1 来源"上下文工程"哲学落到**机器可读系统事实层**的具体分类。第 1 来源讲"为什么要做"，本文讲"具体做哪些"。
2. **Architecture Map 9 维度（核心贡献）**：业务域 / 服务分层 / 核心链路 / 调用拓扑 / 消息拓扑 / 数据所有权 / 强弱依赖 / 发布边界 / 历史遗留与演进方向——比第 1 来源更细化的全局地图骨架；并明确指出 Architecture Map 不是 PPT 大图，而是**可被人阅读、可被 AI 检索、可被工具引用、可被 CI 校验、可被 Harness 执行**的系统级地图。
3. **Service Card 11 字段（核心贡献）**：服务定位/核心职责/核心实体/数据所有权/接口清单/消息清单/依赖清单/运行特征/变更约束/测试入口/发布与回滚——并且要求**部分字段自动生成**（接口从 IDL、依赖从调用链、表结构从 schema），人类只维护业务解释。这是**机器可维护的服务身份证**具体规范。
4. **Domain Clarity 四要素**：不变量 / 状态机 / 幂等与一致性策略 / 风险等级——以及**跨域链路模型**保护系统级一致性。这是第 1 来源没具体展开的"领域模型如何为 AI 服务"。
5. **Harness 7 层（核心贡献）**：上下文装载层 / 工具层 / 计划层 / 执行层 / 验证层 / 审计层 / 回滚层——并把 Harness 角色从"执行环境"升级为"全局架构规则的执行器"，用 Architecture Policy 机器可检查分层/依赖方向/数据所有权/消息规范/核心链路约束/强依赖准入规则。这是第 1 来源缺失的具体 Harness 体系。
6. **权限分级 L0-L5（核心贡献）**：L0 只读 → L1 本地 sandbox → L2 脱敏查询 → L3 PR/CI → L4 低风险自动合并 → L5 生产修复（强审计 + 人类预授权）。**AI Friendly 不是把权限全部给 AI，而是不同风险场景下刚好足够的权限**——一个明确可落地的权限分级体系。
7. **Test-Gated 7 类测试 + 架构验证**：单测 / 契约测试 / 集成测试 / 回归用例库 / 数据迁移测试 / 性能测试 + **架构验证**（验证系统结构是否被破坏：BFF 反向污染 / 非 owner 跨库访问 / 未备案强依赖 / 异步改同步）。这是 AI 时代独有的第 7 类测试。
8. **Copilot → Coworker → Operator 三阶段（核心贡献）**：当前业界在 Copilot→Coworker 过渡；Operator = **"黑灯工厂"**——7×24 无人值守开发。明确指出"不是一步到位让 AI 接管生产，而是逐步扩大 AI 的可信半径"。
9. **11 步 Practical Roadmap**：选试点 → 建立最小 Architecture Map → Service Card → 领域模型 → 5-10 个 SKILL → 测试契约 → AI PR 模板 → CI 硬门槛 → 只读可观测 → 低风险自动 PR → 扩大。**关键判断：不要先追求"无人化"，而要先追求"可验证"**。
10. **AI Friendly 重塑软件组织方式**：过去"文档是给新人看的" → 未来"文档更是给 Agent 装载上下文用的"；"测试是为了防止上线出 bug" → "测试是为了约束 AI 的行动边界"；"Runbook 是故障时翻看的手册" → "Runbook 是 AI 自动排障的操作图谱"。

### 与第 1 来源的关系

- **第 1 来源（淘天久游 2026-06-01）**：偏**框架哲学**——三范式（确定性→概率性、结构化→语义化、静态→动态）+ Multi-Agent / Context Engineering / AI Friendly API / AI 可观测性。回答"为什么要 AI Friendly 架构"。
- **第 2 来源（阿里刘瑞洲 2026-06-15）**：偏**落地标准**——14 章系统化阐述 + 6 类架构事实 + 9 维度 Map + Service Card 11 字段 + Harness 7 层 + 权限 L0-L5 + 11 步 Roadmap。回答"具体 AI Friendly 长什么样 + 怎么一步步做"。

两篇在同一时间窗（6 月初 + 6 月中旬）由同一公众号矩阵（淘天 + 阿里技术）发布，互为补充：前者给理论框架，后者给可执行标准。

### 关键独到判断

> "**未来建设的是可被智能体维护的系统。**"
>
> "AI 不能直接拥有无限权限，必须运行在一套受控 Harness 里。"
>
> "一个能力弱的 AI 最多写错代码，一个能力强但权限失控的 AI 可能直接制造生产事故。"
>
> "架构治理会越来越多地通过规则、元数据、CI、权限和 Harness 自动执行。"

## 相关实体
- [Agent Harness Context Management Working Set](ch05/038-agent-harness.html)（相关：上下文装载层是 Harness 第一层）
- [Agent Harness Architecture](ch05/038-agent-harness.html)（相关：Harness 7 层是 agent-harness-architecture 的具体化）
- [Agent Harness Engineering Survey 2026](ch05/062-harness-engineering.html)（相关：Harness Engineering 综述与本文 Harness 7 层互补）
- [Spec As Aios Anti Entropy Architecture Gaode App Platform 2026](../ch01/1050-spec.html)（相关：Spec as AIOS 是 Spec 工程化的另一视角）
- [Gaode Sdd Harness Team Ai Coding Paradigm Ibjfu](ch05/082-ai-coding.html)（相关：高德 Harness/SDD 体系演进同主题）
- [Agent 编排范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md)（相关：评测体系一脉相承）
- [AI Friendly 架构设计（淘天久游）](ch05/022-ai-friendly.html)（同主题另一视角）

→ [第 1 来源原文](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-friendly-architecture-design-taobao.md)
→ [第 2 来源原文](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-friendly-backend-architecture-standard-pathway-alibaba-liu-ruizhou-2026.md)
- [协作涌现：agent room 的多智能体决策框架](../ch04/607-agent-room.html)
- [从全量启动到最小核：手淘外链唤端链路的三次架构演进](https://github.com/QianJinGuo/wiki/blob/main/entities/从全量启动到最小核手淘外链唤端链路的三次架构演进.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/observability-monitoring.md)

---

