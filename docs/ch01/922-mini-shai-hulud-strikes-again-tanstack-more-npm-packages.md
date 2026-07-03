# Mini Shai-Hulud Strikes Again: TanStack + more npm Packages Compromised

## Ch01.922 Mini Shai-Hulud Strikes Again: TanStack + more npm Packages Compromised

> 📊 Level ⭐⭐ | 3.8KB | `entities/www-wiz-io-mini-shai-hulud-strikes-again-tanstack-more-npm-packages-compromised.md`

## 核心要点
- 2026年5月11日，TeamPCP 发动协同供应链攻击，同时入侵 npm 和 PyPI 生态系统
- 受影响命名空间：@tanstack（含 @tanstack/react-router，1200万周下载量）、@uipath、@mistralai
- 攻击通过劫持 CI/CD 发布系统和 OpenID Connect 令牌分发恶意包更新
- 5月13日分析发现 @uipath/ 和 @mistralai/ 包中的 payload 存在 bug 导致恶意功能失效

## 深度分析
Mini Shai-Hulud 攻击标志着 AI 开源生态系统的供应链攻击进入新阶段。与传统恶意包主要针对开发者工作站不同，此次攻击的深度和广度表明攻击者正在将目标扩展到更广泛的企业基础设施。

**攻击技术特征**：

- 利用 CI/CD 发布系统的合法发布机制分发恶意更新
- 劫持 OpenID Connect 令牌绕过身份验证
- 跨平台攻击（npm + PyPI 同时进行）
- 多命名空间协同攻击（TanStack、UiPath、Mistral AI）

**受影响包的重要性**：

- `@tanstack/react-router` 是 React 生态最流行的路由库之一
- `@mistralai/mistralai` 是 Mistral AI 官方 TypeScript 客户端
- `@uipath/apollo-core` 服务于企业自动化平台

**payload 技术细节**：恶意代码在包更新时执行，搜索 AWS/GCP/Azure/GitHub 凭据，有效凭据用于发布更多恶意包更新，无效凭据时执行本地环境擦除。

## 实践启示
1. **供应链审计**：重新审视对 npm/PyPI 生态的依赖深度，实施依赖锁定策略
2. **CI/CD 安全**：加强 OpenID Connect 令牌的颁发和轮换机制防护
3. **包验证**：对关键依赖包实施签名验证，而非仅依赖包管理器的基本检查
4. **内部镜像**：建立内部包镜像进行安全扫描，而非直接依赖官方仓库
5. **凭据管理**：最小权限原则 + 定期轮换 + MFA，保护 CI/CD 环境中的所有凭据
## 相关实体
- [Postmortem Tanstack Npm Supply Chain Compromise Tanstack Blog](ch04/150-ai.md)
- [Npm Supply Chain Compromise Postmortem](ch04/150-ai.md)
- [Teampcp Claims Sale Of Mistral Ai Repositories Amid Mini Shai Hulud Attack 1](ch04/150-ai.md)
- [Cybersecurityreach Revoke Token Wipe Computer](ch12/003-token.md)
- [Thehackernews Fake Openai Privacy Filter](ch04/150-ai.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/www-wiz-io-mini-shai-hulud-strikes-again-tanstack-more-npm-packages-compromised.md)
-

---

