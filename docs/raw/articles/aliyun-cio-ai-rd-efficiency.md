---
source_url: https://mp.weixin.qq.com/s/f5f299W9wxwhKr4PIgFg0Q
source_name: InfoQ
title: "CIO 正在抛弃 AI 生码率：一场关于什么才算产研提效的实践复盘"
author: 王玮、籍云（阿里云CIO蒋林泉团队）
ingested: 2026-05-18
sha256: fadfe347436fe1141fbabdac1caa09c9a7908ffd06dbd18de851684880382fe8
tags: [ai-rd, efficiency, aliyun, cio, code-generation, vibe-coding, shift-left, mythical-man-month, spec-driven, half-stack, organization-design, agent]
type: article
---
阿里云CIO蒋林泉团队的AI时代产研组织效能规模化提升实践复盘。
2026财年数据：前端人均有效代码量3x，后端2x；千行代码缺陷率前端-30%，后端-55%。在承接更多核心业务+AI创新、不增人力的前提下实现。
核心判断："技能通胀，品味通缩"——AI让技能贬值，但对"好"的判断力（品味）更稀缺。企业从为技能付费转向为判断和结果付费。
两个流行误区：
1. AI生码率陷阱：编码仅占E2E时间20%，代码价值密度差异极大（胶水代码 vs 核心算法）。AI生码率是"过程指标"，易产生"灌水"毒害。代码能否转化为资产不确定，但一定增加负债。
2. Vibe Coding误区：适合Demo/新应用，但企业存量主力系统无法直接上生产。代码一旦生产出来首先是负债——"可能"是资产但"一定"是负债。
AI改写经典难题：
- 人月神话：加人增加沟通复杂度，但加AI Agent可以无损获取上下文
- 左移：AI降低梳理成本，使左移从"正确但昂贵"变为可执行
四个显性改变：
1. 质量左移：测试覆盖从20%→加权接近100%
2. 知识工程+Spec：从存量代码还原系统Spec，形成上下文骨架
3. API First：还原全部后端API注册表，解决"代偿"（职责耦合）
4. 需求左移：Vibe Coding生成Live Demo与业务方前置对焦
灵魂×骨架框架：灵魂=业务价值（端到端闭环），骨架=核心概念与API建模。正确定义问题就解决了90%+。Effectiveness×Efficiency。
新生产关系PDFE与ABE（Half-Stack）：
- PDFE（AI产品设计前端工程师）：产品经理+交互设计+前端三合一，业务沟通→Demo确认→API对齐→前端开发
- ABE（AI架构与后端工程师）：架构设计+后端开发+AI Agent开发合一
三位一体框架：产品价值牵引×工程效率×组织变革
工具困境：Skill封装5分钟但产生业务价值难——价值不在封装能力，在数据Ready、工具成熟、写Prompt的头脑清醒。
个体vs组织提效：两个不同赛道。个体50x≠组织提效。
基础能力回归：语文（精准理解与表达）×数学（无损压缩抽象能力）+品味（定义问题×驾驭Agent）。