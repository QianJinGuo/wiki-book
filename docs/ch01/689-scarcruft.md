# ScarCruft 游戏平台供应链攻击分析

## Ch01.689 ScarCruft 游戏平台供应链攻击分析

> 📊 Level ⭐⭐ | 6.3KB | `entities/rigged-game-scarcruft-compromises-gaming-platform-supply-chain-attack.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/rigged-game-scarcruft-compromises-gaming-platform-supply-chain-attack.md)

## 摘要
Title: A rigged game: ScarCruft compromises gaming platform in a supply-chain attack
URL Source: https://www.welivesecurity.com/en/eset-research/rigged-game-scarcruft-compromises-gaming-platform-supply-chain-attack/
Markdown Content:
ESET researchers uncovered a multiplatform supply-chain attack by North Korea-aligned APT group ScarCruft, targeting the Yanbian region in China – home to ethnic Koreans and a crossing point for North Korean refugees and defectors. In the attack, probably ongoing si...

## 关键要点
- 技术领域：AI / Newsletter
- 来源：Newsletter
- 评分：value=7, confidence=9, product=63

## 链接
- [原文](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/rigged-game-scarcruft-compromises-gaming-platform-supply-chain-attack.md)

## 相关实体
- [Semis Memo: Supply Chain Inheritance](ch01/483-semis-memo-supply-chain-inheritance.md)
- [Postmortem: TanStack npm supply-chain compromise | TanStack Blog](ch04/150-ai.md)
- [Amazon launches Supply Chain Services for businesses of all sizes](ch04/150-ai.md)
- [Semis Memo: Supply Chain Inheritance](ch04/150-ai.md)
- [semgrep intercom php supply chain](ch12/105-semgrep-intercom-php-supply-chain.md)

- [xz-utils backdoor 2 years on — maintainer trust hijack patte](ch04/150-ai.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-landscape.md)
## 深度分析
### 攻击链解析
ScarCruft（APT37/Reaper）此次行动展现了朝鲜国家黑客组织日益成熟的供应链攻击能力。攻击分为两条路径：
**Android 路径**：攻击者直接篡改了 sqgame 平台上的两款游戏 APK（延边红十、新画图），通过修改 AndroidManifest.xml 注入 BirdCall 后门。受害者下载安装后，后门会收集联系人、短信、通话记录、文档、媒体文件和私钥，并具有截图和录音能力。
**Windows 路径**：攻击者通过篡改 sqgame 更新服务器上的 mono.dll 库（位于 http://xiazai.sqgame.com.cn/dating/20240429.zip），注入下载器木马。该下载器会检查运行环境，然后从被篡改的韩国网站下载 RokRAT 木马，随后部署 BirdCall 后门。

### 核心战术特点
1. **云存储 C&C**：BirdCall 使用 pCloud、Yandex Disk、Zoho WorkDrive 等合法云服务作为 C&C 通信渠道，增加了检测难度。Android 版本发现 12 个 Zoho WorkDrive 账户用于命令控制。
2. **环境检测与自我清理**：Windows 下载器会检查是否存在分析工具和虚拟机，如果发现则不执行。它还会用原始干净的 mono.dll 替换被篡改的版本，覆盖痕迹。
3. **多阶段载荷链**：Windows 版本采用多阶段加载链，从 Ruby/Python 脚本开始，加载用计算机特定密钥加密的组件，增加了分析难度。

### 地缘政治动机
攻击目标明确指向延边地区的朝鲜族人群，这是一个敏感的地缘政治区域。延边朝鲜族自治州与中国接壤，是朝鲜难民和脱北者的主要过境点。ESET 推测此次行动的目的是收集可能对朝鲜政权有价值的情报，主要针对难民或脱北者。

### 技术演进
Android BirdCall 展现出持续的武器化开发过程。从 2024 年 10 月到 2025 年 6 月，ESET 识别出 7 个版本（1.0 到 2.0），表明该组织在积极维护和改进移动端攻击能力。版本 2.0 已加入混淆技术。

## 实践启示
### 对安全团队
- **供应链安全不能只依赖官方应用商店**：攻击者直接通过被篡改的官方网站分发恶意 APK，绕过了 Google Play 的审核机制。需要对内部应用建立独立的签名验证机制。
- **云服务滥用检测**：监控组织内设备与 pCloud、Zoho WorkDrive 等云存储的非预期通信，特别是来自不常见地区或设备的流量。
- **游戏平台的高风险属性**：游戏软件更新频繁、用户下载意愿高、运行时权限宽松，成为攻击者理想的供应链切入点。游戏平台应实施代码签名和完整性校验。

### 对开发者
- **APK 篡改检测**：在应用启动时验证关键文件的 SHA-256 哈希，防止被重新打包（repackaging）。
- **最小权限原则**：BirdCall 需要大量权限（联系人、短信、录音、存储）才能运行，开发时应评估每个权限的必要性。
- **更新通道安全**：软件更新应通过 HTTPS 且带有数字签名验证，阻止中间人攻击和篡改。

### 对威胁情报
- **IoC 关联**：可关注 ESET GitHub 上的 IoC 列表（SHA-1 哈希、被用于 C&C 的 Zoho 账户），用于检测组织内是否存在相关样本。
- **MITRE ATT&CK Mobile 框架**：T1474.003（供应链攻击）、T1406（混淆文件）、T1407（运行时下载代码）、T1541（前台持久化）是移动端攻击的关键战术，可用于红蓝对抗演练。

---

