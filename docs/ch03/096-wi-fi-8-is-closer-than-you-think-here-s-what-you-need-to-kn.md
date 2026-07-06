# Wi-Fi 8 is closer than you think. Here’s what you need to know

## Ch03.096 Wi-Fi 8 is closer than you think. Here’s what you need to know

> 📊 Level ⭐⭐ | 7.5KB | `entities/wi-fi-8-closer-than-you-think.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/wi-fi-8-closer-than-you-think.md)

## 核心要点
- value=7, confidence=9, product=63
- Technically informative Wi-Fi 8 article
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/wi-fi-8-closer-than-you-think.md)

## 深度分析
**1. Wi-Fi 8 代表从"更快"到"更可靠"的范式转变**
David Coleman 在 Extreme Connect 2026 上将 Wi-Fi 8 定调为"Ultra High Reliability"，明确将技术目标从单纯追求 PHY 速率转向可预测的可靠性。核心技术指标包括：吞吐量提升 25%（rate over range）、延迟峰值降低 25%、丢包率降低约 25%。这意味着 Wi-Fi 8 的核心价值不在于峰值速率的营销宣传，而在于减少 Zoom 卡顿、视频流畅性和边缘一致性体验的改善。对于企业网络而言，这意味着 Wi-Fi 正从"尽力而为"的接入技术向"关键业务级"可靠连接演进。
**2. 频谱效率智能化：非主信道接入与动态子带操作**
Wi-Fi 8 引入多项机制从现有频谱中榨取更多价值，而非简单加宽信道。在 5 GHz 和 6 GHz 频段，许多机制将在 AP 端成为强制性要求。非主信道访问允许 AP 在 80 MHz 信道上选择性忽略繁忙的主 20 MHz 信道段，转而在更干净的次级信道上传输，这对高密度部署意义重大。动态子带操作允许 AP 在检测到大量仅支持 20 MHz 的 IoT 设备时，将大信道划分为多个 20 MHz 子带同时服务。Coleman 对动态带宽操作（"借用"相邻信道）持谨慎态度，认为第一代实现可能存在问题。这些新机制意味着信道规划将比以往任何时候都更关键，RF 设计工具必须理解这些新行为才能准确建模范畴。
**3. 无缝移动性域（SMD）漫游：企业漫游的下一代架构**
SMD 漫游是 Wi-Fi 8 最具变革性的特性之一。传统架构下，客户端与单个 AP 关联并在 AP 间漫游时需要重复四次握手。SMD 漫游允许客户端与一组 AP 的域建立关联，同时获得所有 AP 的安全密钥，在域内漫游时实现近零切换，"就像无缝的公共汽车旅程"。为支持 SMD，Wi-Fi 8 强制要求 RSN override 机制，向传统客户端提供基础安全信息，同时向 WPA3 设备提供更丰富的元素。bounded ESS 扫描功能允许 AP 指示客户端仅扫描特定信道，大幅减少电池消耗的探测活动。这一架构转型要求网络工程师从"覆盖单元格"思维转向"移动性域"思维。
**4. AP 边缘 AI 化：从连接盒到分布式计算平台**
Wi-Fi 8 最具颠覆性的变化可能不在 802.11 标准文本中，而在芯片厂商正在嵌入 Wi-Fi 8 芯片组的内容。Broadcom 等厂商计划将 AI/ML 神经处理器直接集成到 AP 的基带硬件中。Coleman 描述了两阶段演进：第一阶段，厂商将利用板载 AI 创建更智能的 OFDMA 调度器，有效吞吐量提升 20% 以上；第二阶段，AP 将成为边缘 AI 计算平台，客户可在整栋建筑或园区内进行自己的分析和应用，甚至可在每个 AP 上运行小型语言模型或将更大模型分布在多个 AP 上。"忘掉 Wi-Fi 吧——你现在拥有的是边缘 AI 计算平台。"
**5. 后量子密码学威胁迫近：Wi-Fi 安全的长期风险**
Wi-Fi 8 继续推进更强默认安全标准，WPA3 将成为强制性要求，管理帧保护将得到增强。但 Coleman 强调了一个迫在眉睫的挑战：后量子密码学。具备量子能力的对手可以捕获今天加密的 Wi-Fi 流量并存储，多年后当 TLS 密钥交换等算法被破解时再解密。802.11bt 等任务组正在研究如何为 Wi-Fi 安全交换提供后量子安全防护，这些努力最终将通过新的密码套件和密钥建立方法渗透到 Wi-Fi 8 时代产品中。

## 实践启示
**1. 加速 6 GHz 战略，优先建立标准功率 + AFC 运营能力**
当前 6 GHz 采用率仅约 5%，但应立即加速战略布局。关键认知是：客户期望一对一的 AP 替换，但低功率室内（LPI）由于 6 GHz 覆盖范围较短，通常需要约 20% 更多的 AP；而标准功率 + AFC（自动频率协调）可实现接近 1:1 的映射。现在就建立 AFC、GPS/坐标工作流和 AP 地理位置自动化工具的运营能力，为 2027-2028 年 Wi-Fi 8 到来时的 6 GHz 基础做好准备。
**2. 立即启动 WPA3 迁移，分离 legacy 设备**
Wi-Fi 8 将 WPA3 变为强制要求，届时面临大规模迁移压力过大。在 5/6 GHz 频段将关键 SSID 迁移到 WPA3 和管理帧保护，现在就开始分阶段推进。对于仍因 legacy 设备（Coleman 调侃的"2002 年的输液泵仍在使用 TKIP"）而必须保留 WPA2/TKIP 的情况，将这些设备隔离到专用 SSID 和 VLAN，降低安全风险暴露面。
**3. 从"覆盖单元格"设计转向"移动性域"架构**
在关键区域（语音、临床、工业）识别 3-5 个 AP 的逻辑分组，作为 SMD 漫游的自然候选。立即与 WLAN 厂商沟通路线图可见性：SMD 漫游是否在第一代 Wi-Fi 8 硅片中实现？控制器/云如何编排这些域？这将影响未来 2-3 年的 WLAN 架构决策，而非仅仅是 RF 规划。
**4. 审计 PoE 预算，为 AI 硅片功耗增加做准备** ^[raw-pages/wi-fi-8-closer-than-you-think:107-108]
Wi-Fi 8 AP 由于集成 AI 硅片，即使芯片厂商当前乐观估计，功耗也可能显著增加。立即审计交换机和 PoE 预算，尤其是在老旧布线间。同时评估厂商的节能功能——动态 MIMO 链路、传感器驱动的电源关闭、能耗和碳减排报告——以便满足 sustainability 要求而不需要意外升级。
**5. 联合设施和应用团队，构建边缘 AI 用例储备**
将 Wi-Fi 8 刷新不仅视为 RF 升级，而是边缘计算部署。盘点潜在用例：医疗保健中的跌倒检测、智能 HVAC 和照明、零售互动、或集成 Wi-Fi  sensing 与摄像头的安全分析。与 OT、楼宇管理和应用团队讨论他们如何利用 AP 层的占用分析和本地化 AI 推理能力。这些对话现在就开始，因为 AI 能力将成为 Wi-Fi 8 RFP 中的差异化因素。

## 相关实体
- [Wi-Fi 8 is closer than you think](ch03/054-wi-fi-8-is-closer-than-you-think.md)
- [Wi-Fi 8 is closer than you think. Here's what you need to know](ch03/054-wi-fi-8-is-closer-than-you-think.md)
- [Wi-Fi 8 is closer than you think](ch03/054-wi-fi-8-is-closer-than-you-think.md)

---

