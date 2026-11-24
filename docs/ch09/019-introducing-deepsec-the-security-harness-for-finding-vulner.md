# Introducing deepsec: The security harness for finding vulnerabilities in your codebase

> 📊 Level ⭐⭐⭐ | 12.3KB

> -> [Introducing deepsec: The security harness for finding vulnerabilities in your codebase](https://vercel.com/blog/introducing-deepsec-find-and-fix-vulnerabilities-in-your-code-base)

## 摘要
deepsec 是 Vercel（CTO Malte Ubl）2026 年 5 月开源的多 agent 安全扫描 harness：先以 regex 静态扫描定位安全敏感区域，再用 Opus 4.7（max effort）与 GPT 5.5（xhigh reasoning）编码 agent 执行 Investigate → Revalidate → Enrich → Export 流水线，把大型代码库中难以发现的漏洞转成可执行工单。它完全跑在用户自己的基础设施上、可直接复用现有 Claude/Codex 订阅，误报率约 10-20%，Vercel 自身的扫描常规扩展到 1000+ 并发沙箱。

## 核心要点
- **五阶段流水线**：Scan（regex-only 定位）→ Investigate（agent 逐文件追踪数据流）→ Revalidate（第二 agent 去误报、重分级）→ Enrich（git 元数据定位修复负责人）→ Export（格式化为人类与 coding agent 的工单指令）。
- **模型配置务实**：核心是 `claude` + `codex` 双引擎，Opus 4.7 跑 max effort、GPT 5.5 跑 xhigh reasoning。
- **不需要"cyber 模型"**：Anthropic/OpenAI 的 cyber 特调版本可用但非必需，off-the-shelf 模型即完全可用；deepsec 内置 refusal 分类器，在每个研究步骤后检查任务是否被拒——在其 prompt 设计下两家旗舰模型的 refusal 实际不成问题。
- **规模化靠 fanout**：单机扫描大仓库需要数天；可选 fanout 到 Vercel Sandboxes 远程并行执行，Vercel 扫自家代码库常规达到 1000+ 并发沙箱。
- **误报率 10-20%**：经 revalidate 交叉验证后仍保留这一水平，但 Vercel 基于 true positive 的实际安全影响认为值得接受。
- **custom scanner 是护城河**：Vercel 扫描自身 monorepo 发现 auth 条件的微妙边角案例后，专门开发了覆盖所有认证路径的自定义 scanner 插件（writing-matchers.md）。
- **开箱即用**：`npx deepsec init` 在仓库根目录生成 `./.deepsec` 目录，用于配置系统和存储调查 catalog。

## 深度分析

### 五阶段流水线：从 regex 定位到双 agent 交叉验证
deepsec 的架构代表了一种新型 AI-native 安全扫描范式：不是用 LLM 直接扫描代码（幻觉率高、误报率难以控制），而是将安全发现流程拆解为 Scan → Investigate → Revalidate → Enrich → Export 的多 agent 协作流水线。

**Scan 阶段**：对全部文件做 regex-only 扫描，仅定位 security-sensitive 区域，不做任何语义判断。这一步的作用是缩小后续 expensive agent 调查的范围——一个大仓库可能有数万文件，但 security-sensitive 区域往往集中在 auth、data-access、crypto、input-validation 等少数模块，静态分析先筛出候选文件即可避免对全库做昂贵的 agent 调查。

**Investigate 阶段**：agent 逐个调查 Scan 识别出的候选文件，追踪 data flow、检查已有 mitigations，产出带 severity 分级的 actionable findings。这一步把"哪里可能有洞"升级为"洞的成因、利用路径和严重程度"。

**Investigate + Revalidate 双 agent 设计**：第一 agent 深入调查可疑区域并产生初始 finding；第二 agent 独立 revalidate，去除 false positive 并重新分级。这是减少误报的核心机制——单 agent 的 self-consistency 无法有效过滤自身的认知偏差，双 agent 交叉验证提供了额外的置信度校准。

**Enrich + Export 阶段**：调查完成后，Enrich agent 使用 git 元数据及其他可选服务，识别每个问题应由哪些 contributors 负责修复——把"发现漏洞"直接接到"谁来修"；Export 命令则把 findings 格式化为指令，可直接转成给人类和安全工程 agent 的 tickets，完成从扫描到修复工单的闭环。

### 模型选择与 refusal 分类器
deepsec 底层同时驱动 `claude` 与 `codex` 两个编码 agent，配置为 Opus 4.7（max effort）与 GPT 5.5（xhigh reasoning）——即两家各自消费级/订阅档能拿到的最强推理档位，而非任何安全特调版本。

Anthropic 与 OpenAI 都提供"cyber"版本的旗舰模型——针对基础模型会拒绝的安全任务做了 fine-tune。deepsec 与这些版本兼容，但用 off-the-shelf 模型即可完全正常工作。关键在于 deepsec 内置了一个分类器，在每个研究步骤之后检查任务是否被模型拒绝。以 deepsec 实际使用的 prompt 而言，Opus 4.7 和 GPT 5.5 的 refusal 都"不是问题"（non-issue）——这说明精心框定的防御性安全研究 prompt 足以让通用模型稳定执行安全审查任务，组织无需为"安全专用模型"额外采购。

另一个成本侧的事实：deepsec 可在笔记本上直接运行，无需为特权源码访问搭建云服务；推理直接复用组织已有的 Claude 或 Codex 订阅，零额外配置。这把 agentic 安全扫描的门槛从"采购专用安全平台"降到了"用现有订阅跑一个 CLI"。

### 并行 fanout：单机数天到千级并发沙箱
在单台机器上扫描大型仓库可能耗时数天（multiple days）。为支持研究类任务并行化，deepsec 提供可选的 fanout 到 Vercel Sandboxes 远程执行——Vercel 对自家代码库的扫描"例行"扩展到 1000+ 并发沙箱（1,000+ concurrent sandboxes）。并行化正是 agentic scanning 突破时间瓶颈的关键：每个候选文件的 Investigate 都是独立的 agent 会话，天然适合横向扩展。

但需要注意：fanout 到 Vercel Cloud Sandbox 意味着你的代码会离开你的基础设施——对于金融、医疗、政府等强合规要求的行业，这是一个需要评估的 data residency 问题。好在本地单机路径始终可用，且 deepsec 的默认卖点恰恰是"跑在你自己的基础设施上"（dub.co 创始人明确点名"runs on infrastructure we control"是采用理由）——fanout 是可选加速项而非强制依赖。

### 生产验证、误报权衡与 custom scanner 生态
**误报率的工程含义**：Vercel 经验值约为 10-20% false positive。对于全自动修复流程（finds → tickets → agent fix），20% 误报意味着每 5 个工单中约 1 个无效；若修复 agent 未经验证直接 apply patch，会引入不必要的代码变更和 CI 噪音。Vercel 的立场是更关注 true positive 的影响而非误报率本身——考虑到 true positive findings 在其安全研究中的实际价值，这个比率是可接受的工程权衡，revalidate 步骤正是为压低它而建。

**第三方生产验证**：开发期间 Vercel 在多个客户/伙伴的开源仓库上运行了 deepsec。Unkey 联合创始人兼 CEO James Perkins 评价它是找过中最彻底、发现最多、true-positive 率最好的安全扫描工具。dub.co（affiliate 归因与短链接 SaaS，含认证访问、数据库交互和多个后端服务，安全面很大）创始人 Steven Tey 表示：收到的自动安全报告大多不可行动，deepsec 是第一个"surface 出我们真想让安全工程师去标记的问题"的工具，且运行在自己可控的基础设施上。

**Vercel 自用与 custom scanner 插件**：对自家 monorepo 的扫描发现了 auth 条件中的微妙边角案例（subtle edge cases in auth conditions），促使 Vercel 开发了覆盖代码中每一条认证路径的 custom scanner plugin。deepsec 的插件系统中最常用的就是 custom scanners——针对你的 auth 模型、data layer 或团队约定调优的 regex matchers。官方推荐的生成方式是把 deepsec 与你的 coding agent 结合，让它基于 initial scan 的发现来写 matchers，例如提示："Inspect previous runs against ./my-app. Are there custom deepsec matchers we should add to find more candidates for vulnerabilities?" 这形成了"首次扫描暴露共性问题 → agent 分析 pattern → 生成 codebase 专属 matchers → 扫描覆盖面递进加深"的正循环。

**上手路径**：在仓库根目录运行 `npx deepsec init`，生成 `./.deepsec` 目录承载系统配置与历次调查的 catalog，按命令输出继续即可。

## 实践启示
1. **适用场景判断**：deepsec 最适合应用层代码（web apps、后端 services），特别是有认证、数据访问、支付等高价值攻击面的系统；官方明言对 libraries/frameworks 大概率需要 custom prompts 和 scanners，效果可能不如应用层。
2. **集成到 SDLC**：建议将 deepsec 作为 CI 的 pre-merge gate，而非 post-deploy 扫描——越早发现安全漏洞，修复成本越低。但需配置好 revalidate 阶段以避免 10-20% 误报阻断正常开发流程。
3. **自定义 scanner 是关键护城河**：开箱即用的 scanner 覆盖面有限。Vercel 自身在扫描自己代码库后专门开发了覆盖所有认证路径的 custom plugin。可操作路径：用 initial scan 发现共性问题 → 让 coding agent 检查历次运行并分析 pattern → 生成针对你 codebase 的 custom matchers（官方示例 prompt 即"检查之前的运行，是否应该增加自定义 matchers"）。
4. **off-the-shelf 模型足够用**：Anthropic 和 OpenAI 的"cyber"版本并非必需。Opus 4.7 + GPT 5.5 在 deepsec 的 prompt 设计下 refusals 不是问题（且内置分类器逐步检查）。如果你的组织已有 Claude/Codex 订阅，不需要额外采购 cyber 模型或安全专用推理配额。
5. **团队安全知识不足时的价值**：deepsec 可以部分替代不够深入的内部安全 review——第三方反馈显示它能 surface 出"真想让安全工程师标记"的问题。但不能替代专业安全工程师：复杂逻辑漏洞、auth bypass 的边界情况、业务逻辑漏洞等仍需人类专家判断。

## 相关实体
> [主题导航](https://github.com/QianJinGuo/wiki-public/blob/main/moc/cybersecurity-privacy.md)

- [The best argument I've heard for why AI won't take your job](https://github.com/QianJinGuo/wiki-public/blob/main/entities/platformer-ai-job-loss-levie.md)

→ [原文存档](https://vercel.com/blog/introducing-deepsec-find-and-fix-vulnerabilities-in-your-code-base)

- [How Superset built the IDE for AI agents on Vercel](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vercel-com-how-superset-built-the-ide-for-ai-agents-on-vercel.md)

---

