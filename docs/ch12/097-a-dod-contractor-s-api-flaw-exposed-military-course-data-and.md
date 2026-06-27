# A DOD contractor’s API flaw exposed military course data and service member records

## Ch12.097 A DOD contractor’s API flaw exposed military course data and service member records

> 📊 Level ⭐⭐ | 4.6KB | `entities/schemata-dod-contractor-api-flaw-military-data-exposure.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/schemata-dod-contractor-api-flaw-military-data-exposure.md)

## 相关实体

- [Versa takes aim at fragmented enterprise security with CSPM, orchestration update, and AI agent controls](https://github.com/QianJinGuo/wiki/blob/main/entities/www-networkworld-com-versa-takes-aim-at-fragmented-enterprise-security.md)
- [We Tested DeepSeek V4 Pro and Flash Against Claude Opus 4.7](https://github.com/QianJinGuo/wiki/blob/main/entities/wetesteddeepseekv4proandflashagainstclau.md)
- We Tested DeepSeek V4 Pro and Flash Against Claude

## 深度分析
Schemata是一家面向美国国防部（DoD）和企业市场的AI驱动虚拟训练平台供应商，其API漏洞被安全研究项目Strix发现并于2026年5月公开披露。漏洞的核心是**缺乏合理的授权检查（broken authorization）**：一个持有低权限普通账户的研究人员，通过观察正常浏览器流量识别出API端点，随后使用自己的会话发出了跨租户（cross-tenant）数据请求——系统直接返回了其他组织的数据。这不是复杂的0day漏洞利用，而是一个在SDLC（安全开发生命周期）早期就应被识别和修复的基础性缺陷。
暴露的数据包括：海军维护人员的3D虚拟培训课程（含机密标记文件）、陆军爆炸物处理和战术部署field manuals、数百名服务人员的姓名、邮箱、注册详情和驻扎基地信息。考虑到这些数据来自一个持有$3.4M DoD合同、且在2025年5月刚获得a16z等机构$5M融资的创业公司，安全成熟度与合同金额之间的差距令人警惕。
更值得关注的是漏洞披露的时间线。Strix于2025年12月2日首次尝试联系Schemata，得到的回复竟是"我猜你想收费吧？"——这一回应反映了当前安全研究员与厂商之间的信任鸿沟。尽管Strix当天即表明无需报酬、仅关注用户安全，Schemata的CEO仍在超过5个月后才实质性回应，直到Strix警告即将公开发布才紧急修复。这150天的窗口期意味深长：对于一个服务于美国军方的AI平台，如果在公开披露前仍未修复，任何有针对性威胁行为者都可能在此期间发现并利用该漏洞。

## 实践启示
- **多租户架构的授权边界必须作为一等公民设计**：在多租户SaaS架构中，租户隔离失效（cross-tenant data leak）是最常见也最容易被忽视的高危漏洞。开发团队应将每个API请求的租户ID验证纳入强制检查，而非依赖前端过滤。对所有查询类API实施"当前用户所属租户与请求数据租户ID一致性"校验，应成为数据库访问层的基础设施级安全策略。
- **安全研究员对接流程的制度化**：Schemata案例表明，创业公司在快速扩张期往往缺乏正式的漏洞接收和处理流程。对于处理敏感数据的B2B产品，建立清晰的security.txt、配备专门的安全响应渠道，并在收到报告后设定明确的SLA（建议72小时内初步响应、30天内修复高危漏洞），不仅是保护用户的安全实践，也是在发生事件时降低法律和声誉风险的关键。
- **漏洞披露的"善意假设"与法律保护**：Strix使用的"公开威胁"策略（暗示不修复将公布）是当前安全社区的标准做法，但厂商对此往往反应过度（误以为是勒索）。建立负责任的漏洞披露政策，明确表示不寻求报酬，并在发现威胁行为者利用证据时设有紧急升级路径，有助于在法律层面保护安全研究员，同时加速修复流程。
- **融资与安全投入的匹配性审查**：a16z等顶级VC投资AI国防创业公司，但投资金额（$5M）与安全成熟度之间的反差值得警惕。收购方和DoD合同管理部门可能需要重新评估供应商安全评估流程的充分性——$3.4M的DoD合同意味着该公司有权访问敏感的CUI（受控非保密信息），其安全态势是否经过独立审计而非仅依赖自我申报？控制非分类信息（CUI）的处理要求DoD合同商具备特定的报告和防护机制，此次事件或触发对中小企业供应商安全评估标准的重新审视。

---

