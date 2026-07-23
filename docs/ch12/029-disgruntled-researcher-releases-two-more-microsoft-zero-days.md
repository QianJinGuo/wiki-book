# Disgruntled researcher releases two more Microsoft zero-days

## Ch12.029 Disgruntled researcher releases two more Microsoft zero-days

> 📊 Level ⭐⭐ | 11.1KB | `entities/disgruntled-researcher-releases-two-more-microsoft-zero-days-5239758.md`

# Disgruntled researcher releases two more Microsoft zero-days

> -> [13-disgruntled-researcher-releases-two-more-microsoft-zero-days-5239758.md](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/13-disgruntled-researcher-releases-two-more-microsoft-zero-days-5239758.md)

## 摘要

2026 年 5 月 13 日，安全研究者 Nightmare-Eclipse（又名 Chaotic Eclipse）在微软 Patch Tuesday 后立即公开两个 Windows 零日漏洞：**YellowKey**（BitLocker 旁路，可绕过全盘加密）和 **GreenPlasma**（提权至 SYSTEM）。这是该研究者 2026 年公开的第五、第六个 Microsoft 零日，与此前的 BlueHammer（CVE-2026-32201）、RedSun、UnDefend 一同构成对微软的"报复性披露"战役。

## 核心要点

- **YellowKey（BitLocker 旁路）**：通过特定按键序列和 USB 加载可绕过 BitLocker 加密获得 Shell 访问；研究者称之为"一生最疯狂的发现之一"，需要物理接触目标机器。
- **GreenPlasma（提权漏洞）**：授予攻击者 SYSTEM 访问权限，研究者发布了部分漏洞利用代码（未完成 PoC），在默认 Windows 配置下会触发 UAC 同意提示。
- **物理访问的合规含义**：尽管需要物理访问，Forescout 的 Rik Ferguson 警告"被盗笔记本不再只是硬件问题，而是数据泄露通知问题"。
- **缓解措施**：YellowKey 可通过启用 BitLocker PIN + BIOS 密码锁缓解；GreenPlasma 目前没有已知缓解措施，需等待微软补丁。
- **研究者身份猜测**：根据报道该研究者据传是微软前员工；其首次声明"有人违反协议，让他无家可归"，故采取报复性披露。
- **真实利用已发生**：Huntress 报告 RedSun 和 UnDefend 的 PoC 代码发布后"迅速被滥用进行真实攻击"。
- **未来威胁**：研究者声称拥有"死人开关"（dead man's switch），警告后续 RCE 披露；专家警告这是针对微软的"升级的报复性战役"。

## 深度分析

### 1. BitLocker 作为"最后防线"的失守

BitLocker 在 Windows 设备安全中扮演**最后防线**的角色——一旦设备丢失或被盗，全盘加密是阻止数据外泄的核心机制。 YellowKey 旁路通过按键序列 + USB 加载绕过这层防线，将"被盗的笔记本"从硬件损失升级为数据泄露事件。

这一漏洞暴露了**单层加密的脆弱性**：
- 加密本身只解决"离线数据读取"问题，不解决"运行时访问"。
- 物理访问 + 启动序列绕过可以打破纯加密假设。
- "可信启动链"（Trusted Boot Chain）的任何一环失守都会传导至整个加密体系。

**安全模型升级路径**：必须将 BitLocker 与 TPM + 预启动 PIN + BIOS/UEFI 密码 + Secure Boot 组合使用，单一 BitLocker 在物理威胁模型下不足够。

### 2. 提权漏洞的"二阶段利用"模式

GreenPlasma 属于典型的**二阶段利用链**中的提权环节。 Bridewell 的 Gavin Knapp 指出：

> "这些提权漏洞常在攻击者获得初始立足点后被武器化，用于发现和收割凭据与数据，然后横向移动到其他系统，最终目标是数据窃取和/或勒索软件部署。"

**关键认识**：单个提权漏洞的 CVSS 分数可能不显眼，但**在攻击链中扮演关键放大器角色**——它把"低权限初始访问"升级为"系统级控制"。安全团队应将 P0 优先级分配给所有本地提权漏洞，因为它们是被武器化最频繁的一类。

### 3. "报复性披露"的产业代价

Nightmare-Eclipse 的披露模式不同于传统的负责任披露——其首次声明"有人违反协议，让他无家可归"，故采取公开施压策略。

**这一事件折射出的产业问题**：

- **披露激励错位**：传统厂商安全响应流程假设研究者合作，但当研究者与厂商关系破裂时，协调机制失效。
- **Patch Tuesday 时机博弈**：研究者在 Patch Tuesday 之后立即披露，意味着所有刚发布的补丁**未覆盖这些漏洞**——这是对微软响应速度的精准施压。
- **真实利用窗口**：Huntress 报告 RedSun/UnDefend 的 PoC"迅速被滥用"，说明从 PoC 发布到武器化的窗口可能短至数天，而非传统的"负责任披露 90 天"。
- **死人开关效应**：研究者声称有"死人开关"——这意味着**威胁是持续性的**，企业必须建立不依赖单一厂商响应速度的安全基线。

### 4. AI Agent 部署对漏洞响应的新要求

虽然本文不直接讨论 AI Agent，但漏洞标签中的 `cloud-computing` 和 `government` 暗示这些漏洞可能涉及企业自托管 AI Agent 的运行基础设施。

**对 AI Agent 部署的启示**：

- AI Agent 继承运行用户的完整系统权限——能读写文件、执行命令、调用 API。传统 Web 应用的"边界防御"模型对 Agent 系统完全失效。
- 企业自托管场景下，**凭证管理**（API keys、bot tokens、OAuth 凭据分散）是最大的攻击面放大器。
- **提示注入**是 AI Agent 特有的攻击向量——攻击者可以通过文档、邮件、网页内容向 Agent 注入恶意指令。
- 数据主权和合规要求（越南、政府云）在漏洞响应中成为重要考量维度。

### 5. 安全研究的激励结构失灵

Nightmare-Eclipse 事件揭示了安全研究激励结构的深层问题：

- **前 Microsoft 员工的身份猜测**反映了大厂安全团队的人员流失风险——内部知识一旦外溢，攻击面会大幅扩大。
- **"报复性披露"的存在**说明当研究者认为传统披露通道失效时，他们会自创更激进的发布机制。
- **真实利用已发生**意味着社区需要重新审视"是否应该发布完整 PoC"这一长期争议。

**对企业的实际含义**：
- 不能假设 PoC 不会到达攻击者手中。
- 必须在架构层假设"漏洞已被利用"，按"assume breach"原则设计纵深防御。
- 需要建立自己的威胁情报收集能力，跟踪 GitHub 上的零日 PoC 仓库（如 Nightmare-Eclipse 的 YellowKey 和 GreenPlasma 仓库）。

## 实践启示

### 1. BitLocker 部署的强制基线

针对 YellowKey 类物理访问威胁，强制启用以下 BitLocker 强化配置：
- **预启动 PIN**：在启动到 Windows 之前要求 PIN 输入。
- **TPM + PIN 组合**：而非仅 TPM（防止 TPM 旁路）。
- **BIOS/UEFI 密码锁**：防止启动顺序被篡改。
- **Secure Boot**：确保启动链完整可信。

### 2. 提权漏洞的优先级管理

将所有本地提权漏洞按 P0 处理，因为：
- 它们是攻击链的关键放大器。
- PoC 代码一旦公开，武器化时间极短。
- 在 AI Agent 时代，Agent 继承的权限可能被这类漏洞放大。

### 3. 建立不依赖厂商响应速度的安全基线

针对报复性披露模式：
- **assume breach 架构**：假设 PoC 已在野利用，从这个前提出发设计。
- **零信任凭证管理**：缩短 API key、token 的生命周期；引入凭据隔离。
- **威胁情报订阅**：跟踪 GitHub、CISA、Huntress 等多源威胁情报，不依赖单一厂商公告。
- **补丁虚拟化**：在 CVE 公开后，先用虚拟补丁（如 WAF 规则、行为阻断）防御，等待官方补丁。

### 4. AI Agent 场景的纵深防御

- **最小权限原则**：Agent 运行时使用专用低权限账户，仅在必要时申请提权。
- **网络隔离**：Agent 运行环境与核心业务系统隔离。
- **输入过滤**：对 Agent 处理的所有外部输入（文档、网页、邮件）做提示注入检测。
- **审计日志**：所有 Agent 动作记录完整审计链，便于事后取证。

### 5. 应对持续性威胁

研究者的"死人开关"机制意味着威胁是**持续性的**而非单点事件：
- 不要把漏洞响应当作一次性事件，而要建立**持续监控机制**。
- 在补丁日建立"补丁后审查"流程，专门识别新披露但未修复的漏洞。
- 跟踪研究者仓库的 watch 通知，第一时间获得 PoC 发布预警。

## 相关实体

- [同事件 TheRegister 主报道](https://github.com/QianJinGuo/wiki/blob/main/entities/microsoft-zero-days-researcher-disgruntled-theregister.md)
- [研究者背景与历史披露](https://github.com/QianJinGuo/wiki/blob/main/entities/disgruntled-researcher-microsoft-zero-days.md)
- [Cisco SD-WAN CVE 类似案例](../ch01/888-20.html)
- [VSCode GitHub Token 窃取事件](../ch01/903-github.html)
- [金融行业 GenAI 合规](../ch05/090-ai.html)
- [Exaforce Agentic SOC 平台](../ch04/023-exaforce-agentic-soc-platform-and-mdr.html)

---

