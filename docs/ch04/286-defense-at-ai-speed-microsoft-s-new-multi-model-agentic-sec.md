# Defense at AI speed: Microsoft's new multi-model agentic security system

## Ch04.286 Defense at AI speed: Microsoft's new multi-model agentic security system

> 📊 Level ⭐⭐ | 9.3KB | `entities/defense_at_ai_speed_microsofts_new_multi.md`

## 核心要点
- Microsoft 发布 **MDASH**（Microsoft Security multi-model agentic scanning harness），一个编排 100+ specialized AI agents 的多模型漏洞发现系统 
- 在 StorageDrive 测试驱动（21 个植入漏洞）中实现 **21/21 发现、零假阳性**；在 CyberGym 公开基准（1,507 真实漏洞）上达到 **88.45%**，排名第一 
- 回顾性测试：CLFS.sys 五年 MSRC 案例召回率 **96%**，TCPIP.sys 召回率 **100%** 
- 2026 年 5 月 Patch Tuesday 披露的 16 个新 CVE 中，有 4 个 Critical 远程代码执行漏洞由 MDASH 发现 
- 核心结论：**系统的工程价值在模型本身，而非任何一个模型** 

## 深度分析
### 背景：从 DARPA AI Cyber Challenge 到微软内部规模化
MDASH 背后的团队（Autonomous Code Security，ACS）部分成员来自 Team Atlanta——后者在 DARPA AI Cyber Challenge 中赢得 2,950 万美元奖金，展示了可自主发现并修复复杂开源项目中真实漏洞的 AI 系统。MDASH 代表这一技术路线从研究演示向微软生产环境的工程化迁移 。
微软自身代码库的安全审计面临三个独特挑战 ：
**大规模专有代码表面**：Windows、Hyper-V、Azure 等核心代码从未出现在任何公开模型的训练语料中，涉及内核调用约定、IRP/Lock 不变量、IPC 信任边界等，需要模型真正进行推理而非模式匹配。
**规模化 DevSecOps**：每个发现都有真实负责人、分诊流程和 Patch Tuesday 截止日期——如果工具产生噪音，噪音就是所有人的问题。
**高价值目标**：Windows、Hyper-V、Xbox、Azure 服务数十亿用户，发现单个高难度漏洞的收益极高，但在一级组件中出现假阳性的代价同样极高。

### MDASH 架构：多模型 Agentic Pipeline
MDASH 的设计哲学是**管道是产品，模型是输入之一**。整个系统分为五个阶段 ：
**Prepare 阶段**：摄入代码目标，构建语言感知索引，分析历史提交以绘制攻击面和威胁模型。
**Scan 阶段**：specialized auditor agents 对候选代码路径进行审计，输出带有假设和证据的候选发现。
**Validate 阶段**：第二组 agents（debaters）辩论每个发现的可达性和可利用性。
**Dedup 阶段**：基于语义等价性（如基于补丁的分组）合并重复发现。
**Prove 阶段**：在漏洞类型允许的情况下构造并执行触发输入，动态验证前条件并生成 PoC。
三个关键工程决策使这一架构得以落地 ：
**多模型 Ensemble**：SOTA 模型作为重推理者；distilled 模型作为高吞吐量的低成本 debater；第二个独立 SOTA 模型提供独立反驳观点。当 auditor 标记某处为可疑而 debater 无法反驳时，该发现的置信度上升。
**100+ Specialized Agents**：auditor、debater、prover 各自有不同的 prompt 策略、工具集和停止标准——而非期望单个 agent 识别、验证和利用漏洞一次完成。
**可扩展插件体系**：管道允许领域专家注入基础模型本身无法看到的信息，如内核调用约定、IRP 规则、Lock 不变量、IPC 信任边界、编解码器状态机等。CLFS proving plugin 是一个典型案例：它理解磁盘容器布局和内存状态机，能够为候选发现构造触发日志。

### 两类典型漏洞的单模型盲区分析
文章详细分析了两类单模型系统无法发现的漏洞模式 ：
**CVE-2026-33827（tcpip.sys SSRR UAF）**：Path 引用的释放和后续重用被非平凡控制流分隔——包括替代分支、多个验证检查和早期退出条件——这打破了多数检测器依赖的简单"释放后使用"模式。关键的区分信号也不在 immediate 上下文中：同一逻辑操作在别处存在正确版本，需要跨文件推理才能识别该调用点是异常而非明显误用 。
**CVE-2026-33824（IKEv2 双释放）**：该漏洞跨越六个源文件（`ike_A.c` 到 `ike_F.c`），是一个别名生命周期 bug：`ike_A.c` 中的错误 memcpy 创建了浅拷贝（克隆结构体字节而非其指向的堆分配），导致两个代码路径持有同一指针并各自认为拥有所有权，最终触发确定性双释放。无单文件分析能看见此问题 。

### 基准测试结果与局限
| 基准 | 结果 | 说明 |
|---|---|---|
| StorageDrive（21 个植入漏洞） | 21/21，零假阳性 | 私有代码，未被任何模型训练数据见过 |
| CLFS.sys 五年 MSRC 案例 | 28 中 27（96%） | 回顾性测试 |
| TCPIP.sys 五年 MSRC 案例 | 7/7（100%） | 回顾性测试 |
| CyberGym（1,507 OSS-Fuzz 漏洞） | **88.45%**，第一 | 公开基准，领先第二名约 5 分 |
失败分析显示两类问题 ：82% 的错误发现来自描述模糊（缺少函数或文件标识符）的任务；另外存在输入格式不匹配（libFuzzer 格式 vs. honggfuzz 格式）。

## 实践启示
### 对安全团队
**重新评估漏洞发现工具的评估维度**：不应再问"它用了哪个模型？"，而应问"它用模型做什么，以及在下一个模型到来时什么能保留？"——MDASH 的 pipeline 设计和 plugin 扩展性使客户的上下文、配置和校准投资可以跨模型代际迁移 。
**验证能力是区分工具的关键**：能标记候选 bug 的扫描器本质上只产生分诊待办事项；能 debate、dedup 并 prove 的系统才能产出 Patch Tuesday 补丁。选择 AI 漏洞工具时应重点评估其验证 pipeline 的完整程度 。
**私有代码库的盲区是真实风险**：微软的 benchmark 特意基于从未公开的 StorageDrive 验证了模型能力——如果模型在公开代码上训练过，企业使用的扫描结果可能有"训练数据污染"偏差 。

### 对 AI/ML 工程师
**多 agent 协作 > 单 agent 全能**：MDASH 的核心洞察是单 agent 无法可靠完成识别→验证→利用的全流程；跨角色（auditor/debater/prover）的专门化和 debate 机制是性能差异的主要来源 。
**Distilled 模型在验证阶段有高性价比**：Distilled 模型作为 debater 在高吞吐量 passes 中成本远低于 SOTA 模型，而性能足够——这为构建经济可扩展的验证 pipeline 提供了参考 。
**插件体系是架构复用的关键**：将领域知识（文件系统 invariants、内核约定）封装为插件而非直接编码进模型，使同一个管道能跨代码库复用，同时也让领域专家无需了解 LLM 内部即可贡献 。

### 对企业安全战略
**AI 漏洞发现的工程化拐点已至**：MDASH 的 16 CVE 披露和 CyberGym 88.45% 排名表明这一技术已越过研究好奇阶段，成为可生产的防御工具——企业应开始评估并试点集成到现有安全工程流程 。
**模型选择的后遗症**：任何价值绑定在特定模型上的系统都面临每六个月的重建周期；架构应围绕 model-agnostic 的核心组件（targeting、validation、dedup、prove）设计 。
**多模型 ensemble 作为防御姿态**：单一模型 harness 存在系统性盲区（跨文件推理、非平凡控制流、长生命周期依赖）；ensemble 架构通过 disagreement-as-signal 的方式实际上内置了交叉验证机制 。
## 相关实体
- [Microsoft Open Sources Rampart Clarity](https://github.com/QianJinGuo/wiki/blob/main/entities/microsoft-open-sources-rampart-clarity.md)
- [Where Openclaw Security Is Heading Openclaw Blog](../ch12/032-where-openclaw-security-is-heading-openclaw-blog.html)
- [Disgruntled Researcher Microsoft Zero Days](https://github.com/QianJinGuo/wiki/blob/main/entities/disgruntled-researcher-microsoft-zero-days.md)
- [Microsoft Zero Days Researcher Disgruntled](https://github.com/QianJinGuo/wiki/blob/main/entities/microsoft-zero-days-researcher-disgruntled.md)
- [Sysdig Headless Cloud Security](https://github.com/QianJinGuo/wiki/blob/main/entities/sysdig-headless-cloud-security.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/defense_at_ai_speed_microsofts_new_multi.md)

- [The Agency Model Dangers](https://github.com/QianJinGuo/wiki/blob/main/concepts/the-agency-model-dangers.md)
- [企业级多-agent-规模化落地怎么做群虾智能-ai-沙龙-ppt-限时领取](../ch03/046-agent.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/multi-agent-coordination.md)

---

