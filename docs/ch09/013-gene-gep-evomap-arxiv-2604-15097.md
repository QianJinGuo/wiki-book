# Gene/GEP — EvoMap×清华 提出的「策略基因」经验对象框架（arXiv 2604.15097）

## Ch09.013 Gene/GEP — EvoMap×清华 提出的「策略基因」经验对象框架（arXiv 2604.15097）

> 📊 Level ⭐⭐ | 22.0KB | `entities/gene-gep-evomap-qinghua-strategy-genes-arxiv-2604-15097-2026.md`

## 核心定位

EvoMap 团队（**Infinite Evolution Lab × 清华大学**）在 **arXiv 2604.15097** 提出的 **Gene (策略基因) + GEP (Gene Evolution Protocol)** 经验对象框架 —— 用约 **230 token 的紧凑控制对象** 替代**约 2,500 token 的传统 Skill 文档**，在 **45 个科学代码场景、4,590 次受控实验** 和 **CritPt benchmark** 上验证 Gene **稳定战胜**完整 Skill 包（甚至战胜**截短到同长度的 Skill**）。

**核心反直觉结论**：经验复用的关键不是给模型更多内容性提示，而是把经验做成一个**紧凑、面向控制、可持续进化的对象** —— "**经验回到模型那一刻，长什么形状**"决定了 Agent 能进化成什么样。

## 反直觉的「Agent 玄学」

把任务背景、流程、常见坑、API 用法、示例代码、注意事项都塞进 Skill 文档，下次同类任务模型还是可能在同一个地方犯错。

- **对人类工程师**：完整性 = 安全感与规范
- **对模型**：完整性 = **信号被稀释、重点被冲淡、控制被背景材料淹没**

> 行业真正看错 Skill 的地方：把 Skill 当成了智能复用的终点，忽略了模型并非"阅读"文档，而是在**有限推理预算里寻找下一步策略、哪些行为必须避免、什么约束优先级最高**。Skill 的强项恰恰建立在它**服务人类理解**之上，而不是服务**模型在当下任务中的决策**。

## Gene / Capsule / Event 三件套

Gene 不是孤立对象，是完整**对象层三层 framework** 的一部分：

| 对象 | 角色 | 关键属性 |
|------|------|----------|
| **Gene** | 可复用进化策略模板 | 含 `keywords + summary + strategy + AVOID` 四类信号 → test-time 控制片注入；定义"在什么情况下、做什么事、遵守什么约束" |
| **Capsule** | 被验证过的任务级执行路径 + 审计记录 | 任务级 evidence 链 |
| **Event** | 不可变的进化日志 | 写回触发对 Gene 的 Validate / Mutate / Solidify |

**Gene 字段**（约 230 token，5 字段）：
- `signals` —— 触发信号（子串匹配 / 正则 / 多语言别名）
- `strategy` —— 有序可执行步骤
- `constraints` —— 限制变更范围 + 禁止触碰路径
- `validation` —— 执行验证 + **SHA-256 内容寻址哈希**（不可篡改）
- 唯一 `asset_id`

## GEP（Gene Evolution Protocol）六阶段循环

详见 https://evomap.ai/wiki/16-gep-protocol

1. **蒸馏**：将过去失败/成功/修复路径 → Gene（写可溯源控制信号，非写文档）
2. **Scan**：新任务上下文扫描
3. **Match**：匹配最相关 Gene
4. **Inject**：作为 System Instruction 注入
5. **Validate**：执行后结果验证
6. **Mutate / Solidify**：写入 Event → 触发 Gene 池的 Validate / Mutate / Solidify → **不更新基模参数**的前提下持续进化

## Skill vs Gene 受控实验：输的不是质量，是形态

### 算术对比

**实验控制**：同一 systemInstruction 注入槽、同一 sandbox 评测脚本、同一底层经验，差别只在注入内容的"形状"。

| 维度 | 传统 Skill 包 | Gene 对象 |
|------|---------------|----------|
| **Token 量** | ~2,500 | ~230（**10× 更短**） |
| **结构** | overview / workflow / pitfalls / API notes / examples / scripts（接近 README） | keywords + summary + strategy + AVOID + asset_id |
| **注入位置** | systemInstruction 槽 | systemInstruction 槽 |
| **控制密度** | 稀疏（仅 Workflow 段有用，Overview 是最大负贡献） | 高（strategy 层不可省） |

### 关键数据（Gemini 3.1 Pro / Flash, T=0.05, max 16,384 token）

| 对照 | Skill（~2,500 tok） | Gene（~230 tok） | 无指导基线 |
|------|---------------------|------------------|------------|
| **两模型平均** | **-1.1pp**（低于基线） | **+3.0pp** | 0 |
| **Flash（弱模型）** | 41.8 → **49.0**（+7.2） | — | — |
| **Pro（强模型）** | 60.1 → **50.7**（**-9.4**） | — | — |

> 绝的一点：Skill **不是均匀地差** —— 在弱模型 Flash 上有提升，但在强模型 Pro 上**狠狠拖后腿**（长 Skill 把 Pro 的固有能力**直接压住**）。

### 预算对齐实验：剪短 Skill 仍打不过 Gene

> 把 Skill 的有效部分截短到 **230 token**（与 Gene 同长度）：
> **预算完全相同 —— Gene 仍然碾压**。剪短让 Skill 不再倒贴分，但怎么剪都打不到 Gene 的高度。

### 渐进式构造：strategy 层不可省

> keywords + summary 反而**回到无指导基线**。**真正把表现拔起来的是 strategy 这一层**。同样的字数，组织成"摘要"没用，组织成"策略"才有用。

**结论**：**Gene 不是更短的 prompt，是不一样形态的对象**。决定模型行为的是控制结构，不是 token 多少；**strategy 这一层不可省**。

## 鲁棒性边界：结构宽容，语义挑剔

扰动实验的反直觉结果：

| Gene 变体 | 表现 | 解读 |
|----------|------|------|
| `clean Gene` | 54.0% | 基线 |
| `stale_paradigm`（**过时算法范式**但框架对） | **56.6%** | **比 clean 还高** |
| 换错算法 | 48.8% | 框架破坏就掉分 |
| 换错领域 | 49.4% | 领域语义破坏就掉分 |

> **Gene 的有效条件是"保留任务相关的控制框架"，而不是"写得多新"**。过期的方法只要框架对仍然好用；新方法如果框架错，反而拖累。
> **结构上很宽容，语义上很挑剔**。

## 失败经验的最优形态：AVOID 警告

> 失败经验的累积应该是**选择性压缩，不是加法式堆叠**。

### 对照一：失败放在不同载体里

| 载体 | 表现 | 结论 |
|------|------|------|
| Skill 附加失败 | < 基线 | 拖后腿 |
| 自由文本附加失败 | < 基线 | 拖后腿 |
| **Gene 单独** | 54.0 | 唯一正贡献 |
| Gene + 失败原样 | **52.0**（-2.0） | **稀释 Gene** |

### 对照二：失败和策略的混合形态

| 形态 | 表现 |
|------|------|
| 失败 + 策略混合 | 弱 |
| 策略 only | 中 |
| **failure warnings only（AVOID 警告）** | **最强** |

**真实 AVOID 警告示例**（UV-vis 谱学场景）：

```
AVOID 把 min_distance 当成波长值传给 scipy.signal.find_peaks，要先转成采样点单位
AVOID 把 peak_widths 的原始输出直接当 FWHM 上报，要先换回波长单位
```

> **对 Agent 真正有用的失败经验，不长成"日志"，而长成 AVOID 警告**。

## 一个真实的 Gene 是什么样（UV-vis 场景，约 230 token）

```
Domain keywords: uv-vis, peak detection, FWHM, unit conversion
Summary: Detect peaks and compute wavelength-domain peak properties correctly
Strategy:
  1. Detect peaks with prominence-based criteria
  2. Convert min_distance into sample-index units before peak detection
  3. AVOID: Report FWHM only after converting peak_widths outputs back to wavelength units
```

对照物（同一份经验的 Skill 包，~2,500 token）：

```
overview, workflow, pitfalls, error handling, API notes, examples, scripts
（整体形态接近 README）
```

## CritPt benchmark 端到端验证

**CritPt**（https://critpt.com/）是动态的、严格模拟真实物理科研过程的数据集。

**Evolver 系统组成**：
- **OpenClaw** —— host runtime
- **Evolver** —— 进化引擎
- **Gene / GEP** —— 对象与协议层
- **近期爆火的 Hermes Agent 也在一定程度上"借鉴"了 Evolver 的设计理念**

**端到端结果**（不更新一个参数、不加任何 SFT/RL、纯靠经验对象层进化）：

| 时间 | 基模 | 跑分 | Evolver(Gene) | 提升 |
|------|------|------|---------------|------|
| 2026-02-16 | 基模 A | 9.1% | **18.57%** | **+9.47pp** |
| 2026-03-26 | 基模 B | 17.7% | **27.14%** | **+9.44pp** |

> **同一基模直接被抬升 +9pp 量级**。同时，**token 消耗从 100 美金降低到不到 1 美金**。

Benchmark70 任务全量复现：https://github.com/EvoMap/critpt-openclaw-reproducible-70

## 协议层升格：从「控制对象」到「持久策略优化接口」

> **经验对象在多 Agent 之间被交换的时候，它必须是一个对象，不能是一段文档**。

- **没有协议**：Gene 仍是一段 prompt —— 边界不稳、字段无法比较、不能累积
- **协议化后**：Gene 变成**可匹配、可替换、可修订、可组合**的对象 → 可被持续修订、可被审计追溯、可在多 Agent 之间以一致方式被使用

**GEP 不是格式细节，而是让 Gene 从测试时控制对象升格成持久策略优化接口的那一层协议** —— **为未来的 A2A 群体智能指明了一条通路**。

## 三层启示

| 层面 | 启示 |
|------|------|
| **应用层** | 把"**写给同事的 Skill 文档**"和"**运行时注入给模型的控制信号**"**分离开** —— 几乎没有成本、见效极快的"魔法" |
| **长期记忆/Reflection 研究** | 失败的最佳沉淀形态不是 trajectory log / reflection summary，而是 **AVOID 警告**；GPU 吃紧时，留什么经验不只看采集得对不对，还得看它是不是足够接得上模型当前的**执行预算** |
| **多 Agent 经验交换** | 比传输 Skill 文档更优：传输**结构化 Gene 对象**作为协议层载荷 —— 因为只有**可被匹配、可被修订、可被验证的对象**，才能在多方之间真正累积和进化 |

## 互补角度（与现有实体对比）

1. **empirical Gene vs Skill 量化对比**（4,590 受控实验 + CritPt benchmark）—— 现有 `agent-skill-writing*` 系列（Guide/Advanced/Evaluation/Practices/Comprehensive Survey）均为**范式介绍**，**没有任何 entity 提供 Skill 输给 Gene 的实验数据**
2. **230-token Gene vs 2,500-token Skill 的 token 比 1:10** —— 现有 `anthropic-agent-skills-design-patterns-14` 的渐进式披露设计只解决"何时加载"，不解决"加载后是什么形态"
3. **AVOID 警告作为失败经验最优形态**（vs trajectory log / reflection summary）—— 现有 `agent-memory-architecture*` 系列未涵盖
4. **GEP 6 阶段协议作为"可序列化经验"接口** —— 现有 `hermes-agent-skill-crossover-optimization`（Darwin×SkillEvolver）虽讨论"互优化"，但**没有协议层对象规范**
5. **CritPt benchmark +9pp 端到端结果 + $100→<$1 token 成本** —— 现有 `gepa-optimize-anything` 也讨论"经验对象优化"，但基线和方法论不同（GEPA 是 prompt 优化，Gene 是控制对象进化）
6. **Pro 上 Skill 拖后腿 60.1→50.7（-9.4）** —— 推翻了"更强模型更吃 Skill"的常见假设，与 `agent-harness-12-components-7-decisions` 的"长 context = 更好"前提**直接矛盾**
7. **结构宽容 + 语义挑剔的鲁棒性边界**（stale_paradigm 56.6% > clean 54.0%）—— 现有 entity 未涵盖

> [!contradiction] 参见 现有 Skill 渐进式披露 / 长 context 假设
> Gene 实验结果（Pro 上 Skill 60.1→50.7）直接挑战"更强模型 + 更长 Skill = 更好"的常见假设。Gene 的立场是"控制对象形态 > 知识完整性"。

## 深度分析

**核心洞察**：Gene 的实验结果（Pro 上 Skill 60.1→50.7）彻底颠覆了"更强模型 + 更长 Skill = 更好"的常见假设。这不仅是经验层面的发现，更是对"LLM 如何消费注入内容"这一根本认知的修正——模型在有限推理预算里寻找的是**控制信号而非内容性提示**，给模型提供"给人看的完整文档"本质上是一种**控制噪声注入**。

**技术要点**：

1. **strategy 层是 Gene 的不可省略内核**：渐进式构造实验（keywords + summary → 无指导基线）证明，同等 token 预算下，组织成"摘要"毫无作用，组织成"策略"才能把表现拔起来。**AVOID 警告单独使用时甚至强于策略本体**——这揭示了经验对象的核心价值不是"告诉模型怎么做"，而是"告诉模型什么不能做"。

2. **结构宽容 + 语义挑剔的鲁棒性边界**：stale_paradigm（过时算法范式）比 clean Gene 更高（56.6% vs 54.0%），但换错领域/换错算法立刻掉分。这说明 Gene 的有效条件是"**保留任务相关的控制框架**"，而非"写最新的方法"。过期框架只要结构对仍然有效；新方法如果框架错则直接拖累——这对 [GEPA 通用文本优化](ch01/273-gepa-optimize-anything.md) 的"内容质量优先"前提是一个直接挑战。

3. **GEP 协议是经验对象从"Prompt 片段"到"持久策略接口"的升格层**：没有协议，Gene 只是另一段 prompt——边界不稳、字段无法比较、不能累积。协议化后 Gene 变成可匹配、可替换、可修订、可组合的对象——这为 [OpenClaw Agent Loop 设计范式](ch04/503-agent.md) 中多 Agent 之间的经验交换提供了标准化的接口规范。

4. **"经验回到模型那一刻，长什么形状"是 Gene 最本质的命题**：这个问题的答案决定了 Agent 在测试时能进化成什么样。[Harness 7 层](ch03/073-claude-code.md)框架中，Gene 对应的是"控制对象层"——而这一层在之前的 harness 设计中几乎被完全忽视，所有设计努力都集中在 context 填充和 memory 系统上。

**实践价值**：对于 Agent 系统开发者，Gene 的最大启示是"**把写给同事的 Skill 文档和运行时注入给模型的控制信号分开**"——这是几乎没有成本、见效极快的优化。只需把已有的 Skill 文档中程序性内容（workflow/pitfalls/constraints）提取出来，重新组织成 strategy + AVOID 结构，就能显著提升控制密度。

[Agent Skill 编写指南](ch04/245-skill.md)的渐进式披露设计（分阶段加载 Skill 内容）在这里是一个互补视角——Gene 解决的是"注入后是什么形态"，渐进式披露解决的是"何时加载"，两者结合才能构建完整的经验复用系统。

## 实践启示

1. **将 Skill 文档中的程序性内容提取为 Gene 结构**：把 workflow / pitfalls / constraints / AVOID 从 Skill 文档中独立出来，重新组织成 `keywords + strategy + AVOID` 的紧凑控制对象——这是从 Skill 到 Gene 的最小可行迁移路径
2. **失败经验的最优沉淀形态是 AVOID 警告而非 trajectory log**：把失败经验写成一个一个独立的"AVOID xxx"警告，比保留完整的失败日志或反思摘要更能提升控制信号质量——[Hermes 自我改进闭环](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-self-improving-loop-winty.md)中的 SKILL.md 自迭代设计可以借鉴这一原则
3. **强模型（Pro 级）上长 Skill 会压住固有能力**：在部署 Gene 时，对强模型优先使用 Gene 而非完整 Skill 包——这与 [Skill 高级实践](ch04/245-skill.md) 中"根据模型能力梯度选择注入内容"的设计原则一致
4. **GEP 协议是 A2A 群体智能的基础设施**：若计划让多个 Agent 之间交换经验，传输结构化 Gene 对象（而非 Skill 文档）才能实现可匹配、可验证、可累积的群体进化——[Darwin Skill 互优化](ch04/245-skill.md)的跨 Agent 经验交换实验可作为参考实现
5. **结构宽容意味着 Gene 可以跨版本复用**：过时 Gene 只要控制框架对仍可用——在更新 Gene 池时优先更新 strategy 层和 AVOID 警告，而非推翻重来

- [Agent Skill Writing](ch04/245-skill.md) — Agent Skill 编写指南（渐进式披露三阶段）
- [Agent Skill Writing Advanced](ch04/245-skill.md) — Skill 高级实践
- [Agent Skill Writing Evaluation](ch04/245-skill.md) — Skill 评估方法
- [Agent Skill Writing Guide](ch04/245-skill.md) — Skill 编写完整指南
- [Agent Skill Writing Practices](ch04/245-skill.md) — Skill 最佳实践
- [Anthropic Agent Skills Design Patterns 14](ch04/245-skill.md) — Anthropic 官方 14 个 Skill 设计模式
- [Darwin Skill 2 Huashu](ch04/245-skill.md) — Darwin Skill 互优化
- [Hermes Agent Skill Crossover Optimization](ch04/245-skill.md) — Hermes Agent Skill 互优化（达尔文闭环）
- [Openclaw Agent Loop Design Patterns](ch04/503-agent.md) — OpenClaw Agent Loop 设计范式
- [Harness Engineering 7 Layers Openclaw Hermes Claude Code P1Anu](ch03/073-claude-code.md) — Harness 7 层 (OpenClaw/Hermes/Claude Code)
- [Gepa Optimize Anything](ch01/273-gepa-optimize-anything.md) — GEPA 通用文本优化（与 Gene 不同的优化路径）

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/gene-gep-evomap-qinghua-strategy-genes-arxiv-2604-15097-2026.md)

---

