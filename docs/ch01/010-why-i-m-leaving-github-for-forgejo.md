# Why I'm leaving GitHub for Forgejo

## Ch01.010 Why I'm leaving GitHub for Forgejo

> 📊 Level ⭐ | 12.2KB | `entities/why-im-leaving-github-for-forgejo.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/why-im-leaving-github-for-forgejo.md)

## 核心要点
- 作者 Jorijn Schrijvershof（荷兰 DevOps 顾问）将代码从 GitHub 迁移至自托管 Forgejo 实例（code.jorijn.com）
- 核心原因并非 outages，而是**平台所有权归属的深层变化**：GitHub 自 2025 年 8 月并入微软 CoreAI 部门，不再独立运营
- 2026 年 4 月 GitHub 将 Copilot Free/Pro/Pro+ 用户交互数据默认用于 AI 训练（opt-out 模式），无仓库级别控制
- 美国法律管辖权风险（FISA Section 702 + CLOUD Act）无法通过「欧盟数据驻留」解决
- 荷兰政府于 2026 年 4 月 27 日上线 code.overheid.nl（基于 Forgejo），成为机构层面的印证案例
- Forgejo 优势：完全开源（无 open-core 分叉）、GPLv3+ 许可（非 MIT）、由德国非营利 Codeberg e.V. 治理
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/why-im-leaving-github-for-forgejo.md)

## 相关实体

- [Why Internally-Built AI Fails Fund Accounting Audits](ch01/128-why-internally-built-ai-fails-fund-accounting-audits.html)
- [How Superset built the IDE for AI agents on Vercel](ch01/071-how-superset-built-the-ide-for-ai-agents-on-vercel.html)
- [Tether launches developer grants program for local-first AI and payments infrastructure](../ch11/202-tether-launches-developer-grants-program-for-local-first-ai.html)

## 深度分析
### 事件时间线：从独立公司到微软 AI 部门
GitHub 的独立性丧失并非一夜之间发生，而是有清晰的时间线 ：

- **2018 年**：微软以 75 亿美元收购 GitHub，但初期保持相对独立运营
- **2025 年 8 月 11 日**：CEO Thomas Dohmke 离职，微软未填补该职位，而是将 GitHub 整合进 CoreAI 部门
- **2025 年 1 月**：微软 CEO Satya Nadella 公开介绍 CoreAI 的使命——构建面向第一方和第三方客户的端到端 Copilot 和 AI 技术栈
- **2026 年 4 月 24 日**：GitHub 将 Copilot Free/Pro/Pro+ 用户交互数据默认用于模型训练，生效
这一时间线揭示了「微软收购 GitHub」故事的第二章：初期（2018-2024）的独立运营叙事已失效，GitHub 现为微软 AI 战略的基础设施组件。这意味着用户协议、数据使用政策和产品路线图现在由微软 CoreAI 而非独立 GitHub 团队决定 。

### outages 是症状，不是病因
作者特别强调 April 2026 两次重大 outages 并非其离开的根本原因 。这一区分至关重要：
**2026 年 4 月 23 日事故**（merge queue 静默回退了 658 个仓库的 2092 个 PR）：根本原因是 feature flag rollout 不完整，属于工程管理问题，而非 AI 负载直接导致。
**2026 年 4 月 27 日事故**（Elasticsearch 过载导致 PR/Issues/Packages 离线 6+ 小时）：作者援引 GitHub CTO Vlad Fedorov 的公开声明——容量需要扩大 30 倍才能跟上 AI 驱动的工作负载增长 。
关键洞察：GitHub 自身将可靠性问题归因于「agentic AI workflow 增长」（自 2025 年 12 月起），而 GitLab、Bitbucket、Vercel、Linear、Sentry 在同一时期并未经历同等规模的故障。这说明 GitHub 的问题具有特殊性，而非行业整体现象 。

### Copilot 训练数据政策：结构性问题
2026 年 3 月 25 日 GitHub 宣布的隐私政策变更具有三层深远影响 ：
**第一层：默认 consent 的翻转**。从 opt-in 到 opt-out 是根本性的改变。意味着每个 Copilot Free/Pro/Pro+ 用户现在都在默认情况下为 GitHub 的模型训练提供数据，必须主动关闭才能退出。这与 GitHub 先前的隐私承诺形成了明显的叙事断裂。
**第二层：无仓库级别控制**。作为仓库 maintainer，作者无法代表所有 contributors 选择退出。每个协作者必须单独在其账户设置中关闭训练。这意味着即使用严格的许可证（如 AGPL）声明代码权利，代码仍可能在用户使用 Copilot 交互过程中成为训练素材。
**第三层：私有仓库的边界模糊**。GitHub 声明不使用「at rest」的私有仓库内容进行训练，但明确收集「使用 Copilot 时生成的 code snippets 和 interaction context」。这两者之间的边界在实际操作中难以界定 。

### 法律管辖权：FISA 702 + CLOUD Act 的不可解除性
这是整个迁移论证中最具说服力、也最少被公开讨论的层面 ：
**FISA Section 702**（美国《外国情报监视法》第 702 条）：授权美国情报机构针对非美国人的电子通信进行收集，只要服务提供商设在美国。GitHub Inc. 和 Microsoft Corp. 均受此约束，无论数据物理存储在何处。2026 年 4 月该条款处于 45 天延期状态，国会正在争论长期续期方案。
**CLOUD Act 2018**（《澄清境外数据合法使用法》）：允许美国执法机构强制美国公司提供其控制的全球任何位置的数据，无论数据存储在哪个国家。
作者援引的关键证据：微软自己的律师在法国参议院听证会上（2025 年 6 月）宣誓表示，他无法保证存储在欧洲微软数据中心的法国数据可以免受美国政府的秘密访问 。
这意味着「欧盟数据驻留」功能（如 GitHub Enterprise Cloud 的 EU 数据 residency）只能解决数据物理存储位置问题，无法解决法律管辖权问题。CLOUD Act 的适用范围跟随公司控制权，而非数据地理位置。

### 荷兰政府的背书：从个人选择到机构决策
2026 年 4 月 27 日荷兰内政部上线 code.overheid.nl，选择 Forgejo 而非 GitLab 的决定具有多重信号价值 ：
**法律驱动**：荷兰「Open, tenzij」政策（2020 年生效）要求用公共资金开发的软件默认开源，以满足代码所有权和可控性要求。code.overheid.nl 是该政策的具体执行。
**平台选择逻辑**：荷兰政府明确选择 Forgejo 而非 GitLab EE 的理由：
1. Forgejo 完全开源，无 open-core 分叉，所有功能都在 GPLv3+ 许可下
2. GitLab 是 open-core 模式，许多生产级功能位于 Enterprise 付费层
3. Forgejo 的路线图与政府需求「way more aligned」
**先例效应**：一个拥有专业法务团队的国家机构做出了与作者相同的判断，这本身就是对「离开 GitHub 是极端行为」这一质疑的有力反驳 。

### Forgejo 技术评估：v15 LTS 的成熟度
Forgejo v15.0 LTS（2026 年 4 月 16 日发布）是该项目的第 100 个版本，LTS 支持期至 2027 年 7 月 15 日 。关键能力评估：
**Forgejo Actions**：作者迁移的核心驱动力之一。v15 版本达到了其所需的成熟度（ephemeral runners、OpenID Connect、reusable workflow expansion）。需要注意的兼容性问题包括：GitHub Actions 的 `permissions:` 块在 Forgejo 中被静默忽略；`actions/checkout@v6` 在非 GitHub runner 上破坏了认证 checkout（已通过降级到 v5 解决）；OIDC 使用不同的配置键名。
**治理模式**：Forgejo 由 Codeberg e.V.（德国柏林注册的非营利组织，2018 年 9 月成立）运营，成员投票批准年度预算，2025 年计划以 88 票赞成、0 票反对、1 票弃权通过 。这种治理透明度对于关注平台长期可持续性的用户是重要参考。
**商业支持缺口**：作者坦诚指出，Forgejo 缺乏类似 Red Hat 的企业级商业支持。瑞士的 Codey（VSHN 产品，19 CHF/月起）是目前最成熟的托管商业产品 。对于需要 24/7 供应商 SLA 的大型组织，这仍是真实障碍。

## 实践启示
### 自托管 Forgejo 的技术架构建议
作者提供的 homelab 架构（单 Intel NUC + 64GB RAM）对于个人开发者和小型团队具有参考价值 ：
```
Docker 层：Forgejo v15 LTS + Postgres 17 + Traefik
隔离层：Incus 管理的 KVM 虚拟机（运行 Actions runner）
安全层：nftables egress filter（限制 runner 可访问的目标）
```
**Runner 隔离的必要性**（最重要）：CI job 会执行 `npm install`/`pip install`，这本质上是在运行来自依赖生态的未信任代码。KVM 虚拟机提供了独立内核保护，gVisor 作为 Docker 运行时进一步拦截系统调用，nftables 限制 runner 只能访问特定端口和目标网段（不能扫描 LAN）。
**每周破坏性重建**（Monday 02:00 UTC）是防止持久化威胁的关键设计：每次重建后 runner 都是干净的，即便某次构建被污染，7 天后自动消除。

### 迁移决策框架
如果正在考虑是否迁移，可以按以下维度评估 ：
**应该迁移的信号**

- 你的代码有法律/合规要求需要数据主权（如 GDPR、荷兰 Open, tenzij 政策）
- 你对 GitHub 的 Copilot 训练数据政策有根本性异议
- 你对微软作为 GitHub 上游控制者的信任已经动摇
- 你的工作流不重度依赖 GitHub-specific 功能（GitHub Apps marketplace、Codespaces、Copilot Workspace、Advanced Security）
**不应该迁移的信号**

- 团队完全没有运维基础设施能力和意愿（可以考虑 Codey 或 Codeberg 托管方案）
- 工作流重度依赖 GitHub 特有功能
- contributor 生态高度依赖 GitHub 社交图谱（可用「归档 + README 跳转」策略缓解）
- 没有为 runner 安全运维准备好投入时间

### runner 安全配置的优先顺序
作者提出的 5 层防御顺序（从软到硬）是 CI 安全设计的优秀参考 ：
1. **KVM 虚拟机隔离**：保护宿主内核不被 job 环境共享
2. **gVisor 用户空间系统调用拦截**：防止容器逃逸
3. **每周破坏性重建**：限制恶意工件的存活窗口
4. **nftables egress 过滤**：防止被入侵的 runner 成为横向攻击跳板
5. **scope-bound runner tokens**：限制令牌泄露的爆炸半径

### GitHub Actions → Forgejo Actions 迁移 checklist
| 兼容性项 | 状态 | 解决方案 |
|---------|------|---------|
| `permissions:` workflow-level | 静默忽略 | 移除或移至 job-level |
| `actions/checkout@v6` | 非 GitHub runner 认证问题 | 降级至 v5 |
| `actions/upload-artifact@v4` | 需要 Forgejo 分支 | 使用 forgejo 版本 |
| OIDC `permissions: id-token: write` | 不同的 key | 使用 `enable-openid-connect: true` |
| Dependabot | 不兼容 | 使用 Renovate（3 小时 schedule）替代 |

### 保持 GitHub 作为镜像的策略
对于仍有 GitHub 曝光需求的开发者，作者建议「GitHub 归档 + 跳转」策略 ：
1. 将 GitHub 仓库设为只读/归档状态
2. 在 README 中添加指向新 Forgejo 实例的链接
3. GitHub 仍作为发现路径（贡献者通过 GitHub 搜索找到项目，然后跳转到 canonical 位置）
这是一种务实的折中：在保持社区可发现性的同时，将 canonical 代码控制权转移至自托管平台。

## 关联追踪
本篇内容与以下实体构成关联阅读：

-  — AI 实施与企业合规风险
-  — 开发者平台与 AI 工具链
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/why-im-leaving-github-for-forgejo.md) — Jorijn Schrijvershof 个人博客，2026-05-08 发布

---

