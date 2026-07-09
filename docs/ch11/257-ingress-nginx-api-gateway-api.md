# 告别 Ingress Nginx：云原生 API 网关 Gateway API 使用指引

## Ch11.257 告别 Ingress Nginx：云原生 API 网关 Gateway API 使用指引

> 📊 Level ⭐⭐⭐ | 7.8KB | `entities/aliyun-cloud-native-api-gateway-gateway-api-guide.md`

# 告别 Ingress Nginx：云原生 API 网关 Gateway API 使用指引

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aliyun-cloud-native-api-gateway-gateway-api-guide.md)

## 摘要

Gateway API 是 K8s 官方推出的下一代 Ingress 标准，通过 **GatewayClass / Gateway / HTTPRoute 三层资源模型**实现角色分层、表达力增强与跨控制器可移植。阿里云云原生 API 网关基于开源 Higress 提供 Ingress 与 Gateway API 双模并行、灰度切流与一键回滚能力，**配套兼容主流 Nginx Ingress 注解的迁移工具链**。

## 核心要点

- **Ingress 的三大痛点**：
  - 表达能力不足（仅基础域名+路径，高级策略靠非标准 annotation）
  - 缺乏角色分层（配置全塞一个资源）
  - 扩展性差（注解五花八门，Ingress 控制器之间互不兼容）
- **Gateway API 三层资源模型**：

| 资源 | 职责 | 负责角色 |
|------|------|---------|
| GatewayClass | 定义网关实现类型 | 平台管理员 |
| Gateway | 声明网关实例、监听端口和域名 | 集群运维 |
| HTTPRoute | 定义具体路由规则、流量策略 | 应用开发者 |

- **原生支持的能力（无需 annotation）**：
  - 精确路由匹配（路径/域名/请求头/查询参数/HTTP方法）
  - 请求/响应修改（内置 Filter 机制）
  - 流量切分（权重分发、灰度发布）
  - 请求重定向与 URL 重写
  - 跨命名空间路由 + ReferenceGrant 安全保证
  - **Gateway API Inference Extension (GIE)**：推理场景智能路由（感知请求队列深度/KV Cache 命中率）
- **阿里云网关实战优势**：双模并行 + 注解兼容迁移 + 控制台可视化 + Higress 开源生态

## 深度分析

### 角色分层是 Gateway API 相对 Ingress 的根本优势

Ingress 把"我用什么网关、网关监听什么端口、应用如何被路由"全部塞到一个 `Ingress` 资源。这导致三个真实场景痛点：

1. **应用开发者想加个路由 → 改 Ingress → 触发平台管理员 review**（权限边界模糊）
2. **平台升级网关实现 → 改同一个 Ingress → 触发应用团队回归测试**（关注点耦合）
3. **多团队共享网关 → 一个 Ingress 资源的所有权争执**（治理模糊）

Gateway API 的三层拆分 直接解决了这三点：**GatewayClass 由平台管理员独占修改、Gateway 由运维独占修改、HTTPRoute 由应用开发者独占修改**——每个角色的修改半径被显式限制在自己的资源上，**RBAC 与职责边界同时落地**。这不是"再切几个 CRD"，而是把"治理模型"作为协议层的一等公民固化下来。

### "无 annotation" 才是真正的标准化

Ingress 时代 controller-specific annotation 泛滥：`nginx.ingress.kubernetes.io/rewrite-target`、`alb.ingress.kubernetes.io/actions...`、`konghq.com/plugins`。这意味着：换 controller = 重写所有路由注解 = **路由配置不可移植**。Gateway API 用内置 Filter 机制 把这些能力做成协议级一等公民——`requestRedirect`、`urlRewrite`、`requestMirror`、`headerModifier` 等都是 spec 字段，不依赖 controller 私有扩展。**结果是路由配置变成可移植资源**：同一个 HTTPRoute YAML 在 Higress / Istio / Envoy Gateway / Cilium 上都能跑，迁移成本接近零。

### GIE 是 Gateway API 面向 AI 工作负载的关键扩展

Gateway API Inference Extension（GIE） 是值得单独提的扩展：**路由决策可感知推理后端状态**（队列深度、KV Cache 命中率），把"最少连接的 Pod"语义从 L4 LB 提升到 L7 推理网关层。这对 LLM serving 至关重要：

- **传统 L4 LB**：按 TCP 连接数负载均衡，不知道后端 Pod 在跑什么
- **GIE-aware Gateway**：知道 Pod A 队列 50、KV cache 命中率 0.3；Pod B 队列 5、KV cache 命中率 0.8 → 把请求路由到 B

**这是 Gateway API 适配 AI workload 的关键拼图**——vLLM / SGLang / TGI 这类推理框架都暴露 metrics，GIE 让网关消费这些 metrics 做调度决策。**对自建推理平台的企业，这是降低 TTFT（time-to-first-token）和提高 GPU 利用率的关键基础设施**。

### 双模并行 + 注解兼容 = 迁移路径关键

Ingress 存量太大，**"一刀切" 替换 Gateway API 不现实**。阿里云云原生 API 网关的两个设计选择值得展开：

1. **Ingress 与 Gateway API 并存**：让新老资源在同一网关实例上共存，应用可逐步迁移，**无需"大爆炸"切换**
2. **注解兼容工具**：把常见 Nginx Ingress 注解自动转换为 Gateway API Filter，**避免手工重写 1000+ Ingress YAML**

**这套"灰度切流 + 一键回滚"组合解决了"协议升级最大的成本不是技术而是过渡"**——历史经验反复证明：协议升级失败案例大多不是新协议不够好，而是迁移路径不友好（Python 2→3 拖了十年就是反例）。

### ReferenceGrant 是被低估的安全设计

Gateway API 在跨命名空间路由上引入 **ReferenceGrant**——必须由目标命名空间显式 grant 才能被跨 namespace 路由。这避免了 Ingress 时代"路由能不能跨 ns 走"的隐性安全风险。**这是 K8s 网关资源第一次把"信任边界"作为协议级约束**——不是 controller 自己决定，而是在 CRD 里显式声明。

## 实践启示

1. **新项目直接用 Gateway API**：三层角色模型比 Ingress 更符合现代企业 K8s 治理
2. **存量 Ingress 用"注解转换工具"批量迁移**：阿里云/Higress 提供的兼容工具可保留 90%+ 原有路由逻辑
3. **AI 推理平台优先评估 GIE 扩展**：vLLM/SGLang/TGI 自建时，GIE-aware Gateway 比纯 L4 LB 在 TTFT 与 GPU 利用率上有显著优势
4. **跨 ns 路由必须配 ReferenceGrant**：避免隐性安全风险，把信任边界显式声明
5. **灰度切流 + 一键回滚**是任何网关迁移方案的必备能力——不要接受"非黑即白"的切换方案
6. **关注 Filter 机制标准化进度**：HTTPHeaderFilter、RequestMirror、URLRewrite 等已固化；CustomFilter 走 Experimental，**生产慎用**直到 GA

## 相关实体

- [Cilium Tetragon Kubernetes Runtime Security Ebpf](../ch01/295-rag.html)
- [Aliyun Cloud Native Safety Guardrails Three Domains](../ch05/081-ai.html)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch03/045-agent.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](ch11/214-openclaw.html)
- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](../ch01/1100-scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on.html)

---

