# AWS 软件供应链安全 Well-Architected 最佳实践

## Ch11.135 AWS 软件供应链安全 Well-Architected 最佳实践

> 📊 Level ⭐⭐ | 8.1KB | `entities/aws-software-supply-chain-security-well-architected-best-practices.md`

# AWS 软件供应链安全 Well-Architected 最佳实践

## 概述

针对 2024-2025 年爆发的 **Shai-Hulud** (npm 供应链蠕虫)、**Chalk/Debug** (TJ Actions 恶意更新)、**axios** (钓鱼维护者接管) 等真实攻击事件，AWS 发布 Well-Architected Framework 下的软件供应链安全最佳实践。

## 核心防御维度

### 1. 凭证卫生 (Credential Hygiene)

- **零信任原则**：CI/CD 系统使用短期凭证 (STS、OIDC federation)
- **凭据隔离**：构建机器身份 vs 部署机器身份分离
- **轮转策略**：自动轮转 + 监控异常使用
- **审计**：所有 secret access 写入 CloudTrail

### 2. 最小权限 (Least Privilege)

- IAM 角色按任务拆分 (build vs deploy vs runtime)
- **Permissions boundaries** 防止越权
- **Service Control Policies (SCPs)** 防止账户级越权
- 临时提权机制 (just-in-time access)

### 3. SBOM (Software Bill of Materials)

- 自动生成 SBOM (CycloneDX / SPDX 格式)
- 持续监控依赖图变化
- VEX (Vulnerability Exploitability eXchange) 集成
- 关键依赖清单 (critical dependency inventory)

### 4. 纵深防御 (Layered Defense)

- **多阶段签名验证**：包签名 + 容器签名 + artifact 签名 (SLSA L3+)
- **Reproducible builds**：可复现构建验证供应链完整性
- **隔离构建环境**：ephemeral build runners
- **运行时检测**：异常行为监控 (Falco、Tetragon)

## 与 Well-Architected 五大支柱映射

| 支柱 | 供应链安全实践 |
|------|----------------|
| **Security** | IAM 最小权限、加密、审计 |
| **Reliability** | 多区域 artifact 镜像、签名验证 |
| **Operational Excellence** | 自动化 SBOM 生成、CI/CD 模板化 |
| **Performance Efficiency** | 缓存层安全策略 |
| **Cost Optimization** | 依赖清理、未使用许可证回收 |

## 关键攻击向量总结

| 攻击事件 | 攻击手法 | 防御失效点 |
|----------|----------|------------|
| **Shai-Hulud** | npm 包自动传播恶意代码 | 缺乏发布权限分离、CI 凭证可写包 |
| **Chalk/Debug** | GitHub Action 恶意更新 | 第三方 action 固定 commit 不严 |
| **axios 钓鱼** | 接管维护者 npm 账户 | 缺乏 2FA / hardware key 强制 |

## 落地建议

1. **立即可做**：强制 2FA、轮转所有 CI 凭证、启用 npm/GitHub 2FA + hardware key
2. **短期 (1-3 月)**：实施 SBOM 自动生成 + 关键依赖监控
3. **中期 (3-6 月)**：迁移到 SLSA L3、签名验证 pipeline
4. **长期**：构建可复现构建基础设施、零信任 CI/CD 体系

## 相关实体
- [Based On Prowler Genai Build Fintech Intelligent Compliance 2](ch11/054-prowler-genai.html)
- [Restrict Access To Sensitive Documents In Your Amazon Q S3 Knowledge Bases](ch11/023-restrict-access-to-sensitive-documents-in-your-amazon-q-s3-k.html)
- [Aws Cognito Multi Region Replication](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-cognito-multi-region-replication.md)
- [Aws Transform Ezconvertbi Bi Migration](ch11/203-aws-transform-ezconvertbi-bi-migration.html)
- [Amazon Bedrock Agentic Payments Guardrails](ch11/157-amazon-bedrock.html)
- [基于 Amazon Ecs Fargate 自建 Keycloak 作为 Aws Iam Identity Center](https://github.com/QianJinGuo/wiki/blob/main/entities/基于-amazon-ecs-fargate-自建-keycloak-作为-aws-iam-identity-center.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-software-supply-chain-security-well-architected.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-privacy-landscape.md)
## 深度分析

1. **临时凭证是供应链安全的基石**：Shai-Hulud 成功的核心原因是 long-term npm token 和 GitHub token 被窃取后可直接传播恶意代码。OIDC federation 让 CI/CD job 每次获取短期凭证，token 泄漏的窗口期从"永久"缩小到"本次构建"，从根本上限制了攻击者的横向移动能力。

2. **artifact 签名将信任边界从"人"转移到"流水线"**：即使开发者凭证被钓鱼，只要流水线角色没有 `signer:StartSigningJob` 权限，攻击者就无法引入经过签名验证的 artifact 进入部署链。AWS Signer 使用 FIPS 140-3 Level 3 HSM 存储签名密钥，使签名本身成为独立于 CI 凭证的信任根。

3. **npm Provenance 打通源码到发布物的端到端链路**：npm 9.5+ 支持 Sigstore 基础设施的 provenance  attestation，发布时 `--provenance` flag 将包与具体 Git commit 和 GitHub Actions workflow 绑定。消费者侧的 npm CLI 可在安装时验证 provenance，让"来源不明"的包无处遁形。

4. **行为分析能捕获 CVE 数据库无法覆盖的零日供应链威胁**：传统漏洞扫描依赖已披露的 CVE，Shai-Hulud 这类恶意包在正式分配 CVE 前就已大规模传播。Amazon Inspector 的 behavioral analysis 在运行时检测 credential-harvesting 等可疑行为，结合 MadPot 威胁情报，可在 30 分钟内完成从社区上报到客户告警的闭环。

5. **集中式依赖管理是防御 typo-squatting 的工程级手段**：CodeArtifact 的 package group 可以在仓库层面直接屏蔽未批准的 npm 上游来源，而非依赖开发者在安装时人工识别钓鱼包名。集中管理还意味着可以快速全量移除受影响依赖，将 incident response 时间从"逐应用排查"压缩到"一键阻断"。

## 实践启示

1. **OIDC Federation 立即落地**：所有 GitHub Actions / GitLab CI pipeline 应切换到 OIDC 方式获取 AWS 凭证，完全移除 long-lived access key。AWS CLI `aws login` 替代本地长期凭证，解决本地开发环境的 token 泄漏问题。

2. **CodeArtifact upstream 控制优先于通知优先**：在 CodeArtifact 中配置 approved upstream list，屏蔽所有未审批的 npm 源。这是工程层面的强制控制，比依赖开发者警惕性更可靠，对 typo-squatting 攻击尤其有效。

3. **ECR 托管签名作为 container image 的默认签名方案**：Amazon ECR managed signing 在镜像推送时自动触发签名，调用 AWS Signer 使用 FIPS 140-3 HSM 密钥，无需手工管理证书生命周期，Kyverno 在 EKS 部署时自动验证签名。

4. **SBOM 生成进入 CI/CD gate**：每个 build 必须输出 SPDX/CycloneDX SBOM 并存入版本控制对应的 artifact 存储。当供应链事件发生时，SBOM 是快速定位受影响应用、控制 blast radius 的唯一可信数据源。

5. **CloudTrail 告警规则覆盖 credential 异常模式**：在 EventBridge 中配置针对 `sts:AssumeRole` 异常 IP、`secretsmanager:GetSecretValue` 陌生来源、`ecr:PushImage` 绕过 CI 等场景的自动响应，在 incident 发生时将 forensic 分析时间从小时级压缩到分钟级。

## 关联阅读

当前 wiki 中暂无与 AWS 软件供应链安全直接关联的实体或概念页面。相关概念如 Sigstore、SLSA、SBOM 的独立页面尚未建立，建议后续按需创建。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-software-supply-chain-security-well-architected.md)

---

