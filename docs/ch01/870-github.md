# 明星开源项目，为什么开始离开 GitHub？

## Ch01.870 明星开源项目，为什么开始离开 GitHub？

> 📊 Level ⭐⭐ | 4.8KB | `entities/open-source-projects-leaving-github.md`

## 核心要点

- 开源项目离开 GitHub 的驱动因素：监管风险（微软与五角大楼合作）、Copilot 训练数据争议、去中心化托管趋势
- 社区正在探索 GitLab、Forgejo 等替代平台，强调社区所有权和数据可移植性
- 多数项目采取「GitHub + 镜像」双轨策略，主仓库保留在 GitHub 以维持曝光度

## 深度分析

Mitchell Hashimoto 离开 GitHub 的核心理由是基础设施可靠性问题，而非意识形态驱动。他记录了连续一个月的每日故障，每一天 GitHub 的故障都对他的工作能力产生实质影响 ^。这不是偶发的单次事件，而是持续恶化的日常——他在博客中坦言"几乎每天都有一个 X"，导致"每天都会把你挡在门外好几个小时"。这种日常化的不可靠，对依赖 GitHub 进行严肃开发的用户而言，是不可接受的工程风险 ^。

Hashimoto 采取的策略是典型的双轨制：主开发迁移至其他平台，GitHub 仅保留只读镜像 ^。这一策略承认了 GitHub 仍有的网络效应价值——项目可见度、分支贡献者生态、搜索引擎索引——但拒绝将核心开发活动绑定在一个不稳定的平台上。这是一个务实的中间路线：不完全放弃 GitHub 的曝光价值，同时建立真正的工程独立性 ^。

GitHub 可靠性的下降并非偶然。自 2018 年被微软收购后，平台宕机频率明显上升 ^。这背后存在一个结构性矛盾：微软的商业利益（国防部合作、Copilot 变现）与开源社区的价值观（开放、协作、社区所有权）之间存在根本性张力。Copilot 训练数据争议是这一张力的具体体现 ^。对于重视社区所有权和伦理一致性的开源项目而言，GitHub 已不再是价值中立的托管平台 ^。

Ghostty 案例的示范效应值得重视。作为 Mitchell Hashimoto 的个人项目，Ghostty 在开源社区具有较高的能见度和影响力。其公开的迁移决策和清晰的迁移逻辑，为其他有类似想法但犹豫不决的项目提供了参考模板 ^。随着类似案例积累，「GitHub + 镜像」双轨策略可能成为开源项目社区运营的标准范式之一 ^。

## 实践启示

建立客观的迁移触发机制，而非情绪化决策。Mitchell Hashimoto 的方法是连续记录每日故障对工作的实际影响，持续一个月。这种方法的价值在于：将主观不满转化为客观数据，避免因单次宕机的情绪化反应做出重大决策，同时也为后续与平台方的沟通提供可信的事实依据 ^。

评估替代平台时，关注社区所有权和数据可移植性。Forgejo 和 GitLab 作为自托管选项，强调社区所有权和数据可移植性——这正是 GitHub 作为商业平台所不具备的特性。迁移决策不仅是换一个托管服务，而是重新确认项目的治理优先级 ^。

采用「主开发 + 只读镜像」双轨策略，逐步迁移依赖而非一次性迁移。Ghostty 的计划是"尽可能渐进地完成"依赖移除，保留 GitHub 只读镜像以维持项目 URL 和可见度。这种方法降低了迁移的技术风险和社区摩擦，也为主仓库最终迁移争取了验证窗口 ^。

对于高价值开源项目，制定 GitHub 退出路线图时应评估多维风险。GitHub 的可靠性问题只是表层驱动因素；更深层的是微软商业利益与开源社区价值观的结构性张力。在评估替代方案时，应同时考虑平台的商业模型、治理结构、社区支持和长期路线图，而不仅仅是技术稳定性 ^。

## 相关实体
- [Microsoft Copilot Studio Agent Governance](../ch03/045-agent.html)
- [Microsoft Mxc Execution Containers Agent Sandbox Origin](../ch03/045-agent.html)
- [Github Copilot Individual Plans Flex Allotments](ch01/763-github-copilot-individual-plans-flex-allotments-in-pro-and.html)
- [Joyai Echo Long Video Framework Jd](../ch05/084-ai.html)
- [Openchronicle Memory Layer](https://github.com/QianJinGuo/wiki/blob/main/entities/openchronicle-memory-layer.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/open-source-projects-leaving-github.md)- [github multilingual repositories dataset — 4000 万仓库多语言元数据](ch01/870-github.html)

---

