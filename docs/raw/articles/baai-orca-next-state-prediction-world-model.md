---
source_url: "https://mp.weixin.qq.com/s/7f74lbQq2MPZKHumH2cCPw"
source_title: "别让AI一上来就'进厂打螺丝'：智源悟界·Orca要先教模型理解世界如何变化"
source_author: "允中"
source_publisher: "量子位 (QbitAI)"
ingested: 2026-07-08
sha256: "fde9bd2e34bab8a4f620b7dee539d8629e817b4707ab5fea76862bcbfdad6da0"
type: raw-source
status: ingested
tags: [world-model, baai, orca, next-state-prediction, robobrain, state-representation, foundation-model]
---

# 别让AI一上来就"进厂打螺丝"：智源悟界·Orca要先教模型理解世界如何变化

> 智源研究院（BAAI）悟界·RoboBrain Orca Team 发布技术报告 Orca: The World is in Your Mind。
> 项目主页：https://orca-wm.github.io
> 技术报告：https://arxiv.org/abs/2606.30534

## 核心理念：Next-State Prediction

Orca 不追求更会聊天、不追求视觉真实感、不局限于机器人动作。它走一条更基础的路线：**先让模型学习统一的世界状态表征，再从这个表征中读出理解、预测和行动能力。**

核心哲学：**The World is in Your Mind。**

类比："我们不会让一个3岁小孩进工厂，打10万小时螺丝。"——先理解世界如何变化，再去做具体任务。

## 两类互补学习方式

### 无意识学习（Unconscious Learning）
模型从连续视频中学习自然、稠密的状态变化，不依赖显式语言标注。例如物体如何移动、手与物体如何接触、场景如何随时间演化。

### 有意识学习（Conscious Learning）
引入语言和事件，让状态转移受语义条件约束。语言描述事件/任务意图/目标状态，模型从当前观察和语言条件之间学习有意义的状态变化。

两类学习共同构造 **world latent**——能表达世界状态并支持状态转移建模的统一表征。

## 数据规模

自动化筛选标注管线构建了 **12.5 万小时视频、1.6 亿条事件标注、1150 万条 VQA**。覆盖第一视角交互、第三视角物体操作、机器人执行视频、自然动态场景、事件级状态转移和通用视觉问答。

## 基础设施优化：FlagScale 4.4× 加速

基于自研 FlagScale 框架：
- **FSDP2 升级**：灵活分片，轻量视觉块取消分片
- **分块交叉熵损失**：避免完整 Logits 张量实例化
- **前向/后向预取**：All-Gather 通信与计算重叠

H100 集群上训练吞吐量从 0.66 → **2.91 Samples/Sec/GPU（4.4× 加速）**。

## One for All：三类 Readout

冻结 Orca backbone，只训练轻量 readout 模块：

| Readout | 验证能力 | 关键结果 |
|---------|---------|---------|
| **文本读出** | 世界表征→理解推理 | 4B 规模多项综合评测更高，尤其状态转移/事件演化维度 |
| **图像读出** | 当前状态+条件→未来视觉状态 | 保持机器人形态/物体布局/场景一致性，尊重物理约束 |
| **动作读出** | 世界表征→真实机器人控制 | 预训练无 action label，200 条轨迹后训练即有效 |

> 预训练阶段没有使用带 action label 的机器人轨迹，但在下游动作任务中，冻结 backbone 接入 DiT-style Action Expert，仅用 200 条域内轨迹后训练即获明显增益。**本质：Orca 学的是世界状态变化，不是记住动作。**

## 关键发现

- **Scaling 有效**：预训练数据增加，文本/图像/动作 readout 同步提升
- **消融实验**：三类训练目标（无意识状态转移、有意识事件转移、VQA 语言监督）各自承担不同作用，缺一不可
- **对比均来自于同一套预训练主干 ckpt，未使用刷榜数据**
