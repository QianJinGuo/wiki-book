# SkillOpt

## Ch05.043 SkillOpt

> 📊 Level ⭐⭐ | 11.9KB | `entities/skillopt.md`

# SkillOpt
> 微软 × 上海交大 × 同济 × 复旦。冻结模型参数，把 agent 外部技能文档当作可训练对象，用验证集门控每一次编辑。

> Rohan Paul (X) 概括：「像训练小程序一样训练 agent 技能」

**SkillOpt = "LoRA for skills"**。LoRA 冻结模型主体、只训练一个小参数适配层；**SkillOpt 冻结全部模型参数、只训练一份外挂 skill 文件**。部署阶段零额外模型调用 —— optimizer 只在训练阶段参与，产出纯文本 `.md`。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/skillopt-skill-document-training-microsoft-sjtu.md)

## 它要解决什么
主流 skill 生产方式（人工手写 / LLM 一次性生成 / 自修订）**没有验证机制**。人工写的改一行不知影响；LLM 生成的 quality 看那次 prompt；自修订"看起来更聪明"实际可能更差。

> 论文原话：Agent skills are hand-crafted, generated one-shot, or evolved through loosely controlled self-revision, **none of which mirrors the reproducible, feedback-driven optimization loop that makes deep-learning training reliable**.

## 四步训练循环（mini training loop）
| 步 | 动作 | 关键设计 |
|---|---|---|
| 1. **执行任务** | agent 携带 skill document 跑任务，记录完整 rollout 轨迹和得分 | |
| 2. **分析轨迹** | 独立 **optimizer model** 读成功/失败轨迹 → 提**小范围文本编辑**（add/delete/replace） | textual learning-rate budget 限制幅度 |
| 3. **验证集门控** | 新 skill 在 held-out set 上跑一轮；分数严格提高才接受；否则 rejected-edit buffer 或丢弃 | **gate 决定整个框架可靠性** |
| 4. **沉淀经验** | 多个 epoch 后 slow/meta update 把反复验证的稳定经验写入 skill | epoch-wise 慢速更新稳定训练 |

> **没有第 3 步，optimizer 可能把 skill 改得"读起来更专业"、实际任务分反而下降 —— prompt drift 经典症状。**

## 实验结果
- **6 benchmark × 7 model × 3 harness** = **52 个测试格子** → 全部 **best or tied**
- GPT-5.5 提升：Codex agentic loop **+24.8 pt**、Direct chat +23.5 pt、Claude Code +19.1 pt
- 提升幅度已超出"prompt engineering 调调格式"量级 → **skill 层有可被系统化挖掘的空间**

### 迁移性（值得重视的工程能力）
训练出的 skill artifact 可：
- 跨**模型规模**迁移
- 跨**执行环境**迁移（Codex → Claude Code）
- 跨**相近领域 benchmark**迁移

> 一份 skill 训好之后，换模型换 harness 依然有效。

## 工程意义：Agent 时代的新型资产
Agent 团队正在积累：技能文件 / 流程文档 / 工具使用约定 / 仓库工作流 / 测试策略 / 调试手册 —— **比 prompt 持久，但只靠人工/LLM 随手改会退化/不可复现**。

SkillOpt 把 skill 文件变成**可训练 / 可验证 / 可审计的工程资产**：
- 团队可审阅最终 skill 文件
- 看到它为什么要求 agent 先做某检查、如何处理失败、何时调用工具
- **这种透明度是模型权重做不到的**

## 5 条局限
1. **验证集设计是核心难题** —— 整个框架可靠性依赖 held-out set 质量；过小/不具代表性 → gate 失效
2. **训练成本需摊薄** —— 每轮编辑都需 optimizer 读轨迹 + 生成编辑 + 跑验证；高频任务能否回本取决于 skill 复用频率和有效期
3. **跨真实生产环境迁移需验证** —— benchmark 多样性远低于生产
4. **Skill library 的选择与组合** —— 多 skill 切换、冲突处理未深入探讨
5. **仍是研究原型** —— 微软/Anthropic 尚未官方集成到 Codex/Claude Code

## 成本权衡
| 阶段 | 成本 | 备注 |
|---|---|---|
| **训练** | 高 token 消耗 | 类似"compile step"，需要真金白银 |
| **推理部署** | **零**额外模型调用 | optimizer 不上线 |
| **决策** | 哪些任务值得训 skill vs 手写 prompt | 复用频率 × 有效期 |

## 与现有范式对照
| 范式 | 冻结 | 训练对象 | 部署形式 |
|---|---|---|---|
| **LoRA** | 主体模型 | 小参数适配层 | 几个 MB 权重 |
| **Prompt Engineering** | — | 手工调 prompt | prompt 文本 |
| **Self-Refine / Reflexion** | — | 模型自修订 | 无外部训练对象 |
| **SkillOpt** | 全部模型参数 | 外挂 skill 文档 | 纯文本 `.md` |

## 对 harness/agent 团队的启示
1. **skill 层的可训练性是工程问题** —— 不是"prompt craft 凭手感"
2. **gate 机制是基础设施** —— 没有验证集的优化都是"看起来更聪明"
3. **skill 文件可读 = 工程化优势** —— 模型权重是黑箱，skill 是团队真正能掌控的资产
4. **复用频率决定 ROI** —— 高频/稳定任务 = 训得回；一次性/低频 = 手写 prompt 更划算
5. **与 harness 兼容性是关键** —— skill 跨 Codex/Claude Code 迁移 = 不被厂商锁定的护城河

## 深度分析

- **LoRA 类比揭示核心创新点**：SkillOpt 冻结全部模型参数、只训练一份外挂 skill 文档（纯文本 `.md`），这与 LoRA 冻结基座模型只训练小参数适配层的思路一脉相承。关键认知跃迁在于把"可训练部分"从模型权重外部化到文本载体——这意味着 optimizer 的输出可以直接被人类审查、版本控制、跨团队共享，而模型权重做不到这一点。 

- **验证门控是整个框架的承重墙**：没有 held-out validation set，optimizer 可能把 skill 改得"读起来更专业"，实际任务分反而下降——这是经典的 prompt drift 症状。论文明确指出 deep learning 的可复现性依赖于反馈驱动的优化循环，而 SkillOpt 的验证门控正是将这一机制引入 skill 层的核心设计。 

- **四步循环本质上是一个 mini training pipeline**：执行→分析→门控→沉淀，与标准 ML 训练的 forward/backward/validate/update 高度对应。textual learning-rate budget（限制每次编辑幅度）防止 optimizer 一步到位做出破坏性修改；slow/meta update 跨 epoch 逐步稳定 skill。 

- **跨环境迁移能力是工程上的关键差异化点**：52 个测试格子（6 benchmarks × 7 models × 3 harnesses）全部达到 best/tied，表明训练出的 skill artifact 不是针对单一模型或 harness 过拟合，而是捕获了任务结构的某种本质特征。这种跨 Codex→Claude Code 的迁移能力意味着团队可以围绕 skill 构建厂商无关的工作流护城河。 

- **Skill 文件是团队真正能掌控的资产**：模型权重是黑箱，skill 文档可读、可审计、可版本控制。团队可以精确审查"为什么这个 skill 要求 agent 先做某项检查"、"失败时如何处理"、"何时调用工具"——这种透明度使 skill 开发真正成为工程实践而非玄学。 

## 实践启示

- **在引入 SkillOpt 前先建好验证集基础设施**：框架可靠性完全依赖 held-out set 的质量——过小、噪声高或不具代表性都会导致 gate 失效。先投入精力构建有代表性的验证集，再谈训练优化。 

- **用 ROI 框架决策哪些 skill 值得训练**：训练阶段 token 消耗类似"compile step"，需要真金白银。复用频率高、有效期长的 skill（如标准流程、常见错误处理）适合训练；一次性或低频任务用手写 prompt 更划算。 

- **Textual learning-rate budget 是安全 guardrail**：允许 optimizer 做 add/delete/replace 小范围编辑是刻意设计的"学习率"——大幅重写会破坏已有验证通过的经验。实现时要严格限制单次编辑幅度，避免优化器一步到位破坏 skill 稳定性。 

- **Prompt drift 监测是 agent 自我改进系统的标配**：任何引入模型自修订或 optimizer 的系统都需要类似验证门控的机制——没有验证的优化是在"看起来更聪明"的路上裸奔。参考 [Agent 自我改进的六条路](../ch03/046-agent.html) 中的验证机制设计。 

- **Skill 资产化是 agent 团队工程成熟的标志**：将 skill 文件视为可训练/可验证/可审计的工程资产（而非随手改的文档）需要配套的工程实践：版本控制、审阅流程、部署前验证。参考 [Agent Skill 编写指南](../ch04/607-agent-skill.html) 建立规范化 skill 管理流程。 

## 相关对照
- [Agent Skill 编写指南](../ch04/607-agent-skill.html) —— 通用 skill 格式
- [Agent Skill 进阶模式与治理](../ch04/607-agent-skill.html)
- [Agent Skill 评估与迭代](../ch04/607-agent-skill.html) —— 评估正契合 SkillOpt gate 思想
- [Agent Skill 高质量编写规范](../ch04/607-agent-skill.html)
- [Agent 可靠性的工程解法：Skillify 持续改进](../ch04/267-skill.html)
- [Agent 自我改进的六条路](../ch03/046-agent.html) —— SkillOpt 是一种新路径
- [Agent Skills 系统性综述](../ch04/394-agent-skills.html)

## 第 2 来源 — 实战教程（@hooeem）

> **互补角度**：本文是 SkillOpt 的实战教程，不是论文复现。作者 @hooeem 从零开始讲解 SkillOpt——从「什么是 skill」开始，到安装配置、基准任务设计、参数调优、结果解读的一站式实操指南。核心价值在「怎么做」而非「为什么好」。

**互补角度 5 条**:
1. **完整的安装与配置指南** — 从 `uv sync` 到 VSCode/Claude Code 配置，涵盖 Windows/Mac 的路径适配和 AgentMD 角色文件安装。现有 entity 只有概念框架和论文数据。
2. **输出可读与审计的 best_skill.md 文件** — 试验输出 380-2000 tokens，1-4 次编辑即可收敛，文件小到几分钟读完审完。强调「部署后零额外模型调用」的工程意义。
3. **开放架构衍生模式** — 提及社区已衍生 CodexAgenticSkillOptimizer、NeoSkillOptimizer、CrewAIAgenticSkillOptimizer 等 fork 生态。
4. **调参实用指南** — textual learning-rate、rejected-edits buffer、parallel workers 等 hyperparameter 的实际调节建议，附官方文档链接。
5. **诚实限制条款** — 明确列出 SkillOpt 不适用的场景（无客观正确答案的任务），以及「skill 被训练走样后难以回滚」等实战中遇到的问题。

→ [第 2 来源原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/自我进化的-agent-skill微软-skillopt-到底解决了什么.md)
- [Impeccable](ch05/001-impeccable.html) —— skill 落到前端的范例；SkillOpt 给"skill 怎么训"补上一块

---

