# LLMReaper - DOM Based AI Conversation Exfiltration via Browser Extensions

## Ch01.586 LLMReaper - DOM Based AI Conversation Exfiltration via Browser Extensions

> 📊 Level ⭐⭐ | 7.8KB | `entities/blog-ai-chat-llmreaper.md`

# LLMReaper - DOM Based AI Conversation Exfiltration via Browser Extensions

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/blog-ai-chat-llmreaper.md)

## 摘要

LLMReaper 是由安全研究员 thewhiteh4t 发布的 PoC 项目，演示了恶意浏览器扩展如何在用户完全无感知的情况下，实时窃取 ChatGPT、Claude、Gemini 三大主流 LLM 平台上的对话内容。它利用浏览器标准 API `MutationObserver` 监听 DOM 变化，结合 Manifest V3 服务 worker 完成跨域外传，整个过程无需任何额外权限请求即可工作。

## 核心要点

- 三大 LLM 平台（ChatGPT、Claude、Gemini）都把用户对话和模型回复渲染在 DOM 中，任何拥有 `read and change all your data on websites you visit` 权限的扩展都能读取
- 攻击利用浏览器标准 `MutationObserver` API 监听 DOM 变化，无需恶意权限，用户授权行为本身已成为攻击入口
- 关键技巧：通过检测"停止生成按钮"（aria-label="Stop response" 等）的状态变化判断响应是否结束，避免流式输出造成的重复抓取
- MITRE ATT&CK 映射：T1036 伪装、T1056.003 Web Portal Capture、T1041 C2 通道外传、T1195 供应链入侵、T1555.003 凭据窃取
- 真实供应链攻击事件：2024-12 Cyberhaven 攻击影响 260 万用户，2025-02 GitLab 报告 16 个恶意扩展影响 320 万用户，2026-04 100+ 扩展盗取 Google OAuth2 Token

## 深度分析

### 攻击面的根本问题：浏览器扩展模型设计

LLMReaper 揭示的不是某个 LLM 平台的漏洞，而是 Chrome/Firefox 扩展权限模型的固有问题。`"read and change all your data on websites you visit"` 这一权限描述对绝大多数合法扩展（密码管理器、广告拦截、翻译工具）都是必需的，普通用户在授权时根本无法判断哪些扩展会滥用此权限。

攻击者只需要伪装成正常的 AI 辅助工具（如"AI 提示词优化器"、"ChatGPT 导出工具"），用户主动安装并授权后，扩展就在后台静默工作。**这构成了一类新的、几乎无法通过技术手段防御的攻击向量**——既不是漏洞（权限是正常授权的），也不是社会工程（扩展本身有正当功能），而是两者的灰色叠加。

### MutationObserver 的滥用与防御困境

`MutationObserver` 是 W3C 标准 API，原本用于扩展开发者观察页面变化（如检测 SPA 路由变化、DOM 元素添加等）。但它同样可以被滥用来监控 LLM 平台的流式输出。PoC 中的关键技巧是：

1. 监听 `document.body` 的 `childList` 和 `subtree` 变化
2. 通过 `STOP_SIGNALS`（停止按钮的 aria-label 或 data-testid）判断响应是否结束
3. 响应结束后等待 150ms（避免捕获未完成片段）再调用 exfil 函数

这种基于按钮状态变化而非内容捕获的方式，比简单的轮询或 `innerText` 监听更精准——既不会重复抓取，也不会遗漏流式输出。

### 服务 Worker 的 Same Origin Policy 绕过

LLMReaper 的外传设计避开了 SOP 限制：内容脚本（content.js）只负责抓取 DOM 并通过 `chrome.runtime.sendMessage` 把数据发给 Service Worker（background.js），由 Service Worker 在扩展上下文中发起 fetch 请求外传到攻击者服务器。这种分离设计的关键好处是：

- Content Script 受页面 SOP 限制，无法直接 fetch 任意域
- Service Worker 运行在 `chrome-extension://` 上下文，拥有扩展的全部权限
- 两者通过消息传递解耦，单个组件被检测不会暴露整个攻击链路

### LLM 对话作为新的"凭证泄露通道"

LLMReaper 的后端用正则表达式在抓取的对话中匹配 API Key、Token、密码等模式。这标志着 LLM 对话本身已经成为一种"未加密的凭证通道"——用户为了调试代码或修复配置，会主动把敏感数据粘贴进对话框，而这些数据随即被扩展捕获。

这是 SaaS 时代从未有过的问题：过去我们只在邮件、Slack 工单、代码注释中泄露密钥；现在 LLM 对话成为新的高密度泄露场景，且用户对 LLM 的"对话私密"假设进一步降低了警惕。

### 与历史供应链攻击的对照

LLMReaper 的技术与 2024-2025 年 Chrome Web Store 大规模恶意扩展事件使用相同模式：合法外观 + 静默后台行为。区别在于 LLMReaper 专门针对 LLM 平台的 DOM 结构做了精细化适配（每个平台的 selector 解析逻辑独立实现），这意味着：

- 攻击开始从"通用 LLM 平台"向"特定厂商定向化"演进
- 防御方需要为每个 LLM 平台维护不同的 DOM 完整性校验机制
- LLM 厂商的"对话 DOM 结构"实际上已经成为一种新的攻击面，需要在安全设计中显式考虑

## 实践启示

### 对个人用户

- **多浏览器隔离**：使用 Chrome 处理日常工作，使用单独的浏览器配置文件访问 LLM 平台，或反之
- **扩展最小化**：定期审计已安装扩展，删除不使用的或来源可疑的；尤其警惕"AI 增强"类工具
- **永远不要把 API Key、Token、生产配置粘到 LLM 对话框**：即使是"问 AI 怎么用这个 Key"也不行——扩展可能在你按下发送前就已经捕获
- **把 LLM 对话视为明文通道**：心理模型应等同于明文 HTTP，而非加密的 HTTPS

### 对企业安全团队

- **将浏览器扩展纳入 SOC 监控**：Chrome Enterprise Policy 可以强制控制扩展安装白名单，禁止未经审批的扩展读取 AI 平台域
- **LLM 对话纳入 DLP（数据丢失防护）扫描**：在客户端或网络层监控常见 LLM 平台域的 POST 请求体，检测敏感模式
- **安全意识培训加入"扩展供应链"案例**：2024-12 Cyberhaven 攻击是生动的教学材料
- **考虑本地 LLM 替代**：对高度敏感场景，部署内部 LLM 实例，避免数据经过任何第三方域

### 对 LLM 平台厂商

- **考虑非 DOM 的渲染方案**：把对话内容放在 Shadow DOM 内部或使用 Canvas 渲染，但这会牺牲可访问性和 SEO
- **CSP（Content Security Policy）强化**：限制第三方脚本对对话容器的访问，但这与扩展兼容性冲突
- **用户教育**：在用户首次粘贴长文本时弹出风险提示（类似密码管理器的钓鱼检测）
- **会话 ID 与内容解耦**：让扩展即使能读取 DOM 也无法关联到具体用户身份

### 对安全研究社区

- LLMReaper 标注了 MITRE ATT&CK 编号，这为检测规则编写提供了框架
- MutationObserver 滥用可被 EDR（终端检测与响应）通过行为模式识别（如"长时间 high-frequency DOM observation on LLM domains"）
- Shadow DOM + CSP 的组合可能成为未来对抗此类攻击的标准防御

## 相关实体

- `Cve 2026 20182 Cisco Sd Wan Vhub Bypass` — 类似的概念（浏览器扩展供应链攻击）
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — 安全工程是 harness 的一部分
- `Shub Reaper Macos Stealer Attack Chain` — 类似命名（macOS stealer）的攻击链
- `Llmshare Using Shared Chatbot Pages To Distribute Malware 20260606` — LLM 相关恶意软件分发
- `Zapocalypse The Attack Chain That Could Have Hijacked Zapier 20260606` — AI 平台攻击链分析
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/blog-ai-chat-llmreaper.md)

---

