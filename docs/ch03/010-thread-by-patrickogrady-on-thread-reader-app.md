# Thread by @_patrickogrady on Thread Reader App

## Ch03.010 Thread by @_patrickogrady on Thread Reader App

> 📊 Level ⭐ | 9.9KB | `entities/thread-patrickogrady.md`

## 核心内容
### Route 66 计划（2025-05-12）
Commonware 与 Coinbase 联合宣布 **Route 66** 计划，旨在降低新型区块链的接入成本与集成难度。核心论断：

- 区块链正变得越来越不像传统区块链——专用区块空间（stablecoin）、加密内存池（encrypted mempool）、游戏公平随机性等用例不断模糊链与应用边界
- 这一趋势对用户是重大利好，但对钱包、交易所、托管商和数据提供商构成"巨大噩梦"——高频硬分叉、新型密码学、复杂交易在万级 TPS 下整合成本极高
- 结果是每年仅有少数新型区块链被广泛集成，且往往仅支持最基础的转账功能
- Route 66 通过标准、通用库和共享工具为新型应用铺路，降低成本并缩短上市时间

### Tempo 共识机制（2025-12-09）
Patrick 在 Thread 中详细描述了 **Tempo** 的共识设计要点：

- **BLS12-381 阈值签名**：验证者在每轮共识中发出一组可基于静态网络密钥（在验证者集合变更间保持一致）进行验证的阈值签名
- **嵌入式 VRF**：第一个签名为内置 VRF，驱动即时领导者选举（just-in-time leader election）——无人知晓下一轮领导者是谁，直至上一轮被最终确认或无效
- **链上随机性**：为盲拍（blind auction）等基于 Timelock Encryption 的应用提供链上随机性来源
- **区块证明**：第二个签名对区块本身进行 attestation，在约 48 字节内完成最终确认——可用于验证 RPC 提供的链数据有效性，并驱动跨链互操作（仅需基于静态网络密钥验证证明）

### 关于 Loss-y 消息传递的共识研究提问（2024-11-14）
Patrick 在 Twitter 发文询问是否存在使用"有损消息传递"（loss-y model）而非"最终交付"（eventually delivered）假设的共识论文。他观察到：

- 近期阅读的共识论文均假设消息最终会被交付但从不丢弃——与 WAN 上节点定期重启的真实环境不符
- 虽然证明可能极难书写，但他好奇在不同消息失败率或恢复场景下，是否存在平衡鲁棒性与带宽/效率的同行评审研究

### Commonware 成立与框架发布（2024-08-08）
Patrick 宣布创立 **Commonware**，认为未来链上时代的领导者将走**专业化**（specialization）道路，而非追随已铺好的路径。Commonware 的核心定位：

- 构建开源、Rust 原生区块链框架，专为超高吞吐量（excessive throughput）、易修改性（tractable modification）和嵌入式互操作性（embedded interoperability）而设计
- 首个原语 **p2p**（ALPHA 阶段）已通过 Apache-2 和 MIT 双许可证发布

### Vena 共识协议（2024-06-25）
Patrick 与 Stephen Buttolph 共同探索了 **Vena**——一种面向大规模验证者集（>500 验证者）的近似 1 秒最终确认共识方案：

- **网络级最终确认**：Vena 以网络速度驱动最终确认，提供强活性保证
- **原生确认输出**：在大验证者集上原生输出每个区块的聚合签名确认凭证
- 设计目标：兼顾大型验证者集（>500）与强鲁棒性（liveness 和 safety 上限 f < n/3 拜占庭故障）

## 深度分析
### Route 66 的战略逻辑
Route 66 反映了一个结构性问题的解决方案：区块链堆栈的日益专业化与基础设施层集成成本之间的矛盾。当应用链开始像专用应用而非通用智能合约平台运行时，传统的"大一统"集成模式（钱包支持所有链、所有功能）面临瓶颈。
Coinbase 的参与是关键变量。作为美国最大的合规加密资产托管和交易平台，Coinbase 对接新型区块链的动机是商业驱动而非技术好奇。其战略投资部门 Coinbase Ventures 的介入表明，Route 66 不只是技术倡议，也是市场扩张策略的一部分——降低 Coinbase 生态接入新链的成本，从而捕获更多用户和资产流量。
这与 Coinbase 此前推出的 Layer 2 网络 Base 的逻辑一脉相承：不是等待开发者上门，而是主动降低开发者进入 Coinbase 生境的门槛。

### 专业化趋势的本质
Patrick 指出的"区块链越来越不像区块链"并非隐喻，而是一个精确的技术描述：

- **专用区块空间**：某些应用不需要完整的状态执行能力，只需要特定的数据可用性或排序保证
- **加密内存池**：在 MEV 敏感型应用中，链下加密内存池将排序逻辑从区块生产者转移到应用层
- **游戏公平随机性**：特定应用对随机性的需求倒逼链上可验证随机函数（VRF）的普及
这种"模块化应用"趋势对 Commonware 的框架设计产生直接影响：框架必须支持**过度吞吐量**（处理专用应用的高并发需求）、**易修改性**（快速适配新 cryptographic primitives）和**嵌入式互操作性**（应用间而非链间互操作）。

### Tempo 的密码学创新
Tempo 的设计亮点在于将多个密码学构件组合成一个紧凑的签名流：
1. **阈值 BLS 签名**：聚合多方签名，将验证者集规模从 O(n) 降低到 O(1) 的验证成本
2. **嵌入式 VRF**：将随机性来源嵌入共识本身，而非依赖外部随机信标（randomness beacon）
3. **即时领导者选举**：消除区块生产者的前瞻暴露，提升抗审查性
值得注意的是，VRF 输出同时服务于两个不同层级的功能——共识层的即时领导者选举和应用层的链上随机性拍卖。这种"密码学原语复用"（cryptographic primitive reuse）是一个优雅的系统设计选择，体现了 Patrick 对密码学构件组合能力的深刻理解。

### 关于"有损模型"的研究空白
Patrick 的提问暴露了共识研究中的一个实际脱节：学术论文普遍采用"消息最终交付"的干净模型，而工程实现必须处理 WAN 上的消息丢失、节点重启和网络分区。这个 gap 不是技术问题，而是激励机制问题——写有损模型的证明极难，但工程价值极高。
这一观察对 Commonware 的研究方向有重要启示：做 loss-y WAN 模型下的共识分析，可能是未来差异化的学术贡献方向。

### Vena 与大规模验证者集
Vena 针对的问题是经典的：如何在保持安全阈值（f < n/3）的前提下，在大型验证者集上实现快速最终确认（~1s）。
传统共识协议（如 PBFT）在大型验证者集上的通信复杂度为 O(n²)，导致在 n>100 时性能急剧下降。Vena 的设计通过聚合签名和乐观响应（optimistically responsive）在保持 O(n) 通信复杂度的同时实现网络级最终确认。
这与 Stephen Buttolph 在 Avalanche 的研究一脉相承——Buttolph 是 Avalanche 共识变体的重要贡献者，其对大规模验证者集优化的关注是一致的。

## 实践启示
### 对区块链开发者的建议
1. **关注 Route 66 动态**：若你的应用需要接入新兴专业链，Route 66 的标准库和工具链将显著降低集成成本。联系 route66@commonware.xyz 获取早期参与机会
2. **考虑 Tempo 作为共识基底**：对于需要即时最终确认+链上随机性的应用（如预测市场、游戏、彩票），Tempo 的设计值得研究，其嵌入式 VRF 可避免外部随机信标的依赖风险
3. **模块化优先于单体设计**：新公链/应用链的设计应从一开始就考虑专业化，而非试图成为"全功能链"

### 对投资机构的启示
Coinbase Ventures 对 Route 66 的支持表明，其判断是：未来成功的区块链应用将运行在高度专业化的执行层上，而非以太坊这样的通用结算层之上。这一判断与 Coinbase 在 Base 上的布局一致。
对追踪 Coinbase 生态的投资者，Route 66 参与方（包括早期贡献者项目）是潜在的_alpha来源_——这些项目将优先获得 Coinbase 平台级支持。

### 对协议设计研究者的方向
Patrick 关于"loss-y 模型"的问题指出了一个有价值的研究方向：在消息丢失率非零的 WAN 环境下，如何设计既保持安全性（safety）又保证活性（liveness）的共识协议，并进行严格的敏感性分析（不同丢包率下性能的渐变行为）。
这与 Commonware 宣称的"tractable modification"哲学相契合——框架设计需要支持研究者快速修改共识参数和假设，而不是每次修改都需要从零开始证明。
## 相关实体
- [Thread Openai Devs](/ch01-766-thread-by-openaidevs-on-thread-reader-app-thread-reader-a/)
- [Zeus Rwa Thread Reader](/ch01-132-thread-by-zeusrwa-on-thread-reader-app/)
- [Thread 0Xcheeezzyyyy](/ch01-748-thread-by-0xcheeezzyyyy-on-thread-reader-app-thread-reade/)
- 
- Axie Infinity Ronin Ethereum Layer2 Migration

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/thread-patrickogrady.md)

---

