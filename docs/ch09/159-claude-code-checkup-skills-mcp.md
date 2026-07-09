# Claude Code /checkup 功能：清理 Skills/MCP 提升性能

## Ch09.159 Claude Code /checkup 功能：清理 Skills/MCP 提升性能

> 📊 Level ⭐⭐ | 1.6KB | `entities/claude-code-checkup-feature-boris-cherny-2026.md`

# Claude Code /checkup 功能：清理 Skills/MCP 提升性能

> **/checkup** 是 Claude Code 团队在 2026 年 7 月推出的新命令，用于对 Claude Code 环境进行全面体检（healthcheck），清理积灰的 Skills、MCP 服务器、插件和过度膨胀的 CLAUDE.md。

## 背景

Claude Code 重度用户通常会积累大量 Skills、MCP 工具、插件和 hooks。每次开启新 session 时，所有这些配置都会被加载，其中不少已经过时或不再使用。这些"数字灰尘"不仅拖慢启动速度，还可能导致冲突和意外行为。

## 功能

`/checkup` 命令会扫描当前 Claude Code 环境中的所有配置，识别以下问题：

- 已过时或不兼容的 Skills
- 未使用的 MCP 服务器连接
- 冲突的插件配置
- 过度膨胀或包含冗余指令的 CLAUDE.md

## 发布者

该功能由 Claude Code 的创造者 Boris Cherny 亲自宣布。Boris 此前在多个访谈中阐述了 IDE→Agent Console 的开发范式转变。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-推出-checkup-功能能给爹省钱.md)

---

