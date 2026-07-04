# 使用 Amazon CloudFront 和 AWS WAF 大规模交付 WordPress

## Ch11.142 使用 Amazon CloudFront 和 AWS WAF 大规模交付 WordPress

> 📊 Level ⭐⭐ | 7.7KB | `entities/使用-amazon-cloudfront-和-aws-waf-大规模交付-wordpress.md`

# 使用 Amazon CloudFront 和 AWS WAF 大规模交付 WordPress

## 概览

AWS 官方博客发布的 WordPress 大规模交付工程实战文档，针对**高流量 + 强攻击面**场景，系统拆解 CloudFront 缓存分层、WAF 路径规则、Cookie 处理三个最棘手的工程问题。每个配置项都给出具体缓存键策略 + TTL 推荐 + WAF 规则模板。

## 三个核心工程问题

### 1. 缓存策略分层（公开/登录/Cookie）

WordPress 三种内容状态的缓存键设计：
- **公开页面**（首页、文章页）：`Cache-Control: public, max-age=300`，S-MaxAge=86400
- **登录用户页面**（wp-admin、my-account）：`Cache-Control: private, no-cache`（必须 bypass）
- **带 Cookies 的页面**（购物车、个性化）：按 `wp-logged-in` cookie 变体缓存

### 2. xmlrpc.php 攻击面防御

- xmlrpc.php 是 WordPress 历史遗留的 XML-RPC 接口，**默认开启且无鉴权** → 高频 brute-force 攻击源
- WAF 规则：阻断 POST /xmlrpc.php 单 IP > 10/分钟
- CloudFront 行为配置：`/xmlrpc.php` 直接返回 403

### 3. 基于 Cookie 的缓存键问题

`PHPSESSID`、`wordpress_logged_in_*` 等 cookie 变化会导致缓存命中率崩溃（每个 session 一个缓存键）
- **解法 1**：用 CloudFront Functions 在 viewer request 阶段剥离特定 cookie 后再 forward 到 origin
- **解法 2**：origin 端基于 cookie 白名单返回 `Vary: Cookie-Whitelist`，CloudFront 按白名单变体缓存

## WAF 路径规则与速率限制

| 路径 | 规则 | 速率限制 |
|------|------|---------|
| `/wp-login.php` | 阻断异常 UA | 30 req/5min/IP |
| `/xmlrpc.php` | 全阻断 | 10 req/5min/IP |
| `/wp-admin/admin-ajax.php` | 仅允许已登录用户 | 200 req/5min/IP |
| `/wp-cron.php` | 限速 + 来源 IP 白名单 | 5 req/5min/IP |

## 与其他 CloudFront 文档的差异化

- `amazon-cloudfront-deploy-guide-cloudfront-domain-multi-tenant-architecture.md`（多租户架构）— 关注域名层
- 本文档：**WordPress 单一应用的缓存+WAF 最佳实践**，更具体到 WAF 规则数字

## 实践启示
## 深度分析

### 1. Cookie 缓存键碎片化是 WordPress CDN 化的核心矛盾

WordPress 的会话模型（`wordpress_logged_in_*`、`wp-settings-*` 等 cookie）与 CDN 缓存是一对天然矛盾——如果将所有 cookie 纳入缓存键，每个用户 session 都会产生独立缓存副本，命中率趋近于零。本文揭示的解法不是"禁止缓存"，而是**在 viewer-request 阶段用 CloudFront Functions 剥离匿名访客的全部 cookie**，同时通过 Origin Request Policy 将 cookie 转发给源站。源站检测到认证会话后主动返回 `Cache-Control: no-store`，CloudFront 依此 bypass 缓存——这是一个**边缘与源站协同的缓存协商机制**，比单纯的缓存键白名单更精确。[CDN 乐高实践](ch05/009-harness.md)中提到的边缘可编程性与此同构。

### 2. 三层缓存策略是可复用的会话型 CMS 模式

本文定义的"公开页面 → 登录用户页面 → 带 Cookies 的个性化页面"三层缓存结构，本质上是对内容状态机的建模。这个模式不局限于 WordPress，任何基于 cookie 会话的 CMS（Magento、Shopify 自定义插件、Drupal）都可以用相同的思路拆解。关键洞察：**内容状态由 Cache-Control 语义决定，而非由 URL 路径决定**，这让缓存策略与业务逻辑解耦。

### 3. Count + Label + Custom Rule 模式是 WAF 误报处理的标准范式

WAF 最大的工程挑战不是"如何阻止攻击"，而是"如何不误伤正常业务"。本文的 Count + Label + Custom Rule 模式——将有问题的规则覆盖为 Count（检测但不阻止），再添加一条匹配标签的自定义 Block 规则——提供了一种**可验证的误报处理框架**：在 Count 模式下积累足够流量验证无误报后，再切换为 Block，且不影响其他规则的阻断能力。这个模式适用于所有启用 AWS WAF 托管规则组的场景。

### 4. Cache Tag 语义化失效将 CDN 缓存管理从路径维度提升到内容维度

传统的 CDN 失效基于 URL 路径，当一篇博客文章同时出现在首页、文章页、归档页时，需要失效多个 URL。Cache Tag 失效允许给缓存对象打上语义标签（`post-type:post`、`category:news`），按内容语义而非 URL 结构批量失效。这个设计将缓存失效的复杂度从 O(N) 降到 O(1)，代价是源站需要配合输出 x-cache-tag header（对于 WordPress，建议通过 MU-plugin 原生实现）。

### 5. wp-cron.php 的被动触发是 WordPress 在 CDN 环境下的结构性缺陷

wp-cron.php 依赖"有访客才触发"的机制在低流量时段造成任务漏执行，在高并发时造成重复触发。这个问题在物理上无法通过 CDN 配置解决——正确解法是**在源站禁用 WordPress 内置 cron（`DISABLE_WP_CRON=true`），用系统级 cron 定时、可控地直接请求 `/wp-cron.php`**。这是 WordPress 架构与边缘缓存环境兼容性的一个隐蔽但重要的工程细节。

## 实践启示

- **优先使用 CloudFront Functions 而非 Lambda@Edge 做 cookie 剥离**：按调用计费（$0.000001/调用）比 Lambda@Edge 按执行时间计费便宜约 6 倍，且冷启动延迟更低
- **Cache Tag 失效配合短 TTL（60-300s）是最低复杂度的缓存更新策略**：对于内容更新时效性要求在分钟级的营销站点，完全跳过主动失效操作
- **WAF 规则用 CloudFormation 管理**：避免控制台手动配置导致的规则漂移，规则变更纳入版本控制，支持 GitOps
- **WooCommerce 的 `?add-to-cart` 参数无法被缓存行为匹配**，必须在 CloudFront Functions 中通过查询字符串检查手动触发 bypass——这是 CloudFront 路径匹配机制的已知限制
- **上线前用 Rate-Based Statement 的干跑模式验证限速阈值**：AWS WAF 支持将规则设置为 Count（只记录不阻止），用生产流量验证后再切换为 Block

## 相关实体
- [aws waf ai traffic monetization — 内容所有者向 ai 收费的网络层基础设施](ch04/277-ai.md)
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/使用-amazon-cloudfront-和-aws-waf-大规模交付-wordpress.md)

---

