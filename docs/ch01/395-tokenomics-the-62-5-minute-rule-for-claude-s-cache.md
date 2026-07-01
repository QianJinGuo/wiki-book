# Tokenomics: the 62.5-minute rule for Claude's cache

## Ch01.395 Tokenomics: the 62.5-minute rule for Claude's cache

> 📊 Level ⭐⭐ | 9.3KB | `entities/tokenomics-the-625-minute-rule-for-claudes-cache.md`

## 核心结论
**62.5 分钟**是 Claude 提示缓存策略的决策临界点：

- 如果预计在 62.5 分钟内再次需要该缓存 → 选择刷新（refresh），持续以读代写保持缓存活性
- 如果预计超过 62.5 分钟才需要 → 放任缓存过期，下次重新写入更划算
- 该临界值**不随模型型号变化**（Opus/Sonnet/Haiku 均相同）
- 该临界值**不随前缀 token 规模变化**（5K 或 500K 均相同）
--- See also [Claude Code Architecture](ch03/074-claude-code.md)

## 深度分析
### 1. 定价结构的数学本质
Claude 的提示缓存定价遵循一套固定的倍率体系，而非绝对价格：
| 操作 | 倍率（相对 base input） |
|---|---|
| 5 分钟缓存写入 | 1.25x |
| 1 小时缓存写入 | 2.00x |
| 缓存读取 / 刷新 | 0.10x |
这三个倍率是所有模型共享的——差异仅在于 base input 的绝对价格。这意味着**临界时间 62.5 分钟的推导是模型无关的**：
```
refresh_cost(T) = W + R × floor(T / 5)
rewrite_cost(T) = 2W
W = N × base × 1.25
R = N × base × 0.10
W/R = (N × base × 1.25) / (N × base × 0.10) = 12.5
T_break_even = 5 × (W/R) = 5 × 12.5 = 62.5 分钟
```
**倍率相除后，base 价格和 token 数量 N 全部约去，只剩下 1.25/0.10 = 12.5 这一个常数比值。** 这就是为什么 5K token 的 Sonnet 前缀和 500K token 的 Opus 前缀拥有相同的决策时间节点——尽管绝对开销相差数百倍。

### 2. 缓存刷新的经济学含义
"缓存刷新"（cache read）本质上是一个**最小区块请求**：发送一个足够小的请求来读取已缓存的前缀，同时将 TTL 重置为 5 分钟。
关键机制：

- **缓存命中 = 刷新**：每次读取已缓存的前缀时，API 自动将 TTL 重置回 5 分钟
- **刷新成本仅为写入成本的 8%**（0.10/1.25 = 8%）
- 但必须**每 5 分钟执行一次**才能维持缓存活性
这形成了一个非对称的博弈：写入成本高但一次性，刷新成本低但高频。在 62.5 分钟内，刷新累计成本低于一次重写；超过 62.5 分钟，刷新累计成本超过一次重写。

### 3. 美元金额的规模敏感性
虽然决策时间点不变，但**绝对美元金额随模型和前缀规模剧烈变化**：
以 Opus 4.7 + 100K token 前缀为例：
| 策略 | T = 30 min | T = 60 min | T = 90 min |
|---|---|---|---|
| 持续刷新 | $0.925 | $1.225 | $1.525 |
| 过期重写 | $1.250 | $1.250 | $1.250 |
| 节省 | $0.325 | $0.025 | **-$0.275**（亏损） |
注意 60 分钟处刷新仅节省 $0.025——这意味着**在临界点附近，策略选择的实际收益微乎其微**，但在 30 分钟处可节省 26%，在 90 分钟处刷新反而开始净亏损。

### 4. Compaction（压缩）的成本收益分析
上下文压缩（如 `/compact` 命令）是另一个被频繁使用的优化手段，但它的成本结构鲜为人知：
```
compaction_cost = read_old(N × R) + generate_summary(S × 5B) + write_new(S × W)
per_turn_saving = (N - S) × R
break_even_turns = (N + 62.5 × S) / (N - S)
                 = (1 + 62.5 × r) / (1 - r), 其中 r = S/N
```
**核心规律：压缩比 r 决定一切，上下文总量 N 约去。**
| 压缩比（S/N） | 盈亏平衡所需轮次 | 评估 |
|---|---|---|
| 10:1（100K→10K） | ~8 轮 | 实际可行 |
| 5:1（100K→20K） | ~17 轮 | 需大量后续轮次 |
| 2:1（100K→50K） | ~65 轮 | 实质是昂贵的摘要 |
| 20:1（100K→5K） | ~4 轮 | 高效但质量风险极高 |
**输出 token 价格（5x base）是压缩策略的主要敌人。** 一个 verbose 的摘要本身可能就是净亏损——即使它技术上减少了提示长度。

### 5. 三大缓存地雷（Footguns）
#### 地雷 1：Opus 4.7 的新 Tokenizer
Opus 4.7 使用了新的 tokenizer，相同文本可能产生多达 **35% 更多的 token**。 这意味着：

- 从 Opus 4.6 迁移到 4.7 时，历史缓存的 token 计数可能严重失准
- 100K token 的前缀在 4.7 上可能变成 135K token
- **必须在迁移前用 token counting endpoint 重新测量**

#### 地雷 2：最小缓存门槛
| 模型 | 最小缓存 token 数 |
|---|---|
| Opus 4.5/4.6/4.7 | 4,096 |
| Sonnet 4.6 | 1,024 |
低于门槛时 API **不会报错**，只是静默不缓存——唯一的信号是 usage block 中 `cache_creation_input_tokens` 和 `cache_read_input_tokens` 均保持为 0。

#### 地雷 3：20 Block 回溯窗口
缓存的回溯扫描以 block 为单位，每次请求最多向后查看 **20 个 content block**。超过 20 个 block 后，旧的缓存条目就会落在搜索窗口之外。 这解释了为什么某些"应该命中"的缓存实际上未命中——需要在更早的位置显式插入 cache breakpoint。
---

## 实践启示
### 1. 实现缓存计时器
对于需要周期性调用 Claude 的 agent 任务，在发送请求前检查距上次缓存写入的时间：
```
if elapsed_minutes < 62.5:
    send_refresh_request()  # 读取缓存，TTL 重置为 5 分钟
else:
    send_new_write_request()  # 放弃旧缓存，重新写入
```
**实现刷新逻辑时，建议将下次刷新时间点记录在请求上下文中，避免依赖本地时钟偏差。**

### 2. 根据前缀规模选择策略
| 前缀规模 | 建议策略 |
|---|---|
| < 4,096 tokens | 不使用缓存（低于门槛，静默失效） |
| 4K–50K | 62.5 分钟内刷新；注意 Sonnet 比 Opus 便宜得多 |
| 50K–200K | 这是缓存价值最高区间，每次刷新节省显著 |
| > 200K | 优先考虑 compaction，而非持续刷新 |

### 3. Compaction 的触发条件
仅当**预计后续轮次明确超过盈亏平衡点**时，才应执行 compaction：

- 交互式单轮问答：永远不要 compaction（预期轮次 = 1，远低于任何盈亏平衡）
- 长时间 agent 会话（Code/Agent 模式）：至少需要 8–17 轮后续交互，压缩比 10:1–5:1 才合算
- 压缩时**保留关键上下文**（错误信息、分支名、失败假设），只压缩重复性高的中间过程

### 4. Opus 4.7 迁移检查清单
从旧模型迁移到 Opus 4.7 时：
1. 用 [Anthropic token counting API](https://platform.claude.com/docs/en/build-with-claude/token-counting) 重新测量所有缓存前缀的 token 数
2. 按 1.35x 系数估算新 tokenizer 下的上限
3. 重新计算 refresh/rewrite 成本——**前缀变大后，刷新策略在更短时间内就变得不划算**
4. 更新缓存监控告警阈值

### 5. 监控与仪表化
文章特别强调需要**自建监控**来验证缓存实际生效：
```

# 检查缓存是否真正创建/命中
assert usage.cache_creation_input_tokens > 0 or usage.cache_read_input_tokens > 0, "Cache not active!"
```
对于高频 agent 场景，建议在日志中记录：

- 每次请求的 `cache_creation_input_tokens` / `cache_read_input_tokens`
- 距上次 cache write 的已耗时间
- 选择的策略（refresh vs rewrite）及依据

### 6. 交互式 vs 非交互式场景的区别
文章最后指出一个容易被忽略的假设：**62.5 分钟规则假设你真的会再次发起请求**。

- 如果 30% 的会话是单次问答后即终止，应该**完全不写入缓存**（省去首次写入成本）
- 交互式编程 agent（Claude Code、OpenCode 等）通常在多次往返的会话中，缓存策略价值最大
- 非交互式批量处理场景：评估单次调用 vs 缓存写入的边际成本

---

