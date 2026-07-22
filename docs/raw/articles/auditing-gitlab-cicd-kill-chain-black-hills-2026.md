---
title: "Auditing GitLab: The CI/CD Kill Chain"
source: rss
source_url: https://www.blackhillsinfosec.com/auditing-gitlab-the-ci-cd-kill-chain/
ingested: 2026-06-09
sha256: pending
author: Phil Miller (Black Hills Information Security)
tags: [security, gitlab, ci-cd, supply-chain, audit, kill-chain, devsecops]
type: article
review_value: 8
review_confidence: 9
review_recommendation: strong
review_stars: 4
---

# Auditing GitLab: The CI/CD Kill Chain

> 原文存档：Black Hills InfoSec 2026-06-03 发布，规模化 GitLab CI/CD 安全审计实战案例。

## 核心定位

Black Hills Info Security 在 2026-06-03 发布的大规模 GitLab CI/CD 审计研究——对 **3,757 个开源 GitLab 项目**做安全审计，发现 **1,580 个 HIGH 级别漏洞**。本文用"kill chain"框架（recon → initial access → privilege escalation → exfiltration）系统化地展示 CI/CD 攻击面与防御方法。

## 攻击面分类

### 1. Reconnaissance
- **公开项目扫描**：GitLab.com 公开项目可通过 API 列目录
- **CI/CD 变量泄漏**：部分项目误将 secrets 设为 masked 但仍可读
- **Runner 注册信息暴露**：自托管 runner 暴露内部网络拓扑

### 2. Initial Access
- **恶意 .gitlab-ci.yml PR**：攻击者提 PR 修改 CI 脚本，maintainer merge 后触发
- **依赖供应链**：CI 镜像被植入后门（参考 xz utils、event-stream 模式）
- **可执行 artifact 滥用**：CI 产物被执行而非仅下载

### 3. Privilege Escalation
- **CI_JOB_TOKEN 滥用**：默认 token 可访问仓库 API，权限过大
- **Protected branch 绕过**：旧 GitLab 版本 < 16.8 存在 race condition
- **Maintainer token 持久化**：merge 后 attacker 控制的 PAT 仍有效

### 4. Exfiltration
- **Artifact 阶段 SSRF**：CI 镜像中嵌入的 SSRF 漏洞泄露内部 metadata
- **Pipeline-as-code 注入**：动态生成的 .gitlab-ci.yml 可被 payload 注入

## 审计方法论

**3,757 项目 / 1,580 HIGH 漏洞** 规模化的方法学：

1. **资产发现**：GitLab API 全量枚举公开项目
2. **配置审计**：解析每个项目的 `.gitlab-ci.yml`、CI 变量、runner 配置
3. **漏洞关联**：映射到 CWE/CVE 数据库，标记 HIGH
4. **PoC 验证**：手工验证 top 100 漏洞可利用性
5. **报告输出**：按 kill chain 阶段分类的 actionable 报告

## 关键数字

| 指标 | 数值 |
|------|------|
| 审计项目总数 | 3,757 |
| HIGH 漏洞 | 1,580 (42%) |
| CRITICAL 漏洞 | 87 (2.3%) |
| 涉及 .gitlab-ci.yml | 91% |
| 涉及 CI 变量泄漏 | 34% |
| 平均每个项目漏洞 | 0.42 |

## 实践启示

1. **CI/CD 是新的攻击面**：2024 之前的攻击面主要在 web app，2026 已经转移到 CI/CD 流水线
2. **CI_JOB_TOKEN 默认权限过大**：必须 explicit scope 限定
3. **.gitlab-ci.yml PR 审核是必修课**：保护 branch + required reviewers + CI linter
4. **依赖锁定必须做**：CI 镜像版本锁定 + SBOM 生成
5. **黑盒审计 vs 白盒**：Black Hills 给出的是黑盒外部视角，配合 SAST/SCA 工具形成纵深防御

## 原文链接

[Black Hills InfoSec - Auditing GitLab: The CI/CD Kill Chain](https://www.blackhillsinfosec.com/auditing-gitlab-the-ci-cd-kill-chain/)
