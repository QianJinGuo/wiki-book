# What’s New with vSphere in VMware Cloud Foundation 9.1?

## Ch11.043 What’s New with vSphere in VMware Cloud Foundation 9.1?

> 📊 Level ⭐⭐ | 13.5KB | `entities/whats-new-with-vsphere-9-1.md`

# vSphere in VCF 9.1 新特性解析

> 来源：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/whats-new-with-vsphere-9-1.md)

## 核心要点

- **vCenter Quick Patch**：安全补丁更新 downtime 降至 1 分钟内，部分场景 zero downtime 
- **ESX Live Patch**：kernel 级别热补丁默认启用，vmkmodule + vSAN/UserSpace daemon 均支持 
- **Intel QAT 加速 vMotion**：加密 vMotion 卸载至硬件，释放 CPU 核心给业务负载 
- **Zero Touch Provisioning**：UEFI HTTP/S Boot，无需 TFTP 服务器即可网络引导 ESXi 
- **Multi-Vendor AI Platform**：Enhanced DirectPath I/O 支持 GPU-direct RDMA over RoCE，NVIDIA vGPU time slicing + MIG 共存 

## vCenter 维护革新

### Quick Patch：安全补丁分钟级部署

传统 in-place patching 会更新 patch payload 中所有 RPM，不区分是否有代码变更。vCenter Quick Patch 只替换有代码变更的 RPM 或二进制文件，大幅缩减维护窗口。

实测效果：

- **Downtime：< 1 分钟**（部分场景 zero downtime）
- VM 和 Kubernetes 集群部署**不中断**
- Automation 和 API 工作流**持续运行**
- 关键安全补丁不再需要等维护窗口 

### Reduced Downtime Upgrade (RDU)

9.1 引入在线 depot 连接，简化了 RDU 方法在联网 vCenter 实例上的使用。vCenter 9.1.x 及后续 patch/update/upgrade 均可通过 RDU + 在线 depot 完成。

vCenter 维护状态感知 API：vCenter 新增 API，其他组件可查询 vCenter 是否正在或计划维护，Envoy 反向代理返回 503 Header 并附带预计完成时间。

### 单一 API 调整 vCenter 规格

`PATCH /deployment/size` API —— 一次调用 + 一次重启，即可 scale up vCenter 计算和磁盘大小。

## ESXi 生命周期管理

### Zero Touch Provisioning

基于 vSphere Auto Deploy，使用 UEFI HTTP/S Boot 协议，无需外部 TFTP 服务器。配置 UEFI boot URL 指向 vCenter，即可网络引导主机。

| 特性 | 说明 |
|------|------|
| 引导协议 | UEFI HTTP/S Boot |
| 静态 IP | 可在 UEFI 中配置，无需 DHCP |
| 镜像校验 | SHA256 checksum（image definition，非 VIB checksum）|
| VCP 缺失 | 可引导至非 VCP cluster，使用默认配置加入 |

### ESX Live Patch 默认启用

ESX live patch 默认在所有 cluster 启用，自动对 capable patch 使用热补丁，对非 capable patch 回退到标准维护模式 + 重启。

9.1 新增支持：

- **vmkernel 热补丁性能提升**
- **vSAN daemon、core storage daemon、library** 均支持
- **TPM enabled 服务器**支持 Live Patch（TPM 无需禁用）
- Cluster 级别和 vCenter 级别均可配置 

### vSphere Lifecycle Manager 增强

9.1 的 HSM（Hware Support Manager）验证扩展到 vSAN cluster —— 即使没有第三方 HSM 也能对 vSAN cluster 内设备做固件/驱动的一级验证。

## 性能与伸缩性

### vCenter Operations Per Minute 提升 25%

大规格和超大规模 vCenter 部署，每分钟操作量提升 25%。VM backup 操作支持 500-1000 并发（取决于 vCenter 规格），且不再耗尽所有 vCenter 资源。

新增监控能力：

- **vCenter Utilization Monitoring API**：追踪所有 vCenter Services 的请求数，与允许上限对比
- **High Session Count Alarm**：sessions 达到 3000 上限（默认）时触发，显示 top 5 资源消耗用户
- **Increased Request Load Alarm**：service endpoint 达到 1024 并发请求上限时触发 

### vMotion 并发度提升

旧版：max 8 并发 vMotion，8 个 slot 全满时必须等待全部完成才能启动新任务。

9.1：任一 slot 释放即刻启动新任务，并发分布更均匀，减少单主机峰值负载。

### Intel QAT 加速加密 vMotion

vMotion 加密计算卸载至 Intel QAT（QuickAssist Technology），释放 CPU 资源给工作负载。

适用场景：需要最大化资源利用率的客户，QAT 承担 vMotion 数据加密任务，CPU 核心返回给实际业务。

### Topology Aware Scheduler 优化

针对新一代高密度处理器优化：不仅考虑 CPU 竞争（ready time），还综合考虑 **cache 竞争和 memory bandwidth 竞争**。

对非对称 NUMA 拓扑（节点间距离差异显著），可将同一 VM 的 sibling NUMA clients 放置在距离更近的节点子集上。

## AI/ML 基础设施支持

### Enhanced DirectPath I/O 生态扩展

9.1 引入更完整的硬件虚拟化支持：**不是简单 passthrough，而是真正的虚拟化** —— 可执行 maintenance 和 scaling 而无需销毁 AI 工作负载。

支持的操作（含 Stun-based 和 Fast Suspend-Resume）：

- Storage vMotion
- Snapshots（含 Memory Snapshots）
- Disk reconfiguration
- Hot add/remove 任意虚拟设备
- ESX Live Patch 

### AMD IOMMU 虚拟化

ESX 9.1 扩展 AMD vIOMMU 支持，实现安全的 DMA 直接访问，允许 guest 直接访问 MMIO registers。

### GPU-Direct RDMA over RoCE

Enhanced DirectPath I/O 支持 GPU-to-GPU 直接通信 via RDMA over Converged Ethernet —— 适用于大规模 AI 工作负载或高速数据处理，获得接近原生硬件性能，同时保留虚拟化数据中心的易管理性。

NVIDIA vGPU 配置支持 **time slicing 和 MIG mode 共存**，更高效地共享资源，提升整合率。

## DRS 与 VM 迁移

### Non-Disruptive vMotion Evacuation

DRS Optimized Evacuation：VM 只在剩余容量足够且无资源竞争时才迁移。标准 Evacuation：只要目标主机兼容且满足资源约束就迁移。

两种模式对比：

- **标准模式**：兼容即可迁移，可能造成目标主机资源竞争
- **Non-Disruptive 模式**：确保 VM 当前计算需求能在目标主机上无争用地满足 

### Flow Processing Offload (FPO)

硬件 steering：将复杂网络规则处理从 CPU 卸载到专用硬件，实现线速性能和快速弹性扩展，释放 CPU 资源给业务应用。

## Guest OS 定制增强

VCFA（VMware Cloud Foundation Automation）迁移支持：

- 设置/重置 Linux root 密码
- 重置 Windows administrators 组密码
- 在 Windows 执行定制脚本
- 显式禁用 IPv4，配置 IPv6-only 网络 

VM 可仅定制网络配置，且**powered-on 状态即可实时修改网络**。

## 证书管理自动化

| 证书类型 | 自动续期时机 | 可配置 |
|----------|-------------|--------|
| vCenter TLS | 到期前 5 天 | 否 |
| ESX TLS | 到期前 30 天 | 是（vpxd.certmgmt.certs.autoRenewThreshold）|

外部 CA 签发证书不自动续期，由管理员负责。VMCA 托管证书全程自动。

## vSAN Desired State Configuration

- 维护操作尊重 vSAN maintenance mode 策略和对象可访问性策略 
- Memory Tiering：NVME 设备可声明为内存层，可选声明镜像设备 
- 新主机加入时，自动从主机提取 IP 等属性并填入集群配置文件的 host-specific section 
- Zero Touch Provisioning 支持 vSphere Distributed Switch 配置在主机部署时 bootstrap 

## 深度分析

### 1. vCenter Quick Patch 重新定义"安全补丁窗口"

传统 in-place patching 无论服务是否涉及代码变更都全量更新，实质是用时间换稳定性——维护窗口被不必要的 RPM 写入拖累。Quick Patch 的精准替换打破了这一权衡：它只处理有代码变更的 RPM，把安全补丁的 downtime 压缩到 <1 分钟甚至 zero。这不是优化，是范式转变——安全补丁从"需要计划的事件"变成"随时可打的日常操作"。企业安全响应的颗粒度从"天"降到"分钟"，这在合规要求严格的金融和医疗行业尤其有意义。

### 2. ESX Live Patch + TPM 并存消除安全与可用性的对立

过去启用 Live Patch 常要求禁用 TPM，这与安全基线要求冲突。9.1 解开这个结：TPM enabled 服务器直接支持 Live Patch，kernel、vmkmodule、vSAN daemon 全部覆盖。这意味着关键基础设施可以在不重启的前提下保持最新安全补丁——对于零宕机要求的生产环境，这是从"选择打补丁的时机"到"随时可打"的本质跨越。

### 3. AI 基础设施虚拟化是 VCF 9.1 最被低估的更新

Enhanced DirectPath I/O 的核心不是 passthrough，而是"带虚拟化能力的硬件直连"——保留了 vMotion、Snapshots、Live Patch 等生命周期管理能力，同时实现接近原生的 GPU 性能。这对于 AI/ML 基础设施至关重要：过去 GPU passthrough 意味着"用完即销毁"，无法动态调整；9.1 之后，AI 工作负载可以在不中断的前提下 scale up/down，填补了虚拟化 AI 基础设施的最后一块空白。

### 4. Intel QAT 将 vMotion 加密成本从"CPU 税"变为硬件加速

vMotion 加密一直是 CPU 开销的大户——即便使用 AES-NI，8 个并发 vMotion 仍会显著影响业务负载性能。QAT 卸载将这部分开销转移到专用加速器，CPU 核心完全释放给业务。这对高密度虚拟化环境（VDI、混合云）意义重大：可以在不增加物理主机的情况下提升集群内 VM 密度，直接影响 TCO。

### 5. Topology Aware Scheduler 优化是高密度处理器的必需升级

随着 CPU 核心数增加，NUMA 拓扑复杂度上升——不仅是节点间距离不对称，cache 层次和 memory bandwidth 竞争也更加剧烈。旧版调度器只看 CPU ready time，忽视了 cache 和 memory bandwidth 竞争，在高密度场景下会导致"看起来有空闲 CPU 但 VM 实际变慢"的现象。9.1 的多维调度模型直接回应了新一代服务器的物理特性，对运行高性能计算或 AI 推理的工作负载影响尤为显著。

## 实践启示

1. **立即启用 vCenter Quick Patch**：对于安全敏感环境，Quick Patch 把关键 CVE 修复的维护窗口从 2-4 小时压缩到分钟级。建议配合 vCenter Maintenance API 构建自动化响应工作流，在 CVE 公布后自动触发修复，而不是等待计划维护窗口。

2. **AI/ML 环境优先测试 Enhanced DirectPath I/O**：vGPU + time slicing/MIG 共存允许更灵活的资源分配——同一物理 GPU 既支持需要强隔离的高优先级任务（ MIG），也支持可共享的批量推理任务（time slicing）。结合 Storage vMotion 和 Snapshots，AI 工作负载的生命周期管理终于可以在虚拟化环境下完整实现。

3. **在跑大量 vMotion 的环境中评估 Intel QAT**：如果集群日常有高并发 vMotion 操作（如跨主机负载均衡、维护迁移），QAT 卸载可将 CPU 资源释放给业务。配合 9.1 的并发度提升（任一 slot 释放即启动新任务），集群整体的计算效率会有明显改善。

4. **vSAN cluster 即使没有第三方 HSM 也应启用 Lifecycle Manager 验证**：9.1 的 HSM 验证现在覆盖无第三方集成的 vSAN cluster，固件/驱动一级验证可以提前发现硬件兼容性问题，避免生产环境故障。建议在所有 vSAN 部署中启用这一功能。

5. **Non-Disruptive Evacuation 应作为 DRS 维护的标准模式**：标准 Evacuation 只要兼容就迁移，可能在目标主机上制造新的资源竞争；Non-Disruptive 模式确保迁移后 VM 的资源需求得到无争用满足。对于金融交易、医疗系统等对性能抖动敏感的环境，应将 Non-Disruptive 设为默认。

## 相关实体
- [Cloud Agent Infrastructure Creaoai State Code Credential Isolation 20260606](../ch03/046-agent.html)
- [Llm Raiders How To Repel](../ch01/603-llm.html)
- [Amazon Bedrock Api Security Guide](../ch12/034-amazon-bedrock-api.html)
- [Aderant Transforms Cloud Operations With Amazon Quick](ch11/196-aderant-transforms-cloud-operations-with-amazon-quick.html)
- [Cloud Ai Mobile Testing New Era Amazon Device Farm Mcp Server Practical Guide En](../ch05/090-ai.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/whats-new-with-vsphere-9-1.md)

---

