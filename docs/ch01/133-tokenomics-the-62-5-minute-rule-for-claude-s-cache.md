# Tokenomics: the 62.5-minute rule for Claude's cache

## Ch01.133 Tokenomics: the 62.5-minute rule for Claude's cache

> 📊 Level ⭐ | 4.4KB | `entities/anthropic_cache_tokenomics.md`

## 核心要点
-
## 相关实体
- [Tokenomics The 625 Minute Rule For Claudes Cache](ch01/460-claude.html)
- [Vercel Com How Superset Built The Ide For Ai Agents On Vercel](ch01/073-how-superset-built-the-ide-for-ai-agents-on-vercel.html)
- [Aeo And Geo For Ai Overviews Chatgpt Claude Gemini And Perplexity](ch01/053-aeo-and-geo-for-ai-overviews-chatgpt-claude-gemini-and-p.html)
- [Introducing Claude For Small Business](ch01/028-introducing-claude-for-small-business.html)
- [Granola The Ai Notepad For Backtoback Meetings](../ch05/086-ai.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic_cache_tokenomics.md)
- [the golden rule of customizable select](https://github.com/QianJinGuo/wiki/blob/main/entities/webkit-customizable-select-golden-rule.md)

## 深度分析
62.5 分钟规则的核心推导来自一个简单的比值：Anthropic 的缓存写入费用是读取费用的 12.5 倍（写入 = 1.25x 基线输入价格，读取 = 0.10x 基线输入价格）。每 5 分钟刷新一次缓存，每次刷新成本为 R 美元；完整重写成本为 W = 12.5R 美元。保持缓存活跃 T 分钟的总成本为 `W + R × (T/5)`，而放弃缓存并重写的成本为 `2W`。令二者相等得 `T = 5 × (W/R) = 62.5 分钟`。
**比例与模型无关，绝对成本则高度模型相关。** 写入价格与读取价格的比例 `W/R = 1.25/0.10 = 12.5` 中，模型基线价格 N 被完全消去。这意味着 5K token 的 Haiku 前缀和 500K token 的 Opus 前缀的决策临界点都是 62.5 分钟——但 Opus 上的"决策失误代价"远高于 Sonnet，因为 Opus 每 token 的基线价格更高。
**Opus 4.7 的 Tokenizer 变化是一个隐性陷阱。** Opus 4.7 使用新 tokenizer，相同文本的 token 数量可能增加最多 35%。将一个已缓存的提示从 Opus 4.6 迁移到 4.7 时，100K token 的前缀可能膨胀至 135K token，所有缓存读写成本计算均随之变动。在迁移前必须通过 Anthropic 的 token 计数端点重新验证 token 数量。
**两个技术坑需要注意。** 一是最低 token 门槛：Opus 需要至少 4,096 个可缓存 token，Sonnet 需要 1,024 个，低于门槛时 API 不会报错，只是静默地不缓存——唯一可靠信号是 `cache_creation_input_tokens` 和 `cache_read_input_tokens` 是否为零。二是 20-block 回溯窗口限制：每个缓存断点最多向前扫描 20 个内容块寻找先前写入，超过 20 块后缓存条目会落在搜索窗口之外，导致"假缓存"现象。
**Compaction 的经济学。** 压缩上下文（将 N token 的对话历史总结为 S token）需要三次成本：读旧缓存 `N×R`、生成摘要 `S×5B`（输出价格是基线的 5 倍）、写新缓存 `S×W`。之后每轮节省 `(N-S)×R`。盈亏平衡的后续轮次为 `(1 + 62.5r)/(1-r)`（r = S/N）。10:1 压缩比下约需 8 轮，5:1 则需要约 17 轮。压缩比过低时（2:1），摘要成本可能高于节省，变成净亏损。
**实战建议：** 交互式 coding agent 通常在 62.5 分钟临界点的"好"一侧，因为会话时长普遍较短且频繁。但对于 500K 前缀 + 90 分钟空闲的场景，选择刷新反而比放弃缓存多花 $1.375——此时应果断放弃。关键判断依据不是时间本身，而是你是否确信会在 62.5 分钟内回来。

## 实践启示
- **监控你的 token 流向：** 400K-500K 的上下文写入缓存频率过高是常见浪费来源，使用 62.5 分钟规则评估是否值得保持缓存活跃
- **始终验证缓存实际生效：** 检查 `cache_creation_input_tokens` 和 `cache_read_input_tokens`，不要假设 API 按预期工作
- **跨模型迁移时重新计数 token：** Opus 4.7 的 tokenizer 变化会让已缓存的 prefix token 数量膨胀 35%，所有成本计算需重新跑
- **Compaction 压缩比是核心指标：** 低于 5:1 的压缩比在纯经济账上不划算，更应关注是否丢失了关键信息（错误信息、分支名、失败假设）
- **大 prefix + 长时间 idle = 放弃缓存：** 500K token idle 超过 62.5 分钟后刷新成本已超过重写，此时应主动终止缓存

## 关联阅读
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic_cache_tokenomics.md) — 本文完整原文与推导细节

---

