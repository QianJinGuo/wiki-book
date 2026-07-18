# Claude Code 静默识别中国 API 路由

## Ch09.075 Claude Code 静默识别中国 API 路由

> 📊 Level ⭐⭐ | 8.9KB | `entities/claude-code-china-api-router-fingerprint.md`

# Claude Code 静默识别中国 API 路由

> Claude Code 通过 ANTHROPIC_BASE_URL 静默检测自定义 API 路由，针对中国代理和时区嵌入隐藏标记。v=7 c=8 s=4 vxc=56

## 摘要

Vincent Schmalbach 通过逆向工程发现，Claude Code 从 v2.1.91 开始嵌入了一个隐蔽的 API 路由检测机制。当用户通过 `ANTHROPIC_BASE_URL` 环境变量配置自定义端点时，Claude Code 会将请求的目标域名与一个包含 147 条中国相关域名的编码列表和 11 个中国 AI 服务商关键词进行匹配，同时检查本地时区是否为 `Asia/Shanghai` 或 `Asia/Urumqi`。基于这些信号，Claude Code 会在模型上下文的日期行中嵌入不可见的标记——通过替换英文撇号为不同 Unicode 变体（`'` / `'` / `ʼ` / `ʹ`）和改变日期分隔符（`-` → `/`）来编码路由信息。该机制隐蔽、未经文档说明，且自 v2.1.91 起历经多个版本保持存在。

## 核心要点

1. **检测触发条件**：`ANTHROPIC_BASE_URL` 被设置为非 `api.anthropic.com` 的自定义端点
2. **三层信号融合**：域名匹配（147 条中国相关域名列表） + 关键词匹配（11 个中国 AI 服务商名称） + 时区检测（Asia/Shanghai 或 Asia/Urumqi）
3. **隐藏标记方式**：日期行 `Today's date is YYYY-MM-DD.` 中的撇号替换为 Unicode 变体 + 日期分隔符从 `-` 改为 `/`，构成 4 种信号组合
4. **编码保护但不加密**：域名列表和关键词使用 base64 + XOR 91 编码，并非真正加密，仅防纯文本字符串搜索
5. **持续存在**：该行为自 v2.1.91 引入，在 v2.1.92、v2.1.196 中仍然存在，函数名因 minify 改变但行为不变
6. **并非 VPN 检测**：检测基于 ANTHROPIC_BASE_URL 和本地时区，不涉及 IP 查询、网络接口扫描或 VPN 进程检测

## 深度分析

### 技术机制详解

检测逻辑嵌入在 Claude Code 的 minified JavaScript bundle 中，由 `currentDate` 字段引用的辅助函数执行。该函数做了三件事：

1. **读取 `process.env.ANTHROPIC_BASE_URL`**：若缺失或指向 `api.anthropic.com`，返回普通日期行（无标记）
2. **域名/关键词匹配**：解码两份嵌入列表——147 条域名字段（从 `cn` 到腾讯云、阿里云、字节跳动等中国互联网/云域名，以及 `anyrouter.top`、`proxyai.com`、`yunwu.ai` 等代理/路由域名）和 11 个关键词（`deepseek`, `moonshot`, `minimax`, `zhipu`, `bigmodel`, `baichuan`, `stepfun`, `01ai`, `dashscope`, `volces`）
3. **时区检测**：通过 `Intl.DateTimeFormat().resolvedOptions().timeZone` 检查是否为 `Asia/Shanghai` 或 `Asia/Urumqi`

组合信号产生 4 种标记强度：纯域名匹配（`'`）、纯关键词匹配（`ʼ`）、域名+关键词双重匹配（`ʹ`）、叠加中国时区时分隔符切换为 `/`。

### 隐蔽性设计分析

该机制的隐蔽性体现在多个层面。标记被**嵌入模型上下文中而非 telemetry 事件**中——这意味着它绕开了正常的隐私政策和数据收集声明。如果第三方路由转发请求到上游，Anthropic 可以看到这个标记。如果路由不转发，标记仍然存在于发送给路由的 prompt 中。

编码方式（base64 + XOR 91）的意图不是加密而是防 casual search —— 足够阻挡简单的字符串搜索，但不足以阻止有目的的逆向工程。这是典型的"security by obscurity"，不是为了真正的安全而是为了降低被偶然发现的概率。

对普通用户来说，`Today's date is 2026-06-30.` 和 `Today’s date is 2026/06/30.` 在视觉上几乎没有区别——只有仔细对比 Unicode 代码点才能发现 `'`（U+2019）vs `'`（U+02BC）的差异。这种字节级而非视觉级的标识，使其在常规审查中完全不可见。

### Anthropic 的动机分析

Anthropic 有合理的商业和技术理由关注非官方 API 路由。影子 API 销售商、账号池、订阅转售和区域绕过市场正在销售未经授权的模型访问。这些路由可能被用于欺诈、账号限制规避、模型蒸馏或从产品未正式提供区域的访问。Anthropic 可以合理地试图检测和阻止这些行为。

但问题在于实现方式不透明。分析认为，如果 Anthropic 想阻止未授权的路由，它可以直接阻止。如果它想检测滥用，可以文档化检测类别。如果它想为调查在模型上下文加水印，可以说 prompt 可能包含路由元数据。**不应该做的是让一行模型上下文看起来语义中性，而标点携带路由元数据**。

### 信任与透明度问题

这一发现引发的信任问题超越了中国 API 路由本身。它表明 Claude Code 在没有任何用户告知的情况下，在模型上下文中嵌入了可被用于身份识别的隐蔽标记。这打破了用户对本地 CLI 工具的基本信任假设——即工具只做它文档化了的事情。

该机制与正常 telemetry 有本质区别：正常 telemetry 有名称、schema 和策略表面；而路由信号隐藏在模型上下文中，不是可见的 Claude Code 警告，不是名为"router detection"的设置，也不是正常 analytics 事件。其设计本质上是**隐蔽的（covert）**而非**透明的（transparent）**。

### 更广泛的行业影响

此事件对 AI 工具行业的透明度标准提出了质疑。随着 AI Agent（如 Claude Code、Codex、Cursor）逐渐深入开发者工作流，它们获得了越来越高的系统权限和网络访问能力。Claude Code 的 ANTHROPIC_BASE_URL 机制可能只是冰山一角——其他 AI Agent 工具中是否也存在类似的隐蔽检测机制？行业需要建立关于 Agent 行为的透明度标准。

## 实践启示

1. **审计 Agent 工具的隐式行为**：对于集成到开发工作流的 AI Agent 工具，定期审计其网络行为、环境变量读取和文件系统操作。不要假设工具只做其文档中描述的事情。

2. **控制 ANTHROPIC_BASE_URL 的使用**：如果必须使用自定义端点（企业网关、代理等），了解 Claude Code 会通过日期行嵌入标记。考虑使用网络监控工具验证发送给端点的实际 prompt 内容。

3. **监控工具版本间的行为变化**：该机制从 v2.1.91 引入，之前的版本没有此行为。对关键工具版本更新时，使用 diff 工具分析 bundle 变化。

4. **推动透明度标准**：在团队或社区层面推动 AI Agent 工具的透明度清单——工具应该声明它在启动时读取了哪些环境变量、发送了哪些数据、以及在模型上下文中嵌入了什么信息。

5. **非默认 API 路由的安全考量**：使用自定义 API 端点时，不仅面临该端点能看见 prompt 的风险，prompt 中嵌入的隐蔽标记也可能通过端点转发被原服务商识别。建议加密敏感提示或使用可信端点。

## 相关实体

- [Anthropic Skill Stack 架构](../ch01/1292-anthropic.html) — Anthropic 的 Agent 工程架构背景，帮助理解 Claude Code 的底层设计
- [Claude Code 治理软规则](../ch03/076-claude-code.html) — 探讨 Claude Code 行为的治理与透明度
- [OpenClaw 安全与功能增强实践](../ch11/225-openclaw.html) — AI 工具的安全实践案例
- [AI Gateway vs MCP Gateway 安全须知](../ch11/079-ai-gateways-vs-mcp-gateways-what-security-teams-need-to-kno.html) — API 路由与安全网关的讨论，与本实体的 API 路由指纹识别直接相关
- [组件过期模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-component-expiry-evidence.md) — 探讨 AI 系统中的信任与安全性设计模式

## 参考来源

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-china-api-router-fingerprint-vincentschmalbach.md)

---

