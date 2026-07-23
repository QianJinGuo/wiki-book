# Agent Browser 僵尸进程排查与定时清理（Claude Code + QoderWork 实战）

## Ch09.070 Agent Browser 僵尸进程排查与定时清理（Claude Code + QoderWork 实战）

> 📊 Level ⭐⭐ | 9.3KB | `entities/agent-browser-zombie-process-cleanup-qoderwork-2026.md`

# Agent Browser 僵尸进程排查与定时清理

> **Background**: 作者使用 QoderWork（AI 编码工具）诊断 Mac 电脑的异常功耗和发热问题，发现根源是 Agent Browser 残留的 Chrome 僵尸进程在后台消耗 768% CPU。文章记录了完整的排查过程和自动化清理方案。

## 问题发现

作者在 Claude Code 额度告急（$200 周额度耗尽 90%）后发现 Mac Mini 和 MacBook 出现异常：
- MacBook M1 Max 在包里 2 小时就没电、发烫
- Mac Mini 频繁死机（怀疑 16G 内存不足）
- 作者一度打算换 M5 Max 128G 新机

值得注意的是，这些问题并非孤立现象。Agent Browser 作为 Claude Code TUI 中的浏览器自动化组件，在重度使用场景下极易产生孤儿进程。其根本原因在于 Agent Browser 在任务结束后，未能正确触发 Chrome 实例的关闭回调——这属于典型的**资源泄漏（Resource Leak）**模式，与数据库连接池泄漏、文件句柄未关闭等经典问题同源，但在 Agent 上下文中被放大，因为每次 Agent 任务可能生成多个独立的浏览器上下文。

## QoderWork 诊断

实际排查过程展示了 AI 编码工具在系统诊断中的独特价值：

1. QoderWork 运行 `top` 发现 Load Average 46，CPU 空闲 0%，16GB 内存几乎耗尽，只剩 120MB 可用
2. 定位到 6 个 Agent Browser 残留的 Chrome 实例变成孤儿进程
3. 6 个渲染进程各占 120-130% CPU，合计 **768% CPU** 消耗
4. Agent Browser 是作者在 Claude Code TUI 中用于浏览器自动化的工具
5. 该工具有 bug — 用完不自动清理回收

**关键洞察**：QoderWork 在此处展示的能力超越了简单的问答——它进入了真实的本地环境，配合终端、文件和系统状态做综合判断。具体来说，它在分析过程中执行了以下操作：
- 读取 `top` 和 `ps aux` 输出以识别高消耗进程
- 关联进程树以确认 Chrome 实例为孤儿进程（父进程已退出）
- 计算累积 CPU 消耗（6 × ~130% = 768%）
- 在执行清理前提示高危操作并等待用户确认

这种**渐进式诊断链**（Load Average → 进程列表 → 进程树 → 根因确认 → 行动方案）是 Agent 系统诊断的标准模式，与传统运维人员的排查思路高度一致。

## 解决方案

清理后 CPU 空闲从 0% 恢复到 65.8%，可用内存从 120MB 涨到 642MB。作者随后利用 QoderWork 内置的**定时任务（Cron Job）**功能，创建了每 12 小时自动执行的系统资源诊断与清理任务，使用自定义 cron 表达式 `0 */12 * * *`。

该定时任务的核心逻辑包括：
1. 扫描 CPU 和内存占用 Top 20 进程
2. 检查僵尸进程（defunct/zombie）和孤儿进程（orphan）
3. 清理残留的 Chrome 实例和异常高占用进程
4. 生成清理前后的对比报告

此外，作者还进一步用 QoderWork 构建了一个 **Status Bar 小工具（MacClean）**，用纯 Swift + AppKit 开发，打包后仅 500KB，无需 Electron 等重型框架。该工具支持：
- 实时 CPU/内存/压力指标监控
- 阈值触发 AI 分析（CPU、内存压力、变化幅度可调）
- 风险进程分级（高风险/可观察/建议清理）
- 通知中心推送
- 自定义 API Key 配置
- 开源在 GitHub（https://github.com/Johnixr/MacClean）

## 深度分析

### Agent 工具的进程生命周期管理挑战

Agent Browser、Playwright、Puppeteer 等浏览器自动化工具在 Agent 架构中广泛使用，但它们的进程生命周期管理存在系统性缺陷。与传统 Web 应用不同，Agent 任务的执行路径高度动态——任务可能被中断、超时、重试或并行执行，导致浏览器进程的创建和销毁难以精确配对。

这种问题的本质是 **Agent 的副作用（Side Effect）管理**问题。在传统软件中，资源获取与释放（RAII）通过作用域绑定保证。但在 Agent 架构中，浏览器进程的生命周期跨越多次 LLM 调用、工具调用和可能的失败恢复，缺乏明确的析构语义。当前大多数 Agent 框架（包括 Claude Code、Codex、LangGraph）仍将进程清理责任留给工具实现者，而没有在框架层提供进程生命周期担保。

### AI 自愈循环（Self-Healing Loop）的原型

本案例展示了一个完整的 AI 自愈循环原型：**AI 工具 A（QoderWork）诊断 AI 工具 B（Agent Browser）产生的问题 → 生成修复方案 → 创建预防性监控 → 开源结果**。这种元循环（Meta-Loop）的特点是：

1. **问题发现层**：QoderWork 替代了传统的 `htop`/`lsof` Manual Debug 流程
2. **修复执行层**：AI 自动执行清理并验证效果（前后对比）
3. **预防自动化层**：通过定时任务转化为持续巡检
4. **工具化层**：从一次性修复升级为可复用的 Status Bar 工具
5. **开源分享层**：通过 GitHub 将修复工具社区化

这种五层递进模式是 Harness Engineering 中「AI 自治运维」的早期实践案例。

### 峰谷 Token 经济与夜间 Agent 编排

本案例中还揭示了一个重要的经济模式：**峰谷 Token 定价**。QoderWork 在夜间（22:00-08:00）提供 Qwen3.7-Max 低至 2 折、Qwen3.7-Plus 4 折的折扣，鼓励将长程任务和定时任务放在低峰时段。

这种定价策略与数据分析、批量处理、定时巡检等场景天然匹配：
- 长程 Agent 任务（数据分析、日志挖掘）在夜间自动执行
- 定时清理任务在凌晨运行，不影响白天业务
- LLM 推理资源的峰谷利用大幅降低了 Agent 运营成本

这预示着未来的 Agent 经济中将出现「任务编排优化」层——根据 Token 价格曲线和时间敏感度，自动将任务调度到最优时段执行。

### Agent OS 形态的收敛

本案例中的 QoderWork 界面（左侧菜单、中间聊天、右侧预览）与 Claude Code、Codex 等 Agent 桌面软件高度相似。这种收敛暗示了 **Agent OS 的核心交互模式已经稳定**：

- **左侧**：资源导航（文件、任务、技能）
- **中间**：对话交互（指令输入与结果输出）
- **右侧**：上下文预览（系统状态、文件内容、执行日志）

未来的操作系统入口可能不再是传统的桌面 + 文件管理器，而是这种「上下文切换 + 指令输入」的 Agent 界面。

## 实践启示

1. **Agent 进程泄漏是规模化后的必遇问题**：重度使用 Agent Browser 的用户应该建立定期巡检机制（每 12 小时扫描一次），或者在 Agent 任务结束后强制 kill 浏览器进程组。简单方案：`pkill -f "Chrome.*--headless"` 作为 Task 后置钩子。

2. **AI 诊断优于传统 Script Debug**：QoderWork 展示的「自然语言描述问题 → AI 分析系统状态 → 自动修复」流程，比传统的 `top` + `ps` + `lsof` 手动排查效率高出数倍，且对非运维背景的开发者更友好。

3. **定时任务是 Agent 从「即时问答」到「持续服务」的关键跃迁**：当 Agent 工具支持定时任务后，它们就不再只是对话工具，而是变成了真正的数字员工——在无人值守时持续工作，按时交付成果。

4. **AI 工具的自愈能力是选型的重要指标**：Agent 工具链中的组件（如 Agent Browser）应当具有自我诊断和修复能力。如果一个 AI 工具不能监控自身产生的副作用，它就不适合在生产环境中长期运行。

5. **从「找现成工具」到「让 AI 造工具」的范式转变**：作者没有花时间搜索开源项目或对比同类软件，而是直接让 QoderWork 创建了 MacClean。这代表了一种新的软件消费模式——当工具的制造成本趋近于零时，量身定制的优先级将超过现成工具的搜索成本。

## 相关实体

- [Agent Loop Engineering 手册](../ch05/005-loop-engineering.html)
- [Agent Harness 生产可观测性](../ch05/039-agent-harness.html)
- [Agent 事故分类实践](../ch11/217-amazon-quick.html)
- [Loop Engineering 反馈机制](../ch05/005-loop-engineering.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent-browser-zombie-process-cleanup-mac-tool-2026.md)

---

