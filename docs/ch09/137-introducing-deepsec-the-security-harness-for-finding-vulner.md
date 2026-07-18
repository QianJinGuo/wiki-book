# Introducing deepsec: The security harness for finding vulnerabilities in your codebase

## Ch09.137 Introducing deepsec: The security harness for finding vulnerabilities in your codebase

> 📊 Level ⭐⭐ | 4.5KB | `entities/introducing-deepsec-find-and-fix-vulnerabilities-in-your-code-base.md`

> -> [Introducing deepsec: The security harness for finding vulnerabilities in your codebase](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/introducing-deepsec-find-and-fix-vulnerabilities-in-your-code-base.md)

## 深度分析
deepsec 的架构代表了一种新型 AI-native 安全扫描范式：不是用 LLM 直接扫描代码（幻觉率高、误报率难以控制），而是将安全发现流程拆解为 Scan → Investigate → Revalidate → Enrich → Export 的多 agent 协作流水线。
**Scan 阶段**：纯 regex，仅定位 security-sensitive 区域，不做任何语义判断。这一步的作用是缩小后续 expensive agent 调查的范围——一个大仓库可能有数万文件，但 security-sensitive 区域往往集中在 auth、data-access、crypto、input-validation 等少数模块。
**Investigate + Revalidate 双 agent 设计**：第一 agent 深入调查可疑区域并产生初始 finding；第二 agent 独立 revalidate，去除 false positive 并重新分级。这是减少误报的核心机制——单 agent 的 self-consistency 无法有效过滤自身的认知偏差，双 agent 交叉验证提供了额外的置信度校准。
**10-20% 误报率的意义**：对于全自动修复流程（finds → tickets → agent fix），20% 误报意味着每 5 个工单中约 1 个是无效的。如果修复 agent 在未验证的情况下直接 apply patch，会引入不必要的代码变更和 CI 噪音。Vercel 的实践中，他们更关注 true positive 的影响而非误报率本身——对于有真实安全影响的漏洞，20% 误报是可以接受的工程权衡。
**Vercel Sandboxes 的 fanout 能力**：对于超大型 monorepo（Vercel 自身跑出 1000+ concurrent sandboxes），并行化扫描解决了 agentic scanning 的时间瓶颈。但需要注意：fanout 到 Vercel Cloud Sandbox 意味着你的代码会离开你的基础设施——对于金融、医疗、政府等强合规要求的行业，这是一个需要评估的 data residency 问题。

## 实践启示
- **适用场景判断**：deepsec 最适合应用层代码（web apps、后端 services），特别是有认证、数据访问、支付等高价值攻击面的系统。对于 library/framework 代码，需要自定义 scanner 和 prompt，效果可能不如应用层。
- **集成到 SDLC**：建议将 deepsec 作为 CI 的 pre-merge gate，而非 post-deploy 扫描。越早发现安全漏洞，修复成本越低。但需要配置好 revalidate 阶段以避免阻断正常开发流程。
- **自定义 scanner 是关键护城河**：开箱即用的 scanner 覆盖面有限。Vercel 自身在扫描自己代码库后专门开发了覆盖所有认证路径的 custom plugin。建议：用 initial scan 发现共性问题 → 让 coding agent 分析 pattern → 生成针对你 codebase 的 custom matchers。
- **off-the-shelf 模型足够用**：Anthropic 和 OpenAI 的"cyber"版本并非必需。 Opus 4.7 + GPT 5.5 在 deepsec 的 prompt 设计下 refusals 不是问题。如果你的组织已有 Claude/Codex 订阅，不需要额外采购 cyber 模型。
- **团队安全知识不足时的价值**：deepsec 可以部分替代不够深入的内部安全 review。但不能替代专业安全工程师——复杂逻辑漏洞、auth bypass 的边界情况、业务逻辑漏洞等仍需要人类专家判断。

## 相关实体
> [主题导航](https://github.com/QianJinGuo/wiki/blob/main/moc/cybersecurity-privacy.md)

- [The best argument I've heard for why AI won't take your job](../ch05/086-ai.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cpanel-whm-patch-3-new-vulnerabilities.md)

- [How Superset built the IDE for AI agents on Vercel](../ch01/070-how-superset-built-the-ide-for-ai-agents-on-vercel.html)

---

