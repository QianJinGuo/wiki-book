## Ch02.021 Agent Skill 编写指南

> 📊 Level ⭐⭐ | 7.0KB | `entities/agent-skill-writing.md`

## Overview
Agent Skill = **岗位职责说明书 + 操作SOP + 避坑指南**的合集。让通用大模型秒变领域专家，不改变模型本身，通过结构化上下文注入实现。
核心设计哲学：**渐进式披露**（Progressive Disclosure）——AI 的上下文窗口不会被所有 Skill 细节塞满，只有在需要时才加载必要信息。

## Skill 目录结构
```
my-skill/
├── SKILL.md         # 必须：YAML元数据 + Markdown正文
├── scripts/         # 可选：可执行脚本（Python/Bash等）
├── references/       # 可选：参考文档（API说明、详细指南等）
└── assets/          # 可选：静态资源（模板、图片等）
```

## 渐进式披露三阶段
| 阶段 | AI 行为 | 对应比喻 |
|------|---------|---------|
| 发现 | 只加载 name + description，轻量判断是否匹配 | 外卖骑手看订单概要 |
| 激活 | 加载完整 SKILL.md 到上下文 | 骑手接单看详情 |
| 执行 | 按需加载 references/ 或执行 scripts/ | 看地图/联系客户 |

## SKILL.md 格式
### YAML 元数据字段
```yaml
---
name: pdf-processing
description: 从PDF中提取文本和表格、填写表单、合并文件。当用户需要处理PDF文档时使用此技能。
license: Apache-2.0
compatibility: "Python 3.10+, uv 包管理器"
metadata:
  author: your-team
  version: "1.0"
---
```
| 字段 | 必须 | 说明 |
|------|------|------|
| name | 是 | 小写字母、数字、连字符，不超过64字符，必须与父目录名一致 |
| description | 是 | 核心！告诉Agent何时激活，最多1024字符，要包含关键词 |
| license | 否 | 许可证 |
| compatibility | 否 | 环境要求 |
| metadata | 否 | 自定义键值对 |
| allowed-tools | 否 | 实验性，预批准工具列表 |
> ⚠️ **90%的人踩的坑**：description 不准确或缺少关键词 → Agent 根本不激活 Skill。

## 子页面
- [高质量编写规范](ch04-242-agent-skill-高质量编写规范.html) — 6 条核心编写原则
- 评估与迭代 — 触发测试、功能测试、基线对比方法论
- [进阶模式与治理](ch01-319-agent-skill-进阶模式与治理.html) — Anthropic 5 种进阶模式、安装部署、YAML 完整规范、实战调试案例

## Related
- [Hermes Agent](ch04-418-hermes-agent.html) — Skill 机制是 Hermes 的核心特性之一
- OpenClaw 架构解析 — OpenClaw 内置 Skill 系统实现
- MemOS Hermes 插件 — MemOS 的 Skill 管理能力
- [原始文章存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-skill-writing-guide.md)
- [Skill 设计模式](ch07-002-skill.html) — 5种设计模式系统指南

## 深度分析
### 渐进式披露的工程价值
渐进式披露（Progressive Disclosure）不只是一个 UX 模式，更是一种**上下文经济学**。当 Agent 需要在数千个 Skill 中做选择时，每次都加载完整文档会迅速耗尽上下文窗口。分阶段加载机制让 AI 在"发现阶段"只获取最小线索，在"激活阶段"才注入完整指令，在"执行阶段"才调用外部资源。这种分层策略本质上是在用空间换时间和精度。

### Description 字段的决定性作用
文章指出"90%的人踩的坑"集中在 description 字段，其核心问题在于：**Agent 的激活逻辑本质上是语义匹配**，而不是精确查找。如果 description 缺少领域关键词，Agent 的路由层就无法将用户请求正确路由到这个 Skill。这意味着 description 的编写质量直接决定了 Skill 是否被触发。一个好的 description 需要包含触发场景的多个变体（同义词、场景描述、用户可能的表达方式），而不仅仅是功能堆砌。

### 评估方法论的核心逻辑
对比评估（with_skill vs without_skill）的设计体现了**增量价值度量**的思想。Skill 的价值不在于它做了什么，而在于它相比基线模型带来了什么提升。通过 delta 指标（pass_rate、time_seconds、tokens）可以量化 Skill 对最终效果的影响。但关键在于：断言设计必须可验证、可观察、可计数——模糊的评估标准只会产生噪音而非信号。

### Agentic 脚本的设计约束
脚本设计规范中，"避免交互式提示"被作为硬性要求提出，这是因为 Agent 运行在非交互式 Shell 环境中。这揭示了一个核心原则：**工具的调用方式必须与执行环境匹配**。其他约束（--help、幂等性、空运行支持、有意义的退出码）都服务于同一个目标：让 AI 能够可靠地预测和验证脚本行为，而不是在运行时遭遇意外。

## 实践启示
### 从最小可用 Skill 开始
不要试图一开始就设计一个"完美"的 Skill。正确的姿势是：从真实任务中提炼，从 2-3 个测试用例开始。先让 Skill 能工作，再通过评估结果迭代优化。过于宏大的设计只会让 Skill 变得臃肿且难以调试。

### Description 编写要"多触点"
在编写 description 时，需要考虑用户会用哪些自然语言表达来请求这个功能。建议列出至少 5-10 种不同的触发方式，包括正式请求、口语化表达、错误尝试场景等。例如，"PDF处理"的 description 不仅要写"处理PDF文档"，还应该包含"提取PDF内容"、"合并PDF文件"、"填写PDF表单"等具体场景。

### 用评估驱动迭代
建立**量化反馈闭环**：每次修改 Skill 后，运行评估对比 with_skill 和 without_skill 的差异。重点关注"带 Skill 才通过"的断言，这些是 Skill 真正产生价值的地方。如果某些断言在两种配置下都通过，说明这不是 Skill 的增量贡献，可以考虑移除。

### Scripts 作为 Skill 的延伸
当 Skill 中的描述性知识不足以完成复杂任务时，应该将重复性操作封装为 scripts。但必须遵循 agentic 脚本规范：非交互式、有 --help、支持 --dry-run、幂等性、结构化输出。这些约束不是负担，而是让 AI 能够可靠调用脚本的信任基础设施。
## 相关实体

- [gene/gep — evomap×清华 提出的「策略基因」经验对象框架（arxiv 2604.15097）](ch09-011-gene-gep-evomap-清华-提出的-策略基因-经验对象框架-arxiv-2604-15097.html)
- MOC

---
