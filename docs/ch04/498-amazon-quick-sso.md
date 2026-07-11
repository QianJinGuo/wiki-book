# Amazon Quick 飞书SSO对接指南

## Ch04.498 Amazon Quick 飞书SSO对接指南

> 📊 Level ⭐⭐ | 5.3KB | `entities/amazon-quick-飞书sso对接指南.md`

# Amazon Quick 飞书SSO对接指南

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/amazon-quick-飞书sso对接指南.md)

# Amazon Quick 飞书SSO对接指南

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

针对这一问题，可通过一个 Lambda 函数定期调用飞书开放 API 获取用户和组信息，再调用 IAM Identity Center 的 SCIM 接口完成创建和更新，实现类似原生 SCIM 同步的效果。该方案的具体实现已上传至 [GitHub](<https://github.com/hhhsummer6967/feishu-idp-sync-to-aws>)，供参考。

如果只是将 IAM Identity Center作为Quick的用户来源，不希望同步所有企业内用户到 IAM Identity Center，也可以手动在 IAM Identity Center创建用户，只要确保使用企业邮件作为 IAM Identity Center的用户即可。

## **一、Quick Web 接入飞书（概述）**

Quick Web 使用 IAM Identity Center 原生集成方式，与飞书的对接分两部分：将飞书配置为 IAM Identity Center 的外部 IdP，以及将 Quick 账号与 IAM Identity Center 关联。

**第一步：在 IAM Identity Center 中配置飞书为外部 IdP**

  * 在飞书开放平台创建企业自建应用，配置为 SAML 应用，下载飞书的 IdP metadata XML
  * 打开 [IAM Identity Center 控制台](<https://console.aws.amazon.com/singlesignon>) → Settings → Identity source → Actions → Change identity source
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

