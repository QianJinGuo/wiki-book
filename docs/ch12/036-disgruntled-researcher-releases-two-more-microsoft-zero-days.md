# Disgruntled researcher releases two more Microsoft zero-days

## Ch12.036 Disgruntled researcher releases two more Microsoft zero-days

> 📊 Level ⭐⭐ | 10.0KB | `entities/microsoft-zero-days-researcher-disgruntled-theregister.md`

## 深度分析
### 安全研究的"越界复仇"模式：一种新型威胁行为体
Nightmare-Eclipse（又名 Chaotic Eclipse）的行为代表了一种新兴的安全研究威胁范式：合法的安全研究人员因对厂商的报复性不满，转向公开披露漏洞。这种"越界复仇"模式与传统的黑产攻击或国家支持的攻击者不同，但又比单纯的安全研究更危险——它结合了 deep knowledge of the target（深入了解目标）、emotional motivation（情绪化动机）、以及缺乏法律约束的特点。

### BitLocker 绕过的真实威胁边界
YellowKey（BitLocker 绕过后门）的威胁程度需要细分：虽然需要物理访问，但 BitLocker 是 Windows 防止被盗设备数据泄露的最后防线。绕过后，被盗笔记本从"硬件损失"变成"数据泄露通知事件"（Rik Ferguson 语）。YellowKey 还暗示可能存在 Microsoft 注入的后门，虽然无法证实，但这种质疑本身反映了用户对厂商的不信任危机。

### 漏洞公开时机的战术选择
Nightmare-Eclipse 选择在 Microsoft 月度 Patch Tuesday 之后公开漏洞是一种刻意的战术选择：既绕过了大多数企业的集中打补丁窗口，又制造了"补丁真空期"——企业在下一个补丁周期前处于无保护状态。这种时机选择说明攻击者对企业的安全运营流程有深刻理解。

### 从 PoC 到武器化的威胁演进链
GreenPlasma 目前只提供部分利用代码，触发 UAC consent prompt，尚未实现静默提权。但历史案例表明，RedSun 和 UnDefend 的 PoC 代码在公开后迅速被攻击者武器化并在真实攻击中使用。这意味着 GreenPlasma 的完整利用可能只是时间问题。

### 持续披露模式的威胁升级
Nightmare-Eclipse 声称拥有"dead man's switch"（死人开关），预示着更多漏洞即将公开。目前已披露 5 个零日（BlueHammer、RedSun、UnDefend、YellowKey、GreenPlasma），还有更多在路上。这种持续披露模式意味着 Microsoft 面临的是长期、持续的安全压力而非单次事件。

### 对企业安全策略的深层启示
1. **物理安全仍然是最后防线**：即使全盘加密，被盗设备在特定漏洞下仍可被攻破。BitLocker PIN + BIOS 密码锁是必要的纵深防御。
2. **零日公开后的响应窗口极短**：在 Patch Tuesday 后立即公开意味着企业几乎没有时间在常规周期内响应。
3. **可信供应链假设需要重新审视**：如果内部人员能因不满而报复性披露，企业的安全边界已经从网络延伸到员工关系管理。

## 实践启示
### 对企业安全团队的行动建议
1. **立即评估 YellowKey 缓解措施**：实施 BitLocker PIN + BIOS 密码锁，降低物理访问场景下的攻击面。这是目前已知的有效缓解手段。
2. **建立零日公开的应急响应流程**：由于披露时机选择在 Patch Tuesday 后，企业需要建立针对此类"补丁真空期"的专项应急预案。
3. **监控已知 PoC 的武器化状态**：关注 RedSun、UnDefend 等已被武器化的漏洞的利用趋势，评估 GreenPlasma 武器化的可能时间窗口。
4. **对内部研究人员的合规管理**：将安全研究人员的不满信号纳入内部安全风险管理，考虑 Bug Bounty 或安全研究员关系管理机制，避免将合法研究者推向对立面。

### 对个人用户的防护建议
1. **启用 BitLocker PIN 保护**：不要仅依赖 TPM 自动解锁，添加 PIN 码和 BIOS 密码可以有效阻止 YellowKey 类攻击。
2. **设备丢失后的数据泄露应急响应**：假设最坏情况，建立设备丢失后的账户重置、会话终止、数据泄露评估的标准流程。

### 对安全行业的结构反思
1. **重新审视厂商与安全研究者的关系**：Nightmare-Eclipse 的背景故事（据称是前 Microsoft 员工，因"协议被违反"而公开报复）提示厂商与研究者之间的信任契约破裂可能是激化冲突的关键。
2. **零日市场与负责任披露的边界**：当研究者认为负责任披露渠道无效时，他们可能转向公开披露来"报复"。建立更有效的厂商-研究者沟通机制可能是减少此类事件的关键。
3. **关注 AI 辅助漏洞挖掘对威胁态势的影响**：Linus Torvalds 提到 AI 工具造成 Linux 安全邮件列表"几乎无法管理"。同样的工具也在被用于发现 Windows 漏洞，AI 加速的漏洞发现可能使类似 Nightmare-Eclipse 的案例更加频繁。

## 评分
| 维度 | 分数 |
|------|------|
| 知识价值 | 8 |
| 置信度 | 9 |
| 推荐入库 | **strong** |

## 摘要
Published Time: 2026-05-13T16:16:02.000Z
Markdown Content:
Disgruntled researcher releases two more Microsoft zero-days
Jump to main content
Search
TOPICS

*   Security
    *   All Security
    *   Cyber-crime
    *   Patches
    *   Research
    *   CSO
*   Off-Prem
    *   All Off-Prem
    *   Edge + IoT
    *   Channel
    *   PaaS + IaaS
    *   SaaS
*   On-Prem
    *   All On-Prem
    *   Systems
    *   Storage
    *   Networks
    *   HPC
    *   Personal Tech
    *   Cx0
    *   Public Sector
*   Software
    *   All Software
    *   AI + ML
    *   Applications
    *   Databases
    *   DevOps
    *   OSes
    *   Virtualization
*   Offbeat
    *   All Offbeat
    *   Columnists
    *   Science
    *   BOFH
    *   Legal
    *   Bootnotes
    *   Site News
    *   About Us
*   Special Features
    *   All Special Features
    *   HPE: AI Explainers
    *   RSA Conference
    *   Agentic AI
    *   The Future of the Datacenter
    *   AWS:Reinvent
    *   Nvidia GTC
    *   SC25
    *   Supercomputing Month
*   Vendor Voice
    *   All Vendor Voice
    *   Infinidat
    *   Everpure
    *   Rubrik
    *   Make it real with Capgemini and AWS
    *   Money Movement Hub
    *   ZTE
    *   Nutanix: Scale Kubernetes. Not Chaos.
    *   AWS New Horizon
*   Resources
    *   Intelligence
    *   Webinars & Events
    *   Newsletters
Search
[](https://www.theregister.com/)[](https://www.theregister.com/)[](https://www.theregister.com/)

*   Sign in
*   Datacenter
*   Security
*   Microsoft
*   AWS
*   Developer
*   Open Source
*   IT Careers
*   Columnists
*   Who, Me?
*   On Call
REG AD
Security
Mystery Microsoft bug leaker keeps the zero-days coming
Security pros warn YellowKey claim could make stolen laptops a much bigger problem
Connor JonesConnor JonesCybersecurity reporter
Published wed 13 May 2026 // 17:16 UTC
[](https://www.facebook.com/sharer.php?u=https%3A%2F%2Fwww.theregister.com%2Fsecurity%2F2026%2F05%2F13%2Fdisgruntled-researcher-
## 相关实体
- [Disgruntled Researcher Microsoft Zero Days](/ch12-061-disgruntled-researcher-releases-two-more-microsoft-zero-days//)
- [13 Disgruntled Researcher Releases Two More Microsoft Zero Days 5239758](/ch12-029-disgruntled-researcher-releases-two-more-microsoft-zero-days//)
- [Microsoft Zero Days Researcher Disgruntled](/ch12-089-mystery-microsoft-bug-leaker-keeps-the-zero-days-coming//)
- [Defense_At_Ai_Speed_Microsofts_New_Multi](/ch04-260-defense-at-ai-speed-microsoft-s-new-multi-model-agentic-sec//)
- [Microsoft Open Sources Rampart Clarity](/ch01-611-microsoft-open-sources-rampart-and-clarity-to-secure-ai-agen//)

---

