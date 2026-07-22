# BigQuery Threat Model Report

## Ch01.859 BigQuery Threat Model Report

> 📊 Level ⭐⭐ | 5.1KB | `entities/google-bigquery-threat-model.md`

## 深度分析

BigQuery 威胁模型覆盖了完整的 STRIDE 分类（Spoofing、Tampering、Repudiation、Information Disclosure、Denial of Service、Elevation of Privilege），共 14 个威胁，其中信息泄露类威胁占比最高（Threat 4、7、9、10、11、13），达到 6 个，反映了数据仓库平台作为集中化数据存储的核心风险：一旦权限控制不当，最大的损失来自数据被不该看到的人看到，而不是系统被破坏。这与传统的网络安全思维不同——在 BigQuery 的威胁模型里，"谁能查数据"比"谁能攻击系统"更关键 。

权限过度授予（Excessive IAM permissions）是所有 BigQuery 安全问题中最普遍、最难防范的根因。Threat 7（过度 IAM 权限导致信息泄露）和 Threat 10（数据集公开暴露）都指向同一个问题：BigQuery 的 IAM 模型极其灵活，可以把 `bigquery.dataViewer` 授予到项目级、 dataset 级、 table 级甚至列级，但实践中开发者往往图方便直接授予项目级权限。Google 的建议是"最细粒度授权"——只授予任务所需的最小权限，精确到特定数据集或表，而不是项目级角色。这个原则听起来简单，但在多团队、多项目的组织中实施起来非常复杂 。

持久化威胁（Persistence）是该威胁模型中容易被忽视但危害极大的一类。Threat 12（用隐蔽的 BigQuery IAM 绑定、授权视图或调度查询建立持久化入口）不同于急性攻击——攻击者拿到初始访问权限后，不直接偷数据，而是建立一条"后门"让自己长期保持访问。攻击方式包括：在不常被监控的数据集上授权自己、创建授权视图作为跳板访问受限表、设置调度查询定期把数据拷贝到外部。这类攻击之所以危险，是因为它们利用的是"正常业务操作"——创建视图、设置调度查询都是合法功能，监控不足时很难发现 。

服务账号凭证保护是 BigQuery 访问控制中最难解决的单点风险。Threat 13（服务账号凭证被窃取）和 Threat 2（IAM allow policy 篡改）都涉及账号安全。Google 的建议是**永远不要导出服务账号密钥**（disable `constraints/iam.disableServiceAccountKeyCreation`），改用 Attached Service Accounts 或 Workload Identity Federation。如果必须导出密钥，则定期轮换，且只授予最小必要权限。这些是云安全的常识，但 BigQuery 作为一个被多种数据管道（Dataflow、Composer、Cloud Functions）广泛依赖的服务，服务账号的使用极其普遍，攻击面也随之扩大 。

## 实践启示

1. **默认启用 VPC Service Controls 创建边界，限制数据流出到 perimeter 外的 Google Cloud 服务或外部互联网**。这是缓解数据外泄（Threat 4、8）的结构性控制，不依赖 IAM 细粒度管理，无论 IAM 配置是否有漏洞，perimeter 都能阻断数据流向未授权位置 。

2. **始终在最细粒度级别授予 BigQuery IAM 权限——dataset 级优于项目级，table 级优于 dataset 级**。避免授予项目级 `bigquery.dataViewer` 或 `bigquery.dataEditor`，为每个业务功能创建专用的数据集和有限权限服务账号 。

3. **定期审计 IAM 绑定（包括 dataset 级别、授权视图、调度查询），检查是否有非预期的跨项目共享或隐藏的持久化入口**。使用 Security Command Center 的异常检测能力，关注非管理员创建的高权限策略变更 。

4. **禁止服务账号密钥导出，使用 Workload Identity Federation 代替**。如果必须使用密钥，启用 `constraints/iam.disableServiceAccountKeyCreation` 组织策略强制禁止，在 Cloud Audit Logs 中监控服务账号异常活动 。

5. **对 authorized views 和 row-level security 策略实施强制代码审查和测试**。这些安全机制的逻辑漏洞（漏写 WHERE 子句、逻辑错误）会导致数据访问范围超出预期，且不易通过常规监控发现 。

## 相关实体
- [Cong Anthropic Dao Googleagent Skills Zhengzai Jinru Sheji Moshi Jieduan](../ch04/396-agent-skills.html)
- [从 Anthropic 到 Googleagent Skills 正在进入设计模式阶段](../ch04/396-agent-skills.html)
- [Cloudsectidbits Masso Cognito Sso.Html](../ch11/240-cloudsectidbits.html)
- [Www Wiz Io Mini Shai Hulud Strikes Again Tanstack More Npm Packages Compromised](ch01/1057-mini-shai-hulud-strikes-again-tanstack-more-npm-packages.html)
- [Aws Bedrock Halliburton Seismic Workflow Genai](../ch11/009-aws-bedrock.html)

- [A History Of Ides At Google](../ch03/039-a-history-of-ides-at-google.html)
- [gemini app rolling out](ch01/715-9.html)

---

