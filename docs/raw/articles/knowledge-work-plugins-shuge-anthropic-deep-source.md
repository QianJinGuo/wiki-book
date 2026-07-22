---
title: "knowledge-work-plugins拆解：Anthropic官方开源，4 种组件、3 级加载、2 层记忆，纯文件的 AI岗位插件集"
created:2026-06-10
updated:2026-06-10
type: article
platform:京东云开发者
author:术哥
source_url: https://mp.weixin.qq.com/s/1kUy7_iRcAHik8e9g4D7sA
sha256:e8c235693ada8170cd9d12da9dac1f11b756bd0cf294e4b53828b418717d9e45
source:京东云开发者
tags: [anthropic, knowledge-work-plugins, plugin, marketplace, claude-code, mcp, skills, progressive-disclosure, two-tier-memory, metaprogramming, security-review, role-based, shuge, jdcloud]
---

# knowledge-work-plugins拆解：Anthropic官方开源，4 种组件、3 级加载、2 层记忆，纯文件的 AI岗位插件集

作者：术哥 /京东云开发者

##仓库概览

GitHub 上有个仓库，2026 年1 月底创建，5个月内拿到近2 万 Stars（截至2026-06-09 数据来自 GitHub API）。不是什么框架，不是什么模型，而是一堆 Markdown 文件和 JSON 配置。

`anthropics/knowledge-work-plugins` 是 Anthropic官方开源的插件集合，给 Claude装上不同岗位的专业技能（销售、客服、产品、法务、金融、数据、营销、HR、工程）。19 个 Anthropic官方插件 +5 个合作伙伴插件（Slack/Salesforce、Apollo、Brand Voice、Common Room、Zoom）。

##1. 不是功能按钮，是岗位封装

每个插件对应一个企业职能。以 engineering插件为例：
- **10 个 Skills**（code-review、system-design、incident-response 等）
- **9 个 MCP 连接器**（Slack、Linear、GitHub、PagerDuty 等）
- **6 大连接器类别**

装了一个插件，Claude 就具备了该岗位的日常操作能力，而不只是会写代码。**岗位封装**而非**功能增强**。

仓库结构（典型 Monorepo）：
- `marketplace.json`（634 行 JSON 注册表，50+插件）
- `.github/workflows/`（4 个 CI脚本：插件扫描、MCP URL 检查、SHA 版本更新、失败回滚）
- `.github/policy/`（安全审查策略文件）

第三方插件通过 SHA锁版本，自动更新（`bump-plugin-shas.yml`）+失败回滚（`revert-failed-bumps.yml`）。

##2. 四种组件，各司其职

**Skills**：核心组件，每个 = 一个 `SKILL.md` 文件（Markdown + YAML frontmatter）。frontmatter关键字段：`name`（必需，kebab-case）、`description`（必需，含触发短语）、`argument-hint`（可选）、`user-invocable`（可选，默认 true）。Skill 内容用**祈使句**写指令，是给 Claude看的，不是给用户看的。`description` 用第三人称写触发条件（"This skill should be used when..."）。

**Commands**：Legacy格式 `/plugin-name:command-name`。Commands 有几个 Skills 不支持的独门功夫：`$ARGUMENTS`位置参数、`@path` 文件引用、`!` 内联 bash 执行、`allowed-tools`工具限制。Data插件的6 个核心操作（`/analyze`、`/explore-data`、`/write-query` 等）都用 Commands格式。

**Agents**：component-schemas.md 里直接写"Agents 在 Cowork 中 uncommonly used"。

**Hooks**：使用率低，但**安全设计值得注意**。审查 prompt（`.github/policy/prompt.md`）里有 "Hook范围"维度——Hook 必须通过项目相关性门控（gated vs ungated）。

##3.渐进式披露（Progressive Disclosure）

3 级信息加载：
- **Level1**：元数据（始终在上下文，约100词）——`name + description`
- **Level2**：`SKILL.md` 正文（触发时加载，建议1500-2000词）——核心知识
- **Level3**：`references/`、`examples/`、`scripts/`（按需加载，无限制）——详细参考

50多个插件的85+ 个 Skills 全量加载上下文会爆，分级加载意味着只有用户真正用到的 Skill 才消耗上下文。

##4. ~~ 占位符：工具无关抽象

Engineering插件的 `CONNECTORS.md` 定义6 个连接器类别，每个用 `~~category` 占位符：

|类别 | 占位符 | 默认产品 |替代方案 |
|---|---|---|---|
| Chat | `~~chat` | Slack | Microsoft Teams |
| Source control | `~~source control` | GitHub | GitLab、Bitbucket |
| Project tracker | `~~project tracker` | Linear、Asana、Atlassian | Shortcut、ClickUp |
| Knowledge base | `~~knowledge base` | Notion | Confluence、Guru |
| Monitoring | `~~monitoring` | Datadog | New Relic、Grafana |
| Incident management | `~~incident management` | PagerDuty | Opsgenie、Incident.io |

`~~` 占位符本质是**把工作流和具体工具解耦**——插件描述做什么（查工单、发消息、看监控），而不是用什么做（Jira、Slack、Datadog）。

工程效果：**Standalone + Supercharged 双模**。每个 Skill 在没有外部工具时也能独立工作（用户粘贴代码/描述问题/上传文件）。连接 MCP工具后能力自动增强（自动拉 PR diff、链接 ticket、查询监控数据）。

**限制**：`~~` 占位符目前**没有自动发现机制**——用户得手动编辑 `CONNECTORS.md`。如果企业用列表外的工具，需自己写 MCP Server 配置。

##5. Engineering插件深度拆解

**Code Review**：四维审查模型
-安全性：输入验证、权限控制、敏感数据泄露
-性能：N+1 查询、内存泄漏、不必要同步操作
-正确性：逻辑错误、边界条件、竞态条件
- 可维护性：代码复杂度、命名规范、注释质量

触发短语："review this before I merge" 和 "is this code safe?"

**Incident Response**（158 行 SKILL.md）：SEV1-4 分级响应体系
- SEV1：生产完全不可用，全团队响应
- SEV2：核心功能受损，相关团队响应
- SEV3：次要功能异常，排入 sprint 处理
- SEV4：体验层面的小问题，记录跟踪

含状态更新模板 + Post-Mortem 结构化流程。触发短语："we have an incident" 和 "production is down"。

**MCP 连接器**（9 个，全部 HTTP 类型 Streamable HTTP）：

```json
{
 "slack": { "type": "http", "url": "https://mcp.slack.com/mcp" },
 "linear": { "type": "http", "url": "https://mcp.linear.app/mcp" },
 "github": { "type": "http", "url": "https://api.githubcopilot.com/mcp/" }
}
```

**注**：Google Calendar 和 Gmail 两个服务的 URL字段在源码里是**空字符串**——这两个集成可能尚未完成。源码边界信息比 README诚实。

##6. 两层记忆系统：Productivity插件的创新

Productivity插件是设计最复杂的一个。核心创新 = **两层记忆**：
- **热缓存（CLAUDE.md）**：约30 个人的常用信息和术语，覆盖90%日常需求
- **深度记忆（memory/目录）**：完整术语表（glossary.md）、人员档案（people/）、项目详情（projects/）、公司上下文（context/）

三级查找流程：
1. 先查 `CLAUDE.md`（热缓存）——覆盖绝大多数日常场景
2. 再查 `memory/glossary.md`（完整术语表）——解码工作场所缩写和昵称
3. 最后查 `memory/people/`、`memory/projects/`（丰富细节）
4.都没找到 →问用户，然后学习并记住

`memory-management/SKILL.md`（323 行）定义**晋升（Promote）/降级（Demote）机制**：频繁使用的信息从深度记忆晋升到热缓存；长期未用降级回深度记忆。模仿人类记忆习惯。

典型场景：用户说 "ask todd to do the PSR for oracle"，插件自动解析——Todd 是谁、PSR是什么项目、Oracle 是哪个客户——动态从记忆系统查找，不是硬编码。

##7. 元编程：用插件创建插件

特殊插件 `cowork-plugin-management`——本身功能是**创建和定制其他插件**（Metaprogramming）。

**create-cowork-plugin**（270 行 SKILL.md）：五阶段引导式创建
1. Discovery（需求发现）
2. Component Planning（组件规划）
3. Design（设计）
4. Implementation（实现）
5. Review & Package（审查打包）

最终产物：`.plugin` 文件（zip格式）。三级模板：Minimal（仅 plugin.json）/ Standard（plugin.json + skills/ + .mcp.json）/ Full-Featured（完整组件 + skills/、agents/、hooks/、MCP、commands/）。

**cowork-plugin-customizer**（149 行 SKILL.md）：三种定制模式
- Generic setup（通用设置）
- Scoped（限定范围）
- General（全局）

四步流程：收集上下文 → 创建 Todo →逐项完成 →搜索 MCP 注册表推荐连接器。

意义：Anthropic 不只想提供固定插件——想让整个插件生态**自我生长**。

##8. 安全审查：prompt.md → schema.json

四大审查维度（`.github/policy/prompt.md`，99 行）：

|维度 | 检查内容 |
|---|---|
|基础安全 |恶意代码、隐私侵犯、欺骗功能、安全绕过 |
| Hook范围 | Hook是否有项目相关性门控（gated vs ungated） |
|遥测检测 | 未披露的外部网络调用（analytics、crash reporter） |
|行为匹配 | plugin.json 的 description 是否与实际行为一致 |

结构化审查结果（`.github/policy/schema.json`，52 行）字段：
- `passes`：布尔值，是否通过审查
- `has_broad_scope_hooks`：是否有未门控的广泛 Hook
- `has_undisclosed_telemetry`：是否有未披露遥测
- `description_matches_behavior`：描述与行为是否一致

只要出现恶意行为、广泛范围 Hook、未披露遥测、描述与行为不匹配中的任何一项，`passes = false`。

跑在 CI（`scan-plugins.yml`）——每次提交自动检查所有第三方插件。**供应链安全屏障**。

**限制**：本质是基于 LLM 的静态分析（审查 prompt本身是给 AI 的指令）。能发现明显恶意行为和文档不一致，但对**隐蔽 prompt注入攻击**可能还需要更强防御。

##9.横向对比（vs Cursor / OpenAI GPTs / GitHub Copilot）

数据来自 GitHub API（2026-06-09）+ 各平台公开文档。

|维度 | Anthropic | Cursor | OpenAI (GPTs) | GitHub Copilot |
|---|---|---|---|---|
|扩展格式 | Markdown + JSON（纯文件） | .mdc规则文件 | JSON 配置 + API | VS Code扩展 |
|岗位级封装 | ✅19 个岗位插件 | ❌ 仅代码规则 | ✅社区 GPTs（非岗位导向） | ❌ |
|外部工具连接 | MCP协议（开放标准） | MCP（部分支持） | Actions（需 OpenAPI schema） | VS Code API |
| 非技术人员可定制 | ✅ 编辑 Markdown | ❌ | 部分（自然语言） | ❌ |
| 安全审查 | ✅ CI 自动扫描 + Policy Schema | ❌ | 部分（OpenAI审核） | 部分（Marketplace审核） |
|渐进式披露 | ✅ 三级加载 | ❌ 全量加载 | ❌ 全量加载 | ❌ 全量加载 |

**关键判断**：
- **MCP 是核心变量**：MCP官方 servers仓库86,953 Stars（事实标准）。knowledge-work-plugins 通过 MCP 连接40+外部工具，是区别于 Cursor Rules / GPTs Actions 的关键
- **Cursor Skills还在早期**：awesome-cursor-skills 项目2026-04 创建，目前398 Stars
- **Anthropic短板**：合作伙伴插件只有5 个，相比 OpenAI GPT Store数量不在一个量级。Cowork 产品公开信息有限，真实企业环境表现无公开案例研究

##10.能力边界与实际落地建议

**限制**：
- **Skills 不是函数**：是给 Claude 的指令文档，不是可调用的函数。执行效果完全取决于 LLM 的理解能力。同样 Skill 在不同模型上可能表现差异很大
- **MCP 连接依赖外部**：`.mcp.json`里的 MCP Server 需要用户自行部署和认证。内网部署工具可能需自建 MCP Server
- **部分集成未完成**：Google Calendar / Gmail 空 URL是个例子

**落地优先级**（参考 txtmix.com）：
1. 先改 `.mcp.json`：连接企业工具（价值最大的环节）
2. 再改 `skills/`：把团队特有的术语、流程、规范写进 SKILL.md
3. 最后补 `commands/`：把高频操作封装成快捷命令

**对 Agent Builder 的借鉴价值**：渐进式披露、工具无关抽象、双模设计——不需要照搬整个架构，但**三级信息加载** + **`~~` 占位符**这两个思路在很多 Agent场景下适用。

##总结

knowledge-work-plugins：**设计理念清晰，工程实现扎实，生态还在早期**。

- ✅纯文件驱动让非技术人员能定制插件行为
- ✅岗位级封装让 Claude 从通用助手变成特定领域专家
- ✅ MCP协议提供连接外部工具的标准路径
- ✅渐进式披露解决上下文窗口有限的工程难题
- ✅ 安全审查机制在同类项目中属于超前设计

但5 个合作伙伴插件、未完成的集成、缺乏公开企业部署案例——都说明体系还在成长中。如果在做 AI Agent 相关工作，现在关注它不算早。
