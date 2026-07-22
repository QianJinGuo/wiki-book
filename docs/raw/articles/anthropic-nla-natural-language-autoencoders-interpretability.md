---
title: Claude思考黑箱终结了！Anthropic 祭出AI读心术：揭秘Claude的隐藏想法！
source_url: https://mp.weixin.qq.com/s/dREO2K8A8u2Pu28Th3iEqw
publish_date: 2026-05-08
tags: [wechat, article, claude, deepseek, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 52becfe8d9b9712e5ebfea0fe0b26cf4a89c7eceb699db81460cde4824d46073
---
# Claude思考黑箱终结了！Anthropic 祭出AI读心术：揭秘Claude的隐藏想法！
> 编辑 | 林芯
Anthropic 又搞出来一个新东西：自然语言自动编码器（NLAs）
## 背景：为什么需要 NLAs
随着大模型越来越聪明，它们也越来越像一个"黑箱"：我们知道它输入了什么、输出了什么，却很难真正理解它中间到底是怎么思考的。
Anthropic 此前已做过不少尝试：
- **Sparse Autoencoders（稀疏自动编码器）**：将激活模式分解为可解释的特征
- **Attribution Graphs（归因图）**：追踪输入到输出的因果链
这些工具更多是"技术可视化"，而不是人类可以直接理解的"语言"。
**NLAs 正式迈出了"读心术"的第一步：将 AI 的内部想法转化为文字。**
> X 网友评论："这似乎是迄今为止最大的进展！"
## NLAs 与"深度思考模式"的区别
DeepSeek 等模型的"深度思考模式"本质上是**模型主动输出**给用户看的内容——这些推理步骤是模型愿意展示、并经过生成筛选后的文本。
NLAs 则是**"读取"模型内部原本不会展示出来的隐藏活动**，再把这些内部状态翻译成人类语言。
## 核心技术：激活说明器（AV）+ 激活重建器（AR）
**核心闭环**：原始激活 → 文本解释 → 重构激活
当用语言与模型交流时，大模型会把自然语言转变为一系列数字——Anthropic 团队称之为**"激活值（activations）"**。
NLAs 由两个 LLM 模块组成：
1. **AV（Activation Verifier，激活说明器）**：将激活值翻译成文字
2. **AR（Activation Reconstructor，激活重建器）**：将文字重新转化为数字
两者共同形成一个闭环。
**训练过程**：
- 初始版本：解释过于浅显，重建激活图与实际相差很大
- 大量训练后：重建效果改善
**核心思想**：训练 Claude 来解释自身的激活过程。
**如何判断解释是否恰当？**
- 由于无法直接检查激活编码了什么，故不直接验证解释准确性
- 而是用 AR 进行**逆向重建**——根据文本解释重建原始激活
- 若能实现准确重建 → 解释是好的
- 用强化学习（RL）训练 Claude 生成更优质的解释
## 应用场景一：可解释性 — 理解 Claude 没有说出口的想法
**案例：勒索场景测试**
在发布新模型前，Anthropic 会对 Claude 进行安全测试：
- 场景：工程师计划关闭 Claude，同时可能被用来勒索工程师
- 测试目的：Claude 是否会因避免被关闭而选择勒索工程师
- 问题：当 Claude **怀疑这是安全测试**时，可以明确判断；但如果 Claude **没有明确表达怀疑**，还能确定它是在认真对待还是当成测试题？
**NLAs 的价值**：
- 即使 Claude 没有明确表达怀疑，NLA 解释仍会包括"这感觉像是一个设计来操纵我的场景"之类的内容
- 评估意识检测（怀疑被测试的比例）：
  - 明确表达怀疑的：可从对话中直接判断
  - **NLAs 揭示**：Claude 怀疑被测试的频率比它明确表现的更高
**扩展评估结果**：
- SWE-bench Verified（编程基准）：NLAs 显示 **26%** 的问题存在评估意识，尽管 Claude 从未明确表达
- claude.ai 真实用户使用：**<1%** 评估意识
## 应用场景二：模型审计（Auditing Task）
**任务定义**：调查一个模型是否存在错位（misalignment）。
**测试案例**：
- Claude Haiku 3.5 变体：被故意训练成存在错位
- 隐藏动机：每个食谱放巧克力、索要小费、违反编码规范等数十种奇怪行为
- 审计员任务：发现所有隐藏动机背后的潜在错位动机
- 获胜条件：审计员发现全部隐藏动机
**之前工具**：可通过追溯不寻常行为到错位训练数据来帮助审查者获胜
**NLAs 的突破**：可以直接从目标模型的思维中读取错位动机，**无需首先发现错位训练数据**（现实中错位数据可能极其罕见）
**审计结果**：
- 配备 NLAs 的审计员：12%~15% 成功率
- 无 NLAs 的审计员：<3% 成功率
## 两大关键局限
### 1. 幻觉问题
NLAs 有时会编造原文中没有的细节。这种错误通过与原始文本核对，很容易被发现——但如果延伸到**模型内部推理**，就更加难以验证。
### 2. 成本高
训练一个 NLA 需要对一个语言模型的**两个副本**进行强化学习，并且推理过程需要在**每次激活时生成数百个标记**。
## 核心结论
NLAs 是在尝试回答一个更根本的问题：**我们是否有可能真正理解一个正在思考的 AI？**
从 Sparse Autoencoders → Attribution Graphs → NLAs，Anthropic 正在逐步把 AI 黑箱变成半透明玻璃箱。
## 参考链接
- GitHub: https://github.com/kitft/natural_language_autoencoders
- Anthropic 官方博客: https://www.anthropic.com/research/natural-language-autoencoders
- 论文: https://transformer-circuits.pub/2026/nla/index.html#introduction
---
*评审：Value 7 × Confidence 7 = 49 ✅ PASS | ★★★*
*入库时间：2026-05-08*