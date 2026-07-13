# 12 个 Agent 工程设计底层逻辑：脚手架 vs 承重墙

## Ch05.086 12 个 Agent 工程设计底层逻辑：脚手架 vs 承重墙

> 📊 Level ⭐⭐ | 4.5KB | `entities/twelve-agent-design-patterns-yunduojun-datastudio.md`

> 原文归档：[原文归档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/twelve-agent-design-patterns-yunduojun-datastudio.md)

Bilgin Ibryam 提炼 Claude Code 12 个设计模式的中文深度解读，增加"什么时候过度设计"判断框架和完整 Python 代码实现。云朵君/数据STUDIO。

## 一句话

**12 模式四类（记忆/编排/权限/兜底），1-11 是脚手架（拆了还站），12 是承重墙（拆了塌），核心原则：把确定性逻辑从 LLM 推理中剥离。**

## 核心隐喻

- **模式 1-11 = 脚手架**：帮 Agent 更好地工作，拆了房子还能站
- **模式 12 = 承重墙**：系统级兜底，不依赖 Agent 记性，拆了直接塌

## 四类架构问题

| 类别 | 模式 | 核心问题 |
|------|------|---------|
| 记忆与上下文 | 1-5 | Agent 应该记住什么，记在哪，记多久 |
| 工作流与编排 | 6-8 | 怎么不让上下文变成垃圾场 |
| 工具与权限 | 9-11 | Agent 能做什么操作，怎么保证不捅娄子 |
| 自动化兜底 | 12 | 不该让模型记住的事 |

## 记忆不可能三角

容量 × 速度 × 相关性，只能三选二：
- 容量大 + 速度快 = 上下文窗口塞爆
- 速度快 + 相关性高 = 只能记最近几轮
- 容量大 + 相关性高 = 检索慢

## 模式 3 深讲：分层记忆

三层：索引常驻（~200 行硬限制）→ 热层按需加载 → 冷层搜索

Claude Code 实现：MEMORY.md（索引）→ memory/（分类文件）→ 磁盘（完整历史）

**关键**：索引一膨胀 → 分层失效 → 退化回全量塞 prompt

## 模式 7 深讲：上下文隔离子智能体

主 Agent 的核心能力不是"拆 sub-agent"，是**信息编辑**——从 100 页调研里挑出相关的 3 段传给执行 Agent。

## 模式 10 深讲：命令风险分类

三级风险判定（低/中/高），分级逻辑**必须落在确定性代码里**，不能靠 prompt。

## 模式 12 深讲：确定性生命周期钩子

四个挂载点：PreToolUse / PostToolUse / SessionStart / Stop

三个关键设计：(1) 不调 LLM (2) 与 prompt 解耦 (3) 失败即阻断

## 什么时候过度设计

| 模式 | 过度设计信号 |
|------|------------|
| 1 持久化指令 | 文件超 500 行没拆分 → 升级到模式 2 |
| 2 作用域上下文 | 单项目 3 个文件以内 → 一个 CLAUDE.md 够 |
| 4 记忆整合 | 项目跑不到两周 → 手动清理就行 |
| 5 渐进压缩 | 短会话 10 轮以内 → 压缩反而丢信息 |
| 6 探索-规划-执行 | 改一行配置 → 直接改比走三轮快 |
| 8 分支-合并并行 | 子任务有依赖 → 并行制造合并冲突 |
| 9 渐进式工具扩展 | 工具少于 5 个 → 直接全开放 |
| 11 单用途工具 | 工具少于 3 个 → 合并更简单 |

## 踩坑记录

- MEMORY.md 索引文件三个月从 80 行涨到 190 行，再涨触发分层失效
- Agent 跑 find -exec sed 路径没加引号撞上空格目录名
- 真正的坑不是"怎么存更多"是"怎么删旧的"

## 相关实体

- [Harness Engineering](ch05/068-harness-engineering.html)
- [Claude Code Agentic Harness 设计模式](../ch03/067-claude-code-agent.html)
- [Harness Engineering Core Patterns](ch05/068-harness-engineering.html)
- [fudan-peking AHE](../ch04/237-ahe-agentic-harness-engineering.html)

---

