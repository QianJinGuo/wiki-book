# What My Privacy and Security Stack Actually Looks Like

## Ch12.021 What My Privacy and Security Stack Actually Looks Like

> 📊 Level ⭐⭐ | 14.1KB | `entities/what-my-privacy-and-security-stack-actually-looks-like.md`

# What My Privacy and Security Stack Actually Looks Like

## 摘要

资深隐私/安全记者 Yael 在博文中分享了她"实际在用"的隐私与安全实践，区别于常规的"工具推荐清单"。她的栈覆盖日常行为（情绪直觉、线下会面习惯）、个人信息保护（PO Box、数据经纪商退订）、隐私卫生（隐私屏、耳机通话、删除旧账号）、设备卫生（磁盘加密、iVerify、权限审计）、认证（YubiKey + 1Password/Bitwarden + Authy）、浏览（Mullvad VPN、uBlock Origin、Privacy Badger、多浏览器轮换）、通信保护（Signal 消失消息、Google Advanced Protection Program、Apple Lockdown Mode）、支付（信用卡优先、冻结信用）。

## 核心要点

- **"情绪直觉"是最重要的安全工具**：Yael 把"留意自己的感受"列为列表中最重要的——感到压力、不舒服、被催促时拒绝行动；遇到"紧急"消息时通过另一渠道核实。这种无法量化的判断力比任何技术工具都更关键。
- **线下会面安全实践**：会面前做背景调查、约在公共场所、必要时带人、告知朋友位置与预期联系时间；不在活动进行时实时发帖（除非已公告、地点拥挤、有大群体或限定受众）。
- **地址保护**：使用 PO Box（996 张发票中只有 1 次让 Yael 后悔透露了家庭地址，"一次就够"）；使用 EasyOptOuts + 自维护的 big-ass-data-broker-opt-out-list 清查家庭地址在网上的痕迹；遇到搜索结果时使用 Google suppression tools 申请移除。
- **隐私卫生习惯**：公共场所查看财务文件时使用磁性隐私屏；不公开场合接重要电话；半公开场合（如联合办公空间的电话亭）使用耳机；定期删除不再使用的账号；用 Cyd 删除旧推文并完全离开 Twitter/X（保留账号防冒名）。
- **设备卫生**：磁盘加密、定期备份、即时更新软件；尽可能避免生物识别（出于个人威胁模型考虑）；定期审计 app 权限、关闭广告追踪、启用自动更新；iVerify 做设备安全检查；敏感图片使用 locked folders / hidden albums。
- **认证体系**：Yael 认为 passkeys 是革命性但仍偏好物理安全密钥——她有三个 YubiKey（"至少需要一个备份"是必须）；使用两个密码管理器——1Password 和 Bitwarden；当 passkey/security key 不可用时使用 Authy；Authy 不可用时选择 email MFA 而非 SMS。
- **浏览实践**：Mullvad VPN 用于避免特定站点记录 IP 但不在意 ISP 可见；uBlock Origin 与 Privacy Badger 阻挡广告与追踪；在多个浏览器间轮换（最近偏爱 DuckDuckGo，但 Chrome、Firefox、Tor 都不会放弃）；明确避免 AI-based browsers 与"给 AI 太多信息"。
- **通信保护**：使用 Google Advanced Protection Program + Apple Lockdown Mode；高风险项目使用专用设备（包括 Chromebook），并且不携带它们出行；存储决策根据故事与情境判断，通常优先本地。
- **支付策略**：优先信用卡（更好的欺诈保护、与银行账户的距离）；避免与陌生人用现金、Zelle、Venmo；不使用加密货币；保持信用冻结。
- **沟通渠道**：Signal + 消失消息为主要通信；视频通话时留意 transcription 工具，敏感话题回避；Google Fi 提供 SIM-swap 保护（与 Advanced Protection 关联的 Google 账号绑定）；iCloud Hide My Email 生成别名邮箱；HaveIBeenPwned 监控账号泄露。
- **情报源**：通过 Slack、Discord、Signal 群组与 LinkedIn、Mastodon、Bluesky 等社交媒体保持对最新威胁的关注；阅读 The Verge、404 Media、Wired、This Week in Security 等；听 The Three Buddy Problem、Security Cryptography Whatever 等播客；关注 EFF、EPIC、IWMF、PEN America 等非营利组织的发布。

## 深度分析

### 为什么"情绪直觉"被列为第一位

Yael 把"留意自己感受"放在所有技术工具之前——这不是矫情，而是基于她作为安全/隐私记者 12 年的实际经验：

- 当感到疲惫而被催促见面时，停下来
- 当感到被要求分享不舒服的信息时，拒绝
- 当 app 请求可疑权限时，不安装
- 当 email/message 显得"紧急"时，该紧迫性本身就是红旗信号——通过另一渠道核实

这种"系统 1 / 系统 2"的安全直觉比工具更重要：技术工具无法替代人对自己状态与情境的觉察。"我们都时不时会失败，社会性问题也确实存在，但尽力做好仍然重要。"

### "996 张发票"的地址保护经验

Yael 用 PO Box 替代家庭地址发出 996 张发票，其中只有 1 张让她后悔——足以证明 PO Box 策略的有效性。这是一种"统计意义上零失败"的策略：即使 99.9% 的客户是无害的，那 0.1% 已经足够。

她同时通过两层机制主动清除家庭地址的公开痕迹：
1. **付费服务 EasyOptOuts**（多年使用，"有效且负担得起"）
2. **自维护的 GitHub 项目 big-ass-data-broker-opt-out-list**
3. 当 Google 搜索结果仍包含时，使用 Google suppression tools（不一定有效）

### 认证体系的层级降级策略

Yael 的认证偏好层次：

1. **首选：Passkeys**（"革命性"），但她个人偏好物理密钥
2. **实际偏好：物理安全密钥**——3 个 YubiKey，"至少一个备份"是硬性要求
3. **次选：1Password + Bitwarden** 双密码管理器
4. **MFA 不可用 passkey/security key 时：Authy**
5. **Authy 也不可用时：Email MFA > SMS MFA**

SMS MFA 被刻意降级到最低优先级，是符合当前安全共识的——SIM swap 攻击已经让 SMS 成为高风险通道。

### 为什么同时用两个密码管理器

"客户偶尔会共享 vault"——这是 Yael 用 1Password + Bitwarden 双管家的实际原因：商业客户端生态（可能用 1Password）和开源/个人生态（更可能用 Bitwarden）之间的桥接。这种实务考量比"哪个更好"的工具评比更有说服力。

### 多浏览器轮换的隐蔽含义

Yael 在 Chrome、Firefox、Safari、DuckDuckGo、Tor 之间轮换。这种习惯的真正价值不在于"哪个最隐私"，而在于**隔离**：

- 不同浏览器的 cookie 存储、扩展权限、JavaScript 引擎隔离提供天然的"风险分散"
- 一个浏览器被攻破时，其他浏览器保持干净
- DuckDuckGo 提供"开箱即用"的隐私保护，但 Chrome（工作必需）、Firefox（扩展生态）、Tor（极致匿名）都不能放弃

同时明确"避免 AI-based browsers"——这类浏览器通常需要读取大量页面数据用于 AI 摘要、对话、推荐，与隐私目标直接冲突。

### 高风险项目的专用设备策略

"对于高风险项目，我推荐专用设备（包括 Chromebook），并且不携带它们出行。"

这是安全行业经典的"air-gapped device for sensitive work"理念在个人层面的应用——把最重要的项目与日常设备物理隔离，降低"一次入侵 = 全部资产暴露"的单点风险。

### Google Advanced Protection Program + Apple Lockdown Mode 的组合

两者并用代表"接受功能性损失换取最大安全裕度"：

- **Google Advanced Protection**：强制要求物理安全密钥（不可降级）、限制第三方 app 访问 Google 账号数据
- **Apple Lockdown Mode**：禁用多种消息附件、限制 FaceTime、未知号码来电、配置描述文件等

对普通用户来说这些是过度限制，但对高风险职业（调查记者、举报人、活动人士）则是必要代价。

### 信息订阅生态

Yael 的威胁情报来源形成了一个分层结构：

| 层级 | 形式 | 代表 |
|------|------|------|
| 即时 | Slack/Discord/Signal 群组 | 行业内部 |
| 中度 | 社交媒体 | LinkedIn, Mastodon, Bluesky |
| 长期 | 媒体 | The Verge, 404 Media, Wired |
| 周期 | Newsletter | This Week in Security |
| 深度 | 播客 | The Three Buddy Problem, Security Cryptography Whatever |
| 公益 | 非营利组织 | EFF, EPIC, IWMF, PEN America |

这种多源结构避免了"单一信息茧房"的风险——不同来源对同一事件会有不同视角，更容易识别真相。

## 实践启示

1. **威胁模型是隐私决策的隐藏前提**：Yael 强调"避免生物识别"是出于她个人的威胁模型。读者应该根据自己的职业、生活方式、风险偏好建立自己的威胁模型，再选择工具组合——而非盲目复制任何"最佳实践"清单。
2. **物理安全密钥是认证的"硬底线"**：3 个 YubiKey + 至少 1 个备份是 Yael 的最低配置；这是当前对抗钓鱼最有效的方案，比 SMS、TOTP 都更安全。
3. **隐私是"减少不必要暴露"而非"完美匿名"**：Yael 的目标是"在不把生活变得不可行的情况下减少不必要的暴露"，不是隐身。务实地选择可执行的步骤比追求完美的安全状态更有效。
4. **多浏览器 + 多密码管理器是隔离哲学的体现**：单一工具被攻破时，隔离能限制爆炸半径——但需要为每个工具维护独立的强认证。
5. **AI 工具的隐私风险需要主动评估**：在 ChatGPT/Claude/Gemini 上粘贴敏感信息时要意识到这些对话可能被浏览器扩展（参见 LLMReaper）、第三方审计、模型训练数据收集等渠道暴露——非必要不粘贴敏感数据。
6. **数据经纪商退订是地址保护的核心动作**：EasyOptOuts 或自维护的 opt-out list 应该成为新常态——地址在白页、人物搜索、公开记录站点上的暴露比大多数人意识到的更广泛。

## 相关实体

- [Karpathy Vibe Coding 访谈](../ch04/603-agentic.html)
- [Karpathy Vibe Coding 完整版](../ch04/126-karpathy-vibe-coding-agentic-engineering.html)
- [Claude Code 源码机制](../ch03/076-claude-code.html)
- [Agent 原理架构与工程实践](../ch03/046-agent.html)
- [多智能体交易系统](https://github.com/QianJinGuo/wiki/blob/main/entities/构建基于多智能体架构的深度思考交易系统-v2.md)
- [OpenClaw 完整指南](../ch11/225-openclaw.html)
- [LLMReaper Browser Extension Attack](ch12/017-llmreaper-dom-based-ai-conversation-exfiltration-via-brows.html) — AI 对话的扩展窃取风险

> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/what-my-privacy-and-security-stack-actually-looks-like.md)

---

