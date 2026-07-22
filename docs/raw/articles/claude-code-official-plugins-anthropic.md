---
title: "让你的 Claude Code 满血复活，Anthropic 在 GitHub 上开源了个插件"
type: raw
tags: [claude, agent, plugin, claude-code]
source_url: "https://mp.weixin.qq.com/s/-g-JDq6PmcrcUTpGU-U1LA"
ingested: 2026-05-28
sha256: b2343e5abb4344b4e9872c73d6050892ef77158d2098a3e5a72bba106947338b
---

# 让你的 Claude Code 满血复活，Anthropic 在 GitHub 上开源了个插件

**来源**：逛逛GitHub（2026-05-25）

## 核心内容

### claude-plugins-official 仓库

Anthropic 官方在 GitHub 上维护的 Claude Code 插件目录，目前 30+ 内部插件 + 10+ 外部插件。

### claude-code-setup

扫描代码库，推荐最适合项目的自动化配置（MCP Servers、Skills、Hooks、Subagents、Slash Commands）。只读分析不修改文件。

安装：`/plugin install claude-code-setup@claude-plugins-official`

### feature-dev（7阶段功能开发流程）

结构化功能开发流程：发现需求 → 探索代码库 → 澄清问题 → 架构设计 → 编码实现 → 质量审查 → 总结。

- 第4阶段（架构设计）：同时启动 2-3 个架构师 Agent，分别从最小改动、干净架构、务实平衡三角度设计方案
- 第6阶段（质量审查）：3个独立审查 Agent 并行：代码质量、Bug 检测 + 规范检查

安装：`/plugin install feature-dev@claude-plugins-official`

### hookify（自然语言配置 Hooks）

用自然语言描述规则，自动生成 markdown 配置文件。监控类型：bash（终端命令）、file（文件编辑）、stop（停止时）、prompt（提交前触发）。可设置 warn（警告但允许）或 block（直接拦截）。

示例：`/hookify 当我执行 rm -rf 命令的时候警告我`

安装：`/plugin install hookify@claude-plugins-official`

### code-modernization（遗留代码现代化）

老旧 COBOL、Java/C++、单体 Web 应用迁移到现代技术栈，行为不变。

流程：评估 → 依赖拓扑图 → 业务规则提取 → 生成迁移方案 → 逐模块迁移 → 安全加固。所有改动输出到 modernized/ 目录。

安装：`/plugin install code-modernization@claude-plugins-official`
