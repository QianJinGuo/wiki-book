---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/using-amazon-cloudfront-aws-waf-wordpress
ingested: 2026-06-10
feed_name: AWS China Blog
source_published: 2026-06-10
sha256: 3640298176027415f8396f906ec43ab1330e07908496f9276bcb7e21040f48e4
---

# 使用 Amazon CloudFront 和 AWS WAF 大规模交付 WordPress

摘要：一篇实战指南：用 CloudFront Functions 解决 WordPress 基于 Cookie 的缓存难题，配置 AWS WAF 保护 wp-admin 且不误伤正常访问，以及通过标签式缓存失效实现内容秒级更新。  
  
**目录**

01 简介

02 WordPress 架构基础（CDN/WAF 工程师视角）

03 WordPress 的 CloudFront 配置

04 WordPress 的 AWS WAF 配置

05 总结

* * *

## **1\. 简介**

WordPress 覆盖了全球 43% 以上的网站——从媒体出版、大学门户到电商和金融服务营销站点。虽然它的出身是”博客软件”，但现在 WordPress 已经是主流的企业 CMS（Content Management System，内容管理系统），因为它让非技术团队能独立发布内容、支持 100+ 种语言、拥有 65,000+ 个插件的生态。

对 CDN（Content Delivery Network）和 WAF（Web Application Firewall）工程师来说，WordPress 有一些独特的挑战：它基于 cookie 的会话模型会破坏简单的缓存策略、后台管理界面容易触发 WAF 误报、攻击面（xmlrpc.php、wp-login.php）需要有针对性的防护。本指南提供了适用于生产环境的 CloudFront 和 [AWS WAF](<https://aws.amazon.com/cn/waf/>) 配置方案，帮你实现高缓存命中率、低延迟和强安全性。

## **2\. WordPress 架构基础（CDN/WAF 工程师视角）**

### 2.1 WordPress 站点的典型组成

层级 | 角色  
---|---  
营销页面、博客文章、着陆页 | WordPress（PHP + MySQL）  
客户门户、API、交易 | 独立后端（非 WordPress）  
静态资源（图片、CSS、JS） | 从 /wp-content/ 提供  
管理后台 | /wp-admin/ 和 /wp-login.php  
  
WordPress 处理的是面向公众的内容层。业务关键系统（支付、用户数据、API）通常运行在独立的基础设施上。这意味着对 WordPress 层做激进的缓存既安全又有高价值。

### 2.2 Cookie 问题

WordPress 设置了几个干扰 CDN 缓存的 cookie：

Cookie 模式 | 何时设置 | 影响  
---|---|---  
wordpress_logged_in_* | 用户登录时 | 表示已认证会话  
wp-settings-* | 用户访问后台时 | 存储后台偏好设置  
comment_author_* | 用户发表评论时 | 预填评论表单  
插件 cookie（分析、同意、A/B 测试） | 不定 | 可能影响也可能不影响页面输出  
  
如果这些 cookie 被包含在缓存键中，每个唯一的 cookie 组合都会创建一个独立的缓存副本——实际上缓存命中率就降为零了。

**cookie 处理不当的业务风险**

风险 | 原因 | 影响  
---|---|---  
缓存命中率 → 0% | cookie 值被包含在缓存键中 | 源站过载，CDN 毫无作用  
向错误用户提供个性化内容 | 剥离了 cookie 但源站根据 cookie 渲染不同 HTML | 隐私/合规违规，A/B 测试失效  
  
应对方案：

  1. 客户端渲染个性化内容（首选）：保持 HTML 通用且可缓存，通过客户端 JavaScript 注入个性化元素（同意横幅、A/B 变体）。
  2. 在缓存键中白名单指定 cookie：仅当某个插件根据 cookie 渲染不同的服务端 HTML，且变体数量有限时才使用（例如 currency=USD|EUR|GBP）。
  3. 对受影响的路径绕过缓存：用于服务端个性化程度高的页面（如 WooCommerce 购物车/结账）。



大多数 WordPress 营销站点的个性化内容（同意横幅、聊天组件、A/B 测试）都由前端 JS 在页面加载后注入，不影响服务端输出的 HTML。因此对匿名访客直接剥离所有 cookie、全页缓存是安全的。

## **3\. WordPress 的 CloudFront 配置**

### 3.1 缓存行为设计

CloudFront 需要多个有序的缓存行为才能正确服务 WordPress：

优先级 | 路径模式 | 缓存策略 | Cookie | TTL（Time To Live）  
---|---|---|---|---  
1 | /wp-admin/* | 不缓存（绕过） | 全部 | 0  
2 | /wp-login.php | 不缓存 | 全部 | 0  
3 | /wp-cron.php | 不缓存 | 全部 | 0  
4 | /wp-json/* | 不缓存 | 全部（Gutenberg 使用认证的 REST API） | 0  
5 | /wp-content/uploads/* | 长 TTL | 无 | 86400s  
6 | /wp-includes/* | 长 TTL | 无 | 31536000s  
7 | *.css、*.js、图片 | 长 TTL | 无 | 31536000s  
8 | /*（默认） | 短 TTL | 无（被函数剥离） | 300s  
  
### 3.2 缓存策略

**匿名页面缓存（默认行为）**

以下为配置字段说明（伪代码，并不是可直接部署的模板）：
    
    
    WordPressCachePolicy:
      CookieBehavior: none        # Exclude all cookies from cache key
      HeaderBehavior: none
      QueryStringBehavior: whitelist
      QueryStrings: [p, page_id, preview, preview_nonce]
      MinTTL: 0                   # 必须为 0，否则 origin 的 Cache-Control: no-store 会被忽略
      DefaultTTL: 300             # 5 minutes
      MaxTTL: 86400               # 1 day
    

预览处理：WordPress 预览 URL 使用 ?preview=true&p=123。将 preview 包含在查询字符串白名单中可确保预览生成不同的缓存键。加上 WordPress 对预览页面返回 Cache-Control: no-store（当存在认证 cookie 时），预览内容永远不会被缓存。

**管理后台/绕过路径**
    
    
    WordPressBypassPolicy:
      CookieBehavior: all
      QueryStringBehavior: all
      DefaultTTL: 0
      MaxTTL: 0
    

### 3.3 Origin Request Policy

需要两个独立的 ORP（Origin Request Policy，源请求策略）

动态页面（默认行为） — 必须转发 cookie 让 WordPress 检测认证状态：
    
    
    WordPressPageOriginRequestPolicy:
      HeaderBehavior: whitelist
      Headers: [Host, X-Forwarded-For, CloudFront-Forwarded-Proto]
      CookieBehavior: all       # Origin needs cookies to detect logged-in users
      QueryStringBehavior: all
    

静态资源 — 不需要 cookie：
    
    
    WordPressStaticOriginRequestPolicy:
      HeaderBehavior: whitelist
      Headers: [Host]
      CookieBehavior: none
      QueryStringBehavior: none
    

### 3.4 CloudFront Function：Cookie 剥离（Viewer-Request）

这一步最重要——附加到默认缓存行为的 viewer-request 上：
    
    
    function handler(event) {
      var request = event.request;
      var cookies = request.cookies;
    
      // Detect logged-in WordPress user or commenter
      for (var name in cookies) {
        if (name.startsWith('wordpress_logged_in') ||
            name.startsWith('wordpress_sec') ||
            name.startsWith('wp-settings') ||
            name.startsWith('comment_author')) {
          // Pass all cookies through — origin will respond with
          // Cache-Control: no-store (WordPress does this natively
          // when it detects an authenticated session).
          return request;
        }
      }
    
      // Anonymous visitor: strip ALL cookies
      request.cookies = {};
      return request;
    }
    

绕过机制如何在没有单独行为的情况下工作：缓存策略（CookieBehavior: none）无论如何都不会把 cookie 纳入缓存键。但通过 ORP 将 cookie 转发到源站，WordPress 在服务端检测到认证会话后返回 Cache-Control: no-store，CloudFront 就不会缓存该响应。

**替代方案：基于缓存键的绕过**

对于不能可靠设置 Cache-Control: no-store 的源站（如某些托管平台），可以通过注入唯一 header 值来强制缓存未命中。前提是 Cache Policy 的 HeaderBehavior 必须设为 whitelist 并包含 x-cache-bypass，使其成为缓存键的一部分，这样每个带 bypass cookie 的请求都会生成唯一的缓存键，保证 Miss 缓存并回源。
    
    
    var BYPASS_COOKIES = ['wordpress_logged_in', 'wordpress_sec', 'wp-settings',
                          'comment_author', 'woocommerce_cart_hash', 'woocommerce_items_in_cart'];
    
    function shouldBypass(cookies) {
      for (var name in cookies) {
        for (var i = 0; i < BYPASS_COOKIES.length; i++) {
          if (name.startsWith(BYPASS_COOKIES[i])) return true;
        }
      }
      return false;
    }
    
    if (shouldBypass(request.cookies)) {
      // Inject unique value into a header whitelisted in Cache Policy
      request.headers['x-cache-bypass'] = { value: '' + Math.random() };
    }
    

Math.random() 在 CloudFront Functions 中基于 OpenBSD arc4random 实现，每次调用生成独立的随机值。比 Date.now() 更可靠，后者对同一毫秒内的并发请求会产生相同的值。

### 3.5 基于 Cache Tag 的缓存失效

CloudFront 的基于标签的失效（2026 年 4 月推出）消除了预测需要清除哪些 URL 路径的麻烦。给缓存对象打上语义标签，按组失效。

**工作原理**

  1. 在 distribution 上启用 CacheTagConfig，配置一个 header 名称（如 x-cache-tag）
  2. 源站在该 header 中返回标签：x-cache-tag: post-type:post, category:news, author:jane
  3. 内容更新时，按标签失效：


    
    
    aws cloudfront create-invalidation \
      --distribution-id EXXXXXX \
      --paths "#post:my-post-slug" "#category:news" "#page:home"
    

限制：每个对象最多 50 个标签，每个标签 256 字符，不区分大小写。每个 #tag 计为一个路径，算在每月 1,000 次免费失效额度内。

如果源站不能原生设置该 header，可使用 Lambda@Edge origin-response（仅在缓存未命中时运行）：
    
    
    export const handler = async (event) => {
      const response = event.Records[0].cf.response;
      const uri = event.Records[0].cf.request.uri;
      const tags = [];
    
      if (uri === '/') tags.push('page:home');
      if (/^\/\d{4}\/\d{2}\/[^/]+\/?$/.test(uri)) {
        const slug = uri.replace(/^\/\d{4}\/\d{2}\//, '').replace(/\/$/, '');
        tags.push('post-type:post', `post:${slug}`);
      }
      const catMatch = uri.match(/^\/category\/([^/]+)\/?/);
      if (catMatch) tags.push(`category:${catMatch[1]}`, 'archive:category');
    
      if (tags.length) {
        response.headers['x-cache-tag'] = [{ key: 'x-cache-tag', value: tags.join(', ') }];
      }
      return response;
    };
    

局限性：基于 URL 模式的标签只能从 URL 结构推断标签。一篇位于 /2024/06/my-post/ 的文章可能属于多个 URL 中不可见的分类。要获得完整的标签覆盖，源站应通过 WordPress MU-plugin 原生输出该 header。

成本：Lambda@Edge origin-response 在 10% 未命中率和 1000 万页面浏览量下 ≈ $0.63/月。

更简单的替代方案：将默认 TTL 设为 60–300 秒，完全跳过失效操作。对于内容在几分钟内更新可接受的营销站点，这是最低复杂度的选择。

### 3.6 WooCommerce 注意事项

WooCommerce 站点需要为依赖会话的页面添加额外的绕过路径：

路径 | 原因 | 实现方式  
---|---|---  
/cart/* | 每个用户的购物车内容 | 缓存行为（路径模式）  
/checkout/* | 支付流程、CSRF token | 缓存行为（路径模式）  
/my-account/* | 认证用户的 dashboard | 缓存行为（路径模式）  
?add-to-cart=* | 购物车修改 | CFF（CloudFront Functions）逻辑（查询字符串检查）  
  
?add-to-cart=* 无法通过 cache behavior 处理，因为 CloudFront 的 path pattern 只匹配 URI 路径部分（/path/to/page），不会匹配 ? 后面的 query string。需要在 CFF 里判断 query string 参数并手动触发 bypass：
    
    
    // Inside CFF viewer-request handler:
    var qs = request.querystring;
    if (qs['add-to-cart'] || qs['remove_item'] || qs['wc-ajax']) {
      request.headers['x-cache-bypass'] = { value: '' + Math.random() };
      return request;
    }
    

### 3.7 wp-cron.php

WordPress 的定时任务（定时发布文章、插件调度等）依赖 wp-cron.php 被动触发：每次有访客加载页面时，WordPress 顺带请求一次 wp-cron.php。这个机制本身有两个问题：

  * 没有访客就不触发：低流量时段（如凌晨）定时任务不会执行
  * 高并发时重复触发：大量访客同时访问可能并发触发多次 cron，浪费资源



虽然 2.1 的配置已经确保 CloudFront 不缓存 wp-cron.php（TTL=0），但上述问题与 CDN 无关。推荐做法是禁用被动触发，改用系统 cron 定时、可控地执行：
    
    
    // wp-config.php
    define('DISABLE_WP_CRON', true);
    # 系统 cron — 直接请求源站，绕过 CloudFront
    */5 * * * * curl -s https://origin-server.example.com/wp-cron.php > /dev/null
    

## **4\. WordPress 的 AWS WAF 配置**

### 4.1 推荐的托管规则组

规则组 | WCU（Web ACL Capacity Units） | 用途  
---|---|---  
AWSManagedRulesAntiDDoSRuleSet | 50 | 应用层（L7）DDoS 自动防护，基于 ML 基线检测异常流量，秒级响应  
AWSManagedRulesAmazonIpReputationList | 25 | 已知恶意 IP、僵尸网络  
AWSManagedRulesCommonRuleSet（CRS，Core Rule Set） | 700 | OWASP Top 10：XSS、SQLi、LFI、大小限制  
AWSManagedRulesAdminProtectionRuleSet | 100 | 管理路径访问控制  
AWSManagedRulesKnownBadInputsRuleSet | 200 | Log4j、Java RCE、已知漏洞利用模式  
AWSManagedRulesSQLiRuleSet | 200 | SQL 注入  
AWSManagedRulesPHPRuleSet | 100 | PHP 特定注入  
AWSManagedRulesWordPressRuleSet | 100 | WordPress 特定漏洞利用  
AWSManagedRulesLinuxRuleSet | 200 | Linux LFI 攻击  
合计 | ~1,675 | 占 5,000 WCU 上限  
  
### 4.2 WordPress 专用规则组

AWSManagedRulesWordPressRuleSet（WCU: 100）防护以下威胁：

规则 | 防护内容  
---|---  
WordPressExploitablePaths_URIPATH | 阻止 xmlrpc.php 和其他可利用文件  
WordPressExploitableCommands_QUERYSTRING | 阻止高风险查询命令（如 do-reset-wordpress）  
  
配合 SQLi 和 PHP 规则组使用可获得全面覆盖。

### 4.2b AdminProtectionRuleSet — 谨慎使用

AWSManagedRulesAdminProtectionRuleSet（WCU: 100）包含一条规则 AdminProtection_URIPATH，它会阻止对管理路径（包括 /wp-admin/）的访问。如果不做排除就启用，WordPress 管理员将无法访问后台。

**选项：**

  1. 覆盖为 Count + Label + 自定义规则（推荐，与 3.4 节模式一致）： 
     1. 将 AdminProtection_URIPATH 设为 Count
     2. 添加自定义规则：匹配标签 awswaf:managed:aws:admin-protection:AdminProtection_URIPATH + NOT（源 IP 在管理员 IP 集合中）→ Block
     3. 结果：管理路径对所有人阻止，已知管理员 IP 除外
  2. 完全移除该规则组：如果你已经对 /wp-admin 做了地域限制（3.3 节）并对 /wp-login.php 做了限速，AdminProtection 规则组可能是多余的。评估额外覆盖是否值得运维开销。
  3. 缩小规则组的适用范围，排除 /wp-admin/admin-ajax.php——该端点被 WordPress 前端功能调用（评论表单、AJAX 搜索），不应对公共访客阻止。



### 4.3 自定义规则

以下 JSON 为单条规则定义片段，需放入 Web ACL 的 Rules 数组中使用，不能直接粘贴到 Web ACL JSON editor 的顶层。

**对 wp-login.php 做限速（暴力破解防护）**
    
    
    {
      "Name": "RateLimitWpLogin",
      "Priority": 5,
      "Statement": {
        "RateBasedStatement": {
          "Limit": 100,
          "EvaluationWindowSec": 300,
          "AggregateKeyType": "IP",
          "ScopeDownStatement": {
            "ByteMatchStatement": {
              "SearchString": "/wp-login.php",
              "FieldToMatch": { "UriPath": {} },
              "TextTransformations": [{"Priority": 0, "Type": "LOWERCASE"}],
              "PositionalConstraint": "STARTS_WITH"
            }
          }
        }
      },
      "Action": { "Block": {} }
    }
    

对 wp-admin 做地域限制：阻止管理员不在的国家访问 /wp-admin。

**全局限速（防 HTTP flood）**
    
    
    {
      "Name": "RateLimitGlobal",
      "Priority": 3,
      "Statement": {
        "RateBasedStatement": {
          "Limit": 2000,
          "EvaluationWindowSec": 300,
          "AggregateKeyType": "IP"
        }
      },
      "Action": { "Block": {} },
    }
    

单个 IP 5 分钟内超过 2000 次请求即被阻止。根据站点正常流量调整阈值。

阻止 wp-config.php：直接访问必须始终被阻止（包含数据库凭据）。

### 4.4 处理误报：Count + Label + 自定义规则模式

WordPress WAF 最大的挑战：管理员保存含有 HTML/JS 内容的文章时触发 CRS 的 CrossSiteScripting_BODY 和 SizeRestrictions_BODY 误报。

**所有托管规则组的推荐模式**

  1. 将有问题的规则覆盖为 Count（仍然检查并打标签，但不阻止）
  2. 在 AMR（AWS Managed Rules，AWS 托管规则）之后添加一条自定义规则，匹配标签 + NOT 条件以排除合法流量



这样既保留了检测能力，又消除了已知正常路径的误报。

**步骤 1：覆盖为 Count**
    
    
    "ManagedRuleGroupStatement": {
      "VendorName": "AWS",
      "Name": "AWSManagedRulesCommonRuleSet",
      "RuleActionOverrides": [
        { "Name": "CrossSiteScripting_BODY", "ActionToUse": { "Count": {} } },
        { "Name": "SizeRestrictions_BODY", "ActionToUse": { "Count": {} } }
      ]
    }
    

**步骤 2：自定义规则——阻止 body 中的 XSS，wp-admin 除外**
    
    
    {
      "Name": "BlockXSSBodyExceptAdmin",
      "Priority": 35,
      "Statement": {
        "AndStatement": {
          "Statements": [
            {
              "LabelMatchStatement": {
                "Scope": "LABEL",
                "Key": "awswaf:managed:aws:core-rule-set:CrossSiteScripting_Body"
              }
            },
            {
              "NotStatement": {
                "Statement": {
                  "ByteMatchStatement": {
                    "SearchString": "/wp-admin",
                    "FieldToMatch": { "UriPath": {} },
                    "TextTransformations": [{"Priority": 0, "Type": "LOWERCASE"}],
                    "PositionalConstraint": "STARTS_WITH"
                  }
                }
              }
            }
          ]
        }
      },
      "Action": { "Block": {} }
    }
    

这条规则对所有路径阻止 body 中的 XSS，除了 /wp-admin/*，因为编辑在那里正常发布 HTML 内容。

对于 SizeRestrictions_BODY：考虑永久保持为 Count。WordPress 文章、媒体上传和产品描述经常超过默认大小限制，维护跨端点的 Body size 例外运维成本很高。

避免将规则动作设置为 Allow：一条终止性的 Allow 规则会让该流量绕过所有下游规则。Count + Label + 自定义规则的方式只放宽导致问题的特定规则，其他所有防护保持生效。

### 4.5 规则优先级顺序

优先级 | 规则 | WCU  
---|---|---  
1 | 阻止 wp-config.php（自定义） | 10  
2 | Anti-DDoS（AMR）— 需要尽早看到所有流量以建立完整基线 | 50  
3 | 全局限速 2000 req/5min per IP（自定义） | 2  
5 | 对 wp-login.php 限速 100 req/5min per IP（自定义） | 12  
6 | 对 wp-admin 地域限制（自定义） | ~12  
10 | IP Reputation List（AMR） | 25  
30 | Common Rule Set — CRS（AMR，带 Count 覆盖） | 700  
35 | 阻止 body XSS（admin 除外）（自定义，匹配 CRS 标签） | ~12  
40 | Admin Protection（AMR） | 100  
50 | Known Bad Inputs（AMR） | 200  
60 | SQLi Rule Set（AMR） | 200  
70 | PHP Rule Set（AMR） | 100  
80 | WordPress Rule Set（AMR） | 100  
90 | Linux Rule Set（AMR） | 200  
合计 |  | ~1,723 / 5,000  
  
**原则：**

  * 自定义阻止规则优先（WCU 低，置信度高）
  * IP 信誉检查在昂贵的检查规则之前
  * 需要的地方对 AMR 做 Count 覆盖，紧随其后放置匹配其标签的自定义规则
  * 优先使用 Count + Label + 自定义规则，避免使用终止性 Allow 规则



### 4.6 CloudFront 特有的 WAF 注意事项

  * Web ACL 必须在 us-east-1（全局范围）才能关联 CloudFront
  * 默认 body 检查限制：16 KB（对大型 WordPress 文章内容可增加到 64 KB）
  * 基于速率的规则使用 IP 聚合——CloudFront 转发真实客户端 IP



## **5\. 总结**

挑战 | 解决方案  
---|---  
WordPress cookie 导致缓存碎片化 | CloudFront Function 为匿名访客剥离 cookie；已登录用户通过源站 Cache-Control 绕过  
发布时的缓存失效 | 基于标签的失效（语义化、精确）或短 TTL（简单）  
xmlrpc.php / wp-login.php 攻击 | AWSManagedRulesWordPressRuleSet + 限速自定义规则  
管理员编辑触发 XSS 误报 | Count + Label + 自定义规则：除 /wp-admin 外全部阻止  
WooCommerce 会话页面 | 独立的绕过缓存行为 + CFF 查询字符串检测  
wp-cron 在 CDN 下失效 | 禁用 WP-Cron，用系统 cron 直接请求源站  
  
本文提供的是配置思路和规则片段，不是可直接部署的模板。实际部署时需要根据具体站点的流量模式、管理员 IP 范围和业务需求调整参数，并在 Count 模式下充分测试后再切换为 Block。

**下一步行动：**

**相关产品：**

  * [Amazon CloudFront](<https://aws.amazon.com/cn/cloudfront/?p=bl_pr_cloudfront_l=1>) — 全球内容分发网络
  * [Amazon WAF](<https://aws.amazon.com/cn/waf/?p=bl_pr_waf_l=2>) — Web 应用程序防火墙
  * [AWS Lambda](<https://aws.amazon.com/cn/lambda/?p=bl_pr_lambda_l=3>) — 无需服务器即可运行代码



**相关文章：**

  * [CloudHSM的Java SDK使用及IoT场景加密体系设计最佳实践（上）](<https://aws.amazon.com/cn/blogs/china/aws-cloudhsm-getting-started-and-iot-scenario-encryption-algorithm-design-best-practices-1/?p=bl_ar_l=1>)
  * [CloudHSM的Java SDK使用及IoT场景加密体系设计最佳实践（下）](<https://aws.amazon.com/cn/blogs/china/aws-cloudhsm-getting-started-and-iot-scenario-encryption-algorithm-design-best-practices-2/?p=bl_ar_l=2>)
  * [基于 Amazon CloudFront 和 Lambda@Edge 实现失败请求的完整记录与异步重放](<https://aws.amazon.com/cn/blogs/china/based-on-amazon-cloudfront-lambda-edge-implement/?p=bl_ar_l=3>)
  * [AWS DevOps Agent 实战：云网络故障自主调查与修复建议](<https://aws.amazon.com/cn/blogs/china/aws-devops-agent-network-fault/?p=bl_ar_l=4>)
  * [Amazon CloudFront部署小指南（二十四）：将CloudFront “多域名”改造为”多租户”架构](<https://aws.amazon.com/cn/blogs/china/amazon-cloudfront-deploy-guide-cloudfront-domain-multi-tenant-architecture/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 陈程

亚马逊云科技高级边缘产品架构师，专注于 Amazon CloudFront、AWS WAF、AWS Shield、AWS Global Accelerator、Amazon Route 53 等产品和服务。

* * *

## 亚马逊云科技中国峰会

Agentic AI 代码秀、Hands-on Lab、Chalk Talk 白板推演——为技术构建者准备的深度内容。 [](<https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p3&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d>) |   
---|---
