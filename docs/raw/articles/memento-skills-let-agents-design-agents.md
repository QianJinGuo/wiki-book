---
title: "memento skills let agents design agents"
source_url: https://mp.weixin.qq.com/s/nplUm1D6JFe45P_WEVgyIg
tags: [wechat, article, claude, openai]
sha256: cf692ef68cfd
type: raw
created: 2026-05-15
updated: 2026-05-15
review_value: 8
review_confidence: 8
review_score: 64
review_stars: 5
review_recommendation: "入库"
ingested: 2026-05-15
source: "爱折腾研究组"
source_authors: ["爱折腾的小七"]
source_date: "2026-05-12"
paper_arxiv: "2603.18743v1"
---
# Memento-Skills 让 Agent 自己"设计 Agent"？
> 来源：爱折腾研究组（爱折腾的小七），2026年5月12日
> 原论文：Memento-Skills: Let Agents Design Agents，arXiv: 2603.18743v1
## 核心问题
大模型部署后通常是"冻结"的——预训练代价高昂，微调难以稳定运维。Agent 的适应能力只能来自**上下文**和**外部记忆**。
传统 memory 方案（记录历史轨迹/past cases/检索类似样本）本质上只是"查旧账"，而不是"长本事"。
**核心洞察**：把经验固化成 skill（技能包），而非原始轨迹——skill 是有 SKILL.md、可执行脚本、辅助 prompt、declarative spec 的真正可复用工件。
## Memento-Skills 五步闭环
```
Observe → Read → Act → Feedback → Write
```
- **Observe**：接收新任务，带上当前 tip memory
- **Read**：技能路由器从 skill library 检索最相关 skill
- **Act**：冻结 LLM 按 skill 流程执行
- **Feedback**：Judge 给出正确/错误反馈
- **Write**：更新 skill utility / 做 failure归因和file-level rewrite / 必要时进入 skill discovery
**三层写回策略**：局部修补优先，只在 utility 降至阈值时才生成新技能，避免破坏已有能力。
## 技能路由器：行为对齐而非语义相似
传统 BM25/embedding 只擅长找"语义像不像"，无法预测"行为上有没用"。
Memento-Skills 的路由器用 **skill 行为**（而非文案）定义相关性：
- 用约 3k 种子 skills 自动生成合成路由查询
- positive query + hard negative query 训练
- InfoNCE 目标，近似 soft Q-function
- 结果：Recall@1 从 0.32 提升到 0.60，route hit rate 0.29→0.58，judge success rate 0.50→0.80
## 实验结果
### GAIA（高度异质任务）
- 训练集：65.1% → 91.6%
- 测试集：52.3% → **66.0%**（+13.7pp）
- 局限：任务差异太大，训练 skill 难以迁移到测试
### HLE（同学科结构任务）
- 训练集：30.8% → 54.5%
- 测试集：17.9% → **38.7%**（+20.8pp）
- Biology/Humanities 提升最明显（可抽象程度高）
### 技能库增长
- GAIA：5 个 atomic skills → 41 个技能
- HLE：5 个 atomic skills → 235 个技能（形成主题簇）
## 论文真正有价值的地方
1. **持续学习从参数空间移到外部技能空间**：不需微调/重部署，skill memory 可写就能继续成长
2. **经验变成可维护工件**：skill 是文件夹、文档、脚本、可测试和版本化的对象
3. **明确 skill transfer 的边界条件**：任务结构离散时迁移受限，成域时迁移更强
4. **试图打通理论和工程**：SRDP、Reflected MDP、收敛性分析
## 不足
1. 仍是 benchmark 研究，非生产级长期验证
2. 路由器收益明显但非压倒性优势
3. 单技能检索可能限制更长链任务（需多技能串联/并行/动态组合）
4. 安全性（Judge 误判、sandbox 风险）尚未系统性量化
## 未来改进方向
1. 从单技能检索走向**技能图谱组合**（哪个 skill 先执行/校验/fallback）
2. **Skill DevOps**：版本治理、diff 审核、自动回滚、provenance 追踪
3. 学习目标加入**成本、时延、安全**多维指标
4. 跨模型、跨领域、跨模态（图像/表格/GUI）的 skill 迁移验证