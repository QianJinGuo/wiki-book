# LLM 主题 = 生成变量 — 别把 LLM 提取的主题当成真实变量（William Gieng 因果推断方法论）

## Ch01.230 LLM 主题 = 生成变量 — 别把 LLM 提取的主题当成真实变量（William Gieng 因果推断方法论）

> 📊 Level ⭐⭐ | 22.3KB | `entities/llm-themes-not-observations-causal-inference-william-gieng-2026.md`

## 概述

**"生成变量"（Generated Variable）** 是 LLM 时代因果推断方法论的核心议题。William Gieng 在 2026-06 通过 Towards Data Science 发表《LLM Themes Are Not Observations》，指出 **LLM 从文本提取的主题标签不应被直接视为客户属性的观测值**——它继承了**文本产生机制、模型提取过程和样本选择机制**中的隐含假设。一旦把 NULL 填成 0 或"未提及问题"或 IPW，**就会引入选择偏差、时序偏差、测量误差、变量角色误判四类错误**。**错误地控制干预后生成的文本主题，甚至可能导致干预效应方向被反向估计**（真实 −0.50 → 朴素 +0.12）。

## 核心论点

> **别把 LLM 提取的主题当成观测值**。给因果分析从业者的提醒：**警惕"生成变量"**。

**LLM 输出的是带选择机制的模型输出，不是直接观测**——链条中的每一步（文本生成、模型识别、样本选择）都会影响该变量在下游因果模型中的含义，**而这些影响大多不会出现在拼接后的表格里**。 ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]

## 经典反例：客服"账单不满"主题

### 危险工作流

1. 分析师把 LLM 从客服通话语料中抽取的主题与客户数据表合并 ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
2. **没有通话转录的客户被记为 NULL** ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
3. NULL 被填成 0 / "未提及问题" / 参照类别省略 ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
4. 回归结果"清晰"——"账单不满"系数显著，符号正合预期 ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
5. **没有人问这个变量到底从哪里来的** ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]

> **一行预干预代码，整条数据流程把"没有致电客服"转换成了"没有对账单不满"**。

## NULL 干预的 4 类常见错误

### 1. 选择偏差

**主题出现是因为客户打了电话、提出投诉、发了帖子**——这种行为很可能与干预 / 结果变量相关。 ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]

> NULL 填充把"**没有生成文本**"折叠进参照类别。于是分析估计的就不再是**整个客户群体**上的效应，而是**被预干预重新定义过的人群**上的效应。

### 2. 时序问题

| 文本类型 | 因果作用 | 风险 |
|---------|---------|------|
| **干预前文本** | **潜在混杂因素** | 客户 1 月致电 → 3 月发留存优惠 |
| **同期文本** | **不能当协变量** | 干预本身就是来自客户留存专员的电话，主题来自同一通电话——**以该主题为条件会消除部分效果** |
| **干预后文本** | **最危险** | 客户 3 月收到优惠 → 4 月打电话投诉。对其条件化 = 对干预后变量条件化，**可能阻断中介路径、诱发关联碰撞** |

### 3. 测量问题

> **"账单不满"这个标签本身并非对账单不满**——它只是流程在文本中识别出的**看起来像账单不满的语言表达**。
> ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
> **标签噪声并不与研究对象无关**。

### 4. 变量作用

> **答案由因果有向无环图（DAG）决定，而不是由列名决定**。
> ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
> 一个变量在某种作用下可能方法论上成立，**换到另一种作用下却会成为偏差来源**。

## 案例：bill_shock 主题导致符号反转

### 模拟场景

**业务逻辑**：企业根据价格敏感度模型定向发放留存优惠。 ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
- 优惠分配和客户流失**都受潜在价格敏感度影响**（不可观测）
- 价格敏感客户：越可能收到优惠 + 越可能流失 + **越可能致电表达对账单的冲击**
- "**账单冲击 (bill_shock)**" 主题正是从这些**干预后**通话中生成

### 4 种模型设定的 4 个答案

| 模型设定 | 优惠系数 | 结论 |
|---------|---------|------|
| **朴素模型（含 bill-shock）** | **+0.12** | 优惠看似**增加**流失 |
| **删除变量（不含 bill-shock）** | +0.24 | 优惠仍看似**增加**流失 |
| **理想模型（含 price_sens）** | **−0.55** | 优惠**减少**流失 |
| **真实效应（数据生成过程）** | **−0.50** | 优惠**减少**流失 |

### 符号反转的机制

> **客户流失会影响客户致电的可能性**（即将离开的客户更可能致电）。
> **账单冲击只对已来电的客户才可观察到**（需要通话记录）。
> ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
> 因此，**对 bill-shock 条件化 = 对流失的下游后果进行条件化**。
> ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
> 在 `bill_shock = 1` 的客户中，**优惠与价格敏感度之间的关系已经被扭曲**——这两个变量现在都参与解释了客户为什么最终被打上这个标签。
> ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
> **优惠系数吸收的正是这种被诱导出来的关联**。

## 选择问题的 3 种处理假设

| 做法 | 假设 | 问题 |
|------|------|------|
| **把 NULL 填成 0 / "未提及问题"** | 未生成文本表明不存在潜在问题 | **没有打电话的客户也可能经历过账单不满**——他们通过取消服务 / 转向竞争对手 / 社交媒体抱怨 / 干脆放弃来解决 |
| **删除 NULL 所在的行** | 限制在致电的子人群中 | "致电客户的干预效应" ≠ "全体客户的干预效应"——**这正是业务问题的核心** |
| **IPW（逆概率加权）** | 基于来电者模型加权 | 对文本生成者建模需要**来电驱动因素**，而该模型取决于**人口统计 + 客户年限 + 既往问题 + 干预暴露 + 不可测的冲击**——**这正是该主题最初旨在帮助测量的概念** |

### 更深层次问题

> **文本选择行为会与干预方式相互作用**。例如：
> - 留存优惠可能**改变通话频率**
> - 价格调整可能**改变投诉率**
> - 新功能发布可能**改变客户提出的问题类型**
> ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
> **选择机制本身依赖于干预方式**——**即使是完美提取、时机恰当的主题，其测量对象也是随着干预方式而变化的群体**。
> ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
> **标准的观测校正假设选择机制是稳定的。当干预方式改变选择时，这些校正方法就失效了**。

## 测量问题：差异性测量误差

### LLM 输出的"不显嘈杂"是隐患

- **旧式 NLP（TF-IDF / LDA）输出看起来很嘈杂**，从业者本能不信任，**这种本能避免了许多错误的分析**
- **LLM 输出看起来像潜在构念**——"账单不满""信任侵蚀""续约焦虑"读起来像在描述客户的心理状态
- **说服问题在统计问题出现之前就已经存在了**

### 差异性测量误差才是真正造成损害的地方

> **如果一项干预措施改变了客户的表达方式**（大多数值得实施的干预措施都会如此），**那么分类器在主题检测方面的准确率在干预组和对照组之间可能会有所不同**。
> ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
> 例如，**一项旨在缓和客户情绪的挽留优惠可能会降低模型对"账单冲击"等措辞的标记率，但并不能降低客户潜在的不满情绪**。
> ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
> **标签噪声不再是均值为零**——**它与干预措施相关**，**基于噪声标签进行条件化会使估计的干预效果产生偏差，分析师很难确定其方向**。

### 相关文献

| 作者 | 主题 | 方法 |
|------|------|------|
| **Egami 等** | 《How to Make Causal Inferences Using Texts》 | **分割样本工作流**——为把文本发现的测量作为干预或结果的因果推断 |
| **Mozer 等** | 文本增强匹配 | 在**电子健康记录**真实医学研究中展示文本协变量如何改变估计效应 |
| **Keith、Jensen、O'Connor** | 《Text and Causal Inference》 | 综述文本在**消除因果估计混杂**方面的应用 |

> 这些方法确实存在，**在分析结果重要时也值得使用**。但它们首先要求分析师承认：**标签是一种带有误差的测量**。**而这一步，恰恰是多数工作流跳过的**。

## 5 问诊断清单

使用从文本记录中生成的变量进行的因果分析仍然合理。它只需要在回归分析运行之前回答**五个问题**： ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]

| # | 问题 | 核心判断 |
|---|------|----------|
| **1** | **我假设这个变量起什么作用？** | 它是混杂因素 / 中介变量 / 干预变量 / 结果变量 / 描述性特征？**由 DAG 决定，不由列名决定** |
| **2** | **文本相对于干预措施，是在什么时候生成的？** | 干预前 / 同期 / 干预后？**如果分析师无法从数据中回答这个问题，该变量就不应作为混杂因素进入模型** |
| **3** | **文本是由什么选择机制生成的？对于没有文本的人，我做了什么假设？** | 零填充 / 删除 / IPW：**每一种都是假设**。请选择其中一种并加以说明 |
| **4** | **标签是如何产生的？它的可靠性是否可能在不同干预组之间不同？** | 如果干预措施有可能改变顾客表达潜在结构的方式，**那么分类器准确率在本次比较中就不恒定为常数** |
| **5** | **压力测试下，结果怎么样？** | **去掉从通话记录中派生的变量，重新拟合模型**。如果核心系数因此出现明显变动，**说明结果还不够稳健** |

> 这五个问题不是解决方案，而是一套**诊断工具**。
> ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
> **能回答这些问题的分析师，并不能保证一定能得到一个可识别的因果效应**。
> ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
> **而无法回答这些问题的分析师，做的不过是描述性工作，只是在外面包了一层因果推断的语言外壳**。

## "生成变量" 的更广泛模式

> **这种更广泛的模式，比 LLM 的出现要早得多**。
> ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
> **生成变量是流水线的输出，看起来像观测值，实际上却是以选择机制为条件的模型输出**。
> ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
> 它们出现在：
> - **欺诈评分**
> - **推荐系统的相关性指标**
> - **情感指数**
> - **被重用为协变量的倾向性评分**
> - 一切由上游模型产生、被下游分析消费的潜在特质估计
> ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
> **LLM 没有发明这个错误，它们只是以旧时 NLP 输出从未达到的规模和流畅度，把这个错误变得触手可及**。
> ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
> 标签看起来像潜在构念，数据列看起来像测量值，**整个工作流看起来像因果推断**。
> ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
> **假设并没有消失。它们只是被移到了上游**。

## 关键术语

- **生成变量（Generated Variable）**：由流水线产生的测量值，**以客户先做了能留下文本痕迹的事为条件** + 以这段痕迹能被模型识别为条件
- **NULL 干预（NULL Intervention）**：把缺失值填成 0 / "未提及问题" / 删除 / IPW 的决策
- **干预后偏差（Post-Treatment Bias）**：对干预后生成的变量做条件化引发的偏差
- **差异性测量误差（Differential Measurement Error）**：分类器准确率在不同干预组之间不同时的测量误差
- **分割样本工作流（Split-Sample Workflow）**：Egami 等提出的文本测量因果推断工作流
- **文本增强匹配（Text-Augmented Matching）**：Mozer 等将文本协变量用于因果匹配

## 深度分析

### 1. "生成变量" 是 LLM 时代的方法论命题

文章把问题从"LLM 准确性"提升到"**变量生成机制**"的方法论层次。**这是少有的从因果推断 / 统计学方法论角度切入 LLM 应用风险的文章**——大多数 LLM 风险讨论集中在 hallucination / bias / prompt injection 层面，而本文指向**更深层的方法论问题**：**当变量本身就是模型输出时，传统统计推断的独立性假设不再成立**。 ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]

### 2. 符号反转案例的可重现性 = 文章的力量

Python 案例使用 `numpy.default_rng(7)` + 4 个 logistic 方程，可重现且**展示了 4 个截然不同的估计值**。这种**可重现的"反直觉案例"**是统计学方法论文章的核心说服力——读者可以自己跑代码验证。 ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]

**关键洞察**：剔除错误控制变量虽然必要，但**并不充分**。**在不可观测混杂存在时，单纯移除可见偏差不会让设计变得有效**——这只是**减少一个扭曲来源**。 ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]

### 3. 干预后偏差（Post-Treatment Bias）在 LLM 时代被放大

经典统计学对"post-treatment variable conditioning"已有警示（Pearl / Gelman / Imbens），但**LLM 让"干预后变量"变得更隐蔽**： ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]

- **人工分析时代**：分析师手工提取主题，对文本生成时间更敏感
- **LLM 时代**：模型自动生成主题 + 主题看起来像"潜在构念" + 错误模式不直接暴露在表格里

> **说服问题在统计问题出现之前就已经存在了**。

### 4. 5 问诊断清单的本质：DAG 思维的具体化

5 个问题不是技术工具，而是**DAG 思维的工程化**： ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]

1. 变量在 DAG 什么位置？（混杂 / 中介 / 干预 / 结果 / 描述） ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
2. 时序（pre / concurrent / post） ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
3. 选择机制（NULL 假设的明示） ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
4. 测量可靠性（跨组一致性） ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
5. 稳健性（去掉该变量后核心系数是否变化） ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]

> **DAG 决定变量的方法论作用，不由列名决定**。

### 5. "假设没有消失，只是被移到上游" 是 LLM 时代的方法论警示

> **假设并没有消失。它们只是被移到了上游**。

这句总结指向 LLM 时代数据科学的核心问题：**当分析师把"数据列"当成"客户状态读数"使用时，假设从分析层被推到了提取层——而提取层往往缺乏方法论审视**。这是 LLM 在数据分析中带来的**最隐蔽的方法论风险**。 ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]

## 实践启示

### 何时使用 LLM 主题做因果分析

- **需要 LLM 主题作为协变量 / 混杂因素**时（前提是文本是干预前生成）
- 接受**每种 NULL 处理都是假设**并明示
- 有**鲁棒性检查**（去掉该变量后核心系数变化幅度）
- 接受**测量误差的差异性**（不同干预组分类器准确率不同）

### 落地路径

1. **第一步**：识别每个文本主题的生成时间（pre / concurrent / post） ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
2. **第二步**：在 DAG 中标注主题位置（混杂 / 中介 / 干预 / 结果 / 描述） ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
3. **第三步**：选择并明示 NULL 处理策略（零填充 / 删除 / IPW） ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
4. **第四步**：评估分类器在干预组 vs 对照组的准确率差异 ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
5. **第五步**：跑压力测试（去掉主题变量后看核心系数变化） ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]
6. **第六步**：如有必要，参考 Egami / Mozer / Keith 的文本因果推断方法 ^["[别把 LLM 提取的主题当成真实变量 — 数据派 THU 翻译](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)"]

### 反模式清单

| 反模式 | 问题 |
|--------|------|
| 把 NULL 填成 0 不加说明 | **引入选择偏差** |
| 主题放进回归右边做"控制"而不检查 DAG 位置 | **可能控制中介 / 结果变量，扭曲效应** |
| 干预后文本当成干预前 | **干预后偏差** |
| 接受 LLM 主题的"潜在构念"语感 | **测量误差被低估** |
| 不做压力测试 | **核心结论可能依赖一个错误控制变量** |
| 假设 IPW 能完全校正 | **IPW 的倾向模型本身依赖文本生成者模型** |

## 相关实体

- [Video Rag Chunking Strategy](ch01/1004-rag.html)（文本 + AI 同源 — 视频 RAG 切片策略）
- [2 Year 25 Ai Projects Summary](ch01/1079-5-ai.html)（2 年 25 个 AI 项目总结 — 失败案例对照）
- [Loss Function Development Elvis Sun Goal Loop 2026](ch01/886-20.html)（LFD 强制熵同源 — 都是"系统化检查"思维）
- [State Of Memory In Agent Harness Mem0 2026](../ch05/039-agent-harness.html)（Agent 记忆体系 — 类似"看起来像观测但实际是生成"）
- [Recent Developments In Llm Architectures Jiqizhixin](ch01/880-llm.html)（LLM 架构最新进展 — 同主题）
- [2 Year 25 Ai Projects Summary](ch01/1079-5-ai.html)（2 年 25 个 AI 项目 — 失败方法论对照）
- [While Breathless In Stodgy Viridian](ch01/534-while-breathless-in-stodgy-viridian.html)（对 LLM 局限的反思同源）

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-themes-not-observations-william-gieng-causal-inference-2026.md)

---

