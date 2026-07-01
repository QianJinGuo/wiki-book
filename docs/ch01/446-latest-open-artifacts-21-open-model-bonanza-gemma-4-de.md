# Latest open artifacts (#21): Open model bonanza! Gemma 4, DeepSeek V4, Kimi K2.6, MiMo 2.5, GLM-5.1 & others. On CAISI's V4 assessment.

## Ch01.446 Latest open artifacts (#21): Open model bonanza! Gemma 4, DeepSeek V4, Kimi K2.6, MiMo 2.5, GLM-5.1 & others. On CAISI's V4 assessment.

> 📊 Level ⭐⭐ | 9.0KB | `entities/latest-open-artifacts-21-open-model-bonanza-gemma-4-deepseek.md`

# Latest open artifacts (#21): Open model bonanza! Gemma 4, DeepSeek V4, Kimi K2.6, MiMo 2.5, GLM-5.1 & others. On CAISI's V4 assessment.

> 原文存档：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/latest-open-artifacts-21-open-model-bonanza-gemma-4-deepseek.md)

> **Core insight**: CAISI V4 评估使用 IRT（Item Response Theory）方法论对开放模型进行 Elo 评分，但其结果受限于三个 benchmark 的异常值（CTF-Archive-Diamond、PortBench、ARC-AGI-2），且评估 harness（bash+for-loop）与模型实际训练环境（Claude Code/OpenCode）严重不匹配，导致能力对比系统性失真。Interconnects 两位作者对此持不同观点——Florian 认为开放前沿模型与闭源替代品的真实性能差距更小，Nathan 认为差距更大但基准测试同样不完美。

## CAISI V4 IRT 评估的方法论缺陷

CAISI（Center for AI Standards and Innovation）使用 Item Response Theory 在 9 个不同 benchmark 上计算 Elo 分数，以评估 DeepSeek V4 等开放模型与美国前沿模型的差距。表面上这种 IRT 方法允许跨不同 benchmark 集进行比较，但实际结果显示 DeepSeek V4 在 CTF-Archive-Diamond、PortBench（CAISI 私有 benchmark）和 ARC-AGI-2 上得分异常低——其中 CTF-Archive-Diamond 仅运行了部分 benchmark 并通过 IRT 外推，PortBench 是闭源评估，ARC-AGI-2 的评分方法与公开 leaderboard 不同。这些 benchmark 特定的异常值对总体 Elo 产生了巨大影响，放大了能力差距的感知幅度。

当使用 Epoch AI 的 ECI（Epoch Capability Index）时——同样基于 IRT 和多 benchmark 集合——开放模型与闭源模型的差距缩小至 R1 以来的 3-7 个月，而非 CAISI 报告所显示的更大幅度。两种指标体系给出不同结论的事实本身，就揭示了单一基准数字掩盖了开放-闭源动态中的关键细微差别。

## Harness 选择扭曲能力评估

真正的问题在于标准化评估 setup 与模型实际训练/使用环境之间的系统性错配。编码任务使用 bash 和固定 token 预算的 for-loop 进行评估，而非使用 Claude Code 或 OpenCode 这类模型实际训练时使用的 harness。CAISI 和 ECI 都使用标准化（且过于简单）的 setup 来比较模型能力——ProgBench 基于此方法论声称将应用移植到另一种语言"目前不可能"，而实际上 Bun 已从 Zig 移植到 Rust，涉及 100 万行代码修改。

这意味着前沿模型对比需要使用偏好的 harness 以及模型特定的 prompting，而不仅仅是标准化测试环境。评估框架的选择本身就是一种选择偏见，会系统性地低估在真实使用环境中训练的模型的真实能力。

## 开放模型生态的关键进展

本月 DeepSeek、 Xiaomi、Moonshot、Poolside 等所有开放前沿实验室均发布了新模型。Gemma 4 系列（包括 4B、9B、31B dense 模型和 26B-A4B MoE）最重要的是转向 Apache 2.0 许可证，消除了自定义许可证的法律不确定性。MiMo-2.5-Pro（Apache 2.0）在基准测试和真实使用中都与其他旗舰模型并驾齐驱。Kimi K2.6 专注于长时程任务性能，展现了开放模型能够在数小时内完成复杂任务的能力。DeepSeek-V4-Flash（284B-13B）实际表现优于 Pro（1.6T-A49B MoE），Flash 才是真正值得关注的模型。

## 关键数据/实践启示

- **IRT 方法论局限**：CAISI V4 的 Elo 差异主要由三个 benchmark 异常值驱动，跨 benchmark IRT 外推的有效性存疑
- **Harness 失配**：bash+for-loop 评估 ≠ Claude Code/OpenCode 训练环境，能力评估存在系统性低估
- **ECI vs CAISI**：Epoch AI 的 ECI 显示开放-闭源差距为 3-7 个月，显著小于 CAISI 报告
- **Apache 2.0 转向**：Gemma 4 放弃自定义许可证是开放模型生态的重要里程碑
- **DeepSeek-V4-Flash 优于 Pro**：1.6T MoE 模型反而不如 284B Flash，反映出规模与能力的非线性关系

## 深度分析

### 1. #21 期的模型密集度反映了开源加速趋势
本期标题"Open model bonanza"直接反映了 2026 年 Q2 的开源模型发布密度——Gemma 4、DeepSeek V4 系列等多个旗舰模型同期发布。这种密度在 2025 年是不可想象的，说明开源模型的开发生态正在从"少数玩家"转向"多玩家并行"。

### 2. Gemma 4 的 Google 战略定位
Google 通过 Gemma 系列在开源生态中建立了与 Qwen、DeepSeek 不同的定位——不是最大参数模型，而是"最易部署的高质量小模型"。这与 `Gemma 4 Open Model Adoption Framework Interconnects` 中的采纳框架分析一致。

### 3. 项目反应理论（IRT）在模型评估中的应用
#21 期引入 IRT（Item Response Theory）进行模型评估，这是一个从教育测量学借用的统计框架——不仅看"答对多少题"，还看"题目有多难"和"区分度多高"。这比简单的准确率更公平，因为它校准了题目难度对得分的影响。

### 4. 开源模型的"长尾评测"问题
主流 benchmark（MMLU、GSM8K）被大量模型刷榜后区分度下降，需要更具挑战性的评测来区分前沿模型。IRT 是一个方向，但社区还需要更多"不可刷"的评测（如真实工程任务、多步推理）。

### 5. DeepSeek V4 发布对竞争格局的影响
DeepSeek V4 的发布（如 `Deepseek V4` 所述）重新定义了开源前沿的竞争基准——其他模型需要在 V4 的能力水平上竞争而非 V3。

## 实践启示

### 1. 模型选型：关注 IRT 校准后的得分而非原始准确率
IRT 校准后的得分更能反映模型的真实能力，减少了"简单题目答对=能力强"的偏差。

### 2. 追踪 Interconnects Latest Open Artifacts 系列
这是跟踪开源模型前沿的最佳信源之一，每期包含新模型发布、RAM 追踪和评估方法论更新。

### 3. Gemma 4 适合"易部署"场景
如果部署环境受限（边缘设备、成本敏感），Gemma 4 的尺寸/质量比可能是最佳选择。

### 4. 评估框架：引入 IRT 或类似校准方法
如果你的团队在比较多个模型，使用 IRT 校准可以减少题目难度偏差，得到更公平的比较。

### 5. 关注"不可刷"评测的发展
主流 benchmark 的区分度在下降，关注 LiveCodeBench、SWE-bench 等动态更新的评测，它们更能反映模型的真实能力。

## 相关实体
- [Latest Open Artifacts 19 Qwen Glm Minimax Interconnects](https://github.com/QianJinGuo/wiki/blob/main/entities/latest-open-artifacts-19-qwen-glm-minimax-interconnects.md)
- [Interconnects Latest Open Artifacts 20 New Orgs New Types Of Models With Nemotron Super Sarvam](ch01/214-latest-open-artifacts-20-new-orgs-new-types-of-models.md)
- [Reading Todays Open Closed Performance Gap](https://github.com/QianJinGuo/wiki/blob/main/entities/reading-todays-open-closed-performance-gap.md)
- [How Open Model Ecosystems Compound](ch01/677-how-open-model-ecosystems-compound.md)
- [Wetesteddeepseekv4Proandflashagainstclau](ch04/150-ai.md)

## 相关引用
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/latest-open-artifacts-21-open-model-bonanza-gemma-4-deepseek.md)

---

