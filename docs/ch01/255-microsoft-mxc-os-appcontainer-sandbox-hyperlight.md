# Microsoft MXC — 跨 OS 代理代码执行容器：AppContainer/Sandbox/Hyperlight 三层隔离

## Ch01.255 Microsoft MXC — 跨 OS 代理代码执行容器：AppContainer/Sandbox/Hyperlight 三层隔离

> 📊 Level ⭐⭐ | 17.2KB | `entities/microsoft-mxc-execution-containers-agent-sandbox-origin.md`

# Microsoft MXC — 跨 OS 代理代码执行容器

> **Background**: Microsoft 在 Build 2026（2026-06-02）开源的 MXC (Microsoft eXecution Container) 是首个由 **OS 厂商**提供、专门面向 agent 代码执行的跨平台沙箱层。本文基于 Origin Research 2026-06-04 的源码级深度分析 [`originhq.com/research/mxc-execution-containers-internals`](http://www.originhq.com/research/mxc-execution-containers-internals)，涵盖 10 个 containment backends 的实现细节（AppContainer 三层 fallback、bubblewrap/seatbelt/LXC/micro-VM/Hyperlight），交叉引用微软同期开源的 RAMPART/Clarity，形成完整的"微软代理安全栈"图景。
>
> 原文：→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/microsoft-mxc-execution-containers-agent-sandbox-origin.md)

## 一句话总结

MXC 是 **dispatcher 模式**的跨 OS 沙箱：1 个 JSON 策略模型 + 1 个二进制 dispatcher (Windows `wxc-exec.exe` / Linux `lxc-exec` / macOS `mxc-exec-mac`) → 10 种 OS-原生 enforcement backend。**不是"一个 sandbox"而是"一个统一接口，调用各平台 native 的隔离原语"**。

## 10 个 Containment Backend 速查表

| Wire name | OS 原语 | 稳定性 | 关键策略翻译 |
| --- | --- | :---: | --- |
| `processcontainer` (Windows 默认) | AppContainer 或 BaseContainer，3 层 fallback | **Stable**（BaseContainer 除外） | Capability SID + LPAC + Win32k disable + Job Object UI limits + DACL ACEs |
| `isolation_session` | `Windows.AI.IsolationSession` broker | Experimental | 唯一实现 `StatefulSandboxBackend` 五阶段生命周期 |
| `windows_sandbox` | Windows Sandbox (Hyper-V disposable VM) | Experimental | `.wsb` 配置 + 4 条未加密 TCP 通道 |
| `wslc` | WSL2 micro-VM + OCI container | Experimental | Session→Container→Process 句柄模型；Build 2026 新 SDK |
| `microvm` | NanVix micro-VM over WHP/KVM | Experimental | 不挂载宿主目录，每次 copy 进 staging 目录 |
| `hyperlight` | Hyperlight + Unikraft micro-VM, in-process | Experimental | CPython 直接 library call，每次 rewind snapshot |
| `bubblewrap` (Linux 默认) | `bwrap` user namespaces | **Stable** | `--unshare-*` + `--ro-bind` + cooperative HTTP proxy |
| `lxc` | LXC system containers | **Stable** | `lxc.mount.entry` + per-container iptables chain (fail-closed scoping) |
| `seatbelt` (macOS) | `sandbox_init` + TinyScheme SBPL | Experimental | deny-by-default SBPL profile，last-match-wins |
| `vm` | (not implemented) | Stub | — |

## 三个独有贡献（不应合并到现有 entity）

### 1. **AppContainer 三层 Fallback 设计**
Tier 1（BaseContainer，新 Experimental `Experimental_CreateProcessInSandbox`） → Tier 2（AppContainer + BFS allowlist via `bfscfg.exe`） → Tier 3（AppContainer + host NTFS DACL ACEs）。**fallback_detector.rs:131-252** 根据 host OS 能力自动选最强 tier。同一个进程身份（package SID `S-1-15-2-...`）是所有下游 capability、firewall、filesystem ACE 的锚点。

### 2. **bubblewrap proxy 故意不设 `NO_PROXY`**
源注释里写得很清楚：
> "We deliberately do NOT set NO_PROXY here. Bubblewrap with a proxy keeps the host network namespace shared, so without a NO_PROXY entry a cooperating client doing `CONNECT 127.0.0.1:5432` (e.g. local Postgres) still goes via the proxy, where the configured allowed/blocked-hosts policy applies."

**这是把"cooperative enforcement"边界画得最清晰的地方**：愿意用 HTTP_PROXY env var 的客户端被过滤，raw-socket 客户端直接绕过。源码承认这个限制。

### 3. **LXC fail-closed scoping**
> "Without a veth interface, we cannot safely scope rules to the container. Refuse to apply host-wide rules to avoid affecting all host traffic."

LXC 后端在网络隔离上做 **fail-closed**：找不到 veth 接口就 **完全跳过 FORWARD 链规则**，宁可断网也不让 iptables 影响宿主全局流量。和 OpenAI Codex / Anthropic Cowork 的"应用层兜底"思路正好互补——把 fail-closed 决策推到 OS 层。

## 三个与其他 agent 安全实体的差异化对比

| 维度 | **MXC** (本文) | **RAMPART/Clarity** (微软 5 月) | **CrewAI 三步防护** |
| --- | --- | --- | --- |
| 层级 | **OS / 内核** | 平台（红队 + 可观测性） | 应用层 guardrail |
| 主要机制 | AppContainer / Hyper-V / seatbelt / namespace | LLM 模拟红队 + agent trace 可视化 | 输入过滤 + 工具权限 + 身份治理 |
| 部署形态 | MIT 开源 lib | Azure 服务 + 开源 | CrewAI 内置 |
| 何时生效 | 模型调用 `exec` 之前 | 模型返回之后 / trace 写库时 | tool call 决策时 |
| 攻击者模型 | 不可信代码（agent output / plugin / CI / 用户粘贴） | 不可信 agent 行为序列 | 不可信 tool call |

**MXC 的"agent 不可知论"是核心设计哲学**：dispatcher 完全不知道执行的是不是 agent 产生的 bytes；同样的隔离也适用于第三方 plugin、PR CI job、用户粘贴的脚本。RAMPART/Clarity 是 agent 层的"安全运营"，CrewAI 三步是 agent 层的"策略治理"，MXC 是 **底层 enforcement substrate**——三者是栈式关系，不是替代。

## 与现有 wiki 实体差异化

- **`microsoft-open-sources-rampart-clarity`** (5月) — 微软前一波开源的 RAMPART (LLM 红队) + Clarity (可观测性)。MXC 是 Build 2026 微软 **第三块拼图**：执行隔离。三个一起看才能拼出微软对 agent runtime 的整体规划
- **`cloud-agent-infrastructure-creaoai-...`** (6月6日) — 云端 agent 的 state / credentials 隔离 (Vault、ephemeral tokens)。MXC 解决 "code 跑哪" 的问题，CreaoAI 解决 "state 存在哪" 的问题。两层独立
- **`ai-tool-poisoning-exposes-a-major-flaw-in-enterprise-agent-security`** (通用安全调查) — 应用层攻击面。MXC 提供的 kernel 隔离是 **OS-level last-line-of-defense**，tool poisoning 即使绕过应用层 guardrail，仍然跑在 AppContainer 内
- **`agent-security-three-step-sequence-harness-governance-identity-crewai`** (CrewAI 视角) — 治理与权限三步走。MXC 是执行层的物理隔离

## 关键代码引用

- `core/wxc/src/main.rs:806` — backend selection 的 single `match`
- `backends/appcontainer/common/src/fallback_detector.rs:131-252` — 三层 tier 选择算法
- `backends/appcontainer/common/src/appcontainer_runner.rs:384-416` — `CreateAppContainerProfile` / `DeriveAppContainerSidFromAppContainerName`
- `backends/appcontainer/common/src/appcontainer_runner.rs:188-195` — hand-rolled `SECURITY_CAPABILITIES` mirror
- `backends/appcontainer/common/src/appcontainer_runner.rs:570-610` — LPAC + Win32k mitigation
- `backends/bubblewrap/common/src/bwrap_command.rs:38-144` — bwrap argument 构造（policy 顺序）
- `backends/bubblewrap/common/src/bwrap_command.rs:123-127` — "不设 NO_PROXY" 的设计 rationale
- `backends/seatbelt/common/src/profile_builder.rs:38-82` — SBPL profile 拼装顺序（denied last）
- `backends/seatbelt/common/src/seatbelt_runner.rs:383-423` — Chromium 同款 fork → sandbox_init → exec
- `backends/windows_sandbox/guest/src/firewall.rs:11-70` — guest 端 `netsh advfirewall` lockdown
- `backends/lxc/common/src/network_iptables.rs:183-234` — veth-scope iptables (fail-closed)
- `backends/hyperlight/common/src/lib.rs:404-419` — `Preopen::read_only()` 映射

## 上线状态 / 链接

- **仓库**: `github.com/microsoft/mxc` (MIT license)
- **发布**: Build 2026 (2026-06-02)
- **状态**: early preview, README 明确说"no MXC profiles should be treated as security boundaries currently"
- **stable backends**: `processcontainer` (Windows, 不含 BaseContainer) + `bubblewrap` (Linux) + `lxc` (Linux)
- **experimental backends**: 其余 7 个

## 深度分析

### 1. OS 厂商入场安全层的范式意义

MXC 之前，所有 agent 代码执行隔离方案都是应用层实现：OpenAI Codex CLI 调用 Seatbelt/Landlock，Anthropic Cowork 自带 Linux VM，第三方 SaaS 用容器封装。**MXC 第一次让 OS 厂商（微软）直接提供内核级隔离原语作为公共服务**。这相当于 OS 层面出现了 `sandbox()` 系统调用——不再是"请用这些 kernel primitives 自行组装"，而是"我来保证这层抽象的接口稳定和跨 OS 一致"。这对整个 agent runtime 生态的影响是：隔离从"用户代码的责任"变成了"平台的责任"。

### 2. 三层 fallback 揭示的 Windows 容器化演进路径

AppContainer 三层 fallback（BaseContainer → BFS allowlist → DACL ACEs）不是简单的兼容性设计，而是**一条从"能力限制"到"硬件虚拟化"的演进时间线**：

- Tier 3 (DACL ACEs)：2009 Win7 时代引入 AppContainer 时已有的文件级限制，依赖宿主 NTFS 权限
- Tier 2 (BFS allowlist)：中期方案，用户态 allowlist 服务 + kernel enforcement
- Tier 1 (BaseContainer / `Experimental_CreateProcessInSandbox`）：最新 Experimental，是微软正在构建的**下一代 Windows 原生容器化接口**，FlatBuffer 序列化、kernel 直接支持

这条时间线的尽头是：**Windows 容器与进程容器的能力差距正在被弥合**，BaseContainer 若稳定化，Windows 上 agent 隔离将从"凑合用 AppContainer"升级到"接近 Linux namespace 体验"。

### 3. 合作式执行与强制执行之间的诚实边界

源码中 bubblewrap proxy "故意不设 NO_PROXY" 和 LXC "找不到 veth 就 fail-closed" 是同一个设计哲学的两面：**MXC 团队对"哪些边界是 kernel 强制的、哪些是合作式的"有清醒认知，并且明确写进了注释**。这不是缺陷，而是设计选择——raw socket 绕过 HTTP proxy 是已知限制，不是被忽略的 bug。合作式 enforcement 的前提是客户端配合，当客户端不配合时，系统选择 fail-closed（LXC）或降级到 allow-all（Seatbelt hostname 过滤）。这种诚实性对 agent runtime 工程师至关重要：他们需要知道自己的威胁模型里，哪层边界在什么条件下有效。

### 4. dispatcher 模式的核心价值：策略与实现的分离

MXC 的 dispatcher 设计将"策略描述"（JSON policy model）与"策略执行"（10 种 backend）完全解耦。这意味着：
- **策略层稳定**：同一份 JSON policy 可在 Windows/macOS/Linux 跨平台工作
- **实现层可演进**：stable backends 满足当前生产需求，experimental backends 可按需试点
- **供应商锁定风险低**：切换 backend 不需要改 agent 代码，只需要换 binary

这对 agent framework 开发者尤其重要：他们可以用 MXC 作为统一的沙箱抽象层，底层按 OS 和场景选择最优 backend，而不必维护多套 OS-specific 隔离代码。

### 5. Hyperlight in-process 模型的低延迟代价

Hyperlight 让 CPython 直接 library call 进 Unikraft micro-VM，每次 rewind snapshot，避免了进程启动开销。这对"每步 agent 推理都要跑一小段 Python 验证"的场景极有价值。但代价是：**snapshot rewind 意味着 guest 状态不持久**——每次 `run_code` 看到的都是同一个 warmup 后的干净状态，不适合需要 side effect 累积的场景（如文件写入后再读回）。这与进程级沙箱（状态随进程销毁）与持久 VM（状态跨调用保留）是同一权衡的三个不同切面。

## 实践启示

1. **agent 框架选 sandbox backend 时，优先 stable 三个** (processcontainer / bubblewrap / lxc)；experimental 的在生产部署前必须自己跑实际工作负载验证
2. **AppContainer 三层 fallback 给 agent runtime 带来选择空间**：在 Win10 旧机器上跑 Tier 3 (DACL)，在 Win11 最新 build 上自动升级到 Tier 1 (BaseContainer)，不需要 agent 代码感知
3. **bubblewrap + HTTP proxy 模式适合容器化 agent**：在 Kubernetes pod 里跑 bwrap 隔离的 model exec，proxy 走 cluster 内 service mesh，比 iptables 更易观察
4. **macOS Seatbelt 不可做 hostname 过滤**：需要按域名 allowlist 的场景下，要么用 Network Extension (需要 root + entitlement)，要么在应用层做 (HTTP client-level allowlist)
5. **Hyperlight in-process CPython 适合低延迟 / 高频调用**：snapshot rewind 模式让连续 exec 调用几乎无 VM 启动开销，适合每步 agent 都跑小段 Python 验证的场景
6. **fail-closed 模式值得借鉴**：LXC 后端的"找不到 veth 就拒绝" 是好的安全工程实践——比"找不到就用默认（host-wide）"安全得多

### 补充实践启示

7. **跨平台 agent framework 应采用 MXC 作为沙箱抽象层**：统一 JSON policy 接口意味着同一个 agent 代码可以在 Windows/macOS/Linux 用对应 backend 执行，agent logic 不需要感知 OS 差异，降低了多平台支持的成本

8. **在 Windows 上规划长期 agent 部署时，持续关注 BaseContainer 稳定性**：当前 Tier 1 虽是 Experimental，但它是微软 Windows 容器化的战略方向。一旦 `Experimental_CreateProcessInSandbox` 稳定化，Tier 3 DACL 的复杂配置和 Tier 2 BFS 的外部依赖都可以简化

9. **对安全要求高的 agent 场景，优先用进程级 + VM 级双层隔离**：MXC 各 backend 提供的是单层隔离（要么进程 namespace 要么 micro-VM），对于真正不可信的 code source，可考虑先用 processcontainer/bubblewrap 做第一层，再用 windows_sandbox/hyperlight 做第二层——类似 RAMPART 的 defense-in-depth 思路与 MXC 的物理隔离层的组合

10. **使用 bubblewrap 时，若需要严格网络隔离，优先用 `--unshare-net` 而非 HTTP proxy**：HTTP proxy 是合作式 enforcement，只有 honor HTTP_PROXY 的客户端才被过滤。`--unshare-net` 提供真正内核级网络隔离，代价是 host 方向的 TCP 连接全部断开，适合 agent 只做计算/文件操作不需要网络的场景

11. **NanVix 的 staging copy-in/copy-out 模式是防止数据渗漏的极简方案**：不挂载宿主目录，每次执行前 copy 进入 staging，执行后 copy 出来——这个设计比 bind-mount 更保守，但完全避免了"沙箱逃逸后直接读宿主文件"的风险，适合对数据泄露零容忍的高安全场景

## 原文链接

→ [MXC Internals 原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/microsoft-mxc-execution-containers-agent-sandbox-origin.md)

## 相关阅读

- [Microsoft RAMPART/Clarity](https://github.com/QianJinGuo/wiki/blob/main/entities/microsoft-open-sources-rampart-clarity.md) — 同期微软开源的 agent 红队 + 可观测性栈
- **Cloud Agent Infrastructure** — 云端 agent state/凭据隔离
- [CrewAI Agent Security 三步防护](../ch05/018-harness.html) — 应用层 guardrail 视角
- [AI Tool Poisoning 调查](../ch04/304-ai-tool-poisoning-exposes-a-major-flaw-in-enterprise-agent-s.html) — agent 工具被污染的攻击面
- **Harness Engineering** — 隔离是 harness 的关键支柱之一

---

