# Agent Browser 僵尸进程排查与定时清理（Claude Code + QoderWork 实战）

## Ch09.148 Agent Browser 僵尸进程排查与定时清理（Claude Code + QoderWork 实战）

> 📊 Level ⭐⭐ | 2.2KB | `entities/agent-browser-zombie-process-cleanup-qoderwork-2026.md`

# Agent Browser 僵尸进程排查与定时清理

> **Background**: 作者使用 QoderWork（AI 编码工具）诊断 Mac 电脑的异常功耗和发热问题，发现根源是 Agent Browser 残留的 Chrome 僵尸进程在后台消耗 768% CPU。文章记录了完整的排查过程和自动化清理方案。

## 问题发现

作者在 Claude Code 额度告急（$200 周额度耗尽 90%）后发现 Mac Mini 和 MacBook 出现异常：
- MacBook M1 Max 在包里 2 小时就没电、发烫
- Mac Mini 频繁死机（怀疑 16G 内存不足）
- 作者一度打算换 M5 Max 128G 新机

## QoderWork 诊断

实际排查过程：
1. QoderWork 运行 `top` 发现 Load Average 46，CPU 空闲 0%，16GB 内存几乎耗尽
2. 定位到 6 个 Agent Browser 残留的 Chrome 实例变成孤儿进程
3. 6 个渲染进程各占 120-130% CPU，合计 **768% CPU** 消耗
4. Agent Browser 是作者在 Claude Code TUI 中用于浏览器自动化的工具
5. 该工具有 bug — 用完不自动清理回收

## 解决方案

清理后 CPU 空闲从 0% 恢复到 65.8%，可用内存从 120MB 涨到 642MB。作者随后构建了定时清理脚本，防止 Agent Browser 进程累积。

## wiki 价值

这篇文章记录了使用 AI 编码工具（QoderWork）debug 真实系统问题的完整工程实践——AI 工具诊断 AI 工具产生的问题。Agent Browser 作为 Claude Code 的浏览器自动化组件，其进程泄漏问题对于重度使用 Agent Browser 的用户有实际参考价值。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-browser-zombie-process-cleanup-mac-tool-2026.md)

---

