---
title: CDP Bridge MCP：让 LLM 操作真实浏览器
source_url: https://mp.weixin.qq.com/s/J1EZzYVx0VcologP-hEwVg
publish_date: 2026-05-12
tags: [wechat, article, claude, agent, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 61e03057b4f9aac387fde339da654f41ece8ada4983229e4d5a08ee09d13695b
---
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