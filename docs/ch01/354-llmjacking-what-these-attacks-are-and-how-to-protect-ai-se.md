# LLMjacking: what these attacks are, and how to protect AI servers

## Ch01.354 LLMjacking: what these attacks are, and how to protect AI servers

> 📊 Level ⭐⭐ | 13.7KB | `entities/llm-raiders-private-ai-server.md`

# LLMjacking: what these attacks are, and how to protect AI servers
AI security covers more than just data theft prevention, restricting [rogue AI agents](https://www.kaspersky.com/blog/moltbot-enterprise-risk-management/55317/), or stopping assistants from giving harmful advice. A relatively simple but rapidly scaling threat has emerged: attempts to hijack computational power and exploit someone else's neural network for personal gain. This is known as LLMjacking. With AI compute costs widely predicted to [surge dramatically](https://oplexa.com/ai-inference-cost-crisis-2026/), the number of attackers driven by these motives is poised to grow. Consequently, when deploying proprietary AI servers and their supporting ecosystems like [RAG](https://en.wikipedia.org/wiki/Retrieval-augmented_generation) or [MCP](https://en.wikipedia.org/wiki/Model_Context_Protocol), it's critical to establish rigorous security measures from day one.

## Statistics from a honeypot
The speed and scale of these resource-hijacking attempts are best illustrated by an [experiment](https://web.archive.org/web/20260412230759/https:/www.reddit.com/r/ollama/comments/1sff7i0/30_days_of_an_llm_honeypot/?solution=64b4494d52a1506664b4494d52a15066&js_challenge=1&token=*** documented in detail in April 2026. The investigator configured a Raspberry Pi to masquerade as a high-performance private AI server, and made it accessible from the internet. When queried, it reported the availability of Ollama, LM Studio, AutoGPT, LangServe, and text-gen-webui servers — all tools commonly used as wrappers for locally hosted AI models. The server also appeared ready to accept API requests in the OpenAI format, which has become the industry standard.
All these services were seemingly powered by a local instance of Qwen3-Coder 30B Heretic, one of the most powerful open-source models, with its safety alignment removed. To throw in a sweetener, the honeypot reported the presence of various RAG databases and an MCP server with tempting capabilities like *get_credentials *on board.
In reality, the Raspberry Pi was simply hosting 500 pre-saved responses from an actual Qwen3 model, with a lightweight script selecting the most relevant answer for each incoming query. This setup was enough to pass a superficial check while allowing the researcher to probe the attackers' intentions.
According to the author, Shodan, a popular internet scanning service, discovered the server within three hours of its going live. Just one hour later, requests resembling capability reconnaissance began pouring in. Over the following month, the server handled more than 113 000 requests from thousands of unique IPs, with 23% of that traffic specifically targeted at discovering AI capabilities and exploiting local LLMs and AI agents.
Requests to endpoints like */api/tags* and */v1/models* allow attackers to fingerprint which models are hosted on a server, while scanning for */.cursor/rules* typically precedes an attempt to exploit an AI agent. Similarly, checking */.well-known/mcp.json* serves as an inventory of the victim's MCP servers. While the author makes no mention of the total number of attacks that progressed beyond simple scanning, there were 175 active attempts to hijack the LLM during the final week of the experiment alone.

## What are the attackers after?
Based on the researcher's observations, none of those targeting the decoy server attempted to execute arbitrary code or gain root access. (Editorial note: this is surprising and may point to gaps in logging.) Almost all attacks were aimed at siphoning resources. For example, the following activities were logged during the experiment:

- A well-structured attempt to parse technical documentation for a microprocessor
- A prompt to write an erotic novel
- Requests to parse and structure social media text data regarding new vulnerabilities
- An attempt to call Anthropic models using the compromised server as an API proxy
It's worth noting that the reconnaissance of AI resources uses standardized and rapidly evolving tools. Requests from an application named LLM-Scanner originated from the infrastructure of seven different cloud providers across eight countries, suggesting that the raiders have put established methodologies in place, as well as specialized platforms for sharing techniques. By the third week of the experiment, the scanner had been updated with an additional check: it now used simple abstract questions to determine whether it's interacting with live AI or a honeypot returning canned responses.
Among the non-specific attacks, the experiment recorded numerous attempts to exfiltrate credentials from the *.env* file. Attackers systematically hunted for this file across every conceivable directory on the server. Leaving an *.env* file publicly accessible is one of the most elementary mistakes when deploying projects on Laravel, *Node.js*, and other frameworks, yet it remains a common oversight — particularly among beginners and vibe coders. Consequently, attackers have every reason to expect their efforts to pay off.

## Conclusions and defense tips
Scanning publicly accessible servers and attempting to exploit them is nothing new, but the rise of LLMs gives attackers another way to monetize their efforts — one that's both highly lucrative for them and devastating for their victims. To understand how massive these attacks could become, look at their closest counterpart: the cryptojacking market — where criminals mine cryptocurrency using stolen computational resources. That market [grew by 20% in 2025](https://www.economist.com/science-and-technology/2026/04/22/crypto-miners-are-quietly-colonising-computers) alone. As AI-powered solutions proliferate, and as major providers hike subscription costs while local AI chips remain in short supply, we should expect LLMjacking to become an industrial-scale phenomenon.
Key defensive measures for private AI infrastructure

- For AI systems running locally on a single machine, ensure that servers like LM Studio, Ollama, or similar are configured to accept connections only on the local interface (localhost), rather than all available network interfaces. This restricts LLM access to the host machine itself, and prevents the AI from being reachable over the internet.
- For servers handling remote requests — even if the server only operates within a local corporate network — implement [robust authentication and authorization](https://www.kaspersky.com/blog/how-to-benefit-from-identity-security/48399/) rather than relying solely on API key validation. Solutions based on OIDC or OAuth2 with short-lived tokens are the most effective. This not only defends against LLMjacking, but also allows for more granular tracking of user activity, and prevents API key abuse. Furthermore, keys must be protected from more than just external attackers; a growing risk is the [misuse of keys by AI agents](https://www.theregister.com/2026/04/27/cursoropus_agent_snuffs_out_pocketos/) themselves. This applies to LLM interfaces as well as MCP, RAG, and others.
- Use network segmentation and IP allowlists to give AI server access only to the departments, employees, and services that require it.
- Ensure that all client-server connections are secured with a current version of TLS.
- Apply the [principle of least privilege](https://www.kaspersky.com/blog/what-is-the-principle-of-least-privilege/50232/) by separating access to specific services; for instance, MCP and LLM components should have their own distinct access tokens.
- Ensure an [EDR security agent](https://www.kaspersky.com/next-edr-optimum?icid=gl_kdailyplacehold_acq_ona_smm__onl_b2b_kdaily_wpplaceholder_sm-team___knext____3e4d9692a0f54f81) is installed on all workstations and servers, including those hosting AI models.
- Monitor AI resource consumption, establish usage quotas for different employee roles, and set up alerts for anomalous activity spikes.
- Maintain detailed logs of LLM responses and requests made to the model and its supporting tools. Integrate these data sources with [your SIEM](https://www.kaspersky.com/enterprise-security/unified-monitoring-and-analysis-platform?icid=gl_kdailyplacehold_acq_ona_smm__onl_b2b_kasperskydaily_wpplaceholder____). Ensure logs are resilient against tampering or deletion.

## 相关实体
- [Ai Agents Inside Perimeter Hackernews](ch04/069-ai.md)
- [Ai Phishing Attacks Are On The Rise Are You Prepared Bitward](https://github.com/QianJinGuo/wiki/blob/main/entities/AI-phishing-attacks-are-on-the-rise-Are-you-prepared-Bitward.md)
- [Llm Raiders How To Repel](ch04/069-ai.md)
- [我用 Skillmd 做了一个简历生成器](ch04/258-skill.md)
- [Skill Engineering Ai As Algorithm](ch04/258-skill.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/llm-raiders-private-ai-server.md)

## 深度分析

LLMjacking 的攻击经济模型与加密货币挖矿劫持（cryptojacking）高度相似，但潜在收益更高、门槛更低。加密货币价格波动大且挖矿需要持续在线的 GPU 算力，而 LLM API 调用可以即时套利——攻击者直接将受害者服务器作为 API 代理转售，或利用他人已付费的推理资源生成高价值内容（技术文档、数据处理、甚至直接调用受信任提供商的 API 作为中间层）。蜜罐实验显示，仅一个月内就有 113,000+ 次请求，其中 23% 专门针对 AI 能力，说明**扫描和利用 AI 服务器已经成为自动化攻击的标准环节**^。

攻击工具的专业化程度令人警觉。LLM-Scanner 在实验中展现了快速迭代能力——两周内即加入了对抗蜜罐的检测逻辑（用抽象问题区分真实 AI 和预设响应），且请求来自 7 家不同云提供商、横跨 8 个国家。这说明 LLMjacking 已不再是零散的个人行为，而是有组织、有平台的工业化攻击链。与传统 cryptojacking 20% 年增长率相比，AI 推理成本的持续攀升和本地 AI 芯片的短缺使 LLMjacking 的经济动机更为强烈，有充分理由认为其规模将远超前辈^。

端点识别和凭证窃取是攻击链的两大核心环节。攻击者通过 */api/tags*、*/v1/models* 指纹识别服务器模型，通过 */.cursor/rules* 和 */.well-known/mcp.json* 探测 AI Agent 和 MCP 服务器能力——这些端点本质上是在用标准协议暴露内部架构信息。与此同时，对 .env 文件的系统性搜索表明，**最常见的初始突破口仍是基本配置错误**（API 密钥意外公开），而非复杂的 0day 漏洞^。

蜜罐实验的一个重要盲点是：攻击者没有尝试执行任意代码或获取 root 权限。研究者明确承认这可能源于日志记录的缺口。这意味着真实攻击中，LLMjacking 可能只是更大攻击链的第一步——先获取 LLM 访问权，再利用该访问权限进行横向移动或数据外泄。.env 文件中的云服务商密钥、数据库凭证等一旦被获取，攻击者可以立即突破 AI 服务器本身的网络边界^。

RAG 和 MCP 生态的快速普及正在扩大攻击面。RAG 数据库包含了企业私有知识库，MCP 服务器则暴露了工具调用能力（包括 get_credentials 这样的高危操作）。这些组件被蜜罐作为"甜头"展示后，果然招来了大量针对性探测。随着 AI Agent 架构在企业中的部署越来越普遍，**攻击者对 AI 基础设施的理解和利用能力也将同步提升**^。

## 实践启示

1. **默认监听 localhost，切勿将 AI 推理服务暴露在公网**：对于单机器本地 AI 系统（Ollama、LM Studio 等），必须配置为仅接受 localhost 连接，而非所有网络接口。公网可达的 AI 服务器在 Shodan 等扫描引擎中几乎立即被发现——蜜罐上线 3 小时即被索引^。

2. **超越 API Key：部署 OIDC/OAuth2 短令牌认证**：纯 API Key 验证无法防御钥匙滥用（尤其是 AI Agent 自身对密钥的误用），企业级部署应采用 OIDC 或 OAuth2 短生命周期令牌方案，同时实现细粒度的用户活动追踪。LLM 接口、MCP、RAG 组件均适用此原则^。

3. **系统化封堵 .env 等敏感文件暴露**：将 .env 文件公开列为 CI/CD 和部署流程的 P0 检查项，结合自动化扫描工具（如 secret scanner）在构建阶段拦截。LLMjacking 攻击者对 .env 的系统性搜索表明，这是最高效的初始突破口之一^。

4. **MCP 和 LLM 组件使用独立访问令牌并应用最小权限原则**：分别给 MCP 服务器和 LLM 接口分配独立的凭证，限制各自的作用域。攻击者通过 /.well-known/mcp.json 探测 MCP 能力意味着任何 MCP 暴露都是潜在的侦察突破口^。

5. **建立 AI 资源消费监控和异常告警机制**：设定各角色的使用配额，对异常流量峰值（尤其是来自非预期 IP 或 ASN 的请求）实时告警。集成 LLM 请求日志与 SIEM，确保日志本身防篡改。鉴于攻击者已使用 7 家云厂商的基础设施进行扫描，传统的 IP 黑名单效果有限，行为异常检测更为关键^。

---

