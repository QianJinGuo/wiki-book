# HSCodeComp：阿里 ACL 2026 最佳资源论文——层级规则应用 Agent 基准

> 📊 Level ⭐⭐⭐ | 9.8KB

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

HSCodeComp 定位在现有 Deep Search 基准的盲区——测量 Agent 在"规则/知识中心"而非"检索算力中心"任务上的真实能力。决策成败不取决于算力或推理深度，而取决于能否检索到正确的专家规则并严格逐层应用。这与 [AINMM](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ainmm-ai-native-maturity-model.md) 的 ML2→ML3 验证门禁升级方向一致——验证回路不依赖模型"想更多"而依赖规则锚定。

## 深度分析

### 为什么分层规则应用是当前评测盲区

Level 1 评测（BrowseComp、GAIA 一类）考的是开放域检索与信息聚合，模型只要「找到」就能得分；Level 2 评测（MedBrowseComp、FinSearchComp 一类）把检索对象换成结构化字段，考的是抽取与对齐。两者的共同点是答案质量主要由检索覆盖面与算力预算决定，规模扩张因此能持续变现。Level 3 的分层规则数据把自变量换成了「规则的可应用性」：规则树由人类专家撰写，层级深、边界模糊（充斥「除……以外」「其他」这类自然语言限定）、条款互相引用，任何一层的误判都会沿推导链放大到最终结果。HSCodeComp 把这一维度单独拿出来测量，才让「最强 Agent ~49.4% 对专家 95%」这样的鸿沟第一次可见。

### 能力鸿沟的性质：结构性瓶颈而非规模问题

49.4% 这个数字容易被误读成「再训一代模型就好了」。但论文的证据指向相反的结论：前沿系统只勉强超过传统 ML 决策树（~45%），说明这条曲线上参数与数据的边际收益极薄；而 6k 专家样本 + SFT + Agentic RL 的完整闭环也只把成绩推到 ~65%，长尾类目（Novelty & Special Use、Men's Clothing）平均 10 位准确率甚至不足 25%。更合理的解释是：模型缺的不是知识也不是算力，而是一个独立的能力维度——在规则树里「检索到正确条款并严格逐层应用」的操作能力。缺失一个维度时，在同维度上加码救不了它。

### Test-Time Scaling 为何失效（推理漂移）

三种常见的推理期加码在这里同时失效，且失效机制各不相同。Voting@K 的隐含假设是错误随机分布，因此多数票能收敛到正确答案；但规则应用任务里的错误是同源的——同一处规则检索失败会稳定复现，投票只是在同源错误里挑众数。Self-Reflection 的隐含假设是模型能区分「我这里原本错了」和「我这里本来就对」，实际行为却是把正确修正与错误改写混在一起，收益被自身的误改抵消。最反直觉的是推理漂移（Reasoning Drift）：GPT-5 的 10 位准确率随推理深度从 40.82% 掉到 35.44%，即「想得更多」在规则应用任务上可能是负收益。

### 三类信号的收益排序与 Harness 优先

三类信号的增益差距本身就是一张资源分配表。Agent Harness（检索并应用规则/知识）+8.5pt 是地基，Harness Engineering 描述的正是这一层，它决定 Agent 能不能拿到正确的规则；CROSS 历史裁定库的 few-shot 判例 +5~10pt，把「规则条文」变成「可比的先例」，收益稳定且可与 harness 叠加；视觉信息 +4pt 且只对强 VLM 生效，属于边际补充。值得注意的是，视觉是三者的唯一与「规则」无关的信号，也是收益最不确定的一类。这个顺序给出的系统设计含义很直接：先修规则通路，再补判例库，最后才谈多模态。

### 跨垂类同构性及其对评测体系的意义

论文真正的贡献不止一个基准，而是提出了一个可复用的能力类别：ICD-10 医疗编码、法律合规判定、税务审计都与 HS 编码同构——输入是含噪的案例描述，中间是人类编写的层级规则，输出是唯一判定项。这意味着 Level 3 评测不必按垂类重复发明，一套「规则树 + 专家标注 + 分层准确率」的方法论可以在多个领域迁移。对评测体系方法论的含义是：[评估 Harness 设计](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/evaluation-harness-design.md) 一类工作需要把「规则锚定」做成显式的验证门禁，而不是只统计端到端通过率；[Evaluation & Benchmarks 主题地图](https://github.com/QianJinGuo/wiki-public/blob/main/moc/evaluation-and-benchmarks.md) 中的主流基准大多停留在 Level 1/2，Level 3 目前只有极少数样本。

## 实践启示

1. **规则中心任务先建 harness 与判例库，再谈模型升级**：+8.5pt 的地基收益远大于换基座，Harness Engineering 的实践优先级应高于模型迭代。
2. **别用更多推理深度掩盖规则检索失败**：GPT-5 的反向曲线（40.82%→35.44%）说明推理预算与规则覆盖率是两条独立的轴；先测「规则是否被正确检索到」，再调推理深度。
3. **把「逐层应用正确」做成可分解指标**：报告 2/4/6/8/10 位准确率而非单一 Exact Match，才能区分「某一层选错」与「最后一位编码错」这两类故障。
4. **警惕同源错误，不要用投票去救**：Voting@K 在规则任务上近乎无效；失败条款聚类分析（哪些规则反复检索不到）比多数投票更有诊断价值。
5. **长尾类目单列报告并给出统计区间**：整体 49.4% 会掩盖长尾类目不足 25% 的真实风险，发布基准时应同时报告分层准确率与 Bootstrap 95% CI。
6. **跨垂类复用方法论**：医疗（ICD-10）、法律合规、税务审计可直接迁移这套「规则树 + 专家标注」框架，参考 [Agent 评测框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-evaluation-benchmark-frameworks.md)，不必从零设计。

## 链接

- Harness Engineering — Agent Harness 提供 +8.5pt 增益，验证了 Harness 对规则应用的基础作用
- [AINMM 成熟度模型](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ainmm-ai-native-maturity-model.md) — 验证回路依赖规则锚定而非模型自省
- [AI Agent 评测 5 维体系](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-coding-practice-agent-evaluation-five-dimension-three-level-gating.md) — 评测方法论参考
- [评估 Harness 设计](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/evaluation-harness-design.md) — 任务设计与评测方法论

→ [原文存档](https://mp.weixin.qq.com/s/Lec1nRrWVgj50PYR0DxKlg)

## 关联

- 同题异语种孪生页：[阿里荣膺 Acl 2026 最佳资源论文 Hscodecomp 揭开智能体分层规则应用的能力鸿沟](https://github.com/QianJinGuo/wiki-public/blob/main/entities/阿里荣膺-acl-2026-最佳资源论文-hscodecomp-揭开智能体分层规则应用的能力鸿沟.md)（归并候选，提案卡 #11 批1）

---

