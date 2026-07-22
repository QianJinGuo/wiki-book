---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/using-aws-security-agent-build-application-security-automation
ingested: 2026-06-10
feed_name: AWS China Blog
source_published: 2026-06-10
sha256: 4e770733762ee41af7582bf10a12816bfdee3d730023ffcb65a784b537e0fd2d
---

# 使用 AWS Security Agent 构建应用安全闭环——从代码提交到漏洞修复的自动化之路

摘要：本文将分享如何使用 AWS Security Agent 构建覆盖“设计评审→代码审计→渗透测试”的全生命周期安全验证体系。通过创建 Agent Space、集成 GitHub 仓库、配置组织安全要求，实现在软件开发生命周期中主动发现并修复安全漏洞——将传统需要数周的人工渗透测试压缩至按需自动化执行。  
  
**目录**

01 一、场景概述

02 二、什么是 AWS Security Agent

03 三、为什么选择 AWS Security Agent 集成 GitHub

04 四、解决方案

05 五、总结

* * *

## **一、场景概述**

在现代应用开发中，安全漏洞的发现往往滞后于代码部署。当安全团队在上线后才介入渗透测试时，修复成本已成倍增加。更棘手的是，随着微服务架构和快速迭代的普及，传统的“定期扫描 + 人工渗透”模式越来越难以跟上业务节奏。

本文将分享如何使用 AWS Security Agent，在已有的代码仓库、设计文档和部署环境基础上，构建一个从“设计评审→代码审计→渗透测试”的全生命周期安全验证闭环。通过配置组织安全要求，Agent 能够理解应用上下文，发现自动化扫描工具无法找到的漏洞，并自动生成修复 Pull Request。

## **二、什么是 AWS Security Agent**

AWS Security Agent 是 AWS 提供的面向应用安全场景的前沿代理服务（Frontier Agent），用于在软件开发生命周期中主动保护应用程序安全。它根据组织定义的安全要求进行自动化安全评审，并按需提供上下文感知的渗透测试。

AWS Security Agent 并非传统意义上的漏洞扫描器，也并非单一的 SAST 或 DAST 工具。其主要作用是在现有的代码仓库、设计文档、部署环境基础之上，建立覆盖设计、开发、部署全阶段的安全验证能力。

通过 AWS Security Agent，您可以：

  * 设计安全评审：在代码编写前评估架构设计是否符合组织安全要求
  * 代码安全评审：在开发阶段持续发现代码漏洞，自动生成修复 PR
  * 按需渗透测试：对已部署应用执行多步攻击链，验证漏洞可利用性
  * CI/CD 集成：将安全验证嵌入流水线，在每次部署前自动执行安全测试



### 2.1 AWS Security Agent 三大能力

能力 | 作用 | 输出  
---|---|---  
设计安全评审 | 在代码编写前提供安全反馈，评估架构文档是否符合组织安全要求 | 不安全设计识别 + 修复指导  
代码安全评审 | 在开发阶段持续发现代码漏洞，支持全仓库扫描和 全仓库扫描 + 自动代码修复 | 漏洞发现 + 代码修复 PR  
按需渗透测试 | 部署专项 AI 代理，通过多步攻击场景发现、验证和报告安全漏洞 | CVSS 评分 + 复现步骤 + 修复 PR  
  
### 2.2 AWS Security Agent 不适合作为以下能力的替代品

  1. 不替代 WAF、GuardDuty 等运行时防护和威胁检测能力
  2. 不替代 Security Hub 的合规态势管理能力
  3. 不替代 IAM、KMS 等身份与加密管理能力
  4. 不替代人工安全专家的安全架构设计决策



## **三、为什么选择 AWS Security Agent 集成 GitHub**

在现代应用开发中，代码仓库是安全验证的最佳切入点。团队的代码、设计文档、部署配置都围绕 GitHub 组织，AWS Security Agent 通过与 GitHub 深度集成，能够直接在现有工作流中嵌入安全验证——无需改变开发团队的习惯，即可实现从设计评审到代码审计再到渗透测试的全覆盖。以下展示完整的集成过程。

## **四、解决方案**

使用 AWS Security Agent，构建“设计安全评审→代码安全评审→渗透测试”的全生命周期安全验证闭环：

### 4.1 架构

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-1.png>) [图：AWS Security Agent 全生命周期安全架构]  
---  
  
### 4.2 实施步骤

**Step 1：创建 Agent Space**

Agent Space 是 AWS Security Agent 的逻辑工作空间，用于定义可连接的代码仓库、可访问的文档和测试目标、组织安全要求配置、用户权限范围。

步骤如下

  1. 登录 AWS Management Console，进入 AWS Security Agent 控制台
  2. 选择创建新的 Agent Space
  3. 填写 Agent Space 名称和描述。名称应能够体现应用归属，例如 travel-album

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-2.png>) [图：Agent Space 创建页面]  
---  
  
  1. 用户访问配置可选使用 IAM Identity Center (SSO) 或仅限 IAM 访问
  2. 其他选项选择默认，点击“设置AWS安全代理”完成创建



访问方式对比

访问方式 | 说明  
---|---  
IAM Identity Center (SSO) | 通过 IAM Identity Center 单点登录访问。推荐用于生产环境和多人团队。会话有效期可达 12 小时。  
仅限 IAM 访问 | 通过 AWS Console 中的管理员访问链接进入。适合初始设置、个人试用。会话限制 30 分钟。  
  
**Step 2：集成 GitHub**

进入 AWS 安全代理页面：

  1. 选择集成
  2. 在集成页面，选择 添加集成
  3. 在弹出窗口，选择 GitHub，点击“下一步”
  4. 在将 GitHub 连接到 AWS 安全代理页面，根据提示完成 GitHub OAuth 授权



授权完成后，输入注册名称，点击“连接”完成集成。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-3.png>) [图1：安装 AWS 安全代理 GitHub 应用程序]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-4.png>) [图2：在 GitHub 页面确认安装]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-5.png>) [图3：点击”授权”]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-6.png>) [图4：点击”Authorize”，等待授权成功]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-7.png>) [图5：输入注册名称]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-8.png>) [图6：GitHub 集成完成]  
---  
  
**Step 3：配置安全要求（可选）**

AWS Security Agent 提供两类安全要求：

  * 托管安全要求（Managed）——AWS 预定义的行业标准，默认已存在，可直接启用
  * 自定义安全要求（Custom）——根据组织特定策略创建，用于覆盖托管要求未涵盖的场景



安全要求在组织级别定义，跨所有 Agent Space 生效，在每次设计评审和代码评审时自动验证。

创建自定义安全要求示例

字段 | 示例  
---|---  
安全要求名称 | 文件上传内容验证  
描述 | 所有文件上传端点必须通过检查 MIME 类型、文件头魔法字节、文件扩展名和文件大小来验证上传内容  
适用性 | 此控制适用于所有接受用户上传文件的工作负载  
补救指南 | 使用 file-type 库检测实际文件类型；维护允许的扩展名和 MIME 类型白名单；将文件存储在 S3 或非 Web 可访问目录中  
  
### 4.3 安全测试演示

**场景一：设计安全评审**

  1. 在代理空间页面的 Web 应用程序选项下点击“管理员访问权限”，进入安全代理页面
  2. 在安全代理的设计评审页面，点击“创建设计评审”，上传需要评审的文档
  3. 点击“开始设计评审”，开始进行评审
  4. 进入评审详细页面，可查看评审详细信息和下载报告



Agent 会根据组织安全要求，自动识别架构设计中的风险点，例如缺少输入验证的 API 端点、不安全的认证机制设计、数据存储加密要求未满足等。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-9.png>) [图7：创建设计评审，上传文档]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-10.png>) [图8：设计评审详细信息和下载报告]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-11.png>) [图9：查看具体评论和补救指导]  
---  
  
**场景二：代码审核**

  1. 进入代理空间，点击“启用代码审核”
  2. 配置 GitHub 仓库和 S3 源
  3. 启动 Web 应用程序，在安全代理 Web 页面创建“代码审查”
  4. 启动代码审查，等待扫描完成



Agent 支持两种代码审查方式：

  * 全仓库扫描：对 GitHub 仓库或 S3 源的完整代码进行扫描
  * PR 自动评审：为 GitHub 仓库启用自动 PR 分析，Security Agent 将安全发现直接发布为 PR 评论



两种方式均提供修复指导，并可自动生成包含代码修复的 Pull Request。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-12.png>) [图10：启用代码审核]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-13.png>) [图11：添加 GitHub 仓库]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-14.png>) [图12：添加 S3 源]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-15.png>) [图13：启动 Web 应用程序]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-16.png>) [图14：创建代码审查]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-17.png>) [图15：启动代码审查]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-18.png>) [图16：代码审查调查状态]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-19.png>) [图17：代码审查详细信息和发现]  
---  
  
**场景三：渗透测试**

渗透测试要求应用必须部署到可访问的环境并验证域名所有权。支持两种模式：公网应用（DNS TXT 或 HTTP 文件验证）和 VPC 内私有应用。

创建渗透测试

  * 进入代理空间页面，点击“启动渗透测试”，根据环境配置目标域
  * 在 AWS Security Agent 页面，点击“创建渗透测试”，配置目标 URL 和服务角色
  * 配置完成后点击“开始运行”，启动测试



测试完成后，查看发现的安全漏洞列表。每个 Finding 包含 CVSS 评分和严重等级、漏洞复现步骤、攻击链详细信息、代码修复建议和自动生成的 Pull Request。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-20.png>) [图18：启动渗透测试，配置目标域]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-21.png>) [图19：创建渗透测试，配置目标 URL]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-22.png>) [图20：渗透测试进度和日志]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-23.png>) [图21：渗透测试结果]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/using-aws-security-agent-build-application-security-automation-24.png>) [图22：Finding 详情]  
---  
  
### 4.4 经验总结

**4.4.1 Agent Space 的划分策略**

建议按应用划分 Agent Space。这样做的好处是：安全要求可针对不同应用差异化配置；渗透测试目标范围清晰，避免误伤其他服务；代码审查结果聚焦，减少噪音。

**4.4.2 安全要求的配置最佳实践**

  * 先启用 AWS 托管安全要求，利用 AWS 预置的行业安全标准作为基线
  * 再根据组织特定策略补充自定义要求（如文件上传验证、日志标准）
  * 安全要求描述越具体，Agent 的判断越准确——避免模糊的“应确保安全”类表述



**4.4.3 循序渐进的集成路径**

建议按以下顺序逐步集成：

  1. 先集成 GitHub 仓库，在 Web App 中创建代码审查——这是投入产出比最高的第一步
  2. 配置组织安全要求，让 Agent 理解你的安全标准
  3. 启用设计评审，在架构设计阶段就发现安全问题
  4. 配置渗透测试目标，实现部署后验证
  5. 将安全检查嵌入 CI/CD 流水线，形成完整闭环



## **五、总结**

通过使用 AWS Security Agent，我们实现了从架构设计到代码开发再到部署验证的全生命周期安全验证闭环。当安全团队发起代码审查时，Security Agent 自动扫描代码安全；当架构师完成设计文档时，Agent 自动评估安全合规性；当应用部署上线后，Agent 按需执行渗透测试——而此前这些工作需要安全团队数周的人工投入。

更重要的是，AWS Security Agent 理解应用的业务上下文。它通过分析源码和文档，能发现传统扫描工具无法找到的业务逻辑漏洞，显著降低误报率，让安全团队将精力集中在真正有价值的安全决策上。

AWS Security Agent 已于 2026 年 3 月 31 日正式 GA，新客户还可以享受免费试用期，这也是您评估和体验此 Agent 的最佳时间。

**参考资源**

  * [AWS Security Agent 官方页面](<https://aws.amazon.com/security-agent/>)
  * [AWS Security Agent 文档](<https://docs.aws.amazon.com/securityagent/latest/userguide/what-is.html>)
  * [AWS Security Agent Features](<https://aws.amazon.com/security-agent/features/>)
  * [GA 发布公告（2026.3.31）](<https://aws.amazon.com/blogs/security/aws-security-agent-on-demand-penetration-testing-now-generally-available/>)
  * [渗透测试 Multi-Agent 架构技术博客（2026.2.26）](<https://aws.amazon.com/blogs/security/inside-aws-security-agent-a-multi-agent-architecture-for-automated-penetration-testing/>)
  * [全仓库代码扫描 Preview（2026.5.12）](<https://aws.amazon.com/blogs/security/aws-security-agent-full-repository-code-scanning-feature-now-available-in-preview/>)
  * [演示项目: travel-album-site](<https://github.com/alex8158/travel-album-site>)



**下一步行动：**

**相关产品：**

  * [AWS Security Agent](<https://aws.amazon.com/security-agent/?p=bl_pr_waf_l=1>) — 面向应用安全的前沿 AI 代理
  * [Amazon CodeGuru](<https://aws.amazon.com/codeguru/profiler/?p=bl_pr_waf_l=2>) — ML 驱动的代码审查
  * [Amazon WAF](<https://aws.amazon.com/cn/waf/?p=bl_pr_waf_l=3>) — Web 应用程序防火墙
  * [Amazon GuardDuty](<https://aws.amazon.com/cn/guardduty/?p=bl_pr_guardduty_l=4>) — 智能威胁检测



**相关文章：**

  * [AWS Security Agent 渗透测试实操](<https://aws.amazon.com/cn/blogs/china/aws-security-agent-testing/?p=bl_ar_l=1>)
  * [企业级OpenClaw安全部署架构指南](<https://aws.amazon.com/cn/blogs/china/enterprise-openclaw-security-deploy-architecture-guide/?p=bl_ar_l=2>)
  * [AWS Security Hub Extended 通过精选合作伙伴解决方案提供全栈企业级安全防护](<https://aws.amazon.com/cn/blogs/china/aws-security-hub-extended-offers-full-stack-enterprise-security-with-curated-partner-solutions/?p=bl_ar_l=3>)
  * [OpenClaw 安全和功能增强实践](<https://aws.amazon.com/cn/blogs/china/openclaw-security-and-feature-enhancement-practices/?p=bl_ar_l=4>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 赵思洵

长虹佳华资深架构师，技术支持总监，深耕云计算行业解决方案及企业级解决方案落地。擅长运营商网络、云计算、云安全、云原生应用等方向。

### 黄明辉

长虹佳华资深售后云技术服务工程师，深耕20年IT领域，擅长云计算、容器化、云原生开发、AI技术应用等。负责云业务技术服务，包括解决方案、迁移与交付实施、云托管运维等服务。

### 罗辉朋

长虹佳华高级架构师，深耕20年IT领域，专注于企业IT系统应用和云服务技术，致力于优化企业级基础设施架构和提升运维效率。

### 冯磊

亚马逊云科技资深合作伙伴解决方案架构师，曾就职于Teradata、Oracle 等公司，具有20年企业级软件开发及架构设计经验，目前专注云计算、大数据、生成式 AI 等技术方向。

* * *

## 亚马逊云科技中国峰会

Agentic AI 代码秀、Hands-on Lab、Chalk Talk 白板推演——为技术构建者准备的深度内容。 [](<https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p3&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d>) |   
---|---
