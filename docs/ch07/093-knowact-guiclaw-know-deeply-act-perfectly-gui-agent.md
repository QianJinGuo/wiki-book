# KnowAct-GUIClaw — 哈工大「Know Deeply, Act Perfectly」自进化 GUI Agent

## Ch07.093 KnowAct-GUIClaw — 哈工大「Know Deeply, Act Perfectly」自进化 GUI Agent

> 📊 Level ⭐⭐ | 2.3KB | `entities/knowact-guiclaw-self-evolving-gui-agent-harbin-hitsz.md`

# KnowAct-GUIClaw — 哈工大「Know Deeply, Act Perfectly」自进化 GUI Agent

## 概述

哈工大张民教授立知大模型团队开源 **KnowAct-GUIClaw**，面向个人助手提出 **「Know Deeply, Act Perfectly」**（知道得越深，行动得越准）范式，在长程 GUI 任务评测基准 MobileWorld 上达到 SOTA。论文 arxiv 2607.12625，代码 github.com/HITsz-TMG/KnowAct。

## 核心问题

仅给 OpenClaw 通用智能体「外挂」一个 GUI Agent，仍会遇到：跨应用信息易丢失、操作依赖不断变化的图形界面、执行轨迹用完即弃。许多现有 GUI 智能体每次面对任务都像第一次使用设备——走过的弯路不会成经验，成功操作无法沉淀为可复用能力。

## 架构：主智能体编排 + 可插拔 GUI 智能体

框架以具备长期上下文、记忆和工具能力的主智能体负责任务编排，以可插拔的 GUI 智能体负责实时界面操作，在二者间实现「知道得深 → 行动得准」的自进化闭环。它直接回答「只用一句自然语言指令，让个人 AI 助手跨 App 连续干活（提取会议地址→转发联系人→打开地图规划路线）」这一场景。

## 意义

KnowAct-GUIClaw 与 [MobileForge](../ch03/019-agent.html)、[MemGUI](../ch03/019-agent.html)、[SaaS-Bench](../ch03/019-agent.html) 同属 GUI Agent 前沿，其「主智能体记忆编排 + 自进化」路线与 [OpenClaw](../ch11/254-openclaw.html) 生态深度耦合。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/knowact-guiclaw-self-evolving-gui-agent-harbin-hitsz.md)

---

