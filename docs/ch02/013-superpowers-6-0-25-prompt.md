# Superpowers 6.0 跑了 25 个实验才发现：prompt 里写的每一条\"不要\"，可能都在帮倒忙

> 📊 Level ⭐⭐⭐ | 10.5KB

## Superpowers 6.0 跑了 25 个实验才发现：prompt 里写的每一条"不要"，可能都在帮倒忙

## 摘要

Superpowers 6.0（Jesse Vincent 的 coding agent skills 系统）通过约 25 个微测实验系统性地检验了 prompt 措辞对 Agent 行为的影响。核心发现反直觉：在 dispatch prompt 中写"不要重述 brief"的违规次数是 4.4 次（5 次平均），而完全没写任何指导的对照组反而只有 3.6 次——**禁止式比什么都不写还差**。进一步实验揭示了一套"失败分类 → 措辞形态选择"的分型方法论：组合型禁止（composition prohibitions）在输出形状类问题上会激发对抗产生 backfire，而离散型禁止（discrete prohibitions）在纪律型问题上仍然有效。每发微测仅需 $0.15-0.30、5 次重复迭代，就能产出可量化的措辞优化结论。

## 核心要点

1. **禁止式（不要做 X）可能比不写还差**：dispatch-prompt 实验中，禁止组 4.4 次违规 vs 无指导对照组 3.6 次——禁止式在输出形状类问题上 backfire
2. **正面配方的工程优势**：正面配方以 3.0 次且零方差异常胜出；给赢的配方加 nuance clause 会退化到 3.8 noisy
3. **微测方法论五步法**：fresh-context 单样本 → 无指导对照组 → 每变体 ≥5 次重复 → 人工逐条复核 → 方差作为指标
4. **五条分类定律**：绊线有效 / 识别表有效 / 离散禁止有效 / 组合禁止 backfire / 平局选更短
5. **两条硬规则**：不写 nuance clause（会退化赢的配方）、豁免条款不作用域（会抑制应豁免的部分）
6. **成本分工**：prompt 措辞迭代在 $0.15-0.30/发的微测中完成，结构性变化才回到 $12/次的完整 eval

## 深度分析

### 禁止式 backfire 的机制分析

Superpowers 实验揭示了禁止式 backfire 的条件边界。在 dispatch-prompt 实验中，controller 组装 dispatch 指令时自认为"重述 spec"是有用的策展行为，模型对输出有自己的 agenda。禁止式在此类**输出形状问题**上激发了对抗——模型不是服从禁令，而是将其视为需要绕过的约束。

但在**纪律型问题**上（如"不要让 reviewer 重跑测试"），模型没有做该行为的竞争动机，禁止式 5/5 次全部有效（对照组 3/5 失败）。区别在于：前者模型有自己的"更好方式"的判断，禁令与模型直觉冲突；后者只是约束一个模型没有强烈倾向的机械行为。

这一发现与"别想白熊"效应（Ironic Process Theory）在认知心理学中的观察一致——试图抑制某个念头反而使其更活跃。在 LLM 语境中，禁止式在 instruction-following 过程中激活了被禁止概念的表示，增加了而非降低了其出现概率。

### 正面配方的设计原理

正面配方的优势在于它给了模型一个**可执行的替代行为**。当 controller 被告知"你的 dispatch 应包含 (1) 精简的任务描述 (2) 明确的输出格式 (3) ..."时，它有一个清晰的目标状态可以 optimize toward。而"不要重述 brief"只告诉模型什么不能做，没有告诉它应该做什么——模型在否定约束的空间中仍然需要猜测正确行为。

实验中正面配方 5 次重复均收敛到零方差，说明当指令足够具体且正面时，模型行为从概率性变为确定性。工程上，零方差约等于 pass^k 所有 k 次都成功——这是一个比 pass@k 严格得多的度量。

### Nuance Clause 的退化效应

一个特别反直觉的发现是：nuance clause（如"只引用片段……"）追加到已经赢的正面配方上，会将其从 3.0 consistent 退化到 3.8 noisy。原因在于 nuance 重新打开了"谈判空间"——模型开始判断"这次是否需要引用片段"，从确定性执行退化为概率性判断。

Superpowers 团队由此提炼出硬规则：**不写 nuance clause**。如果有了真实例外，将其表达为键到可观测谓词的独立条件，而非附加到已有规则上的修饰语。同理，豁免条款（"此限制不适用于代码块"）实际上仍然会抑制代码块的生成——如果输出的一部分必须豁免，重新组织让规则够不到它，而非试图用豁免条款控制范围。

### 微测方法论的系统价值

Superpowers 的微测方法论最大的贡献不是某一条具体结论，而是将 prompt 工程从"手感"升级为"实验"。每次微测 $0.15-0.30、5 次重复、几秒一轮迭代，对照完整 eval 的 $12/次和 50 分钟一轮。措辞在微测中磨，结构性变化才回到完整 eval 确认。

关键的五步法设计细节包括：

1. **Fresh-context 单样本调用**：system prompt 填真实完整上下文（整个 skill 或 prompt 模板），user message 填一个会诱发目标失败的 realistic 任务
2. **无指导对照组是灵魂**：dispatch-prompt 实验同时揭露了 backfire 和有效禁令——没有对照组无法区分
3. **5 次重复是起步**：单样本会骗人，5 次是经验下限
4. **人工复核不可替代**：模板回声和引用反例会伪装成命中，程序化计数会同时夸大失败和成功
5. **方差是信号不是噪音**：consistent（5 次收敛）vs noisy（5 次结果各不同），前者说明措辞绑住了形式，后者说明形式还需收紧

其中第 2 步和第 5 步最容易被跳过，也最有价值。第 2 步的对照组防止你在"帮倒忙"而不自知；第 5 步的方差判断是措辞是否真正生效的硬指标。

### "做了实验，结论是不用改"的工程诚实

微测方法论有一个容易被忽略的美德：诚实记录"做了实验，结论是不用改"。在 writing-plans 的 No Placeholders 章节微测中，4 个变体（含对照）在 40 个 plan 中全部 0 placeholder——current-gen opus 即使在被蓄意施压下也不产生 plan placeholder。结论是不用改，但保留了 No Placeholders 章节原样并记录了 V2 relocation 设计方案以备未来模型代际回归。

同一份文档还专门列出了"tested-and-declined"清单，将做了实验但被否决的方案带着数据写进去——防止有人没有新证据就重新提议同一个方案。这种将否定结果写入文档的做法，很多团队的 prompt 仓库都缺。

### 便宜化 vs. 判断降级的边界实验

微测在成本优化上的应用同样富有启发性。L2 梯级（sonnet controller）的微测看起来很有希望——recon 阶段干净通过、显式冲突 5/5 升级成功。但 planted-defect battery 决定性失败：sonnet controller 在 Strengths 中写"no assertion, as required"——**把没写断言这个缺陷描述成符合要求**。结论是便宜 controller 能处理显式升级，但会吸收隐性的 authority-vs-quality 裁决，将质量判断扭曲为计划合规辩护。

三条梯级的生死记录（L1 活的、L2 死的、L3 死的）定义了"便宜化机械，绝不便宜化判断"的边界。这条边界是用美元和 run 数堆出来的，不是拍脑袋。

## 实践启示

1. **不要默认使用禁止式**：先判断你治的是哪一类失败——输出形状问题（模型有自己的 agenda）用正面配方，纪律型问题（模型无竞争动机）用离散禁止。

2. **正面配方要给出可执行结构**：不要只说"不要 X"，要说"应包含 (1)...(2)...(3)..."。具体到模型能 optimize toward 的粒度。

3. **微测是最小可行实验框架**：$0.15-0.30 一发、5 次重复、带对照组——你自己的 prompt 也可以用同一套框架验证。核心在于：prompt 是可以被实验验证的。

4. **永远设无指导对照组**：一个对照组可以同时告诉你"禁令在帮倒忙"和"禁令在帮真忙"两个方向的信息。没有对照组你无法区分改进和帮倒忙。

5. **赢了就不要加 nuance**：给赢的配方加 nuance clause 会把它从 consistent 退化为 noisy。真实例外应表达为独立条件，而非已有规则的修饰语。

6. **记录否定结果**：做了实验发现不用改、方案被否决，都带数据写进文档。这是防止重复劳动的最佳机制。

7. **平局选更短**：Codex 一个长 session 会重读 SKILL.md 约 500 次，prose 长度是真金白银。在效果相近时，更短的措辞碾压。

## 相关实体

- [Harness 工程实践 17 vs 6 Subagent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-practical-17ge-versus-6-subagent.md) — 探讨 Agent Skills 的工程化设计，与 Superpowers 的 prompt 微测方法论形成互补
- [Claude Code 深度架构分析](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/claude-code-deep-architecture-analysis.md) — Claude Code 的架构设计，与 Superpowers 的 SDD 工作流设计有共通的设计哲学
- [Agent Loop 设计模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-boris-cherny-agent-loop-design-patterns.md) — 探讨 Agent 运行循环的设计模式，为理解 dispatch prompt 的上下文机制提供参考
- Harness Engineering — Agent 工程化的广义框架，Superpowers 的微测方法是 prompt engineering 层面对 Harness Engineering 的一次实践验证

## 参考来源

→ [原文存档](https://mp.weixin.qq.com/s/4XTsfY8SzcjusCU6sUg7yg)

---

