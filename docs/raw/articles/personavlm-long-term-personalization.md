---

title: "PersonaVLM: Long-term Personalized Multimodal LLM"
source_url: https://mp.weixin.qq.com/s/IUxhHJdXj4JoqLKgS18ubA
publish_date: 2026-04-27
tags: [wechat, article, gpt, rag, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 11bb7c1113d81eb73d2c247e67070d4f968a30b09f7227369c569aafb95306f7

---
# PersonaVLM: Long-term Personalized Multimodal LLM
大模型开始"懂你"了！PersonaVLM如何实现长期个性化记忆
来源：PaperWeekly → 数据派THU
日期：2026年4月27日
## 核心问题
当前大模型是"静态系统"，而人是"动态的"。现有方法只依赖当前上下文或简单拼接历史信息，无法跟踪用户动态变化，导致个性化停留在表面。
## 核心思路
让模型具备"长期个性化能力"——记忆、推理与对齐三能力协同。
## 五类记忆分层结构
1. **性格画像(User Personality Profile)**：基于心理学"大五人格"，量化并追踪用户动态性格
2. **核心记忆(Core Memory)**：存储用户基础属性（姓名、职业、核心身份）
3. **语义记忆(Semantic Memory)**：提取跨模态抽象知识（偏好习惯等）
4. **情景记忆(Episodic Memory)**：将长对话切分为带时间戳的原子事件，方便按主题检索
5. **程序性记忆(Procedural Memory)**：记录长期目标和重复性行为模式
## 双阶段协作流
**响应阶段(Response Stage)**：接收到用户图文输入时，模型自主多步推理，决定是否检索记忆、检索什么时间段哪类记忆。提取相关记忆后，结合用户当前性格，生成"投其所好"且"语气契合"的回答。
**更新阶段(Update Stage)**：交互结束后（系统空闲时），模型自动触发性格演变机制，根据刚刚对话微调用户性格评分，并主动提取有价值信息，对四类记忆库进行增删改查，为下一次交互做好准备。
## 评测基准 Persona-MME
- 来源：南京大学 + 字节跳动
- CVPR 2026 Highlight
- 7个核心维度：记忆、意图、偏好、行为、关系、成长、对齐
- 14个细粒度任务
- 200个多样化虚拟角色
- 数据合成管线生成，含训练数据集和评测数据集
## 实验关键发现
- PersonaVLM 在 Persona-MME 上提升超 20%
- **标准 RAG 在偏好理解任务上性能下降 9.3%**：未经加工的外部记忆会导致检索不准确和引入干扰噪声
- 情景记忆对整体性能影响最大
- 程序记忆对"行为"和"关系"任务影响显著
- GPT-4o 在部分场景优于其他闭源模型
- 开源多模态小模型在个性对齐任务表现不佳（略优于随机），Qwen3 纯语言模型相对优异
## 核心洞察
> 从"回答问题"走向"理解用户"
真正的个性化不是静态标签，而是持续演化的理解过程。
## 相关链接
- 论文：http://arxiv.org/abs/2604.13074
- 项目主页：https://personavlm.github.io/
- 代码：https://github.com/MiG-NJU/PersonaVLM
- 训练数据：https://huggingface.co/datasets/ClareNie/PersonaVLM-Dataset
- 评测数据：https://huggingface.co/datasets/ClareNie/Persona-MME