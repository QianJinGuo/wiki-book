# HSCodeComp：阿里 ACL 2026 最佳资源论文——层级规则应用 Agent 基准

## Ch05.127 HSCodeComp：阿里 ACL 2026 最佳资源论文——层级规则应用 Agent 基准

> 📊 Level ⭐⭐⭐ | 4.2KB | `entities/hscodecomp-acl-2026-best-resource-paper.md`

# HSCodeComp：阿里 ACL 2026 最佳资源论文——层级规则应用 Agent 基准

> HSCodeComp（Harmonized System Code Compass）是阿里 ATH-MaaS 团队提出的首个面向「分层规则应用」（Hierarchical Rule Application）能力的专家级 Deep Search Agent 基准，获 ACL 2026 Best Resource Paper。核心发现：最强 Agent（~49.4%）远落后于人类专家（95%），且 Test-Time Scaling 无法弥合差距。

## 核心贡献

### 知识复杂度三层模型
| 层次 | 知识类型 | 代表 |
|------|---------|------|
| Level 1 | 开放域数据 | BrowseComp, GAIA |
| Level 2 | 结构化数据 | MedBrowseComp, FinSearchComp |
| Level 3 | **分层规则数据**（本文） | HSCodeComp——当前评测关键盲区 |

Level 3 三大天然挑战：层级深一步错步步错、语义边界模糊（"除……以外"等）、逻辑高度耦合（例外条款与交叉引用）。

### Benchmark 设计
- 632 个真实跨境商品，32 个大类
- 26 位关务专家六步标注（双人独立→仲裁→复核），分歧率仅 2%
- 评测指标：Exact Match Accuracy 报告 2/4/6/8/10 位准确率
- Bootstrap 95% CI 已达统计平衡

### 关键发现

**巨大的能力鸿沟**：最强系统仅 ~49.4%（Hermes-Agent + Qwen3.7-Max），远落后于人类专家 95%。6k 样本 SFT+Agentic RL 也只能到 ~65%，表明分层规则应用是结构性瓶颈。

**Test-Time Scaling 失效**：
- Voting@K 不生效——投票在同源错误里选众数
- Self-Reflection 微弱——混淆修正与误改
- **推理漂移（Reasoning Drift）**：强迫模型"想得更多"非但不涨反跌——GPT-5 10 位准确率随推理深度从 40.82% 跌到 35.44%

**三类信号重要性排序**：
1. Agent Harness（检索并应用规则/知识）→ +8.5pt，地基
2. CROSS 历史裁定库（few-shot 判例）→ +5~10pt
3. 视觉信息 → +4pt 且仅限强 VLM

## 分层规则应用（Hierarchical Rule Application）

这是本文定义的核心能力维度，与 Deep Search 现有基准的关键区别：不是检索网页或结构化数据，而是精准应用人类编写的层级专业规则。该能力有跨垂类共性——ICD-10 医疗编码、法律合规、税务审计等同构任务均适用。

## 与现有 Agent 评测体系的关系

HSCodeComp 定位在现有 Deep Search 基准的盲区——测量 Agent 在"规则/知识中心"而非"检索算力中心"任务上的真实能力。决策成败不取决于算力或推理深度，而取决于能否检索到正确的专家规则并严格逐层应用。这与 [AINMM](ch05/019-ai-native.html) 的 ML2→ML3 验证门禁升级方向一致——验证回路不依赖模型"想更多"而依赖规则锚定。

## 链接

- [Harness Engineering](ch05/115-harness-engineering.html) — Agent Harness 提供 +8.5pt 增益，验证了 Harness 对规则应用的基础作用
- [AINMM 成熟度模型](ch05/019-ai-native.html) — 验证回路依赖规则锚定而非模型自省
- [AI Agent 评测 5 维体系](ch05/101-ai-coding.html) — 评测方法论参考
- [评估 Harness 设计](https://github.com/QianJinGuo/wiki/blob/main/concepts/evaluation-harness-design.md) — 任务设计与评测方法论

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hscodecomp-acl-2026-best-resource-paper.md)

---

