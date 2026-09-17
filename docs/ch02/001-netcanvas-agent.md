# NetCanvas：用「可交互视觉拓扑」给运维 Agent 造一张外部工作记忆

> 📊 Level ⭐ | 6.4KB

## NetCanvas：给运维 Agent 造一张「可交互视觉拓扑」

华为 GTS 算法团队在 IP 承载网排障场景中提出的 **NetCanvas**：把「可交互视觉拓扑」作为大模型 Agent 的**外部工作记忆画布**，让 Agent 像人类工程师一样「看着网络排障」。文章把根因总结为一个可复用的病名——**拓扑失忆**：模型的推理能力再强、读得懂海量文本日志，却记不住这张动态网络长什么样；让纯文本 Agent 在脑海里硬扛成百上千个节点的动态变化，注定陷入记忆坍塌。

## 问题：认知超载与认知卸载

文章的立论借自认知哲学家 Andy Clark——真正的智能懂得使用外部图纸进行「**认知卸载**（Cognitive Offloading）」。真实现网是「活」的：每次故障的网络拓扑空间都截然不同，能在脑海中实时重构「动态网」并定位根因的只有极少数资深专家。当 Agent 进入多设备、多路径、带防火墙与 ECMP 的真实拓扑后，典型失败形态是绕弯、重复探查、在同一节点打转。

作者由此给出了一句可直接搬进 Harness 设计文档的结论：**外围系统（Harness）如何为模型呈现这个真实世界，才真正决定了它最终的战斗力**——对拓扑、路径、协议动态交织的系统，把海量日志生硬压进 Token 里必然导致认知超载；Agent 需要的是一套**能持续演化的「延展工作记忆」**。

## 机制：三招构成一张「活地图」

1. **把图长出来**：由系统生成可交互的网络拓扑视图，而不是把拓扑描述塞进文本上下文。
2. **让 Agent 用图**：Agent 可以随时切换全局与局部视图、高亮当前焦点节点，并能**主动改变连线颜色**（如用绿/红虚线标记通断）在图上直接记录自己的推理假设——「边看、边标、边排查」，模型不必再在脑子里死记硬背。
3. **按网工习惯画图（认知对齐）**：研发团队在测试中发现一个反直觉事实——只要把机器生成的拓扑换成符合人类网络工程师认知习惯的**领域布局**，Agent 的排障成功率就出现碾压式跃升。「画对了图，AI 才能走对路」：呈现形式本身是能力的一部分，而非装饰。

## 验证：CTBench 上的三个维度

验证在公开通信运维基准 **CTBench** 上完成（任务全部来自真实运维案例，要求 Agent 进入未知网络、动态执行命令，并从不完整、碎片化的证据中逐步定位故障，难度远超单轮问答）：

| 维度 | 结果 |
|---|---|
| 排障更准 | 综合通过率 **30.3% → 54.5%**（带物理连线先验可达 **63.6%**），任务通过率提升 **24.2%**，尤其突破双防火墙、ECMP 等高度依赖空间关系的复杂路径 |
| 步数更少 | 平均探查步数 **159 → 113** 步 |
| 成本更低 | 按「每解对一题」摊算，大模型 Token 试错成本下降 **26%–45%**（最高 −45%） |

作者据此强调「画图不是增加大模型的负担，而是实实在在省下了试错成本」——把结构从上下文里挪到可操作的外部表示上，换回的是更少的盲走与更低的 token 消耗。

## 为什么这条经验可迁移

- **它把「记忆」问题翻译成「表示」问题**：不是让模型记住更多，而是把需要保持的结构性状态外化成可读、可写、可标注的工件；这与 [Harness 上下文管理工作集](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-context-management-working-set.md)、[上下文窗口管理](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-context-window-management.md) 的取舍同轴。
- **「认知对齐」是可复用的设计约束**：同一份信息的不同呈现方式导致成功率跃升，说明 Harness 的呈现层（视图/布局/标记约定）应当被视为一等设计对象，而不是 UI 细节。
- **可写画布 vs 只读上下文**：允许 Agent 在图上记录假设（改连线颜色），相当于把「草稿纸」纳入运行时——与 [上下文工程](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) 中「工具即上下文／主动卸载」的思路一致，也与 [Harness 架构深潜](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture-deep-dive-aksahy.md) 对工作记忆与工具面的分层讨论互补。
- **验证口径值得复用**：同时报告准确率、探查步数与按题摊算的 token 成本，避免只报单一增益掩盖成本转移。

## 产物与关联

- 代码：`github.com/caimanjing/netcanvas`；基准数据集：`huggingface.co/datasets/netop/CTBench`（原文给出链接）。
- 概念关联：[Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)、[Agent Memory 架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-architecture.md)、[工作集与长期记忆](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/working-set-vs-long-term-memory.md)、[工具使用与推理](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/tool-use-reasoning.md)
- 同为「外围系统决定战斗力」的生产案例：[上下文管理工作集](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-context-management-working-set.md)、[垂类业务如何落地生产级 Agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vertical-domain-production-agent-playbook-alibaba-2026.md)

---

→ [原文存档](https://mp.weixin.qq.com/s?__biz=MzIzNjc1NzUzMw==&mid=2247923377&idx=2&sn=6af7b413785dacd51cc4090b1d557902)

---

