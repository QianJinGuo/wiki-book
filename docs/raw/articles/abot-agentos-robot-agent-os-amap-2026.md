---
title: "高德 ABot-AgentOS：面向机器人智能体的通用自进化操作系统"
created: 2026-05-01
updated: 2026-07-24
type: raw
tags: [raw, article]
sha256: 8982e44634dae5c212362eb3780ddb78c4464176655d54768999f05c01844ff1
---

# 高德 ABot-AgentOS：面向机器人智能体的通用自进化操作系统

> 原文：[高德ABot-AgentOS：面向机器人智能体的通用自进化操作系统](https://mp.weixin.qq.com/s/cXqC1tiiU7EKFMQQohdJCg)
> 作者：视觉技术中心 · 高德技术
> 日期：2026-07-24
> 归档时间：2026-07-24
> 论文：https://arxiv.org/abs/2607.10350
> 项目主页：https://amap-cvlab.github.io/ABot-AgentOS
> GitHub：https://github.com/amap-cvlab/ABot-AgentOS

---

## ABot-AgentOS：连接大模型与机器人执行的 Agent OS

定位：不是替代底层控制器，也不是训练单一的大一统机器人策略，而是在机器人硬件和低层控制接口之上提供一个通用的智能体操作系统层。将高层认知与底层硬件解耦。

系统架构包括：
- **Edge-Cloud LLM Routing**：在边端低延迟与云端强推理能力之间动态权衡
- **Agent Harness**：组织推理、上下文管理、技能执行、验证和技能演化
- **Skills and Tools Layer**：抽象导航、操作、运动、视觉、对话等机器人能力
- **Multi-modal Memory System**：维护机器人私有记忆与云端可共享公共记忆
- **Robot Hardware Interface**：将高层决策分发到不同机器人本体和控制接口

适配四足机器人、移动机器人、机械臂和人形机器人等。

## Agent Harness：推理、执行与验证闭环

LLM 直接调用工具在具身任务中不够——机器人可能"以为"已完成任务但实际上在原地打转。Agent Harness 将长程任务组织成闭环：

1. **Main LLM**：根据任务、场景观察、上下文和记忆进行高层规划
2. **Skill Runner**：接收子任务，在局部上下文中执行多步技能
3. **Verifier**：对执行进展、技能结果和任务终止条件进行检查
4. 验证反馈再次进入推理过程，帮助系统纠偏、恢复和继续执行

## EmbodiedWorldBench：面向长程具身智能体的可执行评测

由高德联合中科院自动化所和南京大学共同完成。

- 强调完整任务过程，而非单一导航或操作能力
- 覆盖室内、室外和室内外混合环境
- 任务形式：长程导航、区域搜索、物体状态检查、NPC 信息询问、动态事件响应、多阶段任务汇报、跨场景连续执行
- 严格信息隔离：智能体只能访问过滤后的语义地图、可观测反馈和对话事件
- Trace-grounded 评分
- 当前覆盖 **16 个可执行场景、4 个难度等级、200+ 个任务**

## 多模态图记忆与 lifelong self-evolution

**typed, source-grounded multi-modal graph memory** 包括：
- Entity nodes：人物、动物、物体、地点等实体
- Event/session nodes：交互事件和任务会话
- Visual evidence：关键帧、图像证据和视觉线索
- Temporal context：时间信息和事件顺序
- Spatial relations：位置关系和环境上下文
- Provenance：每条记忆的来源和证据链

**Failure-driven lifelong self-evolution**：
- 每个评测 split 完成后分析失败轨迹
- 诊断问题来自 memory writing、evidence selection、frame selection、temporal grounding、entity matching 或 answer composition
- 失败编译为 runtime evo-assets（写入规则、检索偏好、回答校准规则等）
- **split-wise no-leakage 协议**：当前 split 的 evo-assets 只能影响后续 split

## 实验验证

**EmbodiedWorldBench 子集评测**：对比单控制器 ReAct baseline，ABot-AgentOS 在 TSR（Task Success Rate）和 GCR（Goal Completion Rate）均有提升。

**多模态记忆评测**：在 LoCoMo、Mem-Gallery、OpenEQA、EgoLifeQA、NExT-QA 等 benchmark 上，静态图记忆优于或接近 previous SOTA；+ Self-evo 后进一步增益。

## 部署：小模型训练与奖励引擎

四阶段 pipeline：
1. **Text-based embodied environment construction**：将自然语言任务转化为可交互的文本化具身环境
2. **Teacher trajectory distillation**：强教师模型生成包含 reasoning、tool calls、observations、human responses 的交互轨迹
3. **SFT + online RL**：tool-call SFT → online rollout → reward-guided policy optimization
4. **LLM-as-a-Judge reward engine**：turn-level 和 episode-level 奖励信号，结合 skill-specific rubrics、LLM 语义判断和可验证规则检查

Meta-Judge validation + 多智能体 self-evolution 进一步提高奖励信号可靠性。

## 总结

ABot-AgentOS 的核心回答：当机器人拥有越来越强的感知和动作模型后，如何构建支撑长期、可靠、可迁移具身智能的系统架构？——需要一个通用 Agent OS，将推理、技能、上下文、记忆、验证、知识共享和自我演化组织在同一系统框架下。

## References
- 论文：https://arxiv.org/abs/2607.10350
- 项目主页：https://amap-cvlab.github.io/ABot-AgentOS
- GitHub：https://github.com/amap-cvlab/ABot-AgentOS
- 前作：高德 ABot-N1（快慢结合架构统一五大具身导航任务）
- 前作：高德 ABot-M0.5（面向移动操作的统一世界动作模型）
