# Versa takes aim at fragmented enterprise security with CSPM, orchestration update, and AI agent controls

## Ch04.011 Versa takes aim at fragmented enterprise security with CSPM, orchestration update, and AI agent controls

> 📊 Level ⭐ | 6.6KB | `entities/www-networkworld-com-versa-takes-aim-at-fragmented-enterprise-security.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/www-networkworld-com-versa-takes-aim-at-fragmented-enterprise-security.md)

## 摘要
Versa Networks 在 2026 年 5 月为其 VersaONE Universal SASE 平台发布三项协同更新：Cloud Security Posture Management (CSPM) 云安全态势管理、Concerto 13.1.1 编排平台升级，以及将于 5 月 21 日推出的 AI Agent 信任与验证框架。该公司同期发布首届《State of SASE + AI Report》，调查 525 名美国企业 IT 和安全决策者，结果显示 35% 的组织在过去一年因网络与安全团队之间的协调缺口而遭受安全漏洞，99% 将融合列为战略优先级，但仅有 30% 实现落地。

## 关键数据
- **35%** 的企业因网络与安全团队协调缺口导致安全漏洞 
- **73%** 的企业表示技术集成复杂性延误或搁置了关键项目 
- **99%** 将 SASE 融合列为战略优先级，但仅 **30%** 实现了共享所有权 
- **95%** 认为 AI 正在迫使网络与安全团队更紧密协作 
- 运行 50+ 供应商的企业项目延期概率是精简团队的两倍（61% vs 34%） 
- **80%+** 的组织称环境中已部署 AI，但 **<20%** 知晓具体用途 

## 三项核心更新
### 1. CSPM — 消除双门户问题
大多数企业同时运行 ZTNA/安全互联网网关（管理用户和设备态势）和独立 CSPM 工具（管理云配置风险），由不同团队操作，无共享上下文。Versa 将 CSPM 直接集成到 VersaONE，扩展访问安全至 AWS、Azure、GCP 和 OCI 的持续云风险可视化，遥测数据汇入 Concerto 编排平台，与访问风险数据协同分析。CEO Kelly Ahuja 表示："业界多年谈论统一风险情报，但所有人仍然依赖两个不同门户，没有方式真正共享上下文将其整合——这正是我们要解决的。"

### 2. Concerto 13.1.1 — 消除策略孤岛
该版本重新设计 SD-WAN 配置体验，统一 SD-WAN 和 SSE 的安全与认证配置文件，将"策略孤岛"合并为单一构造。新增分层策略模板，允许组织定义主策略并将其子集扩展至不同用户组和部门，无需从零重建。

### 3. AI Agent 信任与验证框架（2026-05-21 发布）
一个用户提示即可触发多个 AI Agent 启动，它们可在环境中对策略和配置进行更改，且许多操作对运营商不可见。Versa 的框架将策略访问控制应用于 Agent，充当管理和编排层内的验证网关，而非依赖人工审核——"将人置于循环只会拖慢速度，因为有大量事务需要观察和执行。"

## 深度分析
### 网络安全融合的结构性障碍
Versa 报告揭示了一个长期被忽视的结构性问题：企业网络基础设施和安全基础设施在组织上和技术上都处于割裂状态。99% 的受访企业将融合列为战略优先，但实际落地率仅 30%，这意味着绝大多数企业处于"知道但做不到"的困境。这种差距并非资源问题，而更多源于技术债务和组织惯性——现存的多供应商架构已深度嵌入业务流程，替换成本极高。

### Shadow AI 的安全盲区
报告中 80%+ 的组织在使用 AI，但 <20% 了解具体用途——这一"Shadow AI"问题比传统的 Shadow IT 更加隐蔽且危险。传统 Shadow IT 至少还知道有工具在运行，而 Shadow AI 的问题在于连"是否在使用"都缺乏感知。这直接解释了为什么 Agent 信任与验证框架会成为 Versa 的第三项更新：当 AI Agent 可以自主修改基础设施策略时，对抗性或失控的 Agent 行为将带来前所未有的攻击面。

### SASE 市场的整合压力
Google 以 32 亿美元收购 Wiz 将 CSPM 赛道推向资本热点，但 Versa 强调其 CSPM 规划早于该交易。这一表态的战略意图是清晰划定"自主研发"与"收购整合"的边界，避免被贴上"跟风"标签。

## 实践启示
### 对安全团队
1. **立即清点 Shadow AI**：大多数企业不知道自己环境中跑了什么 AI 工具，这是最优先的安全盲区。资产发现和 Agent 行为审计应成为标配。
2. **评估双门户融合路径**：如果你的团队同时运维 ZTNA 门户和 CSPM 门户，且缺乏统一上下文——这是可直接量化的效率损失，CSPM 集成可带来显著改善。
3. **建立 Agent 信任模型**：随着 Agentic AI 普及，"谁在批准 Agent 的配置变更"这个问题需要系统性回答，而非临时工单处理。

### 对网络架构团队
1. **Concerto 的分层策略模板**对多分支企业有直接价值：将总部主策略延伸至各区域/部门，减少重复配置，建议在评估 SD-WAN 升级时优先测试该功能。
2. **供应商数量与延期相关性**（50+ 供应商 → 61% 项目延期）是一个硬数据指标，可用于内部论证"简化技术栈"的商业合理性。

### 行业观察
Versa 的三路更新（CSPM + Orchestration + Agent Trust）勾勒出 SASE 平台的演进方向：**单平台融合**正在从营销概念走向工程现实。对于已有 Versa 部署的企业，这是评估平台扩展能力的窗口；对于新评估者，Concerto 13.1.1 的策略统一能力和 AI Agent 验证框架是差异化的技术买点。

## 相关实体
- [AI tool poisoning exposes a major flaw in enterprise agent security](ch04/069-ai.md)
- [AI tool poisoning — VentureBeat](ch04/069-ai.md)
- [企业级OpenClaw安全部署架构指南](ch11/213-openclaw.md)

---

