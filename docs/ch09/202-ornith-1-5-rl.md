# Ornith-1.5：模型自出题、自搭脚手架、自跑轨迹的编码 RL 闭环

> 📊 Level ⭐⭐⭐⭐ | 6.1KB | `entities/ornith-15-self-play-self-generated-tasks-coding-rl-2026.md`

# Ornith-1.5：模型自出题、自搭脚手架、自跑轨迹的编码 RL 闭环

> 新智元 2026-08-27 报道。Ornith 于 2026-08 一次性放出 397B MoE / 35B-A3B MoE / 9B Dense 三档开放权重，训练流程引入"模型自己生成训练任务 + 自己搭解题脚手架 + 自己跑解题轨迹，三段一起丢进强化学习"的自我出题闭环。

## 核心创新：出题、搭台、解题三段闭环

Ornith-1.0（2026-06）已把 agent 脚手架（AI 解题时的工作台：工具怎么给、任务怎么拆、出错怎么重试）变成可学习的对象——每步强化学习先根据任务和上一轮用过的脚手架改出一版新的，再在这版脚手架上跑解题轨迹，奖励回传两段。

1.5 把"题目从哪来"这一环也接了过去：给定代码库 + 任务类型高层说明 + 模型过去解题记录，系统生成一批新题，专挑比它已做出来的更难一档、戳能力缺口；题目定下后模型再为它生成或改进专属脚手架（指令、工具、拆解策略、编排逻辑）；最后在任务和脚手架双重条件下跑出解题轨迹，奖励从轨迹反向回传全部三段，统一用 GRPO 优化。

## 防"送分题"机制：任务奖励三信号相乘

模型自我出题最大的破绽是"给自己出送分题刷分数"。Ornith 把任务奖励拆成三个信号并**相乘**——任何一项接近零，整道题奖励归零：

- **有效性**：脚手架跑不跑得起来、高置信度正确解能否通过、明显错误解是否被判失败、判分逻辑与任务描述是否对得上。当硬门槛，不合格直接判零，专拦"看着很难其实判不出对错"的废题。
- **前沿难度**：对每道题采样若干条轨迹算出经验成功率，越接近 0.2 目标值奖励越高——"一道好题模型十次应做成两次"。做成八次说明已会没有训练价值；一次都做不成则连一条可学成功轨迹都攒不出。难度靶子随模型能力自动爬升，无需人工调参。
- **新颖性**：权重最低，职责是去冗余、别老出同一道题变体，并非奖励怪题。

整套"自我提升"实质是**课程（curriculum）的自动演进**，且只发生在训练阶段——从 Hugging Face 下载的权重是死的，不会在设备上边干活边改自己。

## 评测成绩与"两把尺子"的严谨辨析

自测 Terminal-Bench 2.1：1.0 为 77.5，1.5 的 397B 跑到 86.1（两个月涨 8.6 个百分点，官方注明取五次独立运行平均值）。但文章重点辨析了自测与官方验证榜的不可比性：

- 官方验证榜（截至 2026-08-19 共 17 项）里**没有 Ornith-1.5**——该项目自测成绩未上官方榜。
- Ornith 表里的 Opus 4.8 为 85.0，是他们用 Terminus-2 框架自己跑的；而官方榜上 Anthropic 提交的 Claude Code + Opus 4.8 经核验是 78.9%（第 5），榜首是 Claude Code + Fable 5 的 83.8%。同一个 Opus 4.8 两张表相差 6.1 分。
- 榜单规则明确"不得修改超时或资源配置"；Ornith 自测配置为 4 小时超时、32 核 CPU、48GB 内存，且"还动了配置，包括官方点名锁死的超时和资源"——项目自测与官方验证榜不能放进同一个排名读。
- 许可证：MIT 标的是权重；GitHub 仓库目前主要是 README/LICENSE/展示素材，未公开 1.5 完整训练实现、训练任务集或可复现评测脚本。"开放权重 ≠ 全套开源"。

## 中小尺寸档位的工程意义

- **35B-A3B MoE**（每 token 激活约 3B）：Terminal-Bench 2.1 跑 67.8，对比 Gemma 4-31B 的 42.1、Muse Glimmer-30B 的 51.7；SWE-bench Verified 79.0 对 52.0。3B 激活打赢 31B 稠密模型，是发布里最划算的一档。
- **9B Dense**（冲端侧）：自测 Terminal-Bench 46.2、SWE-bench Verified 70.6、GPQA Diamond 86.4；HF 5.63GB 压缩版 + 苹果 MLX 格式已放出。但非全面压过 Gemma 4-31B——MCP-Atlas 54.2 对 55.0、Toolathlon-Verified 41.2 对 52.8。"编码和推理能靠训练方法把体量差补回来，工具调用补不回来。"

## 行业意义：开放模型追赶闭源旗舰的第三条路

过去开放模型追赶闭源旗舰基本靠"堆参数 + 抄配方"两条路（照别人的卷子抄答案）。Ornith-1.5 提供第三条路：**自己造题**。高质量智能体训练任务一直是稀缺品，人工整理速度跟不上模型吃题速度。谁能量产好题，谁就握着持续变强的燃料。这也引出开放问题：当出题、搭台、解题都交给模型，人类留在这个闭环里的位置是什么？

## 相关实体与概念

- [阿里 Qwen Skill-SP 自博弈](../ch04/349-skill.html) — 同属 self-play 训练范式
- [SearchMaster 接地自博弈](../ch01/1139-20.html) — 同属自博弈搜索 Agent 训练
- [Agentic RL 框架实践](../ch04/314-agentic-rl.html)
- [GRPO 策略优化](https://github.com/QianJinGuo/wiki/blob/main/concepts/grpo-policy-optimization-2026.md)
- [强化微调 RFT](https://github.com/QianJinGuo/wiki/blob/main/concepts/reinforcement-fine-tuning-rft.md)
- [合成数据生成](https://github.com/QianJinGuo/wiki/blob/main/concepts/synthetic-data-generation.md)
- [RLVR 可验证推理](https://github.com/QianJinGuo/wiki/blob/main/concepts/rlvr-reinforcement-learning-verified-reasoning.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ornith-15-self-play-self-generated-tasks-coding-rl-2026.md)

---
