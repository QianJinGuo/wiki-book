---
title: 工作流的 Skill 怎么写？从 7 个顶级 Skill 中提炼的模式与最佳实践
source_url: https://mp.weixin.qq.com/s/aoNwyY5ZkCRMkZirn1rElQ
publish_date: 2026-05-10
tags: [wechat, article, claude, openai, agent, llm, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 70726572029431e3d81cefa1d247f442580bad104820d4ad1bd75f7d1f7192a5
---
---
source: wechat
source_url: https://mp.weixin.qq.com/s/aoNwyY5ZkCRMkZirn1rElQ
ingested: 2026-05-09
feed_name: 阿里云开发者
wechat_mp_fakeid: MP_WXS_3239545440
source_published: 2026-04-27
---
# 工作流的 Skill 怎么写？从 7 个顶级 Skill 中提炼的模式与最佳实践
一、Skill 是什么
Skill 是一个文件夹，核心是  ` SKILL.md  ` 文件，使用  YAML frontmatter + Markdown  正文  的格式。当 LLM 判断需要某个  Skill  时，会调用  ` skill  ` 工具加载它，SKILL.md 的全部内容会作为 tool-result 注入到对话上下文中，LLM 读到后自主决定怎么执行。
    my-skill/├── SKILL.md              # 主文件（必须）├── scripts/              # 可执行脚本（可选）├── references/           # 详细参考文档（可选，按需加载）├── resources/            # 模板、清单等资源（可选）└── examples/             # 示例（可选）
关键机制  ：  Skill 本质是"知识注入"——它不会动态生成新工具，而是把指令文本注入到 LLM 的上下文中，LLM 用已有的工具（bash、read、edit 等）来执行这些指令。
二、Frontmatter：
决定 Skill 是否被加载的"门面"
** 2.1 必填字段  **
字段  |  作用  |  示例
---|---|---
` name  ` |  唯一标识符，小写连字符  |  ` test-driven-development  `
` description  ` |  最关键  ——LLM 通过它决定是否加载  |  见下方对比
** 2.2 Description 的写法决定加载率  **
    # ✅ 好的 description — 包含触发短语和关键词description: Deploy applications and websites to Vercel. Use when the user   requests deployment actions like "deploy my app", "push this live",   or "create a preview deployment".  
    # ✅ 好的 description — 定义时序位置description: Use when implementing any feature or bugfix, before writing   implementation code  
    # ❌ 差的 description — 太模糊description: Helps with deployment stuff
核心原则  ：
* 列举触发短语  ：  把用户可能说的话写进去（"deploy my app"、"push this live"）
* 定义时序位置  ：  说明"在什么之前/之后"使用（"before writing implementation code"）
* 包含产品关键词  ：  如果覆盖大平台，把所有产品名列出来
** 2.3 可选扩展字段  **
从 7 个 Skill 中观察到的扩展字段：
字段  |  来源  |  作用
---|---|---
` references  ` |  OpenCode cloudflare  |  声明最重要的参考文档
` allowed-tools  ` |  Google Labs stitch-loop  |  声明需要的工具权限
` type  ` |  Dean Peters discovery-process  |  声明 Skill 类型（workflow/component）
` best_for  ` |  Dean Peters discovery-process  |  最适合的场景列表
` scenarios  ` |  Dean Peters discovery-process  |  具体的触发场景示例
` estimated_time  ` |  Dean Peters discovery-process  |  预估执行时间
三、5 种核心设计模式
** 模式 1：线性流程  **
适用场景  ：  部署、安装、迁移等有明确步骤的操作。
代表  ：  openai/skills — vercel-deploy  （77 行）
结构  ：
    # 标题## Prerequisites（前置条件）## Quick Start（主流程：Step 1 → 2 → 3）## Fallback（降级方案）## Troubleshooting（故障排除）
关键技巧  ：
技巧  |  示例  |  为什么有效
---|---|---
安全默认值  |  "Always deploy as preview, not production"  |  防止 LLM 做出危险操作
具体命令  |  每步给出可直接执行的 bash 命令  |  LLM 不需要猜测
超时提示  |  "Use a 10 minute (600000ms) timeout"  |  防止 LLM 因超时中断
降级方案  |  CLI 失败有 Fallback 脚本  |  提供 B 计划
负面指令  |  "Do not curl the deployed URL to verify"  |  明确禁止不该做的事
适用判断  ：  如果你的 Skill 可以用"先做 A，再做 B，最后做 C"描述，就用线性模式。
** 模式 2：决策树 + 按需加载  **
适用场景  ：  大型平台选型、产品导航、问题诊断。
代表  ：  openai/skills — cloudflare-deploy  （224 行）
结构  ：
    # 标题## Authentication（认证前置）## Quick Decision Trees（决策树）  ### "I need to run code"（按用户意图分类）  ### "I need to store data"  ### "I need AI/ML"## Product Index（产品索引表）
关键技巧  ：
技巧  |  示例  |  为什么有效
---|---|---
用户意图分类  |  "I need to run code" 而非 "Compute products"  |  用用户语言而非技术术语
树形导航  |  ` ├─ 边缘无服务器函数 → workers/  ` |  LLM 快速定位正确产品
渐进式披露  |  主文件 7KB，references/ 按需展开到几十万字  |  不浪费上下文窗口
产品索引表  |  Product → Reference 的映射表  |  结构化的快速查找
适用判断  ：  如果你的 Skill 覆盖的知识域有 10+ 个分支，且每个分支都有大量详细文档，就用决策树模式。
进阶  ：  同一个知识域可以拆成两个 Skill——
* 导航型  （cloudflare）：只做选型，不涉及操作
* 操作型  （cloudflare-deploy）：包含认证、命令、故障排除
** 模式 3：循环迭代  **
适用场景  ：  TDD、代码审查、设计评审等需要反复执行的流程。
代表  ：  obra/superpowers — test-driven-development  （371 行）
结构  ：
    # 标题## The Iron Law（铁律——不可违反的核心原则）## Red-Green-Refactor（循环体）  ### RED — 写失败的测试  ### Verify RED — 验证确实失败  ### GREEN — 写最少的代码  ### Verify GREEN — 验证确实通过  ### REFACTOR — 清理  ### Repeat（回到 RED）## Common Rationalizations（借口反驳表）## Verification Checklist（退出条件）
关键技巧  ：
技巧  |  示例  |  为什么有效
---|---|---
强硬语气  |  "Delete it. Start over."  |  LLM 倾向于"灵活变通"，强硬语气提高遵从率
Good/Bad 对比  |  用  ` <Good> ` 和  ` <Bad> ` 标签包裹代码示例  |  对比教学效果最好
借口反驳表  |  预判 LLM 可能的 12 种偷懒借口并逐一反驳  |  堵死所有逃避路径
验证清单  |  8 项 checklist 作为循环退出条件  |  确保质量达标才能结束
人类兜底  |  "ask your human partner"  |  不确定时交给人
适用判断  ：  如果你的 Skill 需要 LLM 反复执行"做→验证→改进"的循环，就用迭代模式。
** 模式 4：接力棒循环（跨 Session 持久化）  **
适用场景  ：  多次迭代的长期项目，需要跨多个 session 持续工作。
代表  ：  google-labs-code/stitch-skills — stitch-loop  （203 行）
https://github.com/google-labs-code/stitch-skills/tree/main/skills/stitch-loop
结构  ：
    # 标题## Overview（接力棒模式概述）## The Baton System（接力棒文件规范）## Execution Protocol（6 步执行协议）  ### Step 1: Read the Baton（读接力棒）  ### Step 2: Consult Context Files（查阅上下文）  ### Step 3: Generate（执行任务）  ### Step 4: Integrate（集成结果）  ### Step 5: Update Documentation（更新文档）  ### Step 6: Prepare the Next Baton ⚠️（写下一个接力棒——关键！）## File Structure Reference（文件协议）## Orchestration Options（编排方式）
关键技巧  ：
技巧  |  示例  |  为什么有效
---|---|---
文件即状态  |  ` next-prompt.md  ` 作为接力棒  |  LLM 不需要记住"上次做到哪了"
续命机制  |  Step 6 标记为 Critical + MUST  |  忘了写接力棒循环就断了
文件协议  |  每个文件有明确职责  |  LLM 只需按协议读写文件
编排无关  |  CI/CD、人在回路、Agent 链都能驱动  |  同一个 Skill 适配多种自动化环境
适用判断  ：  如果你的 Skill 需要跨多个 session 持续工作，或者需要多个 Agent 协作，就用接力棒模式。
与模式 3 的区别  ：
维度  |  循环迭代（TDD）  |  接力棒循环（Stitch Loop）
---|---|---
状态存储  |  LLM 对话上下文  |  外部文件系统
跨 session  |  ❌  |  ✅
循环退出  |  Checklist 全部打勾  |  路线图清空
适用时长  |  单次会话（分钟~小时）  |  长期项目（天~周）
** 模式 5：多阶段 + 检查点 + Skill 编排  **
适用场景  ：  复杂的多周流程，需要在关键节点做 Go/No-Go 决策。
代表  ：  deanpeters/Product-Manager-Skills — discovery-process  （502 行）
结构  ：
    # 标题## Key Concepts（核心概念 + 反模式）## Phase 1: Frame the Problem（阶段 1）  ### Activities（调用哪些子 Skill）  ### Outputs（阶段产出）  ### Decision Point 1（检查点：YES/NO + 时间影响）## Phase 2-6...（重复相同结构）## Complete Workflow（端到端时间线）## Common Pitfalls（常见陷阱）## References（引用的子 Skill 列表）
关键技巧  ：
技巧  |  示例  |  为什么有效
---|---|---
统一阶段模板  |  每个 Phase 都有 Activities → Outputs → Decision Point  |  LLM 快速理解结构
决策检查点  |  "达到饱和了吗？YES → 下一阶段，NO → +1 周"  |  防止盲目推进
Skill 编排  |  调度 10+ 个子 Skill 完成各阶段  |  编排器模式，大 Skill 调度小 Skill
时间影响  |  每个 NO 路径标注"+2-3 days"、"+1 week"  |  让用户了解延迟成本
交互协议分离  |  引用  ` workshop-facilitation  ` 定义交互方式  |  关注点分离
适用判断  ：  如果你的 Skill 跨越多天/多周，有明确的阶段划分和 Go/No-Go 决策点，就用多阶段模式。
** 特殊模式：思维框架（控制 LLM "怎么想"）  **
适用场景  ：  安全审计、代码审查、架构分析等需要深度思考的场景。
代表  ：  trailofbits/skills — audit-context-building  （302 行）
结构  ：
    # 标题## Purpose（定位：控制思维方式，不是控制行为）## When to Use / When NOT to Use## Rationalizations（借口反驳表）## Phase 1: Initial Orientation（定向扫描）## Phase 2: Ultra-Granular Function Analysis（逐行分析——核心）  ### Per-Function Checklist（函数微分析清单）  ### Cross-Function Flow Analysis（跨函数追踪）  ### Output Requirements（输出格式 + 量化阈值）  ### Completeness Checklist（完整性检查）## Phase 3: Global System Understanding（全局理解）## Stability Rules（反幻觉规则）## Non-Goals（明确禁止做的事）
关键技巧  ：
技巧  |  示例  |  为什么有效
---|---|---
思维工具  |  第一性原理、5 Why、5 How  |  给 LLM 分析框架而非具体命令
量化阈值  |  "每个函数最少 3 个不变量、5 个假设"  |  强制 LLM 达到足够的分析深度
非目标约束  |  "不要识别漏洞、不要提出修复"  |  克制 LLM 最想做的事，先理解再判断
反幻觉规则  |  "Never reshape evidence to fit earlier assumptions"  |  防止 LLM 自我欺骗
子 Agent 指导  |  何时以及如何使用 function-analyzer Agent  |  分而治之
适用判断  ：  如果你的 Skill 需要 LLM 进行深度分析而非快速执行，需要控制的是"思维质量"而非"操作步骤"，就用思维框架模式。
四、通用写作技巧
** 4.1 防止 LLM 偷懒的 4 种武器  **
武器  |  原理  |  示例来源
---|---|---
强硬语气  |  LLM 对命令式语气的遵从率更高  |  TDD："Delete it. Start over."
借口反驳表  |  预判 LLM 的自我合理化路径并堵死  |  TDD：12 种借口 + 反驳；审计：6 种借口
量化阈值  |  给出硬性的最低标准  |  审计："最少 3 个不变量、5 个假设"
负面指令  |  明确说"不要做 X"  |  vercel-deploy："Do not curl the URL"
** 4.2 教学的 3 种有效方式  **
方式  |  原理  |  示例来源
---|---|---
Good/Bad 对比  |  对比学习效果最好  |  TDD：  ` <Good> ` vs  ` <Bad> ` 代码示例
具体命令  |  LLM 擅长执行具体指令  |  vercel-deploy：每步都有 bash 命令
完整示例  |  展示期望的输出格式  |  审计：引用  ` FUNCTION_MICRO_ANALYSIS_EXAMPLE.md  `
** 4.3 安全与边界的 3 条原则  **
原则  |  做法  |  示例来源
---|---|---
安全默认值  |  默认选择最安全的选项  |  vercel-deploy："Always deploy as preview"
权限最小化  |  只在必要时提升权限  |  vercel-deploy："Do not escalate the installation check"
人类兜底  |  不确定时交给人  |  TDD："ask your human partner"
** 4.4 知识组织的 3 层架构  **
    第 1 层：Frontmatter（~100 tokens）  → LLM 扫描所有 Skill 的 description，决定是否加载  
    第 2 层：SKILL.md 正文（<5K tokens）  → 核心指令、决策树、流程步骤  
    第 3 层：references/ 和 resources/（按需加载）  → 详细文档、示例、清单，LLM 用 read 工具按需读取
Token 预算参考  ：
层级  |  Token 预算  |  内容
---|---|---
Frontmatter  |  ~100 tokens  |  name + description
主文件  |  2K-5K tokens  |  核心指令
参考文档（单个）  |  1K-3K tokens  |  按需加载
总上下文占用  |  <10K tokens  |  主文件 + 1-2 个参考文档
五、模式选择决策树
    你的 Skill 需要做什么？│├─ 执行一个有明确步骤的操作│  └─ → 模式 1：线性流程│├─ 在大量选项中帮用户选择正确的方向│  └─ → 模式 2：决策树 + 按需加载│├─ 在单次会话中反复执行"做→验证→改进"│  └─ → 模式 3：循环迭代│├─ 跨多个 session 持续推进一个长期项目│  └─ → 模式 4：接力棒循环│├─ 跨越多天/多周，有阶段划分和 Go/No-Go 决策│  └─ → 模式 5：多阶段 + 检查点│└─ 需要 LLM 进行深度分析而非快速执行   └─ → 特殊模式：思维框架  
六、快速上手模板
###  最小可用 Skill（线性模式）
    ---name: my-skilldescription: [一句话描述做什么 + 什么时候触发]---  
    # Skill 名称  
    [一句话核心原则 + 安全默认值]  
    ## Prerequisites- [前置条件 1]- [前置条件 2]  
    ## Steps  
    ### Step 1: [动作]\`\`\`bash[具体命令]\`\`\`  
    ### Step 2: [动作][具体指令]  
    ### Step 3: [动作][具体指令]  
    ## Troubleshooting| Issue | Solution ||-------|----------|| [问题 1] | [解决方案] |  
###  循环迭代 Skill 模板
    ---name: my-loop-skilldescription: [描述 + 触发时机]---  
    # Skill 名称  
    ## Core Principle[不可违反的铁律]  
    ## The Loop  
    ### Phase A — [动作][具体指令]  
    ### Verify A[验证命令]  
    ### Phase B — [动作][具体指令]  
    ### Verify B[验证命令]  
    ### Repeat回到 Phase A。  
    ## Rationalizations| Excuse | Reality ||--------|---------|| "[借口 1]" | [反驳] |  
    ## Completion Checklist- [ ] [条件 1]- [ ] [条件 2]  
七、参考资源
###  官方规范
1\. Agent Skills 开放标准
https://agentskills.io/
2\. anthropics/skills — 官方模板
https://github.com/anthropics/skills/tree/main/template
3\. anthropics/skills — 规范文档
https://github.com/anthropics/skills/tree/main/spec
###  精选仓库
1\. openai/skills  — OpenAI Codex 官方 Skill 目录
https://github.com/openai/skills
2\. obra/superpowers  — 14 个工作流型 Skill
https://github.com/obra/superpowers
3\. google-labs-code/stitch-skills  — 设计到代码的 Skill
https://github.com/google-labs-code/stitch-skills
4\. deanpeters/Product-Manager-Skills  — 40+ 产品管理 Skill
https://github.com/deanpeters/Product-Manager-Skills
5\. trailofbits/skills  — 安全审计 Skill
https://github.com/trailofbits/skills
6\. openclaw/clawhub  — Skill 注册中心
https://github.com/openclaw/clawhub
###  精选列表
1\. VoltAgent/awesome-agent-skills  — 500+ Skill 索引
https://github.com/VoltAgent/awesome-agent-skills
2\. travisvn/awesome-claude-skills  — 精选列表 + Skill vs MCP 对比
https://github.com/travisvn/awesome-claude-skills
八、本文分析的 7 个 Skill 速查表
#  |  Skill  |  来源  |  模式  |  行数  |  一句话精髓
---|---|---|---|---|---
1  |  ` vercel-deploy  ` |  OpenAI  |  线性  |  77  |  最小但完整的 Skill 模板
2  |  ` cloudflare-deploy  ` |  OpenAI  |  线性+决策树  |  224  |  大平台的渐进式披露
3  |  ` cloudflare  ` |  OpenCode  |  纯决策树  |  211  |  导航型 vs 操作型的区别
4  |  ` test-driven-development  ` |  obra  |  循环迭代  |  371  |  堵死 LLM 偷懒的所有退路
5  |  ` stitch-loop  ` |  Google Labs  |  接力棒循环  |  203  |  文件即状态，跨 session 持久化
6  |  ` discovery-process  ` |  Dean Peters  |  多阶段+检查点  |  502  |  编排器模式，调度 10+ 子 Skill
7  |  ` audit-context-building  ` |  Trail of Bits  |  思维框架  |  302  |  控制 LLM "怎么想"而非"做什么"