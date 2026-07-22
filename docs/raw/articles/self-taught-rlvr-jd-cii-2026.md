---
title: 让大模型学会「自己教自己」！京东&中科院信工所连发三篇论文定义Self-TaughtRLVR
source_url: https://mp.weixin.qq.com/s/g46P5l_BM99M6T1U084lTg
author: 大模型智能（来源：量子位）
published: 2026-05-20
type: raw
tags:
  - rlvr
  - self-training
  - post-training
  - distillation
  - multi-expert
  - jd
  - cii
created: 2026-05-20
sha256: 61e4b7160bb0037b549265fd7b67b73d8b571a3ee7af09c3847bf86edb52d607
---
# 让大模型学会「自己教自己」！京东&中科院信工所连发三篇论文定义Self-TaughtRLVR
## 核心命题
Self-Taught RLVR系列研究核心：**如何让大模型自我指导，实现迭代演化？**
三个维度：
1. **RLSD（informed self）**：由特权信息增强的自身来教自己
2. **NPO（temporal self）**：由近未来的自身教自己
3. **CoPD（parallel-self）**：由走另一条路的自身来教自己
## 01 RLSD：让"看见答案的自己"来教自己
**问题**：当我们给同一个模型注入特权信息（参考答案）后，它能不能成为老师来指导自己？
**发现**：之前OPSD（On-Policy Self-Distillation）在极少数据上快速收敛（约20step以内），但很快出现信息泄漏——推理时引用并未真正看到的"参考解"，随后性能逐渐坍塌。
**理论贡献**：证明OPSD的目标函数是ill-posed的，训练目标中存在不可消除的mutual information gap（I(Yt; R | X, Y0)）。KL散度永远降不下去，每一步训练都在把x→r的虚假相关性写进参数里。
**方法**：RLSD给出解耦方案：
- **方向交给RLVR**：环境奖励决定每个token该被强化还是惩罚——可靠但稀疏的信号
- **幅度交给自蒸馏**：用老师/学生的evidence ratio调节每个token的更新力度——密集的token-level信号
**效果**：200步训练超过GRPO 400步水平（Qwen3-VL-8B-Instruct，8个文本/图片/视频benchmark）
## 02 NPO：让"短暂未来后的自己"教自己
**问题**：为RLVR引入什么样的辅助学习信号能带来最大收益？
**核心指标**：有效学习信号S=Q/V——足够强（高Q，有新东西可学）的同时还得足够近（低V，模型容易吸收）。
之前方法的困境：
- 从外部老师导入轨迹：Q高但V太大
- 从经验回放抓自己过去的轨迹：V低但Q被自身历史水平卡死
**核心思想**：用未来的自己来引导当下的自己——比当前更强（同一条优化进程走了若干步）但又离当前足够近的天然teacher。
**实现**：mixed-policy方式，把near-future checkpoint产生的、被验证为正确的trajectory混入当前rollout group。
**AutoNPO**：自动从在线训练信号检测干预时机，自动挑选S最大的guide checkpoint。
**效果**：GRPO平均分57.88→NPO 62.84→AutoNPO 63.15（Qwen3-VL-8B-Instruct，收敛速度和上限同时提升）
## 03 CoPD：让"走另一条路的自己"教自己
**问题**：如何更好地把多个expert的能力吸收到同一个模型上？
**统一效用框架**：任何范式P的实际效用 = a_p×X(D₁,D₂) + b_p
- a_p：信号转化效率
- b_p：额外损失（≤0）
**两条现有路径的问题**：
1. **Mixed-data RLVR**：多能力共享参数，梯度方向冲突→seesaw效应，一个能力涨了另一个就跌（b_p=−Φ）
2. **静态OPD pipeline**：分开训练再蒸馏，a_p远小于1，专家能力传不过去（b_p=0）
**关键假说**：a_p取决于teacher和student的行为重合度——越像，监督信号越容易被吸收。
**实验验证**：
- 实验1：overlap越高，OPD增益越大（r=0.89）
- 实验2：独立RLVR训练过程中overlap单调下降，KL涨了一个数量级——恰好是静态OPD蒸馏的时刻，吸收效率最低
**CoPD方法**：训练中蒸馏而非训练后，多个expert分支互为师生、协同进化
- **RLVR**：在各expert自己的数据上持续推动能力边界
- **Mutual OPD（双向蒸馏）**：各expert branch之间互相做OPD，拉近行为模式，降低后续吸收成本
**效果**：文本+图像+视频三合一，单一模型同时打败各领域独立专家和MOPD基线。
## 资源链接
- RLSD：arxiv.org/abs/2604.03128，GitHub: github.com/iie-ycx/RLSD
- NPO：arxiv.org/abs/2604.20733
- CoPD：arxiv.org/abs/2604.27083