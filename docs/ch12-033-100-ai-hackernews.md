# 100万+AI服务暴露在公网——HackerNews扫描报告

## Ch12.033 100万+AI服务暴露在公网——HackerNews扫描报告

> 📊 Level ⭐⭐ | 10.4KB | `entities/1-million-exposed-ai-services-hackernews.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/1-million-exposed-ai-services-hackernews.md)

# We Scanned 1 Million Exposed AI Services. Here's How Bad the Security Situation Is
**Source:** https://thehackernews.com/2026/05/we-scanned-1-million-exposed-ai.html
**Summary:** (from LLM review)
> Score: 8×8=64 | strong
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/1-million-exposed-ai-services-hackernews.md)

## 相关实体
- [Your AI Agents Are Already Inside the Perimeter. Do You Know Who They Are?](/ch04-095-your-ai-agents-are-already-inside-the-perimeter-do-you-know/)

- MOC
## 深度分析

本次安全扫描揭示了 AI 基础设施安全的严峻现状，其严重程度远超传统软件应用。Intruder 团队通过证书透明度日志扫描了超过 200 万台主机，发现约 100 万个暴露的 AI 服务，发现的结果令人警醒。

### 核心发现概览

| 发现类别 | 严重程度 | 影响 |
|---------|---------|------|
| Ollama API 无认证暴露 | 31% (5200+中) | 免费滥用付费模型 |
| Flowise/n8n 暴露实例 | 90+ 政府/金融/营销机构 | 业务逻辑和凭据泄露 |
| OpenUI 聊天机器人暴露 | 多个企业实例 | 对话历史完全可读 |
| API 密钥明文泄露 | 在 Claude 驱动机器人中发现 | 付费账户被接管 |
| 任意代码执行漏洞 | 实验室数天内发现 | 服务器完全沦陷 |

### 无认证部署成默认选项

许多开源 AI 项目默认不启用认证功能，这直接导致了大量用户数据和企业工具暴露在公网环境下。 研究团队发现的典型案例包括：

- **基于 OpenUI 的聊天机器人**：完整暴露了用户与 LLM 的对话历史，在企业环境中聊天记录可能包含敏感商业信息
- **Claude 驱动机器人**：某些实例不仅暴露对话，还以明文形式泄露了 API 密钥，攻击者可借此完全接管付费账户
- **多模态聊天机器人**：托管包括多模态 LLM 在内的各种模型，任何人都可以滥用他人基础设施进行越狱攻击

越狱攻击不再是理论威胁——人们正在寻找创意方式滥用公司聊天机器人，以访问更有能力的模型而不支付费用或将被请求记录到自己的账户。

### Ollama API 大规模暴露

在 5200 多台响应请求的 Ollama 服务器中，31% 无需认证即可访问，其中 518 台正在包装使用 Anthropic、Deepseek、Moonshot、Google 和 OpenAI 的前沿模型。 这意味着攻击者可以：

- 免费使用他人付费模型的计算资源
- 绕过所有使用限制和日志记录
- 隐藏真实身份进行恶意操作

Ollama 本身不存储消息，所以没有直接的对话数据暴露风险。但这些实例中许多在包装来自 Anthropic、Deepseek、Moonshot、Google 和 OpenAI 的付费前沿模型。

> [!related] 相关漏洞
> [Bleeding Llama](/ch12-013-bleeding-llama-critical-unauthenticated-memory-leak-in-ollam/) (CVE-2026-7482, CVSS 9.1) 揭示了 Ollama 的更深层问题——不仅默认无认证，还存在未认证内存泄漏漏洞，可导致整个进程堆内存被窃取。300,000+ 台暴露的 Ollama 服务器面临严重威胁。

### Agent 管理平台漏洞

n8n 和 Flowise 等工作流自动化平台在暴露后造成的危害尤为严重，因为这些平台通常连接着丰富的第三方凭据和敏感系统。

**典型案例**：

- 某 Flowise 实例暴露了整个 LLM 聊天服务的完整业务逻辑
- 存储的凭据列表被暴露（虽然 Flowise 加固后不会向未认证访客显示存储值，但攻击者仍可利用连接这些凭据的工具窃取敏感信息）
- 暴露了互联网解析工具和危险的本地功能（如文件写入和代码解释），使服务器端代码执行成为现实可能性

研究人员在实验室环境中仅用几天就发现了某热门 AI 项目中存在任意代码执行漏洞。

### 安全设计缺陷的系统性

被扫描的 AI 应用普遍存在以下问题：

1. **不安全默认配置**：开箱即用，无任何安全防护
2. **Docker 设置错误**：容器配置不当，可被利用
3. **硬编码凭据**：嵌入在设置示例和 docker-compose 文件中
4. **以 root 权限运行应用**：提升攻击成功后的破坏程度
5. **新安装即无认证直接获得完全管理权限**：安装后立即拥有最高权限

当这些配置错误与代码解释等高权限工具结合时，攻击半径显著扩大。如果沙箱薄弱且基础设施不位于 DMZ 中，爆炸半径会大幅增加。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/2026.md)

## 实践启示

### 立即行动项

1. **身份验证强制化**：确保所有自托管 LLM 基础设施、Ollama API、n8n、Flowise 等平台在部署时强制启用身份验证，切勿依赖默认无认证状态。即使是内部网络服务，也应假设最终会暴露。

2. **网络隔离与 DMZ 部署**：将 AI 代理工具部署在隔离网络中，避免与核心业务系统直接连通。对外暴露的服务应经过严格的安全边界控制。使用网络分段确保即使 AI 服务被攻破，攻击者也无法横向移动。

3. **凭据管理审计**：立即审计所有 AI 平台中存储的第三方凭据，移除不必要的集成，对必须保留的凭据实施最小权限原则。优先检查 Flowise、n8n 等工作流平台的凭据存储。

4. **容器运行时安全**：避免以 root 权限运行容器，实施严格的 Docker 安全配置（用户命名空间、只读根文件系统、最小特权 seccomp 配置文件），定期扫描镜像中的漏洞和硬编码凭据。

5. **Ollama 专项加固**：如果使用 Ollama，确保其不直接暴露在公网，或配置适当的网络访问控制。检查是否有 31% 的无认证 Ollama 服务器暴露问题影响你的部署。

### 战略建议

AI 采用速度远超安全实践成熟的现状短期内不会改变。组织需要在 AI 项目的快速交付与安全基础之间建立平衡机制：

| 阶段 | 安全动作 |
|------|---------|
| 概念验证阶段 | 即引入安全评审，评估认证和访问控制需求 |
| 开发阶段 | 使用基础设施即代码（IaC）确保安全配置可复现 |
| 部署阶段 | 使用基线工具（如 Intruder）进行外部暴露面扫描 |
| 运营阶段 | 建立 AI 基础设施的安全基线标准，定期审计 |

所有这些措施的成本远低于数据泄露或系统被入侵后的损失。

### 漏洞响应优先级

| 优先级 | 漏洞类型 | 响应时间 |
|-------|---------|---------|
| P0 | 无认证的 AI 服务暴露公网 | 立即修复 |
| P1 | 使用 root 权限运行容器 | 24小时内 |
| P2 | API 密钥或凭据硬编码 | 1周内 |
| P3 | 不安全的默认配置 | 1个月内 |

> [!attention] 关键洞察
> 过去几十年软件行业在安全交付产品方面取得了真正进展，但 AI 疯狂的采用速度正在将这一进展置于风险之中。企业在快速部署自托管 LLM 基础设施，但速度正在以牺牲安全为代价。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/2026.md)

---

