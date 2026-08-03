# Vera Arrives: NVIDIA’s First CPU Built for Agents Lands at Top AI Labs

## Ch01.777 Vera Arrives: NVIDIA’s First CPU Built for Agents Lands at Top AI Labs

> 📊 Level ⭐⭐ | 8.0KB | `entities/vera-arrives-nvidia-s-first-cpu-built-for-agents-lands-at-top-ai-labs.md`

## 摘要

2026 年 5 月，NVIDIA 副总裁 Ian Buck 亲手将首批 Vera CPU 系统交付给 Anthropic、OpenAI、SpaceXAI 与 Oracle Cloud Infrastructure（OCI）四家机构，标志着专为 AI Agent 设计的 CPU 从 3 月 GTC 的官宣正式跨入一线实验室的生产环境。Vera 搭载 88 个 NVIDIA 自研 Olympus 核心，主打 1.2TB/s 内存带宽与 50% 的每核心性能提升，其设计起点是"AI Agent 不能只跑在 GPU 上"——沙盒、工具调用、编排层与长上下文检索这些 CPU 密集活，正是它要规模化扛起的对象。

## 核心要点

- **交付即信号**：Ian Buck 于周五（2026-05-15）把首批系统送到 Anthropic（旧金山 SoMa）、OpenAI（Mission Bay）、SpaceXAI（Palo Alto），周一再送达 OCI（Santa Clara），从发布到客户手中仅隔数周，"agentic CPU 从 announcement 走向 production"。
- **Agent 负载被重新定义为 CPU 问题**：每个 agentic sandbox、每次 tool call、每个编排层、每次长上下文检索操作都是 CPU 工作；Vera 以这一现实为出发点设计，而非沿用传统核心密度路线。
- **关键规格**：88 个 NVIDIA 自研 Olympus 核心、1.2TB/s 内存带宽、每核心性能较传统方案快 50%；在持续负载下更快完成工作，提升整个"AI 工厂"的效率。
- **头部客户表态**：Anthropic 计算负责人 James Bradbury 称 Vera 是 agentic workloads 生态中"promising 的一环"；OpenAI 的 Sachin Katti 现场验收，Buck 用螺丝刀当场开盖展示内部；Musk 追问核心数、内存布局与散热，SpaceXAI 计划将 Vera 用于强化学习与 agent-based 仿真管线。
- **OCI 是规模变量**：OCI 计划自 2026 年起部署数十万颗 Vera CPU，成为首家超大规模（hyperscale）部署 Vera 的云厂商；Buck 解释其需求逻辑——模型为回答问题会现场生成 Python 代码，这正是 CPU 的用武之地。
- **非孤立芯片**：Vera 同时是 Vera Rubin NVL72 的宿主 CPU，经二代 NVLink-C2C 与两颗 Rubin GPU 配对并共享统一内存；与 Rubin GPU、BlueField-4 DPU、Spectrum-X、MGX 机架共同构成 NVIDIA 的 "extreme codesign" 拼图。
- **能效叙事**：Vera 的快速核心与互联承担编排、控制与数据搬运，宣称以 2 倍于传统基础设施的能效持续喂饱 GPU。

## 深度分析

### 亲手交付：把"头部认可"变成最有力的 benchmark

Ian Buck 逐家上门、在 OpenAI 现场用螺丝刀拆机讲解、在 OCI 与产品负责人 Karan Batta 及客户成功负责人 Gary Miller 一起开箱——这套"贴身送货"动作本身就是 NVIDIA 的战略表态：Agent 时代的芯片营销不再依赖跑分表，而是把 Anthropic、OpenAI、xAI 三家算力话语权最强的机构在同一周接收同一款 CPU 的事实，变成整个行业无法忽视的信任状。当最挑剔的客户愿意为"未量产、先验证"的新架构腾出机房空间，其对市场心智的冲击远超任何 SPEC 分数，也在事实上动摇了"Agent 推理沿用 x86 就够"的既有叙事。

### 架构重排：按 Agent 的访问模式重新定义 CPU

传统数据中心 CPU 的优化优先级是单线程延迟与核心密度，而 Vera 的 88 核 Olympus 设计加上 1.2TB/s 内存带宽，把内存墙与并发度放到了首位。这背后是 Agent 执行模式的结构性差异：一次推理-行动循环包含大量工具调用、数十万 token 的上下文检索、多 Agent 的并行协作与频繁的状态切换，这些负载几乎都是内存带宽敏感型而非纯算力敏感型；50% 的每核心性能提升则保证单条 Agent 链路的响应不被拖慢。换句话说，Vera 不是"更强的 CPU"，而是"把 Agent 的访问模式当作第一公民"的 CPU，直接呼应 Buck 那句"models move from answering to acting"。

### 四家客户的差异化验证路径

四家接收方恰好构成 Agent 计算需求的两个侧面。前沿实验室侧：Anthropic 把 Vera 放进"scaling compute 加速模型增长"的生态框架中看待，关心的是长期算力弹性；OpenAI 更偏工程化验收，当场开盖检查内部构造；SpaceXAI 的场景最具体——RL 训练与 agent-based 仿真管线，这类负载的典型特征是长周期、高并发、上下文频繁切换，与 Vera 的设计目标高度吻合。规模侧：OCI 直接给出数量级承诺——"hundreds of thousands"颗 Vera CPU，把 Vera 从实验室验证直接推进到云厂商的基础设施采购清单。四家合起来说明：专用 Agent CPU 的需求不是单一实验室的偏好，而是从研究弹性到规模经济已被完整验证的行业共识。

### 平台拼图：Vera 是 codesign 闭环的关键一环

孤立地评估 Vera 会低估它的战略分量：它既是独立 CPU 系统，又是 Vera Rubin NVL72 的宿主处理器，通过二代 NVLink-C2C 与两颗 Rubin GPU 共享统一内存，让加速计算保持高利用率。把视角拉远，Vera 与 [NVIDIA GPU 生态](https://github.com/QianJinGuo/wiki/blob/main/concepts/nvidia-gpu-ecosystem.md) 中的 Rubin GPU、BlueField-4 DPU、Spectrum-X 网络与 MGX 机架共同构成 "extreme codesign" 闭环：GPU 负责训练与推理算力，Vera 负责编排、控制与数据搬运，DPU 负责网络卸载。这意味着 NVIDIA 正把"Agent 工厂"的每一层都攥在自己手里，客户获得的是更紧的集成与宣称 2 倍的能效，而竞争对手面对的是 CPU、GPU、DPU、网络四线并进的进入壁垒——单点突破越来越难奏效。

## 实践启示

1. **重估 CPU 选型指标**：若你的 Agent 系统以工具调用、长上下文检索与多 Agent 并发为主，把内存带宽（而非核心数）作为第一决策指标，在 Memory-Bound 场景下实测 Vera 与传统 x86 的 throughput 与延迟差异，再决定是否引入。
2. **把首批交付名单当路线图**：OpenAI 的工程验收、Anthropic 的生态表态、SpaceXAI 的 RL/仿真场景、OCI 的规模承诺，分别对应 Vera 生态优先落地的方向，可作为自身技术储备的优先级参考。
3. **警惕"硬件就绪 ≠ 软件就绪"**：跟踪 CUDA、TensorRT-LLM、NIM 对 Vera 的支持节奏与优化深度；生态成熟度直接决定 Agent 推理的实际成本结构，建议先在非关键路径做小规模 PoC。
4. **把云厂商的规模承诺纳入比价**：OCI 数十万颗级别的部署将重塑企业级 Agent 推理的供给与价格；云上选型时应把 Vera 实例纳入评测，而非默认 GPU-only 方案。
5. **以机架级 TCO 而非单芯片评估**：Vera 的优势部分来自与 Rubin、BlueField、Spectrum-X 的协同（统一内存、2 倍能效），做基础设施规划时要按整套 codesign 方案的总体拥有成本计算，而不是单看 CPU 单价。

## 相关实体

- [Blogs.Nvidia.Com Vera Cpu Delivery](https://github.com/QianJinGuo/wiki/blob/main/entities/blogs.nvidia.com-vera-cpu-delivery.md) — 同源 NVIDIA 官方博客条目
- [Nvidia Nemotron 3 Agents Rag Voice Safety](ch03/035-agent.html) — NVIDIA Agent 产品线（RAG/语音/安全）
- [Nvidia Nemotron 3 Ultra Sagemaker Jumpstart Moe Agentic](ch03/035-agent.html) — NVIDIA MoE Agentic 模型栈
- [Nvidia Edge First Llms Av Robotics](ch01/413-nvidia-edge-first-llms-av-robotics.html) — NVIDIA 边缘 LLM 与机器人场景
- [Anthropic Demystifying Evals For Ai Agents](ch04/558-anthropic-demystifying-evals-for-ai-agents.html) — Anthropic 的 Agent 评估实践
- [从 Cpu 到 Gpu 全链路可信百度智能云新一代 Ai 机密计算实例的探索与落地](ch05/100-ai.html) — CPU/GPU 全链路算力视角对照

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/vera-arrives-nvidia-s-first-cpu-built-for-agents-lands-at-top-ai-labs.md)

---

