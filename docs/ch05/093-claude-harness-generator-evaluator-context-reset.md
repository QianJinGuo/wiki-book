# Claude Harness 设计：Generator-Evaluator 架构与 Context Reset 演进

## Ch05.093 Claude Harness 设计：Generator-Evaluator 架构与 Context Reset 演进

> 📊 Level ⭐⭐⭐ | 18.9KB | `entities/harness-generator-evaluator-anthropic.md`

## 概述
Anthropic 工程师 Prithvi Rajasekaran 系统阐述**长时间运行 Agent 应用**中的 Harness 设计方法论。核心贡献：①受 GAN 启发的 Generator-Evaluator 双代理结构解决自我评估偏差；②三代理架构（Planner/Generator/Evaluator）+ sprint contract 实现全栈自主开发；③context reset vs compaction 的取舍决策框架；④Opus 4.5→4.6 演进中 scaffold 简化规律。附 20 分钟/$9（单代理）vs 6 小时/$200（完整 harness）的对照数据。

## 两种失效模式
### Context Anxiety 与 Context Reset
当模型接近自己认为的上下文上限时，会过早开始收尾。**Context reset**（清空上下文窗口、重启新 agent、配合结构化交接文档）可以同时解决上下文焦虑和长任务失焦：

- **reset** = 给模型真正干净的上下文，代价是交接工件必须携带足够状态
- **compaction** = 在原地压缩总结，保留连续性但没有干净起点，上下文焦虑依然存在
- Sonnet 4.5 上下文焦虑严重到仅靠 compaction 无法支撑高质量表现，context reset 是关键
- Opus 4.5 之后这种行为大体消失，可以完全移除 context reset

### 自我评估偏差
Agent 评价自己作品时几乎总是偏正面。Generator-Evaluator 分离是解决这个问题的一根强杠杆——把独立 evaluator 调成"持怀疑态度"远比让 generator 对自己苛刻更现实。

## Generator-Evaluator 架构
### 前端设计实验
四个评分维度（同时写入 generator 和 evaluator 提示词）：
| 维度 | 权重 | 说明 |
|------|------|------|
| **Design quality** | 高 | 统一整体感，颜色/字体/布局/图像构成情绪和身份感 |
| **Originality** | 高 | 拒绝 stock components、"白底卡片+紫色渐变"等 AI 痕迹 |
| **Craft** | 中 | 字体层级、间距、对比度等技术执行 |
| **Functionality** | 中 | 可用性：能否理解界面、找到操作、完成任务 |
Evaluator 接入 Playwright MCP，实际操作页面而非看静态截图，5-15 轮迭代。评分标准措辞本身就在塑造输出气质（如"museum quality"触发特定视觉风格收敛）。

### 全栈三代理架构
```
Planner → Generator ↔ Evaluator
              ↓
         Sprint Contract
        （生成前协商"完成标准"）
```

- **Planner**：输入 1-4 句提示 → 完整产品规格。关注"最终交付什么"而非过早指定实现细节，主动寻找 AI 功能编入规格的机会。
- **Generator**：按 sprint 工作（React/Vite/FastAPI/PostgreSQL），每轮自评后交 QA。
- **Evaluator**：Playwright MCP 操作真实应用，按维度打分（产品深度/功能性/视觉设计/代码质量），每个维度硬性阈值，未达标则 sprint 失败。
- **Sprint Contract**：generator 提出构建计划+验证方式 → evaluator 审查 → 双方迭代至一致。解决产品规格刻意保持高层次时的"最后一公里"问题。
Claude 原生不是好的 QA agent——识别真实问题后会自我说服"不重要"，需反复调优 evaluator 提示词才能收敛。

## 量化对照
### 复古游戏制作器（Opus 4.5）
| Harness | Duration | Cost |
|---------|----------|------|
| 单代理 | 20 分钟 | $9 |
| 完整 harness | 6 小时 | $200 |
单代理问题：布局浪费空间、工作流僵硬、entity 定义与 runtime 连线断开无法响应输入。
Harness 产出：sprite 动画系统、行为模板、AI sprite 生成器、AI 关卡设计器、可分享链接导出，play mode 真正可玩。

### DAW（Opus 4.6，去掉 sprint 结构）
| Agent & Phase | Duration | Cost |
|--------------|----------|------|
| Planner | 4.7 分钟 | $0.46 |
| Build Round 1 | 2h 7min | $71.08 |
| QA Round 1 | 8.8 分钟 | $3.24 |
| Build Round 2 | 1h 2min | $36.89 |
| QA Round 2 | 6.8 分钟 | $3.09 |
| Build Round 3 | 10.9 分钟 | $5.88 |
| QA Round 3 | 9.6 分钟 | $4.06 |
| **Total** | **3h 50min** | **$124.70** |
Generator 无 sprint 拆解连续运行两小时以上（Opus 4.5 做不动的事），但 QA 仍发现功能缺口（录音空壳、clip 无法拖动、效果器非图形化）。

## 迭代原则
> Harness 里的每一个组件，都编码了一个"模型自己做不到什么"的假设——这些假设值得被压力测试，因为它们可能随模型进步而迅速过时。
系统化简化法：**每次只移除一个组件**，观察对最终结果的影响。

- **去掉 sprint**：Opus 4.6 原生能处理任务拆解，但 planner 和 evaluator 仍保留（无 planner → generator 低估 scope；evaluator 在 generator 能力边界附近仍有关键价值）
- **Evaluator 不是固定开关**：只在任务超出模型单独稳定完成范围时才有价值

## 核心洞察
1. **sprint contract** 是产品规格（高层次）和实现目标之间的桥梁
2. **Evaluator skeptic tuning** 需要反复迭代，不能指望开箱即用
3. **随着模型变强，harness 组合空间不会缩小，只会迁移**——旧组件简化，新组件加入
4. Context reset 的核心价值是给模型真正干净的上下文，compaction 无法替代

## 深度分析
### 1. GAN 启发的双代理结构解决的是「自我评估偏差」而非评估准确性
Generator-Evaluator 的核心假设不是「evaluator 比 generator 更懂什么是对的」，而是**generator 天然无法对自己诚实**。Self-evaluation bias 在 LLM 中表现为：模型倾向于解释自己的输出合理化，而非指出缺陷。把评价职责外化给独立 agent，本质是把「运动员」和「裁判」分开——这在人类组织的代码审查中也是经典反模式。GAN 之所以 work，不是因为判别器比生成器更懂图像质量，而是因为两者在对抗中能绕过彼此的盲区。应用到 LLM harness 上，这个架构的洞察在于：**持怀疑态度的外部 evaluator 比让 generator 自我苛刻更现实**。

### 2. Context reset vs compaction 的取舍有一个被低估的非对称性
Compaction 保留了历史连续性，但引入了「上下文污染」——旧的信息被压缩后仍在上下文中干扰模型；Context reset 给了模型真正干净的起点，但代价是**交接文档必须携带完整状态**，且每次 reset 都会引入 token 开销和延迟。当模型出现明显的 context anxiety 行为（如 Opus 4.5 之前的 Sonnet 4.5），compaction 无法解决这个问题，因为焦虑来源于「上下文满了」这个感知，而非实际长度。在模型能力更强的 Opus 4.6 之后，这种行为消失，context reset 的必要性也跟着消失——这说明**harness 组件的保质期高度依赖模型版本**，同一个组件在一个版本是必要的，在下一个版本可能成为负担。

### 3. Sprint Contract 解决的是「产品规格刻意保持高层次」时的「最后一公里」问题
当用户只给出 1-4 句话的模糊指示时，planner 会扩展成详细规格。但在产品规格刻意保持抽象时，generator 不知道「done」的具体标准是什么——这是传统 Agile 中「definition of done」缺失会导致的实现偏差。Sprint contract 在编码前让 generator 提出构建计划 + 验证方式，由 evaluator 审查，双方迭代至一致。这个机制的本质是**把「规格」和「验收标准」的协商提前到每个 sprint 开始之前**，而非事后 QA 发现问题。它解决的不是 planning 问题，而是「即使有规划，实现者和验证者对完成的定义仍然不一致」的结构性问题。

### 4. 四维度评分标准中高权重维度的选择揭示了模型在「审美」上的结构性短板
Design quality 和 Originality 被设为高权重，Craft 和 Functionality 设为中权重。这个选择不是基于「设计比功能重要」，而是基于**模型在哪些维度上天然已经足够好**。Claude 在 Craft（字体层级、间距、对比度等）和 Functionality（可用性检查）上通常已有不错的默认表现，因为这些是技术能力；但在 Design 和 Originality 上，模型倾向于滑向安全可预测的布局——这是「AI slop」的根源。这个权重分配的深层逻辑是：**让 evaluator 成为 generator 的审美上限，而不仅是技术下限的守门员**。

### 5. Harness 组件的「可删除性测试」是判断模型能力边界的系统性方法
每次只移除一个组件、观察对最终结果的影响——这是一个反事实分析框架。当移除 sprint 结构后发现 Opus 4.6 原生能处理任务拆解，说明这个组件在该能力维度上已经过期；但移除 planner 后 generator 低估 scope，移除 evaluator 后 generator 能力边界附近仍有大量可捕捉的问题，说明这两个组件在**更高级的能力维度**上仍有价值。这个方法论的隐含假设是：模型进步不会让整个 harness 设计过时，而是会把能力边界向外推，让部分组件的必要性下降，同时新的能力需求会产生新组件。

## 实践启示
### 1. 当 generator 自我评价偏正面时，优先分离 evaluator 而非调优 generator 的提示词
自我评估偏差不能通过「让 generator 更严格」来解决——这是架构问题，不是提示工程问题。具体操作：在现有单代理 harness 中引入一个独立 evaluator agent，用 few-shot examples 校准其怀疑倾向，先让它在已知问题上验证有效性，再接入完整循环。不需要一开始就把 evaluator 做到完美，它的判断需要随迭代收敛。

### 2. 用四维度评分标准时，先用低权重维度做健康检查，再让高权重维度引导质量收敛
先把 Craft 和 Functionality 作为通过性门槛（低于阈值直接失败），再用 Design quality 和 Originality 作为质量上限的牵引力。具体措辞上，「museum quality」这类表述会触发特定视觉风格的收敛，可以用来定向引导 generator 的审美方向——这是可选的、额外的控制手段，不要一开始就用，给 evaluator 留出自然判断的空间。

### 3. Sprint contract 在每个 sprint 开始前执行，协商内容要具体到「验证方式」而非「实现方式」
Generator 提出构建计划时，evaluator 要审查的是「这个功能怎么验证才算完成」，而不是「这个功能怎么实现才正确」。如果 generator 提出的验证方式是「人工点击测试」，要退回让它改成可自动化验证的方式。这个区别的意义在于：evaluator 评价的是**可观测的结果**，而非代码实现路径——这防止了 generator 通过「用另一种方式实现了相同结果」来绕过验收标准。

### 4. Context reset 的必要性用「模型是否出现上下文焦虑行为」来判断，而非固定周期触发
当模型开始过早收尾或表现出「觉得上下文满了」的行为时，才需要 context reset；不要每 N 轮强制 reset，因为交接工件的状态携带是有代价的。在实现交接文档时，确保文档包含：当前进度、下一步操作、已知的边界情况和已验证不可行的路径。Context reset 后如果 generator 从交接文档恢复的效果不好，首先检查的是文档是否包含足够的状态，而不要立即加回更多 harness 组件。

### 5. 每当新模型版本发布时，用「移除一个组件」的压力测试来重新校准 harness 必要性和过期性
新模型发布后，用单代理 baseline 跑相同任务，对比有/无各组件的表现。先移除 sprint contract，再移除 planner，最后移除 evaluator——按这个顺序测试，因为越核心的组件移除影响越大，应该最后测试。如果移除某组件后质量下降明显，重新加入；如果质量不变，说明该组件对这个版本已经过期，可以简化。这个过程不是一次性的，每逢 major model update 都应该重复一次。

---

## 第 2 来源 — 清华+MSRA STAR-PólyaMath：Reasoner-Verifier-Meta-Strategist 三智能体推理 Harness（2026-06）

> Source: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/star-polya-math-reasoner-verifier-meta-strategist-tsinghua-msra-2026.md)
> Author: 清华大学 T-STAR Lab + 微软亚洲研究院
> Paper: arxiv 2605.19338

清华+微软亚洲研究院提出 STAR-PólyaMath，在 LLM 外部构建完整的探索-推理-验证框架（harness）。核心贡献是 **Meta-Strategist**——具有持久跨尝试记忆的高层监督智能体——以及结构化验证协议。

### 与第 1 来源（Anthropic Generator-Evaluator）的对照

| 维度 | 第 1 来源（Anthropic Generator-Evaluator） | 第 2 来源（STAR-PólyaMath） |
|------|------------------------------------------|----------------------------|
| Agent 角色 | Generator / Evaluator / Planner（三 Agent） | Reasoner / Verifier / **Meta-Strategist**（三 Agent） |
| 对应关系 | Generator ≈ Reasoner, Evaluator ≈ Verifier, **Planner ≈ Meta-Strategist** | 架构收敛信号 |
| 验证粒度 | 整体评分（Design/Originality/Functionality/Quality 四维） | **分层验证标签**：[verified]/[easy-verify]/[hard-verify] |
| 错误恢复 | Context reset / compaction | **Trace-back（回溯）+ Re-plan（重新规划）+ 禁止失败方向** |
| 跨尝试记忆 | 未明确涉及 | **Meta-Strategist 持久单会话**，积累所有失败方向 |
| 自我评估偏差 | 调 evaluator 为"持怀疑态度" | **结构化辩论**：Reasoner 可辩护/修正，Verifier 重新评估 |
| 计算分配 | 未涉及 | **难度相关**：简单问题 8 分钟，难题 55+ 分钟 |
| 开源 | 未公开 | **完全开源**（代码+prompt+skill+配置） |

### 核心创新

1. **Meta-Strategist（元策略智能体）**：不执行具体推理，在高层面给出指导。单一持久会话，积累所有之前尝试、被放弃策略和长期失败模式。可发出强制性指令（如切换到禁止代码的纯推理模式）。

2. **分层验证标签**：每个中间断言标注为 [verified]（代码验证）/ [easy-verify] / [hard-verify]，Verifier 据此调整审查力度。代码验证结果直接可信，纯数学论证接受最严格审查。

3. **结构化辩论**：Reasoner 与 Verifier 之间保留完整会话上下文的双向辩论——Verifier 质疑→Reasoner 辩护/修正→Verifier 重新评估，防止过于保守的 Verifier 错误否决正确论证。

4. **Trace-back + Re-plan 二层恢复**：Trace-back 回退到出错源头（归档错误分支，保留已验证结果），Re-plan 由 Meta-Strategist 判定方向有误时彻底重新开始（将失败方向标定禁止）。

### 关键数据

- Apex 2025：93.75% vs GPT-5.5 80.21%（**+13.5%**，同基座）
- 8 大顶级数学竞赛全部最优，AIME/Putnam/HMMT **满分**
- AIME 平均 8 分钟，100% 在探索阶段解决；Apex/IMO 平均 **55+ 分钟**
- Meta-Strategist 平均每题介入 1.6-2.2 次（只在最难问题时触发）
- 替换基座模型（GPT-5.5→GPT-5.2→Claude Opus 4.7），框架仍超越直接调用
- 混合配置（不同模型做不同 Agent）未能超越统一配置→**性能增益来自 Harness 结构而非模型**
- **消融关键发现**：去掉回溯+重新规划损失最大；Meta-Strategist 无记忆比完全去掉效果更差（无记忆的干预引入无效噪声）；不允许 Reasoner 辩护后 Putnam 从 91.67% 跌至 75%（双向辩论对证明类任务关键）

### 可泛化性

核心机制（长程任务分解为可验证子步骤 + 结构化检验 + 跨尝试记忆 + 高层监督）适用于代码生成（生成-测试-调试循环）和科学发现（假设提出-实验-综合判断）场景。项目已开源完整代码框架、prompt 和 skill 定义。

→ [第2原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/star-polya-math-reasoner-verifier-meta-strategist-tsinghua-msra-2026.md)

## 相关
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-design-long-running-apps.md)
-  — 七环节控制回路 + Generator/Evaluator 框架
- [Agent Harness 上下文管理：工作集视角](ch05/038-agent-harness.md) — compaction 光谱 + session/harness/sandbox 解耦
- [LangChain Anatomy of Agent Harness](ch05/038-agent-harness.md) — Ralph 循环 + 规划/自我验证双闭环

## 相关实体
- [Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南](../ch04/485-claude-managed-agents.md)
- [Ai Agent Harness Construction Akshay Baoyu](../ch01/1006-ai-agent-harness.md)
- [Code As Agent Harness Survey](../ch09/051-code-as-agent-harness.md)
- [Agent Harnesses Are Dead Long Live Agent Harnesses](../ch04/606-agent-harnesses-are-dead-long-live-agent-harnesses.md)
- [Harness 之后 状态边界与失败闭环 若飞](ch05/009-harness.md)
- [Agentscope Java 2.0 Enterprise Distributed Harness](ch05/009-harness.md)
- [Gaode Uplift Model Iteration Agent Long Running Harness](ch05/009-harness.md)
- [Long Running Agent Ralph Loop Harness Takeover](ch05/012-agent-ralph-loop-harness.md)
- [Anthropic Institute When Ai Builds Itself Jiagoux Interpretation](../ch01/833-anthropic.md)
- [Langgraph A2A Adversarial Agent Team](../ch04/196-langgraph.md)

---

