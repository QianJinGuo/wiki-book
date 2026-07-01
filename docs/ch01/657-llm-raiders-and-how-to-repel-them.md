# LLM raiders and how to repel them

## Ch01.657 LLM raiders and how to repel them

> 📊 Level ⭐⭐ | 5.9KB | `entities/llm-raiders-how-to-repel.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/llm-raiders-how-to-repel.md)

## 核心要点
- value=8, confidence=7, product=56
- Kaspersky blog on AI server security
- LLMjacking: 攻击者劫持私有 AI 服务器算力资源，2026 年呈工业化规模增长
- 蜜罐实验：Raspberry Pi 伪装高性能 AI 服务器，3 小时被 Shodan 发现，1 小时内开始收到探测请求
- 113,000+ 请求来自数千个独立 IP，23% 流量定向探测 AI 能力和利用本地 LLM
- 攻击工具 LLM-Scanner 在 7 家云提供商、8 个国家的基础设施中运行
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/llm-raiders-how-to-repel.md)

## 深度分析
### LLMjacking 的本质与盈利模式
LLMjacking（LLM 劫持）是一种新兴的网络攻击形态，攻击者通过扫描互联网上的私有 AI 服务器，将其算力据为己有以谋取经济利益。与传统的 cryptojacking（加密货币挖矿劫持）相比，LLMjacking 的核心区别在于目标资源——不是 CPU/GPU 算力用于挖矿，而是 AI 推理能力用于生成内容。
这种攻击的盈利逻辑清晰：随着 AI API 调用成本持续攀升，企业和个人用户对本地化 AI 解决方案的需求激增。攻击者无需建立自己的 AI 基础设施，只需发现并劫持他人已部署的模型，即可免费使用高质量的 AI 能力。Kaspersky 指出，AI 推理成本的上涨趋势与 cryptojacking 市场 2025 年增长 20% 的数据形成呼应，预示 LLMjacking 即将进入爆发期。

### 攻击链分析：从发现到利用
Kaspersky 的蜜罐实验揭示了一条完整的攻击链。第一阶段是网络发现——Shodan 在服务器上线后 3 小时即完成索引，这意味着任何暴露在互联网上的 AI 服务都会迅速被攻击者定位。第二阶段是能力侦测，攻击者通过访问 `/api/tags`、`/v1/models` 等端点识别服务器上部署的模型类型，通过扫描 `/.cursor/rules` 寻找 AI agent 漏洞，检查 `/.well-known/mcp.json` 获取 MCP 服务器清单。第三阶段才是实际利用，攻击者将目标服务器作为 API 代理调用 Anthropic 等付费模型，或直接使用被劫持的算力执行自有任务。
值得注意的是，LLM-Scanner 这类工具已经实现了工具化和平台化——它从 7 家不同云提供商的 IP 段发起请求，跨越 8 个国家，说明攻击者建立了专业化的基础设施。更值得警惕的是，实验第三周该工具已升级，增加了通过抽象问题区分真实 AI 与蜜罐的能力。

### 为什么传统安全措施失效
攻击者的目标明确——不是获取服务器 root 权限或执行任意代码，而是单纯地耗用 AI 资源。这意味着许多传统安全边界防御体系无法有效检测此类行为。同时，LLMjacking 的攻击者还在系统性地搜索 `_.env_` 文件以获取凭据，这是 Laravel、Node.js 等框架部署中的常见配置错误，尤其在"Vibe Coding"文化盛行的当下极易被利用。

## 实践启示
### 网络层防御
对于单台机器本地运行的 AI 系统（如 LM Studio、Ollama），务必将服务绑定在 localhost 而非所有网络接口，这是最基本也最有效的暴露面收缩措施。 对于需要处理远程请求的服务器，即使运行在企业内部网络，也必须实现 OIDC 或 OAuth2 基础的双向认证，配合短生命周期 token，而不能仅依赖 API key 验证。 网络分段和 IP 白名单应当作为标准配置，仅允许真正需要访问 AI 服务的部门、员工和系统获得授权。

### 身份与访问管理
API key 的保护需要升级到新层面——不仅要防止外部攻击，还要警惕 AI agent 自身的凭据滥用风险。Least Privilege 原则要求 MCP、LLM 等不同组件使用独立分隔的访问 token，而非共享同一套凭据。OIDC/OAuth2 方案之所以被推荐，是因为它支持细粒度的权限控制和活动追踪，能够及时发现异常使用模式。

### 监控与响应
AI 资源消耗监控应当成为日常安全运营的一部分。建立基于角色的使用配额、设置异常流量告警——尤其是来自非预期时间窗口或非预期地理区域的请求。所有 LLM 请求和响应必须记录详细日志，并与 SIEM 系统集成，确保日志本身不被篡改或删除。EDR 安全代理应部署到所有托管 AI 模型的工作站和服务器。

### 部署最佳实践
`.env` 文件绝不能暴露在可公开访问的路径下，这是最基础的 DevOps 安全规范，却也是蜜罐实验中攻击者重点突破的方向。所有客户端-服务器通信必须使用最新版本的 TLS 加密。部署 AI 系统时，默认配置应当保守——优先考虑安全而非便利性，再根据实际业务需求逐步开放必要的功能。

## 相关实体
- [LLM raiders and how to repel them](ch01/602-llm-raiders-and-how-to-repel-them.md)
- [主题导航：网络安全](https://github.com/QianJinGuo/wiki/blob/main/moc/cybersecurity-privacy.md)
- [Autonomous Vulnerability Hunting with MCP](ch01/890-llm.md)
- [LLM raiders and how to repel them](ch04/150-ai.md)
- [Project Glasswing: what Mythos showed us](https://github.com/QianJinGuo/wiki/blob/main/entities/cloudflare-glasswing-mythos-security.md)
- [别让你的 Amazon Bedrock 模型为他人打工——API 调用安全防护指南](ch12/032-amazon-bedrock-api.md)

---

