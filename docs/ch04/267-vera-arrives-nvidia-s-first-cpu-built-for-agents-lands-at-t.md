# Vera Arrives: NVIDIA's First CPU Built for Agents Lands at Top AI Labs

## Ch04.267 Vera Arrives: NVIDIA's First CPU Built for Agents Lands at Top AI Labs

> 📊 Level ⭐⭐ | 9.6KB | `entities/blogs.nvidia.com-vera-cpu-delivery.md`

## 核心要点
- **发布背景**：NVIDIA 创始人兼 CEO Jensen Huang 在 2026 年 3 月 GTC San Jose 上正式发布 Vera CPU，这是 NVIDIA 首个独立 CPU 产品线，被定位为下一个数十亿美元业务
- **首批交付对象**：Anthropic（旧金山）、OpenAI（Mission Bay）、SpaceXAI（帕洛阿尔托）、Oracle Cloud Infrastructure（圣克拉拉），均由 NVIDIA VP Ian Buck 亲自送货上门
- **核心架构**：88 个 NVIDIA 自研 Olympus 核心，1.2 TB/s 内存带宽，核心性能较传统设计提升 50%，专为高并发、实时 AI 代理工作负载设计
- **应用场景**：AI 代理的沙箱执行、工具调用编排、长上下文检索操作；SpaceXAI 评估用于强化学习工作负载和基于代理的模拟训练管道
- **商业落地**：OCI 计划 2026 年部署数十万颗 Vera CPU，是首个超大规模部署 Vera 的云厂商；Vera 还是 Vera Rubin NVL72 的主机处理器，与 Rubin GPU 通过第二代 NVLink-C2C 互联

## 背景与定位
Agentic AI 对 CPU 有与传统数据中心完全不同的需求。NVIDIA CEO 黄仁勋在 GTC 上推出 Vera CPU 时，将其定位为 NVIDIA 下一个多亿美元业务线。随着 AI 模型从"回答问题"向"执行行动"演进，专门为这种工作负载设计的 CPU 成为必要。
AI 代理并非只运行在 GPU 上——每个代理沙箱、每次工具调用、每个编排层、每次长上下文检索操作，都是 CPU 的工作。Vera 正是为这种现实需求从头设计的新类别 CPU。

## 技术规格与设计理念
Vera 专门针对并发、实时任务的严酷挑战而设计，这是传统核心密度优先架构从未重点优化的方向。Vera 的关键参数包括：

- **88 个 Olympus 核心**：NVIDIA 自研 CPU 核心，非标准 ARM 架构
- **1.2 TB/s 内存带宽**：远超传统 CPU，确保大模型上下文快速加载
- **50% 更快的每核性能**：持续负载下任务更快完成，提升整个 AI 工厂效率
Ian Buck 表示："当 AI 模型被提问时，答案通常不是预先准备好的。模型实际上需要生成一些 Python 代码来得出正确答案——这是 Vera CPU 擅长的任务。这就是我们看到 CPU 需求飙升的原因。"

## 首批交付详情
### Anthropic
首批交付地点是 Anthropic 位于旧金山 SoMa 区的办公室。Anthropic 计算负责人 James Bradbury 接收了 Vera 系统，并表达了积极评价："扩展计算是模型增长的重要加速器。我们很高兴看到 Vera 成为解决代理工作负载生态系统中有前景的一部分。"

### OpenAI
在 OpenAI 位于 Mission Bay 的总部，OpenAI 计算基础设施负责人 Sachin Katti 在开放式阳台接收了送货。Buck 甚至用螺丝刀打开机箱盖，展示了系统内部构造。

### SpaceXAI
当天最后一站是 SpaceXAI 位于帕洛阿尔托的办公室。NVIDIA 团队向 Elon Musk 展示了系统内部，Musk 就核心数量、内存布局和散热方案提出了一系列问题。SpaceXAI 正在评估 Vera 用于强化学习工作负载和驱动其训练栈的基于代理的模拟管道。

### Oracle Cloud Infrastructure
周一，OCI 客户成功负责人 Gary Miller 和产品管理负责人 Karan Batta 在 Oracle AI 客户卓越中心接收了完整的 Vera CPU 系统。OCI 计划 2026 年部署数十万颗 NVIDIA Vera CPU，因为代理 AI 需要大规模持续性能。Karan Batta 表示："Vera 的架构专为高吞吐量推理工作负载而生，提供 OCI 所需的效率、密度和占用空间，为下一代企业 AI 提供动力。"OCI 是首个超大规模部署 Vera 的云厂商。

## 在 NVIDIA 平台中的位置
Vera 是 NVIDIA 极端协同设计故事的一部分，同系列产品还包括 NVIDIA Rubin GPU、BlueField 4 DPU、Spectrum-X 和 MGX 机架架构。Vera 不仅驱动独立 CPU 系统，还是 Vera Rubin NVL72 的主机处理器——在该系统中，Vera 通过第二代 NVIDIA NVLink-C2C 与一对 Rubin GPU 配对。
在这些系统中，Vera 和 Rubin 共享统一内存架构，保持加速计算的高利用率。Vera 的快速 CPU 核心和互联负责编排、控制和数据传输，以 2 倍于传统基础设施的能效为 GPU 供数。

## 行业意义
代理 AI 时代有了专用 CPU，名字叫 Vera。这标志着 NVIDIA 从 GPU 公司向全栈 AI 基础设施供应商的进一步扩展——不仅有 GPU，还有专门的 CPU 来处理 AI 代理工作中大量的编排、控制和实时处理任务。

## 深度分析
### 架构创新的市场逻辑
Vera CPU 的推出标志着 NVIDIA 完成了从 GPU 公司向全栈 AI 基础设施供应商的关键跨越。88 个 Olympus 核心、1.2 TB/s 内存带宽、50% 每核性能提升——这些数字背后反映的是 AI 代理工作负载与传统数据中心任务的本质差异：代理需要高并发、实时响应、长上下文检索，而非简单的吞吐量堆叠。
NVIDIA 选择自研 Olympus 核心而非采用标准 ARM 架构，揭示了其对生态控制权的追求。通过垂直整合 CPU + GPU +互联 + 软件栈，NVIDIA 正在复制其在 GPU 领域的成功模式，试图在 CPU 领域建立类似的平台锁定。

### 合作伙伴选择的战略意图
首批四家交付对象的选择极具战略意义：Anthropic（最强基础模型公司）、OpenAI（最大语言模型玩家）、SpaceXAI（端到端自研闭环）、Oracle Cloud Infrastructure（最大企业级云服务商）。这四方几乎覆盖了 AI 代理落地的所有主要场景——从前沿研究到企业级大规模部署。
OCI 宣布 2026 年部署"数十万"颗 Vera CPU，是首个超大规模部署 Vera 的云厂商，这既是巨大的信任背书，也意味着 NVIDIA 可以通过 OCI 的企业客户网络快速触达生产级 AI 代理场景。

### 竞争格局与市场信号
黄仁勋将 Vera 定性为"下一个数十亿美元业务"，这不是营销语言。从历史上看，NVIDIA 的每一次"品类定义"尝试——从游戏 GPU 到数据Center GPU 到 AI 训练加速器——都成功了。Vera 是 NVIDIA 首次直接进入 CPU 赛道，而非通过 ARM 许可模式。这一决策意味着 NVIDIA 认为 AI 代理所需的 CPU 架构与传统 CPU 有本质差异，现成方案无法满足需求。

### 技术护城河分析
Vera 的护城河来自三个层面：(1) Olympus 核心的微架构定制（专为代理场景优化）；(2) 与 Rubin GPU 的 NVLink-C2C 互联（实现统一内存访问）；(3) MGX/ Rubin 系统级协同设计（软硬件联合优化）。这三个层面形成从核心到系统到数据Center的全栈优化，竞争对手难以快速复制。

## 实践启示
### 对 AI 基础设施选型的启示
AI 团队在评估代理基础设施时，需要重新审视 CPU 的角色。传统观点认为 GPU 是瓶颈，CPU 不重要——但对于需要频繁沙箱创建、工具调用、上下文检索的代理工作负载，CPU 可能才是真正的瓶颈。1.2 TB/s 的内存带宽意味着 Vera 可以将大量上下文数据保留在近端，避免频繁从 GPU HBM 交换数据，这对于长上下文代理场景尤为重要。

### 对云厂商战略的参考
OCI 快速拥抱 Vera 并宣布"数百千"级别部署计划，反映出企业级客户对 AI 代理生产力的真实需求。云厂商如果希望在这个新兴市场保持竞争力，需要提前布局专用代理 CPU，而非依赖通用 CPU。SpaceXAI 将 Vera 用于强化学习工作负载和模拟训练管道，暗示专用 CPU 在非推理场景中同样有竞争力。

### 对 AI 代理架构设计的建议
基于 Vera 的设计理念，AI 代理架构师应关注：(1) 减少跨进程/跨沙箱通信延迟；(2) 利用 CPU 端的高带宽进行上下文缓存；(3) 将代码生成、工具编排等 CPU 密集型任务与 GPU 推理解耦。Vera 的发布将推动整个行业重新思考代理架构中的 CPU 角色。
## 相关实体
- [Vera Arrives Nvidia S First Cpu Built For Agents Lands At Top Ai Labs](ch04/267-vera-arrives-nvidia-s-first-cpu-built-for-agents-lands-at-t.html)
- [Nvidia Agentic Systems Extreme Co Design](ch04/234-agentic.html)
- [Sap Unveils The Autonomous Enterprise](ch04/105-sap-unveils-the-autonomous-enterprise.html)
- [Nvidia Nemotron 3 Ultra Sagemaker Jumpstart Moe Agentic](ch04/234-agentic.html)
- [Nemotron 3 5 Content Safety](../ch01/476-nemotron-3-5-content-safety-customizable-multimodal-safety.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/nvidia-gpu-acceleration.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/blogs.nvidia.com-vera-cpu-delivery.md)

---

