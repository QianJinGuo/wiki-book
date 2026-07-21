# GPT-5.6 Sol/Terra/Luna 分层定价，Codex 合并入 ChatGPT，ChatGPT Work 发布

## Ch01.1142 GPT-5.6 Sol/Terra/Luna 分层定价，Codex 合并入 ChatGPT，ChatGPT Work 发布

> 📊 Level ⭐⭐ | 3.2KB | `entities/gpt-56-sol-terra-luna-tiered-pricing-codex-merge-2026.md`

# GPT-5.6 Sol/Terra/Luna 分层定价，Codex 合并入 ChatGPT，ChatGPT Work 发布

OpenAI 于 2026年7月10日正式发布 GPT-5.6 系列，同时将 Codex 整合进 ChatGPT 桌面应用，并推出新智能体工具 ChatGPT Work。三件事同日发生，核心变化不是新模型跑分，而是 OpenAI 将顶级 Agent 能力拆成了可按任务购买的多个价格档位。

## 模型层级与定价

GPT-5.6 系列分三个能力层级：旗舰 Sol、均衡 Terra 和轻量 Luna。API 标价分别为每百万 token 5 / 2.5 / 1 美元（输入）和 30 / 15 / 6 美元（输出）——Sol 的标价约为 Claude Fable 5 的一半。Sol、Terra、Luna 三档模型加上 medium / high / max / ultra 多级推理深度，同一模型体系下出现多个独立的价格-能力组合。显式缓存断点和多 Agent 并行进一步丰富了定价维度——单次任务的总成本不再由模型名称决定，而是由所选档位组合决定。

## Benchmark 表现

启用最高推理强度的 Sol 在 Agents' Last Exam（55 个领域）上取得 53.6%，在 Coding Agent Index v1.1 上取得 80 分，在 Terminal-Bench 2.1 Ultra 模式下达到 91.9%——三个数字均为各自评测的当前最高或并列最高分，且均以低于 Fable 5 的 API 标价实现。SWE-Bench Pro 上 Sol 得分为 64.6%，而 Fable 5 为 80%，差距显著。OpenAI 官方对 SWE-Bench Pro 结果提出异议，声称约 30% 的评测实例存在结构性缺陷，但这一主张目前无独立裁决。

GPT-5.6 在任务路径明确、步骤可拆分的场景（命令行操作、终端测试、浏览器自动化）表现突出，在开放式的仓库级代码修改上出现缺口。Fable 5 则相反——SWE-Bench Pro 80 分一骑绝尘，但 Terminal-Bench 2.1 上被 Sol 甩开近 9 个百分点。

## 架构变化

Codex 被整合进 ChatGPT 桌面应用，不再作为独立产品存在。ChatGPT Work 作为新的生产力工具推出，与 Cursor Composer 等 AI 编码工具形成竞争关系。顶级 Agent 能力的按任务定价模式可能影响整个 AI 工具定价生态。

→ [量子位报道](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/gpt-56-正式上线codex-和-chatgpt-合并顶级-agent-能力开始按任务定价.md)
→ [机器之心报道](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/刚刚gpt-56全面上线codex被合并生产力工具chatgpt-work来了.md)

---

