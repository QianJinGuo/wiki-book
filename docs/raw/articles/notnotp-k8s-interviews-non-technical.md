---
source: newsletter
source_url: https://notnotp.com/notes/what-job-interviews-taught-me-about-kubernetes/
ingested: 2026-06-16
title: "What Job Interviews Taught Me About Kubernetes"
sha256: 8471e4f036807e040805e24c29520dfdb1cbef6497b2ad22f64449f8acd9fb93
---

# What Job Interviews Taught Me About Kubernetes


Published Time: 2026-06-15

Markdown Content:
Published on 15 June 2026
So I've been job hunting lately. Reading job postings, doing interviews, talking to engineering teams at like a dozen companies. And I noticed something compared to five years ago when I was last doing this: literally everyone is on Kubernetes now. Every single company I talked to.

Last time I was job hunting that wasn't the case at all. There were basically three camps: the rare Kubernetes adopters, the `systemd`-on-VM/VPS/EC2 crowd, and the serverless people (Lambda, Cloud Run, etc.).

That surprised me, because where I work we have actual Big Tech-scale problems, so K8s makes obvious sense for us. But a 10-person startup with two services? None of these places were doing microservices or anything close to high scale. So I asked why.

**Spoiler: they don't care much about the technical side of K8s.**

## Why?

A technical interview is actually a great place to ask why, especially when you're talking directly to the CTO. So I did. The answers were basically the same everywhere.

### Uniformity

First one was **uniformity**. Every service deploys the same way. No one secretly knowing that the payments service runs on some bare VM with a cursed bash script from 2019 while the API is on Docker Compose because nobody ever touched it. One way to deploy, for everything.

### Standardized knowledge

Second was **shared, hireable knowledge**. K8s is basically a lingua franca now. My first day at my current job, I pulled up the repo with the Helm charts and Kube configs and had a solid picture of the whole architecture within an hour. The knowledge is in the YAML, not stuck in someone's head. Lose someone, their replacement isn't spending three weeks digging through docs trying to figure out how anything runs.

At my current company, on-call SREs can keep any service up even if they've never touched it before. They know Kubernetes, and Kubernetes patterns are the same everywhere for all teams. Try doing that with a bunch of VMs where every service is set up differently. (Caveat: this only holds if nobody went exotic with the setup, of course.)

### Tracing who does what

Third was **traceability** (with or without compliance). At my current company, nobody can just `kubectl apply -f` something straight to the cluster. You push a Helm chart to git, there's a trace, there's an MR approval process, then FluxCD or ArgoCD handles the actual deployment. Nothing happens in the shadow. That composes really well with compliance: it's basically how we ace ISO certifications. And since GitOps pairs naturally with Kubernetes, you get all of that almost for free.

## What I took from it

The CTOs I talked to aren't making a dumb choice. They're solving real problems.

I was focused on the technical side only, and Kube always has been a technical solution to technical problems, for me. But it looks like a lot of CTOs are interested primarily in the non-tech benefits. More than I thought. Their technical problems just don't require it. I bet you won't find any [`topologySpreadConstraints`](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/) in their manifests, they don't care. No HPA, no Pod Disruption Budgets, no node affinity rules. Just the same number of nodes they'd have VMs otherwise. But they accepted to pay the price of having a complex piece of software for the organizational benefits.

Honestly, I think it's mostly fine. But I still think most companies should start without it. Clusters are genuinely hard to debug when stuff goes wrong, and at that stage you want your energy on the product, not the infra. When you're still pitching to your next big customer, spinning up a VPS and doing a dirty `git pull` is a totally valid emergency fix. Suboptimal, sure. But fast, and you know exactly what's happening. You really don't want to spend two hours figuring out why your pod is stuck in `CrashLoopBackOff` right before a customer call.

## Why the shift happened recently

I still don't totally get why the shift happened when it did. Five years ago all three camps were doing fine. Now the VM+`systemd` crowd has basically disappeared from job postings, serverless stayed niche, and K8s just won.

My best guesses: managed K8s (EKS, GKE, AKS) got mature and the talent pool flipped: enough people learned it that hiring for anything else became the harder choice. And Helm made "just use someone else's chart" a real option. But I'm not certain. If you were there for the shift and have a better theory, I'd genuinely like to know.

## When to use Kubernetes

My personal threshold would be the moment the CTO isn't the only engineer anymore. As soon as a second person shows up, the problems K8s solves become real. Now you've got someone who didn't set up the servers but needs to deploy. Someone who needs proper access controls, not SSH keys to everything. Someone who'll leave eventually and take everything they know with them. That's when you want the system to hold the knowledge, not people.

