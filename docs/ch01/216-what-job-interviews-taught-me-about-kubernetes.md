# What Job Interviews Taught Me About Kubernetes

> 📊 Level ⭐⭐⭐ | 9.4KB

> Source: [原文存档](https://notnotp.com/notes/what-job-interviews-taught-me-about-kubernetes/)

## 核心要点

- **来源**: https://notnotp.com/notes/what-job-interviews-taught-me-about-kubernetes/
- **评估理由**: Well-structured opinion piece drawing on real interview experience to discuss the non-technical (organizational) reasons companies adopt Kubernetes. Offers practical advice on when K8s makes sense (the 'second engineer' threshold is a useful heuristic) and when it doesn't. Honest about limitations a

## 内容提炼

Published on 15 June 2026
So I've been job hunting lately. Reading job postings, doing interviews, talking to engineering teams at like a dozen companies. And I noticed something compared to five years ago when I was last doing this: literally everyone is on Kubernetes now. Every single company I talked to.

Last time I was job hunting that wasn't the case at all. There were basically three camps: the rare Kubernetes adopters, the `systemd`-on-VM/VPS/EC2 crowd, and the serverless people (Lambda, Cloud Run, etc.).

That surprised me, because where I work we have actual Big Tech-scale problems, so K8s makes obvious sense for us. But a 10-person startup with two services? None of these places were doing microservices or anything close to high scale. So I asked why.

**Spoiler: they don't care much about the technical side of K8s.**

## Why?

A technical interview is actually a great place to ask why, especially when you're talking directly to the CTO. So I did. The answers were basically the same everywhere.

### Uniformity

First one was **uniformity**. Every service deploys the same way. No one secretly knowing that the payments service

## 关键洞察

- Spoiler: they don't care much about the technical side of K8s.**
- ## Why the shift happened recently

## 实践启示

- 文章的核心论点可在生产环境验证
- 与现有实体的差异化角度：本文来自 notnotp.com 视角
- 引用源：[Notnotp K8S Interviews Non Technical](https://notnotp.com/notes/what-job-interviews-taught-me-about-kubernetes/)
## 深度分析

这篇文章的价值不在 Kubernetes 技术本身，而在于它提供了一份来自招聘现场的「反技术叙事」证据：作者在十几家公司的面试中直接向 CTO 提问为什么采用 K8s，得到的答案几乎完全一致，且全部指向组织而非技术。 这为理解基础设施工具的非技术采用动因提供了一个少见的微观样本，也解释了为什么「技术最优解」与「市场实际选择」会系统性脱节。

### 三大组织动因：一致性、可迁移知识、可追溯性

作者归纳的三个理由没有一个涉及伸缩性或资源调度。其一是**一致性**：所有服务以同一种方式部署，消灭「支付服务跑在裸 VM 上、靠 2019 年的祖传 bash 脚本，而 API 服务用 Docker Compose」这类碎片化状态。 其二是**标准化知识**：K8s 已成行业通用语，知识沉淀在 Helm chart 与 YAML 里而非某个人脑中——新人第一天一小时内就能看清整个架构，接替者不必花三周翻文档，on-call SRE 即使从未接触某服务也能保住它（前提是没人把配置玩出花活）。 其三是**可追溯性**：禁止直接 `kubectl apply`，一切经由 git 提交、MR 审批，再由 FluxCD/ArgoCD 执行，「没有事情发生在阴影里」，同一套 GitOps 流程还顺带拿下了 ISO 认证。

### 复杂度税：CTO 们在为什么付费

最反直觉的发现是：这些团队几乎不用 K8s 的高级能力——没有 topologySpreadConstraints、没有 HPA、没有 Pod Disruption Budgets、没有节点亲和性规则，节点数和在 VM 时代一样多。 他们买的是组织红利，付的是运行一套复杂软件的「复杂度税」。作者认为这「大体上没问题」，但坚持多数公司应从不用 K8s 起步：集群故障时极难调试，而早期团队最该把精力押在产品上——客户电话前两小时还在排查 `CrashLoopBackOff` 是真实的噩梦，此刻在 VPS 上「脏 `git pull`」反而是完全合法的紧急修复。

### 为什么转折发生在最近五年

面对采用曲线的突变，作者给出了诚实的、自认不确定的解释：五年前三种阵营（K8s、VM+systemd、serverless）都活得很好，如今 VM+systemd 在招聘市场基本消失，serverless 仍属小众，K8s 全面胜出。 他猜测的驱动因素有三：EKS/GKE/AKS 等托管服务成熟到把运维成本降到可接受；学会 K8s 的工程师足够多，以至于「招其他技能的人」反而更难；Helm 让「直接用别人的 chart」成为现实选项。 三者分别对应供给成熟、人才普及、生态复用，比「K8s 技术赢了」的单一解释更有说服力。

### 第二工程师阈值：可操作的采用判据

文章最有复用价值的产出是一个朴素判据：当 CTO 不再是唯一工程师的那一刻，就该考虑 K8s。 逻辑链条是：第二个人出现后，「没搭过服务器的人需要部署」「需要真正的访问控制而非人人持有万能 SSH key」「有人终将离职并带走全部隐性知识」三个问题同时成为现实——此时需要让系统而非个人承载知识。这个判据把「何时上 K8s」从技术规模问题（QPS、节点数）转写为组织结构问题（工程师人数），与全文「非技术动因」的主线完全自洽。

与 wiki 已有 K8s 内容的互补：[从 K8s 开发到生产环境](https://github.com/QianJinGuo/wiki-public/blob/main/entities/from-kubernetes-dev-setup-to-production-what-actually-change.md)从工程流程视角补充真实生产化差距；[腾讯 K8s+Ray 调度 AI 负载](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencent-k8s-ray-ai-workload-scheduling.md)展示 K8s 在真正需要其技术能力（超大规模调度）时的用法——恰是本文那些公司用不到的部分；[Cilium/Tetragon 运行时安全](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cilium-tetragon-kubernetes-runtime-security-ebpf.md)是「可追溯性与合规」论点的平台级实现；[serverless 推理](https://github.com/QianJinGuo/wiki-public/blob/main/entities/serverless-inference.md)则是三大阵营中仍居小众的 serverless 路线现状。

综合判断，本文的核心洞察——企业采用 K8s 的首要动机是组织效益而非技术效益——可提炼为：

1. **采用动因错位是常态**：招聘市场「人人都在 K8s 上」与技术必要性脱节，受访公司没有一家在做微服务或接近高规模场景。
2. **知识载体迁移是关键机制**：「知识在个人脑中」到「知识在 YAML 里」的迁移，同时解决新人上手、人员离职、on-call 接管三个组织痛点。
3. **合规是 GitOps 的免费副产品**：ISO 认证不是 K8s 的目标而是流程红利，是「付复杂度税换组织收益」的最佳例证。
4. **复杂度税真实存在且应推迟支付**：不用 HPA/PDB/亲和性规则说明 K8s 的复杂性对这类团队纯属开销，「多数公司应从不用它起步」是对工具默认主义的抵抗。
5. **采用阈值应锚定团队规模而非流量规模**：「第二工程师」阈值把基础设施决策绑定在可观察的组织事实上，比任何性能基准都更容易在真实决策中被执行。
6. **生态成熟与人才普及互为因果**：托管服务让采用变便宜，人才池翻转让不采用变贵，两者共同把 VM+systemd 挤出市场——选型均衡由组织经济学而非基准测试决定。

## 相关实体
- from doer to director: the ai mindset shift
- why internally-built ai fails fund accounting audits
- [back up and restore your amazon eks cluster resources using](https://github.com/QianJinGuo/wiki-public/blob/main/entities/back-up-and-restore-your-amazon-eks-cluster-resources-using-velero-amazon-web-se.md)

---

