# Funnel Builder 漏洞正被利用于 WooCommerce 支付 skimming

## Ch12.063 Funnel Builder 漏洞正被利用于 WooCommerce 支付 skimming

> 📊 Level ⭐⭐ | 7.0KB | `entities/funnel-builder-flaw-under-active-exploitation-enables-woocom.md`

## 事件概述
WordPress Funnel Builder 插件（FunnelKit 出品）存在一处高危安全漏洞，目前已在野被积极利用。攻击者通过该漏洞在 WooCommerce 结账页面注入恶意 JavaScript，窃取信用卡号、CVV 和账单地址等支付数据。漏洞影响所有 **40,000+** 使用该插件的 WooCommerce 商店，目前尚无官方 CVE 编号。厂商已于 **3.15.0.3** 版本发布修复补丁。
## 技术细节
### 攻击向量
Funnel Builder 包含一个公开暴露的结账端点，允许传入请求选择要执行的内部方法类型。然而旧版本设计时未对调用者权限进行校验，也未限制允许调用的方法范围。攻击者可发送未认证请求，调用某个将攻击者可控数据直接写入插件全局设置的内部方法。
注入的代码片段随后会被嵌入到每个 Funnel Builder 结账页面中，攻击者由此可在受感染站点的每次结账交易时触发任意 `<script>` 标签。

### 攻击手法
攻击者在插件的 **"External Scripts"** 设置中植入伪造的 Google Tag Manager 脚本。该代码看起来像普通分析工具，与商店的真实标签混在一起，但实际加载的是一个支付 skimmer，负责从结账流程中窃取信用卡号、CVV 和账单地址。

这与此前 The Hacker News 报道过的 Google Tag Manager 被利用进行支付 skimming 的模式一致，反映出攻击者对供应链第三方脚本的持续依赖。

## 处置建议
1. **立即更新**：将 Funnel Builder 插件升级至 3.15.0.3 或更高版本
2. **检查外部脚本**：前往 Settings > Checkout > External Scripts 审查所有条目，删除任何不认识的内容
3. **监控异常**：检查结账页面是否存在非预期的第三方脚本加载

## 相关实体
- MOC
## 时间线
| 时间 | 事件 |
|------|------|
| 2026-05-19 | The Hacker News 报道漏洞已进入主动利用阶段 |
| 漏洞公开前 | 已有至少一起攻击案例，载荷伪装为 GTM 并连接 C2 |

## 深度分析
1. **未认证访问 + 方法枚举 = 直接RCE路径**：Funnel Builder 的结账端点对调用者权限零校验，允许攻击者通过方法类型参数调用任意内部方法，将可控数据直接写入插件全局设置。这本质上是一个无需身份验证的代码注入通道，攻击者可直接绕过认证层实现远程代码执行。
2. **GTM 伪装 + WebSocket C2 = 高度隐蔽的动态载荷**：攻击载荷伪装成 Google Tag Manager 加载器，与真实分析标签混在一起，巧妙利用审核人员对熟悉追踪代码的信任盲点。同时通过 WebSocket 连接 C2 服务器 (`wss://protect-wss[.]com/ws`) 动态拉取定制化 skimmer，使恶意代码的行为可根据受害者商店实时调整，极大增加了检测难度。
3. **插件级持久化 vs 文件级篡改**：攻击者将恶意脚本写入插件数据库设置而非文件系统，这意味着传统文件完整性监控工具（如 WAF、文件哈希校验）无法检测到异常。插件设置存储在 `wp_options` 中的特性使得恶意代码在管理员不知情的情况下随页面加载自动执行。
5. **40,000+ 受影响站点暴露了 WordPress 生态的碎片化安全困境**：大量站点运行未更新的插件版本，而官方修复补丁的部署完全依赖站点管理员的主动行动。这种被动响应模式意味着即使修复版本已发布，绝大多数受影响的站点仍将在未来数周至数月内处于可被利用状态。

## 实践启示
1. **立即强制更新 Funnel Builder 至 ≥3.15.0.3**：将插件加入网站健康检查清单，对生产环境的 WordPress 插件版本实施自动化合规扫描，阻止低于安全版本的插件在生产环境运行。
2. **审计所有"External Scripts"设置**：立即登录 WordPress 管理后台，访问 Settings > Checkout > External Scripts，逐条审查每一条第三方脚本定义。对于所有非官方 GTM/Analytics 的脚本条目，在确认为业务必需前一律视为可疑并移除。
3. **在结账页面部署 CSP 并限制 script-src**：为 WooCommerce 结账页面设置严格的内容安全策略（CSP），明确限定允许加载的脚本来源（仅限可信域名），阻断来自未授权域名的 JavaScript 执行，即使攻击者已在设置中注入脚本也无法加载。4. **对 WordPress 插件实现运行时行为监控**：部署专门的 WordPress 安全监控（如 Wordfence、Sucuri 或 Patchstack），重点监控 `wp_options` 表中 plugin settings 的变更行为，以及结账页面 DOM 中动态插入的可疑 script 标签。
5. **建立第三方脚本引入的强制审核流程**：制定安全策略要求所有新引入的第三方脚本（GTM、Analytics、Chat Widget 等）必须经过安全团队的代码审查和域名 Verify后方可上线。对于电商平台，建议在结账流程中完全禁用非必要第三方脚本。
## 相关实体
- [Funnel Builder Flaw Under Active Exploitation Enables Woocommerce Checkout Skimm](/ch12-084-funnel-builder-flaw-under-active-exploitation-enables-woocom/)
- [Funnel Builder Flaw Woocommerce Checkout Skimm](/ch12-084-funnel-builder-flaw-under-active-exploitation-enables-woocom/)
- [Teampcp Claims Sale Of Mistral Ai Repositories Amid Mini Shai Hulud Attack 1](/ch12-055-teampcp-claims-sale-of-mistral-ai-repositories-amid-mini-sha/)
- [Introducing Deepsec Find And Fix Vulnerabilities In Your Code Base](/ch09-102-introducing-deepsec-the-security-harness-for-finding-vulner/)
- [Cve 2026 20182 Cisco Sd Wan Vhub Bypass](/ch12-015-resecurity-cve-2026-20182-unauthenticated-cisco-sd-wan-co/)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/funnel-builder-flaw-under-active-exploitation-enables-woocom.md)

---

