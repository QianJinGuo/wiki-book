# LingBot-Video：全球首个具身专属MoE视频模型

## Ch01.948 LingBot-Video：全球首个具身专属MoE视频模型

> 📊 Level ⭐⭐ | 4.4KB | `entities/lingbot-video-moe-embodied-video-2026.md`

# LingBot-Video：全球首个具身专属MoE视频模型

> **LingBot-Video** 是由蚂蚁灵波（Ant Group）发布的面向具身智能的 MoE（Mixture of Experts）视频基础模型与视频物理引擎。该模型采用 MoE30B-A3B 架构，总参数量 30B、推理时仅激活 3B，通过全链路设计（架构—数据—训练）专为机器人、人形智能体等具身场景打造其核心关注点从通用视频的"时长、美学、画质"转向"是否符合物理规律"

## 架构设计

模型采用稀疏 MoE 架构，在固定计算预算下扩大参数容量。MoE30B-A3B 在 1M Token 长度下对比 Dense6B、Dense 14B、Dense 30B 的速度比分别达到 1.50×、2.59× 和 3.18×，同时保持接近 3B 模型的推理效率。稀疏 MoE 将总参数规模与每个 Token 实际激活的计算量解耦，使视频模型能处理复杂运动轨迹、三维空间一致性、材质纹理等复杂分布。

## 数据策略

模型引入超过 70,000 小时的 embodiment-oriented footage，覆盖机器人操作 VLA、导航、第一视角视频，包括真实机器人、仿真、开源、第三人称视角以及人形机器人、四足机器人等平台。训练流程采用专门的"少筛选、多保留"策略，防止高价值具身数据被海量普通互联网视频稀释。所有素材经过**五维结构化标注**（物体、材质、动作时间戳、受力交互关系），并采用**课程式五阶段渐进训练**（从低清静态图像到高清长时序视频）。

## 强化学习与物理约束

与通用视频模型仅用画面美观度、文本匹配度做优化目标不同，LingBot-Video 搭建了一套**分层强化学习奖励体系**，从三个维度约束生成结果：

1. **感知维度**：画面清晰度、文字描述匹配度、动态流畅度
2. **物理维度**：物体不穿透、无凭空消失、运动符合重力惯性、材质受力形变合理
3. **执行维度**：机器人肢体结构完整、动作流程可落地、任务目标完整完成

训练采用 **GRPO（Group Relative Policy Optimization）** 方案，搭配负感知微调规避奖励黑客问题。模型原生支持 **Action-to-Video** 动作条件生成——输入机器人动作指令即可输出后续完整视觉变化，可直接对接机器人运动规划模块。此外配备**级联精炼方案**：先生成 480p 基础时序画面保证运动逻辑，再精炼至 1080p 高清画质，平衡推理速度与画面细节。

## 评测表现

在评测中与 NVIDIA Cosmos3、LongCat-Video、LTX-2.3 等开源模型比较：

- **TI2V（Text-Image-to-Video）任务**：在开源竞品中达到 SOTA 水平，general quality 和 embodied domain 两项得分均位居第一
- **T2V（Text-to-Video）任务**：general quality 排名第二，embodied domain 得分超过 Cosmos 等竞争基线
- 已在 **RBench** 上超越业内通用视频生成标杆模型

## 价值分层应用

该模型的价值可以划分为三层：

1. **Data Engine** — 为机器人训练提供低成本、可反复试错的物理世界模拟数据
2. **Policy Evaluator** — 在虚拟视觉环境中提前评估策略效果，降低真实测试风险
3. **Action Planner** — 直接对接机器人运动规划模块，输出动作条件对应的视觉变化

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/lingbot-video-moe-embodied-video-2026.md)

## 第 2 来源 — 量子位（2026-07-09）

量子位对 LingBot-Video MoE 的独立报道，重点覆盖了模型的具身专属设计理念和开源意义。

→ [量子位报道原文](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/刚刚全球首个具身专属的moe视频模型开源了.md)

---

