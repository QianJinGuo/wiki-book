# Building Modelplane on Crossplane

## Ch01.075 Building Modelplane on Crossplane

> 📊 Level ⭐ | 6.9KB | `entities/building-modelplane.md`

# Building Modelplane on Crossplane

> **来源**: [Building Modelplane on Crossplane](https://blog.crossplane.io/building-modelplane/)

Published Time: 2026-06-23T15:08:59.000Z

Markdown Content:
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

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/building-modelplane.md)

---

