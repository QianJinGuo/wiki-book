# 0%完成率！Claude、GPT、Gemini 全灭，SWE-Bench作者新作把AI圈干沉默了

## Ch01.583 0%完成率！Claude、GPT、Gemini 全灭，SWE-Bench作者新作把AI圈干沉默了

> 📊 Level ⭐⭐ | 7.7KB | `entities/2026-05-07-0-完成率-Claude-GPT-Gemini-全灭-SWE-Bench作者新作-机器之心.md`

# 0%完成率！Claude、GPT、Gemini 全灭，SWE-Bench作者新作把AI圈干沉默了

---
title: 0%完成率！Claude、GPT、Gemini 全灭，SWE-Bench作者新作把AI圈干沉默了
source: wechat
url: https://mp.weixin.qq.com/s/43wPVMKzNxC_R0ZYmUn0Rg
mp_name: 机器之心
publish_date: 2026-05-07
---

# 0%完成率！Claude、GPT、Gemini 全灭，SWE-Bench作者新作把AI圈干沉默了

**来源**: 机器之心

**发布日期**: 2026-05-07

**原文链接**: https://mp.weixin.qq.com/s/43wPVMKzNxC_R0ZYmUn0Rg

---

编辑｜Sia

SWE-Bench 的创建者，刚刚又放出了一个地狱级新 benchmark。

结果相当震撼：

Claude Opus 4.7、GPT-5.4、GPT-5 mini、Gemini 3.1 Pro、Gemini 3 Flash——这一代几乎所有最强的一线模型，全部 0% 完成率。

没有一个模型，能够真正完整重建一个软件项目。

## 核心要点

> 本文为微信公众号文章，由 WeChat backfill 收录。

## 详细信息

---
title: 0%完成率！Claude、GPT、Gemini 全灭，SWE-Bench作者新作把AI圈干沉默了
source: wechat
url: https://mp.weixin.qq.com/s/43wPVMKzNxC_R0ZYmUn0Rg
mp_name: 机器之心
publish_date: 2026-05-07
---

# 0%完成率！Claude、GPT、Gemini 全灭，SWE-Bench作者新作把AI圈干沉默了

**来源**: 机器之心

**发布日期**: 2026-05-07

**原文链接**: https://mp.weixin.qq.com/s/43wPVMKzNxC_R0ZYmUn0Rg

---

编辑｜Sia

SWE-Bench 的创建者，刚刚又放出了一个地狱级新 benchmark。

结果相当震撼：

Claude Opus 4.7、GPT-5.4、GPT-5 mini、Gemini 3.1 Pro、Gemini 3 Flash——这一代几乎所有最强的一线模型，全部 0% 完成率。

没有一个模型，能够真正完整重建一个软件项目。

这意味着什么？

今天的大模型，已经很会写代码了，但依然不会做软件工程。

最近，Meta FAIR 联合斯坦福、哈佛等机构发布了一项很有意思的新 benchmark， 本质上是在重新定义 AI Coding 的评估方式：

ProgramBench: Can Language Models Rebuild Programs From Scratch?

过去的大模型编程 benchmark，大多测的是局部能力：补全函数、修复 bug、实现 feature……本质上，仍然是在已有代码结构里做局部修改。

而 ProgramBench 第一次把问题推进到了真正的软件工程层面：如果只给 AI 一个程序的功能描述和 usage docs，它能不能像真正的工程师一样，从零开始，重新构建一个真实、可执行的软件系统？比如 ffmpeg、SQLite、ripgrep。

而且——不能联网。

换句话说：模型到底有没有工程智能？

为了测试这一点，研究团队直接删除了原始源码和测试，只保留 executable 和 usage docs，模型需要自己决定语言、架构、模块拆分、数据结构乃至整个 repo 的组织方式。

更关键的是，ProgramBench 不再按照源码相似度打分。它采用的是 behavioral equivalence，行为等价。也就是说，你可以用完全不同的语言、算法、架构，甚至完全不同的工程实现。只要最终输入输出行为与原程序一致，就算通过。

研究团队甚至使用了 agent-driven fuzzing，自动生成大量端到端行为测试。

这是第一次，一个 benchmark 真正开始逼近现实世界的软件工程，而不再只是代码做题。结果出来之后，整个 AI 圈都沉默了。

所有模型：0% 完成率。

Table 2 负责制造震撼，那么 Figure 4 负责解释震撼背后的细节。它告诉我们，模型并不是完全不会做，而是经常能做出一部分，甚至在少数任务上接近完成；但只要要求 100% 行为等价，所有模型都会倒下。但这最后一公里，正是软件工程和普通代码生成最大的区别。另外，如果 矮子里面拔将军，Claude 系列（尤其是 Opus 4.7 和 4.6）表现相对最好。

即便论文专门增加了一个 Almost 指标——统计那些完成度超过 95% 的任务。目前表现最强的 Claude Opus 4.7，也只有 3% 的任务接近完成。

论文里，有一句特别关键的话：

Models favor monolithic, single-file implementations that diverge sharply from human-written code.

翻译过来就是：模型极度倾向于生成单体化代码。大量逻辑被塞进单文件；目录结构极浅；模块拆分极少；函数超长；整个 repo 看起来像一坨巨型脚本。

这和优秀人类工程师的习惯，几乎完全相反。

后者往往讲究模块和关注点分离，会把代码拆得很优雅——配置放  config.json  ，工具函数放  utils.py  ，数据库操作放  db.py  ，然后通过  import  相互调用。

这其实暴露出了一个非常核心的问题：AI 擅长的是局部代码生成，但不擅长全局系统规划。而真实的软件工程，本质上恰恰是后者。

这也是为什么模型在 LeetCode、SWE-Bench、Copilot 场景里已经非常强，一旦进入真实世界的大型工程系统，就会迅速掉进深水区。

当前 AI Coding 的真正瓶颈已经不再是代码生

## 原文

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/2026-05-07-0-完成率-Claude-GPT-Gemini-全灭-SWE-Bench作者新作-机器之心.md)

---

