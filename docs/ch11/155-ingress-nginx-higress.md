# ingress-nginx已退役higress如何平滑替代

## Ch11.155 ingress-nginx已退役higress如何平滑替代

> 📊 Level ⭐⭐ | 7.3KB | `entities/higress-cncf-sandbox-ingress-nginx-replacement.md`

## 事件概述
近期，Higress已正式通过TOC投票表决，加入云原生计算基金会（CNCF）Sandbox项目，成为CNCF生态的一员。Higress是一款基于Envoy和Istio构建的AI原生、高性能API网关，将流量网关、微服务网关与AI网关统一于单一控制面。

## 深度分析
### Gateway API 三层资源模型与阿里云 ACK 实战
除了基础的 Ingress 替代能力外，Gateway API 还通过 **Gateway API Inference Extension（GIE）** 扩展支持 AI 推理场景的智能路由——网关可感知推理节点的请求队列深度、KV Cache 命中率等指标，实现智能调度和负载均衡。

阿里云云原生 API 网关的 Gateway API 支持提供了完整的实战路径 ：

**资源模型三层分离：**

- **GatewayClass**：定义网关实现类型（`higress.io/gateway-controller`），由平台管理员管理
- **Gateway**：声明网关实例、监听端口（80/443）和域名（`*.example.com`），由集群运维管理
- **HTTPRoute**：定义具体路由规则、流量策略、权重切分、Header 灰度等，由应用开发者管理

**阿里云 ACK 实战步骤：**
1. 开启 Gateway API 监听（控制台 → API → 导入 Gateway API → 选择 ACK 来源集群）
2. 部署示例应用（`kubectl apply -f httpbin.yaml`）
3. 创建 Gateway + HTTPRoute YAML（`kubectl apply -f gateway.yaml`）
4. 验证：`kubectl get gateway apig-gateway`（PROGRAMMED=True）→ `curl -H "Host: demo.example.com" http://<网关接入点>/version`

### 为什么需要替代Ingress Nginx
Nginx Ingress计划于2026年退役，这为Higress等替代方案带来了市场机会。传统Nginx Ingress依赖配置注入模式，存在安全隐患——这种脆弱的配置注入模式在实际生产环境中可能引发安全问题。
Higress的核心竞争力在于两点：**成熟的Ingress Controller与Gateway能力**以及**AI原生网关能力**。
在Ingress能力层面，Higress兼容主流Nginx Ingress注解，以xDS控制面与Wasm沙箱替代传统的配置注入模式，消除安全风险。无论是继续使用Ingress还是迁移至Gateway API，Higress均提供统一、可扩展的流量治理能力，并支持GatewayAPI及其Inference Extension。

### AI原生网关的战略价值
Higress将AI流量视为一等公民，原生支持LLM调用、Model Context Protocol（MCP）及AI推理场景，提供基于Token的限流、多模型Fallback、RAG检索、模型感知路由与智能负载均衡等能力。这些能力标准化了云原生应用消费大语言模型的方式，使Higress成为AI Agent与LLM流量的标准入口。

### CNCF Sandbox的战略意义
Higress加入CNCF Sandbox有多层面的战略价值：
**第一，技术生态协同。** CNCF汇聚了包括Kubernetes、Envoy等在内的众多核心开源项目，Higress基于Envoy和Istio构建，技术基因与云原生环境天然契合。成为CNCF的一员意味着能够更深入地与这些顶级项目协作，共同定义技术标准。
**第二，社区治理中立。** 开源项目的长期健康发展依赖多元且活跃的贡献者社区。依托CNCF的中立地位和成熟的治理框架，Higress可以吸引更多来自不同组织的开发者、用户和企业参与贡献，避免项目发展受单一厂商意志的影响。
**第三，AI网关标准化。** 随着AI应用的爆发，市场迫切需要专门针对AI场景优化的基础设施。Higress凭借其在AI Agent、多模型统一管理等方面的领先实践，有望在CNCF的平台上推动AI网关相关标准的建立。

### 企业落地验证
Higress已在多种环境中展现出足以投入生产的可靠性，企业采用者包括阿里巴巴集团、蚂蚁集团、携程、大疆创新、国泰产险、唯品会、Boss直聘、快手、Sealos等，覆盖互联网、金融、旅游出行、硬件、娱乐、创新企业等多个行业和领域。这些企业既使用了Higress云原生网关的能力，也将其AI网关能力部署到企业Agent应用或MCP服务上。

## 实践启示
**1. 提前规划Ingress迁移路径。** Nginx Ingress 2026年退役，如果你的Kubernetes集群还在使用Nginx Ingress，现在是评估替代方案的时间窗口。Higress提供完善的迁移方案，无论选择迁移至Gateway API还是继续使用Ingress，都能获得平滑、可落地的迁移路径。
**2. AI网关应该是云原生基础设施的一部分。** 将AI流量治理纳入统一的API网关体系，比单独建设AI流量管理基础设施更高效。Higress的Wasm沙箱扩展能力为自定义AI流量处理逻辑提供了灵活框架。
**3. 关注CNCF生态的项目成熟度。** 进入CNCF Sandbox意味着项目治理走向规范化，但也意味着距离Incubation和Graduated还有较长距离。选择开源基础设施时，需要评估项目的技术路线图和社区活跃度。
**4. 多模型Fallback是AI落地的关键能力。** 当LLM服务出现故障或延迟时，多模型Fallback可以保证AI服务的连续性。这个能力在企业级AI应用中非常重要，Higress原生支持这一特性。
**5. MCP协议正在成为AI Agent的标准接口。** Higress深化对Model Context Protocol（MCP）的支持，表明MCP正在成为AI Agent与外部工具交互的事实标准。企业构建AI Agent时，需要考虑对MCP协议的原生支持。
## 相关实体
- [Ai Gateways Vs Mcp Gateways What Security Teams Need To Know](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-gateways-vs-mcp-gateways-what-security-teams-need-to-know.md)
- aigatewayproductionindex.md-1
- [Hiclaw V110 K8S Hermes Worker](https://github.com/QianJinGuo/wiki/blob/main/entities/hiclaw-v110-k8s-hermes-worker.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/higress-cncf-sandbox-ingress-nginx-replacement.md)

---

