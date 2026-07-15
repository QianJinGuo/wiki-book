# SkillComposer: 生成式技能组合

## Ch07.072 SkillComposer: 生成式技能组合

> 📊 Level ⭐⭐ | 4.1KB | `entities/skillcomposer-generative-skill-composition-agent.md`

# SkillComposer: 生成式技能组合

## 摘要

SkillComposer 将 Agent 技能选择建模为闭集技能序列生成任务，用 3.9M 参数的轻量解码器联合预测技能子集、数量和顺序。在 SkillsBench 上让 GPT-5.2-Codex 通过率从 22.2% 提升至 45.3%（+23.1 pp），prompt token 比全库加载少 24 万。核心反直觉发现：TF-IDF 稀疏检索比 Dense Embedding 在短技能名闭集上表现更好，小专用模型（3.9M）在真实任务 holdout 上比 600M 全参 SFT 高 19.3 pp Set F1。

## 核心要点

1. **问题形式化**：将技能选择建模为「任务条件变长技能索引序列预测」，一次输出子集、基数、顺序三个耦合决策
2. **架构**：冻结 Qwen3-Embedding 编码器 + 3 层 256 维 AR 解码器 + 基数头/集合头辅助 + TF-IDF 检索增强 logit 融合，共 3.9M 可训练参数
3. **数据**：9,872 条训练数据（65 真人 + 9,807 合成），覆盖 196 个技能，依赖边+工作流边保证顺序合理性
4. **结果**：Codex +23.1 pp，Gemini +18.2 pp 通过率提升，接近金标上界（51.1%/48.4%）
5. **关键 insight**：Sparse (TF-IDF) + Dense (Embedding) 融合在短名称高辨析度技能库上优于纯 dense；小专用模型优于大模型全参 SFT

## 深度分析

### 技能组合的「推荐系统时刻」

论文将技能组合类比为推荐系统演进：早期 flat 相似度召回 → 后来发现「看几部+按什么顺序看」是联合决策。SkillComposer 把生成式检索（Generative Retrieval）思路搬到技能闭集上，输出空间就是库内 skill ID，每个 token 可执行、可检查、可复现。

### 辅助头的设计价值

纯 AR 头监督信号稀疏（skill 只在出现位置收到正梯度）。基数头和集合头提供 order-agnostic 梯度，使模型在训练时从「排在第几位才知道该不该选」变为「只要该选就收到信号」。消融实验显示去掉任一先验都大幅掉分（Set F1 -7.1 去 set-fusion，-4.6 去检索 prior）。

### 局限与展望

- 库固定在 196 skill，任务以软件工程为主
- 技能依赖图靠元数据 I/O 和轨迹共现挖掘，新领域泛化未验证
- 技能创建和技能组合是正交问题，SkillComposer 只解后者

## 实践启示

1. **别整库灌 skill 进 prompt**：196 个 skill 已 1.27M token，库再涨 Agent 直接窒息
2. **top-k 检索只是下限**：多步流程（数据分析、CI 修复、科学计算）必须显式建模顺序和数量
3. **小专用模型 > 大模型硬 SFT**：3.9M vs 600M 在真实任务上高 19.3 pp——闭集组合不需要堆通用语言能力
4. **Sparse + Dense 混搭**：任务编码用 dense embedding，解码先验用 TF-IDF

## 相关实体

- [Agent Skills 完整指南](../ch04/267-skill.html)
- [Agent 协议到 Harness Skill](../ch04/403-from-agent-protocol-to-harness-skill.html)
- [Claude Code Skills/MCP/Rules 分析](ch07/006-claude-code-skills-mcp-rules.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/skillcomposer-generative-skill-composition-agent-arxiv-2606-32025.md)

---

