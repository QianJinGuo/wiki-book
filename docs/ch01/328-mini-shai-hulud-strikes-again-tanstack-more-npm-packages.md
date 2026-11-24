# Mini Shai-Hulud Strikes Again: TanStack + more npm Packages Compromised

> 📊 Level ⭐⭐⭐ | 5.9KB

## 核心要点
- 2026年5月11日，TeamPCP 发动协同供应链攻击，同时入侵 npm 和 PyPI 生态系统
- 受影响命名空间：@tanstack（含 @tanstack/react-router，1200万周下载量）、@uipath、@mistralai
- 攻击通过劫持 CI/CD 发布系统和 OpenID Connect 令牌分发恶意包更新
- 5月13日分析发现 @uipath/ 和 @mistralai/ 包中的 payload 存在 bug 导致恶意功能失效

## 深度分析
### TanStack 攻击链：fork → pull_request_target → 缓存投毒 → OIDC 窃取

攻击者全程未窃取 npm 凭据：先 fork `TanStack/router` 并重命名为 `zblgg/configuration` 逃避 fork 名单检索，再以 PR 触发 `pull_request_target` workflow 执行 fork 代码、向 GitHub Actions 缓存投毒恶意 pnpm store；待合法 PR 合入 main 触发发布 workflow 恢复被投毒缓存后，从 runner 进程内存（`/proc/<pid>/mem`）直接提取 OIDC 令牌并发布恶意版本（见 [TanStack 官方 postmortem](https://github.com/QianJinGuo/wiki-public/blob/main/entities/postmortem-tanstack-npm-supply-chain-compromise-tanstack-blog.md)）。

### 双感染向量与蠕虫式横向扩散

恶意包有两条感染路径：`optionalDependencies` 指向孤儿 commit `github:tanstack/router#79ac49eedf...`，经 `prepare` 脚本执行；以及 tarball 内直接嵌入约 2.3MB 混淆文件 `router_init.js`。@uipath 系列则用 `preinstall: node setup.mjs` 下载 Bun 运行时执行 payload——与此前 SAP 攻击同投递机制、同 C2（见 [TeamPCP 开源 Shai-Hulud 蠕虫](https://github.com/QianJinGuo/wiki-public/blob/main/entities/malware-crew-teampcp-opensources-its-shaihulud-worm-on.md)）。payload 是凭据窃取器 + 自传播蠕虫：窃取 CI/CD 令牌（GitHub Actions OIDC/GitLab/CircleCI）、云凭据（AWS IMDSv2/GCP/Azure）、Kubernetes service account、Vault 与注册表令牌，并以被盗令牌发布受害者有写权限的其他包的投毒版本。

### 三重冗余 C2 与 gh-token-monitor 自毁守护

凭据外传走三条冗余通道：typosquat 域 `git-tanstack.com`、去中心化 Session 网络（`*.getsession.org`，抗 takedown，为本轮新增）以及 GitHub API dead drop（以 "Shai-Hulud: Here We Go Again" 为仓库描述）。对满足严格条件的 GitHub 令牌（repo scope、公开 profile、org 成员等），malware 安装持久化 `gh-token-monitor` 守护进程（LaunchAgent/systemd），每 60 秒轮询，令牌被撤销（40X）即执行删除用户主目录的自毁命令，24 小时后自动退出——响应必须先清除守护进程再轮换令牌，顺序颠倒会引爆 wiper。

### 原有 Shai-Hulud 防御为何部分失效

既有防御主要围绕可疑版本扫描与 provenance 校验，但发布经由受害者自身合法的 OIDC trusted publishing 管道完成，令牌轮换与来源检查难以在发布前拦截。 攻击横跨 npm + PyPI：Python 侧 `guardrails-ai@0.10.1`/`mistralai@2.4.6` 仅 13 行下载器代码，拉取未混淆的模块化窃取器 `transformers.pyz`，首次窃取 1Password/Bitwarden 密码库；payload 含俄语环境 kill switch。检测指标：包根目录的 `router_init.js`/`setup.mjs`、`.claude/` 与 `.vscode/` 中 npm uninstall 后残留的 `router_runtime.js`/`tanstack_runner.js`、`gh-token-monitor` 服务名，并在 DNS/proxy 层封禁 `git-tanstack.com` 与 `*.getsession.org`。5月13日更新确认 @uipath/* 与 @mistralai/* 的 payload 因 bug 失效，但修复版 payload 已被观测到处于预置状态。

## 实践启示
1. **供应链审计**：重新审视对 npm/PyPI 生态的依赖深度，实施依赖锁定策略
2. **CI/CD 安全**：加强 OpenID Connect 令牌的颁发和轮换机制防护
3. **包验证**：对关键依赖包实施签名验证，而非仅依赖包管理器的基本检查
4. **内部镜像**：建立内部包镜像进行安全扫描，而非直接依赖官方仓库
5. **凭据管理**：最小权限原则 + 定期轮换 + MFA，保护 CI/CD 环境中的所有凭据
## 相关实体
- [Postmortem Tanstack Npm Supply Chain Compromise Tanstack Blog](https://github.com/QianJinGuo/wiki-public/blob/main/entities/postmortem-tanstack-npm-supply-chain-compromise-tanstack-blog.md)
- [Npm Supply Chain Compromise Postmortem](https://github.com/QianJinGuo/wiki-public/blob/main/entities/npm-supply-chain-compromise-postmortem.md)
- [Teampcp Claims Sale Of Mistral Ai Repositories Amid Mini Shai Hulud Attack 1](https://github.com/QianJinGuo/wiki-public/blob/main/entities/teampcp-claims-sale-of-mistral-ai-repositories-amid-mini-shai-hulud-attack-1.md)
- [Cybersecurityreach Revoke Token Wipe Computer](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cybersecurityreach-revoke-token-wipe-computer.md)
- [Thehackernews Fake Openai Privacy Filter](https://github.com/QianJinGuo/wiki-public/blob/main/entities/thehackernews-fake-openai-privacy-filter.md)

→ [原文存档](https://www.wiz.io/blog/mini-shai-hulud-strikes-again-tanstack-more-npm-packages-compromised)

---

