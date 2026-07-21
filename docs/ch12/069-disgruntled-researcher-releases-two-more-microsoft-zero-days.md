# Disgruntled researcher releases two more Microsoft zero-days

## Ch12.069 Disgruntled researcher releases two more Microsoft zero-days

> 📊 Level ⭐⭐ | 7.1KB | `entities/disgruntled-researcher-microsoft-zero-days.md`

## 核心要点
- 安全研究文章：高调白帽/灰帽研究者通过 GitHub 和博客公开 Microsoft 零日漏洞
- v=8, c=9
- YellowKey：BitLocker 绕过攻击，可在物理访问条件下获取 SYSTEM shell 权限
- GreenPlasma：权限提升漏洞，获得 SYSTEM 访问权限
- Nightmarer-Eclipse（又名 Chaotic Eclipse）：疑似前 Microsoft 员工，2026 年已累计发布 5 个零日
- RedSun 和 UnDefend 至今未修复，且已被真实攻击利用
- BlueHammer（CVE-2026-32201）已于 4 月由 Microsoft 修复
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/disgruntled-researcher-microsoft-zero-days.md)

## 深度分析
### 攻击者动机与背景
Nightmare-Eclipse 的行为模式揭示了一种新型的"内部人士-报复性披露"威胁向量。根据其博文自述，动机源于与雇主的纠纷："有人违反了我们的协议，让我无家可归，他们知道这会发生却仍然背后捅刀，这是他们的决定不是我的"。这种叙事在安全社区并不陌生——2024 年的 XZ Utils 供应链攻击背后也是一个不满的开发者——但 Nightmare-Eclipse 的不同之处在于其持续性和精确性。
截至此次披露，该研究者已累计发布 5 个 Microsoft 零日漏洞：BlueHammer（CVE-2026-32201，已修复）、RedSun（未修复，已被实际利用）、UnDefend（未修复）、YellowKey（本次披露）和 GreenPlasma（本次披露）。安全专家 Rik Ferguson 描述这是"一次升级的报复性运动"，并警告更多漏洞即将到来——该研究者声称拥有 dead man's switch，一旦本人失联将自动释放更多漏洞。

### YellowKey：BitLocker 的最后防线
YellowKey 是本次披露中最具影响力的漏洞，因为它直接绕过了 BitLocker——Windows 设备失窃时最后的数据保护层。攻击者需要物理接触目标设备，将特定文件加载到 USB 设备，通过正确的按键序列即可获得 BitLocker 保护机器的无限制 shell 访问。
Forescout 安全情报副总裁 Rik Ferguson 的评价一针见血："如果研究者的说法成立，被盗笔记本就不再是硬件丢失问题，而是数据泄露事件"。这意味着企业资产失窃的法律和合规后果将大幅升级。值得注意的是，Nightmare-Eclipse 还暗示 YellowKey 可能被用做后门——由 Microsoft 植入，但安全专家表示无法根据现有信息验证这一说法。
YellowKey 的缓解措施已有明确建议：启用 BitLocker PIN 码保护和 BIOS 密码锁定。这意味着 Full Disk Encryption 不能仅依赖 TPM 自动解锁，而需要配合额外的身份验证因素。

### GreenPlasma：权限提升的艺术
GreenPlasma 提供的是一种权限提升（EoP）路径，让普通用户或低权限进程获得 SYSTEM 级别访问。与 YellowKey 不同，GreenPlasma 目前只发布了部分利用代码而非完整 PoC，当前版本会触发默认 Windows 配置下的 UAC consent 提示——这意味着攻击者还需要进一步武器化才能实现静默利用。
然而，GreenPlasma 的威胁在于其战术价值。Bridewell 网络威胁情报主管 Gavin Knapp 指出："权限提升漏洞通常在攻击者获得初始立足点后使用，使其能够发现并获取凭据和数据，然后横向移动到其他系统，最终达成数据窃取或勒索软件部署等目标"。这意味着即使 GreenPlasma 目前还不完美，它已经是攻击者工具箱中极具价值的关键组件。

### 泄露披露的生态影响
RedSun 和 UnDefend 的案例揭示了零日披露的生态危害：Huntress 观察到，这些漏洞的 PoC 代码发布后迅速被实际攻击者采用并用于真实入侵。这说明即使是非恶意的披露行为，也会因为发布时间差为攻击者提供窗口。

## 实践启示
### 企业安全团队
对于企业安全团队，此案例的核心教训是：BitLocker 并非万无一失。启用 BitLocker 时，必须配置 TPM + PIN 或 TPM + USB 启动密钥的多因素解锁方式，而非仅依赖 TPM 自动解密。此外，BIOS/UEFI 密码锁定应当作为标准笔记本配置，防止通过 USB 引导绕过操作系统级保护。
补丁管理策略需要考虑外部披露的零日漏洞。RedSun 和 UnDefend 在披露后迅速被利用，说明"等待厂商补丁"的传统策略存在空窗期风险。对于高风险漏洞，应考虑临时补偿性控制（如网络分段、EMM 策略限制）而非被动等待。

### 安全产品开发者
对于安全产品开发者，Nightmare-Eclipse 案例提醒内部威胁检测的重要性。该研究者据称拥有 Microsoft 内部信息和代码库访问权限，这意味着供应链安全不仅包括开源依赖，还应覆盖内部工具和员工权限管理。
Dead man's switch 的存在意味着简单地切断研究者和企业的联系或对其提起诉讼，可能触发更大规模的披露。安全社区对此类披露的处理需要更审慎的法律和外交策略。

### 威胁情报视角
从威胁情报角度，Nightmare-Eclipse 的活动模式提供了难得的对手分析样本。其技术文档质量高、披露节奏稳定、GitHub 和博客基础设施完备——这不是业余爱好者，而是有组织、专业化的安全研究者。2026 年 5 月 12 日刚完成 Patch Tuesday，5 月 13 日即发布新漏洞——这一timing选择表明攻击者对 Microsoft 的响应流程有深刻理解。
对于威胁情报团队，建议将 Nightmare-Eclipse 纳入监控名单，持续跟踪其 GitHub 仓库和博客更新，并建立基于 IOC（入侵指标）的早期预警机制。

## 相关实体
> [主题导航](https://github.com/QianJinGuo/wiki/blob/main/moc/cybersecurity-privacy.md)

- [Cline releases open-source agent runtime SDK](../ch04/366-agentrun.html)
- [LLM raiders and how to repel them](../ch01/1233-llm.html) — AI 基础设施安全的另一个威胁向量

---

