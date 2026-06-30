# Lighthouse Agentic Browsing Scoring — Chrome DevTools 为 AI Agent 交互评估网站

## Ch04.517 Lighthouse Agentic Browsing Scoring — Chrome DevTools 为 AI Agent 交互评估网站

> 📊 Level ⭐⭐ | 3.3KB | `entities/lighthouse-agentic-browsing-scoring.md`

# Lighthouse Agentic Browsing Scoring

Chrome DevTools 团队在 Lighthouse 中新增了 **Agentic Browsing** 评估类别，用于衡量网站对 AI Agent 交互的友好程度。这不是一个 0-100 的加权评分，而是一组确定性审计信号，旨在为"Agent-ready Web"标准提供数据基础。

## 核心评估维度

### WebMCP 集成
Lighthouse 通过 Chrome DevTools Protocol (CDP) 的 `WebMCP` 域监控工具注册事件。检查范围包括：
- **声明式工具**（HTML 中定义）
- **命令式工具**（JavaScript 中通过 Imperative API 注册）

WebMCP 是让网站显式暴露逻辑和表单给 AI Agent 的关键协议。

### Agent 导向的可访问性（A11y Tree）
Agent 依赖无障碍树（accessibility tree）作为其主要数据模型。Lighthouse 筛选了对机器交互至关重要的 A11y 子集：
- **命名与标签**：确保每个交互元素都有程序化名称
- **树完整性**：验证角色和父子关系有效
- **可见性**：确认内容未对无障碍树隐藏但仍是可交互的

这意味着**语义化 HTML 和正确的 ARIA 标注**是网站对 Agent 可见的基础。

### 稳定性与可发现性
- **Cumulative Layout Shift (CLS)**：衡量视觉稳定性，对依赖元素定位的 Agent 至关重要
- **llms.txt**：检查域名根目录下是否存在机器可读摘要文件

## 评分机制（非传统模式）

与传统 Lighthouse 类别不同，Agentic Browsing 不输出加权平均分：
- **分数形式**：通过比例（pass ratio），显示网站通过了多少 agentic 就绪检查
- **Pass/Fail 状态**：特定审计可能因技术要求（如 WebMCP schema 有效性）不满足而报错/警告
- **信息性计数**：类别头部包含通过率，供开发者观察整体进展

结果可能因动态工具注册时序、A11y 树构建变化、CLS 波动等因素而浮动。

## 开发者改进路径

1. **采用 WebMCP**：使用 WebMCP API 显式向 AI Agent 暴露站点逻辑和表单
2. **完善 A11y 树**：优先使用语义化 HTML 和正确的 ARIA 标注——这是页面的"机器视角"
3. **优化稳定性**：减少布局偏移，确保 Agent 能可靠地与 UI 交互

## 战略意义

这是 Google 将"Agent-ready Web"标准化的重要一步。当 Lighthouse（全球使用最广泛的网站质量审计工具）将 agentic 就绪度纳入评估体系，意味着：
- 网站优化目标从"人类可用"扩展到"Agent 可用"
- A11y 从"残障人士辅助"升级为"Agent 基础设施"
- WebMCP 从实验性 API 进入主流开发者工具链

## 相关主题
- [Aeo And Geo For Ai Overviews Chatgpt Claude Gemini And Perplexity](ch04/310-ai.md) — AI 搜索引擎优化
- [Agentic Design System From Chatbot To Orchestration](ch01/011-agentic-design-system-from-chatbot-to-orchestration.md) — Agent 设计系统

---

