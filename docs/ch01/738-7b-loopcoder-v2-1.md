# 都在卷「让大模型多循环几遍」，这个7B模型LoopCoder v2说：多循环 1 次就够了

## Ch01.738 都在卷「让大模型多循环几遍」，这个7B模型LoopCoder v2说：多循环 1 次就够了

> 📊 Level ⭐⭐ | 6.3KB | `entities/都在卷让大模型多循环几遍这个7b模型loopcoder-v2说多循环-1-次就够了.md`

# 都在卷「让大模型多循环几遍」，这个7B模型LoopCoder v2说：多循环 1 次就够了

---
source: wechat
source_url: https://mp.weixin.qq.com/s/L_Bmxw44h4PFCQTO68lrpg
ingested: 2026-07-01
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-06-30
---

# 都在卷「让大模型多循环几遍」，这个7B模型LoopCoder v2说：多循环 1 次就够了

当所有人都在比谁「想得更久、算得更多」——推理模型动辄输出成千上万个思考 token，循环式架构恨不得在内部反复迭代十遍八遍——一项新研究反手泼了盆冷水：  一个 7B 的小模型，只需要在正常计算之外「多循环这一次」（总共 2 次），就能在号称最难的真实代码修复基准 SWE-bench Verified 上从 43.0 分飙到 64.4 分；而继续往上加循环，不仅不涨，反而一路跳水。

论文标题起得很干脆——《Only Loop Once》，只循环一次。背后是来自  北京航空航天大学、IQuest Research、澜舟

## 核心要点

> 本文为微信公众号文章，由 WeChat backfill 收录。

## 详细信息

---
source: wechat
source_url: https://mp.weixin.qq.com/s/L_Bmxw44h4PFCQTO68lrpg
ingested: 2026-07-01
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-06-30
---

# 都在卷「让大模型多循环几遍」，这个7B模型LoopCoder v2说：多循环 1 次就够了

当所有人都在比谁「想得更久、算得更多」——推理模型动辄输出成千上万个思考 token，循环式架构恨不得在内部反复迭代十遍八遍——一项新研究反手泼了盆冷水：  一个 7B 的小模型，只需要在正常计算之外「多循环这一次」（总共 2 次），就能在号称最难的真实代码修复基准 SWE-bench Verified 上从 43.0 分飙到 64.4 分；而继续往上加循环，不仅不涨，反而一路跳水。

论文标题起得很干脆——《Only Loop Once》，只循环一次。背后是来自  北京航空航天大学、IQuest Research、澜舟科技和中国人民大学  的联合团队。

* ** 论文标题：  ** LoopCoder-v2：Only Loop Once for Efficient Test-Time Computation Scaling

* 论文地址：  https://arxiv.org/pdf/2606.18023

* 研究团队：北京航空航天大学 · IQuest Research · 澜舟科技 · 中国人民大学

* ** 模型主页（HuggingFace）：  ** ` huggingface.co/Multilingual-Multimodal-NLP/LoopCoder-V2  `

▲ 核心结论一图流：多循环带来「精修收益」，也带来几乎恒定的「位置错配成本」；收益在第 2 次循环达到峰值后迅速衰减，于是「只循环一次（共 2 次）」成为最优解。

###  一、「循环」，当下最热的卷法

###

自从 o1、Claude 这一代推理模型把「想得越久越强」写进行业共识，  「测试时计算」（test-time compute）就成了过去一年最热的方向：  与其把模型练得更大，不如让它在推理时多花点算力，把答案反复打磨。要理解这项研究，先得知道大家具体在卷什么。

过去想让模型更强，常规操作是把网络堆得更深、参数更多。而「循环式」大模型（Looped / Recurrent-depth LLM）换了个思路：不堆新层，而是让  同一套参数，在「脑子里」把内部表征反复打磨好几遍。  打个比方，这就像同一个人把一道题在心里默默重算几遍，而不是请来更多人、或者把草稿纸写满——它是一种省参数的「测试时计算」（test-time compute）。

听起来很美，但有个硬伤：  顺序循环太贵。  每多循环一次，就要多走一遍计算，延迟和 KV-cache 显存都跟着循环次数线性上涨。想多循环，算力扛不住。

并行循环 Transformer（Parallel Loop Transformer，PLT）就是为了解决这个问题。它用两招把成本摁了下去：一是 CLP（跨循环位置偏移），打断循环之间的串行依赖，让多次循环可以并行计算；二是 G-SWA（共享 KV 的门控滑窗注意力），让显存几乎不随循环次数增长。成本被压平之后，  「循环几次」第一次变成了一个可以自由拧的旋钮。

###  二、旋钮拧大 ≠ 更强：

###  第 2 遍封顶，第 3 遍跳水

###

问题来了：这个旋钮，到底拧到几合适？

团队干脆从零训了一整个家族：7B 稠密模型，  18T token、文本与代码 1:1、覆盖 100 多种编程语言，前后烧掉约 100 万 GPU 小时。  唯一的变量，就是循环次数。结果非常反直觉：

** 模型（均为 7B）  ** |  ** SWE-bench Verified  ** |  ** SWE-bench 多语言  ** |  ** LiveCode Bench  ** |  ** 平均分  **
---|---|---|---|---
不循环 Baseline（1 次）  |  43.0  |  14.0  |  27.4  |  38.0
** LoopCoder-v2（2 次）★  ** |  ** 64.4  ** |  ** 31.0  ** |  ** 35.4  ** |  ** 46.5  **
LoopCoder-v2（3 次）  |  27.6  |  11.0  |  28.6  |  36.9
LoopCoder-v2（4 次）  | 

## 原文

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/都在卷让大模型多循环几遍这个7b模型loopcoder-v2说多循环-1-次就够了.md)

---

