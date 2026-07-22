# Direct Connect (DX) 迁移最佳实践

## Ch11.038 Direct Connect (DX) 迁移最佳实践

> 📊 Level ⭐⭐ | 14.1KB | `entities/aws-direct-connect-dx-migration-best-practices.md`

# Direct Connect (DX) 迁移最佳实践

> AWS China Blog 2026-06-03 发布的中国区实战迁移指南，梳理 Direct Connect 节点搬迁的 6 步流程 + DX+VPN 备份 + DX+DX 备份两种典型冗余场景的差异化迁移路径。重点是 BGP 流量工程（BGP Community 标签、Local Preference）、BFD 故障检测秒级切换、维护窗口纪律。

## 核心要点

### 一、设计考虑与最佳实践
- 选择新站点前参考 [Direct Connect 站点列表](https://aws.amazon.com/cn/directconnect/locations/)
- 必须先满足 [AWS Direct Connect 弹性建议和最佳实践](https://aws.amazon.com/cn/blogs/china/aws-direct-connect-highly-available-routing-design/) 的冗余网络连接
- 生产流量切换前先通过新连接测试
- 使用 BGP 属性进行流量工程（Active/Standby BGP 连接）
- 在约定维护窗口内切换新连接

### 二、迁移过程 6 步
1. 订购新站点的 Direct Connect 连接
2. 配置 VIF（虚拟接口）和本地设备
3. 测试故障转移以确认流量通过新连接
4. 将流量切换到新连接
5. 删除旧连接

### 三、场景一：DX + VPN 备份（成本敏感型）
- **架构**：VGW 终结 DX + 第三方 VPN 软件（vCPE）承担 Site-to-Site VPN
- **路由设计**：
  - VPC 路由表开启 VGW 路由传播
  - 设置 `192.168.0.0/16` 静态路由指向 vCPE ENI（掩码更短但比 DX 主路由更具体）
  - 利用最长掩码匹配优先选 DX
  - 入云方向同样配置 `10.42.0.0/16` 指向 VPN tunnel
- **BFD 故障检测**：本地网关 DX 接口上配 BFD，自动切换至 VPN 时间降至**秒级**
- **5 个子步骤**：建立新连接 → 配 VIF → BGP 路由属性策略 → 故障转移测试 → 删除旧连接

### 四、场景二：DX + DX 备份（高 QoS 要求型）
- 在不同 DX PoP 节点部署多条专线
- 通过 BGP 路由属性配置（Active/Passive 或 ECMP）实现负载 + 高可用
- 迁移示例：在上海新连接 + 保留深圳主连接

## 关键技术细节

### BGP 流量工程（核心）
**从本地到 AWS**：
- 通过 Local Preference 区分
- 新线路（上海）接收的路由 Local Preference 设为 **低于** 原线路（深圳）的值（默认 100）
- 数值越低优先级越低，新连接保持 Standby

**从 AWS 到本地**：
- 通过新线路向 AWS 通告的所有本地路由打 BGP Community 标签 `7224:7100`
- AWS 端会优先使用原线路的 DX 连接

### 维护窗口纪律
- 强烈建议在约定维护窗口期间执行 VIF 创建、BGP 策略配置、流量切换等关键操作
- 故障转移测试需关闭主连接 BGP 会话，强制流量走新 VIF
- 验证工作负载后再恢复主连接

## 三个独有贡献

1. **中国区双 PoP 迁移路径具体化** — 不只讲 AWS 全球通用模式，而是把深圳→上海/宁夏/北京的具体节点迁移步骤、BGP 配置值（`7224:7100` Community 标签、Local Preference 数值）、VGW + vCPE 集成方式都讲清楚
2. **DX+VPN 备份场景的 vCPE + 静态路由技巧** — 掩码更短但具体的静态路由 + BFD 故障检测，使 DX→VPN 切换降低到秒级（而非分钟级）
3. **维护窗口纪律的工程化** — 把"在维护窗口切换"从口号落实到具体的 5 步子流程（建新连接 → 配 VIF → BGP 策略 → 故障测试 → 删旧）

## 适用场景

- 中国区 AWS 用户在不同 DX 节点（深圳 / 上海 / 宁夏 / 北京）之间迁移的工程参考
- 跨国企业从单 DX 升级为 DX+VPN 备份或 DX+DX 备份架构
- 网络团队学习 BGP 流量工程（Local Preference + Community 标签）的具体配置模式

## 核心概念参考表

| 概念 | 作用 |
|------|------|
| VIF (Virtual Interface) | DX 连接的虚拟接口，分私有/公有/传输 |
| Direct Connect Gateway | 多区域 VIF 聚合的中转网关 |
| BGP Community `7224:7100` | AWS 识别本地路由优先级的标签 |
| Local Preference | 本地 AS 内的路由优先级（数值越高越优先） |
| VGW (Virtual Private Gateway) | VPC 侧的 VPN/DX 终结点 |
| vCPE | 第三方虚拟 CPE 软件，提供 Site-to-Site VPN |
| BFD (Bidirectional Forwarding Detection) | 毫秒级链路故障检测协议 |

## 深度分析

### 1. 双轨制冗余架构的设计哲学

文章揭示了 AWS Direct Connect 迁移设计中一个深刻的工程哲学：**双轨制冗余**（Dual-Track Redundancy）。DX+VPN 与 DX+DX 两种场景代表了两种截然不同的风险偏好与成本平衡。DX+VPN 采用「专线为主、VPN 为辅」的模式，利用 VPN 的低成本和快速部署能力，在 DX 故障时承担秒级切换。这种设计在成本敏感型业务（如电商、大规模互联网出口）中具有普适性。

相比之下，DX+DX 场景则是为「对线路服务质量有较高要求」的客户设计，在不同 PoP 节点部署多条专线，通过 BGP 路由属性配置（Active/Passive 或 ECMP）实现负载和高可用。这种架构的代价是更高的专线成本，但换来了可预测的路由路径、更低的尾延迟，以及多路径并行带来的带宽聚合能力。

从网络工程视角看，这两种架构体现了**等价成本路径选择**（ECMP）思想在混合云场景中的具体落地：不是简单地在两条线路上做负载均衡，而是通过 BGP 属性（Local Preference、Community 标签）精密控制每条路径的流量分配权重。

### 2. BGP 流量工程的双向控制机制

文章详细阐述的 BGP 流量工程是整个迁移方案的核心技术支柱。理解这个方案需要从「从本地到 AWS」和「从 AWS 到本地」两个方向分别把握路由策略的相反逻辑。

**从本地到 AWS**（出云方向）的控制依赖于 Local Preference 属性。该属性在本地 AS 内传播，数值越高代表优先级越高。原文明确指出：新线路（上海）接收的路由 Local Preference 应**低于**原线路（深圳）的值（默认 100），从而确保新线路始终处于 Standby 状态，只有当主线路故障时才接收流量。这是一种典型的「降权保优」策略。

**从 AWS 到本地**（入云方向）的控制则依赖于 BGP Community 标签。原文中通过新线路（上海）向 AWS 通告的所有本地路由打上 Community 标签 `7224:7100`，AWS 端的路由策略会识别这个标签并**优先选择不打标的原线路**。这里的核心机制是：AWS 使用 `7224:7100` 标签来标识「备用路径」，使流量继续通过原线路（深圳）进入本地网络。

这两个方向的组合形成了完整的「双向流量工程」闭环：出云方向通过 Local Preference 控制本地网关的出站选路，入云方向通过 Community 标签控制 AWS 的入站选路。这种双向控制能力是 BGP 在大规模网络中的核心价值体现。

### 3. vCPE 静态路由与 BFD 秒级切换的技术实质

DX+VPN 场景中最值得关注的技术细节是 **vCPE（虚拟 CPE）+ 静态路由 + BFD** 三者的组合。原文描述的路由设计精妙之处在于利用了**最长掩码匹配优先**（Longest Prefix Match）原则：VPC 路由表中设置一条掩码更短的 `192.168.0.0/16` 静态路由指向 vCPE ENI，而 DX 路由通过 BGP 传播时使用的是更具体的子网路由。

这意味着当 DX 正常工作时，VPC 会选择通过 DX 的更具体路由；当 DX 故障时，BFD 检测到链路中断，DX 路由从路由表中消失，VPC 自动回退到 `192.168.0.0/16` 静态路由，经由 vCPE 的 Site-to-Site VPN 隧道传输流量。

BFD（Bidirectional Forwarding Detection）在其中的作用是将故障检测时间从传统的 BGP hold timer（通常为秒级，可能达数十秒）降低到**毫秒级**。原文明确定义「使得 DX 自动切换至 VPN 的时间降低至秒级」，这个「秒级」是相对于传统 BGP 切换可能需要数分钟而言的。BFD 的快速检测能力是实现平滑故障转移的关键使能技术。

### 4. 维护窗口纪律的工程化价值

文章反复强调「在约定维护窗口期间执行」这一要求看似简单，实则反映了大规模网络变更管理中最容易被忽视的纪律性问题。维护窗口（Maintenance Window）的核心价值在于：它为变更提供了一个**可预测的、有准备的、具备回滚能力的**时间框。

具体而言，在维护窗口内执行 VIF 创建、BGP 策略配置、流量切换等关键操作，意味着：网络运维团队处于值班状态能够响应异常；所有相关干系人已提前知会；回滚方案已准备就绪；监控告警已加强。原文将这一原则工程化为 5 步子流程：建立新连接 → 配置 VIF → 配置 BGP 路由属性策略 → 故障转移测试 → 删除旧连接。

这个流程的精妙之处在于它将「测试」步骤前置：在删除旧连接之前，先通过关闭主连接 BGP 会话来强制流量走新 VIF，验证新连接的工作负载是否满足性能要求。这个「测试-验证-回滚」的模式是将网络变更风险控制在可接受范围内的根本方法论。

### 5. 中国区 DX PoP 迁移的地域特殊性

文章的一个重要贡献是将 AWS 中国区的 DX 节点迁移问题具体化。中国区的 DX 部署与全球其他地区存在显著差异：AWS 在中国区的 DX 节点布局由宁夏、北京、上海、深圳等有限节点组成，而合规要求决定了境外节点不可用于中国区业务。

这种地域特殊性带来的工程挑战是：当企业需要从深圳节点迁移到上海节点时，不是简单的「增加一条新线路、删除一条旧线路」，而是涉及到**跨境流量调度**、**合规边界变化**和**多运营商互联**等复杂问题。原文中给出的深圳→上海/宁夏/北京迁移案例，直接回应了中国区 AWS 用户的这一痛点。

## 实践启示

### 1. 在任何 DX 迁移前，必先完成冗余架构验证

在启动 DX 节点迁移之前，首要动作是确保目标站点已具备符合 AWS 弹性建议的冗余网络连接。这意味着：迁移不是「拆旧换新」的单程票，而是「先建新通道、再验证、再割接」的多阶段过程。任何跳过冗余验证直接进行流量迁移的操作，都可能导致业务中断。

实践中，网络团队应在迁移规划阶段就明确回答：新的 DX 节点是否满足可用性要求？是否有备份通道（VPN 或第二条 DX）在新通道故障时承接流量？BFD 检测机制是否已在新旧通道上同时配置？只有这些问题的答案都是肯定的，迁移才能进入下一阶段。

### 2. BGP 流量工程的双向配置必须同步到位

在配置 BGP 策略时，很多工程师容易只关注「从本地到 AWS」方向（出云方向）的 Local Preference 设置，而忽略「从 AWS 到本地」方向（入云方向）的 Community 标签配置。原文明确指出，这两个方向的控制是**缺一不可的**：如果只配置了出云方向的降权策略而忽略了入云方向，AWS 侧的回程流量仍可能通过新线路进入本地网络，导致流量工程失效。

建议的实践做法是：在配置 BGP 策略之前，先在便签纸上画出双向流量的路径，标记每个关键节点的路由策略（Local Preference 值、Community 标签），然后再开始配置。配置完成后，通过 `show ip bgp` 和路由表检查验证双向策略是否按预期生效。

### 3. 故障转移测试必须在维护窗口内严格执行

故障转移测试是整个 DX 迁移流程中最具风险但也最关键的验证步骤。原文定义的测试方法是：关闭主连接上的 BGP 会话，强制所有流量通过新 VIF 传输，然后在新的 DX 连接上测试工作负载。

这个步骤的工程纪律要求是：**必须先确认回滚方案已准备就绪**，再执行测试。如果测试过程中发现新连接性能不达标，必须能够立即恢复主连接、将流量回滚到原始状态。这意味着测试前需要在本地设备上预先配置好「恢复主连接 BGP 会话」的操作命令，并安排专人负责执行回滚操作。

### 4. vCPE + 静态路由的设计要充分考虑路由优先级

在 DX+VPN 场景中，vCPE 静态路由的设计需要特别注意路由优先级的精确性。原文描述的设计逻辑是：利用最长掩码匹配优先原则，让 DX 的更具体路由优先于 vCPE 的更宽泛静态路由。

实践中的常见陷阱是：当本地网络存在多个网段时，静态路由的配置可能与通过 BGP 传播的 DX 路由产生冲突或意外的路由环路。因此，建议在配置 vCPE 静态路由之前，先完整梳理本地网络的路由表，标注每个网段的来源（DX BGP 路由还是 vCPE 静态路由），确保不存在重叠和冲突。

### 5. 迁移完成后及时清理旧连接资源

在确认新的 DX 连接稳定运行后，必须及时删除原 Direct Connect 连接。这不仅是从成本角度考虑（避免为闲置的旧连接付费），更重要的是避免旧连接上的配置残留对未来的网络变更造成干扰。

建议的实践做法是：建立「迁移后检查表」，在确认新连接稳定运行 48-72 小时后，执行删除旧连接的标准操作。删除前应在监控平台上确认旧连接上已无业务流量；删除后应确认账单中不再出现旧连接的费用项。

## 来源

## 相关实体
- [Aws Devops Agent 实战云网络故障自主调查与修复建议](ch11/267-aws-devops-agent.html)
- [Habby Game Aws Devops Agent](ch11/267-aws-devops-agent.html)
- [Aws Devops Agent Mcp Server打通混合云网络排障的最后一公里](../ch07/046-aws-devops-agent-mcp-server.html)
- [Amazon Iot Core Kiro Industrial Data Pipeline](https://github.com/QianJinGuo/wiki/blob/main/entities/amazon-iot-core-kiro-industrial-data-pipeline.md)
- [Cost Effective Deployment Of Vision Language Models For Pet Behavior Detection O](ch11/201-cost-effective-deployment-of-vision-language-models-for-pet.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/direct-connect-dx-迁移最佳实践.md)
- [databricks storage ecosystem & opensharing：企业数据治理从 migrate e](../ch01/1004-rag.html)

---

