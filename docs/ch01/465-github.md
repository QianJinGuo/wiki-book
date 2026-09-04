# 明星开源项目，为什么开始离开 GitHub？

> 📊 Level ⭐⭐⭐ | 7.1KB | `entities/open-source-projects-leaving-github.md`

# 明星开源项目，为什么开始离开 GitHub？

## 摘要

2026 年 4 月，Mitchell Hashimoto（GitHub 用户 1299，2008 年加入，日均使用近 18 年）宣布其终端模拟器 Ghostty 项目将离开 GitHub，主因是平台持续性的基础设施故障已让 PR 审查、Actions 等核心开发工作几乎每天受阻。GitHub COO Kyle Daigle 公开致歉并承诺以实际改进挽回用户，而 Hashimoto 计划渐进移除依赖、保留只读镜像。这一事件将 GitHub 自 2018 年被微软收购后可靠性下滑的问题与开源社区的信任危机推至台前。

## 核心要点

- 离开主因是基础设施可靠性而非意识形态：GitHub 几乎每天发生故障，阻断 PR 审查、Actions 等核心工作流，Hashimoto 直言「不再适合严肃开发」
- Hashimoto 用「故障日记」方法记录影响工作的每一天，连续一个月「几乎每天一个 X」，把主观不满转化为客观决策依据
- 迁移策略为「渐进移除依赖 + GitHub 只读镜像」，保留原 URL 与社区可见度，个人项目则暂留 GitHub
- GitHub COO Kyle Daigle 迅速公开回应并致歉，承诺以实际改进而非空话挽回用户，显示平台方将此视为信任危机
- 公开统计显示 2018 年微软收购 GitHub 后平台宕机增多，可靠性下滑存在结构性背景
- Hashimoto 预先反驳「Git 是分布式的」论调：问题不在版本控制本身，而在 issues、PR、Actions 等集中托管的协作基础设施

## 深度分析

### 可靠性的「私人化」：一份 18 年重度用户的离场报告

Hashimoto 的告别信本质上是重度用户流失的典型案例。作为平台用户 1299，他将人生半数以上的日常时间投入 GitHub，甚至坦承 Vagrant 的起点源于「希望 GitHub 雇我」的梦想。正因如此，他的批评带有强烈的私人情绪——「我对 GitHub 的爱超过了一个人对一件东西应有的爱」。但在情绪化表述之下是严格的自我记录方法：连续一个月为每个受故障影响的工作日打 X，结果是「几乎每天一个 X」。可靠性问题由此从体感层面的「变差了」转化为可量化、可沟通的工程事实，也让离开决定建立在数据而非冲动之上。

### 单点依赖的结构性风险：Git 分布式 ≠ 协作基础设施分布式

Hashimoto 在脚注中预先回应了「Git 是分布式的」这一常见反驳：问题不在版本控制本身，而在围绕它生长出来的协作基础设施——issues、PR、Actions 等集中托管功能。这些功能构成开源项目的「运营操作系统」，一旦托管方故障，整个协作流程即被阻断。值得注意的是，他特别澄清 2026 年 4 月 27 日的大规模 Elasticsearch 故障并非决策触发点（博文早于该事件一周写成），说明高频的日常性小故障比偶发的大事故更具累积破坏力。对依赖单一平台的开源项目而言，这是典型的单点故障（single point of failure）暴露，与 [GitHub 平台安全事件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/github-investigating-teampcp-claimed-17cc77.md) 共同勾勒出集中托管的风险全貌。

### 平台治理与商业收购的张力

事件背景是 2018 年微软收购后 GitHub 宕机频率上升的公开统计。收购带来的商业利益（Copilot 变现、企业级市场扩张）与开源社区对开放、中立平台的期待之间存在结构性张力。GitHub 的回应姿态——COO 公开致歉、承诺「以实际改进而非空话」——显示平台方将此视为信任危机而非单纯运维事故；但 Hashimoto「必须建立在真实结果和改进之上」的表态说明，信任一旦破裂，仅靠姿态难以修复。这与 Copilot 训练数据争议等议题同属一个叙事：平台所有权集中与社区价值观的持续摩擦，也是开源项目评估托管方时不可回避的治理维度。

### 迁移的示范效应与双轨策略

Ghostty 的迁移选择了务实的渐进路径：先制定依赖移除计划、逐步执行，GitHub 上保留只读镜像且 URL 不变；个人项目暂不迁移，仅将受影响最大的 Ghostty 作为重点。这既是工程上的稳妥选择，也保留了网络效应——URL 不变、镜像可读、社区可见度不中断，为维护者与贡献者争取了适应窗口。作为高能见度的个人项目，其公开、分步、可验证的迁移流程为其他「想走但犹豫」的项目提供了操作模板，也呼应了 [开源项目的消亡方式](125-dumb-ways-for-an-open-source-project-to-die.html) 中关于项目治理与平台依赖的讨论；双轨制有望从个案演化为开源项目的标准退出范式。

## 实践启示

1. 用数据代替情绪做平台决策：像 Hashimoto 一样持续记录故障对实际工作的影响（故障日记），积累一个月量级的数据后再判断是否迁移，避免单次宕机触发冲动决策。
2. 识别真正的单点依赖：Git 分布式不等于协作基础设施分布式，issues、PR、CI 等集中托管环节才是真实风险面，退出规划应围绕这些依赖逐一展开。
3. 迁移采取渐进双轨制：主仓库迁移 + 只读镜像保留，维持原 URL 与可见度，为社区适应和平台验证留出时间窗口。
4. 评估替代平台时关注治理与所有权：GitLab、Forgejo 等自托管或社区所有权选项与商业平台的价值取向不同——选择托管方本质上是治理优先级的选择，例如 [GitLab 2026 裁员](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gitlab-layoffs-memo-2026-5.md) 显示替代平台同样面临商业压力。
5. 高价值开源项目应预先制定「平台退出路线图」：包括依赖清单、镜像策略、社区沟通节奏，而非等到信任崩塌时仓促应对。
6. 将平台商业收购史纳入可靠性评估的参照系：以 2018 年微软收购为节点观察宕机趋势，评估平台路线图与自身项目价值观的长期兼容性。

## 相关实体

- [Microsoft Copilot Studio Agent Governance](https://github.com/QianJinGuo/wiki-public/blob/main/entities/microsoft-copilot-studio-agent-governance.md)
- [Microsoft Mxc Execution Containers Agent Sandbox Origin](https://github.com/QianJinGuo/wiki-public/blob/main/entities/microsoft-mxc-execution-containers-agent-sandbox-origin.md)
- [Github Copilot Individual Plans Flex Allotments](https://github.com/QianJinGuo/wiki-public/blob/main/entities/github-copilot-individual-plans-flex-allotments.md)
- [Joyai Echo Long Video Framework Jd](https://github.com/QianJinGuo/wiki-public/blob/main/entities/joyai-echo-long-video-framework-jd.md)
- [Openchronicle Memory Layer](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openchronicle-memory-layer.md)
- [github multilingual repositories dataset — 4000 万仓库多语言元数据](https://github.com/QianJinGuo/wiki-public/blob/main/entities/github-multilingual-repositories-dataset-cc0.md)
- [开源项目的消亡方式](125-dumb-ways-for-an-open-source-project-to-die.html)
- [GitHub 平台安全事件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/github-investigating-teampcp-claimed-17cc77.md)
- [GitLab 2026 裁员](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gitlab-layoffs-memo-2026-5.md)

→ [原文存档](https://mp.weixin.qq.com/s/SXo130s5EozluTMMhgZLkg)

---

