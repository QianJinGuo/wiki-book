# 让 Amazon Quick 操作飞书：构建远程 MCP 服务的设计实践

> 📊 Level ⭐⭐⭐ | 7.6KB

→ [原文存档](https://aws.amazon.com/cn/blogs/china/amazon-quick-build-mcp-service-design-practice/)

## 摘要

Amazon Quick 没有内置飞书集成，但远程 MCP Connector 允许团队自行补齐：把 lark-cli 的 200+ 命令与 20+ 业务域 Skill 指南封装为标准 MCP 协议，用 Bedrock AgentCore 托管成全员共用的远程服务，以「管理员部署一次、授权即用」替掉「每人各装一套本地 CLI」。全文落在三条可复用的设计决策：4 个 Meta Tool 的按需编排、Tier1/Tier2 分层注册、OAuth 2.0 PKCE + HMAC 域分离签名。

## 核心要点

- 200+ 工具全量注册意味着数万 token 固定上下文开销，且让模型「选择困难」拉低准确率；最终只注册 32 个（28 Tier1 + 4 Meta）。
- 4 个 Meta Tool 是入口：`lark_list_skills` 列业务域、`lark_get_skill` 加载编排指南、`lark_discover` 搜索 Tier2 工具、`lark_invoke` 统一执行。
- Skill 编排指南按需加载、不占固定上下文，把参数格式、调用顺序与前置约束显式化，让 AI 不靠猜。
- Tier1 是 28 个高频工具（IM/Calendar/Docs/Base/Drive/Task/Contact/Sheets/Mail），Tier2 是 200+ 低频工具，不用时零 context 占用。
- Tier1 入选判据：调用频率、作为多步操作「积木」的编排必要性、无需 discover 即可理解用途的独立性。
- 安全为五层：OAuth 2.0 PKCE、根密钥 HKDF 派生的 3 个 HMAC 签名密钥域分离、Secrets Manager 加密存储 + SigV4 内网传输、Write-Probe 预检保护一次性 refresh_token、日志脱敏。
- 选 Bedrock AgentCore 的决定性理由是 Scale-to-Zero：空闲零成本、免容器编排、秒级就绪，且与 Quick 同生态免协议适配；10/100/500 人月成本 <$10/$50/$250。

## 深度分析

### 200+ 工具的上下文预算困局与 Meta Tool 的按需编排

MCP 的工具定义本身就是上下文负载：每个工具的 name、description 与 parameters schema 平均占用数百 token。200+ 工具全量注册意味着数万 token 的固定开销，既挤占推理窗口，又让模型在过长候选列表里「选择困难」而降低调用准确率——这是任何大规模 MCP 服务都会撞上的通用瓶颈。

解法是把「工具空间」从静态注册表改造成可检索的运行时资源：只留少量 Meta Tool 作入口，工具发现变成一次显式检索调用，其余定义不进固定 prompt。以「约产品评审会」为例，加载 calendar / contact / task 三份指南后，Tier1 直调（解析参会人、查忙闲、建日程）与「先 `lark_discover` 找到时段推荐接口、再 `lark_invoke` 执行」的 Tier2 路径交替出现——「时间模糊时先调推荐接口」这类约束只存在于指南里，工具名堆叠永远编码不了它。

### Tier1/Tier2 分层注册：可用性与上下文效率的折中

分层注册的实质是一道上下文预算算术题：约 15% 直注册、85% 按需加载是经验比例，但判据比比例更重要。三条判据里杠杆最大的是「编排必要性」——`contact_search_user` 必须直注册，因为它几乎是所有涉及人的多步操作的前置积木；退到 Tier2 则每一步都多一次 discover 往返，token 与时延同时被放大。Tier2 的「不用时零 context 占用」也有代价：搜索结果差就直接导致调用失败，高频路径必须有 Tier1 兜底。这与渐进式披露同源：先给索引，再按需取全文。

### OAuth 2.0 PKCE + HMAC 域分离签名：Token 安全的分层防御

PKCE 解决授权码截获：客户端生成随机 `code_verifier` 并算出 SHA-256 的 `code_challenge`，授权请求只带 challenge（仅 S256），换 Token 时必须同时提供 verifier 与 `client_secret`，服务端重算比对。两层互补——`client_secret` 验证客户端身份，PKCE 把授权码绑定到发起会话，授权码被截获也换不出 Token。

域分离签名解决跨域伪造：从一个根密钥经 HKDF 派生 stateKey / tokenKey / incrKey 三个独立 HMAC-SHA256 密钥，分别签 OAuth state（5 分钟）、MCP Token（30 天）与增量授权 Token（短期）。收益双重：某类 Token 的签名被攻破也无法跨域伪造另一类；轮换根密钥即可让全部已签发 MCP Token 立即失效，把「紧急吊销」降级为单点密钥操作。Write-Probe 预检则针对飞书 refresh_token 一次性消耗：刷新前先读回写验证写权限，成功才真正刷新，失败则跳过、Token 保持未消耗；并发侧由 EventBridge 定时触发、DynamoDB 条件写加锁避免 TOCTOU 竞态。

### Bedrock AgentCore 选型、部署与成本

对比自建容器编排（ECS/EKS），AgentCore 给的是空闲零成本（无请求自动回收，无需自配 Scale-to-Zero）、免运维（不必写 Task Definition 与 Scaling Policy）和秒级就绪。决定性因素是负载形态而非功能多寡——MCP 服务请求稀疏、对响应时间不敏感，托管运行时省下的编排复杂度远超自建的控制力，且它与 Quick 同属 Bedrock 生态，天然支持 MCP Connector 接入。部署脚本同样可借鉴：双语引导、预填默认值、配置记忆、CDK 幂等、一键销毁，约 10 分钟产出 MCP Endpoint、OAuth 回调地址与 CloudWatch Dashboard。成本也清爽：主要开支是每用户一个 Secrets Manager Secret（$0.40/个/月），AgentCore 按实际使用计费，多数组件有免费额度。

## 实践启示

1. **工具规模超出上下文预算时，先建「工具目录 + 检索」而非继续堆工具定义**：只把 discover / invoke 做成入口工具，其余退到运行时发现面。
2. **让编排指南承载业务约束，而非让模型从工具描述反推调用顺序**：参数格式、前置条件、分支规则写进 Skill，按需加载。
3. **Tier1 名单按「编排依赖」而非「业务重要性」排**：高频或几乎每步前置的工具直注册，让高频路径零 discover 往返。
4. **第三方 Token 用域分离签名 + 根密钥轮换**：HKDF 从同一根密钥派生各类 Token 的独立签名密钥，使跨域伪造与紧急吊销都退化为单点操作。
5. **对一次性 refresh_token 加 Write-Probe 预检与分布式锁**：先验证写权限再消耗，定时触发 + 条件写避免并发竞态丢 Token。

## 相关实体

- [amazon quick + cisco webex mcp 会议准备与跟进助手：meeting-lifecycle m](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-quick-cisco-webex-mcp-meeting-prep-followup-assistant.md)
- [Anthropic MCP 再审视：tool search 与代码编排](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-mcp-revisited-tool-search-code-orchestration.md)
- [Model Context Protocol](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-context-protocol-mcp.md)

---

