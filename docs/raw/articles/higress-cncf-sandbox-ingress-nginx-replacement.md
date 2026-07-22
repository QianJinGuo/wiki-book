---
title: "ingress-nginx已退役higress如何平滑替代"
source_url: https://mp.weixin.qq.com/s/tJBB26BCNOGzdI0iBD9hGg
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
sha256: c28e456b59d9a7fdf18af64ba4aa32dfe59d26ca33de7481ff295a57aef9478b
created: 2026-05-18
type: article
platform: wechat
created: 2026-05-18
sha256: ec80a8523c36f380d7f097ef809d1668ce3ab29a80c84eea9176aba8f160748f
---
# Ingress Nginx已退役，Higress如何平滑替代
近期，  Higress已正式通过TOC投票表决，加入云原生计算基金会（CNCF）Sandbox项目，成为CNCF生态的一员  。
#  01
#  Higress是什么？
Higress是一款基于Envoy和Istio构建的AI原生、高性能API网关。它将流量网关、微服务网关与AI网关统一于单一控制面，降低云原生与AI工作负载的运维复杂度。
Higress诞生于阿里巴巴内部大规模生产实践，为CNCF生态带来企业级稳定性与WebAssembly（Wasm）扩展能力。
目前，其核心能力聚焦  两大方向  ：
* Ingress Controller与Gateway能力：  Higress是成熟的Kubernetes Ingress Controller，同时完整支持GatewayAPI及其Inference Extension。随着Nginx Ingress计划于2026年退役，Higress可作为安全、即插即用的替代方案——兼容主流Nginx Ingress注解，以xDS控制面与Wasm沙箱替代脆弱的配置注入模式，消除传统架构中的安全风险。无论是继续使用Ingress还是迁移至Gateway API，Higress均提供统一、可扩展的流量治理能力。
* AI原生网关能力：  Higress将AI流量视为一等公民，原生支持LLM调用、Model Context Protocol（MCP）及AI推理场景，提供基于Token的限流、多模型Fallback、RAG检索、模型感知路由与智能负载均衡等能力，标准化云原生应用消费大语言模型的方式，使Higress成为AI Agent与LLM流量的标准入口。
#  02
#  Higress企业案例
目前，Higress已在多种不同的环境中展现出了足以投入生产的可靠性，企业采用者包括  阿里巴巴集团、蚂蚁集团、携程、大疆创新、国泰产险、唯品会、Boss 直聘、快手、Sealos  等，覆盖互联网、金融、旅游出行、硬件、娱乐、创新企业等多个行业和领域。
这些企业既使用了Higress云原生网关的能力，也将其AI网关能力部署到企业Agent应用或MCP服务上。
此外，在Higress的基础上，还延伸出诸多AI相关的创新开源项目，包括HiMarket、HiClaw等。
#  03
#  为什么申请加入CNCF？
事实上，Higress加入云原生计算基金会（CNCF），是其发展进程中的关键一步，主要源于以下三方面的考量：
首先，CNCF汇聚了包括Kubernetes、Envoy等在内的众多核心开源项目。Higress基于Envoy和Istio构建，其技术基因与云原生环境天然契合。  成为CNCF的一员，意味着Higress能够更深入地与这些顶级项目协作，共同定义技术标准，确保其在云原生架构中的兼容性和领先地位。  其次，开源项目的长期健康发展依赖于一个  多元且活跃的贡献者社区  。  依托CNCF的中立地位和成熟的治理框架，Higress可以吸引更多来自不同组织的开发者、用户和企业参与贡献，避免项目发展受单一厂商意志的影响。这种开放的社区模式将加速技术创新，使Higress能够更敏捷地响应全球用户不断演进的需求。  最后，加入CNCF还有助于推动  AI网关技术的标准化和普及  。  随着AI应用的爆发，市场迫切需要专门针对AI场景优化的基础设施。Higress凭借其在AI代理（Agent）、多模型统一管理等方面的领先实践，有望在CNCF的平台上推动AI网关相关标准的建立。
#  04
#  后续规划：长期兼容与生态共建
展望未来，该项目将围绕两大核心方向持续演进。
一是长期兼容Ingress，  支持完善的Gateway API及其Inference Extension，同时提供完善的Nginx Ingress迁移方案：持续支持并兼容Ingress与Nginx Ingress注解，与Gateway API双栈共存；强化对Gateway API及Inference Extension核心版本与能力的适配与稳定供给，为云原生网络与AI应用提供可持续的开源基础设施选择；提供完善的Ingress迁移方案，无论用户选择迁移至Gateway API还是继续使用Ingress，均能获得平滑、可落地的迁移路径。  二是持续推进AI能力建设，  深化对Model Context Protocol（MCP）的支持，使Higress成为AI Agent与LLM流量的标准入口；引入「Higress Agent」实现自主流量治理；支持AI场景的实时通信需求；构建Skill渐进式披露与安全管理能力；持续完善基于Token的限流、多模型Fallback、智能负载均衡等AI原生能力。
#  05
#  Sandbox只是起点
加入CNCF Sandbox是起点，而非终点。
后续，Higress社区将持续投入治理、文档与社区建设。接下来我们将继续向CNCF Incubation（孵化）阶段迈进。
感谢CNCF技术监督委员会、更广泛的云原生社区，以及所有支持Higress的贡献者与采用方；期待与CNCF生态携手共建安全、可扩展、AI友好的云原生基础设施。
预告：Higress将参与KubeCon EU 2026，分享Higress未来的详细规划。Gateway as a Service。
*了解更多:  higress.ai  |  GitHub