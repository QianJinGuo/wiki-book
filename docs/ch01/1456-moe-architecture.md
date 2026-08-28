# MoE Architecture

## Ch01.1456 MoE Architecture

> 📊 Level ⭐⭐ | 1.4KB | `entities/moe-architecture.md`

# MoE Architecture

> -> [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/macaron-v1-lora-moe-architecture.md)

## 概述

--- source: wechat source_url: https://mp.weixin.qq.com/s/boUmwrrSP45leZzPh2a3Xw ingested: 2026-07-22 source_published: 2026年7月22日 19:22 --- 这几个月国产模型的节奏有点吓人。GLM-5.2出来的时候，大家讨论的是它已经基本接近Opus 4.8了；Kimi K3发布后，很多榜单上比较对象直接换成了Fable 5；上周阿里又发了2.4T的Qwen3.8。国产模型是真的起来了。 最近，我又注意到一个走了完全不同路线的模型。别人都在拼通用旗舰，它把GLM-5.2整个拿来当地基，冻住不动，在上面训了四个小专家，说自己是个人模型。Mind Lab刚发布的Macaron V1：大概是全球首个基于GLM-5.2完成后训练的模型。

## 主要内容

- LoRA的一种新用法
- 把我的4580条动态喂给它
- 编程：拉来K3和Opus同台
- Agent能力实测：我把自己的开源仓库交给了它
- UI4A：模型直接把界面画给你
- 写在最后

## 来源

- [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/macaron-v1-lora-moe-architecture.md)
- 原始链接: https://mp.weixin.qq.com/s/boUmwrrSP45leZzPh2a3Xw

---

