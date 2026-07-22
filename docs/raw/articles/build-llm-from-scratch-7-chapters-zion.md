---
title: 从零构建大语言模型 —— 读完这篇你就懂了
author: zion（锡安的自留地）
date: 2026-05-19
source: https://mp.weixin.qq.com/s/HC84UqO4yjR7LAz8mTODBA
rating: 8.0
confidence: 7.5
review_value: 60
review_confidence: true
tags: [LLM, Transformer, GPT, pretraining, fine-tuning, PyTorch, 教程]
abstract: 从零构建 LLM 系统性教程，分 Stage 1（数据+注意力）、Stage 2（GPT+预训练）、Stage 3（微调）三阶段，含完整 Python/PyTorch 代码，Makeling LLM 风格。
sha256: 94395f57cbe451a4c7d440b81cf99b8775533d0a297dff07c06cad40741149ad
---
---
# 从零构建大语言模型 —— 读完这篇你就懂了
> 锡安的自留地 | 2026-05-19 | 广东
这篇文章将让你对神秘莫测的大语言模型（LLM），从"这玩意儿到底怎么工作的？"到"哦，原来我也能造一个！"的奇妙转变。
## 第1章：大语言模型是什么鬼？
### 1.1 LLM 到底是啥？
LLM（Large Language Model），翻译成人话就是：一个特别大的神经网络，吃了海量的文本数据，然后学会了说人话。
LLM 的核心训练任务特别简单：**预测下一个词**。给你一句话的前半段，猜后半段。
输入："我今天中午吃了——"
输出："饭"
就这么朴素的逻辑，居然能训练出 ChatGPT 这种怪物。这就像你教孩子就教了"1+1=2"，结果他自己学会了微积分——研究者自己都觉得很惊讶。
### 1.2 LLM 能干啥？
翻译、写小说、写代码、做客服、总结文档、回答法律问题……基本上跟文字沾边的事它都能干。现在的 LLM 不仅仅是聊天机器人，它正在重新定义我们和技术的交互方式。
### 1.3 构建 LLM 的两步走
- **预训练（Pretraining）**：用海量无标注文本训练模型做"填空"，得到一个"基础模型"（foundation model）。GPT-3 的预训练花掉了**460 万美元**的云计算费用。
- **微调（Fine-tuning）**：用少量标注数据进一步训练，让它变成某个领域的专家。
自定义的小模型能在特定领域干翻通用大模型，而且还省钱、保护隐私、能部署在手机上。苹果公司就在搞这个。
### 1.4 Transformer 架构：LLM 的"祖宗"
2017 年的神论文《Attention Is All You Need》提出了 Transformer 架构，它有两个子模块：
- **编码器（Encoder）**：读入输入文本，编码成向量
- **解码器（Decoder）**：拿编码器的输出，生成目标文本
BERT 用了编码器部分（擅长分类），GPT 用了解码器部分（擅长生成）。本书只做 GPT，也就是只用解码器。
### 1.5 海量数据集
GPT-3 的训练数据包括：
- CommonCrawl（网络爬虫）：4100 亿 token，占 60%
- WebText2：190 亿 token
- Books1 + Books2：670 亿 token
- Wikipedia：30 亿 token
- 总共训练了 **3000 亿 token**。一个人每秒读一个字，不吃不睡要读 **9.5 万年**。
### 1.6 GPT 架构的精髓
GPT 本质上就是 Transformer 的解码器部分，通过**自回归**的方式生成文本——每次预测一个词，然后把这个词拼回输入，再预测下一个词。
GPT-3 有 **96 层 Transformer、1750 亿参数**。这些模型还展现出**涌现能力（emergent behavior）**——没专门学过翻译，但能翻译；没专门学过写诗，但能写。就像你本来想养条看门狗，结果它自己学会了弹钢琴。
### 1.7 三阶段构建计划
| 阶段 | 内容 | 章节 |
|------|------|------|
| Stage 1 | 数据准备 + 注意力机制 | 第2-3章 |
| Stage 2 | 构建 LLM + 预训练 | 第4-5章 |
| Stage 3 | 微调（分类 + 指令） | 第6-7章 |
## 第2章：跟文本数据打交道
### 2.1 词嵌入：给每个词发张"身份证"
神经网络不认识文字，只认识数字。所以需要**嵌入（embedding）**——把每个词映射成一串浮点数。
GPT-2 Small 的嵌入维度是 **768**，GPT-3 最大版是 **12,288**。维度越高能捕捉的关系越细腻，但计算量也越大。
### 2.2 分词：把句子大卸八块
分词（tokenization）就是把一段话切成小碎片。作者用《The Verdict》短篇小说（20,479 个字符）做示例，最终切成了 **4,690 个 token**。
### 2.3 Token → Token ID
每个唯一 token 分配一个唯一整数 ID。SimpleTokenizerV1 有 encode 和 decode 两个方法，但遇到没见过的词就直接报 KeyError。
### 2.4 特殊 Token
- `<|unk|>`：表示"我不认识这个词"
- `<|endoftext|>`：分隔不相关的文本片段
### 2.5 Byte Pair Encoding（BPE）：GPT 的秘密武器
BPE 的牛X之处：不认识整个词？没关系，拆成子词甚至单个字符。**BPE 永远不会遇到 unknown token**。GPT-2 的 BPE 词汇表有 **50,257 个 token**。
### 2.6 滑动窗口采样：制造训练数据
用滑动窗口在文本上移动：max_length 控制输入长度，stride 控制步长。stride=1 时，输入是 [1,2,3]，输出就是 [2,3,4]——每次往后挪一位。从一篇短篇小说就能造出海量的训练样本。
### 2.7-2.8 Token 嵌入 + 位置编码
GPT 用**可训练的位置嵌入**——每个位置有自己的向量，直接加到 token 嵌入上。
## 第3章：注意力机制
### 3.1 RNN 的"记忆缺陷"
RNN 记不住太长的东西。就像让你传话，传了十个人之后，原话早就走样了。
### 3.2 注意力的诞生
2017 年的 Transformer 论文提出**自注意力（Self-Attention）**机制——模型在生成每个词时，可以"回头看"输入序列中的所有位置，决定哪些地方更重要。
### 3.3 丐版自注意力
对于句子中每个词，计算它跟所有词的相关性（用**点积**衡量），然后 softmax 归一化成概率，再用这些概率加权求和所有词的向量——得到**上下文向量**。
### 3.4 完全体：缩放点积注意力
真正的 LLM 用带三个可训练权重矩阵的自注意力：
- **Wq（Query）**：你在问"这段话里谁跟我有关系？"
- **Wk（Key）**：每个词在说"我的特征是这些"
- **Wv（Value）**："如果觉得我重要，就拿走这个信息"
计算步骤：
1. 输入分别乘 Wq、Wk、Wv 得到 Q、K、V
2. attn_scores = Q @ K.T，算相关性
3. 除以 √d_k（缩放），防止高维度下点积过大导致梯度消失
4. softmax 归一化
5. output = attention_weights @ V
### 3.5 因果注意力：不许"开天眼"
训练时，模型不能看到未来的词。实现方式：在注意力权重矩阵的**右上角加一个上三角掩码**，把未来位置的权重全变成 0。方法是在 softmax 之前把右上角全设为 -inf。
还引入了 **Dropout**（训练时用 0.1-0.2），随机丢弃一部分注意力权重，防止过拟合。
### 3.6 多头注意力：一个脑袋不够用
并行运行多个因果注意力机制。GPT-2 Small 有 **12 个头**，嵌入维度 768，每个头处理 **64 维**。
## 第4章：搭积木——实现 GPT 模型架构
### 4.1 GPT-2 的"身份证"
GPT-2 Small（1.24 亿参数）配置：
| 参数 | 值 |
|------|-----|
| 词汇量 | 50,257 |
| 上下文长度 | 1,024 |
| 嵌入维度 | 768 |
| 注意力头数 | 12 |
| Transformer 层数 | 12 |
| Dropout | 0.1 |
GPT-3 的 1750 亿参数在单张 V100 上要训 **355 年**。
### 4.2 Layer Normalization：情绪稳定剂
**层归一化**把每一层的输出拉成均值为 0、方差为 1 的标准分布。LayerNorm 不依赖 batch size，特别适合 LLM 训练。
### 4.3 GELU：比 ReLU 更"温柔"
ReLU 简单粗暴：正数留着，负数变零。**GELU** 就温柔多了：负数区域也保留非零梯度。ReLU 像"不及格就滚"，GELU 像"不及格还可以补考"。
前馈网络（FeedForward）：Linear(768 → 3072) → GELU → Linear(3072 → 768)。
### 4.4 Shortcut Connections：高速通道
**Shortcut（残差连接）**把输入直接加到输出上，给梯度修了一条"高速公路"。没有 shortcut 时第一层比第五层梯度小 25 倍；加了 shortcut，各层梯度大小基本一致。
### 4.5 Transformer Block
每个 Transformer Block 的结构：
1. LayerNorm → Multi-Head Attention → Dropout → Shortcut
2. LayerNorm → FeedForward → Dropout → Shortcut
用的是 **Pre-LayerNorm**（先归一化再进子层），比 Post-LayerNorm 训练更稳定。输入输出形状完全一样，所以可以像叠罗汉一样叠 12 层。
### 4.6 GPTModel：终极合体
GPTModel = Token Embedding + Positional Embedding + 12× TransformerBlock + Final LayerNorm + Output Head（映射到 50,257 维词汇表）
1.63 亿参数，float32 存储需要 **621 MB**。
### 4.7 文本生成
模型还没训练，权重是随机的，输出是 "Featureiman Byeswickattribute argue"——跟刚出生的婴儿一样，话都不会说。
## 第5章：预训练——从"胡言乱语"到"能说会道"
### 5.1 评估文本质量
- **交叉熵损失（Cross-Entropy Loss）**：模型预测的概率分布跟实际情况差多远。值越小越好。
- **困惑度（Perplexity）** = exp(loss)。初始值 **48,725**，相当于在 50,257 个词里完全随机乱猜。理想目标：接近 1。
### 5.2 训练过程
用 AdamW 优化器，训练 10 个 epoch（约 5 分钟）：
| Epoch | Loss | 生成文本 |
|-------|------|---------|
| 1 | 9.78 | Every effort moves you,,,,,,,,,, （变逗号复读机） |
| 2 | 6.66 | Every effort moves you, and, and, and, ... （"and"复读机） |
| 9 | 0.54 | 开始输出语法正确的句子 |
| 10 | 0.39 | 能写出通顺的英文句子 |
验证 loss 在第 2 个 epoch 后就停滞在 6.45 了，而训练 loss 降到了 0.39——**过拟合了**。解决办法：用更大的数据集。
### 5.3 解码策略
- **贪心解码（Greedy Decoding）**：每次选概率最高的 token。安全但无聊。
- **Temperature 缩放**：控制随机性。temperature = 0.1 像严谨的科学家，temperature = 5 放飞自我。
- **Top-k 采样**：只保留概率最高的 k 个 token 再采样。把两者结合：先用 top-k 筛选候选池，再用 temperature 调整概率分布后再采样。
### 5.4 保存和加载模型
```python
torch.save(model.state_dict(), "model.pth")
model.load_state_dict(torch.load("model.pth"))
```
如果要继续训练，记得连 optimizer 状态一起保存——AdamW 记住了每个参数的历史学习率，丢了就失忆了。
### 5.5 白嫖 OpenAI 的预训练权重
直接用 OpenAI 的 GPT-2 权重！加载成功的标志：输入 "Every effort moves you"，输出 "toward finding an ideal new way to practice something!"——这才是正常人该说的话。
## 第6章：分类微调——让 LLM 当"专才"
### 6.1 微调的两种路子
- **分类微调**：让模型变成"偏科生"，只会做一件事（比如判断垃圾邮件）
- **指令微调**：培养"全才"，能听懂各种指令
### 6.2 准备垃圾邮件数据集
用 SMS Spam Collection 数据集（5,572 条短信），原始数据不平衡（垃圾 747 vs 正常 4,825），用欠采样平衡到 747 vs 747。数据集按 70% 训练、10% 验证、20% 测试拆分。
### 6.4 加载预训练权重
光预训练不微调，模型就是个复读机——你问它"这是垃圾邮件吗？"，它不回答，只会继续补全文本。
### 6.5 加装分类头
把原来的输出层（映射到 50,257 个 token）换成新的（映射到 2 个类别：spam / not spam）。
技巧：
- **冻结大部分参数**（设置 requires_grad = False），只训练输出层 + 最后一个 Transformer block + 最后的 LayerNorm
- **只用最后一个 token 的输出做分类**——因为因果注意力掩码让最后一个 token 能看到前面所有信息
### 6.6 训练结果
超参数：AdamW，学习率 5e-5，weight_decay 0.1，5 个 epoch。在 M3 MacBook Air 上跑约 **5.65 分钟**：
| 指标 | 数值 |
|------|------|
| 训练集准确率 | 97.21% |
| 验证集准确率 | 97.32% |
| 测试集准确率 | **95.67%** |
训练和验证曲线贴得很近——没有过拟合。
## 第7章：指令微调——让 LLM 当"通才"
### 7.2 准备指令数据集
1,100 条指令-回答对，使用 **Alpaca 格式**组织 prompt：
```
Instruction: 把下句改成被动语态
Input: The chef cooks the meal.
Response: The meal is cooked by the chef.
```
数据集划分：85% 训练（935 条）、10% 测试（110 条）、5% 验证（55 条）。
### 7.3 自定义 Collate 函数
把 padding token 在 target 中对应的位置设为 **-100**。PyTorch 的交叉熵损失默认忽略 -100，这样 padding 部分就不会参与损失计算。
### 7.5 正式微调
超参数：AdamW，学习率 5e-5，只跑 2 个 epoch。在 **A100 GPU 上只需 52 秒**。训练 loss 从 2.637 降到 0.300。
第 1 个 epoch 结束：已经把 "The chef cooks the meal every day." 改成 "The meal is prepared every day by the chef."——虽然用了 "prepared" 而不是标准答案的 "cooked"，但语法和语义完全正确。
第 2 个 epoch 结束：变成正确的 "The meal is cooked every day by the chef."
### 7.6 评估
用 **Llama 3 8B** 来打分！110 条测试集平均分：**50.32 分**。可以用来做基准对比。
## 写在最后
从零构建大语言模型的完整流程：
- 第 2 章：把原始文本变成 token，再变成嵌入向量
- 第 3 章：实现核心注意力机制
- 第 4 章：组装 GPT 模型架构
- 第 5 章：预训练——从随机权重到能说完整句子
- 第 6 章：分类微调——让模型当"专才"
- 第 7 章：指令微调——让模型当"通才"
这本书最牛的地方在于：**所有代码都能在你的笔记本电脑上跑**。不需要几百张 GPU，不需要几百万美元。你只需要一台普通电脑、Python、PyTorch，还有这本书。