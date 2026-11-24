# Amazon Quick 飞书SSO对接指南

> 📊 Level ⭐⭐⭐ | 10.6KB

→ [原文存档](https://aws.amazon.com/cn/blogs/china/amazon-quick-sso-integration-guide)

## Amazon Quick 飞书SSO对接指南

摘要：Amazon Quick 是 AWS 推出的 AI 工作助手，能够将问题转化为答案、将答案转化为行动。它连接企业内的应用、工具和数据，支持自然语言查询、工作流自动化、文档生成、数据可视化以及跨系统的智能代理任务。
  
**目录**

01 使用飞书 SSO 登录 Amazon Quick

02 Quick Web 接入飞书（概述）

03 Quick Desktop 接入飞书 SSO

04 基础设施部署（Keycloak on AWS）

05 飞书集成平台配置

06 Keycloak 配置

07 运维

08 使用 AI Agent 辅助配置

09 结语

* * *

## **一、使用飞书 SSO 登录 Amazon Quick**

### 1.1 Amazon Quick 简介

Amazon Quick 是 AWS 推出的 AI 工作助手，能够将问题转化为答案、将答案转化为行动。它连接企业内的应用、工具和数据，支持自然语言查询、工作流自动化、文档生成、数据可视化以及跨系统的智能代理任务。

Quick 有两种主要访问形式：

  * Quick Web：通过浏览器访问，是日常使用的主要入口。
  * Quick Desktop：原生桌面客户端（macOS/Windows），持续运行于本地，可访问本地文件、日历、邮件，并构建个人知识图谱。仅在企业版（Enterprise Edition）中提供，且身份区域须为 `us-east-1`。

### 1.2 与飞书的对接方式

**1.2.1 本文的对接方案基于 飞书 + IAM Identity Center 的组合**

  * 用户目录：Quick 的用户账号统一来自 IAM Identity Center
  * 身份来源：IAM Identity Center 将飞书配置为外部 IdP（SAML），用户实际通过飞书账号完成身份验证
  * 用户同步：飞书用户和组通过 Lambda 函数同步到 IAM Identity Center（飞书不支持 SCIM，详见下节）
  * Quick Web：与 IAM Identity Center 原生集成，用户登录时跳转至飞书完成 SAML 认证后返回
  * Quick Desktop：使用 OIDC 协议（Public Client + PKCE + offline_access），通过 Keycloak 作为中间层衔接飞书（本文重点）

整体架构如下：
    
    
    飞书（身份源）
        │                    │

        │ SAML               │ OIDC/OAuth（Anycross）

        ▼                    ▼

    IAM Identity Center   Keycloak（OIDC 中间层）

        │                    │

        │ 原生集成             │ OIDC

        ▼                    ▼

    Quick Web           Quick Desktop

    

### 1.3 飞书用户同步到 IAM Identity Center

IAM Identity Center 支持通过 SCIM 协议与外部 IdP 自动同步用户和组，但飞书目前不支持 SCIM 协议，无法直接完成自动同步。

针对这一问题，可通过一个 Lambda 函数定期调用飞书开放 API 获取用户和组信息，再调用 IAM Identity Center 的 SCIM 接口完成创建和更新，实现类似原生 SCIM 同步的效果。该方案的具体实现已上传至 GitHub，供参考。

如果只是将 IAM Identity Center作为Quick的用户来源，不希望同步所有企业内用户到 IAM Identity Center，也可以手动在 IAM Identity Center创建用户，只要确保使用企业邮件作为 IAM Identity Center的用户即可。

## **一、Quick Web 接入飞书（概述）**

Quick Web 使用 IAM Identity Center 原生集成方式，与飞书的对接分两部分：将飞书配置为 IAM Identity Center 的外部 IdP，以及将 Quick 账号与 IAM Identity Center 关联。

**第一步：在 IAM Identity Center 中配置飞书为外部 IdP**

  * 在飞书开放平台创建企业自建应用，配置为 SAML 应用，下载飞书的 IdP metadata XML
  * 打开 IAM Identity Center 控制台 → Settings → Identity source → Actions → Change identity source
  * 选择 External identity provider，点击 Next
  * 在 Service provider metadata 下，下载 IAM Identity Center 的 SAML metadata 文件，上传到飞书 SAML 应用（配置 ACS URL 和 Entity ID）
  * 在 Identity provider metadata 下，上传飞书的 IdP metadata XML
  * 输入 `ACCEPT` 确认并提交

**第二步：创建 Quick 账号时选择 IAM Identity Center**

在注册或配置 Amazon Quick Enterprise 账号时，选择 IAM Identity Center 作为身份来源。Quick 会自动与 IAM Identity Center 建立原生集成，IAM Identity Center 中的用户和组自动同步至 Quick。

**注意：**

IAM Identity Center 的身份来源一旦设置后变更会影响现有用户分配，请提前规划。详细步骤可参考 AWS 官方文档。

## **二、Quick Desktop 接入飞书 SSO**

### 2.1 Quick Desktop 的认证要求

Quick Desktop 使用 OIDC 协议，具体要求：

  * Public Client + PKCE：桌面应用不持有 client_secret
  * offline_access scope：通过 refresh token 维持长期会话
  * 标准 OIDC Discovery 端点：客户端自动发现配置
  * email claim

---
## 深度分析

### 双协议分叉：为什么 Web 走 SAML、Desktop 走 OIDC

这篇指南最有信息量的部分，是它揭示了同一 SaaS 产品的两种客户端形态在认证协议上的被迫分叉。Quick Web 走 IAM Identity Center 原生集成（SAML），而 Quick Desktop 必须走 OIDC（Public Client + PKCE + offline_access），原因在于飞书的 OAuth/OIDC 实现不满足桌面端要求：不支持 Public Client、PKCE、`offline_access`，也不提供标准 OIDC Discovery 端点。 于是 Keycloak 被引入为"标准垫片"——向上对 Quick Desktop 提供合规 OIDC 服务，向下以 OAuth 客户端身份对接飞书。这是企业集成中反复出现的协议适配器模式：当身份源不遵循标准时，与其改造两端，不如插入一个可自托管的协议转换层。

### 集成平台选型决定对接成本

飞书侧有两个应用创建入口，对接成本差异被原文量化：集成平台（Anycross）支持 OIDC Discovery、标准 token 认证（`client_secret_basic`/`post`）与扁平 UserInfo 结构，Keycloak 内置 OIDC 零代码即可对接；原生自建应用三者皆缺，需自定义 SPI 插件。 换言之，选错入口会把"配置问题"升级为"开发问题"。同理，飞书不支持 SCIM，用户同步只能靠 Lambda 定时拉取飞书开放 API 再调 IAM Identity Center 的 SCIM 接口来模拟原生同步——身份源的能力缺口最终都会转化为自建胶水代码的维护负担。

### 失败点集中在"上游默认行为"

原文把 First Broker Login 单独成节，称其为"对接中最容易被忽略的配置"：Keycloak 默认在首次联邦登录时插入 Review Profile 和邮箱验证步骤，而飞书作为可信企业 IdP 已完成身份验证，这些步骤只会中断登录流程。 同类陷阱还有 `enterprise_email`→`email` 的 claim 映射（Quick Desktop 靠 token 中的 email 识别用户）与 Extension Access 创建后不可编辑。三个失败点形态一致：都是上游系统的默认行为，只在端到端联调时才暴露。

### 自动化边界：API 覆盖度与可逆性

原文用整节讨论 AI Agent 辅助配置，其分界标准值得注意：凡有 CLI 或 REST Admin API 的步骤（EC2/ALB/Route 53 创建、Keycloak realm/IdP/mapper/flow 配置）Agent 可全自动完成；凡只能进控制台且不可逆的步骤（飞书集成平台无公开 API、Extension Access 创建后不可编辑、IAM 变更需管理员审核）保留人工。 这给出一条可迁移准则——API 覆盖度与可逆性共同决定配置工作的自动化上限。

## 实践启示

1. **优先走飞书集成平台（Anycross）而非原生自建应用**：Discovery、token 认证、UserInfo 三项全部标准，Keycloak 零代码对接；选原生平台则要自写 SPI 插件。
2. **禁用 Keycloak First Broker Login 中的 Review Profile 与 Verify Existing Account By Email**，并在未配置 SMTP 时关闭 Email verification——否则用户首次登录会被邮件验证卡死。
3. **配置 `enterprise_email`→`email` 的 Attribute Importer 映射**，保证 IdP token 的 email 与 Quick 用户 email 完全一致；"User not found"报错几乎都源于此。
4. **Extension Access 提交前先用 `.well-known/openid-configuration` 核对所有端点值**：创建后不可编辑，填错只能删除重建。
5. **变更身份来源前先规划**：IAM Identity Center 的 identity source 一旦变更会影响现有用户分配，且 Quick Desktop 仅企业版、`us-east-1` 身份区域可用。
6. **运维基线**：EBS 走 DLM 每日快照、EC2 不分配公网 IP 仅走 Session Manager、`/auth/admin` 用 ALB 规则限管理员 IP；升级 Keycloak 前先打快照再 `docker compose pull && docker compose up -d`。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

