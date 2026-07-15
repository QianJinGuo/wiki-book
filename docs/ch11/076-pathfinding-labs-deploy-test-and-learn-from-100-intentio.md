# Pathfinding Labs: Deploy, test, and learn from 100+ intentional security bad code

## Ch11.076 Pathfinding Labs: Deploy, test, and learn from 100+ intentional security bad code

> 📊 Level ⭐⭐ | 10.8KB | `entities/datadog-pathfinding-labs-security.md`

# Pathfinding Labs

[Pathfinding Labs](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/datadog-pathfinding-labs-security.md) 是 DataDog Security Labs 于 2026 年 5 月发布的云安全实训平台，核心功能是允许用户在自有 AWS Sandbox 账户中一键部署**故意存在漏洞的 AWS 环境**，随后对其进行利用（red team）或检测验证（blue team）。项目包含超过 100 个 Terraform 编写的实验环境，通过一个 Go 语言编写的 CLI 工具 `plabs` 封装所有 Terraform 细节，用户无需直接接触 Terraform 即可完成完整的攻击链演练。

## 核心组成

Pathfinding Labs 由三个部分构成，形成从学习到实战的完整闭环：

**1. Web Catalog（[pathfinding.cloud/labs](https://pathfinding.cloud/labs)）**
文档化每个实验，提供 CTF 风格的提示（hints），以及完整 exploit 所需的所有命令与步骤说明。用户无需部署即可浏览学习。

**2. Terraform Labs（[github.com/DataDog/pathfinding-labs](https://github.com/DataDog/pathfinding-labs)）**
超过 100 个可部署实验，大部分覆盖 AWS IAM 权限提升场景，其余覆盖云安全态势管理（CSPM）错误配置和有毒组合（toxic combinations）。所有实验以 Terraform 模块编写。

**3. plabs 二进制工具**
Go 语言编写的 CLI，内置交互式 TUI（Terminal User Interface），负责下载 Terraform（如未安装）、克隆仓库到 `~/.plabs/`、执行 `plabs apply` 部署、`plabs demo [id]` 自动运行攻击脚本、`plabs disable && plabs apply` 销毁环境。全程无需手动操作 Terraform。

## 实验类型

Pathfinding Labs 的实验覆盖多种攻击路径形态，对应不同的云安全攻防场景：

- **Self-escalation**：同一 principal 内的权限提升（如普通 IAM User → Admin User）
- **One-hop**：单跳权限提升（如 IAM User → 另一个 IAM Role）
- **Multi-hop**：多跳权限链（如 User → Initial Role → Intermediate Role → S3 Access Role → Target Bucket）
- **Cross-account**：跨账户攻击路径（从开发 AWS 账户横向移动到生产账户）
- **Misconfig Labs**：CSPM 相关错误配置（如公开 S3 Bucket、过度宽松的 S3 策略）
- **Toxic Combination Labs**：多个无害配置组合后形成的安全风险

## 与 Stratus Red Team 的关系

Datadog 官方明确将 Pathfinding Labs 定位于 CSPM 检测验证场景，与同属 Datadog 社区项目的 **Stratus Red Team**（[github.com/DataDog/stratus-red-team](https://github.com/DataDog/stratus-red-team)）形成互补：

- **Stratus Red Team**：面向 Cloud SIEM，帮助安全团队在受控环境中引爆原子化的云攻击 TTP（Tactics, Techniques, and Procedures），验证 SIEM 规则是否触发
- **Pathfinding Labs**：面向 CSPM，部署易受攻击的云资源，验证 CSPM 工具能否在攻击者利用前识别各类错误配置

两者共同构成了 Datadog 云安全检测验证的工具矩阵，覆盖 SIEM 和 CSPM 两条不同路线。

## 图思维与攻击链

项目名称直接引用了 John Lambert 的经典安全格言：_"Defenders think in lists. Attackers think in graphs. As long as this is true, attackers win."_

Pathfinding Labs 的设计哲学正是基于这一观察。真实的云入侵往往是多步骤序列：攻击者先落地在某 workload，获取凭证，assume 某个 role，invoke 一个 Lambda 函数，最终到达目标数据。大多数实验模拟这种图结构的攻击路径，而非孤立的单点错误配置。

这种设计同时也使 Pathfinding Labs 能够用于评估**图结构云安全态势工具**：通过已知、定义的攻击路径，测量工具是否能够完整重建 Pathfinding Labs 所部署的整条攻击图。

以一个三跳角色链实验为例：起始用户 → Initial Role → Intermediate Role → S3 Access Role → 目标 S3 Bucket。实际上，`Initial Role` 和 `Intermediate Role` 也对目标 Bucket 有直接访问权限，攻击者只需执行少量额外操作即可到达终点。这正是"图思维"的典型体现——真实攻击路径比 defenders 预期的列表式视图复杂得多。

## 快速上手

```bash

# 安装 plabs（macOS/Linux）
curl -fsSL https://pathfinding.cloud/install.sh | sh

# 启用实验
plabs enable [lab-id]

# 部署到 AWS 账户
plabs apply

# 自动运行攻击脚本
plabs demo [lab-id]

# 销毁实验环境
plabs disable [lab-id] && plabs apply
```

建议使用**独立 Sandbox 账户**部署实验（理想情况下放在单独的 AWS Organization 中），并配置账单警报作为安全网。**绝对不要在生产账户中部署**，因为所有实验都会创建存在漏洞的资源（如管理型用户、过度宽松的角色、公开 S3 Bucket 等）。

## 路线图

Pathfinding Labs 正在开发**托管版本**，目标是让用户直接在 pathfinding.cloud 上完成大部分实验，无需自行部署 AWS 资源。托管版本将降低使用门槛，适用于培训、CTF 和快速演示场景。

## 深度分析

Pathfinding Labs 的核心创新在于将 Terraform 模块封装为可一键部署的攻击实验环境，这种"验证驱动生成"的模式解决了云安全知识共享中长期存在的一个根本矛盾：文档描述的攻击路径与实际可利用环境之间存在巨大鸿沟。在 pathfinding.cloud 诞生初期，团队为每一条 IAM 权限提升路径编写 Terraform 模块来验证其可行性，这一被动验证步骤最终演变为拥有 100+ 独立实验的完整平台，说明真正可复现的安全知识必须经过工程化验证才能交付信任。

项目名称直接引用 John Lambert 的经典格言，揭示了云安全攻防不对等的技术根源：防御者以资产和身份列表组织视图，而真实攻击者构建的是一张权限关系图。当一个攻击者从初始 foothold 经过多跳角色链到达目标数据时，他所穿越的每一条边都是图的一条边，而 CSPM 工具若只能理解单点配置错误，就永远无法完整重建攻击者的路径。Pathfinding Labs 的多跳实验和跨账户实验直接服务于这一检测挑战——用已知攻击路径验证工具的图重建能力。

与 Stratus Red Team 的对比揭示了云安全检测验证的两条正交路线：Stratus Red Team 面向 Cloud SIEM，验证的是"当某个原子化 TTP 被触发时，SIEM 规则是否响应"；Pathfinding Labs 面向 CSPM，验证的是"在攻击者利用漏洞之前，CSPM 能否发现配置层面的系统性风险"。前者是事中检测，后者是事前发现——两者共同构成了 Datadog 在云安全领域的完整检测验证矩阵，也预示着企业云安全运营团队需要同时配备这两种工具才能覆盖完整的检测链路。

从工程实现角度看，plabs CLI 将 Terraform 完全隐藏在 TUI 之后的设计决策极具产品价值。安全研究人员本质上不需要学习 Terraform DSL，只需要理解"我想部署哪种攻击场景"，这种分层抽象使得红蓝团队可以将精力集中在攻防博弈本身，而非基础设施代码维护。更值得注意的是，随着托管版本上线，实验可完全在浏览器内完成，这意味着 Pathfinding Labs 的覆盖范围将从具备 AWS 账户的技术安全人员扩展到任何想要学习云安全攻防的开发者。

## 实践启示

- **CSPM 检测规则开发**：在编写 CSPM 检测逻辑之前，先在 Pathfinding Labs 中部署对应类型的实验，验证检测规则能否在攻击者完成利用之前准确触发，实现检测驱动的安全基础设施建设。
- **红队演练环境标准化**：将 Pathfinding Labs 作为红队训练的标准化靶场，所有成员在同一组实验环境上操作，消除个人搭建实验环境导致的路径覆盖不一致问题，提升团队整体攻击能力评估的可比性。
- **多跳路径的图结构验证**：定期使用 Pathfinding Labs 的 multi-hop 和 cross-account 实验测试现有 CSPM 工具，验证其是否能够完整重建攻击路径而非仅识别单点配置，这直接关系到真实攻击场景中的检测覆盖率。
- **安全工具对比测试**：在采购新的 CSPM 工具时，以 Pathfinding Labs 的已知攻击路径作为基准测试集，测量不同工具的检测完整性和路径重建能力，用量化指标替代供应商提供的营销数据。
- **隔离训练环境搭建**：为安全新人创建 Pathfinding Labs 学习路径，从 self-escalation 单跳实验开始，逐步过渡到 multi-hop 和 cross-account 场景，以游戏化-CTF 方式建立云安全攻击思维，弥补传统课程"只讲理论不动手"的短板。

## 相关项目

- **Stratus Red Team**（[github.com/DataDog/stratus-red-team](https://github.com/DataDog/stratus-red-team)）— 同属 Datadog 社区的 Cloud SIEM 检测验证工具
- **pathfinding.cloud**（[pathfinding.cloud](https://pathfinding.cloud/)）— IAM 权限提升技术目录（Pathfinding Labs 的起源项目）
- **AWS IAM 权限提升** — 云环境权限提升攻击的通用概念，可参见 [pathfinding.cloud](https://pathfinding.cloud/) 了解更多技术细节

---

> 来源：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/datadog-pathfinding-labs-security.md)

## 相关实体
- [Www Networkworld Com Versa Takes Aim At Fragmented Enterprise Security](../ch01/1081-rag.html)
- [Based On Prowler Genai Build Fintech Intelligent Compliance 2](ch11/054-prowler-genai.html)
- [Aws Bedrock Agentcore Identity Security](ch11/247-aws-bedrock-agentcore.html)
- [Aws Cognito Multi Region Replication](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-cognito-multi-region-replication.md)
- [Restrict Access To Sensitive Documents In Your Amazon Q S3 Knowledge Bases](ch11/023-restrict-access-to-sensitive-documents-in-your-amazon-q-s3-k.html)

---

