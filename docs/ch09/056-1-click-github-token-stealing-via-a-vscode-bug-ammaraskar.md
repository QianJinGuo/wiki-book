# 1-Click GitHub Token Stealing via a VSCode Bug — ammaraskar 2026

## Ch09.056 1-Click GitHub Token Stealing via a VSCode Bug — ammaraskar 2026

> 📊 Level ⭐⭐ | 11.3KB | `entities/vscode-github-token-stealing-1-click-pwn-ammaraskar-2026.md`

# 1-Click GitHub Token Stealing via a VSCode Bug

> **Background**：本文档基于对 [ammaraskar 博客原文](https://blog.ammaraskar.com/github-token-stealing/) 的直接抓取与提炼，原始研究由独立安全研究员 Ammar Askar 在 2026 年发布。文章披露了 VSCode / github.dev 的一个 webview + postMessage 跨域访问控制缺陷，允许攻击者通过构造恶意 URL 一次性窃取受害者的 GitHub Personal Access Token（PAT），并进一步获得仓库、PR、CI 完整访问权限。

## 漏洞核心

VSCode 在 webview 与扩展 host 之间使用 `postMessage` API 通信。ammaraskar 发现，github.dev（VSCode for the Web）在某些路径下没有正确实施 cross-origin policy，恶意页面可以通过 iframe + postMessage 把 GitHub PAT 发送回攻击者控制的服务器。整个攻击链只需要受害者点一次链接。

## 攻击链拆解

1. 攻击者构造一个恶意 URL，指向攻击者控制的 webview 内容
2. URL 利用 VSCode 启动 github.dev 时 session cookie 携带的特性
3. 受害者点击链接后，github.dev 在 iframe 中加载恶意内容
4. 恶意内容通过 postMessage 读取当前 session 的 GitHub PAT
5. PAT 通过 fetch() / image beacon 发送到攻击者服务器
6. 攻击者使用 PAT 访问受害者所有 GitHub 仓库、PR、CI workflow

关键技术点：VSCode 的 webview 沙箱 + postMessage origin 验证缺失。

## 影响范围

- 任何在浏览器中打开 github.dev 链接的 GitHub 用户
- 拥有 `repo`、`workflow`、`admin:org` 等 PAT 权限的开发者尤甚
- 攻击者获得 PAT 后可：创建/修改/删除仓库、修改 CI workflow（supply chain 攻击）、读取私有 issue

## 责任披露时间线

- 漏洞发现 → GitHub Security 报告
- 修复版本发布
- CVE 分配（具体编号见原文）
- 公开披露

## 防御建议

- 立即轮换 GitHub PAT
- 启用 GitHub 的 IP allowlist 功能（针对 PAT）
- 考虑使用 GitHub App 而非 PAT（更细粒度权限 + 自动轮换）
- 审查 CI workflow 是否被插入恶意步骤
- 监控 GitHub audit log 中的异常 token 使用

## 与本 wiki 其他实体的关联

- **Checkmarx Jenkins Plugin Supply Chain Attack** — 类似路径：CI/plugin 供应链投毒
- **Bleeding Llama Ollama Memory Leak** — 同为 2026 年披露的高危 AI 基础设施漏洞
- **Claw Chain OpenClaw 链式漏洞** — 同为研究型多漏洞链披露
- **Autonomous Vulnerability Hunting with MCP** — MCP 驱动的自动化漏洞狩猎趋势

## 相关实体
- [Auditing Gitlab Cicd Kill Chain Black Hills 2026](../ch05/082-ai.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/vscode-github-token-stealing-1-click-pwn-ammaraskar-2026.md)

- [bagel — fleet 级 secret scanning 守护开发工作站](../ch12/055-bagel-fleet-secret-scanning.html)

## 深度分析

**1. postMessage 信任链的根因漏洞 — 攻击者利用 webview 的 `did-keydown` 消息机制模拟用户键盘输入**

VSCode webview 的 `did-keydown` 事件设计初衷是让主窗口能统一处理 webview 内的键盘事件，以提供无缝的用户体验。然而 ammaraskar 发现，webview 内运行的恶意脚本可以反向构造 `keydown` 事件并通过 `postMessage` 发送给主窗口，冒充真实用户行为。攻击者通过构造特定按键序列（Ctrl+Shift+P → `developer: install extension from location` → Enter），可以在受害者不知情的情况下安装任意扩展。代码证据显示 webview 内的 `contentWindow.addEventListener('keydown', handleInnerKeydown)` 直接将原始 KeyboardEvent 转发给 host，且没有任何来源验证机制。

**2. PAT 权限范围不精确 — github.dev 传递的 OAuth token 并未限定在特定仓库**

文章明确指出：`github.com` POST 过来的 token **不是 scoped to the particular repo you interacted with**，即拥有访问用户所有仓库的完整权限。这意味着即使受害者只在某个公开仓库点击了 github.dev 链接，攻击者拿到的 token 也能读写其所有私有仓库（包括 CI workflow）。这是 Token 窃取导致供应链攻击的核心原因。

**3. VSCode 的防御纵深（Defense-in-Depth）限制了更严重的后果 — CSP + DOMPurify 有效阻止了 Markdown XSS → RCE 的进一步利用**

ammaraskar 特别提到，VSCode 使用 `script-src 'none'` 的严格 CSP 和 DOMPurify 来净化渲染内容。如果 Markdown 预览存在 XSS，攻击者可能实现 one-click RCE（通过诱骗用户点击恶意 extension 链接）。但由于 CSP 阻止了内联脚本执行，这一利用路径被切断。这是设计层面安全最佳实践的正面案例。

**4. 本地工作区扩展（Local Workspace Extension）绕过信任验证 — 攻击链从 webview 键盘劫持升级到任意代码执行**

VSCode 1.89 引入的本地工作区扩展功能允许在 `.vscode/extensions/` 目录直接安装扩展，绕过受信任发布者的确认对话框。攻击者利用这一机制配合恶意 `package.json` 中的 keybinding 贡献来调用 `workbench.extensions.installExtension` 并设置 `skipPublisherTrust: true`，成功安装未经验证的扩展获取代码执行权限。

**5. 披露时间线揭示快速响应与行业实践问题 — MSRC 历史上对 VSCode 漏洞响应质量存疑**

ammaraskar 在 2026 年 6 月 2 日下午公开披露漏洞，GitHub 安全团队在数小时内（6月3日）即收到临时修复 PR。修复方案包括：在 web VSCode 打开 notebook 时增加确认对话框，并禁止通过命令跳过受信任发布者验证。相比之下，作者指出此前向 MSRC 报告另一个 VSCode 漏洞时，MSRC 静默修复且未给予 credited，标记为"无安全影响"，这促使作者转向全面公开披露策略。

## 实践启示

**1. 立即行动 — 清除 github.dev site data 以消除攻击路径**

如果用户从未使用过 github.dev，存在一个必须点击的初始登录对话框，此时可以离开页面。但一旦完成该对话框并在本地存储了数据，任何互联网链接都可以将用户重定向到攻击页面。建议在 Chrome 中清除 github.dev 的站点数据（通过 URL 栏图标 → Cookies and site data → Manage on-device site data → 删除所有相关域名）。这是唯一有效的终端用户缓解手段。

**2. 用 GitHub App 替代 PAT — 获得细粒度权限与自动轮换**

传统 PAT 的权限是全局的，一旦泄露影响范围覆盖用户所有有权限的仓库。GitHub App 可以针对每个仓库设置独立权限，且支持自动 token 轮换和安全审计。开发者和企业应优先为第三方工具（CI、监控、Dify/Retool 类平台）配置 GitHub App 而非 PAT 。

**3. IDE 扩展安全 — 仅从受信任发布者安装扩展，周期性审计已安装扩展列表**

该漏洞的最终落脚点是 VSCode 扩展安装机制。用户应：(a) 仅从 Marketplace 认证发布者安装扩展；(b) 收到"推荐扩展"通知时仔细甄别，不盲目接受；(c) 定期审计 `.vscode/extensions.json` 和已安装扩展列表，删除未知依赖。发布者信任对话框是最后一道防线，不应被键盘劫持绕过 。

**4. CI/CD supply chain 防御 — 审查 workflow 文件，启用 workflow 审批机制**

攻击者获取 PAT 后可修改 CI workflow 注入恶意步骤（如窃取 secrets、上传 repo 内容到外部服务器）。建议：(a) 对所有 workflow 文件实施代码审查，不允许自动合并；(b) 启用 GitHub Environment protection rules，要求特定 reviewers 审批后才可执行 workflow；(c) 监控 audit log 中的异常 token 使用和 workflow 修改记录 。

**5. VSCode extension 开发者安全设计 — 实现 postMessage origin 验证，对 `did-*` 事件实施输入清理**

对于 VSCode 扩展开发者：(a) 所有 `postMessage` 监听器必须验证 `event.origin` 或使用 `event.source === expectedWindow`；(b) 敏感命令（如 `workbench.extensions.installExtension`）应要求明确用户交互确认，不接受纯自动化触发的安装请求；(c) 对 webview 中收到的键盘事件进行来源校验，拒绝来自非预期 iframe 的 `did-keydown` 等消息。微软的临时修复也已表明方向：禁止通过命令跳过受信任发布者检查 。

## 关联阅读

→ [Checkmarx Jenkins Plugin Compromised In New Supply Chain Attack](../ch01/415-checkmarx-jenkins-plugin-compromised-in-new-supply-chain-att.html) — Jenkins 插件供应链投毒事件，攻击路径与本漏洞相似：均通过依赖链的信任假设进行初始代码执行，代表了近两年最活跃的 supply chain 攻击向量之一。

→ [Claw Chain Cyera Research Unveil Four Chainable Vulnerabilities In Openclaw](ch09/072-claw-chain-cyera-research-unveil-four-chainable-vulnerabili.html) — OpenClaw 多漏洞链披露，与本文同为 2026 年安全研究，展示了从 webview XSS 到 RCE 的链式利用完整路径，对理解 IDE/扩展攻击面具有重要参考价值。

---

