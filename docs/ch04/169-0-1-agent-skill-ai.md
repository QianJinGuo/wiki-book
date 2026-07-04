# 从 0 到 1 教你写 Agent Skill，让 AI 懂你的"潜规则

## Ch04.169 从 0 到 1 教你写 Agent Skill，让 AI 懂你的"潜规则

> 📊 Level ⭐⭐ | 12.3KB | `entities/agent-skill-writing-guide.md`

[Agent Skill Writing Guide](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agent-skill-writing-guide.md)

## 核心价值
Agent Skill = **岗位职责说明书 + 操作SOP + 避坑指南**的合集。让通用大模型秒变领域专家，不改变模型本身，通过结构化上下文注入实现。

## Skill 目录结构
```
my-skill/
├── SKILL.md         # 必须：YAML元数据 + Markdown正文
├── scripts/         # 可选：可执行脚本（Python/Bash等）
├── references/      # 可选：参考文档（API说明、详细指南等）
└── assets/          # 可选：静态资源（模板、图片等）
```

## 核心设计哲学：渐进式披露
像外卖骑手接单一样分三步：
| 阶段 | AI 行为 | 对应 |
|------|---------|------|
| 发现 | 只加载 name + description，轻量判断是否匹配 | 外卖平台订单概要 |
| 激活 | 加载完整 SKILL.md 到上下文 | 骑手接单看详情 |
| 执行 | 按需加载 references/ 或执行 scripts/ | 看地图/联系客户 |
好处：上下文窗口不被塞满，保持思考速度。

## SKILL.md 格式
YAML 前置元数据 + Markdown 正文。
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
**元数据字段**：
| 字段 | 必须 | 说明 |
|------|------|------|
| name | 是 | 小写字母、数字、连字符，不超过64字符，必须与父目录名一致 |
| description | 是 | 核心！告诉Agent何时激活，最多1024字符，要包含关键词 |
| license | 否 | 许可证 |
| compatibility | 否 | 环境要求 |
| metadata | 否 | 自定义键值对 |
| allowed-tools | 否 | 实验性，预批准工具列表 |
⚠️ **90%的人踩的坑**：description 不准确或缺少关键词 → Agent 根本不激活 Skill。

## 高质量 Skill 编写规范
1. **从真实经验提炼**，不要凭空想象——和AI协作完成任务后提炼，或从事故复盘/代码规范文档中生成
2. **像函数一样设计边界**——范围过小（多次激活+冲突）/ 范围过大（臃肿+误触发）
3. **写"方法"而不是"答案"**——教会AI如何思考，而不是给出特定答案
4. **预设"默认值"**——给推荐方案+备选，而不是罗列菜单让AI犹豫
5. **"坑点（Gotchas）"章节**——最有价值，把"只有踩过坑才知道"的细节写进去
6. **提供输出模板和检查清单**——Markdown模板 + [ ] 进度跟踪清单

## 评估与迭代
### 测试用例设计
一个测试用例 = 提示词 + 预期输出 + 输入文件（可选）。
技巧：

- 从2-3个开始，不要一开始就写很多
- 变化措辞、详细程度（随意↔精确）
- 覆盖边缘情况
- 使用真实上下文（文件路径、列名等）

### 运行评估
两次运行对比：**with_skill vs without_skill**
输出结构：
```
iteration-1/
├── eval-top-months-chart/
│   ├── with_skill/outputs/ + timing.json + grading.json
│   └── without_skill/...
└── benchmark.json（汇总统计）
```

### 断言编写
好的断言：可编程验证 / 具体可观察 / 可计数
弱的断言：太模糊 / 太脆弱（措辞一变就失败）

### 聚合结果分析
| delta 指标 | 含义 |
|-----------|------|
| pass_rate | Skill 带来的通过率提升 |
| time_seconds | Skill 带来的时间额外开销 |
| tokens | Skill 带来的 Token 额外消耗 |
分析模式：

- 两种配置都通过的断言 → 移除，无有用信息
- 两种都失败 → 断言本身有问题，需修复
- 带Skill才通过 → Skill 明显增加价值的地方
- 高标准差 → 收紧指令，减少模糊性

### 迭代原则
- 从反馈中泛化，不做狭隘补丁
- 保持精简：少而好的指令 > 详尽规则
- 解释为什么：基于推理的指令（"做X是因为Y"）> 僵化指令
- 打包重复工作：每个测试用例都写了类似辅助脚本 → 应打包进 Skill

## scripts/ 编写规范
### 自包含脚本（PEP 723 / Deno / Bun）
Python (PEP 723)：`# /// script` 声明依赖
Deno：`npm:`/`jsr:` 导入说明符
Bun：自动安装缺失包
Ruby：`bundler/inline`

### Agentic 脚本设计原则
- **避免交互式提示**——硬性要求，Agent 在非交互式Shell中运行
- **用 --help 记录用法**——是Agent学习脚本接口的主要方式
- **编写有帮助的错误消息**——说明哪里错了、期望什么、可尝试什么
- **使用结构化输出**——JSON/CSV/TSV，stdout发数据，stderr发诊断
- **幂等性**——"如果不存在则创建" > "重复时失败"
- **空运行支持**——`--dry-run` 预览破坏性操作
- **有意义的退出码**——不同失败类型用不同退出码
- **可预测的输出大小**——限制输出或支持 `--output` 写到文件

## 深度分析
### 1. "渐进式披露"是工程上对注意力经济的妥协
原文将 Skill 加载类比外卖骑手三阶段（发现→激活→执行），这个比喻揭示了一个核心矛盾：大模型上下文窗口虽大，但注意力会随token增加而衰减。渐进式披露不是优化技巧，而是**在有限注意力下务实地分配信息密度**的系统设计。发现阶段仅加载 name + description，本质上是用轻量索引替代重型加载，与检索增强生成（RAG）的分块策略同构。

### 2. description 字段是 Skill 系统的"弱纽带"
原文警告"90%的人踩的坑：description 不准确或缺少关键词 → Agent 根本不激活"，这暴露了 Skill 激活依赖**文本相似度匹配**而非语义理解。description 的1024字符限制和关键词要求，本质上是在用人工制造的"弱纽带"弥补 Agent 对自身能力边界认知的不足。这不是缺陷，而是当前系统下限的务实适配——真正强的纽带需要动态能力注册和精确调用协议（如 `Hermes Skill System` 描述的工具调用）。

### 3. "从真实经验提炼"是 Skill 质量的决定性因素
原文强调"和AI协作完成任务后提炼，或从事故复盘/代码规范文档中生成"，这指向一个关键洞察：**Skill 不是 prompt 模板，而是组织记忆的格式**。凭空想象的 Skill 要么过于抽象（缺乏情境），要么过于具体（只能复现特定任务）。真实经验提炼的 Skill 天然携带了触发上下文、边界条件和失败模式，这与 `Ai Skill Evolution Framework` 中"经验锚定"的概念一致。

### 4. 评测体系的核心价值是建立 Skill 迭代的反馈回路
原文设计的 `with_skill vs without_skill` 对比框架，以及 delta 指标（pass_rate、time_seconds、tokens），实质上是在构建**可量化的 Skill 价值证明**。这个反馈回路的存在比单个断言的质量更重要——它让 Skill 从"感觉有用"变成"可证明有用"。但需要注意：原文也指出了高标准差意味着"收紧指令"，这说明 Skill 质量不仅依赖内容，还依赖指令的精确性。

### 5. Agentic 脚本的幂等性要求是自动化可靠性的基石
原文强调"如果不存在则创建 > 重复时失败"，这对 Agent 自动化至关重要。与人类不同，Agent 不会对重复操作产生肌肉记忆式的警觉，重复失败会直接导致工作流中断。幂等性 + `--dry-run` 组合实际上是在给 Agent 创造"安全探索空间"，这是 `Skill Engineering Ai As Algorithm` 中"可预测性保障"在脚本层的具体实现。

## 实践启示
### 1. description 写完后，用同义词工具生成 5 个变体，测试是否能被正确激活
不要只写一版 description。在不同任务表述（"处理 PDF"、"提取 PDF 内容"、"把 PDF 变文字"）下测试 Skill 是否被触发，确保关键词覆盖了真实用户的多样化表达方式。

### 2. 建立 Skill 边界设计的"半径原则"
新 Skill 应该从**单一职责**开始，当发现同一个任务被两个 Skill 处理时再合并，而不是一开始就设计"大而全"的 Skill。用实际触发冲突作为合并信号，而非主观判断。

### 3. Gotchas 章节是 Skill 的护城河——优先写它
把"只有踩过坑才知道"的细节结构化地写入 Skill，比写正确的操作步骤更有价值。具体做法：每次与 AI 协作出现返工，停下来问"这个坑能不能结构化地写进 Skill"，然后立即写。

### 4. 评测先跑 2-3 个用例，聚焦"带 Skill 才通过"的断言
不要追求覆盖率，先找出 Skill 明显增加价值的场景。把这些场景的断言作为基准——它们代表 Skill 的核心价值主张，是后续迭代的"保底线"。

### 5. 脚本必须附带 --help 和结构化错误消息
这是 Agent 与脚本交互的唯一界面。错误消息应该包含：哪里错了（文件不存在？参数格式错误？）、期望什么（需要 JSON 格式？路径需要绝对路径？）、可以尝试什么（用 `--dry-run` 预览？检查文件权限？）。结构化输出（JSON/CSV）让 Agent 能编程解析，空运行支持让 Agent 能安全试错。

## 关联阅读
→  — Skill 系统的架构设计，包含工具调用的精确协议
→  — Skill 的演进框架，解释"经验锚定"如何提升 Skill 质量
→ `Ai Skill Metrics System` — Skill 的量化评测体系，与本文的 eval 方法互补
→  — 从算法角度理解 Skill 的可预测性要求
→ `Agent Skills Teams Architecture Evolution Selection Guide` — 多 Agent 场景下 Skill 的组合与选择策略

## 相关实体
- [9个Agent技能模块化SageMaker微调生命周期](ch04/277-ai.md)
- [Qoder Skills 完全指南：从零开始，让 AI 按你的标准执行](ch04/256-skill.md)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程 — 腾讯技术工程](ch04/196-tencent-vibe-coding-to-agentic-engineering-backend.md)
- [Thin Harness Fat Skills](ch04/256-skill.md)

- [Anthropic 14 个 Agent Skills 设计模式](ch04/256-skill.md)
- [SkillX — 层次化技能知识库](ch04/256-skill.md)
- [SkillClaw](ch04/256-skill.md)
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](ch04/256-skill.md)
- [Trace2Skill: 轨迹经验蒸馏为可迁移 Agent Skills](ch04/256-skill.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/wiki-master-map.md)

---

