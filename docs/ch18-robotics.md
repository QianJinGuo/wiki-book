# Ch18 机器人与具身智能

> 从数字到物理：强化学习、仿真、人形机器人

> 本章收录 **5 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐⭐ 工程师 | 需编程基础 | 5 |

---

## 导读

AI 最终要从屏幕走进物理世界。

本章收录了机器人与具身智能的前沿进展：NVIDIA Isaac Lab 的机器人强化学习、蔚蓝 BabyAlpha A3 消费级机器狗、Wall-OSS-0.5 零样本具身大模型、以及 Unitree 的 IPO 招股书。

这个领域的实体数量不多（5 篇），但每一篇都代表着一个正在爆发的方向。当 AI Agent 学会了"看"和"听"，下一步就是"动手"。

这是 AI 从数字世界走向物理世界的最后一公里。

---

## Ch18.001 Unitree's IPO Filing: The State of the Robotics Market

> 📊 Level ⭐⭐ | 6.7KB | `entities/unitree-ipo-robotics-market.md`

## 核心要点
- 来源：Tanay Jaipuria (Wing VC) Newsletter，2026-05-18
- Unitree 递交科创板 IPO，拟融资 6.2 亿美元，估值目标约 60-70 亿美元
- 2025 年营收预期约 2.52 亿美元（2024 年 5800 万美元），同比增长 335%
- 已实现盈利（2024 年 GAAP 盈利），调整后利润率约 35%
- 2025 年人形机器人出货约 5,500 台，为全球销量最大的人形机器人公司
- 四足机器人制造成本从 2022 年约 3,300 降至 2025 年中约 1,800 美元，降幅 46%
- IPO 融资款约一半（3 亿美元）将用于 AI 模型训练，包括"Embodied Large Model"
## 相关实体
- [Cloudflare Glasswing Mythos Security](../ch01-281-project-glasswing-what-mythos-showed-us)
- [A 0 Click Exploit Chain For The Pixel 10 When A Door Closes A Window Opens](../ch12-042-a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes)
- [Fine Tuning Nvidia Cosmos Predict 25 With Loradora For Robot Video Generation](https://github.com/QianJinGuo/wiki/blob/main/entities/fine-tuning-nvidia-cosmos-predict-25-with-loradora-for-robot-video-generation.md)
- [User Interviews Guide Pro](../ch01-561-user-interviews-guide-how-to-interview-users-like-a-pro)
- [估值3000亿63家新实验室杀疯了Murati贝佐斯集体押注下一代Ai](../ch01-270-估值3000亿63家新实验室杀疯了murati贝佐斯集体押注下一代ai)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/unitree-ipo-robotics-market.md)

## 深度分析
**1. 收入结构的"人形机器人翻转"**
两年前 Unitree 基本是一家机器人狗公司，四足机器人占绝对主导。2023 年人形机器人仅占收入的 1.9%。到 2025 年前三季度，人形机器人已占核心收入的 50% 以上。这一转变的驱动因素是产品市场契合与强势营销的结合：春晚连续两年表演、黄仁勋在 GTC 2024 上展示 Unitree 机器人，都带来了显著的品牌曝光并转化为商业和研究需求。
**2. 出货量对比：现实中的应用阶段**
与知名美国公司（Figure AI、Agility Robotics 等，出货量在数百台级别）相比，Unitree 2025 年出货约 5,500 台人形机器人，确实是全球销量最大的人形机器人公司。
但这不意味着人形机器人已经大规模商业化。人形机器人的买家分布揭示了真实的应用阶段：

- **研究教育**：占人形机器人收入/出货的 74%，是最大的收入来源
- **商业消费者**：占 17%，主要是"用来展示"的场景——零售入口处的吸睛 promotion、旅游景点、表演展览
- **工业应用**：仅占 9%，且其中 50-70% 是企业接待和导游用途
**3. 四足机器人：更接近真实生产力场景**
四足机器人侧的情况更为乐观：约 1/3 收入来自研究，40%+ 来自商业用途，其余来自工业。真实的生产力用例更为成熟，客户包括国家电网、南方电网、中石油、中石化、宝武集团、京东（最大客户）等，用于化工厂、变电站、煤矿、管道的真实巡检。
**4. 垂直整合策略与成本结构**
Unitree 的独特之处在于几乎完全自设计和自制造关键零部件：高扭矩电机、精密减速器、编码器、关节模块、智能控制器、高精度传感器、灵巧手、LiDAR 和摄像头。采购零部件仅占总成本的 14-18%。
这一垂直整合策略带来了显著的成本下降和毛利率提升：

- 四足单机制造成本：2022 年约 3,300 → 2025 年中约 1,800（-46%）
- 人形单机制造成本：2022 年约 10,800 → 2025 年约 9,200（-15%）
- 毛利率：从 2022-2023 年的 45% 左右扩大到 2025 年的近 60%
- ASP（平均售价）逐年下降的同时毛利率持续扩张，说明成本控制能力强
**5. 国际化与市场分布**
Unitree 自 2018 年开始国际销售。历史上超过 35% 收入来自海外，包括大量美国学术客户。2025 年，中国国内业务首次超过出口，但出口绝对收入仍同比增长一倍以上。
**6. 模型层野心：VLA 和 WMA 双轨架构**
Unitree 计划将 IPO 融资款约 3 亿美元（每年约 1 亿美元）用于 AI 模型训练，专注于"Embodied Large Model"。其详细描述了两种并行模型架构：

- **VLA (Vision-Language-Action)**：直接从视觉和语言输入映射到电机命令，使机器人能泛化到非特定任务，无需手工编码指令
- **WMA (World Model + Action)**：构建物理现实的内部仿真，机器人在行动前预测会发生什么，而非纯粹通过试错学习
2025 年 9 月已开源 UnifoLM-WMA-0，2026 年 1 月开源 UnifoLM-VLA-0。

## 实践启示
**对机器人行业投资人的启示：**

- 人形机器人的商业化进程远比媒体叙事保守——当前主要买家是学术机构，用于"展示"的商业消费者远多于真正的生产力用户
- 四足机器人的商业化路径更清晰，在巡检等垂直场景已建立真实客户基础
- Unitree 的垂直整合策略是当前硬件护城河的核心，但未来真正的差异化可能在模型层——如果执行器和关节模块最终成为标准零件，模型层将是护城河转移的方向
**对机器人创业公司的启示：**

- 品牌曝光（如大型活动演示）对商业化需求的转化效果显著——这为硬件公司提供了不同于纯软件公司的营销路径
- IPO 前实现 GAAP 盈利且调整后利润率 35%，说明硬件公司也可以有健康的单位经济
- 早期收入来源中研究机构的重要性被低估——这既是稳定收入来源，也是产品迭代的反馈来源
**对想买人形机器人的人的启示：**

- 当前 25,000 美元的人形机器人，实际使用场景可能主要是"站在深圳某商店入口吸引顾客"
- 真正的工业部署（4% 级别的出货）技术成熟度仍然有限，采购决策需要谨慎评估 ROI
- 如果用于研究目的，当前阶段人形机器人是合理的选择，但用于生产环境需要等待技术进一步成熟
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/unitree-ipo-robotics-market.md)

---

## Ch18.002 蔚蓝BabyAlpha A3消费级机器狗

> 📊 Level ⭐⭐ | 5.1KB | `entities/weilan-babyalpha-a3.md`

## 核心技术突破
### 异构计算架构
6颗国产芯片，22核CPU：

- 2×5nm → 感知智能
- 2×8nm → 系统与自主智能
- 2×3D堆叠 → 认知智能
物料成本：300余美金（英伟达1/10）

### 感知系统
| 指标 | A3 | 行业主流 |
|------|-----|---------|
| 像素 | 6600万 | 200万 |
| HDR | 140dB | 80dB |
| 帧率 | 480fps | 30fps |
| 点云密度 | 223.2万点/秒 | ~4-5万 |
| 声源定位 | ±3° | ±15° |

### 70亿参数端侧推理
消费级首次实现

## 安全记录
- 7年0重大事故
- 295城市
- 9.5亿分钟运行
- 6548万次交互

## 时间壁垒
- 2019：自研运动控制
- 2021：打破MIT世界纪录
- 2022：量产工厂
- 2023：消费级验证
- 2024：品牌体验店
- 2026：25,397台销量

## 行业意义
消费级具身智能进入"真智能"时代，中国公司定义游戏规则

## 与现有知识的链接
- → [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/weilan-babyalpha-a3-machine-dog.md)
- → [Yann LeCun JEPA世界模型](../ch04-363-yann-lecun-jepa世界模型与ami-labs) — AMI Labs具身智能方向
- → [NVIDIA边缘端LLM for机器人](../ch01-194-nvidia-edge-first-llms-av-robotics) — 英伟达边缘AI方案对比

## 深度分析
### 异构计算vs单芯片：架构选择的工程哲学
蔚蓝选择6颗专用芯片而非1颗通用大芯片，背后是** task-specific 优化**的工程哲学。
通用芯片路线（英伟达Jetson Thor）追求"一颗芯片解决所有问题"，代价是能效比妥协——2999美金定价比亚迪，成本压力大到无法消费级定价。
异构计算的本质是**让擅长的人做擅长的事**：感知、决策、认知任务解耦后各自专用优化，整体大于部分之和。
这个路线在自动驾驶领域已有验证（特斯拉FSD的星座架构），现在下沉到消费级机器人。

### 数据飞轮：9.5亿分钟运行时间构建的壁垒
7年0重大事故不是安全设计的结果，而是**真实部署规模筛选出来的可靠性**。

- 295城市的多环境覆盖
- 6548万次交互积累的真实交互数据
- 25,397台中90%流向真实家庭（非B端演示场景）
这意味着蔚蓝的感知-控制模型是在**真实家庭环境**中训练迭代的，而非实验室场景。竞争对手即使拿到技术图纸，也缺乏对应规模真实数据来追平。

### 消费级具身智能的临界点
70亿参数端侧推理在消费级设备上首次实现，意味着：
1. **延迟敏感场景**（运动控制、实时反应）不再依赖云端
2. **隐私敏感场景**（家庭环境）数据不离设备
3. **成本临界点**达到——300余美金物料 vs 英伟达1/10
这三个条件同时满足，消费级具身智能才真正进入"可用"阶段。

## 实践启示
### 对具身智能从业者
- **架构选择**：不必迷信单芯片通用方案。异构计算在特定任务上可以用1/10成本达到同等性能。
- **数据护城河**：先跑量再跑智能。产品-数据飞轮比单纯的技术领先更难追赶。
- **感知先行**：感知系统指标（像素、帧率、动态范围）往往比模型参数更直接影响用户体验。

### 对国产芯片玩家
- **边缘AI推理**不需要对标英伟达数据中心卡。专注特定任务的专用芯片，在特定场景下能用1/10成本做到可用的体验。
- **制程不是唯一**：2×5nm + 2×8nm + 2×3D堆叠的组合说明，成熟制程通过系统级优化可以达到先进制程同等的端到端效果。

### 对投资参考
蔚蓝案例说明**消费级具身智能**的竞争维度有三：
1. 全栈自研能力（芯片+算法+产品）
2. 真实场景部署规模（数据飞轮基础）
3. 时间壁垒（7年积累的工程经验）
纯技术背景的团队，即使算法领先，也面临工程化和小规模验证的漫长周期。

---

## Ch18.003 Google DeepMind Robotics Accelerator（欧洲版，3 个月计划，15 家初创）

> 📊 Level ⭐⭐ | 5.0KB | `entities/powering-the-future-of-robotics-in-europe-deepmind-2026-06.md`

# Google DeepMind Robotics Accelerator（欧洲版，3 个月计划，15 家初创）

> 原文存档：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/powering-the-future-of-robotics-in-europe.md)

## 概述

Google DeepMind 2026-06-09 启动 **Google DeepMind Accelerator: Robotics** 欧洲计划 —— 为期 3 个月、面向欧洲早期机器人初创公司的孵化项目，**15 家初创**入选，本周（2026-06）在伦敦集结。入选公司将获得：

- **Google AI stack 访问权限**
- **DeepMind + Google 专家的技术 mentorship**
- **Gemini Robotics 模型**使用权
- **产品/战略指导 + 合作网络**

15 家初创分布 11 个欧洲国家（挪威、希腊、罗马尼亚、英国、法国、瑞士、丹麦、德国、意大利、瑞典），覆盖 **物流、制造、医疗、气候、先进导航**五大领域。

## 15 家初创全景（按应用领域分类）

### 工业自动化（5 家）

| 公司 | 国家 | 核心产品 |
|------|------|---------|
| 3D-Components AS | 挪威 | RobTrack — AI 驱动的机器人焊接/金属 3D 打印参数选择与质量控制，**比当前实践快 280 倍** |
| Acumino | 希腊 | 硬件无关 Physical AI，让机器人执行复杂工业任务，高 ROI |
| Deltia GmbH | 德国 | 数字化产线工作流，转为流程图，让团队自动化重复任务 |
| Qualia | 丹麦 | 基础设施层 — 将机器人基础模型转化为实际部署 |
| Forgis | 瑞士 | AI Agent 理解机器，预测故障、优化运营 |

### 医疗与神经科学（2 家）

| 公司 | 国家 | 核心产品 |
|------|------|---------|
| Adapta Robotics | 罗马尼亚 | 复刻人类触觉的 Physical AI，自动化设备/软件 QA，支持循环经济 |
| ROBEAUTE | 法国 | **脑组织内导航的微型机器人** — 诊断、治疗、监控神经病理 |

### 建筑与空间（2 家）

| 公司 | 国家 | 核心产品 |
|------|------|---------|
| AUAR | 英国 | 机器人 MicroFactories 直接部署到建筑工地，让住宅建设更可负担 |
| Staer | 瑞典 | 现有摄像头/传感器上跑 CV，建 3D 空间模型，让机器人共享环境导航 |

### 海洋与极端环境（1 家）

| 公司 | 国家 | 核心产品 |
|------|------|---------|
| Bubble Robotics | 法国 | **海洋自主劳动力** — 无船版自对接水面/水下机器人星座，喂养实时水下世界模型 |

### 机器人硬件/感知（3 家）

| 公司 | 国家 | 核心产品 |
|------|------|---------|
| Danu Robotics | 英国 | 具身 AI 自动化复杂垃圾分类，提升效率与安全性 |
| Embodied AI | 瑞士 | 远程操作人形机器人 — 客服场景下收集数据、持续训练操作技能 |
| Extend Robotics | 英国 | 远程操作软件 + 数据管道，训练/微调基础模型 |
| Generative Bionics | 意大利 | 基于 Physical AI 的人形机器人 |
| Touchlab | 英国 | 先进纳米墨水 "e-skin" — 给机器人高分辨率触觉 |

## 关键贡献

1. **"embodied AI 在欧洲"的全景图**：15 家初创来自 11 个国家、5 大领域，呈现欧洲在**硬件无关 Physical AI、神经外科微型机器人、海洋自主机器人、e-skin 触觉**等前沿方向的产业分布。

2. **医疗 + 神经外科的具身 AI 落地**：ROBEAUTE 微型机器人 + Adapta Robotics 触觉 QA 展示 embodied AI 从工业延伸到高难度医疗领域，是 **AI 落地物理世界** 的早期信号。

3. **"AI 栈 + 模型 + 指导" 三位一体加速器模式**：DeepMind 提供的不是单纯资金，而是 AI 基础设施 + 模型访问 + 技术 mentorship 的捆绑包 —— 这种"加速器即 AI 平台"模式正在成为新一代 AI 公司孵化标准。

## 一句话定位

**embodied AI 在欧洲的产业化布局图** —— 15 家初创覆盖 11 国 / 5 大领域，从工业自动化到神经外科微型机器人

---

## Ch18.004 NVIDIA Isaac Lab + Amazon SageMaker AI：机器人强化学习训练基础设施（Humanoid RL Scale-up）

> 📊 Level ⭐⭐ | 3.9KB | `entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md`

# NVIDIA Isaac Lab + Amazon SageMaker AI：机器人强化学习训练基础设施（Humanoid RL Scale-up）

## 相关实体

- [farewell ai2](../ch01-843-farewell-ai2)
- [无惧off-policy偏移！bengio团队解绑后训练，大模型rl提速50倍](https://github.com/QianJinGuo/wiki/blob/main/entities/trajectory-balance-asynchrony-tba-bengio-papweekly.md)
- [sft, rl, and on-policy distillation through a distributional](https://github.com/QianJinGuo/wiki/blob/main/entities/untitled-v2.md)
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on-.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/nvidia-gpu-acceleration.md)
## 深度分析

# Scale Robot Reinforcement Learning with NVIDIA Isaac Lab on Amazon SageMaker AI
Physical AI is moving from research into production.

### 核心观点

1. Robots are increasingly trained in high-fidelity simulation before being deployed to factories, warehouses, and logistics centers, because training in the real world is slow, expensive, and often unsafe, while GPU-accelerated simulation can compress months of learning into hours.
2. This shifts the challenge to compute.
3. Reinforcement learning (RL) for complex behaviors like humanoid locomotion on rough terrain is compute-intensive, with single-node training runs stretching from hours to days.
4. Robotics teams need to iterate quickly during research and also run production-grade, long-horizon training jobs without the operational burden of maintaining compute clusters.
5. In this post, we show how to train robot policies for the Unitree H1 humanoid with NVIDIA Isaac Lab on Amazon SageMaker AI across two compute options: **Amazon SageMaker HyperPod** and **Amazon SageMaker Training Jobs**.

### 内容结构

- Scale Robot Reinforcement Learning with NVIDIA Isaac Lab on Amazon SageMaker AI
- 1\. Why Amazon SageMaker AI for Physical AI training
- Cluster resiliency and control with SageMaker HyperPod
- Ephemeral compute with SageMaker Training Jobs
- 2\. NVIDIA Isaac Lab and the training task
- 3\. Solution overview
- Training image
- Experiment tracking
- Configuration and the generator script
- Training topology across backends

### 技术要点

- **agent架构**: 本文在agent方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **architecture趋势**: 相关技术演进方向与新兴范式

### 关联实体

- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](../ch01-800-scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on)
- [Latest Open Artifacts 20 New Orgs New Types Of Models With N](../ch01-204-latest-open-artifacts-20-new-orgs-new-types-of-models)
- [Fundamentals Large Tabular Model Nexus Is Now Available On A](../ch01-809-fundamental-s-large-tabular-model-nexus-is-now-available-on)
- [5238213](../ch01-829-openai-buys-ai-consultancy-to-sell-enterprises-on-its-models)
- [腾讯混元新里程碑Hy3 Preview 发布开源Agent 表现全面提升](../ch04-121-腾讯混元新里程碑-hy3-preview-发布开源-agent-表现全面提升)
- [Code As Agent Harness Survey 2026](../ch01-599-uiuc-meta-斯坦福等最新综述-code-as-agent-harness)

## 实践启示

1. **Agent 设计**: 关注控制流与上下文工程的平衡，Harness 约束比模型能力更影响成功率
2. **可观测性**: Agent 行为调试应优先检查工具定义和上下文质量
3. **渐进式部署**: 从简单 ReAct 循环起步，逐步引入多 Agent 编排
4. **验证优先**: 建立完善的测试验证体系，确保 Agent 行为可预测

---

## Ch18.005 蔚蓝BabyAlpha A3消费级机器狗撕开英伟达垄断

> 📊 Level ⭐⭐ | 3.7KB | `entities/weilan-babyalpha-a3-machine-dog.md`

# 蔚蓝BabyAlpha A3消费级机器狗撕开英伟达垄断

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/weilan-babyalpha-a3-machine-dog.md)

## 深度分析

蔚蓝BabyAlpha A3消费级机器狗撕开英伟达垄断 涉及agent领域的核心技术议题。
### 核心观点
1. # 蔚蓝BabyAlpha A3消费级机器狗撕开英伟达垄断
## 核心亮点
- 70亿参数大模型端侧推理，消费级首次
- 国产异构芯片架构，成本仅为英伟达1/10
- 感知系统关键指标达到人眼水平
## 01 算力枷锁
### 单芯片路线的三重困境
1.
2. **摩尔定律放缓**：制程提升边际递减
2.
3. **通用芯片效率浪费**：AI推理、运动控制、传感融合任务不同，混在一起算力消耗在任务切换
3.
4. ### 视觉系统
| 参数 | BabyAlpha A3 | 行业主流 | 倍数 |
|------|-------------|---------|------|
| 像素 | 6600万三摄(8K+4K+4K) | 200万 | 30倍 |
| HDR | 140dB | 80dB | - |
| 帧率 | 480fps | 30fps | 16倍 |
人眼动态范围约100-120dB，主流机器人约80dB，A3达140dB。
5. ### 空间感知
- 5组3D ToF + 3D结构光，360°环视面阵
- 点云密度：223.

### 内容结构
- 蔚蓝BabyAlpha A3消费级机器狗撕开英伟达垄断
- 核心亮点
- 01 算力枷锁
- 单芯片路线的三重困境
- 蔚蓝的破法：异构计算集群
- 性能表现
- 02 感知枷锁
- 感知瓶颈本质

### 技术要点

- **agent架构**: 本文在agent方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **architecture趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](../ch01-781-ethan-he-cosmos-grok-imagine-latent-space-video-agent-202606)
- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](../ch01-800-scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on)
- [你不知道的 Agent原理架构与工程实践 V2](../ch04-455-你不知道的-agent-原理-架构与工程实践)
- [Nvidia Isaac Lab Sagemaker Robot Rl Humanoid](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md)
- [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](../ch01-715-龙虾装上了-可以用来干啥-分享下我的-openclaw-多智能体团队搭建经验)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](../ch04-199-openclaw-完全指南)

## 实践启示
1. **工程落地**: agent领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

---
