# Macaron V1 — LoRA即架构：基于GLM-5.2的748B个人模型

## Ch01.1017 Macaron V1 — LoRA即架构：基于GLM-5.2的748B个人模型

> 📊 Level ⭐⭐ | 4.0KB | `entities/macaron-v1-lora-moe-architecture.md`

# Macaron V1 — LoRA即架构：基于GLM-5.2的748B个人模型

## 深度分析

Macaron V1是Mind Lab发布的全球首个基于GLM-5.2完成后训练的个人模型。其总参数量达748B，其中744B的GLM-5.2基座[Glm 52 Is The Step Change For Open Agents](../ch03/046-agent.html)被完全冻结，真正参与训练的是挂载在基座上的四个1B参数的LoRA专家模块。官方将这类架构命名为MoL（Mixture of LoRA），通过路由器将不同请求分发给对应的LoRA专家处理。

LoRA（Low-Rank Adaptation）最初由微软研究院于2021年提出，传统上被视为一种降低微调成本的权宜之计。Mind Lab在《On the Scaling of PEFT》论文中证明，适配模块可以压缩到每层仅保留一个可调方向，参数量降至基座的0.5%以下仍能稳定学习，算力需求仅为全量微调的十分之一。他们将LoRA从一次性微调技术升级为可积累、可管理的正式架构组件，并在MinT平台上建立了包含百万级LoRA目录的管理系统，每个LoRA拥有独立身份和版本历史。

Macaron V1的四个LoRA专家按思维方式划分：L0负责通用聊天、L1负责个人生活中的任务执行、L2负责编程、L3负责UI界面生成。这种分而治之的设计避免了将差异巨大的能力塞进同一组权重导致的相互干扰——编程能力训练过强时聊天表现可能退化。模型提供两个尺寸：748B旗舰版Venti和35B小尺寸版Tall（基于通义千问3.6训练，面向本地部署），采用星巴克杯型命名体系。

在推理侧，Macaron V1配备了UI4A（UI for Agents）能力——模型可实时输出可交互的UI组件并在对话流中渲染，用户可直接拖拽操作。其技术架构兼具HTML的灵活性和结构化协议的可控性，未经微调的基座模型也能驱动，但Macaron的L3专家对此做了针对性优化。配套的Macaron Artifacts插件已在Claude Code插件市场上架。

Macaron V1的训练系统LongStraw将强化学习训练推进到210万token的上下文规模，意味着长上下文不仅用于推理阶段，还能进入训练流程。在评测中，Macaron V1在个人生活类和界面生成类基准上领先或持平前沿模型，编程能力大体低于[Kimi K3 2.8T Open Source Model 2026](ch01/403-kimi.html)、约等于Claude Opus 4.8、高于Qwen3.8。其短板在于复杂视觉编排能力与K3尚存差距，且单轮推理思考链较长，更适合放入Agent环境中使用而非作为秒回型对话模型。

实际测试证明，Macaron V1在4580条/65万字的长上下文理解中表现出色，能精准定位信息并能纠正用户的错误记忆。在Agent模式下，它能自主复现bug、验证问题是否已上游修复后再动手，展现了良好的loop engineering判断力。在游戏化编程测试中，它能将邮轮指南知识直接融入坦克大战的游戏机制（风速变移速、降雨概率变BOSS血量、摆渡船时间变倒计时），并通过程序化验证确保渲染正确。

Mind Lab的LoRA管理体系[Mind Lab Lora Continual Learning System](https://github.com/QianJinGuo/wiki/blob/main/entities/mind-lab-lora-continual-learning-system.md)让LoRA从一次性适配变为可积累的持久状态。基座提供通用能力（共性），适配器承载个人偏好与习惯（个性），新增能力只需插入一个新LoRA，无需改动已有权重。这种架构与越用越懂你的个人模型理念高度契合。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/macaron-v1-lora-moe-architecture.md)

---

