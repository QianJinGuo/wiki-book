# 刷榜AI全挂了！Meta斯坦福地狱级测试，GPT/Claude/Gemini交出0分

## Ch01.613 刷榜AI全挂了！Meta斯坦福地狱级测试，GPT/Claude/Gemini交出0分

> 📊 Level ⭐⭐ | 7.3KB | `entities/2026-05-06-刷榜AI全挂了-Meta斯坦福地狱级测试-GPT-Claude-Gemini交出-新智元.md`

# 刷榜AI全挂了！Meta斯坦福地狱级测试，GPT/Claude/Gemini交出0分

---
title: 刷榜AI全挂了！Meta斯坦福地狱级测试，GPT/Claude/Gemini交出0分
source: wechat
url: https://mp.weixin.qq.com/s/yTW-EcMGlrzjKp3PFRYTbA
mp_name: 新智元
publish_date: 2026-05-06
---

# 刷榜AI全挂了！Meta斯坦福地狱级测试，GPT/Claude/Gemini交出0分

**来源**: 新智元

**发布日期**: 2026-05-06

**原文链接**: https://mp.weixin.qq.com/s/yTW-EcMGlrzjKp3PFRYTbA

---

### 

### --- 新智元报道

编辑：好困
【新智元导读】 SWE-Bench上能拿72%的模型，换张考卷直接归零！Meta联合斯坦福、哈佛放出ProgramBench，200个项目从零手写，9大顶级模型完整通过率0%。最强的Claude Opus 4.7平均通过率也才51.2%。更离谱的是一联网，就有模型在36%的任务里跑去GitHub扒源码。

给你一份F

## 核心要点

> 本文为微信公众号文章，由 WeChat backfill 收录。

## 详细信息

---
title: 刷榜AI全挂了！Meta斯坦福地狱级测试，GPT/Claude/Gemini交出0分
source: wechat
url: https://mp.weixin.qq.com/s/yTW-EcMGlrzjKp3PFRYTbA
mp_name: 新智元
publish_date: 2026-05-06
---

# 刷榜AI全挂了！Meta斯坦福地狱级测试，GPT/Claude/Gemini交出0分

**来源**: 新智元

**发布日期**: 2026-05-06

**原文链接**: https://mp.weixin.qq.com/s/yTW-EcMGlrzjKp3PFRYTbA

---

### 

### --- 新智元报道

编辑：好困
【新智元导读】 SWE-Bench上能拿72%的模型，换张考卷直接归零！Meta联合斯坦福、哈佛放出ProgramBench，200个项目从零手写，9大顶级模型完整通过率0%。最强的Claude Opus 4.7平均通过率也才51.2%。更离谱的是一联网，就有模型在36%的任务里跑去GitHub扒源码。

给你一份FFmpeg的使用文档，和一个编译好的可执行文件。

现在，从零把整个程序重新写出来。

这就是ProgramBench给全球顶级AI出的题。

昨天刚发布，出自SWE-Bench原班人马之手，Meta、斯坦福、哈佛三家联手打造。

200个软件项目。9个顶级模型。 通过率，0%！

共同一作John Yang，斯坦福在读博士，同时也是SWE-Bench和SWE-agent的创建者

不是修bug，是从零造软件

## 

过去一年，「让AI Agent从零造软件」的案例报道越来越多。

Anthropic用一组平行Claude写了个C编译器，Cursor发博客讲长时间自主编程，Epoch AI的MirrorCode也在做类似的事。

但这些案例有个共同问题，每次只测几个项目，脚手架都是手工调优的。

相比之下，ProgramBench把这件事正规化了。

200个任务，统一脚手架，系统性反作弊，一把拉到benchmark的标准。

论文地址：https://programbench.com/static/paper.pdf

在之前的测试中，SWE-Bench会给你一个现成的代码库，告诉你哪里有bug或者需要加什么功能，你去改。本质上是「阅读理解+局部手术」。

而且在评估层面，它用的是单元测试，检查你的代码内部实现对不对，你的函数签名、变量名都得和预期一致。

ProgramBench则完全反过来。

它只给你两样东西，一个编译好的可执行文件，加上使用文档。

你的任务是仅凭运行这个程序、观察它的输入输出行为，从零写出一套能复现同样行为的代码。

选什么编程语言，用什么数据结构，怎么拆分模块，全部你自己定。

没有代码骨架，没有函数签名，没有任何提示。

评估方式上，研究团队用Agent驱动的模糊测试，为200个任务生成了总计248,853个行为测试。

你写的程序跑一遍，输入输出和原版一致就算过，不一致就挂。测试永远不会透露给模型。

和SWE-Bench的单元测试不同，ProgramBench的行为测试完全不关心你的代码内部长什么样，只要行为一致就行。

200个任务覆盖的项目横跨压缩工具（zstd、lz4、brotli）、语言解释器（PHP、Lua、tinycc）、数据库（DuckDB、SQLite）、媒体处理（FFmpeg）、开发者工具（ripgrep、fzf、jq）。

代码行数中位数8,635行，最大的FFmpeg有270万行。

总结来说，这个测试考的是AI有没有能力「像人类工程师一样思考和设计软件」，而不只是「在现成代码里找到该改的地方然后改对」。

九大模型排排坐，成绩全部吃鸭蛋

## 

参加测试的共有9款模型，涵盖Claude、Gemini、GPT三大家族。

完整通过率（所有测试全部通过），全员0%。

先看三家旗舰的正面对决。

GPT-5.4和Gemini 3.1 Pro的平均测试通过率几乎打平，分别是38.3%和36.6%。但两者的做题风格截然不同。

GPT-5.4只用16次API调用、0.33美元成本，基本就是一口气把整个程序写完，100%的代码在一次编辑中生成，之后几乎不回头改。

Gemini 3.1 Pro则是9个模型里最爱「观察」的。它用了94次API调用，其中34.1%的操作都在运行原版程序、观察输入输出行为。探索做得最多，但最终成绩差距不大。

真正拉开身位的是Claude Opus 4.7。

平均通过率51.2%，在3%的任务上通过了95%以上的测试，是唯一达到「几乎通过」标准的模型。但即便是

## 原文

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/2026-05-06-刷榜AI全挂了-Meta斯坦福地狱级测试-GPT-Claude-Gemini交出-新智元.md)

---

