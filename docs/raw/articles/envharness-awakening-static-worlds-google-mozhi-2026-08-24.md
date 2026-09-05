---
title: "谷歌Agent新作！给环境装一个Harness（附下载）"
source_url: "https://mp.weixin.qq.com/s/k0hbcyPUO9ta_Z_hZTHXKg"
source_name: "模智空间"
author: "小智"
ingested: 2026-08-24
sha256: 4d3af2e18b7b03871758ef1c654a2625b39e39e4e1700c27af749411a7ca1ad4
---

# 谷歌Agent新作！给环境装一个Harness（EnvHarness）

> 来源：模智空间（小智，2026-08-24）。解读 Google《EnvHarness: Awakening Static Worlds for Agent Learning》论文（github.com/google-research/envharness）：给静态训练环境外面包一层可编程 Harness，通过 Stage/Contract/Chain 三种插件组件重塑环境行为，并用 EnvRigger 自动定制，让同一底层环境衍生出无数定制化训练场景。

## 三句话总结

1. **问题：静态训练环境的两大缺陷**：目前所有训练智能体的环境几乎都是人工硬编码的静态产物（任务逻辑/状态转移/成功判定写死）。缺陷一「无法对症下药」：环境不会因智能体弱点设计针对性训练场景；缺陷二「很快被学完」：一旦智能体掌握所有任务解法，环境就不再提供新学习信号。自动生成环境（用 LLM 生成新任务/场景）也有问题：生成流水线领域专属、验证器易出错需大量过滤、生成出来仍是静态环境治标不治本。
2. **EnvHarness 核心思想**：既然能给模型装 Harness（工具调用/记忆/执行循环/技能库），为什么不能给环境装？定制化环境 = 静态环境 + EnvHarness。所有改造发生在环境标准接口层（reset/step），不碰底层代码，因此领域无关（文本游戏/网页浏览/软件工程/办公自动化通用），且原始任务和验证器未被修改，每个改造后的环境安全继承人类精心构建的可信评分机制。三大组件：Stage（改开局/初始状态）、Contract（改交互规则，A轴动作/T轴转移/O轴观察三个维度）、Chain（拼接多任务成复合任务）。
3. **EnvRigger：自动对症下药**：把目标智能体当黑盒，只看行为输出自动生成针对性组件。四阶段闭环：Observe（收集成败轨迹）→ Diagnose（分析弱点根源，决定简化还是加难）→ Write（合成一个或多个组件，如诊断发现不跑测试就提交会生成「预提交钩子 verify-tests 失败」的 Contract）→ Validate（fresh rollouts 验证，接受/拒绝/refine 迭代）。无需模型权重/内部结构，纯靠行为输出，可适配任何模型任何领域。

## 主要事实与细节

- **实验效果（四领域五基准）**：ALFWorld（文本游戏）、WebArena（网页）、SWE-bench Verified（软件工程）、OfficeQA + SpreadsheetBench（办公自动化）。技能学习范式：ALFWorld OOD 提升 9.0 个百分点、平均提升 5.9 分（远超 GenEnv）；WebArena 平均 +3.1（购物子任务 +6.2）；SWE-bench 成功率 +2.7 且平均步骤 -5.4（53.6→49.6）；OfficeQA 精确匹配 +1.8/F1 +1.96；SpreadsheetBench Pass@1 +3.27。反直觉发现：从原始静态环境提取技能有时反而让智能体变差（SpreadsheetBench 原始环境技能不如无技能基线；SWE-bench 原始环境技能让步骤变长）——静态环境只能练习已会做的事，提取技能冗余/次优甚至学进坏习惯。
- **效率提升**：SWE-bench 上 EnvHarness 训练每轮 49.6 步 vs 原始环境 55.0 步、无技能基线 53.6 步——EnvRigger 诊断专针对重复动作循环、冗长观察处理等浪费行为。
- **强化学习**：Qwen3-8B 策略 + GRPO，ALFWorld 分布内成功率 EnvHarness 87.9% vs 原始 81.4%；WebShop 75.6→79.2——改造后环境不只是辅助数据源，而是独立高效的在线优化信号。
- **跨模型通用性**：四个能力等级模型（Gemini 3.1 Flash-Lite 最弱 / Qwen3.6 27B / Gemini 3.5 Flash / Claude Sonnet 4.6 最强），SWE-bench 上 EnvHarness 技能全优于原始环境技能（+2.7 到 +3.7 个百分点），提升幅度与模型基础能力几乎无关。
- **环境扩展（越用越强不触顶）**：相同环境数量预算（50→300）下，原始环境停在 52.1、生成环境停在 50.4，EnvHarness 环境持续上升到 300 个时达 54.8 且仍向上——每批新环境都针对当前智能体能力边界定制，智能体变强环境跟着变难，协同进化。
- **组件可自由组合**：三组件共享同一标准接口，可像乐高自由组合（Stage 藏杯子 + Contract 截断观察 + Chain 追加任务 = 同时训练搜索/部分可观测/长程目标）。注意叠加顺序不可交换（先 Stage 再 Contract ≠ 先 Contract 再 Stage）。
- **局限**：①设计循环成本（每环境需 EnvRigger「提议-执行-修订」迭代，弱设计器需更多轮次、每轮跑 rollout；成本每环境付一次非每训练轮次）；②需要可重置的 reset/step 接口（不适用真实服务如发邮件/下订单，也不适用物理机器人）；③Chain 只能顺序组合（无法表达分支/并行/共享中间状态，无法判断子任务语义相关性）。
- **未来方向**：更多组件类型（注入随机性/部分可观测性/辅助反馈通道/多智能体共享环境）、超越纯文本环境（视觉/GUI/具身）、更丰富 Chain 组合（分支/交错/子任务语义兼容性）。

## 点评（入库评估）

模智空间（解读号，c=5，MemHarness #xxx 同档位）对 Google EnvHarness 论文的详细解读。EnvHarness 全库零覆盖（grep 无命中），内容为对第一方论文的忠实转述，含完整框架（Stage/Contract/Chain + EnvRigger 四阶段闭环）与跨四领域量化结果，非 DUPLICATE。但来源为 c=5 解读号，v=7（丰富新框架 + 量化结果）→ v×c=35 → **Raw only**（35<42 无 entity 可 SUPP；与模智空间解读号档位一致，v 因框架+量化数据较 MemHarness 略高）。
