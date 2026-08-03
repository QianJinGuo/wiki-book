# Direct Connect (DX) 迁移最佳实践

## Ch01.828 Direct Connect (DX) 迁移最佳实践

> 📊 Level ⭐⭐ | 7.6KB | `entities/direct-connect-dx-迁移最佳实践.md`

# Direct Connect (DX) 迁移最佳实践

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/direct-connect-dx-迁移最佳实践.md)

## 摘要

本文源自 AWS 中国区博客，系统梳理了将 AWS Direct Connect（DX）专线从旧 PoP 节点平滑迁移到新站点的设计考虑与操作步骤。文章以中国区"深圳 → 上海/宁夏/北京"节点迁移为例，重点讲解 DX+VPN 与 DX+DX 两种典型冗余场景下的差异化迁移路径，核心手段是 BGP 流量工程、故障转移测试与维护窗口纪律。

## 核心要点

- **迁移前置盘点**：先梳理现有连接的节点位置并制定详细迁移规划，通过 Direct Connect 站点列表选择新站点位置。
- **冗余底线**：迁移全程须保持符合 AWS Direct Connect 弹性建议的冗余网络连接，避免切换窗口出现单点。
- **先测后切**：生产流量切换到新连接之前，务必先通过新连接测试流量；切换须在约定维护窗口内执行。
- **BGP 流量工程**：使用 Local Preference（出方向）与 BGP Community 标签（入方向）将新连接保持在 Standby 状态，确保生产流量不误入新线路。
- **DX+VPN 备份**：VGW 终结 DX + 第三方 vCPE 的 Site-to-Site VPN，以最长掩码匹配静态路由与管理距离（EBGP=20）控制主备，配合 BFD 实现秒级切换。
- **DX+DX 备份**：面向对带宽、丢包率、延迟有高要求的客户，在不同 PoP 部署多条专线，通过 BGP Active/Passive 或 ECMP 满足负载与高可用。
- **收尾清理**：新连接验证通过后删除旧连接，顺序为先删 VIF 再删 Direct Connect 连接。

## 深度分析

### 迁移设计：先冗余、再切换、后清理

DX 节点迁移的本质，是把一条承载生产流量的专线从旧 PoP 平移到新 PoP，而不造成业务中断。文章给出的设计考虑包括：查看 Direct Connect 站点列表选择新站点、保证迁移期间拥有符合弹性建议的冗余连接、切换前先经新连接测试流量、用 BGP 属性做流量工程（Active/Standby）、在维护窗口内完成切换。

迁移过程可归纳为五步：订购新站点的 DX 连接 → 配置 VIF 与本地设备 → 测试故障转移确认流量走新连接 → 切换流量 → 删除旧连接。该流程以中国区深圳节点迁往上海、宁夏、北京等节点为例展开，但同样的思路与步骤适用于 AWS 全球任何 DX 连接。

### 场景一：DX+VPN 备份——成本敏感型高可用

部署多条 DX 专线成本较高，因此使用 Site-to-Site VPN 作为 DX 冗余备份是兼顾高可用与成本的方案。架构上由 VGW 终结 DX，第三方 VPN 软件（vCPE）承担 Site-to-Site VPN 功能（相关落地可参考 [AWS IPsec VPN 实施](ch05/100-ai.html)）。

路由控制采用"双向不对称"设计：出云方向（VPC→本地）在 VPC 路由表开启 VGW 路由传播，同时设置一条掩码更短的 `192.168.0.0/16` 静态路由指向 vCPE 的 ENI，依据最长掩码匹配原则让 DX 成为主线路；入云方向（本地→VPC）设置掩码更短的 `10.42.0.0/16` 静态路由指向 VPN tunnel 接口，或调整静态路由管理距离（DX 所用 EBGP 管理距离为 20），让本地网关优先选择 DX。此外在本地网关 DX 接口上配置 BFD，可将 DX 自动切换至 VPN 的时间降低到秒级。

该场景的迁移步骤为：在新 DX 站点建立第二条连接 → 创建与主连接同类型的 VIF（若主连接关联在 Direct Connect Gateway 上，新 VIF 也应关联同一 DXGW）→ 配置 BGP 路由属性策略 → 关闭主连接 BGP 会话做故障转移测试（演练方法论可参考 [AWS 故障演练实战](ch05/100-ai.html)）→ 验证后删除原连接。全程强烈建议在维护窗口内执行。

### 场景二：DX+DX 备份——多 PoP 专线冗余

对线路服务质量（带宽、丢包率、延迟）有较高要求的客户，通常会在不同 DX PoP 节点部署多条专线，通过 BGP 路由属性（Active/Passive 或 ECMP）满足负载与高可用要求。该场景以在北京建立第三条连接（Active/Passive 举例）说明迁移路径，步骤与场景一基本一致，区别在于故障转移测试需同时关闭深圳、上海两条旧连接的 BGP 会话，强制流量全部经由新连接传输。

### BGP 流量工程：如何让新连接保持 Standby

保持新连接 Standby 的核心是双向流量工程：本地→AWS 方向，BGP 会优先选择 Local Preference 值更高的路由，因此在本地网络侧把从新线路接收路由的 Local Preference 调低（未配置时默认为 100），即可让本地流量继续走旧线路；AWS→本地方向，通过新线路通告的本地路由打上 BGP Community 标签 `7224:7100`，确保 AWS 侧流量仍优先使用原线路。AWS 使用 7224:7100、7224:7200、7224:7300 系列 Community 标签控制路由优先级。

VIF 设置上强调两点：新 VIF 必须与主连接同类型（Private VIF / Public VIF / Transit VIF）；若主连接关联在 Direct Connect Gateway 上，新 VIF 也要关联同一个 DXGW——DXGW 是全球资源，允许从任意 DX 站点连接到任意 AWS 区域的 VPC，这是跨 PoP 迁移时保持网络拓扑连续性的关键。

## 实践启示

1. **迁移前先盘点拓扑**：梳理现有连接的节点位置、VIF 类型与 DXGW 关联关系，制定详细迁移规划，避免迁移中才发现依赖缺失。
2. **用 BGP 属性而非断线做切换**：出方向调 Local Preference、入方向打 BGP Community 标签的组合，能让新连接长期保持 Standby，生产流量零误入。
3. **故障转移测试是安全网**：正式切换前关闭主连接 BGP 会话强制流量走新线路，验证工作负载与性能；一旦发现问题可立即停止测试、恢复主连接回切。
4. **严守维护窗口纪律**：VIF 创建、路由策略变更、流量切换等关键操作均在约定维护窗口内执行，控制变更风险面。
5. **按成本与质量诉求选备份方案**：成本敏感选 DX+VPN（静态路由最长掩码匹配 + 管理距离 + BFD 秒级切换）；对线路质量要求高选 DX+DX 多 PoP（Active/Passive 或 ECMP）。
6. **收尾清理旧资源**：新连接验证通过后，按"先删 VIF、再删 DX 连接"的顺序清理，防止遗留计费与配置残留。

## 相关实体

- [Direct Connect (DX) 迁移最佳实践（英文实体）](ch11/038-direct-connect-dx.html)
- [AWS Network Firewall VGW BGP 流量检查](ch01/1188-spec.html)
- [Amazon VPC NAT Gateway 对比](https://github.com/QianJinGuo/wiki/blob/main/entities/amazon-vpc-regional-nat-gateway-与-az-nat-gateway-全面对比.md)
- [AWS Glue 大规模迁移方法论](ch01/1429-0.html)
- [MOC: Amazon AWS AI](https://github.com/QianJinGuo/wiki/blob/main/moc/amazon-aws-ai.md)
- [MOC: 数据基础设施](https://github.com/QianJinGuo/wiki/blob/main/moc/data-infrastructure.md)

---

