---
source_url: "https://mp.weixin.qq.com/s/uPcxYocLhQLky0uIn_QUow"
ingested: 2026-06-26
sha256: b8eb2a50699834bd
---

# Nature丨Google和FutureHouse同日登刊，把AI科学助理推到科研前线

> **来源**：数据派THU，2026年5月27日
> **论文**：
> - Google Co-Scientist: https://www.nature.com/articles/s41586-026-10644-y
> - FutureHouse Robin: https://www.nature.com/articles/s41586-026-10652-y
> **背景**：2026年5月19日 Nature 同日发表 Google DeepMind Co-Scientist 和 FutureHouse Robin 两项多智能体科研 AI 系统

## 一句话

Nature 2026 同日发表 Google Co-Scientist 和 FutureHouse Robin 两大多智能体科研 AI 系统——前者用结构化假设生成辅助科研，后者更进一步，把文献检索、实验设计、数据分析串成闭环，在药物再定位任务上都取得专家级评审结果。

## Co-Scientist（谷歌 DeepMind）

**底座**：Gemini 2.0，多智能体架构

**核心组件**：
- 生成智能体、反思智能体、排名智能体、进化智能体、元评审智能体
- 集成网络搜索、专用数据库工具
- 允许科学家随时介入、提供反馈或直接输入假设

**关键标准**：合理性、新颖性、可测试性、安全性

**Reflection 工具**：访问科学文献，防止"看似新颖但不合逻辑假设的幻觉"

**生物医学专家盲评**（11个开放问题）：在 novelty、impact、整体偏好上均获最高分

**药物再定位案例**（白血病）：
- 从 2300 种已批准药物中筛选候选 → Binimetinib、Pacritinib、Cerivastatin 等进入实验
- 选中的药物在多种 AML 细胞系中 IC50 极低，对非 AML 细胞系选择性更高
- 自主提出此前未被探索的药物组合，MOLM-13 细胞中验证出强协同效应

## Robin（FutureHouse）

**架构**：Crow + Falcon 做文献搜索与综述，Finch 做实验数据分析

**Finch 特色**：接收湿实验原始数据，在 Jupyter notebook 中自主编写并执行代码，完成从门控策略到差异表达分析的全流程，输出图表和统计结论

**干性年龄相关性黄斑变性（dAMD）案例**：
- Crow 读 551 篇论文，约 30 分钟提炼出 10 个疾病机制
- 提出 30 个候选药物，每个由 Falcon 做综合评估
- 围绕 RPE phagocytosis 提出假设，LLM 评委做两两比较产生排名
- 首轮实验中，Robin 提出的抑制剂已被证实增强吞噬能力
- 主动提议对处理后细胞做 RNA-seq，Finch 自主实验后提出更新的迭代假设

**效率**：分析约 825 篇参考文献仅约 30 分钟，人力估计超过 800 小时

## 关键洞察

**专门设计用于科学文献接口的工具很重要**：
- 用 o4-mini 替换 Crow 后，幻觉引用比例从 0% 飙升到 45%
- OpenAI 研究型工具在所有推荐 Robin 未提出药物的情况下，这些药物对细胞均无影响

**局限性**：
- 成功集中在药物开发中较容易的部分（细胞培养测试）
- 没有到单凭 AI 解决难题的阶段——起效机制、基因表达原因等仍是模型无法解决的疑点
- 大多数药物在动物和临床试验阶段失败，而非细胞培养阶段

## 科学家角色重新定义

未来科学家 → 「首席科学家」：提出根本性问题、设计实验范式边界、做出最终判断与决策

AI → 「超级博士后」：不知疲倦阅读文献、严谨生成和反驳假设、精准分析数据、在迭代中逼近正确答案

## 一句话总结

两大 Nature 论文共同指向一个清晰信号：AI 正在从单点工具进化为科研伙伴——多智能体架构 + 领域专用文献接口 + 闭环实验能力，是下一代科研 AI 的标配。

---

*论文：Nature (2026) | https://www.nature.com/articles/s41586-026-10644-y | https://www.nature.com/articles/s41586-026-10652-y*
