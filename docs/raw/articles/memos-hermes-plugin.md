---
title: 给 10 万 Star 的 Hermes 装个记忆外挂，AI 终于能越用越聪明了
source_url: https://mp.weixin.qq.com/s/RoAFEKEetZ9mnmVKwrS4jg
publish_date: 2026-04-24
tags: [wechat, article, agent, llm, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 3ab32d86395cb7a640686a9b25bde0aa500122ab7a2be0d2de92bbeb7a983e57
---
# 给 10 万 Star 的 Hermes 装个记忆外挂，AI 终于能越用越聪明了
## 核心概念
MemTensor 团队为 Hermes Agent 开发的本地记忆插件 MemOS，解决 Hermes "记不住、记得乱"的问题。
开源地址：https://github.com/MemTensor/MemOS/tree/main/apps/memos-local-plugin
## Hermes Agent 现状
- **Nous Research** 开源框架，**10 万+ GitHub Stars**
- 核心：自我进化学习循环、记忆机制、40+ 聊天平台接入
- **痛点**：记得住，但记得乱——重复的、过时的、矛盾的内容堆在一起，记忆库变成大杂烩
## MemOS 插件核心能力
### 存得聪明
语义分片 → LLM 摘要 → 向量化 → **智能去重**
不是简单文本比对，而是 LLM 判断：重复 / 需要更新 / 全新。
例："在减肥"→"放弃减肥"，自动识别为更新，合并成一条。
### 找得准
**混合检索引擎**：
- 全文搜索 + 向量语义搜索双通道
- 融合排序 + 多样性去重 + 时间衰减 + 相关性过滤
- 关键词对不上也能搜到（语义理解）
### 技能进化
三级独立模型配置：Embedding 用轻量模型 / 摘要用中等 / 技能生成用最强。加规则过滤 + LLM 评估，只生成可重复有价值的技能。降级机制：技能模型 → 摘要模型 → Hermes 原生。
### 多 Agent 协同
- 同机器：独立记忆空间 + 共享公共记忆和技能
- 跨机器：Hub-Client 架构，私有数据留本地
### 管理面板
`http://127.0.0.1:18901`，7 个页面（记忆浏览/任务管理/Skill管理/分析统计/日志/导入/配置），密码保护。
## 安装
```bash
curl -fsSL https://raw.githubusercontent.com/MemTensor/MemOS/openclaw-local-plugin-20260408/apps/memos-local-plugin/install.sh | bash
```
完全本地化，零云依赖，数据存本机 SQLite。