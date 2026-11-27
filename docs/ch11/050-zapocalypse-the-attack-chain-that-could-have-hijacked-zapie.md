# Zapocalypse: The Attack Chain That Could Have Hijacked Zapier

> 📊 Level ⭐⭐⭐ | 11.0KB

→ [原文存档](http://www.token.security/blog/zapocalypse-the-attack-chain-that-could-have-hijacked-zapier)

## 深度分析

Token Security 研究团队从 Zapier 免费版 "Code by Zapier" 的沙箱化 Python 代码块出发，走通了一条五步攻击链，终点是拿到 `zapier-design-system` —— 一个向每个已认证 Zapier 用户浏览器分发 JavaScript 的私有 NPM 包 —— 的发布权限。发布一个篡改版本即可让攻击者的 JavaScript 在所有已认证会话中执行，造成全平台账号接管（ATO）。没有零日、没有新原语：五个已知模式组合成链，**链本身就是漏洞**。

关键影响边界（框架性区分，贯穿全文）：被劫持的已认证会话能让攻击者**以用户身份在 Zapier 内部行事**——创建 Zaps、Tables、MCP server，并借平台调用该用户已有的第三方连接；但它**不会**泄露所连服务的原始 OAuth token 或 API 凭据——那些凭据在服务端，永远不进浏览器。最坏影响是 Zapier 平台级 ATO，而非对每个第三方服务的 1:1 接管。

### 攻击链总览：五个已知原语的组合

| # | 阶段 | 原语 |
| --- | --- | --- |
| 1 | 沙箱侦察 | `os.system` 在 "Code by Zapier" 内可用 |
| 2 | 凭据复活 | STS token "孤儿化" 在 Lambda 堆里，经 `/proc/self/mem` 抓回 |
| 3 | 横向移动 | 名叫 `allow_nothing_role` 的角色实际允许 ECR 枚举与镜像拉取 |
| 4 | 秘密猎取 | 高权限 NPM token 泄漏在容器构建元数据里 |
| 5 | 供应链触达 | 发布权直达加载于 zapier.com 的 design-system 包 |

选题逻辑：AI 相邻、非超大规模厂商（披露周期以周计）、产品自带代码执行面（攻击代码是被邀请进来的）、近期无公开 CVE。决定性信号是 n8n——Code 节点 2025 年内四个沙箱逃逸 CVE，"这不是 n8n 的问题，是品类的问题"，而 Zapier 无人看过。杠杆：8000+ 第三方集成、百万级用户。

### Stage 1–2：沙箱逃逸与 "`del` 不是删除"

"Code by Zapier" 允许在 Zap 里写任意 Python。第一戳 `import os; os.system('env')` 直接成功：环境变量暴露这是 AWS Lambda（python3.11、us-east-1），且环境中没有 AWS 凭据。读取磁盘上的 `lambda_function.py` 揭示了架构与态度：用户代码被喂进 `exec()`，运行在**刚持有过 AWS 凭据的同一进程**里；凭据被 `del os.environ[k]` 抹掉，旁边注释直言这是为避免烦人的误报，"安全靠 allow_nothing role"。

这里 baked 了两个假设，双双被击破。其一：`del os.environ[k]` 只调 libc `unsetenv` 并移除 mapping 条目、递减引用计数，**不会覆写字节**——CPython 小字符串驻留、堆 arena、Lambda runtime 缓冲区都没有清零；且 Lambda 容器 warm-start 跨多次调用复用，连**之前调用者**的 STS token 都可能还在堆里。利用只是 `/proc/self/maps` + `/proc/self/mem` 加四条正则（`AKIA|ASIA` 前缀、`AWS_SECRET_ACCESS_KEY=`、`AWS_SESSION_TOKEN=`、AWS 会话 token 的 `IQoJ` 锚点）。四条全部命中，恢复出的凭据调 `sts get-caller-identity` 确认活着，归属 `allow_nothing_role`。

### Stage 3：`allow_nothing_role` 允许了不少

拿到凭据不等于拿到权限。用 enumerate-iam 暴力枚举只读 API 面：`ecr.describe_repositories`、`dynamodb.describe_endpoints`、`sts.get_caller_identity`、`iam.get_account_password_policy` 全部可用。ECR 读权限在手：列出 **1111 个私有仓库**。但 `ecr:GetAuthorizationToken` 被拒——没有它就没有 `docker login`，前门锁死。攻击者绕过 Docker：`docker pull` 底层只是 `BatchGetImage` 取 manifest、`GetDownloadUrlForLayer` 拿每层预签 S3 URL、HTTPS 下载 gzip tarball 再重组——他们写脚本直调这些 API，**不碰任何 Docker runtime**，围绕 Docker 的运行时传感器、镜像扫描钩子、registry 侧 `GetAuthorizationToken` 审计全都看不见。

首拉 `zapier` monorepo 生产镜像跑 secrets-scanner 无可利用收获；1111 个仓库按 `imagePushedAt` 降序（新鲜推送未轮换概率高）+ LLM 按仓库名排序（`deploy/ci/infra/tools/mcp/litellm` 类名靠前）分诊，两个仓库各交出一个秘密。

**3b — LiteLLM 容器与创始人邮箱**。Zapier ECR 里有 LiteLLM 的私有定制构建，源码 `mcp_server_manager.py` 的 docstring 里硬编码着一个 `sk-ak-…` token——Zapier Actions MCP API key，认证的是**特定 Zapier 用户**。用它对 `actions.zapier.com` 做 MCP 握手立即拿到有效会话：身份是 **LiteLLM 联合创始人**，会话列出 `gmail_send_email`、`edit_actions`、`add_actions` 三个工具。PoC 用创始人 Gmail 真实发出了可控正文的邮件——DMARC/DKIM 天然通过，这不是域名仿冒，是**真邮箱发出的真邮件**，一种新型钓鱼原语。

**3c — 藏在容器元数据里的 NPM token**。第二个仓推送于被抓取前约一小时。秘密不在文件系统，而在**镜像 config blob 的 `history[]`**：构建步骤 `ARG NPM_TOKEN=…`/`ENV NPM_TOKEN=…` 会被序列化进 config history，任何有 `BatchGetImage` 权限的人都可见。这是一枚 NPM 发布 token（GitLab CI 用于发布私有 `@zapier/*` 包），NPM API 元数据：`"action": "write"` + `"scope.name": null` + `"bypass_2fa": true`——可发布该账号一切包、无 MFA 门槛。可发布清单横跨公开的 `zapier-platform-core`（每个集成开发者的 SDK）、`zapier-platform-cli`，与私有的 `zapier-design-system`。

### Stage 4–5：一次 postinstall 与认证源内的 stored XSS

有了发布权，Node 供应链攻击很短：`package.json` 加一个 `postinstall` 钩子，`npm install` 自动执行、无提示无审查，把安装环境（开发者笔记本、CI runner、生产构建机）的 `TOKEN/KEY/SECRET/PASS/AWS_` 环境变量发往攻击者。爆炸半径等于所有对这个私有 registry 跑 `npm install @zapier/*` 的地方。研究团队**没有发布任何东西**，仅经 NPM API 确认发布能力即止。

Stage 5 证明的是**触达**而非利用：DevTools 确认 `zapier-design-system-9.25.1.js` 加载于每个已认证页面。向该包发布一版即可让代码在 zapier.com 自源内、无跨域限制地进入每个已认证会话——stored XSS。从源内出发，可达影响是该 UI/API 面给登录用户的一切（创建 Zaps/Tables/MCP server、驱动已有连接执行服务端动作），但拿不到底层 OAuth token。最坏情形：全平台 ATO，乘数是每个用户、每个会话、只隔一个发布版本。

### 披露时间线：快速响应的正面样本

- **2026-02-10** 研究开始；**02-12 23:02 UTC** HackerOne 报告 #3552705 提交。
- **02-13 01:14 UTC** Zapier 致谢并索取源 IP；**02-16** 部署 ECR deny 策略、吊销 NPM token，报告重分类为 "Incorrect Default Permissions" 并进入 Triaged。
- **02-26** 赏金按项目上限 **$3,000** 支付；**03-05** 修复确认到位；**05-05** fwd:cloudsec 议程页公开；**06-01** 演讲 + 本文。
- 四天内分诊、三周内修复、全程善意协作——在一个常惩罚披露计划的行业里值得点名表扬。

## 实践启示

1. **沙箱逃逸是默认而非例外**：产品跑用户代码就假设攻击者能逃出沙箱；防御层是沙箱**周围的爆炸半径**，不是沙箱本身。
2. **`del os.environ[k]` 不是删除，堆会记住**：唯一安全模式是让不可信代码运行在**从未见过凭据的不同进程**里；事后清理是卫生不是防御。
3. **IAM 名字会撒谎**：`allow_nothing_role` 允许了不少。审计每个被假定角色的**已解析权限**（每条附加策略、inline 语句、Allow 动作），用真实权限验证而非命名约定。
4. **容器镜像两条泄密路径**：构建期 `ARG`/`ENV` 序列化进 config history；硬编码凭据烤进层文件系统——两者对任何有 `BatchGetImage` 的人可见。用 BuildKit secret mount（`--mount=type=secret`）喂构建凭据，并像扫源码仓库一样扫镜像。
5. **供应链卫生是双向的**：发布侧 `bypass_2fa: true` + null scope = 距事故一个 token；NPM token 收窄到单包并激进轮换。消费侧用 `npm ci` 锁定校验、审计进入认证源的新版本、记住 `postinstall` 在每次 install 无提示执行发布者的任意代码。
6. **出口监控闭环**：整条链从 Zapier 网络外打进来且无任何告警——对执行环境出站流量的网络层检测本可在 ECR 枚举变成 1111 仓库下载前报警；沙箱若能直连自家 ECR/AWS API/NPM registry，就是被丢在地上的检测机会。

## 关联

- [Npm Supply Chain Compromise Postmortem](https://github.com/QianJinGuo/wiki-public/blob/main/entities/npm-supply-chain-compromise-postmortem.md)
- [Litellm Supply Chain Poisoning Higress Wasm Sandbox 2026 10 23](https://github.com/QianJinGuo/wiki-public/blob/main/entities/litellm-supply-chain-poisoning-higress-wasm-sandbox-2026-10-23.md)
- [Checkmarx Jenkins Plugin Compromised In New Supply Chain Attack](https://github.com/QianJinGuo/wiki-public/blob/main/entities/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack.md)
- [Ico South Staffordshire Cl0P Ransomware Fine](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ico-south-staffordshire-cl0p-ransomware-fine.md)
- [Agent Sandbox](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-sandbox.md)
- [Agent Security Threat Models](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-threat-models.md)
- [构建无服务器Kiro调度平台用Kiro Cli Eventbridge Ecs Fargate实现定时Ai任务](https://github.com/QianJinGuo/wiki-public/blob/main/entities/构建无服务器kiro调度平台用kiro-cli-eventbridge-ecs-fargate实现定时ai任务.md)（同为 Lambda/IAM 侧的实践面）

---

