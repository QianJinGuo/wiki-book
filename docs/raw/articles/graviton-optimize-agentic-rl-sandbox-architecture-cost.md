---
sha256: 96facf4b72836f7d67816501fa3ecd625c2d03947f7c4526018de705ea870400
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/graviton-optimize-agentic-rl-layer-architecture-cost-analytics
ingested: 2026-07-03
feed_name: AWS China Blog
source_published: 2026-07-03
---

# Graviton 优化 Agentic RL 沙箱层：架构与成本优势分析

摘要：讨论 Agentic RL 训练成本时，基于 Graviton5 的 m9g 实例，可将沙盒层成本降低多达 43%。该分析同样适用于 Agent 执行工具调用和代码的 CPU 沙盒环境。

**目录**

01 引言

02 Concept：什么是 Agentic RL

03 Requirement：沙盒层 —— Agentic RL 训练里被忽视的成本中心

04 Workload：七个工作负载原型

05 Benchmark：测试和评估方法

06 Performance：性能视角的结论

07 Cost：成本视角的结论

08 Why：为什么沙盒层天然适合 Graviton?

09 How：怎么把沙盒层迁过去？

10 Hands-On：重现这套数据

11 结语

* * *

## **1\. 引言**

讨论 Agentic RL 训练成本时，注意力几乎都在 GPU 一侧 —— 策略网络、reward model、推理引擎。但策略产出的每一条 rollout 都必须在一个真实环境里执行 —— Python 沙盒、Mock 工具 API、Headless 浏览器、SQL 仓库 —— 这一层是 CPU bound、fan-out 重的 fleet，GPU 经常在等待它们的完成。

我们做了一套可复现的 benchmark suite (`agentic-rl-bench`)，把六个 Agentic RL 训练里真实出现的 workload archetype 加一个端到端混合 rollout 拆出来，在两代 Intel Xeon (`m7i`、`m8i`) 和两代 Graviton (`m8g` Graviton4、`m9g` Graviton5) 的`4xlarge` 实例上各跑一遍稳态测量，记录吞吐、p99 延迟和单位操作成本。

TL;DR 最重要的结论先放在这里：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/01/graviton-optimize-agentic-rl-layer-architecture-cost-analytics-1.png>) [图1]  
---  
  
B9（端到端混合 rollout） 在各 EC2 实例上出现峰值吞吐时的成本表现：

  * m7i → m8g（Gaviton4）：$/1M rollouts 成本降低 ~30%
  * m7i → m9g（Graviton5）：$/1M rollouts 成本降 ~ 41%



后面内容将解释为什么沙盒层workload 上 Graviton 具有优势、我们实测了什么、以及怎么迁过去。

值得补充的一点是：本文虽然聚焦于 Agentic RL 训练中沙箱层的成本优化，但沙箱本身就是 Agent 运行时的执行底座——不论是训练阶段还是推理上线阶段，Agent 都需要在类似的环境中调用工具、执行代码、与外部系统交互。因此，本文的分析、选型和成本优化思路等要点，同样适用于 Agent 推理服务的基础设施规划与成本评估。 

## **2\. Concept：什么是 Agentic RL**

在讨论”把沙盒层搬到 Graviton 上能省多少钱”之前，先把这篇 blog 反复出现的”Agentic RL”是什么定义清楚 —— 它和大家更熟悉的 RLHF 有什么区别、为什么它非要起一个独立的 sandbox fleet。这是后面所有关于成本、工作负载、实例选型的讨论才有立足点。

### 2.1 从 RLHF 到 Agentic RL

过去两年最常见的”用 RL 训 LLM”是 RLHF / DPO 那一类：模型生成一段回答，reward model 给一个标量打分，PPO 或 DPO 把这个标量回传去更新策略。轨迹是单步的 —— `一次 prompt → 一次 completion → 一次 reward` —— 既没有”环境”，也没有”工具”和”状态”。所有反馈都来自另一个神经网络。

Agentic RL（业界也叫 Agent RL / RL for LLM Agents）把这个设定扩展成多步、有状态、带工具的形式：

  * 一次 rollout 不再是一句话，而是一条多步轨迹（trajectory），由 policy 和 environment 交替产出 `(state, action, observation, ...)` 序列；
  * action 不是自由文字，而是结构化的工具调用：function call、API request、shell 命令、SQL、浏览器点击、代码片段……；
  * observation 是工具调用的真实返回值，由一个真实可执行的环境给出，不是模型自己想象出来的；
  * reward 通常是稀疏的、轨迹级别的（任务是否完成、单测是否通过、订单是否真的提交成功、SQL 答案是否正确），有时再叠加少量步骤级 shaping。



一句话总结：RLHF 训出来的是”能写”的模型，Agentic RL 训出来的是”能干活”的模型。代表性工作覆盖一系列方向 —— 代码侧的 CodeRL / RLEF、工具调用侧的ToolRL / τ-bench、Web agent 侧的 WebAgent-R1 / WebRL、数据分析侧的 text-to-SQL RL，以及把这些能力混在一起做端到端 agent 的工作。它们 reward 函数和搜索算法各异，但沙盒层的工作负载特征几乎完全一致，这正是这套 benchmark 想抓住的共性。

### 2.2 一次 Agentic RL training step 长什么样

把一次同步 RL fine-tune step 拆开看，大致是这五步：

  * Trainer 拿一批 task instructions（`bsz` 条）交给当前 policy；
  * 对每条 instruction 采样 G 条候选 rollout（GRPO 通常 8–16，PPO 通常 1–4）。每条 rollout 是 T 步交互，每一步 = “policy 生成一个 tool call → 环境执行 → 把 observation 拼回 context → 进入下一步”；
  * 每条轨迹结束时由一个 verifier 或 reward model 给一个轨迹级 reward；
  * Trainer 用这些 `(traj, reward)` 算 advantage，跑 PPO / GRPO / RLOO / DPO-style 的更新；


  * “采 `bsz × G × T` 次环境交互” —— 就是这篇 blog 反复在说的沙盒层负载。



典型设置 `bsz=64, G=8, T=20`，单 step 就要约 10k 次工具调用 / 代码执行 / 浏览器动作。

整个 fine-tune 跑几万 step，沙盒层做的工作是数十亿次。这也是为什么”trainer 侧 GPU 时长”和”沙盒侧 vCPU 时长”在中等规模的训练集群里常常落在同一个数量级。

### 2.3 为什么环境必须是”真”的

一个关键的点：Agentic RL 的 reward 信号必须是从环境里拿出来的事实，而不是模型自评。如果环境是”假”的 —— 比如让 LLM 自己模拟工具返回值 —— 那 reward 就会被同一个模型的偏差污染，训出来的 policy 学到的是”骗过自己模拟器”，而不是”在真实工具上完成任务”。所以：

  * Code RL 要真把生成的代码丢进 CPython 跑，看单测是不是真的通过；
  * Tool-use RL 要真起一组 stateful mock API，让 cart / order / refund 之间的状态依赖真实存在；
  * Web-agent RL 要真起一个浏览器和一份网页，看 DOM 状态是不是真的变成了期望的样子；
  * SQL agent 要真把生成的 SQL 丢进 DuckDB / Postgres 跑，跟 ground-truth 结果集对照；
  * 文本游戏 agent 要真在一个有合法动作集合和 reward 函数的模拟器里走。



这就是为什么沙盒层不是”训练框架的一个附属容器”，而是一整个独立的、CPU 密集的、和 GPU 训练侧规模相当的 fleet。它的负载形状不取决于具体哪一篇 paper 的 RL 算法，取决于 agent 要操作什么样的真实环境 —— 这也是为什么我们可以用一组 archetype 去概括它，而不必去复现每一篇 RL 训练论文。

### 2.4 这篇 blog 的范围

定义清楚之后划一下边界：本文剩余篇幅全部聚焦在沙盒层的成本，不讨论 trainer 侧的 PPO / GRPO 实现、不讨论 reward model 设计、不讨论 reference policy 的 KL 项、不讨论 inference engine 选型 —— 这些都是另外的故事。我们盯的是一件事：在第 2 章定义的那个”CPU-only、fan-out 重、对 p99 敏感”的 fleet 上，跑同一组真实 Agentic RL 工作负载时，不同架构 和不同代次的 EC2 实例谁更便宜、谁更稳。

第 2 章先把沙盒层这个成本中心的形状画出来，第 3 章列出我们用来回答上面那个问题的七个 workload archetype。

## **3\. Requirement：沙盒层 —— Agentic RL 训练里被忽视的成本中心**

第 1 章把 Agentic RL 一次 fine-tune step 拆成了五步。把这条管线画成模块图，沙盒层到底是什么、它和 trainer 侧的 GPU fleet 是什么关系，就一目了然：
    
    
    +------------------+        +-------------------------------+
    | Trainer (GPU)    |  ----> |  N candidate rollouts          |
    |  policy / value  |  <---- |  (each = 10..30 env steps)     |
    +------------------+        +---------------+----------------+
                                                |
                                                v
                           +--------------------+--------------------+
                           |  Sandbox fleet (CPU, container per env) |
                           |   - python sandbox                      |
                           |   - tool-call mock APIs                 |
                           |   - headless browser                    |
                           |   - SQL warehouse                       |
                           |   - text-game simulator                 |
                           +-----------------------------------------+
    

Trainer 这一侧是 GPU bound 的：策略网络的 forward/backward、reward model 的推理、可能还会有一份 reference policy。

一次 RL step 里训练侧的 vCPU 占用基本可以忽略，瓶颈在显存和卡间互联。但是要算 advantage、算 reward、算 PPO ratio，前提是先把候选轨迹真正跑出来 —— 一个 candidate rollout 是从某个状态出发、由当前策略产生的 10–30 步交互序列，每一步都需要落在一个真实可执行的环境上：

  * 一个能跑任意 Python 代码并隔离副作用的子进程（Code RL）；
  * 一组带后端状态的 mock 工具 / 函数调用 API（Tool-use RL）；
  * 一个真实的浏览器实例和待操作的网页（Web-agent RL）；
  * 一个能跑分析型 SQL 的查询引擎（Data-science agent）；
  * 一个文本游戏模拟器（Embodied / text-game RL）。



这一层就是”沙盒层 (sandbox tier)”。它有几个不太能改的特点，决定了它在成本结构里的位置：

  * CPU 密集，不用 GPU。这一层跑的是解释器、HTTP server、浏览器渲染、SQL 引擎，没有任何 BLAS / CUDA 路径。
  * fan-out 越大，vCPU 越多。Trainer 一次想要 N 条候选轨迹，沙盒层就要并发开 N 个隔离环境（容器或者沙盒进程），所以沙盒侧的 vCPU 消耗几乎和 batch size 成线性关系。GPU 侧的成本是次线性的，一张卡可以同时 batch N 条 rollout 的 forward；沙盒这边没有这种摊销，必须真的开 N 份。
  * 对 p99 长尾极其敏感。RL 同步训练的本质是”等最慢的那条 rollout”。1024 条并发里只要有一条卡在几十秒，整个 batch 的 wall-clock 就是几十秒。所以沙盒层不仅要看吞吐，还要看 p99。
  * 不依赖任何 GPU 调度。这一层完全跑在 CPU 实例上，可以独立选型、独立扩缩容、独立换架构。这是它和 trainer / inference 层最大的不同。



把这几个特点放一起就能看出，沙盒层是整条 Agentic RL 训练管线里少有的”换 CPU 不用动模型代码”的地方：负载是普通的容器化 Python / FastAPI / Chromium / DuckDB，全都在 aarch64 上有一等公民支持，运行时语义和 x86 完全一致。

至于这一层值多少钱，直觉算一笔：一次 RL fine-tune 跑数天不停，每秒上百到上千条 rollout，中等规模的训练集群里沙盒侧 vCPU 总消耗常常和 trainer 侧 GPU 时长在同一数量级。任何能在沙盒侧拿到的单位成本下降，都会直接折算成训练总成本下降，而且不需要去碰 GPU 选型这种敏感的事情。

这就是为什么我们专门盯着沙盒层做这套 benchmark：它是一个 改造代价低、收益直接、风险面小 的成本优化目标。

## **4\. Workload：七个工作负载原型**

我们没有自己造 workload。每一个 archetype 都对应学术界或社区已经被广泛使用过的一类 benchmark，并且都是 RL 训练中真实会跑的环境，只是被裁减成可以单容器化、可以稳定复现的版本。

挑选标准三条：

  * 每一个都要能映射到至少一种已经发表过的 Agentic RL 训练范式；
  * 每一个都要压住一类不一样的 CPU / 运行时瓶颈 —— 解释器 cold-start、JSON I/O、V8 JIT、SIMD 矢量化、syscall、长尾 fan-out 等等；
  * 七个加起来覆盖大多数真实 Agentic RL 项目会用到的环境。

ID | 负载 | 模拟的真实场景 | 数据 / 灵感来源 | 主要压力点  
---|---|---|---|---  
B1 | 代码执行 | LLM 生成的 Python 代码 → 落到隔离子进程里执行 | OpenAI HumanEval (164) + Google MBPP-sanitized (427)，共 591 条 | CPython 解释器 cold-start、fork、subprocess syscall  
B3 | 工具调用 trajectory | Agent 按顺序调 8–15 个 mock 电商 API 完成一个目标 | τ-bench retail；FastAPI + 进程内状态 | 大量短 HTTP、JSON 解析、小对象分配、并发后端状态读写  
B4 | 浏览器 trajectory | Playwright 驱动 Chromium 在自托管 SPA 上完成购物流程 | WebArena shopping；自带 60 商品的 SPA，~25 KB JS 包 | V8 JIT、Skia layout/paint、Chromium 多进程 IPC  
B5 | 分析型 SQL | DuckDB TPC-H sf=1，22 条标准查询时间驱动循环 | DuckDB 官方 `tpch` extension | 列存矢量化（NEON/SVE vs AVX2/AVX-512）、内存带宽  
B7 | 文本游戏模拟 | 8 房间 + 30 物品 + 6 个 goal 的 minigrid，每 episode 30–50 步 | ALFWorld / TextWorld 风格，纯 Python | 多 worker 进程下的 Python 状态机、GIL 跨进程竞争  
B8 | 容器冷启动 | `docker run python:3.11-slim` × N 次，挂钟测启动开销 | 模拟”每条 rollout 一个全新沙盒”模式 | 内核 syscall、cgroup 路径、容器运行时  
B9 | 端到端混合 rollout | 每个 rollout 10–30 步，每步按 B3:50% / B1:20% / B4:10% / B5:10% / B7:10% 抽 task | 模拟真实 RL trainer 的 fan-out | 长尾放大：rollout wall-clock 由最慢 step 决定  
  
这七个里面：

  * B1 / B3 / B4 / B5 / B7 是”典型 archetype”，是这篇 blog 的主要篇幅；
  * B8 是边界检验，看 Graviton 是否还在容器启动路径上有”启动税”；
  * B9 是综合检验，把前 5 个混在一起按真实 RL fan-out 跑，看的是 p99 长尾和 $/k rollouts 这两个最贴近



真实成本的指标。

每一个 archetype 都对应代码仓库里一个独立的 runner（`orchestrator/runners/b*.py`）和一个独立的 worker 容器（`workers/b*-*/`），数据集 / 模板 / 随机种子全部在 image build 阶段固化进去，运行时不依赖外网；每条结果 JSON 的 `extra` 字段会回写当时使用的版本号、模板分布、SF 等等，保证可复盘。

我们也清楚 Agentic RL 还有一些常见 archetype 这次没有覆盖：例如 SWE-bench 那种多文件代码修改（占位 ID 为 B2）、需要大模型做 judge 的 multi-agent 场景、对真实第三方 API 的依赖等等。这些或者太重（SWE-bench 单条要 GB 级 image）、或者无法离线复现，留作后续工作；当前这七个已经能把沙盒层主要的微架构差异展示清楚。

## **5\. Benchmark：测试和评估方法**

我们花了不少篇幅在确保这套对比是干净的。下面几条是关键设计选择：

### 5.1 同一份镜像、同一个 multi-arch manifest

每一个 worker 容器在两个架构各自原生 build 一次（不用 emulation），分别推到 ECR 的 `:v1-amd64` 和 `:v1-arm64` tag，然后用 `docker buildx imagetools create` 合成一个 `:v1` 的 multi-arch manifest。

x86 主机 `docker pull <image>:v1` 拉到的是 amd64 那一层，aarch64 主机拉到的是 arm64 那一层。

Dockerfile、Python 包版本、apt 包版本、所有源码 —— 完全一致。

我们只在两件事上接受架构差异：DuckDB 自动选不同的 SIMD kernel（NEON/SVE 还是 AVX2/AVX-512），这是它内部的事；Chromium 自带不同架构的预编译二进制，我们没有 patch。

### 5.2 多进程 load generator —— 不要让 client 先撞墙

这是最容易翻车的一点，也是我们交学费最多的一处。一开始我们用单进程 asyncio 客户端打负载，发现两个架构不管换什么实例都顶到差不多 600–700 ops/s 就上不去了，而且服务端 CPU 利用率始终偏低。问题不在 server，是 client：单条 asyncio 事件循环的 raw HTTP 吞吐上限大约就在 5–7 万 req/s 这个量级，已经跟不上 16 vCPU 的 server。

修复是把客户端改成 multi-process：一个 orchestrator 容器里 spawn `nprocs ≈ vCPU/2`个 child process，每个 child 跑独立 asyncio + uvloop，自己维护 httpx 连接池，把 counters 和 latency channel 通过 pipe 汇总到 parent。这样 client 永远不会先于 server 饱和。修完之后 server 侧 CPU 才真正打满，两个架构的差距才显现出来。任何不区分两侧瓶颈的对比都是不可信的 —— 这条原则贯穿整套 benchmark 的所有 runner。

### 5.3 Server 侧也按需多进程

类似地，server 侧很多 worker 默认只起一个 uvicorn worker，这在 16 vCPU 实例上是浪费。我们让 worker 进程数跟 vCPU 数挂钩（B1 / B3 / B7 等），让每个容器都能把分配到的所有 vCPU 用满。

B4（Playwright + Chromium）比较特殊。在某些 aarch64 内核版本上，单一 uvicorn 进程`SO_REUSEPORT` 的负载均衡 hash 不均匀，会出现一个 worker 接走绝大多数请求、其他 worker 闲置的情况。我们的解法是 worker 端起 N 个独立的 uvicorn 进程，每个绑独立端口，对外暴露 `/ports` 端点让客户端发现；客户端按 round-robin 主动轮询。这样把内核层的负载均衡问题交给应用层显式解决，两个架构都用同一套机制。

### 5.4 并发扫描和稳态测量

每一个子项都跑一组并发档位，B1/B3/B4/B5/B7/B9 都默认扫 2, 8, 16, 32, 64,128，让六个 archetype 直接可比；既覆盖 trainer 真实 fan-out 区间（c=32–128），也保留低并发（c=2/8）用来分辨 cold-start 类瓶颈。

每个档位的内部结构是：

  * warmup：30 秒，不计入测量。这一段里完成 JIT 预热、连接池建立、TCP 窗口 ramp、文件系统 cache 加热。warmup 末尾会主动 reset 资源采样器，让后续的 CPU 利用率均值反映稳态。
  * measure：默认 300 秒（B9 是 1800 秒），这一段才计 throughput / latency / CPU。
  * cooldown：60 秒，让所有 in-flight 请求清干净再进下一档位，避免相互污染。



B9 之所以拉到 30 分钟，是因为它的 p99 长尾受 B4 和 B5 的影响很重，几分钟的窗口里 p99 抖动太大；30 分钟内的 p99 才是稳定数字。

### 5.5 资源采样口径

在容器内用 psutil 读 CPU% 会被 cgroup 的会计逻辑影响，长时间稳态下会偏低，特别是当容器进程数多于 vCPU 数的时候。我们的资源采样器 直接读宿主机的 `/proc/stat`，拿到的是真实的物理 CPU 利用率；同时还单独记一个 orchestrator 进程自己的 CPU%，方便诊断 client 侧瓶颈。

### 5.6 成本计算

每一份 (子项, 并发) 结果 JSON 都带一组 cost 字段：

  * `instance_hourly_usd`：从 `.env` 里读 `.4xlarge` 列表价，按 vCPU 线性外推 到当前实例规格。AWS On-Demand 同 family 内严格线性（`m9g.16xlarge` ≡ 4 × `m9g.4xlarge`），所以 16xl / 24xl / 48xl 不需要重新跑测，只需要 anchor 一次。
  * `cost_per_1k_units_usd`：每千个 unit（unit 是该子项的主吞吐单位，例如 B1 是 exec、B5 是 query、B9 是 rollout）的 dollar 成本。



把价格写在 `.env` 里有两个好处：一是新实例上线、价格变动不需要改代码；二是用户可以根据自己的 RI / Savings Plans / Spot 折扣替换数字，立刻得到反映自己实际单价的成本对比，而不是只能看 list price。

### 5.7 复现性和数据归档

每一份结果 JSON 包含：

  * `instance.instance_type` / `arch` / region / AZ —— 全部由 IMDSv2 自动读取，不依赖手动填；
  * 完整的 throughput / latency（含 per-query 或 per-task 拆分）/ resource / cost 指标块；
  * `extra` 里写入数据集大小、模板分布、随机种子、TPC-H scale factor、DuckDB 版本、Chromium 版本等，能够按 commit + 这一份 JSON 完整复盘当时的环境；
  * 结果同时落本地` ./results/<arch>/... `和 S3（` 可选 S3_BUCKET`）。



最后由 `summary_*.json` 汇总，并自动生成一份单页 HTML 报告。报告会按 benchmark 拆吞吐单位（exec/s, traj/s, queries/s, rollouts/s …），并对 B5 和 B9 这种带 sub-task 数据的负载额外渲染 per-query / per-task 的明细表。这样一份 summary 就够把所有事实摆出来，不需要回头翻原始 JSON。

## **6\. Performance：性能视角的结论**

下面按 B1 / B3 / B4 / B5 / B7 / B9 顺序逐个看 `.4xlarge` 上的实测数据。所有相对值都以 m7i.4xlarge 同一并发档位的吞吐为 baseline (×1.00) 计算。每张吞吐表的单位与第 3 章中各 archetype 的”主吞吐单位”一致：B1 是 executions/s、B3 是 traj/s、B4 是 traj/s、B5 是 queries/s、B7 是 steps/s、B9 是 rollouts/s。每个子项还附一段 p99 latency 作为参照。

### 6.1 B1 — Code execution

B1 是公认”Intel 友好”的 archetype：CPython cold-start、单线程、分支密集，历来吃高频 x86 核。低并发段确实如此 —— c=2 时三家 Graviton 里只有 m9g 比 m7i 快。但 B1 的瓶颈在高并发段会从单核 IPC 转到 fork-per-second，结果 Graviton 后两代直接拉开。

吞吐 (executions/s)：

Instance | c=2 | c=8 | c=16 | c=32 | c=64 | c=128  
---|---|---|---|---|---|---  
m7i.4xlarge | 134.2 | 455.5 | 735.2 | 725.1 | 705.4 | 742.0  
m8i.4xlarge | 146.6 | 565.8 | 820.8 | 812.0 | 787.3 | 811.6  
m8g.4xlarge | 126.6 | 448.6 | 814.7 | 883.8 | 879.8 | 915.0  
m9g.4xlarge | 160.1 | 572.0 | 1042.1 | 1113.8 | 1089.0 | 1138.6  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/01/graviton-optimize-agentic-rl-layer-architecture-cost-analytics-2.png>) [图2]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/01/graviton-optimize-agentic-rl-layer-architecture-cost-analytics-3.png>) [图3]  
---  
  
几个值得单独说的点：

  * m7i 在 c=16 就基本撞墙（735 → c=128 才 742，几乎不再增长），m9g 一路涨到~1140，c=32 起 m9g 稳定比 m7i 快 50% 以上。
  * m8g 全程不弱于 m8i，从 c=16 起反超并保持 ~10–15% 的优势。
  * p99 在 c=128：m7i 345.8 ms vs m9g 328.4 ms，Graviton4 在 Intel 最有利的负载上 p99 也已经持平偏低；c=32 之后 Graviton5 的 m9g 的 p99 持续比 m7i 低 5–10%。



反直觉的是：B1 这种应该最吃单核频率的 workload，c≥16 之后核数多的 Graviton4 完胜。原因前面 §1 提过：每条 exec 是”fork sandbox + 启 CPython + 跑代码 + 收子进程”，整链 syscall 重。

Graviton 实例的每个 vCPU 就是一个物理核心，而 Intel 实例的每个 vCPU 是通过 SMT 技术在物理核心上虚拟出来的一个线程。此时，当实例的 CPU 负载比较重的时候，Graviton 实例上两个 vCPU 不会争抢同一个物理核心的计算资源；反之，Intel 实例的两个 vCPU 会不停抢占同一个物理核心的计算资源。

### 6.2 B3 — Tool-call trajectory

τ-bench 风格的电商工具调用：`search → compare → add to cart → checkout → refund`，平均 11.7 calls / traj。server 持有 per-user lock 的 in-memory state，wire 是 uvicorn 上的 JSON。

吞吐 (traj/s)：

Instance | c=2 | c=8 | c=16 | c=32 | c=64 | c=128  
---|---|---|---|---|---|---  
m7i.4xlarge | 251.1 | 470.3 | 688.6 | 769.9 | 823.4 | 770.1  
m8i.4xlarge | 225.8 | 602.9 | 787.3 | 975.8 | 1099.1 | 1061.1  
m8g.4xlarge | 277.9 | 786.3 | 943.1 | 1248.8 | 1449.8 | 1395.3  
m9g.4xlarge | 444.7 | 1202.5 | 1476.8 | 1804.2 | 2067.6 | 2055.1  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/01/graviton-optimize-agentic-rl-layer-architecture-cost-analytics-4.png>) [图4]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/01/graviton-optimize-agentic-rl-layer-architecture-cost-analytics-5.png>) [图5]  
---  
  
这是这套 suite 里 Graviton 优势最大的 archetype：

  * m9g 几乎全程是 m7i 的 2.1–2.7×，c=128 拿到峰值 +167%。
  * m8g 也稳稳 +37% 以上，c=64 起逼近 +80%。
  * p99 同步压下来：c=64 一档 m7i 161.8 ms / m8i 123.4 ms / m8g 96.7 ms / m9g 64.0 ms —— m9g 的 p99 直接是 m7i 的 ~40%。



为什么这么夸张：B3 是干净的 “fan-out HTTP + 一点 Python state machine”，没有 SIMD、cold-start，瓶颈完全是 核数 × 每核能跑多少 context switch。

Graviton 的 vCPU = 物理核（无 SMT），m7i 的 16 vCPU = 8 物理核 × 2 SMT；同等”逻辑核数”下 Graviton 提供的物理并行多 2×，恰好跟实测 ratio 对得上。

### 6.3 B4 — Browser trajectory

Playwright 驱动 Chromium 在自托管 SPA 上跑购物流程，是 Graviton 优势最不明显的那个 archetype —— 因为单条 traj 的 wall-clock 大头花在 layout/paint/JS 执行，换架构换不掉太多 ms。

吞吐 (traj/s)：

Instance | c=2 | c=8 | c=16 | c=32 | c=64 | c=128  
---|---|---|---|---|---|---  
m7i.4xlarge | 2.43 | 9.50 | 17.15 | 26.46 | 26.90 | 24.14  
m8i.4xlarge | 2.56 | 10.22 | 18.68 | 27.61 | 28.02 | 28.62  
m8g.4xlarge | 2.45 | 9.79 | 18.30 | 26.85 | 27.36 | 27.26  
m9g.4xlarge | 2.66 | 10.71 | 20.17 | 31.38 | 34.00 | 34.52  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/01/graviton-optimize-agentic-rl-layer-architecture-cost-analytics-6.png>) [图6]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/01/graviton-optimize-agentic-rl-layer-architecture-cost-analytics-7.png>) [图7]  
---  
  
低并发段（c≤16）四家几乎打平，差距被 Chromium 启动 + page load 自身吃掉。但高并发段会显出来，特别是 m7i 在 c=32 之后开始回退（26.9 → 26.5 → 24.1，CPU 已经跑满），m8g/m9g 仍在涨：

  * 吞吐：c=128 时 m9g 是 m7i 的 1.43×。
  * p99：c=128 时 m7i 9.56 s vs m9g 8.13 s，m9g 低 ~15%。



### 6.4 B5 — Analytical SQL on DuckDB (TPC-H sf=1)

DuckDB 在 x86 上走 AVX2/AVX-512、在 aarch64 上走 NEON/SVE，加上 in-process execution 没有 serialization 开销，是最直接吃架构优势的 archetype。

吞吐 (queries/s)：

Instance | c=2 | c=8 | c=16 | c=32 | c=64 | c=128  
---|---|---|---|---|---|---  
m7i.4xlarge | 49.48 | 70.09 | 72.25 | 72.34 | 71.88 | 72.15  
m8i.4xlarge | 60.40 | 86.13 | 88.79 | 88.42 | 88.50 | 87.20  
m8g.4xlarge | 74.51 | 116.49 | 115.14 | 84.24 | 90.71 | 97.27  
m9g.4xlarge | 97.62 | 145.78 | 139.50 | 99.84 | 110.26 | 112.85  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/01/graviton-optimize-agentic-rl-layer-architecture-cost-analytics-8.png>) [图8]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/01/graviton-optimize-agentic-rl-layer-architecture-cost-analytics-9.png>) [图9]  
---  
  
几个观察：

  * 低并发段（c≤16）m9g 是 m7i 的 ~2×，m8g 也稳定 +60% 左右 —— DuckDB 的 NEON/SVE kernel 在 TPC-H 上确实顶用。
  * p99 同步更低：c=8 时 m7i 273.8 ms / m8g 180.9 ms / m9g 145.2 ms。



### 6.5 B7 — Sim text game (ALFWorld-style)

8 rooms × 30 items × 6 goal templates 的纯 Python 模拟，每 HTTP 请求 batch 10 episodes，多 uvicorn worker。本质就是”主机能并行跑多少个 CPython 解释器循环不打架”。

吞吐 (steps/s)：

Instance | c=2 | c=8 | c=16 | c=32 | c=64 | c=128  
---|---|---|---|---|---|---  
m7i.4xlarge | 10843.2 | 17529.0 | 28705.6 | 35941.6 | 36232.0 | 32419.6  
m8i.4xlarge | 10214.9 | 21747.7 | 37613.4 | 41091.1 | 42581.7 | 42952.6  
m8g.4xlarge | 11041.5 | 30456.8 | 41030.3 | 45079.2 | 46146.2 | 47132.6  
m9g.4xlarge | 15361.5 | 25995.9 | 56112.5 | 62556.6 | 64167.1 | 65875.0  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/01/graviton-optimize-agentic-rl-layer-architecture-cost-analytics-10.png>) [图10]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/01/graviton-optimize-agentic-rl-layer-architecture-cost-analytics-11.png>) [图11]  
---  
  
  * c=128 这档 m9g 是 m7i 的 ~2×，65k vs 32k steps/s。
  * 更重要的是 m7i 在 c=64 之后已经回退（36k → 32k），m9g 仍在线性涨到 65k，m8g 也一直涨到 c=128 没饱和。
  * p99 在 c=128：m7i 69.4 ms / m8g 45.8 ms / m9g 37.0 ms，m9g 低 ~47%。



这一组就是”物理核多就赢”的极简故事 —— 纯 Python state machine 不吃 SIMD，跑得快慢就看主机能稳定承载多少个 worker process。

### 6.6 B9 — End-to-end concurrent rollout

每条 rollout 10–30 步，按 `{B3:0.50, B1:0.20, B4:0.10, B5:0.10, B7:0.10}` 的比例抽 sub-task；rollout 完成 = 最慢 step 完成。

这是这套 benchmark 里最贴近真实RL trainer 的一组数字：RL 同步训练等的就是 batch 里最慢的那条 rollout，所以要看 rollouts/s 也要看 p99。

吞吐 (rollouts/s)：

Instance | c=2 | c=8 | c=16 | c=32 | c=64 | c=128  
---|---|---|---|---|---|---  
m7i.4xlarge | 0.93 | 3.52 | 6.12 | 7.20 | 6.74 | 6.67  
m8i.4xlarge | 1.02 | 3.84 | 6.81 | 8.63 | 7.96 | 7.49  
m8g.4xlarge | 0.99 | 3.78 | 6.86 | 9.22 | 8.57 | 7.92  
m9g.4xlarge | 1.10 | 4.24 | 7.89 | 11.90 | 11.60 | 10.82  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/01/graviton-optimize-agentic-rl-layer-architecture-cost-analytics-12.png>) [图12]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/01/graviton-optimize-agentic-rl-layer-architecture-cost-analytics-13.png>) [图13]  
---  
  
  * m9g 在 c=32 取得峰值 11.90 rollouts/s，比 m7i 的 7.20 高 +65%；c=64 一档



仍能稳在 11.60，比 m7i 高 +72%。

  * p99 在 c=32：m7i 13.52 s vs m9g 9.16 s，p99 直接低 32%。
  * m7i 在 c=32 之后开始倒退（7.20 → 6.74 → 6.67），m9g 仍能稳在 10.8 以上；也就是说，沙盒侧实际能”喂饱”的训练 batch 大小，Graviton4/5 比 Intel 实例性能提高明显。
  * m8g vs m8i：c=32 起 m8g 稳定领先 m8i 7–10%，等价于”换架构不换代次”也已经能拿到一截收益。



p99 长尾在 Graviton 上都明显比 m7i 短 —— c=128 一档 m7i 63.3 s / m8i 56.7 s / m8g 52.3 s / m9g 40.1 s，意味着同一个 batch size 下 Graviton4 的 wall-clock 就是 Intel 的 ~63%。这一项的收益直接折算成训练侧 GPU 的等待时间。

### 6.7 小结

把 6 个 archetype 在每个并发档位上的”m9g vs m7i 吞吐汇总为一张表：

Benchmark | c=2 | c=8 | c=16 | c=32 | c=64 | c=128  
---|---|---|---|---|---|---  
B1 | 1.19 | 1.26 | 1.42 | 1.54 | 1.54 | 1.53  
B3 | 1.77 | 2.56 | 2.14 | 2.34 | 2.51 | 2.67  
B4 | 1.10 | 1.13 | 1.18 | 1.19 | 1.26 | 1.43  
B5 | 1.97 | 2.08 | 1.93 | 1.38 | 1.53 | 1.56  
B7 | 1.42 | 1.48 | 1.96 | 1.74 | 1.77 | 2.03  
B9 | 1.18 | 1.20 | 1.29 | 1.65 | 1.72 | 1.62  
  
读这张表的方式：m9g 在每一个 archetype、每一个并发档位上都比 m7i 快，最少+10%（B4 低并发）、最多 +167%（B3 高并发）。在 RL trainer 真正会跑的高并发档位（c≥32），m9g 对 m7i 的吞吐倍数几乎都在 1.4×–2.7× 之间。

如果我们只考虑最高吞吐的话，得到下面趋势图，其中：m8g/m9g 相比 Intel 实例（m7i/m8i）性能优势都比较明显。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/01/graviton-optimize-agentic-rl-layer-architecture-cost-analytics-14.png>) [图14]  
---  
  
## **7\. Cost：成本视角的结论**

把第 5 章的吞吐数字乘上 us-east-1 的 On-Demand 单价，就能把”Graviton 跑得快”翻译成”沙盒层每百万次操作便宜多少”。这一章给一组对应的 $/1M ops 数据，并按 m7i.4xlarge 同档位为 baseline 给出节省比例。

### 7.1 4xlarge On-Demand 单价（us-east-1）

Instance | $/hr | vCPU | $/vCPU-hr | vs m7i  
---|---|---|---|---  
m7i.4xlarge | 0.8064 | 16 | 0.0504 | baseline  
m8i.4xlarge | 0.8467 | 16 | 0.0529 | +5.0%  
m8g.4xlarge | 0.7181 | 16 | 0.0449 | −11.0%  
m9g.4xlarge | 0.7827 | 16 | 0.0489 | −3.0%  
  
第一件需要单独点出来的事：m8i 比 m7i 贵 5%。Intel 换代不是免费的 —— m8i 必须靠吞吐 / 单价压差把这 5% 涨幅赚回来才能在 cost 上不亏。

Graviton 这一侧反过来：m8g 比 m7i 便宜 11%，m9g 也比 m7i 便宜 3.0%。还没看吞吐，光换 Graviton 就已经省了一部分成本。后面所有 $/1M ops 节省，都是”底盘单价优势 × 性能优势”的复利。

换算公式：
    
    
    $/1M ops = (hourly_usd / 3600) × 1000000 / throughput_per_sec
    

### 7.2 各 archetype 在峰值吞吐时所对应的 $/1M ops

这是整章最重要的一张图表：B9 的形状就是 RL trainer 真实 fan out 的形状，`c≥32`是真实训练 batch 的工作区间。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/01/graviton-optimize-agentic-rl-layer-architecture-cost-analytics-15.png>) [图15]  
---  
  
B9 在各实例上出现峰值吞吐时，

  * m7i → m8g（同代换 Graviton）：$/1M rollouts 降 ~30%。
  * m7i → m9g（换 Graviton 再升一代）：$/1M rollouts 降到 m7i 的 ~59%（−41%）。
  * m8i 也能省 ~12%，但远不如同代换 Graviton 划算。



### 7.3 同档位的 $/1M ops 收敛视图

把 6 个 archetype 取各自的”工作并发档位”（多数 archetype 的吞吐稳态 c=64，B4 取c=128）放到一起：

Archetype | 档位 | m7i $/1M | m8i $/1M | m8g $/1M | m9g $/1M | m9g vs m7i  
---|---|---|---|---|---|---  
B1 | c=64 | 0.318 | 0.299 | 0.227 | 0.194 | −39%  
B3 | c=64 | 0.272 | 0.214 | 0.138 | 0.102 | −62%  
B4 | c=128 | 9.279 | 8.218 | 7.318 | 6.116 | −34%  
B5 | c=64 | 3.116 | 2.658 | 2.199 | 1.915 | −39%  
B7 | c=64 | 0.00618 | 0.00552 | 0.00432 | 0.00329 | −47%  
B9 | c=64 | 33.23 | 29.55 | 23.28 | 18.20 | −45%  
  
读这张表的几个要点：

  * B9 的 −45% 是这次迁移真实可期的训练成本节省。B1–B7 是 archetype 拆开测的”教学组件”，但训练 trainer 每秒 fan out 的是 B9 形状的 rollout，所以 B9 的 $/1M 才是 RL 训练实际花的钱。沙盒层从 m7i 迁到 m9g，每百万 rollout 直接从 ~$33.2 降到 ~$18.2。
  * m8g 也已经能省 ~30%。如果团队不愿意立刻上 Graviton5（想再观察稳定性、想分阶段迁移），仅仅”x86 m7i → aarch64 m8g” 换架构就能拿走大部分收益。
  * m8i 的 cost win 完全靠吞吐。Intel 新代单价更贵，必须吞吐涨幅 ≥ 5% 才不亏；在 B4 这种”架构不敏感”的负载上 m8i 几乎打不赢 m7i（c=2/32 一档甚至略亏）。
  * B4 单条绝对值最大。一条 browser traj 的 wall-clock 是 6–9 秒（vs B3 一条~0.5 秒），混合 workload 里 B4 是 cost 大头；优先让 B4 落到 m9g 上，对 B9 总成本的影响是放大的。



## **8\. Why：为什么沙盒层天然适合 Graviton?**

把第 5 章的吞吐和第 6 章的成本放到一起，沙盒层落到 Graviton 上能赢的几条第一性原理：

  * 负载形状是 fan-out HTTP，不是 dense matmul。每一个 archetype 都是”很多并发的小请求，每个请求跑一段 Python / Chromium / SQL”。这恰好是 `Graviton 高核数 × 每核低功耗`的设计点。最直接的证据：B3 c=128 m9g 是 m7i 的 2.67×, B7 c=128 是 2.03× —— 两个最纯的 fan-out workload 上，Graviton 优势最大。
  * DuckDB 等现代分析引擎在 aarch64 是一等公民。SVE/NEON 向量化 kernel 由上游维护，整套 benchmark 没有 patch 任何一行 DuckDB。B5 低并发段 m9g 是 m7i 的 ~2×，证明 NEON/SVE 在 TPC-H 上确实顶用，不是”勉强能跑 aarch64″，是真的有调过的 SIMD path。
  * Graviton4 在 Intel 最强的 workload 上也能反超。B1（CPython cold-start，Intel 传统强项）c=128 m9g 比 m7i 快 53%、p99 反而更低 —— 因为这一档已经从 “单核 IPC bound” 转到 “fork-per-second bound”，核数多就是赢。也就是说：连 “Intel 一定赢” 的负载，在真实 RL trainer 的并发档位上 Intel 都不一定赢。
  * 每 vCPU-hour 单价就低于 Intel。m8g 比 m7i 便宜 11%、m9g 便宜 5.8% —— 即使 吞吐打平，光换 ISA 已经省了一截。反过来 m8i 比 m7i 贵 5%，这是 Intel 同代换代不能忽视的一笔”涨价”。
  * 同 family vCPU-linear 让选 size 极简。AWS OD 在同 family 内严格 vCPU 线性，没有 “哪个 size 单位成本最低” 这种问题。选 size 只看一件事：你需要单实例承载多少 fan-out。.4xlarge 在 c=32–64 是吞吐 / p99 最甜的点，再大就 ASG 横扩。唯一一个 Intel 还能稳住的角落：B1 在 c≤8 的低并发段，m8i 比 m9g 快一点（解释器单核 boost）。但这是个非常窄的窗口，c=16 起 m9g 反超，且 RL trainer 真实并发都在 c≥32 —— 那个区间 Intel 没有任何剩余优势。



Amazon 在 2025 年 re:Invent 大会重磅官宣了全新设计的第五代 Graviton 处理器，在2026 年 6 月 10 日已经可用，详情可查看：[Now available: Amazon EC2 M9g and M9gd instances powered by new AWS Graviton5 processors](<https://aws.amazon.com/cn/blogs/aws/now-available-amazon-ec2-m9g-and-m9gd-instances-powered-by-new-aws-graviton5-processors/>)。

同时，在 [Graviton5’s improved design increases speed and energy efficiency — beyond Moore’s law](<https://www.amazon.science/blog/graviton5s-improved-design-increases-speed-and-energy-efficiency-beyond-moores-law>) 中，披露了 Graviton5 的更多技术细节：

  * 引入四芯片组（Chiplet）架构，192个核心分布在四个芯片组上，每个芯片组包含DRAM控制器、PCIe控制器和48个核心，不再有单独的I/O芯片和单独的DRAM控制器芯片。
  * 具有定制的芯片间连接，可在芯片组之间提供高达420 GB/s的带宽，从而最小化网格中核心之间的延迟并降低了内存延迟。
  * 这种组织方式使我们能够为每个芯片配置两个或四个非一致性内存访问（NUMA）区域，并将L3缓存分区到虚拟机（VM）的大小，同时减少48核心或更小核心数的EC2 实例的的内存延迟。
  * CPU 核心的运行频率提高到 3.3 GHz，并可稳定运行，无 burst、无降频。
  * 单 Socket 的 L3 Cache 提高到 192MB，是 Graviton4的 5.3 倍。
  * 支持 DDR5-8800 内存和PCIe gen6互连，并转向 3nm 工艺，以实现更高的电路密度和更快的片上通信。
  * Graviton5 中的 Neoverse V3 核心改进了分支预测，为数据库等实际应用带来了高达30%的性能提升。
  * Nitro 隔离引擎，一个经过形式化验证的云虚拟机管理程序，通过以数学精度强制执行虚拟机之间的隔离来增强安全性。



更多的 Graviton 技术细节可在 [AWS Graviton Technical Guide](<https://github.com/aws/aws-graviton-getting-started>) 查询和获取到。

## **9\. How：怎么把沙盒层迁过去？**

迁移工作量集中在 build 时，run 时几乎没改动：

  * build multi-arch image。



`docker buildx build --platform linux/amd64,linux/arm64 -t <tag> --push .`，或者用本仓库的 `scripts/build-all.sh`（每个架构原生 build 后用 `imagetools create` 合 manifest list）。不要走 emulation build —— 慢，且容易隐式掉性能。

  * 审一遍 Python wheel。纯 Python 包都没问题；带 native extension 的（numpy、pyarrow、duckdb、playwright、…）今天 PyPI 都有 aarch64 wheel，但 pin 一个较新的版本以防 fallback 到 sdist 编译。`pip install --dry-run --platform linux_aarch64` 可以一次扫出所有需要 native 编译的包。
  * 按 archetype 选实例 family。多 archetype 混合的 Agentic RL 沙盒 fleet，`m9g.4xlarge` 到 `m9g.16xlarge` 是甜点区间；预算敏感、训练已经稳了的，可以用 m8g 替代，仍能拿到大头收益（B9 −30%）。
  * 跑一遍 benchmark 验证你自己的 task mix。B9 的 task 分布是可配的。把它换成你 trainer 真实 fan-out 的分布（在 `orchestrator/runners/b9_concurrent.py`里），结果就是 swap 后的精确节省估计 —— 比本文给的 −45% 更贴你的工作负载。
  * 生产 fleet 用 ASG mixed-instance policy。Graviton 占大头，留一小部分 Intel 容量当长尾兜底（某些第三方 native 库还没及时跟上 aarch64，或者你内部工具暂未编译 aarch64 版本）。等运行平稳、依赖完全就绪再全切。



## **10\. Hands-On：重现这套数据**

完整 benchmark suite 已开源：https://github.com/eric-yq/agentic-rl-bench

在你自己的 EC2 fleet 上重现：
    
    
    # 一台 build host（每个架构各一台）
    git clone <repo>
    cd agentic-rl-bench
    cp .env.example .env       # 设置 REGISTRY、S3_BUCKET、价格
    bash scripts/build-all.sh  # build + push :v1 multi-arch manifest
    
    # 每一台 run host（m7i, m8i, m8g, m9g, ...）
    git clone <repo>
    cd agentic-rl-bench
    cp .env.example .env
    docker compose pull
    bash scripts/run-single.sh B9 (或者 B1,B3,B4,B5,B7)
    

结果保存在 `./results/<arch>/<workload>_result_<instance>_<ts>/`，是 JSON 加一份自包含的 HTML 报告。配置 `S3_BUCKET` 可以同步到 S3，方便跨实例对比。每一份 JSON 的 `extra` 字段会回写当时使用的数据集版本号、模板分布、TPC-H scale factor、DuckDB / Chromium 版本等等，commit + 这一份 JSON 就够把当时的环境完整复盘出来。

## 11\. 结语

沙盒层是现代 AI Infra 里少有的 “换 CPU family 不用动模型代码一行” 的地方 —— 负载就是普通的容器化 Python / FastAPI / Chromium / DuckDB 等，全都在 aarch64 上有一等公民支持，运行时语义和 x86 完全一致。

在五个 Agentic RL workload archetype 加一个端到端混合 rollout 上，Graviton（m8g / m9g）相对 m7i 的实测结论：

  * B9 端到端混合 rollout 在 c=64 工作档位 $/1M rollouts：m9g 比 m7i 省 45%，m8g 省 30%；按本文工作负载，沙盒层每百万 rollout 从 ~$33.2 降到 ~$18.2。
  * 吞吐普遍提升：m9g vs m7i 在 c≥32 区间，B3 +130%~+167%、B7 +74%~+103%、B1 / B5 +50%~+56%、B4 +19%~+43%；端到端 B9 +62%~+72%。
  * p99 长尾全面下降：B9 c=128 一档 m9g p99 是 m7i 的 ~63%，每个 archetype 都至少压低了一档，trainer 等沙盒的时间随之缩短。
  * Intel 同代换代不是免费午餐：m8i 的 hourly 比 m7i 贵 5%，cost win 完全靠吞吐换；同代换架构（m7i → m8g）反而比同代换代（m7i → m8i）省钱多得多。



如果你的训练 fleet 沙盒层还跑在 Intel SKU 上，迁移的预期收益高、工程风险低 —— benchmark suite 把验证它需要的所有东西都打包好了：换一组实例跑 3–4 小时，就能拿到针对你自己 task mix 的精确节省数字。

**下一步行动：**

**相关产品：**

  * [Amazon EC2](<https://aws.amazon.com/cn/ec2/?p=bl_pr_ec2_l=1>) — 安全且可调整大小的计算容量
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=2>) — 适用于 AI、分析和存档的几乎无限的安全对象存储



**相关文章：**

  * [基于Bedrock Agentcore 实现智能成本分析与告警系统](<https://aws.amazon.com/cn/blogs/china/intelligent-cost-analysis-and-alerting-system-powered-by-bedrock-agentcore/?p=bl_ar_l=1>)
  * [在Amazon EKS上部署OpenClaw AI Agent：基于Kata Containers的企业级沙箱实践](<https://aws.amazon.com/cn/blogs/china/deploying-openclaw-ai-agent-on-amazon-eks/?p=bl_ar_l=2>)
  * [Claude Code 接入自建开源模型：企业私有化与降本实践](<https://aws.amazon.com/cn/blogs/china/claude-code-open-source-model-enterprise-practice/?p=bl_ar_l=3>)
  * [给 Openclaw瘦身-利用Nova MME 和 S3 Vector实现Skill按需召回](<https://aws.amazon.com/cn/blogs/china/openclaw-leveraging-nova-mme-s3-vector-implement-skill/?p=bl_ar_l=4>)
  * [简化故障注入，读懂应用影响：用 AI Agent 做混沌工程](<https://aws.amazon.com/cn/blogs/china/simplify-fault-injection-understand-application-impact-chaos-engineering-ai-agent/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 袁泉

亚马逊云科技计算解决方案架构师，专注于 Graviton 和  Arm64生态的发展和应用，致力于为企业客户提供 EC2 实例家族、Auto Scaling、Spot 实例等核心计算产品的深度技术咨询。凭借丰富的云原生架构经验，帮助客户设计兼具成本效益与卓越性能的创新计算解决方案，实现业务的可扩展性与技术转型目标。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
