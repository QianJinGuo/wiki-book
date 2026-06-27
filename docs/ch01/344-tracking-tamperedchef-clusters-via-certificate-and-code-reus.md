# Tracking TamperedChef Clusters via Certificate and Code Reuse

## Ch01.344 Tracking TamperedChef Clusters via Certificate and Code Reuse

> 📊 Level ⭐⭐ | 11.0KB | `entities/trackingtamperedchefclustersviacertificateandcodereuse.md`

## 核心要点

- Published Time: 2026-05-20T00:00:00+00:00
- This article documents novel activity clusters that have significant overlap with the publicly described threat known as TamperedChef (aka EvilAI). TamperedChef-style malware is trojanized productivity software, such as PDF editors or calendars, that deliver malicious payloads.
- These campaigns typically employ malicious ads that direct users to sites hosting the applications. While this style of malware shares many similarities in technical operation, installation lures and distribution methods, we do not attribute it to a single author or group.
- TamperedChef-style malware samples share characteristics with potentially unwanted programs (PUPs) and adware. These include robust mechanisms to remain persistent, and end-user licensing agreements (EULAs) that attempt to legally cover the software's questionable actions. However, TamperedChef-style malware is far more stealthy than PUPs or adware, remaining dormant for weeks to months before activating. This includes continuous command and control (C2) methods enabling adversaries to retrieve additional payloads, such as information stealers, proxy tooling or remote access Trojans (RATs).
- We have been tracking several campaigns of TamperedChef-style activity starting in 2024, with three distinct clusters: CL-CRI-1089, CL-UNK-1090 and CL-UNK-1110. Between the three clusters of activity, we have identified over 4,000 samples across 100 unique variants.
- Palo Alto Networks customers are better protected from TamperedChef activity discussed in this article through the following products and services:
- *   [Cortex XDR](https://docs-cortex.paloaltonetworks.com/p/XDR) and [XSIAM](https://docs-cortex.paloaltonetworks.com/p/XSIAM)
- *   [Prisma Browser](https://docs.paloaltonetworks.com/prisma-access-browser)

## 深度分析

### 1. 威胁行为体的TTPs模式

TamperedChef攻击链展现出高度结构化的入侵策略：

**初始入侵阶段**

- 利用恶意广告（malvertising）引导用户至伪造的生产力工具网站（PDF编辑器、日历、ZIP解压工具等）
- 网站设计专业，包含完整法律条款和联系页面，降低用户警惕性
- 通过CDN分发实现单次点击下载，最大化用户体验流畅度

**持久化机制**

- 代码签名增加二进制文件的可信度
- 频繁重编译（通常每1-4周）以规避静态哈希检测
- 潜伏期长达数周至数月，激活后才加载第二阶段恶意载荷

**第二阶段载荷类型**

- 广告软件和浏览器劫持（修改默认搜索引擎、安装敌意浏览器）
- RAT（远程访问木马）和信息窃取器
-  residential proxy恶意软件

### 2. 三大集群的差异化追踪

| 特征 | CL-CRI-1089 | CL-UNK-1090 | CL-UNK-1110 |
|------|-------------|-------------|-------------|
| **活跃时间** | 2023年初 | 持续追踪中 | 2025年6月广泛安装 |
| **运营主体** | 乌克兰、马来西亚、新加坡、英国、美国实体 | 以色列广告公司FireArc关联 | 主要与TamperedChef别名相关 |
| **代码签名** | 34个独立签名实体 | 39个以色列公司（含更名操作） | 多家签名实体 |
| **样本数量** | 3,300+ | ~750 | 未明确 |
| **TTP变异** | 高——每活动完全新套TTP | 中——共享基础设施 | 高 |
| **代码复用** | 有限，仅共享证书 | 存在垂直整合 | 部分复用 |

### 3. 代码签名证书滥用的关键洞察

**证书追踪方法论**

- 识别代码签名实体 → 映射证书链 → 转向类似样本 → 迭代重复
- 单个代码库被两个独立签名的证书签名，表明单一实体持有多个签名证书（可能是壳公司或证书盗窃）

**垂直整合的商业模式**

- CL-UNK-1090展现出罕见的"广告公司-恶意软件开发商"垂直整合模式
- CANDY TECH LTD既是代码签名实体，又是广告分发商，同时参与恶意软件创建
- 这种整合使得通过广告透明度平台追踪成为可能

**成本分析**

- 每活动燃烧超过2个证书即带来高昂成本（单个OV/EV证书数千元）
- CL-CRI-1089追踪到34个唯一证书，仅证书成本超10,000美元
- 这种"低效"操作表明：攻击者认为证书成本是合理的运营支出

### 4. AI在攻击中的应用

- **代码生成**：CL-CRI-1089的多个代码库高度变异但共享证书，暗示可能由多个开发团队或生成式AI协助开发
- **网站内容生成**：分发网站的DOM结构呈现非确定性特征——视觉相似但代码结构不同——这是LLM生成内容的典型特征
- **PDB遗留**：RapiDoc活动中发现的程序数据库路径（`D:\!Work\Clients\<user>\Projects\...`）表明开发流程可能存在安全意识不足

### 5. 检测规避技术的深层含义

- **延迟激活**：数周至数月的潜伏期远超普通PUP/广告软件，暗示更高级的攻击意图
- **混淆手段**：仅对加载器和窃取器组件进行混淆，而非整个二进制文件，表明目的是保护恶意载荷而非知识产权
- **EULA法律包装**：明确的法律免责声明企图为恶意行为提供"合法"外衣

## 实践启示

### 对安全团队的指导

**预防措施**
1. **用户安全意识培训**：教育用户识别伪装成合法生产力工具的恶意软件，即使是来自看起来专业的网站
2. **端点保护**：确保所有主机配置更新的EDR/XDR解决方案，特别是具备行为分析和高级WildFire防护的产品
3. **企业浏览器**：部署企业浏览器保护，在感染情况下仍能保护已保存的凭证
4. **设备加固**：限制从未受信任来源安装软件，考虑实施应用白名单机制

**检测与响应**
1. **持续监控**：由于威胁多样性，建议实施基于行为的威胁狩猎，而非依赖单一IOC
2. **恶意软件清除后**：

   - 移除隔离所有恶意软件相关文件（通常位于安装文件夹）
   - 清除持久化机制（计划任务、注册表Run键）防止重新感染
   - 对主机进行全面恶意软件扫描以识别第二阶段组件
   - 吊销受影响用户的活动会话并重置凭证
   - 审查访问日志确保凭证未被滥用

**代码签名证书监控**
1. 监控组织使用的代码签名证书的异常模式：

   - 单个代码库被多个证书签名
   - 证书链中涉及壳公司或高风险司法管辖区的实体
2. 考虑建立内部证书信誉评分系统

**广告流量分析**
1. 利用广告透明度平台识别可疑的广告主和目标域名
2. 对托管生产力工具下载的域名进行主动狩猎
3. 特别关注"一次性"或"工具类"域名的异常广告活动

### 对威胁情报的启示

**追踪方法**
1. **多维度归因**：结合代码签名、代码复用、广告透明度、企业股权结构等多种数据源进行归因
2. **壳公司识别特征**：

   - 共同注册地址（特别是住宅地址）
   - 少量员工和最小在线存在
   - 共享所有权结构
   - 频繁更名
3. **广告平台价值**：广告透明度数据可揭示恶意软件运营商与合法广告渠道的关联

**未来趋势预警**
1. **签名规避**：观察到攻击者正在减少代码签名的使用，需要开发新的追踪方法
2. **生成式AI滥用**：预期攻击者将更多利用AI生成钓鱼网站、恶意代码和逃避检测的payload
3. **垂直整合深化**：广告公司与恶意软件开发商的整合模式可能成为行业新常态

## 相关实体
- [Tracking Tampered Chef Clusters Aef374](../ch01-517-tracking-tamperedchef-clusters-via-certificate-and-code-reus/)
- [Agentexecutorgooglesdistributedagentruntime](../ch01-411-agent-executor-google-s-distributed-agent-runtime/)
- [Howanimagecouldcompromiseyourmacunderstandinganexiftoolvulnerabilitycve 2026 310](../ch12-020-how-an-image-could-compromise-your/)
- [Shub Reaper Macos Stealer Attack Chain](../ch12-014-shub-reaper-macos-stealer-spoofs-apple-google-and-microso/)
- [Liteframeefficientvisionencodersunlockframescalinginvideollms](../ch01-890-liteframe-efficient-vision-encoders-unlock-frame-scaling-in/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/trackingtamperedchefclustersviacertificateandcodereuse.md)

---

