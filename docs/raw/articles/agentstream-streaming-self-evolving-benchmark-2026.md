---
source_url: https://www.xiaohongshu.com/discovery/item/6a76f58a0000000006007f81
ingested: 2026-08-09
sha256: fc2c1c56cd10888006c8884de1828c8f41d554327208f7e40d93d2b6ac873e57
title: "AgentStream：流式自进化benchmark"
author: arXivNote
source: 小红书 (XHS)
type: raw
tags: [self-evolving, agent, benchmark, streaming, evaluation, continual-learning]
---

# AgentStream：流式自进化benchmark

🚀 AgentStream: How Well Do Self-Evolving LLM Agents Perform Under Streaming Tasks?

🌐 arXiv, 2608.00155v1

🔑 Keywords: self-evolving agents, streaming evaluation, LLM agents, continual learning, benchmark

📚 TLDR：提出AgentStream统一流式评测框架，系统评估自进化LLM Agent在独立、顺序、交错三种任务流中的表现，揭示模型能力、方法架构与流式场景的复杂交互规律。

🔎 AgentStream将多个agent benchmark组织为可配置任务流，实例化Isolated、Sequential、Interleaved三种流式场景，对ACE、A-Mem等五种自进化方法在GPT-5.4、Gemini 3.1 Pro、Claude Opus 4.7上进行组合评估，发现自进化可靠性因场景而异、收益受模型能力限制且呈非单调关系、无单一方法主导。

🎯 Motivation 现有自进化Agent研究多采用独立评估，缺乏对真实流式场景中跨域连续任务表现的系统理解，难以指导实际部署。

✨ Novelty 首次将多benchmark统一为可配置任务流，提出三种渐进式流式场景解耦评估自进化组件；通过组合实验发现自进化收益受模型能力门控且呈非单调性，并揭示上下文集成方法适合单域流、检索式方法适合跨域流的方法-场景匹配规律。

🏆 Contributions
🧩 提出AgentStream框架，首次统一多benchmark流式评测自进化Agent。
🧩 系统分析模型能力、方法架构与流式结构对自进化的联合影响。
🧩 为不同模型与场景下选择自进化方法提供actionable guidance。

#agent #智能体 #LLM #大模型 #benchmark #Agent自进化
