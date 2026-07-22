---
source_url: http://www.originhq.com/research/mxc-execution-containers-internals
ingested: 2026-06-09
sha256: 2c697237bb4651caafdf5c90c6e5403d516fceea0f59c673efc586d2d3aad70a
type: article
author: Origin
title: "MXC Internals: How Microsoft's eXecution Containers Actually Isolate Agent Code"
created: 2026-06-09
tags: [sandbox, microsoft, agent-security, open-source, mxc, appcontainer, hyper-v, seatbelt, bubblewrap, os-containment]
---

# MXC Internals: How Microsoft's eXecution Containers Actually Isolate Agent Code

> Source: http://www.originhq.com/research/mxc-execution-containers-internals (Origin Research, 2026-06-04)

## Introduction

When an agent decides to run code, _where_ does that code run, and what can it touch? Every coding-agent vendor now has an answer. OpenAI's Codex CLI sandboxes locally through OS-native primitives: macOS Seatbelt, Linux Landlock + seccomp; Anthropic's Claude Cowork runs the agent inside a full local Linux VM layered with seccomp and a network allowlist; hosted offerings like Google's GKE Agent Sandbox and LangSmith Sandboxes wrap the workload in a VM or container. But so far, no OS vendor has provided a native solution.

At Build 2026, Microsoft open-sourced MXC, the Microsoft eXecution Container, under the MIT license: "a sandboxed code execution system for running untrusted code (model output, plugins, tools) on Windows, Linux, and macOS."

We usually have to reverse engineer what we write about here, but this time Microsoft is putting it all out in the open. This is a tour of what the source does: one dispatcher binary, a JSON policy model, and ten containment backends. The backends get the most attention, because that is where policy turns into real enforcement, from AppContainer capability SIDs and Job Object UI limits to Hyper-V micro-VMs and macOS Seatbelt profiles. There are also newly documented Windows API functions and some sneak-peeks into upcoming Preview build functionality.

Every excerpt below is copied from the repo and annotated with its file and line range.

> A maturity caveat. The README calls this an early preview and states plainly that "no MXC profiles should be treated as security boundaries currently." We document how the isolation is built, not whether it holds. Many of these backends sit behind `--experimental`, as noted in the summary table.

## What MXC is

Strip the agentic framing and MXC is three things:

1. **A single native binary** `wxc-exec.exe` on Windows, `lxc-exec` on Linux, `mxc-exec-mac` on macOS, built from a Cargo workspace.
2. **A versioned JSON config** describing a command to run plus a policy (filesystem read-only / read-write / denied paths, network posture, UI restrictions).
3. **A TypeScript SDK** (`@microsoft/mxc-sdk`) that builds those configs and shells out to the binary.

The binary reads the config, picks a _containment backend_, translates the policy into that backend's native enforcement, runs the command, and streams back stdout, stderr, and the exit code. It is an _execution_ layer, nothing more: pulling WSL images, warming Hyperlight snapshots, and enabling VM features are out-of-band steps you handle yourself.

A single `match` on the request's `containment` field selects the backend. The ten variants:

| Wire name | OS primitive | Stability |
| --- | --- | --- |
| `processcontainer` (default) | AppContainer **or** BaseContainer (runtime-selected, 3 tiers) | Stable (except BaseContainer) |
| `isolation_session` | `Windows.AI.IsolationSession` broker | Experimental |
| `windows_sandbox` | Windows Sandbox (Hyper-V disposable VM) | Experimental |
| `wslc` | WSL2 micro-VM + OCI container | Experimental |
| `microvm` | NanVix micro-VM over WHP/KVM | Experimental |
| `hyperlight` | Hyperlight + Unikraft micro-VM, in-process | Experimental |
| `bubblewrap` (default on Linux) | `bwrap` user namespaces | Stable |
| `lxc` | LXC system containers | Stable |
| `seatbelt` | macOS Seatbelt (`sandbox_init`) | Experimental |
| `vm` | (not implemented) | Stub |

Two execution models coexist. The **one-shot** model (`ScriptRunner` trait) pays full provision-execute-teardown on every invocation; every backend implements it. The **state-aware** model (`StatefulSandboxBackend` trait) exposes five lifecycle phases (`provision`, `start`, `exec`, `stop`, `deprovision`) for long-lived sessions. Only Isolation Session implements it today.

## ProcessContainer: AppContainer and BaseContainer (default on Windows)

This is the default backend and the only stable one on Windows. The wire value `processcontainer` resolves at runtime to one of **three isolation tiers**, picked by a fallback detector based on host OS support:

| Tier | Primitive | Filesystem enforcement |
| --- | --- | --- |
| 1: BaseContainer | `Experimental_CreateProcessInSandbox` (processmodel.dll) | Native OS sandbox API |
| 2: AppContainer + BFS | AppContainer + `bfscfg.exe` policy | BFS allow-lists |
| 3: AppContainer + DACL | AppContainer + host NTFS ACEs | DACL grant/deny ACEs on host paths |

Selection prefers the strongest tier the host can satisfy. Tier 1 if `processmodel.dll!Experimental_CreateProcessInSandbox` resolves; else Tier 2 if built with the `tier2_bfs` feature and `bfscfg.exe` is found; else Tier 3.

Tiers 2 and 3 both build on classic AppContainer process creation. The flow:
- `CreateAppContainerProfile` mints a per-name profile and returns its `S-1-15-2-...` package SID
- That SID anchors everything downstream: it is what firewall rules and, in Tier 3, filesystem ACEs target
- Capabilities grant specific classes of access; MXC appends a custom `AgenticAppContainer` and adds `internetClient` when network access is allowed
- Each name becomes a capability SID via Win32 `DeriveCapabilitySidsFromName`, collected into a hand-rolled `SECURITY_CAPABILITIES` mirror attached to `PROC_THREAD_ATTRIBUTE_SECURITY_CAPABILITIES`

Three more restrictions layer on:
- **LPAC (Less-Privileged AppContainer)** — `PROC_THREAD_ATTRIBUTE_ALL_APPLICATION_PACKAGES_POLICY` drops the child out of `ALL APPLICATION PACKAGES` into `ALL RESTRICTED APPLICATION PACKAGES`
- **Win32k system-call disable** — `PROCESS_CREATION_MITIGATION_POLICY_WIN32K_SYSTEM_CALL_DISABLE_ALWAYS_ON` severs the `win32k.sys` attack surface before any user-mode code runs
- **UI Job Object** — `JOB_OBJECT_UILIMIT_*` flags block clipboard, window-message broadcast, write to user handles, etc.

## Bubblewrap (default on Linux)

On Linux the default backend is `bubblewrap`, which builds an argument vector for the `bwrap` tool: unprivileged Linux namespace isolation, no root required. The whole sandbox is described declaratively:
- `--unshare-user`, `--unshare-pid`, `--unshare-ipc`, `--unshare-uts`
- Then `--ro-bind / /`, `--dev`, `--proc`, `--tmpfs /tmp`
- Then policy: `--bind` for readwrite, `--ro-bind` for readonly, `--tmpfs` to mask denied

The ordering is deliberate: read-only root first, policy mounts last so they win on overlap.

Networking has two modes:
- Pure block + no host rules → `--unshare-net` (zero-cost, fully isolated)
- Per-host filtering → cooperative loopback HTTP proxy. The source deliberately does NOT set `NO_PROXY` so cooperating clients get filtered. **Raw-socket clients bypass the proxy** — a limitation the source documents. iptables (needs `CAP_NET_ADMIN`) and proxy are mutually exclusive.

## Seatbelt (macOS)

On macOS, the `seatbelt` backend wraps the kernel sandbox behind the App Sandbox. MXC generates a TinyScheme SBPL profile, deny-by-default, applied with `sandbox_init()`. Profile assembly order:
- `(deny default)`
- `BASELINE_ALLOW` (fork/exec, signal self, sysctl, basic mach services)
- `SYSTEM_READ_ALLOW`, `TTY_ALLOW`
- Policy: read-only → `(allow file-read* (subpath ...))`, read-write → add `file-write*`, denied → `(deny file-read* file-write* (subpath ...))`
- UI restrictions (deny WindowServer/LaunchServices/IOHIDLibUserClient, pasteboard)
- `deniedPaths` LAST so they win (Seatbelt is last-match-wins)

**Hostname-based network filtering is not supported**: `allowedHosts` degrades to best-effort allow-all; `blockedHosts` is rejected outright at validation.

Applied in the child between fork and exec (the same fork → `sandbox_init()` → exec pattern Chromium uses). The closure is async-signal-safe (pre-built CString, libc-only error reporting) because it runs in the fragile window after fork.

## Micro-VM tiers (Windows Sandbox, NanVix, Hyperlight, WSLC)

**Windows Sandbox** is a Hyper-V disposable VM (.wsb config). The guest binary and a host Python install are mapped read-only; a read-write "rendezvous" directory carries the bootstrap script and logs. Host and guest talk over **four separate TCP connections** (unencrypted — flagged in source as TODO). The guest immediately locks the network down to the host alone via `netsh advfirewall`.

**WSLC** runs OCI/Linux containers inside a WSL2 micro-VM via Microsoft's first-party WSLC SDK (Session → Container → Process handles). Per-host filtering builds an iptables rule chain and exec's it inside the started (privileged) container. Public preview "in the coming months."

**NanVix** boots a minimal guest OS over WHP (warm-start memory snapshot) or KVM (cold boot). It never mounts host directories live — it _copies_ them into a per-run staging tree, hands the tree as `-mount` to `nanvixd`, and copies back on clean exit only.

**Hyperlight** runs CPython _in-process_ inside a Unikraft unikernel on a Hyperlight micro-VM, no subprocess, no pipes. Each `run_code` rewinds the guest to a post-warmup snapshot so consecutive runs are hermetic. Host dirs exposed as `Preopen` mounts at `/host/<basename>` with the policy's read-only flag mapped to `Preopen::read_only()`.

## LXC (Linux system containers)

The `lxc` backend drives full LXC system containers via the `lxc-*` CLI tools. Lifecycle: create → start → attach-run → destroy. `lxc-create -t download` pulls a prebuilt rootfs (e.g. alpine/3.23). Filesystem policy becomes `lxc.mount.entry` lines: `bind,create=dir` for read-write, `bind,ro,create=dir` for read-only, `/dev/null` bind or zero-size tmpfs to mask denied paths.

Network filtering builds a per-container iptables chain named `MXC-<name>`, scoped to the container's host-side veth interface discovered via `lxc-info`. **Fail closed**: if the veth can't be found, the FORWARD hook is skipped rather than applied host-wide.

## Cross-cutting design notes

**The policy model is the common thread.** Every backend consumes the same cross-platform policy (filesystem read-only/read-write/denied, network posture, UI restrictions) and translates it into native enforcement. The same `JOB_OBJECT_UILIMIT_*` bitmask appears in both the manual AppContainer path and the BaseContainer FlatBuffer; the same read-only/read-write/denied triple becomes DACL ACEs on Windows, bind mounts on bubblewrap, `lxc.mount.entry` lines on LXC, SBPL subpaths on macOS, and staged file copies on NanVix.

**Default-deny is consistent.** UI policy defaults to disabled (no clipboard, no injection); network defaults to block; deny rules are honored last where supported. Seatbelt and bubblewrap are deny-by-default with explicit allows.

**Enforcement strength varies by tier.** Some boundaries are kernel-enforced (AppContainer tokens, Win32k disable, Job Object UI limits, namespace unsharing, Seatbelt, the Hyper-V VM boundary). Others are **cooperative** (bubblewrap and Windows proxy paths filter only clients that honor proxy env vars; raw sockets bypass them). The code is explicit about which is which, in comments next to the mechanism.

**Unix backends share PTY plumbing.** LXC and Seatbelt CLI both go through `mxc_pty::run_with_pty`: pty pair allocation, `setsid()` + `TIOCSCTTY` in a post-fork `pre_exec`, and a first-byte "ready" handshake to avoid racing the inner shell's terminal setup.

## Closing thoughts

Every other vendor builds its sandbox at the application layer: Codex shells out to Seatbelt and Landlock, Cowork ships its own Linux VM, hosted services run your code inside their containers. **MXC is the OS vendor answering the same question from underneath.** It is not one sandbox but a dispatcher that meets each platform where its isolation primitives already live.

The "agentic" isolation framing is of the moment, but the design is versatile. Underneath the README's language about model output and tools is a general untrusted-code container: policy in, confined process out. A model is one source of code you don't trust, but so is a third-party plugin, a CI job running someone's pull request, or a script a user pasted in. Nothing in the dispatcher knows an agent produced the bytes, and nothing would change if one hadn't. **That is the part worth remembering: MXC is a window into how Microsoft is thinking about running untrusted code, with agents as the reason it shipped now.**

The source is honest about the rough edges: the `Experimental_` prefix, the issue-#330 folder-share filter, the unencrypted sandbox TCP channels, the cooperative-only proxies. None of it is hidden; it sits in the comments next to the code. The OS surface underneath is starting to come out into the open, like the newly documented `CreateProcessInSandbox`, and the freshest backends are a preview of where Windows containment is heading, **isolation-session and BaseContainer most of all**.

---

**Key takeaways:**

1. **MXC is a polyglot dispatch layer, not one sandbox** — one Cargo workspace produces 3 OS-specific binaries that select one of 10 containment backends at runtime, each mapping the same JSON policy into native OS primitives
2. **The 3-tier Windows AppContainer fallback** is the centerpiece: BaseContainer (new Experimental API) → BFS allowlists → DACL ACEs on host NTFS, with capability SIDs + LPAC + Win32k mitigation + Job Object UI limits layered on
3. **Bubblewrap and macOS Seatbelt are stable; everything else is `--experimental`** — the read-the-source value is in seeing where Windows containment is heading (isolation-session broker, BaseContainer)
4. **Cooperative vs. kernel enforcement is explicit** — the source documents where raw sockets bypass the HTTP proxy and where hostname-based network filtering degrades to allow-all on macOS
5. **Cross-OS PTY plumbing is shared** via `mxc_pty::run_with_pty` with first-byte handshake — relevant to anyone implementing a code-execution sandbox

**Relationship to existing wiki entities:**

- **Microsoft RAMPART/Clarity** (`microsoft-open-sources-rampart-clarity`) — sibling MS open-source agent security release from May 2026; RAMPART is red-teaming, Clarity is observability. MXC is the third leg: **code execution containment**
- **CreaoAI cloud-agent-infrastructure** (`cloud-agent-infrastructure-creaoai-...`) — cloud-side agent state/credentials isolation; MXC is the OS-level isolation layer that the cloud stack can build on
- **CrewAI three-step security** (`agent-security-three-step-sequence-...`) — application-layer guardrails. MXC provides the kernel/OS substrate they all eventually depend on
