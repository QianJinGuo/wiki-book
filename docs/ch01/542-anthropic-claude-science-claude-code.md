# Anthropic推出Claude Science——科研界的Claude Code

## Ch01.542 Anthropic推出Claude Science——科研界的Claude Code

> 📊 Level ⭐⭐ | 8.2KB | `entities/anthropic推出claude-science-科研界的claude-code.md`

# Anthropic推出Claude Science——科研界的Claude Code

## 摘要

Claude Science 是 Anthropic 面向科研人员推出的 AI 平台，定位为「科研界的 Claude Code」。它不是新模型，而是一个将科研工作流——文献检索、数据处理、环境配置、分析执行、图表生成、手稿撰写、结果校验——整合为一条可控、可复现的「科研流水线」的产品。Claude Science 支持 macOS 和 Linux，面向 Pro、Max、Team、Enterprise 用户开放，无须内测申请。

## 核心要点

- **科学成果可复现**：生成图表和手稿的同时提供完整代码、运行环境、生成过程描述和全部对话历史。原生支持渲染 3D 蛋白质结构、基因组浏览器轨迹、化学结构等专业格式。用户可用自然语言随时讨论细节、在线注释修改，智能体自动调整代码使成果达到发表水准。
- **算力智能调度**：蛋白质折叠、海量基因组分析等大型任务不再需要手动折腾集群。Claude Science 先制定计划、征求确认，再提交到 HPC（SSH）或 Modal 云端，支持从单个 GPU 扩展到数百个 GPU。上下文常驻内存，敏感数据留在本地。
- **科研开箱即用**：预置 60+ 科学技能和连接器，直连 UniProt、PDB、Ensembl、Reactome、ClinVar、ChEMBL、GEO 等数百个权威数据库。集成 NVIDIA BioNeMo Agent Toolkit，支持 Evo 2、Boltz-2、OpenFold3 等专业模型。
- **内置审查机制**：系统内置审查智能体，专职检查引文准确性和计算正确性。访问本地文件或执行代码必须经过用户逐项授权，为每一次关键行动设置安全阀。
- **首批机构验证**：Manifold Bio（靶向药物设计）、Allen Institute（多代理计算综述模板）、UCSF 脑肿瘤中心（胶质瘤分子流行病学分析）均已验证——UCSF 的分析时间降至原来的 1/10。

## 深度分析

### Claude Science 的产品定位：从「聊天框」到「科研流水线」

Claude Science 的核心产品洞察是：科研工作中最耗时的不是思考本身，而是「中间环节」——查文献、处理数据、调环境、跑分析、生成图表、写手稿、校验结果。传统 AI 工具以聊天框为交互范式，适合问答但不适合完整的科研工作流。

Claude Science 将自身定位为「科研流水线」的操作系统，其交互模式更像 Jupyter Notebook 而非 ChatGPT——过程可见（每一步在做什么、为什么这么做，都展示在用户面前）、随机应变（数据源挂了会换源、程序缺了会自行安装、图表丑了会重画）、边界诚实（主动说明局限性，建议用户接入更权威的数据源）。

### AI in Science 的三巨头路线对比

Claude Science 的发布标志着 AI 在科研领域的竞争进入新阶段，三家巨头走的是完全不同的路线：

| 公司 | 产品/能力 | 策略 |
|------|----------|------|
| OpenAI | GPT-Rosalind | 专有微调模型路线，限企业客户，需安全审查准入 |
| Google | AlphaFold + Gemini for Science | 手握王牌科学模型，整合 30+ 科学数据库 |
| Anthropic | Claude Science | 订阅开放 + 工作流优先，让尽可能多的人先用起来 |

Anthropic 的策略最具开放性：发布当天宣布启动药物研发计划，目标锁定「被忽视的疾病」，并支持最多 50 个 Claude Science AI for Science 项目（最高 3 万美元资助）。

### 与 Claude Code 的架构类比

Claude Science 最好的参照物是 Claude Code。两者的架构思路高度一致：

- Claude Code 是程序员的 AI 同事，管理软件工程工作流（编码、测试、调试、部署）
- Claude Science 是科研人员的 AI 同事，管理科学研究工作流（文献、数据、分析、论文）

两者共享 Anthropic 的 Agent 基础设施——[Claude Code 的工程化协作模式](../ch03/076-claude-code.html)（task 落盘、子代理分工、可观测性、审批门禁）在 Claude Science 中以科学场景的形态复现。例如审查智能体相当于代码 review 中的独立验证者，算力调度相当于 CI/CD 中的资源编排。

### 科研 Agent 的可复现性与治理挑战

Claude Science 最值得关注的特性是「科学成果可复现」。传统 AI 辅助科研的最大问题是黑箱——模型给出答案但无法追溯生成过程。Claude Science 的每个图表背后都连着代码，随时可复现、可追溯。

但也存在隐忧：东北大学的 Jared Auclair 指出，AI 更像是「需要老练飞行员驾驶的副驾驶」。在解读监管指南、设计实验等需要精细判断的环节，AI 仍可能出现幻觉或遗漏细节——在药物研发里，这类错误可能致命。

这印证了 [Harness Engineering](../ch05/115-harness-engineering.html) 的核心原则：Agent 的能力越强，控制平面的治理就越不能松懈。Claude Science 的逐项授权机制和审查智能体正是这一原则在产品层面的体现。

## 实践启示

1. **科研 Agent 的下一站是工作流而非问答**：Claude Science 证明，科研场景需要的不是更聪明的聊天机器人，而是能管理完整科研流水线的操作系统。从文献检索到论文发表的全链路覆盖，比单一环节的优化更有价值。

2. **可复现性是科研 AI 的生命线**：任何不能提供完整代码、运行环境和生成过程描述的科研 AI 工具，都无法真正进入严肃科学领域。可复现性不是附加功能，而是准入门槛。

3. **开放策略 vs 封闭策略的选择**：Anthropic 的订阅开放策略让更多科研机构能快速试用和反馈，形成产品迭代的正向循环。对于新技术产品，「让更多人先用起来」往往比「打磨到完美再发布」更有效。

4. **Agent 治理机制需前置设计**：Claude Science 的审查智能体和逐项授权不是事后添加的安全补丁，而是产品架构的一等公民。科研 AI 的错误代价极高，治理机制必须从第一天开始设计。

5. **垂直场景 Agent 的平台化是趋势**：Claude Code（软件工程）→ Claude Science（科学研究）的路径表明，通用 Agent 基础设施在不同垂直领域的适配和平台化是规模化扩张的关键策略。

## 相关实体

- [Claude Code 架构分析](../ch03/076-claude-code.html) — Claude Science 的架构参照系
- [Anthropic 输出验证](../ch09/096-anthropic-8x.html) — Anthropic 的验证与质量控制理念
- [Harness Engineering](../ch05/115-harness-engineering.html) — Agent 控制平面的系统方法论
- [Agent Orchestration](../ch04/494-agent-orchestration.html) — 多 agent 编排在科研场景的应用
- [Google 的 Agent 策略](ch01/026-gemini-spark.html) — Google Gemini Spark 的竞争定位

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic推出claude-science-科研界的claude-code.md)

---

