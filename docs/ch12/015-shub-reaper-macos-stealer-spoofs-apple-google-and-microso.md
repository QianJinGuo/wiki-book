# SHub Reaper: macOS Stealer Spoofs Apple, Google, and Microsoft in a Single Attack Chain

## Ch12.015 SHub Reaper: macOS Stealer Spoofs Apple, Google, and Microsoft in a Single Attack Chain

> 📊 Level ⭐⭐ | 19.6KB | `entities/shub-reaper-macos-stealer-attack-chain.md`

## 核心要点

- SHub Reaper 是 SHub 窃密木马的变种，通过假冒 WeChat、Miro 等流行应用安装程序进行传播
- 攻击链在不同阶段伪装成不同可信品牌：微软域名托管载荷 → 苹果安全更新执行 → 谷歌软件更新目录持久化
- 相比早期版本，Reaper 构建增加了 AMOS 风格的文件窃取模块和分块上传功能
- 该木马建立持久化后门，每 60 秒向 C2 发送心跳，可接收远程代码执行指令

## 相关实体
- [Howanimagecouldcompromiseyourmacunderstandinganexiftoolvulnerabilitycve 2026 310](ch01/216-0.md)
- [Fake Job Interview Apps Drop Jobstealer Malware On Windows And Macos](ch12/049-fake-job-interview-apps-drop-jobstealer-malware-on-windows-a.md)
- [Trackingtamperedchefclustersviacertificateandcodereuse](https://github.com/QianJinGuo/wiki/blob/main/entities/trackingtamperedchefclustersviacertificateandcodereuse.md)
- [Checkmarx Jenkins Plugin Compromised In New Supply Chain Attack](ch04/277-ai.md)
- [Rigged Game Scarcruft Compromises Gaming Platform Supply Chain Attack](ch04/277-ai.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/shub-reaper-macos-stealer-attack-chain.md)

## 深度分析

### 攻击链分层伪装机制

SHub Reaper 展现出高度进化的社会工程学手法。其核心创新在于**多阶段品牌伪装**：攻击载荷托管在_typo-squatted_的 `mlcrosoft[.]co[.]com` 域名（假冒微软），执行时伪装成苹果 XProtectRemediator 安全更新，最终通过假冒谷歌软件更新机制实现持久化。这种"三可信品牌"叠加策略极大地增加了用户识别难度

相比传统 ClickFix 攻击（诱导用户复制命令到 Terminal），Reaper 采用 `applescript://` URL scheme 唤起 Script Editor，并利用 ASCII 艺术和滚动技术将恶意命令推送到可视窗口之外。这不仅绕过了 Terminal，还规避了 Apple Tahoe 26.4 对 ClickFix 攻击的缓解措施。页面层级的反分析机制（包括 console 函数覆盖、调试器循环、DevTools 检测）进一步增加了安全研究人员的分析成本

### 免杀技术演进

传统 ClickFix 攻击诱导用户复制命令到 Terminal 执行，而 Reaper 转向使用 `applescript://` URL scheme 唤起 macOS Script Editor，利用 ASCII 艺术和滚动技术将恶意命令推送到可视窗口之外

SentinelOne 此前已记录此技术用法，Jamf 后续也在类似攻击活动中文档化。页面层级的反分析机制包括：覆盖 console 函数、拦截 F12 等开发者按键、持续调试器循环使研究分析受阻。若安全研究人员绕过这些防护，单独的 `devtoolschange` 事件监听器会用俄语"Access Denied"消息（`<h1>Доступ запрещен</h1>`）覆盖页面内容

攻击链的演进体现了威胁者持续迭代以绕过系统安全机制的能力

### 地理封锁与目标筛选

Reaper 通过检查 `com.apple.HIToolbox.plist` 中的俄语输入源来识别独联体地区（CIS）用户。若检测到俄语输入源，恶意软件会向 C2 发送 `cis_blocked` 事件并退出，表明该行动可能具有地域针对性或受制裁限制

### 投递管道与环境检测

Reaper 通过多阶段执行链部署，与早期 SHub 构建一致。但本变种不使用标准的"ClickFix"社会工程学（受害者被诱骗将命令粘贴到 Terminal），而是使用绕过 Terminal 且规避 Apple Tahoe 26.4 缓解措施的投递机制

脚本存根通过查询 `com.apple.HIToolbox.plist` 文件检查受害者的区域设置以识别俄语输入源

### 数据窃取与二次攻击

窃取数据类型涵盖：浏览器凭证（Chrome、Firefox、Brave、Edge、Opera、Vivaldi、Arc、Orion）、加密货币钱包（Exodus、Atomic、Ledger Live、Electrum、Trezor Suite）、iCloud 账户、Keychain、Telegram 会话等。此外，Filegrabber 模块还会搜索桌面和文档文件夹中的商业文档（.docx、.xlsx、.json 等）

值得注意的是，完成数据外传后，木马还会尝试注入修改后的 `app.asar` 文件到受害者钱包应用中，以实现对未来交易的持续监控和资金窃取

Filegrabber 处理程序搜索用户桌面和文档文件夹中可能具有商业或财务价值的文件，针对扩展名 `.docx`、`.doc`、`.wallet`、`.key`、`.keys`、`.txt`、`.rtf`、`.csv`、`.xls`、`.xlsx`、`.json` 和 `.rdp`（2MB 以下），以及 `.png` 图像（6MB 以下），总收集上限为 150MB

收集的文件临时存储在 `/tmp/shub_<random>/`，脚本检查目录是否超过 85MB。若超过，Reaper 在 `/tmp/shub_split.sh` 生成 Bash 脚本，将存档分成 70MB ZIP 块并通过 `curl` 顺序上传到 C2 的 `hebsbsbzjsjshduxbs[.]xyz/gate/chunk` 端点

### 钱包应用劫持

恶意软件上传用户数据后，尝试入侵特定加密货币桌面钱包以拦截未来活动。脚本搜索 Exodus、Atomic Wallet、Ledger Wallet、Ledger Live 和 Trezor Suite。找到后，从 C2 服务器检索修改后的 `app.asar` 文件，终止活跃钱包进程，并替换合法的核心应用程序文件

为绕过 Gatekeeper，脚本使用 `xattr -cr` 清除隔离属性，并使用 _ad hoc_ 代码签名对修改后的应用程序包进行签名

### 持久化与后门机制

相比一次性执行的窃密木马，Reaper 在 `~/Library/LaunchAgents/com.google.keystone.agent.plist` 建立 LaunchAgent，每 60 秒执行一次心跳脚本。若 C2 返回指令，攻击者可获得任意代码执行能力，形成完整的后门通道

在终止前，AppleScript 创建一个目录结构来伪装 Google Software Update：`~/Library/Application Support/Google/GoogleUpdate.app/Contents/MacOS/`。它将名为 `GoogleUpdate` 的 Base64 解码 bash 脚本放入此目录，并使用名为 `com.google.keystone.agent.plist` 的 LaunchAgent 属性列表注册它

LaunchAgent 每 60 秒执行目标脚本 `GoogleUpdate`。该脚本作为信标，向 C2 的 `/api/bot/heartbeat` 端点发送系统详细信息。如果服务器返回 `"code"` 载荷，脚本对其进行解码，写入隐藏的 `/tmp/.c.sh` 文件，使用当前用户权限执行，然后删除该文件。这种机制为攻击者提供了持久后门以进行远程代码执行

### 反分析技术

恶意网页在被调用 AppleScript 载荷前，会对访问者进行特征分析并应用多种反分析技术。托管攻击活动的域名设计具有欺骗性，包括_typo-squatted_的 URL `mlcrosoft[.]co[.]com`

网页上的 JavaScript 收集系统和浏览器信息，包括 IP 地址、位置、WebGL 指纹数据，以及虚拟机或 VPN 的证据。脚本还枚举已安装的浏览器扩展，特别关注密码管理器（如 1Password、Bitwarden 和 LastPass）以及加密货币钱包（如 MetaMask 和 Phantom）。收集的遥测数据（包括浏览器扩展数据）通过硬编码的 Telegram Bot 发送给攻击者

### 凭证窃取流程

用户点击 Script Editor 中的"运行"后，隐藏命令检索远程 AppleScript 并执行。用户被要求提供登录密码，该密码被抓取并用于解密各种凭证，然后向用户展示误导性错误消息以分散怀疑

## 实践启示

- **警惕安装程序来源**：即使是中文界面的 WeChat、Miro 等流行应用，也应严格验证下载来源的域名真实性，注意_typo-squatted_域名（如 mlcrosoft、mlcrosoft 等变体）
- **慎用 AppleScript 执行**：当网页通过 `applescript://` 协议唤起 Script Editor 并要求点击"运行"时，应极度谨慎——合法网站几乎不会采用此方式
- **监控异常进程行为**：关注 Script Editor/osascript 的网络连接、未经预期的 LaunchAgent 创建、以及 `~/Library/Application Support/Google/` 下非谷歌官方组件的文件
- **检测加密货币钱包篡改**：钱包应用被修改后会尝试连接异常 C2，建议定期核对钱包文件的 hash 值
- **日志与端点检测**：重点监控 `/tmp/shub_*` 目录创建、`com.google.keystone.agent.plist` 持久化、以及指向 `hebsbsbzjsjshduxbs[.]xyz` 域名的网络流量

## MITRE ATT&CK 映射

| 战术 | 技术 ID | 技术名称 | 应用场景 |
|------|---------|----------|----------|
| 资源开发 | T1583.001 | 获取基础设施：域名 | typo-squatting 微软域名 `mlcrosoft[.]co[.]com` 托管载荷 |
| 初始访问 | T1184 | SSH Hijacking | 通过假冒 WeChat/Miro 安装程序诱导下载 |
| 执行 | T1059.002 | 命令和脚本解释器：AppleScript | `applescript://` URL scheme 唤起 Script Editor 执行恶意脚本 |
| 执行 | T1059.004 | 命令和脚本解释器：Unix Shell | curl 下载并执行 shell 脚本 payload |
| 持久化 | T1547.001 | 引导或登录启动项：Launch Agent | `com.google.keystone.agent.plist` 建立每 60 秒触发的持久化 |
| 权限提升 | T1548.001 | 滥用权限控制：Setuid 和 Setgid | ad hoc 代码签名绕过 Gatekeeper |
| 凭证访问 | T1056.001 | 输入捕获：键盘记录 | AppleScript 密码对话框抓取用户登录密码 |
| 凭证访问 | T1552.001 | 不安全凭证：Keychain | 窃取 macOS Keychain 中存储的凭证 |
| 凭证访问 | T1552.004 | 不安全凭证：密码管理器 | 枚举 1Password、Bitwarden、LastPass 扩展 |
| 凭证访问 | T1555.003 | 来自密码存储的凭证：浏览器 | Chrome、Firefox、Brave、Edge 等浏览器凭证 |
| 发现 | T1082 | 系统信息发现 | 检查 `com.apple.HIToolbox.plist` 识别俄语输入源（CIS 地区封锁） |
| 发现 | T1497.001 | 虚拟化/沙箱检测：系统检查 | WebGL 指纹、VM/VPN 检测、浏览器扩展枚举 |
| 横向移动 | T1550.001 | 使用备用身份验证：应用账户 | 劫持加密货币钱包应用注入恶意 `app.asar` |
| 数据窃取 | T1005 | 本地系统数据 | Filegrabber 模块窃取商业文档（.docx、.xlsx、.json 等） |
| 数据窃取 | T1041 | C2 通道外传 | 分块 ZIP 上传至 `hebsbsbzjsjshduxbs[.]xyz/gate/chunk` |
| 防检测 | T1622 | Debugger Evasion | 持续调试器循环、DevTools 检测、console 函数覆盖 |
| 防检测 | T1562.001 | 削弱防御：禁用安全工具 | 清除隔离属性 `xattr -cr` 绕过 Gatekeeper |

## 检测规则

### Sigma 规则

```yaml

# 检测 AppleScript 异常网络连接
title: AppleScript Suspicious Network Connection
logsource:
  product: macos
  service: endpoint
detection:
  selection:
    process_name:

      - 'osascript'
      - 'Script Editor'
    network_connection:
      destination|contains:

        - 'hebsbsbzjsjshduxbs'
        - 'mlcrosoft'
        - 'mlroweb'
  condition: selection

# 检测异常 LaunchAgent 创建
title: Suspicious Google Keystone LaunchAgent
logsource:
  product: macos
  service: filesystem
detection:
  selection:
    path|contains: '~/Library/LaunchAgents/com.google.keystone.agent.plist'
    process_name:

      - 'launchd'
      - 'GoogleUpdate'
  condition: selection

# 检测临时目录异常活动
title: SHub Temporary Directory Activity
logsource:
  product: macos
  service: filesystem
detection:
  selection:
    path|contains:

      - '/tmp/shub_'
      - '/tmp/shub_split.sh'
      - '/tmp/.c.sh'
  condition: selection
```

### YARA 规则

```yara
rule SHubReaper_Indicator {
  meta:
    description = "Detects SHub Reaper malware"
    author = "Security Research"
    date = "2026-05-20"
  strings:
    $s1 = "com.google.keystone.agent" ascii
    $s2 = "hebsbsbzjsjshduxbs" ascii
    $s3 = "GoogleUpdate" ascii
    $s4 = "shub_log.zip" ascii
    $s5 = "cis_blocked" ascii
    $s6 = "6552824c59ddacb134073f24a4bd4724514a938a9dc59f1733503642faed3bd3" ascii
  condition:
    3 of them
}

rule SHubReaper_C2_Communication {
  meta:
    description = "Detects SHub Reaper C2 communication pattern"
    author = "Security Research"
    date = "2026-05-20"
  strings:
    $c2_domain = "hebsbsbzjsjshduxbs.xyz" ascii
    $heartbeat_endpoint = "/api/bot/heartbeat" ascii
    $chunk_endpoint = "/gate/chunk" ascii
  condition:
    all of them
}
```

### 端点检测查询

```bash

# 检查可疑 LaunchAgent 文件
ls -la ~/Library/LaunchAgents/com.google.keystone.agent.plist

# 检查 GoogleUpdate 目录
ls -la ~/Library/Application\ Support/Google/GoogleUpdate.app/Contents/MacOS/

# 检查临时目录异常文件
ls -la /tmp/shub_*

# 检查网络连接
netstat -an | grep -E 'hebsbsbzjsjshduxbs|mlcrosoft'
```

## 技术指标

### 网络通信

| 指标 | 类型 |
|------|------|
| `hebsbsbzjsjshduxbs[.]xyz` | Primary C2 |
| `hxxps[://]hebsbsbzjsjshduxbs[.]xyz/api/debug/event` | C2 Endpoint |
| `hxxps[://]hebsbsbzjsjshduxbs[.]xyz/api/bot/heartbeat` | C2 Endpoint |
| `hxxps[://]hebsbsbzjsjshduxbs[.]xyz/gate` | C2 Endpoint |
| `qq-0732gwh22[.]com` | Fake WeChat Lure Domain |
| `mlcrosoft[.]co[.]com` | Fake WeChat Lure Domain |
| `mlroweb[.]com` | Fake Miro Lure Domain |

### 文件系统路径

| 路径 | 用途 |
|------|------|
| `~/Library/Application Support/Google/GoogleUpdate.app/Contents/MacOS/GoogleUpdate` | Backdoor Binary |
| `~/Library/LaunchAgents/com.google.keystone.agent.plist` | Persistence mechanism |
| `/tmp/shub_log.zip` | Staged exfiltration archive |
| `/tmp/shub_split.sh` | Archive splitting utility |
| `/tmp/shub_mzip_*.zip` | Segmented archive chunks |
| `/tmp/.c.sh` | Ephemeral backdoor execution script |
| `/tmp/*_asar.zip` | Downloaded wallet payloads (e.g., exodus_asar.zip, ledger_asar.zip) |

### 静态字符串与标识符

| 标识符 | 值 |
|--------|-----|
| Build ID | `6552824c59ddacb134073f24a4bd4724514a938a9dc59f1733503642faed3bd3` |
| Build Name | `Reaper` |
| Hardcoded Build Hash | `c917fcf8314228862571f80c9e4a871e` |

## 威胁归因与演化

### SHub 恶意软件家族演化

SHub Reaper 是 SHub 窃密木马的最新变种，其演化路径体现了 macOS 恶意软件的典型发展模式：

| 版本/变种 | 主要功能 | 特征 |
|-----------|----------|------|
| **早期 SHub** | 基础信息窃取 | 浏览器凭证、Keychain、Telegram 会话 |
| **ClickFix 阶段** | 社会工程投递 | 诱导用户复制命令到 Terminal 执行 |
| **SHub Reaper** | 多阶段品牌伪装 + 持久后门 | applescript:// 绕过 + 加密货币钱包劫持 + 分块上传 |

### 相关 macOS 窃密木马

| 家族 | 特征 | 与 SHub 的关系 |
|------|------|----------------|
| **Atomic macOS Stealer (AMOS)** | 文件窃取模块、分块上传 | Reaper 借鉴了其 Filegrabber 和分块上传机制 |
| **Poseidon** | macOS 凭证窃取 | 同为 macOS 窃密木马家族 |
| **JOCK** | macOS 钓鱼即服务 | 使用类似的社会工程技术 |

## 结论

Reaper 构建表明 SHub 运营者正在将恶意软件扩展到直接的凭证和钱包盗窃之外。除了 AMOS 风格的 Filegrabber 和分块上传外，该变种还安装了持久后门，为攻击者在初始入侵后提供了更多窃取数据或转向其他恶意安装的方式

攻击链在多个阶段叠加熟悉品牌和可信软件提示的方式值得警惕：虚假的 WeChat 或 Miro 安装程序、从_typo-squatted_微软域名投递、伪装成苹果安全更新执行、以及隐藏在虚假谷歌软件更新路径中的持久化

对于防御者而言，这种组合强化了监控恶意行为的必要性，例如意外的 AppleScript 或 osascript 活动、Script Editor 执行后的可疑出站流量、或在可信供应商关联的名称空间中意外创建 LaunchAgent 或相关文件

---

