---
title: "skills anthropic openai comparison frontend design"
source_url: https://developers.openai.com/mcp"
tags: [openai]
ingested: 2026-04-28
sha256: 0970f348b620dbbd0280597befd2d5114844dca2226e13c524a198025ba33379
type: raw
created: 2026-05-10
updated: 2026-05-10
tags: []
---

## 打开 frontend-design：一个 42 行的 SKILL.md
Anthropic 官方维护了一个开源技能仓库（github.com/anthropics/skills），里面有 17 个示例技能，涵盖创意设计、文档生成、MCP 构建等方向。其中一些技能（docx、pdf、pptx、xlsx）直接驱动着 Claude.ai 的文档创建能力。
目录结构极简：
```
frontend-design/
  SKILL.md
  LICENSE.txt
```
就两个文件，SKILL.md 全文 42 行。
**元数据**：
```yaml
---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---
```
### description 为什么写这么长
渐进式披露机制下，智能体在决定"要不要加载这个技能"时，第一步看的就是 description。它相当于这个技能的"路由规则"。
frontend-design 的 description 做了三件事：
- **划定触发范围**：build web components, pages, dashboards, React components, HTML/CSS layouts...
- **列出具体任务类型**：用括号给出了 examples，消除歧义。
- **写明产出标准**：production-grade, avoids generic AI aesthetics。
如果写成"用于提升前端 UI 质量"——等于告诉模型"随时可能跟我有关"，结果是该用的时候没用，不该用的时候乱入。好的 description 读起来更像路由规则：精确匹配，不多不少。
### 正文指令的设计逻辑
**第一，强制模型先选一个审美立场，再开始写代码。**
Design Thinking 环节要求模型在动手之前先回答四个问题：
- **Purpose**：这个界面解决什么问题？给谁用？
- **Tone**：选一个明确的审美方向——brutally minimal、maximalist chaos、retro-futuristic、organic/natural、luxury/refined、playful/toy-like……
- **Constraints**：技术约束（框架、性能、可访问性）。
- **Differentiation**：什么让这个界面令人难忘？
强迫模型先建立清晰的创意方向，然后全程保持一致，相当于给模型装了一个"创意方向锁"。
**第二，负面约束写得比正面要求还狠。**
NEVER 清单：
- NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts)
- NEVER use cliched color schemes (particularly purple gradients on white backgrounds)
- NEVER converge on common choices (Space Grotesk, for example) across generations
"禁止模型在多次生成中塌缩到同一个安全选择上"——每次都得选一个不同的方向，不能反复用同一套"看起来还行"的模板。
为什么负面约束特别有效？模型对正向目标的理解往往太宽——"做出好看的 UI"有无数种解读。但"不要用 Inter 字体""不要用紫色渐变"非常具体，边界清晰，模型很容易遵守。
**第三，复杂度和目标要匹配。**
```
Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details.
```
### 小结：42 行背后的设计逻辑
- description 写得像路由规则，精确控制加载时机
- Design Thinking 环节锁定创意方向，防止模型滑向模板化
- 负面约束比正面要求更具体，用禁区稳定质量
- 实现复杂度和审美目标对齐，避免形式和内容脱节
- 全文只有 42 行，没有冗余。短，恰恰是它最强的地方
---
## 同一个标准，两家搭了不同的体系
### Anthropic（Claude Code）：Skill 是扩展体系的一个模块
Claude Code 的扩展层包括：
| 组件 | 做什么 | 加载方式 | 上下文成本 |
|------|--------|---------|-----------|
| CLAUDE.md | 常驻规则，每次会话自动加载 | 启动时全量加载 | 每次请求 |
| Skills | 可复用的知识和工作流 | 按需，渐进式 | 低（用到时才加载）|
| Hooks | 确定性脚本，在特定事件时自动执行 | 事件驱动 | 零 |
| MCP | 连接外部服务 | 启动时加载工具定义 | 每次请求 |
| Subagents | 隔离上下文的独立工作者 | 按需启动 | 与主会话隔离 |
| Agent teams | 多个独立会话协作 | 各自独立 | 各自独立 |
| Plugins | 打包以上所有东西为可安装单元 | 安装时展开 | 取决于内容 |
**明确的选择标准**：
- 如果 Claude 每次都应该知道它——放 CLAUDE.md
- 如果 Claude 有时候需要——放 Skill
- 如果必须 100% 执行，不能靠模型判断——放 hooks
- 如果需要外部系统的数据或操作——用 MCP
### OpenAI（Codex）：Skill 本身就是完整的工作流包
Codex 在 Agent Skills 标准基础上增加了 `agents/openai.yaml` 配置文件：
```yaml
interface:
  display_name: "Optional user-facing name"
  short_description: "Optional user-facing description"
  icon_small: "./assets/small-logo.svg"
  brand_color: "#3B82F6"
  default_prompt: "Optional surrounding prompt"
policy:
  allow_implicit_invocation: false
dependencies:
  tools:
    - type: "mcp"
      value: "openaiDeveloperDocs"
      description: "OpenAI Docs MCP server"
      transport: "streamable_http"
      url: "https://developers.openai.com/mcp"
```
这个文件做三件事：
1. **UI 元数据**：display_name、图标、品牌色、默认提示词——让技能在 Codex App 界面里有自己的"门面"
2. **调用策略**：`allow_implicit_invocation: false` 禁止模型隐式触发，只允许用户手动调用
3. **依赖声明**：技能可以自描述"我需要什么才能跑起来"
Codex 还在分发层做了更多设计：
- **多级作用域**：仓库级（.agents/skills）、用户级（$HOME/.agents/skills）、管理员级（/etc/codex/skills）、系统级（内置）
- **技能安装器**：`$skill-installer` 可以从其他仓库安装技能
- **技能创建器**：`$skill-creator` 通过对话引导创建新技能
### 差异对照
| 维度 | Claude Code（Anthropic）| OpenAI Codex |
|------|------------------------|--------------|
| 标准关系 | 发起了 Agent Skills 开放标准 | 采纳并扩展了该标准 |
| Skill 的定位 | 扩展体系中的一个模块 | 可移植的工作流包 |
| 触发控制 | `disable-model-invocation: true` | `allow_implicit_invocation: false` |
| 确定性动作 | 分离到 hooks，不经过模型判断 | 偏向写进 Skill 的 scripts/ |
| 上下文隔离 | subagents + agent teams | 渐进式披露为主 |
| 元数据与依赖 | SKILL.md frontmatter | 额外的 agents/openai.yaml |
| 分发与生态 | plugins + marketplaces | 多级作用域 + skill-installer |
**两种路线解决的是不同的核心矛盾**：
- **Anthropic** 更关心"模型应该管什么、不应该管什么"——把判断留给模型，把确定性动作和上下文隔离交给专门的机制
- **OpenAI** 更关心"技能怎么流转起来"——让技能可以自描述依赖、跨仓库安装、在 UI 上有门面
---
## 有副作用的技能：两家的共识
当技能能跑脚本、能写文件、能发消息时，它不再是"写作模板"，它是一个自动化工具。这时候不能让模型隐式触发它。
- **Claude Code**：在 SKILL.md 的 frontmatter 里设 `disable-model-invocation: true`——模型完全看不到这个技能，只有用户手动用 `/<name>` 调用时才加载
- **Codex**：在 agents/openai.yaml 里设 `allow_implicit_invocation: false`——效果相同
Claude Code 还走了一步更远：把确定性动作整体分离到了 hooks 层。技能里可以描述"应该跑 lint"，但实际执行由 hook 在事件触发时自动完成——不占上下文，不经过模型判断。
---
## 参考资料
- Agent Skills 开放标准（Anthropic 发起）：https://agentskills.io
- Anthropic 官方技能仓库：https://github.com/anthropics/skills
- Claude Code 扩展体系文档：https://code.claude.com/docs/en/features-overview
- OpenAI Codex Skills 文档：https://developers.openai.com/codex/skills