# Greptile TREX：AI 代码审查的执行引擎与 Agent 嵌套架构

## Ch04.357 Greptile TREX：AI 代码审查的执行引擎与 Agent 嵌套架构

> 📊 Level ⭐⭐ | 7.3KB | `entities/greptile-trex-code-execution-artifact-generation.md`

# Greptile TREX：AI 代码审查的执行引擎与 Agent 嵌套架构

## 摘要

Greptile 构建了 TREX（Test, Run, Execute）——一个嵌入代码审查流程的代码执行层。核心洞察：静态代码审查有天花板，只有运行代码才能发现需要特定状态序列才能触发的 bug。TREX 采用"Agent 内嵌 Agent"架构，由主编排 Agent 识别问题后并行启动专用 TREX 子 Agent 执行调查，并通过多模态 artifact（截图、日志、视频、执行脚本）提供可验证的证据链。

## 核心要点

1. **Tests ≠ Bug-finding**：生成测试和发现 bug 是不同的活动——独立的测试生成 Agent 产生了无关噪声，未能找到真正的问题
2. **Agent 内嵌 Agent 架构**：主编排 Agent（Greptile reviewer）识别值得调查的问题，并行启动多个 TREX 子 Agent，每个子 Agent 继承编排 Agent 的上下文但拥有独立的上下文窗口
3. **多模态 Artifact 证据**：每个 TREX 发现附带截图、日志、API trace、执行脚本、视频——像"展示解题步骤"一样让下游 Agent 或人类可以验证
4. **模型无关性**：设计了模型无关的 harness，支持热切换不同供应商的模型，主编排 Agent 和子 Agent 可使用不同模型
5. **评测优先级**：recall（找到真实 bug）> precision（跨运行一致性）> 延迟——开发者宁愿多等一会儿也要准确的结果

## 深度分析

### 从独立 Agent 到嵌套架构的演进

TREX 的架构经历了三个阶段的演进，每一步都是对前一阶段失败的反思：

**阶段一：独立 Agent**。TREX 最初作为独立产品运行，与 Greptile 代码审查 Agent 完全分离。问题：两个 Agent 没有共享知识，经常重复探索代码库的相同部分，浪费计算资源。更关键的是，独立生成的测试与用户实际关注的问题脱节。

**阶段二：合并为单一 Agent**。将两个 Agent 合并为一个，试图解决上下文分裂问题。新问题：单个 Agent 同时处理代码审查 + 服务启动 + 截图 + 测试执行，上下文过载，无法干净地管理所有任务。

**阶段三：嵌套 Agent（当前方案）**。Greptile reviewer 作为编排 Agent，读取 diff、识别值得调查的问题，然后为每个问题启动专用的 TREX 子 Agent 并行执行。子 Agent 继承编排 Agent 的发现（避免重复探索），拥有独立上下文窗口，且范围限定在特定问题上。

这一演进揭示了多 Agent 系统设计的核心张力：**独立性带来上下文分裂，合并带来上下文过载，嵌套是两者的折中**。

### Artifact 即证据：从 bullet points 到多模态验证

TREX 第一版输出 bullet point 列表（"测试了 X，发现了 Y"），但这存在两个致命问题：

1. **信息不足**：审查者无法判断失败发生在哪个环节——是环境搭建？断言？还是环境问题？
2. **不可验证**：早期 Agent 会虚报测试覆盖，声称测试了某些场景但实际没有执行。Bullet point 无法证伪。

解决方案：为每个 TREX 发现生成多模态 artifact 集合——截图、日志、API trace、执行脚本。每种模态覆盖故事的不同部分。核心原则：**坏证据比没有证据更糟**。每个 artifact 必须给审查者足够的信息来自行验证执行过程。

视频 artifact 的价值尤为突出：推送动画变更时，TREX 捕获动画播放视频，审查者无需启动本地环境即可看到效果。类比小学数学教育：老师要求学生展示解题步骤，因为你无法从答案本身判断哪里出了错——Agent 也是如此。

### 模型无关性的工程实践

从一开始 TREX 就围绕模型无关 harness 设计，支持在前沿模型之间热切换而无需重构。深度超过大多数人的预期：主 Agent 和子 Agent 可以使用不同供应商的模型，同一审查中可以运行多个不同模型。

开源评测 harness 的表现与原生供应商 harness 持平——没有显著的质量损失。TREX 的差异化不在于运行哪个模型，而在于模型周围的基础设施：代码库索引、编排、artifact 生成。

### 设计权衡

- **安全性 vs 灵活性**：沙箱执行环境限制了可测试的场景范围
- **执行时间 vs 审查深度**：不可能对每个 PR 做深度执行分析，需要编排 Agent 智能选择值得调查的问题
- **延迟 vs 准确性**：团队有意将延迟优先级降低——开发者宁愿多等也要准确

## 实践启示

- **多 Agent 架构选择**：独立→合并→嵌套的演进路径是多 Agent 系统设计的典型模式，嵌套架构在上下文隔离和共享之间找到平衡
- **Evidence over Claims**：任何 AI 系统的输出都应附带可验证的证据，而非仅给出结论——这对 Agent 可信度至关重要
- **模型无关性是长期策略**：模型排行榜每月变化，围绕单一供应商 API 构建意味着每次排名变动都要重构
- **评测设计的优先级**：recall > precision > latency 的排序适用于大多数安全关键场景

## 相关实体

- [Claude Code 大型代码库 Harness](ch03/074-claude-code.md) — 代码库索引和 Agent 配置的工程实践
- [StackOverflow for Agents](ch03/044-agent.md) — Agent 间知识共享的另一种模式
- [GitHub Agentic Token 效率](ch03/044-agent.md) — Agent 在代码审查场景的 token 优化

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/greptile-trex-code-execution-artifact-generation.md)

---

