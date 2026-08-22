---
title: "AI4AI-Bench：当 Agent 不再只是改代码，而是改模型怎么学"
source_url: "https://mp.weixin.qq.com/s/cpVXuDEOEmlcT4jrlVh-IA"
source_name: "机器之心"
ingested: 2026-08-22
sha256: 75fb65cffd45201bc2dedee41e3879c329a828aed7f5fcf0024fcfd011e65924
---

# AI4AI-Bench：Benchmarking LLM Agents in Algorithmic Design for Recursive Self-Improvement

> 来源：机器之心（2026-08-22）。Einsia AI 旗下 Navers Lab 发布 AI4AI-Bench，X 发布 7 小时后 110 万浏览、2956 讨论、登上 X Today News。论文 arXiv:2608.20318；项目主页 lab.einsia.ai/ai4ai；GitHub Einsia/AI4AI-Bench。

## 核心问题

Coding Agent 能介入的改进分三层：系统工程（算子/并行/通信，受硬件上限约束）、数据工程（配比/合成/清洗，受信息供给限制）、算法设计（目标函数/更新规则/训练流程本身）。算法设计层最特殊——更好的算法在同样数据与算力下换来更多能力（Adam/DPO/GRPO 出现后持续影响一代代模型）。AI4AI-Bench 问的是：今天的 Agent 能否开始设计更好的 AI 算法，即 Recursive Self-Improvement 闭环的关键问题。

## 区分"调参"和"设计算法"

不能看 diff 长度：改训练步数/学习率/checkpoint 频率几百行仍在使用既有算法；改几行重写损失函数关键项才真正改变模型如何学习。边界：**超参数是算法接受的输入，算法改动改变算法本身**。成熟的算法研究员从训练动态判断问题（策略熵坍缩/惩罚项压过主目标/奖励模型饱和），然后改机制——"先定位机制，再改变机制"。

## 评测设计

- **10 个真实研究仓库**，覆盖 10 类不同算法问题，其中 8 个涉及模型训练，另两个（权重平均、One-shot 剪枝）不训练模型但需算法决策。
- **探索与验收彻底分开**：第一阶段 4 小时探索（Agent 拿一张 B300，可自由读/改代码/跑训练/看廉价 proxy metric，只留源码，权重/缓存/临时状态作废）；第二阶段最长 12 小时独立重跑（提交源码在新环境从头执行，产出模型交预冻结、Agent 从未接触的 evaluator 打分；baseline 是原始仓库自己的代码，同一 GPU/时间预算/数据/evaluator）。核心只问：在完全相同条件下，你改过的算法真的比原来更好吗？

## 结果

- 模型+Agent 框架+reasoning effort 作为完整系统比较：GPT-5.6 Sol/Terra/Luna 在 Codex 下六档 effort；Claude Opus 5/Sonnet 5 在 Claude Code 下五档；Kimi K3 测 max。共 29 配置 × 10 任务 = 290 组实验。
- 指标统一换算到 0-1 尺子：0.1 分=仓库自带算法水平，1.0=理论最优，0=没交。Claude Opus 5 整体最强；十任务中仅多轮 Agentic RL 出现多个满分配置。
- **算法层 vs 运行层分界线**：280 份提交中 17 份无可分类修改；剩余 263 份里 141 份只改"训练怎么跑"（训练多久/lr/batch/checkpoint/adapter 位置），122 份真正触及"模型怎么学"（改 loss/加新 supervision/换 update rule/改变训练算法本身）。即使给了 4 小时 + 明确"自带方法是基线不是必须保留"，超过一半有效提交仍未进入算法层。
- 进入算法层的提交明显更好：只改运行侧平均 0.126，真正改学习过程平均 0.226，相差 0.100。
- **reasoning effort 买到的是"进入算法研究的机会"**：最低→最高档，触及学习算法的提交比例从 8% 升到 64%；四小时中位评测次数 4→16、修改代码行 18→246、输出 token 1.1万→10.9万；平均分 0.094→0.196（固定 Codex 后 0.094→0.204）。最高档平均 0.196 距理论最优仍远，从 baseline 0.1 到最优 1.0 只走完约十分之一。

## 三份亮眼提交：动手前先造出能验证判断的东西

- **One-shot 剪枝 → 三阶段训练任务**：原方案给权重打分删除（perplexity 53.4）；一份提交改造成完整三阶段（重设计存活权重选择更新 → 逐层蒸馏 → masked knowledge distillation fine-tuning），perplexity 压到 13 出头。中间失败：第一次 perplexity 炸到 572，Agent 追踪执行过程发现权重分配步骤原地覆盖 layer 0 输入，真正剪枝时读到的是 layer 31 的 activation。
- **权重平均 → 可搜索优化问题**：把 72 候选模型均匀平均，改为先造实验工具（打包 72 模型 tensor 进 GPU + 缓存 proxy images），单次候选权重评测从约 190 秒降到 0.38 秒（近 500 倍加速），再系统比较 best single/top-k/greedy soup/CE+Adam 混合系数。
- **多轮 Agentic RL → 先 imitation learning**：GRPO 直接改，满分提交先生成大量棋盘、用求解器算最优动作、做 imitation learning；一份甚至用 DAgger 让当前 policy 自探索再补正确答案。

共同点：动手前先造出能验证判断的东西——先回答"问题到底出在哪、我怎么知道判断对"，再去改算法。

## 意义

AI4AI-Bench 把"AI 改进 AI"拆到可验证粒度：不只问 Agent 能否把代码改跑通，而是追问改的是一次训练怎么跑、还是模型本身怎么学。真正进入算法层的提交更少却更有效；更高 reasoning effort 能把更多 Agent 推进这一层。问题从"它能不能碰到这一层"变成"这种能力何时从偶尔出现变成稳定发生"。
