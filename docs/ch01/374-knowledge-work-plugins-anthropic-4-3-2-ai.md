# knowledge-work-plugins拆解：Anthropic官方开源，4 种组件、3 级加载、2 层记忆，纯文件的 AI岗位插件集

## Ch01.374 knowledge-work-plugins拆解：Anthropic官方开源，4 种组件、3 级加载、2 层记忆，纯文件的 AI岗位插件集

> 📊 Level ⭐⭐ | 14.0KB | `entities/knowledge-work-plugins-shuge-anthropic-deep-source.md`

> -> **knowledge-work-plugins拆解：Anthropic官方开源，4 种组件、3 级加载、2 层记忆，纯文件的 AI岗位插件集**

## 核心要点

- `anthropics/knowledge-work-plugins` 是 Anthropic 官方开源的插件集合，给 Claude 装上销售/客服/产品/法务/金融/数据/营销/HR/工程等不同岗位的专业技能
- 共 19 个官方插件 + 5 个合作伙伴插件（Slack/Salesforce、Apollo、Brand Voice、Common Room、Zoom），5 个月近 2 万 Stars
- 4 种组件各司其职：Skills（核心，Markdown + YAML frontmatter）、Commands（Legacy，含 `$ARGUMENTS/@/!` 三种特殊语法）、Agents（Cowork 中不常用）、Hooks（带门控的安全设计）
- 渐进式披露（Progressive Disclosure）三级加载：元数据（约 100 词始终在线）→ SKILL.md 正文（触发时加载，建议 1500-2000 词）→ references/examples/scripts（按需）
- Engineering 插件含 10 个 Skills + 9 个 MCP 连接器 + 6 大连接器类别，code review 四维模型 + incident SEV1-4 分级体系
- Productivity 插件设计最复杂：两层记忆（热缓存 CLAUDE.md + 深度记忆 memory/）+ Promote/Demote 机制
- 元编程能力：`cowork-plugin-management` 插件本身是用来创建和定制其他插件，5 阶段引导流程 + 3 种定制模式
- 安全审查：4 维度（基础安全 / Hook 范围 / 遥测检测 / 行为匹配）+ CI 自动扫描 + Policy Schema 结构化结果
- `~~` 占位符实现工具无关抽象：插件描述做什么（查工单/发消息/看监控），不绑死用什么做（Jira/Slack/Datadog）
- Standalone + Supercharged 双模：没外部工具时独立工作，连接 MCP 后能力自动增强

## 深度分析

### 仓库定位：不是框架，是岗位封装

knowledge-work-plugins 2026 年 1 月底创建，5 个月内拿到近 2 万 Stars，截至 2026-06-09。不是什么 AI 框架，也不是模型——是一堆 Markdown 文件和 JSON 配置。每个插件对应一个企业职能（销售、客服、产品、法务、金融、数据、营销、HR、工程），装了一个插件，Claude 就具备该岗位的日常操作能力，而不只是会写代码。这是「岗位封装」而非「功能增强」的设计取向。

仓库结构是典型 Monorepo：`marketplace.json`（634 行 JSON 注册表，50+ 插件）、`.github/workflows/`（4 个 CI 脚本：插件扫描、MCP URL 检查、SHA 版本更新、失败回滚）、`.github/policy/`（安全审查策略文件）。第三方插件通过 SHA 锁版本，自动更新（`bump-plugin-shas.yml`）+ 失败回滚（`revert-failed-bumps.yml`）——这是企业级供应链管理的基本姿势。

### 四种组件：Skills 是核心

Skills 是核心组件，每个 = 一个 `SKILL.md` 文件（Markdown + YAML frontmatter）。frontmatter 关键字段：`name`（必需，kebab-case）、`description`（必需，含触发短语）、`argument-hint`（可选）、`user-invocable`（可选，默认 true）。Skill 内容用**祈使句**写指令，是给 Claude 看的不是给用户看的。`description` 用第三人称写触发条件（"This skill should be used when..."）——这种写法对 LLM 检索触发最有效。

Commands 是 Legacy 格式（`/plugin-name:command-name`），有几个 Skills 不支持的独门功夫：`$ARGUMENTS` 位置参数、`@path` 文件引用、`!` 内联 bash 执行、`allowed-tools` 工具限制。Data 插件的 6 个核心操作（`/analyze`、`/explore-data`、`/write-query` 等）都用 Commands 格式——结构化命令比 Skills 更适合高频数据操作。

Agents 在 Cowork 中 uncommonly used（component-schemas.md 原话）。Hooks 使用率低，但安全设计值得注意：审查 prompt（`.github/policy/prompt.md`）里有 "Hook 范围" 维度——Hook 必须通过项目相关性门控（gated vs ungated），避免 Hook 触发面过宽带来安全风险。

### 渐进式披露：三级信息加载解决上下文瓶颈

50 多个插件的 85+ 个 Skills 全量加载上下文会爆。三级加载机制意味着只有用户真正用到的 Skill 才消耗上下文：
- **Level 1**：元数据（始终在上下文，约 100 词）—— `name + description`
- **Level 2**：`SKILL.md` 正文（触发时加载，建议 1500-2000 词）——核心知识
- **Level 3**：`references/`、`examples/`、`scripts/`（按需加载，无限制）——详细参考

这个模式借鉴自 Claude Skills 的工程实践，把上下文预算当作一级资源来管理。

### `~~` 占位符：工具无关抽象

Engineering 插件的 `CONNECTORS.md` 定义 6 个连接器类别，每个用 `~~category` 占位符：Chat（默认 Slack）、Source control（默认 GitHub）、Project tracker（Linear/Asana/Atlassia）、Knowledge base（Notion）、Monitoring（Datadog）、Incident management（PagerDuty）。

`~~` 占位符本质是**把工作流和具体工具解耦**——插件描述做什么（查工单、发消息、看监控），而不是用什么做。工程效果是 Standalone + Supercharged 双模：每个 Skill 在没有外部工具时也能独立工作（用户粘贴代码/描述问题/上传文件），连接 MCP 工具后能力自动增强（自动拉 PR diff、链接 ticket、查询监控数据）。

**限制**：`~~` 占位符目前没有自动发现机制——用户得手动编辑 `CONNECTORS.md`。如果企业用列表外的工具，需自己写 MCP Server 配置。

### Engineering 插件：Code Review 四维模型

Code Review Skill 的四维审查模型：
- **安全性**：输入验证、权限控制、敏感数据泄露
- **性能**：N+1 查询、内存泄漏、不必要同步操作
- **正确性**：逻辑错误、边界条件、竞态条件
- **可维护性**：代码复杂度、命名规范、注释质量

触发短语："review this before I merge" 和 "is this code safe?"——用自然语言触发对应的 Skill 加载。

### 两层记忆：Productivity 插件的核心创新

Productivity 插件设计最复杂，核心创新是**两层记忆**系统：
- **热缓存（CLAUDE.md）**：约 30 个人的常用信息和术语，覆盖 90% 日常需求
- **深度记忆（memory/ 目录）**：完整术语表（glossary.md）、人员档案（people/）、项目详情（projects/）、公司上下文（context/）

三级查找流程：先查 `CLAUDE.md`（热缓存）→ 再查 `memory/glossary.md`（完整术语表）→ 最后查 `memory/people/`、`memory/projects/`（丰富细节）→ 都没找到则问用户，然后学习并记住。`memory-management/SKILL.md`（323 行）定义 Promote/Demote 机制：频繁使用的信息从深度记忆晋升到热缓存；长期未用降级回深度记忆——模仿人类记忆习惯。

典型场景：用户说 "ask todd to do the PSR for oracle"，插件自动解析——Todd 是谁、PSR 是什么项目、Oracle 是哪个客户——动态从记忆系统查找，不是硬编码。

### 元编程：用插件创建插件

特殊插件 `cowork-plugin-management` 本身功能是创建和定制其他插件（Metaprogramming）：

**create-cowork-plugin**（270 行 SKILL.md）：五阶段引导式创建——Discovery（需求发现）→ Component Planning（组件规划）→ Design（设计）→ Implementation（实现）→ Review & Package（审查打包）。最终产物是 `.plugin` 文件（zip 格式），三级模板：Minimal（仅 plugin.json）/ Standard（plugin.json + skills/ + .mcp.json）/ Full-Featured（完整组件 + skills/、agents/、hooks/、MCP、commands/）。

**cowork-plugin-customizer**（149 行 SKILL.md）：三种定制模式——Generic setup（通用设置）/ Scoped（限定范围）/ General（全局），四步流程：收集上下文 → 创建 Todo → 逐项完成 → 搜索 MCP 注册表推荐连接器。意义在于：Anthropic 不只想提供固定插件——想让整个插件生态自我生长。

### 安全审查：prompt.md → schema.json

四大审查维度（`.github/policy/prompt.md`，99 行）：
- **基础安全**：恶意代码、隐私侵犯、欺骗功能、安全绕过
- **Hook 范围**：Hook 是否有项目相关性门控（gated vs ungated）
- **遥测检测**：未披露的外部网络调用（analytics、crash reporter）
- **行为匹配**：plugin.json 的 description 是否与实际行为一致

结构化审查结果（`.github/policy/schema.json`，52 行）字段：`passes`、`has_broad_scope_hooks`、`has_undisclosed_telemetry`、`description_matches_behavior`。只要出现恶意行为、广泛范围 Hook、未披露遥测、描述与行为不匹配中的任何一项，`passes = false`。跑在 CI（`scan-plugins.yml`）——每次提交自动检查所有第三方插件。**这是同类项目中少见的供应链安全屏障**。

**限制**：本质是基于 LLM 的静态分析（审查 prompt 本身是给 AI 的指令）。能发现明显恶意行为和文档不一致，但对**隐蔽 prompt 注入攻击**可能还需要更强防御。

### 横向对比：MCP 是核心变量

| 维度 | Anthropic | Cursor | OpenAI (GPTs) | GitHub Copilot |
|---|---|---|---|---|
| 扩展格式 | Markdown + JSON | .mdc 规则文件 | JSON + API | VS Code 扩展 |
| 岗位级封装 | ✅ 19 个岗位插件 | ❌ 仅代码规则 | ✅ 社区 GPTs（非岗位导向） | ❌ |
| 外部工具连接 | MCP 协议（开放标准） | MCP（部分支持） | Actions（需 OpenAPI schema） | VS Code API |
| 非技术人员可定制 | ✅ 编辑 Markdown | ❌ | 部分（自然语言） | ❌ |
| 安全审查 | ✅ CI 自动扫描 + Policy Schema | ❌ | 部分（OpenAI 审核） | 部分（Marketplace 审核） |
| 渐进式披露 | ✅ 三级加载 | ❌ 全量加载 | ❌ 全量加载 | ❌ 全量加载 |

MCP 是核心变量：MCP 官方 servers 仓库 86,953 Stars（事实标准）。knowledge-work-plugins 通过 MCP 连接 40+ 外部工具，是区别于 Cursor Rules / GPTs Actions 的关键。

## 实践启示

### 落地优先级（参考 txtmix.com）

1. **先改 `.mcp.json`**：连接企业工具（价值最大的环节）
2. **再改 `skills/`**：把团队特有的术语、流程、规范写进 SKILL.md
3. **最后补 `commands/`**：把高频操作封装成快捷命令

### 对 Agent Builder 的可借鉴设计

不需要照搬整个架构，但 **三级信息加载** + **`~~` 占位符**这两个思路在很多 Agent 场景下适用：
- 三级加载：解决「N 个 Skill 全塞进上下文会爆」的工程难题
- 工具无关占位符：让 Skill 描述业务意图而不是绑定具体 SaaS 厂商，方便换工具时少改代码

### 关键判断

- **设计理念清晰，工程实现扎实，生态还在早期**。5 个合作伙伴插件、未完成的集成（Google Calendar / Gmail 空 URL）、缺乏公开企业部署案例——都说明体系还在成长中
- **Skills 不是函数**：是给 Claude 的指令文档，执行效果完全取决于 LLM 的理解能力。同样 Skill 在不同模型上可能表现差异很大
- **MCP 连接依赖外部**：`.mcp.json` 里的 MCP Server 需要用户自行部署和认证。内网部署工具可能需自建 MCP Server

### 何时不要用

- 你只需要一次性脚本生成——直接 prompt 比装插件更轻量
- 团队没有 Markdown / Git 工作流——Skill 文件需要协作编辑，纯文件驱动的优势用不上
- 工具有强烈的 SaaS 锁定——`~~` 占位符机制无法自动发现新工具，需自己维护 CONNECTORS.md

## 相关实体

- **Model Context Protocol (MCP)** — Anthropic 主导的开放标准，knowledge-work-plugins 通过 MCP 连接 40+ 外部工具
- **Agent Harness Engineering** — Skills + Hooks + Commands 的组合是 Harness 工程的纯文件实现
- **Claude Code** — 同一个生态，Claude Code 是承载 knowledge-work-plugins 的产品形态
- **Progressive Disclosure** — 三级加载是上下文预算管理的核心模式
- **Cursor Rules** — 横向对比中的竞品，.mdc 规则文件体系

---

