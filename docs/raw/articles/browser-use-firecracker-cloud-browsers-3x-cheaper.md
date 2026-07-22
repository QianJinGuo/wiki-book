---
source: newsletter
source_url: https://browser-use.com/posts/firecracker-browser-infra
ingested: 2026-06-18
sha256: cb63ae00f240f9f1d11bdc809c14eedf95f2d7d65eae525ad25a61009fabb2e5
---


# How We Made Cloud Browsers 3x Cheaper and Faster

Title: How We Made Cloud Browsers 3x Cheaper and Faster

URL Source: http://browser-use.com/posts/firecracker-browser-infra

Published Time: 2026-06-15T00:00:00-08:00

Markdown Content:
![Image 1: Browser Use: how we made cloud browsers 3x cheaper — every browser is its own Firecracker microVM on regular EC2, at $0.02 per browser hour with sub-400ms VM cold start and headless stealth.](https://browser-use.com/images/microvm-infra/og.svg)
Our cloud browsers need to do three things at once: start quickly, remain isolated, and be cheap. That is why we rebuilt Browser Use Cloud, so a new session starts in under a second and costs $0.02 per browser hour, down from $0.06.

This is harder than it sounds. A browser has Chromium, a filesystem, cookies, cache, proxy settings, downloads, and sometimes a logged-in customer session. If one browser can read another browser's state, it creates a security problem.

The normal answer is a virtual machine, or VM. A VM is a computer inside a computer: it gets its own CPU, memory, disk, and network devices. It is separate from everything else on its host, and if the browser breaks, leaks information, or gets attacked, the damage stays within the VM.

Normal VMs, however, are too heavy for cloud browsers. We need to create them constantly, sometimes thousands at a time, and throw them away as soon as sessions end. If each browser needs a slow, expensive VM, the product becomes slow and expensive, too.

The question for us is whether we could give every browser its own VM without making users wait or pay for it. We now do that with Firecracker, a lightweight VM system.

Every Browser Use Cloud session runs in its own, tiny VM. These VMs run on EC2, Amazon's rented cloud servers.

That is the unusual part. Firecracker is normally run on bare-metal servers, where you rent the whole physical machine. To reduce customers' cost, we run it on regular EC2, where AWS has already put your server inside a VM.

This should be slow. Nested VMs make memory and CPU operations more expensive, and Chromium takes time to start. This post is about how we made this setup fast and efficient.

But first, why did we rebuild our infrastructure?

![Image 2: A three-circle Venn diagram with fast to start, isolated, and cheap, overlapping in the middle where all three are achieved at once.](https://browser-use.com/images/microvm-infra/trilemma.svg)

It is difficult to be fast, isolated, and cheap all at once.

## Why we left unikernels behind[](http://browser-use.com/posts/firecracker-browser-infra#why-we-left-unikernels-behind)

We [used to run](https://browser-use.com/posts/two-ways-to-sandbox-agents) cloud browsers with [**Unikraft**](https://github.com/unikraft/unikraft), which builds small, VM-like containers called **unikernels**. Unikernels, instead of booting a full Linux system, load a small image built for your purposes. Unikernels start quickly and are cheap when idle because you can shut them down when no one is using them.

Unikraft was good for turning browsers off when they were not in use, but bad at adding more browsers quickly when traffic spiked. If more users suddenly asked for browsers at once, you would need to scale browser capacity rapidly. Unikraft does not have good built-in autoscaling, so an engineer had to change a variable, manually adding more instances.

During a burst in traffic, the system, instead of reacting on its own, required humans to adjust it. This caused problems: one load test [brought down](https://browser-use.com/posts/everything-i-got-wrong) production for 45 minutes. So we rebuilt our setup on [Firecracker](https://github.com/firecracker-microvm/firecracker).

![Image 3: Two line charts comparing capacity against demand. With Unikraft, capacity stays flat during a traffic spike and lags behind, causing an outage; after the rebuild, capacity tracks demand automatically.](https://browser-use.com/images/microvm-infra/scaling.svg)

Unikraft needed an engineer to add capacity by hand, so it lagged behind a traffic spike and collapsed. After the rebuild, capacity tracks demand automatically.

Firecracker provides a layer through which you can create, monitor, and run VMs. It gives each VM CPU, memory, disk, and network devices, and it keeps it isolated from the host and from other VMs.

## Teaching browsers to scale themselves[](http://browser-use.com/posts/firecracker-browser-infra#teaching-browsers-to-scale-themselves)

Firecracker gave each browser its own VM. But it did not inherently solve the problem that broke the old system: deciding how many VMs to run, where to put them, and when to add more.

So we built our own **control plane**. The control plane monitors our fleet of browsers and decides whether we should scale up or down.

When a user asks for a browser, the control plane picks a machine with room. When traffic rises, it starts more machines. When traffic falls, it stops sending new browsers to machines we want to remove.

It checks the fleet in real time. That is much faster than waiting on CloudWatch, AWS's monitoring service, which usually reacts on one-minute windows. It also knows things generic metrics do not: browsers that are still starting, machines we are trying to remove, and machines that should not receive new sessions.

![Image 4: User code connects through edge routers to the control plane, which sends the session to an EC2 host with room while keeping a draining host out](https://browser-use.com/images/microvm-infra/control-plane.svg)

A request flows from user code through stateless edge routers; the control plane picks an EC2 host with room and keeps draining hosts out.

## Why we run VMs inside VMs[](http://browser-use.com/posts/firecracker-browser-infra#why-we-run-vms-inside-vms)

Once we had a control plane, the next question was what kind of machines it should add.

The usual way to run Firecracker on AWS is a `.metal` instance. This means you rent the whole physical server, and Firecracker runs directly on it.

We chose regular EC2 instead. Regular EC2 machines are faster to get and cheaper to keep around. Our hosts boot from a pre-built image and start serving browsers about 30 seconds after launch. The faster we can add a host, the less idle capacity we need to pay for, and the lower the cost we pass on to our customers.

The catch is that regular EC2 is already a VM. AWS runs our host inside its own isolation layer, and then we run browser VMs inside that host. In other words, every browser is a VM inside a VM.

This is not the normal way of using Firecracker. When a browser VM needs help from the host, the request passes through two VM layers instead of one, adding latency.

We decided the tradeoff was worth it, as regular EC2 gives us faster scale-up and lower cost. To mitigate the effects of nested virtualization, we focused on making Firecracker as speedy as possible.

![Image 5: On a .metal host a browser VM runs on Firecracker on a physical server; on regular EC2, an extra AWS hypervisor layer sits underneath, so a page fault can cross both VM layers](https://browser-use.com/images/microvm-infra/nested-stack.svg)

On regular EC2, the browser VM sits above an extra AWS hypervisor layer, so a page fault can cross both VM layers.

## From request to usable browser[](http://browser-use.com/posts/firecracker-browser-infra#from-request-to-usable-browser)

When a user asks for a browser, the control plane picks a machine with room. That machine restores a saved browser VM, starts Chromium inside it, waits until Chromium is ready to be controlled, and returns a connection URL.

That URL is what the user's agent connects to. Browser Use controls Chromium over a WebSocket using the Chrome DevTools Protocol, or CDP. CDP is the remote-control API for Chrome: click this button, type this text, read this page, take this screenshot.

![Image 6: Five-step flow: pick host, resume VM from snapshot, launch Chromium, reach CDP-ready, return the connection URL for the agent to c