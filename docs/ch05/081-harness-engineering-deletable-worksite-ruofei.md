# Harness Engineering Deletable Worksite Ruofei

## Ch05.081 Harness Engineering Deletable Worksite Ruofei

> 📊 Level ⭐⭐ | 7.8KB | `entities/harness-engineering-deletable-worksite-ruofei.md`

# Harness Engineering Deletable Worksite Ruofei

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/harness-engineering-deletable-worksite-ruofei.md)

## 摘要

架构师若飞（JiaGouX）这篇《再看 Harness Engineering》把 Harness Engineering 从"新概念"拉回工程现场：当大模型开始读文件、调用工具、改代码、跑测试、跨轮次做事时，模型外面那套工作现场该怎么搭。核心论点：真正要设计的不是约束，而是一个清楚、可查、可验、可回滚、随时能删掉旧约束的工作现场。

## 核心要点

- **五层栈**：Model 推理核心只表达意图；Tool 是"手"，也是权限边界；Skill 是"手艺"；Sub-agent 是分工；Harness 管运行。
- **Harness 管"怎么跑"**：上下文、工具权限、状态、测试时机、失败回流、dry-run、留痕、停止条件、下一轮接手。
- **能落地的 Harness 可检查、可接手、可修正**：错误要挡在提交前，失败经验要回到下一轮。
- **巨型约束文件会变成负担**：OpenAI 把大 AGENTS.md 改成"入口地图"；Agent 看不见的东西等于不存在。
- **Guides + Sensors 前后咬合**：行动前引导与行动后反馈缺一不可。
- **厚 Harness 不一定是好 Harness**：Vercel 删掉约 80% 专门工具后成功率反升到 100%。
- **长上下文不等于长期状态管理**：Anthropic 用 initializer agent 搭环境、写进度文件，让后续 Agent 先读现场再继续。

## 深度分析

### 真正要设计的不是约束，而是可删的工作现场

文章标题即论点。OpenAI 内部产品（代码全由 Codex 写）是注脚：一开始用很大的 AGENTS.md，发现巨型规则文件快速变成负担——上下文被占满、规则过期无人维护、Agent 分不清哪些约束关键；于是改成入口地图，细知识放进结构化文档、执行计划、质量记录、产品规格。这像新人入职：不把制度塞进一页纸，而是给地图，让他知道该去哪查。

判断标准：Agent 运行时看不到的东西等于不存在。Slack 共识、会议取舍、老工程师经验，若不落进仓库、文档、脚本、测试、日志或可查询工具，就无法稳定影响下一次执行。Agent-first 代码库第一步是让系统更可读——给人读，也给 Agent 读。

### 五层栈：Model / Tool / Skill / Sub-agent / Harness

Model 是推理核心，理解目标、读上下文、生成下一步，但不直接执行——真正读文件、跑命令、调 API、塞回结果的是模型外的系统。Tool 是"手"：文件系统、Shell、浏览器、数据库、搜索、解释器都可以是工具；接上就有副作用，所以 Tool 也是权限边界。Skill 是"手艺"：可复用的做事方法，把团队经验沉淀成 Agent 可调用的过程资产。

Sub-agent 把任务拆给能独立处理子问题的 Agent，但带来管理成本：谁分任务、谁合并、谁判断可信、谁决定停。检查点：子任务独立、输出可验证、主 Agent 或人可合并裁剪。Harness 则把各层串成运行系统，管上下文、权限、状态、测试、失败回流、留痕、停止与接手。

### 约束与可删的工作现场：加法与减法

约束是加法：多写规则、多包工具、多接 MCP、多拆角色，短期像变强，长期可能把模型困在过时抽象里。可删的现场是减法：价值不在厚度，而在让 Agent 更快接近真实上下文、少误解抽象、易从失败恢复。Vercel 是极致案例——删掉大部分专门工具，只留能执行 bash 的文件系统 agent，让 Claude 用 grep、cat、ls 直接读 Cube DSL，成功率 80%→100%，耗时、步骤、token 全降。这不是"工具越少越好"，而是旧 Harness 替模型做了太多选择。

健康度判据：组件要能说清解决哪类失败、最近是否触发、关掉后质量成本会不会变差；说不清就是技术债。约束一个月没触发就关掉试试——现场的一切都应可丢弃、可再生，当模型不再需要某个约束时，要舍得删掉它。

### 对上下文、记忆与现场卫生的启示

Anthropic 的长任务 Harness 讲同一问题的另一面：Agent 做长项目会断档——上下文快满、下一轮不知前面做过什么，这是交接班问题。做法：initializer agent 搭环境，生成 feature list、progress file、git repo、启动脚本；后续 coding agent 先读目录、git log、进度文件，跑端到端检查，再挑未通过的功能继续。长上下文不等于长期状态管理，能接手的项目不是文档最多，而是状态最清楚。

现场卫生：上下文每步现取而非越积越厚；状态显式提交（progress file、git log、测试证据）而非藏在对话摘要；经验回写仓库（入口地图、Skill、验证模板）而非留在记忆；旧约束定期清理而非永久保留。若飞收尾：Harness Engineering 是软件工程在 Agent 时代重现的老问题——上下文、状态、反馈、权限、质量清理、人的位置、旧约束何时删。工程不会消失，只是从"亲手写代码"转向"设计能让 Agent 稳定工作的现场"——清楚、可查、可验、可回滚，还要留一个出口。

## 实践启示

1. **从小流程起步**：选风险低、输入稳定、验证明确的流程（事实核验、小 bug 修复、配置漂移扫描、测试失败归因、PR 初筛），连跑几轮再谈平台。
2. **给流程留任务卡**：目标、边界、输入、工具权限、验证证据、状态区分、停止条件、失败写回哪里——说不清，接手和回滚都费劲。
3. **先机械检查再语义判断**：类型检查、单测、静态分析每次跑；LLM review 只放"需求误解、绕开抽象、测试迎合实现"这类位置。
4. **把入口地图做好而非把规则写厚**：总忘读某文档就让它变成入口地图；总改错层级就补依赖边界检查；总误解规则就把规则搬进仓库。
5. **定期审查组件去留**：说不清"解决哪类失败"就删；约束一个月没触发就关掉试试——减法是常态。
6. **把人留在更少、更关键的位置**：看目标、边界、风险、取舍；把长任务做成可接手状态，下一轮进场就能接上。

## 相关实体

- [harness engineering 的未来——什么会消失，什么不会](ch05/096-harness-engineering.html)
- [Harness Engineering 概念](ch05/096-harness-engineering.html)
- [Harness Engineering：让 coding agent 可靠完成长程任务](ch05/096-harness-engineering.html)
- [一文带你弄懂 AI 圈爆火的新概念 Harness Engineering](ch05/096-harness-engineering.html)
- [你不知道的 Agent 原理架构与工程实践](../ch03/006-agent.html)
- [Using Local Coding Agents](../ch09/179-using-local-coding-agents.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/data-infrastructure.md)

---

