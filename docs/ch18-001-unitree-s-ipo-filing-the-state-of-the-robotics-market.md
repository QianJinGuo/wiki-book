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
- [Cloudflare Glasswing Mythos Security](ch01-281-qwen-code-skill-testing-framework-recording-playback-and.html)
- [A 0 Click Exploit Chain For The Pixel 10 When A Door Closes A Window Opens](ch12-042-u-of-t-ai-worm-cleverhans-lab-ai.html)
- [Fine Tuning Nvidia Cosmos Predict 25 With Loradora For Robot Video Generation](ch01-885-elf-embedded-language-flows.html)
- [User Interviews Guide Pro](ch01-561-optimizing-models-to-be-fast-at-codegen.html)
- [估值3000亿63家新实验室杀疯了Murati贝佐斯集体押注下一代Ai](ch01-270-frontiercode-cognition-ai-pr-mergeability.html)

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
