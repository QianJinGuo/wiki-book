---
title: "模型好不好用，谁说了算？从榜单崇拜到自建评测"
source_url: "https://mp.weixin.qq.com/s/Olx1zOQzdEmoc_FMUi9nEQ"
author: "李俊霖(鲸羚) / 千问AI平台"
platform: WeChat
ingested: 2026-07-29
slug: model-evaluation-from-benchmark-worship-to-self-built-evals
sha256: d6e7b91528a0eae671ff57b798f634cf1bc31991f613e9c66cd35b10dbf5ac73
---

阿里妹导读：文章内容基于作者个人技术实践与独立思考，旨在分享经验，仅代表个人观点。

## HLE：人类最后的考试

2025 年 1 月，Scale AI 和 CAIS 联手出了一张很难的试卷——Humanity's Last Exam (HLE)。出题人征集全球专家近 2500 道研究生以上难度题目，每一道都故意设计成搜索引擎查不到答案。刚发布时最强模型正确率不到 10%。但仅仅一年半后，在公开榜单口径下 HLE 榜首正确率已达 50% 以上。

HLE 的核心组织者 Dan Hendrycks 正是五年前 MMLU 论文的第一作者。同一个人，出的第一张卷子已经被遗弃，于是他出了第二张更难的试卷。但在可以预见的未来，第二张试卷也会被淘汰。这不是 HLE 的失败，而是所有评测的命运。

## 古德哈特定律：指标失真的必然

英国经济学家 Charles Goodhart 在 1975 年指出：Any observed statistical regularity will tend to collapse once pressure is placed upon it for control purposes。人类学家 Marilyn Strathern 将其改写为更流行的版本：When a measure becomes a target, it ceases to be a good measure。

放到模型评测里，就是四代评测的不断循环。

## 四代模型评测的命运

### 第一代：固定考卷（MMLU/HLE）

2020 年 GPT-3 发布后，MMLU、GSM8K、HumanEval 出现。两个致命问题：背题（题目公开后可能进入训练数据，分数测到的是记忆力而非能力）、满分（题目难度固定，模型能力上涨后大家满分，考卷失去存在意义）。

### 第二代：真人盲测（Chatbot Arena / LMArena）

2023 年 UC Berkeley LMSYS 上线 Chatbot Arena。题目由真实用户实时生成，模型无法背题。但问题来了：一些模型针对人类评估者的偏好做了优化（多用列表、控制回答长度、加表情符号），不影响实际能力但确实能让评估者更倾向投票。

### 第三代：真实任务（SWE-bench）

2023 年 10 月普林斯顿团队发布 SWE-bench。从 GitHub 拿真实 issue，模型要读懂代码库、定位问题、写出补丁、跑测试。巧妙之处在判分：FAIL_TO_PASS（判断是否真正修掉 bug）+ PASS_TO_PASS（判断有没有改坏别的功能）。但 SWE-bench 测的是 GitHub 开源项目 issue，不一定是你的业务。

### 第四代：Agent 全链路（BrowseComp / Terminal-Bench）

2025 年评测方法升级：不只看模型怎么回答，而是看系统能不能办事。OpenAI BrowseComp 包含 1266 道"难找但容易验证"的网页检索题。Terminal-Bench 把模型扔进真实终端执行任务。但 Agent 评测的朴素问题是贵：一次完整链路成本是固定考卷的几十倍，样本量小导致结果不稳定，复现也麻烦。

## 如何规避古德哈特定律

最直接的办法不是再找一张更难的卷子，而是用自己真实题目来评测模型。公开榜单给出行业坐标，自己的测试集才能告诉你这个模型能不能进流程。

可以收集自己遇到的模型难以解决的问题作为测试集。作者用 AI 写了个 Chrome 插件，在表格里输入数据后自动同步到 jsonl 文件。

数据集可以一鱼两吃：出新模型时拿它当测试集，日常工作中拿它当 few-shot 增强模型能力。
