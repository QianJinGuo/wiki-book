# Ch18 机器人与具身智能

> 从数字到物理：强化学习、仿真、人形机器人

> 本章收录 **19 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐⭐ 工程师 | 需编程基础 | 14 |
| ⭐⭐⭐ 专家 | 需ML基础 | 1 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 4 |

---

## 导读

AI 最终要从屏幕走进物理世界。

本章收录了机器人与具身智能的前沿进展：NVIDIA Isaac Lab 的机器人强化学习、蔚蓝 BabyAlpha A3 消费级机器狗、Wall-OSS-0.5 零样本具身大模型、以及 Unitree 的 IPO 招股书。

这个领域的实体数量不多（5 篇），但每一篇都代表着一个正在爆发的方向。当 AI Agent 学会了"看"和"听"，下一步就是"动手"。

这是 AI 从数字世界走向物理世界的最后一公里。

---

## Ch18.001 逐际动力 Pre-IPO 融资 — 具身智能商业化路径

> 📊 Level ⭐⭐ | 11.8KB | `entities/zhuji-dynamics-pre-ipo-embodied-ai-2026.md`

# 逐际动力 Pre-IPO 融资 — 具身智能商业化路径

## 摘要

通用人形机器人公司逐际动力于 2026 年 7 月完成 Pre-IPO 轮 2 亿美元融资，投后估值达 150 亿元人民币。新增资方包括 IDG 资本、蓝思科技、GGG Group、Redstone VC、华山资本等，其中海外资本占总融资额 70%。过去半年公司累计完成融资 4 亿美元，正积极筹备港股上市。

## 核心要点

- **融资规模**：Pre-IPO 轮 2 亿美元（约 14 亿人民币），投后估值 150 亿人民币
- **资本结构**：海外资本（欧洲、中东、北美）占 70%，反映全球化战略重心
- **上市规划**：已完成股改，大概率选择港股，以适配全球股东与海外业务布局
- **技术路线**：强调"大小脑融合"而非单一模型能力，提出三层技术架构（系统 0/1/2）
- **商业化理念**：拒绝业绩对赌，认为营收对赌不符合具身商业逻辑
- **产品进展**：全尺寸人形机器人 LimX Luna 已交付，TRON 2 收获大量海内外订单，累计获数千台订单

## 深度分析

### 具身智能融资的"逆周期"逻辑

逐际动力在 2026 年上半年的持续大额融资（累计 4 亿美元）值得关注。与 2023-2024 年 AI 大模型融资热潮后的降温周期不同，具身智能赛道正在逆势升温。这种"逆周期"现象背后有几个结构性原因：一是全球供应链重构下制造业自动化需求急迫，中国作为制造业大国对通用机器人的需求远大于欧美；二是具身智能本身属于重资产、长周期赛道，天然需要更大资金体量支撑研发与量产。逐际动力张巍将资金比作"子弹"而非"口粮"，正是这种长期投入心态的体现。

### 海外资本占比 70% 的战略含义

本轮融资中海外资本占比高达 70%，这不仅反映逐际动力的全球化布局，更是一个值得解析的产业信号。逐际动力产品过半订单来自海外，这意味着中国具身智能企业在技术代差尚未拉大的窗口期，正通过海外融资+海外市场双轮驱动实现国际扩张。这与传统中国硬件企业"先国内后出海"的路径不同——逐际动力的"出生即全球化"模式，可能成为新一代中国硬科技公司的标配策略。

### "大小脑融合"三层架构的产业意义

张巍提出的三层技术架构（系统 0/1/2）值得深入分析：

- **系统 0（小脑）**：全身运动基础模型，负责实时动作生成与平衡维持，是逐际动力学界最具辨识度的能力
- **系统 1（VLA 技能层）**：视觉-语言-动作融合，将任务理解转化为可执行动作指令
- **系统 2（COSA OS）**：机器人大脑，通过大模型+世界模型完成环境理解、任务推理与长期规划

这套架构的贡献在于它明确区分了"技能"和"大脑"——张巍的经典类比是"霍金拥有顶尖思考能力但不具备劳动操作能力"。这种区分对于指导具身智能产品化具有实操意义：技能需要大量真实数据训练，而大脑负责统筹调度。两者谁都无法替代对方，但需要不同的技术路线和商业模式来支撑。

### "世界模型去魅"的技术判断

张巍提出要对"世界模型去魅"，这一观点在当前行业环境下尤为尖锐。他指出当前行业在滥用这一概念：大部分"通用世界模型"基于视频数据训练，距离支撑机器人在真实非结构化环境中长期自主运行还有明显差距。他提出的替代思路是 World Action Model——不是回答"世界会如何变化"，而是回答"机器人采取行动后会发生什么"。这种"行动导向"的世界模型认知，比很多基于视频生成的方案更贴近具身智能的实际需求。

### 手部操作——具身智能真正的瓶颈

张巍坦承手部操作仍然是当前机器人最大的短板。"机器人小脑能力已经足够支撑导航、巡检、导览等任务，但复杂抓取、整理等操作仍存在明显不足。"原因不在于机器人不会思考，而在于手部技能数据不足。这一判断与 [Video World Model Hand Motion Capture 2026](https://github.com/QianJinGuo/wiki/blob/main/entities/video-world-model-hand-motion-capture-2026.md) 中 ACE-ViDiHand 的研究方向高度一致——后者正是利用视频生成模型从野生视频中提取手部运动数据。手部能力的突破，核心依赖触觉传感器成熟度和大规模数据采集能力，这与触觉感知、灵巧操作等研究方向紧密相关。

## 实践启示

1. **具身智能赛道需要长期资本，而非短线对赌**。逐际动力拒绝业绩对赌的立场值得其他具身智能公司参考——硬科技的长周期特性与 VC 的短期回报要求之间存在结构性矛盾，选择合适的资本比拿到钱更重要。

2. **全球化不应是第二步，而应是出生设定**。逐际动力 70% 海外融资+过半海外订单的模式，展示了中国硬科技企业直接面向全球市场的可行性。对于 agent 和机器人领域的创业者，出海策略应该从第一轮融资就开始设计。

3. **"大脑 vs 技能"的区分是具身智能产品化的关键框架**。不要试图用一个模型解决所有问题。大脑（任务规划与推理）和技能（运动控制与操作）需要不同的技术路线、数据策略和评估标准。

4. **世界模型需要"行动导向"而非"视频导向"**。如果你的世界模型只能预测但不产生行动决策，它对机器人的价值有限。这一原则同样适用于 [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 中的 agent 测试——预测与执行之间的 gap 才是真正的技术挑战。

5. **手部操作数据的规模化采集决定了具身智能的落地速度**。结合 [Video World Model Hand Motion Capture 2026](https://github.com/QianJinGuo/wiki/blob/main/entities/video-world-model-hand-motion-capture-2026.md) 和触觉传感器进展，手部技能可能是未来 1-2 年最具差异化价值的技术方向。

## 相关实体

- [Video World Model Hand Motion Capture 2026](https://github.com/QianJinGuo/wiki/blob/main/entities/video-world-model-hand-motion-capture-2026.md) — 视频世界模型实现手部动捕，与逐际动力强调的手部数据瓶颈直接相关
- [Lingbot Vision Spatial Native Vision Foundation Model Ant](https://github.com/QianJinGuo/wiki/blob/main/entities/lingbot-vision-spatial-native-vision-foundation-model-ant.md) — 蚂蚁具身智能空间视觉基础模型
- [逐际动力原始报道](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/zhuji-dl-robot-pre-ipo-2026.md) — 逐际动力 Pre-IPO 融资的原始报道
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — 工程化框架与具身智能系统架构的交叉

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/zhuji-dl-robot-pre-ipo-2026.md)

## 第 2 来源 — COSA 0.5：人形大脑系统正式发布

> **互补角度 6 条**：① S2/S1/S0 三层架构的具体实现参数（S2=1Hz/S1=50Hz/S0=1000Hz）；② 一镜到底长程家务 Demo：Full-size Oli 机器人 31-DOF 持续连贯操作；③ 行业对比框架：Figure（System1/2）vs Skild AI（通用模型）vs Flexion（三层自主栈）；④ FluxVLA Engine 开源（π0/π0.5/GR00T/OpenVLA 即插即用）；⑤ WBT 全身运动基础模型量化对比 SONIC（关节角误差 3.3°→1.5°）；⑥ "大脑 vs 技能"行业反共识：模型是技能，系统才是大脑。

逐际动力于 2026 年 7 月正式发布人形大脑系统 LimX COSA（Cognitive Operating System for Autonomous agent）0.5 版本，同步公开一镜到底全自主家庭任务 Demo。该发布验证了此前 Pre-IPO 报道中提及的三层架构路线，并首次以可量化的性能数据与开源策略展示其技术落地状态。

### 三层架构的具体实现

COSA 0.5 的三层架构在频率与功能上做出明确划分：

- **S2（认知层，~1Hz）**：通过头部与手腕相机画面 + 语言指令，实时完成场景理解、记忆、推理与调度。Demo 中机器人不知道下一轮面对的布局，S2 必须实时判断下一步动作。
- **S1（技能层，~50Hz）**：一组可复用技能的集合，**VLA 只是其中一个技能**。逐际动力的判断是——不同技能需要不同的数据，开车与剥鸡蛋一起训练会互相干扰，因此技能层走多元数据、按需组合的路线，每个技能独立迭代。
- **S0（运控层，1000Hz）**：自研 LimX WBT 全身运动基础模型（千万参数级 Transformer 策略，全机上推理），暴露统一接口接收上游全身运动目标，输出平衡协调的关节指令。

张巍使用"小脑"类比描述 S0 的角色——**"没有小脑，是长不出大脑的"**。WBT 对标 SONIC 的量化数据：关节角误差从 3.3° 降到 1.5°，全身位置误差从 13.75mm 降到 12.85mm，动作平滑度同步提升。

### 行业定位与对比

在一镜到底的家庭长程任务上，全球目前只有逐际动力和 Figure 做出了完整演示（Figure 03 有厨房/房间/客厅系列，逐际动力有客厅整理任务）。二者相对其他玩家有接近代际差的领先。

| 公司 | 架构理念 | Demo 复杂度 | 开源策略 |
|------|----------|------------|----------|
| **逐际动力** (COSA 0.5) | 三层系统（S2/S1/S0），"模型是技能，系统是大脑" | 一镜到底全尺寸长程家庭任务 | **FluxVLA Engine 开源**，支持 π0/π0.5/GR00T/OpenVLA 等即插即用 |
| **Figure** (System1/2) | 模型即大脑（端到端分层） | 厨房/房间/客厅系列 Demo，不遥操 | 全栈闭源 |
| **Flexion** (Command/Motion/Control) | 三层自主栈，架构趋同 COSA | 户外拾取为主，时长短，基于宇树 G1 硬件 | 未知 |
| **Skild AI** (通用基础模型) | 一个模型控所有形态 | 跨形态片段展示，无长程全身操作 | 未知 |

### FluxVLA Engine 开源

逐际动力同步开源了 Humanoid FluxVLA Engine，包含从训练到推理的完整代码，首次支持端侧（本机）推理。开发者可以通过统一配置管理，以即插即用方式训练与评测 π0、π0.5、GR00T、OpenVLA、LlavaVLA、DreamZero 等多种主流 VLA 策略。

这一开放底座是逐际动力区别于 Figure 全栈闭源的关键——不止展示能力，更把工程基础设施交给社区，被开发者复用。COSA 负责"大脑系统"，FluxVLA Engine 负责让这套系统的 VLA 技能可被训练、复用、迭代。

### 对具身智能产业的意义

COSA 0.5 的发布在行业层面提出了一个关键区分：**"模型 vs 系统"**——当行业普遍把「具身基础模型」等同于大脑时，逐际动力用三层架构给出不同答案：认知、技能、运控各自都只是能力，把它们加上记忆与调度组织成一个整体，才是大脑系统。

这一定位使得逐际动力不必在"谁的单模型更大"上打军备竞赛，而在"谁的系统更完善"这条差异化赛道上竞争。对于具身智能行业的从业者，这一框架提供了一个比"端到端大模型"更具工程可操作性的系统设计范式。

---

## Ch18.002 机器人为什么要拟人？终于有人正确回答了

> 📊 Level ⭐⭐ | 11.2KB | `entities/机器人为什么要拟人终于有人正确回答了.md`

# 机器人为什么要拟人？终于有人正确回答了

## 摘要

本文深入探讨了"Robot for AI"这一新兴范式：为AI设计拟人身体，让智能在真实物理世界中学习和演化。英伟达发布Isaac GR00T人形机器人参考平台，深度机智（Deep Robotics）团队在自研拟人机器人PrimeU上实现零样本完成倒水、放环、装袋、叠杯等复杂操作任务——完全仅凭人类视频数据转换的动作监督，无需任何目标任务的真机示范数据。文章详细拆解了Human-as-Humanoid技术路线的四个核心环节：拟人本体设计、纯视觉人体动作采集与转换、PhysDex高自由度VLA策略、以及真机验证结果。

## 核心要点

- **Robot for AI范式逆转**：传统"为机器人装大脑"→"为AI造身体"，机器人本体成为AI基础设施而非展示终端
- **Human-as-Humanoid核心突破**：仅凭人类视频数据转换的动作监督，零样本完成复杂真实操作任务，证明人类数据直接驱动机器人学习的可行性
- **本体设计对标人体测量学**：PrimeU按照ANSUR II第50百分位男性人体参数设计，肩宽比例0.97、臂展1.02、手掌长度1.00，将人类→机器人的迁移误差降到最低
- **纯视觉采集替代遥操作**：纯相机方案（第一视角+第三视角）相比惯性动捕更稳定，采集效率比遥操作提升4.8-7.2倍
- **PhysDex双空间约束VLA策略**：引入DS-HKC（双空间分层运动学约束），通过可微正向运动学层在腕部和指尖施加几何监督，消融实验证明显著提升训练效果

## 深度分析

### "Robot for AI"范式的底层逻辑：身体为智能服务

英伟达发布Isaac GR00T人形机器人参考平台，宣告芯片巨头正式将"机器人本体是AI基础设施"写入路线图。这一判断的底层逻辑在于：通用物理智能的研究需要一个统一的、接近人的身体作为载体。如果每个机器人都有不同的形态、自由度和传感配置，AI模型将难以在不同本体之间迁移学习，数据效率将极低。

深度机智更进一步：不仅使用拟人身体，而且通过对照人体测量数据库进行设计尺寸对齐——肩宽0.97、臂展1.02、手掌长度精确到1.00——使人类日常操作的手部到达范围与机器人高度一致。这意味着人类数据中的动作经验在物理层面的迁移误差被系统性地压缩到最小，而非仅仅依赖算法补偿。

这一思路与[AI友好型架构](https://github.com/QianJinGuo/wiki/blob/main/entities/backend-ai-friendly-standards-path-alitech.md)的设计哲学高度一致：与其在软件层面反复适配不匹配的底层抽象，不如在基础架构层面就为目标工作负载做好设计。Robot for AI的本质是"基础设施先行的AI系统设计"。

### 人类数据→机器人动作：数据瓶颈的根本解法

具身智能当前最大的瓶颈是数据——机器人需要海量的"观察-动作"配对数据，传统遥操作采集速度慢、成本高、受安全约束、场景难以多样化。整个行业都在用重资产方式对抗数据短缺：智源机器人在上海投建超4000平米的数据采集工厂，多地密集布局具身智能数据采集中心。

深度机智的Human-as-Humanoid路线给出了根本解法：利用人类本身作为数据源。人类每天演示着最丰富、最自然的操作行为，如果这些动作经验能直接变成机器人的训练数据，数据瓶颈就有了根本解法。关键在于三个环节的连通：本体设计与人类对齐（减少迁移误差）、纯视觉人体动作采集与转换（降低采集门槛）、PhysDex模型消化转换后的数据（实现有效学习）。当三个环节形成闭环后，人类视频就不仅仅是"帮模型理解世界"的辅助信号，而是可直接进入机器人关节空间的执行训练信号。

这与[Agent自演进](https://github.com/QianJinGuo/wiki/blob/main/entities/agent的自演进被刚刚开源的areal-20按下了加速键.md)中的数据飞轮逻辑类似——关键不在于初始数据的规模，而在于能否形成"数据→能力→更多数据"的持续增长循环。

### 纯视觉动捕：惯性动捕的颠覆者

一个值得关注的技术细节是：深度机智放弃惯性动捕设备，仅用摄像头（第一视角+第三视角）采集人体动作，对比实验显示纯视觉方案在近距离双手操作中反而比穿戴式动捕更稳定。这是因为惯性动捕在近距离双手操作中会出现定位漂移，需要操作员反复补偿和校准；而纯视觉方案通过多视角三角化，在关键区域的定位稳定性反而更高。

这一发现具有重要的工程意义：采集数据的门槛被彻底拉低了。任何人都可以用普通摄像头录制操作视频，无需昂贵的动捕设备或专业的遥操操作员。配合4.8-7.2倍的采集效率提升，数据规模的增长曲线将变得更加陡峭。

从工程经济学的角度看，这与[阿里云AI实践](https://github.com/QianJinGuo/wiki/blob/main/entities/alicloud-ai-practices.md)中"降低AI应用门槛"的理念一致——技术的普及往往取决于其获取成本的下限，而非性能的上限。

### DS-HKC双空间约束：高自由度控制的关键创新

60自由度的控制问题本质上是一个高维空间中的运动规划问题。纯关节空间监督会把60个关节当成独立回归目标，忽略它们通过运动学链共同决定腕部位置和指尖接触几何的耦合关系。深度机智的DS-HKC（双空间分层运动学约束）通过可微正向运动学层，将预测的关节角度映射到任务空间，在腕部和指尖两个层级施加几何监督。

消融实验表明，DS-HKC在相同训练预算下取得了更低且更平滑的训练损失。这一创新的核心洞察在于：关节空间的误差不一定反映任务空间的误差，直接监督任务空间的关键点（腕部、指尖）比间接监督关节角度更有效。这与[Agent评测方法论](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-评测方法论与体系设计.md)中的"评测指标应与任务目标对齐"原则一致——关注终端效果而非中间指标。

### 全栈技术闭环的先发优势

深度机智在一年多前公开了三大核心技术判断：Action-Centric Modeling（以动作建模为中心）、Human-Centric Data（以人类数据为起点）、Robot for AI（为AI设计机器人本体）。不到一年后，这三个判断已全部兑现——从本体设计、数据采集链路到模型训练，形成了可运行、可验证、可迭代的工程闭环。

在行业仍以真机遥操作为主流数据源的背景下，深度机智已经完成了系统性建设并拿出了真机验证结果。这种先发优势不仅体现在技术栈的完整性上，更体现在数据积累的速度上——一旦高质量合成视频也能进入这条链路（深度机智计划中的下一步），数据飞轮的转速还将继续提升。

这与[Agent协作范式](https://github.com/QianJinGuo/wiki/blob/main/entities/agentteams-和-claude-tag-都进入群聊模式是新范式还是新叙事.md)中的"先发者优势"形成对照：在技术范式转换的早期阶段，率先打通全栈闭环的团队往往能够建立起难以追赶的工程和数据壁垒。

## 实践启示

1. **数据采集路径的重新评估**：在机器人训练数据采集中，应优先评估"现有数据是否可复用"而非"从头采集专用数据"。人类视频作为数据源的成本和规模优势远超遥操作，是更具规模扩展性的路径。

2. **本体设计的数据兼容性**：机器人本体的设计应从一开始就考虑与人类数据源的兼容性——身体尺寸比例、自由度分布、传感器配置等都会影响人类数据的可迁移性。硬件设计与算法需求应并行规划。

3. **纯视觉方案替代专用传感器**：在可能的情况下，优先使用通用传感器（普通摄像头）而非专用设备（动捕设备），以降低数据采集门槛并提高系统在真实环境中的可部署性。

4. **任务空间监督优于关节空间监督**：在训练高自由度控制系统时，应在任务空间的关键点（末端执行器位置、接触点等）施加直接监督，而非仅依赖关节空间的间接监督。这种"最终效果导向"的监督信号更有效。

5. **数据飞轮的工程闭环**：具身智能的核心竞争力在于能否形成"数据→能力→更多数据"的正反馈循环。闭环中每个环节（采集→转换→学习→部署→数据回流）的实效都会影响飞轮的转速。

## 相关实体

- [AI友好型后端架构](https://github.com/QianJinGuo/wiki/blob/main/entities/backend-ai-friendly-standards-path-alitech.md) — 基础设施先行的系统设计哲学
- [Agent自演进](https://github.com/QianJinGuo/wiki/blob/main/entities/agent的自演进被刚刚开源的areal-20按下了加速键.md) — 数据飞轮逻辑的类比
- [阿里云AI实践](https://github.com/QianJinGuo/wiki/blob/main/entities/alicloud-ai-practices.md) — 降低AI应用门槛的工程经济学
- [Agent评测方法论](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-评测方法论与体系设计.md) — 评测指标与任务目标对齐
- [Agent协作范式](https://github.com/QianJinGuo/wiki/blob/main/entities/agentteams-和-claude-tag-都进入群聊模式是新范式还是新叙事.md) — 先发者优势的对比
- [Agent后端架构](https://github.com/QianJinGuo/wiki/blob/main/entities/backend-for-agent.md) — 系统设计中的场景特化优化

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/机器人为什么要拟人终于有人正确回答了.md)

---

## Ch18.003 LingBot-VA 2.0 — 蚂蚁灵波具身原生预训练视频-动作基座模型

> 📊 Level ⭐⭐ | 9.1KB | `entities/lingbot-va-20-embodied-video-action-pretrain-ant-lingbo-2026.md`

# LingBot-VA 2.0 — 蚂蚁灵波具身原生预训练视频-动作基座模型

蚂蚁灵波（Ant Lingbo）于 2026 年 7 月发布 LingBot-VA 2.0，全球首个**具身原生**（Embodiment-Native）预训练 VA（Video-Action）基座模型。与传统"先视觉预训练、后接入机器人"的级联方案不同，LingBot-VA 2.0 从架构、数据到训练目标均为机器人量身定制，采用因果 DiT（Causal Diffusion Transformer）+ 稀疏 MoE 主干，在单 GPU 上实现 150Hz 推理频率，双臂任务成功率达 93.6%。

## 技术亮点

- **因果 DiT + 稀疏 MoE 主干**：模型核心架构，结合因果注意力与扩散 Transformer，通过稀疏 MoE 降低推理成本
- **单 GPU 150Hz 推理**：高效推理性能，适合实时机器人控制场景
- **双臂任务成功率 93.6%**：在真实机器人实验中的任务完成率
- **预判式控制**：模型基于对物理动态的预测（而非纯反应式）生成动作序列，在快速变化场景（如冰球对战）中表现显著优于反应式基线

## 应用场景

LingBot-VA 2.0 在多项真实机器人任务中得到验证，包括整理桌面、冰球对战等动态操控场景。研究团队通过端到端 VA 预训练，使机器人具备"预判未来"的能力，从"看到哪打到哪"的反应式操作升级为基于物理预测的主动控制。

## 深度分析

### 1. "具身原生"设计：从级联范式到原生预训练的范式转变

传统的机器人 VLA（Vision-Language-Action）范式采用级联方案：先用互联网数据预训练视觉模型，再将视觉特征接入动作策略网络。LingBot-VA 2.0 的突破在于彻底抛弃了这一路线，从第一天起就采用因果架构从零训练整套模型。 原因在于：改造式路线（将双向注意力模型手术式改造成因果模型）存在天然的预训练知识磨损风险 — 机器人数据本就稀缺，改造过程容易抹掉预训练阶段学到的大规模先验知识。而是用原生因果架构，让模型天然按照"只能看过去、不能看未来"的时间线学习，恰好匹配闭环控制中"当下不能预知未来"的物理现实。

### 2. 语义视觉-动作分词器：超越像素重建的表示学习

LingBot-VA 2.0 的 VAE 分词器是整套系统的基础创新。 传统的视频 VAE 只追求像素重建质量（"压缩得像"），但 LingBot-VA 2.0 的语义视觉-动作分词器在像素重建的同时，额外向冻结的视觉基础模型对齐特征，把语义信息也编码进 latent 中。更重要的是，团队单独训练了一个隐动作模块 — 通过一对逆动力学模型和正向动力学模型，从连续两帧 latent 中反推出中间发生的动作类别。这意味着即使是完全未标注的网络视频，也能被模型学出与动作相关的监督信号。这种设计大幅扩展了可训练数据来源，使模型能从海量互联网视频中习得丰富的物理交互先验。

### 3. 稀疏 MoE + Foresight Reasoning：实时闭环控制的两大工程突破

实时机器人控制的最大挑战是模型计算延迟直接转化为动作延迟。LingBot-VA 2.0 通过两个正交的工程创新突破这一瓶颈。

首先，**稀疏 MoE 架构**让模型总参数做大（视频主干约 13B，总训练参数量约 15.3B）而推理时仅激活其中一部分（每 token 约 2.5B）。经过一致性蒸馏、低精度编译执行、长程注意力优化和运行时开销削减后，推理时间从 965ms/chunk 降至 142ms/chunk，异步控制频率从 33Hz 提升至 225Hz。

其次，**Foresight Reasoning 异步推理机制**让模型在机器人执行当前动作片段的同时，已经在并行脑补下一步。 模型先想象当前动作执行完后的画面状态，再基于这个想象结果提前准备下一步动作。为避免"脑补漂移"，在每次真实观测返回时用最新画面重新校准。本质上这是一套"预测-执行-纠偏"闭环，让计算与动作执行流水线并行。

### 4. 三项真实任务验证与消融分析

研究团队在三个真实维度验证了模型能力：

- **整理桌面**：考验长程状态维持能力。高维 planner 做任务拆解（左臂回收垃圾、右臂复位文具），视频预测分支天然携带时序状态记忆，避免"断片"返工。
- **传送带抓取**：考验动态目标的时间对齐能力。模型不只识别当前位置，而是预测抓取动作完成瞬间物体的所在位置，将动作执行的时间开销提前纳入计算。
- **抓薯片**：考验精细操作的视觉伺服能力。既要精确把握夹爪与薄脆物体的相对位置，又不能捏碎目标。

在 RoboTwin 2.0 仿真基准上，LingBot-VA 2.0 取得 Clean 93.8%、Randomized 93.4%、Avg 93.6% 的成绩，全面超越 π0.5、Motus 等基线模型。 消融实验验证了新分词器的价值：自研分词器在 50 个任务的 Easy/Hard 上取得 86.6%/83.1%，显著高于通用 WAN2.2 VAE（78.0%/76.0%）。MCP（多步预测）辅助目标带来了 2.3× 训练加速。

### 5. "机器人大脑 2.0"全景：从感知到预测的完整链条

LingBot-VA 2.0 不是孤立发布，而是蚂蚁灵波"机器人大脑 2.0"系列的一部分。 LingBot-Depth 2.0 解决空间感知，LingBot-VLA 2.0 解决当下动作执行，LingBot-Video 补上视频生成推理效率短板，LingBot-VA 2.0 将所有能力汇聚到预测式控制。串起来看，这是一条从"看清楚世界"→"理解物理世界"→"在真实世界里连续行动"的完整链条。当机器人本体越来越成熟，行业竞争的关键正在从硬件的灵巧度转向"大脑是否从出生起就真正为物理世界而生"。

## 实践启示

1. **原生因果架构优于改造式迁移**：从 LingBot-VA 1.0 到 2.0 的演进证明，对于机器人这样的闭环控制任务，从零训练的因果架构优于从双向模型改造的迁移学习路线。如果需要在机器人场景部署视觉基座模型，建议优先考虑原生因果设计而非改造现有双向模型。

2. **视频数据中的隐动作标签远超人工标注**：通过逆动力学模型从连续帧中自动提取动作信号，使得海量互联网无标注视频成为有效训练数据。建议具身智能团队在数据策略上将"自动提取隐动作标签"作为优先级高于人工标注的选项。

3. **推理效率优化需要系统级设计**：LingBot-VA 2.0 的 225Hz 推理频率不是单一优化达成的，而是 MoE 稀疏激活 + 一致性蒸馏 + 低精度编译 + 长程注意力优化 + 异步推理机制的协同结果。对于实时机器人控制场景，建议将推理 pipeline 的延迟预算拆解到每个子模块，系统性地优化而非局部加速。

4. **Foresight Reasoning 可推广至其他实时控制场景**："预测-执行-纠偏"异步机制不仅适用于机器人，也适用于自动驾驶、工业控制等需要低延迟闭环的场景。核心思路是用预测结果替代真实观测填充间歇期，用真实观测周期性校准以避免漂移。

5. **构建"感知→理解→行动"的全栈能力而非单点突破**：蚂蚁灵波从 Depth → VLA → Video → VA 的发布序列表明，机器人智能的核心竞争力在于全栈能力而非单一基座模型。单点模型即使再强，如果缺乏空间感知、动作执行和推理效率的配套支持，也难以在真实场景中落地。建议具身智能团队在模型研发时同步规划感知、推理和控制的全链路优化。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/lingbot-va-20-embodied-video-action-pretrain-ant-lingbo-2026.md)

---

## Ch18.004 刚刚，首个空间原生的具身视觉基模开源！机器人更会看我们的世界了

> 📊 Level ⭐⭐ | 8.7KB | `entities/刚刚首个空间原生的具身视觉基模开源机器人更会看我们的世界了.md`

# 刚刚，首个空间原生的具身视觉基模开源！机器人更会看我们的世界了

##### 金磊 发自 凹非寺
量子位 | 公众号 QbitAI

蚂蚁灵波（Ant Group Robbyant）于 2026 年 7 月发布并开源了 **LingBot-Vision**（空间原生视觉基模）和 **LingBot-Depth 2.0**（空间感知模型），致力于解决机器人在真实世界中视觉感知的核心难题——透明、反光、小目标、远距离、弱光和复杂室内场景下的深度估计稳定性。

## 核心要点

- **LingBot-Vision**：约 10 亿参数（1B）的 Vision Transformer（ViT），通过纯自监督训练，在密集空间任务上可匹敌或超越参数多约 7 倍的视觉基础模型（含 7B DINOv3）。
- **LingBot-Depth 2.0**：基于 LingBot-Vision 的深度估计模型，在 12 个深度补全 benchmark 上取得领先结果，通过了奥比中光深度视觉实验室认证。
- **核心创新—Masked Boundary Modeling**：提出 boundary-forcing 机制，让教师模型在线发现边界 token，强制学生模型在这些高信息密度区域进行掩码建模，而非随机掩码。
- **蒸馏高效性**：0.3B 的学生模型在 NYU-Depth v2 上可达与 7B DINOv3 相当的精度，参数量约少 23 倍，适合端侧部署。

## 深度分析

### 机器人视觉的核心困境：从"看见"到"看准"

传统计算机视觉基础模型（如 DINOv3、CLIP）主要围绕语义理解（"这是什么"）设计，这对具身智能来说远远不够。机器人不仅需要知道物体类别，还需要理解物体的边界在哪里、离自己多远、与周围空间的关系如何。

具身视觉面临四类系统性的挑战：

1. **透明与反光材质**：透明杯壁、玻璃门等物体在 RGB 画面中可见，但深度传感器和传统深度模型常在此类材质上产生破碎、空洞或粘连的结果，直接影响抓取任务的边界判断。
2. **小目标和远距离目标**：远处的物体如网球、宠物等在画面中仅占极小区域，传统方法的深度结果"糊成一团"，无法分辨主体与背景的位置关系。这对移动机器人的提前感知和导航决策至关重要。
3. **室内复杂场景**：玻璃门、窗帘、电视柜、阳台杂物等交错出现，光照随镜头移动不断变化，传统模型在玻璃、强光、阴影、边缘交界处出现大片破碎。
4. **弱光、遮挡与杂乱环境**：门框、墙角、窗帘、桌面、电视等结构交错，传统模型的边缘位置容易产生噪点和缺口，影响机器人在复杂空间中的稳定行动。

### Boundary Forcing：将空间结构学习融入预训练

LingBot-Vision 的核心技术贡献是 **Masked Boundary Modeling**，一种让模型在预训练阶段专门关注"难学"边界区域的创新方法。与标准的 Masked Image Modeling（如 MAE）随机遮住图像块不同，Boundary Forcing 通过教师模型在线识别边界 token，强制学生模型优先学习这些高空间信息量的区域。

此外，模型还为边界 token 引入了几何目标——不仅学习语义，还学习边界场（描述边界位置、方向和几何关系的信号）。分类化的边界场表示和 a-contrario 检验进一步减少了将噪声误判为真实结构的情况。

这一思路与 DINOv3 等通用视觉基础模型形成关键差异：虽同基于 DINO 自蒸馏范式，但 LingBot-Vision 额外引入了空间原生偏置，让模型在预训练阶段就建立"边界在哪、形状如何、与周围空间什么关系"的能力。

### 规模效率与端侧部署意义

实验数据显示，LingBot-Vision 表现出优异的规模效率：

- **1B 教师模型**：在 NYU-Depth v2 上取得所有对比模型中的最佳精度，包括 7B DINOv3。
- **0.3B 学生模型**：蒸馏后可达与 7B DINOv3 相当的精度，参数量少约 23 倍。
- **数据扩展性**：随着下游训练数据增加，LingBot-Vision 编码器的优势进一步扩大——底座越懂空间，后续深度模型吃更多数据时优势越明显。

这对机器人行业的实际部署意义重大——端侧算力和延迟都是硬约束，一个能在小模型上达到大模型效果的视觉底座，降低了从研究到产品的转化门槛。

### 开源生态与硬件合作

LingBot-Vision 和 LingBot-Depth 2.0 已通过奥比中光深度视觉实验室认证，双方围绕 EGO-RGBD 数采设备、SDK 和后续一体化相机产品展开合作，表明这套能力正在从论文和开源走向硬件与产品集成。

模型权重发布在 HuggingFace 和 ModelScope，代码和技术报告在 GitHub 与 arXiv 上公开，项目主页提供了完整的技术文档。

## 实践启示

1. **空间原生预训练是具身视觉的关键方向**：LingBot-Vision 证明了将几何结构（而非仅语义）纳入预训练目标的可行性。后续工作应考虑在更大规模数据和更多下游任务上验证这一范式，并结合 3D 表示学习进一步提升空间理解能力。

2. **Boundary Forcing 可作为通用视觉增强模块**：该机制不限于机器人视觉——在自动驾驶、AR/VR、医学影像等需要精确边界理解的场景中，Masked Boundary Modeling 同样具有迁移潜力。

3. **蒸馏效率决定了技术落地速度**：0.3B 学生模型达到 7B 教师模型精度的结果，强调了蒸馏 pipeline 在机器人视觉中的战略价值。对于资源受限的端侧设备，蒸馏后的紧凑模型是实用化的关键路径。

4. **开源策略有助于加速行业生态建设**：蚂蚁灵波选择全链路开源（权重 + 代码 + 技术报告 + 硬件合作），降低了机器人企业、开发者和研究机构的试用门槛。这种"开源 + 硬件认证"的模式值得其他具身智能项目借鉴。

5. **视觉底座的进步需要与运动控制协同演进**：如文中所述，视觉不稳则后续抓取、避障、移动等全链条都会受影响。具身智能的真正落地依赖视觉、空间感知、运动控制和硬件传感器的共同进步，而非单一环节的突破。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/刚刚首个空间原生的具身视觉基模开源机器人更会看我们的世界了.md)

## 相关实体

- [蚂蚁集团医疗 Agent Afu](https://github.com/QianJinGuo/wiki/blob/main/entities/ant-group-medical-agent-afu.md) — 蚂蚁集团其他 AI 与 Agent 实践
- [Attention Collapse 与上下文管理](https://github.com/QianJinGuo/wiki/blob/main/entities/attention-collapse-context-management.md) — 视觉 Transformer 注意力机制相关研究

---

## Ch18.005 蚂蚁灵波 LingBot-Vision — 空间原生视觉基础模型 & LingBot-Depth 2.0

> 📊 Level ⭐⭐ | 7.7KB | `entities/lingbot-vision-spatial-native-vision-foundation-model-ant.md`

# 蚂蚁灵波 LingBot-Vision — 空间原生视觉基础模型 & LingBot-Depth 2.0

> 机器之心报道 (2026-07-07) 的实体整理。蚂蚁灵波开源空间原生视觉基础模型 LingBot-Vision 及深度估计模型 LingBot-Depth 2.0。

## LingBot-Vision：空间原生视觉基础模型

**核心创新**：以边界为中心的掩码建模（Boundary-centric Masked Modeling）——模型训练过程中实时预测图像边界，强制边界 patch 被遮盖，逼模型重建物体几何结构。

### 与 DINOv3 的对比

| 维度 | DINOv3 (7B) | LingBot-Vision (1.1B) |
|---|---|---|
| 训练数据 | 16.89 亿 | 1.61 亿 (1/10) |
| 训练量 | 完整 | < 1/3 |
| 掩码策略 | 随机遮盖 | 边界强制遮盖 |
| NYUv2 RMSE | 0.309 | **0.296** |
| ImageNet 分类 | 领先 | 落后（几何 vs 语义权衡） |

蒸馏后的 0.3B ViT-L 在 NYUv2 深度上追平 7B DINOv3（~23× 参数差）。

### 关键技术细节
- **自举解法**：稀疏角点锚定 → 随机边界场仍解码出合理线段 → 训练逐步精调
- **a-contrario 检验**：将边界预测转为分类问题，自动过滤伪边界
- 基于 DINO 自蒸馏范式，分水岭在掩码建模环节

## LingBot-Depth 2.0

深度估计模型，基于 LingBot-Vision 底座：

| 改进 | Before (1.0) | After (2.0) |
|---|---|---|
| 编码器 | DINOv2 | LingBot-Vision |
| 训练数据 | 300 万 | 1.5 亿 |

- 16 项测试 12 个最优
- DIODE-Indoor RMSE 从 0.152 (DINOv2 init) 降至 0.094 (LingBot-Vision init)
- 透明/反光物体表现突出

**商业化**：奥比中光已集成至 EGO-RGBD 数采设备，计划年底推出一体化相机。

## 深度分析

### 空间原生 vs 语义原生：视觉基础模型的范式分水岭

LingBot-Vision 最重要的贡献不是性能提升，而是提出"空间原生"视觉表征的范式——以几何结构为中心而非以语义分类为中心。传统视觉基础模型（DINOv3、CLIP）的掩码建模使用随机遮盖策略，模型学到的是物体的语义类别（"这是一个椅子"），而非几何结构（"这是一个具有四条腿和靠背的三维结构"）。LingBot-Vision 主动遮盖边界区域，迫使模型必须理解物体边界两侧的功能分区和三维几何关系。这种范式转换意味着下游任务不需要从语义表征中"解码"空间信息——空间信息从一开始就被编码在表征中。

### 自举难题与训练稳定性设计

边界遮盖面临一个"鸡生蛋"问题：模型一开始不知道边界在哪里，但边界遮盖又依赖边界预测。蚂蚁灵波团队的解法分两步：第一，给定稀疏角点后，即使边界场初始为随机值，解码出的线段仍然连贯合理——"边界结构先靠猜个大概的角点撑住"；第二，引入 a-contrario 检验将边界预测转为分类问题，自动过滤显著性不足的伪边界，防止训练信号被噪声淹没。这种"从粗到精"的自举策略避免了训练坍缩，是边界遮盖能实际运行的关键工程创新。

### 参数效率的根源：数据质量 > 数据规模

LingBot-Vision（1.1B）使用 DINOv3（7B）不到 1/10 的训练数据、不到 1/3 的训练量，在深度估计和分割任务上追平甚至超越 7B 模型。蒸馏后的 0.3B ViT-L 学生模型以 23 倍参数差追平 7B DINOv3。这种效率源于两个设计选择：第一，从 20 亿张图片中精选 1.61 亿张高质量子集，而非简单增量；第二，边界遮盖让每个训练样本的信息密度大幅提升——模型被迫从每个样本中学习几何结构，而非从大量样本中平均语义。

### 深度估计的实用化跃迁

LingBot-Depth 2.0 的改进不限于 benchmark 数字。从 DINOv2 初始化到 LingBot-Vision 初始化，DIODE-Indoor RMSE 从 0.152 降至 0.094（38% 提升）。更重要的是对透明/反光物体的表现——这类物体对传统深度估计是硬骨头（玻璃、水面、金属反光表面难以反射或吸收结构光），而 LingBot-Vision 的空间原生表征天然适合处理这类挑战。奥比中光将其集成至 EGO-RGBD 数采设备的商业化路径，进一步验证了技术成熟度。

### 从视觉到具身智能的桥梁

LingBot-Vision 的"空间原生"定位与 [具身智能](https://github.com/QianJinGuo/wiki/blob/main/concepts/robotics-embodied-ai.md) 的需求高度契合。具身智能体需要在三维空间中导航、操作、规划——这些任务的核心不是"识别物体类别"，而是"理解物体的空间位置和几何结构"。LingBot-Vision 提供的深度估计和几何理解能力，为机器人抓取、避障、场景重建等任务提供了比传统语义模型更直接的基础表征。这种"视觉 + 空间"的联合训练范式，可能比"视觉 + 语言"的 CLIP 路线更适合具身智能场景。

## 实践启示

1. **掩码策略是自监督学习的核心杠杆**：LingBot-Vision 证明了在自监督视觉学习中"遮什么"比"怎么遮"更重要。这一洞见可以直接迁移到其他自监督学习场景——无论是多模态学习（遮盖哪部分模态信息）、强化学习（遮盖哪些状态信息），还是图学习（遮盖哪些节点关系），主动选择高信息密度的遮盖区域是普适性的效率优化原则。

2. **小模型 + 高质量数据可以对抗大模型 + 大数据**：1.1B 参数 vs 7B 参数、1.61 亿 vs 16.89 亿训练样本，LingBot-Vision 的量级代差并未转化为能力代差。这提示视觉领域的资源分配策略应从"追求更大模型"转向"设计更高效的学习信号"——对于资源有限的团队，精炼数据配优化学信号比堆参数更明智。

3. **自举（bootstrapping）是视觉工程的必备思维**：模型初始时不知道边界，但稀疏角点+随机边界场仍然产出合理线段；训练过程中边界预测逐步精化，最终收敛到准确边界。这种"从粗到精"的自举循环是深度学习工程中处理"循环依赖"（model needs X, but X needs model）的通用范式。

4. **商业化验证是技术成熟度的试金石**：奥比中光集成 LingBot-Depth 2.0 并计划推出一体化相机产品，说明该技术已通过工业级验证（硬件集成、实时性、鲁棒性）。在评估计算机视觉技术时，商业化集成状态比学术 benchmark 更能反映技术的实际成熟度。

5. **具身智能需要重新定义"视觉"的任务目标**：传统视觉（分类、检测、分割）以语义理解为核心目标，而具身智能需要的是空间理解。LingBot-Vision 的"空间原生"范式可能预示着视觉基础模型的下一个演进方向——从"what is this"到"where is this and how is it structured"。

## 参考

- 技术报告: arXiv:2607.05247
- GitHub: https://github.com/robbyant/lingbot-vision
- 项目页: https://technology.robbyant.com/lingbot-vision

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/lingbot-vision-spatial-native-vision-foundation-model-ant.md)

---

## Ch18.006 啊？这是机器人的手？！

> 📊 Level ⭐⭐ | 7.6KB | `entities/啊这是机器人的手.md`

# 啊？这是机器人的手？！

## 摘要

1X Technologies 推出了一款 25 自由度、肌腱驱动的机器人手，搭载于其人形机器人 NEO 身上。该手采用准直驱（quasi-direct drive）肌腱传动架构，实现了力透明（force transparency）和全指尖触觉感知，定位精度 ±0.2mm，腕关节通过 200 万次循环耐久测试，具备 IP68 防护等级。2026 年产能目标 1 万只，已进入规模量产阶段。

## 核心要点

- **25 自由度肌腱驱动**：手指与手掌共 22 个全驱动自由度，腕部 3 个自由度，全部原生力控、全部可反驱
- **准直驱架构**：传动比压至 5:1–15:1（行业常见 100:1–200:1），力从指尖流出，信息沿同一条物理路径流回，实现"力透明"
- **全指尖触觉感知**：高分辨率触觉传感器覆盖指尖和接触面，可感知法向力、接触位置和剪切力，实时检测滑动并自适应重抓取
- **高精度与高耐久**：定位精度 ±0.2mm，腕关节 200 万次循环测试通过，IP68 防水防尘，材料达食品安全级别
- **大规模量产**：已量产数百只，2026 年产能目标 1 万只，每只须通过完整下线测试

## 深度分析

### 架构革命：从"只写不读"到"力透明"

传统机器人手普遍采用 100:1 甚至 200:1 的齿轮减速比。这一设计将接触力"吞"入摩擦中——力学信号还没传回电机就已经消失了，导致手本身处于"麻木"状态，工程师只能依靠外部摄像头用视觉去推测指尖发生了什么。这种设计本质上把机械手降级为"只写"设备（仅发出位置指令），而非"读写"设备。

1X 的准直驱肌腱传动将传动比压缩到 5:1–15:1 之间。力从指尖向外输出，信息沿同一条物理路径反向流回。每个关节均采用闭环控制，手随时能够精确感知自身构型——类比于人类闭着眼睛也能让两只食指准确对碰。这种"力透明"设计将每一次推、按、捏都变成了一次测量，使机械手本身成为传感器，而非执行器。

### 自由度分配的设计哲学

25 个自由度的配置参照了人手解剖结构，核心着力点在于强化拇指的对掌能力——这是人类实现精细操作的解剖学基础。其中手指和手掌占据 22 个全驱动自由度，腕部 3 个自由度。1X 表示这套构型是在操作能力、可制造性、可控性和可维修性之间取得的最优平衡。

覆盖的操作范围极为广泛：组装乐高积木、从钱包中拣出单枚硬币和螺丝、旋转并安装灯泡、使用螺丝刀、在手掌内旋转物体、拉上夹克拉链、按颜色分拣葡萄、用水壶倒茶、接住软球、插入 USB-C 充电线，甚至能够打手语。力矩参数同样对标人类日常操作需求：拇指掌腕关节峰值扭矩 3.5 Nm，指尖屈曲力达 45N，腕部扭矩 17.75 Nm，足以支持开门、推载重推车、提重物及工具操作。

### 触觉感知：超越视觉的闭环能力

对于小型、透明、可形变或被遮挡的物体，仅靠视觉远远不够。1X 在指尖和接触面部署了高分辨率触觉传感器，可感知法向力（normal force）、接触位置（contact position）和剪切力（shear force）。当物体开始滑动时，手能实时检测并调整抓取策略。这层"皮肤"不是事后附加的传感器层，而是与内部肌腱和驱动系统协同设计的功能材料。

可视化画面中系统能够实时呈现接触法向量、握手时的压力热力图，以及在完全不对物体造成损伤的前提下捏起脆弱折纸的过程——这项能力已经接近人类的触觉闭环水平。力反馈之上还叠加了本体感觉：因为每个关节都是闭环控制，手随时知道自己的构型，不需要依赖外部视觉辅助。

### 量产即规模化智能的前提

1X 的核心战略逻辑是：没有规模出货的硬件就跑不出规模化的真实数据，没有规模化的数据就没有具身智能。手的电机藏在前臂中（与人类握力肌群的解剖位置一致），通过专有肌腱穿过腕部拉动手指。这一布局使手部自身维持轻量，同时能够在连续作业中保持高出力而不过热。

整只手采用深度垂直整合策略：自研电机、定制电子元件、嵌入式传感器、专有肌腱系统、紧凑传动机构、手部专用固件，全部由 1X 内部设计制造。从肌腱材料到最外层的软性聚合物和触觉感知层，端到端自研。耐久性方面，腕关节在高负载下通过了超过 200 万次循环测试，驱动单元经过极端温度验证，防护等级达 IP68，材料符合食品安全标准，脏了可以自行冲洗。

### 机械层面的安全设计

安全性主要依赖机械本身而非软件传感器：极低的传动比加上肌腱驱动和低远端惯量，使外部冲击可以安全地反驱手指。在 1X 展示的慢动作画面中，手被拍打、被锤子敲击、被抽屉夹住、砸进泡沫塑料，都能顺从退让而不损坏。这种"机械安全"设计比基于碰撞检测传感器的方案更可靠、延迟更低。

## 实践启示

1. **力透明是具身智能的关键基础设施**：传统"以视觉为主、力觉为辅"的设计范式在遮挡、透明物体和精细操作场景中存在本质缺陷。将力觉提升为第一性传感器，是机器人从"能看"到"能摸"的质变门槛。

2. **低传动比不是性能妥协，而是安全与感知的设计选择**：准直驱架构虽然牺牲了极限力矩密度，但换来了力感知的透明度和机械安全性。这种机械层面的"顺从"是物理人机交互安全的基础保障。

3. **量产能力决定了具身智能的数据飞轮能否启动**：没有万只级别的年产能，就无法支撑真实世界的大规模数据采集。1X 的端到端垂直整合提供了从硬件到数据的闭环，这是当前行业中容易被低估的核心竞争壁垒。

4. **仿生学设计需要工程化取舍**：25 自由度 + 肌腱驱动 + 准直驱的组合并非简单照搬人手，而是在借鉴人手解剖结构的基础上，在可制造性、可控性、可维修性和性能之间做了系统性的工程权衡。

5. **安全应该内建于机械而非依赖软件**：通过极低传动比、肌腱驱动和低远端惯量的组合，使外部冲击可以安全地被反驱吸收。这种设计比任何基于传感器的碰撞检测方案都更可靠、延迟更低。

## 相关实体

- [具身智能新阶段](https://github.com/QianJinGuo/wiki/blob/main/entities/embodied-native-llm-embodied-intelligence-new-stage.md)
- [NVIDIA Isaac Lab + SageMaker 人形机器人强化学习](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md)
- [SymSkill 机器人长程操作技能](https://github.com/QianJinGuo/wiki/blob/main/entities/icra26-symskill-robot-long-horizon-manipulation.md)
- [Genesis AI Gene.25 具身基础模型](https://github.com/QianJinGuo/wiki/blob/main/entities/genesis-ai-gene-25-embodied-foundation-model.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/啊这是机器人的手.md)

---

## Ch18.007 Unitree's IPO Filing: The State of the Robotics Market

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
- [Cloudflare Glasswing Mythos Security](https://github.com/QianJinGuo/wiki/blob/main/entities/cloudflare-glasswing-mythos-security.md)
- [A 0 Click Exploit Chain For The Pixel 10 When A Door Closes A Window Opens](https://github.com/QianJinGuo/wiki/blob/main/entities/a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes-a-window-opens.md)
- [Fine Tuning Nvidia Cosmos Predict 25 With Loradora For Robot Video Generation](https://github.com/QianJinGuo/wiki/blob/main/entities/fine-tuning-nvidia-cosmos-predict-25-with-loradora-for-robot-video-generation.md)
- [User Interviews Guide Pro](https://github.com/QianJinGuo/wiki/blob/main/entities/user-interviews-guide-pro.md)
- [估值3000亿63家新实验室杀疯了Murati贝佐斯集体押注下一代Ai](https://github.com/QianJinGuo/wiki/blob/main/entities/估值3000亿63家新实验室杀疯了murati贝佐斯集体押注下一代ai.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/unitree-ipo-robotics-market.md)

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
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/unitree-ipo-robotics-market.md)

---

## Ch18.008 蔚蓝BabyAlpha A3消费级机器狗

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
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/weilan-babyalpha-a3-machine-dog.md)
- → [Yann LeCun JEPA世界模型](https://github.com/QianJinGuo/wiki/blob/main/entities/yann-lecun-jepa-world-model.md) — AMI Labs具身智能方向
- → [NVIDIA边缘端LLM for机器人](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-edge-first-llms-av-robotics.md) — 英伟达边缘AI方案对比

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

## Ch18.009 Google DeepMind Robotics Accelerator（欧洲版，3 个月计划，15 家初创）

> 📊 Level ⭐⭐ | 5.0KB | `entities/powering-the-future-of-robotics-in-europe-deepmind-2026-06.md`

# Google DeepMind Robotics Accelerator（欧洲版，3 个月计划，15 家初创）

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/powering-the-future-of-robotics-in-europe.md)

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

## Ch18.010 NVIDIA Isaac Lab + Amazon SageMaker AI：机器人强化学习训练基础设施（Humanoid RL Scale-up）

> 📊 Level ⭐⭐ | 3.9KB | `entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md`

# NVIDIA Isaac Lab + Amazon SageMaker AI：机器人强化学习训练基础设施（Humanoid RL Scale-up）

## 相关实体

- [farewell ai2](https://github.com/QianJinGuo/wiki/blob/main/entities/farewell-ai2.md)
- [无惧off-policy偏移！bengio团队解绑后训练，大模型rl提速50倍](https://github.com/QianJinGuo/wiki/blob/main/entities/trajectory-balance-asynchrony-tba-bengio-papweekly.md)
- [sft, rl, and on-policy distillation through a distributional](https://github.com/QianJinGuo/wiki/blob/main/entities/untitled-v2.md)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on-.md)

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

- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](https://github.com/QianJinGuo/wiki/blob/main/entities/scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on-.md)
- [Latest Open Artifacts 20 New Orgs New Types Of Models With N](https://github.com/QianJinGuo/wiki/blob/main/entities/latest-open-artifacts-20-new-orgs-new-types-of-models-with-n.md)
- [Fundamentals Large Tabular Model Nexus Is Now Available On A](https://github.com/QianJinGuo/wiki/blob/main/entities/fundamentals-large-tabular-model-nexus-is-now-available-on-a.md)
- [5238213](https://github.com/QianJinGuo/wiki/blob/main/entities/5238213.md)
- [腾讯混元新里程碑Hy3 Preview 发布开源Agent 表现全面提升](https://github.com/QianJinGuo/wiki/blob/main/entities/腾讯混元新里程碑hy3-preview-发布开源agent-表现全面提升.md)
- [Code As Agent Harness Survey](https://github.com/QianJinGuo/wiki/blob/main/entities/code-as-agent-harness-survey.md)

## 实践启示

1. **Agent 设计**: 关注控制流与上下文工程的平衡，Harness 约束比模型能力更影响成功率
2. **可观测性**: Agent 行为调试应优先检查工具定义和上下文质量
3. **渐进式部署**: 从简单 ReAct 循环起步，逐步引入多 Agent 编排
4. **验证优先**: 建立完善的测试验证体系，确保 Agent 行为可预测

---

## Ch18.011 蔚蓝BabyAlpha A3消费级机器狗撕开英伟达垄断

> 📊 Level ⭐⭐ | 3.7KB | `entities/weilan-babyalpha-a3-machine-dog.md`

# 蔚蓝BabyAlpha A3消费级机器狗撕开英伟达垄断

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/weilan-babyalpha-a3-machine-dog.md)

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

- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](https://github.com/QianJinGuo/wiki/blob/main/entities/ethan-he-cosmos-grok-imagine-latent-space-video-agent-20260606.md)
- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](https://github.com/QianJinGuo/wiki/blob/main/entities/scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on-.md)
- [你不知道的 Agent原理架构与工程实践 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/你不知道的-agent原理架构与工程实践-v2.md)
- [Nvidia Isaac Lab Sagemaker Robot Rl Humanoid](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md)
- [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/龙虾装上了可以用来干啥分享下我的-openclaw-多智能体团队搭建经验-v2.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏-v2.md)

## 实践启示
1. **工程落地**: agent领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

---

## Ch18.012 原力灵机 DM0.5：4B 具身基础模型，Zero-Shot 提升 31%

> 📊 Level ⭐⭐ | 3.6KB | `entities/lingbot-dm05-4b-embodied-foundation-model-zero-shot-2026.md`

# 原力灵机 DM0.5：4B 具身基础模型，Zero-Shot 提升 31%

> **DM0.5** 是原力灵机（LingBot / 蚂蚁灵波）于 2026 年 7 月发布的具身基础模型（Embodied Foundation Model），定位为面向开放世界的通用具身基础模型。与上一代 DM0 相比，参数量翻倍至 4B，数据量增加 400%，Zero-Shot 性能提升 31%。

## 模型架构

DM0.5 参数量为 4B，相比 DM0 翻倍。其核心设计围绕"更大、更强、更实用"展开，目标是支撑数据飞轮在真实场景中高效运转。

## 训练数据组成

DM0.5 的数据策略采用三类高质量数据的混合架构，总计约 15 万小时：

- **真机数据**（5 万小时）：高精度操作数据，覆盖 100 多种动作，支持秒级精细指令动作对齐
- **Ego 数据**（10 万小时）：第一视角数据，支持毫米级高精度 3D Landmark 生成
- **场景重建数据**（100 万平方米空间数据）：复杂室内环境建模，降低 Sim2Real Gap

## 数据飞轮策略

DM0.5 的设计核心是将被动"采集型数据"转变为真实业务中持续产生的"场景型数据"。原力灵机与物流机器人公司 Atomix 完成合并后，补上了真实场景侧的关键拼图，使数据飞轮从循环论证走向工程落地。

## 相关实体

- [LingBot-Video 具身专属 MoE 视频模型](https://github.com/QianJinGuo/wiki/blob/main/entities/lingbot-video-moe-embodied-video-2026.md) — 蚂蚁灵波同期发布的具身视频基础模型
- [LingBot-VLA 2.0](https://github.com/QianJinGuo/wiki/blob/main/entities/lingbot-vla-2-60000h-open-source-vla.md) — 蚂蚁灵波 60,000 小时开源 VLA 模型
- [具身智能 Sim2Real](https://github.com/QianJinGuo/wiki/blob/main/entities/embodied-intelligence-sim-to-real-active-inference-behavior-tree-intrinsic-motivation-chenzhiyan-2026-06-17.md) — 具身智能领域的 Sim2Real 与行为树方法

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/zero-shot提升31原力灵机dm05登场15万小时数据喂出.md)

## 第 2 来源 — 机器之心（2026-07-09）

> 本来源提供了 DM0.5 在**长记忆、抗干扰、Zero-Shot 泛化**方面的深度分析，重点讨论了 VLA 模型走出实验室环境后面临的真实世界挑战。

### VLA 模型的真实世界挑战

DM0.5 将 VLA（视觉-语言-动作）模型从精心搭建的"剧本环境"推向真实场景。真实世界中光照变幻、视角漂移以及人类随意干扰，使得纯实验室环境下训练的模型泛化性不足。

### 关键技术特性

- Zero-Shot 泛化：无需特定场景训练即可应对新环境
- 长记忆机制：跨 session 保持对环境和任务的理解
- 抗干扰能力：在人类随意干扰下保持稳定的操作性能

→ [第 2 来源原文](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/zero-shot长记忆抗干扰dm05把vla带进真实世界.md)

---

## Ch18.013 机器人端杯子之前在想什么？Afford-VLA：先找到杯子最趁手的那块区域

> 📊 Level ⭐⭐ | 3.2KB | `entities/机器人端杯子之前在想什么afford-vla先找到杯子最趁手的那块区域.md`

# 机器人端杯子之前在想什么？Afford-VLA：先找到杯子最趁手的那块区域

> **Afford-VLA** 是由复旦大学、阿卜杜拉国王科技大学、上海交通大学和华东师范大学联合提出的视觉规划框架。它将可供性（affordance）内化进 VLA 系统内部，让模型自己生成任务相关的交互区域，并将这些局部视觉线索直接送入动作生成模块，使机器人从「看完整张图再猜动作」走向「先找出当前任务该交互的位置，再生成动作」。

当前许多 VLA 模型语义理解虽强，但空间交互理解不够精细。机器人「知道物体是什么，不等于知道该在哪里交互」。Afford-VLA 将这个问题放在视觉规划框架中重新审视，提出适合 VLA 的视觉规划应具备四个特性：Local（聚焦任务相关局部区域）、Visually Grounded（直接围绕图像视觉证据）、Internally Generated（由 VLA 内部生成而非级联外部模型）、Action-aligned（直接服务于下游动作决策）。

## 核心设计

Afford-VLA 包含三个关键步骤：

**第一步**，引入可学习的 query 作为「交互区域探针」，与视觉和语言信息一起进入 VLM backbone 融合，随后由 Affordance Head 解码出 patch 级 affordance logits。

**第二步**，通过 mask pooling 根据预测的 affordance logits 选出最相关的局部视觉 patch，聚合为紧凑的 affordance embedding，拼接进动作生成头——让动作头同时获得全局语义表示和局部交互提示。

**第三步**，使用 Straight-Through 风格的 Top-K mask pooling，前向传播保持稀疏 Top-K 选择，反向传播使用可微的软替代梯度，让动作预测损失能够反向更新 affordance logits——模型学到的 affordance 不只是「哪里像交互区域」，而是「哪些区域真的能帮助机器人把动作做好」。

在 LIBERO、LIBERO-Plus、SimplerEnv 等多个基准上，Afford-VLA 取得了 SOTA 表现，在空间关系、目标定位和分布偏移场景中展现出优秀的鲁棒性。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/机器人端杯子之前在想什么afford-vla先找到杯子最趁手的那块区域.md)

---

## Ch18.014 TouchWorld: 触觉基础模型与灵巧操作 — 破晓智能/哈工大

> 📊 Level ⭐⭐ | 3.0KB | `entities/poxiaointelligent-tactile-robot-foundation-model-2026.md`

# TouchWorld: 触觉基础模型与灵巧操作 — 破晓智能/哈工大

破晓智能（PHANES AI）与哈工大（深圳）杨朔教授团队发布 TouchWorld，一种兼具预测与反应能力的触觉基础模型，面向机器人灵巧操作。

TouchWorld 让触觉同时承担两种角色：行动前预测"应该碰成什么样"，接触后再根据真实反馈快速纠错。模型不仅预测未来画面，还同时预测未来触觉图——哪根手指应产生压力、接触强度应达到什么状态。

在浇花、桌面清理、电源插头插入、杯子插入、擦锅、抽纸巾六项真机任务中，TouchWorld 在无额外干扰场景下取得 65.0% 的平均成功率；加入目标移动、抓握干扰等扰动后成功率为 57.2%，分别超过最强基线 15.7 和 16.0 个百分点。每项任务采集 200 条遥操作训练轨迹，并进行 100 次真机评测。

创始人杨朔曾获 Google PhD Fellowship（全球 9 人之一），博士阶段工作入选 ICLR Best Paper Finalist，26 岁任哈工大（深圳）长聘教授、博导，同年获评国家级青年人才。→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/poxiaointelligent-tactile-robot-foundation-model-2026.md)

## 第 2 来源 — 量子位

量子位对破晓智能（PHANES AI）的报道聚焦于其创始人杨朔的创业故事和技术路线全貌。杨朔（26 岁哈工大长聘教授、博导，Google PhD Fellowship 获得者）创办破晓智能，围绕"机器人如何真正学会操作"搭建从数据、模型到控制的完整能力链。

报道详细介绍了 Touch 系列技术路线：EgoTouch（触觉数据采集）→ TouchAnything（从视频恢复触觉）→ TouchWorld（触觉世界模型）→ HumanWBC（全身移动灵巧操作控制），构成一条从数据到世界模型再到全身控制的完整链路。

TouchWorld 的核心架构包含 Predictive（触觉目标预测）和 Reactive（高频触觉反馈修正，频率为 World Model 的 4 倍）两个模块，在浇花、拔插头、擦锅等六项真机任务中达 65.0% 平均成功率。

→ [第 2 来源原文](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/98-哈工大杨朔破晓智能touchworld-tactile-world-model-2026.md)

---

## Ch18.015 具身智能空间视觉死穴，终于被最新顶会彻底解决！

> 📊 Level ⭐⭐⭐ | 9.0KB | `entities/具身智能空间视觉死穴终于被最新顶会彻底解决.md`

# 具身智能空间视觉死穴，终于被最新顶会彻底解决！

> 招商局先进技术研究院下属狮子山人工智能实验室在 IROS 2026 发表论文，首次系统性揭示了 VLA 模型普遍存在的「三重隐性耦合」——相机稍微挪动几毫米，操作成功率就能从 90%+ 暴跌到 30% 以下。提出的「运动之眼」混合动态数据采集策略，让相机在采集中持续运动，以极低成本破解 VLA 的空间泛化瓶颈，且效果普适于 ACT、Diffusion Policy、π0、Gr00t 等主流架构。

## 核心要点

- **问题诊断**：VLA 模型并非真正「看懂了」空间关系，而是在「背」训练数据中的虚假相关性。相机移动几毫米、物体平移一个直径的距离，成功率可暴跌 50% 以上
- **三重隐性耦合**：相机-基座耦合（模型记住画面固定坐标而非物体位置）、相机-物体耦合（模型依赖特定角度识别物体）、物体-位置耦合（模型学到固定相对位置而非语义操作）
- **核心解法**：让环境相机在数据采集时沿连续轨迹运动（「运动之眼」），配合多固定视角数据按最优比例（Gr00t 上 k=3）混合，综合性能最高提升 26.8%
- **跨任务迁移能力**：模型从「抓放笔」任务学到的空间感知能力可「移植」到从未见过的多物体抓取场景——仅用等量多视角数据替代一半数据，成功率从 43% 跃升至 83%

## 问题：VLA 模型的「虚假鲁棒性」

### 三重隐性耦合

研究团队识别出 VLA 模型普遍存在的三种捷径学习（Shortcut Learning）模式：

**耦合 1：相机-基座耦合（Camera-Base Coupling）**。模型并没有真正学会「桌面上笔在哪里」，而是记住了「笔在画面右下角 1/4 处」的固定规律。相机位置一变，画面中相对坐标全变，模型立刻「失忆」。相机视角变化后成功率从 85% 降至 43%。

**耦合 2：相机-物体耦合（Camera-Object Coupling）**。模型依赖特定角度来识别物体，从不同角度看到的同一个物体对模型来说是「两个完全不同的东西」。

**耦合 3：物体-位置耦合（Object-Position Coupling）**。即使使用多视角数据，如果笔和笔筒的相对位置始终固定，模型就会学到「往右边 10cm 处放」这个捷径，而非真正理解「放进笔筒」的语义。笔筒仅平移一个直径距离，成功率就从 95% 暴跌到 72%。

## 解法：运动之眼混合数据范式

### 层次化数据解耦策略（Hierarchical Data Decoupling）

研究团队将数据采集分为三种相机配置：
- **固定视角（Fixed View）**：基线方案，数据一致性好但多样性差
- **多固定视角（Multi-Fixed）**：多个离散固定视角提供一定多样性，收敛性好（Gr00t 成功率 80.5%）
- **移动视角（Moving View）**：相机沿连续轨迹运动，提供稠密、近似均匀的多视角采样，彻底打破三种耦合关系

### 混合动态数据采集策略

单独使用移动视角带来新问题：视觉输入方差过大，策略难以收敛（Gr00t 仅 54.8%）。最终方案是**多固定视角数据与移动视角数据按比例 1:k 混合**，形成互补。通过系统搜索，Gr00t 上最优配比 k=3 取得 89.0% 的最佳表现。多固定视角提供收敛性，移动视角提供多样性，两者互补优于任何单一范式。

### 跨架构普适性

混合数据方案在 ACT、Diffusion Policy、π0、Gr00t 等主流 VLA 模型上均有效——各类模型综合性能最高提升 26.8%。这证明空间泛化脆弱性和捷径学习是 VLA 的普遍特征，不是某个模型的个别缺陷。

## 深度分析

### Shortcut Learning 是 VLA 落地的最隐蔽障碍

VLA 模型在标准评测中动辄 90%+ 的成功率，但相机视角轻微变化后就崩溃——这不是个别现象，而是多个国内外团队（斯坦福-谷歌 Genralization-Gap 项目、同济-复旦 LIBERO-Plus）的一致发现。研究团队的贡献在于首次系统性地将这种脆弱性归结为三重隐性耦合，并提供了精确的量化诊断。最关键的是第三种耦合（物体-位置耦合）：即使用了多视角数据，如果物体间相对位置固定，模型依然会学捷径。这意味着「增加数据量」并不够——必须系统性地设计数据分布，消除所有虚假相关性。

### 「运动之眼」范式的工程意义

让相机运动起来采集数据，在直觉上增加了数据采集的复杂度和变数。但研究发现，移动视角相对于多固定视角的核心优势在于：在同等数据量下提供了更稠密、近似均匀的多视角采样。当相机在每一集数据中都沿不同轨迹运动时，画面中的背景、物体观察角度、相对位置在帧与帧之间持续变化——模型再也无法依赖任何固定的视觉规律来「作弊」。这项工作的工程智慧在于：它不需要修改任何模型结构，只改变数据采集方式，就能大幅提升空间泛化能力。这种「不修改模型、只改变数据」的范式，在实际部署中具有极高的可行性。

### 空间感知能力的跨任务迁移

最令人兴奋的发现是空间感知能力的「借用」机制：模型从「抓放笔」任务中学到的空间感知能力，可以被泛化到从未见过的多物体抓取场景。用等量的多视角笔任务数据替代一半固定视角数据，多物体抓取成功率从 43% 跃升至 83%——相当于用一半的数据就达到了全量采集的效果。这意味着空间感知能力不是绑定于某个具体任务的专属属性，而是一种可迁移的通用「视觉素养」。这一发现在实际部署中具有重要价值：只需为一个「代表任务」采集多视角数据，就能将空间感知能力低成本地扩展到数十个其他任务。

## 实践启示

1. **VLA 的空间泛化问题被系统性低估**：标准评测中的 90%+ 成功率可能构成「虚假鲁棒性」。在部署机器人系统前，应在相机视角变化条件下重新评估基线性能——如果视角变化后崩溃，说明模型在背数据而非真正理解空间。
2. **数据采集方式比模型架构更重要**：本文在不修改任何模型架构的前提下，仅改变数据采集方式（让相机运动起来），就取得了 26.8% 的性能提升。对于实际机器人系统部署，数据采集策略往往比模型选择影响更大。
3. 「代表任务」策略降低数据成本**：不必为每个任务采集多视角数据。选择一个代表性的操作任务采集多视角数据，空间感知能力可以跨任务迁移。这是降低数据采集成本的有效工程策略。
4. **混合数据优于单一范式**：纯移动视角导致训练不稳定（54.8%），纯多固定视角泛化有限（80.5%），两者按最优比例混合达到最佳（89.0%）。在实际系统设计时，应系统性搜索最优混合比例。
5. **三重耦合诊断框架可推广**：相机-基座、相机-物体、物体-位置三种耦合的分析框架不仅适用于桌面操作任务，也可推广到家庭服务、工业装配、仓储分拣等更广泛的场景——任何涉及视觉引导操作的机器人系统都应检查这三类耦合。

## 相关实体

- **具身智能** — 具身智能领域的整体技术路线，覆盖 VLA 模型、世界模型、数据基础设施等方向
- [景烁科技 — 具身智能数据基础设施](https://github.com/QianJinGuo/wiki/blob/main/entities/jingshuo-tech-embodied-ai-data-infrastructure-2026.md) — 具身智能数据的工业级基础设施建设方案
- [BAAI ORCA — 下一状态预测世界模型](https://github.com/QianJinGuo/wiki/blob/main/entities/baai-orca-next-state-prediction-world-model.md) — 世界模型在物理 AI 中的应用

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/具身智能空间视觉死穴终于被最新顶会彻底解决.md)

---

## Ch18.016 ICRA'26双奖加冕！华人博士生重新定义机器人长时程操控

> 📊 Level ⭐⭐⭐⭐ | 8.2KB | `entities/icra26-symskill-robot-long-horizon-manipulation.md`

# ICRA'26双奖加冕！华人博士生重新定义机器人长时程操控

## 摘要

ICRA 2026 最佳论文奖授予了一项关于机器人长时程操控的突破性研究。由宾夕法尼亚大学 GRASP 实验室华人博士生 Yifei Shao（邵逸飞）领导提出的 **SymSkill** 框架，将模仿学习与运动规划深度融合，使机器人能够从极少量演示中自主归纳可复用的技能原语，并实时组合执行复杂的多步骤操作任务。该工作一举斩获 Best Conference Paper Award 和 Best Paper Award on Planning and Control 两项最高荣誉，在 ICRA 历史上较为罕见。

## 核心技术架构

SymSkill 的核心创新在于**对称性引导的技能组合**，将复杂操作分解为可复用的原子技能原语，并通过规划层将这些原语组合为完整的操作序列。其完整架构分为两个阶段：

### 离线阶段：符号与技能共创

与以往需要人工标注和分割演示数据的方法不同，SymSkill 能够直接从**无标签、无分割**的机器人演示数据中，以无监督的方式联合学习谓词、操作符和目标导向技能。这意味着机器人只需要观看少量演示（每个任务仅需约 **5 次演示数据**），就能自行归纳出完成任务所需的符号抽象和技能库。

### 在线阶段：实时组合与恢复

执行时，一旦用户指定一个或多个目标谓词，SymSkill 就会调用符号规划器来动态组合和重排已学技能以达到符号目标，同时在运动层级和符号层级同时执行故障恢复。配合柔顺控制器，SymSkill 能够在人类和环境扰动下实现安全、不间断的执行。

## 实验表现

在 RoboCasa 模拟环境中，SymSkill 成功执行了 12 个单步任务，成功率达 **85%**；面对需要多达 6 次技能重排的多步复杂任务时，SymSkill 仍能从执行失败中稳健恢复。

最令人瞩目的真实机器人实验：在一台真实的 Franka 机器人上，SymSkill 仅用 **5 分钟**的无分割、无标签玩耍数据作为训练素材，仅通过目标指令即可操控机器人执行多种任务。这种数据效率在此前的规划系统中几乎不可想象。

## 深度分析

### 1. 模仿学习与经典规划融合的范式突破

SymSkill 的最重要贡献不在于提出了某种新的神经网络架构，而在于它在长期对立的两大技术流派之间搭建了一座桥梁。模仿学习（尤其是行为克隆）反应迅速但缺乏组合泛化能力——学到的往往是"单一体策略"，环境稍有变化就无法拆解复用旧技能。经典的任务与运动规划（TAMP）虽然有良好的符号抽象和组合能力，但规划延迟动辄数十秒甚至上百秒，根本无法支持实时故障恢复。

SymSkill 的"离线符号共创 + 在线实时执行"架构，实质上是将 TAMP 的组合泛化优势与模仿学习的数据效率优势结合起来，在抽象层面解决了"从记忆中提取行为"到"从理解中推导行为"的跃迁问题。这与 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 中的"规划与执行分离"原则有异曲同工之妙——离线阶段负责抽象建模（规划），在线阶段负责快速响应（执行），两个阶段用同一套符号系统衔接。

### 2. 无监督符号学习的关键突破

以往机器人操作研究中的一个关键瓶颈是：符号抽象（谓词、操作符）需要人工设计和标注，这不仅成本高昂，而且限制了系统的可迁移性。SymSkill 的无监督符号学习方法从根本上改变了这一局面——系统从原始的连续运动轨迹中自动发现离散的符号结构，这种"从连续到离散"的自动化能力是通向通用机器人操作的关键一步。

### 3. 数据效率的实际意义

5 分钟的无标签数据——这个数字对于机器人学习领域具有深刻的实践意义。当前大多数机器人操作方法需要数百甚至数千次演示才能学会一个任务，这使得部署成本极高。SymSkill 的数据效率意味着：未来的机器人可以在非结构化环境中通过极少量的"玩耍式交互"快速适应新任务，而不是需要精心设计的大规模数据收集流程。

### 4. 与具身智能前沿的关系

SymSkill 的成功呼应了具身智能领域的一个重要趋势：从"端到端"的纯神经网络方法向"神经符号混合"架构的回归。类似的工作还包括 [NVIDIA EnPire](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-enpire-agentic-robot-policy-self-improvement.md) 和 [NVIDIA Cosmos](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-cosmos-fine-tuning-robot-video-generation.md)，它们都在不同程度上将符号推理与学习结合，以克服纯数据驱动方法的泛化瓶颈。这表明 2026 年机器人学习领域的一个共识正在形成——语言模型时代的机器人控制，需要在数据规模与结构先验之间找到新的平衡点。

## 实践启示

1. **为数据效率设计，而非为数据规模设计**：SymSkill 证明 5 分钟的无标签数据足以学习复杂操作技能。研究者和工程师应当在算法层面优先考虑数据效率（如无监督预结构化、符号抽象），而非单纯追求更大规模的训练数据集。

2. **模仿学习 + 规划的组合优于任何单一方法**：纯模仿学习缺乏组合泛化，纯规划缺乏实时性。SymSkill 的"两阶段"架构提示我们：机器人系统的设计应有意地混合不同技术范式，用各范式的优势互补来弥补各自的缺陷。

3. **符号抽象是通向组合泛化的桥梁**：SymSkill 从数据中自动学习的符号谓词和操作符，使得系统能够"理解任务结构"而非"记忆动作序列"。在构建更通用的机器人系统时，保留或自动发现某种形式的符号抽象层至关重要。

4. **故障恢复能力是系统稳健运行的关键**：SymSkill 在运动层级和符号层级同时执行故障恢复，配合柔顺控制器实现安全执行。这一点与 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering-2026-why-it-matters.md) 中的"反馈回路"原则高度一致——任何自动化系统都需要在多个层级内置故障检测和恢复机制。

5. **关注 ICRA 等顶会的最佳论文方向**：ICRA 2026 两项大奖集中在一篇论文，表明"学习 + 规划"融合范式是当前机器人操作领域的核心趋势。跟踪这些获奖工作可以为机器人研发方向提供战略参考。

## 相关实体

- [NVIDIA EnPire — 机器人策略自改进](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-enpire-agentic-robot-policy-self-improvement.md)
- [NVIDIA Cosmos 机器人视频生成微调](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-cosmos-fine-tuning-robot-video-generation.md)
- [NVIDIA 边缘优先 LLM 在机器人和自动驾驶中的应用](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-edge-first-llms-av-robotics.md)
- [NVIDIA Isaac Lab 机器人强化学习](https://github.com/QianJinGuo/wiki/blob/main/entities/scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on-.md)
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [为什么 2026 年真正重要的是 Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering-2026-why-it-matters.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/icra26双奖加冕华人博士生重新定义机器人长时程操控.md)

---

## Ch18.017 具身原生世界动作模型（Embodied World Action Model）

> 📊 Level ⭐⭐⭐⭐ | 7.4KB | `entities/全球首个具身原生世界动作模型来了.md`

# 具身原生世界动作模型（Embodied World Action Model）

全球首个「具身原生」世界动作模型（Embodied World Action Model）——蚂蚁灵波 LingBot-VA 2.0 正式发布。该模型直接从物理世界的交互数据中学习动作表征，无需依赖传统的仿真环境或人工标注数据，标志着具身智能从"动作模仿"迈向"因果理解"的关键转折。

## 技术突破

该世界动作模型将视觉感知、语言理解和动作生成统一在一个原生架构中，模型直接从真实世界的交互数据学习，能够预测动作后果并规划多步操作。这是具身智能领域向通用机器人学习迈出的重要一步。

## 深度分析

### 「具身原生」设计哲学：从数字嫁接到底层重构

LingBot-VA 2.0 的核心创新在于"具身原生"（Embodied Native）设计理念。此前主流的机器人模型路线依赖于数字世界预训练模型（如视频生成模型或大语言模型）的迁移微调，本质上是"嫁接"方案——用数字世界的知识补物理世界的场景。LingBot-VA 2.0 则从数据、训练目标到模型架构每一层都为物理世界操作而生：采用自回归视频模型从零开始预训练，避免双向注意力架构强行改为因果架构时的「灾难性遗忘」问题。

这一技术路线的选择在工程哲学层面具有深远意义：当模型从底层就在学习物理世界的因果关系（因果建模）而非仅仅是视觉相关性（下一帧预测），机器人的行为边界从被动反应式的"画面匹配"跃迁为主动推理式的"动作规划"。在概念层面上，这与 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 框架中的"系统级因果推理"理念高度一致——两者都强调从底层构建可解释的因果链接而非表面行为的堆叠。

### 语义视觉-动作分词器：跨越感知与执行的翻译鸿沟

模型配有一个关键的「语义视觉-动作分词器」（Semantic Vision-Action Tokenizer），将画面和动作统一翻译为同一种语言表达。这一设计解决了机器人领域由来已久的"看到的画面"与"要做的动作"之间的语义鸿沟。技术上的精妙之处在于：一旦画面和动作使用同一套「词汇」表达，任意一段无标注的互联网视频都可以作为模型的预习材料——模型能从其中"读出"与物理世界交互相关的门道。这意味着训练数据的来源从昂贵的真机采集，扩展到整个互联网视频语料库。

这与多模态基础模型的发展方向一致：通过统一的语义空间来对齐异构数据源，预训练阶段学习通用的物理直觉，再用少量真机数据进行微调对齐。

### 异步 Foresight 推理与四层加速堆栈

LingBot-VA 2.0 的推理架构采用异步 Foresight 推理机制——"边想边动"而非"想完再动"。模型在执行当前动作的同时，持续预判未来几秒的物理状态变化，并根据真实观测实时校准。这种设计将预测延迟隐藏在执行过程中，使异步控制频率从传统方案的 35Hz 提升到了 225Hz。

在工程实现上，模型经过一致性蒸馏、低精度编译、长序列注意力优化和运行时开销压缩四重加速，单 chunk 推理时间从 927ms 降至 142ms。在 RoboTwin 2.0 仿真基准上，平均成功率达到 93.6%，显著优于 π0.5 的 79.8%。更关键的是，干净环境和随机化环境的表现差距仅为 0.4 个百分点，显示出对真实世界噪声的良好鲁棒性。

### MoE 架构：130 亿参数下的高效推理

模型采用 MoE（Mixture of Experts）稀疏架构，视频骨干总参数约 130 亿，但推理时每个 token 仅激活约 19 亿参数。这种按需激活的设计在保持模型容量的同时，大幅降低了部署门槛——单张消费级显卡即可运行。从 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 视角看，这是典型的"能力-成本"权衡优化：通过在推理时选择性激活能力单元，实现资源效率的最大化。

### VLA 与 VA 双轨并行战略

蚂蚁灵波同时推进 VLA（视觉-语言-动作）与 VA（视觉-动作）两条技术路线：VLA 负责产业落地（已在 17 家厂商的 20 种机器人构型上完成适配），VA 负责前沿预研。VLA 在产业一线沉淀的数据和场景反馈，持续反哺 VA 的迭代；VA 在因果建模上的突破，则为 VLA 下一代升级提供技术储备。这种"投产一代、预研一代"的策略是具身智能领域典型的双层研发体系。

## 实践启示

1. **具身原生的工程门槛**：从零构建原生世界模型需要大规模的真实物理交互数据、专用的因果建模架构以及全栈工程优化能力。对于大多数团队而言，在现有 VLA 框架上进行渐进式优化仍是更务实的短期路径，但应关注 VA 路线的技术进展并预留架构迁移空间。

2. **视频数据的未充分利用**：语义视觉-动作分词器的设计揭示了一个被低估的技术杠杆——将互联网视频作为免费的预训练资源。具身智能团队应重新评估自有的视频数据资产，探索用统一语义空间对齐视觉与动作数据的方法。

3. **异步推理的重要性**：对于任何涉及实时控制的工程系统，「想完再动」的单线程架构都可能是性能瓶颈。异步推理的设计模式值得在机器人控制、自动驾驶等延迟敏感领域推广。

4. **鲁棒性是第一性原理**：LingBot-VA 2.0 在干净环境和随机化环境表现差距仅 0.4 个百分点，这一指标比 93.6% 的平均成功率更有工程价值——它表明模型学到了可迁移的物理规律而非对特定场景的过拟合。在真实部署中，鲁棒性往往比绝对精度更关键。

5. **MDE 架构的实际部署优势**：130 亿参数中仅 19 亿活跃参数的设计使单卡推理成为可能。对于资源受限的边缘部署场景，MoE 架构是实现大模型能力与低成本推理平衡的首选方案。

## 相关实体

- [百度搭子 Agent 平台](https://github.com/QianJinGuo/wiki/blob/main/entities/刚刚百度搭子全面升级要让agent接住人类90以上的活.md)
- [Gemma 4 端侧大模型](https://github.com/QianJinGuo/wiki/blob/main/entities/谷歌gemma-4论文深夜解封31b直逼闭源前沿敲响云端ai丧钟.md)
- [具身智能前沿](https://github.com/QianJinGuo/wiki/blob/main/concepts/embodied-intelligence-frontier.md)
- [JEPA 世界模型](https://github.com/QianJinGuo/wiki/blob/main/entities/yann-lecun-jepa-world-model.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/全球首个具身原生世界动作模型来了.md)

---

## Ch18.018 景烁科技 — 具身智能数据基础设施

> 📊 Level ⭐⭐⭐⭐ | 6.3KB | `entities/jingshuo-tech-embodied-ai-data-infrastructure-2026.md`

# 景烁科技 — 具身智能数据基础设施

景烁科技（Jingshuo Tech）是一家具身智能数据基础设施公司，由文远知行（WeRide）内部孵化，CEO 霍达（文远 001 号员工）和 President & COO 韩明联合创立，2026 年正式独立运营。

## 核心定位

不做整机，不做单纯的大脑，押注物理 AI 的基础设施——数据和世界模型技术体系。在行业追逐"大脑"和"通用模型"时，专注底层的"经验体系"和"世界认知"系统搭建。

## 技术路线

### 从自动驾驶到具身智能

团队在文远知行期间完整经历了自动驾驶的瓶颈迁移史：

1. **拼算法** → 2. **拼算力** → 3. **拼数据**（端到端时代）

贯穿三条暗线是数据基础设施持续建设。最终认识到：再好的算法、再大的算力，没有高质量数据喂给模型，迭代就停在原地。

### 仿真生成长尾场景

面对实测数据天然劣势（车队数量远不如车企），景烁团队率先用仿真器生成大量长尾场景。不是模仿类视频生成，而是真正理解物理法则、因果关系的"世界模拟器"，后演进为文远知行的 GENESIS 世界模型。

### 数据设计理念

核心理念：**不要在茫茫数据里捞"钻石"，而是直接人工生成"钻石"**。

这种选择在具身智能时代被放大——自动驾驶至少有一个早期模型可上路，但具身智能没有任何一个具备最低泛化性的工程化模型，更没有 ChatGPT 那样现成的互联网数据。制约核心因素就是缺少高质量数据基础设施形成闭环。

### EGO 路径验证

EGO（第一人称视角采集）路径被验证可行后，团队敏锐察觉物理 AI 的 Scaling Law 触发第一次有了可能性，于是决定正式独立。

## 深度分析

### 具身智能数据基础设施的稀缺性

景烁科技选择了一个被行业忽视的赛道——不做整机、不做「大脑」，而是做数据和世界模型基础设施。这个选择背后的判断是：具身智能的瓶颈不是算法（Transformer 已被证明在物理任务中有效），也不是硬件（中国制造业把本体性能做到极致），而是缺少高质量数据基础设施形成闭环。没有数据，模型迭代不动，除了 Demo 几乎无法落地。

### 从自动驾驶到具身智能：十年数据信仰的延续

团队完整经历了自动驾驶的「瓶颈迁移史」：拼算法 → 拼算力 → 拼数据。在文远知行期间积累的工程化方法论——用仿真器生成长尾场景、以世界模型驱动数据闭环——被无缝迁移到具身智能赛道。这种「经历过完整淘汰赛」的 knowhow 是景烁最核心的壁垒：知道模型缺什么、什么数据真正有用、怎么设计数据能让模型能力跃升。

### 三层产品架构的飞轮效应

景烁的产品体系分为三层：WorldEngine（标准化数据模型底座，覆盖采集→治理→标注→合成→测评→部署的完整闭环）、GENESIS-Robotics（世界模型核心引擎，采用 Transfusion 路线在同一个 Transformer 中融合语言、策略、图像、视频，共享参数）、SkillForge（物理 AI 资产引擎，200+ 标准化技能包覆盖家庭、制造、零售、教育四大领域）。三层环环相扣，形成飞轮：模型越强→合成数据越好→下游模型更强→采集策略更精准→真实数据质量更高→模型更强。

### 跨本体泛化的工程实践

SkillForge 的核心产品理念是「数据基础设施即服务」——客户拿到的不是「一堆视频」，而是「一个经过验证可以直接用于训练的技能」。通过 WorldEngine 全流程验证后附 L1/L2/L3 三层评测结果，客户只需要将人的动作映射到自己的末端执行器上，适配到不同自由度和关节。这种跨本体的设计思路，为具身智能的数据工业化提供了可行路径。

## 实践启示

1. **数据基础设施优先于模型竞争**：景烁的案例表明，在物理 AI 领域，缺少高质量数据闭环是比算法落后更致命的瓶颈。创业公司在追逐「大脑」之前，应先评估数据基础设施是否到位。
2. **仿真器不是替代真实数据，而是弥补长尾**：用仿真生成「钻石」而非在茫茫数据里捞「钻石」——仿真的价值在于定向生成有意义的难例，而非替代真实世界数据。
3. **世界模型是数据飞轮的核心引擎**：只有拥有自己的世界模型，才能直接定义「什么数据有用」。GENESIS-Robotics 的 Transfusion 架构让语言、策略、视频共享参数，三种能力互相增强。
4. **跨本体泛化需从数据设计阶段开始**：SkillForge 的设计表明，跨本体的泛化不是模型训练后「涌现」出来的，而是从数据采集阶段就设计好的——特定的状态分布 + 动作分布 + 评测标准决定了最终的迁移能力。
5. **硬件采集同样重要：全链路同源同标**：EGOK 采集设备的 8ms 延迟、280g 重量、5 小时续航本身不是竞争壁垒，但「采集发生时手—物—场景—动作已经对齐」的设计——全链路模组同源同标，不需要事后人工拼接——才是工程化落地的关键细节。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/jingshuo-tech-embodied-ai-data-infrastructure-2026-07-15.md)

---

## Ch18.019 NVIDIA ASPIRE：机器人技能库与持续学习新范式

> 📊 Level ⭐⭐⭐⭐ | 5.6KB | `entities/nvidia-aspire-robot-skill-library-code-as-policy.md`

# NVIDIA ASPIRE：机器人技能库与持续学习新范式

NVIDIA 开源的 **ASPIRE**（Agentic Skill Programming through Iterative Robot Exploration）是一套让机器人通过代码执行、失败分析、修复沉淀实现持续学习的技能库系统。

## ASPIRE 三阶段 Pipeline

### 1. Robot Execution Engine（机器人执行引擎）
传统机器人程序失败时只返回"任务未完成"。ASPIRE 将每一次感知、规划、抓取、控制调用的输入、输出、视觉证据和错误日志都记录下来，就像人类工程师回放视频查问题。

### 2. Skill Library（技能库）
Agent 修好程序后，将验证过的修复经验沉淀为可复用的 Skill。例如：
- 「桌边物体需多角度接近」
- 「抽屉把手过滤假检测」
- 「平面物体推动时使用特定 motion primitive」

Skill 本质上是一段供大模型参考的 Code Repair Pattern，让机器人遇到同类问题时无需重新试错。

### 3. Evolutionary Training（进化式训练）
多 Agent 各自练习不同技能，将经验汇总进同一个技能库，实现分布式技能积累。

## Jim Fan 的范式转变

Jim Fan 表示 ASPIRE 代表了全新的持续学习范式：

- **训练**：从梯度下降 → Skill Refinement（技能打磨）
- **模型**：从浮点权重 → 持续扩展的技能库（Sensorimotor Skills）
- **分布式训练**：从数据并行 → 多 Agent 各自练习并汇总经验

> "当机器人完成第 100 个任务时，它终于不再像完成第 1 个任务时那样一无所知。"

## 深度分析

### Code as Policy：机器人行为可编程化的范式突破

ASPIRE 的底层逻辑建立在 **Code as Policy** 范式之上——机器人行为不再完全隐藏在神经网络权重里，而是变成可执行的操作代码。这一转变的关键意义在于：代码可以被 Agent 模型检查、修改、调试和优化，使机器人训练从「黑盒调参」变成「代码迭代」。一旦机器人行为代码化，Coding Agent 在软件工程中积累的「写代码→跑测试→看 trace→改 bug」循环就能直接迁移到物理世界。

### 失败信息粒度的革命性提升

传统机器人系统失败后只知道「任务未完成」。ASPIRE 的 Robot Execution Engine 将每一次感知、规划、抓取、控制调用的输入、输出、视觉证据和错误日志全部记录下来，使 Agent 能像人类工程师一样回放视频、分析轨迹、定位问题。这种**细粒度的执行轨迹**是 Skill 沉淀的基础——没有详细的失败信息，修复经验就无法被准确提炼。

### 从梯度下降到 Skill Refinement 的训练范式变革

Jim Fan 提出的持续学习新范式触及了深度学习的根基：训练不再等于梯度下降。在 ASPIRE 中，「训练」变成了对 Skill（代码修复模式）的持续打磨和积累；「模型」从浮点权重变成了持续扩展的技能库；「分布式训练」从数据并行变成了多 Agent 各自练习并汇总经验。这种转变意味着机器人不再在每次新任务上「从头开始」，而是每完成一个任务都增加了一条可复用的经验。

### 跨任务迁移能力的实证验证

论文在 LIBERO-90 上积累 Skill Library，再直接迁移到未见过的 LIBERO-Pro Long 长任务，结果验证了 Skill Library 的厚度与泛化能力正相关。随着技能库丰富，机器人在新任务上的成功率从几乎不会持续提升到 31%。Robosuite 双臂物体交接任务更是从 20% 提升至 92%。这些数据说明**经验的代码化存储比参数微调更适合物理世界的持续学习**。

## 实践启示

1. **代码化经验比权重更可迁移** — ASPIRE 的 Skill 本质上是 Code Repair Pattern，供大模型在推理时参考。这意味着知识的载体不是参数量而是经验结构的质量。
2. **失败轨迹的精细度决定自动化修复的上限** — 只有粒度足够细的执行日志，Agent 才能定位根因并提炼可复用的修复模式。工程系统应优先提升可见性而非直接追求成功率。
3. **多 Agent 经验共享是分布式训练的新方式** — 不同于数据并行的参数同步，ASPIRE 的「各练各的、汇总经验」模式更适合异构环境下的技能积累。
4. **持续学习的核心是记忆结构而非算法** — ASPIRE 证明，让技能库不断变厚比设计更复杂的训练算法更有实际效果。

## Code as Policy 路线

不同于 VLA 等端到端策略模型，Code as Policy 让大模型写可执行的机器人控制程序，调用感知模块、规划 API 和控制原语。机器人行为不再藏在神经网络权重里，而是变成可执行的操作代码，因此可以被 Agent 模型检查、修改、调试和优化。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/nvidia-aspire-robot-skill-library-code-as-policy.md)

---
