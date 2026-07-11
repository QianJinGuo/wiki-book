# Better-Harness：Agent Harness 自动优化方法论

## Ch05.114 Better-Harness：Agent Harness 自动优化方法论

> 📊 Level ⭐⭐⭐ | 7.0KB | `entities/better-harness-eval-trace-methodology.md`

# Better-Harness：Agent Harness 自动优化方法论
## 核心问题
Karpathy Autoresearch 证明自动优化需要实验循环，但循环能跑起来的前提是：**评价信号必须足够清楚**。当指标本身错了，自动优化会把错误放大。 
Better-Harness 补上了更难的一半——当评价信号错了，系统会沿着错误方向跑得更快。 

## 六步法
``` 
①收集标注 eval 
  ↓ 
②拆优化集 + 留出集 
  ↓ 
③跑基线（当前 harness 原始分数） 
  ↓ 
④看 trace，定向改动（一次只改一个方向） 
  ↓ 
⑤验证：优化集+留出集都变好才算通过 
  ↓ 
⑥人工审核：分数涨不等于产品体验变好 
``` 

## 关键机制
### eval = 方向信号，不只是验收表
在优化循环里，eval 角色类似 ML 训练数据： 
| ML 训练 | Harness 优化 | 
|---------|-------------| 
| 训练数据 | eval 样例 | 
| 梯度信号 | 行为信号（做对/做错） | 
| 权重调整 | prompt/工具说明/工作流改动 | 
| 过拟合 | 在优化集上刷分但无泛化 | 

### 优化集 / 留出集拆分
- **优化集**：让系统提出改动
- **留出集**：检查改动在没见过样例上是否成立
类比：给新同事练手工单，考的时候要用没见过的工单才能验证真学会了。 

### 人工审核 = 防上线翻车
有些指令能涨分，但过度具体，只服务某个样例，浪费上下文。人工审核检查改动放到真实用户那里是否真的更好。 

## 行为标签
每条 eval 要打行为标签（工具选择、多步推理、搜索适时停止等）。标签把 eval 从"一堆题目"变成"行为地图"： 

- 没有标签：只能看总分，总分很容易骗人
- 有标签：能定向实验，只跑某类样例，成本更低，诊断更清楚

## 行动节奏错误是主要失败模式
LangChain 实验发现：**很多 Agent 失败，不是因为完全不会做任务，而是行动节奏不对。** 

- 该停的时候继续搜
- 该动手的时候反复确认
- 该问目标的时候去问实现细节
Better-Harness 把模糊的坏体验，变成可被 eval 捕捉、被 trace 定位、再被 harness 定向修正的行为问题。 

## eval 生产飞轮
``` 
更多使用 → 更多 trace → 更多 eval → 更好的 harness 
``` 

### 三种 eval 来源
1. **手工策展**：团队自己写。价值高，难规模化 
2. **生产 trace**：真实用户怎么用、Agent 怎么失败。一次失败 trace = 一个 eval。用户纠正的 trace 价值更高 
3. **外部数据集**：筛选、改写、对齐。只适合作为原材料 

### 维护机制
- **自动错误检测**：持续监控生产 trace，失败自动分类聚类
- **从 trace 自动生成 eval**：Agent 犯了错，那条 trace 就是一个 eval
- **harness 版本对比**：同一组任务跑两个版本 harness，用 trace 逐条对比

## 深度分析
### 1. eval 是方向信号而非验收表
这一认知转变是 Better-Harness 的理论核心。传统开发中，测试是验收手段——代码通过测试就算合格。但在 Agent 优化循环里，eval 扮演的是训练数据的角色：它提供行为信号，决定权重往哪个方向调。方向一旦偏了，harness 优化只会加速错误。这与 ML 训练中"坏数据导致模型发散"的逻辑完全对应。 

### 2. 优化集/留出集拆分是防作弊机制
只给 Agent 看优化集，相当于考试前透题。留出集的存在强制验证改动是否泛化。这个设计直接借鉴了 ML 的训练/验证集划分原则，但目的不同——不是调超参数，而是验证 prompt/工具/工作流改动的有效性。 

### 3. 行为标签将 eval 从题目升级为行为地图
没有标签的 eval 只能反映总分，而总分极易被过拟合欺骗。有标签的 eval 可以定向诊断：工具选择错误在哪、多步推理卡在哪、搜索何时该停却没停。这使得实验成本降低（只跑某类样例），诊断精度提升。 

### 4. eval 生产飞轮是系统核心资产
更多使用产生更多 trace，更多 trace 孕育更多 eval，更好的 eval 驱动更好的 harness。这个正向循环将 Agent 系统从"调 prompt"的手工阶段推向"数据驱动的自动优化"阶段。核心资产从单条 prompt 转向一套持续生长的 eval 和 trace 系统。 

### 5. 行动节奏错误是 Agent 失败的主要形态
LangChain 的大量实验揭示了一个反直觉事实：Agent 失败通常不是能力不足，而是行动节奏错乱。该停时继续搜、该执行时反复确认、该澄清目标时去研究实现细节——这些都是 eval 和 trace 能捕捉、人为干预能修正的行为问题。 

## 实践启示
### 1. 为每条 eval 打上行为标签
不要只记录"通过/失败"，要标注失败反映了哪种行为缺陷：工具选择错误、搜索时机不当、推理链路中断等。标签把 eval 变成诊断地图，让定向实验成为可能。 

### 2. 始终保留留出集用于泛化验证
每次 harness 改动都要在留出集上验证。优化集涨分而留出集跌分，说明改动只在见过的样例上有效，属于作弊而非学习。 

### 3. 上线前必须人工审核
分数通过不等于产品体验提升。有些改动过度适配某个样例，浪费上下文窗口，或在真实用户场景下产生反效果。人工审核是防止"分数涨但体验降"的关键门控。 

### 4. 建立 eval 生产飞轮
从生产 trace 中自动提取失败案例作为 eval 素材。用户纠正过的 trace 价值最高——它直接反映了真实的人机协作失败模式。 

### 5. 把行动节奏纳入评估维度
除了任务完成率，加入对"何时该停""何时该问""何时该执行"的评估。这些节奏相关的行为标签能捕捉 Agent 的深层缺陷，而不仅仅是工具使用错误。 

## 相关概念
- Harness 工程化（参见 `Agent Harness Architecture`）
- 复旦 AHE（参见 `Agentic Harness Engineering Ahe`）：可观测性驱动的自动优化
- Agent Hooks（参见 `Agent Hooks Programmable Workflow`）：生命周期可编程控制
## 相关实体
- [Openclacky Harness Engineering 100 Percent Cache Hit](ch05/066-harness-engineering.html)
- [Agent Harness Engineering Survey 2026](ch05/066-harness-engineering.html)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道 V2](ch05/039-agent-harness.html)
- [Agentscope Java Harness Framework](../ch03/050-agentscope-java-harness-framework-2-0-agent-harness.html)
- [Browser Use Runtime Harness](ch05/018-harness.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/evaluation-and-benchmarks.md)

---

