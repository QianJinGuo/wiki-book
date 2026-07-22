# Cyberscammers are bypassing banks' security with illicit tools sold on Telegram

## Ch12.094 Cyberscammers are bypassing banks' security with illicit tools sold on Telegram

> 📊 Level ⭐⭐ | 5.4KB | `entities/Cyberscammers-are-bypassing-banks-security-with-illicit-tool.md`

# Cyberscammers are bypassing banks' security with illicit tools sold on Telegram

## 核心要点

- 来源: MIT Technology Review
- 技术领域: 网络安全、金融欺诈

## 内容摘要

MIT Technology Review 在为期两个月的调查中发现了 22 个中越英语言 Telegram 公开频道，这些频道售卖用于绕过"了解你的客户"（KYC）面部扫描的非法工具包和被盗生物特征数据。这些工具使诈骗者能够开设 mule 账户并洗钱，主要针对 Binance、西班牙 BBVA、英国 Revolut 等主流金融机构。攻击手法利用虚拟摄像头（VCam）替换真实视频流，用静态图片或 deepfake 视频骗过活体检测。2024 年虚拟摄像头攻击较 2023 年增长超过 25 倍，"复杂"欺诈尝试几乎翻了三倍。

## 相关实体
- [Cyberscammers Bypassing Bank Telegram](https://github.com/QianJinGuo/wiki/blob/main/entities/cyberscammers-bypassing-bank-telegram.md)
- [Mozilla Warns Uk Breaking Vpns Will Not Magically Fix Britain S Age Check Mess](ch12/073-mozilla-warns-uk-breaking-vpns-will-not-magically-fix-brita.html)
- [Weve Been Here Before Ai Vulnerability Research](../ch05/090-ai.html)
- [Ai Tool Poisoning Exposes A Major Flaw In Enterprise Agent Security](../ch04/304-ai-tool-poisoning-exposes-a-major-flaw-in-enterprise-agent-s.html)
- [Rigged Game Scarcruft Compromises Gaming Platform Supply Chain Attack](../ch01/729-scarcruft.html)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-privacy-landscape.md)
## 相关主题

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/Cyberscammers-are-bypassing-banks-security-with-illicit-tool.md)

## 深度分析

**1. 虚拟摄像头（VCam）攻击已成为 KYC 绕过的核心手段** 

攻击者通过虚拟摄像头替换真实视频流，使用静态图片或 deepfake 视频骗过活体检测。MIT Technology Review 调查发现 22 个中越英语言 Telegram 频道公开售卖此类工具，服务对象涵盖 Binance、西班牙 BBVA 等主流金融机构。这种攻击模式已经从技术概念演变为可规模化部署的地下产业。

**2. KYC 绕过正在成为 pig-butchering 骗局的基础设施** 

Chainalysis 数据显示 2025 年加密货币诈骗损失达 170 亿美元，较 2024 年增长 31%。联合国毒品犯罪问题办公室警告亚洲诈骗集团在非洲和太平洋地区的扩张使其"快速规模化盈利"。KYC 绕过工具使诈骗集团能够快速开设 mule 账户，将赃款转入银行后立即通过 Tether 等稳定币洗白，整个过程可在秒级完成。

**3. 金融机构面临"看不见的失败"困境** 

Sumsub 反欺诈产品负责人 Artem Popov 指出："重要的是我们看不到的部分"——存在大量未被检测到的攻击。虚拟摄像头攻击在 2024 年全球频率较 2023 年增长超过 25 倍，"复杂"或"多步"欺诈尝试（包括 VCam 绕过）在其客户群中几乎翻了三倍。金融机构往往在攻击发生很久后才意识到被突破。

**4. 攻防博弈正在从应用层向操作系统层迁移** 

Talsec CEO Sergiy Yakymchuk 介绍，早期仅需反编译银行 APP 即可完成绕过，现在需要 jailbreak 手机或向金融 APP 注入"挂钩框架"代码触发虚拟摄像头。攻击者同时 compromise 手机本身和金融机构 APP 代码，再向虚拟摄像头输入混合的盗窃生物特征和 deepfake。这种趋势意味着单一应用层防护已不足够，需要系统级防御思路。

**5. 监管追赶速度滞后于攻击产业化速度** 

泰国已立法增强 KYC 监控、限制每日交易金额、授权监管机构暂停账户；美国 FinCEN 于 2024 年底发布警告鼓励平台追踪更广泛的交易模式。但研究者 Ngo 认为："新安全或报告要求会让绕过变得更难，但不会阻止他们——这只是时间问题。"

## 实践启示

- **实施设备完整性检测**：在活体检测过程中增加设备 jailbreak/root 检测、模拟器识别和运行时完整性验证，防止攻击者在手机层面植入虚拟摄像头驱动 

- **行为生物特征识别**：除静态面部匹配外，增加动态行为分析——眨眼频率、头部运动节奏、微表情等活体特征，结合设备交互行为模式进行多维度验证 

- **交易图谱分析**：即使 KYC 被绕过，诈骗资金在账户间快速转移时仍会留下异常交易模式。FINCEN 建议平台追踪广泛交易特征而非单一身份验证节点 

- **跨平台威胁情报共享**：加入金融机构安全联盟，共享 Telegram 渠道发现的绕过工具特征码和攻击模式，因单家机构难以全面监控地下市场 

- **稳定币交易监控**：Tether 已成为赃款洗白首选工具，金融机构应建立加密货币出金业务的专项监控规则，对短期内大额稳定币转换进行预警 

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/Cyberscammers-are-bypassing-banks-security-with-illicit-tool.md)

---

