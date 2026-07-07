# Yann LeCun 谈 LLM 不是智能与世界模型 JEPA

## Ch01.431 Yann LeCun 谈 LLM 不是智能与世界模型 JEPA

> 📊 Level ⭐⭐ | 10.6KB | `entities/yann-lecun-llm-not-intelligence-jepa.md`

# Yann LeCun 谈 LLM 不是智能与世界模型 JEPA

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/yann-lecun-llm-not-intelligence-jepa.md)

## 摘要

Yann LeCun（杨立昆）2026 年关于 LLM 本质局限性的核心论述：LLM 只是"会思考的系统的接口"，真正的智能需要世界模型——能预测后果、能规划、能模拟现实的系统。LeCun 提出的替代方案是 **JEPA**（Joint Embedding Predictive Architecture，联合嵌入预测架构），通过预测抽象状态而非像素，绕过物理世界不可压缩噪声的难题。

## 核心要点

- **核心论点**：LLM 只是一个接口，而不是智能本身。语言将会成为一个会思考的系统的接口，真正的核心是世界模型。
- **关键计算**：四岁孩子醒着累计约 16000 小时，视神经每秒传输约 1 字节/纤维 × 100 万根纤维，四岁前视觉原始信息量约 10^14 字节——与现代主流 LLM 预训练语料量级相同。
- **LLM 智能标准缺失**：一个系统想要表现出智能，必须能预测自己行动的后果。LLM 做不到——只产出 token，不做世界状态预测；没有"如果我这样做，会发生什么"的内部模拟；积累的是陈述性知识，不是对世界的理解。
- **LLM 有效领域**：编程和数学——符号操作本身就是推理的基础，"预测下一个符号"和"理解逻辑"有重叠。但永远达不到需要常识推理和日常规划的问题。
- **JEPA 核心思路**：不预测像素，学会预测抽象状态；把不可预测的细节、噪声、随机性从表示中去掉，只保留和规划相关的东西。
- **AMI 实验室**：Zetta Ventures 投资组合公司，方向是真实世界 AI——工业过程控制、自动化、可穿戴设备、机器人、医疗健康。
- **机器人的两道墙**：第一道墙是数据（远程操控数据质量最高但无法并行、互联网视频没有动作标签），第二道墙是机体锁定（观察直接映射到动作，把知识锁在特定身体层面）。
- **架构翻转**：大多数人认为 LLM 是核心、其他是插件；LeCun 认为世界模型是核心，LLM 只是接口。

## 深度分析

### 四岁孩子 vs LLM：训练数据量的反差

LeCun 给出的关键计算 揭示了一个被 LLM 行业普遍忽视的事实：**现代主流 LLM 的预训练语料量级（约 10^14 字节）和四岁孩子仅通过视觉一个通道吸收的信息量是同一量级**。但 LLM 远不如四岁孩子智能——这说明"训练数据量"不是智能的决定因素，"训练数据的内容结构"才是。LLM 用 10^14 字节的文本学到了语言模式；四岁孩子用 10^14 字节的视觉信息学到了物理规律、物体恒存性、因果关系、空间推理。后者的"信息密度"远高于前者，因为视觉信息编码了完整的物理世界状态。

### LLM 为什么不是智能：根本性的架构缺陷

LeCun 的智能标准 可以归结为三个判断：
- **只产出 token，不做世界状态预测**——LLM 的输出是符号序列，不是对物理世界的模拟
- **没有"如果我这样做，会发生什么"的内部模拟**——LLM 没有反事实推理能力，无法回答"假设性问题"
- **积累的是陈述性知识，不是对世界的理解**——LLM 知道"水在 100°C 沸腾"，但不知道"为什么"

这个判断对 Agent 系统的设计有深远影响：如果 LLM 本身不具备世界模型，那么构建在 LLM 之上的 Agent 系统的智能上限就是 LLM 的智能上限——**Agent 系统无法从架构层面弥补 LLM 的世界模型缺失**。这就是为什么 LeCun 说"我们靠着训练文本，永远不可能到达人类级别的 AI"。

### 生成式架构的十年失败

LeCun 的替代方案做了超过 15 年，前 10 年基本失败。失败原因是：用生成式架构在像素层面预测视频，物理世界是不可压缩的噪声，预测不了精确位置和每帧像素颜色——训练系统模拟随机性，而不是学习物理规律。这个失败的根本原因是**生成式架构的目标函数和"理解物理规律"的目标不一致**。要求模型预测每个像素，模型会学到"平均像素值"这种统计模式，而不是"物体受重力下落"这种物理规律。

### JEPA 的核心创新：抽象状态而非像素

JEPA（Joint Embedding Predictive Architecture） 的核心创新是**不预测像素，学会预测抽象状态**：
- 把不可预测的细节、噪声、随机性从表示中去掉
- 只保留和规划相关的东西
- 类比：预测明天出门不需要精确预测每片云、每辆车——需要知道天气、路况、时间——这是"有意义的抽象状态"

这种设计的哲学转变：**从"预测每一个细节"转向"预测和决策相关的状态"**。前者是"摄影"，后者是"理解"。JEPA 的目标是学到和规划相关的隐变量，即使无法从中重建逼真画面，预测也变得可靠。

### 推理 vs 生成：CoT 的本质

文章区分了"真正推理"和"CoT"：
- **真正推理**：内部模拟、操纵心理模型、反事实推断、层级规划
- **LLM 的 CoT**：一种非常低效地强迫自回归预测系统接近推理的方式

CoT（Chain of Thought）之所以"低效"，是因为它要求 LLM 用"逐步生成 token"的方式模拟"并行推理"——就像要求一个只会说话的机器通过自言自语来做计算。这种"伪推理"在简单任务上有效（数学题），在复杂任务上迅速失效（需要内部模拟的反事实推理）。

### 行业格局：谁在做世界模型

文章列出了同一方向的玩家：
- 李飞飞 World Labs：3D 世界模型，Marble 文字/视频转 3D 环境
- Google DeepMind Genie 3：实时交互世界模型
- 1X Technologies：互联网视频+人类第一视角操作录像
- Generalist AI：可穿戴设备日常任务数据，50 万小时
- 英伟达：底层平台，让别人定制世界模型
- 特斯拉：同一模型跑汽车+人形机器人
- AMI Labs：JEPA 风格抽象表示（差异化）

这些玩家的共同点是**不再把 LLM 作为核心，而是构建能预测物理世界状态的系统**。LLM 在这些系统中的角色变成了"接口"——接受自然语言指令、输出自然语言解释，但不负责核心推理和规划。

### 对 Agent 系统的启示

如果 LeCun 的判断正确，那么当前主流的 LLM-based Agent 系统（包括 OpenClaw、AutoGPT、Claude Code 等）都面临**架构层面无法突破的智能上限**：
- Agent 的规划能力受限于 LLM 的世界模型缺失
- Agent 的反事实推理能力（"如果我这样做会怎样"）本质上不存在
- Agent 的常识推理（"日常规划"）永远做不到

这意味着 LLM-based Agent 在"工具调用 + 流程自动化"层面有效，但在"自主决策 + 长期规划"层面失效。要突破这个上限，必须引入世界模型组件——这也是 JEPA 类架构的核心价值。

## 实践启示

1. **重新评估 Agent 系统的能力边界**：不要期望 LLM-based Agent 具备真正的"日常规划"和"反事实推理"能力。在这些场景下，要设计确定性流程兜底，不能依赖 LLM 自主判断。
2. **编程和数学是 LLM 的有效领域**：在这些领域构建 Agent 系统收益最高；在需要常识推理的场景，构建 LLM Agent 的 ROI 很低，考虑用规则引擎替代。
3. **关注 JEPA 类架构的进展**：AMI Labs、World Labs、Genie 3 等团队的方向代表了"LLM 之后的下一代"。即使是当前 LLM-based Agent 系统，也可以引入世界模型组件（比如物理仿真器、状态预测器）来弥补 LLM 的世界模型缺失。
4. **CoT 不是真正的推理**：不要把"复杂 prompt + 多轮 CoT"当作"推理能力"。这只是"伪推理"，在需要内部模拟的场景下迅速失效。
5. **机器人的两道墙是数据问题，不是模型问题**：远程操控数据无法并行，互联网视频没有动作标签。数据采集范式的突破（可穿戴设备、跨机器人数据集、仿真）比模型架构创新更可能解决机器人泛化问题。

## 相关实体

- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](../ch03/045-agent.md)
- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](ch01/1071-scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on.md)
- [Nvidia Isaac Lab Sagemaker Robot Rl Humanoid](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md)
- [Karpathy 从 Vibe Coding 到 Agentic Engineering](../ch03/045-agent.md)
- [OpenClaw 多 Agent 协同开发](../ch11/213-openclaw.md)
- [Karpathy Vibe Coding Agentic Engineering](../ch04/123-karpathy-vibe-coding-agentic-engineering.md)
- 
- 
-
- [stealing passwords via html injection under a strict csp](https://github.com/QianJinGuo/wiki/blob/main/entities/afine-csp-html-injection-password-exfiltration.md)
- [better decisions at scale: how mathematical optimization del](../ch11/159-better-decisions-at-scale-how-mathematical-optimization-del.md)
- [farewell ai2](ch01/793-farewell-ai2.md)
- [introducing 1-bit and ternary bonsai image 4b: image generat](ch01/1075-introducing-1-bit-and-ternary-bonsai-image-4b-image-generat.md)
- [面壁让ai写了训练框架forgetrain，然后它自己训出了最强1b模型](../ch04/070-ai.md)
- [introducing 1-bit and ternary bonsai image 4b: image generat](../ch04/070-ai.md)
- [private fintech has quietly become bigger than public fintec](../ch03/101-private-fintech-has-quietly-become-bigger-than-public-fintec.md)
- [Private Fintech Has Quietly Become Bigger Than Public Fintec](../ch03/101-private-fintech-has-quietly-become-bigger-than-public-fintec.md)
- [the inevitable need for an open model consortium](ch01/452-the-inevitable-need-for-an-open-model-consortium.md)

---

