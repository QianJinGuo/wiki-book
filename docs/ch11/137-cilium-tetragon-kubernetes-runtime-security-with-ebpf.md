# Cilium Tetragon — Kubernetes Runtime Security with eBPF

> 📊 Level ⭐⭐⭐⭐ | 11.1KB

> **Background**：本文档基于 Cilium 团队 2026-06-07 发布的官方技术长文整理，结构化提炼了 K8s 运行时安全威胁模型、Tetragon 的 eBPF 内核级执行机制、与传统容器隔离/镜像扫描的根本区别，以及 5 类典型威胁向量的应对思路。原文 35KB，发布在 cilium.io/blog。

## 一、为什么"镜像扫描通过"≠"运行时安全"

K8s 安全实践长期重前轻后：CVE 静态扫描、配置审计、镜像签名等都是 **predictive**——只能捕获已知风险，盲区包括：

- **零日漏洞**：未进入 CVE 数据库的 exploit，扫描器无能为力
- **配置漂移与运行时注入**：暴露的 K8s API/env 变量被滥用，攻击者直接对内存中的进程注入 payload
- **内部威胁与凭证失窃**：合法凭证/被污染的第三方依赖绕过边界检查，必须靠运行时行为观测发现

## 二、运行时威胁模型（5 类核心向量）

1. **Container Escape & Privilege Escalation** — 利用共享 Linux kernel 的漏洞或 hostPath/root 误配置，突破命名空间，攻破 worker node
2. **Lateral Movement** — 默认扁平 K8s 网络下，compromised 前端 pod 可直达后端 DB/内部 API；缺乏 identity-aware segmentation
3. **Cryptomining & Resource Abuse** — 静默部署消耗 CPU/内存配额、推高云账单、饿死正常服务
4. **Data Exfiltration** — 合法 pod 突然向外网 IP 发起连接，或用 DNS tunneling 偷数据
5. **Supply Chain Attacks** — CI/CD 阶段沉睡的恶意代码在运行时激活，连接 C2

## 三、为什么容器隔离 + K8s 内置控制不够

- **共享 Linux Kernel**：所有容器共享同一 OS 内核；namespace + cgroup 不构成硬安全边界，kernel 一旦失守，全节点 pod 沦陷
- **默认网络平坦**：缺少 workload 身份维度的 network policy，East-West 流量缺乏 identity-aware segmentation
- **观测层次浅**：传统 sidecar/runtime agent 在用户态观察，看不到 syscalls 与内核级事件

## 四、Cilium Tetragon：eBPF 内核级防御

**Tetragon** 是 Cilium 生态的运行时安全/可观测性组件，把安全逻辑直接编译并执行在 Linux kernel 中（基于 eBPF），把"事后日志解析"变成"实时、低开销、身份感知的内核级拦截"。

### 4 个核心能力

| 能力 | 内涵 |
|------|------|
| **Kernel-Level Precision** | 在 kernel boundary 拦截 syscalls、文件访问、namespace 变更、进程执行；不是只看网络包 |
| **Kubernetes-Aware Identity** | 自动把 raw kernel event（PID 4052 执行了 binary）映射到 K8s metadata（"production namespace 的 frontend pod 起了 shell"）|
| **Real-Time Mitigation & Inline Enforcement** | 不止告警，配置允许后可在内核直接 **kill 进程、关闭 socket**，阻止 lateral movement |
| **User-Defined Policies** | 通过 TracingPolicy 声明 allow/deny，policy 违反立即触发 inline kill |

## 五、部署架构

Tetragon Agent 以 DaemonSet 形式运行在每个 K8s node，加载 eBPF 程序到 kernel，事件经 per-node agent 过滤、关联 K8s 身份后，再决定是否触发 TracingPolicy 拦截 + 上报 Hubble 事件流：

```
Kernel (eBPF programs)
  ├─ syscall intercept
  ├─ file access trace
  ├─ process exec
  └─ network socket
        ↓
Tetragon Agent (per-node)
  ├─ k8s identity mapping (Pod/NS/Deployment/Label)
  ├─ TracingPolicy enforcement (allow/deny/kill)
  └─ Hubble event stream
        ↓
Hubble Relay / Grafana / Falco Sidecar
```

## 深度分析

### eBPF 传感器 vs 传统安全探针：为什么"在哪观测"决定了上限

原文反复强调一个结构性事实：Linux 上一切行为（网络、文件、进程）都必须经由 syscall 请求内核，因此内核是唯一无法被绕过的观测点；而用户态安全 agent 一旦面对拿到 root 的失控容器，可以被"致盲、绕过甚至杀死"。 这不是产品营销话术，而是观测者与被观测者的权限拓扑问题——**sensor 的权限层级必须严格高于 workload**，否则检测逻辑本身就在攻击者的攻击面之内。传统 rootkit 检测的困境正在于此。

代价同样真实：eBPF 程序以 kprobes（动态挂任意内核函数）、tracepoints（静态标记、跨内核版本稳定）、uprobes（挂用户态库如 OpenSSL，在加密前看到明文）三类探针工作， enforcement 则走 LSM hooks。 这意味着 Tetragon 的能力边界与 Linux 内核版本强耦合——kprobe 挂载点的签名随内核演进漂移，跨异构集群的 policy 可移植性是工程上必须直面的成本，而这部分成本原文并未展开。

### 观测与执行耦合在同一个内核循环里：性能模型与规则引擎范式的分野

Tetragon 的性能故事本质上是**过滤下推（filter pushdown）到内核**：selector 在内核内丢弃无关事件，eBPF Maps 提供 O(1) 常数时间查找，对比 iptables 逐条匹配的 O(n) 顺序扫描；网络可见性也不抓包，而是 hook `tcp_connect`/`tcp_close` 生命周期函数，规避 tcpdump/DPI 的 CPU 开销。 换句话说，它把"收集全部数据再去分析"的 SIEM 模型倒转为"在数据源头只让该动的数据动"。

这也解释了它与 Falco 式规则引擎的根本范式差异：Falco 类工具在用户态消费事件流再匹配规则，规则语言表达力强但**响应是异步的**；Tetragon 的 TracingPolicy 把 Hook Point → Selectors → Actions 三段式编译进内核，eBPF 程序同步运行，Sigkill/Override（改写 syscall 返回值为 EPERM）在系统调用完成之前生效。 表达力与实时性构成权衡：内核 eBPF 校验器限制了策略逻辑的复杂度，换来的是"攻击在完成前被终止"这一用户态引擎无法企及的时序保证。

不过原文给出的 rollout 策略——新 policy 先 POST 检测模式观察、确认合法行为后再切 enforcement——暗示了另一个隐性约束： **inline kill 是一把高误伤风险的武器**。误 kill 生产进程的爆炸半径远大于误报告警，所以检测先行不是流程仪式，而是把"误报成本"前置消化的必要阶段。任何把 Sigkill 当默认动作的部署都误解了这套模型。

### 部署拓扑启示：进程层 enforcement 是 Network Policy 的补集而非替代

值得注意的层次区分：Cilium Network Policy 工作在网络层（pod-to-pod），Tetragon 运行时 enforcement 工作在进程层（哪个二进制发起的连接）；攻击者从被攻陷的 Pod A 用 netcat 连 Pod B 时，即使 CNP 允许 pod 间流量，进程层策略也能拦下——两者叠加才构成零信任。 部署上这意味着：装了 Cilium CNI 的集群，Tetragon 补的是"合法网络身份下的非法进程"这条盲区；而 Tetragon 也可以脱离 Cilium 独立运行（DaemonSet 逐节点加载 eBPF），此时它同时承担了部分网络可见性职责，观测数据流可以与 [OBI 等零代码 eBPF 观测方案](https://github.com/QianJinGuo/wiki-public/blob/main/entities/open-telemetry-ebpf-instrumentation-obi-zero-code-observability-aliyun-2026.md) 互补归流。

对于合规驱动的组织，这套内核级审计 trail 的价值在于其**不可篡改性来自物理位置而非加密**：事件在内核产生，被攻陷的用户态进程无法回头抹掉。原文将其对应到 NIST SP 800-190（二进制 allow-list、敏感 syscall 限制）和 CIS Benchmark 作为 legacy 特权容器的 compensating control。 这提示一条演进路径：runtime eBPF 层最终会成为与镜像扫描、admission control 并列的第三根合规支柱——[安全观测与可观测性正在收敛为同一套内核基础设施](https://github.com/QianJinGuo/wiki-public/blob/main/moc/observability-monitoring.md)。

## 六、实践启示

- **前移后移并重**：image scanning + admission control + runtime eBPF enforcement，三者必须组合；任何单层都被绕过
- **优先覆盖 5 类威胁向量**：container escape、lateral movement、cryptomining、data exfil、supply chain——这 5 类是 runtime 阶段真正要防的
- **Inline enforcement 优于告警**：Tetragon 能在 syscall 触发瞬间 kill 进程，比 SIEM 告警-响应回路（分钟级）快几个数量级
- **K8s 身份映射是关键差异化**：其他 runtime 工具只能告诉你"某 PID 执行了某 binary"，Tetragon 告诉你"哪个 pod、哪个 deployment、哪个 namespace"——SOC 工程师直接看到业务视角

## 七、与现有实体差异化

| 维度 | `secure-ai-agents-policy-lambda-interceptors-aws` | `hermes-observability` | `nvidia-secure-local-agent-nemoclaw-openclaw` | 本文（Tetragon） |
|------|------|------|------|------|
| 防御层级 | API Gateway / Lambda | 应用层 trace/metric | 模型运行时 (Nemoclaw) | **OS Kernel (eBPF)** |
| 适用场景 | LLM 网关拦截 prompt injection | 分布式 tracing | 模型推理容器隔离 | **通用 K8s 集群运行时安全** |
| 部署形态 | AWS Serverless | OTel collector | GPU 节点 | **DaemonSet per node** |
| 拦截时机 | API 请求边界 | post-hoc 可观测 | 模型推理 sandbox | **syscall 实时拦截** |

→ [原文存档](https://cilium.io/blog/2026/06/07/kubernetes-runtime-security-the-guide/)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/observability-monitoring.md)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

