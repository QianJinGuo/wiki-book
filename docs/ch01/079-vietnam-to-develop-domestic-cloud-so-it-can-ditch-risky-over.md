# Vietnam to develop domestic cloud so it can ditch risky overseas operators for government workloads

## Ch01.079 Vietnam to develop domestic cloud so it can ditch risky overseas operators for government workloads

> 📊 Level ⭐ | 6.5KB | `entities/vietnam-to-develop-domestic-cloud-so-it-can-ditch-risky-overseas-operators-for-g.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vietnam-to-develop-domestic-cloud-so-it-can-ditch-risky-overseas-operators-for-g.md)

## 核心要点
- 来源：www.theregister.com
- 评分：v=8, c=8, product=64
- 发布时间：2026-05-13
- 越南政府通过 **Decision 808/QD-TTg** 推出 20 项战略技术发展规划，国内云平台位列第 13 项
- 核心目标：确保国家数据主权和网络安全，逐步替换政府机构使用的境外云服务
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vietnam-to-develop-domestic-cloud-so-it-can-ditch-risky-overseas-operators-for-g.md)

## 深度分析
### 1. 数据主权与合规压力交织
越南当前存在一个结构性悖论：其本国法律要求个人数据本地存储，但政府工作负载却大规模运行在 Microsoft、Google、Tencent Cloud 等境外大厂之上。Decision 808 的出台直接揭示了这一合规黑洞——政府一边在法律上要求数据本地化，一边又不得不依赖外国云基础设施。这种张力是推动国内云建设的核心驱动力，而非单纯的技术自主愿景。

### 2. 全球主权云浪潮的亚洲样本
越南并非孤例。文中引用的 Gartner 研究（"主权云只有中美两国可能实现"）与欧洲欲脱离美国 tech 控制的诉求形成呼应。然而这三者路径截然不同：美国依靠 AWS/Azure/GCP 的全球覆盖和技术领先；中国通过监管锁闭和数据本地化要求培育本土云（阿里云、华为云、腾讯云）；越南则试图在境外大厂已建立存在但尚未深入之时抢先构建国内云能力。这一窗口期判断至关重要——一旦 AWS Local Zones、阿里云数据中心在越南落地，政府再想替换的成本和阻力将成倍增加。

### 3. 境外大厂的越南布局与政府诉求之间的结构性矛盾
AWS 将在河内部署轻量级 Local Zones，阿里巴巴云和华为云也有意建设数据中心——但这些境外大厂的核心资产（控制平面、运维团队、硬件供应链）并不在越南境内。政府的真实意图是获得"真正的"国内云，而非境外云在境内部署一个小节点。这意味着，即便大厂在越南建了 datacenter，只要核心运营仍在境外，就无法满足政府"数据主权"的标准。这构成一个不可调和的结构性矛盾，也是国内云计划的内在逻辑。

### 4. 2030/2035 双时间表的战略意图
政府设置了两个关键节点：2030 年所有核心政府服务上线，2035 年成为"发达数字国家"、实现"基于实时信息的数据驱动决策"。这个时间表极其激进——距离 2030 仅剩 4 年，而越南目前连全国性云基础设施的雏形都没有。快速推进的动机可能包括：趁美国对华科技战形成的全球供应链重塑窗口期抢占生态位，以及通过"数字政府"叙事强化执政合法性。

### 5. 云只是 20 项战略技术之一
国内云并非越南技术野心的全部——它与越南语大模型、安全运营中心、量子抗加密、下一代防火墙、SIEM 系统等构成一个完整的技术自主体系。稀土加工、5G、机器人、半导体设计能力也在清单上。这种"全面脱钩"式的规划，映射出越南在中美竞争加剧背景下试图成为东南亚技术 sovereignty hub 的战略意图。

## 实践启示
### 对政府与技术决策者
- **数据主权合规审计应优先于云迁移决策**：越南案例显示，法律要求与实际基础设施之间的 gap 可能比决策者预期的更大。在推进任何云迁移计划前，应首先完成数据驻留合规性映射，避免"先迁移后合规"的被动局面。
- **国内云建设需要同步培育运营生态**：仅有基础设施不足以实现数据主权——控制平面、运维团队、安全认证体系必须同步建设，否则只是换了一个物理位置的境外云。
- **技术自主时间表应与产业成熟度匹配**：2030 年的目标在执行层面存在巨大风险；制定更细粒度的里程碑（如 2027 年完成核心政务云试点、2029 年完成迁移）比设定宏大愿景更有实操价值。

### 对云服务商与 IT 厂商
- **"Local Zones" 类轻量节点不等于进入越南政府市场**：即便 AWS 已在河内部署 Local Zones，越南政府因其数据主权要求仍可能将这类节点排除在核心政务 workload 之外。云厂商需要重新评估其产品是否能满足"真正的"国内云定义。
- **安全与 AI 工具链存在进入机会**：越南同时在建设下一代防火墙、SIEM、安全运营中心以及 AI 集成能力，这些细分领域对国际厂商的技术门槛相对较低，可能是比基础云服务更快的切入点。
- **稀土与半导体能力建设为东南亚产业链重组的信号**：越南将稀土处理和半导体设计纳入 20 项战略技术，意味着东南亚供应链重构已在政策层面落地，相关硬件和材料厂商应关注这一长期趋势。

### 对研究者与政策分析师
- **越南案例可作为"主權雲可行性"理论的实证检验**：Gartner 的"只有中美能实现主权云"论断正受到越南实践的挑战——小国是否有可能通过政策壁垒和专注政务 workload 实现相对可控的主权云？这一实验的结果将影响大量发展中国家的云政策选择。
- **关注 Decision 808 的执行机制**：该决策由总理直接发布，列出 20 项战略技术——这种顶层设计模式与越南的政治体制高度匹配，但执行中的部门协调、预算分配和技术引进管理将是主要瓶颈。

## 相关实体
- [Vietnam to develop domestic cloud](ch11/170-vietnam-to-develop-domestic-cloud.md)
- [Vietnam to develop domestic cloud so it can ditch risky overseas operators for government workloads](https://github.com/QianJinGuo/wiki/blob/main/entities/vietnam-domestic-cloud.md)

---

