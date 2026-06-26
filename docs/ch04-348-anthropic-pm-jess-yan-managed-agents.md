# anthropic-pm-jess-yan-managed-agents

## Ch04.348 anthropic-pm-jess-yan-managed-agents

> 📊 Level ⭐⭐ | 7.3KB | `entities/anthropic-pm-jess-yan-managed-agents.md`

## 核心观点
**PM 的手艺回来了。** 过去大半时间花在协调（跨部门会议、汇报、backlog），真正的手艺（craft）反而被挤掉。借助 Claude，压缩协调时间，把时间还给手艺。
**API 设计：从文档评审 → 先跑原型。** 不写 spec 写原型，在 Claude Code 里直接拿 pre-production API spec 跑 agent，一个下午从 hello world 到端到端原型。产品发布前就把 API abstraction 和 Claude Console UX 改了几轮。
**Claude 三件套分工：**

- **Claude**：开放式研究和探索，持续对话
- **Cowork**：其他知识工作（邮件、收件箱、待办、slides、翻 Slack）
- **Claude Code**：想清楚要解决什么问题，定制 agent 
**METR 测出 41x 提升：** 从 Sonnet 3.5 (new) 的 21 分钟 → Opus 4.6 的 12 小时，16 个月人类等价时长。
> "能拿自己的产品做实验，这件事抬升了你能想象出来的下个版本的天花板。" 

## PM 自己开的三个 Agent
1. **数据分析 agent**（Adoption analytics）—— 接进内部数据库，配了理解数据 schema 的 skill，带 memory，跑过的发现沉淀，下一轮在上一轮基础上推进
2. **开发者舆情监控 agent**（Developer sentiment monitoring）—— 带内置 web search，按域名清单扫开发者反馈，fan-out 到多个 agent 并行
3. **Demo 构建 agent**（Demo building）—— 接进 GitHub 仓库、品牌素材、活动 deck，生成会议版/客户版 demo
三个 agent 都在云上跑，Jess 可以走开做别的事，回来发现已经做完发布了。

## Claude Managed Agents 核心能力
2026 年 4 月 8 日公开 beta，四个核心能力：
| 能力 | 说明 |
|------|------|
| **生产级 agent sandbox** | 鉴权、工具执行替你处理 |
| **长会话** | 自主跑几小时，掉线保留进度和输出 |
| **多 agent 协作** | agent 可以拉起其他 agent 并行（research preview） |
| **可信治理** | scoped 权限、身份管理、tracing 默认配 |

## Memory for Managed Agents
2026 年 4 月 23 日开 beta，给 agent 加跨 session 学习能力：

- 底层是文件系统型 memory，agent 用 bash 和 code execution 直接读写
- 开发者可以 export 独立管理
- 所有改动有 audit log
**客户案例数字（Rakuten）：**

- first-pass 错误 -97%
- 成本 -27%
- 延迟 -34% 
其他 case：Wisedocs 文档校验效率 +30%；Netflix 跨会话保留上下文（包括多轮才能挖出的洞察）；Notion 团队几十个任务并行跑；Sentry Seer 从 bug 定位到可 review PR 一气呵成。

## 定价
消费量计费，标准 Claude Platform token 单价之外，加 **$0.08 / session-hour** 的 active runtime。

## 深度分析
**1. PM 角色的范式转移**
传统 PM 将大量时间消耗在协调性工作上，真正的产品思维（需求洞察、用户体验设计、架构决策）被边缘化。Claude 驱动的 agent 工作流通过自动化协调任务，让 PM 重回"手艺人"角色——专注于需要判断力和创造力的核心工作。
**2. "原型优先"替代"文档优先"**
传统的 API 设计流程是写 spec → 评审 → 实现 → 迭代。Jess Yan 的实践表明，Claude Code 支持"先跑原型"路径：用真实 API spec 直接驱动 agent，在交互中快速验证 abstraction 假设。这种方式将 UX 反馈循环压缩到小时级别，而非周级别。
**3. 专用 agent 的分化逻辑**
三个 agent（数据分析、舆情监控、Demo 构建）代表三种不同的 agent 设计模式：

- **数据分析型**：stateful、带 memory，跨 session 积累上下文
- **舆情监控型**： stateless 的 fan-out 并行，批量处理可枚举任务
- **Demo 构建型**：多数据源聚合型，整合多个 API 和素材来源
这三种模式对应了企业内部知识工作的典型场景。
**4. Memory 的架构意图**
文件系统型 memory + bash/code execution 直接读写，意味着 agent 的记忆是"可编程"的，而非被动的向量数据库检索。开发者可以 export 独立管理，使得 agent 记忆成为可版本控制、可审查的工件。
**5. 41x 提升的测量方法论**
METR 的测量基准（Sonnet 3.5 21分钟 vs Opus 4.6 12小时）反映的是复杂任务下 model scaling 的能力边界。16个月人类等价时长的压缩暗示 agent 系统在高复杂度、长周期任务上的非线性收益。

## 实践启示
1. **以用促学**：像 Jess 一样用自己公司的产品做实验，能突破团队对产品能力边界的想象上限
2. **重构 PM 工作流**：识别哪些是协调性事务（可 agent 化），哪些是需要深度判断的手艺（保留人力）
3. **Memory 设计是核心**：设计 agent 时，先思考 memory 的读写模式——stateless fan-out vs stateful 累积
4. **定价模型关注 session-hour**：除了 token 成本，active runtime 成本是部署规模的关键变量
5. **多 agent 协作时机**：当任务可分解为独立子任务时（如舆情监控按域名列表 fan-out），优先考虑并行 agent 而非串行单一 agent
## 相关实体
- [Anthropic Claude Managed Agents Platform 2026](../ch01-677-anthropic)
- [Anthropic Managed Agents Scaling](../ch01-677-anthropic)
- [Anthropic Claude Managed Agents Platform Launch](../ch01-677-anthropic)
- [Anthropic Claude Managed Agents Guide](../ch01-677-anthropic)
- [Claude Managed Agents Self Hosted Sandbox Mcp Tunnels Enterprise](../ch04-421-claude-managed-agents)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-pm-jess-yan-managed-agents.md)

---

