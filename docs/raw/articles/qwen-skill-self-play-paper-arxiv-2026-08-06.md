---
title: "Skill Self-Play: Pushing the Frontier of LLM Capability with Co-Evolving Skills（论文原文）"
source_url: "https://arxiv.org/abs/2607.22529"
author: "Siyuan Huang, Pengyu Cheng, Haotian Liu, Tao Chen, Yihao Liu, Jingwei Ni, Shijie Zhou, Ziyi Yang, Gangwei Jiang, Mengyu Zhou, Yu Cheng, Xiaoxi Jiang, Guanjun Jiang"
publisher: "Qwen Large Model Application Team, Alibaba"
published: 2026-08-06
ingested: 2026-08-06
language: en
type: raw-article
sha256: "e6484ca0319950ebdd0424980cd3f1381e79420d9c5fdbbf0f25adfba51b5959"
---

# Skill Self-Play: Pushing the Frontier of LLM Capability with Co-Evolving Skills

> 论文原文（arXiv:2607.22529，用户提供 PDF，30 页全文）。Qwen Large Model Application Team, Alibaba + CUHK/人大/中山大学/北大/ETH Zürich/UZH/UB。GitHub: https://github.com/Qwen-Applications/skill-self-play。

## Abstract

LLM training 正从人工设计与标注转向交互驱动自我进化。现有自进化方法面临**任务多样性与验证可靠性**的根本两难：环境绑定方法获得精确反馈但学习局限于窄领域；开放自生成拓宽任务空间但缺乏可靠验证，误导奖励污染训练循环。

核心洞见：**agent skills 是调和此张力的中间地带**——每个 skill 确保特定场景的深度可验证执行，跨 skill 动态路由保持开放式任务多样性。基于此提出 **Skill-SP（Skill Self-Play）**协同进化框架：proposer + solver + dynamic skill controller，通过 RL 循环持续自博弈——proposer 基于动态采样 skills 生成有挑战任务；solver 探索候选解推能力边界；skill controller 收集执行反馈更新扩展 skill 库。

## 形式化目标（库内零覆盖）

可验证 agent 任务形式化为元组 (𝒙, 𝒄)：𝒙 是 solver 可见标准 prompt，𝒄 是隐藏的机器可读验证契约（单元测试/参考答案），仅由环境评估。给定 solver 响应 𝒚，环境返回验证奖励 Rsolve(𝒙, 𝒚, 𝒄) ∈ [0,1]。

- **Eq 1**：solver 期望成功率 vsolve(𝒙, 𝒄; πsolve) = 𝔼[Rsolve]
- **Eq 2（gated curriculum reward）**：proposer 目标 = 𝟙{(𝒙,𝒄) is valid} · (1 − 2|vsolve − 0.5|)——以 medium-difficulty score 瞄准 solver 学习前沿（50% 正确率）。**关键：二元质量过滤器显式 gate proposer 奖励，防止 reward hacking**（proposer 合成 ill-posed/不可解契约伪造人工难度）
- **Eq 3**：外层目标联合优化 skill 库 S 与 proposer，持续合成 valid + frontier-targeted 任务

## 方法与组件

### 三角色协同（与 Hyman 解读一致，此处为原文定义）

1. **Proposer**：在动态路由的 skills 条件化下生成有挑战任务
2. **Solver**：探索候选解，推能力边界（GRPO 更新）
3. **Skill Controller**：收集执行反馈，更新/修剪/归纳技能库

### 技能库动态路由

- 双流出题：skill 流（高质量、结构化、内置校验器）+ 探索流（无约束、挖新模式、防模板塌缩）
- 有效候选按 frontier reward 排序构造 solver curriculum（难度课程）
- 验证失败/新颖样本/任务级统计触发 skill refinement（改写）、pruning（归档）、induction（新技能归纳）——训练反馈蒸馏为可复用 skills

## 完整主结果表（库内零覆盖——分项数据）

### 工具调用（API-Bank L1-L3 + BFCL 四类）

**Qwen3-4B-Inst**（基线 60.2 → Unguided SP 64.1 → **Skill-SP 66.7**，+6.5）：
- API-Bank：L1 58.1→64.6 (+6.5)、L2 42.5→54.7 (+12.2)、L3 35.6→44.0 (+8.4)
- BFCL：JS 57.8→65.5 (+7.7)、Py 91.8→96.0 (+4.2)、Java 59.8→63.5 (+3.7)、Live 75.6→78.5 (+2.9)

**Qwen3-8B**（基线 69.4 → Skill-SP 提升）：
- API-Bank：L1 73.3→(+)、L2 61.4→(+)、L3 43.9→(+)；BFCL 四类均正向

**Ministral-3-8B**（错位弱模型）：20.7 → **63.6（+42.9）**——Unguided SP 几乎无进步，技能库提供标准化出题模板让训练信号启动
**Ministral-3-14B**：22.2 → 64.5（+42.3）

### 逻辑推理（ZebraLogic 网格谜题，四档复杂度）

- Qwen3-4B：72.1 → 73.5（+1.4）
- Qwen3-8B：23.6 → 32.4（+8.8）
- Ministral-3-14B：整体推理精度 +12 点，简单谜题暴涨 +35.3
- ZebraLogic 也最清楚暴露 Unguided SP 局限：生成合法唯一解谜题需主动结构引导而非被动后过滤

## 技能库进化统计（库内零覆盖）

- 5 轮迭代后，**Active skills 86 套，Effective（≥1 accepted record）46 套**
- 技能库从初始十几套扩张到 86，持续拓宽任务类型覆盖

## 消融（与 Hyman 解读一致）

- 去掉 skill 编排（无引导自博弈）：整体低 2.6 分
- 只用 skill 流（无探索流）：跨场景表现下降
- 均匀路由 vs 动态路由：-1.9；冻结 skill 库：-2.3；冻结出题器：-2.1；冻结 feedback solver：-3.0；两边冻结：-3.2

## 局限与未来（库内零覆盖）

**局限**：
1. 发现全新任务模式需要基础模型具备最低基础能力（引导有效学习信号）
2. 极复杂领域初期可能需要少量人工演示 jumpstart 演化库
3. 当前依赖固定启发式：静态 skill-stream 混合比例 α、预定义难度边界——新任务族需经验调参

**未来**：
1. 用可学习动态课程调度器取代固定路由启发式，自主优化数据编排
2. 直接从原始环境交互全自动 co-induce 生成规则与可执行验证器
3. **跨模型架构迁移演化技能库**——强前沿模型引导启动小模型，可扩展民主化对齐
4. 拓展多模态/长流程 Agent 场景
