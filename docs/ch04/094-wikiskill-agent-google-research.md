# WikiSkill：将 Agent 经验编译为持久知识以驱动技能进化（Google Research）

> 📊 Level ⭐⭐⭐ | 12.3KB

## WikiSkill：将 Agent 经验编译为持久知识以驱动技能进化

> **来源**：Google Research + Virginia Tech 论文《WikiSkill: Compiling Agent Experience into Persistent Knowledge for Skill Evolution》（arXiv:2608.27454，2026-08-27）。用户提供论文原文 PDF（第一手源）+ Hyman 的杂货铺 解读（2026-08-29）。
> **核心命题**：技能自动进化的瓶颈不是「从经验提炼技能」本身，而是**提炼出的洞察散落在各轮优化历史里、无法跨迭代系统性复用**。WikiSkill 给 Agent 加一个持久知识库（wiki）层，让技能更新建立在其上，实现「经验 → 知识 → 技能」的复利式协同进化。

## 三层架构 + 四步循环

WikiSkill 把 Agent 工作区分成三层：

1. **Raw Layer (raw/)** — 不可变执行轨迹（推理/工具调用/输出/答案），只写不改，像实验记录本。
2. **Wiki Layer (wiki/)** — 把原始经验编译为结构化累积知识：pattern 目录（markdown 记录失败模式/成功策略+应对办法）、logs.md（每轮发现）、skill-impact.md（提案 diff/验证分数/接受拒绝结果）。**跨轮永不重置**——被拒提案、重复错误、演化历史都保留，供后续提案避免重复踩坑。
3. **Skills Layer (skills/)** — 当前生效技能集，每技能含 SKILL.md（全文）+ PURPOSE.md（由哪些 wiki pattern 催生）。

每轮循环四组件：① **Inference Agent** 用当前技能跑回放（执行阶段禁止读 wiki——消融证实执行时读 wiki 反而降性能）；② **Wiki Maintainer** 采样 ≤8 条轨迹（≤5 失败找根因 + 3 成功提策略）做根因分析、增量补 pattern/diff；③ **Skill Proposer** ReAct 主动只读相关 wiki 页与轨迹，产出单个聚焦提案（新建或增量 patch）；④ **Gating and Rollback** 验证集评估，仅当 R > Rbest 接受，否则回滚技能集但保留 wiki。

> [!contradiction] 与 [Skill 自进化三路线](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-self-evolution-three-approaches.md) 视角互补：既有框架（EvoSkill/Trace2Skill/SkillOpt）同走「回放→分析→提案→门控」循环，但**不维护独立的、持续演进的技能表示**；WikiSkill 新增的持久 wiki 层正是这三条路线共同缺失的维度。链接见 SkillOpt。

## 关键结果：技能进化与模型规模互补、技能可跨模型迁移

主结果表（Table 1）/ 跨模型迁移（Table 2）的核心发现：

- **全面领先且更稳**：与各模型最强对比方法比平均分高 3.3/5.1/10.0/5.8/12.0（Qwen-4B/9B/27B、Gemma-31B、Gemini-Flash）。对比方法不稳定——EvoSkill 在 LiveMath 提 Qwen-9B (28.2→58.1) 却拖累 Gemma-31B (33.9→29.8)。
- **提升随模型规模增大**（互补 scaling）：Qwen 家族 +12.3/+17.5/+23.9（4B/9B/27B），SpreadSheet 上 27B 比 4B 多赚约 34 个百分点（+40.9 vs +6.5）。
- **技能可弥补模型规模**：Qwen-3.5-9B 配 WikiSkill 平均 47.4% 超 Qwen-3.6-27B 无技能 39.4%；Qwen-4B 配技能也有 38.5%。
- **迁移常有效甚至反超自炼**：Qwen-27B 技能把 Qwen-9B 在 SpreadSheet 带到 50.5%（无技能 24.3%、自炼 33.6%）；小模型技能也能帮大模型——Qwen-4B 技能让 Gemma-31B 在 LiveMath 73.1%。
- **负迁移真实存在**：Qwen-4B 技能把 Gemini-Flash 在 SpreadSheet 从 50.5% 打到 18.1%——低层绕行技巧（单行 Python 命令）束缚强模型写完整端到端脚本。

## 消融：持久知识库值多少分

Table 3（Gemini-Flash）证明 wiki 是关键：

| 配置 | Avg |
|---|---|
| 无技能基线 | 40.4% |
| 只有 Inference Agent 读 wiki | 45.3% |
| 都不读（无知识累积） | 48.7% |
| 都读 | 60.9% |
| 默认：只有 Proposer 读 | 63.7% |

- **wiki 对提案至关重要**：Proposer 能读 wiki 时 48.7%→63.7% (+15.0)。
- **执行阶段读 wiki 反而有害**：都读 vs 默认 63.7%→60.9%（LiveMath 72.6→64.8）。推测：执行时直接拿 wiki 答案让轨迹欠具信息量。

## 案例：ALFWorld 知识复利（Qwen-27B）

Iter 0 的 goal-directed-action 过抽象被拒（验证 0.72）但 diff+拒绝保留；Iter 1 参考拒绝历史创建 break-repetition-loop（「Never Return an Item to Its Origin Location」，验证 0.78 接受）；Iter 2-4 新循环变体涌现、wiki 累积证据，Iter 4 补第二条规则「Each Operation Type ONCE Per Item」。链条：失败 → 沉淀 → 借鉴 → 更好技能 → 再失败 → 再沉淀。

## 深度分析

**1. 复利的真正来源是「负结果资本化」**。WikiSkill 最被低估的设计不是 pattern 目录，而是 skill-impact.md 对被拒提案的保留：门控回滚技能集，但 diff、验证分数与拒绝理由永久留在 wiki 里（wiki 永不因接受/拒绝回滚）。ALFWorld 案例中，Iteration 0 的 goal-directed-action 提案因过抽象被拒（验证 0.72），Iteration 1 的 Proposer 正是参考这条拒绝历史，才写出具体可执行的「Never Return an Item to Its Origin Location」（0.78 接受）。大多数自进化框架把被拒提案当作噪音丢弃，等于每轮都从零开始；WikiSkill 把失败预算变成可复用资产，这是「失败沉淀借鉴再失败」链条能转起来的前提。对比 [Skill 自进化三路线](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-self-evolution-three-approaches.md) 与 SkillOpt，缺少的正是这个跨轮记忆。

**2. 读写解耦是反直觉但关键的角色分工**。消融显示 Proposer 能读 wiki 带来 +15.0（48.7% 到 63.7%），但 Inference Agent 读 wiki 反而把分数拉低 2.8（63.7% 降到 60.9%，LiveMath 72.6 降到 64.8）——执行时直接从 wiki 取答案，会让轨迹对技能改进「欠具信息量」，污染后续根因分析的原材料。这说明持久知识库在 agent 系统中的价值不在「运行时查询」而在「离线编译」：知识应该在写技能时被消费，而不是在跑任务时被消费。这与把 RAG 式检索直接塞进执行路径的常见做法构成一对张力。

**3. 技能与模型规模是互补 scaling，而非替代关系**。提升随模型规模单调放大：Qwen 家族 +12.3 / +17.5 / +23.9（4B / 9B / 27B），SpreadSheet 上 27B 比 4B 多赚约 34 个百分点——强模型更能把沉淀的流程性知识兑现成分数。同时技能又能反向弥补规模：Qwen-9B 配技能（47.4%）超过无技能的 Qwen-27B（39.4%）。两条曲线合起来意味着：在 [Scaling Laws](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/scaling-laws.md) 的语境里，持久知识是继参数、算力、数据之后的第四条可扩展轴，且与前三条相乘而非相加。

**4. 技能是「可移植性光谱」上的对象，而非二值的可迁移或不可迁移**。同一套技能既能反超自炼（Qwen-27B 技能把 Qwen-9B 在 SpreadSheet 带到 50.5%，自炼仅 33.6%），也能造成灾难性负迁移（Qwen-4B 技能把 Gemini-Flash 在 SpreadSheet 从 50.5% 打到 18.1%）。判据在技能编码的内容：通用流程（端到端脚本、诊断流程）可跨模型复用，模型特定 workaround（单行 Python 绕行、字符串转换规则）会束缚强模型并耗尽交互预算。更深一层，OfficeQA 上 Qwen-4B 技能降自己（30.2 降到 28.5）却提 Qwen-27B（42.1 升到 52.9）——技能「发现」与技能「执行」是两种可分离的能力，迁移好坏因此是技能内容与执行模型的双重函数。

**5. 三层分离本质是一条知识编译管线，且每层有不同的不变量**。raw 只写不改（证据不变量）、skills 可回滚（正确性不变量）、wiki 只增不减（复利不变量）——三者生命周期刻意不同步，与 [Source-First 知识编译](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/source-first-knowledge-compilation.md) 的取向一致：先固化原始证据，再编译为结构知识，最后生成可执行产物，编译失败可重跑而原始证据无损。这个不对称设计（技能回滚、知识不回滚）是整套系统能「越跑越懂」的结构性原因。

## 实践启示

- **给自进化系统加一个「永不重置」的 wiki 层，并强制记录被拒提案**。至少维护三件东西：pattern 目录（失败模式加可操作解法）、逐轮 logs、逐提案 skill-impact（diff / 分数 / 接受或拒绝）。被拒提案的拒绝理由是后续提案最贵的上下文。
- **读写角色严格分离**：执行 agent 禁止读知识库（保轨迹信息量），技能提案 agent 用 ReAct 主动按需只读相关页面（索引、skill-impact、具体 pattern、raw 轨迹），不要把全部知识被动灌进 prompt——既省上下文又逼出真正的检索式诊断。
- **门控回滚只回滚产物、不回滚知识**：验证分不达标就还原技能集，但本轮的分析结论照常写回 wiki；评估技能更新时用「仅当 R 大于 Rbest 才接受」的硬阈值，避免技能集在噪声上漂移。
- **写技能时把内容压在「通用流程」一侧**：端到端脚本、诊断顺序、检查清单可以迁移；模型特定的绕行技巧（单行命令、字符串 hack）要留在 wiki 的 pattern 里而不是固化进 SKILL.md，否则对更强模型是负资产——迁移前先评估技能编码的是流程还是 workaround。
- **为已知的三个缺口预留工程预算**：技能检索（当前全文注入 prompt，技能多了成本失控）、wiki 修剪（持续膨胀会信息过载）、宽松门控（严格阈值会错杀「当前持平但未来有用」的改动）。自建持久知识系统时这三项迟早要还债。

## 局限（Future Work）

技能检索未解（全文注入 prompt，技能多后成本高）；严格门控排除「当前持平但未来有用」改动；wiki 无修剪机制会膨胀；未覆盖数百步/数小时的超长任务。

→ [论文原文 PDF](https://arxiv.org/abs/2608.27454) / [解读存档](https://mp.weixin.qq.com/s/fXdxOo0ghm6-B9VNUdr23Q)

---

