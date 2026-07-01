# LLMReaper: 浏览器扩展的对话窃取攻击

## Ch12.085 LLMReaper: 浏览器扩展的对话窃取攻击

> 📊 Level ⭐⭐ | 5.5KB | `entities/llmreaper-dom-conversation-exfiltration.md`

# LLMReaper: 浏览器扩展的对话窃取攻击

> **Background**: 本文档基于对外部技术来源的评分入库建立，v×c=8×8=64。

## 核心要点

演示浏览器扩展通过 DOM 访问静默窃取 LLM 对话的安全研究，涵盖 MutationObserver 攻击向量和已知供应链事件

---

## 相关实体
- [飞来汇借助 Aws Security Agent 构建跨境支付应用的智能安全防线](ch04/503-agent.md)
- [Powering Agentic Ai Sales Strategy With Amazon Bedrock Agent](ch04/025-powering-agentic-ai-sales-strategy-with-amazon-bedrock-agent.md)
- [Novee Security How To Get A 100 Conference Acceptance Rate The No](https://github.com/QianJinGuo/wiki/blob/main/entities/novee-security-how-to-get-a-100-conference-acceptance-rate-the-no.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/llmreaper-dom-based-ai-conversation-exfiltration-via-browser-5ee512.md)

## 深度分析

**1. MutationObserver 是双刃剑：合法功能与隐蔽窃取的根源**

MutationObserver 是 W3C 标准 API，设计初衷是让 Web 应用监听 DOM 变化以实现响应式 UI。然而 LLMReaper 证明了这一"合法功能"可直接转化为实时监控工具。攻击者只需几行 JS 代码订阅 `document.body` 的 `childList` 和 `subtree` 变化，即可在用户无感知的情况下捕获所有对话内容。这一发现意味着：任何依赖 DOM 渲染的 AI 聊天平台（Claude、ChatGPT、Gemini 等）都存在原生漏洞，而非某一平台的实现缺陷。

**2. 权限申请具有高度欺骗性：用户难以辨别风险**

LLMReaper 在 Manifest V3 配置中无需申请任何特殊权限，仅依赖 `"read and change all your data on websites you visit"` 这一广泛授权。此权限在浏览器扩展生态中极为常见，用户早已习惯性批准。然而同一权限可同时支撑"翻译助手"和"对话窃取"两种功能，用户在安装时几乎无法区分。这种对称性暴露了当前权限模型的根本性缺陷——基于范围的授权无法表达细粒度的意图限制。

**3. 响应完成检测的工程技巧揭示防御思路**

LLMReaper 使用停止按钮（Stop Button）的状态切换来判定流式输出是否完成，而非依赖轮询或定时器。这是一个精妙的工程选择：三大主流平台（ChatGPT、Claude、Gemini）均保留此按钮且行为一致，使其成为可靠的完成信号。这一发现为防御者提供了关键洞察——若能监控 DOM 中特定按钮元素的变化，即可作为检测此类侧信道攻击的潜在锚点。

**4. Service Worker 架构绕过同源策略的安全隐患**

内容脚本（content.js）直接发起网络请求会受同源策略约束，但 LLMReaper 将 exfiltration 逻辑置于 Service Worker 中，利用 `chrome.runtime.sendMessage` 桥接，由后台脚本执行外部 POST。攻击代码因此完全隐藏于浏览器内部，网络流量看起来来自扩展本身而非页面。MITRE ATT&CK T1041（Exfiltration Over C2 Channel）在此得到了具体的技术实现示范。

**5. 供应链攻击已成规模化威胁**

研究列举了三起真实事件：2024 年 12 月 Cyberhaven 扩展供应链攻击影响 260 万用户、2025 年 2 月 GitLab 发现 16 个恶意扩展影响 320 万用户、2026 年 4 月超 100 个恶意扩展同时活动。这些数据表明浏览器扩展生态已成为有组织的攻击面，用户即使保持警惕也难以独善其身——因为零日供应链事件在曝光前无法被个体防御。

## 实践启示

**1. 将 AI 对话视为公开渠道，永远不要输入敏感凭据**

无论是 API Key、密码、Token 还是私有代码/配置，粘贴进 AI 对话框的行为本质上等同于在不信任的信道中传输。安全团队应明确制定政策并培训员工：AI 聊天界面是潜在的攻击目标面，敏感数据必须经过脱敏或使用专用隔离环境。

**2. 定期审计浏览器扩展，遵循最小权限原则**

用户应每季度审查一次已安装扩展，移除长期未使用或来源不明的扩展。对于必须保留的扩展，主动限制其站点访问权限（如使用 Chrome 的"扩展程序管理器"按站点点击启用/禁用）。安全团队可在企业环境推行受控的扩展白名单制度。

**3. 利用浏览器Profiles实现工作隔离**

Chrome、Firefox 等浏览器支持 Profiles 功能，可创建完全独立的浏览器上下文，包括独立的扩展、Cookie 和站点数据。建议将 AI 助手使用限制在专用 Profile 中，与日常浏览（可能安装多种扩展）隔离。这是一个几乎零成本的防御层。

**4. 在安全意识培训中加入浏览器扩展专项模块**

传统的钓鱼/社会工程培训往往忽略扩展攻击面。LLMReaper 类型的 PoC 可直接用于演示，让员工亲眼看到"安装一个看起来无害的扩展后，对话如何在后台被实时窃取"。这类可视化演示比文字警告更能建立行为改变。

**5. 使用 [agent-security-threat-models](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-threat-models.md.md) 框架评估 AI 工作流中的数据流风险**

在引入 AI 工具到业务流程前，应系统性识别数据流经的所有节点（包括浏览器扩展、第三方脚本、API 端点），对照 [Agent Security Threat Models](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-threat-models.md.md) 中的攻击向量矩阵进行威胁建模。这有助于发现单点防御无法覆盖的盲区。

---

*本条目由 LLMReaper 研究论文深度解析生成，2026-06-03*

---

