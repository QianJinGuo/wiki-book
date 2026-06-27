# Cilium Tetragon — Kubernetes Runtime Security with eBPF

## Ch11.180 Cilium Tetragon — Kubernetes Runtime Security with eBPF

> 📊 Level ⭐⭐ | 6.0KB | `entities/cilium-tetragon-kubernetes-runtime-security-ebpf.md`

# Cilium Tetragon — Kubernetes Runtime Security with eBPF

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

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cilium-kubernetes-runtime-security-guide-2026-06-07.md)

## 相关实体

- MOC

---

