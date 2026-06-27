# 从 30 分钟手搓 Agent，到 Harness 成为\"新后端\

## Ch04.393 从 30 分钟手搓 Agent，到 Harness 成为\"新后端\

> 📊 Level ⭐⭐ | 6.4KB | `entities/从-30-分钟手搓-agent到-harness-成为新后端.md`

# 从 30 分钟手搓 Agent，到 Harness 成为"新后端"

架构师（JiaGouX）  我们都是架构师！
前不久我们整理过一个demo：《 [ 30分钟手搓 Agent：LLM + Tools + Loop + Memory 跑通最小闭环 ](<https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&mid=2650409091&idx=1&sn=3c40343aefdf11fdb208588a44033e14&scene=21#wechat_redirect>) 》，我把 Agent 简化成一个很小的循环：
模型看任务，选择工具，程序执行工具，把结果写回上下文，再进入下一轮。
几十行代码就能跑起来。Demo 通了以后，确实挺有成就感。

## 相关实体
- [Cong 30 Fen Zhong Shou Gu Agent Dao Harness Cheng Wei Xin Hou Duan](../ch04-254-从-30-分钟手搓-agent-到-harness-成为-新后端/)
- [Agentic Ai System Architecture Harness Skill Mcp](../ch04-197-mcp-skill-agent-llm-harness-一张图讲清-agentic-ai-系统如何真/)
- [Code As Agent Harness Survey](../ch09-046-code-as-agent-harness-综述/)
- [Agentscope Java Harness Framework Enterprise Distributed](../ch03-048-agentscope-java-harness-framework-2-0-企业级-agent-分布式场景的-har/)
- Huggingface Ai Agent Glossary Model Scaffolding Harness Tool Skill Subagent

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/从-30-分钟手搓-agent到-harness-成为新后端.md)

## 深度分析

30分钟手搓Agent演示了最小循环的可行性：模型根据上下文选择工具，程序执行后写回结果，再进入下一轮推理。这个循环解决的是让Agent"动起来"的问题。但随着Agent接入真实业务系统，单一循环的局限开始暴露——当一个Coding Agent需要串联浏览器查文档、沙箱跑测试、Python服务做分析、状态存储写结果时，每条路径各走各的SDK、各写各的日志，排查问题的复杂度会随Agent数量呈指数增长。原文将这种复杂性总结为 `agents² * services` 公式——不是数学定律，但形象地揭示了多Agent多后端组合后的路径爆炸问题。

Harness层承担的核心职责，是在模型能力之上构建可治理的工程系统：上下文管理、工具校验、权限控制、状态恢复、执行验证。但当Harness突破单一Agent进程边界，开始协调浏览器worker、沙箱worker、不同语言的微服务时，它实际上已经在承担后端架构的职责。这正是"新后端"的核心含义：传统HTTP/队列/数据库仍然存在，但后端需要额外容纳一类新的调用方——会探索、会组合、会长时间执行、也会带来不确定性的Agent。

iii项目将后端能力翻译成三个原语：Worker（参与者）、Function（能力）、Trigger（入口）。这个翻译的价值在于把原本散落在"后端服务""工具""队列消费者""Agent框架"等不同分类下的概念统一到同一张运行时目录中。关键区别在于：传统工具列表告诉Agent"理论上有哪些工具"，而运行时能力目录告诉Agent"此刻系统里哪些worker活着、哪些function可调用、哪些trigger可以触发"。

从代码实现看，Worker注册后通过WebSocket连接engine，重新连接时会重新发送function和trigger注册，engine维护 `function_owners` 和 `external_function_owners` 处理旧worker清理和新worker注册之间的竞态。这种设计把worker上下线当作正常路径而非异常情况处理，对于长时间运行的Agent系统尤为重要。同时 `InvokeFunction` 和 `InvocationResult` 都携带 `traceparent` 和 `baggage`，使得跨语言、跨进程、跨队列的调用链可以被统一追踪。

值得注意的是，这套架构并非没有边界。中心engine的可用性本身成为承重点；HTTP、队列、cron、状态变化虽可统一抽象为trigger但失败语义各异；能力目录会随worker注册增加而膨胀；动态创建worker能力强大但涉及RBAC、沙箱隔离等安全问题；上下文工程仍然独立于能力目录存在。这些边界不是否定这套思路的理由，而是架构设计时必须提前纳入考量的事实。

## 实践启示

**能力目录优先于prompt优化。** 在着手调优Agent的prompt之前，先为系统建立一份包含ID、描述、输入输出schema、owner、版本、权限和观测信息的能力目录。这份目录可以先很简单，甚至是一张数据库表或配置文件，但团队需要先把"工具是系统可治理的运行时能力"这个认知对齐。

**Worker上下线必须作为第一类路径处理。** 代码要提前考虑断线重连、旧worker清理和新worker注册之间的竞态场景，而非将其当作罕见异常。真实生产环境中，worker重启、超时、重复注册会频繁发生。

**Trigger维度要从"Agent主动调用"扩展到业务事件触发。** HTTP、队列、cron、状态变化都应该被建模为入口，使Agent既能主动调用别人，也能被动响应业务事件。例如线上告警触发incident_triage、用户上传文件后队列触发document_reader，让Agent真正进入后端执行模型。

**Trace要从协议层开始设计，不能事后补救。** `traceparent` 和 `baggage` 字段在 `InvokeFunction` 和 `InvocationResult` 中携带，确保跨语言、跨进程、跨队列的调用链可追踪。没有统一trace的Agent系统，排查问题只能靠把所有日志grep一遍。

**动态worker创建要配套完整的安全机制。** Agent临时拉起sandbox、浏览器或Python worker时，必须有RBAC、沙箱隔离、资源配额和审计流程。这个能力越强大，失控的后果也越严重。

---

