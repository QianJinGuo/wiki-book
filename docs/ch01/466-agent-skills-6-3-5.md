# Agent Skills 开发指南：6 字段规范、3 级加载、5 步评估闭环

## Ch01.466 Agent Skills 开发指南：6 字段规范、3 级加载、5 步评估闭环

> 📊 Level ⭐⭐ | 9.1KB | `entities/agent-skills-development-guide.md`

# Agent Skills 开发指南：6 字段规范、3 级加载、5 步评估闭环

基于 Anthropic 发起的 Agent Skills 官方规范（agentskills.io）和参考实现源码（skills-ref）的系统性开发指南。

## 核心概念

Agent Skills 是一种轻量、开放的文件夹格式规范，把过程性知识和项目特有的 context 打包成可移植、可版本化、按需加载的资产。它不是框架，也不是 SaaS，而是一个格式规范。

仓库许可证：Apache 2.0（代码）/ CC-BY-4.0（文档），由 Anthropic 发起，现在作为开放标准维护。

## 渐进式披露（Progressive Disclosure）

这是 Skills 设计的灵魂，三阶段加载模型：

| 层级 | 加载内容 | 时机 | Token 成本 |
|------|---------|------|-----------|
| 1. Catalog | name + description | 会话启动 | 约 50-100 tokens/skill |
| 2. Instructions | 完整 SKILL.md | skill 激活时 | 推荐 < 5000 tokens |
| 3. Resources | scripts/references/assets | 按需引用 | 视内容 |

**三条硬规矩**：

1. description 独自承担触发责任
2. SKILL.md 正文要克制（500 行 / 5000 token 内）
3. 大段资料移到外部文件

## 6 字段规范

SKILL.md 使用 YAML frontmatter + Markdown 正文。

### 字段约束表

| 字段 | 必需 | 限制 | 说明 |
|------|------|------|------|
| name | 是 | 64 字符 | 小写字母/数字/连字符，不能首尾/连续连字符，必须等于父目录名 |
| description | 是 | 1024 字符 | 描述做什么、何时使用 |
| license | 否 | - | 许可证名或文件路径 |
| compatibility | 否 | 500 字符 | 环境要求说明 |
| metadata | 否 | - | 任意键值对（建议加前缀） |
| allowed-tools | 否 | - | 空格分隔的预批准工具（实验性） |

### name 校验细节

- NFKC 归一化
- 不能大写
- 不能首尾连字符，不能出现 `--`
- 字符只能是 `isalnum()` 或 `-`
- 必须等于父目录名

## 目录结构

```
skill-name/
├── SKILL.md          # 必需：元数据 + 指令
├── scripts/          # 可选：可执行代码
├── references/       # 可选：参考文档
├── assets/           # 可选：模板、资源
└── ...               # 其他文件
```

## 开发流程

### 第一步：先真实地完成一次任务

从真实专长出发，而不是让 LLM 空想。记录奏效的步骤、做的纠正、输入输出格式、项目特有 context。

### 第二步：搭目录结构

第三步：写 frontmatter

第四步：写正文（每段都问：没有这条 agent 会搞错吗？）

第五步：跑 validate

```bash
skills-ref validate ./my-skill
```

## 最佳实践原则

1. **从真实专长出发**：项目特有材料，不是通用参考
2. **用真实执行来迭代**：读 agent 执行 trace，纠正加进 gotchas
3. **花好 context 预算**：加 agent 缺的，省 agent 知道的
4. **设计连贯单元**：不太窄也不太宽
5. **中等详细度**：简洁分步 + 可运行示例胜过详尽文档
6. **渐进式披露**：大型 skill 分层组织
7. **校准控制力**：指令精度匹配任务脆弱性
8. **给默认，别给菜单**：挑一个默认 + 简短提替代
9. **偏好流程，非声明**：教 agent 处理一类问题

## 高价值指令模式

| 模式 | 用途 |
|------|------|
| Gotchas 段 | 装进去 agent 不被告诉就会犯的具体错误纠正 |
| 输出格式模板 | 给具体结构模式，比散文可靠 |
| 多步工作流 checklist | 帮 agent 跟踪进度、防跳步 |
| 验证循环 | do work → validator → 修 → 重复 |
| Plan-Validate-Execute | 批量/破坏性操作专用 |
| 打包可复用脚本 | agent 重复发明的逻辑 → scripts/ |

## Description 优化方法论

description 是触发 skill 的唯一信号。

### 四条原则

1. 用祈使语气：Use this skill when...
2. 聚焦用户意图，非实现
3. 倾向 "pushy"：明确列出适用 context
4. 保持简洁（硬上限 1024 字符）

### 触发 eval

- 约 20 条 query：8-10 该触发 + 8-10 不该触发
- 每条跑 3 次算触发率
- 阈值 0.5：should-trigger > 0.5 算过，should-not-trigger < 0.5 算过
- Train/Validation split（60/40）防 overfitting

## 输出质量评估

### 测试用例三要素

- prompt：真实用户消息
- expected_output：人类可读的成功描述
- input files（可选）

### with/without 对比

每个用例跑两次：with skill vs without skill，得基线。

### benchmark.json 汇总

```json
{
  "run_summary": {
    "with_skill":    { "pass_rate": {"mean": 0.83, "stddev": 0.06} },
    "without_skill": { "pass_rate": {"mean": 0.33, "stddev": 0.10} },
    "delta":         { "pass_rate": 0.50, "time_seconds": 13.0, "tokens": 1700 }
  }
}
```

delta 显示 skill 的代价（更多时间/token）和收益（更高 pass rate）。

## 脚本工程实践

### 一次性命令工具

| 工具 | 生态 | 备注 |
|------|------|------|
| uvx | Python (uv) | 缓存激进，重复跑近即时 |
| npx | npm | 随 Node.js；下载运行缓存 |
| pipx | Python | 成熟替代 |
| deno run | Deno | npm:/jsr: specifier |
| go run | Go | 内建于 go；@version/@latest |

### 自包含脚本（内联依赖）

**Python PEP 723**：

```python
# /// script
# requires-python = ">=3.10"
# dependencies = [
#   "requests>=2.31",
#   "rich>=13",
# ]
# ///
```

用 `uv run script.py` 跑，零配置。

### 为 agentic 使用设计脚本的硬性要求

1. **避免交互式提示**（硬性）：agent 在非交互 shell 运行，无法应答 TTY。所有输入走 flag/env/stdin
2. **用 --help 记录用法**：含简述、flags、示例
3. **写有用错误信息**：说出了什么错、期望什么、该试什么
4. **用结构化输出**：JSON/CSV/TSV 而非自由文本
5. **数据与诊断分离**：stdout → 结构化数据；stderr → 进度/警告/诊断
6. **幂等性**、**输入约束**、**dry-run 支持**、**有意义的退出码**、**安全默认**

## 运行时工作原理

### 5 步骨架

发现 → 解析 → 披露 → 激活 → 管理

### Scope 与路径

| Scope | 路径 |
|-------|--------|
| Project | `<project>/.<client>/skills/` 、`<project>/.agents/skills/` |
| User | `~/.<client>/skills/` 、`~/.agents/skills/` |

`.agents/skills/` 是跨客户端共享的事实约定。

### 命名冲突解决

项目级覆盖用户级。

### Context 压缩保护

agent 截断/摘要旧消息时，应该豁免 skill 内容（skill 指令是持久行为指导）。这解释为什么 SKILL.md 要克制 - 越长越容易被误伤。

## 三个嵌套迭代循环

1. **触发循环**（description）：设计 → eval → 改进 → validation
2. **质量循环**（SKILL.md + scripts）：with/without eval → 失败分析 → 修改 → 评分
3. **实战循环**（真实任务）：执行 → trace → 纠正 → 更新 skill

## 关键数字记忆

| 数字 | 含义 |
|------|------|
| 64 | name 最大字符数 |
| 1024 | description 最大字符数 |
| 500 | compatibility 最大字符数 |
| 500 行 | SKILL.md 建议行整上限 |
| 5000 tokens | SKILL.md 建议 token 上限 |
| 50-100 tokens | 每 skill catalog 开销 |
| 20 query | 触发 eval 起步数量 |
| 3 次 | 每条 query 跑的次数 |
| 0.5 | 触发率阈值 |
| 60/40 | train/validation split 比例 |

## 相关实体

- [Claude Code Skill 编写指南](../ch03/076-claude-code.html) — Anthropic 官方 skill 编写指南
- [Superpowers 深度解读](../ch05/090-ai.html) — Rule/Gate/Hook 与 Iron Law 方法论
- [Anthropic Skill 设计模式](ch01/1299-anthropic.html) — 官方推荐的技巧和模式

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent-skills-development-guide-shugex-2026.md)

---

