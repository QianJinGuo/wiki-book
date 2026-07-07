# 不只DeepSeek，阶跃等开源JetSpec：大模型解码提速近10倍

## Ch01.232 不只DeepSeek，阶跃等开源JetSpec：大模型解码提速近10倍

> 📊 Level ⭐ | 2.3KB | `entities/不只deepseek阶跃等开源jetspec大模型解码提速近10倍.md`

# 不只DeepSeek，阶跃等开源JetSpec：大模型解码提速近10倍

**来源**: 机器之心

**发布日期**: 2026-06-30

**原文链接**: https://mp.weixin.qq.com/s/4Xqc8Jm0mRHn4BTy6VCfUw

---

机器之心发布

近期，DeepSeek 推出投机解码框架 DSpark，让大模型推理效率再次成为行业焦点。

几乎同一时间，另一大模型基座代表阶跃星辰提出了 JetSpec ，也把问题指向了同一个方向： 当模型开始被 Agent 高频调用，智能能不能更快、更稳定输出出来？

- JetSpec 项目地址：https://jetspec-project.github.io/jetspec-web/

- 论文地址：https://arxiv.org/abs/2606.18394

- 开源地址：https://github.com/hao-ai-lab/JetSpec

简单来说，DSpark 更关注推理服务中的验证效率，JetSpec 则从 Draft 生成本身入手，用因果并行树生成提高一次验证能接受的 Token 数。前者是在系统层面减少无效计算，后者是在算法层面提高有效 Token 生成率。

从结果来看，DSpark 展示了推理服务在生产系统中仍有 60%-85%（Flash 模型）和 57%-78%（Pro 模型）的速度提升空间。JetSpec 则从算法侧给出了一组更直接的加速结果。在 Qwen3-8B 上，JetSpec 相比标准自回归解码，最高实现 9.64× 端到端解码加速；在 MATH-500 上，一次验证平均可接受 10.76 个 token。这种加速不局限于数学任务，在 HumanEval、LiveCodeBench、MT-Bench 等代码和对话任务上，JetSpec 也分别实现了 7.12×、7.67× 和 4.58× 加速。

在 H100 GPU 上，跨数学、代码和对话基准测试中，相较于标准自回归解码的端到端解码加速比。DFlash 表示原始的块并行草稿方法，DDTree 是 DFlash 的树状变体，JetSpec 表示本文提出的方法。两者均采用算法 1，使用 256 个 token 的树预算。

过去几年，大模型竞争的主线看的是谁的模型更强，谁能在数学、代码

---

