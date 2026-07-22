---
title: OpenAI Realtime API 架构首次公开
source_url: https://mp.weixin.qq.com/s/bNx5ojRYJw0HkKSjRiLLVQ
publish_date: 2026-05-07
tags: [wechat, article, openai, agent, harness, rag, multi-agent]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: e323a10d3ae8c2ed86bfcb4814e181ee7bb8b43a0963db088f79d93d0b7ee6c7
---

## 为什么不用 SFU？
**WebRTC 实时通信行业默认方案是 SFU**（选择性转发单元）：每个参与者与 SFU 建立一条连接，SFU 负责音视频转发。
**OpenAI 的场景不匹配 SFU**：
- 绝大多数是 1:1 单用户对模型，延迟极度敏感
- SFU 的多方通话基础设施是多余的
- 还评估过 TURN 方案，但 TURN 要求中继节点持有客户端连接分配状态，不够轻量
---
## 核心架构：relay + transceiver 两层
```
Client → relay (stateless) → transceiver (full state) → AI inference / TTS / transcription
```
### relay（第一层）：无状态 UDP 转发
- **只做一件事**：读取数据包头部的 ufrag 字段，解码出路由信息，转发给对应 transceiver
- **不解密、不解码、不参与任何协议协商**——不知道你在说什么
- **持有信息极度精简**：内存中一条转发映射（client → transceiver）+ 几个监控计数器 + 过期定时器
- **无持久化**：relay 重启后，下一个 STUN 包到达时自动重建路由
### transceiver（第二层）：完整会话状态
- 拥有通话全部协议状态：ICE 连通性检查、DTLS 加密握手、SRTP 媒体解密、会话完整生命周期
- 后端 AI 服务可以当普通服务扩展，完全不需要懂 WebRTC
- **状态集中 = 出问题时只查一个地方**
### 关键设计：ufrag 编码路由（首包零查询）
**问题**：用户第一个数据包到达 relay 时，relay 还没有任何关于这个用户的信息，但必须立刻知道往哪里转发。停下来查数据库会引入延迟。
**解决方案**：
1. transceiver 分配好会话状态，在 SDP 应答里返回共享的 relay 虚拟 IP + UDP 端口（如 `203.0.113.10:3478`）
2. 客户端发出的第一个 STUN binding request 带有 ICE ufrag 字段
3. relay 只解析包头部的 ufrag，**把路由信息编码在里面**，直接转发给对应 transceiver
4. 后续所有包走同一条已建立的路
**容灾**：Redis 缓存 `client IP:Port → transceiver IP:Port` 映射，relay 重启后可提前从 Redis 恢复转发路径。
---
## Global Relay：全球分布式部署
**问题**：用户在北京说一句话，数据包跑到美国西海岸，单程延迟 >150ms，一来一回 >300ms，体验卡顿。
**解决方案**：
- relay 公网暴露面缩到少量固定地址和端口，同一套转发逻辑全球复制部署
- 用户数据包在**离自己最近的入口**进入 OpenAI 内部骨干网
- 通过内部网络到达 transceiver，**不穿越公网**
**优势**：
- 延迟更低、抖动更小、丢包更少
- Kubernetes 部署：不需要暴露成千上万个 UDP 端口
- 更小且固定的暴露面更容易做安全策略和负载均衡
---
## Go 语言实现与优化
**为什么用 Go 而不是 C/Rust**：对当前负载已经够用，"先跑起来，再决定要不要换更重的方案"。
### 三项针对性优化
1. **SO_REUSEPORT**：同一台机器上多个 relay 进程共享同一个 UDP 端口，内核在它们之间分配数据包，避免单一进程成为瓶颈
2. **runtime.LockOSThread**：每个读 UDP 数据的 goroutine 钉在固定线程上，配合 SO_REUSEPORT，同一个通话的包倾向于落在同一 CPU 核心，缓存命中率更高
3. **预分配内存缓冲区**：最小化数据拷贝，避免在转发热路径上触发 Go 的垃圾回收
### 依赖
- 使用了 **Pion**（Go 语言 WebRTC 开源库）
---
## 三条设计原则
1. **硬性状态集中在一个地方**：transceiver 拥有 ICE/DTLS/SRTP 和会话生命周期，relay 只转发。状态集中 = 出问题只查一个地方
2. **在已有信息上做路由**：ICE ufrag 是协议自带的标识符，把路由信息编码在里面，首包到达时就能路由，不需要在热路径上加外部查询
3. **够用就不换**：Go 配合几个内核级优化对当前负载已经够用，没有上 kernel bypass
---
## 性能指标
- **首响应延迟**：< 0.3 秒（从用户说话到听到 AI 返回声音）
- **服务规模**：数亿周活用户
- **relay 集群规模**：相对不大（因为 stateless 设计）
---
## 与 Wiki 现有内容的关联
- [[concepts/managed-agents-architecture]] — Session/Harness/Sandbox 接口抽象（Anthropic）与 relay/transceiver 状态分离设计思想相通
- [[concepts/harness-engineering-framework]] — 架构六层分离（上下文管理/工具/执行编排/状态记忆/评估观测/约束校验失败恢复）与 relay/transceiver 分离架构可对比