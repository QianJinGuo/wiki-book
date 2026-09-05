---

source_url: https://mp.weixin.qq.com/s/XUBnvDE1pxtHLr6dG7KKwA
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
title: "Trace2Skill 把\"轨迹里的局部经验\"蒸馏成可迁移的 Agent Skills"
author: 爱折腾的小七
publication: 爱折腾研究组
date: 2026-05-15
platform: wechat
sha256: f5a7e3d2c1b8a4f6e2d0c8b4a6f2e8d0c4b6a8f2e4d0c8b6a4f2e8d0c4b6a8f2

---
# Trace2Skill 把"轨迹里的局部经验"蒸馏成可迁移的 Agent Skills
## 一、这篇论文到底想解决什么问题？
今天越来越多的 LLM Agent 都在依赖 skills。这里的 skill 是一类结构化、可复用的任务指导文档，包含：什么时候该用某种方法、步骤怎么走、哪些坑最容易踩、哪些脚本/参考资料/辅助文件值得配套。
问题在于，高质量技能长期靠人工写，扩展速度很慢。自动生成 skill 的已有做法有两个典型问题：
- 过于依赖模型参数知识，写出来的 skill 缺少真实环境下的细节和坑点
- 根据新轨迹顺序式更新 skill bank，容易把局部 lesson 直接糊到技能上，得到碎片化、局部过拟合的结果
论文的核心任务：如何把很多轨迹中的局部 lesson，蒸馏成一份单一、全面、可迁移的 skill。
## 二、和已有在线 skill evolution 工作的本质区别
**1. 碎片化积累 vs. 单技能蒸馏**
很多在线方法不断新增 patch、memory 或小 skill。长期看技能越来越碎。Trace2Skill 更接近"把多条证据汇总后，写成一版新的标准作业程序"。
**2. 顺序式反应 vs. 整体式归纳**
顺序式更新每一轮都在对"最近刚看到的轨迹"做反应，容易发生 sequential drift。Trace2Skill 先看一批轨迹，再统一合并 patch，从全体经验里找更稳定的规律。
核心区别：很多方法在做 trajectory-to-memory，Trace2Skill 真正在做的是 trajectories-to-skill。
## 三、Trace2Skill 整体框架
三步流程：
**Step 1：先 rollout，得到成功与失败轨迹池**
给定初始技能 S0，Agent 在演化任务上运行生成一批执行轨迹。S0 有两种来源：
- Deepening 模式：从人类专家写好的 skill 出发
- Creation 模式：从模型凭参数知识草拟的 skill 出发
轨迹按结果拆成两类：T+（成功轨迹）和 T-（失败轨迹）。
**Step 2：并行子代理分析轨迹，提出 patch**
成功轨迹分析器 A+：单次分析流程，清洗轨迹、识别可泛化有效行为模式、输出 patch。
失败轨迹分析器 A-：ReAct 风格 agentic loop，可反复检查执行痕迹、输入输出文件、核对 ground truth，直到找到真正失败原因。
核心判断：失败里最有价值的不是"错了"，而是"为什么错"。
**Step 3：层次化合并 patch，蒸馏成最终 skill**
所有 patch 进入层次化 merge 过程：
- 去重
- 冲突检测
- 文件格式校验
- 保留高频、稳定、能反复出现的规律
- 丢弃低支持度、疑似偶然的 patch
Merge 过程本质上是一种 inductive reasoning——系统问：哪些观察在不同轨迹中反复出现？哪些修改更像普适规律？哪些建议只服务极少数案例？
## 四、skill 在论文里长什么样
skill 结构：
- 一个根文档 SKILL.md
- 一组辅助资源 R（scripts、references、assets）
这说明 Trace2Skill 不是在生成单段 prompt，而是在演化一个真正可使用的知识目录。推理时 skill 直接预置使用，不需要额外检索模块。
## 五、主实验结果
主实验集中在 spreadsheet domain（Benchmark：SpreadsheetBench-Verified、Soft、Hard；OOD 测试集 WikiTableQuestions）。
**四点核心结论：**
1. **人类写的 skill 很强，但不一定可迁移**：human-written skill 对 122B Agent 效果很好（SpreadsheetBench-Vrf 48.33，WikiTQ 74.68），但迁移到 35B Agent 上明显失效，甚至不如 No Skill。
2. **只靠参数知识起草 skill，效果接近没有**：Parametric baseline（模型仅凭参数知识起草）整体表现接近 No Skill。说明真正有价值的技能内容，很多不在参数里，而在真实轨迹暴露的执行细节里。
3. **Deepening 能稳定强化人类技能**：从 human-written skill 出发经 Trace2Skill deepening 后，性能普遍上升。典型结果：
   - 122B authored Deepening +Combined：SprBench-Vrf 相对 human-written 提升 +21.50，Hard 提升 +12.50，OOD WikiTQ 提升 +4.56
4. **从零创建 skill 也能有效**：35B 模型作者生成的 Creation +Error，给 122B 用户模型使用时，在 WikiTQ 上相对 parametric baseline 涨了 +57.65。
## 六、跨域泛化（数学推理 + DocVQA）
**数学推理**（DAPO-Math-Test-100、AIME 2026）：
- 122B authored skill 给 122B 用户：D-Test +3.0，AIME +2.9
- 122B authored skill 给 35B 用户：D-Test +5.0，AIME +5.0
**DocVQA**：
- 35B 模型在 No Skill 条件下原始 DocVQA 表现比 122B 更好
- 但"写 skill"这件事上，35B 明显不如 122B
- 122B-authored +Error 对 122B 用户：ANLS +0.1639，Acc +15.3
- 同一个 skill 迁移到 35B 用户上：ANLS +0.1554，Acc +13.6
- 35B-authored skill 甚至让 35B 自己退化：ANLS -0.0620
关键洞察："task execution capability"和"skill authoring capability"不是一回事。
## 七、分析实验三个关键结论
**1. 并行蒸馏优于顺序编辑，而且快得多**：
- 122B 用户模型：Seq-B=4 Vrf 59.00，Seq-B=1 Vrf 61.83，Parallel Vrf 65.83
- 耗时：Seq-B=1 约 60 min，Seq-B=4 约 15 min，Parallel 约 3 min
**2. 一份蒸馏 skill，优于检索式经验银行**（对比 ReasoningBank）：
- 对 122B 用户模型，Trace2Skill 相比 ReasoningBank 在 Vrf/Soft/Hard 上分别多出 +13.8/+7.1/+8.2
- 解释：检索依赖 query 和 memory 表面相似性，分布一变召回就可能失真；skill 预先注入系统提示，把经验更早整合进推理过程
**3. Agentic 失败分析明显强于单次 LLM 总结**：
- 122B Deepening：Agentic +Error 40.75 vs 单次 LLM 28.58
- 35B Creation：Agentic +Error 39.06 vs 单次 LLM 25.76
- 单次 LLM 特别容易把表面报错信息过度解释成根因，甚至在输出本来已经正确时虚构失败原因
## 八、最值得记住的技术洞察
1. **轨迹经验不是不能用，而是不能直接用**：局部 lesson 很宝贵，不做统一蒸馏最后得到的往往是碎片化 patch 集合，不是 skill
2. **skill 的价值在于"归纳后前置"**：memory 是任务来时再去找；skill 是任务开始前就把规律作为工作规范写进系统
3. **失败分析的质量直接决定技能质量**：如果失败原因没找准，skill 就会被错误经验污染
4. **小模型也可以写出有迁移性的 skill**：开源 35B 模型已足以参与 skill evolution，降低了对闭源超大模型的依赖
## 九、论文不足
1. 偏单技能视角，离大规模 skill ecology 还有距离（skill 边界重叠、粒度不一致等问题未解决）
2. "高频规律更可信"的假设可能压制长尾关键经验（高风险场景少见的致命错误未必不重要）
3. merge 还是偏"文本层归纳"，未来可以更结构化（流程图/状态机、schema-aware rules）
4. 实验覆盖 spreadsheet、math、VQA，但缺少 GUI agent、web agent、软件工程多文件修复等更重交互环境
5. 证明了"技能可迁移"，但没完全回答"技能何时失效"
## 十、未来创新方向
1. 持续在线但分阶段蒸馏的 hybrid 框架（在线收集 patch 候选 + 周期性批处理蒸馏 + 关键性能下降时触发 targeted re-distillation）
2. 引入 skill-level verifier（自动检查新规则是否和旧规则冲突、是否违反工具接口事实）
3. 跨任务族的 meta-skill distillation（提炼更抽象的 meta-skill，如"如何系统验证文件写回"）
4. 让 skill 不只写给 Agent，也写给 skill author agent（演化"演化技能的技能"）
## 论文信息
- 标题：Trace2Skill: Distill Trajectory-Local Lessons into Transferable Agent Skills
- 作者：Jingwei Ni, Yihao Liu, Xinpeng Liu, Yutao Sun, Mengyu Zhou, Pengyu Cheng, Dexin Wang, Erchao Zhao, Xiaoxi Jiang, Guanjun Jiang
- 机构：Alibaba Qwen Large Model Application Team、ETH Zürich、University of Zurich、Peking University、Zhejiang University
- arXiv：https://arxiv.org/abs/2603.25158
- 状态：arXiv 预印本，Work in progress（2026-03-26 首次提交）