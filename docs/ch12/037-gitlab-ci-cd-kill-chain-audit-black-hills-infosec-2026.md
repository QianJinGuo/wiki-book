# GitLab CI/CD Kill Chain Audit — Black Hills InfoSec 2026 大规模审计研究

## Ch12.037 GitLab CI/CD Kill Chain Audit — Black Hills InfoSec 2026 大规模审计研究

> 📊 Level ⭐⭐ | 9.7KB | `entities/auditing-gitlab-cicd-kill-chain-black-hills-2026.md`

# GitLab CI/CD Kill Chain Audit — Black Hills InfoSec 2026 大规模审计研究

> **背景**：本文基于 Black Hills Info Security 在 2026-06-03 发布的大规模 GitLab CI/CD 审计研究整理。3,757 个开源项目、1,580 个 HIGH 级别漏洞、kill chain 框架系统化分类。补充现有 [Jenkins 供应链攻击](/ch01-313-checkmarx-jenkins-plugin-compromised-in-new-supply-chain-att/) 等的 CI/CD 攻击面覆盖。

## 研究规模与方法

Black Hills Info Security 在 2026-06-03 发布的审计研究是 GitLab 生态**最大规模的第三方安全审计**之一：

| 指标 | 数值 | 备注 |
|------|------|------|
| 审计项目 | 3,757 | GitLab.com 公开项目 |
| HIGH 漏洞 | 1,580 | 42% 项目含至少 1 个 HIGH |
| CRITICAL | 87 | 2.3% |
| 涉及 .gitlab-ci.yml | 91% | 几乎所有项目都有 CI 配置 |
| CI 变量泄漏 | 34% | 误设 masked |
| 平均漏洞/项目 | 0.42 | |

**审计流程**：资产发现 (GitLab API) → 配置审计 (.gitlab-ci.yml + CI 变量 + runner) → 漏洞关联 (CWE/CVE) → PoC 验证 (top 100) → kill chain 分类报告。

## Kill Chain 4 阶段

### Stage 1 — Reconnaissance（侦察）

- **公开项目扫描**：GitLab.com API 全量枚举，无需认证
- **CI 变量泄漏**：masked variables 仍可被引用，部分项目 secrets 误设为公开
- **Runner 信息暴露**：自托管 runner 暴露内部网络拓扑（hostnames、IP 段）

### Stage 2 — Initial Access（初始访问）

- **恶意 .gitlab-ci.yml PR**：attacker 提 PR 修改 CI 脚本 → maintainer merge → CI 阶段执行恶意 payload
- **CI 镜像供应链**：CI 镜像被植入后门（参考 [xz utils、event-stream 模式](/ch01-313-checkmarx-jenkins-plugin-compromised-in-new-supply-chain-att/)）
- **可执行 artifact 滥用**：CI 产物被下载执行而非仅拉取

### Stage 3 — Privilege Escalation（权限提升）

- **CI_JOB_TOKEN 滥用**：默认权限可访问仓库 API，scope 过宽
- **Protected branch race**：旧 GitLab < 16.8 存在 race condition 可绕过保护
- **Maintainer token 持久化**：merge 后 attacker 控制的 PAT 仍有效

### Stage 4 — Exfiltration（数据外泄）

- **Artifact 阶段 SSRF**：CI 镜像 SSRF 漏洞泄露云 metadata（AWS IMDS、GCP metadata server）
- **Pipeline-as-code 注入**：动态生成 .gitlab-ci.yml 时可注入 payload

## 与现有 wiki 实体的差异化

| 维度 | GitLab CI/CD Kill Chain | checkmarx-jenkins-plugin | llmreaper-dom-based-ai-exfiltration |
|------|-------------------------|--------------------------|-----------------------------------|
| **目标** | GitLab CI/CD | Jenkins plugin | LLM 浏览器扩展 |
| **规模** | 3,757 项目 / 1,580 漏洞 | 单个 plugin | DOM-level 攻击 |
| **方法** | 第三方黑盒审计 | plugin 漏洞复现 | exfiltration technique |
| **Kill chain** | 4 阶段完整 | 单一利用链 | DOM 注入单点 |
| **可推广** | 通用 CI/CD 模式 | Jenkins 特定 | 浏览器扩展特定 |

**结论**：3 个实体形成 **CI/CD 攻击面 + 浏览器 AI 攻击面** 的双维度覆盖。本文填补 **GitLab 第三方规模化审计** 这一空白。

## 实践启示（Actionable）

1. **CI/CD 是 2026 主要攻击面**：从 web app 转移到 CI/CD 流水线，必须用 kill chain 框架审计
2. **CI_JOB_TOKEN 最小权限**：默认 scope 过大，需 explicit 限定
3. **.gitlab-ci.yml PR 强制审核**：required reviewers + CI linter + protected branch
4. **CI 镜像版本锁定 + SBOM**：避免供应链植入
5. **黑盒审计 + SAST/SCA 纵深防御**：Black Hills 给出黑盒视角，配合内部 SAST 形成覆盖

## 三个独有贡献（不应合并到现有 entity）

1. **3,757 项目 / 1,580 漏洞的规模化数据** — 单次研究中最大规模
2. **Kill chain 4 阶段分类法** — recon / initial access / privilege escalation / exfiltration 完整框架
3. **CI_JOB_TOKEN 滥用 + Protected branch race** — 两个独立的 zero-day 级别发现

## 上线状态 / 链接

- 原文: https://www.blackhillsinfosec.com/auditing-gitlab-the-ci-cd-kill-chain/
- 作者: Phil Miller (Black Hills Info Security, 4 年安全顾问)
- 发布: 2026-06-03
- 系列: Black Hills "Web Cast" 红队研究系列

## 深度分析

1. **42% 项目含 HIGH 漏洞是系统性危机的信号**：1,580 个 HIGH 漏洞分布在 3,757 个项目中，意味着 CI/CD 配置错误的概率远高于传统应用安全认知。这个比例不是孤立的异常值，而是"流水线即代码"范式下，安全验收与 CI 配置之间存在结构性脱节的直接体现

2. **CI_JOB_TOKEN 的默认权限模型是架构级设计缺陷**：默认 token 可访问仓库 API 的设计，在 2026 年已是已知的过度授权模式。Black Hills 的发现表明，attacker 一旦获得任意 CI job 的执行权，即可通过 token 横向移动至整个仓库——这与"最小权限"安全原则的根本性背离，CI 系统设计者需重新审视 token scope 的默认边界

3. **Public API 枚举让侦察阶段几乎零成本**：GitLab.com 公开项目无需认证即可全量枚举，意味着 kill chain 的第一阶段对攻击者而言没有任何门槛。防守方的"隐蔽安全"假设在 CI/CD 环境中完全不成立——任何公开仓库本质上都是潜在攻击面

4. **CI 镜像供应链是规模化攻击的最优路径**：xz utils 和 event-stream 模式已证明开源依赖供应链可被植入后门。Black Hills 研究进一步揭示，CI 镜像作为 CI/CD 流水线的核心交付物，其信任链跨越了构建系统、测试环境与生产部署——一旦镜像被污染，kill chain 的 Initial Access 与 Privilege Escalation 阶段可以无缝衔接

5. **Protected branch race condition 暴露了 CI/CD 时序安全性盲区**：旧版 GitLab < 16.8 的 protected branch race condition 说明，CI/CD 系统中的分支保护机制不仅是配置问题，更是并发时序安全性问题。这类漏洞的存在表明，流水线控制面的安全性需要与应用代码安全性同等的重视程度

## 实践启示

1. **强制 CI/CD 安全 Linting 进入 CI 流水线自身**：Black Hills 的审计方法论本身就是防御武器——将 `.gitlab-ci.yml` 的安全规则检查（CI linter）集成到 pre-commit 或 pre-merge 阶段，可在攻击者提交恶意 PR 之前拦截危险的配置模式

2. **CI_JOB_TOKEN 最小权限化是零信任在流水线层的落地**：将 token scope 设置为 explicit 限定（如只允许拉取特定 artifact），配合 token 自动过期机制，可将 CI_JOB_TOKEN 滥用的攻击面从"全仓库 API"压缩到"单次 job 所需最小范围"

3. **CI 镜像供应链必须纳入 SBOM 管理**：对所有 CI 镜像进行版本锁定 + SBOM 生成，配合镜像签名验证（如 Cosign），可检测供应链篡改。与应用程序 SBOM 不同，CI 镜像 SBOM 还需覆盖基础层依赖的传递闭包

4. **构建内部威胁模型时必须将 CI/CD 流水线纳入攻击树**：Black Hills 的 kill chain 框架可直接作为红队评估的 checklist——每条 CI/CD 攻击路径（recon → initial access → privilege escalation → exfiltration）都应有对应的检测与缓解控制点

5. **黑盒外部审计与 SAST/SCA 形成纵深覆盖**：Black Hills 的第三方黑盒视角弥补了内部工具的盲区。建议每季度引入一次外部 CI/CD 安全审计，配合内部 SAST（.gitlab-ci.yml 配置检查）与 SCA（CI 依赖分析），形成内外双层防线

## 原文存档

## 相关实体

- [bagel — fleet 级 secret scanning 守护开发工作站](/ch12-049-bagel-fleet-级-secret-scanning-守护开发工作站/)
- MOC
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/auditing-gitlab-cicd-kill-chain-black-hills-2026.md)

---

