# Claude Agent SDK Skills：可复用的专业知识体系 — Skill ≠ Tool ≠ Memory，渐进加载 + 4 方分工 + 团队 Skill 库设计

## Ch01.654 Claude Agent SDK Skills：可复用的专业知识体系 — Skill ≠ Tool ≠ Memory，渐进加载 + 4 方分工 + 团队 Skill 库设计

> 📊 Level ⭐⭐ | 7.1KB | `entities/claude-agent-sdk-skills-reusable-knowledge.md`

Claude Agent SDK 系列第 11 篇，系统阐述 Skills 在 Agent 架构中的定位——将团队经验沉淀为可复用、可审查、可版本管理的「操作手册」，而非一次性 prompt。

## 核心边界：Skill ≠ Tool ≠ Memory

文章首先厘清三个容易混淆的概念：

| 概念 | 回答的问题 | 例子 |
|---|---|---|
| **Tool** | Agent 能调用什么能力？ | 读文件、跑命令、查数据库、发 Slack |
| **Skill** | Agent 应该怎么完成一类任务？ | 代码审查流程、发布说明模板、事故复盘 SOP |
| **Memory** | 某个项目/用户已经发生过什么事实？ | "这个仓库用 pnpm test" |

类比：**工具是手，Skill 是手册**。Skill 也不是 Memory——Memory 绑定具体项目，Skill 可跨项目复用。

## 渐进加载：Skill 的核心工程价值

Skill 最大的工程价值不是"把 prompt 存成文件"，而是**渐进加载**（progressive loading）——避免一启动就把所有规范塞进上下文：

1. **第一层**：只暴露 Skill 目录 + 简短描述
2. **第二层**：任务匹配时加载对应 SKILL.md
3. **第三层**：SKILL.md 引用的 references/templates/scripts 按需读取

## Skill 文件结构

一个成熟 Skill 以目录为单位：

```
SKILL.md          # 路由 + 核心流程（不要塞所有内容）
references/       # 长规范、代码规范、审查清单
templates/        # 固定输出格式（PR 模板、发布说明）
scripts/          # 可执行辅助脚本
assets/           # 固定素材
```

**关键原则**：SKILL.md 只放路由和核心流程。引用而非堆砌——"做 A 时读取 references/a.md"，把 Skill 从"长 prompt"变成"任务操作系统入口"。

## 4 方分工：Skills / Hooks / Subagents / MCP

文章提出四句话判断法：

| 维度 | 职责 | 代码审查场景示例 |
|---|---|---|
| **Skills** | 教它怎么做 | 定义审查流程：行为变化→正确性→安全→测试→severity 输出 |
| **Hooks** | 管它什么时候能做 | 拦截：不允许审查 Agent 修改源码、记录工具调用 |
| **Subagents** | 拆给谁去做 | security-reviewer / test-reviewer / docs-reviewer |
| **MCP** | 接入外部系统去做 | GitHub MCP 读 PR / Linear MCP 读需求 / Slack MCP 发结果 |

**核心约束**：Skill 说"应该检查安全问题"只是建议，真正的阻止要靠权限、Hooks 和运行环境。

## 何时值得写 Skill：5 条件

1. 任务会重复出现
2. 流程相对稳定
3. 团队希望统一产物质量
4. 流程里有容易忘的细节
5. 内容需要版本管理（变更也要 code review）

一次性提醒（"这次多关注性能"）直接写 prompt 即可。

## 可落地的 Skill 模板

```
---
name: [稳定短名]
description: [任务 + 适用场景 + 期望产物]
---
# [Skill 名称]
## When To Use / Inputs / Workflow / Output / Boundaries / References
```

其中 **Boundaries**（边界）很关键——告诉 Agent 不要越界。例如代码审查 Skill：不要直接修改代码、不要评论纯风格偏好、不要把低置信度猜测写成确定结论。

## 5 个常见坑

1. **Skill 太长** → 换了个地方堆上下文
2. **description 太泛** → "帮助开发者写代码"什么都触发
3. **把权限写成建议** → "不要删除文件"只是建议，真正不能删除要靠 disallowed_tools/Hooks/沙箱
4. **没有输出格式** → 父 Agent 难消费结果
5. **没有维护机制** → Skill 是知识资产，会过期，需要 review + 版本管理 + 淘汰

## 深度分析与实践启示

**1. 渐进加载与 Hermes Agent Skill 机制的对齐**

文章描述的三层渐进加载（目录→SKILL.md→references/templates/scripts）与 Hermes Agent 的 `skill_view` / `skills_list` 机制完全同构：`skills_list` 返回目录+描述，`skill_view(name)` 加载 SKILL.md，`skill_view(name, file_path)` 按需读取 references 子文件。Hermes 在此基础上增加了 category 分类和 linked_files 自动发现。

**2. "Boundaries" 是被低估的设计维度**

多数 Skill 指南只关注"做什么"，本文强调 Boundaries（不要做什么）是一等公民。这与 Hermes Agent SKILL.md 的"Pitfalls"节异曲同工——记录不应该做的事往往比记录应该做的事更有价值，因为错误模式是团队最容易重复踩的。 `Hermes Agent Skills Source Code Analysis Shuge`

**3. 4 方分工是 Agent 产品化的分水岭**

Skills/Hooks/Subagents/MCP 四方分工不只是技术分类，更是产品化思维：把 Agent 从"一个大 prompt"拆解为可独立配置、独立版本管理、独立权限控制的模块。企业场景下不同团队挂不同 Skill 集（财务/研发/客服/内容），权限 preset 同步切换——这是 Agent 平台化的核心设计。

**4. 局限性：偏概念框架，缺乏落地度量**

文章提供了清晰的概念框架和模板，但缺乏：(1) Skill 触发准确率的实际数据；(2) 渐进加载 vs 全量加载的 token 节省对比；(3) 团队 Skill 库的版本管理实践（如何处理 breaking changes）。作为系列第 11 篇偏概论性质，后续可观测性篇可能补充运行时数据。

## 系列上下文

本文是 Claude Agent SDK 系列第 11 篇。系列前 10 篇覆盖：工具（Tool）、权限（Permission）、Session/Compaction、Subagent、MCP。下一篇预告：可观测性（Observability）。

## 相关实体

- [Hermes Agent Skills 源码分析](../ch04/415-hermes-agent-skills.html)
- [Harness Engineering Core Patterns](../ch05/052-harness-engineering.html)
- [Claude Code + Superpowers 实践](ch01/506-claude-code-skills-superpowers.html)
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-agent-sdk-skills-reusable-knowledge.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/prompt-engineering-guide.md)

---

