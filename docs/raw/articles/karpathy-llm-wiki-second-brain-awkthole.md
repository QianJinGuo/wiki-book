---
title: "karpathy-llm-wiki-second-brain-awkthole"
created: 2026-06-10
type: raw
sha256: 2400e20bdc3fcc6b1f30348859c594bccb494f1060df794d05697b0b20b0a332
---
source_url: https://mp.weixin.qq.com/s/gbqMeYi2AEAKlxIRxkdM5Q
source_title: 卡帕西"LLM Wiki"，到底是什么？——用 Claude + Obsidian 给自己造一个第二大脑的完整拆解
author: AwkThole
feed_name: AWKTHOLE · FIELD NOTES
published: 2026-05-25
scored: v=7, c=7, v×c=49

# 卡帕西"LLM Wiki"，到底是什么？——用 Claude + Obsidian 给自己造一个第二大脑的完整拆解

## 核心结论

- Karpathy核心主张：你自己维护一个markdown写的、LLM可以读懂的个人wiki，然后喂给Claude——这是当下最朴素也最强大的"第二大脑"
- 三判断层层递进：LLM是新一代操作系统→Markdown是LLM的母语→隐性知识显性化是杠杆前置条件
- 为什么现在火：Claude 200K上下文+Projects功能+Claude Code三件套齐了

## Karpathy三判断

**判断一：LLM是新一代操作系统（LLM as new OS）**
- LLM之于今天，就像1970年代CPU之于早期计算机
- 关键：操作系统需要持久化的文件系统；今天的LLM像没有硬盘的CPU，每次开机从零开始

**判断二：Markdown是LLM的母语**
- Word/Notion/印象笔记对LLM不友好：私有格式锁定、视觉噪音、只为人眼优化
- LLM训练时见过最干净结构化文本：GitHub README、Wikipedia wikitext、技术文档markdown
- 所以给LLM准备的"记忆"最优解就是markdown

**判断三：隐性知识显性化是杠杆前置条件**
- LLM是能力放大器，放大你已经表达清楚的东西
- wiki本质是逼自己把隐性知识显性化的工具——LLM第一次让这件事有对等回报

## 为什么现在火（2025年三推力同时到位）

1. Claude上下文窗口200K（标准）/1M（开发者版）——笔记终于装得下
2. Claude Projects——把复制粘贴markdown工程化
3. Claude Code——LLM直接读文件系统的开发者产品实现

## 技术深度拆解

### Context Window 200K真实工程含义

- 200K tokens ≈ 30万字中文 = 一本800页的书 = 600篇500字笔记
- 1M tokens = 半部《资治通鉴》一次性塞给模型

**RAG切片的问题**：
- 切片必然丢失上下文（靠后的部分依赖前面设定）
- 向量检索基于"语义相似"而非"逻辑相邻"
- 暴力上下文（全量wiki进上下文）利用Transformer全局注意力，模型同时考虑所有笔记

**为什么"暴力"胜过"精巧"**：只要内容进入上下文窗口，Transformer所有token两两计算关联权重——这是局部最优（检索）永远做不到的全局推理

### Markdown Token经济学

| 格式 | Token消耗 | LLM友好度 |
|------|----------|---------|
| Markdown | 100% | 极高（GitHub/Wikipedia训练分布） |
| HTML | 150%+ | 低（80%是div/span标签噪音） |

核心：对LLM，markdown是母语——看到##标题知道是逻辑节点，看到[[wiki链接]]知道是内部引用，这些是模式匹配级反射，不需推理

### Obsidian四个不可替代理由

1. **本地.md文件**：无云端锁定，LLM程序可直接读vault目录
2. **[[wiki链接]]双向链接**：语义索引，模型读到内部引用能自动关联相关上下文
3. **开放插件生态**：社区几百个LLM集成插件，不被单一工具锁死
4. **永久可迁移**：.md文件可被Git/rsync/任何文本编辑器/任何LLM直接消化，20年后笔记永远是你的

### Claude vs ChatGPT

- 上下文：Claude标准版200K vs ChatGPT 128K（发文时）
- Claude Projects：文件组挂载，会话自动出现在上下文
- Claude Code：CLI工具，直接读写文件系统，维护CLAUDE.md project memory
- Needle in Haystack测试：Anthropic长期领先

## 协议栈（完整对位Karpathy的LLM as OS比喻）

| 层级 | 组件 | 对应 |
|------|------|------|
| 推理层 Inference | Claude | CPU（计算和推断） |
| 协议层 Protocol | Markdown | 文件格式标准（Unix plain text） |
| 管理层 Management | Obsidian | 文件管理器（macOS Finder） |
| 持久层 Persistence | 本地硬盘+Git | 文件系统+版本控制 |

每一层可独立替换，只要中间markdown协议层和本地文件持久层不变，资产完全可迁移——这才是方案长久的根本（Unix哲学）

## Karpathy本人工作流（公开片段）

- 用markdown维护个人笔记（研究/论文/思考问题）
- 需要LLM帮忙时，把相关笔记片段粘贴到Claude对话作为上下文
- 两点强调：①用Claude不是ChatGPT；②不需要花哨工具——文本编辑器+LLM+纪律性就够了
- Obsidian/双向链接/MCP是社区帮他在工程化方向继续推的产物；卡帕西本人setup极简

原文：https://mp.weixin.qq.com/s/gbqMeYi2AEAKlxIRxkdM5Q
