# Sovereign cloud is only possible if you're Chinese or American: Gartner

## Ch11.221 Sovereign cloud is only possible if you're Chinese or American: Gartner

> 📊 Level ⭐⭐ | 5.3KB | `entities/5237660.md`

# 主权云仅中美可行：Gartner 分析师的悲观预判

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/5237660.md)

## 摘要

Gartner 副总裁分析师 Douglas Toombs 在悉尼 IT 基础设施、运营与云策略大会上指出，只有美国和中国具备构建完全主权云所需的全部技术栈，其他国家和地区无法脱离外国供应商实现真正的云主权。即便采用本地部署方案（AWS Outposts、Azure Local、Oracle Dedicated Cloud Regions），仍需"打电话回家"（phone home），无法实现真正独立。

## 核心要点

- **云主权仅中美可行**：只有美国和中国拥有构建完整主权云技术栈的全部能力，其他地区必然依赖外国供应商
- **美系云厂商的法律困境**：即便推出"主权云"产品，由于最终所有权归属美国企业，无法在法律上确保完全独立于美国司法管辖
- **本地部署仍需 phone home**：AWS Outposts、Azure Local、Oracle Dedicated Cloud Regions 等本地方案均需外部通信，无法实现真正独立
- **欧洲主权云屡遭挫折**：法国 Andromeda、Numergy、Gaia-X 等项目均未成功，"仅产出了一些白皮书"
- **云市场三足鼎立**：BCG 的"三四法则"（Rule of Three and Four）表明市场已围绕 AWS、Google、Microsoft 固化

## 深度分析

### 主权云的技术结构性困境

Toombs 的判断揭示了一个技术结构性问题：现代云基础设施是一个高度垂直整合的栈——从芯片设计（Intel/AMD/ARM）、固件、虚拟化层、操作系统、网络设备到软件服务，每一层都高度依赖特定供应商。即使一个国家在部分层面实现自主（如中国的飞腾/鲲鹏芯片、阿里云/华为云），完整的端到端自主仍然极其困难。

美系云厂商推出的"主权云"产品（如 AWS European Sovereign Cloud、Azure Sovereign）在数据驻留和运营隔离方面做了努力，但根本问题在于：**法律管辖权跟随公司注册地，而非数据物理位置**。美国的 CLOUD Act 和 FISA Section 702 在理论上赋予美国政府跨境获取数据的权力，即使数据存储在欧洲。

### 欧洲主权云的历史教训

Toombs 引用法国的多次主权云尝试作为反例：
- **Andromeda**：法国政府主导的主权云计划，未能落地
- **Numergy**：由 SFR 和 Bull 合资的主权云，最终关闭
- **Gaia-X**：泛欧洲数据基础设施倡议，被批评为过度官僚化，实际产品产出有限

这些失败的共同模式是：**政治意愿无法克服技术栈的供应商锁定**。欧洲在云基础设施的每一层都依赖美国供应商，单纯通过政策手段无法创造替代方案。

### 云退出策略被普遍忽视

Gartner 分析师 Adrian Wong 补充了一个关键洞察：大多数企业没有制定云退出策略。他的"十大错误"清单包括：
1. 没有退出计划（最常见）
2. 从关键复杂应用（如 ERP）开始上云
3. 假设所有应用都适合云环境
4. 认为多云策略能自动提升可用性

Wong 警告："在不到两年的时间内完成退出需要大量前期规划和投资。退出策略和计划被普遍忽视。"

### 多云策略的误区

Wong 特别指出，多云策略不应以"提升可用性"为目标——除非应用程序首先实现可移植性（这本身就是昂贵且复杂的工程）。多云的真正价值在于访问各平台的特定功能（如 AWS 的 SageMaker、Google 的 TPU、Azure 的 OpenAI 集成），而非简单的冗余备份。

### BCG 三四法则与云市场固化

Toombs 引用波士顿咨询集团的"三四法则"：稳定竞争市场中不超过三个主要竞争者，最大竞争者的市场份额不超过最小者的四倍。这一法则预测云市场已围绕 AWS、Google、Microsoft 三巨头固化，其他厂商（包括 Oracle、IBM、阿里云国际）难以改变格局。

## 实践启示

- **CIO/CTO**：重新审视云主权战略——不应盲目相信供应商的"主权云"宣传，需深入评估法律所有权和数据管辖权的实际情况
- **合规团队**：建立云退出策略刻不容缓——退出时间若少于两年需要大量前期规划，应将退出成本纳入 TCO 模型
- **架构师**：本地部署不等于自主可控——即使采用 Outposts 等本地方案，仍需了解数据流向和外部依赖关系
- **多云用户**：多云策略需以应用可移植性为前提，专注于各平台特定功能，而非简单认为多云能提升可用性
- **欧洲企业**：关注美国云厂商撤离欧洲的风险信号，提前制定应急迁移方案
- **新兴市场**：中国云厂商（阿里云、华为云）在东南亚、中东、非洲的扩张为非美系替代方案提供了选择，但需评估技术成熟度和长期可持续性

## 相关实体

- [越南发展国内云](ch11/187-vietnam-to-develop-domestic-cloud.html)
- [越南国内云](https://github.com/QianJinGuo/wiki/blob/main/entities/vietnam-domestic-cloud.md)
- [澳大利亚多云 Agent 编排](../ch04/494-agent-orchestration.html)
- [5237660](../ch01/1206-0.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/5237660.md)

---

