# Tracking TamperedChef Clusters via Certificate and Code Reuse

## Ch01.669 Tracking TamperedChef Clusters via Certificate and Code Reuse

> 📊 Level ⭐⭐ | 6.8KB | `entities/tracking-tampered-chef-clusters-aef374.md`

## 核心要点

Comprehensive threat intelligence report on TamperedChef malware clusters. Documents 4000+ samples across 100 variants, technical analysis of malware behavior, C2 methods, and persistence mechanisms. Valuable IOC and detection guidance.

## 标签

security, agent, ai

## 深度分析

TamperedChef 绝非普通的广告软件（adware）活动，其背后是三个独立运作但共享TTP（战术、技术和程序）的高级威胁集群。Unit 42 将其追踪为 CL-CRI-1089、CL-UNK-1090 和 CL-UNK-1110，三者合计掌握 4000+ 样本和 100+ 变种，地理分布覆盖全球非选择性目标。更关键的是，这些集群展现出与其"伪装成生产力软件"外观完全不符的高度组织化运营：数周至数月的静默期、频繁的二进制重编译（每隔1周至1个月）、专业级的社工网页、垂直整合的广告-恶意软件开发架构，以及对代码签名基础设施数万美元的持续投入。这不是机会主义的"按下就黑"（run-of-the-mill）攻击，而是有资源、有耐心、有长远规划的持续性运营。

三个集群的运营模式揭示了不同的威胁组织基因：CL-CRI-1089（代号 Calendaromatic/DocuFlex/AppSuite PDF）使用多个壳公司分散运营，但共享代码签名证书（34个证书与该集群关联），行动涉及乌克兰、马来西亚、新加坡、英国和美国，背后运营者具有明显的跨国犯罪特征。CL-UNK-1090（代号 CrystalPDF/Easy2Convert/PDF-Ezy）则是垂直整合的典型：代码签名公司和广告公司同属一个所有者（Zizik with me 和 Fairark Systems Ltd.），在以色列注册运营，直接控制恶意软件的推广和销售渠道。CL-UNK-1110 与 TamperedChef 原名关联度最高，包含 JustAskJacky、GoCookMate、RocketPDFPro 等。这些集群共用 C2 域名结构、代码签名日期和嵌入的 PDF 编辑器，但彼此代码不共享——说明运营者宁可放弃代码复用带来的效率，也要避免一处暴露导致全网暴露的 OPSEC（操作安全）逻辑。

追踪方法本身是这项研究最有价值的方法论贡献。攻击者的运营安全失败（而非技术漏洞）为防御者提供了多条追踪路径。代码签名证书追踪是最直接的线索：攻击者使用 OV/EV 证书，需要企业实体完成身份验证，这留下了公司注册信息、注册地址（存在重叠）和共同所有权结构等公开可查的痕迹。通过系统性地追踪证书重叠、壳公司名称变更历史和共同注册地址，Unit 42 成功将 CL-UNK-1090 的 39 家以色列公司全部归因于单一所有者。广告透明平台是另一条正交追踪路径：TamperedChef 的分发高度依赖恶意广告（malvertising），且 CL-UNK-1090 的广告公司和代码签名公司存在垂直整合——这意味着广告透明平台上的数据（广告主信息、投放模式、域名重叠）可以直接连接到代码签名基础设施。

这项研究揭示的最重要运营安全教训是：低技术门槛的攻击（使用 Neutralinojs 框架的简单 RAT、利用合法代码签名并不复杂的后门）配合高运营安全投入，可以实现极高的隐蔽性和规模。CL-CRI-1089 的代码质量显示出"不成熟的开发实践和可能缺乏经验的恶意软件开发团队"的特征，但其运营规模仍达到 3300+ 样本。Unit 42 认为其中一个重要因素是生成式 AI 的使用：分布网站的内容"视觉上相似但 DOM 结构不同"——这正是大语言模型生成内容的特征；每个 Campaign 使用全新代码库而非在前代基础上迭代——这暗示每次Campaign都可能由不同开发团队或 AI 辅助快速生成。攻击者正在将"开发者生产效率"和"基础设施运营效率"商品化。

从地缘政治和动机角度看，三个集群的差异同样显著。CL-CRI-1089 聚焦凭证窃取、广告软件和代理式恶意软件，运营模式呈现"全球分散但中央指挥"特征。CL-UNK-1090 的动机更为模糊：其样本表面上像广告软件，但实际包含 RAT 和 .NET loader 功能——这是合法广告软件完全不需要的能力。值得注意的是，Unit 42 观察到这些集群正在"远离代码签名"——这可能是面对日益成熟的证书追踪防御的主动适应，也意味着未来的追踪方法必须演进。这整个威胁态势指向一个更广泛的趋势：恶意软件的"商业化"和"服务化"正在降低攻击门槛，同时提高防御者的追踪难度。

## 实践启示

- **追踪代码签名证书重叠**：将代码签名证书纳入威胁情报库，监控已知恶意签名者的新证书申请和证书共享模式——这是发现新恶意活动最早期的指标之一 
- **利用广告透明平台主动狩猎**：监控广告透明平台上的异常模式——同一广告主短时间内为多个"生产力工具"类应用投放广告，且目标 URL 存在代码签名重叠，是高置信度的恶意广告指标 
- **以行为而非特征构建检测规则**：TamperedChef 样本共享持久化机制（计划任务/注册表 Run 键）、信息收集（系统版本/浏览器/地理定位）、长静默期和第二阶段载荷请求——基于这些 TTPs 构建狩猎规则，比依赖哈希或证书更具有鲁棒性 
- **审查企业浏览器和 Extension 权限**：TamperedChef 通过流氓生产力应用渗透，若已发现感染，应立即吊销受影响用户的活动令牌并重置凭证，同时假定所有浏览器存储的凭证已泄露 
- **建立供应链来源审查机制**：对下载量极高的"免费工具"（PDF编辑器、压缩工具、日历应用）建立可信来源清单，优先在企业浏览器（如 Prisma Browser）中运行，并持续监控其代码签名实体的公司注册信息变化 

## 相关实体
- [Trackingtamperedchefclustersviacertificateandcodereuse](https://github.com/QianJinGuo/wiki/blob/main/entities/trackingtamperedchefclustersviacertificateandcodereuse.md)
- [Nginx Rift Achieving Nginx Rce Via An 18 Year Old Vulnerability](https://github.com/QianJinGuo/wiki/blob/main/entities/nginx-rift-achieving-nginx-rce-via-an-18-year-old-vulnerability.md)
- [Github Investigating Teampcp Claimed 17Cc77](ch01/862-github.html)
- [Exiftool Compromise Mac 592994](ch01/715-9.html)
- [Skill Issues Compromising Claude Code With Malicious Skills Agents Part 1](ch01/808-skill-issues-compromising-claude-code-with-malicious-skills.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/tracking-tampered-chef-clusters-aef374.md)

---

