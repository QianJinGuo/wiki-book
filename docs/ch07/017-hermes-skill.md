# Hermes自进化完整闭环：Skill创建复用修补链路

## Ch07.017 Hermes自进化完整闭环：Skill创建复用修补链路

> 📊 Level ⭐⭐ | 12.9KB | `entities/hermes-self-evolution-closed-loop-skill-reuse-winty.md`

## 6阶段完整闭环
| 阶段 | 零件 | 核心内容 |
|------|------|----------|
| 1 接收任务 | — | 用户提需求，Agent先查是否干过类似的事 |
| 2 检索Memory+Skill | Memory+Skill | 查相关事实 + 查现成SKILL.md |
| 3 执行任务 | Agent Loop | 调工具/跑命令/多轮对话，失败/纠正事件记录成session trace |
| 4 Nudge触发 | Nudge Engine | 成功→中；失败→高；用户纠正→立即；连续3次相似→Skill提炼 |
| 5 Review复盘 | Review Agent | 收集素材→分类→3把尺子筛选→决定写哪/怎么写 |
| 6 写入/Patch | Memory Store | 新建/Memory patch/Skill patch，版本+1，时间戳 |
**进化发生的瞬间**：下次任务命中Skill直接复用 = 闭环跑一次系统稍微变强一点。 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

## 真实案例：npm发包任务3次迭代
- **第1次**：12步，失败（忘了publish前build）。Skill 0.1产出
- **第2次**：9步（命中Skill 0.1），成功但changelog遗漏。Skill 0.2 patch产出
- **第3次**：6步（命中Skill 0.2），一次成功。Skill 1.0产出
**12→9→6** = 自进化在数字层面最直观体现。不是模型变聪明了，是系统积累的经验在帮模型省路径。

## 4个数据容器（分层节流）
1. **Session Trace**（写入：Agent Loop）：结构化事件流，含用户需求/工具调用/回复/打断/结果 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
2. **Review Input**（写入：Nudge Engine）：Trace+用户反馈+触发原因+优先级，高/中/低 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
3. **Review Output**（写入：Review Agent）：结构化写入计划（yaml格式），先出计划再执行，过linter安全检查 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
4. **Memory+Skill文件**（写入：Memory Store）：append/patch/new，自动版本+1+时间戳+变更日志 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
**核心设计**：数据有节制地流才不膨胀。每个容器做过滤/打包/转换，分层节流是工程上最值钱的一处。 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

## 5个可观测指标
| 指标 | 健康值 | 趋势 |
|------|--------|------|
| Skill命中率 | >40% | >70%警惕过度抽象 |
| 任务平均步数 | 随时间下降 | 递减=闭环健康 |
| 失败重复率 | ≤3次 | 超过=Review Agent没识别或Skill没命中 |
| 用户纠正频率 | 随时间下降 | 递减=USER.md生效 |
| Skill写入率 | 前期升后期稳 | 3个月后仍大量新增=未收敛 |
任一指标长期不动 = 闭环某一节断了。 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

## 4个亲测观察
1. **进化是阶段性跃迁**：5天无变化→第6天突然顺（某个高频Skill终于稳定） ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
2. **失败信号驱动进化最明显**：成功→优化（省1-2步）；失败→质变（避开整类陷阱） ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
3. **最弱环节是检索**：Skill写出来但措辞变一点就漏过→看trigger设计覆盖度 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
4. **每周10分钟人工review**：删拟人化偏好/删过度抽象Skill/精简啰嗦条目/归档没用Skill。"高度自动+极少人工"是当前现实解法 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

## 深度分析
### 闭环架构的工程价值
Hermes自进化闭环的精髓不在于某个零件，而在于**零件之间的连接方式**。6个阶段形成一条数据管道：用户任务→Memory/Skill检索→执行→Nudge过滤→Review决策→Memory Store写入。下次同类任务来时，直接从存储层取用经验，绕过前几个阶段。
这种设计的工程价值体现在**三重解耦**： ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

- **时间解耦**：任务执行和经验沉淀可以异步进行，Review Agent不需要在任务执行时同步运行
- **责任解耦**：每个零件只关心自己的输入输出，Nudge不管Review，Review不管Memory Store怎么存
- **容量解耦**：分层节流让不同容器承载不同粒度的信息，不会把所有压力打在同一个存储上

### 分层节流是系统能否长期运行的关键
winty在文中强调"分层节流是工程上最值钱的一处"，这个判断来自实战经验。Session Trace记录每一次工具调用，是最原始的数据；Review Input对trace做第一次过滤；Review Output再过滤一次并结构化；最后写入Memory/Skill的才是真正值得复用的经验。
如果没有这层过滤，系统会面临两个问题： ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
1. **噪声淹没信号**：trace里包含大量试错过程，直接作为经验会让检索质量下降 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
2. **存储膨胀**：每次任务都写全量trace，几个月后存储变成垃圾堆 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
分层节流让数据从"全量记录"逐步收敛到"精华摘要"，保证系统的长期可维护性。 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

### 从npm案例看版本演进的内在逻辑
12→9→6这个数字背后，Skill经历了3个版本的演进： ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

- **0.1版本**：填补空白，从0到1的突破，解决了"不知道要build"这个核心问题
- **0.2版本**：精细化打磨，补全了changelog这个遗漏步骤
- **1.0版本**：稳定可用，经过3次以上验证，具备了较高的置信度
版本号不是简单的数字递增，而是**置信度的量化表达**。Skill的成熟度通过版本号传递，当一个Skill达到1.0，意味着它已经经历了多次验证，可以被高频复用。

### 可观测指标的系统性意义
5个指标不是独立存在的，它们映射到闭环的各个节点： ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

- Skill命中率 → 第2阶段（检索）的效果
- 任务平均步数 → 第3阶段（执行）的效率
- 失败重复率 → 第4/5阶段（Nudge/Review）是否正确识别了失败模式
- 用户纠正频率 → 第3阶段执行质量，以及USER.md是否生效
- Skill写入率 → 第6阶段（写入）的活跃度
任一指标长期不动意味着对应环节可能存在断点，需要人工介入检查。 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

## 实践启示
### 对个人Agent开发者的建议
1. **先跑通闭环，再优化零件**：不要过早追求完美的Nudge Engine或Review Agent，先让6个阶段都能跑通，数据能流动起来 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
2. **检索设计要留足覆盖度**：winty提到"最弱环节是检索"，Skill写出来但措辞一变就漏过。建议在trigger设计时考虑同义词、不同表述方式，甚至用embedding做模糊匹配 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]
3. **定期人工review而不是完全不review**：每周10分钟扫一遍存储，删除低质量条目，比完全放手给系统更能保持系统健康度 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

### 判断系统是否自进化的简单标准
可以用这个清单判断自己的Agent系统是否形成了真正的闭环： ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

- [ ] 新任务来了会先查Memory/Skill，而不是每次从零开始
- [ ] 任务失败后，系统能自动记录失败原因并写入存储
- [ ] 同类任务第二次来时，执行步数/时间有明显下降
- [ ] 6个阶段都有对应的日志或记录可以追溯
如果超过一半的答案是否定的，说明闭环还没有真正跑起来。 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

### 从个人到企业级Agent的分水岭
文中提到"个人Agent和企业级Agent的分水岭"在于三点：分层解耦、多重过滤、可观测。这三点也是判断一个Agent系统是否成熟的标准：
**分层解耦**让系统可维护，不会因为一个环节的改动牵一发动全身；**多重过滤**让系统长期不膨胀，经验逐渐收敛而不是噪声堆积；**可观测**让系统可优化，有明确的指标告诉开发者该调哪里。
一个内部工具做到这三点，就具备了企业级推广的基础。 ^[https://mp.weixin.qq.com/s/NTsLyOrJqxfi0_m1RQTfJA]

### 避免过度进化的警示
Skill命中率>70%不一定是好事——可能意味着Skill过度抽象，把不该归并的经验合并了，导致具体场景的指导性下降。当命中率持续走高时，需要检查是否有一些本应区分的场景被错误地合并了。
同样，Skill写入率在3个月后仍大量新增，说明系统还没有收敛——可能是trigger设计太宽松，或者Review Agent的阈值设得太低。

## 与其他Hermes篇章的关系
- 前置篇：Memory/Skill/Nudge Engine/Review Agent各论
- 同系列：hermes-self-improving-overview-winty（全局总览）

## 关联阅读
## 相关实体
- [Hermes Skill System Winty](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-skill-system-winty.md)
- [Hermes Agent Self Evolving Source Analysis](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-self-evolving-source-analysis.md)
- [Hermes Agent Memory System Vs Openclaw](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-memory-system-vs-openclaw.md)
- [Openclaw Hermes Source Code Agent Architecture Review](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-hermes-source-code-agent-architecture-review.md)
- [Hermes Agent Vs Openclaw Comparison](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-vs-openclaw-comparison.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-self-evolution-closed-loop-skill-reuse-winty.md)

---

