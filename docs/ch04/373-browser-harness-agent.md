# Browser Harness — 自愈型浏览器 Agent 框架

## Ch04.373 Browser Harness — 自愈型浏览器 Agent 框架

> 📊 Level ⭐⭐ | 7.8KB | `entities/browser-harness.md`

## Overview
Browser Harness（browser-use/browser-harness，~8.9K Stars）是一个基于 Chrome DevTools Protocol (CDP) 直连的自愈型浏览器 Agent 框架，核心理念是**去框架化**：薄 CDP 桥接 + mid-task 自愈机制 + domain-skills 自动沉淀。
与 [AgentBrowser](../ch09/070-agent-browser-claude-code-qoderwork.html)、Playwright/Selenium 等方案不同，Browser Harness 不构建厚重抽象层，而是让 Agent 直接通过 CDP WebSocket 与浏览器原生状态交互。

## 架构
```
[Agent (Claude Code / Codex)]
        │
        ▼  CDP WebSocket（薄桥接）
[Daemon 进程 —— 管理会话与通信]
        │
        ▼
[run.py —— 加载 helpers 工具]
        │
        ▼
[helpers.py —— 浏览器操作函数集]
        │
        ▼
[Chrome —— CDP 原生接口]
```

- **Daemon**：管理 CDP WebSocket 会话和通信
- **run.py**：加载预置的 helpers 工具，提供 API 入口
- **helpers.py**：预置浏览器操作函数（点击、输入、导航等），Agent 可调用也可通过 raw CDP 获取底层页面信息

## 核心创新：自愈机制（Self-Healing）
当 Agent 发现 helpers.py 缺少所需函数，不会报错退出，而是：
1. 读取当前 helpers 代码
2. 理解现有函数的签名/模式
3. 实时在文件中添加新函数
4. 继续执行任务
这种 **mid-task 编辑**能力使框架本身成为可进化的基础设施。

## Domain-Skills 自动沉淀
Agent 在处理 GitHub、LinkedIn、Amazon 等特定网站时，自动沉淀交互模式到 `domain-skills/` 目录，包含可复用的选择器、交互流程和异常处理经验。强调由 Agent 在真实任务中总结生成，非人工手写。

## 与同类方案对比
| 维度 | Browser Harness |  | Playwright/Selenium | Browser-Use |
|------|----------------|-------------|---------------------|-------------|
| 抽象层 | 薄（CDP 直连） | 中等（语义理解层） | 厚（API 封装） | 中等 |
| 自愈 | ✅ mid-task 加函数 | ❓ 站点记忆 | ❌ 需预写选择器 | ❌ |
| Domain Skills | ✅ 自动沉淀 | ❌ 无 | ❌ 无 | ❌ |
| 安装复杂度 | 低（uv install -e .） | 中等 | 高（需配置 WebDriver） | 中等 |
| 适用场景 | Agent 原生操作浏览器 | Agent 浏览器运行时 | 测试自动化 | Agent 浏览器操作 |
与 [CLI-Anything](../ch03/097-cli-anything.html)/[OpenCLI](../ch03/085-opencli.html)/[AutoCLI](../ch03/121-autocli.html) 等 CLI 化方案不同，Browser Harness 走的是**浏览器原生操作**路线而非命令行封装，二者互补而非替代。

## 安全边界
连接到用户真实 Chrome，遵循原则：

- Agent 不处理密码/验证码/私密页面/高风险操作
- 遇到登录墙 → 停止并询问用户
- Agent 只在授权后的页面执行明确、可验证的任务

## 深度分析
### 自愈机制的架构意义
Browser Harness 的 self-healing 本质上是**将 helpers.py 视为运行时可修改的知识库而非静态 API**。传统框架把函数签名焊死，运行时遇到未知操作只能报错退出；Browser Harness 则允许 Agent 在 mid-task 过程中扩展 helpers 集合。这种设计将"框架边界"的定义权从开发者转移到了 Agent，使得系统具备了真正意义上的可进化性。
从 CDP 视角看，Agent 修改 helpers.py 后无需重启 Daemon 进程，因为 helpers 函数最终都是调用同一套 CDP 命令——新增的 upload_file() 和内置的 click_element() 在 CDP 层面没有本质区别，都是 `Runtime.evaluate` + `DOM` 操作。这意味着自愈的开销极低，收益极高。

### 去框架化的代价与收益
薄桥接策略减少了抽象层带来的信息损失，Agent 能更直接地感知页面状态。但代价是 Agent 需要理解 CDP 语义，而不能只依赖语义化的 helper 签名。对于一个拥有 world knowledge 的 LLM 而言，CDP 其实比高级 API 更容易推理——CDP 反映了浏览器的实际内部状态，而高级 API 往往隐藏了这些细节。
domain-skills 的自动沉淀机制则解决了浏览器自动化中最棘手的问题：**选择器脆弱性**。人工维护的选择器在网页改版后迅速失效，而 Agent 在真实任务中生成的选择器天然绑定到当时的页面结构，配合 self-healing 机制可以在选择器失效时自动发现并修复。

### 与 AgentBrowser 的路线对比
AgentBrowser 走的是"语义理解+站点记忆"路线：构建中间层让 Agent 理解页面语义，记忆历史交互模式。这条路线的优势是用户友好，劣势是中间层会引入信息瓶颈——当页面语义与中间层预设不匹配时，Agent 的推理链就会断裂。
Browser Harness 走的是"最小抽象+最大自主"路线：让 Agent 直接面对 CDP，把抽象层的维护责任也交给 Agent。这要求 Agent 有更强的自主性和代码能力，但也因此获得了更高的上限。两条路线并不互斥——AgentBrowser 的中间层可以构建在 Browser Harness 的薄桥接之上。

## 实践启示
### 何时选择 Browser Harness
当你需要 Agent 在**真实浏览器环境**中完成复杂的多步骤任务，且任务页面没有现成的 API 或爬虫方案时，Browser Harness 是最优选择。特别适合：

- 需要处理 JavaScript 渲染内容的自动化任务
- 需要穿越登录墙或处理复杂交互流程
- 需要跨多个异构网站执行批量操作
- 需要在浏览器中完成测试、监控、数据采集等任务
当你只需要**测试自动化**或**确定性脚本**时，Playwright/Selenium 仍然更合适——它们有更完善的错误处理和调试工具。

### 自愈机制的使用技巧
1. **给 Agent 足够的上下文**：在 prompt 中说明 helpers.py 的位置和修改规则，Agent 才能正确使用自愈能力
2. **监控 helpers.py 的膨胀**：随着任务种类增加，helpers.py 会自然膨胀，定期清理未使用的函数可以保持性能
3. **domain-skills 的版本管理**：自动沉淀的 skills 需要纳入版本控制，建议在 CI 中校验 skills 目录的格式正确性

### 安全使用的最佳实践
- 始终在隔离的 Chrome profile 中运行，让 Browser Harness 连接专用的浏览器实例
- 在 Agent prompt 中明确列出安全边界，不要假设 Agent 会自行推断
- 对于高风险操作（支付、修改设置等），在 helpers.py 层面添加确认机制而非依赖 Agent 的判断

## 安装
```bash
git clone https://github.com/browser-use/browser-harness
cd browser-harness
uv tool install -e .
browser-harness --setup
```
也可在 Claude Code 或 Codex 中通过 Prompt 引导安装（自动执行 install.md）。

## Related
- [原始存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/browser-harness-github.md)

---

