# How we made WINDOW JOIN parallel and vectorized

## Ch01.033 How we made WINDOW JOIN parallel and vectorized

> 📊 Level ⭐ | 8.8KB | `entities/how-we-made-window-join-parallel-and-vectorized.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/how-we-made-window-join-parallel-and-vectorized.md)

## 相关实体

- [How to create websites with great UX designs: Principles and examples](ch01/128-how-to-create-websites-with-great-ux-designs-principles-and.md)
- [Versa takes aim at fragmented enterprise security with CSPM, orchestration update, and AI agent controls](ch01/1033-rag.md)
- [What Is Urban Density Design? A Clear Guide to How Cities Get Built Denser](ch01/1156-what-is-urban-density-design-a-clear-guide-to-how-cities-ge.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/rag-knowledge-retrieval.md)
## 深度分析
### 专用算子 vs 通用查询重写：性能差距的本质
QuestDB WINDOW JOIN 展现出比 Timescale、DuckDB、ClickHouse 快 25 倍的性能，其根本原因在于**专用算子知道窗口结构而通用查询重写不知道** ^。
基准测试揭示了一个重要洞察：即使其他引擎使用了正确的计划形状（ClickHouse 的 UNION ALL + 窗口函数），仍无法匹敌专用算子的数据级并行性加连续切片 SIMD ^。这是因为：

- 通用窗口算子无法利用数据级并行性（LHS 表的 page frame 分片）
- 无法将窗口切片连续化以供 SIMD 内核使用

### AVX2 SIMD 优化的工程细节
文章展示了 hand-tuned SIMD 内核 `sumDoubleAcc` 的 AVX2 汇编实现 ^：
```
; 每迭代处理 8 个 double，无分支，无 scatter
vmovupd ymm3, [rax-0xfa0]  ; 加载 d[i+4..i+7]
vcmpunordpd ymm1, ymm3, ymm3 ; NaN 掩码，第一 lane
vmovupd ymm2, [rax-0xfc0]  ; 加载 d[i..i+3]
vcmpunordpd ymm0, ymm2, ymm2 ; NaN 掩码，第二 lane
vpcmpgtq ymm3, ymm8, ymm1   ; 加宽掩码
vaddpd ymm5, ymm5, ymm3     ; sum += value
vpaddq ymm4, ymm4, ymm1     ; nan_count += 1 per NaN
```
关键设计决策：
1. **NaN 作为 null 值编码**：QuestDB 用 NaN 编码 null，简化了 SIMD 聚合逻辑 ^
2. **Fused sum + NaN-count kernel**：avg 分解为 sum + non-null count，避免了除以零的问题
3. **无分支设计**：使用掩码操作代替条件分支，保持流水线满载

### Amdahl 定律在数据库并行化中的体现
5.0x 的并行加速比（23 个 worker 线程）而非接近 24x 的线性加速，其原因是 Amdahl 定律的限制 ^。具体分析：

- WINDOW JOIN 阶段享受近线性扩展
- 但 `ORDER BY avg_bid + avg_ask DESC LIMIT 10` 的 Sort + Limit 在两种配置下都是串行的
- 随着并行 JOIN 阶段时间缩短，Sort + Limit 占比增大，成为新的瓶颈
这说明**数据库查询优化不能只关注单算子的并行化，还需要考虑整体查询计划的并行友好性**。

### 低基数快速路径的设计权衡
SIMD 优化的关键前提是数据必须连续存储 ^。但窗口内的 RHS 行并不连续（分散在 page frame 间），因此需要额外的一次性传递来将值复制到 per-key 连续缓冲区。
这个设计权衡值得注意 ^：
| 因素 | 影响 |
|------|------|
| 额外 RHS 列读取 | 每个 RHS 列读取两次（缓冲复制 + 聚合消费） |
| SIMD 边界 | 如果输入连续，聚合循环是 SIMD  bound；否则是 call bound，AVX2 提供约 10 倍优势 |
| 内存预取 | RHS 列顺序读取，内存子系统友好 |
| 缓存局部性 | Per-key 值缓冲区大小与当前 LHS frame 的 RHS 切片相适应，工作集保持在 L2/L3 |
对于低基数场景（少数 distinct keys），per-key 值缓冲区可放入缓存，缓冲复制成本被完全抵消。基准测试确认即使小 frame 也击败标量路径，且差距随 LHS frame 增大而扩大（更多 LHS 行共享同一索引缓冲区）。

## 实践启示
### 对于时序数据库选型的建议
1. **WINDOW JOIN 是硬需求**：如果你的工作负载涉及交易-报价关联（每笔交易附加 1 秒窗口内的平均买卖价），WINDOW JOIN 是必需功能 ^
2. **检查 EXPLAIN 输出**：使用 `EXPLAIN` 确认查询走的是 `Async Window Fast Join` 还是 `Async Window Join`，以及 `vectorized: true/false` ^
3. **考虑并行度对整体查询的影响**：如果 ORDER BY + LIMIT 是查询的固定部分，单纯增加 worker 数可能无法带来线性加速比

### 对于数据库内核开发者的借鉴
**数据级并行的关键要素**：

- append-only 列式存储 + designated timestamp ordering = 单次 binary search 定位 RHS 切片 ^
- Per-key in-memory index = O(log n) 窗口边界查找 ^
**SIMD 优化的前提条件**：

- 数据必须连续（使用 per-key buffer 复制解决）
- Hand-tuned 内核覆盖最常用聚合（sum/avg/min/max/count）
- 查询形状需匹配低基数 equi-join ^
**未来演进方向**：

- HORIZON JOIN（P&L 风格的多重固定视野标记）已在 QuestDB 9.3.5 中实现 ^
- 专用时序算子是差异化竞争的关键

### 对于金融数据工程师的具体指导
交易-报价场景的 WINDOW JOIN 替代方案对比 ^：
| 方案 | SQL 复杂度 | 性能 | 可维护性 |
|------|------------|------|----------|
| ASOF JOIN + 范围 JOIN + UNION ALL + GROUP BY | 高（嵌套 CTE） | 差（独立扫描） | 低 |
| WINDOW JOIN | 低（单一算子） | 优（并行 + SIMD） | 高 |
WINDOW JOIN 支持多种高级特性 ^：

- INCLUDE PREVAILING / EXCLUDE PREVAILING 控制是否携带前值
- 一侧窗口（PRECEDING AND PRECEDING, FOLLOWING AND FOLLOWING）
- 支持聚合：sum, avg, count, min, max, first, last, first_not_null, last_not_null

### 对于性能工程师的基准测试方法论
文章提供的基准测试脚本位于 [GitHub: puzpuzpuz/window-join-bench](https://github.com/puzpuzpuz/window-join-bench) ^，包含：

- 完整的 schema 定义
- 数据生成器
- 各引擎查询脚本
关键测试参数 ^：

- 规模：50M trades（1000 个 zipfian symbols）+ 150M prices
- 时间窗口：1 second PRECEDING / FOLLOWING
- 聚合集：avg/min/max（不可用前缀和分解捷径，确保公平比较）

---

