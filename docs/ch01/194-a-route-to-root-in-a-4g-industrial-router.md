# A Route to Root in a 4G Industrial Router

> 📊 Level ⭐⭐⭐ | 10.6KB

## 深度分析

### 这不是内存破坏漏洞，而是"设计即后门"
CVE-2024-42682 的实质不是缓冲区溢出或注入这类"代码写错了"的缺陷，而是厂商在 PUSR USR-G806AU（Jinan USR IOT Technology Limited）固件里留下、且从未文档化的 uid=0 超级用户账户 `usr`：它以 `usr:x:0:0:Linux User,,,:/root:/bin/ash` 的形式躺在 `/etc/passwd` 里，官网没有任何承认其存在的文档，设备所有者因此根本不知道自己机器上有一个真管理员。
这类"设计即后门"比内存破坏漏洞更难被常规手段发现：它不违反协议解析逻辑、不引发崩溃、也没有可指纹识别的版本特征，漏扫依赖的 CVE 版本比对、签名匹配与 fuzzing 触发崩溃三者全部失效。对照组很清晰——[Fragnesia](https://github.com/QianJinGuo/wiki-public/blob/main/entities/fragnesia-linux-kernel-local-privilege-escalation-via-esp-in-tcp.md) 那类提权缺陷有确定性触发条件，能被 fuzzing 覆盖并进入补丁流程；[CHERIoT-Ibex](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cheriot-ibex-memory-safety-hardware-enforcement.md) 这类硬件强制内存安全能收敛内存破坏问题；但两者都管不了"厂商亲手放进固件的账户"。唯一现实路径是逆向固件本身。
一个侧面线索很能说明问题：登录后 `ls -l` 显示关键系统文件属主是 `usr`，而名字叫 `root` 的账户 UID 其实是 2（1.0.41 上口令还是公开已知的 root/root）。Linux 内核只认 uid=0 这个数字，所以"root"只是个低权伪装——厂商把真管理员藏在非直觉账户名后面，反倒让公开的弱口令 root 成了最显眼的靶子与最失灵的告警信号。

### 攻防路径还原：从物理接触到远端 root
链条的前提是**能接触到一台真实设备**（二手采购或实验室自购）或拿到固件镜像。作者把设备挂在树莓派上做网络隔离，用已知弱口令以 root(uid=2) 经 SSH 2222 / Telnet 2233 登录，在 `/bin` 注意到厂商自研工具 `usr_root`，用 nc 导出 `/dev/mtdblock5`(rootfs)，binwalk `-e` 解包出 SquashFS/JFFS2，在 Ghidra 里反编译这个 MIPS32le 二进制，读出 `sprintf(..., "su - usr -c \"%s\"", argv[1])` 与 `fputs` 把口令喂给 su 密码提示的调用，再定位静态数据块"每字节 +0x61"的编码（C 的 `%c` 做 mod 256 截断）、写脚本解码，最后靠 `su` 与远端 `ssh -p 2222` 双向验证。
同一个二进制还送出一组本地提权原语：黑名单只挡了 `& ; | #`，漏掉 `$()` 与反引号，于是 `usr_root /sbin/$(id>/tmp/output.txt) /sbin/tcpdump` 就能以 uid=0 执行任意命令；即便补全黑名单，`/bin/sh -c <cmd> -c /sbin/tcpdump` 的参数堆叠（sh 只认第一个 `-c`）或把脚本放在 `/tmp/sbin/tcpdump/runme.sh` 这类含合法命令串的路径下也能绕过校验。但这些原语需要攻击者已握有低权 shell，而高于 1.0.41 的固件把 root(uid=2) 的 shell 改成 `/bin/false`，连这个入口都关了。
真正抬高影响面的是最后一步：**当高权账户口令可直接用于 SSH，一个原本属本地提权类的问题就变成了远程可利用漏洞**。作者据此把所有者的应对前提定为"假设对手已经或终将能恢复该口令"，而不是"换个强口令就行"。

### 工业 IoT 暴露面：公网直连 + 生产职责 + 长生命周期
USR-G806AU 默认就接受 SSH 与 Telnet（本机为 2222/2233）。作者用 Shodan、FOFA 做的公开 OSINT 检索显示确有同类设备把管理面暴露在公网，端口散落在 HTTP 80/1080/8008/8888/9080、SSH 2222、Telnet 23/2233/2323；Tanto 同时声明除自有设备外未与任何设备交互、也未验证这些列表可达性——这条边界本身就是披露伦理的一部分。
暴露面在工业场景被放大源于三重叠加：设备承担生产与联网职责（4G 工业 VPN 路由常是现场唯一出口）、生命周期远长于消费级产品、固件更新链极不可靠。本研究覆盖 1.0.41 与 2.0.13 两个版本，厂商自 2024 年起不再回应，作者无法确认后续版本是否修复——对所有者而言"补丁是否存在"本身就是未知量。同类"老问题长期不修 + 管理面可达"的模式在 [NGINX Rift（18 年前漏洞）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/nginx-rift-achieving-nginx-rce-via-an-18-year-old-vulnerability.md) 与 [Cisco SD-WAN vHub 未认证接管](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cve-2026-20182-unauthenticated-cisco-sd-wan-control-plane-compromise-via-vhub-au.md) 中重复出现：认证缺陷一旦叠加网络可达，就等价于完全接管。

### 二手设备市场：被忽视的攻击面
作者的入口是澳大利亚一家二手零售商的线上货架——不到 100 澳元的上一代工业路由器。这条渠道对研究者极友好（便宜、功能多、随便拆），但也意味着设备来源与前任所有者完全不可知：买家继承的是未知固件、未知残留配置，以及厂商未必承认存在的账户。
从企业视角看，"买二手工业设备进生产网"与"把退役设备转售"是同一枚硬币的两面：前者继承未知配置，后者把设备自带凭证连同资产一起转手。所以完整出厂重置不只是数据擦除动作，更是凭证处置动作。

### 责任披露：公开过程，不公开口令
Tanto 公布完整发现路径却拒绝公布口令，理由是伤害不对称：口令一旦公开，攻击者会先于所有者用它去打那些暴露在公网的设备。为让所有者仍能自证，作者公布了该口令的 scrypt PHC 哈希（`ln=20,r=8,p=1`）并附校验脚本；选 scrypt 而非 SHA-1 等简单算法，是因为后者可能被暴力或字典破解，而该哈希的 CPU/内存成本参数让破解不可行——哈希只能验证候选值，无法反推口令。
CVE 编号在其中的作用值得单列：这类无崩溃、无恶意流量特征的问题很难进入常规漏洞治理流程，而 Mitre 于 2024-08 分配的 CVE-2024-42682 把它变成可追踪、可沟通、可被客户检索的公共对象，也为"厂商不回应"留下记录。厂商侧则是另一种典型：PUSR 称该账户"用于开发用途"、不向客户提供口令、要求作者不要公开恢复过程，此后终止沟通；作者在 2024-07 同步报送澳大利亚 ACSC，并按自家 VDP（修复后 30 天，或报告后 120 天公开）在多次跟进无果后于 2026-04 发布。

## 实践启示
下面按原始报告建议的对象分三组整理，每条都能回溯到报告本身的发现过程与厂商沟通记录。

**对于设备所有者与企业：**

- **管理面绝不暴露在不可信网络**：HTTP/SSH/Telnet 只能经 VPN、堡垒机或跳板机访问；本例相关端口为 SSH 2222、Telnet 23/2233/2323、HTTP 80/1080/8008/8888/9080，已暴露者应按"已被接管"处置
- **别把"改默认口令"当缓解**：真管理员 `usr`(uid=0) 对客户不可见且口令被判为对手可自行恢复，唯一有效控制是限制可达性
- **采购期做安全审计**：新设备也要查默认与未文档化账户并解包固件分析，二手与工业设备尤其必要
- **建立资产与固件版本清单**：CVE 披露时才能快速判断影响面（本例受影响版本为 1.0.41、2.0.13，且厂商未确认修复）
- **退役转售前完整出厂重置**：按凭证处置而非仅数据擦除，避免把设备自带账户一并交给下一位持有者

**对于安全研究者与渗透测试者：**

- **优先看厂商自研组件**：BusyBox/OpenWRT 这类共享代码已被大量审视，自研 helper 与调试接口才是差异化攻击面（本例 `usr_root`）
- **固件获取与解包是基本功**：`/proc/mtd` 定位分区 → nc 导出 rootfs → `binwalk -e` 解包 → Ghidra 反编译目标架构二进制；注意非标准 SSH 算法选项与设备端 BusyBox 裁剪
- **提权原语成体系地试**：不完整的 shell 元字符黑名单、`sh -c` 参数堆叠、把合法命令串藏进脚本路径、用 `/dev/tty` 重定向拿交互 shell，并评估其在具体固件版本上的实际可用性
- **合法取材、严格边界**：二手市场是低成本实验场，但只测自有设备；OSINT 列表不等于授权，先联系厂商与 CERT，再按 VDP 决定公开时机

**对于物联网设备制造商：**

- **不要留下未文档化的高权账户**：开发用账户必须可禁用或移除，账户清单随产品文档交付；把口令编码或混淆进二进制不构成保护
- **自动化提权不要用 `su`**：su 需要明文口令、调用方必须能解码，因而必然落进逆向者射程；应改用 sudo + sudoers 策略（报告给出三条可行策略），并留意 tcpdump 是 GTFOBin、需限制参数
- **正视嵌入式约束**：BusyBox 不带 sudo、OpenWRT 可经 opkg 安装、flash 空间紧张都真实存在，但省掉一个提权工具的代价可能是高权账户口令可被恢复
- **配合披露而非终止沟通**："开发用途、不向客户提供口令"与终止合作并未阻止 CVE 分配和最终公开，只让所有者经历了更长的未知期

## 相关实体
- [Npm Supply Chain Compromise Postmortem](https://github.com/QianJinGuo/wiki-public/blob/main/entities/npm-supply-chain-compromise-postmortem.md)
- [Cloudflare Glasswing Mythos Security](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cloudflare-glasswing-mythos-security.md)
- [Checkmarx Jenkins Plugin Compromised In New Supply Chain Attack](https://github.com/QianJinGuo/wiki-public/blob/main/entities/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack.md)
- [Www Wiz Io Mini Shai Hulud Strikes Again Tanstack More Npm Packages Compromised](https://github.com/QianJinGuo/wiki-public/blob/main/entities/www-wiz-io-mini-shai-hulud-strikes-again-tanstack-more-npm-packages-compromised.md)
- [Clinereleasesopen Sourceagentruntimesdk](https://github.com/QianJinGuo/wiki-public/blob/main/entities/clinereleasesopen-sourceagentruntimesdk.md)

---

