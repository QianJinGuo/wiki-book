---
title: "Building Modelplane on Crossplane"
source_url: "https://blog.crossplane.io/building-modelplane/"
ingested: 2026-06-26
type: article
created: 2026-06-26
sha256: 74c78ee48f2b126003f1d219c91b7448d72c565fa44eb83ef50a3966ee14752d
---

# Building Modelplane on Crossplane


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
  replicas: 1
  engines:
  - name: qwen3-8b
    members:
    - role: Standalone
      nodeSelector:
        devices:
        - name: gpu
          count: 1
          selectors:
          - cel: device.capacity["gpu.nvidia.com"].memory.compareTo(quantity("20Gi")) >= 0
      template:
        spec:
          containers:
          - name: engine
            image: vllm/vllm-openai:v0.23.0
            args:
            - "--model=Qwen/Qwen3-8B"
            - "--served-model-name=qwen"
            # ... engine flags omitted for brevity
```

1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25

I got the `engines` array wrong at first, and only caught it about two weeks before we released v0.1. Until then a `ModelDeployment` had a `spec.topology` block where you'd write `tensor: 8` and `pipeline: 2`. Modelplane would derive engine-specific flags like `--tensor-parallel-size` and inject them. The problem was that this coupled Modelplane to engine specifics. We could only run the engines whose flags we knew how to inject. It also couldn't express the data and expert parallelism we knew was coming. I caught it only because I sat down to write worked examples for those topologies and found I couldn't. I replaced it with _shape_: an engine is an array of `Standalone`, `Leader`, or `Worker` members, and the parallelism lives entirely in the flags the user writes. My takeaway: don't rush API design. Work through it with your users and peers, let it sit if you can, and write enough worked examples to confirm you can model everything they need before you commit.

![Image 2](https://blog.crossplane.io/content/images/2026/06/CleanShot-2026-06-23-at-06.06.44@2x.png)
## The functions do the work

One thing I really like about composition functions is that they scale with your problem. At the low end a function is a few Go templates or some KCL inlined in the Composition. At the high end it's a program that can do almost anything a traditional Go operator can. Python rides that whole range too, and Modelplane is what the far end looks like once the problem grows.

Modelplane's business logic is all composition functions. Scheduling is an interesting example. I'll walk through it because it shows how far a composition function can be pushed.

Modelplane runs a fleet scheduler in the control plane. Each cluster in the fleet is an `InferenceCluster`, and each of its node pools references an `InferenceClass` that declares the pool's hardware. When an ML team creates a `ModelDeployment`, the fleet scheduler places each replica against that _declared_ node pool capacity, before any nodes necessarily exist. That's a different job from in-cluster DRA, which is a runtime allocator: its drivers publish `ResourceSlices` about real hardware on real nodes.

Scheduling happens in two layers. The fleet scheduler picks the cluster and node pool; the cluster's own in-cluster scheduler and DRA then place pods on nodes and bind GPUs. That in-cluster scheduler is good at its layer (a single cluster supports up to 5,000 nodes), but a fleet isn't one cluster. It can't be: a cluster doesn't span clouds, and you wouldn't want one blast radius over your whole accelerator footprint even if it could.

Modelplane borrows DRA's _vocabulary_ and lifts it to the fleet layer. DRA's typed, domain-prefixed attribute model and CEL predicate language are a good fit, and they express cleanly in OpenAPI. A platform team's `InferenceClass` declares what a _pool's_ hardware offers, the same shape DRA uses to describe a real device:

```
devices:
- name: gpu
  claim: DRA
  driver: gpu.nvidia.com
  deviceClassName: gpu.nvidia.com
  attributes:
    architecture: { string: Ada Lovelace }
  capacity:
    memory: { value: "23034Mi" } # the L4's real usable VRAM
```

1 2 3 4 5 6 7 8

A deployment's `nodeSelector` then asks for what it needs with a CEL expression:

```
selectors:
- cel: device.capacity["gpu.nvidia.com"].memory.compareTo(quantity("20Gi")) >= 0
```

1 2

Our scheduler evaluates that CEL against an `InferenceClass`'s declared attributes, and DRA evaluates the same expression against a real GPU when the pod binds. The same expression runs at both levels.

A composition function is, by design, a pure function of its inputs. Crossplane hands it the observed composite, and the function returns the desired children. Our scheduler is exactly that, a pure function of observed state, which is what makes it safe to run on every reconcile. A scheduler can't decide placement from the deployment alone, though. It has to see the whole fleet: every `InferenceCluster` and its published capacity, and every `ModelReplica` that already exists, including those of _other_ deployments, so it can account for capacity they've already consumed.

That's `require_resources` (what some of you will know as extra resources), and we couldn't have built the scheduler without it. The function asks Crossplane for the resources it needs to reason over, and Crossplane fetches them and calls the function again with them in hand:

```
# Every InferenceCluster: candidate clusters with their declared capacity.
response.require_resources(
 rsp, name="clusters",
 api_version="modelplane.ai/v1alpha1", kind="InferenceCluster",
 match_labels=clusters_match_labels,
)
# Every ModelReplica across all deployments: capacity already in use.
response.require_resources(
 rsp, name="all-replicas",
 api_version="modelplane.ai/v1alpha1", kind="ModelReplica",
)
```

1 2 3 4 5 6 7 8 9 10 11

That second call, asking for _every_ resource of a kind with no name or label filter, is one of the things we had to fix upstream.

## Where Modelplane pushed Crossplane, and we fixed it upstream

Build something this demanding on Crossplane and you find its rough spots. Modelplane found several. Rather than work around them, we sent fixes upstream, so your configurations get the benefit too.

The first thing we hit was the build itself. The CLI's built-in function builders are great until you outgrow them, and we needed to coordinate function builds with Nix, the rest of our build system. We also only consume one of the four schema languages the CLI generates. We added an explicit `functions` list that loads pre-built image tarballs instead of building them, and a `schemas` block that restricts generation to the languages you actually use ([`crossplane/cli` #24](https://github.com/crossplane/cli/pull/24)). Now our functions build with the same tooling as everything else, and we generate Python and nothing else.

The DRA-style attribute model then walked us into a chain of three related bugs, all rooted in the same thing: a `DeviceAttribute` has fields named exactly `int`, `bool`, `string`, and `version`. Those are Python keywords and builtins, and they broke at every layer. First, schema generation emitted Python models that referenced undefined type aliases and wouldn't import at all ([`crossplane/cli` #64](https://github.com/crossplane/cli/pull/64)); the fix was to bump the code generator to a version that sanitizes such names and preserves the wire name with a Pydantic alias. With the models importable, serialization was next: the SDK emitted `bool_: true` under the Python attribute name instead of `bool: true` under the wire alias, so the API server rejected it. Passing `by_alias=True`, and switching from `exclude_defaults` to `exclude_unset` so we serialize the fields the caller actually set rather than the fields that differ from a default, put both right ([`function-sdk-python` #208](https://github.com/crossplane/function-sdk-python/pull/208), with helpers in [#205](https://github.com/crossplane/function-sdk-python/pull/205)).

The fleet scheduler also needed something the framework couldn't yet express. It has to reason over _every_`InferenceCluster` and _every_`ModelReplica` in the control plane, not one resource by name or a set by a label match. A `require_resources` selector with no match field is the natural way to say "all resources of this kind," and the protobuf allows it, but Crossplane rejected it on both the wire and the SDK side. We taught the reconciler to treat an empty selector as match-all ([`crossplane/crossplane` #7241](https://github.com/crossplane/crossplane/pull/7241)) and relaxed the SDK's validation to match ([`function-sdk-python` #213](https://github.com/crossplane/function-sdk-python/pull/213)). That match-all call is now the first thing the scheduler does every reconcile.

Testing functions this complex surfaced one more. `crossplane render` reimplements the XR reconciler's composition pipeline, and that parallel copy drifts from the real one, so a function can pass `render` and behave differently in a real control plane. We added a hidden render engine that runs the _actual_ reconciler against an in-memory client, so tools can test against the real composition pipeline rather than a copy of it ([`crossplane/crossplane` #7280](https://github.com/crossplane/crossplane/pull/7280)).

Finally there's a one-pager up for function-controlled deletion ([#7242](https://github.com/crossplane/crossplane/pull/7242)), which aims to make ordered deletion of composed resources _within one XR_ easier and more expressive than using Usages.

None of these are glamorous. But that's how a framework gets better: you build something hard on it and fix the friction.

## What I took away

I went into Modelplane wanting to know whether you could build something this demanding entirely on Crossplane, without dropping to a hand-written controller when the going got hard. You can, though we had to fix the framework in a few places to get there. It's still compositions and functions any adopter can read and extend.

Modelplane is Apache 2.0 and developed in the open. If you run accelerators of any kind, take a look at [modelplane.ai](https://modelplane.ai/), and if you build hard things on Crossplane, find its edges and [help make them better](https://github.com/crossplane/crossplane/tree/main/contributing).

