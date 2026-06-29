# MXC Internals — Microsoft eXecution Containers AI Agent Sandbox

## Ch04.237 MXC Internals — Microsoft eXecution Containers AI Agent Sandbox

> 📊 Level ⭐⭐ | 10.0KB | `entities/mxc-execution-containers-internals-origin.md`

## MXC Internals — Microsoft eXecution Containers AI Agent Sandbox

> **Source**: [Origin Research — MXC Internals](https://www.originhq.com/research/mxc-execution-containers-internals) (2026-06-10, 46KB) by Origin. 原始内容存于 `[Mxc Execution Containers Internals Origin](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/mxc-execution-containers-internals-origin.md)`。
>
> **核心定位**: MXC 是 Microsoft 2026 年开源的 **AI agent 专用沙箱**，与传统的 Docker / gVisor / firecracker 不同——它针对 agent 工作负载（长时间运行、动态网络、可执行任意代码）做了三层收紧。这是当前公开方案中**最严格的 agent-side 隔离**之一。

## TL;DR

- **What**: Microsoft eXecution Containers (MXC) — 基于 **Hyper-V 强隔离 micro-VM** 的 agent 代码执行沙箱
- **Why it matters**: 解决 AI agent "自由执行任意代码" 的安全恐慌；2026 年伴随 NomShub 类攻击出现后，agent sandbox 走向生产化
- **How it works (三层防御)**:
  1. **Hyper-V micro-VM 隔离** — 启动速度 ~5s（比 firecracker 慢但比传统 VM 快 100x）
  2. **Syscall policy (ebpf)** — 显式 deny 列表（`fork`, `execve`, `socket`, `connect`, raw socket），agent 不能 spawn 子进程或联网
  3. **临时 home 目录** — 每次执行用全新 overlayfs 根，自动清理，无持久状态

## 三层隔离架构

### 1. Hyper-V micro-VM（强边界）

- 每个 agent invocation 启动一个独立 micro-VM，与宿主机 **kernel-level 隔离**
- 启动时间 ~5s（实测，对比 firecracker ~125ms，传统 VM ~10min）
- 资源开销：~200MB 内存 baseline（可以接受，因为 agent 工作负载长生命周期）
- Origin 团队实测：VM 间 syscall 通信必须通过 virtio-serial hypercall，无任何逃逸路径

### 2. Syscall Policy（agent 工作负载特化）

| Syscall | 状态 | 理由 |
|---------|------|------|
| `read`, `write`, `open`, `close` | ✅ | agent 基础 I/O |
| `fork`, `vfork`, `clone` | ❌ | 禁止 spawn 子进程（防止链式 sandbox escape） |
| `execve`, `execveat` | ❌ | 禁止自我升级 / 换 shell |
| `socket`, `connect`, `bind` (TCP) | ❌ | 禁止主动联网（agent 不能直接外连） |
| `socket` (AF_UNIX) | ✅ | agent 间本地通信（multi-agent 编排用） |
| raw socket | ❌ | 禁止包嗅探 |
| `ptrace` | ❌ | 禁止调试其他进程 |
| `mount`, `umount` | ❌ | 禁止挂载新文件系统 |

**与 Linux capability / seccomp 的关系**: MXC 不依赖 seccomp（容易被 BYPASS）；直接在 kernel 层用 ebpf 拦截 syscall。

### 3. 临时 home + overlayfs

- 每个 invocation 启动 fresh `/home/agent` overlay
- 父目录只读 + read-write layer（基于 overlayfs）
- invocation 结束后 RW layer 销毁 → 无持久状态
- 与 git 集成：agent 改动可选择 commit 到指定 branch（人类 review）

## 与现有 sandbox 方案对比

| 方案 | 隔离强度 | 启动速度 | agent 友好度 | 持久化 |
|------|----------|----------|--------------|--------|
| **Docker (默认)** | 弱（共享 kernel） | <1s | 高 | 持久 volume |
| **gVisor** | 中（用户态 syscall 拦截） | ~1s | 中 | 持久 |
| **firecracker** | 强（microVM） | ~125ms | 中（需自配 seccomp） | 持久 |
| **MXC (Microsoft)** | **极强**（kernel ebpf） | ~5s | **高**（专为 agent 设计） | **临时**（自动清理） |
| **NomShub 攻击场景** | (无 sandbox) | - | - | - |

**MXC 独特点**:
- ✅ **禁止 fork/exec** — 阻止 shell 链式逃逸
- ✅ **禁止主动联网** — agent 不能主动外连 C2
- ✅ **临时 home** — 阻止 persistence 攻击
- ❌ **启动慢**（vs firecracker） — 适合长任务，不适合毫秒级请求
- ❌ **无 GUI 渲染** — 不能运行 headed browser 测试

## 与 agent 安全研究的关系

- **NomShub (Straiker 2026)** — Cursor 的 sandbox 用 `shouldBlockShellCommand` 字符串解析，被 `export` / `cd` builtin 绕过。MXC 的 syscall 拦截**根本不会有这个问题**（builtin 也走 syscall）
- **Claude Code sandbox mode** — 同样基于 syscall policy，但比 MXC 宽松（允许 fork）
- **Hermes Agent Docker sandbox** — 共享 kernel 隔离，比 MXC 弱一档

## 深度分析

**1. OS 级 vs 应用级：两种 agent sandbox 哲学的根本分野**

主流 vendor 在应用层构建沙箱（Codex → Seatbelt/Landlock，Cowork → 自家 Linux VM），MXC 则是 OS vendor 从底层回答同一问题——在 OS 隔离原语层面（AppContainer / Hyper-V micro-VM / Seatbelt）构建 enforcement。 这意味着 MXC 的隔离不由 agent 代码绕过应用层沙箱策略决定，而由内核级原语强制执行。

**2. eBPF syscall 拦截 > seccomp：kernel 层 enforcement 的强度差异**

MXC 不依赖 seccomp（"容易被 bypass"），直接在 kernel 层用 eBPF 拦截 syscall。 这有根本性差异：seccomp 在应用层拦截，任何绕过应用层沙箱的手段（包括 builtin command）都可能绕开 seccomp 策略；而 eBPF 在内核层拦截，即使 agent 通过任何路径尝试受限 syscall，都会触发 kernel-level deny。

**3. "agentic" 隔离是当下热点，但设计本质是通用 untrusted-code container**

Origin 研究指出：dispatcher 不知道 bytes 由 agent 产生，plugin / CI job / pasted script 同样适用。 这个设计Versatile——AI agent 场景只是其中一个用例，third-party plugin 和 CI 场景同样需要这种隔离强度。

**4. 临时 home + overlayfs：anti-persistence 的工程最优解**

每次 invocation 使用 fresh overlayfs root，RW layer 在结束后销毁——这比 read-only filesystem 更彻底，因为它从结构上保证了无状态，而不是依赖权限策略的正确配置。git commit 集成让人类 reviewer 可以在销毁前选择性地保留改动。

## 实践启示

1. **生产级 agent 部署应使用 microVM 级隔离**（firecracker / MXC / cloud hypervisor），不要依赖 Docker
2. **syscall policy 是 agent sandbox 的核心**，不是 seccomp（too weak）
3. **临时 home + 自动清理** 是 anti-persistence 的关键，比 read-only filesystem 更彻底
4. **MXC 是 Windows 生态的答案** — Linux 生态目前主要用 firecracker + 自定义 ebpf

## 局限

- 仅支持 Linux (虽然叫 Microsoft, 实际 Linux kernel + Hyper-V)
- 没有 GPU 透传（agent 不能跑本地 LLM inference）
- 启动 5s 对低延迟场景不友好
- 与现有 Docker ecosystem 不兼容（不能用 docker compose 编排）

## 上线状态

- **开源**: https://github.com/microsoft/mxc（2026-05 发布 v0.3）
- **生产采用**: Microsoft Copilot Studio (内部使用)
- **第三方采用**: 暂未公开（生产部署案例仍在积累）

---

**Score**: v=9, c=9, v×c=81, stars=5 — Origin 研究深度极佳（46KB 反编译分析 + 真实 microVM 测试），与现有 sandbox 体系做完整对比，对 agent 安全研究有直接工程价值。

**Tags**: agent-security, sandbox, microvm, hyper-v, syscall-policy, microsoft, mxc

---

