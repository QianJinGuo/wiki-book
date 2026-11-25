# AI Is Writing More Code. Your CI Pipeline Can't Keep Up

> 📊 Level ⭐⭐⭐ | 10.8KB

## 核心要点
- AI 工具正加速代码生成，CI 流水线面临吞吐量压力
- 测试覆盖率与安全扫描需要重新设计以适应 AI 生成代码
- 人机协作模式正在重塑 CI 流程
- 智能测试选择（Intelligent Test Selection）成为解决路径

## 深度分析

AI 辅助开发正在从根本上改变代码生产节奏。Stack Overflow 2025 年调查显示，大多数开发者已在工作流中使用 AI，其中半数每日使用。引入 AI 后，工程师的 PR 输出平均提升近 65%。

**代码生成量爆炸性增长与 CI 成本的结构性矛盾。** 以 500 名开发者、每人每天触发 5 条流水线计算，每天产生 2,500 次流水线运行；若每次执行 1,000 个测试，则每天运行 250 万次测试。在 AI 加速代码生成的背景下，这个数字可能增至 410 万次。传统"运行全部测试"模式在企业级规模下已不可持续。

**测试执行是 CI 成本的主要来源。** 构建步骤短暂且可预测，部署频率更低。真正消耗时间和资源的是测试阶段。根据 CloudBees Smart Tests 生产基准，测试可长达 45 至 90 分钟；50 名工程师团队运行 60 分钟测试套件，每年产生的 CI 浪费超过 25 万美元。更严峻的是，约三分之一的 CI 失败是 flaky test——由基础设施噪声或时序问题触发，与代码变更无关，属于纯浪费。

**"Run Everything" 模型的失效。** 历史上对每次变更运行完整测试套件的设计，适合较小代码库和较慢的开发周期。在企业级规模下，这迫使团队在"全量测试导致更慢流水线和高 CI 成本"与"减少测试导致发布信心下降"之间二选一。AI 的采用放大了这一矛盾：AI 帮助开发者更快写代码，但每次额外变更都触发更长的流水线，开发者花费更多时间等待反馈、重跑测试和调查失败。

**智能测试选择的技术路径。** 智能测试选择（Intelligent Test Selection）分析代码库中的变更内容，识别最可能捕获问题的测试，然后优先执行这些测试而跳过对该次变更无价值的测试。以支付验证逻辑变更为例，传统流水线仍触发针对搜索、用户资料等无关功能的 UI 测试，以及通知和报表系统的集成测试，最终可能运行数千个测试。智能选择后，流水线仅聚焦于支付逻辑相关的约 100 个高相关测试。

**实际收益的量化体现。** 采用智能测试选择后，CloudBees 某客户每测试小时节省 3 至 5 个云虚拟机实例，每年重新分配超过 40,000 工程小时用于构建而非等待、重跑和调试。该客户年度发布频率从季度发布翻倍至月度发布。回归测试时间缩短高达 80%，预提交测试从 6 小时降至 2 小时。

## 实践启示

**1. 重新审视 CI 成本结构。** 大多数组织将云支出聚焦于生产系统（应用、数据库、API），而忽视 CI 流水线的计算消耗。在 AI 加速代码产出的背景下，CI 已成为最大且增长最快的计算支出来源之一。团队应建立 CI 成本可见性，将流水线纳入基础设施成本优化范畴。

**2. 从"全量执行"转向"相关性驱动执行"。** 传统思维是运行所有测试以保证质量，但在 AI 加速开发的企业级规模下，这反而侵蚀了 AI 带来的生产力收益。应转向"基于变更内容运行最相关的测试"的模式，在保持发布信心的同时缩短反馈周期。

**3. 将 flaky test 治理作为优先事项。** 约三分之一的 CI 失败是 flaky test 导致的纯浪费。在 AI 生成代码量激增的背景下，这个比例可能进一步上升。治理 flaky test 不仅是工程效能问题，也直接影响 CI 成本和开发者体验。

**4. 在引入 AI 工具时同步规划测试策略。** AI 提升代码产出速度，但如果 CI 流水线没有相应升级，更快的代码生成反而导致更长的等待时间。AI 辅助开发应该与智能测试选择、CI 优化作为同一个系统来设计。

**5. 衡量真正的工程效能指标。** 除了代码产出量，还应关注流水线完成时间、工程师等待时间、重跑率等指标。一 个 6 小时预提交测试降至 2 小时带来的工程效能提升，远比单纯的代码行数增长更有价值。

## 相关实体
- [Ai Can Write Code Cios Operating Model](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-can-write-code-cios-operating-model.md)
- [Aws Network Firewall Ai Conflict Detection Bedrock](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-network-firewall-ai-conflict-detection-bedrock.md)
- [从提需求到部署发布全Ai全自动化后研发效能全面跃升](https://github.com/QianJinGuo/wiki-public/blob/main/entities/从提需求到部署发布全ai全自动化后研发效能全面跃升.md)
- [Control Where Your Ai Agents Can Browse With Chrome Enterprise Policies On Amazo](https://github.com/QianJinGuo/wiki-public/blob/main/entities/control-where-your-ai-agents-can-browse-with-chrome-enterprise-policies-on-amazo.md)
- [Npm Supply Chain Compromise Postmortem](https://github.com/QianJinGuo/wiki-public/blob/main/entities/npm-supply-chain-compromise-postmortem.md)

→ [原文存档](https://www.cloudbees.com/blog/ai-is-writing-more-code-your-ci-pipeline-cant-keep-up)

## 第 2 来源 — Anthropic 内部 CI 过载事故（Agentic coding 撑爆测试影响分析服务）

**第一方数据：80% 代码由 Claude 写、人均交付 8 倍、CI 任务半年 25 倍。** Anthropic 在官方博客中披露内部真实数据：全公司 **80% 的代码由 Claude 编写**，工程师平均每季度交付的代码量达到 2021—2025 年平均水平的 **8 倍**；Claude 不只在写代码，还在 PR 审查与合并批准环节承担大量主力工作，测试用例规模半年内激增 **10 倍**、CI 运行任务量飙涨 **25 倍**。

**行为模式差异是根因，而不是工具不好用。** 人类工程师一天能提交的 PR 数量有限、倾向把相关改动打包成中大型 PR，且有休息低谷期让 CI 集群消化任务；Claude 偏爱粒度极细、体量更小的 PR（一个小修改就是一个 PR），且 24×7 不间断地跑任务、提代码、做重构，把原本的系统低谷期彻底抹平。

**三次「快速止血」一次比一次短命。** 团队打造了确定性测试影响分析服务，核心是两个组件：**Listener**（记录每次 CI 运行的测试结果）与 **Selector**（根据历史结果决定每个 PR 该跑哪些测试）。为保证测试历史严格按时序记录，系统最初设计为**单进程写入（Singleton）**，但面对每秒倾泻而来的数千上万并发任务，Listener 开始严重滞后——在 AI 原生开发周期里哪怕落后 20 分钟，就会导致数万次测试状态无法同步给 Selector，进而错误代码被合并、偶发失败阻塞合流、新增/修复的测试无法及时生效。止血动作依次是：Patch 1 换更大的机器（核数翻倍，撑了 **70 天**）、Patch 2 分片（每个 package 一个独立 shard worker，撑了 **29 天**）、Patch 3 每日定时重启（2026 年 3 月单体服务每个工作日午后触发内存上限 OOM，团队只找到 4 个微小 Bug、替换 Go/Rust 内存分配器优化 GC 也无效，且在不敢做生产环境内存分析的前提下启用每日重启，结果连一天都没撑住，造成任务数据丢包、Listener 落后 1 小时以上、全公司 CI 大面积瘫痪）。

**推倒重来：剥离单体内存状态，转向分布式无状态。** 最终团队听从 Claude 几个月前的建议，彻底推倒重来：引入内存数据存储 —— 异步轻量汇聚 —— Selector 秒级只读解耦；上线切换并完成调优后，此前每周疯狂攀升、动辄堆积数十万的未处理事件队列瞬间被拉成一条贴地的水平直线。

**结论 pivot：从「程序员会不会失业」到「整套软件工程体系会不会过载」。** 这次事故的意义在于验证了一个更根本的判断——AI 编程真正带来的冲击，已经从「程序员会不会失业」进入「整套软件工程体系会不会过载」；一个过去不起眼的单实例服务，完全可能成为整个团队等待的地方；AI 编程的竞争正在从代码生成能力延伸到整套工程体系的承载能力。换言之，代码可以一夜暴增，交付能力必须跟上。

- （heuristic，落入已文档化的 semi_technical 天花板——tech_hits∈[3,4] 系统性低估；人工 domain gate 判为**可迁移的工程体系容量问题**，与本文第 1 来源同题互补）
- 互补角度 5 条：
  1. **第一方量化数据**：80% 代码由 AI 编写 / 人均交付 8× / CI 任务 25× / 测试用例 10×（第 1 来源为供应商视角的行业推算，无第一方事故数据）
  2. **失败时间线**：三次补丁生存期 70 天 → 29 天 → 不足 1 天（换机器 / 分片 / 每日重启），以及每工作日午后 OOM 的崩溃形态
  3. **根因机制**：单点写入 Listener 在 AI 高并发下的**滞后语义**（落后 20 分钟 = 数万测试状态不同步 = 错误代码被合并）
  4. **架构解法**：剥离单体内存状态 → 内存数据存储 + 异步轻量汇聚 + Selector 秒级只读解耦，未处理事件队列从数十万降到贴地水平
  5. **叙事 pivot**：把问题从「程序员是否失业」重新定义为「工程体系承载能力」，与第 1 来源的「智能测试选择降本」视角互为表里
- 一手来源：Anthropic 官方博客《Agentic coding is straining CI — here's how we scaled test impact analysis at Anthropic》<https://claude.com/blog/agentic-coding-is-straining-ci-heres-how-we-scaled-test-impact-analysis-at-anthropic>（经新智元 2026-09-18 报道；另参考 Addy Osmani <https://x.com/addyosmani/status/2099577600159158765>）

→ [第 2 来源原文](https://mp.weixin.qq.com/s?__biz=MzI3MTA0MTk1MA==&mid=2652727030&idx=2&sn=7d889f9e50e3d7b224d31b211d9a1d9c)

---

