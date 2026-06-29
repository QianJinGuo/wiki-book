# Bitter Lesson vs Garbage Can：组织理论视角下的 AI 采用

## Ch04.272 Bitter Lesson vs Garbage Can：组织理论视角下的 AI 采用

> 📊 Level ⭐⭐ | 9.0KB | `entities/bitter-lesson-garbage-can-mollick.md`

## Bitter Lesson vs Garbage Can：组织理论视角下的 AI 采用

> 2026-06-07 引用自 Ethan Mollick《The Bitter Lesson versus The Garbage Can》，One Useful Thing，2025-07-28。

## 两个理论框架

### Garbage Can Model（垃圾桶模型）

经典组织理论：组织是混乱的垃圾桶，问题和解决方案被随机倾倒在一起，决策往往在元素偶然碰撞时产生，而非通过完全理性过程。

企业 AI 采用困难的原因：43% 美国工人已在工作中使用 AI，但大多是解决自己工作问题的非正式方式。规模化 AI 的难点在于传统自动化需要明确规则和定义流程——恰恰是 Garbage Can 组织缺乏的东西。

### Bitter Lesson（苦涩教训）

Richard Sutton 2019 年 essays 指出的模式：AI 研究者一次次试图用优雅方案（人类编码知识）解决问题，但最终简单粗暴的计算力（ brute force + 泛化学习方法）总是战胜精心编码的人类专业知识。

- Deep Blue（200M positions/秒）战胜人类国际象棋知识
- AlphaZero（无任何游戏知识，从零自学习）同时战胜国际象棋、围棋、将棋

苦涩之处：我们基于终身经验构建的人类理解在解决 AI 问题时**并不那么重要**。

## Agents 的两种路线

### Manus：精心手工构建的 Agent

Manus 用 Claude + 系列巧妙方法构建通用 Agent。系统提示中有数百行定制文本，包括如何构建待办事项的详细指令。体现了"精心制作"、"定制"、"融入来之不易的知识"——正是 Bitter Lesson 告诉我们要避免的。

### ChatGPT Agent：结果训练的 Agent

OpenAI 用强化学习训练 AI**直接评价最终结果质量**，而非教 AI 怎样做事（如怎样创建 Excel 文件），只评价最终 Excel 文件的质量，让 AI 自己找方法。

对比实验：相同任务，Manus 有待办清单、脚本遵守；ChatGPT Agent 无脚本，图表更准确（找到更可信的 ELO 来源），Excel 版本可用而 Manus 有错误。

**核心问题**：改进 Manus 需要更多精心手工定制；改进 ChatGPT Agent 只需更多芯片和更多样本。按 Bitter Lesson，长期结果清晰。

## 在 Garbage Can 中的 Agents

两种采用路径：

**传统路线（Garbage Can 思维）**：花数月梳理混乱流程后再部署 AI 系统。难、慢，企业 AI 采用需要时间。

**Bitter Lesson 路线**：跳过理解过程，直接定义好结果（什么是好的销售报告/客户互动），然后训练 AI 产出它。AI 会找到穿过组织混乱的自己的路径，可能比人类演化的半正式路径更高效但更不透明。

如果 Bitter Lesson 成立，Garbage Can 依然存在，但竞争基础变了——定义质量的能力比梳理流程更重要。

## 深度分析

### 1. 组织理论与 AI 采用的根本冲突
Garbage Can Model 揭示了组织内在的混乱本质：未成文规则、定制化知识、复杂且无文档的流程是关键瓶颈。传统自动化要求明确的规则和定义的流程，而这恰恰是 Garbage Can 组织所缺乏的。但 Bitter Lesson 提供了一个根本性的重构思路：与其试图理解混乱，不如直接定义输出质量，让 AI 自己找到穿越组织迷宫的路径。这意味着从"流程理解"转向"结果定义"的能力竞赛。

### 2. 手工定制 vs 结果训练的本质差异
Manus 代表了传统路线——精心手工构建 Agent，系统提示中有数百行定制文本，包括如何构建待办事项的详细指令，体现"精心制作"、"定制"、"融入来之不易的知识"。ChatGPT Agent 则使用强化学习训练 AI 直接评价最终结果质量，而非教 AI 怎样做事。改进 Manus 需要更多手工定制；改进 ChatGPT Agent 只需更多芯片和更多样本。这完美呼应了 Bitter Lesson 的核心洞见：人类编码知识最终不如简单粗暴的计算力。

### 3. 竞争基础的重新定义
如果 Bitter Lesson 在组织情境中成立，竞争基础将从"流程优化能力"转向"质量定义能力"。企业花费在梳理流程、建立制度知识、通过运营卓越建立竞争护城河的努力可能不再那么重要。任何能够定义质量并提供足够样本的组织都可能获得类似结果，无论其是否理解自身的流程。这对管理实践和竞争战略都有深远影响。

### 4. AI 能力的快速进化使临界点临近
AI 自主工作能力正在快速提升，虽然目前仍远未达到大多数复杂任务的人类水平，且在复杂任务上容易被误导。这场辩论的答案可能很快就会揭晓：组织究竟是像 chess 一样可以通过计算规模化解决的问题，还是本质上更混乱、无法绕过流程理解的问题。

### 5. 两种路线的可持续性对比
Manus 的改进路径需要更多精心手工定制和定制化工作，而 ChatGPT Agent 的改进只需更多芯片和更多样本。这意味着 outcome-trained 路线具有更好的规模化效应，长期优势明显。但这也意味着 AI 能力的进化可能比组织适应速度更快，企业需要在定义质量能力上建立新的竞争优势。

## 实践启示

### 1. 定义"好结果"而非"好流程"
与其花费数月梳理混乱的组织流程，不如投入资源明确什么是好的销售报告、客户互动或决策输出。将精力集中在定义质量标准和评估方法上，让 AI 自己找到穿越组织障碍的路径。这比试图理解和记录组织的每一个细节更高效。

### 2. 优先投资结果定义和评估能力
建立能够准确评估 AI 输出质量的团队和能力。提供足够的正面和负面样本，让 AI 通过强化学习自己优化。这要求组织在"质量判断"这一元能力上建立深厚积累，而非在"流程执行"上投入资源。

### 3. 接受计算的规模化力量
意识到在 AI 能力提升上，简单地增加算力和数据可能比精心设计的人工解决方案更具可持续性。当发现手工定制的 Agent 或提示工程遇到瓶颈时，考虑转向结果训练的路线，可能获得更好的长期回报。

### 4. 保持双轨实验
由于目前尚不确定 Bitter Lesson 是否完全适用于组织情境，建议同时保持两条路径：传统路线（流程梳理+特定用例构建）和 Bitter Lesson 路线（定义结果+结果训练）。通过并行实验积累数据，为未来的组织 AI 采用策略提供实证依据。

### 5. 建立"输出质量感知"文化
培养组织对高质量输出的敏感度和定义能力。所有利益相关者需要能够判断什么是好的结果，什么是次优的。这可能需要引入新的评估流程和质量标准，但这是 AI 时代竞争的基础能力。

## 相关实体
- [Using Ai Right Now Mollick Quick Guide](/ch01-525-mollick-实用-ai-选型指南-模型选择-deep-research-voice-mode-agent-工作流/)
- [The Shape Of The Thing Mollick](/ch01-182-the-shape-of-the-thing/)
- [Gpt5 Just Does Stuff Mollick](/ch01-418-gpt-5-it-just-does-stuff-mollick-的主动式-ai-原语/)
- [Three Years Gpt3 Gemini3 Mollick](/ch04-222-三年从-gpt-3-到-gemini-3-mollick-对-agent-时代-ai-演进的实测/)
- [Guide Ai Agents Models Apps Harnesses Mollick](/ch04-267-ai-agent-时代选型指南-模型-应用-harness-mollick/)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/the-bitter-lesson-versus-the-garbage-can.md)

---

