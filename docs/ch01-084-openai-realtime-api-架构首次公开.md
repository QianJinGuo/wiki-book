# OpenAI Realtime API 架构首次公开

## Ch01.084 OpenAI Realtime API 架构首次公开

> 📊 Level ⭐ | 5.8KB | `entities/openai-realtime-api-architecture.md`

## OpenAI Realtime API 架构首次公开
> **来源**: OpenAI Technical Blog
> **URL**: https://mp.weixin.qq.com/s/bNx5ojRYJw0HkKSjRiLLVQ
> **SHA256**: f60f5255f7c8d3b2438625f60daf1e1d2cb4792da5ac17e925ac9fa83d7e0284
> **参考原文**: https://openai.com/index/delivering-low-latency-voice-ai-at-scale/

## 相关实体
- [Announcing Openai Compatible Api Support For Amazon Sagemaker](/ch01-539-announcing-openai-compatible-api-support-for-amazon-sagemake/)
- [Openai Gpt Realtime Voice Models Qbitai](/ch01-593-openai-gpt-realtime-voice-models-qbitai/)
- [Aliyun Agentrun 2Line Integration](/ch04-003-agentrun/)
- [Pi Mono Github](/ch01-608-pi-mono-github/)
- [Prompt Debugger Compare Templates Winty](/ch01-606-prompt-debugger-compare-templates-winty/)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/openai-realtime-api-architecture.md)

- [openai发布新一代实时语音模型，能够像人说话一样进行推理、翻译和转录](/ch01-570-openai发布新一代实时语音模型-能够像人说话一样进行推理-翻译和转录/)

## 深度分析

**relay + transceiver 的两层分离架构是整个系统设计的核心洞察**。OpenAI 将"路由转发"与"协议状态管理"解耦，前者（relay）完全无状态，后者（transceiver）持有完整会话状态。这使得 relay 可以极度轻量地水平扩展，而 transceiver 的复杂性被隔离在可预测的边界内。传统 SFU 方案之所以不适合 OpenAI 场景，正是因为 SFU 混淆了这两层职责——它在转发的同时还管理多方通话状态，在 1:1 低延迟场景下引入不必要的开销。

**ufrag 编码路由实现了"首包零查询"，这是工程上对延迟敏感系统的关键优化**。在传统架构中，第一个数据包到达时 relay 需要查询数据库获取路由信息，这一步引入的延迟在实时语音场景下不可接受。OpenAI 的解法是把路由信息直接编码在协议自带的 ICE ufrag 字段中，让数据包本身携带路由指令，使 relay 在不查库的情况下完成首包转发。这是"信息自包含"设计原则的典型示范。

**全球分布式 relay 的设计思想本质上是"入口收敛 + 内部加速"**。relay 只暴露少量固定公网地址，用户数据包在最近的入口进入后，通过 OpenAI 内部骨干网到达 transceiver，完全规避公网的不确定性和跨洋延迟。这一设计与 CDN 的 anycast 入口 + 私有骨干传输的思想一脉相承，但针对 UDP 实时流量做了更精细的控制。

**Go 语言在超大规模实时系统中的成功应用打破了"系统级软件必须用 C/Rust"的迷信**。OpenAI 明确表示对当前负载 Go 已经够用，选择"先跑起来再决定是否换更重方案"的务实路径。配合 SO_REUSEPORT、runtime.LockOSThread、预分配内存缓冲区三项针对性优化，Go 的运行时开销被压制到可接受范围。这对国内团队在选型时的启示是：不要为了技术声望选择 Rust，而要为当前负载选择够用的方案。

**transceiver 持有完整协议状态的设计让 AI 服务"不感知 WebRTC"成为可能**。这意味着后端 AI 团队可以专注于模型推理本身，底层的 ICE/DTLS/SRTP 复杂性被 transceiver 屏蔽。这种关注点分离是大型系统模块化设计的精髓——每个模块只对自己的上层暴露简化接口，底层协议细节在模块内部自行消化。

## 实践启示

**在设计低延迟实时系统时，首先识别哪些状态必须集中、哪些状态可以分散**。OpenAI 的原则是"硬性状态集中在一个地方"，这对任何涉及多进程/多地域协作的分布式系统都适用。在架构设计初期就明确状态边界，可以避免后期因状态耦合导致的扩展困境。

**当系统要求"首包即路由"且无法接受查询延迟时，优先考虑将路由信息编码进协议本身**。这要求在协议设计阶段就预留足够的编码空间，并在客户端和服务端之间建立共享的解码约定。若现有协议不支持扩展，可参考 Redis 缓存预热（relay 重启后从 Redis 恢复转发路径）作为折中方案。

**Go 语言的生态（尤其是 Pion WebRTC 库）已经足够成熟，可以支撑生产级实时通信系统**。如果团队熟悉 Go且延迟目标在百毫秒级，不必为了"政治正确"迁移到 Rust。先用 Go 快速验证，发现瓶颈后用 profiling 数据指导优化方向，而非事前过度工程化。

**构建全球分布式实时系统时，优先用"入口少量固定地址"代替"大量动态端口暴露"**。这不仅便于做安全策略和负载均衡，还能在 relay 侧实现更简单的容灾（固定地址意味着 DNS 层面的容灾切换更容易）。国内团队在部署类似架构时，可以参考这一原则设计 VPN 或游戏加速服务的入口层。

**在系统可观测性建设中，状态集中是双刃剑——简化了问题定位，但也意味着 transceiver 成为单点**。需要在 transceiver 侧增加完善的 metrics、traces 和健康检查机制，确保状态集中带来的可见性优势不被故障定位的复杂性抵消。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/openai-realtime-api-architecture.md)

---

