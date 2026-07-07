# 一年吃掉一块固态硬盘，Codex日志bug被骂「劣质软件

## Ch09.144 一年吃掉一块固态硬盘，Codex日志bug被骂「劣质软件

> 📊 Level ⭐⭐ | 2.7KB | `entities/一年吃掉一块固态硬盘codex日志bug被骂劣质软件.md`

# 一年吃掉一块固态硬盘，Codex日志bug被骂「劣质软件

OpenAI Codex（编程 Agent）的 SQLite 反馈日志 (`logs_2.sqlite`) 存在严重的写入放大问题。默认的 `Level::TRACE` 配置导致每 15 秒进行约 36,000 次数据库插入加删除操作，一年产生约 640TB 的硬盘写入量，足以耗干一块消费级固态硬盘的寿命。

## 技术细节

- **写入模式**：Codex 使用 SQLite WAL 模式，每 15 秒执行约 36,211 行 INSERT，同时删除等量旧行，始终保持数据库约 1.2GB 大小。这种 insert-and-prune 机制虽然表面文件大小不变，但每次写入都对存储介质产生实际磨损。
- **数据规模**：自增 ID 已超过 55 亿，但留存行仅约 50 万行（写入/留存比约 1 万倍）。主要写入来源是文件系统 inotify 事件（`ld.so.cache` 被记录 12.8 万次、`locale.alias` 3.8 万次等调试日志）。
- **根因**：SQLite 反馈日志 sink 初始化的 `RUST_LOG=TRACE` 默认配置，将每个 WebSocket 数据包完整记录到日志中。
- **影响**：连续开机 21 天产生 37TB 写入，年化 640TB，超过消费级 SSD 150-600 TBW 的标称寿命。文件占用量小（~1.2GB），故障极其隐蔽，只能通过读取 SSD SMART 健康计数发现。

## 修复状态

Anthropic 在收到报告后进行了修复，削减了约 85% 的日志写入量。但用户无法自行修改（Codex 桌面端闭源）。该问题在 Hacker News 上被评论为典型的劣质软件（slopware）。

## 相关实体

- `codex-log-bug-ssd-wear`：本文主角，Codex 日志 bug 的原始分析
- [Codex HTTP/2 HPACK Bomb](../ch01/520-codex.md) — 另一个 Codex 工程问题
- [Claude Code vs Codex 架构对比](../ch03/075-claude-code.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/一年吃掉一块固态硬盘codex日志bug被骂劣质软件.md)

---

