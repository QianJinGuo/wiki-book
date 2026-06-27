# MiniMax M2.7 — 自我进化LLM

## Ch01.724 MiniMax M2.7 — 自我进化LLM

> 📊 Level ⭐⭐ | 4.1KB | `entities/minimax-m2-7.md`

# MiniMax M2.7
> 首个模型深度参与迭代自身的LLM版本，主打自我进化+Agent Teams+专业办公。

## 基本信息
- **发布**: 2026-03-18
- **厂商**: MiniMax稀宇科技
- **官方文章**: https://mp.weixin.qq.com/s/Xfsq8YDP7xkOLzbh1HwdjA

## 核心能力
| 能力 | 亮点 |
|------|------|
| 自我进化 | 模型自主构建Harness并驱动RL训练，100轮迭代+30%效果提升 |
| Agent Teams | 原生多智能体协作，角色边界/对抗性推理/协议遵循内化 |
| 软件工程 | SWE-Pro 56.22%追平GPT-5.3-Codex |
| 专业办公 | GDPval-AA开源最高ELO 1500，Finance建模+PPT/Word/Excel一体化 |
| MLE Bench Lite | 三次平均66.6%得牌率，与Gemini-3.1持平 |

## Benchmark一览
- **SWE-Pro**: 56.22%（追平GPT-5.3-Codex）
- **VIBE-Pro**: 55.6%（接近Opus 4.6）
- **Terminal Bench 2**: 57.0%
- **GDPval-AA ELO**: 1500（开源最高）
- **MM-Claw**: 62.7%（接近Sonnet 4.6）
- **MLE Bench Lite**: 66.6%得牌率（Gemini-3.1水平）

## 自我进化
模型能够：
1. 自行构建复杂Agent Harness
2. 驱动模型自身的强化学习训练迭代
3. 自主迭代Harness（100轮+）
4. 发现有效优化（采样参数、工作流指引、循环检测）

## 深度分析
MiniMax M2.7代表了LLM发展的一条新路径——模型不再只是被训练的对象，而是深度参与自身迭代优化的主体。
**自我进化范式的意义**：传统RL训练依赖人类研究员构建Harness、设计奖励函数、诊断失败原因。M2.7将这一过程自动化——模型自行构建Harness、驱动训练迭代、发现有效优化。100轮自主迭代带来30%的内部评测提升，证明模型对自身"如何学得更好"具备实质性贡献。
**Agent Teams的原生内化**：传统多Agent系统通过提示词约束角色行为，但M2.7将角色边界、对抗性推理、协议遵循内化为原生能力。这意味着Agent间的协作不再依赖外部编排，而是模型自身的内在能力。
**Benchmark格局**：M2.7在编程（SWE-Pro 56.22%追平GPT-5.3-Codex）、专业办公（GDPval-AA ELO 1500开源最高）、Agent能力（MM-Claw 62.7%接近Sonnet 4.6）三个维度同时达到第一梯队，显示出自我进化带来的全面能力提升。

## 实践启示
- **ML团队**：Harness Engineering正在成为新学科——如何设计让模型能自主优化训练过程的脚手架，比单纯调参更具杠杆效应
- **企业用户**：Agent Teams适用于需要多角色协作的复杂业务流程，原生角色边界和对抗性推理可降低多Agent系统的编排复杂度
- **开发者**：SWE-Pro 56.22%的编程能力意味着AI辅助开发进入新阶段，模型不仅能生成代码，还能自主完成调试、修复、提交的完整闭环
- **AI研究者**：M2.7的自我进化机制展示了"模型改进模型"的可能性，100轮自主迭代+30%提升验证了这一方向的可行性

## 关联项目
- **OpenRoom**: https://github.com/MiniMax-AI/OpenRoom — 互动娱乐Agent交互系统

## 与本文相关
- [Openclaw Architecture 800Lines](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/openclaw-architecture-800lines.md) — OpenClaw架构（MM-Claw基准基于此构建）
- [Edgeclaw Openbmb](/ch01-663-edgeclaw-端云两栖龙虾框架/) — EdgeClaw端云两栖（MiniCPM是端侧对比）
- [Gstack Ai Workflow](/ch03-058-gstack-ai协作开发工作流-复杂度棘轮/) — 并行Sprint工作流
-  — 企业级Agent落地对比
- Hermes Agent Deep Dive — Self-Evolution概念对照
- [Minimax M2 7 Self Evolution](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/minimax-m2-7-self-evolution.md) — 详细官方发布（raw）

---

