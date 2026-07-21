# Harness进化论文 — M⋆记忆程序进化与AutoHarness动作约束

## Ch05.131 Harness进化论文 — M⋆记忆程序进化与AutoHarness动作约束

> 📊 Level ⭐⭐⭐⭐ | 7.3KB | `entities/harness-evolution-papers.md`

# Harness进化论文
> 微软M⋆（记忆Harness程序进化）和谷歌AutoHarness（代码Harness自动生成）两篇论文分析。

## 基本信息
- **来源**: 数据派THU（背靠清华大学）
- **日期**: 2026-04-25
- **相关实体**: [Hermes Agent Deep Dive](../ch03/092-hermes-agent.html)（Hermes的Self-Evolution机制）
- **相关实体**: [Minimax M2 7](../ch03/106-minimax-m2-7.html)（MiniMax的自我进化实践）

## M⋆ — 微软记忆Harness进化
**论文核心**：为每个任务自动进化专属记忆Harness程序。

- **记忆程序三组件**：Schema（数据格式）+ Logic（后台操作）+ Instruction（交互提示词）
- **方法**：Reflective Code Evolution + Population-based Search
- **关键发现**：记忆结构必须与任务协同优化，跨任务迁移无效

## AutoHarness — 谷歌动作约束Harness
**论文核心**：用树搜索+Thompson采样自动生成代码级动作约束。

- **三种模式**：action-filter / action-verifier / policy
- **关键发现**：Harness-as-Policy使测试时零LLM调用成本，较小模型可击败较大模型

## 核心洞察
| 论文 | M⋆ | AutoHarness |
|------|-----|-------------|
| 维度 | 记忆Harness | 动作约束Harness |
| 方法 | Python程序进化 | Thompson采样树搜索 |
| 核心发现 | 记忆结构任务特异性 | 小模型+Harness>大模型 |

## 与本文相关
-  — Self-Evolution机制对照
-  — 模型自我进化实践对照
-  — OpenClaw的Harness设计
-  — 详细论文内容（raw）

## 深度分析
### 记忆Harness的任务特异性：为何跨任务迁移失败
M⋆的核心发现在于其t-SNE可视化揭示的**结构收敛现象**：不同任务在进化后并非趋同，而是收敛于截然不同的记忆结构聚类。这与传统的"通用记忆模块"假设直接矛盾。
LoCoMo（对话）最终采用SQL+ChromaDB的混合设计，ALFWorld（具身智能）却选择了简单列表+LLM摘要的轻量方案。Legal检索任务偏好关系型数据库，而非常见的向量检索。这一现象的根本原因可能在于：**任务的认知复杂度决定了记忆表示的粒度需求**。对话任务需要追踪大量实体关系，检索粒度要求细；具身任务只需"状态-动作-结果"的三元组，用列表即可覆盖。
跨任务迁移失败进一步印证了这一点。将A任务的最佳记忆程序用于B任务，表现甚至不如基线——这不是因为程序本身有缺陷，而是因为记忆结构与任务之间的"适配性"被破坏了。这对工程实践的启示是：**记忆系统的评估必须包含跨任务泛化测试**，否则容易陷入对特定任务的过拟合。

### AutoHarness的三种模式：策略与成本的权衡
AutoHarness提供了三条路径，实质上是一个**成本-性能曲线**：

- **harness-as-action-filter**：最轻量，只过滤非法动作，LLM保留完整决策权。适合动作空间较小但合法判断复杂的场景。
- **harness-as-action-verifier**：当前主流方案。LLM生成动作→代码验证→非法则重试。实验表明这是效果与成本的最佳平衡点。
- **harness-as-policy**：最激进——完全用Python代码实现策略逻辑，测试时**零LLM调用**。极限模式下平均奖励0.870，超越GPT-5.2-High，但牺牲了对新情况的泛化能力。
值得特别关注的是harness-as-policy模式的**条件边界**。它只能在动作空间完全可枚举且策略可用规则精确描述时才能生效。这限制了其在开放式任务（如开放域对话）中的应用，但为封闭域任务（如游戏、形式化验证）提供了一条近乎免费的性能提升路径。

### 小模型+Harness>大模型：隐含的范式转移
AutoHarness实验中Gemini-2.5-Flash+Harness击败Gemini-2.5-Pro的结果具有重要的范式含义：这不仅是"小模型通过Harness弥补能力差距"，更是对"Scale假说"的一次修正。当任务的约束条件可以被显式编码时，模型的规模优势被大幅稀释。
这与Harness的核心逻辑一脉相承：**智能的边界可以由外部结构扩展，而不必完全依赖模型参数的增大**。这对算力投入方向的战略意义是：与其训练更大的基座模型，不如投资更精确的Harness设计。

### 两种Harness的趋同方向
M⋆和AutoHarness虽然面向不同的Harness类型（记忆vs动作约束），但都采用了**可执行程序表示+迭代进化搜索**的核心范式。这不是巧合——它反映了Harness工程化的必然演进：
1. **从配置到代码**：Harness从YAML/JSON配置转向Python程序，表示能力更强
2. **从手工到自动**：人工设计Harness→基于执行反馈的自动进化
3. **从通用到特化**：通用Harness→任务协同优化的专用Harness
这一趋同方向意味着：Harness工程正在从"辅助工具"升级为"核心竞争壁垒"。

## 实践启示
1. **任务-Harness协同设计**：在设计Agent的记忆系统或动作约束时，应将Harness视为任务的共生部分，而非外挂模块。评估时必须包含任务特异性的压力测试。
2. **harness-as-policy的优先尝试**：对于动作空间封闭、可枚举的游戏类或形式化任务，优先考虑harness-as-policy模式——它能以接近零的推理成本获得显著性能提升。
3. **记忆结构的快速原型验证**：M⋆的反射式代码进化提示我们，可以先为新任务设计多个候选记忆结构（列表、SQL、图、向量等），用小规模验证集快速筛选，再对最优结构进行深度优化。
4. **警惕记忆系统的过拟合**：跨任务迁移实验证明，记忆结构的优秀表现可能只是对当前任务的过拟合。在生产环境中部署前，应在多个相关但不同的任务上验证其泛化能力。
5. **Harness工程的投入优先级**：当基座模型能力边际收益递减时，将资源投入Harness设计往往比继续 Scale 模型更具性价比。特别是对于特定领域的专业Agent，专用Harness往往是决定性因素。
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/two-harness-papers-microsoft-google.md)

---
