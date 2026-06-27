# Postmortem: TanStack npm supply-chain compromise | TanStack Blog

## Ch12.032 Postmortem: TanStack npm supply-chain compromise | TanStack Blog

> 📊 Level ⭐⭐ | 10.5KB | `entities/postmortem-tanstack-npm-supply-chain-compromise-tanstack-blog.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/postmortem-tanstack-npm-supply-chain-compromise-tanstack-blog.md)

## 相关实体
- [rigged-game-scarcruft-compromises-gaming-platform-supply-chain-attack](/ch01-559-rigged-game-scarcruft-compromises-gaming-platform-supply-cha/)
- [Semis Memo: Supply Chain Inheritance](/ch01-473-semis-memo-supply-chain-inheritance/)
- [Amazon launches Supply Chain Services for businesses of all sizes](/ch11-210-amazon-launches-supply-chain-services-for-businesses-of-all/)
- [Semis Memo: Supply Chain Inheritance](/ch01-485-semis-memo-supply-chain-inheritance/)
- [semgrep intercom php supply chain](/ch12-100-semgrep-intercom-php-supply-chain/)

- MOC
## 深度分析
这起事件是一个三漏洞链式攻击的典型案例，其杀伤力在于每两个漏洞之间的"信任桥接"。攻击者没有使用任何零日漏洞，而是将三个已知攻击面组合：pull_request_target 的 Pwn Request 模式、GitHub Actions 缓存污染跨信任边界、运行时内存提取 OIDC Token。整个攻击从准备到执行历时约 26 小时，84 个恶意版本在 6 分钟内发布到 42 个 TanStack npm 包。
**第一层漏洞：pull_request_target 的信任假设错误。** `bundle-size.yml` 使用 `pull_request_target` 触发器处理 fork PR，并在该上下文中检出 fork 的 PR-merge ref 执行构建。这是一个长期已知危险的模式——pull_request_target 在 base repo 的信任上下文中运行，而非 fork 的隔离环境。workflow 作者尝试了信任拆分（comment-pr 与 benchmark-pr 分离），意图让 benchmark-pr "不信任、只读权限"，但这个拆分有两个致命缺陷：首先，`actions/cache@v5` 的 post-job 保存不受 `permissions: contents: read` 限制——缓存写入使用 runner 内部 Token 而非 workflow GITHUB_TOKEN；其次，缓存作用域是按 repo 的，pull_request_target runs 与 push to main 共享同一个缓存命名空间，fork PR 写入的缓存条目可被 main 分支的后续 workflow 读取。这两个缺陷使得攻击者可以在 fork 中写入恶意内容，污染 main 分支 workflow 将要使用的缓存。
**第二层漏洞：OIDC Trusted Publisher 的权限边界模糊。** TanStack 使用 npm OIDC trusted publisher 绑定——一旦配置，workflow 中任何代码路径都可以通过 `id-token: write` 权限获取 mint OIDC Token 的能力，直接 POST 到 registry.npmjs.org 完成发布。release.yml 声明 `id-token: write` 是为了合法需求（npm OIDC trusted publishing），但恶意代码在 test/cleanup 阶段通过内存提取获得 Token 后，绕过了 workflow 中定义的 Publish Packages 步骤（该步骤因测试失败被跳过），直接以合法身份发布到 npm。OIDC trusted publisher 的设计假设是"workflow 定义了发布边界"，但实际上它只绑定了"哪个 repo 可以发布"，而非"哪个 workflow step 可以发布"。这是一个根本性的架构盲点。
**第三层漏洞：内存中 OIDC Token 的运行时提取。** 恶意 payload 通过 `/proc/*/cmdline` 定位 GitHub Actions Runner.Worker 进程，读取其 `/proc/<pid>/maps` 和 `/proc/<pid>/mem` 来 dump 进程内存，提取 runner 懒加载到内存中的 OIDC Token。这是 tj-actions/changed-files 事件（2025 年 3 月）中已公开使用的技术，攻击者没有发明新的攻击手法，而是直接复用公开研究成果（包括代码中的 attribution comment），这反而使 IOC 匹配更快。
**三个漏洞为何缺一不可。** pull_request_target 单独使用是安全的（适合 labeling、comments 等可信操作）；缓存污染单独使用需要独立的发布载体；OIDC Token 内存提取单独需要已有的 runner 代码执行权限。只有当三个漏洞串联时，攻击链才完整：fork PR 代码 → 污染 base repo 缓存 → base repo workflow 恢复污染缓存并触发恶意代码 → 恶意代码从 runner 内存提取 OIDC Token → 以合法身份向 npm 发布。这个链条揭示了供应链攻击的核心特征：攻击者不是在寻找一个入口，而是在寻找信任边界的桥接点。
**攻击者的策略选择揭示了威胁模型的真实边界。** 攻击者使用了"干扰检测"策略：恶意 payload 故意破坏测试，使 publish 步骤被跳过（而不是失败后继续），这导致发布看起来是"测试失败后的残留"，而非"成功的隐蔽发布"。但这个策略反而成为双刃剑——测试失败触发了 workflow 的 failure 状态，更快地引起了维护者注意。更精心设计的攻击（保持测试通过、静默发布）可能会持续更长时间才被发现。攻击者还选择了 self-propagation 逻辑——枚举受害者维护的其他包并重新发布相同 injection，这意味着如果任何一位维护者的机器被入侵，攻击会自动扩散到其所有的包。这种"自动播种"策略极大化了攻击面，但也增加了被检测的概率。
**外部检测 vs 内部监控的结构性缺失。** 事件被外部安全研究员 ashishkurmi（StepSecurity）在发布后约 20 分钟发现，TanStack 团队是通过第三方通知才得知被攻击。这意味着：内部没有任何针对异常发布的监控、没有任何针对 OIDC Token 使用异常的告警、没有对 npm publish 行为的基线分析。这不是技术问题，而是优先级问题——大多数开源项目将有限资源投入功能开发，安全监控往往依赖第三方生态。这种结构性弱点在供应链攻击中被反复利用，因为攻击者知道开源项目的运营资源通常不足以支撑全面的安全监控。

## 实践启示
**GitHub Actions 缓存策略的重审。** 任何使用 `actions/cache` 的 workflow 都需要回答：缓存键是否跨信任边界可被污染？`pull_request_target` trigger 是否在相同缓存作用域中执行构建？Adnan Khan 2024 年记录了缓存 poisoning 攻击的完整技术细节，建议所有使用 GitHub Actions 缓存的项目进行专项审计：检查缓存键是否包含用户可控输入、确认哪些 workflow 有写缓存权限、验证 cache scope 隔离是否与 trust boundary 一致。最直接的缓解是避免在 `pull_request_target` 上下文中使用共享缓存，或使用独立、隔离的缓存存储。
**OIDC Trusted Publisher 的正确使用方式。** OIDC trusted publisher 的设计初衷是减少长期凭证的使用，但其"无限制发布"特性需要被重新审视。TanStack 事件揭示的盲点是：OIDC token mint 权限一旦授予，整个 workflow 的任何步骤都可以使用它，而不仅仅是定义的 Publish Packages 步骤。缓解策略：短期方案是增加 per-publish review 机制（manual classic token + 人工审核）；长期方案是推进 npm provenance verification，从 registry 层面验证 publish 确实来自预期的 workflow step 而非绕过步骤。对于拥有大量 maintainer 的 npm scope，应考虑将 OIDC 权限收窄到最小必要范围，并增加异常发布检测。
**第三方 Action 引用的固化。** TanStack 事件中 `actions/checkout@v6.0.2` 和 `TanStack/config/.github/setup@main` 等浮动版本引用是潜在的供应链风险点。浮动引用（@main、@v6.0.2）意味着每次执行都可能拉取不同内容，除非有 lock 文件或 SHA  pinning。GitHub Security Lab 的"Keeping your GitHub Actions and workflows secure"指南建议：所有第三方 Action 引用应固定到具体 SHA，浮动引用应视为安全债务并优先偿还。对于闭源或不受信任的第三方 Action，这一点尤为重要。
**开源项目的自我防护：npm token 隔离与机器安全。** 攻击者的 self-propagation 逻辑意味着：即使 npm token 未被盗，如果任一 maintainer 的机器被入侵，攻击可以自动扩散到其所有包。防御纵深需要：npm token 不存在于任何长期开机的 CI/CD 机器上，使用 OIDC 代替；CI/CD 环境与开发机器使用不同的凭证；定期轮换所有可达生产环境的凭证（AWS、GCP、Kubernetes、Vault、GitHub、npm、SSH）；CI/CD 环境网络隔离，限制对 Oxen/Session 等文件上传网络的访问。
**应急响应流程的建立。** TanStack 事件的响应并非从零开始——维护者之间的跨时区协调、第三方安全社区的及时通知、npm security 的 engagement 都较为顺畅。但暴露的缺口是：没有内部告警意味着响应窗口被人为拉长。开源项目应提前准备：建立安全响应联系人列表、知道如何联系主流 registry 安全团队、有针对异常发布的监控或依赖第三方监控服务、准备好 Incident 复盘模板以加速响应后分析。这次事件中 TanStack 的"开放问题"（如缓存是否实际被污染、npm cache 状态等）正是复盘模板驱动下快速识别待确认事项的体现。
**npm unpublish 政策的现实约束。** 事件期间 TanStack 无法直接 unpublish 受影响版本，因为 npm 的"no unpublish if dependents exist"政策——这意味着即使知道自己被攻击，维护者也只能 deprecate 版本（添加警告）而无法删除 tarball，只能等待 npm security 从 registry 端拉取。这是一个生态系统级别的政策权衡：一方面防止 arbitrary unpublish 破坏依赖链，另一方面在安全事件时阻碍快速响应。了解这个约束意味着：当真正需要快速响应时，必须同时联系 registry 安全团队，而非仅靠 local deprecation。

---

