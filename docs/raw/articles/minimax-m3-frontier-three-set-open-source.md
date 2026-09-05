---
source_url: https://mp.weixin.qq.com/s/h5NJdx7WZvMOWJLp6aFc9A
title: "国内首个 Frontier 三件套开源大模型：MiniMax M3 完整技术拆解"
source: "CSDN"
ingested: 2026-06-01
sha256: 5251898a218f0a3cad6377e0bf01b54cfab429eefd28e199a395700f50b667cf
---

# 国内首个 Frontier 三件套开源大模型：MiniMax M3 完整技术拆解

**发布日期：** 2026年6月1日

## 摘要

MiniMax M3 是国内首个同时具备「Coding Frontier + 1M 上下文窗口 + 原生多模态」三个核心能力的开源模型，配套代码智能体 MiniMax Code。SWE-Bench Pro 超过 GPT-5.5 和 Gemini 3.1 Pro，接近 Claude Opus 4.7。Claw-Eval 端到端评测拿到最高分。

## 内容

## 为什么 Frontier Agent 必须同时具备三项能力

单轮问答可以拆分文本/代码/视觉，但 Agent 场景不是：

- 代码仓库结构、依赖关系、历史实现
- README、issue、PR、测试脚本、报错日志
- 用户多轮反馈、方案变更、临时约束
- 论文图表、产品截图、设计稿、表格、桌面界面
- 工具调用轨迹、失败记录、中间产物

Coding、长上下文、多模态不是三个并列卖点，而是**一个系统能力的三个接口**。任何一项短板都会拖垮整体表现。

## MSA：1M 上下文的关键不是窗口，而是注意力计算

长上下文难点：如何在 1M token 下仍然算得动、跑得快、找得准。

标准 Transformer 全注意力让每个 query 关注所有 key，序列长度增长时计算量近似平方级上升。

### MiniMax Sparse Attention（MSA）

三个关键词：

1. **稀疏注意力：** 筛选机制避免全量 token 两两交互
2. **更精确的 KV 分块：** 相比 DSA、MoBA 提高有效上下文覆盖
3. **硬件友好算子：** KV outer gather Q，以 KV 块为外层聚合命中 query，每块 KV 只读一次

官方数据：100 万上下文下，每 token 计算量仅上代的 1/20；prefilling 阶段 >9 倍加速，decoding 阶段 >15 倍加速；算子比 Flash-Sparse-Attention、flash-moba 快 4 倍以上。

**关键洞察：** MiniMax 把长上下文问题同时放在两个层面解决——算法层减少不必要连接，系统层让剩下连接更适合 GPU 执行。

### 稀疏注意力路线对比

从固定稀疏（Longformer、BigBird）→ 动态稀疏（DeepSeek DSA、Moonshot/Kimi MoBA、NSA、SeerAttention）。

MSA 的差异化不在于"稀疏"本身，而在于两个工程化问题：
1. 稀疏之后能不能找准？（KV 分块解决有效覆盖）
2. 找准之后能不能高效算？（KV 外层聚合解决访存效率）

与 DeepSeek DSA、Kimi MoBA 的不同：DSA 强调"选哪些 token/KV"，MoBA 强调"选哪些块"，MSA 把"怎么分块、怎么读块、怎么让 GPU 连续高效算"放到了前台。算子层实现是核心卖点，更接近产业模型真实需求。

### 1M 上下文真正要测什么

等上线后应测：
- Agent 真实使用场景下的工作记忆稳定性
- 跨文件引用、长日志回溯、多轮用户约束的召回准确率

## 原生多模态：统一 token 空间

M3 从 Step 0 做多模态混合训练，支持图片/视频输入，能操作电脑桌面。

与"文本大模型 + 外接视觉编码器"不同，原生多模态让文本、图像、视频进入同一建模过程，不是先成为文本专家再学"看图"。

- **interleaved data：** 文本、图片在同一序列中自然交错
- 训练数据 token 规模提升至 100 万亿量级

**对 Coding Agent 的意义：** 真实开发任务不是纯文本——设计稿截图、控制台截图、论文曲线图、网页录屏、Excel、桌面应用。转 caption 会损失信息。

**ICLR 2025 Outstanding Paper 复现案例：**
- 论文研究大模型微调学习动力学
- M3 自主运行接近 12 小时
- 产出 18 次 commit + 23 张实验图表
- 跑通核心实验：吻合 SFT 预测概率趋势，观测到 DPO squeezing 效应，验证 Extend 缓解方法

## 交互式用户模拟器：Coding 训练范式变化

当前大部分 Coding Benchmark 偏单轮任务（给 issue/需求→一次性修复），与真实开发有距离。

**真实开发是多轮协作：**
1. 用户提出不完整需求
2. Agent 读项目→提方案→执行修改
3. 测试发现新错误
4. 用户补充约束或改变优先级
5. Agent 保留前文状态，重新规划

MiniMax 构建交互式用户模拟器框架，让模型在训练/评测阶段接触生产环境行为模式：需求补充、方案讨论、反馈修正、连续任务切换、复杂项目迭代。

**训练目标变化：** 从"生成正确代码"转向"完成长期协作任务"。

### FP8 GEMM 自主优化案例

- 起点：任务描述 + benchmark 脚本 + 跑不起来的 Triton 骨架，无 reference 高性能实现
- 约 24 小时连续执行：147 次 benchmark 提交、1959 次工具调用
- 6 轮标志性优化：Hopper FP8 硬件峰值利用率 7.6% → 71.3%（9.4× 加速）

### PostTrainBench：自己训练模型

- 接手 4 个只完成预训练的 Base 模型
- 12 小时内自主完成：数据合成→训练→评测→迭代
- 最终得分 0.37（Opus 4.7: 0.42, GPT-5.5: 0.39，领先其余模型）

## MiniMax Code：对标 Claude Code / Codex

专为 M3 设计、与 M3 一起训练的 Agent 产品。

### Token Plan 定价

- Max 套餐 119 元/月 → 18 亿+ token
- Claude Max 100 美元/月 → ~9 亿 token
- 同价位 M3 token 容量约 2 倍
- DeepSeek API：2 元/百万（输入）/ 8 元/百万（输出），M3 均摊成本更低

## 评估成绩

| 基准 | 成绩 |
|------|------|
| SWE-Bench Pro | 超过 GPT-5.5、Gemini 3.1 Pro，接近 Opus 4.7 |
| Claw-Eval（Agent 端到端） | 最高分 |
| PostTrainBench | 0.37 |

官方坦诚：与 Opus 4.7、GPT-5.5 仍存在差距。

## 总结

MSA 回答百万级上下文可用化；原生多模态回答理解真实工作环境；交互式用户模拟器回答从单轮代码生成走向长期协作。三合一线索的定位：能啃百万字代码库、独立复现顶会论文、24 小时自主迭代上千次优化内核的 AI 搭子。

MiniMax M3 把过去属于少数闭源旗舰的 Frontier 能力，第一次完整地、免费地、可部署地交到全球开发者手中。
