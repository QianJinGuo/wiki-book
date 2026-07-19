# Qoder Skills 完全指南

## Ch07.034 Qoder Skills 完全指南

> 📊 Level ⭐⭐ | 9.8KB | `entities/qoder-skills-complete-guide.md`

## 核心概念
**Skill** 是 AI 世界里的菜谱（Recipe），是一个开放标准的文件夹，包含一套告诉 AI 如何处理特定任务或工作流的指令。

### Skill 的本质
- **定义**: 教 AI 一次，永久受益 — 不再需要在每次对话中重新解释你的偏好、流程和领域知识
- **文件结构**: kebab-case 命名的文件夹，包含 SKILL.md、scripts/、references/、assets/
- **三级渐进式披露机制**:
  1. YAML Frontmatter（元数据头部）→ 始终加载
  2. SKILL.md 正文 → 按需加载
  3. scripts/references/assets → 执行时按需读取

### 跨平台兼容性
- ✅ Qoder（Quest 模式、AIDE 模式、CLI）
- ✅ Claude.ai 网页端
- ✅ Claude Code CLI
- ✅ JetBrains 插件（即将支持）
- ✅ Claude API（通过 `container.skills` 参数）

## 三大关键对比
| 维度 | Skill | Slash Command | MCP | Rules |
|------|-------|---------------|-----|-------|
| 触发方式 | AI 自主判断 + 可主动 `/` 调用 | 用户主动输入 `/xxx` | 工具调用时自动触发 | 始终在上下文中生效 |
| 内容复杂度 | 高：多步骤、脚本、资源、引用文件 | 低：固定短提示词 | 中：工具接口定义 | 低：全局约束规则 |
| 上下文占用 | 极低（只加载 meta data） | 中 | 高 | 低 |
| 可分发性 | ✅ 天然适合团队共享 | ❌ 难以共享 | ✅ 通过服务端共享 | ❌ 通常个人配置 |

## 三大使用场景
### 场景一：文档与资产创建
适合运营、产品、设计、所有人。需要生成符合特定风格、规范或品牌标准的输出物。

### 场景二：工作流自动化
适合开发、技术管理者、任何有重复性工作的人。多步骤流程，期望每次输出结果一致。

### 场景三：MCP 能力增强
适合已经连接了 MCP 的开发者、技术团队。有了工具访问权限，但缺乏"怎么用好"的工作流知识。

## 安装方式
1. **命令行安装**: `npx skills add <skill-name>`
2. **手动放置**: 复制到 `~/.qoder/skills/` 或 `<项目根>/.qoder/skills/`
3. **Quest 模式生成**: 直接对话让 AI 创建 Skill

## 进阶模式
1. **顺序工作流编排**: 严格按顺序执行的多步流程
2. **跨 MCP 协调**: 工作流跨越多个外部服务
3. **迭代优化循环**: 需要多轮优化才能达到质量标准
4. **上下文感知的工具选择**: 根据文件类型或场景选择不同工具
5. **领域专业知识内嵌**: 将复杂的合规规则、行业知识内嵌到工作流中

## 测试与迭代
- **触发测试**: 确保 Skill 在正确时机加载
- **功能测试**: 运行同一请求 3-5 次，检查一致性
- **基线对比**: 对比有无 Skill 的效果

## 团队协作
- **用户级安装**: `~/.qoder/skills/` — 个人偏好、跨项目通用
- **项目级安装**: `<项目根>/.qoder/skills/` — 团队规范、项目特定流程（推荐提交到 Git）
---
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/qoder-skills-完全指南从零开始让-ai-按你的标准执行-v2.md)

## 深度分析
**Qoder Skills 的本质是"知识封装"而非"工具集成"**。与传统的 prompt 模板或固定指令不同，Skill 通过三级渐进式披露机制（YAML meta → SKILL.md → scripts/references/assets）实现了"按需加载"的知识管理范式。这种设计让 AI 在每次执行时只加载必要的上下文，避免了上下文窗口的浪费，同时保留了深度执行复杂任务的能力。
**开放标准是 Skill 生态的核心竞争力**。文件结构（SKILL.md、scripts/、references/、assets/）采用约定俗成的目录规范，使得任何一个 Skill 都可以在 Qoder、Claude.ai、Claude Code、JetBrains 插件等不同平台间无缝迁移。这种"一次编写，到处运行"的特性，是 Skill 区别于平台私有指令体系的关键。
**三级渐进式披露机制解决了一个核心矛盾**：既要 AI 精确遵循特定规范，又要保持足够的通用性。YAML Frontmatter 始终加载确保元数据可用；SKILL.md 按需加载承载领域知识；scripts/references/assets 执行时按需读取提供深度上下文。这三层设计让 Skill 能够承载从简单单步任务到复杂多步骤工作流的广泛场景。
**Skill 与 MCP 的定位差异值得注意**。MCP 是工具接口定义，擅长解决"AI 能调用什么"的问题；Skill 是工作流知识封装，擅长解决"AI 怎么用好工具"的问题。两者是正交互补的——MCP 提供能力边界，Skill 定义使用模式。

## 实践启示
1. **从高频重复场景切入**：文档生成、代码审查、测试用例创建等具有明确规范的场景是 Skill 的最佳候选。避免为偶发任务创建 Skill，维护成本会抵消收益。
2. **知识精确度优于完整度**：给 AI"恰好够用"的知识比堆砌完整文档更有效。过多信息会导致 AI 分心，过少则无法保证输出质量。经验值：单次 Skill 调用消耗的上下文不超过总窗口的 20%。
3. **项目级 Skill 优于用户级**：团队规范、项目特定流程强烈建议放在 `<项目根>/.qoder/skills/` 并提交 Git。这样可以确保团队成员获得一致的 AI 执行标准，也便于 code review 和版本管理。
4. **Skill 需要迭代测试**：触发测试（是否在正确时机加载）和功能测试（输出是否稳定）是基本要求。建议用同一请求运行 3-5 次观察一致性，并与无 Skill 状态做基线对比。
5. **跨平台发布考虑**：如果你创建的 Skill 具有通用价值，考虑提交到社区 Skill 市场。开放标准意味着平台无关性，但命名和文档需要足够清晰才能被其他用户复用。
6. **与 MCP 协同使用**：已接入 MCP 的开发团队，可以用 Skill 封装"什么场景用什么 MCP 工具"的决策逻辑，让 AI 在正确的上下文自动调用正确的工具。

## 相关实体
- [qoder skills](ch07/034-qoder-skills.html)
- [Agent/Skills/Teams 架构演进过程及技术选型之道](../ch04/236-agent-skills-teams.html)
- [Agent 时代架构师技能指南](../ch03/070-skills.html)
- [从 0 到 1 教你写 Agent Skill，让 AI 懂你的"潜规则"](../ch04/607-agent-skill.html)
- [Hermes Agent](../ch03/092-hermes-agent.html)
- [你写的 Skill，及格了吗？](../ch04/267-skill.html)
- [Hermes Agent Skill](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent-skill.md)
- [9个Agent技能模块化SageMaker微调生命周期](../ch04/400-aws-sagemaker-ai-agent.html)
- [重新定义Skill开发：保姆级教程&一站式开发助手发布](../ch04/267-skill.html)
- [SkillX — 层次化技能知识库](ch07/051-skillx.html)
- [Anthropic 14 个 Agent Skills 设计模式](../ch04/251-anthropic-agent.html)
- [Perplexity 内部 Skill 设计指南：四维体系与维护方法论](../ch04/267-skill.html)
- [SkillClaw](../ch04/448-skillclaw-nacos-agent-skill-registry.html)
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](ch07/017-hermes-skill.html)
- [Trace2Skill: 轨迹经验蒸馏为可迁移 Agent Skills](../ch04/394-agent-skills.html)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程 — 腾讯技术工程](../ch04/203-tencent-vibe-coding-to-agentic-engineering-backend.html)
- [Thin Harness Fat Skills](../ch05/079-thin-harness-fat-skills-ai.html)
- [Code Intelligence Changelog](../ch04/472-code-intelligence-changelog.html)

---

