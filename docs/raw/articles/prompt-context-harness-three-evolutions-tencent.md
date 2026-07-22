---
title: "从Prompt、Context到Harness，工程的三次进化与终局之战"
authors:
  - 李伟山
platform: 高可用架构
url: https://mp.weixin.qq.com/s/1lqMtE3HjXkbNlPDYhgXyw
original_title: "从Prompt、Context到Harness，工程的三次进化与终局之战"
source: prompt-context-harness-three-evolutions-tencent
cover: []
tags:
  - Prompt Engineering
  - Context Engineering
  - Harness Engineering
  - RAG
  - CLAUDE.md
  - AI Engineering
  - 工程范式
  - 腾讯云开发者
publish_date: 2026-05-27
updated_date: 2026-05-27
score: 49
scored_by: MiniMax-M2.7
v: 7
c: 7
sha256: c96dcba7544472b5887c0ee3b00b4d8a295dc786918b99389e7009d95bcef11a
---

# 从Prompt、Context到Harness，工程的三次进化与终局之战

## 引言

OpenAI 内部 3-7 人小团队，在五个月内让 AI 生成了将近 100 万行生产级别代码。全程没有一个工程师亲手写过一行业务逻辑代码。

三个关键概念：Prompt Engineering、Context Engineering、Harness Engineering。

## 第一进化：Prompt Engineering

### 核心本质

LLM 底层逻辑是一个极其擅长续写的系统。给它一段输入，它预测接下来最有可能出现的内容，不断生成，直到任务完成。**最有可能出现 ≠ 你真正想要的**。加约束的过程就是 Prompt Engineering。

### 武器库

GPT 早期炙手可热的技巧：Few-shot、Chain-of-Thought、Role Prompting、Output Formatting 等。

### 繁荣与衰退

GPT-3 时代需要精心设计的少样本提示才能完成稍复杂任务。GPT-4/Claude 3 时代，模型语言理解能力足够强后，写好 Prompt 的边际效益显著降低。

更深层问题浮现：即使模型听懂了你的话，它依然可能给出错误答案——因为它根本不知道一些关键信息，这就是上下文。

## 第二进化：Context Engineering

### 核心比喻：失忆症患者困境

思想实验：雇一位全世界最聪明的助理，但记忆只有 7 秒。每次会面重新从零开始。你会在每次见面前把关键信息整理成一份简报递给他。

**这个准备简报的过程，就是 Context Engineering。**

LLM 本质就是这位金鱼助理——每次对话，能看到的信息被严格限制在上下文窗口（Context Window）之内，窗口外的一切它一无所知。

### 上下文窗口的层次

一个完整的 LLM 上下文通常包含：
- System Prompt
- User Context
- Retrieval Context (RAG)
- Conversation History

每层都至关重要，却又都在争夺有限的 Token 空间。

### RAG：让模型按需取用知识

传统做法把所有知识写进 System Prompt → 空间爆满，模型不知道看哪里，输出质量反而下降。

RAG（Retrieval-Augmented Generation）让模型按需取用知识。

## 第三进化：Harness Engineering

（完整内容需进一步提取，本文快照不完整）

Harness Engineering 是将前两者融合的工程化框架，包括 CLAUDE.md、Hooks、Skills、MCP Servers、Subagents、Repo Map 等机制。

## 结语：三者融合

当 Prompt Engineering + Context Engineering + Harness Engineering 三者融合，AI 工程师的终极形态是什么？
