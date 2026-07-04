# Build a self-improving AI PM OS with Claude Code

## Ch01.898 Build a self-improving AI PM OS with Claude Code

> 📊 Level ⭐⭐ | 4.1KB | `entities/p-ai-pms-guide-to-claude.md`

## 核心要点
- ...
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/p-ai-pms-guide-to-claude.md)

## 相关实体

- [Hermes Agent 深度解析（阿里云/飞樰）](ch03/045-agent.md)
- [Build Live Translation Apps with gpt-realtime-translate](ch01/137-build-live-translation-apps-with-gpt-realtime-translate.md)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](ch03/075-claude-code.md)

## 深度分析
Pawel Huryn 的 PM OS 实践揭示了 Claude ecosystem 的真实分层——Chat、Cowork、Code、Dispatch 分别适用于不同场景，而非功能的简单堆叠。
**核心认知升级：Chat 是个人工具，Code 是系统构建。** Chat 有三个致命限制：跨设备无连续性、无真实文件访问、无持久化学习系统。这解释了为什么"5% Chat + 70% Dispatch + 25% Claude Code"是 Pawel 的实际配比。
**Self-improving knowledge system 是本文最具深度的部分。** 三个核心机制：
1. **Rules**（规则）：跨足够多数据确认的 patterns，直接默认应用
2. **Hypotheses**（假设）：观察到但未确认的 patterns，跟踪证据计数，达到阈值自动升级为 Rules
3. **Rejected**（拒绝）：被数据证伪的 patterns，保留避免重复测试
CLAUDE.md router pattern 的精髓在于：**CLAUDE.md 只做路由，不做知识存储**。把写作风格、平台规则、历史数据分别存为独立文件，agent 加载时只取相关的 domain，而非每次都灌入全部上下文。
Personal automation (Claude Code) vs Production automation (n8n) 的区分是关键洞见——前者是"agent 解读文本文件建议做什么"，后者是"代码逻辑强制执行"。这条界限决定了你应该用什么工具。

## 实践启示
**对于 PM 和知识工作者：**

- 立即将 Chat 使用时间压缩到 5%，迁移到 Cowork 或 Code 以获得文件访问和持久化记忆
- 在 CLAUDE.md 中实现 self-improving system：先给 10 个好例子 + 2 个坏例子，让 agent 自己提取规则
- Dispatch 是移动场景的杀手级功能——"购物时 dispatch 任务，回家看结果"是真正的 decoupling
**对于 AI 产品设计者：**

- Skills 的 progressive disclosure 机制是控制 context window 的正确范式——description 匹配后才加载 full instructions
- 多 agent 并行（Dispatch）比串行效率高得多，但需要良好的任务分解能力
- MCP connectors 的价值在于"数据流入"——越多系统连接，agent 越聪明
**对于 AI 应用开发者：**

- Personal automation 和 Production automation 的边界就是 Claude Code 和 n8n 的边界，不要试图用 markdown 文件做确定性要求
- Subagents + Hooks + Local MCP servers 是 Claude Code 相比 Cowork 的核心差异点
- Hooks 可用于自动化质量门禁：在 agent 行动前后注入检查逻辑
**对于想建立 AI 竞争壁垒的团队：**

- Component library + Context engineering 是护城河：每个成功的 output 都要提取 pattern 反哺 library
- 规则库会随时间增值，竞争对手无法复制的是你的 confirmed rules 积累
- "McKinsey-level output vs generic AI output"的差异在于 skill 定义的质量
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/p-ai-pms-guide-to-claude.md)

---

