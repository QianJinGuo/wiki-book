---
source_url: "https://mp.weixin.qq.com/s/9BqrPgXW-gxbpKGYVpmwtA"
source_title: "Graph Engineering 详解：Loop 之后，Agent 工作流开始显式成图"
source_author: "架构师/若飞"
source_date: "2026-07-23"
ingested: "2026-07-24"
sha256: "375f884e76433f8b78e97d0f25e18cb282de166ebe8894d7814800a7ba91eb86"
source_type: "weixin"
---

# Graph Engineering 详解：Loop 之后，Agent 工作流开始显式成图

**作者:** 架构师/若飞
**时间:** 2026年7月23日 23:10

> Peter Steinberger 问："Are we still talking loops or did we shift to graphs yet?"
>
> 很快就有人接上："Loop Engineering is dead. Long live Graph Engineering!"
>
> 但若飞的看法是：**Graph 描述任务拓扑，Loop 负责反馈和收敛，Harness 管住权限、状态、证据与恢复。三者解决的是不同问题，不存在谁给谁办葬礼。**

## 核心框架：Graph / Loop / Harness 三层分工

- **Graph** 回答"谁依赖谁，哪里可以并行，哪里必须汇合"
- **Loop** 回答"失败后回到哪里，怎样继续，什么时候算收敛"
- **Harness** 回答"谁能触发，能用什么权限，证据放在哪里，怎么暂停、恢复和回滚"

三层独立讨论，运行时叠在一起。Loop 没有消失，只是从"整套系统的唯一形状"变成了图里一条需要单独设计的回边。

## 图不新，按任务生成图才是变化

研发团队一直在图里工作：GitHub Actions（`jobs.<job_id>.needs`）、Airflow DAG、Kubernetes Controller、LangGraph（并行/路由/编排器+评估器+优化器）、AutoGen GraphFlow。

真正的变化：任务图不再只藏在聊天上下文里，开始变成可读、可执行、可观测的脚本。Claude Code Dynamic Workflows 就是直接例子——Claude 编写 JavaScript，再交给运行时执行。

## 四类边

1. **数据边**：下游收到的节点结果必须包含结构化契约（findings、evidence、status 等）。`repo_commit` 保证并行节点看同一份代码；失败类型告诉调度器该重试/终止/交回人。
2. **权限边**：从只读走向写入、从本地走向外部、从候选结果走向真实动作时，需要显式条件和人工闸门。
3. **验证边**：执行与验证拆开。确定性检查交编译器/测试/结构校验，语义判断交独立验证节点。
4. **恢复边**：幂等键、检查点、重试上限和补偿动作。汇聚节点定义放行规则（等全部成功/最小成功数/到点降级/关键失败即停）。

## 窄图落地方法

从现有 PR 流程截取一小段：
1. 节点契约写清输入、输出、失败类型、超时和幂等键
2. 确定性检查沿用现有 CI
3. 修复节点使用隔离分支或 worktree
4. 回边带具体失败证据，设轮次、时间和 token 上限
5. 合并仍由人确认

## 运行前故障预演

7个问题：节点契约校验、数据边传递、并行节点汇聚规则、回边反馈上限、快照一致性、模型分层（便宜/昂贵）、权限边扩大和不可逆操作。

## 参考资料

- Peter Steinberger: https://x.com/steipete/status/2078277297791189132
- Indie Fox: https://x.com/indie_maker_fox/status/2079042889892651047
- Codez: Graph Engineering with Claude: https://x.com/0xCodez/status/2079165300625330317
- Claude Code Docs: Orchestrate subagents at scale with dynamic workflows
- LangGraph Docs: Workflows and agents
- Microsoft AutoGen: GraphFlow
- GitHub Actions: Workflow syntax
- Kubernetes Docs: Controllers
- Apache Airflow: DAGs
