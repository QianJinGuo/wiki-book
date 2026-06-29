# LLMReaper - DOM Based AI Conversation Exfiltration via Browser Extensions

## Ch01.316 LLMReaper - DOM Based AI Conversation Exfiltration via Browser Extensions

> 📊 Level ⭐⭐ | 12.1KB | `entities/llmreaper-dom-based-ai-conversation-exfiltration-via-browser-5ee512.md`

## LLMReaper - DOM Based AI Conversation Exfiltration via Browser Extensions

## 摘要

LLMReaper 是 thewhiteh4t 发布的概念验证（PoC），演示恶意 Chrome 扩展如何在用户毫不知情的情况下实时读取 ChatGPT、Claude、Gemini 等 LLM 聊天界面上的提示词与回答。攻击核心是利用浏览器标准的 `MutationObserver` API 监听 DOM 变化，配合合理的扩展权限（"read and change all your data on websites you visit"），再经由 service worker 把数据 POST 到攻击者控制的服务器。该项目映射到 MITRE ATT&CK 框架的多个 technique，是企业安全意识教育的实用工具。

## 核心要点

- **任何扩展都能读取 LLM 对话**：当用户给浏览器扩展授予站点权限时，扩展就可以读取该页面 DOM 的全部内容——包括用户提示词与 LLM 回答，因为这些内容正是通过 DOM 渲染的。
- **历史供应链攻击持续重演**：2024 年 12 月 Cyberhaven 扩展供应链攻击波及 260 万用户；2025 年 2 月 GitLab 威胁情报团队发现 16 个恶意 Chrome 扩展影响 320 万用户；2026 年 4 月发现 100+ Chrome 扩展窃取 Google OAuth2 Bearer tokens 与 Telegram 会话。
- **PoC 实现细节**：包括 chrome_ext（manifest.json、popup.html、popup.js、scripts/background.js、scripts/content.js）与后端 llmreaper.py，兼容 Manifest V3，minor 修改即可移植到 Firefox。
- **`MutationObserver` 是关键技术**：标准浏览器 API 用于监听 DOM 实时变化，能同时捕获 prompt 提交与 LLM response 流式输出事件。
- **响应完成检测巧思**：直接周期性查询会捕获到大量重复与片段，三个平台（ChatGPT、Claude、Gemini）都共享"停止按钮（stop button）"特征——它在响应生成期间存在，完成后状态变化；据此可准确捕获整段响应。
- **绕过 Same Origin Policy**：把 fetch 调用放在 service worker（background.js）而非 content script，避免被浏览器 CSP/SOP 直接拦截。
- **MITRE ATT&CK 映射**：T1036 Masquerading、T1056.003 Web Portal Capture、T1041 Exfiltration Over C2 Channel、T1195 Supply Chain Compromise、T1555.003 Credentials from Web Browsers。

## 深度分析

### 为什么 LLM 对话特别脆弱

用户在与 ChatGPT/Claude/Gemini 交互时，普遍假设对话只在"我与 AI"之间。但浏览器扩展一旦获得站点权限，就能通过 DOM 读取页面上的全部内容——而 LLM 对话正是通过 DOM 实时渲染的。

"read and change all your data on websites you visit" 这一权限描述看起来无害且为很多合法扩展所必需，普通用户在安装扩展时几乎不会特别留意。同一权限可以被恶意扩展在后台滥用——这正是 LLMReaper 演示的核心攻击面。

### 供应链攻击的持续重演

LLMReaper 不是个例，而是浏览器扩展供应链攻击长期模式的最新演绎：

| 时间 | 事件 | 影响范围 |
|------|------|----------|
| 2024 年 12 月 | Cyberhaven Chrome 扩展供应链攻击 | 约 260 万用户受影响，34+ 扩展波及 |
| 2025 年 2 月 | GitLab 威胁情报团队发现 16 个恶意扩展 | 至少 320 万用户 |
| 2026 年 4 月 | 100+ Chrome 扩展窃取 Google OAuth2 tokens | 影响范围跨 Telegram + Google 生态 |

扩展作为攻击载体的吸引力在于：分发渠道（Chrome Web Store）拥有巨大触达，用户对工具型扩展的安装意愿极高，社会工程学很容易绕过普通用户的警觉。

### PoC 架构与实现

LLMReaper 由两部分组成：

**前端扩展（chrome_ext）**：
- `manifest.json`：声明 content scripts、service worker 与权限（注意：本 PoC 实际上不需要任何特殊权限）
- `popup.html` / `popup.js`：扩展外观，看起来像正常工具
- `scripts/content.js`：注入到 ChatGPT/Claude/Gemini 页面，使用 `MutationObserver` 监听 DOM 变化，针对不同平台做定制解析
- `scripts/background.js`：service worker，负责实际把捕获数据 POST 到攻击者后端

**后端（llmreaper.py）**：
- FastAPI 服务器，接收 POST 请求
- 通过 regex 模式匹配检测对话中潜在的 secret（API key、token、密码等）
- 在 UI 中显示对话与 secret 检测结果

### `MutationObserver` 与响应完成检测

PoC 的关键技术点：

1. **使用 `MutationObserver` 监听 DOM 变化**——这是浏览器标准 API，合法扩展也在使用，不是"恶意行为"特征
2. **平台定制的选择器**：通过各种 selector query 匹配用户 prompt 与 LLM response 元素
3. **响应完成检测的巧思**：三个平台都共享"停止按钮"特征，它在响应生成期间存在、完成时状态变化；据此可在响应完整后触发捕获（150ms debounce 防止抓到不完整片段）

代码示例：
```js
const STOP_SIGNALS = {
  ChatGPT: 'button[data-testid="stop-button"]',
  Claude: 'button[aria-label="Stop response"]',
  Gemini: 'button[aria-label*="Stop"]',
};
```

### Same Origin Policy 的绕过

把 fetch 调用放在 service worker（background.js）而不是 content script。理由是 content script 受页面 CSP 限制、直接 fetch 外部域名会被 SOP 拦截；service worker 则有扩展自己的网络权限，能绕过这些限制。

### 攻击载荷结构

每次捕获的 payload 结构：
```js
{
  platform: 'Claude' | 'ChatGPT' | 'Gemini',
  meta: {
    title: 页面标题（也是 chat 标题）,
    user: 用户名（Gemini 时还包括 Gmail ID）,
    timestamp: ISO 字符串,
  },
  conversation: { user_prompt, assistant_response }
}
```

通过比对 `JSON.stringify(payload) !== lastSentPayload` 避免重复发送；service worker 收到 `chrome.runtime.sendMessage({ action: "exfiltrate", data })` 后 POST 到 `SERVER_URL`（PoC 用 localhost，生产可换 ngrok/cloudflare tunnel）。

### MITRE ATT&CK 框架映射

LLMReaper 演示的技术完整对应到 MITRE ATT&CK：

| Technique | ID | 描述 |
|-----------|-----|------|
| Masquerading | T1036 | 扩展呈现合法外观，后台静默捕获对话 |
| Web Portal Capture | T1056.003 | 被动读取 DOM 中的 prompt 与 response |
| Exfiltration Over C2 Channel | T1041 | 捕获的对话通过 service worker POST 到攻击者服务器 |
| Supply Chain Compromise | T1195 | 恶意扩展通过合法浏览器商店分发 |
| Credentials from Web Browsers | T1555.003 | 用 regex 在对话内容中检测 API key、token、密码 |

## 实践启示

1. **将 AI 对话视为未加密信道**：不要在 ChatGPT/Claude/Gemini 对话中粘贴凭证或敏感数据；这些对话与邮件、Slack 一样应该被视为可被中间人/旁观者读取的通信。
2. **多浏览器 profile 提供隔离**：使用不同 profile 隔离工作、敏感操作、测试场景，限制单一恶意扩展的影响半径。
3. **定期审计浏览器扩展**：及时移除不再使用或来源可疑的扩展；对新安装的扩展保持警惕——尤其是工具型扩展（"AI 助手"、"截图"、"OCR"、"翻译"等），它们往往被攻击者用作伪装。
4. **企业安全意识培训**：LLMReaper 是优秀的实战教学工具——可以在内部 workshops 中演示给工程师、安全团队，让他们亲手复现攻击过程，比抽象的"不要乱装扩展"更有说服力。
5. **关注 AI 浏览器的新型风险**：thewhiteh4t 在原文中也提及"AI-based browsers"正在快速涌入市场——这类浏览器本身就以高权限读取大量页面数据，攻击面比传统浏览器更大，企业在采用时需要额外的安全评估。
6. **防御者视角的检测思路**：检测端可观察扩展的非常规行为模式——content script 注册到 LLM 平台域名、扩展触发频繁的 `chrome.runtime.sendMessage` 与外部 POST、网络层出现 LLM 平台用户内容出站流量等异常。

## 相关实体

- [Harness Engineering 概念](/ch05-005-一文带你弄懂-ai-圈爆火的新概念-harness-engineering/) — AI 工程实践
- [Agent 记忆系统](/ch01-707-存之有序-治之有矩-agent-记忆系统的工程实践与演进/) — Agent 系统的工程实践
- [Claude Code 源码机制](/ch01-734-两万字详解claude-code源码核心机制/) — AI 工具架构
- [Karpathy Vibe Coding 访谈](/ch04-125-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering/) — Agentic Engineering 范式
- [OpenClaw 完整指南](/ch01-642-openclaw-完全指南-这可能是全网最新最全的系统化教程了-3-2w字-建议收藏/) — AI 工具教程
- [天猫 AI 编码实战](/ch09-029-天猫新品营销技术团队ai编码实战指南-上/) — 企业 AI 编码案例
- [What My Privacy and Security Stack Actually Looks Like](/ch12-019-what-my-privacy-and-security-stack-actually-looks-like/) — 个人安全栈案例
- [Canvas Hackers ShinyHunters Domain Suspended](/ch12-035-canvas-hackers-shinyhunters-say-their-official-domain-was-su/) — 攻击者基础设施案例

> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llmreaper-dom-based-ai-conversation-exfiltration-via-browser-5ee512.md)

---

