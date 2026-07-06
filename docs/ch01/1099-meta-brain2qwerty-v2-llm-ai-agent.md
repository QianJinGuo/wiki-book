# Meta Brain2Qwerty v2: 非侵入式脑机接口解码，LLM微调+AI Agent优化，代码全开源

## Ch01.1099 Meta Brain2Qwerty v2: 非侵入式脑机接口解码，LLM微调+AI Agent优化，代码全开源

> 📊 Level ⭐⭐ | 2.4KB | `entities/meta-brain2qwerty-v2-bci-2026.md`

# Meta Brain2Qwerty v2: 非侵入式脑机接口解码，LLM微调+AI Agent优化，代码全开源

Meta 发布 Brain2Qwerty v2，一种基于非侵入式脑磁图（MEG）的端到端深度学习方案，能够实时将大脑活动解码为自然语言句子。相比此前其他非侵入式方法仅 8% 的单词准确率，v2 达到了 61%，在表现最佳的参与者身上达到 78%。

## 技术方案

训练数据来自 9 名志愿者，每人佩戴脑磁图设备进行了 10 小时真实打字记录，累计收集约 22000 条句子。采用端到端深度学习，从原始脑信号直接学习解码，而非传统的人工设计规则识别神经事件。

对大语言模型进行了针对神经数据的微调，使模型能够利用语义上下文信息，把原本嘈杂、模糊的脑部记录和连贯通顺的语言衔接起来。在优化解码流程的过程中，还使用了 AI agent 来探索可能的优化方向，但最终采用的训练配置由工程师人工挑选确定。

## 性能与开源

解码准确率随数据量增加呈对数线性增长，意味着与侵入式手术方案之间的性能差距有望继续缩小。Meta 同时发布了 Brain2Qwerty v1 和 v2 的完整训练代码，合作方巴斯克认知、大脑与语言研究中心（BCBL）同步公开了 v1 所使用的数据集。

这项研究是 Meta 构建开放式大脑基础模型计划的一部分，同期推进的还有负责感知编码的 Tribev2 模型、大规模处理脑数据的 NeuralSet、以及系统评估各类模型表现的 NeuralBench。Meta 设立了 500 万美元资金支持开放数据集建设。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/meta-brain2qwerty-v2-bci-2026.md)
→ [Meta脑机接口 Nature 子刊报道](https://github.com/QianJinGuo/wiki/blob/main/entities/2026-06-30-登上Nature子刊-Meta脑机接口重大阶段性进展-超高实时解码准确率-机器之心.md)

---

