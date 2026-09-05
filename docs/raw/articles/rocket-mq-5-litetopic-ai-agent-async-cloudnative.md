---
source_url: https://mp.weixin.qq.com/s/gXZz2wcNbrQatciy-o3-0A
author: Cloud Native
platform: wechat
ingested: 2026-05-26
sha256: f888422b5361b1bab3750b47f24ce45b8c8f557f272ef72fb660d7bd38d8fd66
---

Apache RocketMQ 5.5.0 已正式发布。本次版本的重要特性之一，是社区提案 RIP-83 定义的全新消息模型 LiteTopic 进入开源版本。LiteTopic 面向 AI Agent、异步任务和海量轻量会话场景，支持百万级轻量会话通道共存，并在轻量通道管理、消费状态持久化和事件驱动分发等方面进行了针对性设计。此前，阿里云云消息队列 RocketMQ 版已围绕相关 AI 通信场景提供能力；随着 LiteTopic 进入开源版本，这一消息模型也首次以开源形式面向全球开发者开放。

01

行业正在收敛：

Agent 异步通信成为共识

Cloud Native

在 RocketMQ 5.5.0 发布前后，AI 行业的协议和框架演进，也在不约而同地指向同一个方向。

Anthropic MCP 2026 Roadmap 高度关注 Transport 可扩展性、Agent Communication、任务生命周期管理以及会话状态外化等问题。其核心矛盾在于：有状态 Agent 会话与负载均衡、水平扩展之间存在天然冲突，而任务失败后的重试、结果过期后的清理等生产级生命周期语义，也需要更稳定的运行时支撑。

Google ADK 也发布了 Long Running Agent 方案，指出标准对话循环并不适合所有长时任务场景，系统需要更显式的状态持久化、事件驱动唤醒，以及多 Agent 委托协同。

两条路径，收敛到同一组基础设施需求：

1. 海量会话通道：每个 Agent 会话都需要独立通信通道，不能因水平扩展而丢失。

2. 状态持久化与断点续传：服务重启、冷启动后，需要能够从上次中断处精确恢复。

3. 异步生命周期管理：任务失败有重试，结果过期有回收，调度由事件驱动而非客户端轮询。

这三个需求，不只是协议层或框架层的问题，也对消息通信基础设施提出了更高要求。

02

LiteTopic：

AI 时代消息通信的开源答案

Cloud Native

面对 AI 时代海量轻量会话、状态持久化与事件驱动调度等消息通信基础设施需求，Apache RocketMQ 社区在 2025 年发起 RIP-83（Lite Topic: A New Message Model）提案，从消息模型层面设计了应对方案。随着 5.5.0 发布，LiteTopic 已进入开源版本。

为什么不能用传统的 Topic + Consumer Group 组合来解决？核心原因是：当每个 Agent 会话都使用独立 Group 订阅独立 Topic 时，读请求会随 Topic 数量快速膨胀；Broker 轮询全量 Topic 检查新消息，无效扫描的 CPU 开销也会随规模线性增长；传统 Topic 需要预先创建，无法很好适配按需动态分配；而 Group 模型天然偏向共享消费，也不完全适合会话级独占订阅。

LiteTopic 的设计目标，就是绕过这些限制。三个行业需求，对应三类优化方向：

需求 1 → 父 Topic + 动态子 Topic

LiteTopic 采用“父 Topic 命名空间 + 轻量子 Topic 会话通道”双层结构。父 Topic 除了起到隔离命名空间的作用之外，还承担同一业务域的集中管控，解决海量 Topic 场景下的服务发现问题。子 LiteTopic 支持按需创建和轻量化管理，底层以 RocksDB 替代传统 ConsumeQueue 文件，从而提升单个 Broker 对海量 LiteTopic 的承载能力。

需求 2 → Broker 侧消费位点持久化

LiteTopic 将消费位点以“内存快照 + 增量持久化”方式存储在 Broker 端。Agent 节点异常重启后重新订阅时，可以基于已保存状态继续消费，降低业务层自行维护会话状态的复杂度。与 Google ADK 的 DatabaseSessionService 解决的是同一类问题，区别在于 LiteTopic 将这类能力内置于消息队列层，无需业务层另行实现。

需求 3 → 事件驱动调度 + 生命周期自管理

面对大量低频、分散的轻量主题，如果仍采用传统全量轮询方式，系统会在无效扫描上消耗较多资源。LiteTopic 通过事件驱动的 Ready Set 结构，在有消息写入或可读事件触发时再进行精准唤醒，而非全量轮询。同时，RocketMQ 本身具备的消费重试能力，也为 Agent 通信提供了生产级的失败兜底机制。订阅关系更贴近 ClientID 维度而非传统 Consumer Group 维度，Agent 节点上下线时也更有利于降低集群级重平衡带来的开销。

LiteTopic 与传统 Topic 的核心差异如下：

03

核心机制深度拆解

Cloud Native

▍3.1 RocksDB：百万级共存的存储基础

传统 Topic 的每个 Queue 对应一个 ConsumeQueue 文件——百万个 Topic 意味着数百万个小文件，文件系统碎片化读写是性能衰退的根因。

LiteTopic 将索引层切换为 RocksDB，以键值对方式统一管理消费位点：

写入路径不变：消息仍走 CommitLog 顺序追加，不改变高性能写入链路。

索引统一管理：一个 RocksDB 引擎支撑海量 LiteTopic 共存。

结合 TTL 自动回收机制，开发者无需长期手动清理历史会话资源，也能降低历史会话持续累积带来的资源占用压力。这使 LiteTopic 更适合承载大量轻量、动态的会话通道，也更适合长期运行的 AI 应用场景。

▍3.2 事件驱动 Ready Set：减少无效扫描的调度跃迁

传统 Pop 模式以长轮询驱动，消费者周期性向 Broker 发起请求，Broker 遍历全量主题检查新消息。如果百万级 LiteTopic 仍使用这种读模式，全量扫描效率低，会消耗大量 CPU。

5.5.0 引入专用的 LiteTopic 专用的事件驱动读取机制：

Broker 内部维护“就绪集合”。

有新消息写入或者可读事件触发时，才将对应 LiteTopic 放入就绪队列。

事件触发时直接定位订阅的客户端，实现按需精准唤醒。

这与 Google ADK Long Running Agent 的“wake up only when an external event arrives”在设计思路上是一致的——区别在于 LiteTopic 是消息队列层面的原生机制。

▍3.3 消费位点持久化与会话续传

LiteTopic 的两个关键语义，构成了 Agent 通信稳定性的基础：

订阅关系更贴近单会话通信语义：与传统消费模式中 Consumer Group 共享消费进度不同，LiteTopic 的订阅关系更贴近特定客户端连接，有助于降低海量会话并发场景下的系统调度复杂度。Broker 仅对绑定连接投递消息，Agent 节点上下线只更新该条绑定记录，不触发集群级重平衡——这是百万级会话并发场景下系统稳定性的核心保障。

消费位点 Broker 持久化：内存快照 + 增量持久化存储在 Broker 端，Agent 异常重启后 Broker 自动定位断点、继续投递，无需业务层实现状态管理。

04

五分钟跑通 Multi-Agent 异步通信

Cloud Native

以“主控 Agent 分发任务 → 执行 Agent 处理 → 结果异步回传”场景为例。

注：具体配置项、启动方式和管理命令请以 Apache RocketMQ 5.5.0 官方文档及示例为准。完整示例参考 rocketmq-clients[1]仓库中的 LiteProducerExample 和 LitePushConsumerExample。

▍Step 1：启动 RocketMQ 5.5.0
# 1. 下载并解压
wget https://mirrors.aliyun.com/apache/rocketmq/5.5.0/rocketmq-all-5.5.0-bin-release.zip
unzip rocketmq-all-5.5.0-bin-release.zip && cd rocketmq-all-5.5.0-bin-release
# 2. 追加 LiteTopic 配置到 broker.conf
cat >> conf/broker.conf << EOF
enableLmq=true
enableMultiDispatch=true
storeType=defaultRocksDB
EOF
# 3. 启动 NameServer
nohup sh bin/mqnamesrv &
# 4. 启动 Broker
nohup sh bin/mqbroker -n localhost:9876 -c conf/broker.conf &
# 5. 启动 Proxy
nohup sh bin/mqproxy -n localhost:9876 &
# 6. 创建 LiteTopic
sh bin/mqadmin updateTopic -b localhost:10911 -t AGENT_TASK_NS -a +message.type=LITE
# 7. 创建 LiteGroup
sh bin/mqadmin updateSubGroup -b localhost:10911 -g executor-group -o true --attributes +lite.bind.topic=AGENT_TASK_NS
▍Step 2：主控 Agent 投递任务
// 父 Topic 作为命名空间（所有 LiteTopic 共享）
static final String PARENT_TOPIC = "AGENT_TASK_NS";
Producer producer = provider.newProducerBuilder()
    .setClientConfiguration(clientConfig)
    .setTopics(PARENT_TOPIC)
    .build();
// setLiteTopic() 指定目标 Agent 的专属通道，无需预创建
Message task = provider.newMessageBuilder()
    .setTopic(PARENT_TOPIC)
    .setLiteTopic("TASK_" + executorAgentId)
    .setBody(taskPayload.getBytes(StandardCharsets.UTF_8))
    .build();
producer.send(task);
▍Step 3：执行 Agent 订阅并处理
LitePushConsumer worker = provider.newLitePushConsumerBuilder()
    .setClientConfiguration(clientConfig)
    .setConsumerGroup("executor-group")
    .bindTopic(PARENT_TOPIC)
    .setMessageListener(msg -> {
        String result = llmService.invoke(new String(msg.getBody()));
        replyProducer.send(buildReply(PARENT_TOPIC, "RESULT_" + sessionId, result));
        return ConsumeResult.SUCCESS;
    })
    .build();
// 动态订阅专属 LiteTopic，首次订阅自动创建
worker.subscribeLite("TASK_" + executorAgentId);
// 宕机重启后 Broker 自动恢复消费位点，从断点继续投递

父 Topic AGENT_TASK_NS 作为命名空间，每个执行 Agent 独占一个 LiteTopic 接收任务，结果通过另一个 LiteTopic 异步回传。动态上下线不触发集群重平衡，宕机后消费位点自动续接，TTL 到期自动清理。

const consumer = await new LitePushConsumerBuilder()
  .setClientConfiguration({ endpoints, namespace, sessionCredentials })
  .setConsumerGroup(consumerGroup)
  .bindTopic(inboundTopic)
  .setMessageListener({
    async consume(messageView: MessageView) {
      await messageHandler({ accountId, messageView, cfg });
      return ConsumeResult.SUCCESS;
    }
  })
  .startup();
05

阿里云商业版：开源之上的企业级增强

Cloud Native

开源 5.5.0 提供 LiteTopic 核心模型：轻量存储、事件驱动分发、Broker 侧会话续传。阿里云云消息队列 RocketMQ 版在此基础上，针对企业级 AI 生产诉求做了专项增强：

LiteTopic 还提供了 Consume Suspend 能力，在 GPU 资源紧缺的背景下，AI 服务平台基于这个能力能够实现“千人千面”的精细化流量控制，做到分级服务和优先级资源调度。传统限流的困境在于：单个用户的慢任务会阻塞其他用户的消息处理，限流等待直接阻塞消费线程，影响整体吞吐；而且预创建的 High/Mid/Low 队列粒度太粗。LiteTopic 为每个用户/会话创建独立通道后，限流策略就可以独立执行——AI 服务平台通过消费挂起（Suspend）机制实现平滑限流，不粗暴拒绝，而是将超限请求顺延到下个时间窗口：

目前，阿里云大模型服务平台百炼网关已基于 LiteTopic 构建异步事件工作流，在生产环境以“千人千面”流控管理 AI 推理请求的流量峰值与算力调度。

06

与社区共建 AI 原生消息基础设施

Cloud Native

5.5.0 是 Apache RocketMQ 走向 AI 原生的重要一步。Anthropic 和 Google 在协议层和框架层定义异步 Agent 通信标准，消息队列在基础设施层提供运行时保障——两个层次彼此互补。

值得关注的是，MCP 已成立 Triggers & Events Working Group，方向是补齐“Server 主动推送”能力——这恰恰是消息队列发布/订阅模型的天然能力。同时 MCP 正在推进 Server Registry（类似 A2A Agent Card），意味着 MCP 正向通用 Agent 通信协议演进。

社区正在探索的下一阶段方向：

LiteTopic 作为 MCP 会话外化层：为 MCP Streamable HTTP 提供持久化、可异步投递的会话状态管理。

LiteTopic 与 MCP Tasks 协议层对接：探索 RocketMQ Transport 承接 MCP 的传输、Task 调度和状态保持。

集成到 Openclaw/Hermes Agent/QwenPaw 等开源通用 Agent 框架：用 Litetopic 扩展 Agent Channel，将对话型 Agent 升级为事件驱动型 Agent，更深入地嵌入企业业务流程中。

如果你对 RocketMQ for AI 方向感兴趣，欢迎通过以下方式参与共建：

参与 RIP-83 及后续 RIP 讨论，贡献对 AI Agent 通信场景的设计思路。

在 GitHub 提交 Issue、PR，或分享使用案例。

加入钉钉技术交流群：44552972。

相关链接：

[1] rocketmq-clients

https://github.com/apache/rocketmq-clients


[2] Apache RocketMQ 5.5.0 Release Notes

https://github.com/apache/rocketmq/releases/tag/rocketmq-all-5.5.0

[3] RIP-83 提案原文

https://github.com/apache/rocketmq/wiki/RIP%E2%80%9083-Lite-Topic:-A-New-Message-Model

[4] 阿里云 RocketMQ for AI 解决方案

https://www.aliyun.com/solution/tech-solution/rocketmq-for-multi-agent-communication

[5] 阿里云 RocketMQ for AI 内容合集

https://www.aliyun.com/activity/middleware/ai-mq

[6] Apache RocketMQ 中文社区

https://rocketmq-learning.com/

延伸阅读：

《Apache RocketMQ for AI 战略升级，开启 AI MQ 新时代》

《Apache RocketMQ × AI：面向 Multi-Agent 的事件驱动架构》

《AgentScope x RocketMQ：打造企业级高可靠 A2A 智能体通信基座》

《AI 推理精细化流量治理实战：RocketMQ LiteTopic 的“千人千面”流控方案》

《官宣上线！RocketMQ for AI：企业级 AI 应用异步通信首选方案》