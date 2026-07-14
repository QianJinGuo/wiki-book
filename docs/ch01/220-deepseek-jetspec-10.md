# DeepSeek点燃大模型效率之争，阶跃火速接棒：JetSpec让大模型解码速度最高提升近10倍

## Ch01.220 DeepSeek点燃大模型效率之争，阶跃火速接棒：JetSpec让大模型解码速度最高提升近10倍

> 📊 Level ⭐ | 2.5KB | `entities/deepseek点燃大模型效率之争阶跃火速接棒jetspec让大模型解码速度最高提升近10倍.md`

# DeepSeek点燃大模型效率之争，阶跃火速接棒：JetSpec让大模型解码速度最高提升近10倍

**来源**: 量子位

**发布日期**: 2026-06-30

**原文链接**: https://mp.weixin.qq.com/s/JucDgrZBncTtEAu7Quv_Og

---

JetSpec团队 投稿 量子位 | 公众号 QbitAI

近期，DeepSeek发布DSpark让大模型推理效率再次成为行业焦点。

几乎在同一时间，另一大模型基座代表阶跃星辰参与发表了一篇名为《JetSpec：Breaking the Scaling Ceiling of Speculative Decoding with Parallel Tree Drafting》的论文，也回答了一个相似问题： 当模型能力继续提升，下一阶段AI竞争不只是谁更聪明，而是谁能把智能更快、更稳定地输出出来。

简单来说，DSpark更关注推理服务中的验证效率，JetSpec则从Draft生成本身入手，用因果并行树生成提高一次验证能接受的Token数。前者是在系统层面减少无效计算，后者是在算法层面提高有效Token生成率。

从结果来看，DSpark展示了推理服务在生产系统中仍有60%-85%  （Flash模型）  和57%-78%  （Pro模型）  的速度提升空间；JetSpec则从算法侧给出了一组更直接的加速结果：在Qwen3-8B上，JetSpec相比标准自回归解码最高实现9.64×端到端解码加速；在MATH-500上，一次验证平均可接受10.76个token。更重要的是，这种加速并不只出现在数学任务，在HumanEval、LiveCodeBench、MT-Bench等代码和对话任务上，JetSpec也分别实现了7.12×、7.67×和4.58×加速。

放在阶跃的技术路线里看，JetSpec不是一个孤立的推理加速论文，而是Flash模型叙事的一部分。从Step 3.5 Flash到Step 3.7 Flash，阶跃一直强调的并不是“大而全”的模型竞赛，而是面向Agent场景的高效智能： 更快的输出速度、更优的调用成本、更好的工具调用与多模态任务执行能力 。JetSpec则进一步从推理算法层面补上了这块拼图——当模型开始被Agent高频、长链路、持续调用时，真正决定体验

---

