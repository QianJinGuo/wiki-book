# Building Modelplane on Crossplane

> 📊 Level ⭐⭐⭐ | 12.4KB

> **来源**: [Building Modelplane on Crossplane](https://blog.crossplane.io/building-modelplane/)

![Image 1](https://blog.crossplane.io/content/images/2026/06/Modelplane---Crossplane-Blog-Hero.png)
I've worked on Crossplane for almost eight years, since the v0.1 release. In that time I've watched a lot of people use it to put cloud infrastructure behind an API. For the last few months I've been using it to put a particular, demanding kind of infrastructure behind an API: a fleet of GPUs running model inference.

The project is called [Modelplane](https://modelplane.ai/). It lets a platform team turn a pile of accelerators (across clouds, neoclouds, and on-premise) into one fleet. It also lets the ML teams they support deploy a model and get a stable, OpenAI-compatible endpoint without thinking about where it runs.

Modelplane exists because open-weight models have moved inference out of the labs and hyperscalers and into everyone else: neoclouds, regulated enterprises keeping models inside their own walls, and companies trying to get their inference bills under control. The open source stack for serving a model on a single cluster is strong now: vLLM, SGLang, KEDA, Gateway API, [DRA](https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/). But inference almost never stays in one cluster. Capacity is scattered across hardware types, providers, and regions. The hard problems are now _above_ the cluster: placing models across the capacity you have, provisioning more, routing by cost and locality, moving weights around. The labs and the hyperscalers all built systems to do this, but they built them privately. That's the gap Modelplane fills: an open control plane that sits above your clusters and operates them as one inference fleet.

If the inference part interests you, the [Modelplane docs](https://modelplane.ai/) and [Bassam's introduction](https://www.modelplane.ai/blog/open-control-plane-for-inference) are the place to go. This post is for the Crossplane crowd, because the part I think you'll find interesting is that Modelplane is, top to bottom, a Crossplane configuration. It has no bespoke controllers and no custom operators: it's compositions and composition functions. The same primitives you could use to compose an RDS instance, pushed a lot harder.

I want to cover the problem we set out to solve with Crossplane, the parts of the framework we leaned on hardest, and the edges we hit and fixed upstream.

## The problem, in Crossplane terms

Strip away the inference vocabulary and Modelplane's job is one Crossplane users will recognize: take a declarative description of what someone wants, and turn it into composed infrastructure spanning cloud accounts, many Kubernetes clusters, and the workloads on them. Provision an EKS or GKE cluster with the right GPUs. Install an inference stack onto it. Decide which cluster each model runs on, and how many copies. Keep it all converged as clusters come and go and people's inference needs change.

Crossplane was built for that shape of problem. Providers gave us reach: we provision clusters and the infrastructure they need across different clouds, and install software onto them, without needing to write new controllers. Functions allowed us to focus on our business logic, the placement and the scheduling. We didn't have to write the controller plumbing by hand: the watches and requeues and finalizers and drift correction that Crossplane core already handles.

Crossplane v2 helped here too. Modelplane has two clear personas. Platform teams describe the fleet. ML teams describe a model. That split maps onto a scope boundary: an `InferenceCluster` or `InferenceClass` is cluster-scoped, a `ModelDeployment` or `ModelService` is a plain namespaced composite resource the ML team owns. v2 namespaced composites let us express that directly, with no claim-and-XR duality to explain. That's useful, but it isn't what made the project buildable.

## What made it buildable: Developer experience

What really unlocked this project was the new Crossplane CLI and the schemas it generates.

Modelplane's functions are all written in Python. We chose Python because it's the lingua franca of the ML world. We hope it might help folks who aren't yet cloud native experts contribute to the project. Writing functions in Python used to mean giving up a lot of the tooling that makes a codebase feel like a proper project. The new `crossplane` CLI changed that. It scaffolds a project, generates an XRD from an example resource, and generates typed schema bindings for your APIs.

Those generated models changed how we worked. Our functions read and write typed objects instead of poking at untyped dictionaries and hoping the field is spelled the way we remember. A typo or a wrong type now fails at author time. The models also sped up the coding agents we leaned on while building. A generated type tells the agent the exact shape, so it got field names and types right the first time.

There was friction. We outgrew the CLI's built-in function builders early, and we needed schema generation for one language, not all four. Both of those turned into upstream contributions, which I'll come back to.

## Designing the API

The hardest part of Modelplane was designing the API.

People come up to me at conferences worried about how they'll make breaking changes to the APIs they build with Crossplane. My answer is usually that you almost never have to, if you really think the API through before you release it. That discipline pays off: reach for arrays and enums before you think you need them, use required fields sparingly, and leave room to grow without a breaking change.

Take the `ModelDeployment`, arguably Modelplane's most important API. It's how an ML team describes a model to serve: its engines, what their pods need from a node, and how many replicas to run across the fleet.

```
apiVersion: modelplane.ai/v1alpha1
kind: ModelDeployment
metadata:
  name: qwen3-8b
  namespace: ml-team
spec:
```

→ [原文存档](https://blog.crossplane.io/building-modelplane/)

---
## 深度分析

### Control-plane 抽象为何能撑住 AI/LLM 基础设施

把推理基础设施交给 Crossplane 这类 Kubernetes-native control plane，本质上是押注三件事：CRDs 提供声明式 API、composition 提供资源编排、reconciliation 提供持续收敛。Modelplane 的实践证明这套映射整体成立：GPU 集群供给、inference stack 安装、模型放置（placement）与副本调度，都可以表达为"声明期望状态 → 编译成组合资源 → 由 reconciler 保证收敛"的流水线，无需手写任何 bespoke controller 或 custom operator。两个细节尤其值得注意：其一，v2 的 namespaced composites 把 platform team（描述 fleet）与 ML team（描述 model）的 persona 边界直接编码进了 scope 边界，权限模型不需要额外解释；其二，fleet scheduler 是 composition function 的纯函数——每次 reconcile 从 observed state 推导 desired children，天然可重放、可测试，这比命令式调度器更容易对 AI infra 这种高变动负载做正确性推理。映射不佳的地方也存在：调度需要看到全 fleet 的容量与既有副本，框架的 `require_resources` 一度不支持 match-all 选择器，这类"全局视角"需求正是 control-plane 框架容易被单资源思维卡住的地方——但修补是往上游修的，框架因此变强。参见 [Inference Optimization](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/inference-optimization.md) 与 [Agentic Scheduler With Strands Agentcore For Multi Region Gpu Inference](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-scheduler-with-strands-agentcore-for-multi-region-gpu-inference.md) 中跨区域 GPU 调度的同构问题。

### 让项目可建成：Developer experience 是第一决定因素

作者明确说 v2 的 scope 边界"有用但不是让项目可建成的关键"——真正解锁项目的是新 `crossplane` CLI 与它生成的 typed schema bindings。三点经验：(1) 语言选型跟随目标用户——functions 全部用 Python 写，因为 Python 是 ML 世界的 lingua franca，这降低了 cloud native 门外汉参与贡献的门槛；(2) 类型化消灭了一整类错误——functions 读写 typed objects 而非 untyped dictionary，字段名拼错、类型写错在 author time 就失败，而不是在 reconcile 时静默出错；(3) 生成的 schema 意外地成了 AI coding agents 的加速器——generated type 把资源的精确形状告诉了 agent，字段名和类型第一次就写对。这第三点是一个 2026 年才成立的新反馈回路：平台 API 的机器可读 schema 不只是给人用的，也是给 LLM agent 用的。摩擦点（CLI 内置 function builders 不够用、schema 生成无法只选一种语言）都转化为 upstream contributions，说明 DX 工具链的缺口在开源协作模式下可以变成公共资产。

### 给平台团队的 API design lessons

最难的部分不是调度也不是编排，而是设计 API 本身。作者的纪律值得照抄：几乎不需要 breaking change，前提是发布前把 API 想透——early reach for arrays and enums，required fields 用得克制，为增长留出空间。`ModelDeployment` 的案例最有教学价值：最初的 `spec.topology` 块（写 `tensor: 8`、`pipeline: 2`）把 Modelplane 耦合到了 engine 特定的 flag 注入上，只能跑它认识的引擎，也无法表达未来的 data/expert parallelism。作者是在为这些 topology 写 worked examples 时才发现模型不了它们，于是替换为 shape——engine 是 `Standalone`/`Leader`/`Worker` 成员的数组，parallelism 完全交给用户写的 flags。方法论结论：不要赶 API 设计，与用户和同侪共同推演，能放就放，写足够多的 worked examples 验证能建模所有需求后再 commit。另一条值得借鉴的是 vocabulary reuse：Modelplane 直接借用 Kubernetes DRA 的 typed attribute 模型和 CEL 谓词语言，把 fleet 层的硬件描述与集群内 runtime 的设备描述统一成同一种表达，同一个 CEL 表达式在两层都能求值——平台团队抽象 AI infra 时，复用下游生态已有的领域词汇比自创 DSL 便宜得多。

### 在 CNCF primitives 上构建内部平台的可泛化经验

Modelplane 对"要不要为 AI infra 自研 controller"给出了一份反直觉的回答：compositions 与 composition functions 的表达力上限远高于社区默认印象——从内联的 Go templates/KCL 一路伸缩到能做全 fleet scheduling 的 Python 程序，中间不需要切换架构。对内部平台团队的启示：(1) 先声明式地建模问题，再检查框架缺什么，缺口优先修上游而非绕过——作者修了 CLI 构建、Python 关键字字段（`int`/`bool` 等）的序列化、match-all selector、`crossplane render` 与真实 reconciler 管线漂移等五处，全部 upstream，框架红利所有 adopter 共享；(2) 测试基础设施必须跑真实管线——render 引擎是 reconciler 的平行复制品时会漂移，函数在 render 里通过、在真实 control plane 里行为不同，这一教训适用于任何"用模拟器替代真系统"的平台测试设计；(3) 单集群方案（vLLM/SGLang/KEDA/Gateway API/DRA）已经很强，真正的难题在集群之上：跨云的容量放置、成本与 locality 路由、weights 分发——这些正是 labs 与 hyperscalers 私有自建、开源世界缺失的那一层，也是内部平台最该补位的位置。相关：The Inference Shift、[Ai Infra Llm Efficient Inference Vllm](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-infra-llm-efficient-inference-vllm.md)、[Eks Gpu Operator Custom Driver Cuda Workload](https://github.com/QianJinGuo/wiki-public/blob/main/entities/eks-gpu-operator-custom-driver-cuda-workload.md)。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

