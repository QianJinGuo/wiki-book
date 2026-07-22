---
source: wechat
source_url: https://mp.weixin.qq.com/s/MZvT2wWKZkQjaoK_vgkg5A
ingested: 2026-07-16
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-07-16
sha256: ef47a20811444b96f7bffef96d6d670a8c796d3dd875c0f8cd6d8bf406773a94
---

source: wechat
source_url: https://mp.weixin.qq.com/s/MZvT2wWKZkQjaoK_vgkg5A
ingested: 2026-07-16
source_published: 2026年7月16日 08:09
---

# 用推理步骤的「语义冗余」给LRM过度思考踩刹车

推理大模型 (如 DeepSeek-R1、o1) 靠长思维链拿高分，却普遍「想太多」: 研究统计了五个代表性模型里，发现有 41–52% 的 token 是在模型给出它的最终答案之后生成的。现有的 inference-time early-exit 工作，大多盯着 trial answer 的 readiness—— 从当前推理前缀探测一个临时答案，看它置信度够不够高、连续几次是否一致、是否「看起来可以提交」。但答案看起来稳了，并不代表推理真的收敛了：模型可能还在探索、自我纠错的过程中，就短暂给出高置信、甚至连续一致的错误答案。

  


PUMA 换了个早停思路 —— 不只看「答案稳没稳」, 主要看「最近的推理还在不在产生新的语义进展」: 当推理开始反复复述既有结论、不再提供新的语义信息时，说明推理大概率已收敛，这里才值得考虑停止。实验验证了这一信号可靠、可迁移、也可学习：在 5 个模型 × 5 个高难度基准上平均减少 26.2% token 且保持准确率，能零样本迁移到代码生成与多模态推理，乃至作为训练信号内化进模型。

  


  


  * 论文标题：Stop When Reasoning Converges: Semantic-Preserving Early Exit for Reasoning Models

  * 论文链接：https://arxiv.org/abs/2605.17672

  * 代码链接：https://github.com/giovanni-vaccarino/PUMA

  


长思考模型的通病：

答案已经有了，思考还在继续

  


像 DeepSeek-R1、Qwen3-Thinking 这类长思考模型（Long-thinking Model，LRM）靠长思维链拿高分，但很多时候，模型早就已经形成了后来会提交的答案，却还在反复验证、改写、重新推导。作者的反事实分析显示：五个代表性模型里，有 41–52% 的推理 token 生成在模型首次给出「后来会提交的最终答案」之后 —— 大量算力都花在了答案后的冗余续写上。

  


论文 Figure 5：五个模型中 41–52% 的 token 属于「答案后冗余」；多数模型在推理进度 40–60% 附近就已达到最终会提交的答案。

  


现有早停的盲区：

只盯 trial answer 的 readiness

  


现有的 inference-time early-exit 工作，大多盯着 trial answer 的 readiness：在每个可能的停机点，从当前推理前缀诱导出一个临时答案（trial answer），据它的置信度或连续一致性判断「是否可以提交」。

  


问题在于，readiness 只反映答案层面的稳定，并不等于推理已经收敛。回溯实验把这一盲区量化了出来：置信度信号的误停率平均约 44%、答案一致性约 64%；更关键的是，其中相当一部分属于「过早退出」—— 若不打断，模型本能继续自我纠正并最终答对，而阈值扫描表明这一权衡无法靠调参消除。

  


论文 Figure 1：「答案就绪」≠「推理收敛」。置信度 / 一致性在错误答案阶段就可能误触早停，而步骤间语义相似度只在推理收敛处才明显升高。

  


PUMA 的关键：不只看答案稳没稳，

更看推理还有没有新信息

  


PUMA 换了个角度：直接观察最近的推理还在不在产生新的语义进展。若当前步与它的近邻高度相似、只是在重复 / 复述 / 重新验证既有结论、不再提供新的语义信息，就说明推理大概率已进入收敛 —— 这里才值得考虑停止。这个信号与答案层信号互补：探索阶段相邻步骤的相似度一直较低，收敛时才明显升高。

  


PUMA (Progress-aware Unified Monitoring framework for Adaptive early exit) 是一个即插即用的早停框架，在推理阶段运行，不改权重、也不改原始 prompt。

  


它把「在哪里考虑停」和「到底能不能停」拆开：一个轻量冗余探测器（基于 Qwen3-Embedding-0.6B 对比学习微调的嵌入模型）实时标出候选退出点；只有在这些点上才触发答案复核，检查试探答案（trial answer）是否足够自信、多个候选点是否一致、置信度有无明显下滑。两关都过才真正踩刹车；如果后期持续陷入重复但复核始终未通过，则由 Loop Breaker 兜底，避免无休止地继续思考。

  


论文 Figure 2：PUMA 框架总览 —— 冗余探测器定位候选退出点，答案复核确认后停止，Loop Breaker 兜底。左侧真实轨迹演示它删掉收敛后的冗余续写、同时保留完整推理前缀。

  


主实验：平均少 26.2% token，

准确率基本不掉，速度也真的上去了

  


作者在 5 个长思考模型（DeepSeek-R1-Distill-Qwen 7B/14B/32B、Llama-3.1-Nemotron-Nano-8B、Qwen3-30B-A3B-Thinking）和 5 个高难度基准（MATH-500、AIME24/25、OlympiadBench、GPQA-Diamond）上测试 PUMA。

  


结果是：平均减少 26.2% token，准确率基本保持；部分设置下，因为及时避开了答案后的「后期漂移」，准确率反而略有上升。这点和单纯要求模型「少说一点」不同。prompt 压缩会连必要推理一起压掉：例如在 Qwen3-30B 上，这类方法把准确率从 Full CoT 的 81.7% 拉低到 45–60%，PUMA 则保持在 82.5%。

  


与只看答案 readiness 的 Answer Convergence、Dynasor、DEER 相比，PUMA 的准确率 — 效率权衡也更稳定。省下的 token 还能转成真实推理速度：DS-7B 加速 1.40×，DS-14B 加速 1.28×。

  


LLM-as-Judge 的结果也显示，PUMA 保留下来的思维链在连贯性、简洁性和论证充分性上平均得分最高 —— 它做的是「删掉收敛后的冗余」，不是把思考过程生硬砍半。

  


论文 Table 1：三个代表性模型 × 五个基准的准确率（Acc）—token 缩减率（TR）对比（完整五模型结果见附录 Table 14）。

  


论文 Figure 3：token 缩减能否转化为真实提速 ——PUMA 的冗余探测器仅占 0.4–1.1% 耗时，答案复核开销也很小。

  


论文 Table 2：LLM-as-Judge 对各方法保留推理链的质量评分，PUMA 平均最高。

  


可迁移到代码生成和多模态推理，

还能把「该停就停」训练进模型

  


这个信号还能零样本迁移到文本数学之外：代码生成（LiveCodeBench，仅调整冗余阈值 τ_sim=0.50）减少 18–19% token、pass@1 变化不超过 1.5 个点；多模态推理（MathVista / MathVision）不重训、不调参，token 减少 23.8–33.6%。

  


更进一步，把 PUMA 选出的退出位置当作监督信号，用 SFT / DPO / GRPO 内化进模型后，部署时不带任何 PUMA 模块也能自己「该停就停」——PUMA-RL 的平均准确率（67.0）与 token 缩减（34.9%）都反超免训练版 PUMA（66.2 / 24.3%）。

  


论文 Table 3：迁移到代码（LiveCodeBench）与多模态（MathVista / MathVision）推理的结果。

  


论文 Table 5：用 SFT / DPO / GRPO 把 PUMA 的停机信号内化进模型（评测集 MATH-500、AIME24、GPQA-Diamond）。

  


一句话总结：推理早停最容易踩的坑，是把「trial answer 的 readiness」当成「推理收敛」。PUMA 用「最近的推理是否还在产生新的语义进展」定位候选停机点，再用答案复核兜底 —— 实验表明，这是一个可靠、可迁移、也可学习的高效推理信号。（Limitation：方法依赖分步推理轨迹，当输出很短或难以切分时效果会打折。）

  


作者介绍

  


  


本文第一作者闵德海为伊利诺伊大学芝加哥分校计算机系博士生，导师为 Philip S. Yu 教授（ACM/IEEE/AAAS Fellow）。他目前在 ByteDance 美国团队担任 Research Scientist Intern，工作聚焦 Agent Harness 与 Agent 数据合成，研究方向包括 RAG/Deep Research 及高效可信大模型。该论文合作单位包括 UIC、Google Research、UIUC 和米兰理工大学。

  


  
  
  
**「蚂蚁InTech奖」倒计时申报中** 蚂蚁InTech奖是由蚂蚁集团发起，面向对计算机领域科研进步有关键推动作用的中国青年学者、青年博士颁发的纯公益性奖项，分为蚂蚁InTech科技奖与蚂蚁InTech奖学金。2026届蚂蚁InTech奖将于7月17日24时截止申报，有意向申报的学者/同学欢迎扫描海报中二维码进行申报。© THE END 转载请联系本公众号获得授权投稿或寻求报道：liyazhou@jiqizhixin.com
