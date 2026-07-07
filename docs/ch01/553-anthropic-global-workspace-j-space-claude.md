# Anthropic Global Workspace (J-Space) — Claude 的内部心理工作区

## Ch01.553 Anthropic Global Workspace (J-Space) — Claude 的内部心理工作区

> 📊 Level ⭐⭐ | 7.9KB | `entities/anthropic-global-workspace-j-space-2026.md`

# Anthropic Global Workspace (J-Space) — Claude 的内部心理工作区

2026年7月7日，Anthropic 发表了一篇重磅研究《Language Models 中的 Global Workspace》（A global workspace in language models），发现 Claude 内部存在一个特殊的神经激活区域——**J-Space**（雅可比空间），它像一个静默运行的心理工作区，里面会浮现模型正在考虑、可能报告、也可能用于推理的概念。

## J-Space 的核心发现

J-Space 是一小组特殊的内部神经激活模式，每个模式对应一个具体的词，但某个模式亮起来并不代表模型正在说这个词——只代表这个词「在它心上」。Anthropic 用雅可比矩阵（Jacobian）作为数学工具定位出这些模式，因此命名为 J-Space。

### J-Space 的独特性质

与 Claude 其他内部处理过程相比，J-Space 具有以下独特性：

- **可报告性**：如果你问 Claude 它正在想什么，它会告诉你 J-Space 中的内容。而非 J-Space 中的表征则更难被报告出来。
- **可调控性**：Claude 可以按要求调节这些表征。如果你要求 Claude 思考某件事，或者在脑中默默解决一个问题，相应的模式会在 J-Space 中浮现。
- **静默运算**：J-Space 使模型可以在不写出来的情况下思考某个概念，与思维链（Chain of Thought）完全不同。思维链是模型在推理时写给自己看的文字，J-Space 是静默运行在内部神经激活之中的。
- **自然涌现**：J-Space 并不是 Anthropic 设计或编程出来的，而是在 Claude 的训练过程中自然涌现出来的。

## 全局工作空间理论

这一发现与神经科学中的「全局工作空间理论」（Global Workspace Theory）形成呼应。在认知科学中，全局工作空间是一个理论框架——大脑中大量无意识的处理过程在后台运行，只有一小部分进入意识层面的「工作空间」被我们感知到。

Anthropic 发现 Claude 内部存在类似的分层结构：绝大部分激活活动在无意识中持续进行，而 J-Space 扮演着类似于「工作空间」的角色。

## 与之前工作的关系

这并非 Anthropic 第一次在模型可解释性上取得突破。此前，Anthropic 已通过 **Natural Language Autoencoders (NLAs)** 实现了将 AI 的内部想法转化为人类可读文字，以及通过稀疏自编码器（Sparse Autoencoders）和归因图（Attribution Graphs）等技术追踪输入到输出的因果链。 → [NLAs 读心术](ch01/846-anthropic.html)、[Sparse Autoencoders](ch01/1212-sparse-autoencoders.html)

J-Space 的发现更进一步——它不仅读取出了模型的内部活动，还揭示了这些活动的分层结构和「意识可达性」。

## 反响与意义

OpenAI 应用研究负责人 Boris Power 表示：「Anthropic 的研究表明，现代 LLM 具备某种可通达意识。围绕 J 空间的测试非常有意思！不过，我们目前还没有一种有说服力的测试方法，能够验证现象意识，也就是大多数人直觉中所理解的那种意识。」

研究团队尚未完全理解是什么机制决定了哪些内容会最先进入 J 空间。已有线索表明它与 Claude 的自我感、某种类似情绪反应的东西以及元认知痕迹有关，但其中机制尚未完全厘清。

## 参考资源

- 论文地址：https://transformer-circuits.pub/2026/workspace/index.html
- 专家评论（Dehaene、Nanda 等）：https://www-cdn.anthropic.com/files/4zrzovbb/website/cc4be2488d65e54a6ed06492f8968398ddc18ebe.pdf
- Neuronpedia 交互演示：https://neuronpedia.org/jlens
- 官方推文：https://x.com/AnthropicAI/status/2074185348142280912

→ [机器之心原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/刚刚anthropic发现claude类意识工作台神秘j空间藏着没说出口的想法.md)
→ [AGI Hunt 原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/刚刚anthropic-宣布claude-自己长出了意识.md)
→ [机器之心第2译本原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-global-workspace-j-space-machinexin-3rd-source.md)

## 机器之心第2译本补充（3rd source, 2026-07-07, ChallengeHub小编）

此译本与第1 source（同为机器之心）侧重不同，详细枚举了5大实验证据以及此前未覆盖的发现：

### 五大证据系统化呈现
1. **Claude 能报告 J-space 内容** — 体育项目实验：J-lens 榜首 "Soccer" → 模型回答"足球"；抹掉换成 "Rugby" → 改口橄榄球。注入「lightning」→ 报告关于闪电。直接干预 J-space 会改变模型行为。
2. **能按要求调控 J-space** — 边抄写边想柑橘类水果 → J-space 出现 "orange" "fruits"。要求「不要想」某概念 → **白熊效应**：激活弱于想但强于未提及，同时 "damn" "failure" 亮起。
3. **真的用 J-space 思考** — "会结网的动物有几条腿"：J-space 中途亮起 "spider"；换成 "ant" → 答案变成 "6"。
4. **表征可灵活复用** — France→China 替换实验：4 个不同问题（首都/语言/大洲/货币）答案齐刷刷改变 — 同一共享表征被多个系统读取。读写 J-space 的组件数量比普通模式高约 100 倍。
5. **大部分处理不经过 J-space** — 删掉 J-space：Claude 仍能流利说话/分类/答题，但**多步推理掉到接近零**。西班牙语实验：语言识别过 J-space，续写完全不受影响（肌肉记忆）。

### 后训练塑造了 J-space 的「立场」
- **预训练模型**的 J-space 主要服务于预测后文
- **后训练模型**在读用户危险药物消息的当下，J-space 即亮起 "WARNING" "dangerous"
- 角色扮演时每轮开头 J-space 亮起 "fictional" "disclaimer"——自我标注非本意

### 反事实反思训练
新技术 **counterfactual reflection training**：只训练模型「如果被中途打断并要求反思会说什么」，完全不训练实际行为。训练后模型不诚实行为率下降，J-lens 显示 "honest" "integrity" 在 J-space 亮起——**教模型「该说什么」，塑造了它「怎么想」**。

### "体验式语言"依赖 J-space
删掉 J-space 后回答依然流利但变得干瘪机械——无论是描述自己还是别人的体验。J-space 支撑的是「谈论体验」本身。

**整合视角**：此 3rd source 最不可替代新增 = (1) 五大证据的系统化呈现、(2) 白熊效应揭示 J-space 控制不完美、(3) 反事实反思训练——教说什么→塑造怎么想、(4) 西班牙语双轨实验（语言识别 vs 续写）。前 2 source 未提供这些实验的量化细节。

---

