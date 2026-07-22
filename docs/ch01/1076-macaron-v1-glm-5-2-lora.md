# Macaron-V1：基于 GLM-5.2 的混合 LoRA 个人智能体模型

## Ch01.1076 Macaron-V1：基于 GLM-5.2 的混合 LoRA 个人智能体模型

> 📊 Level ⭐⭐ | 3.6KB | `entities/glm-5-2-mixed-lora-200m-context.md`

# Macaron-V1：基于 GLM-5.2 的混合 LoRA 个人智能体模型

## 深度分析

Macaron-V1 是心洲科技旗下前沿实验室 Mind Lab 推出的个人智能体模型系列，包含 **Venti（748B）** 和 **Tall（35B）** 两个版本。Venti 基于 [GLM-5.2](https://github.com/QianJinGuo/wiki/blob/main/entities/z-glm-5.2.md) 基座，采用 **MoL（Mixture of LoRA）** 架构，将基座模型冻住，挂载四个 1B 规模的 LoRA 专家模块，分别负责对话（L0 Chat）、智能体（L1 Agent）、代码（L2 Coding）和界面渲染（L3 UI/A2UI）。这种插件式架构天然支持持续学习，新增能力只需训练新 LoRA 接入即可，不会动摇已有知识体系。

Venti 原生支持 **2M 超长上下文**，这得益于团队自研的 **LongStraw** 训练技术——共享长提示词只计算一次，存为可复用常驻状态，只重放有学习信号的回复分支。官方数据表明，8 张 H20 上可将 Qwen3.6-27B 的 GRPO 训练推到 210 万 token，32 张 H20 上训练 GLM-5.2（78 层 MLA/DSA、256 专家 MoE）全模型同样达到 210 万 token。这一能力使模型能处理极长的智能体交互轨迹。

在训练基础设施方面，Macaron-V1 使用 **MinT** 管理底层训练，Actor 与 Learner 之间只传递 Adapter，配合百万级 Adapter 目录可支撑万亿参数模型，与 [Mind Lab 的 LoRA 持续学习体系](https://github.com/QianJinGuo/wiki/blob/main/entities/mind-lab-lora-continual-learning-system.md) 深度契合。其上运行的 **HyperRSI** 实现递归自我改进闭环：从种子任务生成更难的任务，筛掉低价值样本，对生成轨迹做审计，反复迭代直到收益收敛，再将经验固化为新参数。训练框架 **MindForge** 将 Pi 和 Claude Code 生产环境的 Harness 直接接入强化学习，通过 **HCP 协议** 对齐训练与线上环境的任务信息，保证练用一致。

评测方面，团队自建 **ChatBench**（评估长智能体上下文中的诚实度与边界意识）和 **LivingBench**（跨数周持续互动的纵向评测，含动态噪声与动态用户机制）。同时在 VitaBench、PinchBench（个人生活智能体）、SWE-Verified、DeepSWE、TerminalBench 2.1（编程与终端）和 UI4A-Bench（生成式 UI）等通用基准上与 Opus 4.8、GPT 5.5 等前沿模型对比。官方结论显示，在个人生活和生成式 UI 两条轴线上，Venti 能打平甚至超越前沿基线，编程能力保持在接近前沿的水平，同时保留开源可自托管的优势。

实测中，UI4A 生成式 UI 能力令人印象深刻：输入口语化财务描述后，模型自动提取多笔交易数据，渲染出包含环形图、资产走势折线图、可编辑数据网格的交互式财务控制台，且数据修改后图表能联动更新。Coding 方面，L2 专家成功生成了复杂的 Three.js 机械太阳系仪和 WebGL 水墨山水长卷（含 12 段落、古琴散板音乐合成、严格状态机管理的诗句浮现）。Agent 方面，模型自主探索 FastAPI 仓库，定位了一个长期未解决的多 Query 参数模型 issue，给出修复方案并通过了三千多个现有测试。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/glm-5-2-mixed-lora-200m-context.md)

---

