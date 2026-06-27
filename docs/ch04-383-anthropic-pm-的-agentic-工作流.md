# Anthropic PM 的 Agentic 工作流

## Ch04.383 Anthropic PM 的 Agentic 工作流

> 📊 Level ⭐⭐ | 6.4KB | `entities/anthropic-pm-agentic-workflow.md`

## 概述
Anthropic PM Jess Yan 在 Claude Managed Agents 上构建的 agentic 工作流——PM 自己开多个 agent 完成任务，从"等排期"变为"直接交付"。

## 核心机制
### Claude 三件套分工
| 工具 | 用途 |
|------|------|
| **Claude** | 开放式研究和探索，持续对话 |
| **Claude Cowork** | 知识工作（邮件、收件箱、待办、slides、Slack） |
| **Claude Code** | 定制 agent，底层跑在 Managed Agents 上 |

### PM 自建三个 Agent
1. **数据分析 agent**（Adoption analytics）—— 接内部数据库 + 理解 schema 的 skill，带 memory 沉淀发现
2. **开发者舆情监控 agent**—— 内置 web search，按域名清单扫开发者反馈，支持 fan-out 并行
3. **Demo 构建 agent**—— 接 GitHub 仓库 + 品牌素材，生成会议版/客户版 demo

### API 设计范式转变
**传统：文档评审（多周）→ spec → 构建 → 遇具体问题就崩**
**新范式：不写 spec 写原型**——在 Claude Code 里直接拿 pre-production API spec 跑 agent，一个下午 hello world → 端到端原型。产品发布前就改完 API abstraction 和 UX。

## Claude Managed Agents
四个核心能力（2026 年 4 月 8 日公开 beta）：

- **生产级 agent sandbox**：鉴权、工具执行托管
- **长会话**：自主跑几小时，掉线保留进度
- **多 agent 协作**：agent 拉起其他 agent 并行（research preview）
- **可信治理**：scoped 权限、身份管理、tracing 默认配
**定价：** token 单价 + $0.08/session-hour active runtime

## Memory for Managed Agents
2026 年 4 月 23 日开 beta。文件系统型 memory，agent 用 bash/code execution 直接读写，所有改动有 audit log。
**Rakuten 数字：**

- first-pass 错误 -97%
- 成本 -27%
- 延迟 -34%

## 效率提升
METR 测出 41x（16 个月）：Sonnet 3.5 (new) 21 分钟 → Opus 4.6 的 12 小时人类等价时长。
> "能拿自己的产品做实验，抬升了你能想象出来的下个版本的天花板。"

## 深度分析
**PM 手艺的回归 vs 协调内卷**
传统 PM 工作流中，协调工作（跨部门会议、进度汇报、backlog 管理）占据大量时间，真正的产品设计思考被挤压。Jess Yan 的案例展示了一种反转：通过 AI 替代协调性工作，让 PM 重新掌握"手艺时间"。这是 AI 提升生产力的更深层逻辑——不是让单个任务跑得更快，而是让人的注意力从低价值活动转移到高价值创造。
**API 设计范式的根本转变**
从"文档评审 → spec → 构建 → 遇问题崩"到"不写 spec 写原型"——这个转变的实质是把 API 设计的反馈循环从几周压缩到几小时。在 Claude Code 里直接用 pre-production spec 跑 agent，一个下午完成 hello world 到端到端原型，产品发布前已迭代多轮 API abstraction 和 UX。这意味着产品设计可以更早地与技术实现耦合，而不是在真空中设计后强加给工程。
**多 Agent 分工的结构性优势**
三个 Agent（数据分析、舆情监控、Demo 构建）的分工不仅仅是效率提升，关键是形成了"并行 + 记忆"的工作模式：

- 数据分析 Agent 带 memory，沉淀发现，下一轮在上一轮基础上推进
- 舆情监控支持 fan-out 并行扫描多个域名
- Demo 构建 Agent 独立于人类工作流运行，PM 可以走开做别的事，回来发现已发布
这种模式让 PM 从"等排期"变为"直接交付"。

## 实践启示
1. **从协调者转型为架构师**：PM 的核心价值不再是传递信息和管理进度，而是定义问题和验证解决方案。用 AI 处理信息传递，自己聚焦在产品逻辑上。
2. **先用原型定义 API，再写文档**：传统的 spec-first 流程在 AI 时代已过时。在 Claude Code 里跑通原型，用实际运行结果定义 API contract，文档自然同步。
3. **给每个 Agent 配 memory**：Rakuten 的 -97% first-pass 错误率很大程度来自 memory 的积累。没有记忆的 Agent 每次都从零开始，有了记忆才能真正提升。
4. **从小处实验，建立信心**：Jess 的起点是"能拿自己的产品做实验"——先用成熟产品验证工作流，再扩展到核心业务。这种渐进式采用降低了风险。

## 相关
- [Claude Code 搜索架构](/ch01-571-claude-code-架构解析/)
- [Cat Wu: Claude Code PM 工作流](/ch03-013-cat-wu-anthropic-claude-code-cowork产品负责人/)
- [AutoResearch 多 Agent 开发](/ch09-030-autoresearch-多-agent-自动化软件开发/)
- [Agent Memory 模块化框架](/ch01-238-agent-memory-模块化框架与评测-memory-in-the-llm-era-4-模块-10-方案对比/)
- AI Team 知识 Harness

## 相关实体
- [Japan's PM orders cybersecurity review to defend against Anthropic Mythos](/ch01-677-anthropic/)
- MOC

---

