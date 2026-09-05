---
source_url: https://mp.weixin.qq.com/s/VBY65tBAjVWyuP8QcpzOLA
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
title: "《从零实现 Agent 系统》连载 01｜Agent 系统是什么：问题空间与架构切片"
author: 贵慜 (IchbinDerek)
published: 2026-05-17
platform: WeChat
ingested: 2026-05-20
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
sha256: 720145e21e8b7d47c277ac30f3f4fec852a53c9caa1d32a05cbdc83d9532657d
---
---
# 《从零实现 Agent 系统》连载 01｜Agent 系统是什么：问题空间与架构切片
## 先分清一件事：你在接模型，还是在做一套能跑的「系统」
接一次大模型，本质是换一段上下文、拿回一段文字。它不管上一秒会话里承诺过什么，也不管这次要不要写库、能不能调外部接口、出了问题谁来背锅。业务一旦变成多步、带副作用、多人多租户、还要事后追责，你就得按**长期在线的程序**来设计——靠在同一 HTTP 里多打几次推理，补不齐这些窟窿。
大家口语里叫 Agent 系统，名字随便。关键是：你有没有把**状态、编排、工具怎么出门、策略与记账、运维能不能伸手**当成正经架构问题，而不是堆在 prompt 里。**多平面**听起来玄，其实就是几类责任不要糊成一锅：谁在算、谁在管风险、谁接人、谁管后台与存储，彼此用清晰的依赖方向约束，以后才改得动。
## 三个借来的「尺子」：操作系统、控制论、容器思维
借旧理论不是为了掉书袋，是为了**开会时能把图画在一张白板上**，而且大家指的是同一块东西。
### 操作系统这面尺子
问的是三件事：谁在跑、能不能被优雅打断、写盘和出站是不是只能走**固定入口**。把「一轮会话里多次 tool」想成用户态里一段活，就要有人扮演「边界」：网关、会话与编排、沙箱和工具契约，在上面对业务稳定、在下面可以换实现。前台聊天和后台定时任务可以共享同一套语义，但**入口和配额**宜分开，否则账算不清。
落到 Agentium，大致是 `core` 管生命周期和调度、 `coordination` 管会话和 Turn、执行侧再交给网关与沙箱；这些该在装配里接好，而不是塞满 `api` 的 if-else。
### 控制论这面尺子
把一个目标当成给定值：外面世界被你改动了，是对象侧；日志、账单、评测、人要插嘴，是观测；策略、限流、编排是调节；真正能动手的是带过闸的工具执行。**审批、发布门、内容检查**该是并联的闭环，接口写清楚；不能装作「模型更懂事」就当合规做完了。在 Agentium，这条线主要泡在 `governance` 以及与安全、评测相关的横切能力里，和「纯推理」那条路并排走。
### 容器思维这面尺子
三件可落地的事：**谁占多少配额**、**一次运行拿什么版本的路由与白名单可当快照用**、**默认是否收紧出站与高风险能力**。行业里常把租户与预算类比成 cgroup/namespace 硬隔断，把「每次 run 固化一份配置快照」类比成不可变镜像，把角色模板、领域包分层类比成分层镜像。
三件事连起来：**边界、闭环、配额与快照**。
## Agentium：为什么入口要薄、包却要分得细
> 门面薄，线在中间，底子能换。
HTTP 和命令行只是把外面来的字节变成内部能懂的一次调用；真正把会话往前推、把策略串起来、把 turn 收口的，应尽量落在中间的协调与治理层。包名一长串不是为了炫目录，而是为了在语言和文档里说死**谁不许反向依赖谁**——例如领域模型不沾具体数据库类型，编排层不把业务叙事写死在路由文件里。
启动时那段初始化（把依赖全部「接线」的那层代码），干的是把所有该单例的对象接起来：网关、入站会话、账本、审计、预算、插件、沙箱，再装进运行时对外暴露的几个大壳子里。
多平面可以同时存在：**对话主线**、**后台**、给运维准备的**控制面**、还有评测演练——共用一套领域故事，部署上再分开。
## 从能 demo 到能上线，差的不止多几行 prompt
最小演示往往是：进来 → 过网关 → 跑一轮 loop → 碰工具。要往企业里推，通常还得单开**治理与安全**、**异步与后台**、**控制面**、以及**能替身的存储和消息**。不必每个「面」都对应一台机器；要紧的是**箭头朝哪、谁不该知道谁**。
## 两张图：盒子怎么叠、一笔请求怎么走
### 分层盒子（装配依赖方向）
```
flowchart TB
  subgraph facade [接口层 api / cli]
    API["api"]
    CLI["cli"]
  end
  subgraph app_layer [装配 app]
    Boot["runtime 装配"]
  end
  subgraph run [运行与业务能力]
    CORE["core · 调度与生命周期"]
    COORD["coordination · 会话与编排"]
    GW["ai_gateway"]
    MORE["channels / tools / memory / sandbox / plugins …"]
  end
  subgraph gov [治理与安全]
    GOV["governance · security · evaluation …"]
  end
  subgraph infra [基础设施]
    INFRA["infra · db / mq / telemetry …"]
  end
```
依赖方向：facade → app_layer → run → gov → infra。`core` 不反向依赖 `coordination`，`governance` 是横切能力。
### 一笔请求的完整路径
```
请求 → API/CLI(facade) → Runtime Boot(装配) → CORE(调度生命周期)
  → COORD(会话编排) → AI Gateway → Tools/Memory/Sandbox
  →  Governance(安全/评测/限流)
  →  INFRA(存储/消息/遥测)
```
## 「入口不写业务逻辑」说白了是什么
入口只负责：把外面的字节翻译成内部语义、把内部结果翻译回外面能懂的格式。业务逻辑全部在中间的协调与治理层。`api` 和 `cli` 的职责相同，只是暴露方式不同。
## 分层伪代码（谁先谁后）
```
# 1. 装配阶段
boot() {
  infra   = Infra.connect()        # db / mq / telemetry
  sandbox = Sandbox.create()
  tools   = ToolRegistry.from_config()
  memory  = Memory.connect()
  gateway = AIGateway(llm_client)
  ledger  = Ledger()
  audit   = AuditLog()
  runtime = Runtime(
    core   = Core(ledger, audit),
    coord  = Coordination(gateway, memory),
    gov    = Governance(audit, ledger, evaluation),
    sandbox = sandbox,
    tools  = tools,
    infra  = infra,
  )
  return runtime
}
# 2. 运行阶段
handle_request(runtime, request) {
  session = runtime.coord.create_session(request)
  loop:
    turn = session.next_turn()
    if turn.is_tool_call():
      result = runtime.sandbox.execute(turn.tool, turn.args)
      session.append_result(result)
    elif turn.is_final():
      return session.emit_response()
    else:
      response = runtime.core.reason(turn)
      session.append(response)
}
```
## 几句逆耳的话
1. 把多轮对话当成「多调几次模型」的设计，上线后一定会遇到状态丢失、重复执行、边界不清的问题。
2. 不写 `governance` 和 `evaluation` 的 Agent 系统，只能算作玩具 demo。
3. 架构图里不画基础设施层的，上线后一定会面对「存储选型绑架业务逻辑」的问题。
4. 包结构反映依赖方向——如果你的包依赖方向是乱的，说明业务边界也没想清楚。
## 下篇预告
下一篇讲**领域模型与状态**：Agent 系统里的「名词」怎么定义、Session 与 Turn 的边界在哪里、状态机的起点和终点的判断标准。