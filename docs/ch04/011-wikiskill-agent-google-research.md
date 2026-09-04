# WikiSkill：将 Agent 经验编译为持久知识以驱动技能进化（Google Research）

> 📊 Level ⭐ | 6.3KB | `entities/wikiskill-persistent-knowledge-skill-evolution-google-2026.md`

# WikiSkill：将 Agent 经验编译为持久知识以驱动技能进化

> **来源**：Google Research + Virginia Tech 论文《WikiSkill: Compiling Agent Experience into Persistent Knowledge for Skill Evolution》（arXiv:2608.27454，2026-08-27）。用户提供论文原文 PDF（第一手源）+ Hyman 的杂货铺 解读（2026-08-29）。
> **核心命题**：技能自动进化的瓶颈不是「从经验提炼技能」本身，而是**提炼出的洞察散落在各轮优化历史里、无法跨迭代系统性复用**。WikiSkill 给 Agent 加一个持久知识库（wiki）层，让技能更新建立在其上，实现「经验 → 知识 → 技能」的复利式协同进化。

## 三层架构 + 四步循环

WikiSkill 把 Agent 工作区分成三层：

1. **Raw Layer (raw/)** — 不可变执行轨迹（推理/工具调用/输出/答案），只写不改，像实验记录本。
2. **Wiki Layer (wiki/)** — 把原始经验编译为结构化累积知识：pattern 目录（markdown 记录失败模式/成功策略+应对办法）、logs.md（每轮发现）、skill-impact.md（提案 diff/验证分数/接受拒绝结果）。**跨轮永不重置**——被拒提案、重复错误、演化历史都保留，供后续提案避免重复踩坑。
3. **Skills Layer (skills/)** — 当前生效技能集，每技能含 SKILL.md（全文）+ PURPOSE.md（由哪些 wiki pattern 催生）。

每轮循环四组件：① **Inference Agent** 用当前技能跑回放（执行阶段禁止读 wiki——消融证实执行时读 wiki 反而降性能）；② **Wiki Maintainer** 采样 ≤8 条轨迹（≤5 失败找根因 + 3 成功提策略）做根因分析、增量补 pattern/diff；③ **Skill Proposer** ReAct 主动只读相关 wiki 页与轨迹，产出单个聚焦提案（新建或增量 patch）；④ **Gating and Rollback** 验证集评估，仅当 R > Rbest 接受，否则回滚技能集但保留 wiki。

> [!contradiction] 与 [Skill 自进化三路线](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-self-evolution-three-approaches.md) 视角互补：既有框架（EvoSkill/Trace2Skill/SkillOpt）同走「回放→分析→提案→门控」循环，但**不维护独立的、持续演进的技能表示**；WikiSkill 新增的持久 wiki 层正是这三条路线共同缺失的维度。链接见 [SkillOpt](../ch05/058-skillopt.html)。

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

## 局限（Future Work）

技能检索未解（全文注入 prompt，技能多后成本高）；严格门控排除「当前持平但未来有用」改动；wiki 无修剪机制会膨胀；未覆盖数百步/数小时的超长任务。

→ [论文原文 PDF](https://arxiv.org/abs/2608.27454) / [解读存档](https://mp.weixin.qq.com/s/fXdxOo0ghm6-B9VNUdr23Q)

---

