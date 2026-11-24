# NetCanvas：用「可交互视觉拓扑」给运维 Agent 造一张外部工作记忆

> 📊 Level ⭐⭐⭐ | 13.9KB

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

## 深度分析

### 1. 工作记忆的单位是「可重读的工件」，不是 token 预算

拓扑失忆的定义是「排障越深入，局部观测可能越来越多，整体的空间关系却在逐渐丢失」：上下文在涨，全局把握在跌，每推进一步都要从一维 CLI 回显里重画一遍网。加窗口补不回来——图被序列化成文本后，邻接关系只能靠注意力重建，稳定性随长度单调下降。 NetCanvas 换的是**编码**而非容量：token 是图的有损投影，图本身才是无损表示。这是「可重读」与「被记住」的差别——保真责任从推理链挪到了工件上。[Lost In The Middle](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/lost-in-the-middle.md) 是同一条曲线的另一端，[Context Window Economics](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-window-economics.md) 同向印证：159 步的探查说明模型不缺信息，缺可复用的结构坐标。

### 2. 三招是闭环，不是功能清单

招一供给状态，招二提供寻址与落笔，招三让投影可读。缺一环则另两环空转：没有生长，图开场即过期；没有落笔，图只是又一个只读面板；没有布局，图存在但读不出先验。 最强单点证据在招三——仅换成网工习惯的领域布局就「碾压式跃升」，带物理连线先验时通过率可达 63.6%，高于 54.5%。 布局携带的是被压缩的专家先验。但增益不全在布局账上——招二才是把「地图」变成「记忆」的一步：用绿/红虚线记通断假设，等于把中间状态写回工件，下一轮读的是自己上一轮的结论，省掉重复推导。

### 3. 从「给人看的 UI」到「给模型用的寻址方案」

人类可视化优化「一眼看清」，模型可视化优化「一句指到」。惨案说得很清楚：Agent 已锁定故障防火墙，却在这台设备上换了几十种查法、原地打转三百多步——「它知道该查防火墙，却不知道这台防火墙卡在整个图里面的哪个路径的第几跳」。 缺的不是知识，是**句柄**：文本里指代「B 路径第 3 跳那台防火墙」要整段搬回显，按日志长度付费；图里只给一个节点标识，按引用付费。所以给模型画图不能复用监控大屏——大屏求三十秒看出红色，模型要的是可寻址、可写回的坐标。[Tool Use Reasoning](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/tool-use-reasoning.md) 讲工具如何外化推理；这里更进一步：**表示本身成了工具接口**。

### 4. CTBench 量到了认知负荷，漏了三笔账

任务形态（未知网络、动态下命令、从碎片证据逐步定位）贴近认知负荷的定义域：不奖励背知识，只奖励在有限观测下维持结构。 三个维度对应「找对没有」「有没有拿别的题换」「花了多少」，其中逐题比对（16 胜 0 负 50 平）最值得学——它把「平均分上涨」换成了「有没有任何一题变差」。 漏掉的三笔：**重渲染时延**（一条 CLI 一次并图，P1 抢修里这一帧是真成本）、**图滞后**（胜局都建立在图与现网同步之上，没有一题让图落后两拍）、**造图人力**（领域布局是专家认知的工程化沉淀，不在这 45% 里）。基准证明了有图比没图好，没证明这张图值它的维护成本。

### 5. 地图的真实性是新的 SLO，也是新的污染面

「实时合并到当前的图状态中」 是全文最轻描淡写的一行。合并规则一宽松，图就是一张自信的错图——比没图更糟，因为它给出一条看起来有依据的错路径，模型只会沿它走更远。可迁移的做法是把图当带新鲜度的缓存：边级 `observed_at` 与探测来源，超时降「疑似」，被 CLI 反驳时置「冲突」而非静默覆盖。第二个污染面更隐蔽：假设与观测写在**同一张画布**上，不分通道，下一轮就会把上轮的猜测当事实读回——错误在闭环里自我确认，且无日志显示它发生过。

## 实践启示

1. **先做「重复引用审计」，再决定要不要画图。** 判据：Agent 是否在同一条轨迹里反复重新推导同一个结构性不变量（拓扑、依赖、血缘、谁调谁）。是则外化，否则画图只是多一次往返。NetCanvas 的触发条件是「空间关系持续丢失」，不是「信息很多」。 该判据可平移到代码依赖图、数据血缘与事故时间线。

2. **把工件设计成可写，而不是可看。** 只读面板只是给上下文换了层皮；分水岭是模型能否落笔并在下一轮读回自己的笔迹。最小接口：节点与边支持 `mark(status, hypothesis, confidence)`，读取返回带标记的视图。

3. **在表示层强制分离「观测」与「假设」。** 不同字段、不同通道、不同渲染；假设带发起步号，观测带探测 ID 与时间戳。否则模型把自己的猜想读成证据——这是可写工作记忆最典型的自污染路径。

4. **布局是 prompt 之外的第二条先验通道。** 同一拓扑换布局就能跃升，说明有部分领域知识不该进 prompt 而该进渲染器。把布局做成可配置 schema（分层、分组、主干优先），按领域各写一份。

5. **给地图配一张体检表，否则它三个月内就会腐烂。** 边级 TTL；周期性「金丝雀复探」（抽查已断言边重新验证）；矛盾触发失效（标冲突、不覆盖）；外加 map-diff 日志，让复盘能回答「当时模型看到的是哪一版图」。这是把「地图 vs 现实」的偏差从直觉变成指标的唯一办法，[Memory Source Provenance](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/memory-source-provenance.md) 的溯源思路可直接借用。

6. **迁移前先跑「滞后实验」。** 让图落后 N 步测通过率衰减：若 N=2 已跌回纯文本基线，该域就不宜用图。边界很清楚——分钟级以上、结构缓慢演化的系统（网络、依赖图、血缘、事故时间线）收益明确；秒级决策、高频变更的拓扑（撮合、实时调度）会被重渲染时延吃掉全部增益，过期的图是最坏选择。 也别忘 [When Not To Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/when-not-to-harness-engineering.md)：能靠更简单机制解决的，不必先建一张图。

## 产物与关联

- 代码：`github.com/caimanjing/netcanvas`；基准数据集：`huggingface.co/datasets/netop/CTBench`（原文给出链接）。
- 概念关联：[Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)、[Agent Memory 架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-architecture.md)、[工作集与长期记忆](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/working-set-vs-long-term-memory.md)、[工具使用与推理](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/tool-use-reasoning.md)
- 同为「外围系统决定战斗力」的生产案例：[上下文管理工作集](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-context-management-working-set.md)、[垂类业务如何落地生产级 Agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vertical-domain-production-agent-playbook-alibaba-2026.md)

---

→ [原文存档](https://mp.weixin.qq.com/s?__biz=MzIzNjc1NzUzMw==&mid=2247923377&idx=2&sn=6af7b413785dacd51cc4090b1d557902)

---

