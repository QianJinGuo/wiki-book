# Why Use App-Level Auth When Every Database Has Auth? (Splunk CVE-2026-20253)

> 📊 Level ⭐⭐⭐ | 8.1KB

## 相关实体
- [microsoft is quietly shopping for an openai replacement](https://github.com/QianJinGuo/wiki-public/blob/main/entities/microsoft-is-quietly-shopping-for-an-openai-replac.md)
- [vietnam to develop domestic cloud](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vietnamtodevelopdomesticcloud.md)
- [akamai acquires israeli ai browser security startup layerx f](https://github.com/QianJinGuo/wiki-public/blob/main/entities/akamai-acquires-israeli-ai-browser-security-startup-layerx-for-205-million-in-ca.md)

→ [原文存档](https://labs.watchtowr.com/why-use-app-level-auth-when-every-database-has-auth-splunk-enterprise-cve-2026-20253-pre-auth-rce/)

## 核心要点

1. **Pre-auth RCE via Splunk Enterprise search companion — CVE-2026-20253** — Splunk's `splunkd` management port (8089) exposed Python code paths (search assistant, deployment client) that didn't enforce app-level auth context. An unauthenticated attacker could trigger code execution by sending crafted JSON RPC calls.
2. **The systemic anti-pattern: 'database has auth, so app can skip it'** — Many enterprise apps assume the underlying DB authenticates connections, so they don't re-validate user identity at the app layer. The Splunk CVE shows this is wrong: an attacker can issue RPC calls that bypass the DB layer entirely, hitting the app's internal API directly.
3. **watchtowr's research methodology** — Black-box recon of Splunk Enterprise 9.x instances, mapping management endpoints, finding ones that returned data without proper auth context. Identified `/services/search/parser` and `/services/deploymentserver` as pre-auth reachable.
4. **Defense pattern: 'trust boundary is the function, not the connection'** — Every function that touches user data should re-authenticate. Don't rely on the transport layer (TLS), the network layer (VPN), or the data layer (DB auth) to enforce identity. The app's own function entry point is the only reliable boundary.

## 深度分析

### 纵深防御：为什么「数据库有认证」不等于「应用可以裸奔」

纵深防御（defense in depth）的核心主张是：**任何单层防线都应被视为可能失效，身份验证必须在每一个信任边界上重新执行**。CVE-2026-20253 的完整利用链恰好是对这一原则的反向论证——链路上每一层都假设「上一层已经完成了认证」，结果没有任何一层真正做了：

- PostgreSQL sidecar 假设「只有主应用会通过 loopback 调用我」，于是接受任意凭证；
- 主 Web 应用的 `/en-US/splunkd/__raw/` 代理路径假设「能到达这里的请求都经过了 session 认证」，于是把请求体原样转发给内部端点；
- `pg_dump`/`pg_restore` 假设「调用方传来的 `-U` 用户与连接参数是可信的」，于是认证相关参数完全由攻击者控制。

三层「别人会管认证」的假设叠加之后，一个 `Authorization: Basic :`（空凭证）请求就能触发任意文件写入。正如原文要点所述，**信任边界是函数入口，而不是连接**：网络层（loopback 绑定）、传输层（TLS）、数据层（DB auth）都不能替代在函数入口处重新验证调用者身份。[Agent 安全架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-architecture.md)中「认证前置到每个工具/函数调用」的原则与此完全同构。

### 应用层认证 vs 数据库层认证：两种威胁模型的差异

| 维度 | 数据库层认证 | 应用层认证 |
| --- | --- | --- |
| 防御对象 | 直接连接数据库端口的网络调用者 | 能触达应用任意 HTTP/RPC 入口的调用者 |
| 隐含假设 | 调用者就是应用本身，请求语义可信 | 不做假设，逐请求验证身份与权限 |
| 典型失守方式 | SSRF / 代理路径绕过网络边界 | 越权访问、会话伪造 |

关键差异在于**可达性**：数据库层认证只在「攻击者能直接连上 DB 端口」的前提下有效。一旦应用暴露了一个能把外部请求转发到内部服务的代理端点（本例中的 `__raw` 路径），数据库认证就在请求链路上被完全跳过——攻击者从未直接连过 5435 端口，却执行了数据库操作。[威胁模型](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-threat-models.md)分析中把这称为「间接可达面」：为直接调用设计的认证，对经过合法入口转发进来的调用不设防。

### 实际边界情况：内部服务间的信任何时可以成立

实践中不可能给每个内部 RPC 都配一套独立用户体系，关键是区分「可以简化的场景」与「必须完整的场景」：

- **可以简化**：服务间调用存在独立的网络隔离（独立 VPC / 网络命名空间 + 防火墙规则），且不存在任何能把外部请求转发到该端点的应用路径。此时「服务身份（mTLS / service account）+ 网络策略」的组合是可接受的。
- **必须完整**：内部端点存在「由外部请求参数驱动」的路径——本例中 `database`、`backupFile` 两个参数都直接来自 HTTP 请求体。参数可控即边界可控，此时入口必须做认证 + 参数白名单。
- **loopback 不是边界**：watchTowr 的经验法则是「localhost only 往往不是真的 localhost only」。本机可达面包括同主机其他进程、SSRF、以及本例这种应用自带的代理路径。`ss -tupln` 显示监听 127.0.0.1 只说明「默认配置下不可直接远程利用」，不能作为安全边界写进设计文档。
- **凭证文件是隐形的信任放大器**：`.pgpass` 文件加上连接字符串里可注入的 `passfile` 参数，让攻击者借用系统自带的合法凭证通过了认证。任何「凭证明文落盘 + 凭证路径可被参数指定」的组合，都会把局部漏洞放大为全局认证绕过。

### 小原语的组合放大：从任意文件写到 RCE

这个 CVE 的另一层教训是**原语的组合价值远大于单体价值**。单独看，链路上每一环都不起眼：

1. 接受空凭证的 `/backup` 端点 → 只能创建空文件，看起来像 DoS 级漏洞；
2. `dbname` 实为连接字符串 → 可让 `pg_dump` 连到攻击者数据库，但 dump 文件无法直接执行；
3. `/restore` 端点 → `pg_restore` 重放 SQL，配合 `lo_export` 才获得受控文件写入；
4. 覆盖 Splunk 高频执行的 Python 脚本 → 最终 RCE。

CVSS 9.8 的评分针对的是这条组合链的终点，而非任何单个环节。防守侧的推论是：**评估漏洞严重性时不要按「最直接可利用的效果」打分，而要按「与相邻原语组合后的上限」打分**——文件系统写入是几乎所有 RCE 链的必经枢纽，这也是 advisory 里轻描淡写的 "file creation and truncation" 实际值 9.8 分的原因。同类「低危原语组合成高危链」的案例可参见 [youre building agent security in the wrong order](https://github.com/QianJinGuo/wiki-public/blob/main/entities/youre-building-agent-security-in-the-wrong-order.md)。

## 实战启示

- **生产级实施建议**：基于上述要点，构建可落地的实施方案
- **风险评估**：在采用前评估安全/性能/成本 trade-off
- **参考架构**：借鉴同领域最佳实践，避免常见陷阱

## 上线状态 / 链接

- **原文链接**: https://labs.watchtowr.com/why-use-app-level-auth-when-every-database-has-auth-splunk-enterprise-cve-2026-20253-pre-auth-rce/
- **作者/平台**: newsletter
- **类型**: newsletter / 行业分析

---

