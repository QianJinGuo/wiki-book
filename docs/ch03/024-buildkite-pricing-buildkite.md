# Buildkite Pricing | Buildkite

## Ch03.024 Buildkite Pricing | Buildkite

> 📊 Level ⭐ | 7.5KB | `entities/buildkite-pricing-buildkite-v2.md`

# Buildkite Pricing | Buildkite

## 摘要

Buildkite 是采用 agent 架构的 CI/CD 平台：编排层（pipeline 调度、日志、API）完全托管，而构建代理（agent）由用户自托管在自己的机器或云上，构建环境 100% 可控。其定价页把能力拆为 Pipelines、Test Engine、Package Registries、Mobile Delivery Cloud 四个模块，并将计算资源分为 self-hosted、Mac hosted、Linux hosted 三类灵活组合。核心商业逻辑是"按用户（per-seat）订阅 + 自带算力"，与按构建分钟或积分计费的托管型竞品形成根本差异。

## 核心要点

- **架构核心**：用户在自己的基础设施上运行 `buildkite-agent`，Buildkite 只托管编排平面——pipeline 定义（YAML as code）、并行调度、日志与 API；构建镜像、缓存、网络、安全策略均由用户掌控。
- **定价维度**：按用户数（per-seat）订阅，自有 agent 上的构建不按分钟/积分计费；免费层面向小团队（约 3 用户），规模化后再付费——算力成本直接落在用户自己的账单上。
- **Flexible compute 分层**：self-hosted agents（默认选项，无构建时长费用）、Mac hosted agents（Apple 硬件按用量计费）、Linux hosted agents（较新的托管选项），覆盖异构硬件需求。
- **能力模块化**：Pipelines（核心流水线）、Test Engine（flaky test 识别/拆分/性能优化）、Package Registries（制品加速与安全加固）、Mobile Delivery Cloud（移动端签名与分发）可独立订阅组合。
- **Test Engine 的信号**：官方把"去 flaky、拆分测试、优化性能"产品化为独立模块，说明测试可靠性已被视为企业级 CI 的核心痛点，而非附属功能。
- **对比基准**：GitHub Actions 免费公开仓库分钟 + 托管 runner 按分钟计费；CircleCI 按 credit 计费；Buildkite 对长时构建、高并发、自定义硬件场景更友好。
- **2026 市场语境**：GitHub Actions 主导大众市场，但 AI/GPU 负载与安全合规需求正在推动"自托管 CI 复兴"，Buildkite 是该路线的代表性玩家。

## 深度分析

### 架构即商业模式：编排托管 + 执行自管

Buildkite 把 CI 拆成两个平面并分别定价：编排平面由 SaaS 托管（按 seat 收费），执行平面由用户自管（agent 跑在自己的机器上）。这带来三个直接后果。其一，用户获得完全的环境控制权——自定义镜像、GPU/专用硬件、内网依赖与缓存、数据不出墙的合规隔离，这是托管 runner 无法提供的。其二，运维成本被显式转移给用户：agent 集群的扩缩容、升级、密钥管理、spot 实例中断容错都要自己维护，小团队可能低估这笔隐性成本。其三，定价上 Buildkite 只对编排层收费，用户已有算力（内部服务器、包年云实例、空闲开发机）的边际成本趋近于零。这与 GitHub Actions 托管 runner 的"零运维但受限于 runner 规格"形成光谱两端，Jenkins 则处于"两端都自管"的极端。

### Per-seat 定价 vs 分钟/积分计费的经济学

三种主流计费模型对应三种成本结构。Buildkite 的 per-seat 模型把费用与构建时长彻底解耦：编译密集型、E2E 长任务、高并发 burst 都不产生额外费用（只要 agent 是自有的），适合 monorepo 和大型回归套件。GitHub Actions 的托管 runner 按分钟计费，公开仓库免费——这是其成为开源事实标准的关键，但私库分钟数有限，长时构建成本线性上升。CircleCI 的 credit 制粒度细、按容器规格浮动，成本预测难度最高。选型判据可以简化为一句话：构建短而频繁、用标准 runner 即可的团队适合分钟制；构建长、并发高或硬件特殊的团队适合"per-seat + 自带算力"。免费层差异也值得注意：Buildkite 免费层限制的是用户数而非算力，小团队可以无限量使用自有机器。

### 能力模块化：从"构建执行"到"发布全链路"

定价页展示的四模块组合，揭示 CI 竞争已从"执行效率"转向"发布全链路"。Pipelines 是入口；Test Engine 把 flaky test 治理产品化，呼应工程社区多年共识——flaky tests 直接侵蚀构建可靠性与团队对 CI 的信任；Package Registries 瞄准制品缓存提速与供应链安全（签名、SBOM、访问控制），对应 2024 年以来软件供应链攻击频发的现实；Mobile Delivery Cloud 独立面向 iOS/Android 的签名、TestFlight/商店分发、OTA 更新等与 Web CI 本质不同的流程。对采购方而言，单一价格点已被模块组合取代，评估时必须按自身工作流计算组合总账（TCO），而非只比 seat 单价。

### 2026 语境：AI 负载与自托管复兴

两条趋势正在重塑 CI 市场。其一，AI/ML 团队需要 GPU 构建（训练流水线、模型打包、推理镜像）、大体积 artifact 缓存和数据合规边界，托管 runner 的规格与配额对此并不友好，自托管路线成为刚需；Buildkite"编排托管 + 执行自管"的中间态，比纯自建（Jenkins）更省心，比纯托管更灵活。其二，AI 编程让代码产出量激增，CI 负载结构从"少量大构建"转向"海量小提交 + 高并行 job"，per-seat 模型下订阅成本不随负载线性上升，对 AI 驱动的高频发版节奏天然友好；CI/CD 也因此成为 AI Agent 时代"敢不敢发"的信任闸门。

## 实践启示

1. **分开算两本账再比价**：Buildkite 的 TCO = seat 订阅费 + 自有算力机会成本；对比 GitHub Actions 的分钟数 × 单价、CircleCI 的 credit 数 × 单价时，用真实负载回放（取一个月的 pipeline 元数据）测算，不要比目录价。
2. **识别适合 agent 架构的信号**：平均构建时长 >15-20 分钟、并发需求高、需要 GPU/特定硬件/内网依赖或数据不出墙的团队，优先评估 Buildkite 路线；反之，小步快跑、标准 runner 够用的团队留在 GitHub Actions 更划算。
3. **自托管要同步做供应链治理**：agent 集群的密钥管理、镜像来源、升级策略本身就是攻击面，参考 Jenkins 插件供应链攻击的教训，将 agent 纳入安全基线管理。
4. **按工作流模块化采购**：先只上 Pipelines 跑通主链路；flaky 治理成本高时再评估 Test Engine；移动端发布量大时再评估 Mobile Delivery Cloud，避免为用不上的模块付费。
5. **小团队先白嫖免费层**：免费层按用户数而非算力限制，适合用自有机器起步；但规模化前要预判 seat 增长曲线——per-seat 定价在团队人数快速膨胀时可能反超分钟制。
6. **用弹性 agent 池摊薄算力**：若已有 Kubernetes 或 spot 实例，配合 autoscaling 的弹性 agent 池是 Buildkite 路线最容易被低估的成本优化点。

## 相关实体

- [Buildkite Pricing（旧版条目）](ch03/024-buildkite-pricing-buildkite.html)
- [Hermes Cron vs GitHub Actions：自动化对比](https://github.com/QianJinGuo/wiki/blob/main/comparisons/hermes-cron-vs-github-actions.md)
- [AI Is Writing More Code. Your CI Pipeline Can't Keep Up](../ch01/1103-ai-is-writing-more-code-your-ci-pipeline-can-t-keep-up.html)
- [AI Agent 时代的 CI/CD 生存指南](../ch04/377-ai-agent.html)
- [GitLab 裁员与 Agent 平台扩张](ch03/006-agent.html)
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

---

