# CDP Bridge MCP：让 LLM 操作真实浏览器

## Ch01.669 CDP Bridge MCP：让 LLM 操作真实浏览器

> 📊 Level ⭐⭐ | 6.5KB | `entities/cdp-bridge-mcp-real-browser-agent.md`

# CDP Bridge MCP：让 LLM 操作真实浏览器
> CDP Bridge MCP 是一个连接 MCP 客户端与真实浏览器会话的桥接服务。它通过配套的 Chromium 扩展接入浏览器页面，让大模型客户端可以读取标签页、扫描页面、执行 JavaScript、截图、导航和读取 Cookie。

## 核心理念
不同于 Playwright MCP 或 Chrome DevTools MCP 的"新开浏览器实例"模式，CDP Bridge MCP 关注的是让 LLM **直接接管用户正在使用的真实浏览器会话**：

- **复用真实登录态**：连接已打开、已登录的标签页，无需重新登录或搬运 Cookie
- **更适合日常协作**：模型在用户当前页面做读取、分析、点击前判断、脚本执行、截图等交互式任务
- **页面内容对 LLM 友好**：`browser_scan` 对 HTML 做简化，过滤脚本/样式/不可见元素，减少 token 浪费
- **启动链路轻量**：`uvx cdp-bridge@latest` 即可启动，浏览器加载扩展即可连接

## 可用工具
| 工具名 | 说明 |
|--------|------|
| `browser_get_tabs` | 获取已连接标签页列表 |
| `browser_scan` | 扫描当前页面内容，返回简化 HTML 或纯文本 |
| `browser_execute_js` | 在当前标签页执行 JavaScript |
| `browser_switch_tab` | 切换活动标签页 |
| `browser_navigate` | 跳转当前标签页到指定 URL |
| `browser_screenshot` | 获取页面截图 |
| `browser_cookies` | 读取 Cookie |

## 安装与配置
1. 浏览器加载扩展：加载 `src/cdp_bridge/tmwd_cdp_bridge` 文件夹到 Chrome 扩展页面
2. 安装运行：`uvx cdp-bridge@latest`
3. MCP 客户端配置：标准 JSON 配置或 `claude mcp add cdp-bridge uvx cdp-bridge@latest`

## 注意事项
- 需要 Python 3.10+
- 浏览器扩展和 MCP Server 需同时运行
- 页面自动化运行在真实浏览器会话中，只连接受信任的 MCP 客户端

## 项目信息
- GitHub：https://github.com/Unagi-cq/cdp-bridge-mcp
- 受 GenericAgent (GA) 项目影响，使用其浏览器插件框架
- 三黄工作室第二个开源项目

## 相关实体
- [Agentic Ai System Architecture Harness Skill Mcp](ch04/258-skill.md)
- [Browser Harness Github](ch05/069-browser-harness-github.md)
- [Four Browser Automation Tools Comparison](https://github.com/QianJinGuo/wiki/blob/main/entities/four-browser-automation-tools-comparison.md)
- [Cong 30 Fen Zhong Shou Gu Agent Dao Harness Cheng Wei Xin Hou Duan](ch05/009-harness.md)
- [从 30 分钟手搓 Agent到 Harness 成为新后端](ch05/009-harness.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/cdp-bridge-mcp-real-browser-agent.md)

## 深度分析

CDP Bridge MCP 解决了一个被现有浏览器自动化工具忽视的根本性问题：大多数工具（包括 Playwright MCP 和 Chrome DevTools MCP）都假设需要创建一个全新的浏览器实例，这意味着每次运行时都需要重新完成登录、设置偏好等准备工作。在需要模型频繁与真实 Web 应用交互的场景下，这种"每次从零开始"的模式效率极低。CDP Bridge MCP 通过接入用户已有的浏览器会话，实现了状态的复用——这不仅包括登录态，还包括用户的浏览上下文、历史记录和已建立的会话。

`browser_scan` 工具对 HTML 的简化处理体现了对 LLM 工作方式的深刻理解。传统网页抓取往往返回完整的 HTML 源码，其中包含大量的脚本、样式表、隐藏元素和布局信息，这些内容对于理解页面语义毫无价值，却会大量消耗 token 限额。通过过滤这些噪声内容，`browser_scan` 能够返回对 LLM 真正友好的简化内容。在 GPT-4o 等模型仍然受限于上下文窗口的现实约束下，这种 token 优化策略是让模型能够处理复杂长页面的关键。

安全模型的构建是 CDP Bridge MCP 的重要考量。由于系统直接连接用户的真实浏览器会话，必须确保只有受信任的 MCP 客户端才能进行连接。这种设计隐含地假设了一个受控的环境——用户主动选择将某个 MCP 客户端与自己的浏览器会话连接，而非在后台静默进行。这与"浏览器扩展 + MCP Server 双组件必须同时运行"的架构设计相吻合：扩展负责浏览器端的接入控制，而 Server 端则负责验证客户端身份。

与 GenericAgent 项目的渊源揭示了 CDP Bridge MCP 的技术积累路径。GenericAgent 是一个浏览器插件框架，CDP Bridge MCP 复用其插件架构来实现浏览器端的 CDP 协议接入。这种技术复用表明 MCP 生态中的工具正在从"独立项目"向"可组合组件"演进——开发者可以基于现有框架构建新的工具，而非从零开始。

## 实践启示

在选择浏览器自动化方案时，应根据任务类型决定技术选型：需要完整隔离环境（如测试爬虫）时使用 Playwright；需要复用用户已有登录态的日常协作场景时使用 CDP Bridge MCP。两者并非替代关系，而是覆盖不同使用场景的互补工具。

部署 CDP Bridge MCP 时必须重视安全边界。连接到用户真实浏览器会话的能力是一把双刃剑——它既提供了便利性，也带来了风险暴露。建议仅在受信任的本地环境中使用，避免在多用户共享服务器或公有云环境中暴露 MCP Server。对于企业场景，应考虑额外的身份验证层。

`browser_scan` 的简化 HTML 输出是其核心能力之一，但在某些场景下可能丢失重要信息（如 CSS 隐藏但对理解页面有用的内容）。开发者应根据具体任务需求决定是否需要使用 `browser_screenshot` 补充视觉信息，或在 prompt 中引导模型关注关键元素的位置特征而非仅依赖简化文本。

对于 MCP 协议的工具开发者，CDP Bridge MCP 展示了如何基于现有框架（GenericAgent）快速构建新工具。这种组件化思路有助于降低 MCP 工具的开发成本，并促进生态内的技术积累。新的 MCP 工具开发者应优先研究是否有可复用的框架，而非从头构建一切。

---

