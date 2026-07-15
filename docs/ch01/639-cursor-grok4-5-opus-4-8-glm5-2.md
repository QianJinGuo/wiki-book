# Cursor让马斯克的Grok4.5咸鱼翻身，追平Opus 4.8，成本比GLM5.2还低

## Ch01.639 Cursor让马斯克的Grok4.5咸鱼翻身，追平Opus 4.8，成本比GLM5.2还低

> 📊 Level ⭐⭐ | 7.2KB | `entities/cursor让马斯克的grok45咸鱼翻身追平opus-48成本比glm52还低.md`

# Cursor让马斯克的Grok4.5咸鱼翻身，追平Opus 4.8，成本比GLM5.2还低

## 摘要

SpaceXAI（原 xAI）于 2026 年 7 月正式发布 Grok 4.5，这是更名后首款旗舰模型。基于 1.5 万亿参数 V9 基础模型，在数万张 NVIDIA GB300 GPU 上训练，并在 Cursor 注入真实开发者行为数据进行联合训练。在 DeepSWE、SWE Marathon、Terminal Bench、SWE-Bench Pro 等编程基准测试中与 Opus 4.8 互有胜负（三胜两负），输入 2 美元/百万 token、输出 6 美元/百万 token 的价格使其性价比突出。独立评测机构 Artificial Analysis 的 GDPval-AA v2 测试中，Grok 4.5 以 0.49 美元/任务的成本位列全球第四。

## 核心要点

- **Opus 级别性能**：在 DeepSWE 1.0（62.0%）、SWE Marathon（29.0%）、Terminal Bench（83.3%）上击败 Opus 4.8，在 SWE-Bench Pro（64.7%）和 DeepSWE 1.1 上略低于 Opus 4.8，整体三胜两负
- **Cursor 联合训练**：与 Cursor 合作，注入海量真实开发者行为数据——如何定位 bug、跨多文件修改代码、人类如何修正 AI 错误等，解决了 Grok 过去"跑分强、实战弱"的问题
- **极致性价比**：输入 2 美元/百万 token，输出 6 美元/百万 token，GDPval 任务平均仅耗时 0.49 美元，低于 GLM-5.2 和 Kimi K2.6 等国产模型
- **高效的 Token 使用**：同一 SWE-Bench Pro 任务中，Opus 4.8 需 6.7 万 token，Grok 4.5 仅需约 1.6 万 token（约为对方的四分之一）
- **快速输出与长上下文**：输出速度达 80 token/s（此前属于轻量模型的水平），上下文窗口 50 万 token，预计下周升级至 100 万
- **限时免费**：在 Grok Build 和 Cursor 中限时免费开放，Cursor 所有订阅档位均可使用

## 深度分析

### 与 Cursor 联合训练：治好了"跑分强、实战弱"的顽疾

Grok 4.5 最大的技术亮点并非单纯的参数规模扩展，而是与 Cursor 的联合训练策略。通过注入海量真实开发者的行为数据——开发者如何一步步定位 bug、如何跨多文件修改代码、人类如何修正 AI 错误等——模型在软件工程任务上获得了质的提升。这种"数据飞轮"模式使模型不仅学会了正确代码的样子，更学会了如何像人类工程师一样在复杂工程场景中找到问题。

这一策略的有效性在基准测试中得到验证：DeepSWE 1.0 的 62.0%（超过 Opus 4.8 的 55.75%），SWE Marathon 的 29.0%（超过 Opus 4.8 的 26.0%），Terminal Bench 的 83.3%（超过 Opus 4.8 的 78.9%）。特别是在 SWE Marathon——需要跨几十步连续完成的长程工程任务中——Grok 4.5 表现最优，说明训练数据中的工程执行路径确实被模型有效学习了。

### 性价比革命：两重折扣的实际账单效应

Grok 4.5 的定价策略值得深入分析。表面定价（输入 2 美元、输出 6 美元/百万 token）本身已具竞争力，但真正的"折扣"有两层：第一层是直接的价格低于同类模型；第二层是更低 Token 消耗带来的间接成本节省。同一 SWE-Bench Pro 任务中，Grok 4.5 仅需 1.6 万 token 而 Opus 4.8 需要 6.7 万 token，意味着即使两模型定价相同，Grok 的实际账单也仅为 Opus 的约四分之一。

这也解释了为什么 Artificial Analysis 的 GDPval-AA v2 测试中，Grok 4.5 平均任务成本仅 0.49 美元——远低于 GLM-5.2 和 Kimi K2.6。在成本敏感性高的编程场景中，这种"双重折扣"效应可能比基准分数差距更具商业价值。

### 编程基准的全面评估

SpaceXAI 公布的五项编程基准覆盖了软件工程的多个维度：
- **DeepSWE 1.0/1.1**：端到端开发任务，从理解需求到完成代码全程自主执行
- **SWE Marathon**：超长程、多步骤（数十步）、不容重试的持续性工程任务
- **Terminal Bench**：命令行终端独立操作，自主安装环境、运行脚本、修复错误
- **SWE-Bench Pro**：真实开源项目的 bug 修复和需求实现，须通过项目原有测试

五项测试三胜两负的结果表明，Grok 4.5 在编程领域确实达到了 Opus 级别水平。OpenAI 随后发布推文质疑 SWE-Bench Pro 的可靠性，也从侧面说明这些基准正在成为行业竞争的核心战场。

### 算力基础与月更承诺

Grok 4.5 基于 1.5 万亿参数的 V9 基础模型，在数万张 NVIDIA GB300 GPU 上训练。马斯克在发布后预告今年剩下的时间里，SpaceX 每月都将发布一个完全从头训练的新模型。这一"月更"节奏如果兑现，将打破行业以季甚至年为单位的模型发布周期，对 AI 行业竞争格局产生深远影响。

## 实践启示

1. **真实用户行为数据是模型能力提升的关键稀缺资源**：Grok 4.5 与 Cursor 的联合训练表明，在编程领域，真实开发者的行为数据可能比更多的算力和参数规模更具价值。拥有大量活跃用户的平台在模型训练数据上具有结构性优势。

2. **Token 效率和定价同样重要**：在模型能力接近的情况下，较低的 Token 消耗（工程效率）和较低的 Token 单价共同决定了实际使用成本。评估模型时应关注"每任务成本"而非仅关注"每 token 成本"。

3. **编程基准已经成为模型竞争的主战场**：从 SWE-Bench 到 SWE Marathon，编程评测正在从简单的代码生成向全流程工程能力评估演进。能在这些基准上竞争的前沿模型正在重新定义"编程能力"的标准。

4. **月更节奏将重塑模型竞争格局**：如果 SpaceXAI 确实能维持每月发布新模型的节奏，行业竞争将不再是谁的模型最强，而是谁的迭代速度最快、谁能更快地将用户反馈转化为模型改进。

## 相关实体

- [Grok 4.5 模型发布详情](../ch05/086-ai.html)
- [Claude Opus 4.8 系统卡分析](ch01/460-claude.html)
- [Cursor 复盘：模型决定能力上限，Harness 决定生产下限](../ch05/099-harness.html)
- [Cursor Harness 模型生产化实践](ch01/320-cursor-harness-model-production-floor.html)
- [Claude Code Checkup 功能](../ch03/076-claude-code.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cursor让马斯克的grok45咸鱼翻身追平opus-48成本比glm52还低.md)

---

